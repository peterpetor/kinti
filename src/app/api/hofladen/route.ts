import { NextResponse } from "next/server";
import {
  createHofladenSpot,
  getActiveHofladenSpots,
  countRecentHofladenSubmissions,
  toPublicHofladenSpot,
} from "@/lib/repo";
import { verifyTurnstile } from "@/lib/turnstile";
import { checkBlocklistOrReject } from "@/lib/blocklist-guard";
import { hashIp } from "@/lib/bulletin";
import { findProfanityInFields } from "@/lib/profanity";
import {
  HOFLADEN_CATEGORIES,
  PAYMENT_METHODS,
} from "@/lib/hofladen";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/** GET — aktív (nem rejtett) hofladen-pontok publikus listája. */
export async function GET() {
  const spots = await getActiveHofladenSpots();
  return NextResponse.json(spots.map(toPublicHofladenSpot), {
    headers: { "cache-control": "public, max-age=300" },
  });
}

/**
 * POST — új hofladen-pont feladása.
 * Rate-limit: 3 / IP / nap.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 80) : "";
  const locationName =
    typeof body.locationName === "string" ? body.locationName.trim().slice(0, 100) : "";
  const lat = typeof body.lat === "number" ? body.lat : NaN;
  const lng = typeof body.lng === "number" ? body.lng : NaN;
  const cantonCode =
    typeof body.cantonCode === "string" ? body.cantonCode.trim().slice(0, 4) : "";
  const categoriesRaw = Array.isArray(body.categories) ? body.categories : [];
  const paymentMethodsRaw = Array.isArray(body.paymentMethods) ? body.paymentMethods : [];
  const open24h = body.open24h !== false;
  const openText = typeof body.openText === "string" ? body.openText.trim().slice(0, 80) : "";
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 300) : "";
  const turnstileToken =
    typeof body.turnstileToken === "string" ? body.turnstileToken : null;

  if (name.length < 3) {
    return NextResponse.json({ error: "A név túl rövid." }, { status: 400 });
  }
  if (
    !Number.isFinite(lat) || !Number.isFinite(lng) ||
    lat < 45 || lat > 48 || lng < 5 || lng > 11
  ) {
    return NextResponse.json(
      { error: "Érvénytelen koordináta (Svájcon belül)." },
      { status: 400 },
    );
  }

  const categories = (categoriesRaw as unknown[])
    .filter((c): c is string => typeof c === "string")
    .filter((c) => HOFLADEN_CATEGORIES.some((cat) => cat.id === c));
  const paymentMethods = (paymentMethodsRaw as unknown[])
    .filter((p): p is string => typeof p === "string")
    .filter((p) => PAYMENT_METHODS.some((pm) => pm.id === p));

  if (categories.length === 0) {
    return NextResponse.json({ error: "Válassz legalább egy kategóriát." }, { status: 400 });
  }
  if (paymentMethods.length === 0) {
    return NextResponse.json({ error: "Válassz legalább egy fizetési módot." }, { status: 400 });
  }

  const ip = req.headers.get("cf-connecting-ip") ?? null;
  const captcha = await verifyTurnstile(turnstileToken, ip);
  if (!captcha.ok) {
    return NextResponse.json(
      { error: "A robot-ellenőrzés sikertelen." },
      { status: 400 },
    );
  }

  const banned = await checkBlocklistOrReject({ ip, email: null });
  if (banned) return banned;

  const ipHash = await hashIp(ip);
  const recent = await countRecentHofladenSubmissions(ipHash);
  if (recent >= 3) {
    return NextResponse.json(
      { error: "Napi limit: 3 hofladen-feladás / IP." },
      { status: 429 },
    );
  }

  const id = crypto.randomUUID();
  const manageToken = crypto.randomUUID().replace(/-/g, "");

  // Profanity-szűrő a szöveges mezőkre
  const dirty = findProfanityInFields({ name, note });
  if (dirty) {
    return NextResponse.json(
      { error: "A megadott szöveg nem megfelelő szavakat tartalmaz. Fogalmazd meg másképp." },
      { status: 400 },
    );
  }

  await createHofladenSpot({
    id,
    name,
    locationName: locationName || null,
    lat,
    lng,
    cantonCode: cantonCode || null,
    categories,
    paymentMethods,
    open24h,
    openText: openText || null,
    note: note || null,
    manageToken,
    ipHash,
  });

  return NextResponse.json(
    {
      ok: true,
      id,
      manageToken,
      manageUrl: `/hofladen-kezeles/${manageToken}`,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
