"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Search, ScanLine, X, Plus, Minus, BrainCircuit, Database, HelpCircle, Edit3, Check } from "lucide-react";
import { logMeal } from "@/actions/diet.actions";
import { lookupNutrition, getFoodSuggestions, type NutritionResult } from "@/actions/nutrition.actions";
import { useRouter } from "next/navigation";

const r1 = (n: number) => Math.round(n * 10) / 10;

function SourceBadge({ source }: { source: string }) {
  const config = {
    ai: { icon: BrainCircuit, label: "AI Estimated", color: "text-purple-400 bg-purple-400/10" },
    database: { icon: Database, label: "Verified", color: "text-emerald-400 bg-emerald-400/10" },
    estimate: { icon: HelpCircle, label: "Rough Estimate", color: "text-yellow-400 bg-yellow-400/10" },
  }[source] || { icon: HelpCircle, label: "Unknown", color: "text-muted-foreground bg-secondary" };
  const Icon = config.icon;
  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${config.color}`}>
      <Icon className="w-3 h-3" />
      <span className="text-[10px] font-bold uppercase tracking-wider">{config.label}</span>
    </div>
  );
}

export function MealSearchModal({
  isFutureDate,
  selectedDateStr,
  recentFoods = [],
  onOptimisticLog,
}: {
  isFutureDate: boolean;
  selectedDateStr: string;
  recentFoods?: any[];
  onOptimisticLog?: (meal: any) => void;
}) {
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
  const [showAllQuickAdds, setShowAllQuickAdds] = useState(false);
  const [activeQuickCategory, setActiveQuickCategory] = useState("All");
  const [isAddingQuick, setIsAddingQuick] = useState(false);
  const [newQuickLabel, setNewQuickLabel] = useState("");
  const [newQuickEmoji, setNewQuickEmoji] = useState("🍽️");
  const [newQuickCategory, setNewQuickCategory] = useState("Custom");
  const [isEditingQuickAdds, setIsEditingQuickAdds] = useState(false);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<{ name: string; serving: string; cal: number }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const defaultQuickAdds = [
    { label: "2 Eggs", emoji: "🥚", category: "Breakfast" },
    { label: "Oats", emoji: "🥣", category: "Breakfast" },
    { label: "Chicken Breast", emoji: "🍗", category: "Protein" },
    { label: "Protein Shake", emoji: "🥤", category: "Protein" },
  ];

  const [customQuickAdds, setCustomQuickAdds] = useState<{ label: string; emoji: string; category: string }[]>([]);
  const [deletedDefaults, setDeletedDefaults] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("apexfit-quick-adds");
      if (saved) setCustomQuickAdds(JSON.parse(saved));
      const del = localStorage.getItem("apexfit-quick-deleted");
      if (del) setDeletedDefaults(JSON.parse(del));
    } catch {}
  }, []);

  const saveCustomQuickAdds = (items: typeof customQuickAdds) => {
    setCustomQuickAdds(items);
    localStorage.setItem("apexfit-quick-adds", JSON.stringify(items));
  };
  const saveDeletedDefaults = (items: string[]) => {
    setDeletedDefaults(items);
    localStorage.setItem("apexfit-quick-deleted", JSON.stringify(items));
  };

  const handleAddQuickItem = () => {
    if (!newQuickLabel.trim()) return;
    const newItem = { label: newQuickLabel.trim(), emoji: newQuickEmoji, category: newQuickCategory };
    saveCustomQuickAdds([...customQuickAdds, newItem]);
    setNewQuickLabel("");
    setNewQuickEmoji("🍽️");
    setIsAddingQuick(false);
  };

  const handleDeleteQuickItem = (label: string, isCustom: boolean) => {
    if (isCustom) saveCustomQuickAdds(customQuickAdds.filter((i) => i.label !== label));
    else saveDeletedDefaults([...deletedDefaults, label]);
  };

  const allQuickAddItems = [...defaultQuickAdds.filter((i) => !deletedDefaults.includes(i.label)), ...customQuickAdds];
  const recentQuickAdds = (recentFoods || []).map((f) => ({ label: f.foodName, emoji: "🕒", category: "Recent" }));
  const quickAddCategories = ["All", "Recent", "Breakfast", "Lunch", "Protein", "Snacks", "Custom"];
  
  let filteredQuickAdds = allQuickAddItems;
  if (activeQuickCategory === "Recent") filteredQuickAdds = recentQuickAdds;
  else if (activeQuickCategory !== "All") filteredQuickAdds = allQuickAddItems.filter((i) => i.category === activeQuickCategory);

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    setLookupResult(null);
    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setShowSuggestions(true);
    debounceRef.current = setTimeout(async () => {
      const results = await getFoodSuggestions(value);
      setSuggestions(results);
    }, 400);
  }, []);

  const handleLookup = async () => {
    if (!searchInput.trim()) return;
    setShowSuggestions(false);
    setIsLooking(true);
    try {
      const result = await lookupNutrition(searchInput);
      setLookupResult(result);
      setEditValues({
        calories: result.calories,
        protein: result.protein,
        carbs: result.carbs,
        fats: result.fats,
        fiber: result.fiber,
      });
    } catch {
      //
    }
    setIsLooking(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleLookup();
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    formData.append("date", selectedDateStr);
    try {
      const mealPayload = {
        id: "optimistic-" + Date.now(),
        foodName: lookupResult.foodName,
        calories: Number(formData.get("calories")),
        protein: Number(formData.get("protein")),
        carbs: Number(formData.get("carbs")),
        fats: Number(formData.get("fats")),
        fiber: Number(formData.get("fiber")),
        pending: true,
      };

      if (onOptimisticLog) onOptimisticLog(mealPayload);

      try {
        if (!navigator.onLine) throw new Error("Offline");
        await logMeal(formData);
      } catch (err) {
        if (!navigator.onLine || String(err).includes("Failed to fetch") || String(err).includes("Offline")) {
          // Push to offline queue
          const queue = JSON.parse(localStorage.getItem("apexfit-offline-queue") || "[]");
          const existingIndex = queue.findIndex((q: any) => q.id === mealPayload.id);
          const queueItem = {
            id: mealPayload.id,
            timestamp: Date.now(),
            type: "MEAL",
            formDataObj: Object.fromEntries(formData),
            status: "PENDING",
            retryCount: 0
          };
          if (existingIndex === -1) queue.push(queueItem);
          const trimmed = queue.slice(-30);
          localStorage.setItem("apexfit-offline-queue", JSON.stringify(trimmed));
        } else {
          console.error(err);
        }
      }

      setLookupResult(null);
      setSearchInput("");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
    setIsLogging(false);
  };

  return (
    <>
      <div className="mb-6">
        <div className="relative mb-6 flex gap-2">
          <div className="relative flex-1" ref={suggestionsRef}>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
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

            {/* Autocomplete Dropdown */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-card border border-primary/20 rounded-xl shadow-lg z-50 overflow-hidden"
                >
                  {suggestions.map((s, i) => (
                    <button
                      key={`${s.name}-${i}`}
                      onClick={() => {
                        setSearchInput(s.name);
                        setShowSuggestions(false);
                        setIsLooking(true);
                        lookupNutrition(s.name).then((result) => {
                          setLookupResult(result);
                          setEditValues({
                            calories: result.calories, protein: result.protein, carbs: result.carbs,
                            fats: result.fats, fiber: result.fiber,
                          });
                          setIsLooking(false);
                        }).catch(() => setIsLooking(false));
                      }}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-primary/5 transition text-left border-b border-border/30 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium capitalize">{s.name}</p>
                        <p className="text-[10px] text-muted-foreground">{s.serving}</p>
                      </div>
                      <span className="text-xs text-primary font-bold">{s.cal} kcal/100g</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 px-1 mb-4">
          Uses AI + food database • Just type naturally like &quot;2 rotis with dal&quot;
        </p>
      </div>

      {/* Lookup Result Component */}
      <AnimatePresence>
        {lookupResult && (
          <motion.div initial={{ opacity: 0, y: 10, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, y: -10, height: 0 }} className="mb-6 overflow-hidden">
            <div className="glass-panel rounded-2xl p-5 border-primary/30 shadow-[0_4px_24px_-8px_rgba(0,229,255,0.1)]">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-bold text-sm">{lookupResult.foodName}</h4>
                  <p className="text-[11px] text-muted-foreground">{lookupResult.quantity}</p>
                </div>
                <div className="flex items-center gap-2">
                  <SourceBadge source={lookupResult.source} />
                  <button onClick={() => setIsEditing(!isEditing)} className={`p-1.5 rounded-lg transition ${isEditing ? "bg-primary/10 text-primary" : "hover:bg-secondary text-muted-foreground"}`}>
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {[
                  { key: "calories", label: "Calories", color: "text-primary" },
                  { key: "protein", label: "Protein", color: "text-blue-400" },
                  { key: "carbs", label: "Carbs", color: "text-orange-400" },
                  { key: "fats", label: "Fats", color: "text-emerald-400" },
                  { key: "fiber", label: "Fiber", color: "text-purple-400" },
                ].map((m) => (
                  <div key={m.key} className="text-center">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editValues[m.key as keyof typeof editValues] || ""}
                        onChange={(e) => setEditValues({ ...editValues, [m.key]: Number(e.target.value) })}
                        className="w-full bg-background border border-border rounded-lg py-1 px-1 text-center text-sm font-bold focus:outline-none focus:border-primary"
                      />
                    ) : (
                      <p className={`text-lg font-bold ${m.color}`}>
                        {r1(Number(lookupResult[m.key as keyof NutritionResult]) || 0)}
                      </p>
                    )}
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">{m.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleLog}
                  disabled={isLogging}
                  className="flex-1 py-3 bg-primary text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 neon-glow disabled:opacity-50 transition"
                >
                  {isLogging ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Log This Meal</>}
                </button>
                <button onClick={() => { setLookupResult(null); setIsEditing(false); }} className="px-4 py-3 bg-secondary text-muted-foreground rounded-xl hover:bg-secondary/70 transition text-sm font-medium">Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Add Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick Add</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsEditingQuickAdds(!isEditingQuickAdds)} className={`text-[10px] font-semibold transition ${isEditingQuickAdds ? "text-red-400" : "text-muted-foreground hover:text-foreground"}`}>
              {isEditingQuickAdds ? "Done" : "Edit"}
            </button>
            <button onClick={() => setShowAllQuickAdds(!showAllQuickAdds)} className="text-[10px] text-primary font-semibold hover:underline">
              {showAllQuickAdds ? "Less" : "All"}
            </button>
          </div>
        </div>
        <div className="flex gap-1.5 mb-2 overflow-x-auto pb-1 scrollbar-hide">
          {quickAddCategories.map((cat) => (
            <button key={cat} onClick={() => setActiveQuickCategory(cat)} className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition ${activeQuickCategory === cat ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground hover:bg-secondary"}`}>
              {cat}
            </button>
          ))}
        </div>
        <div className={`flex ${showAllQuickAdds ? "flex-wrap" : "overflow-x-auto scrollbar-hide"} gap-2 pb-2 -mx-1 px-1`}>
          {(showAllQuickAdds ? filteredQuickAdds : filteredQuickAdds.slice(0, 8)).map((item) => (
            <div key={item.label} className="relative shrink-0">
              {isEditingQuickAdds && (
                <button onClick={() => handleDeleteQuickItem(item.label, item.category === "Custom")} className="absolute -top-1.5 -right-1.5 z-10 w-4 h-4 rounded-full bg-red-500 text-white flex justify-center items-center shadow-sm"><Minus className="w-2.5 h-2.5" /></button>
              )}
              <button
                onClick={() => {
                  if (isEditingQuickAdds) return;
                  setSearchInput(item.label);
                  setIsLooking(true);
                  lookupNutrition(item.label).then((result) => {
                    setLookupResult(result);
                    setEditValues({
                      calories: result.calories, protein: result.protein, carbs: result.carbs,
                      fats: result.fats, fiber: result.fiber,
                    });
                    setIsLooking(false);
                  }).catch(() => setIsLooking(false));
                }}
                disabled={isLooking || isEditingQuickAdds}
                className={`px-3 py-2 rounded-xl border bg-card flex items-center gap-1.5 text-xs font-medium transition ${isEditingQuickAdds ? "border-red-500/30 animate-pulse" : "border-border hover:border-primary/50 hover:bg-primary/5 disabled:opacity-50"}`}
              >
                <span className="text-base">{item.emoji}</span>{item.label}
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
