"use server";

import { numeric, textValue, recordId, logDate, assertOwner } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getUserProfile, checkAndUpdateStreak } from "./user.actions";
import { isDbAvailable } from "./auth.actions";
import { checkAndUnlockBadges } from "./achievements.actions";
import {
  startOfDate, shiftDate, dateKey,
  getStartOfDayInTimezone,
  getEndOfDayInTimezone,
  getStartOfWeekInTimezone,
} from "@/lib/timezone";

export async function logMeal(formData: FormData) {
  const user = await getUserProfile();
  if (!user) throw new Error("User not found");

  assertOwner(formData, user.id);
  const id = recordId(formData, user.id);
  const foodName = textValue(formData.get("foodName"), "Food name", 200);
  const calories = formData.get("calories") as string;
  const protein = formData.get("protein") as string;
  const carbs = formData.get("carbs") as string;
  const fats = formData.get("fats") as string;
  const fiberStr = formData.get("fiber") as string;
  const plannedStr = formData.get("planned") as string;
  const dateStr = formData.get("date") as string;

  const isPlanned = plannedStr === "true";
  const mealDate = logDate(dateStr, isPlanned);

  if (!foodName || !calories || !protein || !carbs || !fats) {
    throw new Error("Missing required meal fields.");
  }

  const dbReady = await isDbAvailable();

  if (!dbReady) {
    throw new Error("Database is not available. Please try again later.");
  }

  try {
    await prisma!.mealLog.upsert({
      where: { id }, update: {},
      create: {
        id, userId: user.id,
        foodName,
        date: mealDate,
        calories: numeric(calories, "calories", 0, 20000, true),
        protein: numeric(protein, "protein", 0, 2000),
        carbs: numeric(carbs, "carbs", 0, 3000),
        fats: numeric(fats, "fats", 0, 2000),
        fiber: numeric(fiberStr || "0", "Fiber", 0, 500),
        planned: isPlanned,
      },
    });

    revalidatePath("/diet");
    revalidatePath("/");
    revalidatePath("/progress");
    revalidatePath("/reports");
  } catch (err) {
    console.error("[ApexFit] Failed to log meal:", err);
    throw new Error("Failed to log meal.");
  }

  // Trigger achievements only for actual eaten meals
  if (!isPlanned) {
    try {
      await checkAndUpdateStreak(user.id);
      await checkAndUnlockBadges(user.id, {
        loggedMeal: true,
      });
    } catch (err) {
      console.error("Failed to check badges", err);
    }
  }

  return { success: true };
}

export async function deleteMeal(mealId: string) {
  const user = await getUserProfile();
  if (!user) throw new Error("Unauthorized");
  const result = await prisma.mealLog.deleteMany({ where: { id: mealId, userId: user.id } });
  if (!result.count) throw new Error("Meal not found");
  await checkAndUpdateStreak(user.id);
  for (const path of ["/diet", "/", "/progress", "/reports"]) revalidatePath(path);
  return { success: true };
}

export async function getMealsForDate(day: string, timezone: string) {
  const user = await getUserProfile();
  if (!user) return [];
  const start = startOfDate(day, timezone);
  const end = startOfDate(shiftDate(day, 1), timezone);
  return prisma.mealLog.findMany({ where: { userId: user.id, date: { gte: start, lt: end } }, orderBy: { date: "desc" } });
}

export async function getTodaysMeals(timezone: string = "Asia/Kolkata") {
  const dbReady = await isDbAvailable();

  if (!dbReady) {
    return [];
  }

  try {
    const user = await getUserProfile();
    if (!user) return [];

    const startOfDay = getStartOfDayInTimezone(timezone);
    const endOfDay = getEndOfDayInTimezone(timezone);

    const meals = await prisma!.mealLog.findMany({
      where: {
        userId: user.id,
        date: { gte: startOfDay, lt: endOfDay },
        planned: false,
      },
      orderBy: { date: "desc" },
    });

    return meals;
  } catch {
    return [];
  }
}

export async function getWeeklyMeals(timezone: string = "Asia/Kolkata") {
  const dbReady = await isDbAvailable();

  if (!dbReady) {
    return [];
  }

  const startOfWeek = getStartOfWeekInTimezone(timezone);
  const endOfWeek = startOfDate(shiftDate(dateKey(startOfWeek, timezone), 7), timezone);

  try {
    const user = await getUserProfile();
    if (!user) return [];

    const meals = await prisma!.mealLog.findMany({
      where: {
        userId: user.id,
        date: { gte: startOfWeek, lt: endOfWeek },
      },
      orderBy: { date: "asc" },
    });

    return meals;
  } catch {
    return [];
  }
}

export const getWeeklyNutritionSummary = async (timezone: string = "Asia/Kolkata") => {
  const now = new Date();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Get the current date in user's timezone for proper day labeling
  const todayStr = now.toLocaleDateString("en-CA", { timeZone: timezone });

  // Generate zeroed-out 7-day data as default
  const emptyData = Array.from({ length: 7 }, (_, i) => {
    const key = shiftDate(todayStr, i - 6);
    return {
      day: dayNames[new Date(key + 'T12:00:00Z').getUTCDay()],
      date: key,
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
    };
  });

  const dbReady = await isDbAvailable();

  if (!dbReady) {
    return emptyData;
  }

  try {
    const user = await getUserProfile();
    if (!user) return emptyData;

    // Go back 7 days from start of today in user's timezone
    const startOfToday = getStartOfDayInTimezone(timezone);
    const weekAgo = startOfDate(shiftDate(dateKey(startOfToday, timezone), -6), timezone);

    const meals = await prisma!.mealLog.findMany({
      where: {
        userId: user.id,
        date: { gte: weekAgo, lt: getEndOfDayInTimezone(timezone) },
        planned: false,
      },
      orderBy: { date: "asc" },
    });

    if (meals.length === 0) return emptyData;

    // Group by day in user's timezone
    const grouped = new Map<string, typeof meals>();
    for (const meal of meals) {
      const key = new Date(meal.date).toLocaleDateString("en-CA", { timeZone: timezone });
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(meal);
    }

    const result = Array.from({ length: 7 }, (_, i) => {
      const key = shiftDate(todayStr, i - 6);
      const dayMeals = grouped.get(key) || [];
      return {
        day: dayNames[new Date(key + 'T12:00:00Z').getUTCDay()],
        date: key,
        calories: dayMeals.reduce((s, m) => s + m.calories, 0),
        protein: Math.round(dayMeals.reduce((s, m) => s + m.protein, 0)),
        carbs: Math.round(dayMeals.reduce((s, m) => s + m.carbs, 0)),
        fats: Math.round(dayMeals.reduce((s, m) => s + m.fats, 0)),
      };
    });

    return result;
  } catch {
    return emptyData;
  }
};


// ─── Recent Foods (for Quick Add "Recent" tab) ───────────────────
export async function getRecentFoods(): Promise<{ foodName: string; calories: number; protein: number; carbs: number; fats: number; fiber: number }[]> {
  try {
    const user = await getUserProfile();
    if (!user) return [];

    const meals = await prisma.mealLog.findMany({
      where: { userId: user.id, planned: false },
      orderBy: { date: "desc" },
      take: 30,
      select: { foodName: true, calories: true, protein: true, carbs: true, fats: true, fiber: true },
    });

    // Deduplicate by foodName, keep latest
    const seen = new Set<string>();
    const unique: typeof meals = [];
    for (const m of meals) {
      const key = m.foodName.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(m);
      }
      if (unique.length >= 10) break;
    }

    return unique;
  } catch {
    return [];
  }
}

// ─── Nutrition Report (for /reports page) ────────────────────────
export const getNutritionReport = async (days: 7 | 30 = 7, timezone: string = "Asia/Kolkata") => {
  if (days !== 7 && days !== 30) throw new Error("Invalid report period");
  try {
    const user = await getUserProfile();
    if (!user) return null;

    const startOfToday = getStartOfDayInTimezone(timezone);
    const startDate = startOfDate(shiftDate(dateKey(startOfToday, timezone), -(days - 1)), timezone);

    const meals = await prisma.mealLog.findMany({
      where: {
        userId: user.id,
        date: { gte: startDate, lt: getEndOfDayInTimezone(timezone) },
        planned: false,
      },
      orderBy: { date: "asc" },
    });

    // Group by day
    const dailyMap = new Map<string, { calories: number; protein: number; carbs: number; fats: number; fiber: number; mealCount: number }>();
    const foodCount = new Map<string, number>();

    for (const meal of meals) {
      const key = new Date(meal.date).toLocaleDateString("en-CA", { timeZone: timezone });
      const existing = dailyMap.get(key) || { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, mealCount: 0 };
      dailyMap.set(key, {
        calories: existing.calories + meal.calories,
        protein: existing.protein + meal.protein,
        carbs: existing.carbs + meal.carbs,
        fats: existing.fats + meal.fats,
        fiber: existing.fiber + (meal.fiber || 0),
        mealCount: existing.mealCount + 1,
      });

      // Track food frequency
      const fname = meal.foodName.toLowerCase();
      foodCount.set(fname, (foodCount.get(fname) || 0) + 1);
    }

    // Build daily array
    const dailyData = Array.from({ length: days }, (_, i) => {
      const key = shiftDate(dateKey(startOfToday, timezone), i - days + 1);
      const data = dailyMap.get(key);
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return {
        date: key,
        day: dayNames[new Date(key + "T12:00:00Z").getUTCDay()],
        shortDate: `${Number(key.slice(8,10))}/${Number(key.slice(5,7))}`,
        calories: data?.calories || 0,
        protein: Math.round(data?.protein || 0),
        carbs: Math.round(data?.carbs || 0),
        fats: Math.round(data?.fats || 0),
        fiber: Math.round(data?.fiber || 0),
        mealCount: data?.mealCount || 0,
      };
    });

    // Aggregate stats
    const activeDays = dailyData.filter((d) => d.calories > 0);
    const targetCals = user.targetCalories || 2000;
    const daysOnTarget = activeDays.filter((d) => d.calories >= targetCals * 0.85 && d.calories <= targetCals * 1.15).length;

    // Top foods
    const topFoods = Array.from(foodCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    return {
      dailyData,
      totalMeals: meals.length,
      avgCalories: activeDays.length > 0 ? Math.round(activeDays.reduce((s, d) => s + d.calories, 0) / activeDays.length) : 0,
      avgProtein: activeDays.length > 0 ? Math.round(activeDays.reduce((s, d) => s + d.protein, 0) / activeDays.length) : 0,
      avgCarbs: activeDays.length > 0 ? Math.round(activeDays.reduce((s, d) => s + d.carbs, 0) / activeDays.length) : 0,
      avgFats: activeDays.length > 0 ? Math.round(activeDays.reduce((s, d) => s + d.fats, 0) / activeDays.length) : 0,
      totalProtein: Math.round(meals.reduce((s, m) => s + m.protein, 0)),
      bestDay: activeDays.length > 0 ? activeDays.reduce((best, d) => d.calories > best.calories ? d : best) : null,
      worstDay: activeDays.length > 0 ? activeDays.reduce((worst, d) => d.calories < worst.calories ? d : worst) : null,
      daysOnTarget,
      activeDays: activeDays.length,
      topFoods,
      targetCalories: targetCals,
    };
  } catch (err) {
    return null;
  }
};



export async function updateMeal(id: string, fd: FormData) {
  const user = await getUserProfile();
  if (!user) throw new Error('Unauthorized');
  const planned = fd.get('planned') === 'true';
  await prisma.mealLog.update({where:{id,userId:user.id},data:{
    foodName:textValue(fd.get('foodName'),'Food name',200),date:logDate(fd.get('date'),planned),planned,
    calories:numeric(fd.get('calories'),'Calories',0,20000,true),protein:numeric(fd.get('protein'),'Protein',0,2000),carbs:numeric(fd.get('carbs'),'Carbs',0,3000),fats:numeric(fd.get('fats'),'Fats',0,2000),fiber:numeric(fd.get('fiber')||'0','Fiber',0,500)
  }});
  await checkAndUpdateStreak(user.id);
  for (const path of ['/', '/diet', '/reports', '/progress']) revalidatePath(path);
  return {success:true};
}
