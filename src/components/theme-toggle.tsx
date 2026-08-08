"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icons";
import { applyThemeColor } from "@/lib/theme-color";
import { systemTheme, kovetkezoValtas } from "@/lib/theme-schedule";

// A téma-típus és a napszak-logika a `lib/theme-schedule.ts`-ben él.
import type { Theme } from "@/lib/theme-schedule";
/** A választható MÓD — a „rendszer" nem téma, hanem „ne dönts helyettem". */
type Mode = "system" | Theme;

const STORAGE_KEY = "kinti-theme";

/**
 * A jelenlegi MÓD a mentett választásból jön: ha nincs mentve semmi, a
 * rendszert követjük (ezt a layout inline szkriptje már alkalmazta is a
 * `data-theme`-en). ⚠️ NEM a `data-theme`-ből olvassuk, mert az csak a
 * VÉGEREDMÉNYT mutatja (dark), abból nem derülne ki, hogy azt a rendszer
 * vagy a felhasználó kérte.
 */
function currentMode(): Mode {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s === "dark" || s === "warm") return s;
  } catch {
    /* privát mód / letiltott storage */
  }
  return "system";
}


/**
 * Téma-váltó (Világos / Sötét). A választást ELMENTI (localStorage) és azonnal
 * alkalmazza a <html data-theme>-en. A gomb állapota a TÉNYLEGES aktuális témát
 * tükrözi (nem resetel „Világos”-ra a menü újranyitásakor). A betöltéskori
 * alkalmazást a layout inline szkriptje végzi (FOUC nélkül, reload után is él);
 * a korábbi „modern” mentett értéket ugyanez migrálja „dark”-ra.
 */
export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>(currentMode);
  /**
   * ⚠️ A NAPSZAK NYITOTT APPBAN IS VÁLT. A téma nem csak betöltéskor dől el:
   * ha valaki 17:58-kor nyitja meg a lapot, 18:00-kor át kell váltania. Ezért
   * időzítő megy a KÖVETKEZŐ határra, és a lap visszatérésekor
   * (`visibilitychange`) is újraszámolunk — egy háttérben hagyott fülnél az
   * időzítő önmagában megbízhatatlan (a böngésző felfüggeszti).
   */
  useEffect(() => {
    if (mode !== "system") return;
    let idozito: ReturnType<typeof setTimeout>;
    const utemez = () => {
      const most = new Date();
      idozito = setTimeout(alkalmaz, Math.max(1000, kovetkezoValtas(most).getTime() - most.getTime()));
    };
    function alkalmaz() {
      const t = systemTheme();
      document.documentElement.dataset.theme = t;
      applyThemeColor(t);
      utemez();
    }
    const lathato = () => {
      if (document.visibilityState === "visible") alkalmaz();
    };
    alkalmaz();
    document.addEventListener("visibilitychange", lathato);
    return () => {
      clearTimeout(idozito);
      document.removeEventListener("visibilitychange", lathato);
    };
  }, [mode]);

  const choose = (m: Mode) => {
    setMode(m);
    const t: Theme = m === "system" ? systemTheme() : m;
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
      // ⚠️ A „rendszer" mód a kulcs TÖRLÉSE, nem egy harmadik tárolt érték: így
      // a layout inline szkriptje és a matchMedia-figyelője is pontosan azt
      // látja, amire figyel („nincs kézi választás → kövesd a rendszert").
      if (m === "system") localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, m);
    } catch {
      /* privát mód / letiltott storage — a téma legalább a munkamenetre él */
    }
  };

  return (
    <div>
      {/* Teljes szélességű, háromállású választó (a menüsor a címkét FÖLÉ teszi):
          három szöveges pirula nem fért volna el a címke MELLETT egy 390px-es
          képernyőn — ld. a dropdown-menu „tema" sorát. */}
      <div
        role="group"
        aria-label="Megjelenés"
        className="glass grid w-full grid-cols-3 gap-1 rounded-pill p-1 text-[13px] font-semibold"
      >
        {MODES.map(({ id, label, icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => choose(id)}
            aria-pressed={mode === id}
            className={`relative z-[1] inline-flex items-center justify-center gap-1.5 rounded-pill px-2 py-1.5 transition ${
              mode === id ? "bg-primary text-white shadow-card" : "text-ink-muted"
            }`}
          >
            <Icon name={icon} size={14} strokeWidth={2.2} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** „Rendszer" ELÖL: ez az alapértelmezés, és ez a natív elvárás. */
const MODES = [
  // ⚠️ A felirat „Napszak", nem „Rendszer": 2026-08-08 óta az óra dönt
  // (06–18 világos), nem a böngésző téma-beállítása. A régi felirat azt
  // ígérte, amit a mód már nem csinál.
  { id: "system", label: "Napszak", icon: "themeAuto" },
  { id: "warm", label: "Világos", icon: "sun" },
  { id: "dark", label: "Sötét", icon: "moon" },
] as const satisfies ReadonlyArray<{
  id: Mode;
  label: string;
  icon: Parameters<typeof Icon>[0]["name"];
}>;
