"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/cn";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY } from "@/lib/countries";
import { JOB_CATEGORIES, jobCategoryLabel } from "@/lib/job-categories";
import type { ExternalJob } from "@/lib/repo-external-jobs";

const SOURCE_LABEL: Record<string, string> = { adzuna: "Adzuna", jooble: "Jooble", arbeitnow: "Arbeitnow", "job-room": "job-room.ch (SECO)" };

function fmtSalary(j: ExternalJob): string | null {
  if (j.salaryMin == null && j.salaryMax == null) return null;
  const cur = j.currency ?? "EUR";
  const n = (v: number) => Math.round(v).toLocaleString("hu-HU");
  if (j.salaryMin != null && j.salaryMax != null) return `${n(j.salaryMin)}–${n(j.salaryMax)} ${cur}`;
  return `${n((j.salaryMin ?? j.salaryMax)!)} ${cur}`;
}

export function ExternalJobsSection() {
  const [prefCountry] = usePreferredCountry();
  const country = prefCountry ?? DEFAULT_COUNTRY;

  const [jobs, setJobs] = useState<ExternalJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/external?country=${country}&category=${filter}`);
      const data = (await res.json()) as { jobs?: ExternalJob[] };
      setJobs(data.jobs ?? []);
    } catch { /* marad */ }
    setLoading(false);
  }, [country, filter]);
  useEffect(() => { load(); }, [load]);

  // Csak azok a kategóriák a szűrőben, amikben épp van találat (+ Mind).
  const presentCats = new Set(jobs.map((j) => j.category).filter(Boolean) as string[]);
  const cats = JOB_CATEGORIES.filter((c) => presentCats.has(c.id) || filter === c.id);

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-[16px] font-extrabold tracking-tight text-ink">Élő állások 🔴</h2>
        <p className="mt-0.5 text-[12px] leading-snug text-ink-muted">
          {country === "CH"
            ? "Friss hirdetések a hivatalos állami álláskeresőből (Job-Room / arbeit.swiss) — naponta frissül. A „Megnézem” gomb a forrásoldalra visz, ott jelentkezhetsz."
            : "Friss hirdetések partner-állásportálokról (Adzuna, Jooble) — naponta frissül. A „Megnézem” gomb a forrásoldalra visz, ott jelentkezhetsz."}
        </p>
      </div>

      {(filter !== "all" || cats.length > 0) && (
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
          <Pill active={filter === "all"} onClick={() => setFilter("all")} label="Mind" />
          {cats.map((c) => (
            <Pill key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)} label={`${c.emoji} ${c.label}`} />
          ))}
        </div>
      )}

      {loading ? (
        <p className="py-6 text-center text-[13px] text-ink-muted">Betöltés…</p>
      ) : jobs.length === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-surface px-5 py-8 text-center text-[12.5px] text-ink-muted">
          Most nincs friss élő hirdetés ebben az országban. Nézd meg a hivatalos forrásokat lentebb, vagy nézz vissza később.
        </div>
      ) : (
        <div className="space-y-2.5">
          {jobs.map((j) => (
            <a
              key={j.id}
              href={j.sourceUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="block rounded-card border border-line bg-surface p-4 shadow-card transition active:scale-[0.99]"
            >
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="text-[14.5px] font-extrabold leading-snug tracking-[-0.01em] text-ink">{j.title}</h3>
                  <p className="mt-0.5 text-[12.5px] text-ink-muted">
                    {[j.company, j.location].filter(Boolean).join(" · ") || "—"}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {j.category && (
                      <span className="rounded-pill bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                        {jobCategoryLabel(j.category)}
                      </span>
                    )}
                    {fmtSalary(j) && (
                      <span className="rounded-pill bg-star/10 px-2 py-0.5 text-[11px] font-bold text-star">{fmtSalary(j)}</span>
                    )}
                    <span className="rounded-pill bg-surface-alt px-2 py-0.5 text-[10.5px] font-medium text-ink-faint">
                      via {SOURCE_LABEL[j.source] ?? j.source}
                    </span>
                  </div>
                </div>
                <span className="shrink-0 rounded-pill bg-primary px-3 py-1.5 text-[12px] font-bold text-white">Megnézem ↗</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

function Pill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-pill px-3 py-1.5 text-[12px] font-bold transition",
        active ? "bg-primary text-white shadow-card" : "border border-line bg-surface text-ink-muted",
      )}
    >
      {label}
    </button>
  );
}
