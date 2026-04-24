"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Footprints, Play, Pause, Edit3, Check, Settings2, X, AlertTriangle } from "lucide-react";
import {
  getTodayStepsLocal,
  getStepGoal,
  setStepGoal,
  setManualSteps,
  addManualSteps,
  onStepUpdate,
  startTracking,
  stopTracking,
  isTracking,
  isPedometerAvailable,
  requestStepPermission,
  checkStepPermission,
  getStepHistory,
  type DailyStepRecord,
} from "@/lib/native/step.service";
import { isNative } from "@/lib/native/platform";

// ─── SVG Ring Constants ─────────────────────────────────────────────
const RING_SIZE = 120;
const RING_STROKE = 8;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function StepCounter() {
  const [steps, setSteps] = useState(0);
  const [goal, setGoal] = useState(10000);
  const [tracking, setTracking] = useState(false);
  const [sensorAvailable, setSensorAvailable] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [editGoalStr, setEditGoalStr] = useState("");
  const [manualStepsStr, setManualStepsStr] = useState("");
  const [history, setHistory] = useState<DailyStepRecord[]>([]);
  const [pulseKey, setPulseKey] = useState(0);
  const prevStepsRef = useRef(0);

  // ─── Initialize ───────────────────────────────────────────────────
  useEffect(() => {
    // Load stored values
    setSteps(getTodayStepsLocal());
    setGoal(getStepGoal());
    setHistory(getStepHistory(7));

    // Check native capabilities
    const checkNative = async () => {
      const available = await isPedometerAvailable();
      setSensorAvailable(available);
      if (available) {
        const granted = await checkStepPermission();
        setPermissionGranted(granted);
      }
    };
    checkNative();

    // Subscribe to real-time step updates
    const unsub = onStepUpdate((newSteps) => {
      setSteps(newSteps);
      setPulseKey((k) => k + 1); // trigger pulse animation
    });

    // Check if already tracking (e.g., after page navigation)
    setTracking(isTracking());

    return () => {
      unsub();
    };
  }, []);

  // Update history when steps change
  useEffect(() => {
    if (steps !== prevStepsRef.current && steps > 0) {
      prevStepsRef.current = steps;
      setHistory(getStepHistory(7));
    }
  }, [steps]);

  // ─── Handlers ─────────────────────────────────────────────────────
  const handleToggleTracking = useCallback(async () => {
    if (tracking) {
      await stopTracking();
      setTracking(false);
    } else {
      // Request permission if needed
      if (!permissionGranted) {
        const granted = await requestStepPermission();
        setPermissionGranted(granted);
        if (!granted) return;
      }
      const success = await startTracking();
      setTracking(success);
    }
  }, [tracking, permissionGranted]);

  const handleSaveGoal = () => {
    const parsed = parseInt(editGoalStr, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setStepGoal(parsed);
      setGoal(parsed);
    }
    setIsEditing(false);
  };

  const handleManualEntry = () => {
    const parsed = parseInt(manualStepsStr, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      const newTotal = setManualSteps(parsed);
      setSteps(newTotal);
    }
    setIsManualEntry(false);
    setManualStepsStr("");
  };

  const handleOpenEdit = () => {
    setEditGoalStr(goal.toString());
    setIsEditing(true);
  };

  // ─── Derived values ───────────────────────────────────────────────
  const pct = Math.min(steps / goal, 1);
  const offset = RING_CIRCUMFERENCE * (1 - pct);
  const formattedSteps = steps.toLocaleString();
  const formattedGoal = goal.toLocaleString();
  const native = isNative();

  // History max for bar chart scaling
  const historyMax = Math.max(...history.map((h) => h.steps), goal, 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-2xl p-4 relative overflow-hidden"
    >
      {/* Subtle background glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none"
        animate={{ opacity: pct > 0 ? 1 : 0.3 }}
        transition={{ duration: 0.8 }}
      />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Footprints className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm">Step Counter</h3>
          </div>
          <div className="flex items-center gap-1">
            {/* Settings gear */}
            <button
              onClick={isEditing ? () => setIsEditing(false) : handleOpenEdit}
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-400 transition"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Circular Progress Ring + Step Count */}
        <div className="flex flex-col items-center mb-3">
          <div className="relative">
            <svg
              width={RING_SIZE}
              height={RING_SIZE}
              className="transform -rotate-90"
            >
              {/* Background ring */}
              <circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                fill="none"
                stroke="currentColor"
                strokeWidth={RING_STROKE}
                className="text-secondary"
              />
              {/* Progress ring */}
              <motion.circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                fill="none"
                strokeWidth={RING_STROKE}
                strokeLinecap="round"
                stroke="url(#stepGradient)"
                strokeDasharray={RING_CIRCUMFERENCE}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              <defs>
                <linearGradient
                  id="stepGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#4ade80" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.button
                key={pulseKey}
                animate={pulseKey > 0 ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
                onClick={() => {
                  setManualStepsStr(steps.toString());
                  setIsManualEntry(true);
                }}
                className="flex flex-col items-center hover:text-emerald-400 transition cursor-pointer"
                title="Tap to edit steps manually"
              >
                <span className="text-xl font-bold tracking-tight leading-none">
                  {formattedSteps}
                </span>
                <span className="text-[9px] text-muted-foreground mt-0.5">
                  steps
                </span>
              </motion.button>
            </div>
          </div>

          {/* Goal & Percentage */}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] text-muted-foreground">
              / {formattedGoal} goal
            </span>
            <span className="text-xs font-bold text-emerald-400">
              {Math.round(pct * 100)}%
            </span>
          </div>
        </div>

        {/* Native Sensor Controls */}
        {native && sensorAvailable && (
          <div className="mb-3">
            <button
              onClick={handleToggleTracking}
              className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                tracking
                  ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
              }`}
            >
              {tracking ? (
                <>
                  <Pause className="w-3.5 h-3.5" /> Stop Tracking
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" /> Start Tracking
                </>
              )}
            </button>
          </div>
        )}

        {/* Web-only: Manual entry button */}
        {!native && !isManualEntry && !isEditing && (
          <div className="mb-3">
            <button
              onClick={() => {
                setManualStepsStr(steps.toString());
                setIsManualEntry(true);
              }}
              className="w-full py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition flex items-center justify-center gap-2"
            >
              <Edit3 className="w-3.5 h-3.5" /> Enter Steps
            </button>
          </div>
        )}

        {/* Permission not granted warning (native only) */}
        {native && sensorAvailable && !permissionGranted && !isEditing && (
          <div className="mb-3 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="text-[10px] text-amber-300">
              Motion permission needed for step tracking
            </span>
          </div>
        )}

        {/* Manual Entry Panel */}
        <AnimatePresence>
          {isManualEntry && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-3 border-t border-emerald-500/20">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
                  Enter Step Count
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={manualStepsStr}
                    onChange={(e) => setManualStepsStr(e.target.value)}
                    placeholder="e.g. 8500"
                    className="flex-1 bg-secondary border border-emerald-500/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleManualEntry()}
                  />
                  <button
                    onClick={handleManualEntry}
                    className="px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Set
                  </button>
                  <button
                    onClick={() => setIsManualEntry(false)}
                    className="px-2 py-2 rounded-lg text-muted-foreground hover:bg-secondary transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings Panel */}
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-3 border-t border-emerald-500/20">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
                  Daily Step Goal
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={editGoalStr}
                    onChange={(e) => setEditGoalStr(e.target.value)}
                    className="flex-1 bg-secondary border border-emerald-500/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleSaveGoal()}
                  />
                  <button
                    onClick={handleSaveGoal}
                    className="px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-2 py-2 rounded-lg text-muted-foreground hover:bg-secondary transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 7-Day Mini History Bar Chart */}
        {history.length > 1 && !isEditing && !isManualEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pt-3 border-t border-emerald-500/10 mt-3"
          >
            <p className="text-[10px] text-muted-foreground font-semibold mb-2 uppercase tracking-wider">
              Last 7 Days
            </p>
            <div className="flex items-end gap-1 h-10">
              {history.map((day, i) => {
                const barPct = Math.max((day.steps / historyMax) * 100, 4);
                const isToday = day.date === new Date().toISOString().slice(0, 10);
                return (
                  <motion.div
                    key={day.date}
                    initial={{ height: 0 }}
                    animate={{ height: `${barPct}%` }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className={`flex-1 rounded-sm ${
                      isToday
                        ? "bg-gradient-to-t from-emerald-500 to-green-400"
                        : "bg-emerald-500/20"
                    }`}
                    title={`${day.date}: ${day.steps.toLocaleString()} steps`}
                  />
                );
              })}
            </div>
            <div className="flex gap-1 mt-1">
              {history.map((day) => {
                const dayLabel = new Date(day.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "narrow" });
                return (
                  <span
                    key={day.date + "-label"}
                    className="flex-1 text-center text-[8px] text-muted-foreground"
                  >
                    {dayLabel}
                  </span>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
