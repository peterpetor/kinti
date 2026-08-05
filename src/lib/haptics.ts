/**
 * haptics.ts — könnyű haptikus visszajelzés (Vibration API).
 *
 * ⚠️ EZ CSAK ANDROIDON HAT. Az iOS Safari egyáltalán nem támogatja a
 * `navigator.vibrate`-et (nem hibázik, csak nem csinál semmit) — vagyis a
 * minták finomhangolása iPhone-on NEM érzékelhető. Ezért van a `hapticTamogatott()`:
 * a beállításban a kapcsoló csak ott jelenik meg, ahol tényleg csinál valamit.
 * Egy kapcsoló, ami semmit nem kapcsol, rosszabb a semminél.
 *
 * ⚠️ A VIBRATION API NEM TUD INTENZITÁST, CSAK IDŐTARTAMOT. Az Apple HIG
 * „növekvő intenzitású" mintáját ezért NÖVEKVŐ IMPULZUS-HOSSZAL közelítjük: a
 * hosszabb rezgés erősebbnek érződik. A tömb páros indexei a rezgések, a
 * páratlanok a köztük lévő szünetek.
 */
export type HapticKind = "tap" | "selection" | "success" | "warning";

const PATTERNS: Record<HapticKind, number | number[]> = {
  /** Egyszerű koppanás — gombnyomás. */
  tap: 10,
  /** Egyetlen, épphogy érezhető pöccintés — mint egy fizikai tárcsa fogaskereke. */
  selection: 8,
  /** Két gyors, enyhe rezgés: „kész van". */
  success: [15, 40, 15],
  /**
   * Három mikro-rezgés, EMELKEDŐ hosszal (10 → 18 → 30 ms) — ez adja a
   * „valami nem stimmel" érzetet. Korábban két azonos, hosszú (30 ms) rezgés
   * volt, ami a sikertől csak a hosszában különbözött: a kettő tapintásra
   * összemosódott, pedig ellentétes dolgot jelentenek.
   */
  warning: [10, 40, 18, 40, 30],
};

const TAROLO_KULCS = "kinti:haptika";

/** Van-e egyáltalán rezgés ezen az eszközön (iOS-en soha). */
export function hapticTamogatott(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
}

/**
 * Modul-szintű gyorsítótár. A `haptic()` érintésenként fut, és a localStorage
 * olvasása szinkron, fő szálon dolgozó művelet — koppintásonként újraolvasni
 * felesleges. `null` = még nem olvastuk be.
 */
let bekapcsolvaCache: boolean | null = null;

/** Kéri-e a felhasználó a rezgést? Alapból igen. */
export function hapticBekapcsolva(): boolean {
  if (bekapcsolvaCache !== null) return bekapcsolvaCache;
  if (typeof localStorage === "undefined") return true;
  try {
    bekapcsolvaCache = localStorage.getItem(TAROLO_KULCS) !== "0";
  } catch {
    bekapcsolvaCache = true; // privát mód / letiltott tároló
  }
  return bekapcsolvaCache;
}

export function hapticBeallit(bekapcsolva: boolean): void {
  bekapcsolvaCache = bekapcsolva;
  try {
    localStorage.setItem(TAROLO_KULCS, bekapcsolva ? "1" : "0");
  } catch {
    /* privát mód — a beállítás a munkamenetre marad érvényben */
  }
}

export function haptic(kind: HapticKind = "tap"): void {
  if (!hapticTamogatott()) return;
  if (!hapticBekapcsolva()) return;
  try {
    navigator.vibrate(PATTERNS[kind]);
  } catch {
    /* nem támogatott — csendben kihagyjuk */
  }
}
