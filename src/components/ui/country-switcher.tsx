"use client";

import { useState } from "react";
import { Icon } from "./icons";
import { cn } from "@/lib/cn";
import { COUNTRIES, getCountry, DEFAULT_COUNTRY } from "@/lib/countries";
import { usePreferredCountry } from "@/lib/country-pref";

/**
 * Ország-váltó a menüben: mutatja az aktuális Kinti országot, és lenyitva
 * átválthatsz másikra. A választás a localStorage-ba kerül (country-pref).
 * Egyelőre csak CH-nak van tartalma — a többi „soon", de kiválasztható.
 */
export function CountrySwitcher() {
  const [code, setCode] = usePreferredCountry();
  const [open, setOpen] = useState(false);
  const current = getCountry(code) ?? getCountry(DEFAULT_COUNTRY)!;

  return (
    <div className="mb-2 overflow-hidden rounded-xl border border-line bg-surface-alt/60">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition active:scale-[0.99]"
      >
        <span className="text-[24px] leading-none" aria-hidden="true">{current.flag}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-bold uppercase tracking-wide text-ink-muted">Ország</span>
          <span className="block text-[14px] font-extrabold text-ink">{current.name}</span>
        </span>
        <Icon
          name="chevD"
          size={16}
          strokeWidth={2.4}
          className={cn("text-ink-muted transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="grid grid-cols-2 gap-2 border-t border-line p-3">
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
                  "relative flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition active:scale-[0.97]",
                  active
                    ? "border-primary/40 bg-primary/10"
                    : "border-line bg-surface hover:bg-surface-alt",
                )}
              >
                <span className="text-[20px] leading-none" aria-hidden="true">{c.flag}</span>
                <span className="min-w-0 flex-1 truncate text-[13px] font-bold text-ink">{c.name}</span>
                {active && <Icon name="check" size={14} strokeWidth={3} className="shrink-0 text-primary" />}
                {!c.enabled && !active && (
                  <span className="absolute right-1.5 top-1.5 rounded-full bg-ink/10 px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wide text-ink-muted">
                    soon
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
