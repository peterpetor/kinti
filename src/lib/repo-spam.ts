/**
 * repo-spam.ts — Moderáció, tartalmi jelentések, blocklist és anti-spam.
 */
import { getDB } from "./cloudflare";

export type ModerationTable = "reviews" | "businesses" | "service_requests" | "stories";
export type ModerationDecision = "approved" | "rejected" | "pending";

const MODERATION_TABLE_WHITELIST: Set<ModerationTable> = new Set(["reviews", "businesses", "service_requests", "stories"]);

function assertModerationTable(t: ModerationTable): void {
  if (!MODERATION_TABLE_WHITELIST.has(t)) throw new Error(`Ismeretlen moderation-tábla: ${t}`);
}

export interface ModerationQueueItem {
  table: ModerationTable; id: string; title: string; preview: string; createdAt: string | null;
  submitterEmail: string | null; submitterIpHash: string | null; imageKey: string | null;
  moderationStatus: number; moderationDecisionAt: string | null; moderationDecidedBy: string | null;
}

/** A businesses táblának van country_code-ja; a reviews-nek nincs (ott a szűrő no-op). */
function moderationHasCountry(table: ModerationTable): boolean {
  return table === "businesses" || table === "service_requests" || table === "stories";
}

export async function listModerationQueue(table: ModerationTable, status: 0 | 1 | 2, limit = 50, country?: string | null): Promise<ModerationQueueItem[]> {
  assertModerationTable(table);
  const db = getDB();
  const fields: Record<ModerationTable, { title: string; preview: string; createdAt: string; email: string; ip: string; image: string }> = {
    reviews: { title: "reviewer_name", preview: "body", createdAt: "published_at", email: "email", ip: "ip_hash", image: "''" },
    businesses: { title: "name", preview: "COALESCE(blurb, address, '')", createdAt: "COALESCE(updated_at, '')", email: "COALESCE(contact_email, '')", ip: "''", image: "logo_key" },
    service_requests: { title: "title", preview: "COALESCE(description, contact, '')", createdAt: "created_at", email: "''", ip: "ip_hash", image: "''" },
    stories: { title: "title", preview: "COALESCE(summary, substr(body_md, 1, 200))", createdAt: "created_at", email: "COALESCE(contact_email, '')", ip: "ip_hash", image: "image_key" },
  };
  const f = fields[table];
  const useCountry = !!country && country !== "all" && moderationHasCountry(table);
  const sql = `SELECT id, ${f.title} AS title, ${f.preview} AS preview, ${f.createdAt} AS createdAt,
                      ${f.email} AS submitterEmail, ${f.ip} AS submitterIpHash, ${f.image} AS imageKey,
                      moderation_status AS moderationStatus, moderation_decision_at AS moderationDecisionAt,
                      moderation_decided_by AS moderationDecidedBy
               FROM ${table} WHERE moderation_status = ? ${useCountry ? "AND country_code = ?" : ""} ORDER BY createdAt DESC LIMIT ?`;
  const binds = useCountry ? [status, country, limit] : [status, limit];
  const { results } = await db.prepare(sql).bind(...binds).all<{
    id: string; title: string | null; preview: string | null; createdAt: string | null;
    submitterEmail: string | null; submitterIpHash: string | null; imageKey: string | null;
    moderationStatus: number; moderationDecisionAt: string | null; moderationDecidedBy: string | null;
  }>();
  return results.map((r) => ({
    table, id: r.id, title: r.title ?? "", preview: (r.preview ?? "").slice(0, 200),
    createdAt: r.createdAt, submitterEmail: r.submitterEmail || null, submitterIpHash: r.submitterIpHash || null,
    imageKey: r.imageKey || null, moderationStatus: r.moderationStatus,
    moderationDecisionAt: r.moderationDecisionAt, moderationDecidedBy: r.moderationDecidedBy,
  }));
}

export async function moderationCount(table: ModerationTable, status: 0 | 1 | 2, country?: string | null): Promise<number> {
  assertModerationTable(table);
  const useCountry = !!country && country !== "all" && moderationHasCountry(table);
  const sql = `SELECT COUNT(*) AS n FROM ${table} WHERE moderation_status = ? ${useCountry ? "AND country_code = ?" : ""}`;
  const binds = useCountry ? [status, country] : [status];
  const row = await getDB().prepare(sql).bind(...binds).first<{ n: number }>();
  return row?.n ?? 0;
}

export async function setModerationStatus(table: ModerationTable, id: string, status: 0 | 1 | 2, adminUserId: string): Promise<boolean> {
  assertModerationTable(table);
  const res = await getDB().prepare(`UPDATE ${table} SET moderation_status = ?, moderation_decision_at = datetime('now'), moderation_decided_by = ? WHERE id = ?`).bind(status, adminUserId, id).run();
  return (res.meta.changes ?? 0) > 0;
}

// --- Blocklist ---------------------------------------------------------------

export type BlocklistKind = "ip_hash" | "email_hash";

export interface BlocklistEntry {
  id: string; kind: BlocklistKind; value: string; reason: string | null;
  createdAt: string; createdBy: string; active: boolean;
  /** null = végleges (kézi admin-tiltás); dátum = auto-lejáró (pl. honeypot 7 nap). */
  expiresAt: string | null;
}

interface BlocklistRow {
  id: string; kind: string; value: string; reason: string | null;
  created_at: string; created_by: string; active: number; expires_at: string | null;
}

function toBlocklistEntry(r: BlocklistRow): BlocklistEntry {
  return { id: r.id, kind: r.kind as BlocklistKind, value: r.value, reason: r.reason, createdAt: r.created_at, createdBy: r.created_by, active: r.active === 1, expiresAt: r.expires_at ?? null };
}

export async function isBlocked(kind: BlocklistKind, value: string | null): Promise<boolean> {
  if (!value) return false;
  try {
    // A lejárt auto-tiltás (expires_at a múltban) MÁR NEM blokkol (biztonsági szelep).
    const row = await getDB().prepare(
      `SELECT 1 AS x FROM blocklist
        WHERE kind = ? AND value = ? AND active = 1
          AND (expires_at IS NULL OR expires_at > datetime('now'))
        LIMIT 1`,
    ).bind(kind, value).first<{ x: number }>();
    return !!row;
  } catch { return false; }
}

export async function isSubmitterBlocked(params: { ipHash: string | null; emailHash: string | null }): Promise<boolean> {
  if (await isBlocked("ip_hash", params.ipHash)) return true;
  if (await isBlocked("email_hash", params.emailHash)) return true;
  return false;
}

export async function listBlocklist(): Promise<BlocklistEntry[]> {
  try {
    const { results } = await getDB().prepare(`SELECT * FROM blocklist ORDER BY active DESC, created_at DESC LIMIT 200`).all<BlocklistRow>();
    return results.map(toBlocklistEntry);
  } catch { return []; }
}

export async function addToBlocklist(params: {
  kind: BlocklistKind;
  value: string;
  reason: string | null;
  adminUserId: string;
  /** Auto-lejárat napokban (pl. honeypot 7). Elhagyva/0 → VÉGLEGES (expires_at NULL). */
  ttlDays?: number | null;
}): Promise<BlocklistEntry | null> {
  const id = crypto.randomUUID();
  const hasTtl = typeof params.ttlDays === "number" && params.ttlDays > 0;
  // A TTL-t a DB számolja (konzisztens óra, azonos datetime-formátum a compare-hez).
  const expiresExpr = hasTtl ? "datetime('now', '+' || ? || ' days')" : "NULL";
  try {
    // ON CONFLICT: egy meglévő tiltást SOHA nem rövidítünk — ha bármelyik oldal
    // VÉGLEGES (NULL), végleges marad; két auto-tiltásnál a KÉSŐBBI lejárat nyer
    // (a honeypot újra-triggerelése így csúszóablakként meghosszabbít, de egy kézi
    // admin-permabant nem downgrade-el).
    const sql =
      `INSERT INTO blocklist (id, kind, value, reason, created_by, active, expires_at)
       VALUES (?, ?, ?, ?, ?, 1, ${expiresExpr})
       ON CONFLICT(kind, value) DO UPDATE SET
         reason = excluded.reason, active = 1,
         created_at = datetime('now'), created_by = excluded.created_by,
         expires_at = CASE
           WHEN blocklist.expires_at IS NULL OR excluded.expires_at IS NULL THEN NULL
           ELSE MAX(blocklist.expires_at, excluded.expires_at)
         END`;
    const binds = hasTtl
      ? [id, params.kind, params.value, params.reason, params.adminUserId, params.ttlDays]
      : [id, params.kind, params.value, params.reason, params.adminUserId];
    await getDB().prepare(sql).bind(...binds).run();
  } catch { return null; }
  const row = await getDB().prepare(`SELECT * FROM blocklist WHERE kind = ? AND value = ? LIMIT 1`).bind(params.kind, params.value).first<BlocklistRow>();
  return row ? toBlocklistEntry(row) : null;
}

export async function deactivateBlocklistEntry(id: string): Promise<boolean> {
  const res = await getDB().prepare(`UPDATE blocklist SET active = 0 WHERE id = ?`).bind(id).run();
  return (res.meta.changes ?? 0) > 0;
}

/** Lejárt AUTO-tiltások (expires_at a múltban) végleges törlése — napi cronból.
 *  A kézi (végleges, expires_at NULL) és az aktív auto-tiltásokat nem érinti. */
export async function purgeExpiredBlocklist(): Promise<number> {
  try {
    const res = await getDB().prepare(
      `DELETE FROM blocklist WHERE expires_at IS NOT NULL AND expires_at <= datetime('now')`,
    ).run();
    return res.meta.changes ?? 0;
  } catch { return 0; }
}

export async function logModerationStrike(ipHash: string | null, reason: string): Promise<void> {
  if (!ipHash) return;
  const db = getDB();
  const id = crypto.randomUUID();
  await db.prepare("INSERT INTO moderation_strikes (id, ip_hash, reason) VALUES (?, ?, ?)").bind(id, ipHash, reason.slice(0, 200)).run();
  const countRow = await db.prepare("SELECT COUNT(*) AS cnt FROM moderation_strikes WHERE ip_hash = ? AND created_at > datetime('now', '-1 hour')").bind(ipHash).first<{ cnt: number }>();
  const cnt = countRow?.cnt ?? 0;
  if (cnt >= 3) {
    const existing = await db.prepare("SELECT id FROM blocklist WHERE kind = 'ip_hash' AND value = ? AND active = 1").bind(ipHash).first();
    if (!existing) await addToBlocklist({ kind: "ip_hash", value: ipHash, reason: "Auto-ban: Sorozatos (3x) tiltott tartalom beküldési kísérlet 1 órán belül.", adminUserId: "system-auto-ban" });
  }
}

// --- Content Reports (Notice & Takedown) -------------------------------------

/** DSA-bejelenthető tartalom-típusok — bővítésnél MIND a report route, a
 *  moderate route ÉS a lenti listOpenReports ágait is bővítsd (különben az
 *  ismeretlen típusú nyitott bejelentést a lista auto-dismissed-re tenné). */
export type ReportContentType = "business" | "review" | "sos" | "b2b" | "story" | "request";

export interface ContentReportInput { id: string; contentType: ReportContentType; contentId: string; reason: string | null; reporterIpHash: string | null; moderateToken: string; }
export interface ContentReport { id: string; contentType: ReportContentType; contentId: string; status: string; }

export async function createContentReport(input: ContentReportInput): Promise<void> {
  await getDB().prepare(`INSERT INTO content_reports (id, content_type, content_id, reason, reporter_ip_hash, moderate_token) VALUES (?, ?, ?, ?, ?, ?)`)
    .bind(input.id, input.contentType, input.contentId, input.reason, input.reporterIpHash, input.moderateToken).run();
}

export async function getContentReportByToken(token: string): Promise<ContentReport | null> {
  const row = await getDB().prepare("SELECT id, content_type, content_id, status FROM content_reports WHERE moderate_token = ?").bind(token).first<{ id: string; content_type: string; content_id: string; status: string }>();
  if (!row) return null;
  return { id: row.id, contentType: row.content_type as ContentReport["contentType"], contentId: row.content_id, status: row.status };
}

export async function updateContentReportStatus(token: string, status: string): Promise<void> {
  await getDB().prepare("UPDATE content_reports SET status = ? WHERE moderate_token = ?").bind(status, token).run();
}

export async function countRecentReports(ipHash: string | null): Promise<number> {
  if (!ipHash) return 0;
  const res = await getDB().prepare(`SELECT COUNT(*) AS n FROM content_reports WHERE reporter_ip_hash = ? AND created_at >= datetime('now', '-1 hour')`).bind(ipHash).first<{ n: number }>();
  return res?.n ?? 0;
}


export async function countRecentSpamLog(kind: string, ipHash: string | null, windowMinutes: number = 60): Promise<number> {
  if (!ipHash) return 0;
  const res = await getDB()
    .prepare(`SELECT COUNT(*) AS n FROM spam_log WHERE kind = ? AND ip_hash = ? AND created_at >= datetime('now', ?)`)
    .bind(kind, ipHash, `-${Math.max(1, windowMinutes)} minutes`)
    .first<{ n: number }>();
  return res?.n ?? 0;
}

export async function logSpamSubmit(kind: string, ipHash: string | null): Promise<void> {
  const id = crypto.randomUUID();
  await getDB()
    .prepare(`INSERT INTO spam_log (id, kind, ip_hash) VALUES (?, ?, ?)`)
    .bind(id, kind, ipHash)
    .run();
}

export interface OpenReport { id: string; contentType: ReportContentType; contentId: string; reason: string | null; moderateToken: string; createdAt: string; excerpt: string | null; }

export async function listOpenReports(): Promise<OpenReport[]> {
  const db = getDB();
  const { results } = await db.prepare(`SELECT id, content_type, content_id, reason, moderate_token, created_at FROM content_reports WHERE status = 'open' ORDER BY created_at DESC LIMIT 100`).all<{
    id: string; content_type: string; content_id: string; reason: string | null; moderate_token: string; created_at: string;
  }>();
  if (results.length === 0) return [];

  // A hivatkozott tartalmak TÍPUSONKÉNT CSOPORTOSÍTVA (N+1 helyett max 6 query).
  // ⚠️ ÚJ report-típusnál ide IS vegyél fel ágat — ismeretlen típus „nem létező
  // tartalomnak" számít, és a reportja CSENDBEN dismisselődik!
  const idsByType = new Map<string, Set<string>>();
  for (const r of results) {
    const set = idsByType.get(r.content_type) ?? new Set<string>();
    set.add(r.content_id);
    idsByType.set(r.content_type, set);
  }
  // `${type}:${id}` → excerpt; a kulcs MEGLÉTE = a tartalom létezik (a null
  // excerpt is érvényes, pl. sos).
  const found = new Map<string, string | null>();
  const fetchBatch = async (
    type: string,
    columns: string,
    table: string,
    toExcerpt: (row: Record<string, string | null>) => string | null,
  ) => {
    const list = [...(idsByType.get(type) ?? [])];
    if (list.length === 0) return;
    const ph = list.map(() => "?").join(",");
    const { results: rows } = await db
      .prepare(`SELECT ${columns} FROM ${table} WHERE id IN (${ph})`)
      .bind(...list)
      .all<Record<string, string | null>>();
    for (const row of rows) found.set(`${type}:${row.id}`, toExcerpt(row));
  };
  await Promise.all([
    fetchBatch("review", "id, reviewer_name, body", "reviews", (r) => `${r.reviewer_name}: ${(r.body ?? "").slice(0, 100)}`),
    fetchBatch("business", "id, name", "businesses", (r) => r.name ?? null),
    fetchBatch("sos", "id", "sos_alerts", () => null),
    fetchBatch("b2b", "id, title", "b2b_projects", (r) => r.title ?? null),
    fetchBatch("story", "id, title", "stories", (r) => r.title ?? null),
    fetchBatch("request", "id, title", "service_requests", (r) => r.title ?? null),
  ]);

  const out: OpenReport[] = [];
  const dismissIds: string[] = [];
  for (const r of results) {
    const key = `${r.content_type}:${r.content_id}`;
    if (!found.has(key)) { dismissIds.push(r.id); continue; }
    out.push({ id: r.id, contentType: r.content_type as OpenReport["contentType"], contentId: r.content_id, reason: r.reason, moderateToken: r.moderate_token, createdAt: r.created_at, excerpt: found.get(key) ?? null });
  }
  // Törölt tartalmú reportok kötegelt lezárása (egy UPDATE a soronkénti helyett).
  if (dismissIds.length > 0) {
    const ph = dismissIds.map(() => "?").join(",");
    await db.prepare(`UPDATE content_reports SET status = 'dismissed' WHERE id IN (${ph})`).bind(...dismissIds).run();
  }
  return out;
}
