"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export function DateNavigator({ initialDate }: { initialDate: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateStr = searchParams.get("date") || initialDate;
  const currentDate = new Date(dateStr);

  const isToday = new Date().toDateString() === currentDate.toDateString();

  const handlePrevDay = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    router.push(`/diet?date=${prev.toISOString().substring(0, 10)}`, { scroll: false });
  };

  const handleNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    router.push(`/diet?date=${next.toISOString().substring(0, 10)}`, { scroll: false });
  };

  const handleToday = () => {
    router.push(`/diet`, { scroll: false });
  };

  return (
    <div className="flex items-center justify-between mb-8 py-3 px-4 glass-panel rounded-2xl">
      <button onClick={handlePrevDay} className="p-2 hover:bg-secondary rounded-xl transition">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <div className="flex flex-col items-center">
        <span className="font-bold tracking-tight">
          {isToday ? "Today" : currentDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
        </span>
        {!isToday && (
          <button onClick={handleToday} className="text-[10px] text-primary font-bold uppercase tracking-wider hover:underline mt-0.5 relative z-10">
            Back to Today
          </button>
        )}
      </div>
      <button onClick={handleNextDay} className="p-2 hover:bg-secondary rounded-xl transition">
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
