import { getProgressData } from "@/actions/progress.actions";
import { getUserProfile } from "@/actions/user.actions";
import ProgressClient from "./progress-client";
import { redirect } from "next/navigation";

export default async function ProgressPage() {
  const user = await getUserProfile();
  if (!user) {
    redirect("/login");
  }

  const { weightLogs, macroLogs } = await getProgressData();

  return <ProgressClient user={user} weightLogs={weightLogs} macroLogs={macroLogs} />;
}
