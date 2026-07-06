import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin";
import { pickBestEmail, companyDomainCandidates, findImpressumLink } from "@/lib/email-extract";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/recruiter/extract-emails — ADMIN-only. A közvetítői eszköz szűk
 * keresztmetszetének feloldása: a hirdetőt eddig KÉZZEL, egyesével kellett
 * kikeresni. Ez az endpoint kétlépcsős automatikával próbál e-mailt találni:
 *
 *   1) A hirdetés-oldalról közvetlenül (mailto/szöveg) — ha ott van.
 *   2) HA nincs: a cégnévből domain-tippeket generál, letölti a cég főoldalát,
 *      onnan az Impressum/Kontakt linket, és abból az e-mailt (a §5 TMG szerint
 *      a német cégeknek KÖTELEZŐ e-mailt kiírni az Impressumban → magas találat).
 *
 * Body: { jobs: [{ url, company?, country? }] } → { results: [{ url, email|null }] }.
 * Csak nyilvánosan közzétett kapcsolat-címet olvasunk (B2B, jogtiszta).
 */

const MAX_JOBS = 20;
const PER_FETCH_TIMEOUT_MS = 6000;
const MAX_BYTES = 400_000;
const CHROME_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

interface JobIn { url: string; company?: string | null; country?: string | null }

/** Egy oldal HTML-je (időkorlát + méret-plafon), vagy null. */
async function fetchHtml(url: string): Promise<string | null> {
  if (!/^https?:\/\//i.test(url)) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), PER_FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: {
        "user-agent": CHROME_UA,
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "de,en;q=0.8,hu;q=0.6,nl;q=0.5",
      },
      cf: { cacheTtl: 300, cacheEverything: true },
    } as RequestInit);
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") ?? "";
    if (ct && !ct.includes("html") && !ct.includes("text") && !ct.includes("xml")) return null;
    const reader = res.body?.getReader();
    if (!reader) return (await res.text()).slice(0, MAX_BYTES);
    const decoder = new TextDecoder();
    let html = ""; let bytes = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      html += decoder.decode(value, { stream: true });
      if (bytes >= MAX_BYTES) { try { await reader.cancel(); } catch { /* ignore */ } break; }
    }
    return html;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** 2. lépcső: cégnév → domain-tippek → főoldal → Impressum → e-mail. */
async function fromCompanyImpressum(company: string, country: string | null | undefined, budget: { n: number }): Promise<string | null> {
  const domains = companyDomainCandidates(company, country).slice(0, 2);
  for (const domain of domains) {
    if (budget.n <= 0) return null;
    // Főoldal (www-vel) — sok kis cég a láblécben is kiírja az e-mailt.
    budget.n--;
    const home = await fetchHtml(`https://www.${domain}/`) ?? (budget.n-- > 0 ? await fetchHtml(`https://${domain}/`) : null);
    if (!home) continue;
    const direct = pickBestEmail(home, company);
    if (direct) return direct;
    // Impressum/Kontakt link a főoldalról → onnan az e-mail.
    const imp = findImpressumLink(home, `https://www.${domain}/`);
    if (imp && budget.n > 0) {
      budget.n--;
      const impHtml = await fetchHtml(imp);
      if (impHtml) {
        const email = pickBestEmail(impHtml, company);
        if (email) return email;
      }
    }
  }
  return null;
}

async function resolveEmail(job: JobIn, budget: { n: number }): Promise<string | null> {
  // 1) A hirdetés-oldalról közvetlenül.
  if (budget.n > 0 && /^https?:\/\//i.test(job.url)) {
    budget.n--;
    const html = await fetchHtml(job.url);
    if (html) {
      const email = pickBestEmail(html, job.company ?? null);
      if (email) return email;
    }
  }
  // 2) A cég Impressumából.
  if (job.company && budget.n > 0) {
    return await fromCompanyImpressum(job.company, job.country, budget);
  }
  return null;
}

export async function POST(req: Request) {
  if (!(await getAdminUserId())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  try {
    const body = (await req.json().catch(() => ({}))) as { jobs?: JobIn[] };
    const jobs = Array.isArray(body.jobs) ? body.jobs.filter((j) => j && typeof j.url === "string").slice(0, MAX_JOBS) : [];
    if (jobs.length === 0) return NextResponse.json({ results: [] });

    // Globális letöltés-keret. FONTOS: a Cloudflare subrequest-limit (ingyenes
    // csomagon 50/kérés) alatt kell maradni (+ a Clerk-auth is fogyaszt párat) —
    // ezért fix ~44-es plafon. A korai kilépés (találatnál azonnal visszatér)
    // miatt így is a legtöbb hirdetés feldolgozódik; ha kifogy, a maradék null.
    const budget = { n: 44 };
    const settled = await Promise.allSettled(jobs.map((j) => resolveEmail(j, budget)));
    const results = jobs.map((j, i) => ({
      url: j.url,
      email: settled[i].status === "fulfilled" ? settled[i].value : null,
    }));

    const found = results.filter((r) => r.email).length;
    return NextResponse.json({ results, found, total: jobs.length }, { headers: { "cache-control": "no-store" } });
  } catch (err) {
    safeLogError("admin/recruiter/extract-emails", err);
    return NextResponse.json({ error: "A címek kinyerése nem sikerült." }, { status: 500 });
  }
}
