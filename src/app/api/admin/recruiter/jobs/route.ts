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
 * Forrás-stratégia:
 *   - Ha van Adzuna ÉS/VAGY Jooble kulcs → mindkettőből listázunk + URL-dedup
 *     (max több lefedés). source = "adzuna+jooble" / "adzuna" / "jooble".
 *   - Ha EGYIK kulcs sincs → Arbeitnow (INGYENES, kulcs nélkül) fallback.
 */
export async function GET(req: Request) {
  const adminId = await getAdminUserId();
  if (!adminId) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const sp = new URL(req.url).searchParams;
  const country = sp.get("country") ?? "AT";
  const q = sp.get("q") ?? "";
  const region = sp.get("region") ?? "";

  try {
    const [ad, jb] = await Promise.all([
      searchAdzunaJobs(country, q, 20, region),
      searchJoobleJobs(country, q, 20, region),
    ]);

    if (ad.configured || jb.configured) {
      // Összefésülés + dedup URL szerint (Adzuna elöl — nála van fizetés-adat).
      const seen = new Set<string>();
      const jobs = [...ad.jobs, ...jb.jobs]
        .filter((j) => (seen.has(j.url) ? false : (seen.add(j.url), true)))
        .slice(0, 30);
      const source = ad.configured && jb.configured ? "adzuna+jooble" : ad.configured ? "adzuna" : "jooble";
      return NextResponse.json({ jobs, source }, { headers: { "cache-control": "no-store" } });
    }

    // Nincs kulcs → ingyenes fallback.
    const jobs = await searchArbeitnowJobs(country, q, 20, region);
    return NextResponse.json({ jobs, source: "arbeitnow" }, { headers: { "cache-control": "no-store" } });
  } catch (err) {
    safeLogError("[admin/recruiter/jobs]", err);
    return NextResponse.json({ jobs: [], source: "error", error: "internal" }, { status: 500 });
  }
}
