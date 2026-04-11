"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WaterTracker from "@/components/water-tracker";
import { Activity, Flame, Dumbbell, TrendingUp, ChevronUp, BrainCircuit, UserCircle, Trophy, Calculator, BarChart3, Wheat, Droplet, Leaf, Send, Loader2, X } from "lucide-react";
import Link from "next/link";
import { askCoachQuestion } from "@/actions/ai.actions";
import {
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis,
} from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl text-xs">
      <p className="text-muted-foreground font-medium mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-bold">
          {p.value} {p.name === "Calories" ? "kcal" : "kg"}
        </p>
      ))}
    </div>
  );
};

// Animated progress bar component
function AnimatedBar({
  value,
  max,
  color,
  label,
  unit,
}: {
  value: number;
  max: number;
  color: string;
  label: string;
  unit: string;
}) {
  const pct = Math.min((value / max) * 100, 100);

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="text-xs font-bold">
          {value}
          <span className="text-muted-foreground font-normal"> / {max}{unit}</span>
        </span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        />
      </div>
    </div>
  );
}

const r1 = (n: number) => Math.round(n * 10) / 10;

export default function DashboardClient({
  user,
  meals,
  workouts,
  analysis,
  waterMl = 0,
  weightLogs,
}: {
  user: any;
  meals: any[];
  workouts: any[];
  analysis: { adherence: string; insight: string; recommendation: string };
  waterMl?: number;
  weightLogs?: any[];
  newlyUnlocked?: any[];
}) {
  const totalCals = Math.round(meals.reduce((sum, m) => sum + m.calories, 0));
  const totalPro = r1(meals.reduce((sum, m) => sum + m.protein, 0));
  const totalCarbs = r1(meals.reduce((sum, m) => sum + (m.carbs || 0), 0));
  const totalFats = r1(meals.reduce((sum, m) => sum + (m.fats || 0), 0));

  const targetCals = user.targetCalories || 2500;
  const targetPro = user.targetProtein || 180;
  const targetCarbs = user.targetCarbs || 250;
  const targetFats = user.targetFats || 65;

  const totalFiber = r1(meals.reduce((sum, m) => sum + (m.fiber || 0), 0));
  const targetFiber = 30;

  const [weightPeriod, setWeightPeriod] = useState<"1W" | "1M" | "3M">("1M");

  const [coachQuery, setCoachQuery] = useState("");
  const [coachAnswer, setCoachAnswer] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);

  const handleAskCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachQuery.trim()) return;
    setIsAsking(true);
    const ctx = `User target: ${user.targetWeight}kg for ${user.goal}. Intake today: ${totalCals}kcal, Macros: ${totalPro}g P, ${totalCarbs}g C, ${totalFats}g F. Workouts: ${workouts.length}.`;
    const res = await askCoachQuestion(coachQuery, ctx);
    setCoachAnswer(res.answer);
    setCoachQuery("");
    setIsAsking(false);
  };

  const chartData = useMemo(() => {
    if (!weightLogs || weightLogs.length === 0) return [{ name: "Today", weight: user.weight || 0 }];
    const now = new Date().getTime();
    const cutoffDate = new Date();
    
    if (weightPeriod === "1W") cutoffDate.setDate(cutoffDate.getDate() - 7);
    else if (weightPeriod === "1M") cutoffDate.setMonth(cutoffDate.getMonth() - 1);
    else if (weightPeriod === "3M") cutoffDate.setMonth(cutoffDate.getMonth() - 3);

    const cutoff = cutoffDate.getTime();
    const data = weightLogs
      .filter((log) => new Date(log.date).getTime() >= cutoff)
      .map((log: any) => ({
        name: log.date.substring(0, 5),
        weight: log.weight || log.Weight,
      }));

    return data.length > 0 ? data : [{ name: "Today", weight: user.weight || 0 }];
  }, [weightLogs, weightPeriod, user.weight]);

  const [showTrophyModal, setShowTrophyModal] = useState(false);
  const [unlockedBadges, setUnlockedBadges] = useState<any[]>([]);

  // Trigger achievement overlay
  useEffect(() => {
    if (newlyUnlocked && newlyUnlocked.length > 0 && !showTrophyModal && unlockedBadges.length === 0) {
      setUnlockedBadges(newlyUnlocked);
      setShowTrophyModal(true);
    }
  }, [newlyUnlocked, showTrophyModal, unlockedBadges.length]);

  return (
    <div className="min-h-[100dvh] p-4 md:p-8 flex items-start justify-center font-sans tracking-tight">
      <div className="max-w-5xl w-full">
        {/* Trophy Overlay Modal */}
        <AnimatePresence>
          {showTrophyModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/10 via-transparent to-transparent pointer-events-none" />
              
              <motion.div
                initial={{ scale: 0.8, y: 50, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.8, y: 50, opacity: 0 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="bg-card w-full max-w-sm rounded-[2rem] p-6 text-center border-2 border-yellow-500/50 shadow-[0_0_50px_-12px_rgba(234,179,8,0.5)] relative overflow-hidden"
              >
                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-yellow-500/20 to-transparent" />
                
                <h2 className="text-2xl font-black text-yellow-500 tracking-tight uppercase mb-6 relative z-10">
                  Achievement Unlocked!
                </h2>
                
                <div className="space-y-6 relative z-10">
                  {unlockedBadges.map((badge: any, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                      transition={{ delay: i * 0.2 + 0.3, type: "spring" }}
                      className="bg-background rounded-2xl p-4 border border-yellow-500/20 shadow-inner flex flex-col items-center gap-2"
                    >
                      <div className="text-6xl drop-shadow-2xl">{badge.icon}</div>
                      <h3 className="font-bold text-lg">{badge.name}</h3>
                      <p className="text-xs text-muted-foreground">{badge.description}</p>
                    </motion.div>
                  ))}
                </div>

                <button
                  onClick={() => setShowTrophyModal(false)}
                  className="mt-8 w-full py-4 bg-yellow-500 text-yellow-950 font-black rounded-xl hover:bg-yellow-400 transition transform hover:scale-105 active:scale-95"
                >
                  Awesome!
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="flex items-center justify-between mb-8 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 text-primary p-2 rounded-lg">
              <Activity className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Apex<span className="text-primary">Fit</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-medium">{user.name || "Player 1"}</span>
              <span className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                Level {workouts.length + 1} • {user.streakDays} Day Streak <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
              </span>
            </div>
            
            <div className="flex gap-2">
              <Link href="/progress">
                <button className="p-2 bg-secondary rounded-xl hover:bg-secondary/70 transition" title="Progress & Analytics">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </button>
              </Link>
              <Link href="/social">
                <button className="p-2 bg-secondary rounded-xl hover:bg-secondary/70 transition cursor-pointer" title="Leaderboard">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                </button>
              </Link>
            </div>
            <Link href="/profile">
              <UserCircle className="w-10 h-10 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
            </Link>
          </div>
        </header>

        {/* AI Agent Feedback */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-1 rounded-2xl bg-gradient-to-r from-primary/50 via-accent/30 to-background neon-glow"
        >
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
              <span className={`text-xs font-semibold px-2 py-1 rounded-full uppercase tracking-wider ${analysis.adherence.includes("Over") || analysis.adherence.includes("Low") ? "bg-orange-400/10 text-orange-400" : "bg-emerald-400/10 text-emerald-400"}`}>
                {analysis.adherence}
              </span>
            </div>
            
            <div className="flex-1 flex flex-col justify-center gap-4">
              <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Observation</h3>
                <p className="text-foreground text-sm font-medium leading-loose">
                  {analysis.insight}
                </p>
              </div>
              <div className="bg-primary/5 border border-primary/10 p-3 rounded-lg">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Recommendation</h3>
                <p className="text-primary/90 text-sm font-semibold">
                  {analysis.recommendation}
                </p>
              </div>

              {coachAnswer && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-card border border-border p-3 rounded-lg mt-2">
                  <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1"><BrainCircuit className="w-3 h-3 text-primary" /> AI Response</h3>
                  <p className="text-sm font-medium leading-relaxed">{coachAnswer}</p>
                </motion.div>
              )}

              <form onSubmit={handleAskCoach} className="relative mt-2">
                <input
                  type="text"
                  value={coachQuery}
                  onChange={(e) => setCoachQuery(e.target.value)}
                  placeholder="Ask Coach Apex anything..."
                  className="w-full bg-background border border-border rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-primary transition"
                  disabled={isAsking}
                />
                <button
                  type="submit"
                  disabled={isAsking || !coachQuery}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground rounded-lg transition disabled:opacity-50"
                >
                  {isAsking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </div>
          </div>
        </motion.div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
          {[
            {
              label: "Calories",
              value: totalCals.toString(),
              sub: `/ ${targetCals}`,
              icon: Flame,
              color: "text-orange-400",
              bg: "bg-orange-400/10",
            },
            {
              label: "Protein",
              value: `${totalPro}g`,
              sub: `/ ${targetPro}g`,
              icon: Activity,
              color: "text-blue-400",
              bg: "bg-blue-400/10",
            },
            {
              label: "Carbs",
              value: `${totalCarbs}g`,
              sub: `/ ${targetCarbs}g`,
              icon: Wheat,
              color: "text-yellow-400",
              bg: "bg-yellow-400/10",
            },
            {
              label: "Fats",
              value: `${totalFats}g`,
              sub: `/ ${targetFats}g`,
              icon: Droplet,
              color: "text-emerald-400",
              bg: "bg-emerald-400/10",
            },
            {
              label: "Fiber",
              value: `${totalFiber}g`,
              sub: `/ ${targetFiber}g`,
              icon: Leaf,
              color: "text-green-400",
              bg: "bg-green-400/10",
            },
            {
              label: "Weight",
              value: `${user.weight}kg`,
              sub: `Tgt ${user.targetWeight || "-"}kg`,
              icon: TrendingUp,
              color: "text-purple-400",
              bg: "bg-purple-400/10",
            },
            {
              label: "Workouts",
              value: workouts.length.toString(),
              sub: "Recent",
              icon: Dumbbell,
              color: "text-primary",
              bg: "bg-primary/10",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel rounded-2xl p-4 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
                <div className={`p-1.5 rounded-lg ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold tracking-tight">{stat.value}</span>
                <span className="text-[10px] text-muted-foreground truncate">{stat.sub}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Weight Trend Chart */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 glass-panel rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold tracking-tight">
                {user.goal.replace(/_/g, " ")} Progression
              </h3>
              <div className="flex gap-2">
                <span 
                  onClick={() => setWeightPeriod("1W")}
                  className={`text-xs font-medium px-2 py-1 rounded cursor-pointer transition ${weightPeriod === "1W" ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(0,229,255,0.4)]" : "bg-secondary text-foreground hover:bg-secondary/80"}`}
                >
                  1W
                </span>
                <span 
                  onClick={() => setWeightPeriod("1M")}
                  className={`text-xs font-medium px-2 py-1 rounded cursor-pointer transition ${weightPeriod === "1M" ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(0,229,255,0.4)]" : "bg-secondary text-foreground hover:bg-secondary/80"}`}
                >
                  1M
                </span>
                <span 
                  onClick={() => setWeightPeriod("3M")}
                  className={`text-xs font-medium px-2 py-1 rounded cursor-pointer transition ${weightPeriod === "3M" ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(0,229,255,0.4)]" : "bg-secondary text-foreground hover:bg-secondary/80"}`}
                >
                  3M
                </span>
              </div>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00e5ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="weight"
                    name="Weight"
                    stroke="#00e5ff"
                    strokeWidth={2}
                    fill="url(#dashGrad)"
                    dot={false}
                    activeDot={{ r: 5, fill: "#00e5ff", stroke: "#090a0f", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {/* Weight indicator */}
            <div className="flex items-center justify-end gap-2 mt-2">
              <ChevronUp className="w-3 h-3 text-emerald-400" />
              <span className="text-xs text-muted-foreground">{user.weight} kg current</span>
            </div>
          </motion.div>

          {/* Water Tracker */}
          <WaterTracker initialMl={waterMl} />

          {/* Quick Actions / Checklist */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="glass-panel rounded-2xl p-6 flex flex-col"
          >
            <h3 className="text-lg font-semibold tracking-tight mb-4">Daily Actions</h3>
            <div className="space-y-4 flex-1">
              <Link
                href="/diet"
                className="w-full text-left px-4 py-3 rounded-xl bg-secondary hover:bg-secondary/70 transition flex items-center justify-between group"
              >
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
                {totalCals > 0 && (
                  <div className="w-2 h-2 rounded-full bg-emerald-400" title="Started" />
                )}
              </Link>

              <Link
                href="/workout"
                className="w-full text-left px-4 py-3 rounded-xl bg-secondary hover:bg-secondary/70 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-background rounded-full group-hover:bg-primary/20 transition text-primary">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-medium text-sm block">Start Workout</span>
                    <span className="text-[10px] text-muted-foreground">
                      {workouts.length > 0 ? `${workouts.length} recent sessions` : "No recent workouts"}
                    </span>
                  </div>
                </div>
                {workouts.length > 0 && (
                  <div className="w-2 h-2 rounded-full bg-emerald-400" title="Active" />
                )}
              </Link>

              <Link
                href="/progress"
                className="w-full text-left px-4 py-3 rounded-xl bg-secondary hover:bg-secondary/70 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-background rounded-full group-hover:bg-primary/20 transition text-emerald-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-medium text-sm block">View Progress</span>
                    <span className="text-[10px] text-muted-foreground">Charts & analytics</span>
                  </div>
                </div>
              </Link>

              <Link
                href="/bodyfat"
                className="w-full text-left px-4 py-3 rounded-xl bg-secondary hover:bg-secondary/70 transition flex items-center justify-between group"
              >
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

              <Link
                href="/reports"
                className="w-full text-left px-4 py-3 rounded-xl bg-secondary hover:bg-secondary/70 transition flex items-center justify-between group"
              >
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
              <Link
                href="/exercises"
                className="w-full text-left px-4 py-3 rounded-xl bg-secondary hover:bg-secondary/70 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-background rounded-full group-hover:bg-primary/20 transition text-pink-400">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-medium text-sm block">Exercise Library</span>
                    <span className="text-[10px] text-muted-foreground">Animated instructional GIFs</span>
                  </div>
                </div>
              </Link>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
