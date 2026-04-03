"use server";

import { revalidatePath } from "next/cache";

// In-memory water log for mock mode (per day)
let mockWaterLog: { id: string; amount: number; time: Date }[] = [];
let mockWaterNextId = 1;

export async function logWater(amountMl: number) {
  mockWaterLog.push({
    id: `water-${mockWaterNextId++}`,
    amount: amountMl,
    time: new Date(),
  });
  revalidatePath("/");
  return { success: true };
}

export async function getTodaysWater(): Promise<{ totalMl: number; logs: { id: string; amount: number; time: Date }[] }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysLogs = mockWaterLog.filter((l) => new Date(l.time) >= today);
  const totalMl = todaysLogs.reduce((sum, l) => sum + l.amount, 0);

  return { totalMl, logs: todaysLogs };
}

export async function resetWater() {
  mockWaterLog = [];
  revalidatePath("/");
  return { success: true };
}
