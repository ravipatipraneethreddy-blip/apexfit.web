import { getWorkoutById } from "@/actions/workout.actions";
import WorkoutDetailClient from "./workout-detail-client";
import { notFound } from "next/navigation";

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workout = await getWorkoutById(id);

  if (!workout) {
    notFound();
  }

  return <WorkoutDetailClient workout={workout} />;
}
