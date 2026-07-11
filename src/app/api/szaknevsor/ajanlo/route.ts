import { NextResponse, type NextRequest } from "next/server";
import { getQuizCtaBusinesses } from "@/lib/repo-business";
import { isValidCountry } from "@/lib/countries";
import { cached } from "@/lib/edge-cache";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const CAT_RE = /^[a-z0-9_]{1,64}$/;

/**
 * GET /api/szaknevsor/ajanlo?country=DE&cats=konyveles,adotanacsado — „Kvízből
 * Lead" karcsú cég-ajánló: az ország + szakma-lista legjobb 1-2 cége, KIEMELT
 * (Szaknévsor PRO) elöl. Csak publikus mezők (id/név/kategória/featured),
 * kontakt NINCS. Edge-cachelt (a kombinációk száma kicsi: 3 kurált témapár).
 */
export async function GET(req: NextRequest) {
  const country = req.nextUrl.searchParams.get("country");
  const rawCats = (req.nextUrl.searchParams.get("cats") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!isValidCountry(country) || rawCats.length === 0 || rawCats.length > 4 || !rawCats.every((c) => CAT_RE.test(c))) {
    return NextResponse.json({ error: "Hibás paraméterek." }, { status: 400 });
  }
  const key = `quizcta:${country}:${rawCats.join(",")}`;
  const businesses = await cached(key, 10 * 60_000, () => getQuizCtaBusinesses(country, rawCats, 2));
  return NextResponse.json(
    { businesses },
    { headers: { "cache-control": "public, max-age=300, s-maxage=600, stale-while-revalidate=1800" } },
  );
}
