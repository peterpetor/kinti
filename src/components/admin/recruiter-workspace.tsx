"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { getJobRegions } from "@/lib/job-regions";
import type { AdzunaJob } from "@/lib/adzuna";
import type { RecruitingCandidate, RecruitingStatus, ShortlistJob, ShortlistStatus } from "@/lib/repo-recruiting";

/**
 * RecruiterWorkspace — Feedback Jobs közvetítői eszköz (admin-only):
 *  1) Jelölt-pipeline: felviszed (CV-vel), státusz (új→megkeresve→elhelyezve→kifizetve).
 *  2) AI: a CV-ből kiszedi a kulcsszót/skilleket (🪄), és minden hirdetéshez ad
 *     illeszkedés-pontot + kész megkereső e-mailt a hirdetőnek (✉️).
 *  3) Kereső: valódi hirdetések (Adzuna+Jooble / Arbeitnow) + portál-linkek.
 */
const COUNTRIES = [
  { code: "AT", label: "🇦🇹 Ausztria" },
  { code: "DE", label: "🇩🇪 Németország" },
  { code: "NL", label: "🇳🇱 Hollandia" },
];
const STATUS: { id: RecruitingStatus; label: string }[] = [
  { id: "new", label: "Új" },
  { id: "contacted", label: "Megkeresve" },
  { id: "placed", label: "Elhelyezve" },
  { id: "paid", label: "Kifizetve 💰" },
  { id: "dropped", label: "Elejtve" },
];
type Phase = "idle" | "loading" | "done" | "error";
interface Brief { keyword: string; skills: string[]; languages: string[]; summary: string }
interface Match { score: number | null; reason: string; email: string }

/** Körlevél alap-sablon a célország nyelvén ({{pozicio}}, {{ceg}} helyettesítőkkel). */
function defaultTemplate(country: string): { subject: string; body: string } {
  if (country === "NL") {
    return {
      subject: "Geschikte kandidaat voor uw vacature – {{pozicio}}",
      body: `Geachte heer/mevrouw,

wij zijn Feedback Jobs, een wervingsbureau. Voor uw vacature „{{pozicio}}" bij {{ceg}} hebben wij momenteel een geschikte, ervaren kandidaat.

Graag sturen wij u het volledige profiel/cv toe. Onze bemiddeling werkt op no-cure-no-pay basis – een vergoeding is alleen verschuldigd bij een succesvolle plaatsing en wordt door de werkgever betaald.

Bij interesse kunt u eenvoudig op deze e-mail reageren.

Met vriendelijke groet,
[Uw naam] – Feedback Jobs`,
    };
  }
  return {
    subject: "Qualifizierter Kandidat für Ihre offene Stelle – {{pozicio}}",
    body: `Sehr geehrte Damen und Herren,

wir sind Feedback Jobs, eine Personalvermittlung. Für Ihre ausgeschriebene Position „{{pozicio}}" bei {{ceg}} haben wir aktuell einen passenden, erfahrenen Kandidaten.

Gerne senden wir Ihnen das vollständige Profil bzw. den Lebenslauf zu. Unsere Vermittlung erfolgt rein erfolgsbasiert – eine Provision fällt ausschließlich bei einer erfolgreichen Einstellung an und wird vom Arbeitgeber getragen.

Bei Interesse antworten Sie einfach auf diese E-Mail.

Mit freundlichen Grüßen,
[Ihr Name] – Feedback Jobs`,
  };
}

/**
 * Determinisztikus elő-pontozás (LLM NÉLKÜL, #4): kulcsszó-átfedés a jelölt-profil
 * és a hirdetés címe közt → durva relevancia 0-100. Csak rangsorolásra/böngészésre;
 * a pontos % + e-mail az AI-match (✉️), ami csak kattintásra fut → nem ég token.
 */
function prescore(profile: string, job: string): number {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-zà-ÿ0-9\s]/gi, " ").split(/\s+/).filter((w) => w.length > 2);
  const pset = new Set(norm(profile));
  const jt = norm(job);
  if (!pset.size || !jt.length) return 0;
  const hits = jt.filter((w) => pset.has(w)).length;
  return Math.min(100, Math.round((hits / jt.length) * 140));
}

export function RecruiterWorkspace() {
  const [candidates, setCandidates] = useState<RecruitingCandidate[]>([]);
  const [addName, setAddName] = useState("");
  const [addCountry, setAddCountry] = useState("AT");
  const [addKeyword, setAddKeyword] = useState("");
  const [adding, setAdding] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);

  const [active, setActive] = useState<RecruitingCandidate | null>(null);
  const [briefs, setBriefs] = useState<Record<string, Brief>>({});
  const [parsing, setParsing] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, Match>>({});
  const [matching, setMatching] = useState<string | null>(null);
  const [openEmail, setOpenEmail] = useState<string | null>(null);

  const [country, setCountry] = useState("AT");
  const [region, setRegion] = useState("");
  const [keyword, setKeyword] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [jobs, setJobs] = useState<AdzunaJob[]>([]);
  const [source, setSource] = useState<string>("");
  const resultsRef = useRef<HTMLDivElement>(null);

  const [shortlist, setShortlist] = useState<ShortlistJob[]>([]);
  const [stats, setStats] = useState<{ total: number; placed: number; paid: number; revenueTotal: number; revenueMonth: number; conversionPct: number } | null>(null);
  const [fStatus, setFStatus] = useState<RecruitingStatus | "all">("all");
  const [fCountry, setFCountry] = useState<string>("all");
  const [fSearch, setFSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusCounts, setStatusCounts] = useState<Record<string, number> | null>(null);
  const [professions, setProfessions] = useState<{ keyword: string; count: number }[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const [outreachFor, setOutreachFor] = useState<string | null>(null);
  const [outreachSubject, setOutreachSubject] = useState("");
  const [outreachBody, setOutreachBody] = useState("");
  const [outreachReplyTo, setOutreachReplyTo] = useState("");
  const [sending, setSending] = useState(false);
  const [outreachResult, setOutreachResult] = useState<string | null>(null);

  // Szerveroldali keresés/szűrés/lapozás (több ezer jelöltnél is gyors). A szűrők/
  // oldalszám változására 200ms debounce-szal újratölt (a keresőnél is sima).
  useEffect(() => {
    const h = setTimeout(() => { void loadCandidates(); }, 200);
    return () => clearTimeout(h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fStatus, fCountry, fSearch, page]);

  async function loadCandidates() {
    setLoadingList(true);
    try {
      const params = new URLSearchParams();
      if (fSearch.trim()) params.set("q", fSearch.trim());
      if (fStatus !== "all") params.set("status", fStatus);
      if (fCountry !== "all") params.set("country", fCountry);
      params.set("page", String(page));
      const res = await fetch(`/api/admin/recruiter?${params.toString()}`);
      const data = (await res.json().catch(() => ({}))) as {
        candidates?: RecruitingCandidate[]; total?: number; stats?: typeof stats;
        statusCounts?: Record<string, number>; professions?: { keyword: string; count: number }[];
      };
      const list = data.candidates ?? [];
      setCandidates(list);
      setTotal(data.total ?? list.length);
      setStats(data.stats ?? null);
      setStatusCounts(data.statusCounts ?? null);
      setProfessions(data.professions ?? []);
      void loadShortlist(list.map((c) => c.id));
    } catch { /* ignore */ }
    finally { setLoadingList(false); }
  }
  async function loadShortlist(ids?: string[]) {
    const idList = ids ?? candidates.map((c) => c.id);
    if (!idList.length) { setShortlist([]); return; }
    try {
      const res = await fetch(`/api/admin/recruiter/shortlist?candidateIds=${encodeURIComponent(idList.join(","))}`);
      const data = (await res.json().catch(() => ({}))) as { shortlist?: ShortlistJob[] };
      setShortlist(data.shortlist ?? []);
    } catch { /* ignore */ }
  }
  async function saveToShortlist(job: AdzunaJob) {
    if (!active) return;
    const matchScore = matches[job.url]?.score ?? undefined;
    await fetch("/api/admin/recruiter/shortlist", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ candidateId: active.id, job: { title: job.title, company: job.company, location: job.location, url: job.url }, matchScore }) });
    await loadShortlist();
  }
  async function setShortStatus(id: string, status: ShortlistStatus) {
    setShortlist((s) => s.map((x) => (x.id === id ? { ...x, status } : x)));
    await fetch("/api/admin/recruiter/shortlist", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, status }) });
  }
  async function removeShort(id: string) {
    setShortlist((s) => s.filter((x) => x.id !== id));
    await fetch(`/api/admin/recruiter/shortlist?id=${encodeURIComponent(id)}`, { method: "DELETE" });
  }
  async function setShortEmail(id: string, email: string) {
    const v = email.trim();
    setShortlist((s) => s.map((x) => (x.id === id ? { ...x, employerEmail: v || null } : x)));
    await fetch("/api/admin/recruiter/shortlist", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, employerEmail: v || null }) });
  }
  function openOutreach(c: RecruitingCandidate) {
    const t = defaultTemplate(c.country);
    setOutreachSubject(t.subject); setOutreachBody(t.body); setOutreachResult(null); setOutreachFor(c.id);
    try { const v = localStorage.getItem("kinti.recruiter.replyTo"); if (v && !outreachReplyTo) setOutreachReplyTo(v); } catch { /* ignore */ }
  }
  async function sendOutreach(candidateId: string) {
    if (!outreachReplyTo.trim()) { alert("Adj meg egy válasz-címet (a TE e-mailed) — ide jönnek a hirdetők válaszai."); return; }
    setSending(true); setOutreachResult(null);
    try {
      try { localStorage.setItem("kinti.recruiter.replyTo", outreachReplyTo.trim()); } catch { /* ignore */ }
      const res = await fetch("/api/admin/recruiter/outreach", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ candidateId, subject: outreachSubject, body: outreachBody, replyTo: outreachReplyTo.trim() }) });
      const data = (await res.json().catch(() => ({}))) as { sent?: number; failed?: number; total?: number; skipped?: number; error?: string };
      if (!res.ok) { setOutreachResult(`❌ ${data.error || "Hiba a kiküldésnél."}`); return; }
      setOutreachResult(`✅ Kiküldve ${data.sent ?? 0} címre${data.failed ? `, ${data.failed} sikertelen` : ""}${data.skipped ? ` (${data.skipped} a napi keret felett maradt)` : ""}.`);
      await loadShortlist();
    } catch { setOutreachResult("❌ Hálózati hiba."); }
    finally { setSending(false); }
  }

  async function uploadCv(file: File): Promise<string | null> {
    const pres = await fetch("/api/admin/recruiter/cv-upload", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ contentLength: file.size }) });
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
      await fetch("/api/admin/recruiter", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ fullName: addName.trim(), country: addCountry, keyword: addKeyword.trim() || null, cvKey }) });
      setAddName(""); setAddKeyword(""); setCvFile(null);
      if (fileRef.current) fileRef.current.value = "";
      await loadCandidates();
    } finally { setAdding(false); }
  }

  async function setStatus(id: string, status: RecruitingStatus) {
    setCandidates((cs) => cs.map((c) => (c.id === id ? { ...c, status } : c)));
    await fetch("/api/admin/recruiter", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, status }) });
    await loadCandidates(); // friss stat
  }
  async function setFee(id: string, feeEur: number | null) {
    setCandidates((cs) => cs.map((c) => (c.id === id ? { ...c, feeEur } : c)));
    await fetch("/api/admin/recruiter", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, feeEur }) });
    await loadCandidates(); // friss stat
  }
  async function removeCandidate(id: string) {
    if (!confirm("Biztosan törlöd ezt a jelöltet?")) return;
    setCandidates((cs) => cs.filter((c) => c.id !== id));
    await fetch(`/api/admin/recruiter?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    await loadCandidates();
  }

  // 🪄 AI: a CV-ből kulcsszó + skillek + összegzés, majd keresés azzal.
  async function parseCv(c: RecruitingCandidate) {
    if (!c.cvKey) return;
    setParsing(c.id);
    try {
      const res = await fetch("/api/admin/recruiter/cv-parse", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ cvKey: c.cvKey, country: c.country }) });
      const data = (await res.json().catch(() => ({}))) as Brief & { error?: string };
      if (!res.ok) { alert(data.error || "A CV elemzése nem sikerült."); return; }
      setBriefs((b) => ({ ...b, [c.id]: { keyword: data.keyword ?? "", skills: data.skills ?? [], languages: data.languages ?? [], summary: data.summary ?? "" } }));
      const kw = data.keyword || c.keyword || "";
      if (data.keyword && data.keyword !== c.keyword) {
        setCandidates((cs) => cs.map((x) => (x.id === c.id ? { ...x, keyword: data.keyword! } : x)));
        void fetch("/api/admin/recruiter", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: c.id, keyword: data.keyword }) });
      }
      const updated = { ...c, keyword: kw };
      setActive(updated); setCountry(c.country); setRegion(""); setKeyword(kw);
      if (kw) void runSearch(c.country, kw, "");
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } finally { setParsing(null); }
  }

  // ✉️ Megkeresés: az AKTÍV jelölt + egy hirdetés → pont + e-mail.
  async function matchJob(job: AdzunaJob) {
    if (!active) return;
    setMatching(job.url);
    try {
      const b = briefs[active.id];
      const briefText = b ? `${b.keyword}. Skillek: ${b.skills.join(", ")}. Nyelvek: ${b.languages.join(", ")}. ${b.summary}` : "";
      const res = await fetch("/api/admin/recruiter/match", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ brief: briefText || undefined, cvKey: active.cvKey, country: active.country, job: { title: job.title, company: job.company, location: job.location } }) });
      const data = (await res.json().catch(() => ({}))) as Match & { error?: string };
      if (!res.ok) { alert(data.error || "A megkeresés generálása nem sikerült."); return; }
      setMatches((m) => ({ ...m, [job.url]: { score: data.score ?? null, reason: data.reason ?? "", email: data.email ?? "" } }));
      setOpenEmail(job.url);
    } finally { setMatching(null); }
  }

  function searchForCandidate(c: RecruitingCandidate) {
    setActive(c); setCountry(c.country); setRegion(""); setKeyword(c.keyword ?? "");
    if (c.keyword) void runSearch(c.country, c.keyword, "");
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }
  async function runSearch(c: string, kw: string, reg: string = region) {
    if (!kw.trim()) return;
    setPhase("loading"); setMatches({}); setOpenEmail(null);
    try {
      const regParam = reg.trim() ? `&region=${encodeURIComponent(reg.trim())}` : "";
      const res = await fetch(`/api/admin/recruiter/jobs?country=${c}&q=${encodeURIComponent(kw.trim())}${regParam}`);
      const data = (await res.json().catch(() => ({}))) as { jobs?: AdzunaJob[]; source?: string };
      setJobs(data.jobs ?? []); setSource(data.source ?? ""); setPhase("done");
    } catch { setPhase("error"); }
  }

  const ctry = COUNTRIES.find((c) => c.code === country)!;
  const q = keyword.trim();
  const enc = encodeURIComponent(q);
  const inputCls = "w-full rounded-[12px] border border-line bg-surface-alt px-3.5 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

  // Determinisztikus rangsor a találatokhoz (LLM nélkül): az aktív jelölt
  // profilja (AI-brief vagy kulcsszó) vs. a hirdetés címe.
  const activeBrief = active ? briefs[active.id] : undefined;
  const activeText = active ? (activeBrief ? `${activeBrief.keyword} ${activeBrief.skills.join(" ")}` : (active.keyword ?? "")) : "";
  const rankedJobs = activeText
    ? jobs.map((j) => ({ j, pre: prescore(activeText, `${j.title} ${j.company ?? ""}`) })).sort((a, b) => b.pre - a.pre)
    : jobs.map((j) => ({ j, pre: -1 }));

  const pageSize = 30;
  const statusTotal = statusCounts ? Object.values(statusCounts).reduce((a, b) => a + b, 0) : 0;
  const anyCandidates = statusTotal > 0 || candidates.length > 0;
  const filtersActive = fSearch.trim() !== "" || fStatus !== "all" || fCountry !== "all";
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-5">
      {/* ── Bevétel-dashboard ── */}
      {stats && stats.total > 0 && (
        <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-card border border-line bg-surface p-3 text-center shadow-card">
            <p className="text-[20px] font-extrabold text-ink">{stats.placed}</p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-ink-muted">Elhelyezve</p>
          </div>
          <div className="rounded-card border border-line bg-surface p-3 text-center shadow-card">
            <p className="text-[20px] font-extrabold text-ink">{stats.conversionPct}%</p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-ink-muted">Konverzió</p>
          </div>
          <div className="rounded-card border border-success/30 bg-success/5 p-3 text-center shadow-card">
            <p className="text-[20px] font-extrabold text-success">{stats.revenueTotal.toLocaleString("de-AT")} €</p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-ink-muted">Bevétel ({stats.paid} fő)</p>
          </div>
          <div className="rounded-card border border-line bg-surface p-3 text-center shadow-card">
            <p className="text-[20px] font-extrabold text-ink">{stats.revenueMonth.toLocaleString("de-AT")} €</p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-ink-muted">E hónapban</p>
          </div>
        </section>
      )}
      {/* ── Jelölt felvitele ── */}
      <section className="space-y-3 rounded-card border border-line bg-surface p-4 shadow-card">
        <h2 className="text-[14px] font-extrabold text-ink">Jelölt felvitele</h2>
        <input value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="Jelölt neve" className={inputCls} />
        <div className="flex flex-wrap gap-1.5">
          {COUNTRIES.map((c) => <button key={c.code} type="button" onClick={() => setAddCountry(c.code)} className={cn("rounded-pill px-3 py-1.5 text-[12px] font-bold transition", addCountry === c.code ? "bg-primary text-white shadow-card" : "border border-line bg-surface-alt text-ink")}>{c.label}</button>)}
        </div>
        <input value={addKeyword} onChange={(e) => setAddKeyword(e.target.value)} placeholder="Szakma / kulcsszó (vagy hagyd üresen → AI a CV-ből)" className={inputCls} />
        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" accept="application/pdf" onChange={(e) => setCvFile(e.target.files?.[0] ?? null)} className="hidden" />
          <button type="button" onClick={() => fileRef.current?.click()} className="rounded-pill border border-line bg-surface-alt px-3 py-2 text-[12px] font-bold text-ink">📎 {cvFile ? cvFile.name.slice(0, 20) : "CV (PDF)"}</button>
          <button type="button" onClick={addCandidate} disabled={adding || addName.trim().length < 2} className="ml-auto rounded-pill bg-primary px-4 py-2 text-[13px] font-extrabold text-white shadow-card disabled:opacity-60">{adding ? "Mentés…" : "Hozzáadás"}</button>
        </div>
      </section>

      {(anyCandidates || filtersActive) && (
        <section className="space-y-2">
          <div className="space-y-2 rounded-card border border-line bg-surface p-3 shadow-card">
            <input value={fSearch} onChange={(e) => { setFSearch(e.target.value); setPage(1); }} placeholder="🔎 Keresés névre / szakmára…" className="w-full rounded-[10px] border border-line bg-surface-alt px-3 py-2 text-[13px] text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none" />
            <div className="flex flex-wrap gap-1.5">
              <button type="button" onClick={() => { setFStatus("all"); setPage(1); }} className={cn("rounded-pill px-2.5 py-1 text-[11.5px] font-bold transition", fStatus === "all" ? "bg-primary text-white" : "border border-line bg-surface-alt text-ink-muted")}>Mind{statusCounts ? ` (${statusTotal})` : ""}</button>
              {STATUS.map((s) => <button key={s.id} type="button" onClick={() => { setFStatus(s.id); setPage(1); }} className={cn("rounded-pill px-2.5 py-1 text-[11.5px] font-bold transition", fStatus === s.id ? "bg-primary text-white" : "border border-line bg-surface-alt text-ink-muted")}>{s.label}{statusCounts ? ` (${statusCounts[s.id] ?? 0})` : ""}</button>)}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button type="button" onClick={() => { setFCountry("all"); setPage(1); }} className={cn("rounded-pill px-2.5 py-1 text-[11.5px] font-bold transition", fCountry === "all" ? "bg-ink text-white" : "border border-line bg-surface-alt text-ink-muted")}>🌍 Mind</button>
              {COUNTRIES.map((c) => <button key={c.code} type="button" onClick={() => { setFCountry(c.code); setPage(1); }} className={cn("rounded-pill px-2.5 py-1 text-[11.5px] font-bold transition", fCountry === c.code ? "bg-ink text-white" : "border border-line bg-surface-alt text-ink-muted")}>{c.label}</button>)}
            </div>
            {professions.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 border-t border-line pt-2">
                <span className="text-[10.5px] font-bold uppercase tracking-wide text-ink-faint">Szakmák:</span>
                {professions.map((p) => <button key={p.keyword} type="button" onClick={() => { setFSearch(fSearch === p.keyword ? "" : p.keyword); setPage(1); }} className={cn("rounded-pill px-2.5 py-1 text-[11px] font-bold transition", fSearch === p.keyword ? "bg-star/20 text-star" : "border border-line bg-surface-alt text-ink-muted")}>{p.keyword} ({p.count})</button>)}
              </div>
            )}
          </div>
          <h3 className="px-1 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">Jelöltek — {total} db{loadingList ? " · frissítés…" : ""}</h3>
          {candidates.length === 0 ? (
            <p className="rounded-card border border-dashed border-line bg-surface px-4 py-6 text-center text-[12.5px] text-ink-muted">Nincs a szűrőnek megfelelő jelölt.</p>
          ) : candidates.map((c) => {
            const b = briefs[c.id];
            return (
              <div key={c.id} className={cn("rounded-card border bg-surface p-3.5 shadow-card", active?.id === c.id ? "border-primary/40" : "border-line")}>
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
                  {c.cvKey && <button type="button" onClick={() => parseCv(c)} disabled={parsing === c.id} className="rounded-pill bg-star/15 px-3 py-1 text-[12px] font-bold text-star disabled:opacity-50">{parsing === c.id ? "Elemzés…" : "🪄 AI"}</button>}
                  <button type="button" onClick={() => searchForCandidate(c)} disabled={!c.keyword} className="rounded-pill bg-primary px-3 py-1 text-[12px] font-bold text-white shadow-card disabled:opacity-50">🔎 Keres</button>
                  {c.cvKey && <a href={`/api/admin/recruiter/cv/${c.id}`} target="_blank" rel="noopener noreferrer" className="rounded-pill border border-line bg-surface-alt px-3 py-1 text-[12px] font-bold text-primary">CV ↗</a>}
                </div>
                {(c.status === "placed" || c.status === "paid") && (
                  <div className="mt-2 flex items-center gap-2">
                    <label className="text-[11.5px] font-bold text-ink-muted">💰 Jutalék:</label>
                    <input type="number" min={0} defaultValue={c.feeEur ?? ""} onBlur={(e) => { const v = e.target.value.trim(); setFee(c.id, v ? Number(v) : null); }} placeholder="0" className="w-24 rounded-[10px] border border-line bg-surface-alt px-2.5 py-1 text-[13px] font-bold text-ink focus:border-primary focus:outline-none" />
                    <span className="text-[12px] font-bold text-ink-muted">€</span>
                  </div>
                )}
                {b && (
                  <div className="mt-2.5 rounded-[10px] border border-line bg-surface-alt/50 p-2.5 text-[11.5px] text-ink-muted">
                    {b.summary && <p className="text-ink">{b.summary}</p>}
                    {b.skills.length > 0 && <p className="mt-1"><strong>Skillek:</strong> {b.skills.join(", ")}</p>}
                    {b.languages.length > 0 && <p className="mt-0.5"><strong>Nyelvek:</strong> {b.languages.join(", ")}</p>}
                  </div>
                )}
                {(() => {
                  const sl = shortlist.filter((s) => s.candidateId === c.id);
                  if (sl.length === 0) return null;
                  const withEmail = sl.filter((s) => s.employerEmail).length;
                  return (
                    <div className="mt-2.5 space-y-1.5">
                      <p className="text-[10.5px] font-bold uppercase tracking-wide text-ink-faint">📋 Shortlist ({sl.length}){withEmail > 0 ? ` · ${withEmail} e-maillel` : ""}</p>
                      {sl.map((s) => (
                        <div key={s.id} className="rounded-[10px] border border-line bg-surface-alt/40 px-2.5 py-1.5">
                          <div className="flex items-center gap-2">
                            <a href={s.jobUrl} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 hover:underline">
                              <span className="block truncate text-[12px] font-bold text-ink">{s.jobTitle}</span>
                              <span className="block truncate text-[11px] text-ink-muted">{[s.jobCompany, s.jobLocation].filter(Boolean).join(" · ")}{s.matchScore != null ? ` · ${s.matchScore}%` : ""}</span>
                            </a>
                            <button type="button" onClick={() => setShortStatus(s.id, s.status === "contacted" ? "saved" : "contacted")} className={cn("shrink-0 rounded-pill px-2 py-0.5 text-[10.5px] font-bold", s.status === "contacted" ? "bg-success/15 text-success" : "border border-line text-ink-muted")}>{s.status === "contacted" ? "✓ Megkeresve" : "Megkeresve?"}</button>
                            <button type="button" onClick={() => removeShort(s.id)} aria-label="Törlés" className="shrink-0 text-ink-faint hover:text-accent">✕</button>
                          </div>
                          <input type="email" defaultValue={s.employerEmail ?? ""} onBlur={(e) => { if ((e.target.value.trim() || null) !== (s.employerEmail ?? null)) setShortEmail(s.id, e.target.value); }} placeholder="munkáltató e-mail (a hirdetésből / cég honlapjáról)" className="mt-1.5 w-full rounded-[8px] border border-line bg-surface px-2.5 py-1 text-[11.5px] text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none" />
                        </div>
                      ))}
                      {outreachFor === c.id ? (
                        <div className="mt-2 space-y-2 rounded-[10px] border border-primary/30 bg-primary-soft/40 p-2.5">
                          <p className="text-[11px] font-extrabold text-ink">📧 Körlevél — {withEmail} címre megy ki</p>
                          <input value={outreachReplyTo} onChange={(e) => setOutreachReplyTo(e.target.value)} placeholder="Válasz-cím (a TE e-mailed) — ide jönnek a válaszok" className="w-full rounded-[8px] border border-line bg-surface px-2.5 py-1.5 text-[12px] text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none" />
                          <input value={outreachSubject} onChange={(e) => setOutreachSubject(e.target.value)} placeholder="Tárgy" className="w-full rounded-[8px] border border-line bg-surface px-2.5 py-1.5 text-[12px] font-semibold text-ink focus:border-primary focus:outline-none" />
                          <textarea value={outreachBody} onChange={(e) => setOutreachBody(e.target.value)} rows={10} className="w-full rounded-[8px] border border-line bg-surface px-2.5 py-2 text-[12px] leading-relaxed text-ink focus:border-primary focus:outline-none" />
                          <p className="text-[10px] leading-snug text-ink-muted">Helyettesítők: <code>{"{{pozicio}}"}</code>, <code>{"{{ceg}}"}</code>, <code>{"{{helyszin}}"}</code> — címzettenként automatikusan kitöltődnek.</p>
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => sendOutreach(c.id)} disabled={sending || withEmail === 0} className="rounded-pill bg-primary px-3.5 py-1.5 text-[12px] font-extrabold text-white shadow-card disabled:opacity-50">{sending ? "Küldés…" : `Kiküldés (${withEmail})`}</button>
                            <button type="button" onClick={() => setOutreachFor(null)} className="text-[11.5px] font-bold text-ink-muted">Mégse</button>
                          </div>
                          {outreachResult && <p className="text-[11.5px] font-semibold text-ink">{outreachResult}</p>}
                          <p className="text-[10px] leading-snug text-ink-faint">⚖️ Üzleti (B2B) megkeresés a hirdetést feladó cégeknek, egyenként személyre szabva. Ne küldj tömeges, irreleváns levelet — csak releváns, nyitott pozícióra.</p>
                        </div>
                      ) : (
                        withEmail > 0 && <button type="button" onClick={() => openOutreach(c)} className="mt-1 rounded-pill bg-primary/10 px-3 py-1 text-[11.5px] font-bold text-primary">📧 Körlevél ({withEmail})</button>
                      )}
                    </div>
                  );
                })()}
              </div>
            );
          })}
          {total > pageSize && (
            <div className="flex items-center justify-center gap-3 pt-1">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-pill border border-line bg-surface px-3 py-1.5 text-[12px] font-bold text-ink disabled:opacity-40">‹ Előző</button>
              <span className="text-[12px] font-semibold text-ink-muted">{page}. / {totalPages}. oldal</span>
              <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-pill border border-line bg-surface px-3 py-1.5 text-[12px] font-bold text-ink disabled:opacity-40">Következő ›</button>
            </div>
          )}
        </section>
      )}

      {/* ── Kereső ── */}
      <div ref={resultsRef} className="space-y-3 rounded-card border border-line bg-surface p-4 shadow-card">
        <h2 className="text-[14px] font-extrabold text-ink">Hirdetés-keresés{active ? ` · ${active.fullName}` : ""}</h2>
        <div className="flex flex-wrap gap-1.5">
          {COUNTRIES.map((c) => <button key={c.code} type="button" onClick={() => { setCountry(c.code); setRegion(""); setPhase("idle"); }} className={cn("rounded-pill px-3 py-1.5 text-[12px] font-bold transition", country === c.code ? "bg-primary text-white shadow-card" : "border border-line bg-surface-alt text-ink")}>{c.label}</button>)}
        </div>
        <select value={region} onChange={(e) => { setRegion(e.target.value); setPhase("idle"); }} className={inputCls}>
          <option value="">📍 Egész ország ({ctry.label})</option>
          {getJobRegions(country).map((r) => <option key={r.code} value={r.code}>{r.label}</option>)}
        </select>
        <input value={keyword} onChange={(e) => { setKeyword(e.target.value); setPhase("idle"); }} onKeyDown={(e) => { if (e.key === "Enter") { setActive(null); runSearch(country, keyword); } }} placeholder="Szakma / kulcsszó (a portál nyelvén)" className={inputCls} />
        <button type="button" onClick={() => { setActive(null); runSearch(country, keyword); }} disabled={!q || phase === "loading"} className="h-11 w-full rounded-pill bg-primary text-[14px] font-extrabold text-white shadow-card-hover disabled:opacity-60">{phase === "loading" ? "Keresés…" : "Hirdetések keresése"}</button>
      </div>

      {phase === "error" && <p className="rounded-[10px] bg-accent/10 px-3 py-2.5 text-[12.5px] font-semibold text-accent">Hiba a keresés során.</p>}

      {phase === "done" && (
        <section className="space-y-2">
          <h3 className="px-1 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">💼 Konkrét hirdetések — „{q}" · {ctry.label}{region ? ` · ${region}` : ""} ({jobs.length})</h3>
          {jobs.length === 0 ? (
            <p className="rounded-card border border-dashed border-line bg-surface px-4 py-6 text-center text-[12.5px] text-ink-muted">Nincs találat. Próbálj más/tágabb kifejezést, vagy a kézi kereséseket lent.</p>
          ) : rankedJobs.map(({ j, pre }) => {
            const m = matches[j.url];
            return (
              <div key={j.url} className="rounded-card border border-line bg-surface p-3.5 shadow-card">
                <div className="flex items-start justify-between gap-2">
                  <a href={j.url} target="_blank" rel="noopener noreferrer" className="min-w-0 hover:underline">
                    <p className="text-[13.5px] font-extrabold text-ink">{j.title}</p>
                    <p className="mt-0.5 text-[12px] text-ink-muted">{[j.company, j.location].filter(Boolean).join(" · ") || "—"}{(j.salaryMin || j.salaryMax) && <span className="text-ink-faint"> · {j.salaryMin?.toLocaleString("de-AT") ?? "?"}–{j.salaryMax?.toLocaleString("de-AT") ?? "?"}</span>}</p>
                  </a>
                  {m?.score != null ? (
                    <span title="AI-becslés — csak rendezési segédlet, nem döntés" className={cn("shrink-0 rounded-pill px-2 py-0.5 text-[12px] font-extrabold", m.score >= 70 ? "bg-success/15 text-success" : m.score >= 40 ? "bg-star/15 text-star" : "bg-accent/10 text-accent")}>🤖 {m.score}%</span>
                  ) : pre >= 0 ? (
                    <span className="shrink-0 rounded-pill border border-line px-2 py-0.5 text-[11px] font-bold text-ink-faint" title="Durva relevancia (AI nélkül)">≈{pre}%</span>
                  ) : null}
                </div>
                {active && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <button type="button" onClick={() => matchJob(j)} disabled={matching === j.url} className="rounded-pill bg-primary/10 px-3 py-1 text-[11.5px] font-bold text-primary disabled:opacity-50">{matching === j.url ? "AI…" : m ? "↻ Újra" : "✉️ Megkeresés + pont"}</button>
                    {m && <button type="button" onClick={() => setOpenEmail(openEmail === j.url ? null : j.url)} className="text-[11.5px] font-bold text-primary hover:underline">{openEmail === j.url ? "Levél elrejt" : "Levél mutat"}</button>}
                    {shortlist.some((s) => s.candidateId === active.id && s.jobUrl === j.url) ? (
                      <span className="rounded-pill bg-success/15 px-3 py-1 text-[11.5px] font-bold text-success">✓ Shortlist</span>
                    ) : (
                      <button type="button" onClick={() => saveToShortlist(j)} className="rounded-pill border border-line bg-surface-alt px-3 py-1 text-[11.5px] font-bold text-ink">+ Mentés</button>
                    )}
                  </div>
                )}
                {m && openEmail === j.url && (
                  <div className="mt-2 space-y-1.5">
                    {m.reason && <p className="text-[11.5px] text-ink-muted">💡 {m.reason}</p>}
                    <textarea readOnly value={m.email} rows={8} className="w-full rounded-[10px] border border-line bg-surface-alt px-3 py-2 text-[12px] leading-relaxed text-ink" />
                    <button type="button" onClick={() => navigator.clipboard?.writeText(m.email)} className="rounded-pill bg-primary px-3 py-1 text-[11.5px] font-bold text-white shadow-card">📋 Másol</button>
                    {/* EU AI Act — emberi felügyelet: az AI-kimenet javaslat, a döntés emberi. */}
                    <p className="text-[10px] leading-snug text-ink-faint">
                      🤖 AI-javaslat (pont + indoklás + levél-piszkozat) — hibázhat. A jelöltről
                      és a küldésről MINDIG te döntesz; küldés előtt ellenőrizd és igazítsd.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
          {source && source !== "arbeitnow" && source !== "error" ? (
            <p className="px-1 text-[10.5px] text-ink-faint">Forrás: {source === "adzuna+jooble" ? "Adzuna + Jooble" : source === "adzuna" ? "Adzuna" : "Jooble"} (jogtiszta aggregátor).</p>
          ) : source === "arbeitnow" ? (
            <p className="rounded-[10px] border border-star/30 bg-star/5 px-3 py-2 text-[11px] leading-snug text-ink-muted">Forrás: Arbeitnow (ingyenes). Teljes AT/DE/NL lefedéshez Adzuna vagy Jooble kulcs.</p>
          ) : null}
        </section>
      )}
    </div>
  );
}
