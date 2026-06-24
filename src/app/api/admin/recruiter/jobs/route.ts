import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin";
import { searchAdzunaJobs } from "@/lib/adzuna";
import { searchJoobleJobs } from "@/lib/jooble";
import { searchArbeitnowJobs } from "@/lib/arbeitnow";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/recruiter/jobs?country=AT&q=Maler — VALÓDI állás-listák. Admin-only.
 *
 * Forrás-lánc (az első KONFIGURÁLT nyer):
 *   1. Adzuna   — kulccsal, AT/DE/NL + fizetés-adat (a legjobb).
 *   2. Jooble   — kulccsal, jó AT/EU lefedés.
 *   3. Arbeitnow — INGYENES, kulcs nélkül (DE/EU-fókusz) → mindig van valami.
 * `source` jelzi, melyikből jött.
 */
export async function GET(req: Request) {
  const adminId = await getAdminUserId();
  if (!adminId) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const sp = new URL(req.url).searchParams;
  const country = sp.get("country") ?? "AT";
  const q = sp.get("q") ?? "";

  try {
    const ad = await searchAdzunaJobs(country, q, 20);
    if (ad.configured) {
      return NextResponse.json({ jobs: ad.jobs, source: "adzuna" }, { headers: { "cache-control": "no-store" } });
    }
    const jb = await searchJoobleJobs(country, q, 20);
    if (jb.configured) {
      return NextResponse.json({ jobs: jb.jobs, source: "jooble" }, { headers: { "cache-control": "no-store" } });
    }
    const jobs = await searchArbeitnowJobs(country, q, 20);
    return NextResponse.json({ jobs, source: "arbeitnow" }, { headers: { "cache-control": "no-store" } });
  } catch (err) {
    safeLogError("[admin/recruiter/jobs]", err);
    return NextResponse.json({ jobs: [], source: "error", error: "internal" }, { status: 500 });
  }
}
