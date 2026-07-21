"use client";

import dynamic from "next/dynamic";

/**
 * Az /allasok oldal HAJTÁS ALATTI (a jobs-lista után álló) kliens-moduljainak
 * LAZY betöltése — a kezdőlap (`home-lazy.tsx`) és a `global-search-lazy.tsx`
 * bevált mintája szerint (`ssr:false` + dynamic).
 *
 * Miért biztonságos itt az `ssr:false`?
 *  • JobAlertRadar — push-értesítés feliratkozó widget, teljesen kliens-vezérelt
 *    (mount-on "checking" állapotból indul, service-worker/VAPID-detektálás). Az
 *    SSR-je nem SEO-érték. Ez a modul EGYEDÜL húzza be a push-client (VAPID)
 *    kódot, amit a fenti (eager) JobsBrowser NEM használ → valós bundle-nyereség.
 *  • JobSourcesSection — kizárólag KIFELÉ linkel, mindegyik `rel=...nofollow`
 *    (kifejezetten NEM SEO-cél), ország-tudatos kliens-render. Hajtás alatt.
 *
 * Mindkettő a hosszú állás-lista UTÁN áll, tehát a felhasználó odáig görgetésére
 * a chunk már rég beért; a min-height helyőrző csak CLS-biztosíték.
 */

/** aria-rejtett magasság-tartó helyőrző a lazy-szekciókhoz (CLS-védelem). */
function box(cls: string) {
  const Placeholder = () => <div className={cls} aria-hidden />;
  return Placeholder;
}

export const JobAlertRadarLazy = dynamic(
  () => import("./job-alert-radar").then((m) => m.JobAlertRadar),
  { ssr: false, loading: box("min-h-[220px]") },
);

export const JobSourcesSectionLazy = dynamic(
  () => import("./job-sources-section").then((m) => m.JobSourcesSection),
  { ssr: false, loading: box("min-h-[200px]") },
);
