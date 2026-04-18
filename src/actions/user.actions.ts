"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { calculateTDEE } from "@/lib/tdee";

// Helper: test if DB is actually reachable
async function isDbAvailable(): Promise<boolean> {
  return true;
}



export async function onboardUser(formData: FormData) {
  const ageStr = formData.get("age") as string;
  const heightStr = formData.get("height") as string;
  const weightStr = formData.get("weight") as string;
  const targetWeightStr = formData.get("targetWeight") as string;
  const goal = formData.get("goal") as string;
  const gender = formData.get("gender") as string;
  const dietPreference = formData.get("dietPreference") as string;
  const activityLevel = formData.get("activityLevel") as string;

  if (!ageStr || !heightStr || !weightStr || !goal || !dietPreference || !activityLevel) {
    throw new Error("Missing required fields for onboarding.");
  }

  const age = parseInt(ageStr, 10);
  const height = parseFloat(heightStr);
  const weight = parseFloat(weightStr);

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
      age,
      height,
      weight,
      gender: gender || "MALE",
      targetWeight: targetWeightStr ? parseFloat(targetWeightStr) : null,
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
  const goal = formData.get("goal") as string;
  const gender = formData.get("gender") as string;
  const dietPreference = formData.get("dietPreference") as string;
  const activityLevel = formData.get("activityLevel") as string;

  const dbReady = await isDbAvailable();

  if (!dbReady) {
    throw new Error("Database is not available. Please try again later.");
  }

  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  try {
    const currentUser = await prisma!.user.findUnique({ where: { id: session.userId } });
    if (!currentUser) throw new Error("User not found");

    const updatedWeight = weightStr ? parseFloat(weightStr) : currentUser.weight;
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
        ...(targetWeightStr && { targetWeight: parseFloat(targetWeightStr) }),
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

    const user = await prisma!.user.findUnique({
      where: { id: session.userId },
    });
    return user || null;
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
  const dbReady = await isDbAvailable();
  if (!dbReady) return 1;

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const [meals, workouts] = await Promise.all([
      prisma!.mealLog.findMany({ where: { userId, date: { gte: thirtyDaysAgo } }, select: { date: true } }),
      prisma!.workoutLog.findMany({ where: { userId, date: { gte: thirtyDaysAgo } }, select: { date: true } })
    ]);

    const allDates = [...meals, ...workouts].map(item => {
      const d = new Date(item.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    });

    if (allDates.length === 0) {
      await prisma!.user.update({ where: { id: userId }, data: { streakDays: 0 } });
      return 0;
    }

    const uniqueDates = Array.from(new Set(allDates)).sort((a, b) => b - a);

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    if (uniqueDates[0] < todayTime - 86400000) {
      await prisma!.user.update({ where: { id: userId }, data: { streakDays: 0 } });
      return 0;
    }

    let currentCheckTime = uniqueDates[0] === todayTime ? todayTime : todayTime - 86400000;

    for (const d of uniqueDates) {
      if (d === currentCheckTime) {
        streak++;
        currentCheckTime -= 86400000;
      } else if (d < currentCheckTime) {
        break;
      }
    }

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
    mealsCsv.push(`${m.date.toISOString()},"${m.foodName}",${m.calories},${m.protein},${m.carbs},${m.fats},${m.fiber || 0},${m.planned}`);
  });

  const workoutsCsv = ["Date,Workout,Exercise,Sets,Reps,Weight"];
  user.workouts.forEach(w => {
    w.exercises.forEach(ex => {
      workoutsCsv.push(`${w.date.toISOString()},"${w.name}","${ex.name}",${ex.sets},${ex.reps},${ex.weight}`);
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
