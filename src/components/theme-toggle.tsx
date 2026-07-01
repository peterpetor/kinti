"use client";

import { useState } from "react";

type Theme = "warm" | "modern";

const STORAGE_KEY = "kinti-theme";

/** A jelenlegi témát a <html data-theme>-ből olvassuk (ezt a layout inline
 *  szkriptje már beállította a localStorage-ból betöltéskor). */
function currentTheme(): Theme {
  if (typeof document !== "undefined" && document.documentElement.dataset.theme === "modern") {
    return "modern";
  }
  return "warm";
}

/**
 * Téma-váltó (Meleg / Modern). A választást ELMENTI (localStorage) és azonnal
 * alkalmazza a <html data-theme>-en. A gomb állapota a TÉNYLEGES aktuális témát
 * tükrözi (nem resetel „Meleg”-re a menü újranyitásakor). A betöltéskori
 * alkalmazást a layout inline szkriptje végzi (FOUC nélkül, reload után is él).
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(currentTheme);

  const choose = (t: Theme) => {
    setTheme(t);
    document.documentElement.dataset.theme = t;
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* privát mód / letiltott storage — a téma legalább a munkamenetre él */
    }
  };

  return (
    <div className="glass inline-flex gap-1 rounded-pill p-1 text-sm font-semibold">
      {(["warm", "modern"] as const).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => choose(t)}
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
