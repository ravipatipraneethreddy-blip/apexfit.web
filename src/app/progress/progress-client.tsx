"use client";

import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, TrendingDown, Scale, Target, Plus, Loader2, Camera, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { logWeight } from "@/actions/progress.actions";
import { useToast } from "@/components/toast";
import confetti from "canvas-confetti";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, Legend
} from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl text-xs">
      <p className="text-muted-foreground font-medium mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-bold flex justify-between gap-4">
          <span>{p.name}</span>
          <span>{p.value} {p.name === "Weight" ? "kg" : p.name.includes("alories") ? "kcal" : "g"}</span>
        </p>
      ))}
    </div>
  );
};

export default function ProgressClient({ user, weightLogs, macroLogs }: { user: any; weightLogs: any[]; macroLogs: any[] }) {
  const { toast } = useToast();
  const [isLogging, setIsLogging] = useState(false);
  const [weightInput, setWeightInput] = useState(user.weight?.toString() || "");
  const [photoData, setPhotoData] = useState<string | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Load and resize image to prevent huge base64 strings
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        // Scale down to max 600px width/height
        const maxDim = 600;
        let width = img.width;
        let height = img.height;
        if (width > height && width > maxDim) {
          height *= maxDim / width;
          width = maxDim;
        } else if (height > maxDim) {
          width *= maxDim / height;
          height = maxDim;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to base64
        setPhotoData(canvas.toDataURL("image/jpeg", 0.7));
      };
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightInput) return;
    setIsLogging(true);
    const formData = new FormData();
    const formData = new FormData();
    formData.append("weight", weightInput);
    if (photoData) {
      formData.append("photo", photoData);
    }
    
    try {
      const res = await logWeight(formData);
      if (res.error) {
        toast(res.error, "error");
      } else {
        toast("Weight logged successfully!", "success");
        if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(200);
        }
        confetti({
          particleCount: 50,
          spread: 60,
          colors: ["#a855f7", "#c084fc", "#e879f9"],
          origin: { y: 0.8 }
        });
      }
    } catch (err) {
      toast("Something went wrong.", "error");
    }
    setIsLogging(false);
    setPhotoData(null);
  };

  // Map "Weight" key for recharts, adding a baseline if empty
  const finalWeightLogs = weightLogs.length > 0 
    ? weightLogs.map((w: any) => ({ ...w, Weight: w.weight || w.Weight }))
    : [{ date: new Date().toLocaleDateString(), Weight: user.weight }];

  const renderMacroLogs = macroLogs;
  
  const photos = weightLogs
    .filter(w => w.photoUrl)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen p-4 md:p-8 flex items-start justify-center font-sans tracking-tight">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/">
              <button className="p-2 rounded-xl bg-secondary hover:bg-secondary/70 transition">
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
            </Link>
            <h2 className="text-2xl font-bold tracking-tight">Analytics & Trends</h2>
          </div>
        </header>

        {/* Quick Weigh-in */}
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="glass-panel p-4 rounded-3xl mb-6 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Scale className="w-4 h-4 text-purple-400" />
              Check-in
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">Log your weight to update your trend.</p>
          </div>
          <form onSubmit={handleLogWeight} className="flex flex-col md:flex-row items-end md:items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
            <div className="flex w-full md:w-auto items-center gap-2">
              <input 
                type="number" 
                step="0.1"
                required
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                className="bg-background border border-border rounded-xl px-4 py-2 w-full md:w-24 text-center font-bold focus:outline-none focus:border-purple-400"
                placeholder="kg"
              />
              
              <label className={`p-2 rounded-xl cursor-pointer transition ${photoData ? 'bg-purple-500/20 text-purple-400' : 'bg-secondary text-muted-foreground hover:bg-secondary/70'}`} title="Attach photo">
                <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                {photoData ? <ImageIcon className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
              </label>

              <button 
                type="submit" 
                disabled={isLogging}
                className="px-4 py-2 rounded-xl bg-purple-500 text-white hover:bg-purple-600 transition font-bold flex items-center gap-1 disabled:opacity-50"
              >
                {isLogging ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Log</>}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Weight Trend Chart */}
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="glass-panel p-6 rounded-3xl mb-6 relative overflow-hidden"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-1">
                <Scale className="w-4 h-4 text-purple-400" />
                Weight Fluctuation
              </h3>
              <p className="text-3xl font-bold flex items-baseline gap-2">
                {user.weight} <span className="text-lg text-muted-foreground">kg</span>
              </p>
            </div>
            {user.targetWeight && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground font-semibold">TARGET</p>
                <p className="text-lg font-bold text-purple-400">{user.targetWeight} kg</p>
              </div>
            )}
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={finalWeightLogs} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="currentColor" fontSize={10} className="text-muted-foreground opacity-50" tickLine={false} axisLine={false} />
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} stroke="currentColor" fontSize={10} className="text-muted-foreground opacity-50" tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Weight" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Macro Distributions */}
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="glass-panel p-6 rounded-3xl mb-6"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-orange-400" />
                Macronutrient Density
              </h3>
              <p className="text-xs text-muted-foreground">Caloric composition over the last 7 days.</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={renderMacroLogs} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="currentColor" fontSize={10} className="text-muted-foreground opacity-50" tickLine={false} axisLine={false} />
                <YAxis stroke="currentColor" fontSize={10} className="text-muted-foreground opacity-50" tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Legend className="text-xs mt-2" />
                <Bar dataKey="Protein" stackId="a" fill="#60a5fa" radius={[0, 0, 4, 4]} />
                <Bar dataKey="Carbs" stackId="a" fill="#f97316" />
                <Bar dataKey="Fats" stackId="a" fill="#34d399" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Progress Photos */}
        {photos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-6 rounded-3xl mb-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-1">
                  <Camera className="w-4 h-4 text-pink-400" />
                  Progress Photos
                </h3>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {photos.map((p, i) => (
                <div key={i} className="relative aspect-[3/4] bg-secondary rounded-xl overflow-hidden group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.photoUrl} alt="Progress" className="w-full h-full object-cover transition duration-300 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-3">
                    <div>
                      <p className="text-white text-xs font-bold">{p.date}</p>
                      <p className="text-white/80 text-[10px]">{p.weight} kg</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
