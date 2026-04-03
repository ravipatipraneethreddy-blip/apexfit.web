"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Target, Activity, CheckCircle2, Loader2, Flame, Dumbbell } from "lucide-react";
import { useRouter } from "next/navigation";
import { onboardUser } from "@/actions/user.actions";

const steps = [
  { id: "intro", title: "Welcome to ApexFit" },
  { id: "stats", title: "Your Blueprint" },
  { id: "gender", title: "Biological Data" },
  { id: "goal", title: "Your Target" },
  { id: "complete", title: "AI Generation" },
];

export default function Onboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tdeeResult, setTdeeResult] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    age: "", height: "", weight: "", gender: "MALE", goal: "FAT_LOSS",
    activityLevel: "MODERATE",
  });

  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep((prev) => prev + 1);
  };
  const prevStep = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const finish = async () => {
    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append("age", formData.age || "25");
      data.append("height", formData.height || "175");
      data.append("weight", formData.weight || "75");
      data.append("gender", formData.gender);
      data.append("goal", formData.goal);
      data.append("dietPreference", "ANY");
      data.append("activityLevel", formData.activityLevel);

      const result = await onboardUser(data);
      if (result.tdee) {
        setTdeeResult(result.tdee);
      }
      
      // Small delay to show calculated targets
      setTimeout(() => router.push("/"), 2000);
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Progress Bar */}
      <div className="w-full max-w-md mb-8 flex gap-2">
        {steps.map((step, idx) => (
          <div key={step.id} className="h-1 flex-1 rounded-full bg-secondary overflow-hidden">
            <motion.div className="h-full bg-primary" initial={{ width: "0%" }} animate={{ width: idx <= currentStep ? "100%" : "0%" }} transition={{ duration: 0.3 }} />
          </div>
        ))}
      </div>

      <div className="w-full max-w-md relative min-h-[440px]">
        <AnimatePresence mode="wait">
          
          {/* Step 0: Welcome */}
          {currentStep === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass-panel p-8 rounded-3xl flex flex-col h-[440px] justify-between">
              <div>
                <Activity className="w-12 h-12 text-primary mb-6" />
                <h1 className="text-3xl font-bold mb-2 tracking-tight">Your goals,<br/>engineered.</h1>
                <p className="text-muted-foreground">ApexFit is your elite AI coach. We don&apos;t just track—we analyze, adapt, and push you to your peak performance.</p>
              </div>
              <button onClick={nextStep} className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-semibold flex justify-center items-center gap-2 hover:opacity-90 transition neon-glow">
                Start Calibration <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* Step 1: Stats */}
          {currentStep === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass-panel p-8 rounded-3xl flex flex-col h-[440px]">
              <h2 className="text-2xl font-bold mb-6">Current Blueprint</h2>
              <div className="space-y-4 flex-1">
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">Age</label>
                  <input type="number" placeholder="25" className="w-full bg-card border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition text-foreground" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">Height (cm)</label>
                    <input type="number" placeholder="175" className="w-full bg-card border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition" value={formData.height} onChange={(e) => setFormData({...formData, height: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">Weight (kg)</label>
                    <input type="number" placeholder="75" className="w-full bg-card border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} />
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button onClick={prevStep} className="p-4 rounded-xl bg-secondary text-foreground hover:bg-secondary/70 transition"><ChevronLeft className="w-5 h-5" /></button>
                <button onClick={nextStep} className="flex-1 bg-primary text-primary-foreground py-4 rounded-xl font-semibold hover:opacity-90 transition">Next</button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Gender & Activity */}
          {currentStep === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass-panel p-8 rounded-3xl flex flex-col h-[440px]">
              <h2 className="text-2xl font-bold mb-6">Biological Data</h2>
              <div className="space-y-5 flex-1">
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">Gender</label>
                  <div className="grid grid-cols-2 gap-3">
                    {["MALE", "FEMALE"].map((g) => (
                      <button
                        key={g}
                        onClick={() => setFormData({...formData, gender: g})}
                        className={`p-4 rounded-xl border transition flex items-center justify-center gap-2 text-sm font-semibold ${formData.gender === g ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:border-muted-foreground text-foreground"}`}
                      >
                        {g === "MALE" ? "♂" : "♀"} {g.charAt(0) + g.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">Activity Level</label>
                  <div className="space-y-2">
                    {[
                      { value: "SEDENTARY", label: "Sedentary", desc: "Little to no exercise" },
                      { value: "LIGHT", label: "Light", desc: "1-3 days/week" },
                      { value: "MODERATE", label: "Moderate", desc: "3-5 days/week" },
                      { value: "ACTIVE", label: "Active", desc: "6-7 days/week" },
                      { value: "VERY_ACTIVE", label: "Very Active", desc: "Athlete level" },
                    ].map((a) => (
                      <button
                        key={a.value}
                        onClick={() => setFormData({...formData, activityLevel: a.value})}
                        className={`w-full text-left p-3 rounded-xl border transition flex justify-between items-center ${formData.activityLevel === a.value ? "border-primary bg-primary/10" : "border-border bg-card hover:border-muted-foreground"}`}
                      >
                        <span className="text-sm font-medium">{a.label}</span>
                        <span className="text-[10px] text-muted-foreground">{a.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button onClick={prevStep} className="p-4 rounded-xl bg-secondary hover:bg-secondary/70 transition"><ChevronLeft className="w-5 h-5" /></button>
                <button onClick={nextStep} className="flex-1 bg-primary text-primary-foreground py-4 rounded-xl font-semibold hover:opacity-90 transition">Next</button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Goal */}
          {currentStep === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass-panel p-8 rounded-3xl flex flex-col h-[440px]">
              <h2 className="text-2xl font-bold mb-6">Primary Objective</h2>
              <div className="space-y-3 flex-1">
                {[
                  { value: "FAT_LOSS", label: "Fat Loss", desc: "−500 kcal deficit", icon: "🔥" },
                  { value: "MUSCLE_GAIN", label: "Muscle Gain", desc: "+300 kcal surplus", icon: "💪" },
                  { value: "RECOMP", label: "Recomp", desc: "−100 kcal, slow recomp", icon: "⚡" },
                ].map((goal) => (
                  <button
                    key={goal.value}
                    onClick={() => setFormData({...formData, goal: goal.value})}
                    className={`w-full text-left p-4 rounded-xl border transition flex items-center justify-between ${formData.goal === goal.value ? "border-primary bg-primary/10" : "border-border bg-card hover:border-muted-foreground"}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{goal.icon}</span>
                      <div>
                        <span className="font-semibold block">{goal.label}</span>
                        <span className="text-[11px] text-muted-foreground">{goal.desc}</span>
                      </div>
                    </div>
                    {formData.goal === goal.value && <Target className="w-5 h-5 text-primary" />}
                  </button>
                ))}
              </div>
              <div className="flex gap-4 mt-6">
                <button onClick={prevStep} className="p-4 rounded-xl bg-secondary hover:bg-secondary/70 transition"><ChevronLeft className="w-5 h-5" /></button>
                <button onClick={nextStep} className="flex-1 bg-primary text-primary-foreground py-4 rounded-xl font-semibold hover:opacity-90 transition">Analyze</button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Complete + TDEE */}
          {currentStep === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-8 rounded-3xl flex flex-col h-[440px] justify-center items-center text-center relative overflow-hidden">
              <motion.div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" initial={{ top: 0 }} animate={{ top: "100%" }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />
              
              {!tdeeResult ? (
                <>
                  <CheckCircle2 className="w-16 h-16 text-primary mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Algorithm Complete</h2>
                  <p className="text-muted-foreground mb-8">Your personalized macros are being calculated using the Mifflin-St Jeor formula.</p>
                  <button onClick={finish} disabled={isSubmitting} className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition neon-glow shadow-lg shadow-primary/20 disabled:opacity-50">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Calculate & Enter Dashboard"}
                  </button>
                </>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                  <h2 className="text-xl font-bold mb-4">Your Personalized Targets</h2>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-background/50 p-3 rounded-xl">
                      <Flame className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-orange-400">{tdeeResult.calories}</p>
                      <p className="text-[10px] text-muted-foreground">CALORIES</p>
                    </div>
                    <div className="bg-background/50 p-3 rounded-xl">
                      <Dumbbell className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-blue-400">{tdeeResult.protein}g</p>
                      <p className="text-[10px] text-muted-foreground">PROTEIN</p>
                    </div>
                    <div className="bg-background/50 p-3 rounded-xl">
                      <p className="text-2xl font-bold text-yellow-400">{tdeeResult.carbs}g</p>
                      <p className="text-[10px] text-muted-foreground">CARBS</p>
                    </div>
                    <div className="bg-background/50 p-3 rounded-xl">
                      <p className="text-2xl font-bold text-emerald-400">{tdeeResult.fats}g</p>
                      <p className="text-[10px] text-muted-foreground">FATS</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">Redirecting to dashboard...</p>
                  <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" />
                </motion.div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
