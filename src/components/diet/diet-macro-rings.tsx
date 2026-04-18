import { AnimatedRing } from "./animated-ring";

const r1 = (n: number) => Math.round(n * 10) / 10;

function MacroRing({
  value, max, color, label, unit,
}: {
  value: number; max: number; color: string; label: string; unit: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[72px] h-[72px]">
        <AnimatedRing value={value} max={max} color={color} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold leading-none">{r1(value)}</span>
          <span className="text-[9px] text-muted-foreground">{unit}</span>
        </div>
      </div>
      <span className="text-[10px] text-muted-foreground font-medium mt-1.5 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

export function DietMacroRings({ meals, user }: { meals: any[]; user: any }) {
  const eatenCals = Math.round(meals.reduce((sum: number, m: any) => sum + m.calories, 0));
  const eatenPro = r1(meals.reduce((sum: number, m: any) => sum + m.protein, 0));
  const eatenCarbs = r1(meals.reduce((sum: number, m: any) => sum + (m.carbs || 0), 0));
  const eatenFats = r1(meals.reduce((sum: number, m: any) => sum + (m.fats || 0), 0));

  const TARGET_CALS = user.targetCalories || 2500;
  const TARGET_PRO = user.targetProtein || 180;
  const TARGET_CARBS = user.targetCarbs || 250;
  const TARGET_FAT = user.targetFats || 65;

  return (
    <div className="glass-panel p-6 rounded-3xl mb-8 flex items-center justify-between shadow-lg neon-glow relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
      
      <div className="flex-1">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Calories</h2>
        <div className="flex items-baseline gap-1 mb-1">
          <span className="text-4xl font-black tracking-tighter text-foreground">{eatenCals}</span>
          <span className="text-sm text-muted-foreground font-medium">/ {TARGET_CALS} kcal</span>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <div className="h-2 flex-1 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-orange-500 rounded-full" 
              style={{ width: `${Math.min((eatenCals / TARGET_CALS) * 100, 100)}%` }} 
            />
          </div>
          <span className="text-[10px] font-bold text-muted-foreground">
            {Math.max(TARGET_CALS - eatenCals, 0)} left
          </span>
        </div>
      </div>
      
      <div className="flex gap-4 ml-8 border-l border-border/50 pl-8">
        <MacroRing value={eatenPro} max={TARGET_PRO} color="#3b82f6" label="Protein" unit="g" />
        <MacroRing value={eatenCarbs} max={TARGET_CARBS} color="#eab308" label="Carbs" unit="g" />
        <MacroRing value={eatenFats} max={TARGET_FAT} color="#10b981" label="Fats" unit="g" />
      </div>
    </div>
  );
}
