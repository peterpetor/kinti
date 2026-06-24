"use client";

import { useEffect, useState } from "react";
import { KintiLogo } from "@/components/ui";
import { cn } from "@/lib/cn";
import { COUNTRIES } from "@/lib/countries";
import { hasChosenCountry, setPreferredCountry } from "@/lib/country-pref";

/**
 * CountryGate — belépés előtti ország-választó. Ha a felhasználó még nem
 * választott Kinti országot (localStorage `kinti.country`), egy teljes képernyős
 * overlay jelenik meg zászlós ráccsal. Választás után eltárolódik és eltűnik.
 *
 * Egyelőre csak Svájcnak van tartalma; a többi ország kiválasztható, de
 * „Hamarosan" — a választás eltárolódik, a tartalom addig a svájci.
 */
export function CountryGate() {
  const [chosen, setChosen] = useState(true); // SSR-biztos: kezdetben ne villanjon az overlay
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setChosen(hasChosenCountry());
  }, []);

  if (!mounted || chosen) return null;

  const pick = (code: string) => {
    setPreferredCountry(code);
    setChosen(true);
  };

  return (
    <div className="fixed inset-0 z-[120] flex flex-col overflow-y-auto bg-gradient-to-b from-primary to-[#23533d] px-6 pb-10 pt-[calc(env(safe-area-inset-top)+3rem)] text-white">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <header className="text-center">
          <KintiLogo size={48} className="mx-auto" />
          <h1 className="mt-4 text-[26px] font-extrabold tracking-tight">Hol vagy kint?</h1>
          <p className="mx-auto mt-2 max-w-xs text-[14px] leading-relaxed text-white/85">
            Válaszd ki az országot, ahol élsz. Bármikor válthatsz a menüből.
          </p>
        </header>

        <div className="mt-8 grid grid-cols-2 gap-3">
          {COUNTRIES.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => pick(c.code)}
              className={cn(
                "relative flex flex-col items-center gap-2 rounded-2xl border px-4 py-5 text-center transition active:scale-[0.97]",
                c.enabled
                  ? "border-white/30 bg-white/[0.14] hover:bg-white/20"
                  : "border-white/15 bg-white/[0.06] hover:bg-white/10",
              )}
            >
              <span className="text-[40px] leading-none" aria-hidden="true">
                {c.flag}
              </span>
              <span className="text-[15px] font-extrabold tracking-tight">{c.name}</span>
              {!c.enabled && (
                <span className="absolute right-2 top-2 rounded-full bg-white/20 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-white/90">
                  Hamarosan
                </span>
              )}
            </button>
          ))}
        </div>

        <p className="mt-6 text-center text-[11.5px] leading-relaxed text-white/70">
          Svájc, Ausztria és Németország már él — Hollandia hamarosan.
          A választásod elmentjük, és onnan folytatod, amint kész.
        </p>
      </div>
    </div>
  );
}
