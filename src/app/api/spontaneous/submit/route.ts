import { NextResponse } from "next/server";
import {
  createSpontaneous,
  countRecentSpontaneous,
} from "@/lib/repo";
import { verifyTurnstile } from "@/lib/turnstile";
import { checkBlocklistOrReject } from "@/lib/blocklist-guard";
import {
  validateSpontaneousInput,
  computeSpontaneousExpiry,
} from "@/lib/spontaneous";
import { hashIp } from "@/lib/bulletin";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/spontaneous/submit  — új spontán mikro-esemény (24-48h TTL).
 *
 * Zéró-relay: a kontakt-szám a feladó saját telefonszáma. Email NEM kérünk.
 * Rate-limit: 5 spontán / 24h / IP.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 });
  }

  const validation = validateSpontaneousInput(body);
  if (!validation.ok) {
    return NextResponse.json(
      { error: "Hibás bemenet.", details: validation.errors },
      { status: 400 },
    );
  }

  const turnstileToken =
    typeof body.turnstileToken === "string" ? body.turnstileToken : null;
  const ip = req.headers.get("cf-connecting-ip") ?? null;
  const captcha = await verifyTurnstile(turnstileToken, ip);
  if (!captcha.ok) {
    return NextResponse.json(
      { error: "A robot-ellenőrzés sikertelen. Próbáld újra." },
      { status: 400 },
    );
  }

  const banned = await checkBlocklistOrReject({ ip, email: null });
  if (banned) return banned;

  const ipHash = await hashIp(ip);
  const recent = await countRecentSpontaneous(ipHash);
  if (recent >= 5) {
    return NextResponse.json(
      { error: "Napi limit: 5 spontán-poszt / IP." },
      { status: 429 },
    );
  }

  const id = crypto.randomUUID();
  const manageToken = crypto.randomUUID().replace(/-/g, "");

  await createSpontaneous({
    id,
    title: validation.value.title,
    locationName: validation.value.locationName,
    cantonCode: validation.value.cantonCode,
    lat: null,
    lng: null,
    meetupTime: validation.value.meetupTime,
    maxPeople: validation.value.maxPeople,
    contactPhone: validation.value.contactPhone,
    contactWhatsapp: validation.value.contactWhatsapp,
    poster: validation.value.poster,
    notes: validation.value.notes,
    manageToken,
    expiresAt: computeSpontaneousExpiry(validation.value.meetupTime),
    ipHash,
  });

  return NextResponse.json(
    {
      ok: true,
      id,
      manageToken,
      manageUrl: `/spontan-kezeles/${manageToken}`,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
