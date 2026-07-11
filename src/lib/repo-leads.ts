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
  /** true = azonnali first-ping email ment, false = csak digest-be kerül */
  firstPingSent?: boolean;
  /** true = a havi ingyenes kereten felüli (kontakt elrejtve a nem-PRO cégtől) */
  locked?: boolean;
}

/** Egy beérkező ajánlatkérés mentése. Best-effort: hibát NEM dob (az email amúgy is ment). */
export async function createBusinessLead(input: CreateBusinessLeadInput): Promise<void> {
  try {
    await getDB()
      .prepare(
        `INSERT INTO business_leads
           (id, business_id, sender_name, sender_email, sender_phone, category_label, message, first_ping_sent, locked)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        crypto.randomUUID(), input.businessId, input.senderName, input.senderEmail,
        input.senderPhone, input.categoryLabel, input.message,
        input.firstPingSent ? 1 : 0, input.locked ? 1 : 0,
      )
      .run();
  } catch (err) {
    console.error("[repo-leads] createBusinessLead failed:", err);
  }
}

/** Vélemény-nudge-ra esedékes lead (3–10 napja kelt, még nem nudge-olt). */
export interface ReviewNudgeLead {
  id: string;
  businessId: string;
  businessName: string;
  senderName: string;
  senderEmail: string;
}

/**
 * A vélemény-gyűjtő nudge-ra esedékes leadek: 3 napnál régebbi, 10 napnál
 * frissebb (a nagyon régi lead-eket nem zaklatjuk), még nudge-olatlan, és a
 * vállalkozás látható. A limit a Resend napi keret védelme (a hívó dedupol
 * email+business szinten és a meglévő véleményt is kihagyja).
 */
export async function getLeadsDueReviewNudge(limit = 40): Promise<ReviewNudgeLead[]> {
  const { results } = await getDB()
    .prepare(
      `SELECT l.id, l.business_id, l.sender_name, l.sender_email, b.name AS business_name
       FROM business_leads l
       JOIN businesses b ON b.id = l.business_id AND b.moderation_status = 1 AND b.hidden = 0
       WHERE l.review_nudge_at IS NULL
         AND l.created_at <= datetime('now', '-3 days')
         AND l.created_at >= datetime('now', '-10 days')
       ORDER BY l.created_at ASC
       LIMIT ?`,
    )
    .bind(limit)
    .all<{ id: string; business_id: string; sender_name: string; sender_email: string; business_name: string }>();
  return results.map((r) => ({
    id: r.id,
    businessId: r.business_id,
    businessName: r.business_name,
    senderName: r.sender_name,
    senderEmail: r.sender_email,
  }));
}

/** A nudge kiküldésének (vagy kihagyásának) rögzítése — lead-enként EGYSZER fut. */
export async function markLeadReviewNudged(leadId: string): Promise<void> {
  await getDB()
    .prepare("UPDATE business_leads SET review_nudge_at = datetime('now') WHERE id = ?")
    .bind(leadId)
    .run();
}

/** Egy vállalkozás beérkezett ajánlatkérései, legújabb elöl. */
export async function getBusinessLeads(businessId: string, limit = 100): Promise<BusinessLead[]> {
  const { results } = await getDB()
    .prepare("SELECT * FROM business_leads WHERE business_id = ? ORDER BY created_at DESC LIMIT ?")
    .bind(businessId, limit)
    .all<BusinessLeadRow>();
  return results.map(toLead);
}

/** A havi ingyenes lead-keret (efölött PRO kell a kontakt-adatok feloldásához). */
export const FREE_LEADS_PER_MONTH = 5;

/**
 * Lead-darabszámok egy vállalkozáshoz: ebben a naptári hónapban és az elmúlt 7 napban.
 * A freemium-keret (5/hó) és a dashboard FOMO-számláló forrása.
 */
export async function getLeadCounts(businessId: string): Promise<{ month: number; week: number }> {
  try {
    const row = await getDB()
      .prepare(
        `SELECT
           SUM(CASE WHEN created_at >= strftime('%Y-%m-01 00:00:00','now') THEN 1 ELSE 0 END) AS month,
           SUM(CASE WHEN created_at >= datetime('now','-7 days') THEN 1 ELSE 0 END) AS week
         FROM business_leads WHERE business_id = ?`,
      )
      .bind(businessId)
      .first<{ month: number | null; week: number | null }>();
    return { month: row?.month ?? 0, week: row?.week ?? 0 };
  } catch {
    return { month: 0, week: 0 };
  }
}

/**
 * Egy vállalkozás ebben a naptári hónapban kapott FELOLDOTT lead-jeinek száma (a lead
 * BESZÚRÁSA ELŐTT hívva → ha >= FREE_LEADS_PER_MONTH és nem PRO, az új lead már a
 * kereten felüli). Az email-kapuhoz (locked vs teljes értesítő). A zárolt leadek
 * SZÁNDÉKOSAN nem számítanak bele: a csoportos ajánlatkérés extra (mindig zárolt)
 * címzettjei nem fogyaszthatják el a cég havi 5 ingyenes keretét.
 */
export async function countBusinessLeadsThisMonth(businessId: string): Promise<number> {
  try {
    const row = await getDB()
      .prepare(
        `SELECT COUNT(*) AS n FROM business_leads
         WHERE business_id = ? AND created_at >= strftime('%Y-%m-01 00:00:00','now')
           AND COALESCE(locked, 0) = 0`,
      )
      .bind(businessId)
      .first<{ n: number }>();
    return row?.n ?? 0;
  } catch {
    return 0;
  }
}

/**
 * A cég ZÁROLT (kereten felüli / extra-címzettes) leadjeinek száma — a /pro
 * személyre szabott sürgetéséhez („N ajánlatkérés vár feloldásra"). A tárolt
 * `locked` flag a keletkezéskori kapu-állapot; PRO-ra váltáskor az inbox
 * visszamenőleg feloldja mindet (dinamikus számítás), így a szám őszinte ígéret.
 */
export async function countLockedBusinessLeads(businessId: string): Promise<number> {
  try {
    const row = await getDB()
      .prepare(
        "SELECT COUNT(*) AS n FROM business_leads WHERE business_id = ? AND COALESCE(locked, 0) = 1",
      )
      .bind(businessId)
      .first<{ n: number }>();
    return row?.n ?? 0;
  } catch {
    return 0;
  }
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
