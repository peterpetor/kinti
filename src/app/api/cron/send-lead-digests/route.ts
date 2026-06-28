import { getDB, getCloudflareEnv } from "@/lib/cloudflare";
import { getAdminUserId } from "@/lib/admin";
import { safeLogError } from "@/lib/safe-log";
import { sendLeadDigestEmail, sendLeadLockedEmail } from "@/lib/email";

export const runtime = "edge";
export const dynamic = "force-dynamic";

interface LeadRow {
  id: string;
  business_id: string;
  sender_name: string;
  sender_email: string;
  sender_phone: string | null;
  category_label: string | null;
  message: string;
  created_at: string;
  locked: number;
}

interface BusinessRow {
  id: string;
  name: string;
  contact_email: string;
}

/**
 * GET|POST /api/cron/send-lead-digests
 *
 * Napi digest email küldése minden olyan vállalkozónak, akinek tegnap
 * volt be nem küldött árajánlat-kérése (digest_sent_at IS NULL,
 * first_ping_sent = 0, created_at < mai nap kezdete).
 *
 * Futtatás: naponta egyszer, reggel 8:00-kor (cron-job.org).
 * Auth: Bearer <CRON_SECRET> vagy admin session.
 */
async function handle(req: Request): Promise<Response> {
  const env = getCloudflareEnv() as unknown as { CRON_SECRET?: string };
  const auth = req.headers.get("authorization") ?? "";
  const okSecret = !!env.CRON_SECRET && auth === `Bearer ${env.CRON_SECRET}`;
  const okAdmin = okSecret ? false : !!(await getAdminUserId());
  if (!okSecret && !okAdmin) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Mai nap kezdete UTC-ben. SZÓKÖZ-elválasztó (nem 'T'!) — a D1 datetime('now')
  // így tárol; 'T'-vel a string-összehasonlítás félrevisz (' ' < 'T').
  const todayStart = new Date().toISOString().slice(0, 10) + " 00:00:00";

  let digestsSent = 0;
  let leadsMarked = 0;
  let errors = 0;

  try {
    // Összes be nem küldött (digest_sent_at IS NULL) tegnapi lead lekérése,
    // üzleti adatokkal együtt — csak azoknak a cégeknek, akiknek van email-cím.
    const { results: pendingLeads } = await getDB()
      .prepare(
        `SELECT
           bl.id, bl.business_id, bl.sender_name, bl.sender_email,
           bl.sender_phone, bl.category_label, bl.message, bl.created_at,
           COALESCE(bl.locked, 0) AS locked
         FROM business_leads bl
         INNER JOIN businesses b ON b.id = bl.business_id
         WHERE bl.digest_sent_at IS NULL
           AND bl.first_ping_sent = 0
           AND bl.created_at < ?
           AND b.contact_email IS NOT NULL
           AND length(trim(b.contact_email)) > 0
           AND COALESCE(b.lead_opt_out, 0) = 0
         ORDER BY bl.business_id, bl.created_at ASC`,
      )
      .bind(todayStart)
      .all<LeadRow>();

    if (pendingLeads.length === 0) {
      return Response.json({ ok: true, digestsSent: 0, leadsMarked: 0 });
    }

    // Csoportosítás vállalkozónként
    const byBusiness = new Map<string, LeadRow[]>();
    for (const lead of pendingLeads) {
      const existing = byBusiness.get(lead.business_id) ?? [];
      existing.push(lead);
      byBusiness.set(lead.business_id, existing);
    }

    // Vállalkozói adatok lekérése (név + email)
    const businessIds = [...byBusiness.keys()];
    // Defenzív: üres tömbnél az IN () érvénytelen SQL — bár a pendingLeads>0
    // miatt ez gyakorlatilag elérhetetlen, expliciten kezeljük.
    if (businessIds.length === 0) {
      return Response.json({ ok: true, digestsSent: 0, leadsMarked: 0 });
    }
    const { results: businesses } = await getDB()
      .prepare(
        `SELECT id, name, contact_email FROM businesses
         WHERE id IN (${businessIds.map(() => "?").join(",")})`,
      )
      .bind(...businessIds)
      .all<BusinessRow>();

    const businessMap = new Map(businesses.map((b) => [b.id, b]));

    // Digest email küldése vállalkozónként
    for (const [businessId, leads] of byBusiness) {
      const biz = businessMap.get(businessId);
      if (!biz?.contact_email) continue;

      try {
        // FREEMIUM-kapu: a zárolt lead-ek kontaktja NEM megy ki — helyettük egy
        // „oldd fel PRO-val" összesítő. A nyitottak a szokásos digestben.
        const openLeads = leads.filter((l) => Number(l.locked) !== 1);
        const lockedLeads = leads.filter((l) => Number(l.locked) === 1);

        if (openLeads.length > 0) {
          await sendLeadDigestEmail({
            to: biz.contact_email,
            businessName: biz.name,
            leads: openLeads.map((l) => ({
              senderName: l.sender_name,
              senderEmail: l.sender_email,
              senderPhone: l.sender_phone,
              categoryLabel: l.category_label,
              message: l.message,
              createdAt: l.created_at,
            })),
          });
        }
        if (lockedLeads.length > 0) {
          await sendLeadLockedEmail({
            categoryLabel: lockedLeads[0].category_label ?? "árajánlat-kérés",
            business: { name: biz.name, contactEmail: biz.contact_email },
            count: lockedLeads.length,
          });
        }

        // Összes lead digest_sent_at-jét beállítjuk
        const leadIds = leads.map((l) => l.id);
        await getDB()
          .prepare(
            `UPDATE business_leads
             SET digest_sent_at = datetime('now')
             WHERE id IN (${leadIds.map(() => "?").join(",")})`,
          )
          .bind(...leadIds)
          .run();

        digestsSent++;
        leadsMarked += leads.length;
      } catch (err) {
        safeLogError(`send-lead-digests [biz=${businessId}]`, err);
        errors++;
      }
    }
  } catch (err) {
    safeLogError("send-lead-digests", err);
    return Response.json({ ok: false, error: "internal" }, { status: 500 });
  }

  return Response.json({ ok: true, digestsSent, leadsMarked, errors });
}

export const GET = handle;
export const POST = handle;
