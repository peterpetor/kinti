import { NextResponse } from "next/server";
import { addEventRsvp } from "@/lib/repo";
import { hashIp } from "@/lib/security";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/events/<id>/rsvp — „Megyek" szavazás (account NÉLKÜL).
 *
 * 1 IP = 1 RSVP / esemény (SHA-256(IP) dedup). A nyers IP-t nem tároljuk.
 * Visszaadja a frissített összesített létszámot, és hogy most került-e be
 * (added=false → már szavazott erről az IP-ről).
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const ip = req.headers.get("cf-connecting-ip") ?? null;
  const ipHash = await hashIp(ip);
  if (!ipHash) {
    return NextResponse.json(
      { error: "Nem azonosítható a kérés forrása." },
      { status: 400 },
    );
  }

  const result = await addEventRsvp(params.id, ipHash);
  if (!result.ok) {
    return NextResponse.json({ error: "Ismeretlen esemény." }, { status: 404 });
  }

  return NextResponse.json(
    { ok: true, added: result.added, total: result.total },
    { headers: { "cache-control": "no-store" } },
  );
}
