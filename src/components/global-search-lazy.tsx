"use client";

import dynamic from "next/dynamic";

// ⚠️ `loading` KELL: enélkül az `ssr: false` bailout a legközelebbi
// Suspense-határig kúszik fel (a layoutban a route-szintű határig), és a
// teljes lap kliens-oldali renderre esik. Ld. home-lazy.tsx indoklás.

/**
 * A GlobalSearchOverlay (mindenkereső) LAZY betöltése. Az overlay minden (app)
 * oldalon ott ül, de a userek töredéke nyitja meg — eddig mégis minden oldal
 * first-load bundle-jében és hidratálásában benne volt (~505 soros komponens +
 * app-destinations index). ssr:false + dynamic → külön chunkba kerül, a kezdő
 * render után töltődik; a Ctrl/⌘+K és a fejléc-gomb (kinti:open-global-search
 * esemény) figyelői a mount után állnak fel — érzékelhető különbség nélkül.
 */
export const GlobalSearchOverlayLazy = dynamic(
  () => import("./global-search").then((m) => m.GlobalSearchOverlay),
  { ssr: false, loading: () => null },
);
