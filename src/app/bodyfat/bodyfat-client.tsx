"use client";

import { useState, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Calculator, Save, Loader2, TrendingDown, Activity, Info } from "lucide-react";
import Link from "next/link";
import { calculateBodyFat, saveBodyFatResult } from "@/actions/bodyfat.actions";
import { useToast } from "@/components/toast";

// Lazy-load recharts for history chart
const LazyHistoryChart = lazy(() =>
  import("recharts").then((mod) => ({
    default: ({ data, tooltipContent }: { data: any[]; tooltipContent: React.ReactNode }) => (
      <mod.ResponsiveContainer width="100%" height="100%">
        <mod.AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="bfGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <mod.XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <mod.YAxis domain={["dataMin - 2", "dataMax + 2"]} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <mod.Tooltip content={tooltipContent} />
          <mod.Area
            type="monotone" dataKey="bodyFatPct" name="Body Fat" stroke="#a855f7" strokeWidth={2.5}
            fill="url(#bfGrad)" dot={{ fill: "#a855f7", r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#a855f7", stroke: "#090a0f", strokeWidth: 2 }}
          />
        </mod.AreaChart>
      </mod.ResponsiveContainer>
    ),
  }))
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl text-xs">
      <p className="text-muted-foreground font-medium mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-bold">
          {p.value}%
        </p>
      ))}
    </div>
  );
};

// Category ranges for the visual gauge
const MALE_RANGES = [
  { label: "Essential", max: 6, color: "#ef4444" },
  { label: "Athletes", max: 14, color: "#34d399" },
  { label: "Fitness", max: 18, color: "#60a5fa" },
  { label: "Average", max: 25, color: "#fbbf24" },
  { label: "Obese", max: 45, color: "#ef4444" },
];

const FEMALE_RANGES = [
  { label: "Essential", max: 14, color: "#ef4444" },
  { label: "Athletes", max: 21, color: "#34d399" },
  { label: "Fitness", max: 25, color: "#60a5fa" },
  { label: "Average", max: 32, color: "#fbbf24" },
  { label: "Obese", max: 45, color: "#ef4444" },
];

export default function BodyFatClient({
  user,
  history,
}: {
  user: any;
  history: { date: string; bodyFatPct: number; weight: number }[];
}) {
  const { toast } = useToast();

  // Form state — pre-fill from user profile
  const [gender, setGender] = useState<"MALE" | "FEMALE">(user.gender || "MALE");
  const [age, setAge] = useState(user.age?.toString() || "");
  const [height, setHeight] = useState(user.height?.toString() || "");
  const [weight, setWeight] = useState(user.weight?.toString() || "");
  const [waist, setWaist] = useState("");
  const [neck, setNeck] = useState("");
  const [hip, setHip] = useState("");

  // Result state
  const [result, setResult] = useState<{
    bodyFatPct: number;
    category: string;
    categoryColor: string;
  } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!height || !waist || !neck) {
      toast("Please fill in height, waist, and neck measurements.", "error");
      return;
    }

    if (gender === "FEMALE" && !hip) {
      toast("Hip measurement is required for females.", "error");
      return;
    }

    const waistVal = parseFloat(waist);
    const neckVal = parseFloat(neck);

    if (waistVal <= neckVal) {
      toast("Waist must be larger than neck circumference.", "error");
      return;
    }

    setIsCalculating(true);
    setSaved(false);

    try {
      const res = await calculateBodyFat({
        gender,
        height: parseFloat(height),
        waist: waistVal,
        neck: neckVal,
        hip: hip ? parseFloat(hip) : undefined,
      });
      setResult(res);
    } catch (err: any) {
      toast(err.message || "Calculation failed.", "error");
    }

    setIsCalculating(false);
  };

  const handleSave = async () => {
    if (!result) return;
    setIsSaving(true);

    try {
      const res = await saveBodyFatResult(result.bodyFatPct);
      if (res.success) {
        toast("Body fat result saved to your progress!", "success");
        setSaved(true);
      } else {
        toast(res.error || "Failed to save.", "error");
      }
    } catch {
      toast("Failed to save result.", "error");
    }

    setIsSaving(false);
  };

  const ranges = gender === "MALE" ? MALE_RANGES : FEMALE_RANGES;

  return (
    <div className="min-h-screen p-4 md:p-8 flex items-start justify-center font-sans tracking-tight">
      <div className="max-w-lg w-full pb-24">
        {/* Header */}
        <header className="flex items-center gap-3 mb-8">
          <Link href="/">
            <button className="p-2 rounded-xl bg-secondary hover:bg-secondary/70 transition">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Calculator className="w-6 h-6 text-purple-400" />
              Body Fat Calculator
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">US Navy Method • Accurate Estimation</p>
          </div>
        </header>

        {/* Input Form */}
        <motion.form
          onSubmit={handleCalculate}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl p-6 mb-6"
        >
          {/* Gender Toggle */}
          <div className="mb-6">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Gender</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGender("MALE")}
                className={`py-3 rounded-xl font-bold text-sm transition ${
                  gender === "MALE"
                    ? "bg-primary/10 text-primary border border-primary/30 shadow-[0_0_10px_rgba(0,229,255,0.15)]"
                    : "bg-secondary text-muted-foreground border border-transparent hover:text-foreground"
                }`}
              >
                Male
              </button>
              <button
                type="button"
                onClick={() => setGender("FEMALE")}
                className={`py-3 rounded-xl font-bold text-sm transition ${
                  gender === "FEMALE"
                    ? "bg-purple-500/10 text-purple-400 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.15)]"
                    : "bg-secondary text-muted-foreground border border-transparent hover:text-foreground"
                }`}
              >
                Female
              </button>
            </div>
          </div>

          {/* Measurements Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="25"
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-primary transition"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Height (cm)</label>
              <input
                type="number"
                step="0.1"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="175"
                required
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-primary transition"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="76"
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-primary transition"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Waist (cm) *</label>
              <input
                type="number"
                step="0.1"
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
                placeholder="84"
                required
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-primary transition"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Neck (cm) *</label>
              <input
                type="number"
                step="0.1"
                value={neck}
                onChange={(e) => setNeck(e.target.value)}
                placeholder="38"
                required
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-primary transition"
              />
            </div>
            {gender === "FEMALE" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Hip (cm) *</label>
                <input
                  type="number"
                  step="0.1"
                  value={hip}
                  onChange={(e) => setHip(e.target.value)}
                  placeholder="96"
                  required
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-primary transition"
                />
              </motion.div>
            )}
          </div>

          {/* Info */}
          <div className="flex items-start gap-2 mb-6 text-xs text-muted-foreground bg-secondary/50 p-3 rounded-xl">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
            <p>Measure at the narrowest point of your neck and the widest point of your waist (at navel level). For females, measure hips at the widest point.</p>
          </div>

          {/* Calculate Button */}
          <button
            type="submit"
            disabled={isCalculating}
            className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-primary text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-purple-500/20"
          >
            {isCalculating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Calculator className="w-5 h-5" />
                Calculate Body Fat
              </>
            )}
          </button>
        </motion.form>

        {/* Result Card */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="mb-6"
            >
              <div className="p-1 rounded-2xl bg-gradient-to-r from-purple-500/50 via-primary/30 to-background">
                <div className="bg-card rounded-xl p-6">
                  {/* Result Header */}
                  <div className="text-center mb-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Your Body Fat Percentage</p>
                    <motion.p
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className="text-6xl font-black tracking-tighter"
                    >
                      {result.bodyFatPct}
                      <span className="text-2xl text-muted-foreground font-bold">%</span>
                    </motion.p>
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className={`inline-block mt-2 text-sm font-bold px-3 py-1 rounded-full ${result.categoryColor} ${
                        result.category === "Athletes" ? "bg-emerald-400/10" :
                        result.category === "Fitness" ? "bg-blue-400/10" :
                        result.category === "Average" ? "bg-yellow-400/10" :
                        "bg-red-400/10"
                      }`}
                    >
                      {result.category}
                    </motion.span>
                  </div>

                  {/* Visual Gauge */}
                  <div className="mb-6">
                    <div className="flex rounded-full overflow-hidden h-3 mb-2">
                      {ranges.map((range, i) => {
                        const prevMax = i > 0 ? ranges[i - 1].max : 0;
                        const width = ((range.max - prevMax) / 45) * 100;
                        return (
                          <div
                            key={range.label}
                            style={{ width: `${width}%`, backgroundColor: range.color }}
                            className="relative"
                          >
                            {result.bodyFatPct >= prevMax && result.bodyFatPct < range.max && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-foreground rounded-full border-2 border-background shadow-lg"
                                style={{
                                  left: `${((result.bodyFatPct - prevMax) / (range.max - prevMax)) * 100}%`,
                                  transform: "translate(-50%, -50%)",
                                }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-[9px] text-muted-foreground font-medium px-0.5">
                      {ranges.map((range) => (
                        <span key={range.label}>{range.label}</span>
                      ))}
                    </div>
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={handleSave}
                    disabled={isSaving || saved}
                    className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition ${
                      saved
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-secondary hover:bg-secondary/70 text-foreground"
                    } disabled:opacity-60`}
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : saved ? (
                      <>✓ Saved to Progress</>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Result
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Reference */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-panel rounded-2xl p-6 mb-6"
        >
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" />
            Body Fat Categories ({gender === "MALE" ? "Male" : "Female"})
          </h3>
          <div className="space-y-2.5">
            {ranges.map((range, i) => {
              const prevMax = i > 0 ? ranges[i - 1].max : 0;
              const isActive = result && result.bodyFatPct >= prevMax && result.bodyFatPct < range.max;
              return (
                <div
                  key={range.label}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl transition ${
                    isActive ? "bg-primary/5 border border-primary/20" : ""
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: range.color }}
                    />
                    <span className={`text-sm font-medium ${isActive ? "text-foreground font-bold" : "text-muted-foreground"}`}>
                      {range.label}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    {prevMax}–{range.max}%
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* History Chart */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-panel rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-purple-400" />
                Body Fat Progress
              </h3>
              <span className="text-xs text-muted-foreground">{history.length} readings</span>
            </div>
            <div className="h-48 w-full">
              <Suspense fallback={<div className="w-full h-full bg-secondary/30 rounded-xl animate-pulse" />}>
                <LazyHistoryChart data={history} tooltipContent={<CustomTooltip />} />
              </Suspense>
            </div>

            {/* History Table */}
            <div className="mt-4 pt-4 border-t border-border space-y-2">
              {history.slice().reverse().slice(0, 5).map((entry, i) => (
                <div key={i} className="flex items-center justify-between text-sm px-2">
                  <span className="text-muted-foreground text-xs">{entry.date}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">{entry.weight} kg</span>
                    <span className="font-bold text-purple-400">{entry.bodyFatPct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
