"use client";

import { useState } from "react";
import { getJobSources } from "@/lib/job-sources";

/**
 * RecruiterSearch — admin/közvetítő kereső. A jelölt szakmája/kulcsszava +
 * ország alapján ELŐRE KITÖLTÖTT, egy-kattintásos kereséseket generál a fő
 * portálokra (Indeed/LinkedIn/Google — ezek megbízhatóan támogatják a kulcsszó-
 * paramétert), plusz az ország hivatalos/fő portáljait (kézi keresés).
 *
 * NEM scrape — csak deep-linkel (jogtiszta). A recruiter rákattint, élőben látja
 * a találatokat, és onnan keresi meg a hirdetőt a jelölttel.
 */
const PLACEMENT_COUNTRIES = [
  { code: "AT", label: "🇦🇹 Ausztria", cc: "at", name: "Austria" },
  { code: "DE", label: "🇩🇪 Németország", cc: "de", name: "Germany" },
  { code: "NL", label: "🇳🇱 Hollandia", cc: "nl", name: "Netherlands" },
];

export function RecruiterSearch() {
  const [country, setCountry] = useState("AT");
  const [keyword, setKeyword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const ctry = PLACEMENT_COUNTRIES.find((c) => c.code === country)!;
  const q = keyword.trim();
  const enc = encodeURIComponent(q);

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
                onClick={() => setCountry(c.code)}
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
            onChange={(e) => { setKeyword(e.target.value); setSubmitted(false); }}
            onKeyDown={(e) => { if (e.key === "Enter") setSubmitted(true); }}
            placeholder="Pl. Maler, Krankenpfleger, Koch, Lagerist…"
            className="w-full rounded-[12px] border border-line bg-surface-alt px-3.5 py-3 text-[14px] text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="text-[11px] text-ink-faint">A portálok nyelvén add meg (németül AT/DE, hollandul/angolul NL) a legjobb találatokért.</p>
        </div>

        <button
          type="button"
          onClick={() => setSubmitted(true)}
          disabled={!q}
          className="h-11 w-full rounded-pill bg-primary text-[14px] font-extrabold text-white shadow-card-hover transition active:scale-[0.98] disabled:opacity-60"
        >
          Keresések generálása
        </button>
      </div>

      {submitted && q && (
        <>
          <section className="space-y-2">
            <h3 className="px-1 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">⚡ Előre kitöltött keresés — „{q}" · {ctry.label}</h3>
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
        </>
      )}
    </div>
  );
}
