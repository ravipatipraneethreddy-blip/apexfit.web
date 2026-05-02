"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  color?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  color = "text-primary",
}: EmptyStateProps) {
  const ActionButton = () => (
    <button
      onClick={onAction}
      className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition neon-glow shadow-lg shadow-primary/20"
    >
      {actionLabel}
    </button>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center text-center py-12 px-6"
    >
      {/* Animated icon with pulsing ring */}
      <div className="relative mb-6">
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className={`w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center`}
        >
          <Icon className={`w-10 h-10 ${color} opacity-60`} />
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full border-2 border-primary/20"
        />
      </div>

      <h3 className="text-lg font-bold mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-[260px] leading-relaxed mb-6">
        {description}
      </p>

      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <ActionButton />
        </Link>
      )}
      {actionLabel && onAction && !actionHref && <ActionButton />}
    </motion.div>
  );
}
