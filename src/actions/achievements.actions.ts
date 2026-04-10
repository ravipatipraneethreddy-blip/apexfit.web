"use server";

import { prisma } from "@/lib/prisma";
import { getUserProfile } from "./user.actions";
import { BADGE_DEFINITIONS } from "@/lib/constants";

export async function getUserAchievements() {
  const user = await getUserProfile();
  if (!user) return [];

  const achievements = await prisma.achievement.findMany({
    where: { userId: user.id },
    orderBy: { unlockedAt: "desc" },
  });

  return achievements.map(a => a.badgeId);
}

export async function checkAndUnlockAchievement(badgeId: string) {
  const user = await getUserProfile();
  if (!user) return { unlocked: false };

  // Verify the badge exists
  const def = BADGE_DEFINITIONS.find(b => b.id === badgeId);
  if (!def) return { unlocked: false };

  // Check if they already have it
  const existing = await prisma.achievement.findUnique({
    where: {
      userId_badgeId: {
        userId: user.id,
        badgeId: badgeId,
      }
    }
  });

  if (existing) {
    return { unlocked: false };
  }

  // Unlock it!
  await prisma.achievement.create({
    data: {
      userId: user.id,
      badgeId: badgeId,
    }
  });

  return { unlocked: true, badge: def };
}

// System checks that can be exported and run periodically or after actions
export async function runMilestoneChecks() {
  const user = await getUserProfile();
  if (!user) return [];

  const newlyUnlocked = [];

  // Streak Checks
  if (user.streakDays >= 7) {
    const res = await checkAndUnlockAchievement("7_DAY_STREAK");
    if (res.unlocked) newlyUnlocked.push(res.badge);
  }
  if (user.streakDays >= 3) {
    const res = await checkAndUnlockAchievement("3_DAY_STREAK");
    if (res.unlocked) newlyUnlocked.push(res.badge);
  }

  // Meal Checks
  const meals = await prisma.mealLog.findMany({ where: { userId: user.id } });
  if (meals.length > 0) {
    const res = await checkAndUnlockAchievement("FIRST_MEAL");
    if (res.unlocked) newlyUnlocked.push(res.badge);
  }

  // Water Check
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const waterLogs = await prisma.waterLog.findMany({
    where: { userId: user.id, loggedAt: { gte: todayStart } }
  });
  const totalWater = waterLogs.reduce((acc, w) => acc + w.amount, 0);
  if (totalWater >= 3000) {
    const res = await checkAndUnlockAchievement("HYDRATION_HERO");
    if (res.unlocked) newlyUnlocked.push(res.badge);
  }

  // Workout Checks
  const workouts = await prisma.workoutLog.findMany({ where: { userId: user.id } });
  if (workouts.length > 0) {
    const res = await checkAndUnlockAchievement("FIRST_WORKOUT");
    if (res.unlocked) newlyUnlocked.push(res.badge);
  }

  // 100KG check requires deep query
  const heavySets = await prisma.exerciseLog.findFirst({
    where: {
      workoutLog: { userId: user.id },
      weight: { gte: 100 }
    }
  });
  if (heavySets) {
    const res = await checkAndUnlockAchievement("100KG_CLUB");
    if (res.unlocked) newlyUnlocked.push(res.badge);
  }

  return newlyUnlocked;
}
