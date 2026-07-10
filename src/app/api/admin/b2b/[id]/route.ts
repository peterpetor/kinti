import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin";
import { deleteB2bProjectAsAdmin } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/** DELETE /api/admin/b2b/[id] — admin (moderáció) törli a B2B projektet. */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const adminId = await getAdminUserId();
  if (!adminId) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const ok = await deleteB2bProjectAsAdmin(params.id);
  return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
}
