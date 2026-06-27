"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY, countryLocative } from "@/lib/countries";

const LS_CITY = "kinti_presence_city"; // Record<country, city>

/**
 * PresenceHomeCard — főoldali hook a jelenlét-hőtérképhez. Az élő számot mutatja
 * (és ha a felhasználó már megadta a városát, a személyes „N magyar a környékeden"-t).
 * Az egész kártya a /holvagyunk-ra visz. Hidratálás-biztos: mount előtt nem renderel.
 */
export function PresenceHomeCard() {
  const [prefCountry] = usePreferredCountry();
  const [mounted, setMounted] = useState(false);
  const [total, setTotal] = useState<number | null>(null);
  const [myCity, setMyCity] = useState<string | null>(null);
  const [myCount, setMyCount] = useState<number | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const country = prefCountry ?? DEFAULT_COUNTRY;
    let city: string | null = null;
    try {
      const cm = JSON.parse(localStorage.getItem(LS_CITY) ?? "{}") as Record<string, string>;
      city = cm?.[country] ?? null;
    } catch { /* ignore */ }
    setMyCity(city);

    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/presence?country=${country}`);
        const data = (await res.json()) as { total?: number; cities?: Record<string, number> };
        if (!active) return;
        setTotal(data.total ?? 0);
        setMyCount(city ? data.cities?.[city] ?? 0 : null);
      } catch { /* hálózati hiba → marad rejtve */ }
    })();
    return () => { active = false; };
  }, [mounted, prefCountry]);

  // Mount előtt / adat nélkül ne ugráljon a layout.
  if (!mounted || total === null) return null;

  const country = prefCountry ?? DEFAULT_COUNTRY;
  const personal = myCity && myCount && myCount > 0;

  return (
    <Link
      href="/holvagyunk"
      className="flex items-center gap-3 rounded-card border-2 border-accent/25 bg-gradient-to-br from-accent/5 to-surface px-4 py-3 shadow-card transition active:scale-[0.99]"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-accent text-white text-xl">📍</span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-accent">Ki költözött melléd?</p>
        {personal ? (
          <p className="text-[15px] font-extrabold leading-tight text-ink">
            <span className="text-accent">{myCount!.toLocaleString("hu-HU")}</span> magyar él a körzetedben ({myCity})
          </p>
        ) : total > 0 ? (
          <p className="text-[15px] font-extrabold leading-tight text-ink">
            Már <span className="text-accent">{total.toLocaleString("hu-HU")}</span> magyar jelzett be {countryLocative(country)}
          </p>
        ) : (
          <p className="text-[15px] font-extrabold leading-tight text-ink">Légy te az első a térképen!</p>
        )}
        <p className="text-[11px] text-ink-muted">Anonim térkép — nézd meg, hányan vagyunk →</p>
      </div>
      <Icon name="chevR" size={16} strokeWidth={2.2} className="shrink-0 text-accent" />
    </Link>
  );
}
