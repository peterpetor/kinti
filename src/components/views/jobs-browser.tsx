"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { CANTONS, cantonName } from "@/lib/cantons";
import { JOB_CATEGORIES, jobCategoryLabel } from "@/lib/job-categories";
import type { Job } from "@/lib/types";

/**
 * JobsBrowser — kliensoldali állás-kereső: szabad szöveg (cím/leírás/hely) +
 * kanton + szakma szűrő. A teljes (jóváhagyott) lista a szerverről jön, a
 * szűrés a böngészőben történik — a jelenlegi listaméretnél ez azonnali.
 */
export function JobsBrowser({ jobs }: { jobs: Job[] }) {
  const [query, setQuery] = useState("");
  const [canton, setCanton] = useState("");
  const [category, setCategory] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter((job) => {
      if (canton && job.cantonCode !== canton) return false;
      if (category && job.category !== category) return false;
      if (q) {
        const haystack = `${job.title} ${job.description} ${job.location}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [jobs, query, canton, category]);

  const hasActiveFilter = canton !== "" || category !== "" || query.trim() !== "";

  return (
    <div className="space-y-4">
      {/* Kereső + szűrők */}
      <div className="space-y-2">
        <div className="relative">
          <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Keresés cím, leírás, hely szerint…"
            className="h-12 w-full rounded-pill border border-line bg-surface-alt pl-9 pr-4 text-[14px] focus:border-primary/50 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={cn(
              "h-11 rounded-[14px] border bg-surface-alt px-3 text-[13.5px] font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30",
              category ? "border-primary/40 text-ink" : "border-line text-ink-muted",
            )}
          >
            <option value="">Összes szakma</option>
            {JOB_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
            ))}
          </select>

          <select
            value={canton}
            onChange={(e) => setCanton(e.target.value)}
            className={cn(
              "h-11 rounded-[14px] border bg-surface-alt px-3 text-[13.5px] font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30",
              canton ? "border-primary/40 text-ink" : "border-line text-ink-muted",
            )}
          >
            <option value="">Összes kanton</option>
            {CANTONS.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>

        {hasActiveFilter && (
          <button
            type="button"
            onClick={() => { setQuery(""); setCanton(""); setCategory(""); }}
            className="text-[12px] font-bold text-primary hover:underline"
          >
            Szűrők törlése ({filtered.length} találat)
          </button>
        )}
      </div>

      {/* Találatok */}
      <section className="space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-card border border-dashed border-line bg-surface-alt px-4 py-10 text-center text-[13px] text-ink-muted">
            {jobs.length === 0
              ? "Jelenleg nincs aktív álláshirdetés. Nézz vissza később!"
              : "Nincs a szűrőknek megfelelő állás. Próbálj tágítani a feltételeken."}
          </div>
        ) : (
          filtered.map((job) => {
            const cat = jobCategoryLabel(job.category);
            const cant = cantonName(job.cantonCode);
            return (
              <Link
                href={`/allasok/${job.id}`}
                key={job.id}
                className={cn(
                  "block rounded-card border bg-surface p-4 transition-all active:scale-[0.98]",
                  job.status === "featured" ? "border-2 border-accent shadow-pop bg-accent/[0.02]" : "border-line shadow-card hover:border-primary/30"
                )}
              >
                {job.status === "featured" && (
                  <div className="mb-2 inline-flex items-center gap-1 rounded-pill bg-accent px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-sm">
                    <Icon name="star" size={9} filled /> Kiemelt Állás
                  </div>
                )}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-[16px] font-extrabold text-ink">{job.title}</h3>
                    <p className="text-[13px] text-ink-muted mt-0.5 font-medium">
                      {job.location}{cant ? ` · ${cant}` : ""}
                    </p>
                  </div>
                  <span className="rounded-full bg-surface-alt px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-ink-muted">
                    {job.employmentType === 'full-time' ? '100%' : job.employmentType === 'part-time' ? 'Részmunkaidő' : job.employmentType}
                  </span>
                </div>

                {(cat || (job.salaryMin && job.salaryMax)) && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {cat && (
                      <span className="rounded-[8px] bg-primary/10 px-2.5 py-1 text-[12px] font-bold text-primary">
                        {cat}
                      </span>
                    )}
                    {job.salaryMin && job.salaryMax && (
                      <span className="flex items-center gap-1.5 rounded-[8px] bg-success/10 px-2.5 py-1 text-[13px] font-bold text-success">
                        <Icon name="star" size={14} />
                        {job.salaryMin} - {job.salaryMax} {job.currency}
                      </span>
                    )}
                  </div>
                )}

                <p className="mt-3 text-[13px] leading-relaxed text-ink-muted line-clamp-2">
                  {job.description}
                </p>

                <div className="mt-4 border-t border-line/60 pt-3 flex items-center justify-between text-[11px] font-bold text-ink-faint uppercase tracking-wide">
                  <span>Dátum: {new Date(job.createdAt).toLocaleDateString('hu-HU')}</span>
                  <span className="text-primary flex items-center gap-1">
                    Részletek <Icon name="chevR" size={12} strokeWidth={3} />
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </section>
    </div>
  );
}
