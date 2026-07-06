import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin";
import { pickBestEmail } from "@/lib/email-extract";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/recruiter/extract-emails — ADMIN-only. A közvetítői eszköz
 * szűk keresztmetszetének feloldása: a találati hirdetések oldalait letölti, és
 * mindegyikből kiszedi a legjobb kapcsolattartó e-mailt (lib/email-extract), hogy
 * ne KÉZZEL, egyesével kelljen keresgélni.
 *
 * Body: { jobs: [{ url, company? }] }  → { results: [{ url, email|null }] }.
 *
 * Csak nyilvánosan közzétett álláshirdetés-oldalak kapcsolat-címét olvassuk (a
 * hirdető maga tette közzé a nyitott pozícióhoz) — B2B, jogtiszta. Nem tárolunk
 * idegen hirdetést; csak a kinyert e-mailt adjuk vissza a kliensnek.
 */

const MAX_JOBS = 30;
const PER_FETCH_TIMEOUT_MS = 7000;
const MAX_BYTES = 400_000; // ~400 KB / oldal — ennél tovább nem olvasunk (CPU-védelem 30 párhuzamosnál)

interface JobIn {
  url: string;
  company?: string | null;
}

/** Egy oldal letöltése (időkorláttal, méret-plafonnal), majd a legjobb e-mail. */
async function fetchAndExtract(job: JobIn): Promise<string | null> {
  if (!/^https?:\/\//i.test(job.url)) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), PER_FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(job.url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: {
        // Böngésző-szerű UA + nyelv: sok portál különben blokkol/üres oldalt ad.
        "user-agent": "Mozilla/5.0 (compatible; kinti-recruiter/1.0; +https://kinti.app)",
        accept: "text/html,application/xhtml+xml",
        "accept-language": "de,en;q=0.8,hu;q=0.6,nl;q=0.5",
      },
      cf: { cacheTtl: 300, cacheEverything: true },
    } as RequestInit);
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("html") && !ct.includes("text")) return null;

    // Méret-plafonnal olvasunk (az e-mail általában az impresszumban/láblécben van,
    // de a teljes oldalt átvizsgáljuk MAX_BYTES-ig).
    const reader = res.body?.getReader();
    if (!reader) {
      const txt = await res.text();
      return pickBestEmail(txt.slice(0, MAX_BYTES), job.company ?? null);
    }
    const decoder = new TextDecoder();
    let html = "";
    let bytes = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      html += decoder.decode(value, { stream: true });
      if (bytes >= MAX_BYTES) { try { await reader.cancel(); } catch { /* ignore */ } break; }
    }
    return pickBestEmail(html, job.company ?? null);
  } catch {
    return null; // timeout / hálózati hiba / blokk → nincs cím
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(req: Request) {
  if (!(await getAdminUserId())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  try {
    const body = (await req.json().catch(() => ({}))) as { jobs?: JobIn[] };
    const jobs = Array.isArray(body.jobs) ? body.jobs.filter((j) => j && typeof j.url === "string").slice(0, MAX_JOBS) : [];
    if (jobs.length === 0) return NextResponse.json({ results: [] });

    const settled = await Promise.allSettled(jobs.map((j) => fetchAndExtract(j)));
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
