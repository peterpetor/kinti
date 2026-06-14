/**
 * repo-claims.ts — „Foglald el a vállalkozásod" (business claims).
 *
 * A nem megerősített (claimed = 0) listákat a tulajdonos átveheti: beküld egy
 * claim-kérést → admin jóváhagyja → a vállalkozás claimed = 1 lesz és kap egy
 * manage_token-t (a meglévő kezelő-link infra), amivel szerkesztheti.
 */

import { getDB } from "./cloudflare";

export type ClaimStatus = "pending" | "approved" | "rejected";

export interface BusinessClaim {
  id: string;
  businessId: string;
  businessName: string | null;
  claimantName: string | null;
  claimantEmail: string;
  claimantPhone: string | null;
  message: string | null;
  status: ClaimStatus;
  createdAt: string;
  decidedAt: string | null;
  decidedBy: string | null;
}

interface ClaimRow {
  id: string; business_id: string; business_name: string | null;
  claimant_name: string | null; claimant_email: string; claimant_phone: string | null;
  message: string | null; status: ClaimStatus; created_at: string;
  decided_at: string | null; decided_by: string | null;
}

function toClaim(r: ClaimRow): BusinessClaim {
  return {
    id: r.id, businessId: r.business_id, businessName: r.business_name,
    claimantName: r.claimant_name, claimantEmail: r.claimant_email, claimantPhone: r.claimant_phone,
    message: r.message, status: r.status, createdAt: r.created_at,
    decidedAt: r.decided_at, decidedBy: r.decided_by,
  };
}

export interface CreateClaimInput {
  businessId: string;
  claimantName?: string | null;
  claimantEmail: string;
  claimantPhone?: string | null;
  message?: string | null;
  ipHash?: string | null;
}

/** Új claim-kérés. Csak akkor enged, ha a vállalkozás létezik és NEM megerősített. */
export async function createBusinessClaim(
  input: CreateClaimInput,
): Promise<{ ok: true; id: string; businessName: string } | { ok: false; error: string }> {
  const db = getDB();
  const biz = await db
    .prepare("SELECT id, name, claimed FROM businesses WHERE id = ? AND COALESCE(hidden,0) = 0")
    .bind(input.businessId)
    .first<{ id: string; name: string; claimed: number | null }>();
  if (!biz) return { ok: false, error: "A vállalkozás nem található." };
  if ((biz.claimed ?? 1) === 1) return { ok: false, error: "Ez a vállalkozás már megerősített." };

  // Egyszerű spam-fék: ugyanarra a vállalkozásra ne legyen sok nyitott kérés.
  const open = await db
    .prepare("SELECT COUNT(*) AS n FROM business_claims WHERE business_id = ? AND status = 'pending'")
    .bind(input.businessId)
    .first<{ n: number }>();
  if ((open?.n ?? 0) >= 5) return { ok: false, error: "Erre a vállalkozásra már túl sok igénylés érkezett. Írj az info@kinti.app címre." };

  const id = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO business_claims (id, business_id, claimant_name, claimant_email, claimant_phone, message, ip_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id, input.businessId, input.claimantName ?? null, input.claimantEmail,
      input.claimantPhone ?? null, input.message ?? null, input.ipHash ?? null,
    )
    .run();
  return { ok: true, id, businessName: biz.name };
}

export async function listBusinessClaims(status: ClaimStatus = "pending"): Promise<BusinessClaim[]> {
  const { results } = await getDB()
    .prepare(
      `SELECT c.*, b.name AS business_name
       FROM business_claims c LEFT JOIN businesses b ON b.id = c.business_id
       WHERE c.status = ? ORDER BY c.created_at DESC LIMIT 100`,
    )
    .bind(status)
    .all<ClaimRow>();
  return results.map(toClaim);
}

export async function countPendingBusinessClaims(): Promise<number> {
  const row = await getDB()
    .prepare("SELECT COUNT(*) AS n FROM business_claims WHERE status = 'pending'")
    .first<{ n: number }>();
  return row?.n ?? 0;
}

/**
 * Claim jóváhagyása: a vállalkozás claimed = 1 lesz, és kap egy manage_token-t
 * (ha még nincs). Visszaadja a manage-token-t, hogy emailben elküldhessük.
 */
export async function approveBusinessClaim(
  claimId: string,
  adminUserId: string,
): Promise<{ ok: true; manageToken: string; businessId: string; claimantEmail: string } | { ok: false; error: string }> {
  const db = getDB();
  const claim = await db
    .prepare("SELECT * FROM business_claims WHERE id = ?")
    .bind(claimId)
    .first<ClaimRow>();
  if (!claim) return { ok: false, error: "A claim nem található." };
  if (claim.status !== "pending") return { ok: false, error: "Ez a claim már el lett bírálva." };

  const biz = await db
    .prepare("SELECT id, manage_token FROM businesses WHERE id = ?")
    .bind(claim.business_id)
    .first<{ id: string; manage_token: string | null }>();
  if (!biz) return { ok: false, error: "A vállalkozás már nem létezik." };

  const manageToken = biz.manage_token ?? crypto.randomUUID();
  await db
    .prepare("UPDATE businesses SET claimed = 1, manage_token = ?, contact_email = COALESCE(contact_email, ?), updated_at = datetime('now') WHERE id = ?")
    .bind(manageToken, claim.claimant_email, claim.business_id)
    .run();
  await db
    .prepare("UPDATE business_claims SET status = 'approved', decided_at = datetime('now'), decided_by = ? WHERE id = ?")
    .bind(adminUserId, claimId)
    .run();

  return { ok: true, manageToken, businessId: claim.business_id, claimantEmail: claim.claimant_email };
}

export async function rejectBusinessClaim(claimId: string, adminUserId: string): Promise<boolean> {
  const res = await getDB()
    .prepare("UPDATE business_claims SET status = 'rejected', decided_at = datetime('now'), decided_by = ? WHERE id = ? AND status = 'pending'")
    .bind(adminUserId, claimId)
    .run();
  return (res.meta.changes ?? 0) > 0;
}
