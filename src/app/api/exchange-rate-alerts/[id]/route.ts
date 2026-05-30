import { NextResponse } from "next/server";
import { deleteExchangeRateAlert } from "@/lib/repo";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * DELETE /api/exchange-rate-alerts/[id]
 *
 * Body: { endpoint: string }  (a kliens saját push-endpoint-ja).
 *
 * Csak az tudja törölni, akinek az endpoint-ja egyezik a tárolt rekorddal.
 */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const body = (await req.json().catch(() => ({}))) as { endpoint?: string };
    const endpoint = typeof body.endpoint === "string" ? body.endpoint : "";
    if (!endpoint || !params.id) {
      return NextResponse.json({ error: "Hiányos kérés." }, { status: 400 });
    }
    const ok = await deleteExchangeRateAlert(params.id, endpoint);
    if (!ok) {
      return NextResponse.json(
        { error: "Nincs ilyen riasztó vagy nincs jogosultságod." },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    safeLogError("api/exchange-rate-alerts/DELETE", err);
    return NextResponse.json({ error: "Belső hiba." }, { status: 500 });
  }
}
