import { getRecentWorkouts, getPreviousExerciseData, getWorkoutTemplates, getWorkoutStats } from "@/actions/workout.actions";
import { getUserProfile } from "@/actions/user.actions";
import { redirect } from "next/navigation";

import WorkoutLoggerClient from "@/components/workout/workout-logger";
import { WorkoutTemplatesView } from "@/components/workout/workout-templates-view";

export default async function WorkoutPage({ searchParams }: { searchParams: Promise<{ template?: string, templateId?: string }> }) {
  const user = await getUserProfile();
  if (!user) {
    redirect("/onboarding");
  }

  const dbTemplates = await getWorkoutTemplates();
  const params = await searchParams;

  // If user selected a template, show the active workout logger
  if (params.template || params.templateId) {
    const previousData = await getPreviousExerciseData();
    return (
      <WorkoutLoggerClient
        user={user}
        previousData={previousData}
        dbTemplates={dbTemplates}
        initialTemplateName={params.template}
        initialTemplateId={params.templateId}
      />
    );
  }

  // Otherwise, render the initial templates & history view natively on the server
  const recentWorkouts = await getRecentWorkouts();
  const stats = await getWorkoutStats();

  return (
    <WorkoutTemplatesView
      dbTemplates={dbTemplates}
      recentWorkouts={recentWorkouts}
      personalRecords={stats.personalRecords}
    />
  );
}
