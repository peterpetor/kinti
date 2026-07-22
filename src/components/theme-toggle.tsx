"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icons";
import { applyThemeColor } from "@/lib/theme-color";

type Theme = "warm" | "dark";

const STORAGE_KEY = "kinti-theme";

/** A jelenlegi témát a <html data-theme>-ből olvassuk (ezt a layout inline
 *  szkriptje már beállította a localStorage-ból betöltéskor). */
function currentTheme(): Theme {
  if (typeof document !== "undefined" && document.documentElement.dataset.theme === "dark") {
    return "dark";
  }
  return "warm";
}

/**
 * Téma-váltó (Világos / Sötét). A választást ELMENTI (localStorage) és azonnal
 * alkalmazza a <html data-theme>-en. A gomb állapota a TÉNYLEGES aktuális témát
 * tükrözi (nem resetel „Világos”-ra a menü újranyitásakor). A betöltéskori
 * alkalmazást a layout inline szkriptje végzi (FOUC nélkül, reload után is él);
 * a korábbi „modern” mentett értéket ugyanez migrálja „dark”-ra.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(currentTheme);

  const choose = (t: Theme) => {
    setTheme(t);
    const apply = () => {
      document.documentElement.dataset.theme = t;
      // A böngésző-króm (címsor/PWA-fejléc) színe is átvált — natív érzet.
      applyThemeColor(t);
    };
    // View Transition: a TELJES oldal (szöveg, kártyák, képek) puha átúszása a
    // két téma között — natív téma-váltás érzet. Progressive enhancement:
    // támogatás nélkül / reduced-motion alatt azonnali váltás (a body
    // háttér-átúszása akkor is megvan).
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    if (!reduce && typeof doc.startViewTransition === "function") {
      doc.startViewTransition(apply);
    } else {
      apply();
    }
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* privát mód / letiltott storage — a téma legalább a munkamenetre él */
    }
  };

  return (
    <div className="glass inline-flex gap-1 rounded-pill p-1 text-sm font-semibold">
      {(["warm", "dark"] as const).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => choose(t)}
          className={`relative z-[1] inline-flex items-center gap-1.5 rounded-pill px-4 py-1.5 transition ${
            theme === t ? "bg-primary text-white shadow-card" : "text-ink-muted"
          }`}
        >
          <Icon name={t === "warm" ? "sun" : "moon"} size={14} strokeWidth={2.2} />
          {t === "warm" ? "Világos" : "Sötét"}
        </button>
      ))}
    </div>
  );
}
