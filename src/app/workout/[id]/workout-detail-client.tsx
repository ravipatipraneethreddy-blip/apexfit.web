"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Dumbbell, Calendar, Weight, Hash } from "lucide-react";
import Link from "next/link";

export default function WorkoutDetailClient({ workout }: { workout: any }) {
  const totalVolume = (workout.exercises || []).reduce(
    (sum: number, ex: any) => sum + ex.sets * ex.reps * ex.weight,
    0
  );

  return (
    <div className="min-h-screen p-4 md:p-8 flex justify-center font-sans tracking-tight">
      <div className="max-w-md w-full">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <Link href="/workout">
            <button className="p-2 rounded-xl bg-secondary hover:bg-secondary/70 transition">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
          </Link>
          <h2 className="text-xl font-bold tracking-tight">{workout.name}</h2>
          <div className="w-9" />
        </header>

        {/* Workout Meta */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl p-5 mb-6"
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <Calendar className="w-4 h-4 mx-auto mb-1 text-primary" />
              <p className="text-sm font-bold">
                {new Date(workout.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Date</p>
            </div>
            <div>
              <Dumbbell className="w-4 h-4 mx-auto mb-1 text-primary" />
              <p className="text-sm font-bold">{workout.exercises?.length || 0}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Exercises</p>
            </div>
            <div>
              <Weight className="w-4 h-4 mx-auto mb-1 text-primary" />
              <p className="text-sm font-bold">{Math.round(totalVolume).toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Volume (kg)</p>
            </div>
          </div>
        </motion.div>

        {/* Exercises */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
            Exercises
          </h3>
          {(workout.exercises || []).map((ex: any, i: number) => (
            <motion.div
              key={ex.id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-panel rounded-2xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </div>
                  <h4 className="font-bold text-sm">{ex.name}</h4>
                </div>
              </div>

              {/* Exercise Details Table */}
              <div className="bg-background/50 rounded-xl overflow-hidden">
                <div className="grid grid-cols-3 gap-2 px-3 py-2 text-[10px] text-muted-foreground uppercase tracking-widest font-semibold border-b border-border/50">
                  <span className="flex items-center gap-1"><Hash className="w-3 h-3" /> Sets</span>
                  <span className="text-center">Reps</span>
                  <span className="text-right">Weight</span>
                </div>
                <div className="px-3 py-2.5">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm font-bold">{ex.sets}</span>
                    <span className="text-sm font-bold text-center">{ex.reps}</span>
                    <span className="text-sm font-bold text-right text-primary">{ex.weight} kg</span>
                  </div>
                </div>
              </div>

              {/* Volume */}
              <div className="flex justify-end mt-2">
                <span className="text-[10px] text-muted-foreground">
                  Vol: {(ex.sets * ex.reps * ex.weight).toLocaleString()} kg
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
