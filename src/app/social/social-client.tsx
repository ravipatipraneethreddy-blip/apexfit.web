"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Flame, Medal } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { useEffect } from "react";

export default function SocialClient({ leaderboard }: { leaderboard: any[] }) {
  
  useEffect(() => {
    // Only fire confetti if the user is #1, but let's just fire it for fun on load for the demo
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#fbbf24", "#f59e0b", "#d97706"]
    });
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8 flex items-start justify-center font-sans tracking-tight">
      <div className="max-w-xl w-full">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/">
              <button className="p-2 rounded-xl bg-secondary hover:bg-secondary/70 transition">
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
            </Link>
            <h2 className="text-2xl font-bold tracking-tight">Leaderboard</h2>
          </div>
          <Trophy className="w-6 h-6 text-yellow-400" />
        </header>

        {/* Global Rankings */}
        <div className="glass-panel p-2 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400" />
          
          <div className="p-4 mb-2">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Global Top 10 by Streak</h3>
          </div>

          <div className="space-y-2 pb-2">
            {leaderboard.map((user, idx) => {
              const isFirst = idx === 0;
              const isSecond = idx === 1;
              const isThird = idx === 2;
              
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`flex items-center justify-between p-4 rounded-2xl mx-2 border ${
                    isFirst ? "bg-yellow-400/10 border-yellow-400/30" : 
                    isSecond ? "bg-slate-300/10 border-slate-300/20" : 
                    isThird ? "bg-amber-700/10 border-amber-700/20" : 
                    "bg-secondary/30 border-transparent hover:bg-secondary transition"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                      isFirst ? "bg-yellow-400 text-yellow-950 shadow-[0_0_15px_rgba(250,204,21,0.5)]" : 
                      isSecond ? "bg-slate-300 text-slate-900" : 
                      isThird ? "bg-amber-600 text-amber-50" : 
                      "bg-secondary text-muted-foreground"
                    }`}>
                      #{idx + 1}
                    </div>
                    <div>
                      <p className={`font-bold ${isFirst ? "text-yellow-400" : ""}`}>{user.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Medal className="w-3 h-3" /> {user.badges} Badges
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`text-xl font-black font-mono flex items-center gap-1.5 ${
                      isFirst ? "text-orange-400" : "text-foreground"
                    }`}>
                      {user.streakDays} <Flame className={`w-5 h-5 ${user.streakDays > 0 ? "text-orange-500 fill-orange-500" : "text-muted"}`} />
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Days</p>
                  </div>
                </motion.div>
              );
            })}
            
            {leaderboard.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                <Medal className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No rankings yet. Be the first!</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
