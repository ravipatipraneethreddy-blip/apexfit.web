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

  // Load cached exercises safely
  const initialExercises = await getExercises("", "All", 50);
  const bodyParts = await getAllBodyParts();
  
  // Checking count to inject the manual sync button if empty
  const needsSync = initialExercises.length < 10;

  return (
    <ExerciseLibraryClient 
      user={user} 
      initialExercises={initialExercises} 
      bodyParts={bodyParts}
      needsSync={needsSync}
    />
  );
}
