"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui";
import { ProLockOverlay } from "@/components/pro-lock-overlay";
import { cn } from "@/lib/cn";
import { usePersistedState } from "@/hooks/use-persisted-state";
import { useIsPro } from "@/lib/use-is-pro";
import { VAPID_PUBLIC_KEY, urlBase64ToUint8Array } from "@/lib/push-keys";
import { readPreferredCanton } from "@/lib/canton-pref";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY } from "@/lib/countries";
import { rankedProviders, receivedAmount, savingsVsBank, effectiveSpread } from "@/lib/exchange-providers";

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
    if (isPro === null) return; // előbb dőljön el a PRO-státusz; utána MINDENKINEK töltünk
    let on = true;              // (nem-PRO is látja az előnézetet — árfolyam publikus)
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

  // Hétvégén több szolgáltató (pl. Revolut standard) pótfelárat tesz a váltásra —
  // ilyenkor a rangsor is másképp alakul, ezért nap-tudatosan számolunk.
  const weekend = useMemo(() => [0, 6].includes(new Date().getDay()), []);
  const ranked = useMemo(() => (baseToHuf ? rankedProviders(amount, baseToHuf, weekend) : []), [amount, baseToHuf, weekend]);
  const best = ranked[0] ?? null; // a legjobb (a lista élén) — az Elutaltam ehhez számol
  const second = ranked[1] ?? null;
  const bestSavings = best ? savingsVsBank(amount, baseToHuf, best, weekend) : 0;

  // „Miért ez?" — dinamikus indoklás a legjobb szolgáltatóra.
  const bestReason = useMemo(() => {
    if (!best || !baseToHuf) return "";
    const spreadPct = (effectiveSpread(best, weekend) * 100).toFixed(1).replace(".", ",");
    const parts = [`a legkisebb árfolyam-felár (${spreadPct}%)`];
    if (best.fixedFee === 0) parts.push("és nincs fix díj");
    let s = `Nála érkezik a legtöbb forint: ${parts.join(" ")}.`;
    if (second) {
      const diff = Math.round(receivedAmount(amount, baseToHuf, best, weekend) - receivedAmount(amount, baseToHuf, second, weekend));
      if (diff > 0) s += ` ${fmtHuf(diff)} Ft-tal a második (${second.name}) előtt.`;
    }
    return s;
  }, [best, second, amount, baseToHuf, weekend]);

  // — Árfolyam-riasztás opt-in (push) —
  // Külön, RÉSZLEGES preferencia (notifyRemit): a beállítások-oldal 6 kategóriás
  // mentése szándékosan nem nyúl hozzá, így nem kapcsolja se be, se ki.
  const [remitOn, setRemitOn] = useState<boolean | null>(null); // null = még nem tudjuk
  const [remitBusy, setRemitBusy] = useState(false);
  const [remitErr, setRemitErr] = useState<string | null>(null);

  useEffect(() => {
    if (isPro !== true) return; // csak PRO-nál kérdezzük le
    let on = true;
    (async () => {
      try {
        if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
          if (on) setRemitOn(false);
          return;
        }
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (!sub) { if (on) setRemitOn(false); return; }
        const res = await fetch(`/api/push/preferences?endpoint=${encodeURIComponent(sub.endpoint)}`);
        const json = (await res.json()) as { notifyRemit?: boolean };
        if (on) setRemitOn(!!json.notifyRemit);
      } catch {
        if (on) setRemitOn(false);
      }
    })();
    return () => { on = false; };
  }, [isPro]);

  async function toggleRemit() {
    if (remitBusy) return;
    setRemitBusy(true);
    setRemitErr(null);
    const next = !remitOn;
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        setRemitErr("Ez a böngésző nem támogatja az értesítéseket.");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();

      // Bekapcsoláskor, ha még nincs feliratkozás → engedély + feliratkozás.
      if (next && !sub) {
        const perm = await Notification.requestPermission();
        if (perm !== "granted") {
          setRemitErr("Az értesítés-engedély nélkül nem tudunk szólni.");
          return;
        }
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
        });
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ subscription: sub.toJSON(), cantonCode: readPreferredCanton() }),
        });
      }
      if (!sub) { setRemitErr("Nincs aktív értesítés-feliratkozás."); return; }

      const res = await fetch("/api/push/preferences", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ endpoint: sub.endpoint, notifyRemit: next }),
      });
      if (!res.ok) { setRemitErr("Nem sikerült menteni — próbáld újra."); return; }
      setRemitOn(next);
    } catch {
      setRemitErr("Nem sikerült menteni — próbáld újra.");
    } finally {
      setRemitBusy(false);
    }
  }

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
    return (
      <div className="space-y-2 rounded-card border border-line bg-surface p-5 shadow-card" aria-busy="true">
        <span className="sr-only">Betöltés…</span>
        <div className="kinti-shimmer h-4 w-2/5 rounded-md bg-ink/10" />
        <div className="kinti-shimmer h-3 w-3/5 rounded-md bg-ink/10" />
        <div className="kinti-shimmer mt-3 h-10 w-full rounded-[12px] bg-ink/10" />
      </div>
    );
  }

  const content = (
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

      {/* Árfolyam-riasztás opt-in — ettől lesz a „mikor" PROAKTÍV (nem kell
          naponta benézni). Alapból KI: csak az kapja, aki kifejezetten kéri. */}
      <section className="rounded-card border border-line bg-surface p-5 shadow-card">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-primary-soft text-primary">
            <Icon name="bell" size={16} strokeWidth={2.2} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-extrabold text-ink">Szóljak, ha jó az árfolyam?</p>
            <p className="mt-0.5 text-[12px] leading-snug text-ink-muted">
              Push-értesítést küldünk azon a napon, amikor az árfolyam a 30-napos átlag fölé fordul — nem
              minden nap, csak a fordulónapon. Bármikor kikapcsolhatod.
            </p>
            {remitErr && <p className="mt-1.5 text-[11.5px] font-semibold text-accent">{remitErr}</p>}
          </div>
          <button
            type="button"
            onClick={toggleRemit}
            disabled={remitBusy || remitOn === null}
            aria-pressed={remitOn === true}
            aria-label="Árfolyam-riasztás be- és kikapcsolása"
            className={cn(
              "relative h-6 w-11 shrink-0 rounded-full transition",
              remitOn ? "bg-primary" : "bg-ink/15",
              (remitBusy || remitOn === null) && "opacity-60",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
                remitOn ? "left-[22px]" : "left-0.5",
              )}
            />
          </button>
        </div>
      </section>

      {/* Szolgáltató-összehasonlítás (rangsor) + megtakarítás + Elutaltam */}
      {now && best && amount > 0 && (
        <section className="rounded-card border border-line bg-surface p-5 shadow-card space-y-3">
          <p className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
            Melyikkel jársz jobban? · {amount} {base}
          </p>

          {weekend && (
            <p className="rounded-[10px] bg-star/10 px-3 py-2 text-[11px] font-semibold leading-snug text-ink-muted">
              📅 Hétvége van — a Revolut standard fiók most ~1,5% pótfelárral számol, ezért ilyenkor gyakran más a legjobb.
            </p>
          )}

          <div className="space-y-2">
            {ranked.map((p, i) => {
              const recv = receivedAmount(amount, baseToHuf, p, weekend);
              const sav = savingsVsBank(amount, baseToHuf, p, weekend);
              const isBest = i === 0;
              const rowCls = cn(
                "flex items-center gap-3 rounded-[12px] border px-3 py-3 transition",
                isBest ? "border-primary/40 bg-primary-soft/30" : "border-line bg-surface-alt/40",
                p.url && "hover:bg-primary-soft/50 active:scale-[0.99]",
              );
              const inner = (
                <>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] text-white text-[12px] font-extrabold" style={{ backgroundColor: p.color }}>
                    {p.name.charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[14px] font-extrabold text-ink truncate">{p.name}</span>
                      {isBest && <span className="shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-white">Legjobb</span>}
                      {p.url && <Icon name="chevR" size={12} className="shrink-0 text-primary" />}
                    </div>
                    <div className="text-[11px] text-ink-muted truncate">{p.speed} · {p.note}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[14.5px] font-extrabold text-ink">{fmtHuf(recv)} Ft</div>
                    {sav > 0
                      ? <div className="text-[11px] font-bold text-primary">+{fmtHuf(sav)} Ft vs. bank</div>
                      : <div className="text-[10.5px] text-ink-faint">banki szint körül</div>}
                  </div>
                </>
              );
              return p.url ? (
                <a key={p.name} href={p.url} target="_blank" rel="sponsored nofollow noopener noreferrer" className={rowCls}>{inner}</a>
              ) : (
                <div key={p.name} className={rowCls}>{inner}</div>
              );
            })}
          </div>

          {/* „Miért ez?" — átlátható indoklás a választásra */}
          {bestReason && (
            <div className="rounded-[10px] bg-surface-alt/60 px-3 py-2.5 text-[11.5px] leading-snug text-ink-muted">
              <strong className="text-ink">Miért a {best.name}?</strong> {bestReason} A rangsort a beírt összegre a{" "}
              <strong className="text-ink">ténylegesen megérkező forint</strong> szerint állítom fel (árfolyam-felár és fix díj együtt).
            </div>
          )}

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
            A Wise/Revolut kártya ajánlói (referral) link — ha rajta keresztül regisztrálsz, az üzemeltető
            juttatást kaphat; a szolgáltatók rangsorát ez NEM befolyásolja (az kizárólag a megérkező
            összeg szerint áll fel). Nem pénzügyi tanácsadás.
          </p>
        </section>
      )}
    </div>
  );

  // Nem-PRO: LÁTJA a valódi asszisztenst (előnézet), de nem használhatja → paywall.
  if (isPro === false) {
    return (
      <ProLockOverlay
        title="Utalás-asszisztens — PRO"
        subtitle="A díj-összehasonlítás ingyen megvan a kalkulátorban. A PRO azt teszi hozzá, amit az nem: megmondja, MIKOR éri meg utalni (a 30-napos átlaghoz mérve), a szokásos összegedre szabva — és vezeti, mennyit spóroltál eddig a bankhoz képest."
      >
        {content}
      </ProLockOverlay>
    );
  }
  return content;
}
