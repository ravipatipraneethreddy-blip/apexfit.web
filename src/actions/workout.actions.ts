"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { getUserProfile, checkAndUpdateStreak } from "./user.actions";
import { checkAndUnlockBadges } from "./achievements.actions";

async function isDbAvailable(): Promise<boolean> {
  if (!prisma) return false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export async function getWorkoutTemplates() {
  noStore();
  const user = await getUserProfile();
  if (!user) return [];
  const dbReady = await isDbAvailable();
  if (!dbReady) return [];

  const templates = await prisma.workoutTemplate.findMany({
    where: { userId: user.id },
    include: { exercises: true },
    orderBy: { createdAt: "desc" },
  });

  return templates.map(t => ({
    id: t.id,
    name: t.name,
    exercises: t.exercises.map(e => e.name),
  }));
}

export async function saveWorkoutTemplate(name: string, exerciseNames: string[]) {
  const user = await getUserProfile();
  if (!user) throw new Error("Unauthorized");
  const dbReady = await isDbAvailable();
  if (!dbReady) throw new Error("Database unavailable for templates.");

  const created = await prisma.workoutTemplate.create({
    data: {
      userId: user.id,
      name,
      exercises: {
        create: exerciseNames.map(ex => ({ name: ex, sets: 0, reps: 0 })),
      },
    },
  });
  revalidatePath("/workout");
  revalidatePath("/");
  return created;
}

export async function deleteWorkoutTemplate(id: string) {
  const user = await getUserProfile();
  if (!user) return false;
  
  const dbReady = await isDbAvailable();
  if (!dbReady) return false;

  await prisma.workoutTemplate.delete({
    where: { id, userId: user.id },
  });
  revalidatePath("/workout");
  return true;
}

export async function logWorkout(formData: FormData) {
  const user = await getUserProfile();
  if (!user) throw new Error("User not found");

  const name = formData.get("name") as string;
  const exercisesRaw = formData.get("exercises") as string;

  if (!name || !exercisesRaw) {
    throw new Error("Missing required workout fields.");
  }

  const dbReady = await isDbAvailable();

  if (!dbReady) {
    throw new Error("Database is not available. Please try again later.");
  }

  try {
    const exercises = JSON.parse(exercisesRaw) as Array<{
      name: string; sets: number; reps: number; weight: number;
    }>;

    await prisma!.workoutLog.create({
      data: {
        userId: user.id,
        name,
        exercises: {
          create: exercises.map((ex) => ({
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
          })),
        },
      },
    });

    revalidatePath("/workout");
    revalidatePath("/");
    revalidatePath("/progress");
  } catch (err) {
    console.error("[ApexFit] Failed to log workout:", err);
    throw new Error("Failed to log workout.");
  }

  // Update streak
  await checkAndUpdateStreak(user.id);

  // Trigger achievements
  try {
    const exercises = JSON.parse(exercisesRaw) as Array<{
      name: string; sets: number; reps: number; weight: number;
    }>;
    const maxWeight = Math.max(...exercises.map((e) => e.weight), 0);
    const earned = await checkAndUnlockBadges(user.id, {
      loggedWorkout: true,
      maxWeightLifted: maxWeight,
    });
    if (earned.length > 0) {
      console.log("[ApexFit] Earned new badges:", earned);
    }
  } catch (err) {
    console.error("Failed to check badges", err);
  }

  return { success: true };
}

export async function getRecentWorkouts() {
  noStore();
  const dbReady = await isDbAvailable();

  if (!dbReady) {
    return [];
  }

  try {
    const user = await getUserProfile();
    if (!user) return [];

    const workouts = await prisma!.workoutLog.findMany({
      where: { userId: user.id },
      include: { exercises: true },
      orderBy: { date: "desc" },
      take: 10,
    });

    return workouts;
  } catch {
    return [];
  }
}

// ─── Progressive Overload: Get previous exercise data ───
export async function getPreviousExerciseData(): Promise<
  Record<string, { weight: number; reps: number; sets: number }>
> {
  const dbReady = await isDbAvailable();

  if (!dbReady) {
    return {};
  }

  try {
    const user = await getUserProfile();
    if (!user) return {};

    const recentWorkouts = await prisma!.workoutLog.findMany({
      where: { userId: user.id },
      include: { exercises: true },
      orderBy: { date: "desc" },
      take: 10,
    });

    if (recentWorkouts.length === 0) return {};

    const prevData: Record<string, { weight: number; reps: number; sets: number }> = {};
    for (const w of recentWorkouts) {
      for (const ex of w.exercises) {
        if (!prevData[ex.name]) {
          prevData[ex.name] = { weight: ex.weight, reps: ex.reps, sets: ex.sets };
        }
      }
    }

    return prevData;
  } catch {
    return {};
  }
}

// ─── Workout Detail: Get single workout by ID ───
export async function getWorkoutById(id: string) {
  const dbReady = await isDbAvailable();

  if (!dbReady) {
    return null;
  }

  try {
    const workout = await prisma!.workoutLog.findUnique({
      where: { id },
      include: { exercises: true },
    });
    return workout || null;
  } catch {
    return null;
  }
}

export async function getWorkoutStats() {
  const workouts = await getRecentWorkouts();

  // Personal records — best weight per exercise
  const prMap = new Map<string, { weight: number; reps: number; date: Date }>();
  for (const w of workouts) {
    for (const ex of (w as any).exercises || []) {
      const current = prMap.get(ex.name);
      if (!current || ex.weight > current.weight) {
        prMap.set(ex.name, { weight: ex.weight, reps: ex.reps, date: w.date });
      }
    }
  }
  const personalRecords = Array.from(prMap.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 6);

  // Weekly volume
  const now = new Date();
  const weeklyVolume: { week: string; sets: number; workouts: number }[] = [];

  for (let i = 0; i < 4; i++) {
    const weekStart = new Date(now.getTime() - (i + 1) * 7 * 86400000);
    const weekEnd = new Date(now.getTime() - i * 7 * 86400000);
    const weekWorkouts = workouts.filter(
      (w) => new Date(w.date) >= weekStart && new Date(w.date) < weekEnd
    );
    const totalSets = weekWorkouts.reduce(
      (sum, w) => sum + ((w as any).exercises || []).reduce((s: number, ex: any) => s + ex.sets, 0),
      0
    );
    weeklyVolume.unshift({
      week: `W${4 - i}`,
      sets: totalSets,
      workouts: weekWorkouts.length,
    });
  }

  // Workout frequency — last 12 weeks
  const frequencyData: { week: number; count: number }[] = [];
  for (let i = 0; i < 12; i++) {
    const weekStart = new Date(now.getTime() - (i + 1) * 7 * 86400000);
    const weekEnd = new Date(now.getTime() - i * 7 * 86400000);
    const count = workouts.filter(
      (w) => new Date(w.date) >= weekStart && new Date(w.date) < weekEnd
    ).length;
    frequencyData.unshift({ week: 12 - i, count });
  }

  return {
    totalWorkouts: workouts.length,
    personalRecords,
    weeklyVolume,
    frequencyData,
    recentWorkouts: workouts.slice(0, 5),
  };
}
