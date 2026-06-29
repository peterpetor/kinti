"use client";

import { useState, useEffect } from "react";

/**
 * Kliensoldali PRO-státusz a `/api/me/pro`-ból.
 * Visszatérés: `null` = még tölt, `true`/`false` = feloldva.
 * Hibánál biztonságosan `false` (zárva marad → nem szivárog PRO-tartalom).
 */
export function useIsPro(): boolean | null {
  const [pro, setPro] = useState<boolean | null>(null);
  useEffect(() => {
    let active = true;
    fetch("/api/me/pro")
      .then((r) => (r.ok ? r.json() : { pro: false }))
      .then((d) => { if (active) setPro(!!(d as { pro?: boolean })?.pro); })
      .catch(() => { if (active) setPro(false); });
    return () => { active = false; };
  }, []);
  return pro;
}
