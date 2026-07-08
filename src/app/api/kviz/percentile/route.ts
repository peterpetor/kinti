import { NextResponse } from "next/server";
import { getWeeklyQuizPercentile, incrementQuizScore } from "@/lib/repo";
import { checkAiRateLimit, logAiRateLimit } from "@/lib/ai";
import { hashIp } from "@/lib/security";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * A napi kvíz ANONIM heti percentilise.
 *
 *   GET  /api/kviz/percentile?country=CH&score=3
 *        → { total, percentile } | { total:0, percentile:null }  (nincs elég minta)
 *   POST /api/kviz/percentile   body: { country, score }
 *        → beszámítja a mai eredményt a hisztogramba (ország × mai nap × pont),
 *          majd visszaadja a heti percentilist (a friss beküldéssel együtt).
 *
 * Privacy: se azonosító, se token, se IP nem tárolódik — csak darabszám. Az IP
 * kizárólag transiensen (rate-limit hash) használt, a leaderboard-mintát követve.
 */
const COUNTRIES = new Set(["CH", "AT", "DE", "NL"]);

function parseInput(country: unknown, score: unknown): { country: string; score: number } | null {
  const c = typeof country === "string" ? country.toUpperCase() : "";
  if (!COUNTRIES.has(c)) return null;
  const s = Math.round(Number(score));
  if (!Number.isFinite(s) || s < 0 || s > 3) return null;
  return { country: c, score: s };
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const input = parseInput(url.searchParams.get("country"), url.searchParams.get("score"));
    if (!input) return NextResponse.json({ error: "Érvénytelen paraméter." }, { status: 400 });

    const res = await getWeeklyQuizPercentile(input.country, input.score);
    return NextResponse.json(
      { total: res?.total ?? 0, percentile: res?.percentile ?? null },
      { headers: { "cache-control": "public, max-age=120" } },
    );
  } catch (err) {
    safeLogError("api/kviz/percentile GET", err);
    return NextResponse.json({ total: 0, percentile: null }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { country?: unknown; score?: unknown };
    const input = parseInput(body.country, body.score);
    if (!input) return NextResponse.json({ error: "Érvénytelen adat." }, { status: 400 });

    // Flood-védelem (napi 1 legit/eszköz; a limit a szkriptelt hisztogram-tömés ellen).
    const ipHash = await hashIp(req.headers.get("cf-connecting-ip"));
    const rl = await checkAiRateLimit("kviz-stat", ipHash);
    if (!rl.allowed) {
      // Nem hiba a usernek: a beszámítást kihagyjuk, de a percentilist visszaadjuk.
      const res = await getWeeklyQuizPercentile(input.country, input.score);
      return NextResponse.json(
        { total: res?.total ?? 0, percentile: res?.percentile ?? null, counted: false },
        { headers: { "cache-control": "no-store" } },
      );
    }

    await incrementQuizScore(input.country, input.score);
    await logAiRateLimit("kviz-stat", ipHash);

    const res = await getWeeklyQuizPercentile(input.country, input.score);
    return NextResponse.json(
      { total: res?.total ?? 0, percentile: res?.percentile ?? null, counted: true },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (err) {
    safeLogError("api/kviz/percentile POST", err);
    return NextResponse.json({ error: "Belső hiba." }, { status: 500 });
  }
}
