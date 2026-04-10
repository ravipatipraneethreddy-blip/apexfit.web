"use server";

import { prisma } from "@/lib/prisma";

export async function checkAndSeedExercises() {
  try {
    // 1. Check if we already have exercises seeded locally
    const count = await prisma.cachedExercise.count();
    if (count > 0) {
      return { success: true, message: "Already seeded", count };
    }

    // 2. Fetch from RapidAPI if our DB is empty
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
      return { error: "Missing RAPIDAPI_KEY in environment variables." };
    }

    const url = "https://exercisedb.p.rapidapi.com/exercises?limit=100&offset=0";
    const options = {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
      },
    };

    const response = await fetch(url, options);
    if (!response.ok) {
      return { error: "Failed to fetch from ExerciseDB API." };
    }

    const data = await response.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      return { error: "Invalid data received from ExerciseDB." };
    }

    // 3. Save into our local DB cache using createMany
    const insertData = data.map((ex: any) => ({
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
      whereClause.name = { contains: query.toLowerCase() };
    }
    if (bodyPart !== "All") {
      whereClause.bodyPart = { equals: bodyPart.toLowerCase() };
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
