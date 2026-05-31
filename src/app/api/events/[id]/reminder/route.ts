import { NextResponse } from "next/server";
import { getEventById, createEventReminder } from "@/lib/repo";
import { swissLocalToUtc } from "@/lib/swiss-time";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/events/<id>/reminder — push-emlékeztető kérése egy eseményre.
 *
 * Body: { endpoint: string }  (a böngésző már meglévő push-feliratkozása)
 *
 * A reminder az esemény kezdés előtt 3 órára esedékes (Europe/Zurich → UTC).
 * Best-effort, account nélkül: ha az endpointhoz nincs élő feliratkozás, a
 * cron egyszerűen kihagyja. Lejárt eseményre nem rögzítünk.
 */
const REMINDER_LEAD_MS = 3 * 60 * 60 * 1000; // 3 óra

export async function POST(req: Request, { params }: { params: { id: string } }) {
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

  const remindAt = new Date(startUtc.getTime() - REMINDER_LEAD_MS).toISOString();

  await createEventReminder({
    id: crypto.randomUUID(),
    eventId: event.id,
    pushEndpoint: endpoint,
    remindAt,
  });

  return NextResponse.json(
    { ok: true, scheduled: true, remindAt },
    { headers: { "cache-control": "no-store" } },
  );
}
