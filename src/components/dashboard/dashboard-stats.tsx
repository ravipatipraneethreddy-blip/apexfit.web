import Link from "next/link";

type NutritionUser = { targetCalories: number | null; targetProtein: number | null };
type Meal = { calories: number; protein: number };

export function DashboardStats({ user, meals }: { user: NutritionUser; meals: Meal[] }) {
  const calories = Math.round(meals.reduce((sum, meal) => sum + meal.calories, 0));
  const protein = Math.round(meals.reduce((sum, meal) => sum + meal.protein, 0) * 10) / 10;
  const stats = [
    { label: "Calories", value: calories, target: user.targetCalories || 2500, unit: "kcal", bar: "bg-orange-400" },
    { label: "Protein", value: protein, target: user.targetProtein || 180, unit: "g", bar: "bg-blue-400" },
  ];

  return (
    <section aria-labelledby="nutrition-title" className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 id="nutrition-title" className="text-sm font-semibold">Today’s nutrition</h2>
        <Link href="/diet" className="text-sm text-primary px-2 py-2 font-medium hover:underline">Log meal</Link>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {stats.map(stat => (
          <Link href="/diet" key={stat.label} className="rounded-2xl bg-card border border-border/60 p-4 hover:border-primary/40">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold mt-2">{stat.value}<span className="text-xs font-normal text-muted-foreground ml-1">{stat.unit}</span></p>
            <p className="text-xs text-muted-foreground mt-1">of {stat.target} {stat.unit}</p>
            <div aria-hidden="true" className="h-1.5 rounded-full bg-secondary mt-3 overflow-hidden">
              <div className={`h-full rounded-full ${stat.bar}`} style={{ width: `${Math.min(100, Math.max(0, stat.value / stat.target * 100))}%` }} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
