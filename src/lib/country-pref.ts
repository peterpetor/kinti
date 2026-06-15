/**
 * Választott Kinti ország — a felhasználó „melyik ország Kintijét nézem"
 * beállítása a böngésző localStorage-jában (`kinti.country`).
 *
 * A canton-pref.ts mintáját követi: `kinti:country` CustomEvent a tabon belüli,
 * a `storage` event a tabok közti szinkronhoz. NEM kerül a szerverre —
 * kizárólag kliensoldali UX-segéd.
 */

import { useCallback, useEffect, useState } from "react";
import { isValidCountry, DEFAULT_COUNTRY } from "./countries";

export const COUNTRY_KEY = "kinti.country";
export const COUNTRY_EVENT = "kinti:country";

/** A választott ország kódja, vagy `null` ha a felhasználó még nem választott. */
export function readPreferredCountry(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(COUNTRY_KEY);
    return isValidCountry(v) ? v : null;
  } catch {
    return null;
  }
}

/** Választott-e már a felhasználó országot (a belépés-előtti gate-hez). */
export function hasChosenCountry(): boolean {
  return readPreferredCountry() !== null;
}

/** A választott ország kódja, vagy az alapértelmezett (CH) ha még nincs. */
export function effectiveCountry(): string {
  return readPreferredCountry() ?? DEFAULT_COUNTRY;
}

/** Beállítja a választott országot és értesíti a komponenseket. */
export function setPreferredCountry(code: string): void {
  if (typeof window === "undefined") return;
  if (!isValidCountry(code)) return;
  try {
    localStorage.setItem(COUNTRY_KEY, code);
  } catch {
    /* private mode / quota → csak az esemény megy ki */
  }
  try {
    window.dispatchEvent(new CustomEvent(COUNTRY_EVENT, { detail: code }));
  } catch {
    /* ignore */
  }
}

/**
 * React hook: a választott ország (vagy `null`) + egy setter. Reagál a tabon
 * belüli (`kinti:country`) és a tabok közti (`storage`) változásra is.
 */
export function usePreferredCountry(): [string | null, (code: string) => void] {
  const [country, setCountry] = useState<string | null>(null);

  useEffect(() => {
    setCountry(readPreferredCountry());
    const onChange = () => setCountry(readPreferredCountry());
    const onStorage = (e: StorageEvent) => {
      if (e.key === COUNTRY_KEY) setCountry(readPreferredCountry());
    };
    window.addEventListener(COUNTRY_EVENT, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(COUNTRY_EVENT, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const set = useCallback((code: string) => {
    setPreferredCountry(code);
    if (isValidCountry(code)) setCountry(code);
  }, []);

  return [country, set];
}
