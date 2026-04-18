import { getUserProfile } from "@/actions/user.actions";
import { getWeeklyMeals, getRecentFoods, getDietHistory } from "@/actions/diet.actions";
import { getUserTimezone } from "@/lib/timezone";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { DateNavigator } from "@/components/diet/date-navigator";
import { DietMacroRings } from "@/components/diet/diet-macro-rings";
import { MealSearchModal } from "@/components/diet/meal-search-modal";
import { MealList } from "@/components/diet/meal-list";

export default async function DietPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const user = await getUserProfile();
  if (!user) {
    redirect("/onboarding");
  }

  const timezone = await getUserTimezone();
  
  const params = await searchParams;
  const dateStr = params.date || new Date().toISOString().substring(0, 10);
  const targetDate = new Date(dateStr);
  const todayStr = new Date().toISOString().substring(0, 10);
  const isFutureDate = dateStr > todayStr;

  // We still fetch weekly meals so other logic can exist, but ideally we fetch just the requested date
  const [weeklyMeals, recentFoods] = await Promise.all([
    getWeeklyMeals(timezone),
    getRecentFoods(),
  ]);

  // Filter to just the selected date's meals
  const selectedDateMeals = weeklyMeals.filter(
    (m: any) => new Date(m.date).toISOString().substring(0, 10) === dateStr
  );

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
        <DateNavigator initialDate={dateStr} />

        {/* Macro Rings - Server Rendered */}
        <DietMacroRings meals={selectedDateMeals} user={user} />

        {/* Search Modal & Quick Actions - Client Component */}
        <MealSearchModal isFutureDate={isFutureDate} selectedDateStr={targetDate.toISOString()} recentFoods={recentFoods} />

        {/* Logged Meals List - Server Rendered */}
        <MealList meals={selectedDateMeals} isFutureDate={isFutureDate} />
      </div>
    </div>
  );
}
