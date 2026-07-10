import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin";
import { getDB } from "@/lib/cloudflare";
import { getCountry, isValidCountry } from "@/lib/countries";
import { buildNewsletterText, isoWeek, pickWeeklyGuides } from "@/lib/newsletter-draft";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/newsletter/draft — heti hírlevél-VÁZLAT generálása (0 AI):
 * friss D1-adatok (új cégek, friss állások) + determinisztikus heti útmutató-
 * válogatás. Body: { country: 'CH'|'AT'|'DE'|'NL' }. A küldés az admin kézi
 * döntése marad a composerben.
 */
export async function POST(req: Request) {
  const adminId = await getAdminUserId();
  if (!adminId) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  try {
    const body = (await req.json().catch(() => ({}))) as { country?: string };
    const country = typeof body.country === "string" ? body.country : "";
    if (!isValidCountry(country)) {
      return NextResponse.json({ error: "Válassz konkrét országot a draft-hoz (a szegmensek tartalma országonként eltér)." }, { status: 400 });
    }
    // Friss D1-adatok (a lib tiszta marad → unit-tesztelhető; a D1 itt él).
    const db = getDB();
    const [bizRows, bizCount, jobRows] = await Promise.all([
      db
        .prepare(
          `SELECT name, category_label FROM businesses
           WHERE country_code = ? AND moderation_status = 1 AND COALESCE(hidden, 0) = 0
             AND created_at >= datetime('now', '-14 days')
           ORDER BY created_at DESC LIMIT 4`,
        )
        .bind(country)
        .all<{ name: string; category_label: string | null }>(),
      db
        .prepare(
          `SELECT COUNT(*) AS n FROM businesses
           WHERE country_code = ? AND moderation_status = 1 AND COALESCE(hidden, 0) = 0
             AND created_at >= datetime('now', '-14 days')`,
        )
        .bind(country)
        .first<{ n: number }>(),
      db
        .prepare(
          `SELECT title, location FROM jobs
           WHERE country_code = ? AND status IN ('active', 'featured') AND moderation_status = 1
             AND created_at >= datetime('now', '-14 days')
           ORDER BY created_at DESC LIMIT 5`,
        )
        .bind(country)
        .all<{ title: string; location: string }>(),
    ]);

    const { year, week } = isoWeek();
    const guides = pickWeeklyGuides(country, year * 53 + week, 2);

    const draft = buildNewsletterText({
      countryCode: country,
      countryName: getCountry(country)?.name ?? country,
      weekLabel: `${year}/${week}. hét`,
      newBusinesses: bizRows.results.map((r) => ({ name: r.name, categoryLabel: r.category_label })),
      newBusinessTotal: bizCount?.n ?? bizRows.results.length,
      newJobs: jobRows.results.map((r) => ({ title: r.title, location: r.location })),
      guides: guides.map((g) => ({ title: g.title, slug: g.slug })),
    });
    return NextResponse.json(draft, { headers: { "cache-control": "no-store" } });
  } catch (err) {
    safeLogError("api/admin/newsletter/draft", err);
    return NextResponse.json({ error: "Nem sikerült a vázlat generálása." }, { status: 500 });
  }
}
