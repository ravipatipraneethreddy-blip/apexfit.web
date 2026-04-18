import { Activity, Dumbbell, Flame, Droplet, Leaf, TrendingUp, Wheat } from "lucide-react";

const r1 = (n: number) => Math.round(n * 10) / 10;

export function DashboardStats({ user, meals, workoutsCount }: { user: any; meals: any[]; workoutsCount: number }) {
  const totalCals = Math.round(meals.reduce((sum, m) => sum + m.calories, 0));
  const totalPro = r1(meals.reduce((sum, m) => sum + m.protein, 0));
  const totalCarbs = r1(meals.reduce((sum, m) => sum + (m.carbs || 0), 0));
  const totalFats = r1(meals.reduce((sum, m) => sum + (m.fats || 0), 0));
  const totalFiber = r1(meals.reduce((sum, m) => sum + (m.fiber || 0), 0));

  const targetCals = user.targetCalories || 2500;
  const targetPro = user.targetProtein || 180;
  const targetCarbs = user.targetCarbs || 250;
  const targetFats = user.targetFats || 65;
  const targetFiber = 30;

  const stats = [
    { label: "Calories", value: totalCals.toString(), sub: `/ ${targetCals}`, icon: Flame, color: "text-orange-400", bg: "bg-orange-400/10" },
    { label: "Protein", value: `${totalPro}g`, sub: `/ ${targetPro}g`, icon: Activity, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Carbs", value: `${totalCarbs}g`, sub: `/ ${targetCarbs}g`, icon: Wheat, color: "text-yellow-400", bg: "bg-yellow-400/10" },
    { label: "Fats", value: `${totalFats}g`, sub: `/ ${targetFats}g`, icon: Droplet, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Fiber", value: `${totalFiber}g`, sub: `/ ${targetFiber}g`, icon: Leaf, color: "text-green-400", bg: "bg-green-400/10" },
    { label: "Weight", value: `${user.weight}kg`, sub: `Tgt ${user.targetWeight || "-"}kg`, icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Workouts", value: workoutsCount.toString(), sub: "Recent", icon: Dumbbell, color: "text-primary", bg: "bg-primary/10" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
      {stats.map((stat, i) => (
        <div key={i} className="bg-card rounded-2xl p-4 flex flex-col justify-between border border-border/50 hover:border-border transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
            <div className={`p-1.5 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight">{stat.value}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{stat.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
