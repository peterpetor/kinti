import { NextResponse, type NextRequest } from "next/server";
import { getEvents, getMapEvents, createSubmittedEvent } from "@/lib/repo";
import { verifyTurnstile } from "@/lib/turnstile";
import { checkBlocklistOrReject } from "@/lib/blocklist-guard";
import { hashIp } from "@/lib/security";
import { checkAiRateLimit, logAiRateLimit } from "@/lib/ai";
import { containsProfanity } from "@/lib/profanity";
import { isValidCountry } from "@/lib/countries";
import { findPresenceCity, getPresenceCities } from "@/lib/presence-cities";
import { haversineKm } from "@/lib/distance";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// Csak ESEMÉNY küldhető be — a hely-kategóriák (bolt/etterem) 2026-07-03-án megszűntek.
// A „talalkozo" és „kozosseg" külön kategória (2026-07-03-án kettébontva).
const TAGS = new Set(["koncert", "talalkozo", "kozosseg", "egyeb"]);

// GET /api/events?upcoming=1&limit=10  — vagy  ?map=1&country=CH (térkép-pinek)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("map") === "1") {
    const c = searchParams.get("country");
    const country = isValidCountry(c) ? c : "CH";
    const events = await getMapEvents(country);
    return NextResponse.json({ events }, { headers: { "cache-control": "public, max-age=60" } });
  }
  const events = await getEvents({
    upcoming: searchParams.get("upcoming") === "1",
    limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
  });
  return NextResponse.json({ events }, { headers: { "cache-control": "no-store" } });
}

/**
 * POST /api/events — felhasználói esemény-beküldés (admin-moderált).
 * Body: { country, city, title, tag, eventDate?, startTime?, venue?, description?, turnstileToken }.
 * A hely a városból (presence-cities) jön; a sor PENDING (moderation_status=0).
 */
export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 }); }

  const country = typeof body.country === "string" ? body.country : "";
  const cityName = typeof body.city === "string" ? body.city.trim().slice(0, 60) : "";
  const title = typeof body.title === "string" ? body.title.trim().slice(0, 120) : "";
  const tag = typeof body.tag === "string" ? body.tag : "";
  const eventDate = typeof body.eventDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.eventDate) ? body.eventDate : null;
  const startTime = typeof body.startTime === "string" ? body.startTime.trim().slice(0, 10) : null;
  const venue = typeof body.venue === "string" ? body.venue.trim().slice(0, 120) : null;
  const description = typeof body.description === "string" ? body.description.trim().slice(0, 500) : null;
  const turnstileToken = typeof body.turnstileToken === "string" ? body.turnstileToken : null;

  if (!isValidCountry(country)) return NextResponse.json({ error: "Ismeretlen ország." }, { status: 400 });
  if (title.length < 3) return NextResponse.json({ error: "Adj egy címet (min. 3 karakter)." }, { status: 400 });
  if (!TAGS.has(tag)) return NextResponse.json({ error: "Válassz típust." }, { status: 400 });
  // Precíz pin (v2) — előre parseoljuk, mert ismeretlen településnél kötelező.
  const rawLat = typeof body.lat === "number" && Number.isFinite(body.lat) ? body.lat : null;
  const rawLng = typeof body.lng === "number" && Number.isFinite(body.lng) ? body.lng : null;
  const pinInBox =
    rawLat != null && rawLng != null &&
    rawLat >= 45.5 && rawLat <= 55.2 && rawLng >= 3.2 && rawLng <= 17.3;

  // Hely: ismert nagyváros a listából, VAGY szabad-szöveges település (falu/
  // kisváros) — utóbbinál a térkép-pin kötelező, mert nincs ismert koordináta.
  const city = findPresenceCity(country, cityName);
  if (!city && cityName.length < 2) {
    return NextResponse.json({ error: "Add meg a település nevét." }, { status: 400 });
  }
  if (!city && !pinInBox) {
    return NextResponse.json({ error: "Ismeretlen település — jelöld meg a helyét a térképen." }, { status: 400 });
  }
  // Dátumos típusoknál (koncert/találkozó/közösségi program) kérünk dátumot.
  if ((tag === "koncert" || tag === "talalkozo" || tag === "kozosseg") && !eventDate) {
    return NextResponse.json({ error: "Adj meg egy dátumot." }, { status: 400 });
  }
  if (eventDate && eventDate < new Date().toISOString().slice(0, 10)) {
    return NextResponse.json({ error: "A dátum nem lehet múltbeli." }, { status: 400 });
  }
  for (const t of [title, cityName, venue ?? "", description ?? ""]) {
    if (t && containsProfanity(t).hit) return NextResponse.json({ error: "Nem megfelelő szöveg." }, { status: 400 });
  }

  const ip = req.headers.get("cf-connecting-ip") ?? null;
  const captcha = await verifyTurnstile(turnstileToken, ip);
  if (!captcha.ok) return NextResponse.json({ error: "A robot-ellenőrzés sikertelen." }, { status: 400 });

  const banned = await checkBlocklistOrReject({ ip, email: null });
  if (banned) return banned;

  const ipHash = await hashIp(ip);

  // Rate-limit (defense-in-depth a Turnstile mellett): egy IP ne tudja
  // esemény-beküldésekkel elárasztani a moderációs sort (8/óra).
  const rl = await checkAiRateLimit("event-submit", ipHash);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Túl sok beküldés rövid idő alatt. Próbáld kicsit később." }, { status: 429 });
  }

  // Koordináta + régió. Ismert város: városközép, vagy a hozzá közeli (≤100 km)
  // pin. Ismeretlen település: a pin maga a hely (fent validált), a régiót a
  // legközelebbi ismert városról örökli, és a település nevét a helyszín elé
  // fűzzük, hogy ne vesszen el (az events-sémának nincs külön city-oszlopa).
  let lat: number, lng: number, regionCode: string;
  let venueOut = venue;
  if (city) {
    lat = city.lat; lng = city.lng; regionCode = city.region;
    if (pinInBox && haversineKm(city.lat, city.lng, rawLat!, rawLng!) <= 100) { lat = rawLat!; lng = rawLng!; }
  } else {
    lat = rawLat!; lng = rawLng!;
    const cities = getPresenceCities(country);
    let nearest = cities[0];
    for (const c of cities) {
      if (haversineKm(c.lat, c.lng, lat, lng) < haversineKm(nearest.lat, nearest.lng, lat, lng)) nearest = c;
    }
    regionCode = nearest?.region ?? "";
    if (!venueOut || !venueOut.toLowerCase().includes(cityName.toLowerCase())) {
      venueOut = (venueOut ? `${cityName} · ${venueOut}` : cityName).slice(0, 120);
    }
  }

  await createSubmittedEvent({
    title, eventDate, startTime, venue: venueOut, description, tag,
    country, regionCode, lat, lng,
    ipHash: ipHash ?? "unknown-ip",
  });

  await logAiRateLimit("event-submit", ipHash);

  return NextResponse.json({ ok: true, message: "Köszönjük! Az eseményt jóváhagyás után tesszük közzé a térképen." });
}
