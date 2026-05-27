import { NextResponse } from "next/server";
import { deletePushSubscription } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/** POST /api/push/unsubscribe — Body: { endpoint } */
export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 });
  }

  const endpoint = typeof body.endpoint === "string" ? body.endpoint : "";
  if (!endpoint) {
    return NextResponse.json({ error: "Hiányzó endpoint." }, { status: 400 });
  }

  await deletePushSubscription(endpoint);
  return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}
