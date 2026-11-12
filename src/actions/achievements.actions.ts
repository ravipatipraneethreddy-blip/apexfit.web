"use server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isDbAvailable } from "./auth.actions";
import { revalidatePath } from "next/cache";

export async function getEarnedBadges(userId: string) {
  const session = await getSession();
  if (!session || session.userId !== userId) throw new Error("Unauthorized");
  const dbReady = await isDbAvailable();
  if (!dbReady) {
    return [];
  }

  const records = await prisma.achievement.findMany({
    where: { userId },
    select: { badgeId: true },
  });
  return records.map((r: { badgeId: string }) => r.badgeId);
}

export async function checkAndUnlockBadges(userId: string, triggers: { loggedWorkout?: boolean, loggedMeal?: boolean, maxWeightLifted?: number, waterHitGoal?: boolean, macrosHitGoal?: boolean }) {
  const session = await getSession();
  if (!session || session.userId !== userId) throw new Error("Unauthorized");
  const [mealCount, workoutCount, heavy] = await Promise.all([
    prisma.mealLog.count({where:{userId,planned:false}}),
    prisma.workoutLog.count({where:{userId}}),
    prisma.exerciseLog.findFirst({where:{workoutLog:{userId},weight:{gte:100}}})
  ]);
  triggers = { loggedMeal: mealCount > 0, loggedWorkout: workoutCount > 0, maxWeightLifted: heavy ? 100 : 0 };
  const dbReady = await isDbAvailable();
  if (!dbReady) return [];

  const earned = await getEarnedBadges(userId);
  const nowEarned: string[] = [];

  const grantBadge = async (badgeId: string) => {
    if (earned.includes(badgeId) || nowEarned.includes(badgeId)) return;
    
    await prisma.achievement.upsert({
      where: { userId_badgeId: {userId, badgeId} }, update: {}, create: { userId, badgeId }
    });
    nowEarned.push(badgeId);
  };

  if (triggers.loggedWorkout) {
    await grantBadge("FIRST_WORKOUT");
  }

  if (triggers.loggedMeal) {
    await grantBadge("FIRST_MEAL");
  }

  if (triggers.maxWeightLifted && triggers.maxWeightLifted >= 100) {
    await grantBadge("100KG_CLUB");
  }

  if (triggers.waterHitGoal) {
    await grantBadge("HYDRATION_HERO");
  }

  if (triggers.macrosHitGoal) {
    await grantBadge("MACRO_MASTER");
  }
  
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user && user.streakDays >= 3) await grantBadge("3_DAY_STREAK");
  if (user && user.streakDays >= 7) await grantBadge("7_DAY_STREAK");

  if (nowEarned.length > 0) {
    revalidatePath("/profile");
  }

  return nowEarned;
}

