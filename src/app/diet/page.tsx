import { getUserProfile } from "@/actions/user.actions";
import { getWeeklyMeals } from "@/actions/diet.actions";
import DietClient from "./diet-client";

export default async function DietPage() {
  const user = await getUserProfile();
  const meals = await getWeeklyMeals();

  return <DietClient user={user} meals={meals} />;
}
