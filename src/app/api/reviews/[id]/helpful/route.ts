import { NextResponse } from "next/server";
import { addReviewHelpful } from "@/lib/repo";
import { hashIp } from "@/lib/security";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/reviews/<id>/helpful — „Hasznos volt" szavazás (account NÉLKÜL).
 *
 * 1 IP = 1 szavazat / vélemény (SHA-256(IP) dedup, mint az esemény-RSVP).
 * A nyers IP-t nem tároljuk. Visszaadja a frissített összesített számot, és
 * hogy most került-e be (added=false → már szavazott erről az IP-ről).
 */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const ip = _req.headers.get("cf-connecting-ip") ?? null;
  const ipHash = await hashIp(ip);
  if (!ipHash) {
    return NextResponse.json(
      { error: "Nem azonosítható a kérés forrása." },
      { status: 400 },
    );
  }

  const result = await addReviewHelpful(params.id, ipHash);
  if (!result.ok) {
    return NextResponse.json({ error: "Ismeretlen vélemény." }, { status: 404 });
  }

  return NextResponse.json(
    { ok: true, added: result.added, total: result.total },
    { headers: { "cache-control": "no-store" } },
  );
}
