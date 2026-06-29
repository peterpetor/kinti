import { NextResponse, type NextRequest } from "next/server";
import { getCostBenchmarks, getUserCostProfile, submitCostBenchmark, type CostBenchmarkResult } from "@/lib/cost-benchmark";
import { isValidCostCategory, costCategory } from "@/lib/cost-categories";
import { hashIp } from "@/lib/security";
import { verifyTurnstile } from "@/lib/turnstile";
import { getRegion } from "@/lib/regions";
import { isValidCountry } from "@/lib/countries";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/** 1–6 (6 = „6+"), vagy null. */
function parseHousehold(v: unknown): number | null {
  const n = typeof v === "number" ? v : typeof v === "string" ? parseInt(v, 10) : NaN;
  return Number.isInteger(n) && n >= 1 && n <= 6 ? n : null;
}

/** GIVE-TO-GET: a stat csak akkor látszik, ha a user beadta a sajátját (különben locked). */
function toClient(r: CostBenchmarkResult) {
  return r.yourAmount != null
    ? { ...r, locked: false }
    : { category: r.category, count: r.count, scope: r.scope, sizeScoped: r.sizeScoped, locked: true, median: null, p25: null, p75: null, percentile: null, yourAmount: null };
}

/**
 * GET /api/benchmark/cost?country=CH&canton=ZH&household=4 — per-kategória statisztika
 * (régió + háztartásméret dimenzióval). Visszaadja a user saját háztartásméretét is
 * (a szelektor előkitöltéséhez).
 */
export async function GET(req: NextRequest) {
  const ip = req.headers.get("cf-connecting-ip") ?? null;
  const ipHash = (await hashIp(ip)) || "unknown-ip";
  const sp = req.nextUrl.searchParams;
  const c = sp.get("country");
  const country = isValidCountry(c) ? c : "CH";
  const canton = sp.get("canton") || "all";

  const profile = await getUserCostProfile(ipHash, country);
  const householdSize = parseHousehold(sp.get("household")) ?? profile.householdSize;
  const all = await getCostBenchmarks(country, canton, profile, householdSize);

  return NextResponse.json(
    { country, canton, householdSize, results: all.map(toClient) },
    { headers: { "cache-control": "no-store" } },
  );
}

/** POST /api/benchmark/cost — egy kategória beküldése (Turnstile + szerver-validáció). */
export async function POST(req: NextRequest) {
  const ip = req.headers.get("cf-connecting-ip") ?? null;
  const ipHash = (await hashIp(ip)) || "unknown-ip";
  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 }); }

  const captcha = await verifyTurnstile(typeof body.turnstileToken === "string" ? body.turnstileToken : null, ip);
  if (!captcha.ok) return NextResponse.json({ error: "A robot-ellenőrzés sikertelen." }, { status: 400 });

  const rawCountry = typeof body.country === "string" ? body.country : undefined;
  const country = isValidCountry(rawCountry) ? rawCountry : "CH";
  const cantonCode = typeof body.cantonCode === "string" ? body.cantonCode : "";
  const category = typeof body.category === "string" ? body.category : "";
  const amount = typeof body.amount === "number" ? Math.round(body.amount) : NaN;
  const householdSize = parseHousehold(body.householdSize);

  if (!getRegion(country, cantonCode)) return NextResponse.json({ error: "Válassz régiót." }, { status: 400 });
  if (!isValidCostCategory(category)) return NextResponse.json({ error: "Ismeretlen kategória." }, { status: 400 });
  const meta = costCategory(category)!;
  const cur = country === "CH" ? "CHF" : "EUR";
  if (!Number.isFinite(amount) || amount < meta.min || amount > meta.max) {
    return NextResponse.json(
      { error: `Adj meg egy havi összeget (${meta.min.toLocaleString("hu-HU")}–${meta.max.toLocaleString("hu-HU")} ${cur}).` },
      { status: 400 },
    );
  }

  await submitCostBenchmark({ country, cantonCode, category, amount, householdSize, ipHash });

  const profile = await getUserCostProfile(ipHash, country);
  const all = await getCostBenchmarks(country, cantonCode, profile, householdSize ?? profile.householdSize);
  return NextResponse.json({ ok: true, country, canton: cantonCode, householdSize: profile.householdSize, results: all.map(toClient) });
}
