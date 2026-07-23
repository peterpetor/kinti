"use client";

/**
 * megelheto-view.tsx — „Hova költözzek?" megélhetési térkép.
 *
 * A bérkalkulátor (salary-calc nettó) + lakbér (rent_benchmarks) + megélhetés
 * (budget-plan baseline) motorját RÉGIÓNKÉNT futtatja (/api/megelheto), és a
 * régió-buborék térképen (CantonBubbleMap) színezi: zöld = több marad, piros =
 * kevesebb. A FŐ vonalon van — az állást (bér) és a lakhatást (lakbér) köti össze
 * egy döntés-eszközben. Ország-tudatos (usePreferredCountry).
 */

import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { usePreferredCountry } from "@/lib/country-pref";
import { getCountry } from "@/lib/countries";
import { budgetCurrency, isBudgetCountry, type BudgetCountry } from "@/lib/budget-plan";

// Leaflet csak kliensen (window-függő) → SSR-en () => null.
const CantonBubbleMap =
  typeof window !== "undefined"
    ? lazy(() => import("./canton-bubble-map").then((m) => ({ default: m.CantonBubbleMap })))
    : () => null;

interface RegionRow {
  code: string; name: string; net: number; rent: number; cost: number; leftover: number; verdict: string;
}
interface ApiData {
  country: BudgetCountry; currency: "CHF" | "EUR"; gross: number;
  adults: number; kids: number; rooms: number; costTotal: number; regions: RegionRow[];
}

const DEFAULT_GROSS: Record<BudgetCountry, number> = { CH: 6000, AT: 2800, DE: 3200, NL: 3000 };
const REGION_WORD: Record<BudgetCountry, string> = { CH: "kanton", AT: "tartomány", DE: "tartomány", NL: "provincia" };

const inputCls =
  "h-12 w-full rounded-card border border-line bg-surface px-3 text-[14px] font-medium text-ink outline-none focus:border-primary/50";
const labelCls = "mb-1.5 block text-[12.5px] font-bold text-ink";
const pillNum =
  "rounded-pill py-2 text-[13px] font-bold text-center transition active:scale-95 border";
const pillTxt =
  "rounded-pill px-3.5 py-2 text-[13px] font-bold transition active:scale-95 border";
const pillOn = "border-primary bg-primary text-white";
const pillOff = "border-line bg-surface text-ink-muted";

/** Zöld→piros skála a min–max közti helyezés szerint (v = mennyi marad). */
function affColor(v: number, min: number, max: number): string {
  const t = max > min ? (v - min) / (max - min) : 1; // 0 (legrosszabb) .. 1 (legjobb)
  const hue = Math.round(6 + Math.min(1, Math.max(0, t)) * 122); // 6 (piros) → 128 (zöld)
  return `hsl(${hue} 66% 42%)`;
}
/** Kompakt buborék-felirat: 1234 → „1,2k", −200 → „−200". */
function fmtBubble(v: number): string {
  const neg = v < 0;
  const a = Math.abs(Math.round(v));
  const s = a >= 1000 ? (a / 1000).toFixed(a >= 10000 ? 0 : 1).replace(".", ",") + "k" : String(a);
  return (neg ? "−" : "") + s;
}

export function MegelhetoView() {
  const [prefCountry] = usePreferredCountry();
  const country: BudgetCountry = isBudgetCountry(prefCountry) ? prefCountry : "DE";

  const [gross, setGross] = useState("");
  const [adults, setAdults] = useState(1);
  const [kids, setKids] = useState(0);
  const [rooms, setRooms] = useState(2);
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState("");

  // Ország-váltáskor töltsük fel az alap bruttót (ha üres a mező).
  useEffect(() => {
    setGross((g) => (g.trim() === "" ? String(DEFAULT_GROSS[country]) : g));
    setSelected("");
  }, [country]);

  const grossNum = Number(gross) || 0;

  useEffect(() => {
    if (grossNum <= 0) { setData(null); return; }
    const ctrl = new AbortController();
    setLoading(true);
    const t = setTimeout(() => {
      fetch(`/api/megelheto?country=${country}&gross=${grossNum}&adults=${adults}&kids=${kids}&rooms=${rooms}`, {
        signal: ctrl.signal,
      })
        .then((r) => (r.ok ? (r.json() as Promise<ApiData>) : null))
        .then((d) => { setData(d); setLoading(false); })
        .catch(() => { /* abort / hálózati hiba */ });
    }, 300);
    return () => { ctrl.abort(); clearTimeout(t); };
  }, [country, grossNum, adults, kids, rooms]);

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    data?.regions.forEach((r) => { m[r.code] = r.leftover; });
    return m;
  }, [data]);

  const currency = data?.currency ?? budgetCurrency(country);
  const cur = currency === "CHF" ? "CHF" : "€";
  const fmt = (n: number) => `${new Intl.NumberFormat("hu-HU", { maximumFractionDigits: 0 }).format(Math.round(n))} ${cur}`;

  const ranked = data?.regions ?? []; // már leftover DESC sorrendben az API-ból
  const best = ranked[0];
  const worst = ranked[ranked.length - 1];
  const selectedRow = ranked.find((r) => r.code === selected) ?? null;
  const countryName = getCountry(country)?.name ?? country;
  const regionWord = REGION_WORD[country];

  return (
    <div className="space-y-5">
      <p className="text-[13px] leading-relaxed text-ink-muted">
        Állítsd be a bruttó béred és a családod — a térkép megmutatja, {countryName}
        {" "}melyik {regionWord}ában marad a legtöbb a hónap végén (nettó bér + családi
        pótlék − lakbér − megélhetés). <span className="text-ink-faint">Egy fizetésből számol.</span>
      </p>

      {/* ── Bemenetek ─────────────────────────────────────────────── */}
      <section className="space-y-4 rounded-card border border-line bg-surface p-4 shadow-card">
        <div>
          <label htmlFor="mh-gross" className={labelCls}>
            Havi bruttó bér ({cur})
          </label>
          <input
            id="mh-gross" type="number" inputMode="numeric" min={0}
            placeholder={`pl. ${DEFAULT_GROSS[country]}`}
            value={gross} onChange={(e) => setGross(e.target.value)} className={inputCls}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="min-w-0">
            <span className={labelCls}>Felnőttek</span>
            <div className="flex gap-2">
              {[1, 2].map((n) => (
                <button key={n} type="button" onClick={() => setAdults(n)}
                  className={cn(pillTxt, "min-w-0 flex-1", adults === n ? pillOn : pillOff)}>
                  {n === 1 ? "Egyedül" : "Párban"}
                </button>
              ))}
            </div>
          </div>
          <div className="min-w-0">
            <span className={labelCls}>Gyerekek</span>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3].map((n) => (
                <button key={n} type="button" onClick={() => setKids(n)}
                  className={cn(pillNum, "min-w-0 flex-1", kids === n ? pillOn : pillOff)}>
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <span className={labelCls}>Lakásméret (szoba)</span>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((n) => (
              <button key={n} type="button" onClick={() => setRooms(n)}
                className={cn(pillNum, "min-w-0 flex-1", rooms === n ? pillOn : pillOff)}>
                {n}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Térkép ────────────────────────────────────────────────── */}
      <section className="space-y-2">
        <Suspense fallback={<div className="grid h-[320px] place-items-center rounded-card border border-line bg-surface-alt/50 text-[12.5px] text-ink-muted">Térkép betöltése…</div>}>
          <CantonBubbleMap
            counts={counts}
            selectedCanton={selected}
            onSelectCanton={setSelected}
            country={country}
            sizeMode="range"
            colorForValue={affColor}
            formatValue={fmtBubble}
          />
        </Suspense>
        {/* Jelmagyarázat */}
        <div className="flex items-center justify-between gap-2 px-1 text-[11px] font-semibold text-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "hsl(6 66% 42%)" }} /> kevesebb marad
          </span>
          <span className="text-ink-faint">{loading ? "számolás…" : `a buborék felirata: ami marad / hó`}</span>
          <span className="inline-flex items-center gap-1.5">
            több marad <span className="h-2.5 w-2.5 rounded-full" style={{ background: "hsl(128 66% 42%)" }} />
          </span>
        </div>
      </section>

      {/* ── Kiválasztott régió részletei ─────────────────────────────── */}
      {selectedRow && (
        <section className="rounded-card border-2 border-primary/25 bg-primary-soft p-4 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-extrabold tracking-tight text-ink">{selectedRow.name}</h2>
            <span className="rounded-pill px-3 py-1 text-[13px] font-extrabold text-white" style={{ background: affColor(selectedRow.leftover, worst?.leftover ?? 0, best?.leftover ?? 1) }}>
              {fmt(selectedRow.leftover)}/hó marad
            </span>
          </div>
          <dl className="mt-3 space-y-1.5 text-[12.5px]">
            <Row label="Nettó bér (havi átlag)" value={`+ ${fmt(selectedRow.net)}`} pos />
            <Row label={`Lakbér (${rooms} szoba, medián)`} value={`− ${fmt(selectedRow.rent)}`} />
            <Row label="Megélhetés (rezsi, kaja, közlekedés…)" value={`− ${fmt(selectedRow.cost)}`} />
          </dl>
        </section>
      )}

      {/* ── Rangsor ──────────────────────────────────────────────────── */}
      {ranked.length > 0 && (
        <section className="space-y-2">
          <h2 className="px-1 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
            Rangsor — hol marad a legtöbb
          </h2>
          <ul className="space-y-1.5">
            {ranked.map((r, i) => (
              <li key={r.code}>
                <button
                  type="button"
                  onClick={() => setSelected(r.code === selected ? "" : r.code)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-card border bg-surface px-3 py-2.5 text-left transition active:scale-[0.99]",
                    r.code === selected ? "border-primary/50 shadow-card" : "border-line",
                  )}
                >
                  <span className="w-5 shrink-0 text-center text-[12px] font-bold text-ink-faint">{i + 1}</span>
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: affColor(r.leftover, worst?.leftover ?? 0, best?.leftover ?? 1) }} />
                  <span className="min-w-0 flex-1 truncate text-[13.5px] font-bold text-ink">{r.name}</span>
                  <span className="shrink-0 text-[13px] font-extrabold tabular-nums text-ink">{fmt(r.leftover)}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Tovább a fő pillérekhez ─────────────────────────────────── */}
      <section className="grid grid-cols-1 gap-2 pt-1">
        <Link href={`/berkalkulator?c=${country}${grossNum > 0 ? `&b=${grossNum}` : ""}${selected ? `&r=${selected}` : ""}`}
          className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 shadow-card transition active:scale-[0.99]">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-primary/10 text-primary"><Icon name="filter" size={17} strokeWidth={2.2} /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13.5px] font-extrabold text-ink">Pontosítsd a bérkalkulátorban</span>
            <span className="block text-[11.5px] text-ink-muted">Részletes nettó-bontás, saját lakbér, adóosztály</span>
          </span>
          <Icon name="chevR" size={16} strokeWidth={2.6} className="shrink-0 text-ink-faint" />
        </Link>
        <div className="grid grid-cols-2 gap-2">
          <Link href="/piacter" className="flex flex-col rounded-card border border-line bg-surface p-3 shadow-card transition active:scale-[0.98]">
            <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-primary/10 text-primary"><Icon name="key" size={17} strokeWidth={2.2} /></span>
            <span className="mt-2 block text-[13px] font-extrabold text-ink">Kiadó lakások</span>
            <span className="mt-0.5 block text-[11px] text-ink-muted">Albérlet-börze a régiódban</span>
          </Link>
          <Link href="/allasok" className="flex flex-col rounded-card border border-line bg-surface p-3 shadow-card transition active:scale-[0.98]">
            <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-primary/10 text-primary"><Icon name="briefcase" size={17} strokeWidth={2.2} /></span>
            <span className="mt-2 block text-[13px] font-extrabold text-ink">Állások</span>
            <span className="mt-0.5 block text-[11px] text-ink-muted">Magyar-barát munkahelyek</span>
          </Link>
        </div>
      </section>

      <p className="px-1 text-[11px] leading-relaxed text-ink-faint">
        Becslés közösségi és hivatalos adatokból: a lakbér a régiós medián (rent_benchmarks),
        a megélhetés országos referencia. A tényleges összeg a konkrét lakástól és élethelyzettől függ.
      </p>
    </div>
  );
}

function Row({ label, value, pos }: { label: string; value: string; pos?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="min-w-0 truncate text-ink-muted">{label}</dt>
      <dd className={cn("shrink-0 font-bold tabular-nums", pos ? "text-success" : "text-ink")}>{value}</dd>
    </div>
  );
}
