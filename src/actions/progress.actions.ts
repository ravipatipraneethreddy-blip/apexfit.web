"use server";

import { prisma } from "@/lib/prisma";
import { getUserProfile } from "./user.actions";
import { revalidatePath } from "next/cache";

async function isDbAvailable(): Promise<boolean> {
  if (!prisma) return false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export async function getProgressData() {
  const user = await getUserProfile();
  if (!user) return { weightLogs: [], macroLogs: [] };

  const dbReady = await isDbAvailable();
  if (!dbReady) {
    return { weightLogs: [], macroLogs: [] };
  }

  const rawWeights = await prisma.progressLog.findMany({
    where: { userId: user.id },
    orderBy: { date: "asc" },
  });

  const meals = await prisma.mealLog.findMany({
    where: { userId: user.id, planned: false },
    orderBy: { date: "asc" },
  });

  // Group meals by day
  const dailyStats: Record<string, any> = {};
  meals.forEach(m => {
    const d = new Date(m.date).toLocaleDateString();
    if (!dailyStats[d]) {
      dailyStats[d] = {
        date: d,
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
      };
    }
    dailyStats[d].calories += m.calories;
    dailyStats[d].protein += m.protein;
    dailyStats[d].carbs += m.carbs;
    dailyStats[d].fats += m.fats;
  });

  const macroLogs = Object.values(dailyStats);

  return {
    weightLogs: rawWeights.map((w) => ({
      date: new Date(w.date).toLocaleDateString(),
      weight: w.weight,
    })),
    macroLogs,
  };
}

export async function logWeight(formData: FormData) {
  const user = await getUserProfile();
  if (!user) return { error: "Unauthorized" };

  const dbReady = await prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false);
  if (!dbReady || user.id.startsWith("mock-")) {
    return { error: "Database unavailable for mock accounts" };
  }

  const weightStr = formData.get("weight") as string;
  const weight = parseFloat(weightStr);
  if (!weight || isNaN(weight) || weight <= 0) {
    return { error: "Invalid weight" };
  }

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { weight },
      }),
      prisma.progressLog.create({
        data: {
          userId: user.id,
          weight,
          date: new Date(),
        },
      }),
    ]);

    revalidatePath("/progress");
    revalidatePath("/");
    revalidatePath("/profile");
    return { success: true };
  } catch (err) {
    console.error("[ApexFit] Failed to log weight:", err);
    return { error: "Failed to log weight" };
  }
}
