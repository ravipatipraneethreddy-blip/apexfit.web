"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Flame, Drumstick, Wheat, Droplets, TrendingUp, Target, Award, Utensils } from "lucide-react";
import Link from "next/link";
import {
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";

const COLORS = ["#60a5fa", "#f97316", "#34d399", "#a78bfa"];

function StatCard({ label, value, unit, icon: Icon, color }: { label: string; value: number | string; unit?: string; icon: any; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-4 rounded-2xl"
    >
      <div className="flex items-center gap-2 mb-1">
        <div className={`p-1.5 rounded-lg ${color}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{label}</span>
      </div>
      <p className="text-2xl font-bold">
        {value}
        {unit && <span className="text-sm text-muted-foreground font-normal ml-1">{unit}</span>}
      </p>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl text-xs">
      <p className="text-muted-foreground font-medium mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-bold">
          {Math.round(p.value)} {p.name === "calories" ? "kcal" : "g"}
        </p>
      ))}
    </div>
  );
};

export default function ReportsClient({ user, weeklyReport, monthlyReport }: { user: any; weeklyReport: any; monthlyReport: any }) {
  const [period, setPeriod] = useState<"week" | "month">("week");
  const report = period === "week" ? weeklyReport : monthlyReport;

  if (!report) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No data yet. Start logging meals!</p>
          <Link href="/diet" className="text-primary font-bold mt-2 inline-block">Go to Diet →</Link>
        </div>
      </div>
    );
  }

  const macroData = [
    { name: "Protein", value: report.avgProtein, color: "#60a5fa" },
    { name: "Carbs", value: report.avgCarbs, color: "#f97316" },
    { name: "Fats", value: report.avgFats, color: "#34d399" },
  ].filter((d) => d.value > 0);

  return (
    <div className="min-h-screen p-4 md:p-8 flex justify-center font-sans tracking-tight pb-24">
      <div className="max-w-lg w-full">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <Link href="/">
            <button className="p-2 rounded-xl bg-secondary hover:bg-secondary/70 transition">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
          </Link>
          <h2 className="text-xl font-bold tracking-tight">Nutrition Reports</h2>
          <div className="w-9" />
        </header>

        {/* Period Toggle */}
        <div className="flex gap-1 bg-secondary/30 rounded-2xl p-1 mb-6">
          {(["week", "month"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition ${
                period === p ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-secondary/50"
              }`}
            >
              {p === "week" ? "7 Days" : "30 Days"}
            </button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard label="Avg Calories" value={report.avgCalories} unit="kcal" icon={Flame} color="bg-primary/10 text-primary" />
          <StatCard label="Avg Protein" value={report.avgProtein} unit="g" icon={Drumstick} color="bg-blue-400/10 text-blue-400" />
          <StatCard label="Total Meals" value={report.totalMeals} icon={Utensils} color="bg-orange-400/10 text-orange-400" />
          <StatCard label="Days on Target" value={`${report.daysOnTarget}/${report.activeDays}`} icon={Target} color="bg-emerald-400/10 text-emerald-400" />
        </div>

        {/* Calorie Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-5 rounded-2xl mb-6"
        >
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Calorie Trend
          </h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={report.dailyData}>
                <defs>
                  <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00e5ff" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#00e5ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey={period === "week" ? "day" : "shortDate"} tick={{ fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false} width={35} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="calories" stroke="#00e5ff" fill="url(#calGrad)" strokeWidth={2} dot={{ r: 3, fill: "#00e5ff" }} />
                {/* Target line */}
                <Area type="monotone" dataKey={() => report.targetCalories} stroke="#ff4444" strokeDasharray="5 5" fill="none" strokeWidth={1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-primary inline-block rounded" /> Calories</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-500 inline-block rounded border-dashed" /> Target ({report.targetCalories})</span>
          </div>
        </motion.div>

        {/* Macro Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-5 rounded-2xl mb-6"
        >
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Avg Daily Macro Split
          </h3>
          <div className="flex items-center gap-4">
            <div className="w-[120px] h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={macroData}
                    cx="50%" cy="50%"
                    innerRadius={35} outerRadius={55}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {macroData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {macroData.map((m) => (
                <div key={m.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                    <span className="text-xs font-medium">{m.name}</span>
                  </div>
                  <span className="text-xs font-bold">{m.value}g</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Protein Trend */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel p-5 rounded-2xl mb-6"
        >
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Daily Protein
          </h3>
          <div className="h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey={period === "week" ? "day" : "shortDate"} tick={{ fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false} width={30} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="protein" fill="#60a5fa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Foods */}
        {report.topFoods.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-panel p-5 rounded-2xl mb-6"
          >
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Most Logged Foods
            </h3>
            <div className="space-y-2">
              {report.topFoods.map((food: any, i: number) => (
                <div key={food.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-muted-foreground w-4">{i + 1}</span>
                    <span className="text-sm font-medium capitalize">{food.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{food.count}×</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Best / Worst Day */}
        {report.bestDay && report.worstDay && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 gap-3 mb-6"
          >
            <div className="glass-panel p-4 rounded-2xl">
              <div className="flex items-center gap-1.5 mb-1">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Best Day</span>
              </div>
              <p className="text-lg font-bold text-emerald-400">{report.bestDay.calories} <span className="text-xs text-muted-foreground font-normal">kcal</span></p>
              <p className="text-[10px] text-muted-foreground">{report.bestDay.day} {report.bestDay.shortDate}</p>
            </div>
            <div className="glass-panel p-4 rounded-2xl">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Lowest Day</span>
              </div>
              <p className="text-lg font-bold text-orange-400">{report.worstDay.calories} <span className="text-xs text-muted-foreground font-normal">kcal</span></p>
              <p className="text-[10px] text-muted-foreground">{report.worstDay.day} {report.worstDay.shortDate}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
