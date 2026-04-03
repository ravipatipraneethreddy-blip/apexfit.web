"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
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

  if (user.id.startsWith("mock-")) {
    throw new Error("You must be logged in with a real account to save custom templates.");
  }

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
  if (!user || user.id.startsWith("mock-")) return false;
  
  const dbReady = await isDbAvailable();
  if (!dbReady) return false;

  await prisma.workoutTemplate.delete({
    where: { id, userId: user.id },
  });
  revalidatePath("/workout");
  return true;
}

// Mock workouts for demo mode
const MOCK_WORKOUTS = [
  {
    id: "mock-workout-1",
    userId: "mock-user-1",
    date: new Date(Date.now() - 86400000),
    name: "Push Day",
    exercises: [
      { id: "ex-1", workoutLogId: "mock-workout-1", name: "Barbell Bench Press", sets: 3, reps: 10, weight: 80 },
      { id: "ex-2", workoutLogId: "mock-workout-1", name: "Incline Dumbbell Press", sets: 3, reps: 12, weight: 28 },
      { id: "ex-3", workoutLogId: "mock-workout-1", name: "Overhead Press", sets: 3, reps: 8, weight: 50 },
    ],
  },
  {
    id: "mock-workout-2",
    userId: "mock-user-1",
    date: new Date(Date.now() - 172800000),
    name: "Pull Day",
    exercises: [
      { id: "ex-4", workoutLogId: "mock-workout-2", name: "Barbell Rows", sets: 4, reps: 8, weight: 70 },
      { id: "ex-5", workoutLogId: "mock-workout-2", name: "Pull Ups", sets: 3, reps: 10, weight: 0 },
      { id: "ex-6", workoutLogId: "mock-workout-2", name: "Barbell Curl", sets: 3, reps: 12, weight: 25 },
    ],
  },
  {
    id: "mock-workout-3",
    userId: "mock-user-1",
    date: new Date(Date.now() - 259200000),
    name: "Leg Day",
    exercises: [
      { id: "ex-7", workoutLogId: "mock-workout-3", name: "Barbell Squats", sets: 4, reps: 8, weight: 100 },
      { id: "ex-8", workoutLogId: "mock-workout-3", name: "Romanian Deadlift", sets: 3, reps: 10, weight: 80 },
      { id: "ex-9", workoutLogId: "mock-workout-3", name: "Leg Press", sets: 3, reps: 12, weight: 150 },
    ],
  },
  {
    id: "mock-workout-4",
    userId: "mock-user-1",
    date: new Date(Date.now() - 345600000),
    name: "Push Day",
    exercises: [
      { id: "ex-10", workoutLogId: "mock-workout-4", name: "Barbell Bench Press", sets: 3, reps: 10, weight: 77.5 },
      { id: "ex-11", workoutLogId: "mock-workout-4", name: "Overhead Press", sets: 3, reps: 8, weight: 47.5 },
    ],
  },
  {
    id: "mock-workout-5",
    userId: "mock-user-1",
    date: new Date(Date.now() - 518400000),
    name: "Pull Day",
    exercises: [
      { id: "ex-12", workoutLogId: "mock-workout-5", name: "Deadlift", sets: 3, reps: 5, weight: 120 },
      { id: "ex-13", workoutLogId: "mock-workout-5", name: "Barbell Rows", sets: 4, reps: 8, weight: 67.5 },
    ],
  },
];

// In-memory mock store
let mockWorkoutStore = [...MOCK_WORKOUTS];
let mockWorkoutNextId = 200;

export async function logWorkout(formData: FormData) {
  const user = await getUserProfile();
  if (!user) throw new Error("User not found");

  const name = formData.get("name") as string;
  const exercisesRaw = formData.get("exercises") as string;

  if (!name || !exercisesRaw) {
    throw new Error("Missing required workout fields.");
  }

  const dbReady = await isDbAvailable();

  if (!dbReady || user.id.startsWith("mock-")) {
    // Mock mode — add to in-memory store
    const exercises = JSON.parse(exercisesRaw) as Array<{
      name: string; sets: number; reps: number; weight: number;
    }>;
    const workoutId = `mock-workout-${mockWorkoutNextId++}`;
    mockWorkoutStore.unshift({
      id: workoutId,
      userId: "mock-user-1",
      date: new Date(),
      name,
      exercises: exercises.map((ex, i) => ({
        id: `ex-mock-${mockWorkoutNextId++}`,
        workoutLogId: workoutId,
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
      })),
    });
    revalidatePath("/workout");
    revalidatePath("/");
    revalidatePath("/progress");
    return { success: true };
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
  }

  // Update streak
  await checkAndUpdateStreak(user ? user.id : "mock-user-1");

  // Trigger achievements
  try {
    const exercises = JSON.parse(exercisesRaw) as Array<{
      name: string; sets: number; reps: number; weight: number;
    }>;
    const maxWeight = Math.max(...exercises.map((e) => e.weight), 0);
    const earned = await checkAndUnlockBadges(user ? user.id : "mock-user-1", {
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
    return mockWorkoutStore;
  }

  try {
    const user = await getUserProfile();
    if (!user) return mockWorkoutStore;

    const workouts = await prisma!.workoutLog.findMany({
      where: { userId: user.id },
      include: { exercises: true },
      orderBy: { date: "desc" },
      take: 10,
    });

    return workouts.length > 0 ? workouts : mockWorkoutStore;
  } catch {
    return mockWorkoutStore;
  }
}

// ─── Progressive Overload: Get previous exercise data ───
export async function getPreviousExerciseData(): Promise<
  Record<string, { weight: number; reps: number; sets: number }>
> {
  // Build from mock data
  const mockPrev: Record<string, { weight: number; reps: number; sets: number }> = {};
  for (const w of mockWorkoutStore) {
    for (const ex of w.exercises) {
      if (!mockPrev[ex.name]) {
        mockPrev[ex.name] = { weight: ex.weight, reps: ex.reps, sets: ex.sets };
      }
    }
  }

  const dbReady = await isDbAvailable();

  if (!dbReady) {
    return mockPrev;
  }

  try {
    const user = await getUserProfile();
    if (!user) return mockPrev;

    const recentWorkouts = await prisma!.workoutLog.findMany({
      where: { userId: user.id },
      include: { exercises: true },
      orderBy: { date: "desc" },
      take: 10,
    });

    if (recentWorkouts.length === 0) return mockPrev;

    const prevData: Record<string, { weight: number; reps: number; sets: number }> = {};
    for (const w of recentWorkouts) {
      for (const ex of w.exercises) {
        if (!prevData[ex.name]) {
          prevData[ex.name] = { weight: ex.weight, reps: ex.reps, sets: ex.sets };
        }
      }
    }

    return Object.keys(prevData).length > 0 ? prevData : mockPrev;
  } catch {
    return mockPrev;
  }
}

// ─── Workout Detail: Get single workout by ID ───
export async function getWorkoutById(id: string) {
  // Check mock data first
  const mockMatch = mockWorkoutStore.find((w) => w.id === id);

  const dbReady = await isDbAvailable();

  if (!dbReady) {
    return mockMatch || null;
  }

  try {
    const workout = await prisma!.workoutLog.findUnique({
      where: { id },
      include: { exercises: true },
    });
    return workout || mockMatch || null;
  } catch {
    return mockMatch || null;
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
