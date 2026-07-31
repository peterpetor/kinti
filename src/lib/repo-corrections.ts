/**
 * repo-corrections.ts — „Javíts rajta" adatjavítási javaslatok.
 *
 * ⚠️ A JAVASLAT SOSEM ÍRJA FELÜL AUTOMATIKUSAN A PUBLIKUS ADATOT — csak sorba
 * áll, admin dönt (ld. 0144 migráció). És a bejelentéssel ellentétben NEM
 * rejti el a vállalkozást: egy elgépelt telefonszám miatt nem tűnhet el egy
 * működő cég.
 */
import { getDB } from "./cloudflare";
// ⚠️ A mezőkészlet TISZTA modulban él (nincs benne D1-import), mert a kliens
// űrlap és a teszt is importálja — ld. lib/correction-fields.ts.
import type { CorrectionField } from "./correction-fields";

export type { CorrectionField };

export interface BusinessCorrection {
  id: string;
  businessId: string;
  field: string;
  suggestion: string | null;
  note: string | null;
  status: string;
  reporterIpHash: string | null;
  createdAt: string;
}

interface Row {
  id: string; business_id: string; field: string; suggestion: string | null;
  note: string | null; status: string; reporter_ip_hash: string | null; created_at: string;
}

function toCorrection(r: Row): BusinessCorrection {
  return {
    id: r.id, businessId: r.business_id, field: r.field, suggestion: r.suggestion,
    note: r.note, status: r.status, reporterIpHash: r.reporter_ip_hash, createdAt: r.created_at,
  };
}

export async function createCorrection(input: {
  id: string;
  businessId: string;
  field: CorrectionField;
  suggestion: string | null;
  note: string | null;
  reporterIpHash: string | null;
}): Promise<void> {
  await getDB()
    .prepare(
      `INSERT INTO business_corrections (id, business_id, field, suggestion, note, reporter_ip_hash)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(input.id, input.businessId, input.field, input.suggestion, input.note, input.reporterIpHash)
    .run();
}

/** Egy bejelentőtől az elmúlt órában érkezett javaslatok száma (visszaélés-fék). */
export async function countRecentCorrections(ipHash: string | null): Promise<number> {
  if (!ipHash) return 0;
  const r = await getDB()
    .prepare(
      `SELECT COUNT(*) AS n FROM business_corrections
        WHERE reporter_ip_hash = ? AND created_at >= datetime('now', '-1 hour')`,
    )
    .bind(ipHash)
    .first<{ n: number }>();
  return r?.n ?? 0;
}

/** Javaslatok az admin-áttekintőhöz (legfrissebb elöl). */
export async function listCorrections(
  opts: { status?: string | null; limit?: number } = {},
): Promise<BusinessCorrection[]> {
  const limit = Math.max(1, Math.min(opts.limit ?? 100, 500));
  const binds: unknown[] = [];
  let where = "";
  if (opts.status && opts.status !== "all") {
    where = "WHERE status = ?";
    binds.push(opts.status);
  }
  const { results } = await getDB()
    .prepare(
      `SELECT id, business_id, field, suggestion, note, status, reporter_ip_hash, created_at
         FROM business_corrections ${where} ORDER BY created_at DESC LIMIT ${limit}`,
    )
    .bind(...binds)
    .all<Row>();
  return (results ?? []).map(toCorrection);
}

/** Lezárás: 'applied' (átvezettem) vagy 'rejected' (elvetve). */
export async function resolveCorrection(
  id: string,
  status: "applied" | "rejected",
  adminUserId: string,
): Promise<void> {
  await getDB()
    .prepare(
      `UPDATE business_corrections
          SET status = ?, resolved_at = datetime('now'), resolved_by = ?
        WHERE id = ? AND status = 'open'`,
    )
    .bind(status, adminUserId, id)
    .run();
}
