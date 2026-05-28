import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin";
import { deleteEvent } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/** DELETE /api/admin/events/[id] — admin törli az eseményt. */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const adminId = await getAdminUserId();
  if (!adminId) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const ok = await deleteEvent(params.id);
  return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
}
