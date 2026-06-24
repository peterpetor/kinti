import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin";
import { searchAdzunaJobs } from "@/lib/adzuna";
import { searchArbeitnowJobs } from "@/lib/arbeitnow";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/recruiter/jobs?country=AT&q=Maler — VALÓDI állás-listák. Admin-only.
 *
 * Forrás-stratégia: ha be van állítva az Adzuna-kulcs → Adzuna (AT/DE/NL, fizetés,
 * jó kulcsszó-keresés). Ha nincs → Arbeitnow (ingyenes, kulcs nélkül, DE/EU-fókusz)
 * mint fallback, hogy kulcs nélkül is legyen listázás. `source` jelzi, melyik.
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
      return NextResponse.json({ jobs: ad.jobs, configured: true, source: "adzuna" }, { headers: { "cache-control": "no-store" } });
    }
    // Nincs Adzuna-kulcs → ingyenes fallback.
    const jobs = await searchArbeitnowJobs(country, q, 20);
    return NextResponse.json({ jobs, configured: false, source: "arbeitnow" }, { headers: { "cache-control": "no-store" } });
  } catch (err) {
    safeLogError("[admin/recruiter/jobs]", err);
    return NextResponse.json({ jobs: [], configured: true, source: "error", error: "internal" }, { status: 500 });
  }
}
