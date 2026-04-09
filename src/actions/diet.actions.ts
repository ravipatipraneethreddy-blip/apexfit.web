"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getUserProfile, checkAndUpdateStreak } from "./user.actions";
import { isDbAvailable } from "./auth.actions";
import { checkAndUnlockBadges } from "./achievements.actions";

// Mock meals for demo mode
const MOCK_MEALS = [
  {
    id: "mock-meal-1",
    userId: "mock-user-1",
    date: new Date(),
    foodName: "Grilled Chicken Breast",
    calories: 350,
    protein: 45,
    carbs: 0,
    fats: 12,
    fiber: 0,
    planned: false,
  },
  {
    id: "mock-meal-2",
    userId: "mock-user-1",
    date: new Date(),
    foodName: "Brown Rice & Vegetables",
    calories: 420,
    protein: 12,
    carbs: 78,
    fats: 6,
    fiber: 4,
    planned: false,
  },
  {
    id: "mock-meal-3",
    userId: "mock-user-1",
    date: new Date(),
    foodName: "Whey Protein Shake",
    calories: 130,
    protein: 25,
    carbs: 3,
    fats: 2,
    fiber: 0,
    planned: false,
  },
];

// In-memory mock store for demo mode
let mockMealStore = [...MOCK_MEALS];
let mockNextId = 100;

export async function logMeal(formData: FormData) {
  const user = await getUserProfile();
  if (!user) throw new Error("User not found");

  const foodName = formData.get("foodName") as string;
  const calories = formData.get("calories") as string;
  const protein = formData.get("protein") as string;
  const carbs = formData.get("carbs") as string;
  const fats = formData.get("fats") as string;
  const fiberStr = formData.get("fiber") as string;
  const plannedStr = formData.get("planned") as string;
  const dateStr = formData.get("date") as string;

  const isPlanned = plannedStr === "true";
  const mealDate = dateStr ? new Date(dateStr) : new Date();

  if (!foodName || !calories || !protein || !carbs || !fats) {
    throw new Error("Missing required meal fields.");
  }

  const dbReady = await isDbAvailable();

  if (!dbReady) {
    // Mock mode — add to in-memory store
    mockMealStore.unshift({
      id: `mock-meal-${mockNextId++}`,
      userId: "mock-user-1",
      date: mealDate,
      foodName,
      calories: parseInt(calories, 10),
      protein: parseFloat(protein),
      carbs: parseFloat(carbs),
      fats: parseFloat(fats),
      fiber: parseFloat(fiberStr || "0"),
      planned: isPlanned,
    } as any);
    revalidatePath("/diet");
    revalidatePath("/");
  } else {
    try {
      await prisma!.mealLog.create({
        data: {
          userId: user.id,
          foodName,
          date: mealDate,
          calories: parseInt(calories, 10),
          protein: parseFloat(protein),
          carbs: parseFloat(carbs),
          fats: parseFloat(fats),
          fiber: parseFloat(fiberStr || "0"),
          planned: isPlanned,
        },
      });

      revalidatePath("/diet");
      revalidatePath("/");
      revalidatePath("/progress");
    } catch (err) {
      console.error("[ApexFit] Failed to log meal:", err);
    }
  }

  // Trigger achievements only for actual eaten meals
  if (!isPlanned) {
    try {
      await checkAndUpdateStreak(user ? user.id : "mock-user-1");
      await checkAndUnlockBadges(user ? user.id : "mock-user-1", {
        loggedMeal: true,
      });
    } catch (err) {
      console.error("Failed to check badges", err);
    }
  }

  return { success: true };
}

export async function deleteMeal(mealId: string) {
  const dbReady = await isDbAvailable();

  if (!dbReady) {
    // Mock mode — remove from in-memory store
    mockMealStore = mockMealStore.filter((m) => m.id !== mealId);
    revalidatePath("/diet");
    revalidatePath("/");
    return { success: true };
  }

  try {
    await prisma!.mealLog.delete({ where: { id: mealId } });
    revalidatePath("/diet");
    revalidatePath("/");
  } catch (err) {
    console.error("[ApexFit] Failed to delete meal:", err);
  }

  return { success: true };
}

export async function getTodaysMeals() {
  const dbReady = await isDbAvailable();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!dbReady) {
    return mockMealStore.filter(
      (m) => m.date >= today && !m.planned
    );
  }

  try {
    const user = await getUserProfile();
    if (!user) return mockMealStore.filter((m) => m.date >= today && !m.planned);

    const meals = await prisma!.mealLog.findMany({
      where: {
        userId: user.id,
        date: { gte: today },
        planned: false,
      },
      orderBy: { date: "desc" },
    });

    return meals.length > 0 ? meals : mockMealStore.filter((m) => m.date >= today && !m.planned);
  } catch {
    return mockMealStore.filter((m) => m.date >= today && !m.planned);
  }
}

export async function getWeeklyMeals() {
  const dbReady = await isDbAvailable();
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  if (!dbReady) {
    return mockMealStore.filter(
      (m) => m.date >= startOfWeek && m.date < endOfWeek
    );
  }

  try {
    const user = await getUserProfile();
    if (!user) return mockMealStore.filter((m) => m.date >= startOfWeek && m.date < endOfWeek);

    const meals = await prisma!.mealLog.findMany({
      where: {
        userId: user.id,
        date: { gte: startOfWeek, lt: endOfWeek },
      },
      orderBy: { date: "asc" },
    });

    return meals.length > 0 ? meals : mockMealStore.filter((m) => m.date >= startOfWeek && m.date < endOfWeek);
  } catch {
    return mockMealStore.filter((m) => m.date >= startOfWeek && m.date < endOfWeek);
  }
}

export async function getWeeklyNutritionSummary() {
  const now = new Date();

  // Generate mock 7-day data
  const mockData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now.getTime() - (6 - i) * 86400000);
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return {
      day: dayNames[date.getDay()],
      date: date.toISOString().slice(0, 10),
      calories: Math.round(1800 + Math.random() * 900),
      protein: Math.round(120 + Math.random() * 80),
      carbs: Math.round(150 + Math.random() * 150),
      fats: Math.round(40 + Math.random() * 40),
    };
  });

  const dbReady = await isDbAvailable();

  if (!dbReady) {
    return mockData;
  }

  try {
    const user = await getUserProfile();
    if (!user) return mockData;

    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    weekAgo.setHours(0, 0, 0, 0);

    const meals = await prisma!.mealLog.findMany({
      where: {
        userId: user.id,
        date: { gte: weekAgo },
      },
      orderBy: { date: "asc" },
    });

    if (meals.length === 0) return mockData;

    // Group by day
    const grouped = new Map<string, typeof meals>();
    for (const meal of meals) {
      const key = new Date(meal.date).toISOString().slice(0, 10);
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(meal);
    }

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const result = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now.getTime() - (6 - i) * 86400000);
      const key = date.toISOString().slice(0, 10);
      const dayMeals = grouped.get(key) || [];
      return {
        day: dayNames[date.getDay()],
        date: key,
        calories: dayMeals.reduce((s, m) => s + m.calories, 0),
        protein: Math.round(dayMeals.reduce((s, m) => s + m.protein, 0)),
        carbs: Math.round(dayMeals.reduce((s, m) => s + m.carbs, 0)),
        fats: Math.round(dayMeals.reduce((s, m) => s + m.fats, 0)),
      };
    });

    return result;
  } catch {
    return mockData;
  }
}
