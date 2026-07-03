/**
 * review-nudge.ts — vélemény-gyűjtő hurok: 3 nappal az ajánlatkérés után
 * emailben kérdezzük meg a lead-küldőt: „Milyen volt? Írj pár mondatot."
 *
 * A szaknévsor várárka a valódi magyar vélemény — a lista lemásolható, a
 * vélemény-bázis nem. A nudge lead-enként EGYSZER megy (review_nudge_at),
 * és kimarad, ha az email-cím már értékelte a vállalkozást. A napi darabszám
 * korlátos (Resend free 100/nap keret — a digestek mellett hagyunk fejteret).
 *
 * A napi cron (send-lead-digests) hívja; a suppression-listát (bounce/spam)
 * a getResend() wrapper automatikusan érvényesíti.
 */
import { getLeadsDueReviewNudge, markLeadReviewNudged } from "./repo-leads";
import { hasReviewByEmail } from "./repo";
import { sendReviewNudgeEmail } from "./email";
import { safeLogError } from "./safe-log";

/** Kiküldött nudge-ok száma (a cron-válasz statisztikájához). */
export async function processReviewNudges(limit = 40): Promise<number> {
  const due = await getLeadsDueReviewNudge(limit);
  let sent = 0;
  const seen = new Set<string>(); // email|business dedup ugyanazon a futáson belül

  for (const lead of due) {
    const key = `${lead.senderEmail.toLowerCase()}|${lead.businessId}`;
    try {
      if (seen.has(key) || (await hasReviewByEmail(lead.businessId, lead.senderEmail))) {
        // Már értékelt (vagy e futásban már kap nudge-ot erre a cégre) → csak lezárjuk.
        await markLeadReviewNudged(lead.id);
        seen.add(key);
        continue;
      }
      await sendReviewNudgeEmail({
        to: lead.senderEmail,
        senderName: lead.senderName,
        businessName: lead.businessName,
        businessId: lead.businessId,
      });
      await markLeadReviewNudged(lead.id);
      seen.add(key);
      sent++;
    } catch (err) {
      // Egy hibás címzett ne állítsa meg a többit; a lead nudge-olatlan marad,
      // a következő futás újrapróbálja (a 10 napos ablakon belül).
      safeLogError("review-nudge:send", err);
    }
  }
  return sent;
}
