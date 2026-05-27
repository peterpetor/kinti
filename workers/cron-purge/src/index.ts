/**
 * kinti-cron-purge — D1 takarító + hirdetés lejárati figyelmeztető Worker.
 *
 * Egy `scheduled` handler, ami három feladatot lát el:
 *   1) bulletin_drafts → 24h után meg nem erősített piszkozat törlése
 *   2) bulletin_posts  → 30 nap utáni lejárt poszt törlése (expires_at IS NOT NULL)
 *   3) Expiry warning  → 3 napon belül lejáró posztok feladójának email küldése
 *      (expiry_warning_sent = 0 → küldés → set 1)
 *
 * A `fetch` endpoint csak debug-célú, jogosultság-ellenőrzéssel — manuális
 * lefuttatható curl-lel (lásd lent). Production-on a Cron Trigger hajtja.
 */

export interface Env {
  DB: D1Database;
  /** R2 média-tároló — a lejárt tartalmak képeit is töröljük. */
  MEDIA: R2Bucket;
  /** Opcionális — ha be van állítva, a `fetch` endpointhoz kell. */
  CRON_SECRET?: string;
  /** Resend API kulcs — az expiry warning emailekhez. */
  RESEND_API_KEY?: string;
  /** A küldő email — pl. "Kinti <info@kinti.app>" */
  EMAIL_FROM?: string;
  /** A site alap URL-je — pl. "https://kinti.app" */
  SITE_URL?: string;
}

/** Kép-kulcs(ok) kinyerése: JSON-tömb vagy egyetlen kulcs. */
function parseImageKeys(keyStr: string | null | undefined): string[] {
  if (!keyStr) return [];
  if (keyStr.startsWith("[")) {
    try {
      const arr = JSON.parse(keyStr);
      return Array.isArray(arr) ? arr.filter((k): k is string => typeof k === "string") : [];
    } catch {
      return [keyStr];
    }
  }
  return [keyStr];
}

/** R2 objektumok törlése (kötegelve). Hiba esetén nem dobunk — best-effort. */
async function deleteR2Keys(env: Env, keys: string[]): Promise<number> {
  const unique = [...new Set(keys.filter(Boolean))];
  if (unique.length === 0) return 0;
  try {
    // Az R2 .delete() tömböt is elfogad (max 1000 / hívás).
    await env.MEDIA.delete(unique);
    return unique.length;
  } catch (err) {
    console.error("[cron-purge] R2 törlési hiba:", err);
    return 0;
  }
}

interface PurgeResult {
  draftsDeleted: number;
  postsDeleted: number;
  reviewDraftsDeleted: number;
  businessSubmissionsDeleted: number;
  oldEventsDeleted: number;
  imagesDeleted: number;
  expiryWarningsSent: number;
  expiryWarningErrors: number;
  ranAt: string;
}

interface ExpiringPost {
  id: string;
  title: string;
  email: string;
  poster: string | null;
  manage_token: string;
  expires_at: string;
}

/** Gyönyörű lejárati figyelmeztető HTML email */
function buildExpiryWarningEmail(
  greet: string,
  title: string,
  expiresHu: string,
  manageUrl: string,
): string {
  const esc = (s: string) =>
    s.replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
    );

  const body = `
    <p style="margin:0 0 12px;font-size:15px;line-height:1.55;color:#0e1f17;">
      Szia ${esc(greet)} 👋
    </p>
    <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#0e1f17;">
      A kinti.app hirdetőfalon feladott hirdetésed <strong>3 nap múlva lejár</strong>:
    </p>
    <p style="margin:0 0 20px;padding:12px 14px;background:#fbf7ee;border:1px solid #e6ebe5;border-radius:14px;font-size:14.5px;font-weight:700;color:#0e1f17;">
      ${esc(title)}
    </p>
    <div style="margin:0 0 20px;padding:12px 14px;background:#fff8ed;border:2px solid #e3a233;border-radius:14px;">
      <div style="font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#9a6b00;margin-bottom:4px;">⏰ Lejárat</div>
      <div style="font-size:14.5px;font-weight:800;color:#0e1f17;">${esc(expiresHu)}</div>
    </div>
    <p style="margin:0 0 10px;font-size:14px;line-height:1.6;color:#5c6d63;">
      Ha a hirdetés még aktuális, <strong>egyetlen kattintással</strong> meghosszabbíthatod újabb <strong>30 nappal</strong> — nem kell semmit újra megírni!
    </p>
    <p style="margin:0 0 20px;">
      <a href="${esc(manageUrl)}"
        style="display:inline-block;padding:13px 22px;background:#1d4434;color:#ffffff;text-decoration:none;border-radius:999px;font-size:14px;font-weight:800;letter-spacing:-0.01em;">
        Hirdetésem meghosszabbítása →
      </a>
    </p>
    <p style="margin:0;font-size:12px;line-height:1.6;color:#94a097;">
      Ha nem hosszabbítod meg, a hirdetés automatikusan törlődik a lejárat után.
    </p>`;

  return `<!doctype html>
<html lang="hu">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>kinti</title>
</head>
<body style="margin:0;padding:0;background:#f4ede0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">
    A hirdetésed lejár ${esc(expiresHu)}-én — egyetlen kattintással meghosszabbíthatod!
  </span>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f4ede0;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:480px;background:#ffffff;border-radius:20px;box-shadow:0 4px 16px rgba(14,31,23,0.06);">
        <tr><td style="padding:24px 24px 8px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="vertical-align:middle;padding-right:10px;">
                <div style="width:28px;height:28px;border-radius:8px;background:#1d4434;display:inline-block;"></div>
              </td>
              <td style="vertical-align:middle;font-size:18px;font-weight:800;color:#0e1f17;letter-spacing:-0.02em;">
                kinti
              </td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:8px 24px 28px;">
          ${body}
        </td></tr>
      </table>
      <p style="max-width:480px;margin:14px auto 0;padding:0 8px;font-size:11px;line-height:1.5;color:#94a097;text-align:center;">
        Ezt az emailt egy automata küldte a kinti.app közösségi platformról.
        Visszaélés esetén: <a href="mailto:abuse@kinti.app" style="color:#94a097;">abuse@kinti.app</a>
      </p>
    </td></tr>
  </table>
</body>
</html>`;
}

function fmtHu(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const HU_MONTH = ["jan.", "feb.", "márc.", "ápr.", "máj.", "jún.", "júl.", "aug.", "szept.", "okt.", "nov.", "dec."];
  return `${d.getFullYear()}. ${HU_MONTH[d.getMonth()]} ${d.getDate()}.`;
}

async function sendExpiryWarning(
  env: Env,
  post: ExpiringPost,
): Promise<void> {
  if (!env.RESEND_API_KEY) throw new Error("Hiányzó RESEND_API_KEY");

  const siteUrl = env.SITE_URL?.replace(/\/$/, "") ?? "https://kinti.app";
  const manageUrl = `${siteUrl}/hirdetes-kezeles/${post.manage_token}`;
  const greet = post.poster?.trim() || "kinti";
  const expiresHu = fmtHu(post.expires_at);
  const from = env.EMAIL_FROM || "Kinti <info@kinti.app>";

  const text = `Szia ${greet}!\n\nA kinti.app-on feladott hirdetésed hamarosan lejár:\n  "${post.title}"\n\nLejárat dátuma: ${expiresHu}\n\nHa a hirdetés még aktuális, egyetlen kattintással meghosszabbíthatod újabb 30 nappal:\n  ${manageUrl}\n\nHa nem hosszabbítod meg, a hirdetés automatikusan törlődik a lejárat után.\n\nÜdv,\nkinti.app`;
  const html = buildExpiryWarningEmail(greet, post.title, expiresHu, manageUrl);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: post.email,
      subject: `⏰ A hirdetésed 3 nap múlva lejár — kinti.app`,
      html,
      text,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend ${res.status}: ${body}`);
  }
}

async function runPurge(env: Env): Promise<PurgeResult> {
  const db = env.DB;
  let imagesDeleted = 0;

  // 1) Meg nem erősített piszkozatok (24h után) — előbb a hozzájuk tartozó
  //    R2-képeket töröljük, csak utána a sorokat (hard delete).
  const { results: expiredDrafts } = await db
    .prepare("SELECT image_key FROM bulletin_drafts WHERE expires_at <= datetime('now')")
    .all<{ image_key: string | null }>();
  imagesDeleted += await deleteR2Keys(
    env,
    expiredDrafts.flatMap((d) => parseImageKeys(d.image_key)),
  );
  const draftsRes = await db
    .prepare("DELETE FROM bulletin_drafts WHERE expires_at <= datetime('now')")
    .run();

  // 2) Lejárt hirdetések — a képeket is fizikailag töröljük az R2-ből.
  const { results: expiredPosts } = await db
    .prepare(
      "SELECT image_key FROM bulletin_posts WHERE expires_at IS NOT NULL AND expires_at <= datetime('now')",
    )
    .all<{ image_key: string | null }>();
  imagesDeleted += await deleteR2Keys(
    env,
    expiredPosts.flatMap((p) => parseImageKeys(p.image_key)),
  );
  const postsRes = await db
    .prepare(
      "DELETE FROM bulletin_posts WHERE expires_at IS NOT NULL AND expires_at <= datetime('now')",
    )
    .run();

  // 3) Vélemény-piszkozatok takarítása (nincs kép)
  const reviewDraftsRes = await db
    .prepare("DELETE FROM review_drafts WHERE expires_at <= datetime('now')")
    .run();

  // 3/b) Meg nem erősített vállalkozás-beküldések takarítása (24h után)
  const bizSubsRes = await db
    .prepare("DELETE FROM business_submissions WHERE expires_at <= datetime('now')")
    .run();

  // 3/c) Régi/inaktív események hard delete (GDPR adattakarékosság):
  //      30 napnál régebben lezajlott események + a 30 napnál régebbi, soha meg
  //      nem erősített beküldések. A képeket (R2), a leadott RSVP-ket és a sort
  //      (benne a beküldő emailje) is véglegesen töröljük.
  const eventCondition =
    "(event_date IS NOT NULL AND event_date < date('now','-30 days')) " +
    "OR (status = 'pending_confirm' AND created_at < datetime('now','-30 days'))";
  const { results: oldEvents } = await db
    .prepare(`SELECT id, image_key FROM events WHERE ${eventCondition}`)
    .all<{ id: string; image_key: string | null }>();
  imagesDeleted += await deleteR2Keys(
    env,
    oldEvents.flatMap((e) => parseImageKeys(e.image_key)),
  );
  // Az RSVP-ket explicit is töröljük (nem csak FK-cascade-re hagyatkozva).
  await db
    .prepare(`DELETE FROM event_rsvps WHERE event_id IN (SELECT id FROM events WHERE ${eventCondition})`)
    .run();
  const oldEventsRes = await db.prepare(`DELETE FROM events WHERE ${eventCondition}`).run();

  // 4) Lejárati figyelmeztető emailek küldése (3 napon belül lejáró, még nem értesített)
  let expiryWarningsSent = 0;
  let expiryWarningErrors = 0;

  try {
    const { results: expiring } = await db
      .prepare(
        `SELECT id, title, email, poster, manage_token, expires_at
         FROM bulletin_posts
         WHERE is_pending = 0
           AND expiry_warning_sent = 0
           AND expires_at IS NOT NULL
           AND expires_at > datetime('now')
           AND expires_at <= datetime('now', '+3 days')`,
      )
      .all<ExpiringPost>();

    for (const post of expiring) {
      try {
        await sendExpiryWarning(env, post);
        await db
          .prepare("UPDATE bulletin_posts SET expiry_warning_sent = 1 WHERE id = ?")
          .bind(post.id)
          .run();
        expiryWarningsSent++;
      } catch (err) {
        console.error(`[cron-purge] Expiry warning failed for post ${post.id}:`, err);
        expiryWarningErrors++;
      }
    }
  } catch (err) {
    console.error("[cron-purge] Expiry warning query failed:", err);
    expiryWarningErrors++;
  }

  return {
    draftsDeleted: draftsRes.meta.changes ?? 0,
    postsDeleted: postsRes.meta.changes ?? 0,
    reviewDraftsDeleted: reviewDraftsRes.meta.changes ?? 0,
    businessSubmissionsDeleted: bizSubsRes.meta.changes ?? 0,
    oldEventsDeleted: oldEventsRes.meta.changes ?? 0,
    imagesDeleted,
    expiryWarningsSent,
    expiryWarningErrors,
    ranAt: new Date().toISOString(),
  };
}

export default {
  async scheduled(
    _event: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    ctx.waitUntil(
      runPurge(env).then((result) => {
        console.log("[cron-purge]", JSON.stringify(result));
      }),
    );
  },

  async fetch(req: Request, env: Env): Promise<Response> {
    // Manuális lefuttatás: `curl -H 'authorization: Bearer <secret>' <worker-url>`
    const auth = req.headers.get("authorization") ?? "";
    const expected = env.CRON_SECRET ? `Bearer ${env.CRON_SECRET}` : null;
    if (!expected || auth !== expected) {
      return new Response("Unauthorized", { status: 401 });
    }
    const result = await runPurge(env);
    return Response.json(result);
  },
};
