"use client";

import { useState } from "react";
import { Icon } from "./icons";
import { cn } from "@/lib/cn";
import { COUNTRIES, getCountry, DEFAULT_COUNTRY } from "@/lib/countries";
import { usePreferredCountry } from "@/lib/country-pref";
import { BottomSheet } from "./bottom-sheet";

/**
 * Ország-váltó a menüben: mutatja az aktuális Kinti országot, és egy natív-szerű
 * alsó lapon (BottomSheet) átválthatsz másikra. A választás a localStorage-ba
 * kerül (country-pref). Egyelőre csak CH-nak van tartalma — a többi „soon".
 */
export function CountrySwitcher() {
  const [code, setCode] = usePreferredCountry();
  const [open, setOpen] = useState(false);
  const current = getCountry(code) ?? getCountry(DEFAULT_COUNTRY)!;

  return (
    <div className="mb-2 overflow-hidden rounded-xl border border-line bg-surface-alt/60">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition active:scale-[0.99]"
      >
        <span className="text-[24px] leading-none" aria-hidden="true">{current.flag}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-bold uppercase tracking-wide text-ink-muted">Ország</span>
          <span className="flex items-center gap-1.5">
            <span className="text-[14px] font-extrabold text-ink">{current.name}</span>
            {!current.enabled && (
              <span className="rounded-full bg-primary-soft px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-ink-muted">
                Hamarosan
              </span>
            )}
          </span>
        </span>
        <Icon name="chevR" size={16} strokeWidth={2.4} className="text-ink-muted" />
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Válassz országot">
        <div className="grid grid-cols-2 gap-2 pt-1">
          {COUNTRIES.map((c) => {
            const active = c.code === current.code;
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  setCode(c.code);
                  setOpen(false);
                }}
                className={cn(
                  "relative flex items-center gap-2 rounded-xl border px-3 py-3 text-left transition active:scale-[0.97]",
                  active
                    ? "border-primary/40 bg-primary/10"
                    : "border-line bg-surface hover:bg-surface-alt",
                )}
              >
                <span className="text-[22px] leading-none" aria-hidden="true">{c.flag}</span>
                <span className="min-w-0 flex-1 truncate text-[13.5px] font-bold text-ink">{c.name}</span>
                {active && <Icon name="check" size={15} strokeWidth={3} className="shrink-0 text-primary" />}
                {!c.enabled && !active && (
                  <span className="absolute right-1.5 top-1.5 rounded-full bg-ink/10 px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wide text-ink-muted">
                    soon
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <p className="mt-3 px-1 text-center text-[11.5px] leading-snug text-ink-faint">
          🇨🇭 Svájc és 🇦🇹 Ausztria él; a többi ország hamarosan indul.
        </p>
      </BottomSheet>
    </div>
  );
}
