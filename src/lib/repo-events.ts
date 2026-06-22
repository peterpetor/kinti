/**
 * repo-events.ts — Események (events), feed-ek és RSVP-k.
 */
import { getDB } from "./cloudflare";
import type { KintiEvent, EventFeed } from "./types";
import { parseIcal, huDateParts } from "./ical";
import { cantonFromAddress } from "./cantons";
import { generateRecurringEvents, GENERATED_SOURCE } from "./event-generator";

// --- Row types ---------------------------------------------------------------

interface EventRow {
  id: string;
  title: string;
  event_date: string | null;
  date_day: string | null;
  date_month: string | null;
  date_weekday: string | null;
  start_time: string | null;
  venue: string | null;
  going: number;
  tag: string | null;
  color: string | null;
  description: string | null;
  image_key: string | null;
  email: string | null;
  status: string;
  token: string | null;
  manage_token: string | null;
  rsvp_count?: number;
  moderation_status?: number | null;
  moderation_decision_at?: string | null;
  moderation_decided_by?: string | null;
  canton_code?: string | null;
  country_code?: string | null;
}

interface EventFeedRow {
  id: string; url: string; label: string | null; enabled: number;
  source_id: string; last_synced_at: string | null; last_error: string | null;
  events_count: number; created_at: string;
}

// --- Mappers -----------------------------------------------------------------

export function toEvent(r: EventRow): KintiEvent {
  return {
    id: r.id,
    title: r.title,
    eventDate: r.event_date,
    dateDay: r.date_day,
    dateMonth: r.date_month,
    dateWeekday: r.date_weekday,
    startTime: r.start_time,
    venue: r.venue,
    going: r.going + (r.rsvp_count ?? 0),
    tag: r.tag,
    color: r.color,
    description: r.description,
    imageKey: r.image_key,
    email: r.email,
    status: r.status,
    token: r.token,
    manageToken: r.manage_token,
    moderationStatus: r.moderation_status ?? 0,
    moderationDecisionAt: r.moderation_decision_at,
    moderationDecidedBy: r.moderation_decided_by,
    cantonCode: r.canton_code ?? null,
    country: r.country_code ?? "CH",
  };
}

function toEventFeed(r: EventFeedRow): EventFeed {
  return {
    id: r.id, url: r.url, label: r.label, enabled: r.enabled === 1,
    sourceId: r.source_id, lastSyncedAt: r.last_synced_at, lastError: r.last_error,
    eventsCount: r.events_count, createdAt: r.created_at,
  };
}

// --- Public Types ------------------------------------------------------------

export interface EventQuery {
  limit?: number;
  upcoming?: boolean;
}

export interface SaveEventInput {
  id?: string; title: string; description?: string | null; url?: string | null;
  eventDate?: string | null; startTime?: string | null; endTime?: string | null;
  venue?: string | null; email?: string | null; source?: string;
  isFeatured?: boolean; status?: string; token?: string | null;
  manageToken?: string | null; imageKey?: string | null;
}

// --- Queries: Events ---------------------------------------------------------

export async function getEvents(opts: EventQuery = {}): Promise<KintiEvent[]> {
  const binds: unknown[] = [];
  const where: string[] = ["e.status = 'approved'", "e.moderation_status = 1"];
  if (opts.upcoming) {
    where.push("e.event_date >= date('now')");
  }

  let sql = `
    SELECT e.*, COALESCE(r.cnt, 0) AS rsvp_count
    FROM events e
    LEFT JOIN (
      SELECT event_id, COUNT(*) AS cnt FROM event_rsvps GROUP BY event_id
    ) r ON r.event_id = e.id`;
  if (where.length > 0) {
    sql += " WHERE " + where.join(" AND ");
  }
  sql += " ORDER BY e.event_date ASC";
  if (opts.limit) {
    sql += " LIMIT ?";
    binds.push(opts.limit);
  }

  const { results } = await getDB().prepare(sql).bind(...binds).all<EventRow>();
  return results.map(toEvent);
}

export async function getEventById(id: string): Promise<KintiEvent | null> {
  const row = await getDB()
    .prepare(
      `SELECT e.*, COALESCE(r.cnt, 0) AS rsvp_count
       FROM events e
       LEFT JOIN (
         SELECT event_id, COUNT(*) AS cnt FROM event_rsvps GROUP BY event_id
       ) r ON r.event_id = e.id
       WHERE e.id = ?`,
    )
    .bind(id)
    .first<EventRow>();
  return row ? toEvent(row) : null;
}

export async function getEventByToken(token: string): Promise<KintiEvent | null> {
  const row = await getDB().prepare("SELECT * FROM events WHERE token = ?").bind(token).first<EventRow>();
  return row ? toEvent(row) : null;
}

export async function saveEvent(input: SaveEventInput): Promise<KintiEvent> {
  const id = input.id || crypto.randomUUID();
  const db = getDB();
  const existing = await db.prepare("SELECT id FROM events WHERE id = ?").bind(id).first();
  if (existing) {
    const sets = [
      "title = ?", "description = ?", "event_date = ?", "start_time = ?",
      "venue = ?", "email = ?", "status = ?", "token = ?", "image_key = ?", "manage_token = ?", "updated_at = datetime('now')"
    ];
    await db.prepare(`UPDATE events SET ${sets.join(", ")} WHERE id = ?`)
      .bind(input.title, input.description ?? null, input.eventDate ?? null,
        input.startTime ?? null, input.venue ?? null, input.email ?? null,
        input.status ?? "pending_email",
        input.token ?? null, input.imageKey ?? null, input.manageToken ?? null, id).run();
  } else {
    await db.prepare(
      `INSERT INTO events (id,title,description,event_date,start_time,
       venue,email,status,token,image_key,manage_token)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    ).bind(id, input.title, input.description ?? null, input.eventDate ?? null,
      input.startTime ?? null, input.venue ?? null, input.email ?? null,
      input.status ?? "pending_email",
      input.token ?? null, input.imageKey ?? null, input.manageToken ?? null).run();
  }
  const saved = await db.prepare("SELECT * FROM events WHERE id = ?").bind(id).first<EventRow>();
  if (!saved) throw new Error("Hiba esemény mentésekor");
  return toEvent(saved);
}

export async function deleteEvent(id: string): Promise<boolean> {
  const res = await getDB().prepare("DELETE FROM events WHERE id = ?").bind(id).run();
  return (res.meta.changes ?? 0) > 0;
}

export async function updateEventStatus(
  id: string,
  status: string,
  nextToken: string | null = null,
): Promise<boolean> {
  const modStatus = status === "approved" ? 1 : 0;
  const res = await getDB()
    .prepare(
      "UPDATE events SET status = ?, token = ?, moderation_status = ?, moderation_decision_at = datetime('now'), moderation_decided_by = COALESCE(moderation_decided_by, 'email-moderate-token') WHERE id = ?",
    )
    .bind(status, nextToken, modStatus, id)
    .run();
  return (res.meta.changes ?? 0) > 0;
}

export async function confirmEventSubmission(token: string): Promise<{ success: boolean; eventId?: string }> {
  const db = getDB();
  const eventRow = await db.prepare("SELECT id FROM events WHERE token = ? AND status = 'pending_email'").bind(token).first<{ id: string }>();
  if (!eventRow) return { success: false };
  await db.prepare("UPDATE events SET status = 'pending_admin', token = NULL, updated_at = datetime('now') WHERE id = ?").bind(eventRow.id).run();
  return { success: true, eventId: eventRow.id };
}

// --- Email-only event management ---------------------------------------------

export async function getEventByManageToken(manageToken: string): Promise<KintiEvent | null> {
  const row = await getDB().prepare("SELECT * FROM events WHERE manage_token = ? LIMIT 1").bind(manageToken).first<EventRow>();
  return row ? toEvent(row) : null;
}

export async function deleteEventByManageToken(manageToken: string): Promise<boolean> {
  const res = await getDB().prepare("DELETE FROM events WHERE manage_token = ?").bind(manageToken).run();
  return (res.meta.changes ?? 0) > 0;
}

export interface UpdateEventFields {
  title?: string; eventDate?: string | null; startTime?: string | null;
  venue?: string | null; description?: string | null; url?: string | null;
}

export async function updateEventByManageToken(manageToken: string, fields: UpdateEventFields): Promise<boolean> {
  const sets: string[] = [];
  const binds: unknown[] = [];
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined) {
      if (k === "title") sets.push("title = ?");
      else if (k === "eventDate") sets.push("event_date = ?");
      else if (k === "startTime") sets.push("start_time = ?");
      else if (k === "venue") sets.push("venue = ?");
      else if (k === "description") sets.push("description = ?");
      else continue;
      binds.push(v as string | null);
    }
  }
  if (sets.length === 0) return true;
  sets.push("updated_at = datetime('now')");
  binds.push(manageToken);
  const sql = `UPDATE events SET ${sets.join(", ")} WHERE manage_token = ?`;
  const res = await getDB().prepare(sql).bind(...binds).run();
  return (res.meta.changes ?? 0) > 0;
}

// --- Analytics & RSVP --------------------------------------------------------

export async function addEventRsvp(
  eventId: string,
  ipHash: string,
): Promise<{ ok: boolean; added: boolean; total: number }> {
  const db = getDB();
  const event = await db
    .prepare("SELECT going FROM events WHERE id = ?")
    .bind(eventId)
    .first<{ going: number }>();
  if (!event) return { ok: false, added: false, total: 0 };

  const res = await db
    .prepare("INSERT OR IGNORE INTO event_rsvps (event_id, ip_hash) VALUES (?, ?)")
    .bind(eventId, ipHash)
    .run();
  const added = (res.meta.changes ?? 0) > 0;

  const cntRow = await db
    .prepare("SELECT COUNT(*) AS cnt FROM event_rsvps WHERE event_id = ?")
    .bind(eventId)
    .first<{ cnt: number }>();

  return {
    ok: true,
    added,
    total: event.going + (cntRow?.cnt ?? 0),
  };
}

export async function createEventReminder(input: {
  id: string; eventId: string; pushEndpoint: string; remindAt: string; leadMinutes: number;
}): Promise<void> {
  await getDB()
    .prepare(
      `INSERT OR IGNORE INTO event_reminders (id, event_id, push_endpoint, remind_at, lead_minutes)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind(input.id, input.eventId, input.pushEndpoint, input.remindAt, input.leadMinutes)
    .run();
}

export interface DueEventReminder {
  id: string;
  leadMinutes: number;
  endpoint: string;
  p256dh: string | null;
  auth: string | null;
  eventId: string;
  title: string;
  startTime: string | null;
  venue: string | null;
}

/**
 * Esedékes (sent=0, remind_at ≤ most) emlékeztetők a push-kulcsokkal és az
 * esemény-adatokkal együtt (LEFT JOIN — a törölt sub-os árva sor is jön, hogy
 * a cron lezárhassa).
 */
export async function getDueEventReminders(nowIso: string, limit = 200): Promise<DueEventReminder[]> {
  const { results } = await getDB()
    .prepare(
      `SELECT r.id, r.lead_minutes, r.push_endpoint, s.p256dh, s.auth,
              e.id AS event_id, e.title, e.start_time, e.venue
       FROM event_reminders r
       JOIN events e ON e.id = r.event_id
       LEFT JOIN push_subscriptions s ON s.endpoint = r.push_endpoint
       WHERE r.sent = 0 AND r.remind_at <= ?
       ORDER BY r.remind_at ASC
       LIMIT ?`,
    )
    .bind(nowIso, limit)
    .all<{
      id: string; lead_minutes: number; push_endpoint: string; p256dh: string | null; auth: string | null;
      event_id: string; title: string; start_time: string | null; venue: string | null;
    }>();
  return results.map((r) => ({
    id: r.id, leadMinutes: r.lead_minutes, endpoint: r.push_endpoint, p256dh: r.p256dh, auth: r.auth,
    eventId: r.event_id, title: r.title, startTime: r.start_time, venue: r.venue,
  }));
}

export async function markEventReminderSent(id: string): Promise<void> {
  await getDB().prepare("UPDATE event_reminders SET sent = 1 WHERE id = ?").bind(id).run();
}

export async function countRecentEventSubmits(ipHash: string | null): Promise<number> {
  if (!ipHash) return 0;
  const res = await getDB()
    .prepare(`SELECT COUNT(*) AS n FROM event_submit_log WHERE ip_hash = ? AND created_at >= datetime('now', '-24 hours')`)
    .bind(ipHash)
    .first<{ n: number }>();
  return res?.n ?? 0;
}

export async function logEventSubmit(id: string, ipHash: string | null): Promise<void> {
  await getDB()
    .prepare(`INSERT INTO event_submit_log (id, ip_hash) VALUES (?, ?)`)
    .bind(id, ipHash)
    .run();
}

// --- Admin: Event Feeds ------------------------------------------------------

async function feedSourceId(url: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(url));
  const hex = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `ical:${hex.slice(0, 16)}`;
}

export async function listEventFeeds(): Promise<EventFeed[]> {
  const { results } = await getDB().prepare("SELECT * FROM event_feeds ORDER BY created_at DESC").all<EventFeedRow>();
  return results.map(toEventFeed);
}

export async function createEventFeed(input: { url: string; label: string | null }): Promise<EventFeed | { error: string }> {
  const url = input.url.trim();
  if (!/^https?:\/\//i.test(url)) return { error: "Az URL http(s):// kezdetű legyen." };
  const sourceId = await feedSourceId(url);
  const id = crypto.randomUUID();
  try {
    await getDB().prepare("INSERT INTO event_feeds (id, url, label, enabled, source_id) VALUES (?, ?, ?, 1, ?)")
      .bind(id, url, input.label ?? null, sourceId).run();
  } catch (err) {
    const m = err instanceof Error ? err.message : String(err);
    if (/UNIQUE/.test(m)) return { error: "Ez az URL már fel van véve." };
    return { error: m };
  }
  const row = await getDB().prepare("SELECT * FROM event_feeds WHERE id = ?").bind(id).first<EventFeedRow>();
  return row ? toEventFeed(row) : { error: "Mentés után nem volt visszaolvasható." };
}

export async function updateEventFeed(id: string, patch: { enabled?: boolean; label?: string | null }): Promise<boolean> {
  const sets: string[] = [];
  const binds: unknown[] = [];
  if (typeof patch.enabled === "boolean") { sets.push("enabled = ?"); binds.push(patch.enabled ? 1 : 0); }
  if (patch.label !== undefined) { sets.push("label = ?"); binds.push(patch.label); }
  if (!sets.length) return false;
  binds.push(id);
  const res = await getDB().prepare(`UPDATE event_feeds SET ${sets.join(", ")} WHERE id = ?`).bind(...binds).run();
  return (res.meta.changes ?? 0) > 0;
}

export async function deleteEventFeed(id: string): Promise<boolean> {
  const row = await getDB().prepare("SELECT source_id FROM event_feeds WHERE id = ?").bind(id).first<{ source_id: string }>();
  if (!row) return false;
  await getDB().prepare("DELETE FROM events WHERE source = ?").bind(row.source_id).run();
  const res = await getDB().prepare("DELETE FROM event_feeds WHERE id = ?").bind(id).run();
  return (res.meta.changes ?? 0) > 0;
}

// --- iCal feed szinkron (automatikus esemény-frissítés) ----------------------

/** Milyen gyakran frissüljön a feed lusta (forgalom-vezérelt) triggerből. */
const FEED_SYNC_INTERVAL_HOURS = 12;
/** Egy feedből legfeljebb ennyi (jövőbeli) eseményt importálunk. */
const FEED_MAX_EVENTS = 60;

export interface FeedSyncResult {
  feedId: string;
  label: string | null;
  imported: number;
  error: string | null;
}

/** Determinisztikus, rövid hash a stabil esemény-ID-hez (FNV-1a). */
function tinyHash(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}

/**
 * Az összes engedélyezett feed letöltése + parse-olása, és a JÖVŐBELI
 * események upsert-elése (status='approved', moderation_status=1, going=0).
 * Forrásonként előbb törli a meglévő jövőbeli eseményeket (törölt/elmaradt
 * események eltűnnek), majd újra beszúrja az aktuálisakat. A múltbeli
 * eseményeket nem bántja (történeti adat). Az `event_feeds` táblába visszaírja
 * az utolsó futás eredményét.
 */
export async function syncEventFeeds(): Promise<FeedSyncResult[]> {
  const db = getDB();
  const { results: feeds } = await db
    .prepare("SELECT * FROM event_feeds WHERE enabled = 1")
    .all<EventFeedRow>();

  const out: FeedSyncResult[] = [];

  for (const feed of feeds) {
    let imported = 0;
    let error: string | null = null;
    try {
      const res = await fetch(feed.url, {
        headers: { "user-agent": "KintiBot/1.0 (+https://kinti.app)", accept: "text/calendar, */*" },
        redirect: "follow",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const parsed = parseIcal(text);

      const today = new Date().toISOString().slice(0, 10);
      const future = parsed
        .filter((e) => e.dateISO >= today)
        .sort((a, b) => a.dateISO.localeCompare(b.dateISO))
        .slice(0, FEED_MAX_EVENTS);

      // Friss állapot: a forrás jövőbeli eseményeit cseréljük.
      await db
        .prepare("DELETE FROM events WHERE source = ? AND event_date >= date('now')")
        .bind(feed.source_id)
        .run();

      if (future.length) {
        const stmt = db.prepare(
          `INSERT OR REPLACE INTO events
             (id, title, event_date, date_day, date_month, date_weekday, start_time,
              venue, going, tag, color, description, source, canton_code, status, moderation_status,
              moderation_decided_by, moderation_decision_at, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, 'approved', 1, 'ical-sync', datetime('now'), datetime('now'))`,
        );
        const batch = future.map((ev) => {
          const { day, month, weekday } = huDateParts(ev.dateISO);
          // URL-biztos ID (NINCS kettőspont — a source_id "ical:..." kettőspontját is cseréljük).
          const id = `${feed.source_id.replace(/:/g, "-")}-${tinyHash(ev.uid)}`;
          return stmt.bind(
            id,
            ev.summary.slice(0, 200),
            ev.dateISO,
            day,
            month,
            weekday,
            ev.startTime,
            ev.location?.slice(0, 200) ?? feed.label ?? null,
            feed.label?.slice(0, 60) ?? null,
            "#5b4a8c",
            ev.description?.slice(0, 1000) ?? null,
            feed.source_id,
            cantonFromAddress(ev.location ?? null)?.code ?? null,
          );
        });
        await db.batch(batch);
        imported = batch.length;
      }
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
    }

    await db
      .prepare("UPDATE event_feeds SET last_synced_at = datetime('now'), last_error = ?, events_count = ? WHERE id = ?")
      .bind(error, imported, feed.id)
      .run();

    out.push({ feedId: feed.id, label: feed.label, imported, error });
  }

  return out;
}

/**
 * Atomikus „igénylés": ha van legalább egy elavult, engedélyezett feed,
 * megjelöli azokat frissként és true-t ad — így párhuzamos kérések közül csak
 * EGY futtatja le ténylegesen a szinkront (a D1 sorosítja az írásokat).
 */
async function claimStaleFeedSync(): Promise<boolean> {
  const res = await getDB()
    .prepare(
      `UPDATE event_feeds SET last_synced_at = datetime('now')
       WHERE enabled = 1 AND (last_synced_at IS NULL OR last_synced_at < datetime('now', ?))`,
    )
    .bind(`-${FEED_SYNC_INTERVAL_HOURS} hours`)
    .run();
  return (res.meta.changes ?? 0) > 0;
}

/**
 * Lusta, forgalom-vezérelt szinkron háttérben (waitUntil-lel hívandó): ha a
 * feedek elavultak, lefuttatja a szinkront a válasz elküldése után. Nincs
 * szükség cronra — a látogatók forgalma frissíti az eseményeket. (Külön cron
 * is ráköthető a /api/cron/sync-events endpointra, ha pontosabb időzítés kell.)
 */
export async function kickoffEventFeedSync(): Promise<void> {
  try {
    // 1) Generált megemlékezések — feed NÉLKÜL is, hogy mindig legyen tartalom.
    await ensureGeneratedEvents(false);
    // 2) iCal feedek (ha vannak és elavultak).
    if (await claimStaleFeedSync()) {
      await syncEventFeeds();
    }
  } catch {
    // A háttér-szinkron hibája soha ne befolyásolja a kérést.
  }
}

/**
 * Generált, dátum-biztos megemlékezések upsert-elése (feed nélkül is).
 * Lustán: csak akkor ír, ha nincs ~10 hónapra előre lefedettség (`force=false`),
 * vagy ha kényszerítve van (`force=true`, pl. kézi/cron szinkronkor).
 */
export async function ensureGeneratedEvents(force: boolean): Promise<number> {
  const db = getDB();

  if (!force) {
    const row = await db
      .prepare(`SELECT MAX(event_date) AS maxd FROM events WHERE source = ?`)
      .bind(GENERATED_SOURCE)
      .first<{ maxd: string | null }>();
    const horizon = new Date();
    horizon.setUTCDate(horizon.getUTCDate() + 300);
    const horizonISO = horizon.toISOString().slice(0, 10);
    if (row?.maxd && row.maxd >= horizonISO) return 0; // már van bőven előre
  }

  const events = generateRecurringEvents();
  await db
    .prepare(`DELETE FROM events WHERE source = ? AND event_date >= date('now')`)
    .bind(GENERATED_SOURCE)
    .run();

  if (!events.length) return 0;
  const stmt = db.prepare(
    `INSERT OR REPLACE INTO events
       (id, title, event_date, date_day, date_month, date_weekday, start_time,
        venue, going, tag, color, description, source, status, moderation_status,
        moderation_decided_by, moderation_decision_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, NULL, ?, 0, ?, ?, ?, ?, 'approved', 1, 'auto-generated', datetime('now'), datetime('now'))`,
  );
  const batch = events.map((e) =>
    stmt.bind(
      e.id, e.title, e.eventDate, e.dateDay, e.dateMonth, e.dateWeekday,
      e.venue, e.tag, e.color, e.description, GENERATED_SOURCE,
    ),
  );
  await db.batch(batch);
  return batch.length;
}

/** Teljes szinkron (generált + feedek) — a /api/cron/sync-events endpointhoz. */
export async function runFullEventSync(): Promise<{ generated: number; feeds: FeedSyncResult[] }> {
  const generated = await ensureGeneratedEvents(true);
  const feeds = await syncEventFeeds();
  return { generated, feeds };
}

export interface PendingEvent {
  id: string; title: string; eventDate: string | null; startTime: string | null;
  venue: string | null; submitterEmail: string | null; token: string | null; createdAt: string;
}

export async function listPendingEvents(): Promise<PendingEvent[]> {
  const { results } = await getDB()
    .prepare("SELECT id,title,event_date,start_time,venue,email,token,created_at FROM events WHERE status = 'pending_admin' ORDER BY created_at DESC LIMIT 50")
    .all<{ id: string; title: string; event_date: string | null; start_time: string | null; venue: string | null; email: string | null; token: string | null; created_at: string; }>();
  return results.map((r) => ({
    id: r.id, title: r.title, eventDate: r.event_date, startTime: r.start_time,
    venue: r.venue, submitterEmail: r.email, token: r.token, createdAt: r.created_at,
  }));
}

export interface AdminContentRow {
  id: string; title: string; meta: string | null; createdAt: string | null; manageToken: string | null;
}

export async function listEventsForAdmin(): Promise<AdminContentRow[]> {
  const { results } = await getDB()
    .prepare("SELECT id, title, event_date, venue, status, created_at, manage_token FROM events ORDER BY created_at DESC LIMIT 200")
    .all<{ id: string; title: string; event_date: string | null; venue: string | null; status: string | null; created_at: string; manage_token: string | null }>();
  return results.map((r) => ({
    id: r.id, title: r.title, meta: `${r.status ?? "?"}${r.event_date ? " · " + r.event_date : ""}${r.venue ? " · " + r.venue : ""}`,
    createdAt: r.created_at, manageToken: r.manage_token,
  }));
}
