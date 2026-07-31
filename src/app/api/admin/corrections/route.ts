import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin";
import { resolveCorrection } from "@/lib/repo-corrections";
import { logAdminAction } from "@/lib/audit";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/corrections — egy „Javíts rajta" javaslat lezárása.
 * Body: { id, action: "applied" | "rejected" }
 *
 * ⚠️ Ez CSAK a javaslat állapotát zárja le — a tényleges adatot az admin a
 * szokásos cég-szerkesztőn vezeti át. Szándékosan nincs „egy kattintással
 * beírom a publikus adatba" út: az egy nyílt űrlapból érkező értéket tenne
 * ellenőrzés nélkül a szaknévsorba.
 */
export async function POST(req: Request) {
  const adminId = await getAdminUserId();
  if (!adminId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  try {
    const body = (await req.json().catch(() => ({}))) as { id?: string; action?: string };
    const id = typeof body.id === "string" ? body.id.trim() : "";
    const action = body.action === "applied" || body.action === "rejected" ? body.action : null;
    if (!id || !action) {
      return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    }

    await resolveCorrection(id, action, adminId);
    await logAdminAction({
      adminUserId: adminId,
      actionType: action === "applied" ? "approve" : "reject",
      targetType: "business_correction",
      targetId: id,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    safeLogError("admin/corrections", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
