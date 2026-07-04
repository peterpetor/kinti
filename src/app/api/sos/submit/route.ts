import { NextResponse } from "next/server";
import { createSosAlert, getActiveAlertCountForUser } from "@/lib/sos-repo";
import { filterProfanity, containsProfanity } from "@/lib/profanity";
import { verifyTurnstile } from "@/lib/turnstile";
import { hashIp } from "@/lib/security";
import { countRecentSpamLog, logSpamSubmit, logModerationStrike } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * Földrajzi határ — Svájc + szomszédai és Magyarország felé az utazási
 * útvonalak. Cél: ha a feladó útközben (pl. A1 / A4 / M1 autópályán)
 * lerobban a CH ↔ HU között, le tudja adni a riasztást.
 *
 * Lefedett országok (bounding box-ban):
 *   • Svájc + Liechtenstein
 *   • Németország (északra Hamburg, keletre Berlin)
 *   • Ausztria (egész terület)
 *   • Franciaország (egész terület, ide tartozik a Genf-Lyon-Marseille folyosó)
 *   • Olaszország (egész terület, Sicilia-ig)
 *   • Magyarország (egész terület + tranzit Szlovákián/Szlovénián át)
 *
 * (Bónusz: Benelux + Csehország + Szlovákia + Szlovénia + Horvátország +
 *  Spanyolország/Portugália északi része is benne van — tranzit-utak során
 *  ezeken is áthaladhatnak, így OK.)
 */
const SOS_BOUNDS = {
  minLat: 36.0,  // Szicília déli partja
  maxLat: 55.0,  // Észak-Németország (Flensburg / Hamburg)
  minLng: -5.0,  // Atlanti-óceáni partvidék (Bretagne)
  maxLng: 23.0,  // Kelet-Magyarország (Záhony)
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
 *   2) IP-alapú napi limit (3 / 24h) — azonos IP rate-limit tábla használata
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

  // 2) IP-alapú napi limit (közös ip-hash + 24h, megfelelő a SOS-rate-limithez is)
  const ipHash = await hashIp(ip);
  const recent = await countRecentSpamLog("sos", ipHash, 24 * 60);
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
    lat < SOS_BOUNDS.minLat || lat > SOS_BOUNDS.maxLat ||
    lng < SOS_BOUNDS.minLng || lng > SOS_BOUNDS.maxLng
  ) {
    return NextResponse.json(
      { error: "A megadott koordináta a támogatott régión kívül van (CH / DE / AT / FR / IT / HU + tranzit-útvonalak)." },
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
  // Lezárás-titok: a válaszban visszaadjuk, a kliens tárolja — a lezárás ezzel
  // megy, nem IP-egyezéssel (mobilon az IP hálózat-váltáskor változik).
  const resolveToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();

  // Profanity-szűrő: blokkolás rasszista/trágár tartalom esetén
  if (containsProfanity(String(description)).hit) {
    await logModerationStrike(ipHash, "SOS description contained profanity").catch(() => {});
    return NextResponse.json(
      { error: "A leírás nem megfelelő szavakat tartalmaz. Fogalmazd meg másképp." },
      { status: 400 },
    );
  }

  await createSosAlert({
    id,
    lat,
    lng,
    description: filterProfanity(String(description).slice(0, 300)),
    contactPhone: phoneStr,
    posterUserId: userId,
    expiresAt,
    resolveToken,
  });

  // 6) Rate-limit napló (fire-and-forget)
  logSpamSubmit("sos", ipHash).catch(() => { /* silent */ });

  return NextResponse.json({ ok: true, id, resolveToken });
}
