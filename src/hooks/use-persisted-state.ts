"use client";

import { useEffect, useState } from "react";

/**
 * `useState`, ami localStorage-ban megjegyzi az értéket — így a kalkulátorok
 * inputjai és a szűrők visszatéréskor is megmaradnak.
 *
 * HYDRATION-BIZTOS: az SSR és az első kliens-render is az `initial`-t használja
 * (nincs szerver/kliens eltérés), majd mount UTÁN beolvassa a mentett értéket.
 * Minden változáskor elmenti.
 */
export function usePersistedState<T>(
  key: string,
  initial: T,
): [T, (v: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(initial);

  // Mount után: beolvasás localStorage-ból (ha van mentett érték).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw != null) setState(JSON.parse(raw) as T);
    } catch {
      /* sérült/elérhetetlen localStorage → marad az initial */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const set = (v: T | ((prev: T) => T)) => {
    setState((prev) => {
      const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  return [state, set];
}
