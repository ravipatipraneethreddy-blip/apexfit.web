import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/actions/user.actions";
import { AICoachServer } from "@/components/dashboard/ai-coach-server";

export const metadata = { title: "Coach | ApexFit" };

export default async function CoachPage() {
  const user = await getUserProfile();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen p-4 md:p-8 font-sans tracking-tight">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="inline-block text-sm text-muted-foreground hover:text-foreground py-2 mb-4">← Back to home</Link>
        <h1 className="text-2xl font-bold mb-6">Your coach</h1>
        <Suspense fallback={<div role="status" className="glass-panel rounded-2xl p-6 text-muted-foreground">Loading your programme…</div>}>
          <AICoachServer />
        </Suspense>
      </div>
    </div>
  );
}
