import { NextResponse } from "next/server";
import {
  deleteRideByManageToken,
  getRideByManageToken,
  updateRideByManageToken,
  type UpdateRideFields,
} from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * /api/ride/manage/<token>
 * GET — fuvar adatai · PATCH — szerkesztés · DELETE — törlés.
 * Vendég-feladásnál nincs email — a tokent a feladás utáni success oldalon
 * kapja meg a feladó, és onnan tudja eltenni.
 */

export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const ride = await getRideByManageToken(params.token);
  if (!ride) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ ride }, { headers: { "cache-control": "no-store" } });
}

export async function PATCH(req: Request, { params }: { params: { token: string } }) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const fields: UpdateRideFields = {};
  const str = (v: unknown): string | null => {
    if (v === null) return null;
    if (typeof v !== "string") return undefined as never;
    const t = v.trim();
    return t.length === 0 ? null : t;
  };
  if ("departureTime" in body) {
    const t = str(body.departureTime);
    if (!t) return NextResponse.json({ error: "missing_time" }, { status: 400 });
    fields.departureTime = t;
  }
  if ("seats" in body) {
    const n = Number(body.seats);
    if (!Number.isInteger(n) || n < 1 || n > 8) {
      return NextResponse.json({ error: "invalid_seats" }, { status: 400 });
    }
    fields.seats = n;
  }
  if ("priceText" in body) fields.priceText = str(body.priceText);
  if ("contactPhone" in body) {
    const t = str(body.contactPhone);
    if (!t) return NextResponse.json({ error: "missing_phone" }, { status: 400 });
    fields.contactPhone = t;
  }
  if ("notes" in body) fields.notes = str(body.notes);

  const ok = await updateRideByManageToken(params.token, fields);
  if (!ok) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const updated = await getRideByManageToken(params.token);
  return NextResponse.json({ ride: updated }, { headers: { "cache-control": "no-store" } });
}

export async function DELETE(_req: Request, { params }: { params: { token: string } }) {
  const ok = await deleteRideByManageToken(params.token);
  if (!ok) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}
