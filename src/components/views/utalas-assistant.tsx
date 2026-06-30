"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { usePersistedState } from "@/hooks/use-persisted-state";
import { useIsPro } from "@/lib/use-is-pro";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY } from "@/lib/countries";
import { X_PROVIDERS, bestProvider, receivedAmount, savingsVsBank } from "@/lib/exchange-providers";

interface RateNow { rates: { HUF: number; EUR: number }; date: string }
interface HistPoint { date: string; huf: number; eur: number }

const fmtHuf = (n: number) => Math.round(n).toLocaleString("hu-HU");

/**
 * Utalás-asszisztens (PRO) — a hazautalásod köré épülő, MÉRHETŐ havi spórolás:
 * beállítod a szokásos összeged, az asszisztens megmondja, JÓ-e most utalni (a
 * 30-napos átlaghoz képest) és MELYIK szolgáltató a legjobb, majd a „Elutaltam"
 * gombbal vezeti a megtakarításodat (becsült, a banki utaláshoz viszonyítva).
 */
export function UtalasAssistant() {
  const isPro = useIsPro();
  const [prefCountry] = usePreferredCountry();
  const country = prefCountry ?? DEFAULT_COUNTRY;
  const isEuro = country !== "CH"; // CH=CHF bázis; AT/DE/NL=EUR bázis
  const base = isEuro ? "EUR" : "CHF";

  const [amountStr, setAmountStr] = usePersistedState("kinti_utalas_amount", "500");
  const [savedTotal, setSavedTotal] = usePersistedState<number>("kinti_utalas_saved", 0);
  const [count, setCount] = usePersistedState<number>("kinti_utalas_count", 0);
  const [lastAt, setLastAt] = usePersistedState<string>("kinti_utalas_last", "");

  const [now, setNow] = useState<RateNow | null>(null);
  const [hist, setHist] = useState<HistPoint[] | null>(null);
  const [err, setErr] = useState(false);
  const [justLogged, setJustLogged] = useState(false);

  useEffect(() => {
    if (isPro !== true) return; // csak PRO-nak töltjük az adatot
    let on = true;
    Promise.all([
      fetch("/api/exchange-rate").then((r) => (r.ok ? (r.json() as Promise<RateNow>) : null)),
      fetch("/api/exchange-rate?history=30").then((r) => (r.ok ? (r.json() as Promise<{ series: HistPoint[] }>) : null)),
    ])
      .then(([n, h]) => {
        if (!on) return;
        if (n && n.rates) setNow(n);
        else setErr(true);
        if (h && h.series) setHist(h.series);
      })
      .catch(() => { if (on) setErr(true); });
    return () => { on = false; };
  }, [isPro]);

  const amount = useMemo(() => {
    const v = Number(String(amountStr).replace(",", "."));
    return Number.isFinite(v) && v > 0 ? v : 0;
  }, [amountStr]);

  // baseToHuf: CH-ban CHF→HUF; eurozónában EUR→HUF a CHF-keresztből (huf/eur).
  const baseToHuf = useMemo(() => {
    if (!now) return 0;
    return isEuro ? (now.rates.EUR > 0 ? now.rates.HUF / now.rates.EUR : 0) : now.rates.HUF;
  }, [now, isEuro]);

  // 30-napos átlag + a mai eltérése → trend-jelzés.
  const trend = useMemo(() => {
    if (!hist || hist.length < 5 || !baseToHuf) return null;
    const vals = hist.map((d) => (isEuro ? (d.eur > 0 ? d.huf / d.eur : 0) : d.huf)).filter((x) => x > 0);
    if (vals.length < 5) return null;
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    const pct = ((baseToHuf - avg) / avg) * 100;
    return { avg, pct };
  }, [hist, baseToHuf, isEuro]);

  const best = useMemo(() => (baseToHuf ? bestProvider(amount, baseToHuf) : null), [amount, baseToHuf]);
  const bestReceived = best ? receivedAmount(amount, baseToHuf, best) : 0;
  const bestSavings = best ? savingsVsBank(amount, baseToHuf, best) : 0;

  function logTransfer() {
    if (bestSavings <= 0) return;
    setSavedTotal((s) => (s || 0) + bestSavings);
    setCount((c) => (c || 0) + 1);
    setLastAt(new Date().toISOString());
    setJustLogged(true);
    setTimeout(() => setJustLogged(false), 2200);
  }

  // — PRO-kapu —
  if (isPro === null) {
    return <div className="rounded-card border border-line bg-surface p-6 text-center text-[13px] text-ink-muted">Betöltés…</div>;
  }
  if (isPro === false) {
    return (
      <div className="rounded-card border-2 border-star/30 bg-star/5 p-6 text-center">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-[14px] bg-star text-white">
          <Icon name="lock" size={22} strokeWidth={2.4} />
        </div>
        <p className="text-[15px] font-extrabold text-ink">Utalás-asszisztens — PRO funkció</p>
        <p className="mx-auto mt-1 max-w-xs text-[13px] text-ink-muted">
          Mérhető havi spórolás a hazautaláson: megmondja, mikor és melyik szolgáltatóval éri meg
          utalni, és vezeti, mennyit spóroltál.
        </p>
        <Link href="/pro" className="mt-4 inline-flex items-center justify-center rounded-pill bg-star px-5 py-2.5 text-[14px] font-extrabold text-white transition hover:bg-[#d68f20] active:scale-[0.98]">
          Kinti PRO feloldása
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Megtakarítás-számláló — a „miért éri meg" érték */}
      <section className="rounded-card border-2 border-primary/30 bg-gradient-to-br from-primary-soft to-surface p-5 shadow-pop">
        <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Eddigi megtakarításod</p>
        <p className="mt-1 text-[34px] font-black leading-none tracking-tight text-primary">
          {fmtHuf(savedTotal || 0)} <span className="text-[20px]">Ft</span>
        </p>
        <p className="mt-1.5 text-[12px] text-ink-muted">
          {count > 0
            ? `${count} utalás · vs. tipikus banki utalás (becsült).`
            : "Még nincs rögzített utalásod — lent az „Elutaltam” gombbal indul a számláló."}
          {lastAt && ` Utolsó: ${new Date(lastAt).toLocaleDateString("hu-HU")}.`}
        </p>
      </section>

      {/* Beállítás */}
      <section className="rounded-card border border-line bg-surface p-5 shadow-card space-y-3">
        <div className="flex items-center gap-2">
          <Icon name="sliders" size={14} strokeWidth={2.2} className="text-primary" />
          <h2 className="text-[14px] font-extrabold text-ink">A szokásos utalásod</h2>
        </div>
        <div className="relative">
          <input
            type="number"
            inputMode="decimal"
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
            min="0"
            step="any"
            className="h-12 w-full rounded-[14px] border border-line bg-surface-alt px-3.5 pr-16 text-[18px] font-extrabold text-ink outline-none focus:bg-surface focus:ring-2 focus:ring-primary/30"
            placeholder="500"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] font-bold text-ink-muted">{base} → Ft</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[200, 500, 1000, 2000].map((a) => (
            <button key={a} type="button" onClick={() => setAmountStr(String(a))}
              className="rounded-[10px] border border-line bg-surface-alt px-2 py-1.5 text-[12px] font-bold text-ink active:scale-95">
              {a}
            </button>
          ))}
        </div>
      </section>

      {err && (
        <p className="rounded-card border border-line bg-surface p-4 text-center text-[12.5px] text-ink-muted">
          Az árfolyam most nem elérhető — próbáld kicsit később.
        </p>
      )}

      {/* Trend — jó-e most utalni? */}
      {now && trend && (
        <section className={cn(
          "rounded-card border-2 p-5 shadow-card",
          trend.pct >= 1 ? "border-primary/40 bg-primary-soft/40"
          : trend.pct <= -1 ? "border-accent/40 bg-accent/5"
          : "border-line bg-surface",
        )}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{trend.pct >= 1 ? "📈" : trend.pct <= -1 ? "📉" : "➖"}</span>
            <p className="text-[14px] font-extrabold text-ink">
              {trend.pct >= 1 ? "Most jó utalni" : trend.pct <= -1 ? "Érdemes várni" : "Átlag körül"}
            </p>
          </div>
          <p className="text-[12.5px] leading-snug text-ink-muted">
            {`1 ${base} = ${fmtHuf(baseToHuf)} Ft — ez a 30-napos átlag (${fmtHuf(trend.avg)} Ft) `}
            <strong className={trend.pct >= 0 ? "text-primary" : "text-accent"}>
              {`${trend.pct >= 0 ? "+" : ""}${trend.pct.toFixed(1)}%`}-a
            </strong>
            {trend.pct >= 1 ? ". Most többet kap a családod ugyanannyi pénzből."
              : trend.pct <= -1 ? ". Ha nem sürgős, pár nap múlva jobb lehet."
              : ". Nincs erős jelzés egyik irányba sem."}
          </p>
        </section>
      )}

      {/* Legjobb szolgáltató + megtakarítás + Elutaltam */}
      {now && best && amount > 0 && (
        <section className="rounded-card border border-line bg-surface p-5 shadow-card space-y-3">
          <p className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
            A legjobb a(z) {amount} {base}-re
          </p>
          <a
            href={best.url ?? "#"}
            target="_blank"
            rel="sponsored nofollow noopener noreferrer"
            className="flex items-center gap-3 rounded-[12px] border border-primary/30 bg-primary-soft/30 px-3 py-3 transition hover:bg-primary-soft/50 active:scale-[0.99]"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] text-white text-[12px] font-extrabold" style={{ backgroundColor: best.color }}>
              {best.name.charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-extrabold text-ink">{best.name} · {best.speed}</div>
              <div className="text-[11.5px] text-ink-muted truncate">{best.note}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[15px] font-extrabold text-ink">{fmtHuf(bestReceived)} Ft</div>
              {bestSavings > 0 && <div className="text-[11px] font-bold text-primary">+{fmtHuf(bestSavings)} Ft vs. bank</div>}
            </div>
          </a>

          <button
            type="button"
            onClick={logTransfer}
            disabled={bestSavings <= 0}
            className={cn(
              "w-full rounded-[12px] py-3 text-[14px] font-extrabold tracking-tight transition active:scale-[0.98]",
              justLogged ? "bg-primary/80 text-white"
              : bestSavings > 0 ? "bg-primary text-white shadow-card"
              : "bg-surface-alt text-ink-muted cursor-not-allowed",
            )}
          >
            {justLogged ? `✓ +${fmtHuf(bestSavings)} Ft hozzáadva` : "Elutaltam — add hozzá a megtakarításhoz"}
          </button>
          <p className="text-[10.5px] leading-snug text-ink-faint">
            A megtakarítás BECSÜLT (publikált átlag-spread a banki utaláshoz viszonyítva), nem real-time.
            A Wise/Revolut kártya referál-link — ha rajta keresztül utalsz, a Kintit is támogatod.
            Nem pénzügyi tanácsadás.
          </p>
        </section>
      )}
    </div>
  );
}
