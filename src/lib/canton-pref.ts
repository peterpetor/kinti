/**
 * Preferált kanton — a felhasználó „hol élek" beállítása, a böngésző
 * localStorage-jában (`kinti.canton`). Ez a kanton-személyre szabás egyetlen
 * forrása: a böngésző-nézetek (Szaknévsor stb.) erre szűrnek alapból, a
 * beküldő-űrlapok ezt ajánlják fel, a push-célzás ezt használja.
 *
 * Történeti okból ugyanazt a kulcsot és `kinti:canton` CustomEvent-et használja,
 * amit az időjárás-widget már bevezetett — így a komponensek tabon belül
 * azonnal szinkronban maradnak (a `storage` event a tabok közti szinkront adja).
 *
 * NEM kerül a szerverre — kizárólag kliensoldali UX-segéd (GDPR-tiszta).
 */

import { useCallback, useEffect, useState } from "react";
import { COUNTRIES } from "./countries";
import { getRegions } from "./regions";

export const CANTON_KEY = "kinti.canton";
export const CANTON_EVENT = "kinti:canton";

/**
 * Érvényes régiókód, ha valamelyik ÉLŐ ország (CH kanton / AT Bundesland / …)
 * régiói közt szerepel. Így az időjárás- és egyéb választók nem-CH országban is
 * elmentik a választást (a kódok ország-egyediek a CH+AT halmazon). Az egyes
 * nézetek a saját országukhoz külön validálnak.
 */
function isValidCode(code: string | null | undefined): code is string {
  if (!code || code === "all") return false;
  return COUNTRIES.some((c) => c.enabled && getRegions(c.code).some((r) => r.code === code));
}

/** A beállított preferált kanton kódja, vagy `null` ha nincs / „egész Svájc". */
export function readPreferredCanton(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(CANTON_KEY);
    return isValidCode(v) ? v : null;
  } catch {
    return null;
  }
}

/** Beállítja (vagy `null`/„all" esetén törli) a preferált kantont, és értesít. */
export function setPreferredCanton(code: string | null): void {
  if (typeof window === "undefined") return;
  const normalized = isValidCode(code) ? code : null;
  try {
    if (normalized) localStorage.setItem(CANTON_KEY, normalized);
    else localStorage.removeItem(CANTON_KEY);
  } catch {
    /* private mode / quota → csak az esemény megy ki */
  }
  try {
    window.dispatchEvent(new CustomEvent(CANTON_EVENT, { detail: normalized }));
  } catch {
    /* ignore */
  }
}

/**
 * React hook: a preferált kanton (vagy `null`) + egy setter. Reagál a tabon
 * belüli (`kinti:canton`) és a tabok közti (`storage`) változásra is.
 */
export function usePreferredCanton(): [string | null, (code: string | null) => void] {
  const [canton, setCanton] = useState<string | null>(null);

  useEffect(() => {
    setCanton(readPreferredCanton());
    const onChange = () => setCanton(readPreferredCanton());
    const onStorage = (e: StorageEvent) => {
      if (e.key === CANTON_KEY) setCanton(readPreferredCanton());
    };
    window.addEventListener(CANTON_EVENT, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(CANTON_EVENT, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const set = useCallback((code: string | null) => {
    setPreferredCanton(code);
    setCanton(isValidCode(code) ? code : null);
  }, []);

  return [canton, set];
}
