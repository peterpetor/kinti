import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin";
import { deleteBulletinPostById } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/** DELETE /api/admin/bulletins/[id] — admin törli a hirdetést. */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const adminId = await getAdminUserId();
  if (!adminId) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const ok = await deleteBulletinPostById(params.id);
  return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
}
