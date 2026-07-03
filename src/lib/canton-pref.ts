/**
 * Preferált kanton/tartomány — a felhasználó „hol élek" beállítása a böngésző
 * localStorage-jában. Ez a régió-személyre szabás egyetlen forrása: a
 * böngésző-nézetek (Szaknévsor stb.) erre szűrnek alapból, a beküldő-űrlapok
 * ezt ajánlják fel, a push-célzás ezt használja.
 *
 * 2026-07-03-tól ORSZÁGONKÉNT tárol (`kinti.cantonByCountry` JSON-map): a
 * svájci kanton-választás nem írja felül az osztrák tartományt (bug volt:
 * Salzburg → CH-ra váltás → vissza AT-ra → Bécs). A régi egykulcsos
 * `kinti.canton` TÜKÖRKÉNT megmarad az AKTUÁLIS ország értékével, mert a
 * push-optin nyersen azt olvassa; első olvasáskor a régi érték átmigrálódik
 * a map megfelelő országába.
 *
 * NEM kerül a szerverre — kizárólag kliensoldali UX-segéd (GDPR-tiszta).
 */

import { useCallback, useEffect, useState } from "react";
import { effectiveCountry, COUNTRY_EVENT, COUNTRY_KEY } from "./country-pref";
import { COUNTRIES } from "./countries";
import { getRegions } from "./regions";

/** Legacy tükör-kulcs — a push-optin nyersen olvassa; mindig az aktuális ország értéke. */
export const CANTON_KEY = "kinti.canton";
/** Az igazság forrása: országonkénti map, pl. {"CH":"ZH","AT":"S"}. */
const CANTON_MAP_KEY = "kinti.cantonByCountry";
export const CANTON_EVENT = "kinti:canton";

function isValidCodeFor(country: string, code: string | null | undefined): code is string {
  if (!code || code === "all") return false;
  return getRegions(country).some((r) => r.code === code);
}

/** A map beolvasása; ha még nincs, EGYSZERI migráció a régi egykulcsos értékből. */
function readMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(CANTON_MAP_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed as Record<string, string>;
    }
    // Migráció: a régi kulcs kódját ahhoz az országhoz soroljuk, amelyikhez tartozik
    // (a kódok a CH+AT halmazon egyediek; ütközésnél az első élő ország nyer).
    const legacy = localStorage.getItem(CANTON_KEY);
    if (legacy) {
      const owner = COUNTRIES.find((c) => c.enabled && isValidCodeFor(c.code, legacy));
      if (owner) {
        const seeded = { [owner.code]: legacy };
        localStorage.setItem(CANTON_MAP_KEY, JSON.stringify(seeded));
        return seeded;
      }
    }
  } catch {
    /* private mode / hibás JSON → üres */
  }
  return {};
}

function writeMap(map: Record<string, string>): void {
  try {
    localStorage.setItem(CANTON_MAP_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

/** A legacy tükör frissítése az aktuális ország értékére (push-optin miatt). */
function mirrorLegacy(code: string | null): void {
  try {
    if (code) localStorage.setItem(CANTON_KEY, code);
    else localStorage.removeItem(CANTON_KEY);
  } catch {
    /* ignore */
  }
}

/** Az AKTUÁLIS ORSZÁG preferált régió-kódja, vagy `null` ha nincs / „egész ország". */
export function readPreferredCanton(): string | null {
  if (typeof window === "undefined") return null;
  const country = effectiveCountry();
  const map = readMap();
  const v = map[country] ?? null;
  const valid = isValidCodeFor(country, v) ? v : null;
  mirrorLegacy(valid);
  return valid;
}

/** Beállítja (vagy `null`/„all" esetén törli) az AKTUÁLIS ORSZÁG régióját, és értesít. */
export function setPreferredCanton(code: string | null): void {
  if (typeof window === "undefined") return;
  const country = effectiveCountry();
  const normalized = isValidCodeFor(country, code) ? code : null;
  const map = readMap();
  if (normalized) map[country] = normalized;
  else delete map[country];
  writeMap(map);
  mirrorLegacy(normalized);
  try {
    window.dispatchEvent(new CustomEvent(CANTON_EVENT, { detail: normalized }));
  } catch {
    /* ignore */
  }
}

/**
 * React hook: az aktuális ország preferált régiója (vagy `null`) + setter.
 * Reagál a tabon belüli (`kinti:canton`), a tabok közti (`storage`) ÉS az
 * ORSZÁG-VÁLTÁS (`kinti:country`) eseményre is — országváltáskor az új ország
 * mentett régiója töltődik be (nem a másik országé, és nem a főváros-default).
 */
export function usePreferredCanton(): [string | null, (code: string | null) => void] {
  const [canton, setCanton] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => setCanton(readPreferredCanton());
    refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === CANTON_MAP_KEY || e.key === CANTON_KEY || e.key === COUNTRY_KEY) refresh();
    };
    window.addEventListener(CANTON_EVENT, refresh);
    window.addEventListener(COUNTRY_EVENT, refresh);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(CANTON_EVENT, refresh);
      window.removeEventListener(COUNTRY_EVENT, refresh);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const set = useCallback((code: string | null) => {
    setPreferredCanton(code);
    setCanton(readPreferredCanton());
  }, []);

  return [canton, set];
}
