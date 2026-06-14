import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin";
import { notifyCanton } from "@/lib/push-notify";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/push/notify — ADMIN-only. Push-értesítés kiküldése a feliratkozóknak.
 * Body: { cantonCode?: string }  — ha megadod, csak az adott kanton (+ az
 * „egész Svájc" feliratkozói) kapják; egyébként mindenki (broadcast).
 *
 * A push payload nélküli (a service worker általános „új esemény" értesítést
 * mutat), a célzás itt, szerver-oldalon történik.
 */
export async function POST(req: Request) {
  const adminId = await getAdminUserId();
  if (!adminId) {
    return NextResponse.json({ error: "Csak admin." }, { status: 403 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    /* üres body = broadcast */
  }
  const cantonCode = typeof body.cantonCode === "string" && body.cantonCode !== "all"
    ? body.cantonCode
    : null;

  const result = await notifyCanton(cantonCode);

  return NextResponse.json(
    { ok: true, ...result },
    { headers: { "cache-control": "no-store" } },
  );
}
