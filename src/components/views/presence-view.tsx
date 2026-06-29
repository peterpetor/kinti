"use client";

import { useState, useEffect, useCallback, useRef, useMemo, lazy, Suspense } from "react";
import { cn } from "@/lib/cn";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY, getCountry, countryLocative } from "@/lib/countries";
import { getPresenceCities } from "@/lib/presence-cities";
import { TurnstileWidget, type TurnstileWidgetRef } from "@/components/turnstile-widget";

// Leaflet csak kliensen (window-függő) → SSR-en () => null.
const CantonBubbleMap =
  typeof window !== "undefined"
    ? lazy(() => import("./canton-bubble-map").then((m) => ({ default: m.CantonBubbleMap })))
    : () => null;

const LS_PINGED = "kinti_presence_pinged"; // string[]: mely országokban jelzett már be
const LS_CITY = "kinti_presence_city";     // Record<country, city>: „a te körzeted"

/**
 * PresenceView — „Ki költözött melléd?" anonim magyar jelenlét-hőtérkép, VÁROS-szinten.
 * Egy kérdés (melyik városban élsz?), nulla regisztráció. A számok „puhák" (ezért
 * „legalább X"), de rate-limit + Turnstile + localStorage-dedup védi.
 */
export function PresenceView({ turnstileSiteKey }: { turnstileSiteKey: string }) {
  const [prefCountry] = usePreferredCountry();
  const country = prefCountry ?? DEFAULT_COUNTRY;
  const countryName = getCountry(country)?.name ?? "";
  const cityList = useMemo(() => getPresenceCities(country), [country]);

  const [cities, setCities] = useState<Record<string, number>>({});
  const [cityRecent, setCityRecent] = useState<Record<string, number>>({});
  const [cityCoords, setCityCoords] = useState<Record<string, { lat: number; lng: number }>>({});
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState("");
  const [pinned, setPinned] = useState(false);
  const [myCity, setMyCity] = useState<string | null>(null);

  // Modal
  const [modal, setModal] = useState(false);
  const [cityChoice, setCityChoice] = useState("");
  const [token, setToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  // Város-koordináták a buborék-térképhez: a kurált városok az alap, a DB-ből jövő
  // precíz koordináták (bármely falu) felülírják → mindenki a saját helyén jelenik meg.
  const coords = useMemo(() => {
    const m: Record<string, { lat: number; lng: number }> = {};
    for (const c of cityList) m[c.name] = { lat: c.lat, lng: c.lng };
    for (const [name, ll] of Object.entries(cityCoords)) m[name] = ll;
    return m;
  }, [cityList, cityCoords]);

  // Az ország async oldódik fel (null→CH default→AT), ezért két fetch indulhat. A
  // stale-guard (`ignore`) eldobja a régi (pl. CH=0) választ, ha közben országot
  // váltottunk — különben a lassabb CH-válasz felülírná a helyes AT-számot (race-bug).
  useEffect(() => {
    let ignore = false;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/presence?country=${country}`);
        const data = (await res.json()) as { cities?: Record<string, number>; cityRecent?: Record<string, number>; cityCoords?: Record<string, { lat: number; lng: number }>; total?: number };
        if (ignore) return;
        setCities(data.cities ?? {});
        setCityRecent(data.cityRecent ?? {});
        setCityCoords(data.cityCoords ?? {});
        setTotal(data.total ?? 0);
      } catch { /* hálózati hiba → marad */ }
      if (!ignore) setLoading(false);
    })();
    return () => { ignore = true; };
  }, [country]);

  useEffect(() => {
    try {
      const arr = JSON.parse(localStorage.getItem(LS_PINGED) ?? "[]") as string[];
      setPinned(Array.isArray(arr) && arr.includes(country));
      const cm = JSON.parse(localStorage.getItem(LS_CITY) ?? "{}") as Record<string, string>;
      setMyCity(cm?.[country] ?? null);
    } catch { setPinned(false); setMyCity(null); }
  }, [country]);

  const top = useMemo(() => Object.entries(cities).sort((a, b) => b[1] - a[1]).slice(0, 8), [cities]);
  const myCount = myCity ? cities[myCity] ?? 0 : 0;
  const myRecent = myCity ? cityRecent[myCity] ?? 0 : 0;

  async function submit() {
    setErr(null);
    if (cityChoice.trim().length < 2) { setErr("Írd be a városod vagy falud nevét."); return; }
    if (!token) { setErr("Várd meg a robot-ellenőrzést."); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/presence", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ country, city: cityChoice.trim(), turnstileToken: token }),
      });
      const data = (await res.json().catch(() => ({}))) as { city?: string; cities?: Record<string, number>; cityRecent?: Record<string, number>; cityCoords?: Record<string, { lat: number; lng: number }>; total?: number; error?: string };
      if (!res.ok) {
        setErr(data.error ?? "Nem sikerült a beküldés.");
        turnstileRef.current?.reset();
        setToken("");
        setSubmitting(false);
        return;
      }
      // A szerver feloldotta a precíz helynevet (pl. „grossarl" → „Grossarl").
      const resolved = data.city ?? cityChoice.trim();
      setCities(data.cities ?? cities);
      setCityRecent(data.cityRecent ?? cityRecent);
      setCityCoords(data.cityCoords ?? cityCoords);
      setTotal(data.total ?? total);
      try {
        const arr = JSON.parse(localStorage.getItem(LS_PINGED) ?? "[]") as string[];
        if (!arr.includes(country)) arr.push(country);
        localStorage.setItem(LS_PINGED, JSON.stringify(arr));
        const cm = JSON.parse(localStorage.getItem(LS_CITY) ?? "{}") as Record<string, string>;
        cm[country] = resolved;
        localStorage.setItem(LS_CITY, JSON.stringify(cm));
      } catch { /* private mode → ok */ }
      setMyCity(resolved);
      setPinned(true);
      setModal(false);
    } catch {
      setErr("Hálózati hiba.");
    }
    setSubmitting(false);
  }

  function share() {
    const text = `Eddig legalább ${total} magyar jelzett be ${countryLocative(country)} a Kintin. 🇭🇺 Te is itt vagy? Tedd fel magad a térképre:`;
    const url = "https://kinti.app/holvagyunk";
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: "Ki költözött melléd?", text, url }).catch(() => {});
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`${text} ${url}`).catch(() => {});
    }
  }

  return (
    <div className="space-y-4">
      {/* Személyre szabott kártya — „a te körzeted" (a beküldött város alapján) */}
      {myCity && !loading && (
        <section className="rounded-card border-2 border-accent/30 bg-accent/5 p-4 shadow-pop">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-accent text-white text-xl">📍</span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-accent">A te körzeted · {myCity}</p>
              {myCount > 0 ? (
                <>
                  <p className="mt-1 text-[18px] font-extrabold leading-tight text-ink">
                    <span className="text-accent">{myCount.toLocaleString("hu-HU")}</span> magyar él a körzetedben.
                  </p>
                  {myRecent > 0 && (
                    <p className="mt-0.5 text-[13.5px] text-ink-muted">
                      Közülük <strong className="text-ink">{myRecent.toLocaleString("hu-HU")}</strong> nemrég (az elmúlt hónapban) költözött ide. 👋
                    </p>
                  )}
                </>
              ) : (
                <p className="mt-1 text-[15px] font-bold text-ink">Még te lehetsz az első {myCity}ban! 🎉</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Összesítő hero */}
      <section className="rounded-card border-2 border-primary/25 bg-gradient-to-br from-primary-soft to-surface p-5 shadow-pop text-center">
        <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Anonim jelenlét-térkép</p>
        <p className="mt-2 text-[34px] font-black leading-none text-ink tracking-tight">
          {loading ? "…" : `legalább ${total.toLocaleString("hu-HU")}`}
        </p>
        <p className="mt-1 text-[14px] font-bold text-ink-muted">
          magyar jelzett be {countryLocative(country)} 🇭🇺
        </p>
        <p className="mt-2 text-[11.5px] leading-snug text-ink-faint">
          Nincs fiók, nincs email — az IP-det nem tároljuk. Egy kérdés, egy pont a térképen.
        </p>
      </section>

      {/* Város-buborék térkép */}
      {total > 0 && Object.keys(cities).length > 0 && (
        <Suspense fallback={<div className="grid h-[320px] place-items-center rounded-card border border-line bg-surface text-[12.5px] text-ink-muted">Térkép betöltése…</div>}>
          <CantonBubbleMap counts={cities} selectedCanton={selected} onSelectCanton={setSelected} country={country} coordsOverride={coords} nameOf={(c) => c} />
        </Suspense>
      )}

      {/* Top városok */}
      {top.length > 0 && (
        <section className="rounded-card border border-line bg-surface p-4 shadow-card">
          <h2 className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted mb-2">Hol vagyunk a legtöbben?</h2>
          <ul className="space-y-1.5">
            {top.map(([city, n]) => (
              <li key={city} className="flex items-center justify-between text-[13.5px]">
                <span className="font-semibold text-ink">{city}</span>
                <span className="font-extrabold text-primary">{n.toLocaleString("hu-HU")}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* CTA */}
      <div className="grid grid-cols-1 gap-2">
        {pinned ? (
          <div className="rounded-card border border-success/30 bg-success/10 px-4 py-3 text-center text-[13px] font-bold text-ink">
            ✅ Köszönjük — fent vagy a térképen!
          </div>
        ) : (
          <button
            type="button"
            onClick={() => { setErr(null); setModal(true); }}
            className="w-full rounded-pill bg-primary py-3.5 text-[15px] font-black text-white shadow-card transition active:scale-[0.98]"
          >
            📍 Itt élek én is — tegyél fel a térképre
          </button>
        )}
        <button
          type="button"
          onClick={share}
          className="w-full rounded-pill border border-line bg-surface py-3 text-[13.5px] font-bold text-ink-muted transition active:scale-[0.98]"
        >
          🔗 Oszd meg: „Nézd, hányan vagyunk!"
        </button>
      </div>

      {total === 0 && !loading && (
        <p className="text-center text-[12.5px] text-ink-faint">Még senki sem jelzett be {countryName}ban — légy te az első! 🎉</p>
      )}

      {/* Beküldő modal */}
      {modal && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-3 bg-ink/40 backdrop-blur-sm" onClick={() => !submitting && setModal(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-card border border-line bg-surface p-5 shadow-card-strong space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-extrabold text-ink">📍 Melyik városban / faluban élsz?</h3>
              <button type="button" onClick={() => setModal(false)} className="grid h-8 w-8 place-items-center rounded-full bg-surface-alt text-ink-muted">✕</button>
            </div>
            <p className="text-[12px] leading-snug text-ink-muted">
              Írd be a saját településed — nem csak nagyvárost (pl. <strong>Grossarl</strong> is jó). A térképen a tényleges helyeden jelensz meg. Teljesen anonim, nincs fiók, nincs email.
            </p>
            <input
              type="text"
              list="presence-city-list"
              value={cityChoice}
              onChange={(e) => setCityChoice(e.target.value)}
              placeholder="Város vagy falu neve…"
              autoComplete="off"
              className="h-11 w-full rounded-[10px] border border-line bg-surface-alt px-3 text-[14px] text-ink"
            />
            <datalist id="presence-city-list">
              {cityList.map((c) => (
                <option key={c.name} value={c.name} />
              ))}
            </datalist>

            {turnstileSiteKey && (
              <TurnstileWidget ref={turnstileRef} siteKey={turnstileSiteKey} onToken={setToken} />
            )}
            {err && <p className="text-[12px] font-bold text-accent">{err}</p>}

            <button
              type="button"
              onClick={submit}
              disabled={submitting || !cityChoice || !token}
              className="w-full rounded-pill bg-primary py-3 text-[14px] font-black text-white shadow-card disabled:opacity-60"
            >
              {submitting ? "Felteszem…" : "Felteszem magam a térképre"}
            </button>
            <p className="text-[11px] leading-snug text-ink-faint">
              Az IP-címedet nem tároljuk; egy egyirányú ellenőrző-kulcsot használunk csak a visszaélés (spam) ellen.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
