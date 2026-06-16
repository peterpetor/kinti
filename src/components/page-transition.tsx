"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * PageTransition — natív-szerű belépő-animáció minden route-váltáskor.
 *
 * A `key={pathname}` miatt a tartalom újra-mountolódik navigációkor, így a
 * `.kinti-page-in` CSS-animáció (lágy fade + felfelé csúszás) minden oldalon
 * lejátszódik. Next 14-en ez a megbízható megoldás (a View Transitions API
 * config-flag csak Next 15+), next-on-pages-en is stabil, függőség nélkül.
 *
 * A `prefers-reduced-motion`-t a CSS kezeli (globals.css).
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="kinti-page-in">
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
