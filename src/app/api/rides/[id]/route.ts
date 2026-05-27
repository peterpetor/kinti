import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { deleteRideByOwner, deleteRideById } from "@/lib/repo";
import { getAdminUserId } from "@/lib/admin";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * DELETE /api/rides/[id] — a fuvar törlése. Csak a feladó (poster_user_id) vagy
 * admin teheti meg (pl. ha megtelt az autó).
 */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Bejelentkezés szükséges." }, { status: 401 });
  }

  // Először tulajdonosként próbáljuk (csak a sajátját törölheti).
  if (await deleteRideByOwner(params.id, userId)) {
    return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
  }

  // Különben: admin törölhet bármit.
  if (await getAdminUserId()) {
    const ok = await deleteRideById(params.id);
    return NextResponse.json({ ok }, { status: ok ? 200 : 404, headers: { "cache-control": "no-store" } });
  }

  return NextResponse.json({ error: "Nincs jogosultság." }, { status: 403 });
}
