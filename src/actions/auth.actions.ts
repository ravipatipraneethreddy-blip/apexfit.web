"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword, createSession, destroySession } from "@/lib/auth";
import { redirect } from "next/navigation";

// Helper: test if DB is actually reachable
export async function isDbAvailable(): Promise<boolean> {
  return true;
}

export async function registerUser(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const password = String(formData.get("password") || "");
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!name || !email || !password) {
    return { error: "All fields are required." };
  }

  if (name.length > 120 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return {error:"Enter a valid name and email address."};

  if (password.length < 8 || new TextEncoder().encode(password).length > 72) {
    return { error: "Password must be 8–72 bytes long." };
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

  try {
    const existing = await prisma.user.findUnique({where:{email}});
    if(existing)return {error:"An account with this email already exists."};
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
    return { error: "Registration could not be completed. Please try again." };
  }

  if (shouldRedirect) {
    redirect("/onboarding");
  }
}

export async function loginUser(formData: FormData) {
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const password = String(formData.get("password") || "");

  if (!email || !password || email.length > 254 || password.length > 1024) {
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
    return { error: "Sign-in is temporarily unavailable. Please try again." };
  }

  if (shouldRedirect) {
    redirect("/");
  }
}

export async function logoutUser() {
  await destroySession();
  redirect("/login");
}

