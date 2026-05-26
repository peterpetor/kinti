/**
 * kinti-cron-events-sync — iCal → D1 szinkron.
 *
 * Naponta egyszer (04:47 UTC) lehúzza a `event_feeds` táblában `enabled=1`-re
 * állított iCal forrásokat, parzolja (RRULE expand, TZID + Europe/Zurich-aware),
 * és az `events` táblába frissíti őket. Forrásonkénti `source = ical:<hash>`
 * mezővel — egy újra-sync előtt törli a forrás régi sorait, így a feedből
 * eltávolított esemény TÉNYLEG eltűnik a kintiből.
 *
 * Statusz: minden feedhez visszaírja a `last_synced_at`, `last_error`,
 * `events_count` mezőket — az `/admin/feeds` oldal ezt olvassa.
 */

import { parseIcs, type ParsedEvent } from "./ical";

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
      headers: { "user-agent": "kinti-cron-events-sync/1.0" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();

    const windowStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const windowEnd = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);
    const occurrences = parseIcs(text, windowStart, windowEnd);

    // Stale törlés
    await env.DB.prepare("DELETE FROM events WHERE source = ?")
      .bind(feed.source_id)
      .run();

    // Insert
    for (const e of occurrences) {
      const f = formatForDb(e.startDate, e.allDay);
      const id =
        e.occurrenceIndex === 0
          ? `${feed.source_id}:${e.uid}`
          : `${feed.source_id}:${e.uid}:${e.startDate.toISOString()}`;
      const tag = e.categories[0] ?? null;
      await env.DB.prepare(
        `INSERT INTO events
           (id, title, event_date, date_day, date_month, date_weekday,
            start_time, venue, going, tag, color, source)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, NULL, ?)`,
      )
        .bind(
          id,
          e.title.slice(0, 200),
          f.eventDate,
          f.dateDay,
          f.dateMonth,
          f.dateWeekday,
          f.startTime || null,
          e.venue?.slice(0, 200) ?? null,
          tag?.slice(0, 50) ?? null,
          feed.source_id,
        )
        .run();
      result.inserted++;
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
