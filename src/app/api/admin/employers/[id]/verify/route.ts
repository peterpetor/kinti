import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin";
import { setEmployerVerified } from "@/lib/repo";
import { logAdminAction } from "@/lib/audit";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/employers/:id/verify — a munkáltató „Hiteles cég" jelzésének
 * ki/be kapcsolása (admin). Body: { verified: boolean }.
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const adminId = await getAdminUserId();
  if (!adminId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as { verified?: unknown };
  const verified = body.verified === true;

  try {
    const ok = await setEmployerVerified(params.id, verified);
    if (!ok) {
      return NextResponse.json({ error: "A munkáltató nem található." }, { status: 404 });
    }
    await logAdminAction({
      adminUserId: adminId,
      actionType: "verify",
      targetType: "employers",
      targetId: params.id,
      reason: verified ? "Hiteles cég bekapcsolva" : "Hiteles cég kikapcsolva",
    });
    return NextResponse.json({ ok: true, verified });
  } catch (err) {
    safeLogError("admin/employers/verify", err);
    return NextResponse.json({ error: "Belső hiba." }, { status: 500 });
  }
}
