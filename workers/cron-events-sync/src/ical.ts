/**
 * iCal (RFC 5545) MVP parser, RRULE expanderrel és TZID-felismeréssel.
 *
 * Visszaadja az ÉRTELMEZETT előfordulások listáját (RRULE expandolva
 * a megadott `windowEnd`-ig). EXDATE-ek átugorva.
 *
 * Időkezelés:
 *   • DTSTART:YYYYMMDD → all-day (UTC midnight)
 *   • DTSTART:YYYYMMDDTHHMMSSZ → konkrét UTC pillanat
 *   • DTSTART;TZID=Europe/Zurich:YYYYMMDDTHHMMSS → helyi idő, korrekt
 *     DST-érzékeny UTC-re fordítva (lásd timezone.ts)
 *   • Floating (TZID nélkül, Z nélkül) → assumed Europe/Zurich (a svájci
 *     magyar feedek 99%-a ilyen helyi idő)
 */

import { expandRRule, parseIcalUtc, parseRRule, type RRule } from "./rrule";
import { zonedLocalToUtc } from "./timezone";

const DEFAULT_FLOATING_TZ = "Europe/Zurich";

export interface VEvent {
  uid: string;
  title: string;
  /** Az ELSŐ előfordulás (DTSTART). UTC pillanat. */
  startDate: Date;
  allDay: boolean;
  venue: string | null;
  description: string | null;
  categories: string[];
  rrule: RRule | null;
  exdates: Date[];
}

export interface ParsedEvent {
  /** Eredeti VEVENT UID. */
  uid: string;
  title: string;
  /** Ez az adott előfordulás. */
  startDate: Date;
  allDay: boolean;
  venue: string | null;
  categories: string[];
  /** Sorszám a sorozatban (0 = első, RRULE expandolásra). */
  occurrenceIndex: number;
}

interface RawProp {
  name: string;
  params: Record<string, string>;
  value: string;
}

function parseLine(line: string): RawProp | null {
  const colon = line.indexOf(":");
  if (colon < 0) return null;
  const head = line.slice(0, colon);
  const value = unescapeICalText(line.slice(colon + 1));
  const [nameAndParams, ...rest] = head.split(";");
  void rest;
  const segments = head.split(";");
  const name = segments[0].toUpperCase();
  const params: Record<string, string> = {};
  for (let i = 1; i < segments.length; i++) {
    const eq = segments[i].indexOf("=");
    if (eq > 0) {
      params[segments[i].slice(0, eq).toUpperCase()] = segments[i].slice(eq + 1);
    }
  }
  void nameAndParams;
  return { name, params, value };
}

function unescapeICalText(s: string): string {
  return s
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
}

/** TZID/Z/floating figyelembevételével UTC-re fordítja a DTSTART-szerű értéket. */
function parseDateValue(
  value: string,
  params: Record<string, string>,
): { date: Date; allDay: boolean } | null {
  const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/.exec(
    value.trim(),
  );
  if (!m) return null;
  const [, y, mo, d, h, mi, s, z] = m;
  if (!h) {
    return {
      date: new Date(Date.UTC(+y, +mo - 1, +d)),
      allDay: true,
    };
  }
  if (z) {
    return {
      date: new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s)),
      allDay: false,
    };
  }
  // TZID megadva → tényleges helyi idő abban a zónában
  const tz = params.TZID ?? DEFAULT_FLOATING_TZ;
  return {
    date: zonedLocalToUtc(+y, +mo, +d, +h, +mi, +s, tz),
    allDay: false,
  };
}

/**
 * Egy iCal sztring → VEVENT-tömb (még RRULE nélkül expandolva).
 * Kezelni a line-folding-ot (space-szel kezdődő sor a megelőzőhöz fűződik).
 */
function parseVEvents(icsText: string): VEvent[] {
  const events: VEvent[] = [];
  const lines = icsText.split(/\r?\n/);

  let cur: Partial<VEvent> & { rrule?: RRule | null; exdates?: Date[] } = {};
  let inEvent = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    while (i + 1 < lines.length && /^[ \t]/.test(lines[i + 1])) {
      line += lines[i + 1].slice(1);
      i++;
    }

    if (line === "BEGIN:VEVENT") {
      cur = { categories: [], exdates: [], rrule: null };
      inEvent = true;
      continue;
    }
    if (line === "END:VEVENT") {
      if (cur.uid && cur.title && cur.startDate) {
        events.push({
          uid: cur.uid,
          title: cur.title,
          startDate: cur.startDate,
          allDay: cur.allDay ?? false,
          venue: cur.venue ?? null,
          description: cur.description ?? null,
          categories: cur.categories ?? [],
          rrule: cur.rrule ?? null,
          exdates: cur.exdates ?? [],
        });
      }
      inEvent = false;
      continue;
    }
    if (!inEvent) continue;

    const prop = parseLine(line);
    if (!prop) continue;

    switch (prop.name) {
      case "UID":
        cur.uid = prop.value;
        break;
      case "SUMMARY":
        cur.title = prop.value;
        break;
      case "LOCATION":
        cur.venue = prop.value;
        break;
      case "DESCRIPTION":
        cur.description = prop.value;
        break;
      case "CATEGORIES":
        cur.categories = prop.value
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        break;
      case "DTSTART": {
        const parsed = parseDateValue(prop.value, prop.params);
        if (parsed) {
          cur.startDate = parsed.date;
          cur.allDay = parsed.allDay;
        }
        break;
      }
      case "RRULE":
        cur.rrule = parseRRule(prop.value);
        break;
      case "EXDATE": {
        const parts = prop.value.split(",");
        cur.exdates ??= [];
        for (const part of parts) {
          // EXDATE szintén lehet Z/floating/TZID; egyszerűsítjük: parseDateValue-val
          const parsed = parseDateValue(part, prop.params);
          if (parsed) cur.exdates.push(parsed.date);
          else {
            const d = parseIcalUtc(part);
            if (d) cur.exdates.push(d);
          }
        }
        break;
      }
    }
  }
  return events;
}

/**
 * Teljes flow: iCal sztring → konkrét előfordulások listája az ablakon belül.
 * Az RRULE-t expandolja, az EXDATE-eket átugorja, és az ablakon kívülieket
 * (start `windowStart` előtt, vagy `windowEnd` után) kihagyja.
 */
export function parseIcs(
  icsText: string,
  windowStart: Date,
  windowEnd: Date,
): ParsedEvent[] {
  const vevents = parseVEvents(icsText);
  const out: ParsedEvent[] = [];

  for (const ve of vevents) {
    const exSet = new Set(ve.exdates.map((d) => d.getTime()));
    const occurrences = ve.rrule
      ? expandRRule(ve.startDate, ve.rrule, exSet, windowEnd)
      : [ve.startDate];

    let idx = 0;
    for (const occ of occurrences) {
      if (occ.getTime() < windowStart.getTime()) {
        idx++;
        continue;
      }
      if (occ.getTime() > windowEnd.getTime()) break;
      out.push({
        uid: ve.uid,
        title: ve.title,
        startDate: occ,
        allDay: ve.allDay,
        venue: ve.venue,
        categories: ve.categories,
        occurrenceIndex: idx,
      });
      idx++;
    }
  }
  return out;
}
