"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY } from "@/lib/countries";

interface ExchangeData {
  date: string;
  rates: { HUF: number; EUR: number };
  inverse: { hufToChf: number; eurToChf: number };
}

/**
 * ExchangeRateWidget — kompakt árfolyam-jelző a főoldalon.
 * 1 CHF = X HUF, klikkre megy a /arfolyam oldalra a kalkulátorhoz.
 */
export function ExchangeRateWidget() {
  const [data, setData] = useState<ExchangeData | null>(null);
  const [error, setError] = useState(false);
  const [prefCountry] = usePreferredCountry();

  useEffect(() => {
    fetch("/api/exchange-rate")
      .then((res) => (res.ok ? res.json() : null))
      .then((d: unknown) => {
        if (
          d &&
          typeof d === "object" &&
          "rates" in d &&
          (d as ExchangeData).rates?.HUF
        ) {
          setData(d as ExchangeData);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true));
  }, []);

  if (error || !data) return null;

  // CH: 1 CHF = X Ft. Más ország (EUR-bázis, AT/DE/NL): 1 EUR = Y Ft, a CHF-alap
  // rátákból számolva (HUF/CHF ÷ EUR/CHF). DKK/SEK később (nem élő még).
  const isEur = (prefCountry ?? DEFAULT_COUNTRY) !== "CH";
  const base = isEur ? "EUR" : "CHF";
  const perHuf = isEur && data.rates.EUR ? data.rates.HUF / data.rates.EUR : data.rates.HUF;
  const hufFmt = perHuf.toLocaleString("hu-HU", { maximumFractionDigits: 1 });

  return (
    <Link
      href="/arfolyam"
      className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 shadow-card transition active:scale-[0.99]"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-primary-soft text-primary text-lg">
        💱
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[16px] font-extrabold tracking-tight text-ink">
            1 {base} = {hufFmt} Ft
          </span>
        </div>
        <p className="text-[11px] text-ink-muted">
          ECB középárfolyam · {fmtDate(data.date)} · Kalkulátor + díjak →
        </p>
      </div>
      <Icon name="chevR" size={14} className="shrink-0 text-ink-muted" />
    </Link>
  );
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("hu-HU", { month: "short", day: "numeric" });
}
