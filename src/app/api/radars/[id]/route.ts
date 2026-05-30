import { NextResponse } from "next/server";
import { deleteRadar } from "@/lib/repo";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const endpoint = typeof body.endpoint === "string" ? body.endpoint : "";

    if (!endpoint) {
      return NextResponse.json({ error: "Hiányzó endpoint." }, { status: 400 });
    }

    const success = await deleteRadar(params.id, endpoint);
    if (!success) {
      return NextResponse.json({ error: "Nem található vagy nincs jogosultságod." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    safeLogError("api/radars/[id]/DELETE", err);
    return NextResponse.json({ error: "Belső hiba a törlés során." }, { status: 500 });
  }
}
