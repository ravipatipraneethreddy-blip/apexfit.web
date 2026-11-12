"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import BottomNav from "./bottom-nav";

const HIDDEN_NAV_PATHS = ["/onboarding", "/login", "/register"];

import { ReminderRunner } from "./reminders";
import { OfflineSyncProvider } from "./offline-sync-provider";
import { PullToRefresh } from "./pull-to-refresh";
import { initNativeUI } from "@/lib/native/native-ui";

export default function AppShell({ children, userId }: { children: React.ReactNode; userId?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const showNav = !HIDDEN_NAV_PATHS.includes(pathname);

  useEffect(() => {
    const zone = encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const savedZone = document.cookie.split('; ').find(part => part.startsWith('apexfit-timezone='))?.split('=')[1];
    if (savedZone !== zone) {
      document.cookie = `apexfit-timezone=${zone}; Path=/; Max-Age=31536000; SameSite=Lax`;
      router.refresh();
    }
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
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "l") {
        e.preventDefault();
        router.push("/workout");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return (
    <>
      <OfflineSyncProvider key={userId || 'signed-out'} userId={userId} />
      <ReminderRunner key={userId || 'signed-out'} userId={userId} />
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

