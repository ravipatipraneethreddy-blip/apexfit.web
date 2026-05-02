import { getNutritionReport } from "@/actions/diet.actions";
import { getUserProfile } from "@/actions/user.actions";
import { redirect } from "next/navigation";
import ReportsClient from "./reports-client";
import { getUserTimezone } from "@/lib/timezone";
import type { Viewport } from "next";

export const viewport: Viewport = { themeColor: "#000000" };
export const metadata = { title: "Nutrition Reports | ApexFit" };

export default async function ReportsPage() {
  const user = await getUserProfile();
  if (!user) redirect("/login");

  const timezone = await getUserTimezone();
  const weeklyReport = await getNutritionReport(7, timezone);
  const monthlyReport = await getNutritionReport(30, timezone);

  return <ReportsClient user={user} weeklyReport={weeklyReport} monthlyReport={monthlyReport} />;
}
