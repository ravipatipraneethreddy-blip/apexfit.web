"use server";

import { numeric, textValue, recordId, logDate, assertOwner } from "@/lib/validation";
import { setDetails } from "@/lib/coach";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getUserProfile, checkAndUpdateStreak } from "./user.actions";
import { checkAndUnlockBadges } from "./achievements.actions";

async function isDbAvailable(): Promise<boolean> {
  return true;
}

export async function getWorkoutTemplates() {
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
    details: t.exercises.map(e => ({ name: e.name, sets: e.sets, reps: e.reps })),
  }));
}

export async function saveWorkoutTemplate(name: string, exerciseNames: string[], details: { sets: number; reps: number }[] = []) {
  name = textValue(name, "Template name");
  if (!Array.isArray(exerciseNames) || exerciseNames.length < 1 || exerciseNames.length > 30) throw new Error("Choose 1–30 exercises");
  const user = await getUserProfile();
  if (!user) throw new Error("Unauthorized");
  const dbReady = await isDbAvailable();
  if (!dbReady) throw new Error("Database unavailable for templates.");

  const created = await prisma.workoutTemplate.create({
    data: {
      userId: user.id,
      name,
      exercises: {
        create: exerciseNames.map((ex, i) => ({ name: textValue(ex, "Exercise"), sets: numeric(details[i]?.sets ?? 3, "Sets", 1, 50, true), reps: numeric(details[i]?.reps ?? 10, "Reps", 1, 200, true) })),
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

  assertOwner(formData, user.id);
  const id = recordId(formData, user.id);
  const date = logDate(formData.get("date"));
  const name = textValue(formData.get("name"), "Workout name");
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
      name: string; sets: number; reps: number; weight: number; setDetails?: any[];
    }>;

    const validated = validateExercises(exercises);
    await prisma!.workoutLog.upsert({
      where: { id }, update: {},
      create: {
        id, date, userId: user.id,
        name,
        exercises: {
          create: validated.map((ex) => ({
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
            setDetails: ex.setDetails,
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
  await checkAndUpdateStreak(user.id).catch(() => undefined);

  // Trigger achievements
  try {
    const exercises = JSON.parse(exercisesRaw) as Array<{
      name: string; sets: number; reps: number; weight: number; setDetails?: any[];
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
  Record<string, { weight: number; reps: number; sets: number; setDetails?: any[] }>
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
    });

    if (recentWorkouts.length === 0) return {};

    const prevData: Record<string, { weight: number; reps: number; sets: number; setDetails?: any[] }> = {};
    for (const w of recentWorkouts) {
      for (const ex of w.exercises) {
        if (!prevData[ex.name]) {
          prevData[ex.name] = { weight: ex.weight, reps: ex.reps, sets: ex.sets, setDetails: ex.setDetails as any[] | undefined };
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
  const user = await getUserProfile();
  if (!user) return null;
  const dbReady = await isDbAvailable();

  if (!dbReady) {
    return null;
  }

  try {
    const workout = await prisma!.workoutLog.findUnique({
      where: { id, userId: user.id },
      include: { exercises: true },
    });
    return workout || null;
  } catch {
    return null;
  }
}

export async function getWorkoutStats() {
  const user = await getUserProfile();
  const workouts = user ? await prisma.workoutLog.findMany({ where: { userId: user.id }, include: { exercises: true }, orderBy: { date: "desc" } }) : [];

  // Personal records — best weight per exercise
  const prMap = new Map<string, { weight: number; reps: number; date: Date }>();
  for (const w of workouts) {
    for (const ex of (w as any).exercises || []) {
      for (const set of setDetails(ex)) {
        const current = prMap.get(ex.name);
        if (!current || set.weight > current.weight || (set.weight === current.weight && set.reps > current.reps)) prMap.set(ex.name, { weight: set.weight, reps: set.reps, date: w.date });
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

export async function getWorkoutCount() {
  const user = await getUserProfile();
  return user ? prisma.workoutLog.count({where:{userId:user.id}}) : 0;
}


function validateExercises(value: unknown) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 30) throw new Error("A workout needs 1–30 exercises");
  return value.map(ex => {
    const name = textValue(ex.name, "Exercise name");
    const sets = numeric(ex.sets, "Sets", 1, 50, true);
    const reps = numeric(ex.reps, "Reps", 1, 200, true);
    const weight = numeric(ex.weight, "Weight", 0, 1500);
    if (ex.setDetails !== undefined && (!Array.isArray(ex.setDetails) || ex.setDetails.length !== sets)) throw new Error("Set details must match completed sets");
    const details = ex.setDetails?.map((s: {weight:number;reps:number}) => ({weight:numeric(s.weight,"Set weight",0,1500),reps:numeric(s.reps,"Set reps",1,200,true)}));
    return {name,sets,reps,weight,setDetails:details};
  });
}

export async function updateWorkout(id: string, formData: FormData) {
  const user = await getUserProfile();
  if (!user) throw new Error("Unauthorized");
  const name = textValue(formData.get("name"), "Workout name");
  const date = logDate(formData.get("date"));
  const exercises = validateExercises(JSON.parse(String(formData.get("exercises"))));
  await prisma.workoutLog.update({where:{id,userId:user.id},data:{name,date,exercises:{deleteMany:{},create:exercises}}});
  await checkAndUpdateStreak(user.id);
  for (const path of ["/", "/workout", `/workout/${id}`, "/progress"]) revalidatePath(path);
  return {success:true};
}
