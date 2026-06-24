"use client";

import { useState } from "react";
import { getJobSources } from "@/lib/job-sources";
import type { AdzunaJob } from "@/lib/adzuna";

/**
 * RecruiterSearch — admin/közvetítő kereső. A jelölt szakmája/kulcsszava +
 * ország alapján VALÓDI álláshirdetéseket listáz (Adzuna aggregátor-API,
 * jogtiszta), plusz előre kitöltött kereséseket a fő portálokra (kézi keresés).
 *
 * NEM scrape — az Adzuna API kifejezetten listázásra való; a portál-linkek
 * deep-linkek. Admin-only (Clerk).
 */
const PLACEMENT_COUNTRIES = [
  { code: "AT", label: "🇦🇹 Ausztria", cc: "at", name: "Austria" },
  { code: "DE", label: "🇩🇪 Németország", cc: "de", name: "Germany" },
  { code: "NL", label: "🇳🇱 Hollandia", cc: "nl", name: "Netherlands" },
];

type Phase = "idle" | "loading" | "done" | "error";

export function RecruiterSearch() {
  const [country, setCountry] = useState("AT");
  const [keyword, setKeyword] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [jobs, setJobs] = useState<AdzunaJob[]>([]);
  const [configured, setConfigured] = useState(true);

  const ctry = PLACEMENT_COUNTRIES.find((c) => c.code === country)!;
  const q = keyword.trim();
  const enc = encodeURIComponent(q);

  async function search() {
    if (!q) return;
    setPhase("loading");
    try {
      const res = await fetch(`/api/admin/recruiter/jobs?country=${country}&q=${enc}`);
      const data = (await res.json().catch(() => ({}))) as { jobs?: AdzunaJob[]; configured?: boolean };
      setJobs(data.jobs ?? []);
      setConfigured(data.configured !== false);
      setPhase("done");
    } catch {
      setPhase("error");
    }
  }

  const prefilled = q
    ? [
        { name: "Indeed", desc: "Aggregátor — sok hirdetés", url: `https://${ctry.cc}.indeed.com/jobs?q=${enc}` },
        { name: "LinkedIn Jobs", desc: "Nemzetközi szakmai állások", url: `https://www.linkedin.com/jobs/search/?keywords=${enc}&location=${encodeURIComponent(ctry.name)}` },
        { name: "Google Jobs", desc: "Google állás-keresés", url: `https://www.google.com/search?q=${enc}+jobs+${encodeURIComponent(ctry.name)}&ibp=htl;jobs` },
        ...(country === "AT"
          ? [
              { name: "karriere.at", desc: "Osztrák piaci portál", url: `https://www.karriere.at/jobs?keywords=${enc}` },
              { name: "hokify", desc: "Kékgalléros / szakmunkás", url: `https://hokify.at/jobsuche?text=${enc}` },
            ]
          : []),
      ]
    : [];
  const portals = getJobSources(country)?.sources ?? [];

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-card border border-line bg-surface p-4 shadow-card">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">Ország (EU — Svájc kimarad)</label>
          <div className="flex flex-wrap gap-1.5">
            {PLACEMENT_COUNTRIES.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => { setCountry(c.code); setPhase("idle"); }}
                className={
                  "rounded-pill px-3 py-1.5 text-[12.5px] font-bold transition " +
                  (country === c.code ? "bg-primary text-white shadow-card" : "border border-line bg-surface-alt text-ink hover:bg-surface")
                }
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">A jelölt szakmája / kulcsszó</label>
          <input
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPhase("idle"); }}
            onKeyDown={(e) => { if (e.key === "Enter") search(); }}
            placeholder="Pl. Maler, Krankenpfleger, Koch, Lagerist…"
            className="w-full rounded-[12px] border border-line bg-surface-alt px-3.5 py-3 text-[14px] text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="text-[11px] text-ink-faint">A portálok nyelvén add meg (németül AT/DE, hollandul/angolul NL) a legjobb találatokért.</p>
        </div>

        <button
          type="button"
          onClick={search}
          disabled={!q || phase === "loading"}
          className="h-11 w-full rounded-pill bg-primary text-[14px] font-extrabold text-white shadow-card-hover transition active:scale-[0.98] disabled:opacity-60"
        >
          {phase === "loading" ? "Keresés…" : "Hirdetések keresése"}
        </button>
      </div>

      {phase === "error" && (
        <p className="rounded-[10px] bg-accent/10 px-3 py-2.5 text-[12.5px] font-semibold text-accent">Hiba a keresés során. Próbáld újra.</p>
      )}

      {phase === "done" && !configured && (
        <div className="rounded-card border border-star/30 bg-star/5 px-4 py-3 text-[12px] leading-snug text-ink-muted">
          ⚙️ A <strong>valódi hirdetés-listázáshoz</strong> Adzuna API-kulcs kell (ingyenes: developer.adzuna.com → app_id + app_key). Állítsd be a <code className="rounded bg-surface-alt px-1">ADZUNA_APP_ID</code> és <code className="rounded bg-surface-alt px-1">ADZUNA_APP_KEY</code> env-változókat, és újra-deploy. Addig az alábbi <strong>kereső-linkek</strong> működnek.
        </div>
      )}

      {phase === "done" && configured && (
        <section className="space-y-2">
          <h3 className="px-1 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
            💼 Konkrét hirdetések — „{q}" · {ctry.label} ({jobs.length})
          </h3>
          {jobs.length === 0 ? (
            <p className="rounded-card border border-dashed border-line bg-surface px-4 py-6 text-center text-[12.5px] text-ink-muted">
              Nincs találat erre a kulcsszóra. Próbálj tágabb/más kifejezést (a portál nyelvén), vagy nézd a kézi kereséseket lent.
            </p>
          ) : (
            jobs.map((j, i) => (
              <a key={i} href={j.url} target="_blank" rel="noopener noreferrer" className="block rounded-card border border-line bg-surface p-3.5 shadow-card transition active:scale-[0.99] hover:border-primary/30">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[13.5px] font-extrabold text-ink">{j.title}</p>
                  <span className="shrink-0 text-primary">↗</span>
                </div>
                <p className="mt-0.5 text-[12px] text-ink-muted">
                  {[j.company, j.location].filter(Boolean).join(" · ") || "—"}
                  {(j.salaryMin || j.salaryMax) && (
                    <span className="text-ink-faint"> · {j.salaryMin ? j.salaryMin.toLocaleString("de-AT") : "?"}–{j.salaryMax ? j.salaryMax.toLocaleString("de-AT") : "?"}</span>
                  )}
                </p>
              </a>
            ))
          )}
          <p className="px-1 text-[10.5px] text-ink-faint">Forrás: Adzuna (jogtiszta aggregátor). A jelentkezés/feltételek az adott hirdetésnél.</p>
        </section>
      )}

      {phase === "done" && prefilled.length > 0 && (
        <section className="space-y-2">
          <h3 className="px-1 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">⚡ Előre kitöltött keresés a portálokon</h3>
          {prefilled.map((l) => (
            <a key={l.name} href={l.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-2 rounded-[12px] border border-primary/25 bg-primary-soft/40 px-3.5 py-2.5 transition active:scale-[0.99]">
              <div className="min-w-0">
                <p className="text-[13.5px] font-bold text-ink">{l.name}</p>
                <p className="text-[11.5px] text-ink-muted">{l.desc}</p>
              </div>
              <span className="shrink-0 text-primary">↗</span>
            </a>
          ))}
        </section>
      )}

      {phase === "done" && portals.length > 0 && (
        <section className="space-y-2">
          <h3 className="px-1 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">📋 Hivatalos / fő portálok (kézi keresés)</h3>
          {portals.map((s) => (
            <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-2 rounded-[12px] border border-line bg-surface-alt px-3.5 py-2.5 transition active:scale-[0.99]">
              <div className="min-w-0">
                <p className="text-[13.5px] font-bold text-ink">{s.name}{s.official ? " · hivatalos" : ""}</p>
                <p className="text-[11.5px] text-ink-muted">{s.note}</p>
              </div>
              <span className="shrink-0 text-ink-faint">↗</span>
            </a>
          ))}
        </section>
      )}
    </div>
  );
}
