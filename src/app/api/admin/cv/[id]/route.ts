import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin";
import { deleteCvSubmissionAsAdmin } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/** DELETE /api/admin/cv/[id] — admin/GDPR törli a mentett önéletrajz-profilt. */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const adminId = await getAdminUserId();
  if (!adminId) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const ok = await deleteCvSubmissionAsAdmin(params.id);
  return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
}
