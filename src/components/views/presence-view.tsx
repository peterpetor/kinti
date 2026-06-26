"use client";

import { useState, useEffect, useCallback, useRef, lazy, Suspense } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY, getCountry, countryLocative } from "@/lib/countries";
import { getRegions, getRegion } from "@/lib/regions";
import { TurnstileWidget, type TurnstileWidgetRef } from "@/components/turnstile-widget";

// Leaflet csak kliensen (window-függő) → SSR-en () => null.
const CantonBubbleMap =
  typeof window !== "undefined"
    ? lazy(() => import("./canton-bubble-map").then((m) => ({ default: m.CantonBubbleMap })))
    : () => null;

const LS_KEY = "kinti_presence_pinged"; // melyik országokban jelzett már be ez a böngésző

/**
 * PresenceView — „Ki költözött melléd?" anonim magyar jelenlét-hőtérkép.
 * Egyetlen kérdés (melyik régióban élsz?), nulla regisztráció. A számok „puhák"
 * (ezért „legalább X"), de rate-limit + Turnstile + localStorage-dedup védi.
 */
export function PresenceView({ turnstileSiteKey }: { turnstileSiteKey: string }) {
  const [prefCountry] = usePreferredCountry();
  const country = prefCountry ?? DEFAULT_COUNTRY;
  const countryName = getCountry(country)?.name ?? "";
  const regions = getRegions(country);

  const [counts, setCounts] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState("");
  const [pinned, setPinned] = useState(false);

  // Modal állapot
  const [modal, setModal] = useState(false);
  const [region, setRegion] = useState("");
  const [token, setToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/presence?country=${country}`);
      const data = (await res.json()) as { counts?: Record<string, number>; total?: number };
      setCounts(data.counts ?? {});
      setTotal(data.total ?? 0);
    } catch {
      /* hálózati hiba → marad a régi */
    }
    setLoading(false);
  }, [country]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    try {
      const arr = JSON.parse(localStorage.getItem(LS_KEY) ?? "[]") as string[];
      setPinned(Array.isArray(arr) && arr.includes(country));
    } catch { setPinned(false); }
  }, [country]);

  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  async function submit() {
    setErr(null);
    if (!region) { setErr("Válassz régiót."); return; }
    if (!token) { setErr("Várd meg a robot-ellenőrzést."); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/presence", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ country, regionCode: region, turnstileToken: token }),
      });
      const data = (await res.json().catch(() => ({}))) as { counts?: Record<string, number>; total?: number; error?: string };
      if (!res.ok) {
        setErr(data.error ?? "Nem sikerült a beküldés.");
        turnstileRef.current?.reset();
        setToken("");
        setSubmitting(false);
        return;
      }
      setCounts(data.counts ?? counts);
      setTotal(data.total ?? total);
      try {
        const arr = JSON.parse(localStorage.getItem(LS_KEY) ?? "[]") as string[];
        if (!arr.includes(country)) arr.push(country);
        localStorage.setItem(LS_KEY, JSON.stringify(arr));
      } catch { /* private mode → ok */ }
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

      {/* Térkép */}
      {total > 0 && (
        <Suspense fallback={<div className="grid h-[320px] place-items-center rounded-card border border-line bg-surface text-[12.5px] text-ink-muted">Térkép betöltése…</div>}>
          <CantonBubbleMap counts={counts} selectedCanton={selected} onSelectCanton={setSelected} country={country} />
        </Suspense>
      )}

      {/* Top régiók */}
      {top.length > 0 && (
        <section className="rounded-card border border-line bg-surface p-4 shadow-card">
          <h2 className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted mb-2">Hol vagyunk a legtöbben?</h2>
          <ul className="space-y-1.5">
            {top.map(([code, n]) => (
              <li key={code} className="flex items-center justify-between text-[13.5px]">
                <span className="font-semibold text-ink">{getRegion(country, code)?.name ?? code}</span>
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
              <h3 className="text-[16px] font-extrabold text-ink">📍 Melyik régióban élsz?</h3>
              <button type="button" onClick={() => setModal(false)} className="grid h-8 w-8 place-items-center rounded-full bg-surface-alt text-ink-muted">✕</button>
            </div>
            <p className="text-[12px] leading-snug text-ink-muted">
              Teljesen anonim — csak egy pont a térképen, hogy lásd, hányan vagyunk. Nincs fiók, nincs email.
            </p>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="h-11 w-full rounded-[10px] border border-line bg-surface-alt px-3 text-[14px] text-ink"
            >
              <option value="">Válassz régiót…</option>
              {regions.map((r) => (
                <option key={r.code} value={r.code}>{r.name}</option>
              ))}
            </select>

            {turnstileSiteKey && (
              <TurnstileWidget ref={turnstileRef} siteKey={turnstileSiteKey} onToken={setToken} />
            )}
            {err && <p className="text-[12px] font-bold text-accent">{err}</p>}

            <button
              type="button"
              onClick={submit}
              disabled={submitting || !region || !token}
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
