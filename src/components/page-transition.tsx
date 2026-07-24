"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function segmentDepth(path: string): number {
  return path.split("/").filter(Boolean).length;
}

/**
 * PageTransition — natív-szerű, IRÁNY-TUDATOS belépő-animáció route-váltáskor.
 *
 * A `key={pathname}` miatt a tartalom újra-mountolódik navigációkor, a
 * `.kinti-page-in-*` CSS-animáció pedig minden oldalon lejátszódik. Az irányt
 * (forward/back/cross) a route-mélység (szegmens-szám) változásából +
 * popstate-ből (böngésző vissza/előre, edge-swipe) számoljuk RENDER KÖZBEN
 * (ref-be, nem state-be) — így az első festésnél már a helyes osztály van a
 * DOM-on, nincs "rossz irányból induló, majd újrainduló" villanás. Next 14-en
 * ez a megbízható, függőség-mentes megoldás (a View Transitions API csak
 * Next 15+; a next-on-pages-en is stabil).
 *
 * A `prefers-reduced-motion`-t a CSS kezeli (globals.css).
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prevPathRef = useRef(pathname);
  const isPopRef = useRef(false);
  const directionRef = useRef<"forward" | "back" | "cross">("cross");

  useEffect(() => {
    const onPopState = () => {
      isPopRef.current = true;
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  if (prevPathRef.current !== pathname) {
    const wasPop = isPopRef.current;
    isPopRef.current = false;
    const prevDepth = segmentDepth(prevPathRef.current);
    const nextDepth = segmentDepth(pathname);
    directionRef.current = wasPop || nextDepth < prevDepth ? "back" : nextDepth > prevDepth ? "forward" : "cross";
    prevPathRef.current = pathname;
  }

  return (
    <div key={pathname} className={`kinti-page-in-${directionRef.current}`}>
      {children}
    </div>
  );
}

/**
 * ScrollRestorer — tab-szintű scroll-pozíció megőrzés (natív tab-bar viselkedés).
 *
 * Route-onként sessionStorage-be menti a görgetést, és visszalépéskor /
 * tab-váltáskor visszaállítja. Új (még nem látott) oldalon a tetejére ugrik.
 */
export function ScrollRestorer() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Hash-horgony (#section) esetén a böngészőre bízzuk a görgetést.
    if (window.location.hash) return;
    const key = `kinti:scroll:${pathname}`;

    // Visszaállítás festés után, hogy a tartalom már elrendeződjön.
    let raf = 0;
    try {
      const saved = sessionStorage.getItem(key);
      const y = saved ? parseInt(saved, 10) : 0;
      raf = requestAnimationFrame(() => window.scrollTo(0, Number.isFinite(y) ? y : 0));
    } catch {
      /* ignore */
    }

    // Folyamatos mentés (throttle), hogy visszatéréskor pontos legyen.
    let t: ReturnType<typeof setTimeout> | null = null;
    const onScroll = () => {
      if (t) return;
      t = setTimeout(() => {
        t = null;
        try {
          sessionStorage.setItem(key, String(window.scrollY));
        } catch {
          /* ignore */
        }
      }, 150);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      if (t) clearTimeout(t);
    };
  }, [pathname]);

  return null;
}
