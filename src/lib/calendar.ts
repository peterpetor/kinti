/**
 * Naptár-segédek — „Add a naptáradhoz" gombhoz.
 *
 * Időzóna: az eseményeket helyi (Európa/Zürich) faliórás időként kezeljük.
 *   • Google Calendar: a `ctz=Europe/Zurich` paraméter mondja meg az időzónát.
 *   • .ics: „lebegő" helyi idő (nincs Z, nincs TZID) — a svájci résztvevőknek a
 *     készülékük helyi ideje szerint pont jó, és nem kell DST-számolás.
 */

export interface CalendarEvent {
  title: string;
  date: string; // "YYYY-MM-DD"
  startTime?: string | null; // "19:00" vagy "19.00"; üres → egész napos
  venue?: string | null;
  description?: string | null;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** "19:00" / "19.00" / "19:00 - 22:00" → {h, m} (az első időpont), vagy null. */
function parseTime(t: string | null | undefined): { h: number; m: number } | null {
  if (!t) return null;
  const m = t.match(/(\d{1,2})[:.](\d{2})/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (h > 23 || min > 59) return null;
  return { h, m: min };
}

/** "YYYY-MM-DD" → [év, hó, nap] számokként, vagy null. */
function parseDate(d: string): [number, number, number] | null {
  const m = d.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
}

/** Helyi datetime-bélyeg: YYYYMMDDTHHMMSS (nincs Z → lebegő/ctz-vezérelt). */
function localStamp(y: number, mo: number, d: number, h: number, mi: number): string {
  return `${y}${pad(mo)}${pad(d)}T${pad(h)}${pad(mi)}00`;
}

/** Csak dátum: YYYYMMDD (egész napos eseményhez). */
function dateStamp(y: number, mo: number, d: number): string {
  return `${y}${pad(mo)}${pad(d)}`;
}

/** A start/end bélyegek + egész napos-e. Alapértelmezett hossz: 2 óra. */
function computeRange(ev: CalendarEvent): {
  allDay: boolean;
  start: string;
  end: string;
} | null {
  const date = parseDate(ev.date);
  if (!date) return null;
  const [y, mo, d] = date;
  const time = parseTime(ev.startTime);

  if (!time) {
    // Egész napos: a DTEND a következő nap (kizárólagos vég).
    const start = dateStamp(y, mo, d);
    const endDate = new Date(Date.UTC(y, mo - 1, d + 1));
    const end = dateStamp(
      endDate.getUTCFullYear(),
      endDate.getUTCMonth() + 1,
      endDate.getUTCDate(),
    );
    return { allDay: true, start, end };
  }

  // +2 óra (UTC-aritmetikával számoljuk a napváltást, de helyi bélyeget írunk).
  const startDt = new Date(Date.UTC(y, mo - 1, d, time.h, time.m));
  const endDt = new Date(startDt.getTime() + 2 * 60 * 60 * 1000);
  const start = localStamp(y, mo, d, time.h, time.m);
  const end = localStamp(
    endDt.getUTCFullYear(),
    endDt.getUTCMonth() + 1,
    endDt.getUTCDate(),
    endDt.getUTCHours(),
    endDt.getUTCMinutes(),
  );
  return { allDay: false, start, end };
}

/** Google Calendar „TEMPLATE" link (Európa/Zürich időzónával). */
export function googleCalendarUrl(ev: CalendarEvent): string | null {
  const range = computeRange(ev);
  if (!range) return null;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: ev.title,
    dates: `${range.start}/${range.end}`,
  });
  if (!range.allDay) params.set("ctz", "Europe/Zurich");
  if (ev.venue) params.set("location", ev.venue);
  if (ev.description) params.set("details", ev.description);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function icsEscape(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

/** .ics fájl tartalma (Apple Calendar / Outlook import). */
export function icsContent(ev: CalendarEvent): string | null {
  const range = computeRange(ev);
  if (!range) return null;
  const uid = `${range.start}-${Math.random().toString(36).slice(2, 10)}@kinti.app`;
  const dtstamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");

  const dtLines = range.allDay
    ? [`DTSTART;VALUE=DATE:${range.start}`, `DTEND;VALUE=DATE:${range.end}`]
    : [`DTSTART:${range.start}`, `DTEND:${range.end}`];

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//kinti.app//Esemeny//HU",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    ...dtLines,
    `SUMMARY:${icsEscape(ev.title)}`,
    ev.venue ? `LOCATION:${icsEscape(ev.venue)}` : "",
    ev.description ? `DESCRIPTION:${icsEscape(ev.description)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}

/** .ics letöltés kliens-oldalon (Blob). */
export function downloadIcs(ev: CalendarEvent): void {
  const content = icsContent(ev);
  if (!content) return;
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${ev.title.replace(/[^\p{L}\p{N}]+/gu, "-").slice(0, 40) || "esemeny"}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
