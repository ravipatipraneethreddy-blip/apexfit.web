"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Loader2, Search, Trash2, Check, Edit3,
  BrainCircuit, ScanLine, X
} from "lucide-react";
import Link from "next/link";
import { logMeal, deleteMeal } from "@/actions/diet.actions";
import { lookupNutrition, type NutritionResult } from "@/actions/nutrition.actions";
import { useRouter } from "next/navigation";

// Circular progress ring component
function MacroRing({
  value, max, color, label, unit,
}: {
  value: number; max: number; color: string; label: string; unit: string;
}) {
  const pct = Math.min(value / max, 1);
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[72px] h-[72px]">
        <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
          <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
          <motion.circle
            cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="5"
            strokeLinecap="round" strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold leading-none">{value}</span>
          <span className="text-[9px] text-muted-foreground">{unit}</span>
        </div>
      </div>
      <span className="text-[10px] text-muted-foreground font-medium mt-1.5 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

// Source badge
function SourceBadge({ source }: { source: string }) {
  const config = {
    ai: { icon: BrainCircuit, label: "AI Powered", color: "text-purple-400 bg-purple-400/10" },
  }[source] || { icon: BrainCircuit, label: "AI Powered", color: "text-purple-400 bg-purple-400/10" };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${config.color}`}>
      <config.icon className="w-3 h-3" /> {config.label}
    </span>
  );
}

export default function DietClient({ user, meals }: { user: any; meals: any[] }) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [isLooking, setIsLooking] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [lookupResult, setLookupResult] = useState<NutritionResult | null>(null);

  // Barcode Scanner State
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const todayStr = new Date().toDateString();
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const getWeekDays = () => {
    const days = [];
    const date = new Date();
    date.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1)); // start on Monday
    for (let i = 0; i < 7; i++) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };
  const weekDays = getWeekDays();

  const isTodayDate = selectedDate.toDateString() === todayStr;
  const isFutureDate = selectedDate.getTime() > new Date().setHours(0,0,0,0);

  const TARGET_CALS = user.targetCalories || 2500;
  const TARGET_PRO = user.targetProtein || 180;
  const TARGET_CARB = user.targetCarbs || 250;
  const TARGET_FAT = user.targetFats || 65;
  const TARGET_FIBER = 30; // Standard recommended daily fiber intake

  const filteredMeals = meals.filter((m) => new Date(m.date).toDateString() === selectedDate.toDateString());

  const eatenCals = filteredMeals.reduce((sum: number, m: any) => sum + m.calories, 0);
  const eatenPro = filteredMeals.reduce((sum: number, m: any) => sum + m.protein, 0);
  const eatenCarb = filteredMeals.reduce((sum: number, m: any) => sum + m.carbs, 0);
  const eatenFat = filteredMeals.reduce((sum: number, m: any) => sum + m.fats, 0);
  const eatenFiber = filteredMeals.reduce((sum: number, m: any) => sum + (m.fiber || 0), 0);

  const handleLookup = async () => {
    if (!searchInput.trim()) return;
    setIsLooking(true);
    setLookupResult(null);
    try {
      const res = await lookupNutrition(searchInput);
      setLookupResult(res);
      setEditValues({
        calories: res.calories,
        protein: res.protein,
        carbs: res.carbs,
        fats: res.fats,
        fiber: res.fiber,
      });
    } catch (e) {
      console.error(e);
    }
    setIsLooking(false);
  };

  // -- Barcode Scanning Logic --
  useEffect(() => {
    if (!isScanning) return;
    let html5QrcodeScanner: any = null;
    let isScannerRunning = false;

    const startScanner = async () => {
      try {
        if (!(window as any).Html5Qrcode) {
          setScannerError("Scanner library not loaded. Try refreshing.");
          return;
        }

        const Html5Qrcode = (window as any).Html5Qrcode;
        html5QrcodeScanner = new Html5Qrcode("reader");

        await html5QrcodeScanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 150 } },
          async (decodedText: string) => {
            // Stop scanning once we get a result
            if (isScannerRunning) {
              html5QrcodeScanner.stop().catch(() => {});
              isScannerRunning = false;
            }
            setIsScanning(false);
            scanProduct(decodedText);
          },
          (errorMessage: string) => {
            // Ignore ongoing errors while camera searches for barcode
          }
        );
        isScannerRunning = true;
      } catch (err) {
        setScannerError("Camera access denied or unavailable.");
      }
    };

    startScanner();

    return () => {
      if (html5QrcodeScanner && isScannerRunning) {
        html5QrcodeScanner.stop().catch(() => {});
      }
    };
  }, [isScanning]);

  const scanProduct = async (barcode: string) => {
    setIsLooking(true);
    setLookupResult(null);
    setSearchInput(`Barcode: ${barcode}`);
    
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
      const data = await res.json();
      
      if (data.status === 1 && data.product) {
        const prod = data.product;
        const result: NutritionResult = {
          foodName: prod.product_name || "Unknown Product",
          quantity: "1 serving (100g/ml approx)",
          calories: Math.round(prod.nutriments?.["energy-kcal_100g"] || 0),
          protein: Math.round(prod.nutriments?.proteins_100g || 0),
          carbs: Math.round(prod.nutriments?.carbohydrates_100g || 0),
          fats: Math.round(prod.nutriments?.fat_100g || 0),
          fiber: Math.round(prod.nutriments?.fiber_100g || 0),
          source: "ai",
        };
        setLookupResult(result);
        setEditValues({
          calories: result.calories,
          protein: result.protein,
          carbs: result.carbs,
          fats: result.fats,
          fiber: result.fiber,
        });
      } else {
        alert("Product not found in OpenFoodFacts database.");
        setSearchInput("");
      }
    } catch (e) {
      console.error(e);
      alert("Error fetching product data.");
    }
    setIsLooking(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleLookup();
  };

  const handleLog = async () => {
    if (!lookupResult) return;
    setIsLogging(true);
    const formData = new FormData();
    formData.append("foodName", lookupResult.foodName);
    formData.append("calories", (isEditing ? editValues.calories : lookupResult.calories).toString());
    formData.append("protein", (isEditing ? editValues.protein : lookupResult.protein).toString());
    formData.append("carbs", (isEditing ? editValues.carbs : lookupResult.carbs).toString());
    formData.append("fats", (isEditing ? editValues.fats : lookupResult.fats).toString());
    formData.append("fiber", (isEditing ? editValues.fiber : lookupResult.fiber).toString());
    formData.append("planned", isFutureDate ? "true" : "false");
    formData.append("date", selectedDate.toISOString());
    try {
      await logMeal(formData);
      setLookupResult(null);
      setSearchInput("");
      setIsEditing(false);
      router.refresh();
    } catch (err) {
      console.error(err);
    }
    setIsLogging(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteMeal(id);
      router.refresh();
    } catch (err) {
      console.error(err);
    }
    setDeletingId(null);
  };



  return (
    <div className="min-h-screen p-4 md:p-8 flex justify-center font-sans tracking-tight">
      <div className="max-w-md w-full">
        {/* Header */}
        <header className="flex items-center justify-between mb-4">
          <Link href="/">
            <button className="p-2 rounded-xl bg-secondary hover:bg-secondary/70 transition">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
          </Link>
          <h2 className="text-xl font-bold tracking-tight">Nutrition {isFutureDate ? "Planner" : "Log"}</h2>
          <div className="w-9" />
        </header>

        {/* Date Selector */}
        <div className="flex justify-between items-center mb-6 bg-secondary/30 rounded-2xl p-1 shadow-inner">
          {weekDays.map((date, i) => {
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const isToday = date.toDateString() === todayStr;
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(date)}
                className={`flex-1 py-2 flex flex-col items-center rounded-xl transition ${
                  isSelected ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" : "text-muted-foreground hover:bg-secondary/50"
                }`}
              >
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground/70"}`}>
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span className="text-sm font-bold relative">
                  {date.getDate()}
                  {isToday && !isSelected && <span className="absolute -top-1 -right-2 w-1.5 h-1.5 bg-primary rounded-full" />}
                </span>
              </button>
            );
          })}
        </div>

        {/* Calorie Summary */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-5 rounded-2xl mb-6 border-primary/20 shadow-[0_4px_24px_-8px_rgba(0,229,255,0.15)]"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Remaining</p>
              <h3 className="text-3xl font-bold text-primary">
                {Math.max(TARGET_CALS - eatenCals, 0)}{" "}
                <span className="text-lg text-muted-foreground font-medium">kcal</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {eatenCals} eaten of {TARGET_CALS}
              </p>
            </div>
            <MacroRing value={eatenCals} max={TARGET_CALS} color="#00e5ff" label="Total" unit="kcal" />
          </div>
          <div className="flex justify-around pt-3 border-t border-border/50">
            <MacroRing value={eatenPro} max={TARGET_PRO} color="#60a5fa" label="Protein" unit="g" />
            <MacroRing value={eatenCarb} max={TARGET_CARB} color="#f97316" label="Carbs" unit="g" />
            <MacroRing value={eatenFat} max={TARGET_FAT} color="#34d399" label="Fats" unit="g" />
            <MacroRing value={Math.round(eatenFiber)} max={TARGET_FIBER} color="#a78bfa" label="Fiber" unit="g" />
          </div>
        </motion.div>

        {/* ─── Smart Search Bar ─── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative mb-6 flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isFutureDate ? "Plan a meal... (e.g. 200g rice)" : "What did you eat? (e.g. 200g rice)"}
                className="w-full bg-card border border-primary/20 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-primary transition shadow-sm placeholder:text-muted-foreground/50 pr-20"
              />
              <button
                onClick={handleLookup}
                disabled={isLooking}
                className="absolute right-2 top-2 bottom-2 bg-primary text-primary-foreground px-4 rounded-xl font-bold flex items-center justify-center transition hover:opacity-90 disabled:opacity-50"
              >
                {isLooking ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
              </button>
            </div>
            <button
              onClick={() => {
                setScannerError("");
                setIsScanning(true);
              }}
              className="bg-secondary text-primary border border-primary/20 rounded-2xl px-4 flex items-center justify-center hover:bg-primary/10 transition shadow-sm"
              title="Scan Barcode"
            >
              <ScanLine className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5 px-1 mb-4">
            AI-powered nutrition lookup • Just type naturally like &quot;2 rotis with dal&quot;
          </p>
          

        </motion.div>

        {/* ─── Scanner Modal ─── */}
        <AnimatePresence>
          {isScanning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <div className="bg-card w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative border border-primary/20">
                <div className="p-4 flex items-center justify-between border-b border-border">
                  <h3 className="font-bold">Scan Barcode</h3>
                  <button onClick={() => setIsScanning(false)} className="p-2 bg-secondary rounded-full">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4 bg-black relative min-h-[300px] flex items-center justify-center">
                  {scannerError ? (
                    <div className="text-red-400 text-sm text-center p-4">{scannerError}</div>
                  ) : (
                    <div id="reader" className="w-full"></div>
                  )}
                </div>
                <div className="p-4 bg-card text-center text-xs text-muted-foreground">
                  Center the product barcode in the box.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Lookup Result Card ─── */}
        <AnimatePresence>
          {lookupResult && (
            <motion.div
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="glass-panel rounded-2xl p-5 border-primary/30 shadow-[0_4px_24px_-8px_rgba(0,229,255,0.1)]">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-sm">{lookupResult.foodName}</h4>
                    <p className="text-[11px] text-muted-foreground">{lookupResult.quantity}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <SourceBadge source={lookupResult.source} />
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className={`p-1.5 rounded-lg transition ${isEditing ? "bg-primary/10 text-primary" : "hover:bg-secondary text-muted-foreground"}`}
                      title="Edit values"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Macro Grid */}
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {[
                    { key: "calories", label: "Calories", unit: "kcal", color: "text-primary" },
                    { key: "protein", label: "Protein", unit: "g", color: "text-blue-400" },
                    { key: "carbs", label: "Carbs", unit: "g", color: "text-orange-400" },
                    { key: "fats", label: "Fats", unit: "g", color: "text-emerald-400" },
                    { key: "fiber", label: "Fiber", unit: "g", color: "text-purple-400" },
                  ].map((m) => (
                    <div key={m.key} className="text-center">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editValues[m.key as keyof typeof editValues] || ""}
                          onChange={(e) =>
                            setEditValues({ ...editValues, [m.key]: Number(e.target.value) })
                          }
                          className="w-full bg-background border border-border rounded-lg py-1 px-1 text-center text-sm font-bold focus:outline-none focus:border-primary"
                        />
                      ) : (
                        <p className={`text-lg font-bold ${m.color}`}>
                          {lookupResult[m.key as keyof NutritionResult]}
                        </p>
                      )}
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">
                        {m.label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleLog}
                    disabled={isLogging}
                    className="flex-1 py-3 bg-primary text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 neon-glow disabled:opacity-50 transition"
                  >
                    {isLogging ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4" /> Log This Meal
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => { setLookupResult(null); setIsEditing(false); }}
                    className="px-4 py-3 bg-secondary text-muted-foreground rounded-xl hover:bg-secondary/70 transition text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Quick Add Suggestions ─── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
            Quick Add
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
            {[
              { label: "2 Eggs", emoji: "🥚" },
              { label: "1 Chapati", emoji: "🫓" },
              { label: "Chicken Breast", emoji: "🍗" },
              { label: "Rice & Dal", emoji: "🍚" },
              { label: "Protein Shake", emoji: "🥤" },
              { label: "1 Banana", emoji: "🍌" },
              { label: "Greek Yogurt", emoji: "🥣" },
              { label: "3 Idli", emoji: "🥟" },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  setSearchInput(item.label);
                  // Auto-trigger lookup
                  setIsLooking(true);
                  lookupNutrition(item.label).then((result) => {
                    setLookupResult(result);
                    setEditValues({
                      calories: result.calories,
                      protein: result.protein,
                      carbs: result.carbs,
                      fats: result.fats,
                      fiber: result.fiber,
                    });
                    setIsLooking(false);
                  });
                }}
                disabled={isLooking}
                className="shrink-0 px-3 py-2 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition flex items-center gap-1.5 text-xs font-medium disabled:opacity-50"
              >
                <span className="text-base">{item.emoji}</span>
                {item.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ─── Today's Log ─── */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
            {isFutureDate ? "Planned Meals" : "Logged Meals"} ({filteredMeals.length} meals)
          </h3>
          {filteredMeals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm glass-panel rounded-2xl">
              No meals {isFutureDate ? "planned" : "logged"} yet. Search above to get started!
            </div>
          ) : (
            filteredMeals.map((item, i) => (
              <motion.div
                key={item.id || i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-panel p-4 rounded-2xl flex justify-between items-center group"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.foodName}</p>
                  <div className="text-[10px] text-muted-foreground mt-1 flex gap-2">
                    <span className="text-blue-400">{item.protein}P</span>
                    <span className="text-orange-400">{item.carbs}C</span>
                    <span className="text-emerald-400">{item.fats}F</span>
                    {item.fiber > 0 && <span className="text-purple-400">{item.fiber}Fib</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold text-primary">{item.calories}</p>
                    <p className="text-[10px] text-muted-foreground">kcal</p>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition sm:opacity-0 sm:group-hover:opacity-100 opacity-100"
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
