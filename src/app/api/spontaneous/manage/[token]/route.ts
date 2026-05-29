import { NextResponse } from "next/server";
import { deleteSpontaneousByManageToken } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * DELETE /api/spontaneous/manage/<token>  — törlés a feladó manage-tokenjével.
 *
 * Auth nincs — a token MAGA a bizonyíték (UUID, brute-force-hatatlan).
 */
export async function DELETE(_req: Request, { params }: { params: { token: string } }) {
  const ok = await deleteSpontaneousByManageToken(params.token);
  if (!ok) {
    return NextResponse.json({ error: "Nem található ez a poszt." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
