"use client";

import { useMemo, useState, lazy, Suspense } from "react";
import { usePersistedState } from "@/hooks/use-persisted-state";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { CANTONS, cantonName } from "@/lib/cantons";
import { JOB_CATEGORIES, jobCategoryLabel } from "@/lib/job-categories";
import { jobMatchScore, hasMatchableProfile, type MatchProfile } from "@/lib/job-match";
import type { Job } from "@/lib/types";

// Leaflet csak kliensen (window-függő) → SSR-en () => null.
const CantonBubbleMap =
  typeof window !== "undefined"
    ? lazy(() => import("./canton-bubble-map").then((m) => ({ default: m.CantonBubbleMap })))
    : () => null;

export interface ProMatchContext {
  isPro: boolean;
  profile: MatchProfile | null;
}

/**
 * JobsBrowser — kliensoldali állás-kereső: szabad szöveg (cím/leírás/hely) +
 * kanton + szakma szűrő. A teljes (jóváhagyott) lista a szerverről jön, a
 * szűrés a böngészőben történik — a jelenlegi listaméretnél ez azonnali.
 *
 * `proMatch` (PRO funkció): ha az előfizető profilja kitöltött, minden álláshoz
 * megjelenik a „X% match" jelvény.
 */
export function JobsBrowser({ jobs, proMatch }: { jobs: Job[]; proMatch?: ProMatchContext }) {
  const canMatch = !!proMatch?.isPro && hasMatchableProfile(proMatch.profile);
  const [query, setQuery] = useState("");
  const [canton, setCanton] = usePersistedState("kinti_jobs_canton", "");
  const [category, setCategory] = usePersistedState("kinti_jobs_category", "");
  const [showMap, setShowMap] = useState(false);

  // Kanton-térképhez: darabszám kantononként, a kanton-szűrőt KIVÉVE (hogy a
  // térképen minden kanton látsszon, amiből választani lehet).
  const cantonCounts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const counts: Record<string, number> = {};
    for (const job of jobs) {
      if (category && job.category !== category) continue;
      if (q) {
        const haystack = `${job.title} ${job.description} ${job.location}`.toLowerCase();
        if (!haystack.includes(q)) continue;
      }
      if (job.cantonCode) counts[job.cantonCode] = (counts[job.cantonCode] ?? 0) + 1;
    }
    return counts;
  }, [jobs, query, category]);

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

      {/* Térkép: hol vannak az állások (kanton-buborékok) — koppintásra szűr */}
      {jobs.length > 0 && Object.keys(cantonCounts).length > 0 && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowMap((s) => !s)}
            className="flex w-full items-center gap-2.5 rounded-card border border-line bg-surface px-4 py-3 text-left shadow-card transition active:scale-[0.99]"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-primary/10 text-[17px]">🗺️</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13.5px] font-extrabold tracking-[-0.01em] text-ink">
                Térkép — hol vannak az állások?
              </span>
              <span className="block text-[11.5px] text-ink-muted">
                {Object.keys(cantonCounts).length} kanton · koppints egy kantonra a szűréshez
              </span>
            </span>
            <Icon name="chevD" size={16} strokeWidth={2.4} className={cn("shrink-0 text-ink-faint transition-transform", showMap && "rotate-180")} />
          </button>

          {showMap && (
            <Suspense
              fallback={
                <div className="grid h-[320px] place-items-center rounded-card border border-line bg-surface text-[12.5px] font-semibold text-ink-muted shadow-card">
                  Térkép betöltése…
                </div>
              }
            >
              <CantonBubbleMap counts={cantonCounts} selectedCanton={canton} onSelectCanton={setCanton} />
            </Suspense>
          )}
        </div>
      )}

      {/* PRO match-score sáv */}
      {proMatch && !canMatch && (
        proMatch.isPro ? (
          <Link
            href="/allasok/profil"
            className="flex items-center gap-2.5 rounded-card border border-primary/20 bg-primary/5 px-4 py-3 text-left transition active:scale-[0.99]"
          >
            <span className="text-lg">🎯</span>
            <span className="min-w-0 flex-1 text-[12.5px] leading-snug text-ink">
              <strong className="text-ink">Tölts ki egy munkavállalói profilt</strong> (szakma + kanton), és minden álláshoz látod a <strong className="text-primary">% match-et</strong>.
            </span>
            <Icon name="chevR" size={15} strokeWidth={2.4} className="shrink-0 text-primary" />
          </Link>
        ) : (
          <Link
            href="/pro"
            className="flex items-center gap-2.5 rounded-card border border-[#ff9600]/25 bg-[#ff9600]/5 px-4 py-3 text-left transition active:scale-[0.99]"
          >
            <span className="text-lg">🔒</span>
            <span className="min-w-0 flex-1 text-[12.5px] leading-snug text-ink">
              <strong className="text-[#cc7700]">PRO:</strong> lásd, melyik állás illik a profilodhoz — <strong>% match</strong> minden hirdetésnél.
            </span>
            <Icon name="chevR" size={15} strokeWidth={2.4} className="shrink-0 text-[#cc7700]" />
          </Link>
        )
      )}

      {/* Találatok */}
      <section className="space-y-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-card border border-line bg-surface px-6 py-10 text-center shadow-card">
            <Icon name="search" size={28} className="text-ink-faint" />
            <p className="text-[15px] font-extrabold text-ink">
              {jobs.length === 0
                ? "Még nincs aktív álláshirdetés"
                : canton
                  ? `Nincs állás ${cantonName(canton)} kantonban`
                  : "Nincs a szűrőknek megfelelő állás"}
            </p>
            <p className="max-w-xs text-[12.5px] leading-relaxed text-ink-muted">
              {jobs.length === 0
                ? "Légy te az első! Ha magyar munkaerőt keresel, hirdesd meg itt ingyen — pont a megfelelő közönség előtt."
                : "Próbálj tágítani a szűrőkön — vagy ha munkaerőt keresel, add fel az állásod."}
            </p>
            <Link
              href="/munkaltato"
              className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-pill bg-primary px-4 py-2.5 text-[13px] font-extrabold text-white shadow-card-hover active:scale-[0.98]"
            >
              <Icon name="plus" size={14} strokeWidth={2.6} /> Hirdesd meg az állásod
            </Link>
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
                  <div className="mb-2 inline-flex items-center gap-1 rounded-pill bg-accent px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
                    <Icon name="star" size={9} filled /> Kiemelt Állás
                  </div>
                )}
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h3 className="text-[16px] font-extrabold text-ink">{job.title}</h3>
                    <p className="text-[13px] text-ink-muted mt-0.5 font-medium">
                      {job.location}{cant ? ` · ${cant}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="rounded-full bg-surface-alt px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-ink-muted">
                      {job.employmentType === 'full-time' ? '100%' : job.employmentType === 'part-time' ? 'Részmunkaidő' : job.employmentType}
                    </span>
                    {canMatch && (() => {
                      const m = jobMatchScore(proMatch!.profile!, job);
                      const tone = m.score >= 66 ? "bg-success/15 text-success" : m.score >= 40 ? "bg-[#e3a233]/15 text-[#b8860b]" : "bg-surface-alt text-ink-muted";
                      return (
                        <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-black", tone)}>
                          {m.score}% match
                        </span>
                      );
                    })()}
                  </div>
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
