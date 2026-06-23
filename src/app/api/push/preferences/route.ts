import { NextResponse } from "next/server";
import { getPushPreferences, updatePushPreferences } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET  /api/push/preferences?endpoint=... — a kanton-push kategória-preferenciái.
 * PATCH /api/push/preferences — { endpoint, notifyBusiness, notifyEvent, notifyJob } frissítés.
 *
 * A feliratkozást az endpoint azonosítja (a böngésző push-feliratkozása); nincs
 * account. Csak a saját endpointját tudja módosítani, aki birtokolja.
 */
export async function GET(req: Request) {
  const endpoint = new URL(req.url).searchParams.get("endpoint")?.trim() ?? "";
  if (!/^https:\/\//.test(endpoint)) {
    return NextResponse.json({ error: "Hiányzó endpoint." }, { status: 400 });
  }
  const prefs = await getPushPreferences(endpoint);
  return NextResponse.json(
    { subscribed: !!prefs, preferences: prefs ?? { notifyBusiness: true, notifyEvent: true, notifyJob: true, notifyDaily: true } },
    { headers: { "cache-control": "no-store" } },
  );
}

export async function PATCH(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    endpoint?: string; notifyBusiness?: boolean; notifyEvent?: boolean; notifyJob?: boolean; notifyDaily?: boolean;
  };
  const endpoint = typeof body.endpoint === "string" ? body.endpoint.trim() : "";
  if (!/^https:\/\//.test(endpoint)) {
    return NextResponse.json({ error: "Hiányzó endpoint." }, { status: 400 });
  }
  const ok = await updatePushPreferences(endpoint, {
    notifyBusiness: body.notifyBusiness !== false,
    notifyEvent: body.notifyEvent !== false,
    notifyJob: body.notifyJob !== false,
    notifyDaily: body.notifyDaily !== false,
  });
  if (!ok) {
    return NextResponse.json({ error: "Nincs ilyen feliratkozás." }, { status: 404 });
  }
  return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}
