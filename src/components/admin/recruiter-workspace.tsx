"use client";

import { useEffect, useRef, useState } from "react";
import { getJobSources } from "@/lib/job-sources";
import { cn } from "@/lib/cn";
import type { AdzunaJob } from "@/lib/adzuna";
import type { RecruitingCandidate, RecruitingStatus } from "@/lib/repo-recruiting";

/**
 * RecruiterWorkspace — a Feedback Jobs közvetítői munkaeszköz (admin-only):
 *  1) Jelölt-pipeline: felviszed a jelöltet (CV-vel), követed a státuszt
 *     (új → megkeresve → elhelyezve → kifizetve).
 *  2) Kereső: a jelölt szakmájára VALÓDI hirdetéseket listáz (Adzuna), plusz
 *     előre kitöltött portál-keresések. A „Keres" gomb a jelöltből tölti.
 */
const COUNTRIES = [
  { code: "AT", label: "🇦🇹 Ausztria", cc: "at", name: "Austria" },
  { code: "DE", label: "🇩🇪 Németország", cc: "de", name: "Germany" },
  { code: "NL", label: "🇳🇱 Hollandia", cc: "nl", name: "Netherlands" },
];

const STATUS: { id: RecruitingStatus; label: string }[] = [
  { id: "new", label: "Új" },
  { id: "contacted", label: "Megkeresve" },
  { id: "placed", label: "Elhelyezve" },
  { id: "paid", label: "Kifizetve 💰" },
  { id: "dropped", label: "Elejtve" },
];

type Phase = "idle" | "loading" | "done" | "error";

export function RecruiterWorkspace() {
  const [candidates, setCandidates] = useState<RecruitingCandidate[]>([]);
  const [addName, setAddName] = useState("");
  const [addCountry, setAddCountry] = useState("AT");
  const [addKeyword, setAddKeyword] = useState("");
  const [adding, setAdding] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);

  const [country, setCountry] = useState("AT");
  const [keyword, setKeyword] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [jobs, setJobs] = useState<AdzunaJob[]>([]);
  const [configured, setConfigured] = useState(true);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadCandidates(); }, []);

  async function loadCandidates() {
    try {
      const res = await fetch("/api/admin/recruiter");
      const data = (await res.json().catch(() => ({}))) as { candidates?: RecruitingCandidate[] };
      setCandidates(data.candidates ?? []);
    } catch { /* ignore */ }
  }

  async function uploadCv(file: File): Promise<string | null> {
    const pres = await fetch("/api/admin/recruiter/cv-upload", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ contentLength: file.size }),
    });
    const p = (await pres.json().catch(() => ({}))) as { uploadUrl?: string; key?: string };
    if (!pres.ok || !p.uploadUrl || !p.key) return null;
    const put = await fetch(p.uploadUrl, { method: "PUT", headers: { "content-type": "application/pdf" }, body: file });
    return put.ok ? p.key : null;
  }

  async function addCandidate() {
    if (addName.trim().length < 2) return;
    setAdding(true);
    try {
      let cvKey: string | null = null;
      if (cvFile) cvKey = await uploadCv(cvFile);
      await fetch("/api/admin/recruiter", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ fullName: addName.trim(), country: addCountry, keyword: addKeyword.trim() || null, cvKey }),
      });
      setAddName(""); setAddKeyword(""); setCvFile(null);
      if (fileRef.current) fileRef.current.value = "";
      await loadCandidates();
    } finally {
      setAdding(false);
    }
  }

  async function setStatus(id: string, status: RecruitingStatus) {
    setCandidates((cs) => cs.map((c) => (c.id === id ? { ...c, status } : c)));
    await fetch("/api/admin/recruiter", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, status }) });
  }

  async function removeCandidate(id: string) {
    if (!confirm("Biztosan törlöd ezt a jelöltet?")) return;
    setCandidates((cs) => cs.filter((c) => c.id !== id));
    await fetch(`/api/admin/recruiter?id=${encodeURIComponent(id)}`, { method: "DELETE" });
  }

  function searchFor(c: string, kw: string | null) {
    setCountry(c);
    setKeyword(kw ?? "");
    if (kw) void runSearch(c, kw);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  async function runSearch(c: string, kw: string) {
    if (!kw.trim()) return;
    setPhase("loading");
    try {
      const res = await fetch(`/api/admin/recruiter/jobs?country=${c}&q=${encodeURIComponent(kw.trim())}`);
      const data = (await res.json().catch(() => ({}))) as { jobs?: AdzunaJob[]; configured?: boolean };
      setJobs(data.jobs ?? []);
      setConfigured(data.configured !== false);
      setPhase("done");
    } catch { setPhase("error"); }
  }

  const ctry = COUNTRIES.find((c) => c.code === country)!;
  const q = keyword.trim();
  const enc = encodeURIComponent(q);
  const prefilled = q ? [
    { name: "Indeed", url: `https://${ctry.cc}.indeed.com/jobs?q=${enc}` },
    { name: "LinkedIn Jobs", url: `https://www.linkedin.com/jobs/search/?keywords=${enc}&location=${encodeURIComponent(ctry.name)}` },
    { name: "Google Jobs", url: `https://www.google.com/search?q=${enc}+jobs+${encodeURIComponent(ctry.name)}&ibp=htl;jobs` },
    ...(country === "AT" ? [{ name: "karriere.at", url: `https://www.karriere.at/jobs?keywords=${enc}` }, { name: "hokify", url: `https://hokify.at/jobsuche?text=${enc}` }] : []),
  ] : [];
  const portals = getJobSources(country)?.sources ?? [];

  const inputCls = "w-full rounded-[12px] border border-line bg-surface-alt px-3.5 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="space-y-5">
      {/* ── 1. Jelölt-pipeline ─────────────────────────── */}
      <section className="space-y-3 rounded-card border border-line bg-surface p-4 shadow-card">
        <h2 className="text-[14px] font-extrabold text-ink">Jelölt felvitele</h2>
        <input value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="Jelölt neve" className={inputCls} />
        <div className="flex flex-wrap gap-1.5">
          {COUNTRIES.map((c) => (
            <button key={c.code} type="button" onClick={() => setAddCountry(c.code)} className={cn("rounded-pill px-3 py-1.5 text-[12px] font-bold transition", addCountry === c.code ? "bg-primary text-white shadow-card" : "border border-line bg-surface-alt text-ink")}>{c.label}</button>
          ))}
        </div>
        <input value={addKeyword} onChange={(e) => setAddKeyword(e.target.value)} placeholder="Szakma / kulcsszó (pl. Maler)" className={inputCls} />
        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" accept="application/pdf" onChange={(e) => setCvFile(e.target.files?.[0] ?? null)} className="hidden" />
          <button type="button" onClick={() => fileRef.current?.click()} className="rounded-pill border border-line bg-surface-alt px-3 py-2 text-[12px] font-bold text-ink">📎 {cvFile ? cvFile.name.slice(0, 20) : "CV (PDF)"}</button>
          <button type="button" onClick={addCandidate} disabled={adding || addName.trim().length < 2} className="ml-auto rounded-pill bg-primary px-4 py-2 text-[13px] font-extrabold text-white shadow-card disabled:opacity-60">{adding ? "Mentés…" : "Hozzáadás"}</button>
        </div>
      </section>

      {candidates.length > 0 && (
        <section className="space-y-2">
          <h3 className="px-1 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">Jelöltek ({candidates.length})</h3>
          {candidates.map((c) => (
            <div key={c.id} className="rounded-card border border-line bg-surface p-3.5 shadow-card">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[14px] font-extrabold text-ink">{c.fullName}</p>
                  <p className="text-[11.5px] text-ink-muted">{COUNTRIES.find((x) => x.code === c.country)?.label ?? c.country}{c.keyword ? ` · ${c.keyword}` : ""}</p>
                </div>
                <button type="button" onClick={() => removeCandidate(c.id)} aria-label="Törlés" className="shrink-0 text-ink-faint hover:text-accent">✕</button>
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <select value={c.status} onChange={(e) => setStatus(c.id, e.target.value as RecruitingStatus)} className="rounded-pill border border-line bg-surface-alt px-2.5 py-1 text-[12px] font-bold text-ink">
                  {STATUS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <button type="button" onClick={() => searchFor(c.country, c.keyword)} disabled={!c.keyword} className="rounded-pill bg-primary px-3 py-1 text-[12px] font-bold text-white shadow-card disabled:opacity-50">🔎 Keres</button>
                {c.cvKey && <a href={`/api/admin/recruiter/cv/${c.id}`} target="_blank" rel="noopener noreferrer" className="rounded-pill border border-line bg-surface-alt px-3 py-1 text-[12px] font-bold text-primary">CV ↗</a>}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ── 2. Kereső + valódi hirdetések ──────────────── */}
      <div ref={resultsRef} className="space-y-3 rounded-card border border-line bg-surface p-4 shadow-card">
        <h2 className="text-[14px] font-extrabold text-ink">Hirdetés-keresés</h2>
        <div className="flex flex-wrap gap-1.5">
          {COUNTRIES.map((c) => (
            <button key={c.code} type="button" onClick={() => { setCountry(c.code); setPhase("idle"); }} className={cn("rounded-pill px-3 py-1.5 text-[12px] font-bold transition", country === c.code ? "bg-primary text-white shadow-card" : "border border-line bg-surface-alt text-ink")}>{c.label}</button>
          ))}
        </div>
        <input value={keyword} onChange={(e) => { setKeyword(e.target.value); setPhase("idle"); }} onKeyDown={(e) => { if (e.key === "Enter") runSearch(country, keyword); }} placeholder="Szakma / kulcsszó (a portál nyelvén)" className={inputCls} />
        <button type="button" onClick={() => runSearch(country, keyword)} disabled={!q || phase === "loading"} className="h-11 w-full rounded-pill bg-primary text-[14px] font-extrabold text-white shadow-card-hover disabled:opacity-60">{phase === "loading" ? "Keresés…" : "Hirdetések keresése"}</button>
      </div>

      {phase === "error" && <p className="rounded-[10px] bg-accent/10 px-3 py-2.5 text-[12.5px] font-semibold text-accent">Hiba a keresés során.</p>}

      {phase === "done" && (
        <section className="space-y-2">
          <h3 className="px-1 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">💼 Konkrét hirdetések — „{q}" · {ctry.label} ({jobs.length})</h3>
          {jobs.length === 0 ? (
            <p className="rounded-card border border-dashed border-line bg-surface px-4 py-6 text-center text-[12.5px] text-ink-muted">Nincs találat ebből a forrásból. Próbálj más/tágabb kifejezést, vagy a kézi kereséseket lent.</p>
          ) : jobs.map((j, i) => (
            <a key={i} href={j.url} target="_blank" rel="noopener noreferrer" className="block rounded-card border border-line bg-surface p-3.5 shadow-card transition hover:border-primary/30">
              <div className="flex items-start justify-between gap-2"><p className="text-[13.5px] font-extrabold text-ink">{j.title}</p><span className="shrink-0 text-primary">↗</span></div>
              <p className="mt-0.5 text-[12px] text-ink-muted">{[j.company, j.location].filter(Boolean).join(" · ") || "—"}{(j.salaryMin || j.salaryMax) && <span className="text-ink-faint"> · {j.salaryMin?.toLocaleString("de-AT") ?? "?"}–{j.salaryMax?.toLocaleString("de-AT") ?? "?"}</span>}</p>
            </a>
          ))}
          {configured ? (
            <p className="px-1 text-[10.5px] text-ink-faint">Forrás: Adzuna (jogtiszta aggregátor). A jelentkezés/feltételek az adott hirdetésnél.</p>
          ) : (
            <p className="rounded-[10px] border border-star/30 bg-star/5 px-3 py-2 text-[11px] leading-snug text-ink-muted">
              Forrás: Arbeitnow (ingyenes, DE/EU-fókusz). A <strong>teljes AT/DE/NL lefedéshez + fizetés-adatért</strong> add meg az ingyenes Adzuna-kulcsot (<code className="rounded bg-surface-alt px-1">ADZUNA_APP_ID</code> + <code className="rounded bg-surface-alt px-1">ADZUNA_APP_KEY</code>).
            </p>
          )}
        </section>
      )}

      {phase === "done" && prefilled.length > 0 && (
        <section className="space-y-2">
          <h3 className="px-1 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">⚡ Előre kitöltött keresés a portálokon</h3>
          <div className="flex flex-wrap gap-2">
            {prefilled.map((l) => <a key={l.name} href={l.url} target="_blank" rel="noopener noreferrer" className="rounded-pill border border-primary/25 bg-primary-soft/40 px-3 py-1.5 text-[12px] font-bold text-ink">{l.name} ↗</a>)}
          </div>
        </section>
      )}

      {phase === "done" && portals.length > 0 && (
        <section className="space-y-2">
          <h3 className="px-1 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">📋 Hivatalos / fő portálok</h3>
          <div className="flex flex-wrap gap-2">
            {portals.map((s) => <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="rounded-pill border border-line bg-surface-alt px-3 py-1.5 text-[12px] font-bold text-ink">{s.name} ↗</a>)}
          </div>
        </section>
      )}
    </div>
  );
}
