"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY } from "@/lib/countries";

interface ExchangeData {
  date: string;
  rates: { HUF: number; EUR: number; GBP: number };
  inverse: { hufToChf: number; eurToChf: number };
}

/**
 * ExchangeRateWidget — kompakt árfolyam-jelző a főoldalon.
 * 1 CHF = X HUF, klikkre megy az /utalas oldalra a kalkulátorhoz
 * (az árfolyam+utalás összevonás óta ott él az árfolyam-kalkulátor).
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

  // A megjelenített bázis a VÁLASZTOTT ORSZÁG pénzneme: CH → CHF, GB → GBP,
  // egyébként EUR. Az API CHF-bázisú, ezért a nem-CHF bázisokat átszámoljuk
  // (HUF/CHF ÷ CÉL/CHF).
  // ⚠️ Korábban BINÁRIS volt (CH vagy EUR), ezért Anglián EURÓS árfolyam
  // jelent meg font helyett — a user jelentette.
  const cc = prefCountry ?? DEFAULT_COUNTRY;
  const base = cc === "CH" ? "CHF" : cc === "GB" ? "GBP" : "EUR";
  const cross = base === "CHF" ? 1 : base === "GBP" ? data.rates.GBP : data.rates.EUR;
  const perHuf = cross ? data.rates.HUF / cross : data.rates.HUF;
  const hufFmt = perHuf.toLocaleString("hu-HU", { maximumFractionDigits: 1 });

  return (
    <Link
      href="/utalas"
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
