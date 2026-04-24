"use client";

import { useState, useEffect } from "react";
import { Footprints } from "lucide-react";
import { getTodayStepsLocal, getStepGoal } from "@/lib/native/step.service";

/**
 * Small stat card for the dashboard stats row.
 * Reads today's steps from localStorage and renders a card matching
 * the existing DashboardStats design.
 */
export function StepStatCard() {
  const [steps, setSteps] = useState(0);
  const [goal, setGoal] = useState(10000);

  useEffect(() => {
    setSteps(getTodayStepsLocal());
    setGoal(getStepGoal());

    // Re-read every 5 seconds for near-real-time updates
    const interval = setInterval(() => {
      setSteps(getTodayStepsLocal());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-card rounded-2xl p-4 flex flex-col justify-between border border-border/50 hover:border-border transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">Steps</span>
        <div className="p-1.5 rounded-lg bg-emerald-400/10 text-emerald-400">
          <Footprints className="w-4 h-4" />
        </div>
      </div>
      <div>
        <div className="text-xl font-bold tracking-tight">
          {steps.toLocaleString()}
        </div>
        <div className="text-[10px] text-muted-foreground mt-0.5">
          / {goal.toLocaleString()} goal
        </div>
      </div>
    </div>
  );
}
