"use server";

import { prisma } from "@/lib/prisma";

export async function checkAndSeedExercises() {
  try {
    // 1. Check if we already have exercises seeded locally
    const count = await prisma.cachedExercise.count();
    if (count > 1000) {
      return { success: true, message: "Already seeded", count };
    }

    // Purge incomplete cache to start fresh
    if (count > 0) {
      await prisma.cachedExercise.deleteMany({});
    }

    // 2. Fetch from RapidAPI with safe pagination
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
      return { error: "Missing RAPIDAPI_KEY in environment variables." };
    }

    let allExercises: any[] = [];
    const limit = 100;
    
    for (let offset = 0; offset < 1400; offset += limit) {
      const url = `https://exercisedb.p.rapidapi.com/exercises?limit=${limit}&offset=${offset}`;
      const options = {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
        },
      };

      const response = await fetch(url, options);
      if (!response.ok) break;

      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) break;

      allExercises = [...allExercises, ...data];
      
      // If we got less than the limit, we hit the end
      if (data.length < limit) break;
    }

    if (allExercises.length === 0) {
      return { error: "Failed to fetch any data from ExerciseDB." };
    }

    // 3. Save into our local DB cache using createMany
    const insertData = allExercises.map((ex: any) => ({
      id: ex.id,
      name: ex.name,
      bodyPart: ex.bodyPart,
      target: ex.target,
      equipment: ex.equipment,
      gifUrl: ex.gifUrl,
      instructions: ex.instructions || [],
      secondaryMuscles: ex.secondaryMuscles || [],
    }));

    await prisma.cachedExercise.createMany({
      data: insertData,
      skipDuplicates: true,
    });

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
      whereClause.name = { contains: query, mode: "insensitive" };
    }
    if (bodyPart !== "All") {
      whereClause.bodyPart = { equals: bodyPart, mode: "insensitive" };
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
