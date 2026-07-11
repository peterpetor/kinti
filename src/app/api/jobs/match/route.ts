import { NextResponse, type NextRequest } from "next/server";
import { getMatchingJobs, getMatchingJobsBySalary } from "@/lib/repo-jobs";
import { getExternalJobs } from "@/lib/repo-external-jobs";
import { isValidCountry } from "@/lib/countries";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const CATEGORY_RE = /^[a-z0-9_-]{1,64}$/;

/**
 * GET /api/jobs/match — „Intelligens állásajánló", két móddal:
 *
 *  • ?country=AT&category=targoncas — a CV-készítő tölcsére: a szakma-kategóriára
 *    illő Kinti- + külső hirdetések.
 *  • ?country=DE&gross=4000 — a BÉRKALKULÁTOR tölcsére: a havi bruttó ±20%-os
 *    sávjába eső, fizetést feltüntető Kinti-hirdetések (kiemelt elöl — ez a
 *    szponzorált hely a kalkulátor alatt).
 *
 * Csak publikus mezők, kontakt nélkül — a telefon/email itt sem szivárog
 * (anti-scraping elv).
 */
export async function GET(req: NextRequest) {
  const country = req.nextUrl.searchParams.get("country");
  if (!isValidCountry(country)) {
    return NextResponse.json({ error: "Hibás paraméterek." }, { status: 400 });
  }

  // Bérsáv-mód (bérkalkulátor): ?gross=<havi bruttó>
  const rawGross = req.nextUrl.searchParams.get("gross");
  if (rawGross !== null) {
    const gross = Math.round(Number(rawGross));
    if (!Number.isFinite(gross) || gross < 100 || gross > 1_000_000) {
      return NextResponse.json({ error: "Hibás paraméterek." }, { status: 400 });
    }
    const kinti = await getMatchingJobsBySalary(country, gross, 3);
    return NextResponse.json(
      { kinti, external: [] },
      { headers: { "cache-control": "public, max-age=300" } },
    );
  }

  // Kategória-mód (CV-készítő)
  const category = req.nextUrl.searchParams.get("category") ?? "";
  if (!CATEGORY_RE.test(category)) {
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
