"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, Dumbbell, Target, Info, Play, X, ChevronRight, Zap, Layers, Clock } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useDebounce } from "@/lib/use-debounce";
import { getExercises } from "@/actions/exercise.actions";
import { SPLIT_EXERCISES, SPLIT_CATEGORIES, type SplitCategory, type SplitExercise } from "@/data/ppl-exercises";

// ─── Types ───────────────────────────────────────────────────
type ViewMode = "splits" | "library";

// ─── YouTube Video Modal ─────────────────────────────────────
function VideoModal({
  exercise,
  onClose,
}: {
  exercise: SplitExercise;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal Content */}
      <motion.div
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative z-10 w-full max-w-4xl glass-panel rounded-3xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Video */}
        <div className="relative aspect-video bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${exercise.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
            title={exercise.name}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>

        {/* Exercise Details */}
        <div className="p-6">
          <h3 className="text-2xl font-black tracking-tight mb-2">{exercise.name}</h3>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-lg">
              <Target className="w-3 h-3" /> {exercise.muscleGroup}
            </span>
            <span className="flex items-center gap-1 text-xs font-bold text-orange-400 bg-orange-400/10 px-3 py-1.5 rounded-lg">
              <Dumbbell className="w-3 h-3" /> {exercise.equipment}
            </span>
            <span className="flex items-center gap-1 text-xs font-bold text-blue-400 bg-blue-400/10 px-3 py-1.5 rounded-lg">
              <Layers className="w-3 h-3" /> {exercise.sets} × {exercise.reps}
            </span>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
              exercise.difficulty === "Advanced"
                ? "text-red-400 bg-red-400/10"
                : exercise.difficulty === "Intermediate"
                ? "text-yellow-400 bg-yellow-400/10"
                : "text-green-400 bg-green-400/10"
            }`}>
              {exercise.difficulty}
            </span>
          </div>

          {/* Tips */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Pro Tips</h4>
            <ul className="space-y-1.5">
              {exercise.tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground font-medium">
                  <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Exercise Card (used in both Split + Library views) ──────
function ExerciseCard({
  exercise,
  index,
  onPlay,
}: {
  exercise: SplitExercise;
  index: number;
  onPlay: () => void;
}) {
  const catMeta = SPLIT_CATEGORIES[exercise.category];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      className={`glass-panel rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-[1.02] border ${catMeta.borderColor}`}
      onClick={onPlay}
    >
      {/* Video thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-card to-background overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://img.youtube.com/vi/${exercise.youtubeId}/hqdefault.jpg`}
          alt={exercise.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-300"
        />

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:bg-primary/80 transition-all duration-300"
          >
            <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
          </motion.div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2.5 py-1 ${catMeta.bgColor} ${catMeta.textColor} text-[10px] font-bold uppercase tracking-wider rounded-lg backdrop-blur border ${catMeta.borderColor}`}>
            {catMeta.label}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 text-[10px] font-bold rounded-lg backdrop-blur ${
            exercise.difficulty === "Advanced"
              ? "bg-red-400/20 text-red-400 border border-red-400/20"
              : exercise.difficulty === "Intermediate"
              ? "bg-yellow-400/20 text-yellow-400 border border-yellow-400/20"
              : "bg-green-400/20 text-green-400 border border-green-400/20"
          }`}>
            {exercise.difficulty}
          </span>
        </div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent" />
      </div>

      {/* Card Info */}
      <div className="p-4">
        <h3 className="text-lg font-black tracking-tight mb-2 group-hover:text-primary transition-colors">
          {exercise.name}
        </h3>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md">
            <Target className="w-3 h-3" /> {exercise.muscleGroup}
          </span>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-orange-400 bg-orange-400/10 px-2 py-1 rounded-md">
            <Dumbbell className="w-3 h-3" /> {exercise.equipment}
          </span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border/50 mt-auto">
          <span className="text-xs font-bold text-muted-foreground">
            {exercise.sets} sets × {exercise.reps}
          </span>
          <span className="text-xs font-bold text-primary flex items-center gap-1 group-hover:underline">
            Watch Demo <Play className="w-3 h-3" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Split Selector Card ─────────────────────────────────────
function SplitSelectorCard({
  splitKey,
  isActive,
  onClick,
}: {
  splitKey: SplitCategory;
  isActive: boolean;
  onClick: () => void;
}) {
  const meta = SPLIT_CATEGORIES[splitKey];
  const count = SPLIT_EXERCISES.filter(e => e.category === splitKey).length;

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300 min-w-[120px] ${
        isActive
          ? `${meta.bgColor} ${meta.borderColor} ${meta.glowColor}`
          : "bg-secondary/50 border-border/50 hover:border-border"
      }`}
    >
      <span className="text-2xl">{meta.icon}</span>
      <span className={`text-sm font-bold ${isActive ? meta.textColor : "text-foreground"}`}>
        {meta.label}
      </span>
      <span className="text-[10px] text-muted-foreground font-medium">{count} exercises</span>
    </motion.button>
  );
}

// ─── Workout Splits View ─────────────────────────────────────
function SplitsView() {
  const [activeCategory, setActiveCategory] = useState<SplitCategory | "all">("all");
  const [activeVideo, setActiveVideo] = useState<SplitExercise | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredExercises = SPLIT_EXERCISES.filter((ex) => {
    const matchesCategory = activeCategory === "all" || ex.category === activeCategory;
    const matchesSearch =
      searchQuery === "" ||
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.equipment.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const splitKeys: SplitCategory[] = ["push", "pull", "legs", "upper", "lower", "fullbody"];

  return (
    <>
      {/* Search */}
      <div className="glass-panel p-4 rounded-3xl mb-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exercises by name, muscle, or equipment..."
            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-sm font-semibold focus:outline-none focus:border-primary transition"
          />
        </div>
      </div>

      {/* Split Selector Grid */}
      <div className="mb-6">
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {/* All button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveCategory("all")}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300 min-w-[120px] ${
              activeCategory === "all"
                ? "bg-primary/10 border-primary/30 shadow-[0_0_20px_rgba(0,229,255,0.3)]"
                : "bg-secondary/50 border-border/50 hover:border-border"
            }`}
          >
            <span className="text-2xl">🔥</span>
            <span className={`text-sm font-bold ${activeCategory === "all" ? "text-primary" : "text-foreground"}`}>
              All Splits
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">{SPLIT_EXERCISES.length} total</span>
          </motion.button>

          {splitKeys.map((key) => (
            <SplitSelectorCard
              key={key}
              splitKey={key}
              isActive={activeCategory === key}
              onClick={() => setActiveCategory(key)}
            />
          ))}
        </div>
      </div>

      {/* Category Banner */}
      {activeCategory !== "all" && (
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`glass-panel rounded-2xl p-5 mb-6 border ${SPLIT_CATEGORIES[activeCategory].borderColor}`}
        >
          <div className="flex items-start gap-4">
            <div className="text-4xl shrink-0">{SPLIT_CATEGORIES[activeCategory].icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className={`text-xl font-black tracking-tight ${SPLIT_CATEGORIES[activeCategory].textColor}`}>
                  {SPLIT_CATEGORIES[activeCategory].label} Day
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${SPLIT_CATEGORIES[activeCategory].bgColor} ${SPLIT_CATEGORIES[activeCategory].textColor}`}>
                  {SPLIT_EXERCISES.filter(e => e.category === activeCategory).length} exercises
                </span>
              </div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">
                {SPLIT_CATEGORIES[activeCategory].tagline}
              </p>
              <p className="text-sm text-muted-foreground">
                {SPLIT_CATEGORIES[activeCategory].description}
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {SPLIT_CATEGORIES[activeCategory].frequency}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground py-10 font-bold">
            No exercises found for &quot;{searchQuery}&quot;.
          </p>
        ) : (
          filteredExercises.map((ex, i) => (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              index={i}
              onPlay={() => setActiveVideo(ex)}
            />
          ))
        )}
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {activeVideo && (
          <VideoModal
            exercise={activeVideo}
            onClose={() => setActiveVideo(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Full Library View (DB + Fallback) ───────────────────────
function FullLibraryView({
  initialExercises,
  bodyParts,
}: {
  initialExercises: any[];
  bodyParts: string[];
}) {
  const [exercises, setExercises] = useState(initialExercises);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeBodyPart, setActiveBodyPart] = useState("All");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const isFirstRender = useRef(true);

  const debouncedSearch = useDebounce(searchQuery, 400);

  // Build fallback from split data — deduplicated by name
  const fallbackExercises = (() => {
    const seen = new Set<string>();
    return SPLIT_EXERCISES
      .filter((ex) => {
        const key = ex.name.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((ex) => ({
        id: ex.id,
        name: ex.name.toLowerCase(),
        bodyPart: ex.muscleGroup.toLowerCase().split(" / ")[0].split(" (")[0],
        target: ex.muscleGroup.toLowerCase(),
        equipment: ex.equipment.toLowerCase(),
        gifUrl: `https://img.youtube.com/vi/${ex.youtubeId}/hqdefault.jpg`,
        instructions: ex.tips,
        secondaryMuscles: [],
        youtubeId: ex.youtubeId,
      }));
  })();

  // Use DB exercises if available, else fallback
  const displayExercises = exercises.length > 0 ? exercises : fallbackExercises;

  // Get body parts from current data
  const availableBodyParts = (() => {
    const parts = new Set<string>();
    displayExercises.forEach((ex: any) => {
      if (ex.bodyPart) parts.add(ex.bodyPart);
    });
    return Array.from(parts).sort();
  })();

  const filteredExercises = displayExercises.filter((ex: any) => {
    const matchesSearch =
      debouncedSearch === "" ||
      ex.name.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesBodyPart =
      activeBodyPart === "All" ||
      ex.bodyPart?.toLowerCase() === activeBodyPart.toLowerCase();
    return matchesSearch && matchesBodyPart;
  });

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // Only fetch from DB if we have initial DB exercises
    if (initialExercises.length === 0) return;
    async function fetchFiltered() {
      setIsLoading(true);
      const res = await getExercises(debouncedSearch, activeBodyPart, 100);
      setExercises(res);
      setIsLoading(false);
    }
    fetchFiltered();
  }, [debouncedSearch, activeBodyPart, initialExercises.length]);

  return (
    <>
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
          {(bodyParts.length > 0 ? bodyParts : availableBodyParts).map((bp: string) => (
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
        {isLoading && filteredExercises.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground py-10 font-bold animate-pulse">
            Loading exercises...
          </p>
        ) : filteredExercises.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground py-10 font-bold">
            No exercises found for &quot;{searchQuery || activeBodyPart}&quot;.
          </p>
        ) : (
          filteredExercises.map((ex: any, i: number) => {
            const isExpanded = expandedExercise === ex.id;
            return (
              <motion.div
                key={ex.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass-panel overflow-hidden rounded-3xl flex flex-col cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
                onClick={() => setExpandedExercise(isExpanded ? null : ex.id)}
              >
                <div className="relative aspect-video bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ex.gifUrl}
                    alt={ex.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
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
                    {isExpanded ? "Close Details" : "View Details"}
                    <Info className="w-4 h-4" />
                  </div>

                  {/* Expandable Area */}
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
    </>
  );
}

// ─── Main Component ──────────────────────────────────────────
export default function ExerciseLibraryClient({
  user,
  initialExercises,
  bodyParts,
}: {
  user: any;
  initialExercises: any[];
  bodyParts: string[];
}) {
  const [viewMode, setViewMode] = useState<ViewMode>("splits");

  return (
    <div className="min-h-screen p-4 md:p-8 flex items-start justify-center font-sans tracking-tight">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
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
              <p className="text-xs text-muted-foreground mt-1">
                {viewMode === "splits"
                  ? "Science-based workout splits with video demos."
                  : "Browse all exercises with instructions."}
              </p>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-1 bg-secondary rounded-xl p-1">
            <button
              onClick={() => setViewMode("splits")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === "splits"
                  ? "bg-primary text-primary-foreground shadow-[0_0_12px_rgba(0,229,255,0.3)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> Workout Splits
            </button>
            <button
              onClick={() => setViewMode("library")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === "library"
                  ? "bg-primary text-primary-foreground shadow-[0_0_12px_rgba(0,229,255,0.3)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Full Library
            </button>
          </div>
        </header>

        {/* Content */}
        {viewMode === "splits" ? (
          <SplitsView />
        ) : (
          <FullLibraryView initialExercises={initialExercises} bodyParts={bodyParts} />
        )}
      </div>
    </div>
  );
}
