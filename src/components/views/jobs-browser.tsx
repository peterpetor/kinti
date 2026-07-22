"use client";

import { useMemo, useState, useEffect, lazy, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { ExternalJob } from "@/lib/repo-external-jobs";
import { usePersistedState } from "@/hooks/use-persisted-state";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { foldSearchText } from "@/lib/sql-fold";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY } from "@/lib/countries";
import { getRegions, regionName } from "@/lib/regions";
import { jobCategoryLabel, formatJobCurrency } from "@/lib/job-categories";
import { JobCategoryOptions } from "@/components/views/job-category-options";
import { jobMatchScore, hasMatchableProfile, type MatchProfile } from "@/lib/job-match";
import { parseDbDate } from "@/lib/dates";
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

const EXT_SOURCE_LABEL: Record<string, string> = { adzuna: "Adzuna", jooble: "Jooble", arbeitnow: "Arbeitnow", "job-room": "job-room.ch (SECO)" };

function fmtExtSalary(j: ExternalJob): string | null {
  if (j.salaryMin == null && j.salaryMax == null) return null;
  const cur = j.currency ?? "EUR";
  const n = (v: number) => Math.round(v).toLocaleString("hu-HU");
  if (j.salaryMin != null && j.salaryMax != null) return `${n(j.salaryMin)}–${n(j.salaryMax)} ${cur}`;
  return `${n((j.salaryMin ?? j.salaryMax)!)} ${cur}`;
}

/**
 * JobsBrowser — kliensoldali állás-kereső: szabad szöveg (cím/leírás/hely) +
 * kanton + szakma szűrő. A teljes (jóváhagyott) lista a szerverről jön, a
 * szűrés a böngészőben történik — a jelenlegi listaméretnél ez azonnali.
 *
 * `proMatch` (PRO funkció): ha az előfizető profilja kitöltött, minden álláshoz
 * megjelenik a „X% egyezés" jelvény.
 */
export function JobsBrowser({ jobs, proMatch }: { jobs: Job[]; proMatch?: ProMatchContext }) {
  const canMatch = !!proMatch?.isPro && hasMatchableProfile(proMatch.profile);
  // ?q= mélylink (pl. a Mindenkereső / megosztott link) → előtöltött keresés.
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams?.get("q") ?? "");
  // Régió-szűrő ORSZÁG-HATÓKÖRÖS perzisztálással: a mentett érték "CC:CODE"
  // formátumú, és csak akkor él, ha a tárolt ország = az aktuális ország. Ezért a
  // más országbeli választás nem szivárog át ország-váltáskor: AT „W" nem üríti ki
  // némán a svájci listát, és az NL „ZH" (Zuid-Holland) nem szűr a svájci „ZH"
  // (Zürich)-re. Az explore-view reset-guardjának testvér-megoldása — itt a kódok
  // országok közti ütközése miatt érték-hatókörös perzisztálással (nem elég a
  // „létezik-e a kód az új országban" ellenőrzés, mert ZH mindkét országban létezik).
  const [cantonPref, setCantonPref] = usePersistedState("kinti_jobs_canton", "");
  const [category, setCategory] = usePersistedState("kinti_jobs_category", "");
  const [showMap, setShowMap] = useState(false);

  // Ország-tudatos (6-ország). Hidratálás-biztos: mount előtt CH-default = minden
  // állás (az SSR is azt rendereli; jelenleg minden állás CH), mount után a választott.
  const [prefCountry] = usePreferredCountry();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const country = mounted ? prefCountry ?? DEFAULT_COUNTRY : DEFAULT_COUNTRY;
  const regions = useMemo(() => getRegions(country), [country]);

  // A tárolt "CC:CODE"-ból az aktuális országra érvényes régió-kód (különben "").
  const canton = useMemo(() => {
    const sep = cantonPref.indexOf(":");
    if (sep < 0) return ""; // üres vagy régi (ország nélküli) formátum → nincs szűrő
    return cantonPref.slice(0, sep) === country ? cantonPref.slice(sep + 1) : "";
  }, [cantonPref, country]);
  const setCanton = (code: string) => setCantonPref(code ? `${country}:${code}` : "");
  const jobsInCountry = useMemo(() => jobs.filter((j) => (j.country ?? "CH") === country), [jobs, country]);

  // Kanton-térképhez: darabszám kantononként, a kanton-szűrőt KIVÉVE (hogy a
  // térképen minden kanton látsszon, amiből választani lehet).
  const cantonCounts = useMemo(() => {
    const q = foldSearchText(query.trim());
    const counts: Record<string, number> = {};
    for (const job of jobsInCountry) {
      if (category && job.category !== category) continue;
      if (q) {
        const haystack = foldSearchText(`${job.title} ${job.description} ${job.location}`);
        if (!haystack.includes(q)) continue;
      }
      if (job.cantonCode) counts[job.cantonCode] = (counts[job.cantonCode] ?? 0) + 1;
    }
    return counts;
  }, [jobsInCountry, query, category]);

  const filtered = useMemo(() => {
    const q = foldSearchText(query.trim());
    const list = jobsInCountry.filter((job) => {
      if (canton && job.cantonCode !== canton) return false;
      if (category && job.category !== category) return false;
      if (q) {
        const haystack = foldSearchText(`${job.title} ${job.description} ${job.location}`);
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
    // Kiemelt (featured) Kinti-hirdetések ELÖL; a többi marad a szerver-sorrendben (legújabb elöl).
    return list.slice().sort((a, b) => (b.status === "featured" ? 1 : 0) - (a.status === "featured" ? 1 : 0));
  }, [jobsInCountry, query, canton, category]);

  // — Élő (külső, API-ból aggregált) állások, ugyanebbe a listába fűzve —
  // A régió-szűrést a SZERVER végzi (a feloldott canton_code alapján): a canton is
  // a fetch paramétere, hogy régió-választáskor a helyes szeletet kapjuk.
  const [externalJobs, setExternalJobs] = useState<ExternalJob[]>([]);
  const [extLoading, setExtLoading] = useState(true);
  useEffect(() => {
    let ignore = false;
    setExtLoading(true);
    (async () => {
      try {
        const res = await fetch(
          `/api/jobs/external?country=${country}&category=${category || "all"}&canton=${canton || "all"}`,
        );
        const data = (await res.json()) as { jobs?: ExternalJob[] };
        if (ignore) return; // ország/kategória/régió-váltás közbeni elavult válasz eldobása
        setExternalJobs(data.jobs ?? []);
      } catch { /* marad */ }
      if (!ignore) setExtLoading(false);
    })();
    return () => { ignore = true; };
  }, [country, category, canton]);

  // A szerver már ország + kategória + régió szerint szűrt; itt csak a szabad-
  // szöveges keresést alkalmazzuk a külső hirdetésekre.
  const externalFiltered = useMemo(() => {
    const q = foldSearchText(query.trim());
    if (!q) return externalJobs;
    return externalJobs.filter((j) => foldSearchText(`${j.title} ${j.company ?? ""} ${j.location ?? ""}`).includes(q));
  }, [externalJobs, query]);

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
            <JobCategoryOptions />
          </select>

          <select
            value={canton}
            onChange={(e) => setCanton(e.target.value)}
            className={cn(
              "h-11 rounded-[14px] border bg-surface-alt px-3 text-[13.5px] font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30",
              canton ? "border-primary/40 text-ink" : "border-line text-ink-muted",
            )}
          >
            <option value="">Összes régió</option>
            {regions.map((c) => (
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
            Szűrők törlése ({filtered.length + externalFiltered.length} találat)
          </button>
        )}
      </div>

      {/* Térkép: hol vannak az állások (kanton-buborékok) — koppintásra szűr.
          CSAK ha legalább 3 régióban van állás: 1-2 régiónál a térkép értelmetlen
          (egy buborék), a régió-legördülő úgyis elég. */}
      {jobsInCountry.length > 0 && Object.keys(cantonCounts).length >= 3 && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowMap((s) => !s)}
            className="flex w-full items-center gap-2.5 rounded-card border border-line bg-surface px-4 py-3 text-left shadow-card transition active:scale-[0.99]"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-primary/10 text-primary"><Icon name="map" size={18} strokeWidth={2} /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13.5px] font-extrabold tracking-[-0.01em] text-ink">
                Térkép — hol vannak az állások?
              </span>
              <span className="block text-[11.5px] text-ink-muted">
                {Object.keys(cantonCounts).length} régió · koppints a szűréshez
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
              <CantonBubbleMap counts={cantonCounts} selectedCanton={canton} onSelectCanton={setCanton} country={country} />
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
            <Icon name="target" size={18} strokeWidth={2} className="shrink-0 text-primary" />
            <span className="min-w-0 flex-1 text-[12.5px] leading-snug text-ink">
              <strong className="text-ink">Tölts ki egy munkavállalói profilt</strong> (szakma + kanton), és minden álláshoz látod a <strong className="text-primary">% egyezést</strong>.
            </span>
            <Icon name="chevR" size={15} strokeWidth={2.4} className="shrink-0 text-primary" />
          </Link>
        ) : (
          <Link
            href="/pro"
            className="flex items-center gap-2.5 rounded-card border border-pro/25 bg-pro/5 px-4 py-3 text-left transition active:scale-[0.99]"
          >
            <Icon name="lock" size={18} strokeWidth={2} className="shrink-0 text-[#cc7700]" />
            <span className="min-w-0 flex-1 text-[12.5px] leading-snug text-ink">
              <strong className="text-[#cc7700]">Kinti PRO:</strong> lásd, melyik állás illik a profilodhoz — <strong>% egyezés</strong> minden hirdetésnél. <span className="text-ink-muted">(Ez a Kinti PRO álláskereső funkciója — <strong>nem</strong> a Szaknévsor PRO, amit a vállalkozásodhoz vehetsz.)</span>
            </span>
            <Icon name="chevR" size={15} strokeWidth={2.4} className="shrink-0 text-[#cc7700]" />
          </Link>
        )
      )}

      {/* Találatok */}
      <section className="space-y-4">
        {filtered.length === 0 && externalFiltered.length === 0 ? (
          extLoading ? (
            <p className="py-8 text-center text-[13px] text-ink-muted">Állások betöltése…</p>
          ) : (
          <div className="flex flex-col items-center gap-2 rounded-card border border-line bg-surface px-6 py-10 text-center shadow-card">
            <Icon name="search" size={28} className="text-ink-faint" />
            <p className="text-[15px] font-extrabold text-ink">
              {jobsInCountry.length === 0
                ? "A legjobb álláskereső-források — egy helyen"
                : canton
                  ? `Nincs állás itt: ${regionName(country, canton)}`
                  : "Nincs a szűrőknek megfelelő állás"}
            </p>
            <p className="max-w-xs text-[12.5px] leading-relaxed text-ink-muted">
              {jobsInCountry.length === 0
                ? "Magyar-barát hirdetések folyamatosan érkeznek. Addig is összegyűjtöttük neked a hivatalos és vezető állásportálokat — görgess lejjebb. Munkaerőt keresel? Hirdesd meg ingyen."
                : "Próbálj tágítani a szűrőkön — vagy ha munkaerőt keresel, add fel az állásod."}
            </p>
            <Link
              href="/munkaltato"
              className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-pill bg-primary px-4 py-2.5 text-[13px] font-extrabold text-white shadow-card-hover active:scale-[0.98]"
            >
              <Icon name="plus" size={14} strokeWidth={2.6} /> Hirdesd meg az állásod
            </Link>
          </div>
          )
        ) : (
          <>
            {filtered.map((job) => {
            const cat = jobCategoryLabel(job.category);
            const cant = regionName(job.country ?? "CH", job.cantonCode);
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
                      {job.employmentType === 'full-time' ? 'Teljes munkaidő' : job.employmentType === 'part-time' ? 'Részmunkaidő' : job.employmentType}
                    </span>
                    {canMatch && (() => {
                      const m = jobMatchScore(proMatch!.profile!, job);
                      const tone = m.score >= 66 ? "bg-success/15 text-success" : m.score >= 40 ? "bg-star/15 text-[#b8860b]" : "bg-surface-alt text-ink-muted";
                      return (
                        <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-black", tone)}>
                          {m.score}% egyezés
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
                        {job.salaryMin} - {job.salaryMax} {formatJobCurrency(job.currency)}
                      </span>
                    )}
                  </div>
                )}

                <p className="mt-3 text-[13px] leading-relaxed text-ink-muted line-clamp-2">
                  {job.description}
                </p>

                <div className="mt-4 border-t border-line/60 pt-3 flex items-center justify-between text-[11px] font-bold text-ink-faint uppercase tracking-wide">
                  <span>Dátum: {parseDbDate(job.createdAt)?.toLocaleDateString("hu-HU") ?? ""}</span>
                  <span className="text-primary flex items-center gap-1">
                    Részletek <Icon name="chevR" size={12} strokeWidth={3} />
                  </span>
                </div>
              </Link>
            );
            })}

            {externalFiltered.length > 0 && (
              <>
                <div className="flex items-center gap-2 pt-1">
                  <span className="h-px flex-1 bg-line" />
                  <span className="flex shrink-0 items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-faint">
                    Élő hirdetések partnerektől
                    <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                  </span>
                  <span className="h-px flex-1 bg-line" />
                </div>
                {externalFiltered.map((j) => (
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
                        <p className="mt-0.5 text-[12.5px] text-ink-muted">{[j.company, j.location].filter(Boolean).join(" · ") || "—"}</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          {j.category && (
                            <span className="rounded-pill bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">{jobCategoryLabel(j.category)}</span>
                          )}
                          {fmtExtSalary(j) && (
                            <span className="rounded-pill bg-star/10 px-2 py-0.5 text-[11px] font-bold text-star">{fmtExtSalary(j)}</span>
                          )}
                          <span className="rounded-pill bg-surface-alt px-2 py-0.5 text-[10.5px] font-medium text-ink-faint">via {EXT_SOURCE_LABEL[j.source] ?? j.source}</span>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-pill bg-primary px-3 py-1.5 text-[12px] font-bold text-white">Megnézem ↗</span>
                    </div>
                  </a>
                ))}
                {/* Forrás-attribúció (API-feltétel, pl. Adzuna): kattintható
                    forrás-linkek a lista alatt — a kártya-link maga a forrásra
                    mutat, ez a sor a formális „powered by" követelményt fedi. */}
                <p className="px-1 text-[10.5px] leading-snug text-ink-faint">
                  Az élő hirdetések forrása:{" "}
                  <a href="https://www.adzuna.at/" target="_blank" rel="noopener noreferrer" className="underline">Adzuna</a>,{" "}
                  <a href="https://jooble.org/" target="_blank" rel="noopener noreferrer" className="underline">Jooble</a>,{" "}
                  <a href="https://www.arbeitnow.com/" target="_blank" rel="noopener noreferrer" className="underline">Arbeitnow</a>{" "}
                  és a hivatalos{" "}
                  <a href="https://www.job-room.ch/" target="_blank" rel="noopener noreferrer" className="underline">job-room.ch</a>{" "}
                  (SECO). A találat a forrás oldalán nyílik meg — tartalmáért a forrás, illetve az eredeti hirdető felel.
                </p>
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
}
