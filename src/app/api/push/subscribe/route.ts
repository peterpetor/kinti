import { NextResponse } from "next/server";
import { savePushSubscription } from "@/lib/repo";
import { CANTON_COORDS } from "@/lib/cantons";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/push/subscribe — Web Push feliratkozás mentése (account nélkül).
 * Body: { subscription: { endpoint, keys: { p256dh, auth } }, cantonCode }
 *   cantonCode: kanton-kód vagy "all"/üres (= egész Svájc → NULL).
 */
export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 });
  }

  const sub = body.subscription as
    | { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } }
    | undefined;
  const endpoint = typeof sub?.endpoint === "string" ? sub.endpoint : "";
  const p256dh = typeof sub?.keys?.p256dh === "string" ? sub.keys.p256dh : "";
  const auth = typeof sub?.keys?.auth === "string" ? sub.keys.auth : "";

  if (!/^https:\/\//.test(endpoint) || !p256dh || !auth) {
    return NextResponse.json({ error: "Hiányos feliratkozás." }, { status: 400 });
  }

  const rawCanton = typeof body.cantonCode === "string" ? body.cantonCode : "";
  const cantonCode = rawCanton && rawCanton !== "all" && CANTON_COORDS[rawCanton] ? rawCanton : null;

  await savePushSubscription({
    id: crypto.randomUUID(),
    endpoint,
    p256dh,
    auth,
    cantonCode,
  });

  return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}
