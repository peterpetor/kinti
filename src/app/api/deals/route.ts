import { NextResponse } from "next/server";
import {
  createDealReport,
  getActiveDealReports,
  countRecentDealReports,
} from "@/lib/repo";
import { verifyTurnstile } from "@/lib/turnstile";
import { checkBlocklistOrReject } from "@/lib/blocklist-guard";
import { hashIp } from "@/lib/bulletin";
import { containsProfanity } from "@/lib/profanity";
import {
  getStoreById,
  getCategoryById,
  DEAL_DISCOUNTS,
  todayMidnightCh,
} from "@/lib/deals";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/** GET /api/deals — aktív (nem lejárt) akciók. */
export async function GET() {
  const reports = await getActiveDealReports();
  return NextResponse.json(reports, {
    headers: { "cache-control": "public, max-age=60" },
  });
}

/**
 * POST /api/deals — új akció-jelentés.
 *
 * Mezők: storeId, categoryId, discountPct, lat, lng, locationName (opc.),
 * cantonCode (opc.), note (opc., max 100 chars).
 * Anti-spam: 5/IP/óra.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 });
  }

  const storeId = typeof body.storeId === "string" ? body.storeId : "";
  const categoryId = typeof body.categoryId === "string" ? body.categoryId : "";
  const discountPct = typeof body.discountPct === "number" ? body.discountPct : NaN;
  const lat = typeof body.lat === "number" ? body.lat : NaN;
  const lng = typeof body.lng === "number" ? body.lng : NaN;
  const locationName =
    typeof body.locationName === "string" ? body.locationName.trim().slice(0, 80) : "";
  const cantonCode =
    typeof body.cantonCode === "string" ? body.cantonCode.trim().slice(0, 4) : "";
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 100) : "";
  const turnstileToken =
    typeof body.turnstileToken === "string" ? body.turnstileToken : null;

  if (!getStoreById(storeId)) {
    return NextResponse.json({ error: "Ismeretlen bolt." }, { status: 400 });
  }
  if (!getCategoryById(categoryId)) {
    return NextResponse.json({ error: "Ismeretlen kategória." }, { status: 400 });
  }
  if (!DEAL_DISCOUNTS.includes(discountPct as (typeof DEAL_DISCOUNTS)[number])) {
    return NextResponse.json({ error: "Érvénytelen kedvezmény." }, { status: 400 });
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
  const recent = await countRecentDealReports(ipHash);
  if (recent >= 5) {
    return NextResponse.json(
      { error: "Túl sok bejelentés egy óra alatt. Próbáld újra később." },
      { status: 429 },
    );
  }

  // Profanity-szűrő a note mezőre
  if (note && containsProfanity(note).hit) {
    return NextResponse.json(
      { error: "A megjegyzésed nem megfelelő szavakat tartalmaz. Fogalmazd meg másképp." },
      { status: 400 },
    );
  }

  const id = crypto.randomUUID();

  await createDealReport({
    id,
    storeId,
    categoryId,
    discountPct,
    lat,
    lng,
    locationName: locationName || null,
    cantonCode: cantonCode || null,
    note: note || null,
    ipHash,
    expiresAt: todayMidnightCh(),
  });

  return NextResponse.json(
    { ok: true, id },
    { headers: { "cache-control": "no-store" } },
  );
}
