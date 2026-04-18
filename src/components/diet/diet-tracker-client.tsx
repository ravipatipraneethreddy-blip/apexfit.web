"use client";

import { useOptimistic } from "react";
import { DietMacroRings } from "./diet-macro-rings";
import { MealSearchModal } from "./meal-search-modal";
import { MealList } from "./meal-list";

export function DietTrackerClient({
  initialMeals,
  user,
  isFutureDate,
  targetDateStr,
  recentFoods,
}: any) {
  const [optimisticMeals, addOptimisticMeal] = useOptimistic(
    initialMeals,
    (state, newMeal: any) => [newMeal, ...state]
  );

  return (
    <>
      <DietMacroRings meals={optimisticMeals} user={user} />
      
      <MealSearchModal
        isFutureDate={isFutureDate}
        selectedDateStr={targetDateStr}
        recentFoods={recentFoods}
        onOptimisticLog={(meal: any) => addOptimisticMeal(meal)}
      />
      
      <MealList meals={optimisticMeals} isFutureDate={isFutureDate} />
    </>
  );
}
