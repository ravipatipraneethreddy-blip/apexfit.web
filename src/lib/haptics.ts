"use client";

/**
 * Haptic Feedback Utility
 * Works on both web (navigator.vibrate) and native (Capacitor Haptics).
 * Gracefully degrades on unsupported platforms.
 */

type HapticStyle = "light" | "medium" | "heavy" | "success" | "warning" | "error";

const VIBRATE_PATTERNS: Record<HapticStyle, number[]> = {
  light: [10],
  medium: [30],
  heavy: [50],
  success: [20, 50, 20],
  warning: [30, 30, 30],
  error: [50, 30, 50, 30, 50],
};

export async function haptic(style: HapticStyle = "medium") {
  try {
    // Try Capacitor Haptics first (native)
    const { registerPlugin, Capacitor } = await import("@capacitor/core");
    const Haptics = Capacitor.isNativePlatform() ? registerPlugin<{impact(options:{style:string}):Promise<void>; notification(options:{type:string}):Promise<void>}>("Haptics") : null;
    const ImpactStyle = {Light:"LIGHT",Medium:"MEDIUM",Heavy:"HEAVY"};
    const NotificationType = {Success:"SUCCESS",Warning:"WARNING",Error:"ERROR"};

    if (Haptics) {
      if (style === "success" || style === "warning" || style === "error") {
        await Haptics.notification({
          type: style === "success"
            ? NotificationType!.Success
            : style === "warning"
            ? NotificationType!.Warning
            : NotificationType!.Error,
        });
      } else {
        await Haptics.impact({
          style: style === "light"
            ? ImpactStyle!.Light
            : style === "heavy"
            ? ImpactStyle!.Heavy
            : ImpactStyle!.Medium,
        });
      }
      return;
    }
  } catch {
    // Capacitor not available, fall through to web vibrate
  }

  // Fallback to web vibration API
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(VIBRATE_PATTERNS[style]);
  }
}

/**
 * Quick haptic tap — use on button presses, toggles, etc.
 */
export function hapticTap() {
  haptic("light");
}

/**
 * Success haptic — use on form submissions, completions
 */
export function hapticSuccess() {
  haptic("success");
}

