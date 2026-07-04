import { NextResponse } from "next/server";
import { getEventById, createEventReminder, countRecentSpamLog, logSpamSubmit } from "@/lib/repo";
import { getClientIp, hashIp } from "@/lib/security";
import { swissLocalToUtc } from "@/lib/swiss-time";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/events/<id>/reminder — push-emlékeztető kérése egy eseményre.
 *
 * Body: { endpoint: string }  (a böngésző már meglévő push-feliratkozása)
 *
 * Két emlékeztető készül: az esemény kezdés előtt 24 órával ÉS 1 órával
 * (Europe/Zurich → UTC). Best-effort, account nélkül: ha az endpointhoz nincs
 * élő feliratkozás, a cron egyszerűen kihagyja. Lejárt eseményre nem rögzítünk;
 * a már elmúlt lead-ablakot kihagyjuk (pl. ha holnaputáni helyett ma RSVP-zik
 * egy 2 óra múlva kezdődő eseményre, csak az 1h emlékeztető jön létre).
 */
const REMINDER_LEADS_MIN = [1440, 60]; // 24 óra és 1 óra (perc)

/** Napi keret / IP — szkriptelt event_reminders-árasztás ellen. */
const REMINDER_DAILY_LIMIT = 20;

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const ipHash = await hashIp(getClientIp(req));
  const recent = await countRecentSpamLog("event-reminder", ipHash, 24 * 60);
  if (recent >= REMINDER_DAILY_LIMIT) {
    return NextResponse.json({ error: "Napi limit elérve — próbáld holnap." }, { status: 429 });
  }

  let body: { endpoint?: unknown } = {};
  try {
    body = (await req.json()) as { endpoint?: unknown };
  } catch {
    return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 });
  }

  const endpoint = typeof body.endpoint === "string" ? body.endpoint.trim() : "";
  if (!/^https:\/\//.test(endpoint)) {
    return NextResponse.json({ error: "Hiányzó vagy érvénytelen endpoint." }, { status: 400 });
  }

  const event = await getEventById(params.id);
  if (!event) {
    return NextResponse.json({ error: "Ismeretlen esemény." }, { status: 404 });
  }

  const startUtc = swissLocalToUtc(event.eventDate, event.startTime);
  if (!startUtc) {
    // Nincs értelmezhető dátum → nem tudunk emlékeztetni, de nem hiba.
    return NextResponse.json({ ok: true, scheduled: false });
  }

  // Múltbeli esemény → nincs emlékeztető.
  if (startUtc.getTime() <= Date.now()) {
    return NextResponse.json({ ok: true, scheduled: false });
  }

  const now = Date.now();
  let scheduled = 0;
  for (const leadMinutes of REMINDER_LEADS_MIN) {
    const remindMs = startUtc.getTime() - leadMinutes * 60 * 1000;
    if (remindMs <= now) continue; // ez a lead-ablak már elmúlt
    await createEventReminder({
      id: crypto.randomUUID(),
      eventId: event.id,
      pushEndpoint: endpoint,
      remindAt: new Date(remindMs).toISOString(),
      leadMinutes,
    });
    scheduled++;
  }

  // Csak a tényleg létrehozott emlékeztető fogyasztja a keretet.
  if (scheduled > 0) logSpamSubmit("event-reminder", ipHash).catch(() => { /* silent */ });

  return NextResponse.json(
    { ok: true, scheduled: scheduled > 0, count: scheduled },
    { headers: { "cache-control": "no-store" } },
  );
}
