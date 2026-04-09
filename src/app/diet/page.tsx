import { getUserProfile } from "@/actions/user.actions";
import { getWeeklyMeals } from "@/actions/diet.actions";
import { getUserTimezone } from "@/lib/timezone";
import DietClient from "./diet-client";

import { redirect } from "next/navigation";

export default async function DietPage() {
  const user = await getUserProfile();
  if (!user) {
    redirect("/onboarding");
  }

  const timezone = await getUserTimezone();
  const meals = await getWeeklyMeals(timezone);

  return <DietClient user={user} meals={meals} />;
}
