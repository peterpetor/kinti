"use client";

import { useState, useEffect, useCallback, useRef, lazy, Suspense } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import type { KintiEvent } from "@/lib/types";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY, countryLocative } from "@/lib/countries";
import { getPresenceCities } from "@/lib/presence-cities";
import { TurnstileWidget, type TurnstileWidgetRef } from "@/components/turnstile-widget";
import { EVENT_TAGS } from "./events-tags";

const EventsMap =
  typeof window !== "undefined"
    ? lazy(() => import("./events-map").then((m) => ({ default: m.EventsMap })))
    : () => null;

const LocationPicker =
  typeof window !== "undefined"
    ? lazy(() => import("./location-picker").then((m) => ({ default: m.LocationPicker })))
    : () => null;

// Csak esemény küldhető be — a hely-kategóriák (bolt/etterem) megszűntek (2026-07-03).
const TAG_KEYS = ["koncert", "talalkozo", "kozosseg", "egyeb"] as const;

/** Sentinel a város-legördülőben: a listán kívüli (falu/kisváros) település. */
const CUSTOM_CITY = "__mas";

export function EventsMapView({ turnstileSiteKey }: { turnstileSiteKey: string }) {
  const [prefCountry] = usePreferredCountry();
  const country = prefCountry ?? DEFAULT_COUNTRY;
  const countryRef = useRef(country);
  countryRef.current = country;
  const cityList = getPresenceCities(country);

  const [events, setEvents] = useState<KintiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events?map=1&country=${country}`);
      const data = (await res.json()) as { events?: KintiEvent[] };
      if (countryRef.current !== country) return; // stale (országváltás közben)
      setEvents(data.events ?? []);
    } catch { /* hálózati hiba → marad */ }
    setLoading(false);
  }, [country]);
  useEffect(() => { load(); }, [load]);

  // Mély-link a beküldéshez: /esemenyek?submit=1 (pl. a Közösség oldal gombjáról) → azonnal nyílik a beküldő modal.
  useEffect(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("submit") === "1") {
      resetForm();
      setModal(true);
    }
  }, []);

  // Beküldő-mező állapot
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState<string>("talalkozo");
  const [city, setCity] = useState("");
  const [customCity, setCustomCity] = useState("");
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [venue, setVenue] = useState("");
  const [desc, setDesc] = useState("");
  const [token, setToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const turnstileRef = useRef<TurnstileWidgetRef>(null);
  const needsDate = tag === "koncert" || tag === "talalkozo" || tag === "kozosseg";

  async function submit() {
    setErr(null);
    if (title.trim().length < 3) { setErr("Adj egy címet (min. 3 karakter)."); return; }
    if (!city) { setErr("Válassz települést."); return; }
    if (city === CUSTOM_CITY && customCity.trim().length < 2) { setErr("Add meg a település nevét."); return; }
    if (city === CUSTOM_CITY && !pin) { setErr("Jelöld meg a település helyét a térképen."); return; }
    if (needsDate && !date) { setErr("Adj meg egy dátumot."); return; }
    if (!token) { setErr("Várd meg a robot-ellenőrzést."); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          country, city: city === CUSTOM_CITY ? customCity.trim() : city, title: title.trim(), tag,
          eventDate: date || null, startTime: time || null,
          venue: venue.trim() || null, description: desc.trim() || null,
          lat: pin?.lat ?? null, lng: pin?.lng ?? null,
          turnstileToken: token,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setErr(data.error ?? "Nem sikerült a beküldés.");
        turnstileRef.current?.reset();
        setToken("");
        setSubmitting(false);
        return;
      }
      setDone(true);
    } catch { setErr("Hálózati hiba."); }
    setSubmitting(false);
  }

  function resetForm() {
    setTitle(""); setTag("talalkozo"); setCity(""); setCustomCity(""); setPin(null); setDate(""); setTime(""); setVenue(""); setDesc("");
    setToken(""); setErr(null); setDone(false); turnstileRef.current?.reset();
  }

  return (
    <div className="space-y-4">
      {/* Térkép */}
      {!loading && events.length > 0 ? (
        <Suspense fallback={<div className="grid h-[360px] place-items-center rounded-card border border-line bg-surface text-[12.5px] text-ink-muted">Térkép betöltése…</div>}>
          <EventsMap events={events} country={country} className="h-[360px] overflow-hidden rounded-card border border-line shadow-card" />
        </Suspense>
      ) : (
        <div className="grid h-[200px] place-items-center rounded-card border border-dashed border-line bg-surface px-6 text-center text-[13px] text-ink-muted">
          {loading ? "Betöltés…" : `Még nincs esemény a térképen ${countryLocative(country)}. Legyél te az első — küldj be egyet!`}
        </div>
      )}

      {/* Jelmagyarázat */}
      <div className="flex flex-wrap gap-2">
        {TAG_KEYS.map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface px-2.5 py-1 text-[11.5px] font-bold text-ink">
            <span>{EVENT_TAGS[k].emoji}</span> {EVENT_TAGS[k].label}
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={() => { resetForm(); setModal(true); }}
        className="w-full rounded-pill bg-primary py-3.5 text-[15px] font-black text-white shadow-card transition active:scale-[0.98]"
      >
        <span aria-hidden className="text-[17px] leading-none">+</span> Esemény beküldése
      </button>
      <p className="text-center text-[11px] text-ink-faint">A beküldött eseményeket jóváhagyás után tesszük közzé.</p>

      {/* Beküldő modal — PORTÁLLAL a body-ra (BottomSheet-minta): a page-fa
          space-y-* konténerei margin-t tennének a fixed backdropra (csík a
          viewport tetején), és a stacking is tisztább body-szinten. */}
      {modal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-3 bg-ink/40 backdrop-blur-sm" onClick={() => !submitting && setModal(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-card border border-line bg-surface p-5 shadow-card-strong space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-extrabold text-ink">➕ Esemény beküldése</h3>
              <button type="button" onClick={() => setModal(false)} className="grid h-8 w-8 place-items-center rounded-full bg-surface-alt text-ink-muted">✕</button>
            </div>

            {done ? (
              <div className="space-y-3 py-4 text-center">
                <p className="text-3xl">🎉</p>
                <p className="text-[14px] font-bold text-ink">Köszönjük! Jóváhagyás után megjelenik a térképen.</p>
                <button type="button" onClick={() => setModal(false)} className="w-full rounded-pill bg-primary py-2.5 text-[13px] font-bold text-white">Rendben</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2">
                  {TAG_KEYS.map((k) => (
                    <button key={k} type="button" onClick={() => setTag(k)}
                      className={cn("flex items-center gap-2 rounded-[10px] border-2 p-2.5 text-left text-[12.5px] font-bold transition", tag === k ? "border-primary bg-primary-soft text-primary" : "border-line bg-surface text-ink")}>
                      <span className="text-base">{EVENT_TAGS[k].emoji}</span> {EVENT_TAGS[k].label}
                    </button>
                  ))}
                </div>

                <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120}
                  placeholder="Esemény címe (pl. Magyar bográcsozás)"
                  className="h-10 w-full rounded-[10px] border border-line bg-surface-alt px-3 text-[13.5px] text-ink" />

                <select value={city} onChange={(e) => { setCity(e.target.value); setPin(null); }} className="h-10 w-full rounded-[10px] border border-line bg-surface-alt px-3 text-[13.5px] text-ink">
                  <option value="">Melyik településen?</option>
                  {cityList.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                  <option value={CUSTOM_CITY}>Más település (falu/kisváros)…</option>
                </select>

                {city === CUSTOM_CITY && (
                  <input value={customCity} onChange={(e) => setCustomCity(e.target.value)} maxLength={60}
                    placeholder="Település neve (pl. Wangen an der Aare)"
                    className="h-10 w-full rounded-[10px] border border-line bg-surface-alt px-3 text-[13.5px] text-ink" />
                )}

                {(() => {
                  const sel = cityList.find((c) => c.name === city);
                  const isCustom = city === CUSTOM_CITY;
                  if (!sel && !isCustom) return null;
                  // Falu/kisváros: nincs ismert koordináta → ország-áttekintésről indulunk,
                  // és a pin KÖTELEZŐ (a szerver is megköveteli).
                  const center: [number, number] = sel ? [sel.lat, sel.lng] : [cityList[0].lat, cityList[0].lng];
                  return (
                    <div className="space-y-1">
                      <Suspense fallback={<div className="grid h-[200px] place-items-center rounded-card border border-line bg-surface text-[12px] text-ink-muted">Térkép…</div>}>
                        <LocationPicker
                          center={center}
                          zoom={isCustom ? 7 : 12}
                          value={pin}
                          onChange={setPin}
                          className="h-[200px] overflow-hidden rounded-card border border-line"
                        />
                      </Suspense>
                      <p className="text-[11px] text-ink-faint">
                        {pin
                          ? "📍 Hely kijelölve — koppints máshová a módosításhoz."
                          : isCustom
                            ? "Koppints a térképre a település helyéhez (kötelező) — zoomolj rá nyugodtan."
                            : "Koppints a térképre a pontos helyhez (opcionális — alapból a város közepe)."}
                      </p>
                    </div>
                  );
                })()}

                {needsDate && (
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-10 w-full rounded-[10px] border border-line bg-surface-alt px-3 text-[13px] text-ink" />
                    <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="h-10 w-full rounded-[10px] border border-line bg-surface-alt px-3 text-[13px] text-ink" />
                  </div>
                )}

                <input value={venue} onChange={(e) => setVenue(e.target.value)} maxLength={120}
                  placeholder="Helyszín / cím (opcionális)" className="h-10 w-full rounded-[10px] border border-line bg-surface-alt px-3 text-[13.5px] text-ink" />
                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} maxLength={500} rows={2}
                  placeholder="Rövid leírás (opcionális)" className="w-full rounded-[10px] border border-line bg-surface-alt px-3 py-2 text-[13px] text-ink" />

                {turnstileSiteKey && <TurnstileWidget ref={turnstileRef} siteKey={turnstileSiteKey} onToken={setToken} />}
                {err && <p className="text-[12px] font-bold text-accent">{err}</p>}

                <button type="button" onClick={submit} disabled={submitting || !token}
                  className="w-full rounded-pill bg-primary py-3 text-[14px] font-black text-white shadow-card disabled:opacity-60">
                  {submitting ? "Beküldés…" : "Beküldöm jóváhagyásra"}
                </button>
                <p className="text-[11px] leading-snug text-ink-faint">Falu vagy kisváros? Válaszd a „Más település…" opciót, és jelöld a térképen. Anonim — nincs fiók, az IP-t nem tároljuk (csak spam ellen).</p>
              </>
            )}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
