"use client";

import { useEffect, useState } from "react";

type Theme = "warm" | "modern";

/**
 * Ideiglenes ellenőrző komponens az 1. lépéshez: bizonyítja, hogy a `warm` és
 * `modern` paletta futásidőben vált a <html data-theme> attribútumon át, pusztán
 * CSS-változók cseréjével (újrarenderelés/oldalfrissítés nélkül). A végleges
 * verzió a Profil/Beállítások nézetbe kerül (Tweaks).
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("warm");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <div className="glass inline-flex gap-1 rounded-pill p-1 text-sm font-semibold">
      {(["warm", "modern"] as const).map((t) => (
        <button
          key={t}
          onClick={() => setTheme(t)}
          className={`relative z-[1] rounded-pill px-4 py-1.5 transition ${
            theme === t ? "bg-primary text-white shadow-card" : "text-ink-muted"
          }`}
        >
          {t === "warm" ? "Meleg" : "Modern"}
        </button>
      ))}
    </div>
  );
}
