"use server";

import { prisma } from "@/lib/prisma";
import { isDbAvailable } from "./auth.actions";
import { revalidatePath } from "next/cache";

export async function getEarnedBadges(userId: string) {
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
  const dbReady = await isDbAvailable();
  if (!dbReady) return [];

  const earned = await getEarnedBadges(userId);
  const nowEarned: string[] = [];

  const grantBadge = async (badgeId: string) => {
    if (earned.includes(badgeId) || nowEarned.includes(badgeId)) return;
    
    await prisma.achievement.create({
      data: { userId, badgeId }
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
