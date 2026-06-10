/**
 * Admin audit trail — minden admin moderációs döntés naplózása az
 * `admin_audit_log` táblába (0052 migráció). A logolás best-effort: ha
 * hibázik, NEM töri meg a fő műveletet (a döntés akkor is végrehajtódik).
 */
import { getDB } from "./cloudflare";

export type AuditActionType = "approve" | "reject" | "block" | "verify" | "delete";

export interface AdminAuditEntry {
  id: string;
  adminUserId: string;
  actionType: string;
  targetType: string;
  targetId: string | null;
  ipHash: string | null;
  reason: string | null;
  details: string | null;
  createdAt: string;
}

interface AdminAuditRow {
  id: string; admin_user_id: string; action_type: string; target_type: string;
  target_id: string | null; ip_hash: string | null; reason: string | null;
  details: string | null; created_at: string;
}

function toEntry(r: AdminAuditRow): AdminAuditEntry {
  return {
    id: r.id, adminUserId: r.admin_user_id, actionType: r.action_type,
    targetType: r.target_type, targetId: r.target_id, ipHash: r.ip_hash,
    reason: r.reason, details: r.details, createdAt: r.created_at,
  };
}

/** Egy admin-döntés naplózása. Best-effort — sosem dob. */
export async function logAdminAction(input: {
  adminUserId: string;
  actionType: AuditActionType;
  targetType: string;
  targetId?: string | null;
  ipHash?: string | null;
  reason?: string | null;
  details?: string | null;
}): Promise<void> {
  try {
    await getDB()
      .prepare(
        `INSERT INTO admin_audit_log (id, admin_user_id, action_type, target_type, target_id, ip_hash, reason, details)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        crypto.randomUUID(), input.adminUserId, input.actionType, input.targetType,
        input.targetId ?? null, input.ipHash ?? null, input.reason ?? null, input.details ?? null,
      )
      .run();
  } catch (err) {
    console.error("[audit] logAdminAction failed:", err);
  }
}

/** A legutóbbi N audit-bejegyzés, legújabb elöl. */
export async function getRecentAuditLog(limit = 50): Promise<AdminAuditEntry[]> {
  try {
    const { results } = await getDB()
      .prepare("SELECT * FROM admin_audit_log ORDER BY created_at DESC LIMIT ?")
      .bind(limit)
      .all<AdminAuditRow>();
    return results.map(toEntry);
  } catch {
    return [];
  }
}

export interface AuditStats {
  actions24h: number;
  rejections24h: number;
  blocks24h: number;
}

/** 24 órás összesítők a dashboardhoz. Hiba esetén nullák. */
export async function getAuditStats(): Promise<AuditStats> {
  try {
    const row = await getDB()
      .prepare(
        `SELECT
           COUNT(*) AS actions,
           SUM(CASE WHEN action_type = 'reject' THEN 1 ELSE 0 END) AS rejections,
           SUM(CASE WHEN action_type = 'block'  THEN 1 ELSE 0 END) AS blocks
         FROM admin_audit_log
         WHERE created_at >= datetime('now', '-24 hours')`,
      )
      .first<{ actions: number; rejections: number | null; blocks: number | null }>();
    return {
      actions24h: row?.actions ?? 0,
      rejections24h: row?.rejections ?? 0,
      blocks24h: row?.blocks ?? 0,
    };
  } catch {
    return { actions24h: 0, rejections24h: 0, blocks24h: 0 };
  }
}
