import { NextResponse } from "next/server";
import { addEventRsvp, countRecentSpamLog, logSpamSubmit } from "@/lib/repo";
import { getClientIp, hashIp } from "@/lib/security";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/** Napi keret: ennyi KÜLÖNBÖZŐ eseményre RSVP-zhet egy IP 24 óra alatt. */
const RSVP_DAILY_LIMIT = 30;

/**
 * POST /api/events/<id>/rsvp — „Megyek" szavazás (account NÉLKÜL).
 *
 * 1 IP = 1 RSVP / esemény (SHA-256(IP) dedup). A nyers IP-t nem tároljuk.
 * Emellé napi IP-keret (30/24h), hogy szkripttel se lehessen sok esemény
 * „megy"-számlálóját felfújni. Visszaadja a frissített összesített létszámot,
 * és hogy most került-e be (added=false → már szavazott erről az IP-ről).
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const ip = getClientIp(req);
  const ipHash = await hashIp(ip);
  if (!ipHash) {
    return NextResponse.json(
      { error: "Nem azonosítható a kérés forrása." },
      { status: 400 },
    );
  }

  const recent = await countRecentSpamLog("event-rsvp", ipHash, 24 * 60);
  if (recent >= RSVP_DAILY_LIMIT) {
    return NextResponse.json(
      { error: "Napi limit elérve — próbáld holnap." },
      { status: 429 },
    );
  }

  const result = await addEventRsvp(params.id, ipHash);
  if (!result.ok) {
    return NextResponse.json({ error: "Ismeretlen esemény." }, { status: 404 });
  }

  // Csak az ÚJ szavazat fogyasztja a keretet (ismételt koppintás nem).
  if (result.added) logSpamSubmit("event-rsvp", ipHash).catch(() => { /* silent */ });

  return NextResponse.json(
    { ok: true, added: result.added, total: result.total },
    { headers: { "cache-control": "no-store" } },
  );
}
