import { Activity, Flame, TrendingUp, Trophy, UserCircle } from "lucide-react";
import Link from "next/link";

export function DashboardHeader({ user, workoutsCount }: { user: any; workoutsCount: number }) {
  return (
    <header className="flex items-center justify-between mb-8 pb-4 border-b border-border">
      <div className="flex items-center gap-2">
        <div className="bg-primary/20 text-primary p-2 rounded-lg">
          <Activity className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          Apex<span className="text-primary">Fit</span>
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-sm font-medium">{user.name || "Player 1"}</span>
          <span className="text-xs text-muted-foreground flex items-center justify-end gap-1">
            Level {workoutsCount + 1} • {user.streakDays || 0} Day Streak <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
          </span>
        </div>
        
        <div className="flex gap-2">
          <Link href="/progress" prefetch>
            <button className="p-2 bg-secondary rounded-xl hover:bg-secondary/70 transition" title="Progress & Analytics">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </button>
          </Link>
          <Link href="/social" prefetch>
            <button className="p-2 bg-secondary rounded-xl hover:bg-secondary/70 transition cursor-pointer" title="Leaderboard">
              <Trophy className="w-5 h-5 text-yellow-400" />
            </button>
          </Link>
        </div>
        <Link href="/profile" prefetch>
          <UserCircle className="w-10 h-10 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
        </Link>
      </div>
    </header>
  );
}
