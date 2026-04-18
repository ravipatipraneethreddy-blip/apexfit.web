"use client";

import { useEffect, useState } from "react";
import { logMeal } from "@/actions/diet.actions";
import { logWorkout } from "@/actions/workout.actions";
import { WifiOff, RefreshCw } from "lucide-react";

declare global {
  interface Window {
    __isSyncing: boolean;
  }
}

interface OfflineQueueItem {
  id: string;
  timestamp: number;
  type: "MEAL" | "WORKOUT";
  formDataObj: Record<string, string>;
  status: "PENDING" | "SYNCING" | "FAILED";
  retryCount: number;
}

export function OfflineSyncProvider() {
  const [isOffline, setIsOffline] = useState(false);
  const [isSyncingUI, setIsSyncingUI] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);

    const handleOnline = async () => {
      setIsOffline(false);
      await processOfflineQueue();
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check in case it came online before hydration
    if (navigator.onLine) {
      processOfflineQueue();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const processOfflineQueue = async () => {
    if (window.__isSyncing) return;

    try {
      window.__isSyncing = true;
      setIsSyncingUI(true);

      const items: OfflineQueueItem[] = JSON.parse(
        localStorage.getItem("apexfit-offline-queue") || "[]"
      );

      let processedCount = 0;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.status === "SYNCING") continue;
        if (item.retryCount >= 3) {
          items[i].status = "FAILED";
          continue;
        }

        items[i].status = "SYNCING";
        localStorage.setItem("apexfit-offline-queue", JSON.stringify(items));

        const fd = new FormData();
        Object.entries(item.formDataObj).forEach(([k, v]) => fd.append(k, v));

        try {
          if (item.type === "MEAL") {
            await logMeal(fd);
          } else if (item.type === "WORKOUT") {
            await logWorkout(fd);
          }
          // Remove item intrinsically on success
          items.splice(i, 1);
          i--; // Adjust index since we spliced
          processedCount++;
        } catch (err) {
          console.error("Failed offline sync iteration:", err);
          items[i].status = "FAILED";
          items[i].retryCount += 1;
        }
        
        // Write the array back after each item explicitly
        localStorage.setItem("apexfit-offline-queue", JSON.stringify(items));
      }

      if (processedCount > 0) {
        // You could trigger a router.refresh() here if you wanted the layout to pop with new actual DB entries.
      }
    } finally {
      window.__isSyncing = false;
      setIsSyncingUI(false);
    }
  };

  if (!isOffline && !isSyncingUI) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-[100] bg-amber-500/90 text-amber-950 backdrop-blur-sm px-4 py-1.5 flex items-center justify-center gap-2 text-xs font-semibold shadow-md">
      {isSyncingUI ? (
        <>
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Syncing offline data...</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Mode. Changes queue locally.</span>
        </>
      )}
    </div>
  );
}
