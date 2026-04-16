"use server";

import { prisma } from "@/lib/prisma";
import { FALLBACK_EXERCISES } from "@/data/fallback-exercises";

export async function checkAndSeedExercises() {
  try {
    // 1. Check if we already have exercises seeded locally
    const count = await prisma.cachedExercise.count();
    if (count > 0) {
      return { success: true, message: "Already seeded", count };
    }

    console.log("[Exercise Seed] No cached exercises found, attempting to seed from API...");

    // 2. Try fetching from RapidAPI first
    let insertData: typeof FALLBACK_EXERCISES | null = null;

    const apiKey = process.env.RAPIDAPI_KEY;
    if (apiKey) {
      try {
        const url = "https://exercisedb.p.rapidapi.com/exercises?limit=100&offset=0";
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "X-RapidAPI-Key": apiKey,
            "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            insertData = data.map((ex: any) => ({
              id: ex.id,
              name: ex.name,
              bodyPart: ex.bodyPart,
              target: ex.target,
              equipment: ex.equipment,
              gifUrl: ex.gifUrl,
              instructions: ex.instructions || [],
              secondaryMuscles: ex.secondaryMuscles || [],
            }));
            console.log("[Exercise Seed] Fetched", insertData!.length, "exercises from API");
          }
        } else {
          console.warn("[Exercise Seed] API responded with status:", response.status);
        }
      } catch (apiErr) {
        console.warn("[Exercise Seed] API fetch failed, will use fallback:", apiErr);
      }
    }

    // 3. Fall back to built-in exercises if API didn't work
    if (!insertData || insertData.length === 0) {
      console.log("[Exercise Seed] Using built-in fallback exercises...");
      insertData = FALLBACK_EXERCISES;
    }

    // 4. Save into DB cache
    await prisma.cachedExercise.createMany({
      data: insertData,
      skipDuplicates: true,
    });

    console.log("[Exercise Seed] Successfully seeded", insertData.length, "exercises");
    return { success: true, count: insertData.length };
  } catch (err: any) {
    console.error("[Exercise Sync Error]", err);
    return { error: err.message || "Failed to sync exercises" };
  }
}

export async function getExercises(query: string = "", bodyPart: string = "All", limit: number = 50) {
  try {
    const whereClause: any = {};
    if (query) {
      whereClause.name = { contains: query.toLowerCase(), mode: "insensitive" };
    }
    if (bodyPart !== "All") {
      whereClause.bodyPart = { equals: bodyPart.toLowerCase(), mode: "insensitive" };
    }

    const exercises = await prisma.cachedExercise.findMany({
      where: whereClause,
      take: limit,
      orderBy: { name: "asc" },
    });

    return exercises;
  } catch (err) {
    console.error("[Get Exercises Error]", err);
    return [];
  }
}

export async function getAllBodyParts() {
  try {
    const parts = await prisma.cachedExercise.findMany({
      select: { bodyPart: true },
      distinct: ["bodyPart"],
    });
    return parts.map(p => p.bodyPart).filter(Boolean).sort();
  } catch {
    return [];
  }
}
