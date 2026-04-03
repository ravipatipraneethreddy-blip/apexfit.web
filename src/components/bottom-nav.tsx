"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Flame, Dumbbell, TrendingUp, UserCircle } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/diet", label: "Diet", icon: Flame },
  { href: "/workout", label: "Workout", icon: Dumbbell },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/profile", label: "Profile", icon: UserCircle },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Hide on onboarding
  if (pathname === "/onboarding") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* Gradient fade above nav */}
      <div className="h-6 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      <div className="bg-background/90 backdrop-blur-xl border-t border-border">
        <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center gap-0.5 py-2 px-3 min-w-[56px] group"
              >
                {/* Active indicator glow */}
                {isActive && (
                  <motion.div
                    layoutId="nav-glow"
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-primary"
                    style={{ boxShadow: "0 0 12px 2px rgba(0,229,255,0.6)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                <motion.div
                  whileTap={{ scale: 0.85 }}
                  className={`transition-colors duration-200 ${
                    isActive
                      ? "text-primary drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]"
                      : "text-muted-foreground group-hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.8} />
                </motion.div>

                <span
                  className={`text-[10px] font-medium transition-colors duration-200 ${
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Safe area for phones with home indicator */}
        <div className="h-[env(safe-area-inset-bottom,0px)]" />
      </div>
    </nav>
  );
}
