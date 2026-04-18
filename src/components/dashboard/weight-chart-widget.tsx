"use client";

import { useState, useMemo, lazy, Suspense } from "react";
import { ChevronUp } from "lucide-react";

// Lazy-load recharts
const LazyRecharts = lazy(() =>
  import("recharts").then((mod) => ({
    default: ({ data, tooltipComponent }: { data: any[]; tooltipComponent: React.ReactNode }) => (
      <mod.ResponsiveContainer width="100%" height="100%">
        <mod.AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00e5ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <mod.XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <mod.Tooltip content={tooltipComponent} />
          <mod.Area
            type="monotone"
            dataKey="weight"
            name="Weight"
            stroke="#00e5ff"
            strokeWidth={2}
            fill="url(#dashGrad)"
            dot={false}
            activeDot={{ r: 5, fill: "#00e5ff", stroke: "#090a0f", strokeWidth: 2 }}
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
          {p.value} {p.name === "Calories" ? "kcal" : "kg"}
        </p>
      ))}
    </div>
  );
};

export function WeightChartWidget({ weightLogs, user }: { weightLogs: any[]; user: any }) {
  const [weightPeriod, setWeightPeriod] = useState<"1W" | "1M" | "3M">("1M");

  const chartData = useMemo(() => {
    if (!weightLogs || weightLogs.length === 0) return [{ name: "Today", weight: user.weight || 0 }];
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

  return (
    <div className="lg:col-span-2 bg-card rounded-2xl p-6 border border-border/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold tracking-tight">
          {user.goal ? user.goal.replace(/_/g, " ") : "Goal"} Progression
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
        <Suspense fallback={<div className="w-full h-full bg-secondary/30 rounded-xl animate-pulse" />}>
          <LazyRecharts data={chartData} tooltipComponent={<CustomTooltip />} />
        </Suspense>
      </div>
      <div className="flex items-center justify-end gap-2 mt-2">
        <ChevronUp className="w-3 h-3 text-emerald-400" />
        <span className="text-xs text-muted-foreground">{user.weight} kg current</span>
      </div>
    </div>
  );
}
