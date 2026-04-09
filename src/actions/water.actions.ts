"use server";

import { revalidatePath } from "next/cache";

// In-memory water tracking (resets on server restart / redeploy)
// TODO: Add WaterLog table to Prisma schema for persistence
let waterLog: { id: string; amount: number; time: Date }[] = [];
let waterNextId = 1;

export async function logWater(amountMl: number) {
  waterLog.push({
    id: `water-${waterNextId++}`,
    amount: amountMl,
    time: new Date(),
  });
  revalidatePath("/");
  return { success: true };
}

export async function getTodaysWater(): Promise<{ totalMl: number; logs: { id: string; amount: number; time: Date }[] }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysLogs = waterLog.filter((l) => new Date(l.time) >= today);
  const totalMl = todaysLogs.reduce((sum, l) => sum + l.amount, 0);

  return { totalMl, logs: todaysLogs };
}

export async function resetWater() {
  waterLog = [];
  revalidatePath("/");
  return { success: true };
}
