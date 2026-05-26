/**
 * iCal RRULE (RFC 5545) MVP parser + expander.
 *
 * Támogatott rész:
 *   • FREQ: DAILY | WEEKLY | MONTHLY | YEARLY
 *   • INTERVAL (default 1)
 *   • COUNT vagy UNTIL (DTSTART-formátumú UTC datetime / dátum)
 *   • BYDAY: MO TU WE TH FR SA SU (+ opcionális előtag, pl. 1MO, -1FR — havi/évi)
 *   • BYMONTHDAY: 1..31 (negatívot egyelőre nem)
 *   • BYMONTH: 1..12
 *   • EXDATE: kihagyandó konkrét pillanatok
 *
 * NEM kezelt (MVP-kívüli): RSCALE, BYSETPOS, BYYEARDAY, BYWEEKNO, fold-ambig.
 *
 * Az expander egy ablakon belül (start..windowEnd) sorolja fel a tényleges
 * előfordulásokat, COUNT/UNTIL betartásával, EXDATE-eket átugorva.
 */

export interface ByDay {
  /** Ordinal: pl. 1 → első, -1 → utolsó. null → nem-ordinal (heti minden „MO"). */
  ord: number | null;
  /** MO/TU/WE/TH/FR/SA/SU */
  day: string;
}

export interface RRule {
  freq: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  interval: number;
  count?: number;
  until?: Date; // UTC
  byDay?: ByDay[];
  byMonthDay?: number[];
  byMonth?: number[];
}

const WEEKDAY_NUM: Record<string, number> = {
  SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6,
};

/** "FREQ=WEEKLY;BYDAY=MO,WE;INTERVAL=2" → struktúra. Sikertelen → null. */
export function parseRRule(s: string): RRule | null {
  const kv: Record<string, string> = {};
  for (const piece of s.split(";")) {
    const eq = piece.indexOf("=");
    if (eq <= 0) continue;
    kv[piece.slice(0, eq).toUpperCase()] = piece.slice(eq + 1);
  }
  const freq = kv.FREQ as RRule["freq"];
  if (!freq || !["DAILY", "WEEKLY", "MONTHLY", "YEARLY"].includes(freq)) return null;

  const rule: RRule = {
    freq,
    interval: kv.INTERVAL ? Math.max(1, parseInt(kv.INTERVAL, 10)) : 1,
  };
  if (kv.COUNT) rule.count = Math.max(1, parseInt(kv.COUNT, 10));
  if (kv.UNTIL) {
    const d = parseIcalUtc(kv.UNTIL);
    if (d) rule.until = d;
  }
  if (kv.BYDAY) {
    rule.byDay = kv.BYDAY.split(",")
      .map(parseByDayItem)
      .filter((x): x is ByDay => x !== null);
  }
  if (kv.BYMONTHDAY) {
    rule.byMonthDay = kv.BYMONTHDAY.split(",")
      .map((n) => parseInt(n, 10))
      .filter((n) => Number.isInteger(n) && n >= 1 && n <= 31);
  }
  if (kv.BYMONTH) {
    rule.byMonth = kv.BYMONTH.split(",")
      .map((n) => parseInt(n, 10))
      .filter((n) => Number.isInteger(n) && n >= 1 && n <= 12);
  }
  return rule;
}

function parseByDayItem(s: string): ByDay | null {
  const m = /^(-?\d+)?([A-Z]{2})$/.exec(s.trim().toUpperCase());
  if (!m) return null;
  const day = m[2];
  if (!(day in WEEKDAY_NUM)) return null;
  const ord = m[1] ? parseInt(m[1], 10) : null;
  return { ord, day };
}

/** "20261114T190000Z" | "20261114" → UTC Date. */
export function parseIcalUtc(value: string): Date | null {
  const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/.exec(
    value.trim(),
  );
  if (!m) return null;
  const [, y, mo, d, h, mi, s] = m;
  if (!h) return new Date(Date.UTC(+y, +mo - 1, +d));
  return new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s));
}

/**
 * Felsorolja az RRULE előfordulásait `start`-tól `windowEnd`-ig.
 * `exdates`: ms-epoch Set, ezek átugorva.
 * Az első előfordulás MINDIG a `start` (RFC 5545: DTSTART az első occurrence).
 *
 * A ciklus felső biztonsági határa: 5 év / max 1000 sor — végtelen RULE
 * sem fogja kifagyasztani a Workert.
 */
export function expandRRule(
  start: Date,
  rule: RRule,
  exdates: Set<number>,
  windowEnd: Date,
): Date[] {
  const out: Date[] = [];
  const maxCount = rule.count ?? Infinity;
  const limit = Math.min(
    windowEnd.getTime(),
    rule.until?.getTime() ?? Infinity,
  );
  const HARD_CAP = 1000;

  // A start mindig elsőként, ha bent van az ablakban
  if (start.getTime() <= limit && !exdates.has(start.getTime())) {
    out.push(start);
  }
  if (out.length >= maxCount) return out;

  switch (rule.freq) {
    case "DAILY":
      stepDaily(start, rule, exdates, limit, maxCount, HARD_CAP, out);
      break;
    case "WEEKLY":
      stepWeekly(start, rule, exdates, limit, maxCount, HARD_CAP, out);
      break;
    case "MONTHLY":
      stepMonthly(start, rule, exdates, limit, maxCount, HARD_CAP, out);
      break;
    case "YEARLY":
      stepYearly(start, rule, exdates, limit, maxCount, HARD_CAP, out);
      break;
  }
  return out;
}

// --- expander részek --------------------------------------------------------

function stepDaily(
  start: Date,
  rule: RRule,
  exdates: Set<number>,
  limit: number,
  maxCount: number,
  cap: number,
  out: Date[],
): void {
  const stepMs = rule.interval * 86_400_000;
  let t = start.getTime() + stepMs;
  let iter = 0;
  while (t <= limit && out.length < maxCount && iter < cap) {
    if (!exdates.has(t)) out.push(new Date(t));
    t += stepMs;
    iter++;
  }
}

function stepWeekly(
  start: Date,
  rule: RRule,
  exdates: Set<number>,
  limit: number,
  maxCount: number,
  cap: number,
  out: Date[],
): void {
  // BYDAY nélkül: ugyanazon hetinap, INTERVAL hetenként.
  const targetDows = rule.byDay?.length
    ? new Set(rule.byDay.map((d) => WEEKDAY_NUM[d.day]))
    : new Set([start.getUTCDay()]);

  // Indulás: start-ot követő nap
  const oneDay = 86_400_000;
  let t = start.getTime() + oneDay;
  // hét-számláló (mod INTERVAL)
  const startWeekday = start.getUTCDay();
  let iter = 0;
  while (t <= limit && out.length < maxCount && iter < cap * 7) {
    const d = new Date(t);
    const weekdiff = Math.floor(
      (d.getTime() - start.getTime()) / (7 * oneDay),
    );
    // Az aktuális hét teljes-e (INTERVAL alapján)?
    if (weekdiff % rule.interval === 0 || sameWeek(start, d, startWeekday)) {
      if (targetDows.has(d.getUTCDay()) && !exdates.has(t)) {
        out.push(d);
      }
    }
    t += oneDay;
    iter++;
  }
}

function sameWeek(a: Date, b: Date, weekStartDow: number): boolean {
  // Durva: 7 napon belül
  return Math.abs(b.getTime() - a.getTime()) < 7 * 86_400_000;
}

function stepMonthly(
  start: Date,
  rule: RRule,
  exdates: Set<number>,
  limit: number,
  maxCount: number,
  cap: number,
  out: Date[],
): void {
  let year = start.getUTCFullYear();
  let month = start.getUTCMonth();
  let monthsAdded = 0;
  let iter = 0;

  while (out.length < maxCount && iter < cap) {
    monthsAdded += rule.interval;
    const cur = new Date(start);
    cur.setUTCFullYear(year, month + monthsAdded, 1);
    const monthIdx = cur.getUTCMonth();
    const yr = cur.getUTCFullYear();

    const candidates = monthlyCandidates(yr, monthIdx, start, rule);
    for (const c of candidates) {
      const t = c.getTime();
      if (t > limit) return;
      if (!exdates.has(t)) out.push(c);
      if (out.length >= maxCount) return;
    }
    if (cur.getTime() > limit && candidates.length === 0) return;
    iter++;
  }
}

function monthlyCandidates(
  year: number,
  monthIdx: number,
  start: Date,
  rule: RRule,
): Date[] {
  const hh = start.getUTCHours();
  const mi = start.getUTCMinutes();
  const ss = start.getUTCSeconds();

  const daysInMonth = new Date(Date.UTC(year, monthIdx + 1, 0)).getUTCDate();
  const results: Date[] = [];

  if (rule.byMonthDay?.length) {
    for (const d of rule.byMonthDay) {
      if (d >= 1 && d <= daysInMonth) {
        results.push(new Date(Date.UTC(year, monthIdx, d, hh, mi, ss)));
      }
    }
  } else if (rule.byDay?.length) {
    for (const bd of rule.byDay) {
      const dow = WEEKDAY_NUM[bd.day];
      if (bd.ord === null) {
        // minden ilyen napon
        for (let d = 1; d <= daysInMonth; d++) {
          const cand = new Date(Date.UTC(year, monthIdx, d, hh, mi, ss));
          if (cand.getUTCDay() === dow) results.push(cand);
        }
      } else {
        const matches: number[] = [];
        for (let d = 1; d <= daysInMonth; d++) {
          const cand = new Date(Date.UTC(year, monthIdx, d, hh, mi, ss));
          if (cand.getUTCDay() === dow) matches.push(d);
        }
        const pick =
          bd.ord > 0 ? matches[bd.ord - 1] : matches[matches.length + bd.ord];
        if (pick) {
          results.push(new Date(Date.UTC(year, monthIdx, pick, hh, mi, ss)));
        }
      }
    }
  } else {
    // ugyanaz a hónapnap mint a start
    const d = Math.min(start.getUTCDate(), daysInMonth);
    results.push(new Date(Date.UTC(year, monthIdx, d, hh, mi, ss)));
  }

  // szűrés BYMONTH-ra
  if (rule.byMonth?.length) {
    return results.filter((r) => rule.byMonth!.includes(r.getUTCMonth() + 1));
  }
  return results.sort((a, b) => a.getTime() - b.getTime());
}

function stepYearly(
  start: Date,
  rule: RRule,
  exdates: Set<number>,
  limit: number,
  maxCount: number,
  cap: number,
  out: Date[],
): void {
  let year = start.getUTCFullYear() + rule.interval;
  let iter = 0;

  while (out.length < maxCount && iter < cap) {
    const months = rule.byMonth?.length
      ? rule.byMonth.map((m) => m - 1)
      : [start.getUTCMonth()];
    for (const monthIdx of months) {
      const candidates = monthlyCandidates(year, monthIdx, start, rule);
      for (const c of candidates) {
        const t = c.getTime();
        if (t > limit) return;
        if (!exdates.has(t)) out.push(c);
        if (out.length >= maxCount) return;
      }
    }
    year += rule.interval;
    if (new Date(Date.UTC(year, 0, 1)).getTime() > limit) return;
    iter++;
  }
}
