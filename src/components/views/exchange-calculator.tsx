"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";

/**
 * Becsült díjak népszerű utalás-szolgáltatókhoz (CHF → HUF). A publikált
 * tarifák átlaga, NEM real-time. Az aktuális díjat a user a szolgáltatónál
 * ellenőrzi — itt csak nagyságrendi összehasonlításként szerepelnek.
 *
 * Számítás: net_received = amount * (rate * (1 - spread)) - fixedFee
 *   spread: a köztes árfolyam-különbség (0.5% = 0.005)
 *   fixedFee: CHF-ben, ha van
 */
interface Provider {
  name: string;
  /** Spread (markup) a középárfolyamhoz képest, decimal (0.005 = 0.5%). */
  spread: number;
  /** Fix díj CHF-ben (amount-tól független). */
  fixedFee: number;
  /** Becsült érkezési idő. */
  speed: string;
  /** Egysoros leírás. */
  note: string;
  /** Marketing szín (hex). */
  color: string;
  /** Referál/affiliate link — ha van, a kártya kattinthatóvá válik. */
  url?: string;
}

const PROVIDERS: Provider[] = [
  {
    name: "Wise",
    spread: 0.005,
    fixedFee: 0.5,
    speed: "néhány óra",
    note: "Mid-market rate + transparens díj.",
    color: "#00b9ff",
    url: "https://wise.com/invite/dic/peterp286",
  },
  {
    name: "Revolut",
    spread: 0.005,
    fixedFee: 0,
    speed: "azonnali",
    note: "Standard fiók — hétvégén magasabb spread (~1.5%).",
    color: "#0075eb",
    url: "https://revolut.com/referral/?referral-code=pter9sxrh",
  },
  {
    name: "Bank SEPA",
    spread: 0.015,
    fixedFee: 5,
    speed: "1-2 munkanap",
    note: "Tipikus svájci bank — drágább, de közvetlen.",
    color: "#7f8c8d",
  },
];

export function ExchangeCalculator({
  chfToHuf,
  chfToEur,
  date,
}: {
  chfToHuf: number;
  chfToEur: number;
  date: string;
}) {
  const [chfAmount, setChfAmount] = useState("100");
  const [direction, setDirection] = useState<"to-huf" | "to-eur">("to-huf");

  const chf = useMemo(() => {
    const n = Number(chfAmount.replace(",", "."));
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [chfAmount]);

  const target = direction === "to-huf" ? chfToHuf : chfToEur;
  const targetSymbol = direction === "to-huf" ? "Ft" : "€";
  const grossTarget = chf * target;
  const grossTargetFmt = grossTarget.toLocaleString("hu-HU", {
    maximumFractionDigits: direction === "to-huf" ? 0 : 2,
  });

  return (
    <div className="space-y-4">
      {/* Központi árfolyam-kártya */}
      <section className="rounded-card border-2 border-primary/30 bg-gradient-to-br from-primary-soft to-surface p-5 shadow-pop">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">💱</span>
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
            Mai középárfolyam (ECB)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <RateCard
            label="1 CHF ="
            value={chfToHuf.toLocaleString("hu-HU", { maximumFractionDigits: 2 })}
            unit="Ft"
          />
          <RateCard
            label="1 CHF ="
            value={chfToEur.toFixed(4)}
            unit="€"
          />
        </div>

        <p className="mt-3 text-[11.5px] leading-snug text-ink-muted">
          Frissítés: <strong className="text-ink">{fmtDate(date)}</strong> · Forrás: Frankfurter / ECB
        </p>
      </section>

      {/* Kalkulátor */}
      <section className="rounded-card border border-line bg-surface p-5 shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <Icon name="sliders" size={14} strokeWidth={2.2} className="text-primary" />
          <h2 className="text-[14px] font-extrabold text-ink">Hazautalás kalkulátor</h2>
        </div>

        {/* Irány-toggle */}
        <div className="flex gap-1 rounded-pill border border-line bg-surface-alt p-1">
          <button
            type="button"
            onClick={() => setDirection("to-huf")}
            className={cn(
              "flex-1 rounded-pill px-3 py-1.5 text-[12px] font-bold transition",
              direction === "to-huf" ? "bg-surface text-ink shadow-card" : "text-ink-muted",
            )}
          >
            🇨🇭 CHF → 🇭🇺 HUF
          </button>
          <button
            type="button"
            onClick={() => setDirection("to-eur")}
            className={cn(
              "flex-1 rounded-pill px-3 py-1.5 text-[12px] font-bold transition",
              direction === "to-eur" ? "bg-surface text-ink shadow-card" : "text-ink-muted",
            )}
          >
            🇨🇭 CHF → 🇪🇺 EUR
          </button>
        </div>

        {/* Bemenet */}
        <div>
          <label className="block mb-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
            Mennyit utalsz?
          </label>
          <div className="relative">
            <input
              type="number"
              inputMode="decimal"
              value={chfAmount}
              onChange={(e) => setChfAmount(e.target.value)}
              min="0"
              step="any"
              className="h-12 w-full rounded-[14px] border border-line bg-surface-alt px-3.5 pr-16 text-[18px] font-extrabold text-ink outline-none focus:bg-surface focus:ring-2 focus:ring-primary/30"
              placeholder="100"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] font-bold text-ink-muted">
              CHF
            </span>
          </div>
        </div>

        {/* Eredmény — köztes árfolyam */}
        <div className="rounded-[14px] border border-dashed border-primary/30 bg-primary-soft/50 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
              Középárfolyamon (nettó, díj nélkül)
            </p>
            <span className="rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-accent">
              Becslés
            </span>
          </div>
          <p className="mt-0.5 text-[22px] font-extrabold tracking-tight text-primary">
            {grossTargetFmt} {targetSymbol}
          </p>
        </div>

        {/* Szolgáltatók */}
        {chf > 0 && direction === "to-huf" && (
          <div className="space-y-2">
            <p className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
              Becsült érkező összeg szolgáltatónként
            </p>
            {PROVIDERS.map((p) => {
              const actualRate = chfToHuf * (1 - p.spread);
              const netChf = Math.max(0, chf - p.fixedFee);
              const received = netChf * actualRate;
              const fee = chf * chfToHuf - received;
              const cardCls =
                "flex items-center gap-3 rounded-[12px] border border-line bg-surface px-3 py-2.5";
              const inner = (
                <>
                  <span
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] text-white text-[11px] font-extrabold"
                    style={{ backgroundColor: p.color }}
                  >
                    {p.name.charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[13px] font-extrabold text-ink">{p.name}</span>
                      <span className="text-[11.5px] text-ink-faint">· {p.speed}</span>
                    </div>
                    <p className="text-[11.5px] text-ink-muted truncate">{p.note}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center justify-end gap-1 text-[14px] font-extrabold text-ink">
                      {received.toLocaleString("hu-HU", { maximumFractionDigits: 0 })} Ft
                      {p.url && (
                        <Icon name="arrowRight" size={13} strokeWidth={2.6} className="text-ink-faint" />
                      )}
                    </div>
                    <div className="text-[11px] text-accent">
                      − {fee.toLocaleString("hu-HU", { maximumFractionDigits: 0 })} Ft díj
                    </div>
                  </div>
                </>
              );
              return p.url ? (
                <a
                  key={p.name}
                  href={p.url}
                  target="_blank"
                  rel="sponsored nofollow noopener noreferrer"
                  className={cn(
                    cardCls,
                    "transition hover:border-primary/40 hover:bg-surface-alt active:scale-[0.99]",
                  )}
                >
                  {inner}
                </a>
              ) : (
                <div key={p.name} className={cardCls}>
                  {inner}
                </div>
              );
            })}
            <p className="px-1 pt-0.5 text-[10.5px] leading-snug text-ink-faint">
              A Wise és Revolut kártyára kattintva referál-linkre jutsz — ha rajta keresztül
              regisztrálsz, a Kintit is támogatod. A díjak becsültek, az aktuálisat a
              szolgáltatónál ellenőrizd.
            </p>
          </div>
        )}
      </section>

      {/* Gyors-konvertálók */}
      <section className="rounded-card border border-line bg-surface p-4 shadow-card">
        <p className="mb-2 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
          Gyors-konverzió
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[100, 500, 1000].map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setChfAmount(String(amt))}
              className="rounded-[10px] border border-line bg-surface-alt px-2 py-2 text-[11.5px] font-bold text-ink active:scale-95"
            >
              {amt} CHF
              <br />
              <span className="text-[11.5px] text-ink-muted font-medium">
                = {(amt * chfToHuf).toLocaleString("hu-HU", { maximumFractionDigits: 0 })} Ft
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function RateCard({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-[14px] bg-surface border border-line px-3 py-2.5 shadow-card">
      <p className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">{label}</p>
      <p className="mt-0.5 text-[18px] font-extrabold tracking-tight text-ink">
        {value}{" "}
        <span className="text-[12px] font-bold text-ink-muted">{unit}</span>
      </p>
    </div>
  );
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("hu-HU", { year: "numeric", month: "long", day: "numeric" });
}
