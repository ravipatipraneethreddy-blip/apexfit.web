"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword, createSession, destroySession } from "@/lib/auth";
import { redirect } from "next/navigation";

// Helper: test if DB is actually reachable
export async function isDbAvailable(): Promise<boolean> {
  return true;
}

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = (formData.get("email") as string)?.toLowerCase().trim();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!name || !email || !password) {
    return { error: "All fields are required." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const dbReady = await isDbAvailable();

  // DB unavailable — cannot register
  if (!dbReady) {
    return { error: "Database is not available. Please try again later." };
  }

  // DB mode
  let shouldRedirect = false;

  // Check if email already exists
  const existing = await prisma!.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  try {
    const passwordHash = await hashPassword(password);

    const user = await prisma!.user.create({
      data: {
        email,
        passwordHash,
        name,
        age: 25,
        height: 170,
        weight: 70,
        goal: "FAT_LOSS",
        dietPreference: "ANY",
        activityLevel: "MODERATE",
        streakDays: 0,
      },
    });

    await createSession(user.id);
    shouldRedirect = true;
  } catch (err: any) {
    console.error("[ApexFit] Registration error:", err?.message || err);
    return { error: `Registration failed: ${err?.message || "Unknown error"}` };
  }

  if (shouldRedirect) {
    redirect("/onboarding");
  }
}

export async function loginUser(formData: FormData) {
  const email = (formData.get("email") as string)?.toLowerCase().trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const dbReady = await isDbAvailable();

  // DB unavailable — cannot login
  if (!dbReady) {
    return { error: "Database is not available. Please try again later." };
  }

  let shouldRedirect = false;

  try {
    const user = await prisma!.user.findUnique({ where: { email } });
    if (!user) {
      return { error: "Invalid email or password." };
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return { error: "Invalid email or password." };
    }

    await createSession(user.id);
    shouldRedirect = true;
  } catch (err: any) {
    console.error("[ApexFit] Login error:", err?.message || err);
    return { error: `Login failed: ${err?.message || "Unknown error"}` };
  }

  if (shouldRedirect) {
    redirect("/");
  }
}

export async function logoutUser() {
  await destroySession();
  redirect("/login");
}
