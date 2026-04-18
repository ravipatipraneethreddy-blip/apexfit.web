import { Suspense } from "react";
import { getUserProfile } from "@/actions/user.actions";
import { getTodaysMeals } from "@/actions/diet.actions";
import { getRecentWorkouts } from "@/actions/workout.actions";
import { getTodaysWater } from "@/actions/water.actions";
import { getProgressData } from "@/actions/progress.actions";
import { getUserTimezone } from "@/lib/timezone";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";

// Components
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { AICoachServer } from "@/components/dashboard/ai-coach-server";
import { WeightChartWidget } from "@/components/dashboard/weight-chart-widget";
import WaterTracker from "@/components/water-tracker";
import { DashboardQuickLinks } from "@/components/dashboard/dashboard-quick-links";

export const revalidate = 5; // Enable ISR for fast passive dashboard parsing

export default async function DashboardPage() {
  const user = await getUserProfile();
  
  if (!user) {
    redirect("/onboarding");
  }

  const timezone = await getUserTimezone();

  // Fetch critical required data
  const [meals, workouts, water, progress] = await Promise.all([
    getTodaysMeals(timezone),
    getRecentWorkouts(),
    getTodaysWater(),
    getProgressData(),
  ]);

  const totalCals = Math.round(meals.reduce((sum: number, m: any) => sum + m.calories, 0));

  return (
    <div className="min-h-screen p-4 md:p-8 flex items-start justify-center font-sans tracking-tight">
      <div className="max-w-5xl w-full">
        {/* Server Rendered Layout Elements */}
        <DashboardHeader user={user} workoutsCount={workouts.length} />

        {/* AI Coach Suspense Boundary - Doesn't block initial FCP */}
        <Suspense fallback={
          <div className="mb-8 p-1 rounded-2xl bg-border/50 animate-pulse h-48 w-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        }>
          <AICoachServer timezone={timezone} user={user} meals={meals} workoutsCount={workouts.length} />
        </Suspense>

        {/* Server Rendered Stats Grid */}
        <DashboardStats user={user} meals={meals} workoutsCount={workouts.length} />

        {/* Charts & Interactive Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Client Interactive AreaChart */}
          <WeightChartWidget weightLogs={progress.weightLogs} user={user} />

          {/* Client Water Tracker */}
          <WaterTracker initialMl={water.totalMl} />

          {/* Server Rendered Navigation Links */}
          <DashboardQuickLinks totalCals={totalCals} workoutsCount={workouts.length} />
        </div>
      </div>
    </div>
  );
}
