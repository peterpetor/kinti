/**
 * ical.ts — minimál, függőség-mentes iCal (RFC 5545) parser az esemény-feed
 * szinkronhoz. Csak a megjelenítéshez kellő mezőket olvassa ki, és pragmatikus
 * a szélső esetekkel (a magyar közösségi naptárak jellemzően Google Calendar
 * exportok, TZID=Europe/Zurich helyi idővel).
 */

export interface IcalEvent {
  uid: string;
  summary: string;
  /** Kezdő dátum 'YYYY-MM-DD' (Európa/Zürich szerint). */
  dateISO: string;
  /** Kezdő időpont 'HH:MM' vagy null (egész napos). */
  startTime: string | null;
  location: string | null;
  description: string | null;
}

/** RFC 5545 sor-kibontás: a CRLF + szóköz/tab a folytatás. */
function unfold(text: string): string {
  return text.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "");
}

function unescapeText(s: string): string {
  return s
    .replace(/\\n/gi, " ")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\")
    .trim();
}

const HU_MONTHS = ["JAN", "FEB", "MÁR", "ÁPR", "MÁJ", "JÚN", "JÚL", "AUG", "SZEP", "OKT", "NOV", "DEC"];
const HU_WEEKDAYS = ["vasárnap", "hétfő", "kedd", "szerda", "csütörtök", "péntek", "szombat"];

/** 'YYYY-MM-DD' → magyar megjelenítő dátum-részek a kártyához. */
export function huDateParts(dateISO: string): { day: string; month: string; weekday: string } {
  const [y, m, d] = dateISO.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return { day: String(d), month: HU_MONTHS[(m - 1) % 12] ?? "", weekday: HU_WEEKDAYS[dt.getUTCDay()] ?? "" };
}

/**
 * DTSTART/DTEND érték → { dateISO, time } Európa/Zürich szerint.
 *  - "20260613"                  → egész napos (time = null)
 *  - "20260613T180000"           → helyi idő (TZID), as-is
 *  - "20260613T160000Z"          → UTC → Zürich (DST-helyesen, Intl-lel)
 */
function parseDt(value: string, isUtc: boolean): { dateISO: string; time: string | null } | null {
  const m = value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?)?/);
  if (!m) return null;
  const [, y, mo, d, hh, mm] = m;
  if (!hh || !mm) return { dateISO: `${y}-${mo}-${d}`, time: null };

  if (isUtc) {
    // UTC → Europe/Zurich, korrekt nyári/téli időszámítással.
    const dt = new Date(Date.UTC(+y, +mo - 1, +d, +hh, +mm, 0));
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Zurich",
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hour12: false,
    }).formatToParts(dt);
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
    const hour = get("hour") === "24" ? "00" : get("hour");
    return { dateISO: `${get("year")}-${get("month")}-${get("day")}`, time: `${hour}:${get("minute")}` };
  }
  return { dateISO: `${y}-${mo}-${d}`, time: `${hh}:${mm}` };
}

/**
 * iCal szöveg → események. Hibatűrő: a hiányos/parse-elhetetlen VEVENT-eket
 * egyszerűen kihagyja.
 */
export function parseIcal(text: string): IcalEvent[] {
  const lines = unfold(text).split(/\r?\n/);
  const events: IcalEvent[] = [];
  let cur: Record<string, string> | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "BEGIN:VEVENT") { cur = {}; continue; }
    if (trimmed === "END:VEVENT") {
      if (cur) {
        const built = buildEvent(cur);
        if (built) events.push(built);
      }
      cur = null;
      continue;
    }
    if (!cur) continue;

    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const rawKey = line.slice(0, idx); // pl. "DTSTART;TZID=Europe/Zurich" vagy "DTSTART;VALUE=DATE"
    const value = line.slice(idx + 1);
    const key = rawKey.split(";")[0].toUpperCase();
    cur[key] = value;
    if (key === "DTSTART") cur.__DTSTART_RAW = rawKey;
  }
  return events;
}

function buildEvent(props: Record<string, string>): IcalEvent | null {
  const dtstart = props.DTSTART;
  const summary = props.SUMMARY;
  if (!dtstart || !summary) return null;

  const isUtc = /Z$/.test(dtstart) && !/TZID=/i.test(props.__DTSTART_RAW ?? "");
  const parsed = parseDt(dtstart, isUtc);
  if (!parsed) return null;

  return {
    uid: props.UID?.trim() || `${parsed.dateISO}-${summary}`,
    summary: unescapeText(summary),
    dateISO: parsed.dateISO,
    startTime: parsed.time,
    location: props.LOCATION ? unescapeText(props.LOCATION) : null,
    description: props.DESCRIPTION ? unescapeText(props.DESCRIPTION) : null,
  };
}
