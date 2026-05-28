import { NextResponse } from "next/server";
import { createSosAlert, getActiveAlertCountForUser } from "@/lib/sos-repo";
import { filterProfanity } from "@/lib/profanity";
import { verifyTurnstile } from "@/lib/turnstile";
import { hashIp } from "@/lib/bulletin";
import { countRecentRideSubmits, logRideSubmit } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/** Svájc + Liechtenstein földrajzi határai (laza, hogy a határszéliek se vesszenek el). */
const SWISS_BOUNDS = {
  minLat: 45.6, maxLat: 47.9,
  minLng: 5.7, maxLng: 10.6,
};
/** Loose nemzetközi telefon-formátum (E.164-szerű, max 24 char). */
const PHONE_RE = /^\+?[0-9][0-9 ()\-/]{5,23}$/;

/** Napi limit: max 3 SOS / IP / 24h. */
const SOS_DAILY_LIMIT = 3;

/**
 * POST /api/sos/submit — vészjelzés feladás (Közösségi S.O.S. Radar).
 *
 * Több rétegű spam-védelem:
 *   1) Turnstile CAPTCHA (kötelező)
 *   2) IP-alapú napi limit (3 / 24h) — a logRideSubmit/countRecentRideSubmits-et
 *      újrahasználjuk (azonos ip-log tábla, "SOS"-t jelöljük az id-prefixszel)
 *   3) Max 1 aktív riasztás / felhasználó (a meglévő business rule)
 *   4) Földrajzi határok (Svájc + Liechtenstein) — kívülről nem fogadunk el
 *   5) Telefonszám-formátum validáció (E.164-szerű)
 *   6) Csak a `cf-connecting-ip` megbízható — az `x-forwarded-for` fallback
 *      megkerülhető, ezért kivesszük
 */
export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // 1) Turnstile
  const turnstileToken = typeof body.turnstileToken === "string" ? body.turnstileToken : null;
  const ip = req.headers.get("cf-connecting-ip"); // CSAK ez megbízható Pages mögött
  const captcha = await verifyTurnstile(turnstileToken, ip);
  if (!captcha.ok) {
    return NextResponse.json(
      { error: "A robot-ellenőrzés sikertelen. Próbáld újra." },
      { status: 400 },
    );
  }

  // 2) IP-alapú napi limit (SOS specifikus log table-ünk nincs, a rides-log-ot
  //    újrahasználjuk — közös ip-hash + 24h, megfelelő a SOS-rate-limithez is)
  const ipHash = await hashIp(ip);
  const recent = await countRecentRideSubmits(ipHash);
  if (recent >= SOS_DAILY_LIMIT) {
    return NextResponse.json(
      { error: `Napi limit túllépve. 24 óra alatt legfeljebb ${SOS_DAILY_LIMIT} riasztás adható le ugyanarról a kapcsolatról.` },
      { status: 429 },
    );
  }

  // userId IP-alapon (a Clerk nélküli SOS-flow-ban kell)
  const userId = `ip_${(ipHash ?? "anon").substring(0, 16)}`;

  // 3) Max 1 aktív riasztás per user
  const activeCount = await getActiveAlertCountForUser(userId);
  if (activeCount >= 1) {
    return NextResponse.json(
      { error: "Már van egy aktív riasztásod! Zárd le a meglévőt, mielőtt újat adsz le." },
      { status: 429 },
    );
  }

  // 4) Földrajzi határok + típus-validáció
  const { lat, lng, description, contactPhone } = body as {
    lat?: unknown; lng?: unknown; description?: unknown; contactPhone?: unknown;
  };
  if (typeof lat !== "number" || typeof lng !== "number" || !description || !contactPhone) {
    return NextResponse.json({ error: "Hiányzó adatok." }, { status: 400 });
  }
  if (
    lat < SWISS_BOUNDS.minLat || lat > SWISS_BOUNDS.maxLat ||
    lng < SWISS_BOUNDS.minLng || lng > SWISS_BOUNDS.maxLng
  ) {
    return NextResponse.json(
      { error: "A megadott koordináta nem Svájc / Liechtenstein területén van." },
      { status: 400 },
    );
  }

  // 5) Telefonszám formátum
  const phoneStr = String(contactPhone).trim();
  if (!PHONE_RE.test(phoneStr) || phoneStr.length > 24) {
    return NextResponse.json(
      { error: "Adj meg érvényes telefonszámot (pl. +41 79 123 45 67)." },
      { status: 400 },
    );
  }

  const id = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();

  await createSosAlert({
    id,
    lat,
    lng,
    description: filterProfanity(String(description).slice(0, 300)),
    contactPhone: phoneStr,
    posterUserId: userId,
    expiresAt,
  });

  // 6) Rate-limit napló (fire-and-forget) — közös tábla a Telekocsival
  logRideSubmit(`sos_${crypto.randomUUID()}`, ipHash).catch(() => { /* silent */ });

  return NextResponse.json({ ok: true, id });
}
