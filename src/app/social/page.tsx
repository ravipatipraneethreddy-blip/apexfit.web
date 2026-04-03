import { getLeaderboard } from "@/actions/user.actions";
import SocialClient from "./social-client";

export const dynamic = "force-dynamic"; // Ensure fresh leaderboard

export default async function SocialPage() {
  const leaderboard = await getLeaderboard();
  
  return <SocialClient leaderboard={leaderboard} />;
}
