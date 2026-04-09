import { getUserProfile } from "@/actions/user.actions";
import { getTodaysMeals } from "@/actions/diet.actions";
import { getRecentWorkouts } from "@/actions/workout.actions";
import { getCoachAnalysis } from "@/actions/ai.actions";
import { getTodaysWater } from "@/actions/water.actions";
import { getProgressData } from "@/actions/progress.actions";
import { getUserTimezone } from "@/lib/timezone";
import DashboardClient from "./dashboard-client";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getUserProfile();
  
  if (!user) {
    redirect("/onboarding");
  }

  const timezone = await getUserTimezone();

  const [meals, workouts, analysis, water, progress] = await Promise.all([
    getTodaysMeals(timezone),
    getRecentWorkouts(),
    getCoachAnalysis(timezone),
    getTodaysWater(),
    getProgressData(),
  ]);

  return (
    <DashboardClient 
      user={user} 
      meals={meals} 
      workouts={workouts} 
      analysis={analysis}
      waterMl={water.totalMl}
      weightLogs={progress.weightLogs}
    />
  );
}
