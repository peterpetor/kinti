import { NextResponse } from "next/server";
import {
  deleteEventByManageToken,
  getEventByManageToken,
  updateEventByManageToken,
  type UpdateEventFields,
} from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * /api/event/manage/<token>
 * GET — esemény adatai · PATCH — szerkesztés · DELETE — törlés.
 * Auth nincs — a token (122 bit) maga a bizonyíték (manage URL az emailben).
 */

export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const event = await getEventByManageToken(params.token);
  if (!event) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ event }, { headers: { "cache-control": "no-store" } });
}

export async function PATCH(req: Request, { params }: { params: { token: string } }) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const fields: UpdateEventFields = {};
  const str = (v: unknown): string | null => {
    if (v === null) return null;
    if (typeof v !== "string") return undefined as never;
    const t = v.trim();
    return t.length === 0 ? null : t;
  };
  if ("title" in body) {
    const t = str(body.title);
    if (!t || t.length < 3) {
      return NextResponse.json({ error: "title_too_short" }, { status: 400 });
    }
    fields.title = t;
  }
  if ("venue" in body) fields.venue = str(body.venue);
  if ("description" in body) fields.description = str(body.description);
  if ("startTime" in body) fields.startTime = str(body.startTime);

  const ok = await updateEventByManageToken(params.token, fields);
  if (!ok) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const updated = await getEventByManageToken(params.token);
  return NextResponse.json({ event: updated }, { headers: { "cache-control": "no-store" } });
}

export async function DELETE(_req: Request, { params }: { params: { token: string } }) {
  const ok = await deleteEventByManageToken(params.token);
  if (!ok) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}
