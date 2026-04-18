import Link from "next/link";
import { ArrowLeft, Dumbbell, Trophy } from "lucide-react";

export const WORKOUT_TEMPLATES = [
  { name: "Push Day", exercises: ["Barbell Bench Press", "Incline Dumbbell Press", "Cable Flyes", "Overhead Press", "Lateral Raises", "Tricep Pushdown"] },
  { name: "Pull Day", exercises: ["Barbell Rows", "Pull Ups", "Face Pulls", "Barbell Curl", "Hammer Curls", "Rear Delt Flyes"] },
  { name: "Leg Day", exercises: ["Barbell Squats", "Romanian Deadlift", "Leg Press", "Leg Curls", "Calf Raises", "Walking Lunges"] },
  { name: "Upper Body", exercises: ["Bench Press", "Overhead Press", "Barbell Rows", "Pull Ups", "Lateral Raises", "Barbell Curl"] },
  { name: "Lower Body", exercises: ["Squats", "Deadlift", "Bulgarian Split Squat", "Leg Extensions", "Hip Thrusts", "Calf Raises"] },
  { name: "Full Body", exercises: ["Deadlift", "Bench Press", "Squats", "Pull Ups", "Overhead Press", "Barbell Rows"] },
  { name: "Custom", exercises: [] },
];

export function WorkoutTemplatesView({
  dbTemplates = [],
  recentWorkouts = [],
  personalRecords = [],
}: {
  dbTemplates?: any[];
  recentWorkouts?: any[];
  personalRecords?: any[];
}) {
  return (
    <div className="min-h-screen p-4 md:p-8 flex justify-center font-sans tracking-tight">
      <div className="max-w-md w-full pb-24">
        {/* Header */}
        <header className="flex items-center gap-3 mb-8">
          <Link href="/">
            <button className="p-2 rounded-xl bg-secondary hover:bg-secondary/70 transition">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Start Workout</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Choose a template to begin</p>
          </div>
        </header>

        {/* Coach Tip */}
        <div className="bg-card border border-primary/20 rounded-2xl p-4 mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary neon-glow" />
          <div className="flex gap-3 pl-2">
            <p className="text-sm text-foreground/90 leading-relaxed">
              <strong className="text-primary">Coach AI:</strong> Pick a template or start custom. Focus on progressive overload — try to beat last session&apos;s numbers.
            </p>
          </div>
        </div>

        {/* Saved Templates */}
        {dbTemplates.length > 0 && (
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 block">Your Saved Templates</span>
            <div className="grid grid-cols-2 gap-3">
              {dbTemplates.map((t: any) => (
                <Link
                  key={t.id}
                  href={`/workout?templateId=${t.id}`}
                  className="w-full text-left p-4 rounded-2xl border border-primary/20 bg-card hover:border-primary/50 transition group block relative"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                      <Dumbbell className="w-3.5 h-3.5" />
                    </div>
                    <p className="font-bold text-sm truncate pr-4">{t.name}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{t.exercises.length} exercises</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Built-in Templates */}
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 block">Workout Templates</span>
          <div className="grid grid-cols-2 gap-3">
            {WORKOUT_TEMPLATES.map((t) => (
              <Link
                key={t.name}
                href={`/workout?template=${encodeURIComponent(t.name)}`}
                className="text-left p-4 rounded-2xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition group block"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-lg ${t.name === "Custom" ? "bg-emerald-400/10 text-emerald-400" : "bg-secondary text-muted-foreground group-hover:text-primary group-hover:bg-primary/10"} transition`}>
                    <Dumbbell className="w-3.5 h-3.5" />
                  </div>
                  <p className="font-bold text-sm">{t.name}</p>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {t.exercises.length > 0 ? `${t.exercises.length} exercises` : "Build your own"}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Personal Records */}
        {personalRecords && personalRecords.length > 0 && (
          <div className="mt-8 pt-6 border-t border-border">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              Personal Records
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-2">
              {personalRecords.map((pr: any) => (
                <div key={pr.name} className="glass-panel p-3 rounded-xl flex flex-col justify-between border border-yellow-400/10">
                  <p className="font-bold text-xs truncate mb-2">{pr.name}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-primary">{pr.weight}</span>
                    <span className="text-[10px] text-muted-foreground font-semibold">kg</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{pr.reps} reps</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Workouts */}
        {recentWorkouts.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Workout History</h3>
            {recentWorkouts.map((workout: any) => (
              <Link key={workout.id} href={`/workout/${workout.id}`}>
                <div className="glass-panel p-4 rounded-xl mb-3 flex justify-between items-center group hover:border-primary/30 transition cursor-pointer block">
                  <div>
                    <p className="font-bold text-sm tracking-tight">{workout.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(workout.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{workout.exercises?.length || 0}</p>
                    <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Exercises</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
