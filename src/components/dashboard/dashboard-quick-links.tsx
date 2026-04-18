import Link from "next/link";
import { Flame, Dumbbell, Calculator, BarChart3 } from "lucide-react";

export function DashboardQuickLinks({ totalCals, workoutsCount }: { totalCals: number; workoutsCount: number }) {
  return (
    <>
      {/* Quick Actions / Daily Check-in */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col">
        <h3 className="text-lg font-semibold tracking-tight mb-4">Daily Actions</h3>
        <div className="space-y-4 flex-1">
          <Link href="/diet" prefetch className="w-full text-left px-4 py-3 rounded-xl bg-secondary hover:bg-secondary/70 transition flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-background rounded-full group-hover:bg-primary/20 transition text-orange-400">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <span className="font-medium text-sm block">Log Meal</span>
                <span className="text-[10px] text-muted-foreground">
                  {totalCals > 0 ? `${totalCals} kcal today` : "Not logged yet"}
                </span>
              </div>
            </div>
            {totalCals > 0 && <div className="w-2 h-2 rounded-full bg-emerald-400" title="Started" />}
          </Link>

          <Link href="/workout" prefetch className="w-full text-left px-4 py-3 rounded-xl bg-secondary hover:bg-secondary/70 transition flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-background rounded-full group-hover:bg-primary/20 transition text-primary">
                <Dumbbell className="w-4 h-4" />
              </div>
              <div>
                <span className="font-medium text-sm block">Start Workout</span>
                <span className="text-[10px] text-muted-foreground">
                  {workoutsCount > 0 ? `${workoutsCount} recent sessions` : "No recent workouts"}
                </span>
              </div>
            </div>
            {workoutsCount > 0 && <div className="w-2 h-2 rounded-full bg-emerald-400" title="Active" />}
          </Link>
        </div>
      </div>

      {/* Explore Tools */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col">
        <h3 className="text-lg font-semibold tracking-tight mb-4">Explore Tools</h3>
        <div className="space-y-4 flex-1">
          <Link href="/bodyfat" prefetch className="w-full text-left px-4 py-3 rounded-xl bg-secondary hover:bg-secondary/70 transition flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-background rounded-full group-hover:bg-primary/20 transition text-purple-400">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <span className="font-medium text-sm block">Body Composition</span>
                <span className="text-[10px] text-muted-foreground">Calculate body fat %</span>
              </div>
            </div>
          </Link>

          <Link href="/reports" prefetch className="w-full text-left px-4 py-3 rounded-xl bg-secondary hover:bg-secondary/70 transition flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-background rounded-full group-hover:bg-primary/20 transition text-yellow-400">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <span className="font-medium text-sm block">Nutrition Reports</span>
                <span className="text-[10px] text-muted-foreground">Weekly & monthly analytics</span>
              </div>
            </div>
          </Link>

          <Link href="/exercises" prefetch className="w-full text-left px-4 py-3 rounded-xl bg-secondary hover:bg-secondary/70 transition flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-background rounded-full group-hover:bg-primary/20 transition text-pink-400">
                <Dumbbell className="w-4 h-4" />
              </div>
              <div>
                <span className="font-medium text-sm block">Exercise Library</span>
                <span className="text-[10px] text-muted-foreground">Instructional animations</span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
