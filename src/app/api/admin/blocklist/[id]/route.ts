import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin";
import { deactivateBlocklistEntry } from "@/lib/repo";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * DELETE /api/admin/blocklist/[id]
 *
 * Soft-delete: active=0 (a rekord megmarad audit-trail-ként, de a
 * tiltó-check már nem találja).
 */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const adminId = await getAdminUserId();
  if (!adminId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  try {
    const ok = await deactivateBlocklistEntry(params.id);
    return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
  } catch (err) {
    safeLogError("api/admin/blocklist/DELETE", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
