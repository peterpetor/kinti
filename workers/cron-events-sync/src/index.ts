/**
 * kinti-cron-events-sync — feed → D1 szinkron.
 *
 * Naponta egyszer (04:47 UTC) lehúzza a `event_feeds` táblában `enabled=1`-re
 * állított forrásokat. Auto-detect formátum:
 *   • iCal (RFC 5545): RRULE expand, TZID + Europe/Zurich-aware
 *   • RSS 2.0 / Atom 1.0: hír-szerű feed → publikálási dátumot eseménydátumnak
 *     vesszük, link a `venue` mezőbe (pl. magyar konzulátus hírei).
 *
 * Forrásonkénti `source = ical:<hash>` mezővel — egy újra-sync előtt törli a
 * forrás régi sorait, így a feedből eltávolított esemény TÉNYLEG eltűnik.
 *
 * Statusz: minden feedhez visszaírja a `last_synced_at`, `last_error`,
 * `events_count` mezőket — az `/admin/feeds` oldal ezt olvassa.
 */

import { parseIcs } from "./ical";
import { parseRss, looksLikeXmlFeed } from "./rss";

export interface Env {
  DB: D1Database;
  /** Manuális trigger Bearer-tokenje. */
  CRON_SECRET?: string;
}

interface FeedRow {
  id: string;
  url: string;
  source_id: string;
}

interface FeedResult {
  feedId: string;
  url: string;
  source: string;
  inserted: number;
  error?: string;
}

interface SyncResult {
  feeds: FeedResult[];
  totalInserted: number;
  ranAt: string;
}

// --- Hungarian formatting (Europe/Zurich) -----------------------------------

const HU_MONTHS_ABBR = [
  "JAN", "FEB", "MÁR", "ÁPR", "MÁJ", "JÚN",
  "JÚL", "AUG", "SZEP", "OKT", "NOV", "DEC",
];

interface FormattedDate {
  eventDate: string;
  dateDay: string;
  dateMonth: string;
  dateWeekday: string;
  startTime: string;
}

function formatForDb(date: Date, allDay: boolean): FormattedDate {
  const tz = "Europe/Zurich";
  const dateFmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const partsFmt = new Intl.DateTimeFormat("hu-HU", {
    timeZone: tz,
    weekday: "long",
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const eventDate = dateFmt.format(date);
  const parts = partsFmt.formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const dateDay = String(parseInt(get("day"), 10));
  const monthIdx = parseInt(get("month"), 10) - 1;
  const dateMonth = HU_MONTHS_ABBR[monthIdx] ?? "";
  const dateWeekday = get("weekday").toLowerCase();
  const startTime = allDay ? "" : `${get("hour")}:${get("minute")}`;
  return { eventDate, dateDay, dateMonth, dateWeekday, startTime };
}

// --- Insert helper (iCal + RSS közös) --------------------------------------

interface InsertInput {
  uid: string;
  title: string;
  date: Date;
  allDay: boolean;
  venue: string | null;
  tag: string | null;
  occurrenceIndex: number;
}

async function insertEvent(env: Env, sourceId: string, e: InsertInput): Promise<void> {
  const f = formatForDb(e.date, e.allDay);
  const id =
    e.occurrenceIndex === 0
      ? `${sourceId}:${e.uid}`
      : `${sourceId}:${e.uid}:${e.date.toISOString()}`;

  await env.DB.prepare(
    `INSERT OR REPLACE INTO events
       (id, title, event_date, date_day, date_month, date_weekday,
        start_time, venue, going, tag, color, source)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, NULL, ?)`,
  )
    .bind(
      id.slice(0, 200),
      e.title.slice(0, 200),
      f.eventDate,
      f.dateDay,
      f.dateMonth,
      f.dateWeekday,
      f.startTime || null,
      e.venue?.slice(0, 200) ?? null,
      e.tag?.slice(0, 50) ?? null,
      sourceId,
    )
    .run();
}

// --- Feed-szinkron ----------------------------------------------------------

async function syncFeed(feed: FeedRow, env: Env): Promise<FeedResult> {
  const result: FeedResult = {
    feedId: feed.id,
    url: feed.url,
    source: feed.source_id,
    inserted: 0,
  };

  try {
    const res = await fetch(feed.url, {
      headers: {
        "user-agent": "kinti-cron-events-sync/1.0",
        // Néhány govt site (pl. mfa.gov.hu Drupal) csak ha adunk Accept-et.
        accept: "text/calendar, application/rss+xml, application/atom+xml, application/xml;q=0.9, */*;q=0.5",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();

    const windowStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const windowEnd = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);

    // Auto-detect: iCal vagy RSS/Atom XML?
    const head = text.slice(0, 200).toUpperCase();
    const isIcal = head.includes("BEGIN:VCALENDAR");

    // Stale törlés (mindkét feed-típusnál azonos: forrás összes sora)
    await env.DB.prepare("DELETE FROM events WHERE source = ?")
      .bind(feed.source_id)
      .run();

    if (isIcal) {
      const occurrences = parseIcs(text, windowStart, windowEnd);
      for (const e of occurrences) {
        await insertEvent(env, feed.source_id, {
          uid: e.uid,
          title: e.title,
          date: e.startDate,
          allDay: e.allDay,
          venue: e.venue,
          tag: e.categories[0] ?? null,
          occurrenceIndex: e.occurrenceIndex,
        });
        result.inserted++;
      }
    } else if (looksLikeXmlFeed(text)) {
      const items = parseRss(text, windowStart, windowEnd);
      for (const it of items) {
        await insertEvent(env, feed.source_id, {
          uid: it.uid,
          title: it.title,
          date: it.date,
          // Hír-szerű feedeknél a publikálás napját all-day eseményként kezeljük
          // (a feed nem közöl külön kezdési időt).
          allDay: true,
          venue: it.link, // a venue mezőben a hír-link — a kliensen kattintható
          tag: it.category,
          occurrenceIndex: 0,
        });
        result.inserted++;
      }
    } else {
      throw new Error("Ismeretlen feed-formátum (sem iCal, sem RSS/Atom XML).");
    }
  } catch (err) {
    result.error = err instanceof Error ? err.message : String(err);
  }

  // Statusz visszaírás
  await env.DB.prepare(
    `UPDATE event_feeds
       SET last_synced_at = datetime('now'),
           last_error = ?,
           events_count = ?
     WHERE id = ?`,
  )
    .bind(result.error ?? null, result.inserted, feed.id)
    .run();

  return result;
}

async function runSync(env: Env): Promise<SyncResult> {
  const { results } = await env.DB.prepare(
    `SELECT id, url, source_id FROM event_feeds WHERE enabled = 1`,
  ).all<FeedRow>();

  const feeds = await Promise.all(results.map((f) => syncFeed(f, env)));
  const totalInserted = feeds.reduce((s, f) => s + f.inserted, 0);
  return { feeds, totalInserted, ranAt: new Date().toISOString() };
}

// --- handlers ---------------------------------------------------------------

export default {
  async scheduled(
    _event: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    ctx.waitUntil(
      runSync(env).then((result) => {
        console.log("[cron-events-sync]", JSON.stringify(result));
      }),
    );
  },

  async fetch(req: Request, env: Env): Promise<Response> {
    const auth = req.headers.get("authorization") ?? "";
    const expected = env.CRON_SECRET ? `Bearer ${env.CRON_SECRET}` : null;
    if (!expected || auth !== expected) {
      return new Response("Unauthorized", { status: 401 });
    }
    const result = await runSync(env);
    return Response.json(result);
  },
};
