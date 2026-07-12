/**
 * keresek-routing.ts — „Keresek" → fordított lead-routing DB-rétege.
 *
 * Admin-jóváhagyáskor fut (moderation/decide → waitUntil): a kérést lead-ként
 * kiosztja a kategóriabeli cégeknek. Szaknévsor PRO (featured) cég a kontaktot
 * azonnal, teljes emailben kapja; nem-PRO cégnek a lead MINDIG zárolt (a
 * postaládában „oldd fel PRO-val" kártya + kontakt-mentes teaser-email) — a
 * rendszer-osztott lead nem fogyasztja a havi 5 ingyenes keretet. Email nélküli
 * (még nem igényelt) cég is kap lead-sort: az igényléskor váró zárolt kérések
 * a profil-átvétel + PRO-váltás motorja.
 */
import { getDB } from "./cloudflare";
import { safeLogError } from "./safe-log";
import {
  KERESEK_BUSINESS_CATS,
  classifyKeresekContact,
  pickKeresekRecipients,
  buildKeresekLeadMessage,
  type KeresekBusinessRow,
} from "./keresek-lead-map";
import { serviceCategory } from "./service-categories";

interface RequestRow {
  id: string;
  country_code: string;
  region_code: string | null;
  category: string | null;
  title: string;
  description: string | null;
  city: string | null;
  when_text: string | null;
  contact: string;
}

interface BizRow {
  id: string;
  name: string;
  contact_email: string | null;
  featured: number;
  canton_code: string | null;
}

/**
 * Egy jóváhagyott Keresek-kérés kiosztása. Idempotens: a routed_at atomikus
 * claim-je miatt újra-jóváhagyáskor nem fut duplán. Best-effort — hibát nem dob
 * (waitUntil-ből fut, a moderációs döntés már megtörtént).
 */
export async function routeServiceRequest(requestId: string): Promise<{ routed: number; emailed: number }> {
  const none = { routed: 0, emailed: 0 };
  try {
    const db = getDB();

    // Atomikus claim — pontosan egyszer futunk kérésenként.
    const claim = await db
      .prepare(
        `UPDATE service_requests SET routed_at = datetime('now')
         WHERE id = ? AND routed_at IS NULL AND moderation_status = 1`,
      )
      .bind(requestId)
      .run();
    if ((claim.meta?.changes ?? 0) === 0) return none;

    const req = await db
      .prepare(
        `SELECT id, country_code, region_code, category, title, description, city, when_text, contact
         FROM service_requests WHERE id = ?`,
      )
      .bind(requestId)
      .first<RequestRow>();
    if (!req?.category) return none;

    // Régió-célzott push a „keresek" kategória feliratkozóinak (0129 pref):
    // „valaki szakembert keres a régiódban — hátha épp te vagy az". CSAK ha van
    // régió-kód (régió nélkül a notifyCanton MINDEN feliratkozónak menne —
    // országhatáron át is; azt nem engedjük). Best-effort, a lead-routingtól
    // független (kategória-térkép nélküli kérésről is mehet push).
    if (req.region_code) {
      try {
        const { notifyCanton } = await import("./push-notify");
        const cat = serviceCategory(req.category ?? "");
        await notifyCanton(
          req.region_code,
          {
            title: "🙋 Valaki szakembert keres a régiódban",
            body: `${cat ? cat.label + ": " : ""}${req.title.slice(0, 90)}`,
            url: "/keresek",
          },
          "keresek",
        );
      } catch (e) {
        safeLogError("keresek-routing/push", e);
      }
    }

    const cats = KERESEK_BUSINESS_CATS[req.category as keyof typeof KERESEK_BUSINESS_CATS];
    if (!cats || cats.length === 0) return none;

    const { results: businesses } = await db
      .prepare(
        `SELECT id, name, contact_email, COALESCE(featured, 0) AS featured, canton_code
         FROM businesses
         WHERE category_id IN (${cats.map(() => "?").join(",")})
           AND COALESCE(country_code, 'CH') = ?
           AND COALESCE(hidden, 0) = 0
           AND moderation_status = 1
           AND COALESCE(lead_opt_out, 0) = 0
         ORDER BY featured DESC, rating DESC
         LIMIT 80`,
      )
      .bind(...cats, req.country_code)
      .all<BizRow>();
    if (businesses.length === 0) return none;

    const rows: KeresekBusinessRow[] = businesses.map((b) => ({
      id: b.id,
      featured: b.featured,
      contactEmail: b.contact_email,
      regionCode: b.canton_code,
    }));
    const recipients = pickKeresekRecipients(rows, req.region_code);
    if (recipients.length === 0) return none;
    const bizById = new Map(businesses.map((b) => [b.id, b]));

    // First-ping kapu: cégenként napi 1 azonnali email — akinek ma már ment,
    // annak a lead csak DB-be kerül (a reggeli digest értesíti).
    const today = new Date().toISOString().slice(0, 10);
    const immediateIds = recipients.filter((r) => r.immediateEmail).map((r) => r.id);
    const alreadyPinged = new Set<string>();
    if (immediateIds.length > 0) {
      const { results: pinged } = await db
        .prepare(
          `SELECT DISTINCT business_id FROM business_leads
           WHERE business_id IN (${immediateIds.map(() => "?").join(",")})
             AND first_ping_sent = 1 AND created_at >= ?`,
        )
        .bind(...immediateIds, `${today} 00:00:00`)
        .all<{ business_id: string }>();
      for (const p of pinged) alreadyPinged.add(p.business_id);
    }

    const cat = serviceCategory(req.category);
    const categoryLabel = `${cat ? cat.label : req.category} · Keresek-hirdetés`;
    const senderName = `Keresek-hirdető${req.city ? ` (${req.city})` : ""}`;
    const message = buildKeresekLeadMessage({
      title: req.title, description: req.description, city: req.city, whenText: req.when_text,
    });
    const { email: senderEmail, phone: senderPhone } = classifyKeresekContact(req.contact);

    const { createBusinessLead, incrementBusinessAnalytic } = await import("./repo");
    const { sendKeresekLeadEmail, sendKeresekLockedEmail } = await import("./email");

    let emailed = 0;
    for (const r of recipients) {
      const biz = bizById.get(r.id);
      if (!biz) continue;
      const sendNow = r.immediateEmail && !alreadyPinged.has(r.id);

      let sentOk = false;
      if (sendNow && biz.contact_email) {
        try {
          if (r.locked) {
            await sendKeresekLockedEmail({
              business: { name: biz.name, contactEmail: biz.contact_email },
              title: req.title,
              city: req.city,
              whenText: req.when_text,
            });
          } else {
            await sendKeresekLeadEmail({
              business: { name: biz.name, contactEmail: biz.contact_email },
              title: req.title,
              description: req.description,
              city: req.city,
              whenText: req.when_text,
              contact: req.contact,
            });
          }
          sentOk = true;
          emailed++;
        } catch (e) {
          safeLogError(`keresek-routing/email [biz=${r.id}]`, e);
        }
      }

      await Promise.allSettled([
        createBusinessLead({
          businessId: r.id,
          senderName,
          senderEmail,
          senderPhone,
          categoryLabel,
          message,
          // Csak a TÉNYLEG kiment azonnali email számít first-pingnek — különben
          // a digest kihagyná azokat, akiknek ma nem ment email.
          firstPingSent: sentOk,
          locked: r.locked,
        }),
        incrementBusinessAnalytic(r.id, "lead", null),
      ]);
    }

    // Anonim napi számláló a heti ops-reporthoz (nincs user-adat).
    const { recordUsage } = await import("./repo-misc");
    await recordUsage("action:keresek-lead-routed");

    return { routed: recipients.length, emailed };
  } catch (err) {
    safeLogError("keresek-routing", err);
    return none;
  }
}
