import { getUserProfile } from "@/actions/user.actions";
import { checkAndSeedExercises, getExercises, getAllBodyParts } from "@/actions/exercise.actions";
import { redirect } from "next/navigation";
import ExerciseLibraryClient from "./exercise-client";

export const metadata = { title: "Exercise Library | ApexFit" };

export default async function ExerciseLibraryPage() {
  try {
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
  } catch (error: any) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-black text-red-500 font-mono text-sm">
        <div>
          <h1 className="text-2xl font-bold mb-4">SSR Critical Failure</h1>
          <p>The Server Component crashed during pre-render.</p>
          <pre className="mt-4 p-4 bg-red-900/20 rounded-xl overflow-x-auto border border-red-900/50">
            {error?.message || String(error)}
          </pre>
        </div>
      </div>
    );
  }
}
