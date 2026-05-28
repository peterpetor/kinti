import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  createRide,
  countRecentRideSubmits,
  logRideSubmit,
  type RideWaypoint,
  listPushSubscriptions,
  deletePushSubscription,
} from "@/lib/repo";
import { validateRideInput, computeRideExpiry } from "@/lib/rides";
import { geocodeCity } from "@/lib/geocode";
import { verifyTurnstile } from "@/lib/turnstile";
import { hashIp } from "@/lib/bulletin";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { sendPush } from "@/lib/push";
import { matchCantonByName } from "@/lib/cantons";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/** Svájc közepe — fallback, ha a geokódolás nem talál koordinátát. */
const FALLBACK = { lat: 46.8, lng: 8.23 };

/** Napi limit / IP — spam-védelem. */
const RIDE_DAILY_LIMIT = 5;

async function notifyNewRide(city: string): Promise<void> {
  const env = getCloudflareEnv();
  if (!env.VAPID_PRIVATE_KEY) return;
  const cantonCode = matchCantonByName(city)?.code ?? null;
  const subs = await listPushSubscriptions(cantonCode);
  await Promise.all(
    subs.map(async (s) => {
      try {
        const status = await sendPush(env.VAPID_PRIVATE_KEY!, { endpoint: s.endpoint });
        if (status === 404 || status === 410) await deletePushSubscription(s.endpoint);
      } catch {
        /* egyedi kézbesítési hibát elnyelünk */
      }
    }),
  );
}

/**
 * POST /api/rides/submit — új telekocsi-hirdetés.
 *
 * Nem kötelező a Clerk-belépés: vendég-felhasználó is feladhat fuvart, ekkor a
 * `posterName` mező a form-on jön. Belépett userhez a Clerk-fiók neve.
 *
 * Spam-védelem: Turnstile CAPTCHA + IP-alapú napi limit (5 / 24h).
 * A jelentkezőkkel a kapcsolat telefonon megy (zero-liability, nincs beépített chat).
 */
export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 });
  }

  const validation = validateRideInput(body);
  if (!validation.ok) {
    return NextResponse.json(
      { error: "Hibás bemenet.", details: validation.errors },
      { status: 400 },
    );
  }
  const v = validation.value;

  // Turnstile CAPTCHA — minden vendég-feladásnál kötelező (belépett Clerk-userhez is).
  const turnstileToken =
    typeof body.turnstileToken === "string" ? body.turnstileToken : null;
  const ip = req.headers.get("cf-connecting-ip") ?? null;
  const captcha = await verifyTurnstile(turnstileToken, ip);
  if (!captcha.ok) {
    return NextResponse.json(
      { error: "A robot-ellenőrzés sikertelen. Próbáld újra.", codes: captcha.errorCodes },
      { status: 400 },
    );
  }

  // IP-alapú napi limit
  const ipHash = await hashIp(ip);
  const recent = await countRecentRideSubmits(ipHash);
  if (recent >= RIDE_DAILY_LIMIT) {
    return NextResponse.json(
      { error: `Napi limit túllépve. 24 óra alatt legfeljebb ${RIDE_DAILY_LIMIT} fuvar adható fel ugyanarról a kapcsolatról.` },
      { status: 429 },
    );
  }

  // Koordináta: a kliensé, vagy geokódolás az indulás helyéből, vagy fallback.
  let lat = v.lat;
  let lng = v.lng;
  if (lat == null || lng == null) {
    const geo = await geocodeCity(v.departureCity);
    lat = geo?.lat ?? FALLBACK.lat;
    lng = geo?.lng ?? FALLBACK.lng;
  }

  // Poszter neve: belépett Clerk-fiók > form-ról adott név > generikus.
  const { userId } = await auth();
  let posterName: string | null = v.posterName?.trim() || null;
  if (userId) {
    const user = await currentUser();
    const fromClerk =
      [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
      user?.username ||
      null;
    posterName = fromClerk || posterName;
  }
  if (!posterName) {
    return NextResponse.json(
      { error: "Hibás bemenet.", details: [{ field: "posterName", message: "Add meg a megjelenített neved." }] },
      { status: 400 },
    );
  }

  // Közbeeső megállók geokódolása (párhuzamosan).
  const waypoints: RideWaypoint[] = [];
  if (v.waypointCities.length > 0) {
    const geos = await Promise.all(v.waypointCities.map((c) => geocodeCity(c)));
    for (let i = 0; i < v.waypointCities.length; i++) {
      const g = geos[i];
      waypoints.push({
        city: g?.name ?? v.waypointCities[i],
        lat: g?.lat ?? FALLBACK.lat,
        lng: g?.lng ?? FALLBACK.lng,
      });
    }
  }

  const id = crypto.randomUUID();
  const manageToken = crypto.randomUUID().replace(/-/g, "");
  await createRide({
    id,
    departureCity: v.departureCity,
    destinationCity: v.destinationCity,
    departureTime: v.departureTime,
    lat,
    lng,
    seats: v.seats,
    priceText: v.priceText,
    posterName,
    posterUserId: userId ?? null,
    contactPhone: v.contactPhone,
    contactWhatsapp: v.contactWhatsapp,
    notes: v.notes,
    waypoints: waypoints.length > 0 ? waypoints : null,
    expiresAt: computeRideExpiry(v.departureTime),
    manageToken,
  });

  // Rate-limit napló (fire-and-forget — hiba esetén sem gátolja a flow-t).
  logRideSubmit(crypto.randomUUID(), ipHash).catch(() => { /* silent */ });

  try {
    await notifyNewRide(v.departureCity);
  } catch {
    /* push failure shouldn't block the API response */
  }

  // A manage URL-t a kliens success oldala kapja meg — a felhasználó elteszi
  // (nincs email, mert vendég-feladásnál nem kérünk emailt).
  return NextResponse.json(
    { ok: true, id, manageToken, manageUrl: `/telekocsi-kezeles/${manageToken}` },
    { headers: { "cache-control": "no-store" } },
  );
}
