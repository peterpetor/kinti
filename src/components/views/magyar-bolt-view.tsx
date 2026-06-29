"use client";

import { useState, useEffect, useCallback, useRef, useMemo, lazy, Suspense } from "react";
import { cn } from "@/lib/cn";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY, countryLocative } from "@/lib/countries";
import { BOLT_CATEGORIES, type BoltSpot } from "@/lib/magyar-bolt";
import { TurnstileWidget, type TurnstileWidgetRef } from "@/components/turnstile-widget";

const CENTERS: Record<string, [number, number]> = { CH: [46.82, 8.23], AT: [47.59, 14.14], DE: [51.1, 10.4], NL: [52.13, 5.29] };

const MagyarBoltMap =
  typeof window !== "undefined"
    ? lazy(() => import("./magyar-bolt-map").then((m) => ({ default: m.MagyarBoltMap })))
    : () => null;
const LocationPicker =
  typeof window !== "undefined"
    ? lazy(() => import("./location-picker").then((m) => ({ default: m.LocationPicker })))
    : () => null;

export function MagyarBoltView({ turnstileSiteKey }: { turnstileSiteKey: string }) {
  const [prefCountry] = usePreferredCountry();
  const country = prefCountry ?? DEFAULT_COUNTRY;
  const countryRef = useRef(country);
  countryRef.current = country;

  const [spots, setSpots] = useState<BoltSpot[]>([]);
  const [filter, setFilter] = useState("all");
  const [modal, setModal] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/magyarbolt?country=${country}`);
      const data = (await res.json()) as { spots?: BoltSpot[] };
      if (countryRef.current !== country) return; // stale (országváltás közben)
      setSpots(data.spots ?? []);
    } catch { /* marad */ }
  }, [country]);
  useEffect(() => { load(); }, [load]);

  const visible = useMemo(() => (filter === "all" ? spots : spots.filter((s) => s.category === filter)), [spots, filter]);

  async function report(id: string) {
    try {
      await fetch("/api/magyarbolt", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "report", id }) });
    } catch { /* csendes */ }
  }

  // Beküldő-állapot
  const [name, setName] = useState("");
  const [category, setCategory] = useState("pekseg");
  const [locName, setLocName] = useState("");
  const [note, setNote] = useState("");
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
  const [token, setToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  function openModal() {
    setName(""); setCategory("pekseg"); setLocName(""); setNote(""); setPin(null);
    setToken(""); setErr(null); setDone(false); turnstileRef.current?.reset(); setModal(true);
  }

  async function submit() {
    setErr(null);
    if (name.trim().length < 2) { setErr("Add meg a hely nevét."); return; }
    if (!pin) { setErr("Koppints a térképre a pontos helyhez."); return; }
    if (!token) { setErr("Várd meg a robot-ellenőrzést."); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/magyarbolt", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ country, category, name: name.trim(), locationName: locName.trim() || null, note: note.trim() || null, lat: pin.lat, lng: pin.lng, turnstileToken: token }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok) { setErr(data.error ?? "Nem sikerült."); turnstileRef.current?.reset(); setToken(""); setSubmitting(false); return; }
      setDone(true);
      load();
    } catch { setErr("Hálózati hiba."); }
    setSubmitting(false);
  }

  return (
    <div className="space-y-3">
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
        <Pill active={filter === "all"} onClick={() => setFilter("all")} label="Mind" />
        {BOLT_CATEGORIES.map((c) => (
          <Pill key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)} label={`${c.emoji} ${c.label}`} />
        ))}
      </div>

      {visible.length > 0 ? (
        <Suspense fallback={<MapFallback />}>
          <MagyarBoltMap spots={visible} country={country} onReport={report} className="h-[60vh] min-h-[380px] w-full" />
        </Suspense>
      ) : (
        <div className="grid h-[42vh] min-h-[280px] place-items-center rounded-card border border-dashed border-line bg-surface px-6 text-center text-[13px] text-ink-muted">
          Még nincs bejelölt magyar hely {countryLocative(country)}. Legyél te az első — hol veszel otthoni ízeket? 🥖
        </div>
      )}

      <button type="button" onClick={openModal}
        className="w-full rounded-pill bg-primary py-3.5 text-[15px] font-black text-white shadow-card transition active:scale-[0.98]">
        ➕ Tudok egy magyar helyet — felteszem a térképre
      </button>

      {modal && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-3 bg-ink/40 backdrop-blur-sm" onClick={() => !submitting && setModal(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-card border border-line bg-surface p-5 shadow-card-strong space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-extrabold text-ink">➕ Magyar hely felvétele</h3>
              <button type="button" onClick={() => setModal(false)} className="grid h-8 w-8 place-items-center rounded-full bg-surface-alt text-ink-muted">✕</button>
            </div>

            {done ? (
              <div className="space-y-3 py-4 text-center">
                <p className="text-3xl">🎉</p>
                <p className="text-[14px] font-bold text-ink">Köszönjük! Felkerült a térképre.</p>
                <button type="button" onClick={() => setModal(false)} className="w-full rounded-pill bg-primary py-2.5 text-[13px] font-bold text-white">Rendben</button>
              </div>
            ) : (
              <>
                <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80}
                  placeholder="A hely neve (pl. Budapest Bäckerei)" className="h-10 w-full rounded-[10px] border border-line bg-surface-alt px-3 text-[13.5px] text-ink" />
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 w-full rounded-[10px] border border-line bg-surface-alt px-3 text-[13.5px] text-ink">
                  {BOLT_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
                </select>
                <input value={locName} onChange={(e) => setLocName(e.target.value)} maxLength={80}
                  placeholder="Cím / város (opcionális)" className="h-10 w-full rounded-[10px] border border-line bg-surface-alt px-3 text-[13px] text-ink" />
                <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} rows={2}
                  placeholder="Tipp (pl. friss kenyér szombaton, magyar kolbász…)" className="w-full rounded-[10px] border border-line bg-surface-alt px-3 py-2 text-[13px] text-ink" />

                <div>
                  <p className="mb-1 text-[12px] font-bold text-ink-muted">Koppints a pontos helyre:</p>
                  <Suspense fallback={<MapFallback small />}>
                    <LocationPicker center={CENTERS[country] ?? CENTERS.CH} value={pin} onChange={setPin} className="h-[240px] w-full" />
                  </Suspense>
                  {pin && <p className="mt-1 text-[11px] text-success">✓ Hely kijelölve</p>}
                </div>

                {turnstileSiteKey && <TurnstileWidget ref={turnstileRef} siteKey={turnstileSiteKey} onToken={setToken} />}
                {err && <p className="text-[12px] font-bold text-accent">{err}</p>}

                <button type="button" onClick={submit} disabled={submitting || !token}
                  className="w-full rounded-pill bg-primary py-3 text-[14px] font-black text-white shadow-card disabled:opacity-60">
                  {submitting ? "Felteszem…" : "Felteszem a térképre"}
                </button>
                <p className="text-[11px] leading-snug text-ink-faint">Azonnal megjelenik. Anonim — nincs fiók, az IP-det nem tároljuk.</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MapFallback({ small }: { small?: boolean }) {
  return <div className={cn("grid w-full place-items-center rounded-card border border-line bg-surface text-[12.5px] text-ink-muted", small ? "h-[240px]" : "h-[60vh] min-h-[380px]")}>Térkép betöltése…</div>;
}

function Pill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick}
      className={cn("shrink-0 rounded-pill px-3 py-1.5 text-[12px] font-bold transition", active ? "bg-primary text-white shadow-card" : "border border-line bg-surface text-ink-muted")}>
      {label}
    </button>
  );
}
