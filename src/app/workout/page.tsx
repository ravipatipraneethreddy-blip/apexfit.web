import { getRecentWorkouts, getPreviousExerciseData, getWorkoutTemplates, getWorkoutStats } from "@/actions/workout.actions";
import { getUserProfile } from "@/actions/user.actions";
import WorkoutClient from "./workout-client";

import { redirect } from "next/navigation";

export default async function WorkoutPage() {
  const user = await getUserProfile();
  if (!user) {
    redirect("/onboarding");
  }
  const recentWorkouts = await getRecentWorkouts();
  const previousData = await getPreviousExerciseData();
  const dbTemplates = await getWorkoutTemplates();
  const stats = await getWorkoutStats();
  
  return (
    <WorkoutClient
      user={user}
      recentWorkouts={recentWorkouts}
      previousData={previousData}
      dbTemplates={dbTemplates}
      personalRecords={stats.personalRecords}
    />
  );
}
