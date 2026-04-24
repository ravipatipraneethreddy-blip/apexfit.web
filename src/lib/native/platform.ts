/**
 * Platform detection utilities for Capacitor native shell vs web browser.
 * 
 * Uses dynamic imports to avoid build errors when @capacitor/core
 * is not available (e.g., during SSR or when running on the web without Capacitor).
 */

let _isNative: boolean | null = null;
let _platform: string | null = null;

async function loadCapacitor() {
  try {
    const { Capacitor } = await import("@capacitor/core");
    _isNative = Capacitor.isNativePlatform();
    _platform = Capacitor.getPlatform();
  } catch {
    _isNative = false;
    _platform = "web";
  }
}

// Initialize on module load (client-side only)
if (typeof window !== "undefined") {
  loadCapacitor();
}

/**
 * Returns true if the app is running inside a Capacitor native shell
 * (Android/iOS), false if running in a regular browser.
 */
export function isNative(): boolean {
  if (_isNative === null) return false; // SSR or not yet loaded
  return _isNative;
}

/**
 * Returns the current platform: 'ios', 'android', or 'web'.
 */
export function getPlatform(): "ios" | "android" | "web" {
  if (_platform === null) return "web";
  return _platform as "ios" | "android" | "web";
}

export function isAndroid(): boolean {
  return getPlatform() === "android";
}

export function isIOS(): boolean {
  return getPlatform() === "ios";
}
