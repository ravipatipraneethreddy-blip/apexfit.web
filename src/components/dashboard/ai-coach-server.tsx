import { BrainCircuit } from "lucide-react";
import { getCoachAnalysis } from "@/actions/ai.actions";
import { AICoachInteractive } from "./ai-coach-interactive";

export async function AICoachServer({ 
  timezone, 
  user,
  meals,
  workoutsCount
}: { 
  timezone: string;
  user: any;
  meals: any[];
  workoutsCount: number;
}) {
  const coachAnalysis = await getCoachAnalysis(timezone);
  
  const totalCals = Math.round(meals.reduce((sum, m) => sum + m.calories, 0));
  const totalPro = Math.round(meals.reduce((sum, m) => sum + m.protein, 0) * 10) / 10;
  const totalCarbs = Math.round(meals.reduce((sum, m) => sum + (m.carbs || 0), 0) * 10) / 10;
  const totalFats = Math.round(meals.reduce((sum, m) => sum + (m.fats || 0), 0) * 10) / 10;

  const isLowOrOver = coachAnalysis?.adherence?.includes("Over") || coachAnalysis?.adherence?.includes("Low");

  return (
    <div className="mb-8 p-1 rounded-2xl bg-gradient-to-r from-primary/50 via-accent/30 to-background neon-glow">
      <div className="bg-card flex flex-col md:flex-row gap-6 p-6 rounded-xl h-full">
        <div className="flex flex-col gap-2 shrink-0 md:w-48 items-center md:items-start text-center md:text-left border-b md:border-b-0 md:border-r border-border pb-4 md:pb-0 md:pr-6">
          <div className="p-3 bg-primary/10 text-primary rounded-full w-14 h-14 flex items-center justify-center">
            <BrainCircuit className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold flex items-center gap-2 mt-2">
            Coach AI
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-primary/20 text-primary uppercase tracking-widest">
              LIVE
            </span>
          </h2>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full uppercase tracking-wider ${isLowOrOver ? "bg-orange-400/10 text-orange-400" : "bg-emerald-400/10 text-emerald-400"}`}>
            {coachAnalysis ? coachAnalysis.adherence : "Ready"}
          </span>
        </div>
        
        <div className="flex-1 flex flex-col justify-center gap-4">
          {coachAnalysis && (
            <>
              <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Observation</h3>
                <p className="text-foreground text-sm font-medium leading-loose">
                  {coachAnalysis.insight}
                </p>
              </div>
              <div className="bg-primary/5 border border-primary/10 p-3 rounded-lg">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Recommendation</h3>
                <p className="text-primary/90 text-sm font-semibold">
                  {coachAnalysis.recommendation}
                </p>
              </div>
            </>
          )}

          <AICoachInteractive 
            user={user} 
            totalCals={totalCals} 
            totalPro={totalPro} 
            totalCarbs={totalCarbs} 
            totalFats={totalFats} 
            workoutsCount={workoutsCount} 
          />
        </div>
      </div>
    </div>
  );
}
