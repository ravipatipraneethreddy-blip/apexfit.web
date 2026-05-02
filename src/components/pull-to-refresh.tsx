"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

const THRESHOLD = 80;

export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef(0);
  const isPullingRef = useRef(false);
  const controls = useAnimation();

  const handleTouchStart = useCallback((e: TouchEvent) => {
    // Only start if scrolled to top
    if (window.scrollY <= 0) {
      startYRef.current = e.touches[0].clientY;
      isPullingRef.current = true;
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isPullingRef.current || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - startYRef.current;

      if (diff > 0 && window.scrollY <= 0) {
        // Dampen the pull (feels more natural)
        const dampened = Math.min(diff * 0.4, 120);
        setPullDistance(dampened);
      }
    },
    [isRefreshing]
  );

  const handleTouchEnd = useCallback(() => {
    isPullingRef.current = false;

    if (pullDistance >= THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(THRESHOLD * 0.6);

      // Trigger refresh
      setTimeout(() => {
        router.refresh();
        setIsRefreshing(false);
        setPullDistance(0);
      }, 1000);
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, isRefreshing, router]);

  useEffect(() => {
    const el = document;
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: true });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const progress = Math.min(pullDistance / THRESHOLD, 1);

  return (
    <div ref={containerRef} className="relative">
      {/* Pull indicator */}
      <motion.div
        className="absolute left-0 right-0 flex items-center justify-center z-50 pointer-events-none"
        style={{ top: -40 }}
        animate={{ y: pullDistance }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <motion.div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isRefreshing
              ? "bg-primary/20 text-primary"
              : "bg-secondary text-muted-foreground"
          }`}
          animate={{ rotate: isRefreshing ? 360 : progress * 180 }}
          transition={
            isRefreshing
              ? { duration: 0.8, repeat: Infinity, ease: "linear" }
              : { duration: 0 }
          }
        >
          <RefreshCw className="w-5 h-5" />
        </motion.div>
      </motion.div>

      {/* Content with pull offset */}
      <motion.div
        animate={{ y: pullDistance > 0 ? pullDistance * 0.3 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
