"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// ⚠️ SAJÁT Suspense KELL: enélkül az `ssr: false` bailout a legközelebbi
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
const Belso = dynamic(() => import("./global-search").then((m) => m.GlobalSearchOverlay), {
  ssr: false,
});

/**
 * ⚠️ SAJÁT `<Suspense>` HATÁR. Az `ssr: false` SSR közben kliens-renderre
 * bailoutol, és a bailout a LEGKÖZELEBBI Suspense-határig kúszik fel. Ez a
 * komponens az (app) layoutban ül, tehát határ nélkül a MINDEN oldalra közös
 * route-határt vinné magával. A `loading:` erre NEM elég — mérve: a függő
 * `<!--$?-->` határ és a hiányzó lezárás tőle változatlan maradt.
 */
export function GlobalSearchOverlayLazy() {
  return (
    <Suspense fallback={null}>
      <Belso />
    </Suspense>
  );
}
