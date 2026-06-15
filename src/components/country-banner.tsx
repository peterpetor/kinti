"use client";

import { useState } from "react";
import { getCountry } from "@/lib/countries";
import { usePreferredCountry } from "@/lib/country-pref";

/**
 * CountryBanner — őszinte „Hamarosan" sáv, ha a felhasználó nem-CH országot
 * választott (amihez még nincs tartalom). Jelzi, hogy egyelőre a svájci Kintit
 * látja, és egy gombbal átválthat Svájcra. A TabBar fölött lebeg (nincs felső
 * notch/padding ütközés). Session-re elrejthető a ✕-szel.
 */
export function CountryBanner() {
  const [code, setCode] = usePreferredCountry();
  const [hidden, setHidden] = useState(false);
  const country = getCountry(code);

  // CH (vagy nincs választás, vagy már enabled ország) → semmi.
  if (!country || country.enabled || hidden) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+88px)] z-30 flex justify-center px-4">
      <div className="pointer-events-auto flex max-w-md items-center gap-2.5 rounded-2xl border border-accent/30 bg-surface/95 px-3.5 py-2.5 shadow-card-hover backdrop-blur-md">
        <span className="text-[18px] leading-none" aria-hidden="true">{country.flag}</span>
        <span className="text-[12px] leading-snug text-ink-muted">
          <strong className="text-ink">{country.name}</strong> hamarosan — most a 🇨🇭 svájci tartalmat látod.
        </span>
        <button
          type="button"
          onClick={() => setCode("CH")}
          className="shrink-0 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-white transition active:scale-95"
        >
          Svájc
        </button>
        <button
          type="button"
          onClick={() => setHidden(true)}
          aria-label="Elrejtés"
          className="shrink-0 grid h-6 w-6 place-items-center rounded-full text-ink-faint transition hover:bg-surface-alt active:scale-90"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
