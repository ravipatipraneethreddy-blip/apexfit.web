"use server";

import { prisma } from "@/lib/prisma";
import { getUserProfile } from "./user.actions";
import { revalidatePath } from "next/cache";

async function isDbAvailable(): Promise<boolean> {
  return true;
}

type BodyFatInput = {
  gender: "MALE" | "FEMALE";
  height: number;   // cm
  waist: number;    // cm
  neck: number;     // cm
  hip?: number;     // cm (required for females)
};

type BodyFatResult = {
  bodyFatPct: number;
  category: string;
  categoryColor: string;
};

/**
 * US Navy Body Fat Formula
 * Male:   495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450
 * Female: 495 / (1.29579 - 0.35004 * log10(waist + hip - neck) + 0.22100 * log10(height)) - 450
 */
export async function calculateBodyFat(input: BodyFatInput): Promise<BodyFatResult> {
  const { gender, height, waist, neck, hip } = input;

  let bodyFatPct: number;

  if (gender === "MALE") {
    const logWaistNeck = Math.log10(waist - neck);
    const logHeight = Math.log10(height);
    bodyFatPct = 495 / (1.0324 - 0.19077 * logWaistNeck + 0.15456 * logHeight) - 450;
  } else {
    if (!hip) throw new Error("Hip measurement is required for females.");
    const logWaistHipNeck = Math.log10(waist + hip - neck);
    const logHeight = Math.log10(height);
    bodyFatPct = 495 / (1.29579 - 0.35004 * logWaistHipNeck + 0.22100 * logHeight) - 450;
  }

  // Clamp to reasonable range
  bodyFatPct = Math.max(2, Math.min(60, Math.round(bodyFatPct * 10) / 10));

  const { category, categoryColor } = getBodyFatCategory(bodyFatPct, gender);

  return { bodyFatPct, category, categoryColor };
}

function getBodyFatCategory(pct: number, gender: "MALE" | "FEMALE"): { category: string; categoryColor: string } {
  if (gender === "MALE") {
    if (pct < 6)  return { category: "Essential Fat", categoryColor: "text-red-400" };
    if (pct < 14) return { category: "Athletes", categoryColor: "text-emerald-400" };
    if (pct < 18) return { category: "Fitness", categoryColor: "text-blue-400" };
    if (pct < 25) return { category: "Average", categoryColor: "text-yellow-400" };
    return { category: "Obese", categoryColor: "text-red-400" };
  } else {
    if (pct < 14) return { category: "Essential Fat", categoryColor: "text-red-400" };
    if (pct < 21) return { category: "Athletes", categoryColor: "text-emerald-400" };
    if (pct < 25) return { category: "Fitness", categoryColor: "text-blue-400" };
    if (pct < 32) return { category: "Average", categoryColor: "text-yellow-400" };
    return { category: "Obese", categoryColor: "text-red-400" };
  }
}

export async function saveBodyFatResult(bodyFatPct: number): Promise<{ success: boolean; error?: string }> {
  const user = await getUserProfile();
  if (!user) return { success: false, error: "User not found" };

  const dbReady = await isDbAvailable();
  if (!dbReady) return { success: false, error: "Database not available" };

  try {
    await prisma!.progressLog.create({
      data: {
        userId: user.id,
        weight: user.weight,
        bodyFatPct,
        date: new Date(),
      },
    });

    revalidatePath("/bodyfat");
    revalidatePath("/progress");
    return { success: true };
  } catch (err) {
    console.error("[ApexFit] Failed to save body fat result:", err);
    return { success: false, error: "Failed to save result" };
  }
}

export async function getBodyFatHistory(): Promise<{ date: string; bodyFatPct: number; weight: number }[]> {
  const user = await getUserProfile();
  if (!user) return [];

  const dbReady = await isDbAvailable();
  if (!dbReady) return [];

  try {
    const logs = await prisma!.progressLog.findMany({
      where: {
        userId: user.id,
        bodyFatPct: { not: null },
      },
      orderBy: { date: "asc" },
      select: {
        date: true,
        bodyFatPct: true,
        weight: true,
      },
    });

    return logs.map((log) => ({
      date: new Date(log.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      bodyFatPct: log.bodyFatPct!,
      weight: log.weight,
    }));
  } catch {
    return [];
  }
}
