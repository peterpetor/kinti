/**
 * kinti-cron-events-sync — iCal → D1 szinkron.
 *
 * Minden konfigurált .ics URL-t lehúz, parzol, és a kinti D1 `events`
 * táblájába frissít. A forrásonkénti `source = "ical:<hash>"` mező
 * lehetővé teszi a régi sorok DELETE-elését újra-szinkronnál (törölt
 * esemény tényleg eltűnik). A kézzel/seed-elt sorok `source IS NULL` —
 * érintetlenek maradnak.
 *
 * Időzónakezelés: az .ics-ben kapott UTC időbélyeget Europe/Zurich
 * helyi időre formázzuk (`Intl.DateTimeFormat` timeZone-opcióval), így
 * a megjelenített nap/óra mindig a tényleges svájci helyi idő.
 *
 * Múltbeli események szűrése: csak a -30 napnál újabbakat tartjuk meg
 * — ne nőjön a DB történelmi adatokkal.
 */

export interface Env {
  DB: D1Database;
  /** Vesszővel elválasztott .ics URL-ek. Üresen → no-op. */
  FEED_URLS?: string;
  /** A `fetch` endpoint Bearer-tokenje a kézi triggerhez. */
  CRON_SECRET?: string;
}

interface SyncResult {
  feeds: { url: string; source: string; inserted: number; error?: string }[];
  totalInserted: number;
  ranAt: string;
}

// --- iCal parser ------------------------------------------------------------

interface ParsedEvent {
  uid: string;
  title: string;
  /** UTC Date (akkor is, ha az .ics floating localdate-et adott). */
  startDate: Date;
  /** All-day esemény (nincs óra/perc). */
  allDay: boolean;
  venue: string | null;
  categories: string[];
}

/**
 * Minimális, függőség-mentes iCal parser. Kezeli:
 *   • VEVENT blokkokat
 *   • DTSTART:YYYYMMDD (all-day) és YYYYMMDDTHHMMSSZ (UTC datetime)
 *   • DTSTART;TZID=Europe/Zurich:YYYYMMDDTHHMMSS (helyi datetime — TZID figyelmen
 *     kívül hagyva, naív UTC-ként parzoljuk; Zürichi feedekre ez 1-2 órával eltérhet
 *     a téli/nyári idő miatt — később finomítható)
 *   • SUMMARY, LOCATION, DESCRIPTION, UID, CATEGORIES
 *   • több-soros értékeket (line folding: a következő sor space-szel kezdődik)
 *
 * NEM kezeli (egyelőre): RRULE (ismétlődő események), EXDATE.
 * MVP-hez bőven elég; bővíthető, ha tényleges feedek ismétlést is használnak.
 */
export function parseICS(icsText: string): ParsedEvent[] {
  const events: ParsedEvent[] = [];
  const lines = icsText.split(/\r?\n/);

  let current: Partial<ParsedEvent> & { categories?: string[] } = {};
  let inEvent = false;

  for (let i = 0; i < lines.length; i++) {
    // line folding
    let line = lines[i];
    while (i + 1 < lines.length && /^[ \t]/.test(lines[i + 1])) {
      line += lines[i + 1].slice(1);
      i++;
    }

    if (line.startsWith("BEGIN:VEVENT")) {
      current = { categories: [] };
      inEvent = true;
      continue;
    }
    if (line.startsWith("END:VEVENT")) {
      if (current.uid && current.title && current.startDate) {
        events.push({
          uid: current.uid,
          title: current.title,
          startDate: current.startDate,
          allDay: current.allDay ?? false,
          venue: current.venue ?? null,
          categories: current.categories ?? [],
        });
      }
      inEvent = false;
      continue;
    }
    if (!inEvent) continue;

    // KEY[;params]:VALUE
    const idx = line.indexOf(":");
    if (idx < 0) continue;
    const head = line.slice(0, idx);
    const value = unescapeICalText(line.slice(idx + 1));
    const [key] = head.split(";");

    switch (key) {
      case "UID":
        current.uid = value;
        break;
      case "SUMMARY":
        current.title = value;
        break;
      case "LOCATION":
        current.venue = value;
        break;
      case "CATEGORIES":
        current.categories = value
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        break;
      case "DTSTART": {
        const parsed = parseICalDate(value);
        if (parsed) {
          current.startDate = parsed.date;
          current.allDay = parsed.allDay;
        }
        break;
      }
    }
  }
  return events;
}

function unescapeICalText(s: string): string {
  return s
    .replace(/\\n/g, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
}

function parseICalDate(value: string): { date: Date; allDay: boolean } | null {
  // YYYYMMDD (all-day) | YYYYMMDDTHHMMSS[Z] (datetime)
  const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/.exec(
    value.trim(),
  );
  if (!m) return null;
  const [, yy, mm, dd, hh, mi, ss, z] = m;
  if (!hh) {
    return {
      date: new Date(Date.UTC(+yy, +mm - 1, +dd)),
      allDay: true,
    };
  }
  if (z) {
    return {
      date: new Date(Date.UTC(+yy, +mm - 1, +dd, +hh, +mi, +ss)),
      allDay: false,
    };
  }
  // floating / TZID — naívan UTC-ként, megjelenítéskor Europe/Zurich
  return {
    date: new Date(Date.UTC(+yy, +mm - 1, +dd, +hh, +mi, +ss)),
    allDay: false,
  };
}

// --- Hungarian formatting (Europe/Zurich) -----------------------------------

const HU_MONTHS_ABBR = [
  "JAN", "FEB", "MÁR", "ÁPR", "MÁJ", "JÚN",
  "JÚL", "AUG", "SZEP", "OKT", "NOV", "DEC",
];

interface FormattedDate {
  eventDate: string; // YYYY-MM-DD (Zürich helyi)
  dateDay: string; // pl. "14"
  dateMonth: string; // pl. "NOV"
  dateWeekday: string; // pl. "szombat"
  startTime: string; // pl. "19:00"
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
  const eventDate = dateFmt.format(date); // YYYY-MM-DD
  const parts = partsFmt.formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const dateDay = String(parseInt(get("day"), 10));
  const monthIdx = parseInt(get("month"), 10) - 1;
  const dateMonth = HU_MONTHS_ABBR[monthIdx] ?? "";
  const dateWeekday = get("weekday").toLowerCase();
  const startTime = allDay ? "" : `${get("hour")}:${get("minute")}`;
  return { eventDate, dateDay, dateMonth, dateWeekday, startTime };
}

// --- Source-azonosító -------------------------------------------------------

async function sourceIdForUrl(url: string): Promise<string> {
  const data = new TextEncoder().encode(url);
  const buf = await crypto.subtle.digest("SHA-256", data);
  const hex = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `ical:${hex.slice(0, 16)}`;
}

// --- Sync egy feed-re --------------------------------------------------------

async function syncFeed(
  url: string,
  env: Env,
): Promise<{ source: string; inserted: number; error?: string }> {
  const source = await sourceIdForUrl(url);
  try {
    const res = await fetch(url, {
      // Néhány Google Calendar feed ellenőrzi a UA-t.
      headers: { "user-agent": "kinti-cron-events-sync/1.0" },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const text = await res.text();
    const parsed = parseICS(text);

    // Múltbeli sorokat kihagyjuk (>30 nap)
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const fresh = parsed.filter((e) => e.startDate.getTime() >= cutoff);

    // Stale törlés a forráshoz tartozó sorokra
    await env.DB.prepare("DELETE FROM events WHERE source = ?")
      .bind(source)
      .run();

    // Batched insert
    let inserted = 0;
    for (const e of fresh) {
      const f = formatForDb(e.startDate, e.allDay);
      const id = `${source}:${e.uid}`;
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
          source,
        )
        .run();
      inserted++;
    }

    return { source, inserted };
  } catch (err) {
    return {
      source,
      inserted: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function runSync(env: Env): Promise<SyncResult> {
  const urls = (env.FEED_URLS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const feeds = await Promise.all(urls.map((u) => syncFeed(u, env).then((r) => ({ url: u, ...r }))));
  const totalInserted = feeds.reduce((sum, f) => sum + f.inserted, 0);
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
    // Kézi triggerhez Bearer-token (CRON_SECRET).
    const auth = req.headers.get("authorization") ?? "";
    const expected = env.CRON_SECRET ? `Bearer ${env.CRON_SECRET}` : null;
    if (!expected || auth !== expected) {
      return new Response("Unauthorized", { status: 401 });
    }
    const result = await runSync(env);
    return Response.json(result);
  },
};
