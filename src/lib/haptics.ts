/**
 * haptics.ts — könnyű haptikus visszajelzés (Vibration API). Csak ott hat, ahol
 * a böngésző/eszköz támogatja (jellemzően Android); iOS Safari figyelmen kívül
 * hagyja, de nem hibázik. Natív-érzet a tab-váltáshoz és a fő akciókhoz.
 */
export type HapticKind = "tap" | "selection" | "success" | "warning";

const PATTERNS: Record<HapticKind, number | number[]> = {
  tap: 10,
  selection: 8,
  success: [15, 40, 15],
  warning: [30, 40, 30],
};

export function haptic(kind: HapticKind = "tap"): void {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  try {
    navigator.vibrate(PATTERNS[kind]);
  } catch {
    /* nem támogatott — csendben kihagyjuk */
  }
}
