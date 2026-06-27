import { NextResponse, type NextRequest } from "next/server";
import { addReferralConversion, getReferralCount, countReferralByIpToday } from "@/lib/repo-referral";
import { hashIp } from "@/lib/security";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const CODE_RE = /^[a-z0-9]{4,16}$/i;
const DAILY_IP_CAP = 10; // egy hálózat naponta legfeljebb ennyi konverziót válthat ki (sok kód felfújása ellen)

/** GET /api/referral?code=abc123 — a kód anonim konverziószáma (a meghívó kitűzőjéhez). */
export async function GET(req: NextRequest) {
  const code = (req.nextUrl.searchParams.get("code") ?? "").trim();
  if (!CODE_RE.test(code)) return NextResponse.json({ count: 0 });
  const count = await getReferralCount(code);
  return NextResponse.json({ count }, { headers: { "cache-control": "no-store" } });
}

/**
 * POST /api/referral — egy anonim konverzió rögzítése a meghívó kódjához.
 * Body: { code, self? }. NINCS account/identitás; az ip_hash csak dedup/rate-limit.
 * Önmeghívás (self === code) NEM számít. A (code, ip_hash) páros egyszer számít.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 }); }

  const code = typeof body.code === "string" ? body.code.trim() : "";
  const self = typeof body.self === "string" ? body.self.trim() : "";
  if (!CODE_RE.test(code)) return NextResponse.json({ error: "Érvénytelen kód." }, { status: 400 });
  // Önmeghívás: ne számítson (nem hiba — a meghívott = a meghívó ugyanaz a böngésző).
  if (self && self.toLowerCase() === code.toLowerCase()) {
    return NextResponse.json({ ok: false, reason: "self", count: await getReferralCount(code) });
  }

  const ipHash = await hashIp(req.headers.get("cf-connecting-ip"));
  if ((await countReferralByIpToday(ipHash)) >= DAILY_IP_CAP) {
    return NextResponse.json({ ok: false, reason: "rate", count: await getReferralCount(code) });
  }

  const added = await addReferralConversion({ id: crypto.randomUUID(), code, ipHash: ipHash ?? "unknown-ip" });
  return NextResponse.json({ ok: added, count: await getReferralCount(code) });
}
