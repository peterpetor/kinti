import { sendAdminContentPendingEmail } from "./email";
import { getCloudflareEnv } from "./cloudflare";
import { safeLogError } from "./safe-log";

/**
 * Best-effort admin-értesítés új moderálandó tartalomról. Több helyről hívható
 * (business/confirm, review-confirm, esemény-beküldés stb.) —
 * sose dob hibát kifelé (UX-prioritás), csak loggol.
 *
 * Csak a Resend-emailt küldi; a tartalom maga már `moderation_status=0`
 * (pending) állapotban van a DB-ben, és a publikus query-k szűrik.
 */
export async function notifyAdminContentPending(params: {
  contentType: "vélemény" | "vállalkozás" | "esemény" | "keresés" | "élettörténet" | "albérlet-hirdetés";
  title: string;
  preview: string;
  submitterEmail: string | null;
}): Promise<void> {
  try {
    const env = getCloudflareEnv();
    const adminEmails = (env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (adminEmails.length === 0) return;
    if (!env.RESEND_API_KEY) return;

    const siteUrl =
      env.PUBLIC_BASE_URL?.replace(/\/$/, "") || "https://kinti.app";
    const moderationUrl = `${siteUrl}/admin/moderation`;

    // Egy email az ELSŐ admin-emailre — egyszerűsítve, mert általában 1 admin
    // van, és a tömeges címzés a Resend-en külön per-recipient hívást igényel.
    await sendAdminContentPendingEmail({
      adminEmail: adminEmails[0],
      contentType: params.contentType,
      title: params.title.slice(0, 120),
      preview: params.preview.slice(0, 400),
      submitterEmail: params.submitterEmail,
      moderationUrl,
    });
  } catch (err) {
    safeLogError("admin-notify", err);
  }
}
