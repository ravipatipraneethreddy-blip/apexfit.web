import { getUserProfile, getUserStats } from "@/actions/user.actions";
import { getUserAchievements } from "@/actions/achievements.actions";
import ProfileClient from "./profile-client";

import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const user = await getUserProfile();
  if (!user) {
    redirect("/onboarding");
  }
  const stats = await getUserStats();
  
  const earnedBadges = user ? await getUserAchievements() : [];

  return <ProfileClient user={user} stats={stats} earnedBadges={earnedBadges} />;
}
