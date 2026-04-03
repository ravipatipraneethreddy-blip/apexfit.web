import { getUserProfile, getUserStats } from "@/actions/user.actions";
import { getEarnedBadges } from "@/actions/achievements.actions";
import ProfileClient from "./profile-client";

import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const user = await getUserProfile();
  if (!user) {
    redirect("/onboarding");
  }
  const stats = await getUserStats();
  
  // Safe fetch for badges using user ID, defaulting if user is missing
  const earnedBadges = user ? await getEarnedBadges(user.id) : [];

  return <ProfileClient user={user} stats={stats} earnedBadges={earnedBadges} />;
}
