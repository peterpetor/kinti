"use client";

import { useEffect, useState } from "react";

/**
 * ReadingProgress — vékony olvasás-folyamat sáv a hosszú cikkek tetején
 * (tudásbázis, élettörténetek). Natív olvasó-appok mintája: görgetéskor a
 * viewport tetején látszik, mennyi van hátra. Scroll-vezérelt (nem animáció,
 * a felhasználó mozgatja) → nem igényel reduced-motion guardot; passzív
 * listener, rAF-throttle (nincs scroll-jank).
 */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[90] h-[3px] w-full"
      style={{ marginTop: "env(safe-area-inset-top)" }}
    >
      <div
        className="h-full origin-left bg-primary/80"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
