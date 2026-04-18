"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Check, Loader2, Dumbbell, ChevronDown, Timer as TimerIcon, X, Play, Pause, RotateCcw, TrendingUp, Save, Trophy } from "lucide-react";
import Link from "next/link";
import { logWorkout, saveWorkoutTemplate, deleteWorkoutTemplate } from "@/actions/workout.actions";
import { useRouter } from "next/navigation";
import ExerciseAutocomplete from "@/components/exercise-autocomplete";
import { useToast } from "@/components/toast";

const WORKOUT_TEMPLATES = [
  { name: "Push Day", exercises: ["Barbell Bench Press", "Incline Dumbbell Press", "Cable Flyes", "Overhead Press", "Lateral Raises", "Tricep Pushdown"] },
  { name: "Pull Day", exercises: ["Barbell Rows", "Pull Ups", "Face Pulls", "Barbell Curl", "Hammer Curls", "Rear Delt Flyes"] },
  { name: "Leg Day", exercises: ["Barbell Squats", "Romanian Deadlift", "Leg Press", "Leg Curls", "Calf Raises", "Walking Lunges"] },
  { name: "Upper Body", exercises: ["Bench Press", "Overhead Press", "Barbell Rows", "Pull Ups", "Lateral Raises", "Barbell Curl"] },
  { name: "Lower Body", exercises: ["Squats", "Deadlift", "Bulgarian Split Squat", "Leg Extensions", "Hip Thrusts", "Calf Raises"] },
  { name: "Full Body", exercises: ["Deadlift", "Bench Press", "Squats", "Pull Ups", "Overhead Press", "Barbell Rows"] },
  { name: "Custom", exercises: [] },
];

const REST_PRESETS = [60, 90, 120, 180];

type ExerciseEntry = {
  id: number;
  name: string;
  sets: { id: number; weight: number; reps: number; done: boolean }[];
};

type PreviousData = Record<string, { weight: number; reps: number; sets: number }>;

// ─── Confetti Burst (lazy-loaded) ───
function fireCelebration() {
  import("canvas-confetti").then((mod) => {
    const confetti = mod.default;
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ["#00e5ff", "#22d3ee", "#34d399", "#fbbf24"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ["#00e5ff", "#22d3ee", "#34d399", "#fbbf24"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  });
}

// ─── Rest Timer Component ───
function RestTimer({ onClose }: { onClose: () => void }) {
  const [duration, setDuration] = useState(90);
  const [remaining, setRemaining] = useState(90);
  const [isRunning, setIsRunning] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const reset = useCallback((newDuration?: number) => {
    const d = newDuration ?? duration;
    setDuration(d);
    setRemaining(d);
    setIsRunning(true);
  }, [duration]);

  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (typeof navigator !== "undefined" && navigator.vibrate) {
              navigator.vibrate([200, 100, 200, 100, 200]);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, remaining]);

  const pct = remaining / duration;
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <motion.div
      initial={{ opacity: 0, y: 80 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 80 }}
      className="fixed bottom-20 left-0 right-0 z-40 flex justify-center px-4"
    >
      <div className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl p-5 shadow-2xl shadow-primary/10 max-w-sm w-full relative">
        <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-lg hover:bg-secondary transition text-muted-foreground">
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 mb-4">
          <TimerIcon className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Rest Timer</span>
        </div>
        <div className="flex justify-center mb-4">
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
              <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
              <motion.circle cx="60" cy="60" r={r} fill="none" stroke={remaining === 0 ? "#34d399" : "#00e5ff"} strokeWidth="6" strokeLinecap="round" strokeDasharray={circ} animate={{ strokeDashoffset: offset }} transition={{ duration: 0.3 }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold font-mono tabular-nums ${remaining === 0 ? "text-emerald-400" : ""}`}>{mins}:{secs.toString().padStart(2, "0")}</span>
              {remaining === 0 && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-emerald-400 font-semibold mt-1">GO TIME!</motion.span>}
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-3 mb-4">
          {isRunning ? (
            <button onClick={pause} className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/70 transition"><Pause className="w-5 h-5" /></button>
          ) : (
            <button onClick={start} className="p-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition"><Play className="w-5 h-5" /></button>
          )}
          <button onClick={() => reset()} className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/70 transition"><RotateCcw className="w-5 h-5" /></button>
        </div>
        <div className="flex gap-2 justify-center">
          {REST_PRESETS.map((t) => (
            <button key={t} onClick={() => reset(t)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${duration === t && remaining > 0 ? "bg-primary/10 text-primary border border-primary/30" : "bg-secondary text-muted-foreground hover:text-foreground border border-transparent"}`}>
              {t >= 60 ? `${Math.floor(t / 60)}:${(t % 60).toString().padStart(2, "0")}` : `${t}s`}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Workout Component ───
export default function WorkoutLoggerClient({
  user,
  previousData,
  dbTemplates = [],
  initialTemplateName,
  initialTemplateId,
}: {
  user: any;
  previousData: PreviousData;
  dbTemplates?: any[];
  initialTemplateName?: string;
  initialTemplateId?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [workoutName, setWorkoutName] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [nextId, setNextId] = useState(100);

  // Template-first view: start with no exercises, user must pick a template
  const [hasSelectedTemplate, setHasSelectedTemplate] = useState(false);

  // Stopwatch state — does NOT auto-start
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSecs, setElapsedSecs] = useState(0);

  useEffect(() => {
    if (!workoutStarted || !startTime) return;
    const interval = setInterval(() => {
      setElapsedSecs(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [workoutStarted, startTime]);

  const handleStartWorkout = () => {
    setWorkoutStarted(true);
    setStartTime(Date.now());
  };

  const formatElapsed = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);

  const selectTemplate = (template: (typeof WORKOUT_TEMPLATES)[0]) => {
    setWorkoutName(template.name === "Custom" ? "" : template.name);
    let id = nextId;
    if (template.exercises.length > 0) {
      const newExercises: ExerciseEntry[] = template.exercises.map((name) => {
        const prev = previousData[name];
        const ex: ExerciseEntry = {
          id: id++, name,
          sets: [
            { id: id++, weight: prev?.weight || 0, reps: prev?.reps || 10, done: false },
            { id: id++, weight: prev?.weight || 0, reps: prev?.reps || 10, done: false },
            { id: id++, weight: prev?.weight || 0, reps: prev?.reps || 10, done: false },
          ],
        };
        return ex;
      });
      setNextId(id);
      setExercises(newExercises);
    } else {
      // Custom template — start with one empty exercise
      setExercises([{
        id: id++, name: "",
        sets: [
          { id: id++, weight: 0, reps: 10, done: false },
          { id: id++, weight: 0, reps: 10, done: false },
          { id: id++, weight: 0, reps: 10, done: false },
        ],
      }]);
      setNextId(id);
    }
    setHasSelectedTemplate(true);
    setShowTemplates(false);
  };

  const addExercise = () => {
    let id = nextId;
    setExercises([...exercises, {
      id: id++, name: "",
      sets: [
        { id: id++, weight: 0, reps: 10, done: false },
        { id: id++, weight: 0, reps: 10, done: false },
        { id: id++, weight: 0, reps: 10, done: false },
      ],
    }]);
    setNextId(id);
  };

  const removeExercise = (exId: number) => {
    if (exercises.length <= 1) return;
    setExercises(exercises.filter((e) => e.id !== exId));
  };

  const updateExerciseName = (exId: number, name: string) => {
    setExercises(exercises.map((e) => (e.id === exId ? { ...e, name } : e)));
  };

  const addSet = (exId: number) => {
    const id = nextId;
    setNextId(id + 1);
    setExercises(exercises.map((e) => e.id === exId ? { ...e, sets: [...e.sets, { id, weight: 0, reps: 10, done: false }] } : e));
  };

  const toggleSet = (exId: number, setId: number) => {
    const exercise = exercises.find((e) => e.id === exId);
    const set = exercise?.sets.find((s) => s.id === setId);
    setExercises(exercises.map((e) => e.id === exId ? { ...e, sets: e.sets.map((s) => (s.id === setId ? { ...s, done: !s.done } : s)) } : e));
    if (set && !set.done) setShowTimer(true);
  };

  const updateSet = (exId: number, setId: number, field: "weight" | "reps", value: number) => {
    setExercises(exercises.map((e) => e.id === exId ? { ...e, sets: e.sets.map((s) => (s.id === setId ? { ...s, [field]: value } : s)) } : e));
  };

  const totalCompletedSets = exercises.reduce((sum, ex) => sum + ex.sets.filter((s) => s.done).length, 0);
  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);

  const handleCompleteWorkout = async () => {
    if (totalCompletedSets === 0) return;
    const validExercises = exercises.filter((ex) => ex.name.trim() && ex.sets.some((s) => s.done));
    if (validExercises.length === 0) return;

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", workoutName || "Custom Workout");
      const payload = validExercises.map((ex) => {
        const done = ex.sets.filter((s) => s.done);
        return {
          name: ex.name,
          sets: done.length,
          reps: Math.round(done.reduce((sum, s) => sum + s.reps, 0) / done.length),
          weight: done.reduce((max, s) => Math.max(max, s.weight), 0),
        };
      });
      formData.append("exercises", JSON.stringify(payload));
      await logWorkout(formData);

      toast("Workout logged successfully! Great job.", "success");

      // 🎉 Celebration!
      fireCelebration();
      await new Promise((r) => setTimeout(r, 1800));
      router.push("/");
    } catch (e) {
      console.error(e);
      toast("Failed to log workout.", "error");
      setIsSaving(false);
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!workoutName || workoutName === "Custom Workout") {
      toast("Give your workout a name first!", "error");
      return;
    }
    const validExercises = exercises.filter((ex) => ex.name.trim());
    if (validExercises.length === 0) return;

    try {
      await saveWorkoutTemplate(workoutName, validExercises.map(ex => ex.name));
      toast("Saved as template!", "success");
    } catch (e) {
      console.error(e);
      toast("Error saving template", "error");
    }
  };

  const handleDeleteTemplate = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteWorkoutTemplate(id);
      toast("Template deleted.", "success");
    } catch {
      toast("Could not delete template.", "error");
    }
  };

  // Helper: get previous data for an exercise
  const getPrev = (name: string) => previousData[name] || null;

  useEffect(() => {
    // If a template is passed in, initialize it!
    if (initialTemplateName) {
      if (initialTemplateName === "Custom") {
        setWorkoutName("");
        let id = nextId + 1;
        setExercises([{
          id, name: "",
          sets: [
            { id: id + 1, weight: 0, reps: 10, done: false },
            { id: id + 2, weight: 0, reps: 10, done: false },
            { id: id + 3, weight: 0, reps: 10, done: false },
          ],
        }]);
        setNextId(id + 4);
      } else {
        const template = WORKOUT_TEMPLATES.find(t => t.name === initialTemplateName) || dbTemplates?.find((t: any) => t.name === initialTemplateName);
        if (template) selectTemplate(template);
      }
    } else if (initialTemplateId && dbTemplates) {
      const template = dbTemplates.find((t: any) => t.id === initialTemplateId);
      if (template) selectTemplate(template);
    }
  }, [initialTemplateName, initialTemplateId, dbTemplates]);

  // If waiting to initialize, show nothing or skeleton
  if (!exercises.length && (initialTemplateName || initialTemplateId)) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }


  // ─── Main Workout View (after template selected) ───
  return (
    <div className="min-h-screen p-4 md:p-8 flex justify-center font-sans tracking-tight">
      <div className="max-w-md w-full pb-24">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <Link href="/">
            <button className="p-2 rounded-xl bg-secondary hover:bg-secondary/70 transition">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
          </Link>
          <div className="flex-1 mx-4 flex flex-col items-center justify-center relative">
            <div className="flex items-center gap-1 group w-full justify-center">
              <input
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                className="text-xl font-bold tracking-tight bg-transparent text-center focus:outline-none w-3/4 min-w-[100px] border-b border-transparent focus:border-border transition-colors pb-0.5"
                placeholder="Name your workout"
              />
              <button onClick={() => setShowTemplates(!showTemplates)} className="hover:opacity-80 transition text-muted-foreground p-1 bg-secondary rounded-full">
                <ChevronDown className={`w-4 h-4 transition-transform ${showTemplates ? "rotate-180" : ""}`} />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{totalCompletedSets}/{totalSets} sets completed</p>
          </div>
          <div className="flex items-center gap-1">
            {/* Stopwatch — user-controlled */}
            {workoutStarted ? (
              <div className="px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-mono font-bold text-primary mr-2 flex items-center gap-1.5 shadow-inner">
                <TimerIcon className="w-3.5 h-3.5" />
                {formatElapsed(elapsedSecs)}
              </div>
            ) : (
              <button
                onClick={handleStartWorkout}
                className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/30 text-xs font-bold mr-2 flex items-center gap-1.5 hover:bg-primary/20 transition"
              >
                <Play className="w-3.5 h-3.5" />
                Start
              </button>
            )}
            <button onClick={() => setShowTimer(!showTimer)} className={`p-2 rounded-xl transition ${showTimer ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-secondary"}`} title="Rest timer">
              <TimerIcon className="w-5 h-5" />
            </button>
            <button onClick={addExercise} className="p-2 rounded-xl text-primary bg-primary/10 hover:bg-primary/20 transition" title="Add exercise">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Template Selector */}
        <AnimatePresence>
          {showTemplates && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Templates</span>
                <button onClick={handleSaveAsTemplate} className="text-[10px] flex items-center gap-1 font-bold bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20 transition">
                  <Save className="w-3 h-3" /> Save Current
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[...dbTemplates, ...WORKOUT_TEMPLATES].map((t, idx) => (
                  <div key={`${t.name}-${idx}`} className={`relative text-left p-3 rounded-xl border transition text-sm ${workoutName === t.name ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:border-muted-foreground"}`}>
                    <button onClick={() => selectTemplate(t)} className="w-full text-left">
                      <p className="font-semibold pr-6 truncate">{t.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{t.exercises.length > 0 ? `${t.exercises.length} exercises` : "Build your own"}</p>
                    </button>
                    {t.id && (
                      <button onClick={(e) => handleDeleteTemplate(e, t.id)} className="absolute top-2 right-2 text-muted-foreground hover:text-red-400 p-1 bg-background/80 rounded-md backdrop-blur-sm transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Coach Feedback */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-primary/20 rounded-2xl p-4 mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary neon-glow" />
          <div className="flex gap-3 pl-2">
            <p className="text-sm text-foreground/90 leading-relaxed">
              <strong className="text-primary">Coach AI:</strong> Focus on progressive overload. Try to beat your previous session by adding weight or reps. Rest 2-3 min between heavy compounds.
            </p>
          </div>
        </motion.div>

        {/* Exercises */}
        <div className="space-y-4">
          {exercises.map((exercise, exIdx) => {
            const prev = getPrev(exercise.name);
            return (
              <motion.div key={exercise.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: exIdx * 0.05 }} className="glass-panel rounded-2xl p-1 overflow-hidden">
                {/* Exercise Header */}
                <div className="p-3 border-b border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">{exIdx + 1}</div>
                    <div className="flex-1">
                      <ExerciseAutocomplete
                        value={exercise.name}
                        onChange={(val) => updateExerciseName(exercise.id, val)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-1">
                    <button onClick={() => addSet(exercise.id)} className="px-2 py-1 rounded border border-border text-[10px] uppercase font-bold tracking-widest text-primary hover:bg-primary/10 transition">Add Set</button>
                    {exercises.length > 1 && (
                      <button onClick={() => removeExercise(exercise.id)} className="px-2 py-1 rounded border border-border text-[10px] uppercase font-bold tracking-widest text-red-400 hover:bg-red-500/10 transition">Remove</button>
                    )}
                  </div>
                </div>

                {/* Sets Header */}
                <div className="flex items-center gap-2 px-3 pt-2 pb-1 text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                  <div className="w-8 text-center">Set</div>
                  <div className="flex-1 text-center">Prev</div>
                  <div className="w-16 text-center">kg</div>
                  <div className="w-16 text-center">Reps</div>
                  <div className="w-10 text-center">✓</div>
                </div>

                {/* Sets */}
                <div className="px-2 pb-2 space-y-1">
                  {exercise.sets.map((s, setIdx) => {
                    const beatingPrev = prev && s.done && (s.weight > prev.weight || (s.weight === prev.weight && s.reps > prev.reps));
                    return (
                      <div key={s.id} className={`flex items-center gap-2 p-1.5 rounded-xl transition ${s.done ? "bg-emerald-500/10" : "bg-transparent"}`}>
                        <div className="w-8 text-center text-xs font-semibold text-muted-foreground">{setIdx + 1}</div>
                        <div className="flex-1 text-xs text-center">
                          {prev ? (
                            <span className="text-muted-foreground font-mono">
                              {prev.weight}×{prev.reps}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/40">—</span>
                          )}
                        </div>
                        <input type="number" value={s.weight || ""} onChange={(e) => updateSet(exercise.id, s.id, "weight", Number(e.target.value))} placeholder="0" className={`w-16 bg-background border ${s.done ? "border-emerald-500/30" : "border-border"} rounded-lg py-1.5 px-2 text-center text-sm font-bold focus:outline-none focus:border-primary`} />
                        <input type="number" value={s.reps || ""} onChange={(e) => updateSet(exercise.id, s.id, "reps", Number(e.target.value))} placeholder="0" className={`w-16 bg-background border ${s.done ? "border-emerald-500/30" : "border-border"} rounded-lg py-1.5 px-2 text-center text-sm font-bold focus:outline-none focus:border-primary`} />
                        <button onClick={() => toggleSet(exercise.id, s.id)} className={`w-10 h-8 flex items-center justify-center rounded-lg transition ${s.done ? "bg-emerald-500 text-background" : "bg-secondary text-muted-foreground hover:bg-primary/20 hover:text-primary"}`}>
                          {beatingPrev ? <TrendingUp className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}

          <button onClick={addExercise} className="w-full py-3 border-2 border-dashed border-border rounded-2xl text-muted-foreground hover:border-primary hover:text-primary transition flex items-center justify-center gap-2 text-sm font-medium">
            <Plus className="w-4 h-4" /> Add Exercise
          </button>
        </div>

        {/* Complete Button */}
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pointer-events-none z-30">
          <div className="max-w-md mx-auto pointer-events-auto">
            <button onClick={handleCompleteWorkout} disabled={isSaving || totalCompletedSets === 0} className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 neon-glow disabled:opacity-30 disabled:cursor-not-allowed transition shadow-lg shadow-primary/20">
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Dumbbell className="w-5 h-5" /> Complete Workout ({totalCompletedSets}/{totalSets} sets)</>}
            </button>
          </div>
        </div>

        {/* Rest Timer */}
        <AnimatePresence>{showTimer && <RestTimer onClose={() => setShowTimer(false)} />}</AnimatePresence>

      </div>
    </div>
  );
}
