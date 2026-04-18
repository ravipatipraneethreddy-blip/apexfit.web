import { DeleteMealButton } from "./delete-meal-button";

const r1 = (n: number) => Math.round(n * 10) / 10;

export function MealList({ meals, isFutureDate }: { meals: any[]; isFutureDate: boolean }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
        {isFutureDate ? "Planned Meals" : "Logged Meals"} ({meals.length} meals)
      </h3>
      {meals.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm glass-panel rounded-2xl">
          No meals {isFutureDate ? "planned" : "logged"} yet. Search above to get started!
        </div>
      ) : (
        meals.map((item, i) => (
          <div
            key={item.id || i}
            className={`glass-panel p-4 rounded-2xl flex justify-between items-center group transition ${item.pending ? 'opacity-50 blur-[0.5px] scale-[0.98]' : ''}`}
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{item.foodName}</p>
              <div className="text-[10px] text-muted-foreground mt-1 flex gap-2">
                <span className="text-blue-400">{r1(item.protein)}P</span>
                <span className="text-orange-400">{r1(item.carbs)}C</span>
                <span className="text-emerald-400">{r1(item.fats)}F</span>
                {item.fiber > 0 && <span className="text-purple-400">{r1(item.fiber)}Fib</span>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-bold text-primary">{r1(item.calories)}</p>
                <p className="text-[10px] text-muted-foreground">kcal</p>
              </div>
              <DeleteMealButton id={item.id} />
            </div>
          </div>
        ))
      )}
    </div>
  );
}
