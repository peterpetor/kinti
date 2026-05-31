"use client";

import { useEffect, useState, useCallback } from "react";
import { Icon } from "@/components/ui";
import { CANTONS } from "@/lib/cantons";
import { usePreferredCanton } from "@/lib/canton-pref";
import { describeWeather, type WeatherNow } from "@/lib/weather";

/**
 * WeatherWidget — a főoldal tetején lévő svájci időjárás-csík.
 *
 * • Adatforrás: /api/weather (Open-Meteo · MeteoSwiss ICON CH2 modell).
 * • A kiválasztott kanton székhelyének aktuális időjárását mutatja. A
 *   kanton-választója a megosztott „preferált kanton" beállítást írja
 *   (`@/lib/canton-pref`), így az egész app személyre szabódik egy helyről.
 * • Homokozó / letiltott localStorage esetén nem dob hibát (try/catch), és ha
 *   az API nem elérhető, csendben elrejti magát.
 */

type Phase = "loading" | "ready" | "error";

export function WeatherWidget() {
  // A preferált kanton a megosztott forrás; ha nincs beállítva, ZH-t mutatunk.
  const [preferred, setPreferred] = usePreferredCanton();
  const canton = preferred ?? "ZH";
  const [data, setData] = useState<WeatherNow | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");

  const load = useCallback(async (code: string) => {
    setPhase("loading");
    try {
      const res = await fetch(`/api/weather?canton=${encodeURIComponent(code)}`);
      if (!res.ok) throw new Error("weather");
      const json = (await res.json()) as WeatherNow;
      setData(json);
      setPhase("ready");
    } catch {
      setPhase("error");
    }
  }, []);

  useEffect(() => {
    load(canton);
  }, [canton, load]);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    // A megosztott setter perzisztál + értesíti az app többi részét.
    setPreferred(e.target.value);
  }

  // Ha az API nem elérhető, ne rondítsuk a főoldalt — elrejtjük.
  if (phase === "error") return null;

  const cond = data ? describeWeather(data.code) : null;

  return (
    <section className="relative flex items-center gap-3 overflow-hidden rounded-card border border-line bg-surface px-4 py-3 shadow-card">
      {/* bal: emoji + hőfok */}
      <div className="flex items-center gap-2.5">
        <span className="text-[30px] leading-none" aria-hidden>
          {cond ? cond.emoji : "🌡️"}
        </span>
        <div className="leading-none">
          <div className="text-[24px] font-extrabold tracking-tight text-ink">
            {phase === "loading" || !data ? (
              <span className="inline-block h-5 w-9 animate-pulse rounded bg-surface-alt align-middle" />
            ) : (
              `${data.tempC}°`
            )}
          </div>
        </div>
      </div>

      {/* közép: hely + leírás + min/max */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 text-[13.5px] font-bold tracking-[-0.01em] text-ink">
          <Icon name="pin" size={12} strokeWidth={2.4} className="shrink-0 text-accent" />
          <span className="truncate">{data?.city ?? "Svájc"}</span>
        </div>
        <div className="mt-0.5 truncate text-[11.5px] font-semibold text-ink-muted">
          {phase === "loading" || !data || !cond ? (
            "Időjárás betöltése…"
          ) : (
            <>
              {cond.label}
              {data.maxC != null && data.minC != null && (
                <span className="text-ink-faint">
                  {" · "}↑{data.maxC}° ↓{data.minC}°
                </span>
              )}
              {data.feelsC != null && (
                <span className="text-ink-faint"> · hőérzet {data.feelsC}°</span>
              )}
            </>
          )}
        </div>
      </div>

      {/* jobb: kanton-választó pill */}
      <label className="relative inline-flex shrink-0 items-center gap-1 rounded-pill border border-line bg-surface-alt px-2.5 py-1.5 text-[11.5px] font-bold text-ink-muted shadow-card cursor-pointer hover:bg-surface transition">
        <span className="font-extrabold text-ink">{canton}</span>
        <Icon name="chevD" size={12} strokeWidth={2.4} className="shrink-0" />
        <select
          value={canton}
          onChange={handleChange}
          aria-label="Időjárás — kanton választó"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        >
          {CANTONS.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name} ({c.code})
            </option>
          ))}
        </select>
      </label>
    </section>
  );
}
