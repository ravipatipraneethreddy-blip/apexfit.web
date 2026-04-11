"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Search, Dumbbell, Target, Info } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useDebounce } from "@/lib/use-debounce";
import { getExercises } from "@/actions/exercise.actions";

export default function ExerciseLibraryClient({
  user,
  initialExercises,
  bodyParts,
}: {
  user: any;
  initialExercises: any[];
  bodyParts: string[];
}) {
  const [exercises, setExercises] = useState(initialExercises);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeBodyPart, setActiveBodyPart] = useState("All");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 400);

  useEffect(() => {
    async function fetchFiltered() {
      setIsLoading(true);
      const res = await getExercises(debouncedSearch, activeBodyPart, 100);
      setExercises(res);
      setIsLoading(false);
    }
    // Only fetch if it's different from the initial load
    fetchFiltered();
  }, [debouncedSearch, activeBodyPart]);

  return (
    <div className="min-h-screen p-4 md:p-8 flex items-start justify-center font-sans tracking-tight">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/">
              <button className="p-2 rounded-xl bg-secondary hover:bg-secondary/70 transition">
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
            </Link>
            <div>
              <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Dumbbell className="w-6 h-6 text-primary" /> Exercise Library
              </h2>
              <p className="text-xs text-muted-foreground mt-1">Explore and learn 100+ proven movements.</p>
            </div>
          </div>
        </header>

        {/* Search & Filters */}
        <div className="glass-panel p-4 rounded-3xl mb-8 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-96 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercises..."
              className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-sm font-semibold focus:outline-none focus:border-primary transition"
            />
          </div>
          
          <div className="w-full flex gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
            <button
              onClick={() => setActiveBodyPart("All")}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeBodyPart === "All"
                  ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(0,229,255,0.3)]"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              }`}
            >
              All
            </button>
            {bodyParts.map((bp) => (
              <button
                key={bp}
                onClick={() => setActiveBodyPart(bp)}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
                  activeBodyPart === bp
                    ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(0,229,255,0.3)]"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                {bp}
              </button>
            ))}
          </div>
        </div>

        {/* Exercises Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading && exercises.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground py-10 font-bold animate-pulse">
              Loading exercises...
            </p>
          ) : exercises.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground py-10 font-bold">
              No exercises found for &quot;{searchQuery}&quot;.
            </p>
          ) : (
            exercises.map((ex, i) => {
              const isExpanded = expandedExercise === ex.id;
              return (
                <motion.div
                  key={ex.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-panel overflow-hidden rounded-3xl flex flex-col cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
                  onClick={() => setExpandedExercise(isExpanded ? null : ex.id)}
                >
                  <div className="relative aspect-video bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={ex.gifUrl} 
                      alt={ex.name}
                      loading="lazy"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2 py-1 bg-black/60 backdrop-blur text-white text-[10px] font-bold uppercase tracking-wider rounded-lg border border-white/10">
                        {ex.bodyPart}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col justify-between bg-card text-foreground">
                    <div>
                      <h3 className="text-xl font-black capitalize tracking-tight leading-tight mb-2">
                        {ex.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md capitalize">
                          <Target className="w-3 h-3" /> {ex.target}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-semibold text-orange-400 bg-orange-400/10 px-2 py-1 rounded-md capitalize">
                          <Dumbbell className="w-3 h-3" /> {ex.equipment}
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto border-t border-border/50 pt-3 flex justify-between items-center text-primary text-xs font-bold hover:text-primary/80 transition">
                      {isExpanded ? "Close Instructions" : "Read Instructions"}
                      <Info className="w-4 h-4" />
                    </div>

                    {/* Expandable Instructions Area */}
                    {isExpanded && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4 pt-4 border-t border-border/50"
                      >
                        <ol className="list-decimal list-outside ml-4 space-y-2 text-sm text-muted-foreground font-medium leading-relaxed">
                          {ex.instructions?.map((step: string, idx: number) => (
                            <li key={idx} className="pl-1">{step}</li>
                          ))}
                        </ol>
                        
                        {ex.secondaryMuscles?.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2 items-center">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Secondary:</span>
                            {ex.secondaryMuscles.map((m: string) => (
                              <span key={m} className="px-2 py-0.5 rounded bg-secondary text-foreground text-xs capitalize font-semibold border border-border">
                                {m}
                              </span>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
