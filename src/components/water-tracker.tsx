"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, Plus, Minus, Settings2, Check, X } from "lucide-react";
import { logWater } from "@/actions/water.actions";
import { useRouter } from "next/navigation";

const DEFAULT_QUICK_AMOUNTS = [150, 250, 500, 750];
const DEFAULT_GOAL_ML = 2500;

export default function WaterTracker({ initialMl = 0 }: { initialMl?: number }) {
  const router = useRouter();
  const [totalMl, setTotalMl] = useState(initialMl);
  const [isLogging, setIsLogging] = useState(false);
  const [lastAdded, setLastAdded] = useState<number | null>(null);

  // Customization State
  const [isEditing, setIsEditing] = useState(false);
  const [goalMl, setGoalMl] = useState(DEFAULT_GOAL_ML);
  const [quickVals, setQuickVals] = useState(DEFAULT_QUICK_AMOUNTS);
  const [editGoal, setEditGoal] = useState("");
  const [editValsStr, setEditValsStr] = useState("");

  // Load from local storage on mount
  useEffect(() => {
    const savedGoal = localStorage.getItem("apex-water-goal");
    const savedVals = localStorage.getItem("apex-water-quicks");
    if (savedGoal) setGoalMl(parseInt(savedGoal, 10));
    if (savedVals) {
      try { setQuickVals(JSON.parse(savedVals)); } catch {}
    }
  }, []);

  const handleSaveSettings = () => {
    const parsedGoal = parseInt(editGoal, 10);
    if (!isNaN(parsedGoal) && parsedGoal > 0) {
      setGoalMl(parsedGoal);
      localStorage.setItem("apex-water-goal", parsedGoal.toString());
    }

    const parsedVals = editValsStr.split(",").map(v => parseInt(v.trim(), 10)).filter(v => !isNaN(v) && v > 0);
    if (parsedVals.length > 0) {
      const top4 = parsedVals.slice(0, 4);
      setQuickVals(top4);
      localStorage.setItem("apex-water-quicks", JSON.stringify(top4));
    }
    setIsEditing(false);
  };

  const handleOpenEdit = () => {
    setEditGoal(goalMl.toString());
    setEditValsStr(quickVals.join(", "));
    setIsEditing(true);
  };

  const pct = Math.min(totalMl / goalMl, 1);
  const liters = (totalMl / 1000).toFixed(1);
  const goalLiters = (goalMl / 1000).toFixed(1);

  const handleAdd = async (ml: number) => {
    setIsLogging(true);
    setLastAdded(ml);
    setTotalMl((prev) => prev + ml);
    try {
      await logWater(ml);
    } catch (e) {
      console.error(e);
      setTotalMl((prev) => prev - ml);
    }
    setIsLogging(false);
    setTimeout(() => setLastAdded(null), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-2xl p-4 relative overflow-hidden"
    >
      {/* Water fill animation */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-blue-500/10"
        animate={{ height: `${pct * 100}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm">Water Intake</h3>
          </div>
          {lastAdded ? (
            <motion.span
              key="added"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-blue-400 font-semibold"
            >
              +{lastAdded}ml
            </motion.span>
          ) : (
            <button
              key="settings"
              onClick={isEditing ? () => setIsEditing(false) : handleOpenEdit}
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-blue-500/10 hover:text-blue-400 transition"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Progress */}
        <div className="flex items-end gap-3 mb-3">
          <div className="flex-1">
            <p className="text-2xl font-bold text-blue-400">{liters}L</p>
            <p className="text-[10px] text-muted-foreground">of {goalLiters}L goal</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">{Math.round(pct * 100)}%</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-secondary rounded-full overflow-hidden mb-3">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
            animate={{ width: `${pct * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {isEditing ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-blue-500/20 overflow-hidden"
            >
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Daily Goal (ml)</label>
                  <input
                    type="number"
                    value={editGoal}
                    onChange={(e) => setEditGoal(e.target.value)}
                    className="w-full bg-secondary border border-blue-500/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Quick Add Buttons (ml, comma sep)</label>
                  <input
                    type="text"
                    value={editValsStr}
                    onChange={(e) => setEditValsStr(e.target.value)}
                    className="w-full bg-secondary border border-blue-500/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition"
                    placeholder="150, 250, 500..."
                  />
                </div>
                <div className="flex gap-2 justify-end pt-1">
                  <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-muted-foreground hover:bg-secondary transition">Cancel</button>
                  <button onClick={handleSaveSettings} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-500 hover:bg-blue-600 text-white transition flex items-center gap-1">
                    <Check className="w-3 h-3" /> Save
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-2"
            >
              {quickVals.map((ml) => (
                <button
                  key={ml}
                  onClick={() => handleAdd(ml)}
                  disabled={isLogging}
                  className="flex-1 py-2 rounded-xl bg-blue-500/10 text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  <Plus className="w-3 h-3" />
                  {ml >= 1000 ? `${ml / 1000}L` : `${ml}ml`}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
