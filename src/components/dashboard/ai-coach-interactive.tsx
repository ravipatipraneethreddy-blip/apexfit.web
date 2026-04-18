"use client";

import { useState } from "react";
import { Send, Loader2, BrainCircuit } from "lucide-react";
import { askCoachQuestion } from "@/actions/ai.actions";

export function AICoachInteractive({ user, totalCals, totalPro, totalCarbs, totalFats, workoutsCount }: any) {
  const [coachQuery, setCoachQuery] = useState("");
  const [coachAnswer, setCoachAnswer] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);

  const handleAskCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachQuery.trim()) return;
    setIsAsking(true);
    const ctx = `User target: ${user.targetWeight}kg for ${user.goal}. Intake today: ${totalCals}kcal, Macros: ${totalPro}g P, ${totalCarbs}g C, ${totalFats}g F. Workouts: ${workoutsCount}.`;
    const res = await askCoachQuestion(coachQuery, ctx);
    setCoachAnswer(res.answer);
    setCoachQuery("");
    setIsAsking(false);
  };

  return (
    <>
      {coachAnswer && (
        <div className="bg-card border border-border p-3 rounded-lg mt-2">
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1">
            <BrainCircuit className="w-3 h-3 text-primary" /> AI Response
          </h3>
          <p className="text-sm font-medium leading-relaxed">{coachAnswer}</p>
        </div>
      )}

      <form onSubmit={handleAskCoach} className="relative mt-2">
        <input
          type="text"
          value={coachQuery}
          onChange={(e) => setCoachQuery(e.target.value)}
          placeholder="Ask Coach Apex anything..."
          className="w-full bg-background border border-border rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-primary transition"
          disabled={isAsking}
        />
        <button
          type="submit"
          disabled={isAsking || !coachQuery.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground rounded-lg transition disabled:opacity-50"
        >
          {isAsking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </>
  );
}
