"use client";

import { shiftDate } from "@/lib/dates";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export function DateNavigator({ initialDate, today }: { initialDate: string; today: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateStr = initialDate;
  const currentDate = new Date(dateStr + "T12:00:00Z");

  const isToday = dateStr === today;

  const handlePrevDay = () => router.push(`/diet?date=${shiftDate(dateStr, -1)}`, {scroll:false});
  const handleNextDay = () => router.push(`/diet?date=${shiftDate(dateStr, 1)}`, {scroll:false});

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
          {isToday ? "Today" : currentDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" })}
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

