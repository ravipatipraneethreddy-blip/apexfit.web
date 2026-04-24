/**
 * Native UI initialization — splash screen, status bar, safe areas.
 * Only runs when inside a Capacitor native shell.
 */

import { isNative } from "./platform";

export async function initNativeUI() {
  if (!isNative()) return;

  try {
    // Status Bar
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setStyle({ style: Style.Dark });
    try {
      await StatusBar.setBackgroundColor({ color: "#000000" });
    } catch {
      // setBackgroundColor not supported on iOS — ignore
    }
  } catch (err) {
    console.warn("[NativeUI] StatusBar plugin not available:", err);
  }

  try {
    // Splash Screen
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide();
  } catch (err) {
    console.warn("[NativeUI] SplashScreen plugin not available:", err);
  }
}
