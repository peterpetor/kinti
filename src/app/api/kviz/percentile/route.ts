import { NextResponse } from "next/server";
import {
  getWeeklyQuizPercentile, incrementQuizScore, incrementQuizRegionScore,
  getWeeklyCountryScoreCounts, getWeeklyRegionScoreCounts,
} from "@/lib/repo";
import { battleRanking, BATTLE_MIN_COUNTRY, BATTLE_MIN_REGION, type BattleRow } from "@/lib/quiz-battle";
import { getRegions } from "@/lib/regions";
import { checkAiRateLimit, logAiRateLimit } from "@/lib/ai";
import { hashIp } from "@/lib/security";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * A napi kvíz ANONIM heti percentilise + „Országok és Régiók Harca".
 *
 *   GET  /api/kviz/percentile?country=CH&score=3[&canton=ZH]
 *        → { total, percentile, battle }
 *   GET  /api/kviz/percentile?country=CH            (score nélkül — /ranglista)
 *        → { battle }  — csak a heti versenytáblák
 *   POST /api/kviz/percentile   body: { country, score, canton? }
 *        → beszámítja a mai eredményt az ország- ÉS (ha van validált régió) a
 *          régió-hisztogramba, majd percentilis + versenytáblák.
 *
 * Privacy: se azonosító, se token, se IP nem tárolódik — csak darabszám. A
 * canton a kliens önkéntes régió-preferenciája (coarse), getRegions ellen
 * validálva. A versenytáblák min-minta kapuval jönnek (quiz-battle), kevés
 * adatnál ÜRESEK — a UI ilyenkor nem mutat táblát.
 */
const COUNTRIES = new Set(["CH", "AT", "DE", "NL"]);

function parseCountry(country: unknown): string | null {
  const c = typeof country === "string" ? country.toUpperCase() : "";
  return COUNTRIES.has(c) ? c : null;
}

function parseScore(score: unknown): number | null {
  const s = Math.round(Number(score));
  return Number.isFinite(s) && s >= 0 && s <= 3 ? s : null;
}

function parseCanton(country: string, canton: unknown): string | null {
  if (typeof canton !== "string" || !canton) return null;
  return getRegions(country).some((r) => r.code === canton) ? canton : null;
}

interface BattlePayload {
  countries: BattleRow[];
  regions: BattleRow[];
}

async function getBattle(country: string): Promise<BattlePayload> {
  const [countryCounts, regionCounts] = await Promise.all([
    getWeeklyCountryScoreCounts(),
    getWeeklyRegionScoreCounts(country),
  ]);
  return {
    countries: battleRanking(countryCounts, BATTLE_MIN_COUNTRY),
    regions: battleRanking(regionCounts, BATTLE_MIN_REGION),
  };
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const country = parseCountry(url.searchParams.get("country"));
    if (!country) return NextResponse.json({ error: "Érvénytelen paraméter." }, { status: 400 });

    // score nélkül: csak a versenytáblák (a /ranglista „Régiók Harca" szekciója).
    const rawScore = url.searchParams.get("score");
    if (rawScore === null) {
      const battle = await getBattle(country);
      return NextResponse.json({ battle }, { headers: { "cache-control": "public, max-age=120" } });
    }

    const score = parseScore(rawScore);
    if (score === null) return NextResponse.json({ error: "Érvénytelen paraméter." }, { status: 400 });

    const [res, battle] = await Promise.all([getWeeklyQuizPercentile(country, score), getBattle(country)]);
    return NextResponse.json(
      { total: res?.total ?? 0, percentile: res?.percentile ?? null, battle },
      { headers: { "cache-control": "public, max-age=120" } },
    );
  } catch (err) {
    safeLogError("api/kviz/percentile GET", err);
    return NextResponse.json({ total: 0, percentile: null, battle: { countries: [], regions: [] } }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { country?: unknown; score?: unknown; canton?: unknown };
    const country = parseCountry(body.country);
    const score = country ? parseScore(body.score) : null;
    if (!country || score === null) return NextResponse.json({ error: "Érvénytelen adat." }, { status: 400 });
    const canton = parseCanton(country, body.canton);

    // Flood-védelem (napi 1 legit/eszköz; a limit a szkriptelt hisztogram-tömés ellen).
    const ipHash = await hashIp(req.headers.get("cf-connecting-ip"));
    const rl = await checkAiRateLimit("kviz-stat", ipHash);
    if (!rl.allowed) {
      // Nem hiba a usernek: a beszámítást kihagyjuk, de a válasz teljes.
      const [res, battle] = await Promise.all([getWeeklyQuizPercentile(country, score), getBattle(country)]);
      return NextResponse.json(
        { total: res?.total ?? 0, percentile: res?.percentile ?? null, battle, counted: false },
        { headers: { "cache-control": "no-store" } },
      );
    }

    await incrementQuizScore(country, score);
    if (canton) await incrementQuizRegionScore(country, canton, score);
    await logAiRateLimit("kviz-stat", ipHash);

    const [res, battle] = await Promise.all([getWeeklyQuizPercentile(country, score), getBattle(country)]);
    return NextResponse.json(
      { total: res?.total ?? 0, percentile: res?.percentile ?? null, battle, counted: true },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (err) {
    safeLogError("api/kviz/percentile POST", err);
    return NextResponse.json({ error: "Belső hiba." }, { status: 500 });
  }
}
