"use client";

import { cn } from "@/lib/cn";
import {
  type WorkingHours,
  type DayHours,
  HUNGARIAN_DAY_NAMES,
  DEFAULT_WORKING_HOURS,
  calculateBusinessHoursStatus,
} from "@/lib/hours";

/** Egységes nyelv-lista (Magyar mindig kötelező). */
export const ALL_LANGUAGES = ["Magyar", "Deutsch", "Français", "Italiano", "English"];

const DAYS_ORDER: (keyof WorkingHours)[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

/**
 * Chip-alapú nyelvválasztó. A "Magyar" kötelező (nem kapcsolható ki).
 * Kontrollált komponens: a szülő tartja a `value` tömböt.
 */
export function LanguagePicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  function toggle(lang: string) {
    if (lang === "Magyar") return; // kötelező
    const has = value.includes(lang);
    let next = has ? value.filter((l) => l !== lang) : [...value, lang];
    if (!next.includes("Magyar")) next = ["Magyar", ...next];
    onChange(next);
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {ALL_LANGUAGES.map((lang) => {
        const on = value.includes(lang);
        const required = lang === "Magyar";
        return (
          <button
            key={lang}
            type="button"
            onClick={() => toggle(lang)}
            disabled={required}
            className={cn(
              "rounded-pill px-3 py-1.5 text-[12px] font-bold transition active:scale-95",
              on
                ? "bg-primary text-white"
                : "border border-line bg-surface text-ink-muted hover:text-ink",
              required && "cursor-not-allowed",
            )}
          >
            {lang}
            {required && " (kötelező)"}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Egységes, napokra bontott nyitvatartás-szerkesztő. Ez hajtja a "Most nyitva"
 * szűrőt és a publikus profil státuszát (lib/hours). A `value` egy WorkingHours
 * objektum; a szülő szerializálja JSON-ná mentéskor.
 */
export function WorkingHoursEditor({
  value,
  onChange,
}: {
  value: WorkingHours;
  onChange: (next: WorkingHours) => void;
}) {
  function setDay(day: keyof WorkingHours, field: keyof DayHours, v: string | boolean) {
    onChange({ ...value, [day]: { ...value[day], [field]: v } });
  }

  const status = calculateBusinessHoursStatus(value);

  return (
    <div className="space-y-2">
      <div className="space-y-2">
        {DAYS_ORDER.map((day) => {
          const hours = value[day];
          return (
            <div
              key={day}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line/40 bg-surface-alt p-2.5"
            >
              <span className="w-16 text-[13px] font-bold text-ink">
                {HUNGARIAN_DAY_NAMES[day]}
              </span>
              <div className="flex items-center gap-3">
                <label className="flex cursor-pointer select-none items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={hours.closed}
                    onChange={(e) => setDay(day, "closed", e.target.checked)}
                    className="h-4 w-4 rounded border-line text-primary focus:ring-primary/30"
                  />
                  <span className="text-[12px] font-bold text-ink-muted">Zárva</span>
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="time"
                    disabled={hours.closed}
                    value={hours.open}
                    onChange={(e) => setDay(day, "open", e.target.value)}
                    className="w-[88px] rounded-lg border border-line bg-surface px-1.5 py-1 text-center text-[12px] font-bold text-ink transition-all disabled:bg-surface-alt disabled:opacity-40"
                  />
                  <span className="text-xs font-semibold text-ink-faint">–</span>
                  <input
                    type="time"
                    disabled={hours.closed}
                    value={hours.close}
                    onChange={(e) => setDay(day, "close", e.target.value)}
                    className="w-[88px] rounded-lg border border-line bg-surface px-1.5 py-1 text-center text-[12px] font-bold text-ink transition-all disabled:bg-surface-alt disabled:opacity-40"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="px-1 text-[11.5px] font-semibold text-ink-muted">
        Előnézet:{" "}
        <span className={status.isOpen ? "text-success" : "text-accent"}>
          {status.statusText}
        </span>{" "}
        · {status.detailText}
      </p>
    </div>
  );
}

export { DEFAULT_WORKING_HOURS };
