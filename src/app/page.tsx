import { Suspense } from "react";
import Link from "next/link";
import { getUserProfile, checkAndUpdateStreak } from "@/actions/user.actions";
import { getTodaysMeals } from "@/actions/diet.actions";
import { getWorkoutCount } from "@/actions/workout.actions";
import { getTodaysWater } from "@/actions/water.actions";
import { getUserTimezone } from "@/lib/timezone";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { AICoachServer } from "@/components/dashboard/ai-coach-server";
import WaterTracker from "@/components/water-tracker";
import StepCounter from "@/components/step-counter";

export const revalidate = 30;

export default async function DashboardPage() {
  const user = await getUserProfile();
  if (!user) redirect("/login");
  const timezone = await getUserTimezone();
  const [streak, meals, water, workoutsCount] = await Promise.all([
    checkAndUpdateStreak(user.id),
    getTodaysMeals(timezone),
    getTodaysWater(),
    getWorkoutCount(),
  ]);

  return (
    <div className="min-h-screen p-4 md:p-8 flex items-start justify-center font-sans tracking-tight">
      <div className="max-w-3xl w-full">
        <DashboardHeader user={{ ...user, streakDays: streak }} workoutsCount={workoutsCount} />
        <Suspense fallback={
          <div role="status" className="mb-6 rounded-2xl bg-card border border-border p-5 min-h-36 flex items-center text-sm text-muted-foreground">
            Loading today’s workout…
          </div>
        }>
          <AICoachServer compact />
        </Suspense>
        <DashboardStats user={user} meals={meals} />
        <details className="rounded-2xl border border-border/60 bg-card mb-3">
          <summary className="cursor-pointer px-5 py-4 text-sm font-medium">Water &amp; steps</summary>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 pb-4">
            <WaterTracker initialMl={water.totalMl} />
            <StepCounter />
          </div>
        </details>
        <details className="rounded-2xl border border-border/60 bg-card mb-6">
          <summary className="cursor-pointer px-5 py-4 text-sm font-medium">More tools</summary>
          <nav aria-label="More fitness tools" className="grid grid-cols-2 gap-2 px-4 pb-4">
            {[
              ["/progress", "Progress & weight"],
              ["/bodyfat", "Body composition"],
              ["/reports", "Nutrition reports"],
              ["/exercises", "Exercise library"],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="rounded-xl bg-secondary px-3 py-3 text-sm hover:bg-secondary/70">{label}</Link>
            ))}
          </nav>
        </details>
      </div>
    </div>
  );
}
