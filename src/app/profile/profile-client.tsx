"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Loader2, Flame, Dumbbell, Calendar, Mail, Weight, Target, LogOut, Utensils, Moon, Sun, Award, Download } from "lucide-react";
import Link from "next/link";
import { updateUserProfile, exportUserData } from "@/actions/user.actions";
import { logoutUser } from "@/actions/auth.actions";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/theme-provider";
import { BADGE_DEFINITIONS } from "@/lib/constants";

const GOALS = [
  { value: "FAT_LOSS", label: "Fat Loss" },
  { value: "MUSCLE_GAIN", label: "Muscle Gain" },
  { value: "RECOMP", label: "Recomp" },
];

const DIET_PREFS = [
  { value: "ANY", label: "Any" },
  { value: "VEGETARIAN", label: "Vegetarian" },
  { value: "NON_VEGETARIAN", label: "Non-Vegetarian" },
  { value: "VEGAN", label: "Vegan" },
  { value: "KETO", label: "Keto" },
];

const ACTIVITY_LEVELS = [
  { value: "SEDENTARY", label: "Sedentary" },
  { value: "LIGHT", label: "Light" },
  { value: "MODERATE", label: "Moderate" },
  { value: "ACTIVE", label: "Active" },
  { value: "VERY_ACTIVE", label: "Very Active" },
];

export default function ProfileClient({ user, stats, earnedBadges = [] }: { user: any; stats: any; earnedBadges?: string[] }) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [form, setForm] = useState({
    name: user.name || "",
    weight: user.weight?.toString() || "",
    targetWeight: user.targetWeight?.toString() || "",
    goal: user.goal || "FAT_LOSS",
    gender: user.gender || "MALE",
    dietPreference: user.dietPreference || "ANY",
    activityLevel: user.activityLevel || "MODERATE",
  });

  const [pushEnabled, setPushEnabled] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPushEnabled(Notification.permission === "granted");
    }
  }, []);

  const handleEnablePush = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support push notifications.");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setPushEnabled(true);
      // In a real app we'd subscribe to push manager and save the keys to the backend
      // navigator.serviceWorker.ready.then(reg => reg.pushManager.subscribe(...))
      alert("Push notifications enabled!");
    } else {
      alert("Permission denied. You can enable them in site settings.");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      await updateUserProfile(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    }
    setIsSaving(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logoutUser();
  };

  const handleExportData = async () => {
    try {
      const res = await exportUserData();
      if (res.error) return alert(res.error);
      if (!res.data) return;
      
      const download = (filename: string, text: string) => {
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      };

      download('apexfit_meals.csv', res.data.meals);
      download('apexfit_workouts.csv', res.data.workouts);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex justify-center font-sans tracking-tight">
      <div className="max-w-md w-full">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <Link href="/">
            <button className="p-2 rounded-xl bg-secondary hover:bg-secondary/70 transition">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
          </Link>
          <div className="text-center flex-1">
            <h2 className="text-xl font-bold tracking-tight">Profile</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-xl text-muted-foreground hover:bg-secondary/70 transition"
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition"
              title="Log out"
            >
              {isLoggingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Avatar Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl p-6 mb-6 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-primary/10 to-transparent" />
          <div className="relative">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mb-3 shadow-lg shadow-primary/20">
              <span className="text-3xl font-bold text-primary-foreground">
                {(user.name || "P")[0].toUpperCase()}
              </span>
            </div>
            <h3 className="text-lg font-bold">{user.name || "Player 1"}</h3>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
              <Mail className="w-3 h-3" /> {user.email}
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="px-2.5 py-1 rounded-full bg-orange-400/10 text-orange-400 text-xs font-bold flex items-center gap-1">
                <Flame className="w-3 h-3" /> {user.streakDays} Day Streak
              </div>
              {user.targetCalories && (
                <div className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  {user.targetCalories} kcal/day
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          {[
            { label: "Workouts", value: stats.totalWorkouts, icon: Dumbbell, color: "text-primary" },
            { label: "Meals", value: stats.totalMeals, icon: Utensils, color: "text-orange-400" },
            { label: "Member", value: stats.memberSince, icon: Calendar, color: "text-emerald-400" },
          ].map((s) => (
            <div key={s.label} className="glass-panel rounded-xl p-3 text-center">
              <s.icon className={`w-4 h-4 mx-auto mb-1 ${s.color}`} />
              <p className="font-bold text-sm">{s.value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="glass-panel rounded-2xl p-4 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" /> Achievements
            </h3>
            <span className="text-xs text-muted-foreground font-medium bg-background px-2 py-0.5 rounded-full">
              {earnedBadges.length}/{BADGE_DEFINITIONS.length} Earned
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {BADGE_DEFINITIONS.map((badge) => {
              const earned = earnedBadges.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                    earned ? "bg-primary/5 border-primary/20" : "bg-secondary/50 border-transparent opacity-60 grayscale"
                  }`}
                >
                  <div className={`text-2xl ${badge.color}`}>{badge.icon}</div>
                  <div>
                    <p className={`text-xs font-bold ${earned ? "text-foreground" : "text-muted-foreground"}`}>{badge.name}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">{badge.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* TDEE Summary */}
        {user.targetCalories && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-panel rounded-2xl p-4 mb-6"
          >
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
              Your Daily Targets (TDEE)
            </h3>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-lg font-bold text-orange-400">{user.targetCalories}</p>
                <p className="text-[10px] text-muted-foreground">kcal</p>
              </div>
              <div>
                <p className="text-lg font-bold text-blue-400">{user.targetProtein}g</p>
                <p className="text-[10px] text-muted-foreground">Protein</p>
              </div>
              <div>
                <p className="text-lg font-bold text-yellow-400">{user.targetCarbs}g</p>
                <p className="text-[10px] text-muted-foreground">Carbs</p>
              </div>
              <div>
                <p className="text-lg font-bold text-emerald-400">{user.targetFats}g</p>
                <p className="text-[10px] text-muted-foreground">Fats</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Push Notifications Setup */}
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.18 }}
           className="glass-panel rounded-2xl p-4 mb-6 flex items-center justify-between"
        >
          <div>
            <h3 className="font-semibold text-sm">Push Notifications</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Let the AI coach remind you to log meals.</p>
          </div>
          <button
            onClick={handleEnablePush}
            disabled={pushEnabled}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${pushEnabled ? "bg-emerald-400/10 text-emerald-400" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
          >
            {pushEnabled ? "Enabled" : "Enable Reminders"}
          </button>
        </motion.div>

        {/* Edit Form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel rounded-2xl p-5 mb-6"
        >
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">
            Edit Profile
          </h3>
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Display Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Gender</label>
              <div className="grid grid-cols-2 gap-2">
                {["MALE", "FEMALE"].map((g) => (
                  <button
                    key={g}
                    onClick={() => setForm({ ...form, gender: g })}
                    className={`py-2 rounded-xl text-xs font-semibold border transition ${
                      form.gender === g
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-secondary text-muted-foreground hover:border-muted-foreground"
                    }`}
                  >
                    {g === "MALE" ? "♂ Male" : "♀ Female"}
                  </button>
                ))}
              </div>
            </div>

            {/* Weight */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Weight className="w-3 h-3" /> Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Target className="w-3 h-3" /> Target (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={form.targetWeight}
                  onChange={(e) => setForm({ ...form, targetWeight: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition"
                />
              </div>
            </div>

            {/* Goal */}
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Fitness Goal</label>
              <div className="flex gap-2">
                {GOALS.map((g) => (
                  <button
                    key={g.value}
                    onClick={() => setForm({ ...form, goal: g.value })}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition ${
                      form.goal === g.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-secondary text-muted-foreground hover:border-muted-foreground"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Diet Preference */}
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Diet Preference</label>
              <div className="flex flex-wrap gap-2">
                {DIET_PREFS.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setForm({ ...form, dietPreference: d.value })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                      form.dietPreference === d.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-secondary text-muted-foreground hover:border-muted-foreground"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Activity Level */}
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Activity Level</label>
              <div className="flex flex-wrap gap-2">
                {ACTIVITY_LEVELS.map((a) => (
                  <button
                    key={a.value}
                    onClick={() => setForm({ ...form, activityLevel: a.value })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                      form.activityLevel === a.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-secondary text-muted-foreground hover:border-muted-foreground"
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`w-full mt-6 py-3 font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-lg ${
              saved
                ? "bg-emerald-500 text-white shadow-emerald-500/20"
                : "bg-primary text-primary-foreground neon-glow shadow-primary/20 hover:opacity-90"
            } disabled:opacity-50`}
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : saved ? (
              <>✓ Saved</>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save
              </>
            )}
          </button>

          {/* Export Data Button */}
          <button
            onClick={handleExportData}
            className="w-full mt-4 py-3 rounded-xl bg-secondary hover:bg-secondary/70 transition font-bold text-muted-foreground flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Export My Data (CSV)
          </button>
        </motion.div>

        {/* App Info */}
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground/50">
            Apex<span className="text-primary/50">Fit</span> v0.2.0 • AI Personal Coach
          </p>
        </div>
      </div>
    </div>
  );
}
