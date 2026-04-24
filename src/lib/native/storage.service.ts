/**
 * Cross-platform storage service.
 * Uses Capacitor Preferences API on native, localStorage on web.
 */

import { isNative } from "./platform";

async function getPreferences() {
  try {
    const { Preferences } = await import("@capacitor/preferences");
    return Preferences;
  } catch {
    return null;
  }
}

export async function storageGet(key: string): Promise<string | null> {
  if (isNative()) {
    const Preferences = await getPreferences();
    if (Preferences) {
      const { value } = await Preferences.get({ key });
      return value;
    }
  }
  if (typeof window !== "undefined") {
    return localStorage.getItem(key);
  }
  return null;
}

export async function storageSet(key: string, value: string): Promise<void> {
  if (isNative()) {
    const Preferences = await getPreferences();
    if (Preferences) {
      await Preferences.set({ key, value });
      return;
    }
  }
  if (typeof window !== "undefined") {
    localStorage.setItem(key, value);
  }
}

export async function storageRemove(key: string): Promise<void> {
  if (isNative()) {
    const Preferences = await getPreferences();
    if (Preferences) {
      await Preferences.remove({ key });
      return;
    }
  }
  if (typeof window !== "undefined") {
    localStorage.removeItem(key);
  }
}
