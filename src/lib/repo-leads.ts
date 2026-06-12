/**
 * repo-leads.ts — Beérkező ajánlatkérések (business_leads) adatrétege.
 * A vállalkozó in-app „Ajánlatkérés-postaládájához" (Szaknévsor PRO).
 */
import { getDB } from "./cloudflare";

export type LeadStatus = "new" | "contacted" | "archived";

export interface BusinessLead {
  id: string;
  businessId: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string | null;
  categoryLabel: string | null;
  message: string;
  status: string;
  createdAt: string;
}

interface BusinessLeadRow {
  id: string; business_id: string; sender_name: string; sender_email: string;
  sender_phone: string | null; category_label: string | null; message: string;
  status: string; created_at: string;
}

function toLead(r: BusinessLeadRow): BusinessLead {
  return {
    id: r.id, businessId: r.business_id, senderName: r.sender_name, senderEmail: r.sender_email,
    senderPhone: r.sender_phone, categoryLabel: r.category_label, message: r.message,
    status: r.status, createdAt: r.created_at,
  };
}

export interface CreateBusinessLeadInput {
  businessId: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string | null;
  categoryLabel: string | null;
  message: string;
}

/** Egy beérkező ajánlatkérés mentése. Best-effort: hibát NEM dob (az email amúgy is ment). */
export async function createBusinessLead(input: CreateBusinessLeadInput): Promise<void> {
  try {
    await getDB()
      .prepare(
        `INSERT INTO business_leads (id, business_id, sender_name, sender_email, sender_phone, category_label, message)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        crypto.randomUUID(), input.businessId, input.senderName, input.senderEmail,
        input.senderPhone, input.categoryLabel, input.message,
      )
      .run();
  } catch (err) {
    console.error("[repo-leads] createBusinessLead failed:", err);
  }
}

/** Egy vállalkozás beérkezett ajánlatkérései, legújabb elöl. */
export async function getBusinessLeads(businessId: string, limit = 100): Promise<BusinessLead[]> {
  const { results } = await getDB()
    .prepare("SELECT * FROM business_leads WHERE business_id = ? ORDER BY created_at DESC LIMIT ?")
    .bind(businessId, limit)
    .all<BusinessLeadRow>();
  return results.map(toLead);
}

/** Új (még nem kezelt) ajánlatkérések száma egy vállalkozáshoz. */
export async function countNewBusinessLeads(businessId: string): Promise<number> {
  try {
    const row = await getDB()
      .prepare("SELECT COUNT(*) AS n FROM business_leads WHERE business_id = ? AND status = 'new'")
      .bind(businessId)
      .first<{ n: number }>();
    return row?.n ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Lead státusz frissítése — a business_id-re is szűr, így csak a SAJÁT
 * vállalkozás lead-jét lehet módosítani (IDOR-védelem).
 */
export async function setBusinessLeadStatus(
  leadId: string,
  businessId: string,
  status: LeadStatus,
): Promise<boolean> {
  const res = await getDB()
    .prepare("UPDATE business_leads SET status = ? WHERE id = ? AND business_id = ?")
    .bind(status, leadId, businessId)
    .run();
  return (res.meta?.changes ?? 0) > 0;
}
