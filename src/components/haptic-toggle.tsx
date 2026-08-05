"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { haptic, hapticBeallit, hapticBekapcsolva, hapticTamogatott } from "@/lib/haptics";

/**
 * Rezgés-kapcsoló a menü „Beállítások" szekciójában.
 *
 * ⚠️ CSAK OTT JELENIK MEG, AHOL A REZGÉS TÉNYLEG MŰKÖDIK. Az iOS Safari nem
 * támogatja a Vibration API-t, tehát iPhone-on ez a kapcsoló semmit nem
 * kapcsolna — egy vezérlő, ami nem csinál semmit, rosszabb a hiányánál: a
 * felhasználó azt hiszi, elrontott valamit.
 *
 * ⚠️ MOUNT ELŐTT NEM RENDERELÜNK. A támogatás és a mentett érték is csak a
 * böngészőben ismert; szerver-oldalon kitalálni bármelyiket hidratálási
 * eltérést okozna (a szerver mást írna ki, mint amit a kliens gondol).
 */
export function HapticToggle() {
  const [mounted, setMounted] = useState(false);
  const [be, setBe] = useState(true);

  useEffect(() => {
    setMounted(true);
    setBe(hapticBekapcsolva());
  }, []);

  if (!mounted || !hapticTamogatott()) return null;

  const valt = () => {
    const uj = !be;
    setBe(uj);
    hapticBeallit(uj);
    // Bekapcsoláskor AZONNAL rezegjen egyet: a kapcsoló így megmutatja, mit
    // kapcsolt be. (Kikapcsoláskor nincs — az önellentmondás lenne.)
    if (uj) haptic("success");
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary-ink">
        {/* Rezgés-ikon: koncentrikus ívek egy pötty körül. */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="2.2" fill="currentColor" />
          <path
            d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M4.6 4.6a10.5 10.5 0 0 0 0 14.8M19.4 4.6a10.5 10.5 0 0 1 0 14.8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-bold text-ink">Rezgés</span>
        <span className="block text-[11.5px] leading-snug text-ink-muted">
          Finom visszajelzés koppintáskor.
        </span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={be}
        aria-label="Rezgés"
        onClick={valt}
        className={cn(
          "relative h-6 w-10 shrink-0 rounded-full transition-colors",
          be ? "bg-primary" : "bg-ink-faint/30",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
            be ? "left-[18px]" : "left-0.5",
          )}
        />
      </button>
    </div>
  );
}
