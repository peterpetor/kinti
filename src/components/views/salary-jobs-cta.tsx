"use client";

/**
 * salary-jobs-cta.tsx — „Bérkalkulátorból → Job Board" tölcsér.
 *
 * A kalkulátor eredménye alatt a felhasználó BÉRSÁVJÁBA (havi bruttó ±20%) eső,
 * fizetést feltüntető Kinti-hirdetéseket mutatja — a kiemelt (fizetett) hirdetés
 * elöl (szponzorált hely a kalkulátor alatt). Debounce-olt fetch (gépelés közben
 * nem lövünk), 0 találatnál SEMMI nem jelenik meg (üresség-elv).
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { trackAction } from "@/components/usage-tracker";

interface SalaryJob {
  id: string;
  title: string;
  location: string;
  companyName: string | null;
  featured: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
}

function fmtRange(j: SalaryJob): string {
  const cur = j.currency === "CHF" ? "CHF" : "€";
  const nf = new Intl.NumberFormat("hu-HU", { maximumFractionDigits: 0 });
  if (j.salaryMin != null && j.salaryMax != null && j.salaryMin !== j.salaryMax) {
    return `${nf.format(j.salaryMin)}–${nf.format(j.salaryMax)} ${cur}/hó`;
  }
  const v = j.salaryMin ?? j.salaryMax;
  return v != null ? `${nf.format(v)} ${cur}/hó` : "";
}

export function SalaryJobsCta({ country, grossMonthly }: { country: string; grossMonthly: number }) {
  const [jobs, setJobs] = useState<SalaryJob[]>([]);
  const viewTracked = useRef(false);

  // Debounce: a bruttó-mező gépelése közben ne pörgessük az API-t; 700 ms
  // nyugalom után kérdezünk, és csak értelmes összegre (>= 500).
  useEffect(() => {
    if (!Number.isFinite(grossMonthly) || grossMonthly < 500) {
      setJobs([]);
      return;
    }
    const t = setTimeout(() => {
      fetch(`/api/jobs/match?country=${encodeURIComponent(country)}&gross=${Math.round(grossMonthly)}`)
        .then((r) => (r.ok ? (r.json() as Promise<{ kinti?: SalaryJob[] }>) : null))
        .then((d) => {
          const list = d?.kinti ?? [];
          setJobs(list);
          if (list.length > 0 && !viewTracked.current) {
            viewTracked.current = true;
            trackAction("salary-jobs-view");
          }
        })
        .catch(() => {});
    }, 700);
    return () => clearTimeout(t);
  }, [country, grossMonthly]);

  if (jobs.length === 0) return null;

  return (
    <section className="rounded-card border border-line bg-surface p-4 shadow-card">
      <p className="text-[13.5px] font-extrabold text-ink">💼 Állások ebben a bérsávban</p>
      <p className="mt-0.5 text-[11.5px] text-ink-muted">
        Aktív hirdetések feltüntetett fizetéssel, a számolt bruttód közelében:
      </p>
      <div className="mt-2.5 space-y-2">
        {jobs.map((j) => (
          <Link
            key={j.id}
            href={`/allasok/${j.id}`}
            onClick={() => trackAction("salary-jobs-click")}
            className="flex items-center gap-2.5 rounded-xl border border-line bg-surface-alt/50 px-3.5 py-2.5 transition active:scale-[0.99]"
          >
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13.5px] font-bold text-ink">{j.title}</span>
              <span className="block truncate text-[11.5px] text-ink-muted">
                {[j.companyName, j.location, fmtRange(j)].filter(Boolean).join(" · ")}
              </span>
            </span>
            {j.featured && (
              <span className="shrink-0 rounded-pill bg-star/15 px-2 py-0.5 text-[10px] font-bold text-star">
                Kiemelt
              </span>
            )}
            <Icon name="chevR" size={14} strokeWidth={2.2} className="shrink-0 text-ink-faint" />
          </Link>
        ))}
      </div>
      <Link
        href="/allasok"
        onClick={() => trackAction("salary-jobs-click")}
        className="mt-2.5 block text-center text-[12px] font-bold text-primary"
      >
        Összes állás böngészése →
      </Link>
    </section>
  );
}
