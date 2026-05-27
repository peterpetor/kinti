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
 * POST /api/rides/submit — új telekocsi-hirdetés. Csak bejelentkezett (Clerk)
 * felhasználó. A poszter neve a Clerk-fiókból jön; a kapcsolat telefonon megy
 * (zero-liability, nincs beépített chat).
 */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Bejelentkezés szükséges." }, { status: 401 });
  }

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

  // Poszter neve a Clerk-fiókból
  const user = await currentUser();
  const posterName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    user?.username ||
    "Kinti tag";

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
    posterUserId: userId,
    contactPhone: v.contactPhone,
    notes: v.notes,
    waypoints: waypoints.length > 0 ? waypoints : null,
    expiresAt: computeRideExpiry(v.departureTime),
  });

  return NextResponse.json({ ok: true, id }, { headers: { "cache-control": "no-store" } });
}
