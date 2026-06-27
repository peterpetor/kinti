import { NextResponse, type NextRequest } from "next/server";
import { addPresencePing, getPresenceCounts, countPresenceByIpToday } from "@/lib/repo-presence";
import { verifyTurnstile } from "@/lib/turnstile";
import { checkBlocklistOrReject } from "@/lib/blocklist-guard";
import { hashIp } from "@/lib/security";
import { isValidCountry } from "@/lib/countries";
import { getRegion } from "@/lib/regions";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/** Háztartás-barát napi plafon ip_hash-enként (a localStorage a per-személy gát). */
const DAILY_IP_LIMIT = 5;

/**
 * GET /api/presence?country=CH — régiónkénti anonim jelenlét-darabszám + összesen.
 * A számok „puhák" (a UI „legalább X"-et ír), de rate-limit + Turnstile védi.
 */
export async function GET(req: NextRequest) {
  const c = req.nextUrl.searchParams.get("country");
  const country = isValidCountry(c) ? c : "CH";
  const rows = await getPresenceCounts(country);
  const total = rows.reduce((s, r) => s + r.n, 0);
  const map: Record<string, number> = {};
  const recent: Record<string, number> = {};
  for (const r of rows) { map[r.regionCode] = r.n; recent[r.regionCode] = r.recent; }
  return NextResponse.json(
    { country, counts: map, recent, total },
    { headers: { "cache-control": "public, max-age=60" } },
  );
}

/**
 * POST /api/presence — egy anonim jelenlét-ping.
 * Body: { country, regionCode, turnstileToken }. NINCS account/email; az ip_hash
 * csak rate-limit (nem identitás).
 */
export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 });
  }

  const country = typeof body.country === "string" ? body.country : "";
  const regionCode = typeof body.regionCode === "string" ? body.regionCode.trim().slice(0, 8) : "";
  const turnstileToken = typeof body.turnstileToken === "string" ? body.turnstileToken : null;

  if (!isValidCountry(country)) {
    return NextResponse.json({ error: "Ismeretlen ország." }, { status: 400 });
  }
  if (!getRegion(country, regionCode)) {
    return NextResponse.json({ error: "Válassz régiót." }, { status: 400 });
  }

  const ip = req.headers.get("cf-connecting-ip") ?? null;
  const captcha = await verifyTurnstile(turnstileToken, ip);
  if (!captcha.ok) {
    return NextResponse.json({ error: "A robot-ellenőrzés sikertelen." }, { status: 400 });
  }

  const banned = await checkBlocklistOrReject({ ip, email: null });
  if (banned) return banned;

  const ipHash = await hashIp(ip);
  const dayCount = await countPresenceByIpToday(ipHash);
  if (dayCount >= DAILY_IP_LIMIT) {
    return NextResponse.json(
      { error: "Erről a hálózatról ma már többször bejelentkeztek. Köszönjük!" },
      { status: 429 },
    );
  }

  await addPresencePing({ id: crypto.randomUUID(), country, regionCode, ipHash: ipHash ?? "unknown-ip" });

  // A friss összesítés rögtön vissza, hogy a UI azonnal frissülhessen.
  const rows = await getPresenceCounts(country);
  const total = rows.reduce((s, r) => s + r.n, 0);
  const map: Record<string, number> = {};
  const recent: Record<string, number> = {};
  for (const r of rows) { map[r.regionCode] = r.n; recent[r.regionCode] = r.recent; }
  return NextResponse.json({ ok: true, country, counts: map, recent, total });
}
