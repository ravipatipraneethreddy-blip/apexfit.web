"use server";

import { numeric } from "@/lib/validation";
import { getUserTimezone, getStartOfDayInTimezone, getEndOfDayInTimezone } from "@/lib/timezone";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function logWater(amountMl: number) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  await prisma.waterLog.create({
    data: {
      userId: session.userId,
      amount: numeric(amountMl, "Water amount", 1, 5000, true),
    },
  });

  revalidatePath("/");
  return { success: true };
}

export async function getTodaysWater(): Promise<{ totalMl: number; logs: { id: string; amount: number; time: Date }[] }> {
  const session = await getSession();
  if (!session) return { totalMl: 0, logs: [] };

  const timezone = await getUserTimezone();
  const today = getStartOfDayInTimezone(timezone);
  const tomorrow = getEndOfDayInTimezone(timezone);

  const logs = await prisma.waterLog.findMany({
    where: {
      userId: session.userId,
      loggedAt: { gte: today, lt: tomorrow },
    },
    orderBy: { loggedAt: "desc" },
  });

  const totalMl = logs.reduce((sum, l) => sum + l.amount, 0);

  return {
    totalMl,
    logs: logs.map((l) => ({ id: l.id, amount: l.amount, time: l.loggedAt })),
  };
}

export async function resetWater() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const timezone = await getUserTimezone();
  const today = getStartOfDayInTimezone(timezone);
  const tomorrow = getEndOfDayInTimezone(timezone);

  await prisma.waterLog.deleteMany({
    where: {
      userId: session.userId,
      loggedAt: { gte: today, lt: tomorrow },
    },
  });

  revalidatePath("/");
  return { success: true };
}

