import { NextResponse, type NextRequest } from "next/server";
import { getBoltSpots, createBoltSpot, reportBoltSpot, countBoltSpotsByIp } from "@/lib/repo-magyar-bolt";
import { verifyTurnstile } from "@/lib/turnstile";
import { checkBlocklistOrReject } from "@/lib/blocklist-guard";
import { hashIp } from "@/lib/security";
import { containsProfanity } from "@/lib/profanity";
import { isValidCountry } from "@/lib/countries";
import { isValidBoltCategory } from "@/lib/magyar-bolt";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const DAILY_IP_LIMIT = 5;
// A lefedett országok (DACH+NL) durva befoglaló doboza — a precíz pin ellenőrzéséhez.
const BBOX = { latMin: 45.5, latMax: 55.2, lngMin: 3.2, lngMax: 17.3 };

/** GET /api/magyarbolt?country=CH — látható magyar élelmiszer-helyek a térképhez. */
export async function GET(req: NextRequest) {
  const c = req.nextUrl.searchParams.get("country");
  const country = isValidCountry(c) ? c : "CH";
  const spots = await getBoltSpots(country);
  return NextResponse.json({ spots }, { headers: { "cache-control": "public, max-age=60" } });
}

/**
 * POST /api/magyarbolt — új hely (azonnal látható) VAGY jelentés.
 *  - { action: "report", id }  → közösségi jelentés (N után auto-hide).
 *  - különben beküldés: { country, category, name, lat, lng, locationName?, note?, turnstileToken }.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 }); }

  // — Jelentés —
  if (body.action === "report" && typeof body.id === "string") {
    const res = await reportBoltSpot(body.id);
    return NextResponse.json({ ok: true, ...res });
  }

  // — Beküldés —
  const country = typeof body.country === "string" ? body.country : "";
  const category = typeof body.category === "string" ? body.category : "";
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 80) : "";
  const locationName = typeof body.locationName === "string" ? body.locationName.trim().slice(0, 80) : null;
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 300) : null;
  const lat = typeof body.lat === "number" ? body.lat : NaN;
  const lng = typeof body.lng === "number" ? body.lng : NaN;
  const turnstileToken = typeof body.turnstileToken === "string" ? body.turnstileToken : null;

  if (!isValidCountry(country)) return NextResponse.json({ error: "Ismeretlen ország." }, { status: 400 });
  if (!isValidBoltCategory(category)) return NextResponse.json({ error: "Válassz típust." }, { status: 400 });
  if (name.length < 2) return NextResponse.json({ error: "Add meg a hely nevét." }, { status: 400 });
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < BBOX.latMin || lat > BBOX.latMax || lng < BBOX.lngMin || lng > BBOX.lngMax) {
    return NextResponse.json({ error: "Jelöld ki a pontos helyet a térképen." }, { status: 400 });
  }
  for (const t of [name, locationName ?? "", note ?? ""]) {
    if (t && containsProfanity(t).hit) return NextResponse.json({ error: "Nem megfelelő szöveg." }, { status: 400 });
  }

  const ip = req.headers.get("cf-connecting-ip") ?? null;
  const captcha = await verifyTurnstile(turnstileToken, ip);
  if (!captcha.ok) return NextResponse.json({ error: "A robot-ellenőrzés sikertelen." }, { status: 400 });

  const banned = await checkBlocklistOrReject({ ip, email: null });
  if (banned) return banned;

  const ipHash = await hashIp(ip);
  if ((await countBoltSpotsByIp(ipHash)) >= DAILY_IP_LIMIT) {
    return NextResponse.json({ error: "Ma már több helyet jelöltél. Köszönjük — folytasd holnap!" }, { status: 429 });
  }

  const manageToken = await createBoltSpot({
    name, category, locationName, lat, lng, country, cantonCode: null, note,
    ipHash: ipHash ?? "unknown-ip",
  });

  return NextResponse.json({ ok: true, manageToken, message: "Köszönjük! Felkerült a térképre. 🎉" });
}
