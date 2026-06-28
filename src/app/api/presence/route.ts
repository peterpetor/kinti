import { NextResponse, type NextRequest } from "next/server";
import { addPresencePing, getPresenceCounts, getPresenceCityCounts, countPresenceByIpToday } from "@/lib/repo-presence";
import { verifyTurnstile } from "@/lib/turnstile";
import { checkBlocklistOrReject } from "@/lib/blocklist-guard";
import { hashIp } from "@/lib/security";
import { isValidCountry } from "@/lib/countries";
import { getPresenceCities, matchCuratedCity } from "@/lib/presence-cities";
import { geocodeCity } from "@/lib/geocode";
import { haversineKm } from "@/lib/distance";

/** A geokódolt pont régió-kódja: a hozzá legközelebbi kurált város régiója (best-effort). */
function nearestRegion(country: string, lat: number, lng: number): string {
  const list = getPresenceCities(country);
  let best = list[0]?.region ?? "";
  let bestKm = Infinity;
  for (const c of list) {
    const km = haversineKm(lat, lng, c.lat, c.lng);
    if (km < bestKm) { bestKm = km; best = c.region; }
  }
  return best;
}

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
  const cityCoords: Record<string, { lat: number; lng: number }> = {};
  for (const r of cityRows) {
    cities[r.city] = r.n;
    cityRecent[r.city] = r.recent;
    if (r.lat != null && r.lng != null) cityCoords[r.city] = { lat: r.lat, lng: r.lng };
  }
  return { country, counts, recent, cities, cityRecent, cityCoords, total };
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
  if (cityName.length < 2) {
    return NextResponse.json({ error: "Írd be a városod vagy falud nevét." }, { status: 400 });
  }
  // Hely feloldása: 1) kanonikus kurált város (gyors út, geokódolás nélkül), különben
  // 2) bármely település geokódolása (pl. Grossarl) → precíz koordináta + a legközelebbi
  // régió. A geokódolás egyben anti-abuse gát is: csak valódi, az országban lévő helynév megy át.
  const curated = matchCuratedCity(country, cityName);
  let place: { name: string; region: string; lat: number; lng: number };
  if (curated) {
    place = { name: curated.name, region: curated.region, lat: curated.lat, lng: curated.lng };
  } else {
    const geo = await geocodeCity(cityName, { countryCode: country });
    if (!geo || (geo.countryCode && geo.countryCode.toUpperCase() !== country)) {
      return NextResponse.json({ error: "Nem találtuk ezt a települést. Ellenőrizd a helyesírást, vagy írd a legközelebbi várost." }, { status: 400 });
    }
    place = { name: geo.name.slice(0, 60), region: nearestRegion(country, geo.lat, geo.lng), lat: geo.lat, lng: geo.lng };
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
    regionCode: place.region,
    city: place.name,
    lat: place.lat,
    lng: place.lng,
    ipHash: ipHash ?? "unknown-ip",
  });

  return NextResponse.json({ ok: true, city: place.name, ...(await buildPayload(country)) });
}
