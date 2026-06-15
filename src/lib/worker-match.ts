/**
 * worker-match.ts — profil-alapú jelölt-matching.
 *
 * Amikor egy állást JÓVÁHAGYNAK, a kanton + szakma alapján illeszkedő, magukat
 * kereshetőre (searchable) állított jelölteknek küldünk emailt. Ez a profil-alapú,
 * opt-in kiegészítése az explicit `triggerJobAlertRadars`-nak (kulcsszavas alertek).
 */
import { getSearchableWorkers } from "./repo-workers";
import { sendEmail } from "./email";
import { safeLogError } from "./safe-log";

export interface MatchJob {
  id: string;
  title: string;
  location: string;
  cantonCode: string | null;
  category: string | null;
  companyName?: string | null;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

/**
 * Illeszkedő, kereshető jelölteknek email az új állásról. Csak akkor fut, ha az
 * állásnak van category ÉS cantonCode-ja (pontos illesztés) — így nem megy
 * tömeges/irreleváns értesítés. Best-effort: egyetlen email hibája nem állítja
 * meg a többit.
 */
export async function notifyMatchingWorkers(job: MatchJob): Promise<void> {
  if (!job.category || !job.cantonCode) return;

  const workers = await getSearchableWorkers({
    canton: job.cantonCode,
    category: job.category,
    limit: 200,
  });
  if (workers.length === 0) return;

  const url = `https://kinti.app/allasok/${job.id}`;
  for (const w of workers) {
    if (!w.email) continue;
    const firstName = w.fullName ? w.fullName.split(/\s+/)[0] : "";
    try {
      await sendEmail({
        to: w.email,
        subject: `Új állás illik a profilodhoz: ${job.title}`,
        html: `<p>Szia${firstName ? " " + escapeHtml(firstName) : ""}!</p>
<p>Új állás került fel a Kinti Job Boardra, ami illik a profilodhoz (szakma + kanton):</p>
<p><strong>${escapeHtml(job.title)}</strong>${job.companyName ? " — " + escapeHtml(job.companyName) : ""}<br>${escapeHtml(job.location)}</p>
<p><a href="${url}">Megnézem és jelentkezem &rarr;</a></p>
<p style="font-size:12px;color:#888">Ezt azért kaptad, mert kereshetőre állítottad a munkavállalói profilodat a kinti.app-on. A profilodon bármikor kikapcsolhatod.</p>`,
        text: `Új állás illik a profilodhoz: ${job.title}${job.companyName ? " — " + job.companyName : ""} (${job.location}). ${url}`,
      });
    } catch (e) {
      safeLogError("notifyMatchingWorkers/email", e);
    }
  }
}
