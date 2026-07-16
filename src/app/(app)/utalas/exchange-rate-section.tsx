"use client";

import { useEffect, useState } from "react";
import { ExchangeCalculator } from "@/components/views/exchange-calculator";

interface ExchangeData {
  date: string;
  rates: { HUF: number; EUR: number };
}

/**
 * Élő árfolyam-blokk az Utalás oldal tetején (árfolyam+utalás összevonás,
 * 2026-07-16): a cache-elt /api/exchange-rate-ből tölt KLIENSOLDALON — így az
 * oldal force-static maradhat (0 edge-route; a korábbi /arfolyam edge-oldala
 * megszűnt). A kalkulátor a meglévő ExchangeCalculator (Wise/Revolut
 * referál-linkekkel — azok a Provider.url-ben élnek, ld. referral-links).
 */
export function ExchangeRateSection() {
  const [data, setData] = useState<ExchangeData | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/exchange-rate")
      .then((r) => (r.ok ? (r.json() as Promise<ExchangeData>) : null))
      .then((d) => {
        if (cancelled) return;
        if (d?.rates?.HUF) setData(d);
        else setFailed(true);
      })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, []);

  if (failed) {
    return (
      <div className="rounded-card border border-accent/30 bg-accent-soft px-4 py-6 text-center text-[13px] text-ink-muted">
        Az árfolyam-szolgáltatás átmenetileg nem érhető el. Próbáld újra később.
      </div>
    );
  }
  if (!data) {
    /* Skeleton — az árfolyam-kártya helye, betöltés alatt. */
    return (
      <div className="space-y-2" aria-hidden="true">
        <div className="h-28 animate-pulse rounded-card border border-line bg-surface-alt" />
        <div className="h-40 animate-pulse rounded-card border border-line bg-surface-alt" />
      </div>
    );
  }
  return <ExchangeCalculator chfToHuf={data.rates.HUF} chfToEur={data.rates.EUR} date={data.date} />;
}
