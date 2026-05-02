"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import BottomNav from "./bottom-nav";

const HIDDEN_NAV_PATHS = ["/onboarding", "/login", "/register"];

import { OfflineSyncProvider } from "./offline-sync-provider";
import { PullToRefresh } from "./pull-to-refresh";
import { initNativeUI } from "@/lib/native/native-ui";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const showNav = !HIDDEN_NAV_PATHS.includes(pathname);

  useEffect(() => {
    // Initialize native UI (splash screen, status bar) when in Capacitor shell
    initNativeUI();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      // Cmd/Ctrl + M -> Diet (Meals)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "m") {
        e.preventDefault();
        router.push("/diet");
      }
      // Cmd/Ctrl + W -> Workout
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "w") {
        e.preventDefault();
        router.push("/workout");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return (
    <>
      <OfflineSyncProvider />
      <main className={showNav ? "pb-24" : ""}>
        {showNav ? (
          <PullToRefresh>{children}</PullToRefresh>
        ) : (
          children
        )}
      </main>
      {showNav && <BottomNav />}
    </>
  );
}
