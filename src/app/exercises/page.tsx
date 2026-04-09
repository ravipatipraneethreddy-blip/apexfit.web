import { getUserProfile } from "@/actions/user.actions";
import { checkAndSeedExercises, getExercises, getAllBodyParts } from "@/actions/exercise.actions";
import { redirect } from "next/navigation";
import ExerciseLibraryClient from "./exercise-client";

export const metadata = { title: "Exercise Library | ApexFit" };

export default async function ExerciseLibraryPage() {
  const user = await getUserProfile();
  if (!user) {
    redirect("/onboarding");
  }

  // 1. Automatically bulk-seed the exercises if not already seeded
  const syncResult = await checkAndSeedExercises();

  // 2. Load cached exercises
  const initialExercises = await getExercises("", "All", 50);
  const bodyParts = await getAllBodyParts();

  return (
    <ExerciseLibraryClient 
      user={user} 
      initialExercises={initialExercises} 
      bodyParts={bodyParts}
      syncResult={syncResult}
    />
  );
}
