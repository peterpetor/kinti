/**
 * kinti-cron-digest — Heti email-digest kiküldő Worker.
 *
 * Hétfő 08:17 UTC-kor minden megerősített feliratkozónak küld egy
 * összefoglalót: új események + új hirdetések a választott kantonból (vagy
 * egész Svájcból, ha canton_code = NULL).
 *
 * Adatok:
 *  - Új hirdetések: az elmúlt 7 napban publikáltak, is_pending=0, hidden=0,
 *    nem lejártak. Kanton-szűrés a canton_code mezővel.
 *  - Közelgő események: a következő 30 nap, status='approved'. A kanton-szűrés
 *    a venue-ből próbálódik kinyerni (PLZ → kanton); ha nincs canton-egyezés,
 *    az "egész Svájc" feliratkozóknak akkor is megy.
 */

export interface Env {
  DB: D1Database;
  CRON_SECRET?: string;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  SITE_URL?: string;
}

interface Subscriber {
  id: string;
  email: string;
  canton_code: string | null;
  unsubscribe_token: string;
}

interface BulletinPost {
  id: string;
  kind_id: string;
  title: string;
  meta: string | null;
  canton_code: string | null;
  price: number | null;
}

interface EventRow {
  id: string;
  title: string;
  event_date: string | null;
  date_month: string | null;
  date_day: string | null;
  start_time: string | null;
  venue: string | null;
}

interface DigestResult {
  totalSubs: number;
  sent: number;
  skippedEmpty: number;
  failed: number;
  ranAt: string;
}

const HU_MONTHS = ["jan.", "feb.", "márc.", "ápr.", "máj.", "jún.", "júl.", "aug.", "szept.", "okt.", "nov.", "dec."];
function fmtDateShort(iso: string | null): string {
  if (!iso) return "";
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return iso;
  return `${HU_MONTHS[parseInt(m[2], 10) - 1] ?? ""} ${parseInt(m[3], 10)}.`;
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

function fmtPrice(n: number | null): string {
  if (n == null) return "";
  return ` · ${n.toLocaleString("hu-HU").replace(/,/g, " ")} CHF`;
}

/** Feliratkozónkénti email-tartalom összerakása. */
function buildEmail(
  sub: Subscriber,
  bulletins: BulletinPost[],
  events: EventRow[],
  siteUrl: string,
): { subject: string; html: string; text: string } {
  const cantonLabel = sub.canton_code ? `${sub.canton_code} kanton` : "egész Svájc";
  const subject = `Heti kinti — új események és hirdetések (${cantonLabel})`;
  const unsubscribeUrl = `${siteUrl}/api/digest/unsubscribe/${sub.unsubscribe_token}`;

  const bulletinsHtml = bulletins.length
    ? bulletins
        .map(
          (b) =>
            `<li style="margin:0 0 8px;font-size:13.5px;line-height:1.5;color:#0e1f17;">
              <a href="${esc(siteUrl)}/kozosseg/hirdetes/${esc(b.id)}" style="color:#1d4434;text-decoration:none;font-weight:700;">${esc(b.title)}</a>
              <span style="color:#5c6d63;">${esc(b.meta ? ` · ${b.meta}` : "")}${fmtPrice(b.price)}</span>
            </li>`,
        )
        .join("")
    : `<li style="color:#94a097;font-size:13px;">Nincs új hirdetés ezen a héten.</li>`;

  const eventsHtml = events.length
    ? events
        .map(
          (e) =>
            `<li style="margin:0 0 8px;font-size:13.5px;line-height:1.5;color:#0e1f17;">
              <strong>${esc(e.title)}</strong>
              <br /><span style="color:#5c6d63;">📅 ${esc(fmtDateShort(e.event_date))}${e.start_time ? " " + esc(e.start_time) : ""}${e.venue ? " · " + esc(e.venue) : ""}</span>
            </li>`,
        )
        .join("")
    : `<li style="color:#94a097;font-size:13px;">Nincs közelgő esemény.</li>`;

  const text =
    `Heti kinti — új események és hirdetések (${cantonLabel})\n\n` +
    `KÖZELGŐ ESEMÉNYEK:\n` +
    (events.length
      ? events.map((e) => `- ${e.title} (${fmtDateShort(e.event_date)}${e.venue ? `, ${e.venue}` : ""})`).join("\n")
      : "(nincs)") +
    `\n\n` +
    `ÚJ HIRDETÉSEK:\n` +
    (bulletins.length
      ? bulletins.map((b) => `- ${b.title}${b.meta ? ` (${b.meta})` : ""} — ${siteUrl}/kozosseg/hirdetes/${b.id}`).join("\n")
      : "(nincs)") +
    `\n\nLeiratkozás: ${unsubscribeUrl}\n`;

  const html = `<!doctype html><html lang="hu"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>kinti heti digest</title></head>
<body style="margin:0;padding:0;background:#f4ede0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f4ede0;padding:32px 16px;">
  <tr><td align="center">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:520px;background:#fff;border-radius:20px;box-shadow:0 4px 16px rgba(14,31,23,0.06);">
      <tr><td style="padding:22px 24px 8px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
          <div style="width:24px;height:24px;border-radius:7px;background:#1d4434;"></div>
          <div style="font-size:17px;font-weight:800;color:#0e1f17;letter-spacing:-0.02em;">kinti</div>
        </div>
        <p style="margin:0;font-size:11.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#94a097;">Heti összefoglaló · ${esc(cantonLabel)}</p>
        <h1 style="margin:6px 0 0;font-size:20px;font-weight:800;color:#0e1f17;letter-spacing:-0.02em;">Mi újság ezen a héten?</h1>
      </td></tr>
      <tr><td style="padding:12px 24px 4px;">
        <h2 style="margin:0 0 10px;font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#5c6d63;">Közelgő események</h2>
        <ul style="margin:0;padding:0 0 0 16px;">${eventsHtml}</ul>
      </td></tr>
      <tr><td style="padding:12px 24px 18px;">
        <h2 style="margin:0 0 10px;font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#5c6d63;">Új hirdetések</h2>
        <ul style="margin:0;padding:0 0 0 16px;">${bulletinsHtml}</ul>
      </td></tr>
      <tr><td style="padding:0 24px 22px;">
        <a href="${esc(siteUrl)}/kozosseg" style="display:inline-block;padding:11px 18px;background:#1d4434;color:#fff;text-decoration:none;border-radius:999px;font-size:13.5px;font-weight:700;">Megnyitom a Piacot →</a>
      </td></tr>
    </table>
    <p style="max-width:520px;margin:14px auto 0;padding:0 8px;font-size:11px;line-height:1.55;color:#94a097;text-align:center;">
      Ezt a levelet azért kaptad, mert feliratkoztál a kinti heti hírlevelére.<br/>
      <a href="${esc(unsubscribeUrl)}" style="color:#94a097;text-decoration:underline;">Leiratkozás egy kattintással</a>
    </p>
  </td></tr>
</table>
</body></html>`;

  return { subject, html, text };
}

async function sendEmail(env: Env, to: string, subject: string, html: string, text: string): Promise<boolean> {
  if (!env.RESEND_API_KEY) return false;
  const from = env.EMAIL_FROM || "Kinti <info@kinti.app>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html, text }),
  });
  return res.ok;
}

async function runDigest(env: Env): Promise<DigestResult> {
  const db = env.DB;
  const siteUrl = (env.SITE_URL ?? "https://kinti.app").replace(/\/$/, "");

  // Csak megerősített feliratkozók
  const { results: subs } = await db
    .prepare(
      `SELECT id, email, canton_code, unsubscribe_token
       FROM digest_subscribers WHERE confirmed = 1`,
    )
    .all<Subscriber>();

  // Globális tartalom-pool — egyetlen lekérés, kantononként szűrünk
  const { results: allBulletins } = await db
    .prepare(
      `SELECT id, kind_id, title, meta, canton_code, price
       FROM bulletin_posts
       WHERE is_pending = 0 AND hidden = 0
         AND (expires_at IS NULL OR expires_at > datetime('now'))
         AND COALESCE(published_at, created_at) >= datetime('now', '-7 days')
       ORDER BY COALESCE(published_at, created_at) DESC
       LIMIT 80`,
    )
    .all<BulletinPost>();

  const { results: allEvents } = await db
    .prepare(
      `SELECT id, title, event_date, date_month, date_day, start_time, venue
       FROM events
       WHERE status = 'approved'
         AND event_date IS NOT NULL
         AND event_date >= date('now')
         AND event_date <= date('now', '+30 days')
       ORDER BY event_date ASC
       LIMIT 40`,
    )
    .all<EventRow>();

  let sent = 0;
  let skippedEmpty = 0;
  let failed = 0;

  for (const sub of subs) {
    // Hirdetések: a feliratkozó kantonja + canton_code IS NULL ("globális"). Ha
    // a feliratkozó NULL ("egész Svájc"), akkor mind látja.
    const bulletins = sub.canton_code
      ? allBulletins.filter((b) => b.canton_code === sub.canton_code || b.canton_code == null)
      : allBulletins;

    // Eseményeknél nincs canton_code; az "egész Svájc" mindenkinek megy. Ha a
    // feliratkozó egy adott kantont kért, megtartjuk az összes közelgőt (a
    // kanton-mező hiánya miatt nincs jobb szűrőnk a worker-szinten — későbbi
    // bővítés: events.canton_code).
    const events = allEvents.slice(0, 5);

    // Top 8 friss hirdetés (a hosszú lista ne fárassza az olvasót)
    const top = bulletins.slice(0, 8);

    if (top.length === 0 && events.length === 0) {
      skippedEmpty++;
      continue;
    }

    const { subject, html, text } = buildEmail(sub, top, events, siteUrl);
    try {
      const ok = await sendEmail(env, sub.email, subject, html, text);
      if (ok) {
        sent++;
        await db
          .prepare("UPDATE digest_subscribers SET last_sent_at = datetime('now') WHERE id = ?")
          .bind(sub.id)
          .run();
      } else {
        failed++;
      }
    } catch (err) {
      console.error("[cron-digest] send failed for", sub.email, err);
      failed++;
    }
  }

  return {
    totalSubs: subs.length,
    sent,
    skippedEmpty,
    failed,
    ranAt: new Date().toISOString(),
  };
}

export default {
  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(
      runDigest(env).then((result) => {
        console.log("[cron-digest]", JSON.stringify(result));
      }),
    );
  },

  async fetch(req: Request, env: Env): Promise<Response> {
    // Manuális futtatás: `curl -H 'authorization: Bearer <secret>' <worker-url>`
    const auth = req.headers.get("authorization") ?? "";
    const expected = env.CRON_SECRET ? `Bearer ${env.CRON_SECRET}` : null;
    if (!expected || auth !== expected) {
      return new Response("Unauthorized", { status: 401 });
    }
    const result = await runDigest(env);
    return Response.json(result);
  },
};
