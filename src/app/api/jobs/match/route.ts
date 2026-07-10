import { NextResponse, type NextRequest } from "next/server";
import { getMatchingJobs } from "@/lib/repo-jobs";
import { getExternalJobs } from "@/lib/repo-external-jobs";
import { isValidCountry } from "@/lib/countries";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const CATEGORY_RE = /^[a-z0-9_-]{1,64}$/;

/**
 * GET /api/jobs/match?country=AT&category=targoncas — „Intelligens állásajánló"
 * a Német Önéletrajz Készítőhöz: a kész CV szakma-kategóriájára illő aktív
 * hirdetések. Kinti-hirdetések (házon belüli jelentkezés) + aggregált külső
 * hirdetések (link-out) egy válaszban. Csak publikus mezők, kontakt nélkül —
 * a telefon/email itt sem szivárog (anti-scraping elv).
 */
export async function GET(req: NextRequest) {
  const country = req.nextUrl.searchParams.get("country");
  const category = req.nextUrl.searchParams.get("category") ?? "";
  if (!isValidCountry(country) || !CATEGORY_RE.test(category)) {
    return NextResponse.json({ error: "Hibás paraméterek." }, { status: 400 });
  }
  const [kinti, external] = await Promise.all([
    getMatchingJobs(country, category, 5),
    getExternalJobs(country, { category, limit: 4 }),
  ]);
  return NextResponse.json(
    {
      kinti,
      external: external.map((j) => ({
        id: j.id, title: j.title, company: j.company, location: j.location,
        source: j.source, sourceUrl: j.sourceUrl,
      })),
    },
    { headers: { "cache-control": "public, max-age=300" } },
  );
}
