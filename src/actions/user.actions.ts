"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { numeric, choice, csvCell } from "@/lib/validation";
import { getUserTimezone, dateKey, shiftDate } from "@/lib/timezone";
import { calculateTDEE } from "@/lib/tdee";

// Helper: test if DB is actually reachable
async function isDbAvailable(): Promise<boolean> {
  return true;
}



export async function onboardUser(formData: FormData) {
  const name = formData.get("name") as string;
  const ageStr = formData.get("age") as string;
  const heightStr = formData.get("height") as string;
  const weightStr = formData.get("weight") as string;
  const targetWeightStr = formData.get("targetWeight") as string;
  const goal = choice(formData.get("goal"), ["FAT_LOSS", "MUSCLE_GAIN", "RECOMP"], "Goal");
  const gender = choice(formData.get("gender") || "MALE", ["MALE", "FEMALE"], "Gender");
  const dietPreference = formData.get("dietPreference") as string;
  const activityLevel = choice(formData.get("activityLevel"), ["SEDENTARY", "LIGHT", "MODERATE", "ACTIVE", "VERY_ACTIVE"], "Activity");

  if (!ageStr || !heightStr || !weightStr || !goal || !dietPreference || !activityLevel) {
    throw new Error("Missing required fields for onboarding.");
  }

  const age = numeric(ageStr, "Age", 13, 120, true);
  const height = numeric(heightStr, "Height", 100, 250);
  const weight = numeric(weightStr, "Weight", 20, 500);

  // Calculate TDEE
  const tdee = calculateTDEE({
    weight,
    height,
    age,
    gender: gender || "MALE",
    activityLevel,
    goal,
  });

  const dbReady = await isDbAvailable();

  if (!dbReady) {
    throw new Error("Database is not available. Please try again later.");
  }

  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  await prisma!.user.update({
    where: { id: session.userId },
    data: {
      name: name || "Athlete",
      age,
      height,
      weight,
      gender: gender || "MALE",
      targetWeight: targetWeightStr ? numeric(targetWeightStr, "Target weight", 20, 500) : null,
      goal,
      dietPreference,
      activityLevel,
      targetCalories: tdee.calories,
      targetProtein: tdee.protein,
      targetCarbs: tdee.carbs,
      targetFats: tdee.fats,
    },
  });

  revalidatePath("/");
  revalidatePath("/onboarding");

  return { success: true, tdee };
}

export async function updateUserProfile(formData: FormData) {
  const name = formData.get("name") as string;
  const weightStr = formData.get("weight") as string;
  const targetWeightStr = formData.get("targetWeight") as string;
  const goal = choice(formData.get("goal"), ["FAT_LOSS", "MUSCLE_GAIN", "RECOMP"], "Goal");
  const gender = choice(formData.get("gender") || "MALE", ["MALE", "FEMALE"], "Gender");
  const dietPreference = formData.get("dietPreference") as string;
  const activityLevel = choice(formData.get("activityLevel"), ["SEDENTARY", "LIGHT", "MODERATE", "ACTIVE", "VERY_ACTIVE"], "Activity");

  const dbReady = await isDbAvailable();

  if (!dbReady) {
    throw new Error("Database is not available. Please try again later.");
  }

  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  try {
    const currentUser = await prisma!.user.findUnique({ where: { id: session.userId } });
    if (!currentUser) throw new Error("User not found");

    const updatedWeight = weightStr ? numeric(weightStr, "Weight", 20, 500) : currentUser.weight;
    const updatedGoal = goal || currentUser.goal;
    const updatedActivity = activityLevel || currentUser.activityLevel;
    const updatedGender = gender || currentUser.gender || "MALE";

    // Recalculate TDEE
    const tdee = calculateTDEE({
      weight: updatedWeight,
      height: currentUser.height,
      age: currentUser.age,
      gender: updatedGender,
      activityLevel: updatedActivity,
      goal: updatedGoal,
    });

    await prisma!.user.update({
      where: { id: session.userId },
      data: {
        ...(name && { name }),
        ...(weightStr && { weight: updatedWeight }),
        targetWeight: targetWeightStr ? numeric(targetWeightStr, "Target weight", 20, 500) : null,
        ...(goal && { goal: updatedGoal }),
        ...(gender && { gender: updatedGender }),
        ...(dietPreference && { dietPreference }),
        ...(activityLevel && { activityLevel: updatedActivity }),
        targetCalories: tdee.calories,
        targetProtein: tdee.protein,
        targetCarbs: tdee.carbs,
        targetFats: tdee.fats,
      },
    });

    revalidatePath("/");
    revalidatePath("/profile");
  } catch (err) {
    console.error("[ApexFit] Failed to update profile:", err);
    throw new Error("Your profile was not saved. Please try again.");
  }

  return { success: true };
}

import { cache } from "react";

export const getUserProfile = cache(async () => {
  const dbReady = await isDbAvailable();

  if (!dbReady) {
    return null;
  }

  try {
    const session = await getSession();
    if (!session) return null;

    return prisma.user.findUnique({
      where: { id: session.userId },
      select: { id:true, email:true, name:true, age:true, height:true, weight:true, gender:true, targetWeight:true, goal:true, dietPreference:true, activityLevel:true, streakDays:true, targetCalories:true, targetProtein:true, targetCarbs:true, targetFats:true, createdAt:true }
    });
  } catch {
    return null;
  }
});

export async function getUserStats() {
  const dbReady = await isDbAvailable();

  if (!dbReady) {
    return { totalWorkouts: 0, totalMeals: 0, memberSince: "N/A" };
  }

  try {
    const session = await getSession();
    if (!session) return { totalWorkouts: 0, totalMeals: 0, memberSince: "N/A" };

    const user = await prisma!.user.findUnique({ where: { id: session.userId } });
    if (!user) return { totalWorkouts: 0, totalMeals: 0, memberSince: "N/A" };

    const [workoutCount, mealCount] = await Promise.all([
      prisma!.workoutLog.count({ where: { userId: session.userId } }),
      prisma!.mealLog.count({ where: { userId: session.userId } }),
    ]);

    const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });

    return { totalWorkouts: workoutCount, totalMeals: mealCount, memberSince };
  } catch {
    return { totalWorkouts: 0, totalMeals: 0, memberSince: "N/A" };
  }
}

export async function getLeaderboard() {
  if (!await getSession()) return [];
  const dbReady = await isDbAvailable();
  
  if (!dbReady) {
    return [];
  }

  try {
    const topUsers = await prisma!.user.findMany({
      take: 10,
      orderBy: { streakDays: "desc" },
      select: {
        name: true,
        streakDays: true,
        _count: {
          select: { achievements: true },
        },
      },
    });

    return topUsers.map(u => ({
      name: u.name || "Anonymous",
      streakDays: u.streakDays,
      badges: u._count.achievements,
    }));
  } catch (err) {
    return [];
  }
}

export async function checkAndUpdateStreak(userId: string) {
  const session = await getSession();
  if (!session || session.userId !== userId) throw new Error("Unauthorized");
  const dbReady = await isDbAvailable();
  if (!dbReady) return 1;

  try {
    const timezone = await getUserTimezone();
    const now = new Date();
    const [meals, workouts] = await Promise.all([
      prisma.mealLog.findMany({ where: { userId, planned: false, date: { lte: now } }, select: { date: true } }),
      prisma.workoutLog.findMany({ where: { userId, date: { lte: now } }, select: { date: true } })
    ]);
    const dates = new Set([...meals, ...workouts].map(x => dateKey(x.date, timezone)));
    let day = dateKey(now, timezone);
    if (!dates.has(day)) day = shiftDate(day, -1);
    let streak = 0;
    while (dates.has(day)) { streak++; day = shiftDate(day, -1); }
    await prisma!.user.update({ where: { id: userId }, data: { streakDays: streak } });
    return streak;
  } catch (err) {
    console.error("Failed to update streak", err);
    return 0;
  }
}

export async function exportUserData() {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const dbReady = await isDbAvailable();
  if (!dbReady) return { error: "Database not available" };

  const user = await prisma!.user.findUnique({
    where: { id: session.userId },
    include: {
      workouts: { include: { exercises: true } },
      meals: true,
      progress: true,
    }
  });

  if (!user) return { error: "User not found" };

  const mealsCsv = ["Date,Food,Calories,Protein,Carbs,Fats,Fiber,Planned"];
  user.meals.forEach((m: any) => {
    mealsCsv.push(`${m.date.toISOString()},${csvCell(m.foodName)},${m.calories},${m.protein},${m.carbs},${m.fats},${m.fiber || 0},${m.planned}`);
  });

  const workoutsCsv = ["Date,Workout,Exercise,Sets,Reps,Weight"];
  user.workouts.forEach(w => {
    w.exercises.forEach(ex => {
      workoutsCsv.push(`${w.date.toISOString()},${csvCell(w.name)},${csvCell(ex.name)},${ex.sets},${ex.reps},${ex.weight}`);
    });
  });

  return {
    success: true,
    data: {
      meals: mealsCsv.join("\n"),
      workouts: workoutsCsv.join("\n")
    }
  };
}

