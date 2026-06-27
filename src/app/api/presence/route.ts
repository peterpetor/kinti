import { NextResponse, type NextRequest } from "next/server";
import { addPresencePing, getPresenceCounts, getPresenceCityCounts, countPresenceByIpToday } from "@/lib/repo-presence";
import { verifyTurnstile } from "@/lib/turnstile";
import { checkBlocklistOrReject } from "@/lib/blocklist-guard";
import { hashIp } from "@/lib/security";
import { isValidCountry } from "@/lib/countries";
import { findPresenceCity } from "@/lib/presence-cities";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/** Háztartás-barát napi plafon ip_hash-enként (a localStorage a per-személy gát). */
const DAILY_IP_LIMIT = 5;

/**
 * GET /api/presence?country=CH — régiónkénti anonim jelenlét-darabszám + összesen.
 * A számok „puhák" (a UI „legalább X"-et ír), de rate-limit + Turnstile védi.
 */
/** Közös összesítő payload egy országra (régió-szint a térkép-fallbackhez, város-szint a listához). */
async function buildPayload(country: string) {
  const [regionRows, cityRows] = await Promise.all([
    getPresenceCounts(country),
    getPresenceCityCounts(country),
  ]);
  const total = regionRows.reduce((s, r) => s + r.n, 0);
  const counts: Record<string, number> = {};
  const recent: Record<string, number> = {};
  for (const r of regionRows) { counts[r.regionCode] = r.n; recent[r.regionCode] = r.recent; }
  const cities: Record<string, number> = {};
  const cityRecent: Record<string, number> = {};
  for (const r of cityRows) { cities[r.city] = r.n; cityRecent[r.city] = r.recent; }
  return { country, counts, recent, cities, cityRecent, total };
}

export async function GET(req: NextRequest) {
  const c = req.nextUrl.searchParams.get("country");
  const country = isValidCountry(c) ? c : "CH";
  return NextResponse.json(await buildPayload(country), {
    headers: { "cache-control": "public, max-age=60" },
  });
}

/**
 * POST /api/presence — egy anonim jelenlét-ping.
 * Body: { country, city, turnstileToken }. NINCS account/email; az ip_hash csak
 * rate-limit (nem identitás). A régiót a városból vezetjük le (presence-cities).
 */
export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 });
  }

  const country = typeof body.country === "string" ? body.country : "";
  const cityName = typeof body.city === "string" ? body.city.trim().slice(0, 60) : "";
  const turnstileToken = typeof body.turnstileToken === "string" ? body.turnstileToken : null;

  if (!isValidCountry(country)) {
    return NextResponse.json({ error: "Ismeretlen ország." }, { status: 400 });
  }
  // A várost szerveroldalon is validáljuk a kanonikus listából (a régiót innen vezetjük le).
  const city = findPresenceCity(country, cityName);
  if (!city) {
    return NextResponse.json({ error: "Válassz várost a listából." }, { status: 400 });
  }

  const ip = req.headers.get("cf-connecting-ip") ?? null;
  const captcha = await verifyTurnstile(turnstileToken, ip);
  if (!captcha.ok) {
    return NextResponse.json({ error: "A robot-ellenőrzés sikertelen." }, { status: 400 });
  }

  const banned = await checkBlocklistOrReject({ ip, email: null });
  if (banned) return banned;

  const ipHash = await hashIp(ip);
  const dayCount = await countPresenceByIpToday(ipHash);
  if (dayCount >= DAILY_IP_LIMIT) {
    return NextResponse.json(
      { error: "Erről a hálózatról ma már többször bejelentkeztek. Köszönjük!" },
      { status: 429 },
    );
  }

  await addPresencePing({
    id: crypto.randomUUID(),
    country,
    regionCode: city.region,
    city: city.name,
    ipHash: ipHash ?? "unknown-ip",
  });

  return NextResponse.json({ ok: true, ...(await buildPayload(country)) });
}
