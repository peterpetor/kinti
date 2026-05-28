import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin";
import { deleteRideById } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/** DELETE /api/admin/rides/[id] — admin törli a telekocsi-hirdetést. */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const adminId = await getAdminUserId();
  if (!adminId) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const ok = await deleteRideById(params.id);
  return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
}
