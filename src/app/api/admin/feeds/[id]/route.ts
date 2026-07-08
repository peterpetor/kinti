import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin";
import { deleteEventFeed, updateEventFeed } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/** PATCH /api/admin/feeds/:id — { enabled?: boolean, label?: string | null } */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const adminId = await getAdminUserId();
  if (!adminId) return forbidden();

  let body: { enabled?: unknown; label?: unknown; country?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 });
  }
  const patch: { enabled?: boolean; label?: string | null; country?: string } = {};
  if (typeof body.enabled === "boolean") patch.enabled = body.enabled;
  if (typeof body.label === "string") patch.label = body.label.trim() || null;
  if (body.label === null) patch.label = null;
  if (typeof body.country === "string") patch.country = body.country;

  const ok = await updateEventFeed(params.id, patch);
  return ok
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: "Nem találtuk a feed-et." }, { status: 404 });
}

/** DELETE /api/admin/feeds/:id — törli a feed-et + a hozzá tartozó eseményeket. */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const adminId = await getAdminUserId();
  if (!adminId) return forbidden();
  const ok = await deleteEventFeed(params.id);
  return ok
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: "Nem találtuk a feed-et." }, { status: 404 });
}

function forbidden() {
  return NextResponse.json(
    { error: "Csak admin felhasználó férhet hozzá." },
    { status: 403 },
  );
}
