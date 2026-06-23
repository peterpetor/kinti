/**
 * chw-events.ts — Collegium Hungaricum Wien (Magyar Kulturális Intézet, Bécs)
 * valós esemény-forrása az osztrák Közösség-oldalhoz.
 *
 * A culture.hu (Liszt Intézet-hálózat) PUBLIKUS JSON API-ját használjuk — nem
 * HTML-scraping, hanem hivatalos, strukturált végpont. Idempotens szinkron a
 * `CHW_SOURCE` forrással; az események country_code='AT'-vel kerülnek be.
 */

import { huDateParts } from "./ical";

/** Magyar Kulturális Intézet Bécs (CHW) intézet-UUID a culture.hu API-ban. */
const CHW_INSTITUTE = "1762130a-9cc1-413f-907b-9b372c738523";
export const CHW_SOURCE = "chw:wien";

export interface ChwMappedEvent {
  id: string;
  title: string;
  description: string;
  eventDate: string;        // YYYY-MM-DD
  startTime: string | null; // HH:MM
  dateDay: string;
  dateMonth: string;
  dateWeekday: string;
  venue: string;
  tag: string;
  color: string;
}

interface ChwApiEvent {
  uuid?: string;
  title?: string | null;
  subtitle?: string | null;
  status?: {
    eventDateFrom?: string | null;
    isHidden?: boolean;
    isDeleted?: boolean;
    isActive?: boolean;
  };
  relation?: { primaryTag?: { text?: string | null; backgroundColor?: string | null } | null };
  locDateTime?: Array<{ locationAddress?: string | null }> | null;
}

/**
 * A következő ~6 hónap CHW-eseményeit kéri le a publikus API-ból, és Kinti-
 * esemény-rekordokká alakítja. Hiba esetén üres tömb (sosem dob).
 */
export async function fetchChwEvents(now: Date = new Date()): Promise<ChwMappedEvent[]> {
  const from = `${now.toISOString().slice(0, 10)} 00:00:00`;
  const end = new Date(now);
  end.setMonth(end.getMonth() + 6);
  const to = `${end.toISOString().slice(0, 10)} 23:59:59`;

  const url =
    `https://culture.hu/publicapi/hu/institute/${CHW_INSTITUTE}/pages/event/with-extra-info` +
    `?listingInfo&eventDateGt=${encodeURIComponent(from)}&eventDateLt=${encodeURIComponent(to)}`;

  let data: ChwApiEvent[];
  try {
    const res = await fetch(url, {
      // Edge-cache: óránként frissítjük (kíméli a külső API-t).
      cf: { cacheTtl: 3600, cacheEverything: true },
      // Időkorlát: a render-úton (inline) await-elhető legyen anélkül, hogy beragadna.
      signal: AbortSignal.timeout(6000),
    } as RequestInit);
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: ChwApiEvent[] };
    data = json.data ?? [];
  } catch {
    return [];
  }

  const out: ChwMappedEvent[] = [];
  for (const ev of data) {
    const st = ev.status;
    const from = st?.eventDateFrom;
    if (!ev.uuid || !ev.title || !from) continue;
    if (st?.isHidden || st?.isDeleted || st?.isActive === false) continue;

    const eventDate = from.slice(0, 10); // "2026-06-24"
    if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) continue;
    const hhmm = from.slice(11, 16); // "16:00"
    const startTime = /^\d{2}:\d{2}$/.test(hhmm) && hhmm !== "00:00" ? hhmm : null;
    const { day, month, weekday } = huDateParts(eventDate);
    const addr = ev.locDateTime?.[0]?.locationAddress?.trim();
    const subtitle = ev.subtitle?.trim();

    out.push({
      id: `chw-${ev.uuid}`,
      title: ev.title.trim(),
      description: [subtitle, "Collegium Hungaricum Wien (Magyar Kulturális Intézet, Bécs) programja."]
        .filter(Boolean)
        .join(" — "),
      eventDate,
      startTime,
      dateDay: day,
      dateMonth: month,
      dateWeekday: weekday,
      venue: addr || "Collegium Hungaricum, Bécs",
      tag: "Kultúra · CHW",
      color: ev.relation?.primaryTag?.backgroundColor || "#c8a24a",
    });
  }
  return out;
}
