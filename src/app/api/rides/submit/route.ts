import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createRide, type RideWaypoint } from "@/lib/repo";
import { validateRideInput, computeRideExpiry } from "@/lib/rides";
import { geocodeCity } from "@/lib/geocode";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/** Svájc közepe — fallback, ha a geokódolás nem talál koordinátát. */
const FALLBACK = { lat: 46.8, lng: 8.23 };

/**
 * POST /api/rides/submit — új telekocsi-hirdetés.
 *
 * Nem kötelező a Clerk-belépés: vendég-felhasználó is feladhat fuvart, ekkor a
 * `posterName` mező a form-on jön. Belépett userhez a Clerk-fiók neve.
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
    notes: v.notes,
    waypoints: waypoints.length > 0 ? waypoints : null,
    expiresAt: computeRideExpiry(v.departureTime),
  });

  return NextResponse.json({ ok: true, id }, { headers: { "cache-control": "no-store" } });
}
