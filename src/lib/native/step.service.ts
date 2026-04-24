/**
 * Step tracking service — abstraction over native pedometer + manual entry.
 *
 * On native (Capacitor): uses @capgo/capacitor-pedometer for real sensor data.
 * On web: manual-entry-only mode (no accelerometer hack).
 *
 * Daily step data is persisted to localStorage (cross-platform via storage service).
 */

import { isNative } from "./platform";

export type StepSource = "sensor" | "manual" | "health";

export interface DailyStepRecord {
  date: string;        // YYYY-MM-DD
  steps: number;
  distance?: number;   // meters
  source: StepSource;
}

type StepCallback = (steps: number) => void;

// ─── Storage Keys ────────────────────────────────────────────────────
const STEP_KEY_PREFIX = "apex-steps-";
const STEP_GOAL_KEY = "apex-step-goal";
const STEP_HISTORY_KEY = "apex-step-history";
const DEFAULT_GOAL = 10000;

// ─── Date Helpers ────────────────────────────────────────────────────
function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ─── Local Storage (sync — runs only on client) ──────────────────────
function lsGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
}

function lsSet(key: string, val: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, val);
}

// ─── Step Goal ───────────────────────────────────────────────────────
export function getStepGoal(): number {
  const stored = lsGet(STEP_GOAL_KEY);
  if (stored) {
    const parsed = parseInt(stored, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return DEFAULT_GOAL;
}

export function setStepGoal(goal: number) {
  lsSet(STEP_GOAL_KEY, goal.toString());
}

// ─── Today's Steps (localStorage) ───────────────────────────────────
export function getTodayStepsLocal(): number {
  const key = STEP_KEY_PREFIX + todayKey();
  const stored = lsGet(key);
  if (stored) {
    try {
      const record: DailyStepRecord = JSON.parse(stored);
      return record.steps;
    } catch {
      return 0;
    }
  }
  return 0;
}

export function setTodaySteps(steps: number, source: StepSource = "manual") {
  const key = STEP_KEY_PREFIX + todayKey();
  const record: DailyStepRecord = {
    date: todayKey(),
    steps,
    source,
  };
  lsSet(key, JSON.stringify(record));
  updateHistory(record);
}

// ─── History (last 7 days) ──────────────────────────────────────────
function updateHistory(record: DailyStepRecord) {
  const historyStr = lsGet(STEP_HISTORY_KEY);
  let history: DailyStepRecord[] = [];
  if (historyStr) {
    try {
      history = JSON.parse(historyStr);
    } catch { /* ignore */ }
  }

  // Replace or add today's record
  const idx = history.findIndex((r) => r.date === record.date);
  if (idx >= 0) {
    history[idx] = record;
  } else {
    history.push(record);
  }

  // Keep last 7 days only
  history.sort((a, b) => a.date.localeCompare(b.date));
  if (history.length > 7) {
    history = history.slice(-7);
  }

  lsSet(STEP_HISTORY_KEY, JSON.stringify(history));
}

export function getStepHistory(days: number = 7): DailyStepRecord[] {
  const historyStr = lsGet(STEP_HISTORY_KEY);
  if (!historyStr) return [];
  try {
    const history: DailyStepRecord[] = JSON.parse(historyStr);
    return history.slice(-days);
  } catch {
    return [];
  }
}

// ─── Native Pedometer Integration ──────────────────────────────────
let _pedometer: any = null;
let _isTracking = false;
let _listeners: StepCallback[] = [];
let _sessionSteps = 0;
let _baselineSteps = 0;

async function loadPedometer() {
  if (_pedometer) return _pedometer;
  try {
    const mod = await import("@capgo/capacitor-pedometer");
    _pedometer = mod.CapacitorPedometer;
    return _pedometer;
  } catch {
    return null;
  }
}

/**
 * Check if native pedometer hardware is available.
 */
export async function isPedometerAvailable(): Promise<boolean> {
  if (!isNative()) return false;
  try {
    const pedometer = await loadPedometer();
    if (!pedometer) return false;
    const result = await pedometer.isAvailable();
    return result.stepCounting === true;
  } catch {
    return false;
  }
}

/**
 * Request pedometer permissions (Activity Recognition on Android, Motion on iOS).
 */
export async function requestStepPermission(): Promise<boolean> {
  if (!isNative()) return false;
  try {
    const pedometer = await loadPedometer();
    if (!pedometer) return false;
    const result = await pedometer.requestPermissions();
    return result.receive === "granted";
  } catch {
    return false;
  }
}

/**
 * Check if permission is already granted.
 */
export async function checkStepPermission(): Promise<boolean> {
  if (!isNative()) return false;
  try {
    const pedometer = await loadPedometer();
    if (!pedometer) return false;
    const result = await pedometer.checkPermissions();
    return result.receive === "granted";
  } catch {
    return false;
  }
}

/**
 * Start real-time step tracking using native sensors.
 * Calls registered callbacks on each step update.
 */
export async function startTracking(): Promise<boolean> {
  if (_isTracking) return true;
  if (!isNative()) return false;

  try {
    const pedometer = await loadPedometer();
    if (!pedometer) return false;

    // Get baseline from stored steps
    _baselineSteps = getTodayStepsLocal();
    _sessionSteps = 0;

    // Listen for measurement events
    await pedometer.addListener("measurement", (event: any) => {
      const newSteps = event.numberOfSteps || 0;
      _sessionSteps = newSteps;
      const totalSteps = _baselineSteps + _sessionSteps;

      // Persist
      setTodaySteps(totalSteps, "sensor");

      // Notify listeners
      _listeners.forEach((cb) => cb(totalSteps));
    });

    await pedometer.startMeasurementUpdates();
    _isTracking = true;
    return true;
  } catch (err) {
    console.error("[StepService] Failed to start tracking:", err);
    return false;
  }
}

/**
 * Stop real-time step tracking.
 */
export async function stopTracking(): Promise<void> {
  if (!_isTracking) return;
  try {
    const pedometer = await loadPedometer();
    if (pedometer) {
      await pedometer.stopMeasurementUpdates();
      await pedometer.removeAllListeners();
    }
  } catch (err) {
    console.error("[StepService] Failed to stop tracking:", err);
  }
  _isTracking = false;
}

/**
 * Register a callback for real-time step updates.
 * Returns an unsubscribe function.
 */
export function onStepUpdate(callback: StepCallback): () => void {
  _listeners.push(callback);
  return () => {
    _listeners = _listeners.filter((cb) => cb !== callback);
  };
}

/**
 * Whether the pedometer is currently actively tracking.
 */
export function isTracking(): boolean {
  return _isTracking;
}

/**
 * Add steps manually (e.g., user entered from smartwatch).
 * Adds to current total for today.
 */
export function addManualSteps(steps: number): number {
  const current = getTodayStepsLocal();
  const newTotal = current + steps;
  setTodaySteps(newTotal, "manual");
  _listeners.forEach((cb) => cb(newTotal));
  return newTotal;
}

/**
 * Set steps manually to an exact value (override).
 */
export function setManualSteps(steps: number): number {
  setTodaySteps(steps, "manual");
  _baselineSteps = steps;
  _sessionSteps = 0;
  _listeners.forEach((cb) => cb(steps));
  return steps;
}
