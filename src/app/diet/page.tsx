import { getUserProfile } from "@/actions/user.actions";
import { getMealsForDate, getRecentFoods } from "@/actions/diet.actions";
import { getUserTimezone, startOfDate, dateKey, shiftDate } from "@/lib/timezone";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { DateNavigator } from "@/components/diet/date-navigator";
import { DietTrackerClient } from "@/components/diet/diet-tracker-client";

export const revalidate = 5; // Passive caching bounds

export default async function DietPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const user = await getUserProfile();
  if (!user) {
    redirect("/login");
  }

  const timezone = await getUserTimezone();
  
  const params = await searchParams;
  
  // Use the timezone aware date string so it doesn't default to yesterday/tomorrow
  const now = new Date();
  const localTodayStr = now.toLocaleDateString("en-CA", { timeZone: timezone });
  
  let dateStr = params.date || localTodayStr;
  try { shiftDate(dateStr, 0); } catch { dateStr = localTodayStr; }
  const isFutureDate = dateStr > localTodayStr;
  const targetDate = startOfDate(dateStr, timezone);
  const [selectedDateMeals, recentFoods] = await Promise.all([getMealsForDate(dateStr, timezone), getRecentFoods()]);

  return (
    <div className="min-h-screen p-4 md:p-8 flex justify-center font-sans tracking-tight">
      <div className="max-w-md w-full">
        {/* Header - Server Rendered */}
        <header className="flex items-center justify-between mb-4">
          <Link href="/">
            <button className="p-2 rounded-xl bg-secondary hover:bg-secondary/70 transition">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
          </Link>
          <h2 className="text-xl font-bold tracking-tight">Nutrition {isFutureDate ? "Planner" : "Log"}</h2>
          <div className="w-9" />
        </header>

        {/* Date Navigator - Client Component */}
        <DateNavigator initialDate={dateStr} today={localTodayStr} />

        {/* Client orchestrator to maintain instant optimistic UI updates on forms while preserving RSC initialization */}
        <DietTrackerClient
          key={`${user.id}:${dateStr}`}
          initialMeals={selectedDateMeals}
          user={user}
          isFutureDate={isFutureDate}
          targetDateStr={targetDate.toISOString()}
          recentFoods={recentFoods}
        />
      </div>
    </div>
  );
}

