import { getUserProfile } from "@/actions/user.actions";
import { checkAndSeedExercises, getExercises, getAllBodyParts } from "@/actions/exercise.actions";
import { redirect } from "next/navigation";
import ExerciseLibraryClient from "./exercise-client";

export const metadata = { title: "Exercise Library | ApexFit" };
export const dynamic = "force-dynamic";

export default async function ExerciseLibraryPage() {
  const user = await getUserProfile();
  if (!user) {
    redirect("/onboarding");
  }

  const initialExercises = await getExercises("", "All", 50);
  const bodyParts = await getAllBodyParts();
  
  // Checking count to inject the manual sync button if empty
  const needsSync = initialExercises.length < 10;

  // Next.js explicitly crashes if raw Prisma Date objects are passed directly to client boundaries
  const safeExercises = JSON.parse(JSON.stringify(initialExercises || []));
  const safeUser = JSON.parse(JSON.stringify(user));

  return (
    <ExerciseLibraryClient 
      user={safeUser} 
      initialExercises={safeExercises} 
      bodyParts={bodyParts || []}
      needsSync={needsSync}
    />
  );
}
