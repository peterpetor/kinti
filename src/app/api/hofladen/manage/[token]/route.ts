import { NextResponse } from "next/server";
import { deleteHofladenSpotByManageToken } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/** DELETE /api/hofladen/manage/<token> — törlés a feladó manage-tokenjével. */
export async function DELETE(_req: Request, { params }: { params: { token: string } }) {
  const ok = await deleteHofladenSpotByManageToken(params.token);
  if (!ok) {
    return NextResponse.json({ error: "Nem található ez a poszt." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
