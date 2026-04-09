"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function logWater(amountMl: number) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  await prisma.waterLog.create({
    data: {
      userId: session.userId,
      amount: amountMl,
    },
  });

  revalidatePath("/");
  return { success: true };
}

export async function getTodaysWater(): Promise<{ totalMl: number; logs: { id: string; amount: number; time: Date }[] }> {
  const session = await getSession();
  if (!session) return { totalMl: 0, logs: [] };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const logs = await prisma.waterLog.findMany({
    where: {
      userId: session.userId,
      loggedAt: { gte: today },
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
  if (!session) return { error: "Unauthorized" };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.waterLog.deleteMany({
    where: {
      userId: session.userId,
      loggedAt: { gte: today },
    },
  });

  revalidatePath("/");
  return { success: true };
}
