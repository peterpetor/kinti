import { Resend } from "resend";
import { getCloudflareEnv } from "./cloudflare";
import type { WeeklyReport } from "./weekly-report";

/**
 * Resend SDK wrapper — tranzakciós emailek edge-kompatibilisen.
 *
 * Miért nem AWS SES / Nodemailer? Nodemailer SMTP-t használ, ami a Cloudflare
 * Workers env-jében nem érhető el. A Resend SDK belül `fetch`-et használ → edge-tiszta.
 * Ingyen 100 email/nap, fizetős 1000+/nap.
 *
 * Biztonság: a `RESEND_API_KEY` TITOK — sose kerül a kliensre, sose a forráskódba.
 * Kérés-hatókörben olvassuk a Cloudflare bindings env-jéből. Ha rotálod a kulcsot,
 * csak a .dev.vars vagy a Pages secret-et frissítsd; a kód változatlan marad.
 */

/** A Resend kliens kérés-hatókörű — minden szerver-route új példányt vesz.
 *  A `emails.send`-et becsomagoljuk: minden SIKERES küldést napi számlálóba
 *  írunk (a Resend 100/nap free-tier figyeléséhez az admin fülön). Best-effort —
 *  a számláló sosem törheti meg a küldést, és nem változtat a visszatérési értéken. */
function getResend(): Resend {
  const env = getCloudflareEnv();
  if (!env.RESEND_API_KEY) {
    throw new Error("Hiányzó RESEND_API_KEY env-változó.");
  }
  const resend = new Resend(env.RESEND_API_KEY);
  const originalSend = resend.emails.send.bind(resend.emails);
  resend.emails.send = (async (...args: Parameters<typeof originalSend>) => {
    // Suppression-guard: bounce/complaint webhookból letiltott címre NEM küldünk
    // (sender reputation védelem). Fail-open: a guard sosem törheti meg a küldést.
    // (A batch-küldés — resend.batch.send — ezt kerüli; ott a hívó szűr.)
    try {
      const to = (args[0] as { to?: string | string[] } | undefined)?.to;
      const addr = Array.isArray(to) ? to[0] : to;
      if (typeof addr === "string" && addr) {
        const { isEmailSuppressed } = await import("./repo-misc");
        if (await isEmailSuppressed(addr.toLowerCase())) {
          return { data: null, error: null } as unknown as Awaited<ReturnType<typeof originalSend>>;
        }
      }
    } catch { /* fail-open */ }

    const res = await originalSend(...args);
    if (res && !res.error) {
      try {
        const { recordEmailSent } = await import("./repo-misc");
        await recordEmailSent();
      } catch {
        /* a számláló sosem törheti meg az emailt */
      }
    }
    return res;
  }) as typeof resend.emails.send;
  return resend;
}

// --- email-templátehelper-ek ------------------------------------------------


interface ReviewConfirmArgs {
  to: string;
  reviewerName: string;
  businessName: string;
  rating: number;
  confirmUrl: string;
  manageUrl: string;
  confirmExpiresAt: string;
}

export async function sendReviewConfirmationEmail(
  args: ReviewConfirmArgs,
): Promise<void> {
  const env = getCloudflareEnv();
  const from = env.EMAIL_FROM || "Kinti <info@kinti.app>";
  const expiresHu = formatHu(args.confirmExpiresAt);
  const stars = "★".repeat(args.rating) + "☆".repeat(5 - args.rating);
  const subject = `Erősítsd meg a véleményed: ${args.businessName}`;

  const text = `Szia ${args.reviewerName}!

Megkaptuk a véleményedet a kinti.app-on:
  Vállalkozás: ${args.businessName}
  Értékelés: ${args.rating}/5  (${stars})

A publikáláshoz erősítsd meg egy kattintással:
  ${args.confirmUrl}

A megerősítő link ${expiresHu}-ig érvényes.

A véleményed kezelése (törlés) később:
  ${args.manageUrl}

Ha nem te küldted, hagyd figyelmen kívül.

Üdv,
kinti.app`;

  const html = baseLayout({
    preheader: `Egy kattintással publikáld a véleményedet: ${args.businessName}`,
    body: `
      <p style="margin:0 0 12px;font-size:15px;line-height:1.55;color:#0e1f17;">
        Szia ${escapeHtml(args.reviewerName)} 👋
      </p>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#0e1f17;">
        Megkaptuk a véleményedet a kinti.app-on:
      </p>
      <div style="margin:0 0 20px;padding:12px 14px;background:#fbf7ee;border:1px solid #e6ebe5;border-radius:14px;">
        <div style="font-size:14.5px;font-weight:700;color:#0e1f17;margin-bottom:4px;">
          ${escapeHtml(args.businessName)}
        </div>
        <div style="font-size:18px;color:#e3a233;letter-spacing:2px;">
          ${stars}
          <span style="font-size:12px;color:#5c6d63;font-weight:600;letter-spacing:0;">
            ${args.rating}/5
          </span>
        </div>
      </div>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#5c6d63;">
        A publikáláshoz erősítsd meg egy kattintással:
      </p>
      <p style="margin:0 0 20px;">
        ${button(args.confirmUrl, "Vélemény megerősítése →")}
      </p>
      <p style="margin:0 0 16px;font-size:12.5px;line-height:1.6;color:#5c6d63;">
        A megerősítő link <strong>${escapeHtml(expiresHu)}-ig</strong> érvényes.
      </p>
      <hr style="border:none;border-top:1px solid #e6ebe5;margin:20px 0;" />
      <p style="margin:0 0 6px;font-size:12px;color:#5c6d63;">
        Később törölni szeretnéd a véleményed?
        <br />
        <a href="${escapeAttr(args.manageUrl)}" style="color:#1d4434;text-decoration:underline;">
          Vélemény kezelése
        </a>
        (mentsd el ezt az emailt)
      </p>`,
  });

  const { error } = await getResend().emails.send({
    from,
    to: args.to,
    subject,
    html,
    text,
  });

  if (error) {
    throw new Error(`Resend: ${error.name ?? "hiba"} — ${error.message ?? "ismeretlen"}`);
  }
}

interface BackupEmailItem {
  type: string;
  title: string;
  manageUrl: string;
  createdAt: string;
}

interface BackupEmailArgs {
  to: string;
  items: BackupEmailItem[];
  origin: string;
}

/**
 * sendBackupEmail — a /sajatjaim oldal "Küldjük emailre" gombja hívja.
 *
 * GDPR-tisztaság: a kinti SZERVERE SOSE látja az email + manage_token párosítást
 * (csak ezt az egyetlen HTTP requestet, ami azonnal továbbküldi Resendre, és
 * sehol nem tárolódik). A user megadja az email-jét, mi azonnal kiküldjük
 * a backup-listát, NEM mentjük.
 */
export async function sendBackupEmail(args: BackupEmailArgs): Promise<void> {
  const env = getCloudflareEnv();
  const from = env.EMAIL_FROM || "Kinti <info@kinti.app>";

  const TYPE_LABEL: Record<string, string> = {
    event: "Esemény",
    review: "Vélemény",
    business: "Vállalkozás",
  };

  const itemsText = args.items
    .map((it) => {
      const label = TYPE_LABEL[it.type] ?? it.type;
      const full = `${args.origin}${it.manageUrl}`;
      return `  ${label}: "${it.title}"\n  Kezelő-link: ${full}`;
    })
    .join("\n\n");

  const itemsHtml = args.items
    .map((it) => {
      const label = TYPE_LABEL[it.type] ?? it.type;
      const full = `${args.origin}${it.manageUrl}`;
      return `<div style="margin:0 0 16px;padding:12px 14px;background:#fbf7ee;border:1px solid #e6ebe5;border-radius:14px;">
        <div style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#5c6d63;margin-bottom:3px;">
          ${escapeHtml(label)}
        </div>
        <div style="font-size:14px;font-weight:700;color:#0e1f17;margin-bottom:8px;">
          ${escapeHtml(it.title)}
        </div>
        <a href="${escapeAttr(full)}" style="display:inline-block;font-size:12.5px;color:#1d4434;text-decoration:underline;word-break:break-all;">
          Kezelő-link →
        </a>
      </div>`;
    })
    .join("");

  const subject = `kinti backup — ${args.items.length} kezelő-link`;
  const text = `Szia!

Ezt a backup-emailt te kérted a kinti.app /sajatjaim oldalán.

Az alábbi kezelő-linkekkel bármikor visszatérhetsz a posztjaidhoz (szerkesztés vagy törlés). Tedd biztonságos helyre — nálunk NEM marad meg semmilyen másolat erről az email-küldésről.

${itemsText}

— kinti.app
`;

  const html = baseLayout({
    preheader: `${args.items.length} kezelő-link a posztjaidhoz`,
    body: `
      <p style="margin:0 0 12px;font-size:15px;line-height:1.55;color:#0e1f17;">
        Szia 👋
      </p>
      <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#0e1f17;">
        A kinti.app <strong>Saját posztjaim</strong> oldalán kértél tőlünk egy backup-emailt.
        Az alábbi <strong>${args.items.length}</strong> kezelő-link a tiéd:
      </p>
      ${itemsHtml}
      <p style="margin:0 0 12px;font-size:12px;line-height:1.6;color:#5c6d63;">
        <strong style="color:#0e1f17;">Tedd ezt az emailt biztonságos helyre.</strong>
        A kinti.app szerverein NEM marad meg semmilyen másolat erről az
        email-küldésről — ez kizárólag a te biztonsági mentésed.
      </p>
      <p style="margin:0;font-size:12px;line-height:1.6;color:#5c6d63;">
        Ha nem te kérted, hagyd figyelmen kívül.
      </p>`,
  });

  const { error } = await getResend().emails.send({
    from,
    to: args.to,
    subject,
    html,
    text,
  });

  if (error) {
    throw new Error(`Resend: ${error.name ?? "hiba"} — ${error.message ?? "ismeretlen"}`);
  }
}

/**
 * Egyszerű "Hello world" teszt-email — gyors sanity check, hogy a Resend
 * konfiguráció (kulcs + küldő + címzett) működik-e. Az /api/dev/test-email
 * route hívja, csak `next dev`-ben.
 */
export async function sendTestEmail(to: string): Promise<{ id: string | null }> {
  const env = getCloudflareEnv();
  const from = env.EMAIL_FROM || "Kinti <info@kinti.app>";

  const { data, error } = await getResend().emails.send({
    from,
    to,
    subject: "kinti — Resend teszt",
    html: "<p>Sikerült! A Resend integráció <strong>működik</strong>.</p>",
    text: "Sikerült! A Resend integráció működik.",
  });

  if (error) {
    throw new Error(`Resend: ${error.name ?? "hiba"} — ${error.message ?? "ismeretlen"}`);
  }
  return { id: data?.id ?? null };
}

/**
 * Határidő-emlékeztető email (OPT-IN). A Határidő-asszisztens napi cronja hívja a
 * 14/7/1 napos küszöböknél, ha a felhasználó kérte az emailes emlékeztetőt is.
 * Tranzakciós (nem hírlevél) — említi, hogy az appban bármikor kikapcsolható.
 */
export async function sendDeadlineReminderEmail(to: string, title: string, when: string): Promise<void> {
  const env = getCloudflareEnv();
  const from = env.EMAIL_FROM || "Kinti <info@kinti.app>";
  const safeTitle = title.replace(/[<>]/g, "").slice(0, 120);
  const html = `<div style="font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;max-width:520px;margin:0 auto;padding:8px">
<p style="font-size:18px;font-weight:800;margin:0 0 6px">⏰ Közeledő határidő</p>
<p style="margin:0 0 12px"><strong>${safeTitle}</strong> — <strong>${when}</strong> lejár.</p>
<p style="margin:0 0 16px">Nézd meg a részleteket és a hivatalos linkeket a Kinti Határidő-asszisztensben.</p>
<a href="https://kinti.app/hatarido" style="display:inline-block;background:#1d4434;color:#fff;text-decoration:none;font-weight:700;padding:10px 18px;border-radius:999px">Megnézem</a>
<hr style="border:none;border-top:1px solid #e5e5e5;margin:20px 0"/>
<p style="font-size:12px;color:#888;margin:0">Ezt az emlékeztetőt azért kapod, mert bekapcsoltad az emailes emlékeztetőt a Határidő-asszisztensben. Bármikor kikapcsolhatod ugyanott.</p>
</div>`;
  const { error } = await getResend().emails.send({
    from,
    to,
    subject: `⏰ ${safeTitle} — ${when} lejár`,
    html,
    text: `Közeledő határidő: ${safeTitle} — ${when} lejár. Részletek: https://kinti.app/hatarido`,
  });
  if (error) throw new Error(`Resend: ${error.name ?? "hiba"} — ${error.message ?? "ismeretlen"}`);
}

/**
 * Vélemény-gyűjtő nudge: 3 nappal az ajánlatkérés után — „Milyen volt? Írj pár
 * mondatot", mélylinkkel a cégoldal értékelő-űrlapjára. Lead-enként egyszer megy.
 */
export async function sendReviewNudgeEmail(args: {
  to: string;
  senderName: string;
  businessName: string;
  businessId: string;
}): Promise<void> {
  const env = getCloudflareEnv();
  const from = env.EMAIL_FROM || "Kinti <info@kinti.app>";
  const safeName = args.senderName.replace(/[<>]/g, "").slice(0, 60);
  const safeBiz = args.businessName.replace(/[<>]/g, "").slice(0, 120);
  const url = `https://kinti.app/szaknevsor/${encodeURIComponent(args.businessId)}?ertekeles=1#ertekeles`;
  const html = `<div style="font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;max-width:520px;margin:0 auto;padding:8px">
<p style="font-size:18px;font-weight:800;margin:0 0 6px">⭐ Milyen volt? Segíts a többi kintinek!</p>
<p style="margin:0 0 12px">Szia${safeName ? ` ${safeName}` : ""}! Pár napja árajánlatot kértél tőle: <strong>${safeBiz}</strong>.</p>
<p style="margin:0 0 16px">Írnál róla pár mondatot? A valódi magyar vélemények segítenek a többieknek jó szakembert találni — 30 másodperc, se fiók, se regisztráció.</p>
<a href="${url}" style="display:inline-block;background:#1d4434;color:#fff;text-decoration:none;font-weight:700;padding:10px 18px;border-radius:999px">Értékelést írok</a>
<hr style="border:none;border-top:1px solid #e5e5e5;margin:20px 0"/>
<p style="font-size:12px;color:#888;margin:0">Ezt az egyszeri emlékeztetőt azért kapod, mert a kintin ajánlatot kértél ettől a vállalkozástól. Több ilyet nem küldünk ehhez a kéréshez.</p>
</div>`;
  const { error } = await getResend().emails.send({
    from,
    to: args.to,
    subject: `⭐ Milyen volt: ${safeBiz}? Írj pár mondatot`,
    html,
    text: `Szia! Pár napja ajánlatot kértél tőle: ${safeBiz}. Írnál róla pár mondatot? ${url}`,
  });
  if (error) throw new Error(`Resend: ${error.name ?? "hiba"} — ${error.message ?? "ismeretlen"}`);
}

/** A hírlevél-email HTML-layoutja: a szerkesztett törzs + KÖTELEZŐ leiratkozó-lábléc. */
function newsletterHtml(bodyHtml: string, unsubscribeUrl: string): string {
  return `<div style="font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;max-width:560px;margin:0 auto;padding:8px">
${bodyHtml}
<hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0"/>
<p style="font-size:12px;color:#888;margin:0">Ezt az e-mailt azért kapod, mert feliratkoztál a Kinti hírlevélre. <a href="${unsubscribeUrl}" style="color:#888">Leiratkozás</a></p>
</div>`;
}

/**
 * TÖMEGES hírlevél-küldés Resend BATCH API-val (egy hívásban max 100 email) —
 * így nem ütközünk a 2/sec rate-limitbe. Minden email személyre szabott leiratkozó-
 * linkkel megy. A napi számlálót manuálisan írjuk (a batch nem a wrappelt send-en megy).
 * A hívó gondoskodik róla, hogy `recipients.length <= 100` (napi keret / batch-limit).
 */
export async function sendNewsletterBatch(args: {
  recipients: { to: string; unsubscribeUrl: string }[];
  subject: string;
  bodyHtml: string;
  bodyText: string;
}): Promise<{ sent: number; failed: number }> {
  if (!args.recipients.length) return { sent: 0, failed: 0 };
  const env = getCloudflareEnv();
  if (!env.RESEND_API_KEY) throw new Error("Hiányzó RESEND_API_KEY env-változó.");
  const from = env.EMAIL_FROM || "Kinti <info@kinti.app>";
  const resend = new Resend(env.RESEND_API_KEY);
  const batch = args.recipients.map((r) => ({
    from,
    to: r.to,
    subject: args.subject,
    html: newsletterHtml(args.bodyHtml, r.unsubscribeUrl),
    text: `${args.bodyText}\n\n—\nLeiratkozás: ${r.unsubscribeUrl}`,
  }));
  const { data, error } = await resend.batch.send(batch);
  if (error) return { sent: 0, failed: batch.length };
  const sent = data?.data?.length ?? batch.length;
  try {
    const { recordEmailsSent } = await import("./repo-misc");
    await recordEmailsSent(sent);
  } catch {
    /* a számláló sosem törheti meg a küldést */
  }
  return { sent, failed: batch.length - sent };
}

/**
 * Közvetítői KÖRLEVÉL — egyenként személyre szabott (tárgy/törzs) e-mailek
 * a munkáltatóknak, Resend BATCH-csel (max 100/hívás). Minden levél külön To-ra
 * megy (NEM közös CC/BCC), a `replyTo` a közvetítő saját címe → a hirdető neki
 * válaszol. A `from` megjelenített neve a hívótól jön (pl. "Feedback Jobs ...").
 */
export async function sendOutreachBatch(args: {
  from: string;
  replyTo?: string;
  recipients: { to: string; subject: string; html: string; text: string }[];
}): Promise<{ sent: number; failed: number }> {
  if (!args.recipients.length) return { sent: 0, failed: 0 };
  const env = getCloudflareEnv();
  if (!env.RESEND_API_KEY) throw new Error("Hiányzó RESEND_API_KEY env-változó.");
  const resend = new Resend(env.RESEND_API_KEY);
  const batch = args.recipients.map((r) => ({
    from: args.from,
    to: r.to,
    replyTo: args.replyTo,
    subject: r.subject,
    html: r.html,
    text: r.text,
  }));
  const { data, error } = await resend.batch.send(batch);
  if (error) return { sent: 0, failed: batch.length };
  const sent = data?.data?.length ?? batch.length;
  try {
    const { recordEmailsSent } = await import("./repo-misc");
    await recordEmailsSent(sent);
  } catch {
    /* a számláló sosem törheti meg a küldést */
  }
  return { sent, failed: batch.length - sent };
}

/**
 * Generikus email-küldő nyers HTML-törzzsel (pl. admin-értesítőkhöz). A
 * specifikus sablon-függvények (sendReviewConfirmationEmail stb.) saját
 * layouttal küldenek; ez az egyszerű kimenet tetszőleges HTML-hez.
 */
export async function sendEmail(args: { to: string; subject: string; html: string; text?: string }): Promise<{ id: string | null }> {
  const env = getCloudflareEnv();
  const from = env.EMAIL_FROM || "Kinti <info@kinti.app>";

  const { data, error } = await getResend().emails.send({
    from,
    to: args.to,
    subject: args.subject,
    html: args.html,
    text: args.text ?? args.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
  });

  if (error) {
    throw new Error(`Resend: ${error.name ?? "hiba"} — ${error.message ?? "ismeretlen"}`);
  }
  return { id: data?.id ?? null };
}

// --- HTML-segédek -----------------------------------------------------------

function baseLayout({ preheader, body }: { preheader: string; body: string }): string {
  return `<!doctype html>
<html lang="hu">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>kinti</title>
</head>
<body style="margin:0;padding:0;background:#f4ede0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">
    ${escapeHtml(preheader)}
  </span>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f4ede0;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:480px;background:#ffffff;border-radius:20px;box-shadow:0 4px 16px rgba(14,31,23,0.06);">
        <tr><td style="padding:24px 24px 8px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="vertical-align:middle;padding-right:10px;">
                <img src="https://kinti.app/favicon.ico" width="28" height="28" alt="kinti logo" style="display:block; border-radius:8px; background:#ffffff;" />
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

function button(href: string, label: string): string {
  return `<a href="${escapeAttr(href)}"
    style="display:inline-block;padding:13px 22px;background:#1d4434;color:#ffffff;text-decoration:none;border-radius:999px;font-size:14px;font-weight:800;letter-spacing:-0.01em;">
    ${escapeHtml(label)}
  </a>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}
function escapeAttr(s: string): string {
  return escapeHtml(s);
}

// `sendBusinessQuoteEmail` ELTÁVOLÍTVA — a vállalkozás "Kérj árajánlatot"
// email-relay flow megszűnt. A kapcsolat zero-relay: a vállalkozó telefonja
// jelenik meg, a látogató közvetlenül hív vagy WhatsApp-ol.

// --- Esemény beküldő: megerősítő email -------------------------------------

interface EventConfirmEmailArgs {
  to: string;
  title: string;
  eventDate: string;
  venue: string;
  confirmUrl: string;
  /** Manage URL — a feladó ezzel szerkesztheti/törölheti később. */
  manageUrl: string;
}

export async function sendEventConfirmationEmail(args: EventConfirmEmailArgs): Promise<void> {
  const env = getCloudflareEnv();
  const from = env.EMAIL_FROM || "Kinti <info@kinti.app>";
  const subject = "Erősítsd meg az eseményedet – kinti.app";

  const text = `Szia!\n\nMegkaptuk az eseménybeküldésedet a kinti.app-on:\n  Cím: ${args.title}\n  Dátum: ${args.eventDate}\n  Helyszín: ${args.venue}\n\nAz eseményt moderátor ellenőrzi, és hamarosan megjelenik az oldalon.\n\nAmíg erre várnál, erősítsd meg az email-címedet egy kattintással:\n  ${args.confirmUrl}\n\n—————————————————\n\nEsemény kezelése (szerkesztés, törlés):\n  ${args.manageUrl}\nTedd el ezt a linket — bármikor onnan tudod módosítani.\n\nHa nem te küldted be ezt az eseményt, hagyd figyelmen kívül.\n\nÜdv,\nkinti.app`;

  const html = baseLayout({
    preheader: `Esemény beküldve: ${args.title} – várd meg a moderátor jóváhagyását!`,
    body: `
      <p style="margin:0 0 12px;font-size:15px;line-height:1.55;color:#0e1f17;">
        Szia 👋
      </p>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#0e1f17;">
        Megkaptuk az eseménybeküldésedet:
      </p>
      <div style="margin:0 0 20px;padding:14px;background:#fbf7ee;border:1px solid #e6ebe5;border-radius:14px;">
        <div style="font-size:14.5px;font-weight:700;color:#0e1f17;margin-bottom:6px;">${escapeHtml(args.title)}</div>
        <div style="font-size:13px;color:#5c6d63;">📅 ${escapeHtml(args.eventDate)} &nbsp;·&nbsp; 📍 ${escapeHtml(args.venue)}</div>
      </div>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#5c6d63;">
        Egy moderátor hamarosan <strong>jóváhagyja</strong> – és az esemény azonnal megjelenik a kinti.app naptárban.
      </p>
      <p style="margin:0 0 20px;">
        ${button(args.confirmUrl, "Email megerősítése →")}
      </p>
      <hr style="border:none;border-top:1px solid #e6ebe5;margin:24px 0;" />
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#0e1f17;">
        Esemény kezelése (szerkesztés, törlés)
      </p>
      <p style="margin:0 0 12px;font-size:12.5px;line-height:1.6;color:#5c6d63;">
        Ezt a linket <strong>tedd el</strong> — bármikor itt módosíthatod, regisztráció nélkül:
      </p>
      <p style="margin:0 0 16px;">
        <a href="${args.manageUrl}" style="display:inline-block;font-size:12.5px;color:#0e7c5b;word-break:break-all;text-decoration:underline;">${escapeHtml(args.manageUrl)}</a>
      </p>
      <p style="margin:0;font-size:11.5px;color:#94a097;line-height:1.5;">
        Ha nem te küldted be ezt az eseményt, hagyd figyelmen kívül. Semmi sem kerül ki a weboldalra a moderátor jóváhagyása nélkül.
      </p>`,
  });

  const { error } = await getResend().emails.send({ from, to: args.to, subject, html, text });
  if (error) {
    throw new Error(`Resend: ${error.name ?? "hiba"} — ${error.message ?? "ismeretlen"}`);
  }
}

// --- Admin: jóváhagyó/elutasító email (1 kattintásos moderáció) ------------

interface EventAdminModerationEmailArgs {
  adminEmail: string;
  eventId: string;
  title: string;
  eventDate: string;
  startTime: string;
  venue: string;
  description: string | null;
  tag: string | null;
  submitterEmail: string;
  approveUrl: string;
  rejectUrl: string;
}

export async function sendEventAdminModerationEmail(
  args: EventAdminModerationEmailArgs,
): Promise<void> {
  const env = getCloudflareEnv();
  const from = env.EMAIL_FROM || "Kinti <info@kinti.app>";
  const subject = `⚠️ Új esemény jóváhagyásra vár: „${args.title}"`;

  const text = `Kinti Admin\n\nÚj eseményt küldtek be, amit jóvá kell hagynod:\n\nCím: ${args.title}\nDátum: ${args.eventDate} ${args.startTime}\nHelyszín: ${args.venue}\nTípus: ${args.tag ?? "–"}\nLeírás: ${args.description ?? "(nincs)"}\nBeküldő: ${args.submitterEmail}\n\n✅ JÓVÁHAGYÁS:\n${args.approveUrl}\n\n❌ ELUTASÍTÁS (törlés):\n${args.rejectUrl}`;

  const html = baseLayout({
    preheader: `Moderálandó esemény: ${args.title} – ${args.eventDate}`,
    body: `
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#94a097;">Kinti Admin értesítő</p>
      <p style="margin:0 0 16px;font-size:15px;font-weight:800;color:#0e1f17;">Új esemény jóváhagyásra vár</p>
      <div style="margin:0 0 20px;padding:16px;background:#fbf7ee;border:1px solid #e6ebe5;border-radius:14px;">
        <div style="font-size:15px;font-weight:800;color:#0e1f17;margin-bottom:8px;">${escapeHtml(args.title)}</div>
        <table style="border-collapse:collapse;width:100%;font-size:13px;color:#5c6d63;">
          <tr><td style="padding:3px 0;font-weight:600;width:80px;">Dátum:</td><td>${escapeHtml(args.eventDate)} ${escapeHtml(args.startTime)}</td></tr>
          <tr><td style="padding:3px 0;font-weight:600;">Helyszín:</td><td>${escapeHtml(args.venue)}</td></tr>
          <tr><td style="padding:3px 0;font-weight:600;">Típus:</td><td>${escapeHtml(args.tag ?? "–")}</td></tr>
          <tr><td style="padding:3px 0;font-weight:600;">Beküldő:</td><td>${escapeHtml(args.submitterEmail)}</td></tr>
        </table>
        ${args.description ? `<div style="margin-top:12px;padding:10px;background:#f0ebe0;border-radius:10px;font-size:13px;line-height:1.5;color:#0e1f17;">${escapeHtml(args.description)}</div>` : ""}
      </div>
      <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#0e1f17;">Döntsd el egy kattintással:</p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;">
        <tr>
          <td style="padding-right:10px;">
            <a href="${escapeAttr(args.approveUrl)}" style="display:inline-block;padding:13px 22px;background:#1d4434;color:#ffffff;text-decoration:none;border-radius:999px;font-size:14px;font-weight:800;">✅ Jóváhagyás</a>
          </td>
          <td>
            <a href="${escapeAttr(args.rejectUrl)}" style="display:inline-block;padding:13px 22px;background:#c8392e;color:#ffffff;text-decoration:none;border-radius:999px;font-size:14px;font-weight:800;">❌ Elutasítás</a>
          </td>
        </tr>
      </table>
      <p style="margin:0;font-size:11.5px;color:#94a097;">Ez az esemény addig NEM látható a kinti.app-on, amíg jóvá nem hagyod.</p>`,
  });

  const { error } = await getResend().emails.send({
    from,
    to: args.adminEmail,
    subject,
    html,
    text,
  });
  if (error) {
    throw new Error(`Resend: ${error.name ?? "hiba"} — ${error.message ?? "ismeretlen"}`);
  }
}

// `sendDigestConfirmEmail` ELTÁVOLÍTVA — a heti hírlevél email-feliratkozás
// megszűnt (digest_subscribers tábla droppolva). Helyette Web Push.

// --- Self-service vállalkozás-beküldés: megerősítő email --------------------

interface BusinessConfirmEmailArgs {
  to: string;
  businessName: string;
  /** Teljes URL — pl. https://kinti.app/api/business/confirm/<token>. */
  confirmUrl: string;
  confirmExpiresAt: string;
  /** Manage URL — a feladó ezzel szerkesztheti/törölheti később. */
  manageUrl: string;
}

export async function sendBusinessConfirmationEmail(
  args: BusinessConfirmEmailArgs,
): Promise<void> {
  const env = getCloudflareEnv();
  const from = env.EMAIL_FROM || "Kinti <info@kinti.app>";
  const expiresHu = formatHu(args.confirmExpiresAt);
  const subject = "Erősítsd meg a vállalkozásod a kinti.app Szaknévsorban";

  const text = `Szia!

Megkaptuk a vállalkozásod a kinti Szaknévsorba:
  "${args.businessName}"

A publikáláshoz erősítsd meg egy kattintással:
  ${args.confirmUrl}

A megerősítés után a vállalkozásod az adminisztrátor ellenőrzésére vár (általában 24 órán belül). Amint elfogadta, automatikusan megjelenik a Szaknévsorban.

A megerősítő link ${expiresHu}-ig érvényes.

—————————————————————————

Vállalkozásod kezelése (szerkesztés / nyitvatartás / törlés):
  ${args.manageUrl}

Ezt a linket TEDD EL — bármikor onnan tudod módosítani vagy törölni a vállalkozást. Nem kell hozzá regisztráció.

Ha nem te küldted be ezt a vállalkozást, hagyd figyelmen kívül.

Üdv,
kinti.app`;

  const html = baseLayout({
    preheader: `Egy kattintással fent a Szaknévsorban: ${args.businessName}`,
    body: `
      <p style="margin:0 0 12px;font-size:15px;line-height:1.55;color:#0e1f17;">
        Szia 👋
      </p>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#0e1f17;">
        Megkaptuk a vállalkozásod a kinti <strong>Szaknévsorba</strong>:
      </p>
      <p style="margin:0 0 20px;padding:12px 14px;background:#fbf7ee;border:1px solid #e6ebe5;border-radius:14px;font-size:14.5px;font-weight:700;color:#0e1f17;">
        ${escapeHtml(args.businessName)}
      </p>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#5c6d63;">
        A publikáláshoz erősítsd meg egy kattintással — utána <strong>azonnal</strong>
        megjelenik a Szaknévsorban:
      </p>
      <p style="margin:0 0 20px;">
        ${button(args.confirmUrl, "Vállalkozásom megerősítése →")}
      </p>
      <p style="margin:0 0 16px;font-size:12.5px;line-height:1.6;color:#5c6d63;">
        A megerősítő link <strong>${escapeHtml(expiresHu)}-ig</strong> érvényes.
      </p>
      <hr style="border:none;border-top:1px solid #e6ebe5;margin:24px 0;" />
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#0e1f17;">
        Vállalkozásod kezelése (szerkesztés, nyitvatartás, törlés)
      </p>
      <p style="margin:0 0 12px;font-size:12.5px;line-height:1.6;color:#5c6d63;">
        Ezt a linket <strong>tedd el</strong> — bármikor itt módosíthatod vagy törölheted a vállalkozást, regisztráció nélkül:
      </p>
      <p style="margin:0 0 16px;">
        <a href="${args.manageUrl}" style="display:inline-block;font-size:12.5px;color:#0e7c5b;word-break:break-all;text-decoration:underline;">${escapeHtml(args.manageUrl)}</a>
      </p>
      <p style="margin:0;font-size:11.5px;color:#94a097;line-height:1.5;">
        Ha nem te küldted be ezt a vállalkozást, hagyd figyelmen kívül — semmi sem
        kerül ki a megerősítésed nélkül.
      </p>`,
  });

  const { error } = await getResend().emails.send({ from, to: args.to, subject, html, text });
  if (error) {
    throw new Error(`Resend: ${error.name ?? "hiba"} — ${error.message ?? "ismeretlen"}`);
  }
}

// --- Jelentés (Notice & Takedown): admin értesítő -------------------------

interface ContentReportEmailArgs {
  adminEmail: string;
  /** Pl. "Vállalkozás", "Vélemény" vagy "S.O.S. Riasztás". */
  contentLabel: string;
  /** A bejelentett tartalom rövid kivonata (cím / szöveg-részlet). */
  contentExcerpt: string;
  reason: string;
  /** Visszaállítás (rejtés feloldása) URL. */
  keepUrl: string;
  /** Végleges törlés URL. */
  removeUrl: string;
}

export async function sendContentReportEmail(args: ContentReportEmailArgs): Promise<void> {
  const env = getCloudflareEnv();
  const from = env.EMAIL_FROM || "Kinti <info@kinti.app>";
  const subject = `⚠️ Bejelentett ${args.contentLabel.toLowerCase()} — el van rejtve, döntened kell`;

  const text = `Kinti Admin

Egy ${args.contentLabel.toLowerCase()} tartalmat bejelentettek, ezért AZONNAL elrejtettük a publikum elől.

Tartalom: ${args.contentExcerpt}
Indok: ${args.reason}

Döntsd el:
- VISSZAÁLLÍTÁS (a bejelentés alaptalan, jelenjen meg újra):
${args.keepUrl}

- VÉGLEGES TÖRLÉS:
${args.removeUrl}

A tartalom addig rejtve marad, amíg nem döntesz.`;

  const html = baseLayout({
    preheader: `Bejelentett ${args.contentLabel.toLowerCase()} — el van rejtve, döntened kell`,
    body: `
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#94a097;">Kinti Admin értesítő</p>
      <p style="margin:0 0 16px;font-size:15px;font-weight:800;color:#0e1f17;">Bejelentett ${escapeHtml(args.contentLabel.toLowerCase())} — már el van rejtve</p>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#5c6d63;">
        A tartalmat egy felhasználó bejelentette, ezért <strong>azonnal elrejtettük</strong> a publikum elől. Maradjon rejtve, vagy állítsd vissza?
      </p>
      <div style="margin:0 0 16px;padding:14px;background:#fbf7ee;border:1px solid #e6ebe5;border-radius:14px;">
        <div style="font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#94a097;margin-bottom:4px;">${escapeHtml(args.contentLabel)}</div>
        <div style="font-size:14px;line-height:1.5;color:#0e1f17;">${escapeHtml(args.contentExcerpt)}</div>
      </div>
      <div style="margin:0 0 20px;padding:12px 14px;background:#fff8ed;border:1px solid #e3a233;border-radius:14px;">
        <div style="font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#9a6b00;margin-bottom:4px;">Bejelentés indoka</div>
        <div style="font-size:13.5px;line-height:1.5;color:#0e1f17;white-space:pre-wrap;">${escapeHtml(args.reason)}</div>
      </div>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px;">
        <tr>
          <td style="padding-right:10px;">
            <a href="${escapeAttr(args.keepUrl)}" style="display:inline-block;padding:13px 20px;background:#1d4434;color:#ffffff;text-decoration:none;border-radius:999px;font-size:14px;font-weight:800;">↩︎ Visszaállítás</a>
          </td>
          <td>
            <a href="${escapeAttr(args.removeUrl)}" style="display:inline-block;padding:13px 20px;background:#c8392e;color:#ffffff;text-decoration:none;border-radius:999px;font-size:14px;font-weight:800;">🗑 Végleges törlés</a>
          </td>
        </tr>
      </table>
      <p style="margin:0;font-size:11.5px;color:#94a097;">A tartalom addig NEM látható a kinti.app-on, amíg nem döntesz.</p>`,
  });

  const { error } = await getResend().emails.send({ from, to: args.adminEmail, subject, html, text });
  if (error) {
    throw new Error(`Resend: ${error.name ?? "hiba"} — ${error.message ?? "ismeretlen"}`);
  }
}

function formatHu(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const HU_MONTH = ["jan.", "feb.", "márc.", "ápr.", "máj.", "jún.", "júl.", "aug.", "szept.", "okt.", "nov.", "dec."];
  return `${d.getFullYear()}. ${HU_MONTH[d.getMonth()]} ${d.getDate()}. ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}


// --- Admin: generic "uj tartalom moderalasra var" ---------------------------

interface AdminContentPendingArgs {
  adminEmail: string;
  contentType: string;
  title: string;
  preview: string;
  submitterEmail: string | null;
  moderationUrl: string;
}

export async function sendAdminContentPendingEmail(
  args: AdminContentPendingArgs,
): Promise<void> {
  const env = getCloudflareEnv();
  const from = env.EMAIL_FROM || "Kinti <info@kinti.app>";
  const subject = `Uj ${args.contentType} jovahagyasra var: "${args.title}"`;

  const text = `Uj ${args.contentType} erkezett a kinti.app-on, es jovahagyasra var.

Cim / nev: ${args.title}
Elonezet: ${args.preview.slice(0, 200)}
Bekulldo: ${args.submitterEmail ?? "(anonim)"}

Moderacio:
${args.moderationUrl}

A tartalom addig NEM lathato publikusan, amig jova nem hagyod.`;

  const html = baseLayout({
    preheader: `Moderalando ${args.contentType}: ${args.title}`,
    body: `
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#94a097;">Kinti Admin ertesito</p>
      <p style="margin:0 0 16px;font-size:15px;font-weight:800;color:#0e1f17;">Uj ${escapeHtml(args.contentType)} jovahagyasra var</p>
      <div style="margin:0 0 20px;padding:16px;background:#fbf7ee;border:1px solid #e6ebe5;border-radius:14px;">
        <div style="font-size:15px;font-weight:800;color:#0e1f17;margin-bottom:8px;">${escapeHtml(args.title)}</div>
        ${args.preview ? `<div style="margin-top:8px;padding:10px;background:#f0ebe0;border-radius:10px;font-size:13px;line-height:1.5;color:#0e1f17;">${escapeHtml(args.preview.slice(0, 400))}</div>` : ""}
        ${args.submitterEmail ? `<div style="margin-top:10px;font-size:12px;color:#5c6d63;"><strong>Bekulldo:</strong> ${escapeHtml(args.submitterEmail)}</div>` : ""}
      </div>
      <p style="margin:0 0 20px;">
        <a href="${escapeAttr(args.moderationUrl)}" style="display:inline-block;padding:13px 22px;background:#1d4434;color:#ffffff;text-decoration:none;border-radius:999px;font-size:14px;font-weight:800;">Megnyitom a moderaciot</a>
      </p>
      <p style="margin:0;font-size:11.5px;color:#94a097;">A tartalom NEM lathato publikusan, amig jova nem hagyod.</p>`,
  });

  const { error } = await getResend().emails.send({
    from,
    to: args.adminEmail,
    subject,
    html,
    text,
  });
  if (error) {
    throw new Error(`Resend: ${error.name ?? "hiba"} - ${error.message ?? "ismeretlen"}`);
  }
}

// --- Munkáltató értesítő: új pályázat érkezett ----------------------------

interface JobApplicationNotificationArgs {
  /** A munkáltató email-je (ahová értesítést küldünk). */
  to: string;
  companyName: string;
  jobTitle: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string | null;
  message: string | null;
  /** A munkáltatói dashboard URL (https://kinti.app/munkaltato). */
  dashboardUrl: string;
}

/**
 * sendJobApplicationNotificationEmail — a munkáltató kap emailt, ha valaki
 * jelentkezik az állásra. Best-effort: ha a Resend API nem érhető el,
 * a pályázat mentése sikeres marad, csak az email marad el.
 */
export async function sendJobApplicationNotificationEmail(
  args: JobApplicationNotificationArgs,
): Promise<void> {
  const env = getCloudflareEnv();
  const from = env.EMAIL_FROM || "Kinti <info@kinti.app>";
  const subject = `Új pályázat érkezett: ${args.jobTitle}`;

  const text = `Szia, ${args.companyName}!

Új pályázat érkezett a kinti.app-on meghirdetett állásodra:

  Állás: ${args.jobTitle}
  Pályázó neve: ${args.applicantName}
  E-mail: ${args.applicantEmail}
  Telefon: ${args.applicantPhone ?? "(nem adta meg)"}

Motivációs levél:
${args.message ?? "(nem írt üzenetet)"}

A munkáltatói dashboardon megtekintheted és kezelheted az összes beérkező pályázatot:
  ${args.dashboardUrl}

— kinti.app`;

  const html = baseLayout({
    preheader: `Új pályázat érkezett az állásra: ${args.jobTitle}`,
    body: `
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#94a097;">Kinti Job Board</p>
      <p style="margin:0 0 16px;font-size:15px;font-weight:800;color:#0e1f17;">Új pályázat érkezett!</p>
      <div style="margin:0 0 20px;padding:16px;background:#fbf7ee;border:1px solid #e6ebe5;border-radius:14px;">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#94a097;margin-bottom:4px;">Állás</div>
        <div style="font-size:15px;font-weight:800;color:#0e1f17;margin-bottom:12px;">${escapeHtml(args.jobTitle)}</div>
        <table style="border-collapse:collapse;width:100%;font-size:13px;color:#5c6d63;">
          <tr><td style="padding:3px 0;font-weight:600;width:80px;">Név:</td><td>${escapeHtml(args.applicantName)}</td></tr>
          <tr><td style="padding:3px 0;font-weight:600;">E-mail:</td><td><a href="mailto:${escapeAttr(args.applicantEmail)}" style="color:#1d4434;">${escapeHtml(args.applicantEmail)}</a></td></tr>
          <tr><td style="padding:3px 0;font-weight:600;">Telefon:</td><td>${escapeHtml(args.applicantPhone ?? "–")}</td></tr>
        </table>
        ${args.message ? `<div style="margin-top:12px;padding:10px;background:#f0ebe0;border-radius:10px;">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#94a097;margin-bottom:4px;">Motivációs levél</div>
          <div style="font-size:13px;line-height:1.6;color:#0e1f17;white-space:pre-wrap;">${escapeHtml(args.message)}</div>
        </div>` : ""}
      </div>
      <p style="margin:0 0 20px;">
        ${button(args.dashboardUrl, "Dashboard megnyitása →")}
      </p>
      <p style="margin:0;font-size:11.5px;color:#94a097;line-height:1.5;">
        Ez az értesítő automatikusan küldődött a kinti.app Job Board rendszeréből. A pályázó adatainak kezelésekor tartsd be az adatvédelmi szabályokat.
      </p>`,
  });

  const { error } = await getResend().emails.send({ from, to: args.to, subject, html, text });
  if (error) {
    throw new Error(`Resend: ${error.name ?? "hiba"} — ${error.message ?? "ismeretlen"}`);
  }
}

// --- Csoportos árajánlat-kérés (Lead Generation) ---------------------------

export interface LeadRequestBusiness {
  name: string;
  contactEmail: string;
}

export interface LeadRequestEmailArgs {
  /** A kérező neve. */
  senderName: string;
  /** A kérező email-je. */
  senderEmail: string;
  /** A kérező telefonja (opcionális). */
  senderPhone: string | null;
  /** A keresett szolgáltatás/kategória neve (pl. "Könyvelő"). */
  categoryLabel: string;
  /** A kérező üzenet/leírás. */
  message: string;
  /** Az adott vállalkozás, amelynek az emailt küldjük. */
  business: LeadRequestBusiness;
  /** true = ez a havi 5. (utolsó ingyenes) lead → figyelmeztető sáv az emailben. */
  lastFree?: boolean;
}

/**
 * Egyetlen vállalkozónak küldi ki az árajánlat-kérést.
 * A kérező adatait közvetlenül tartalmazza — a Kinti szerver csak relay-el,
 * majd a vállalkozó válaszol vissza a kérező email-jére.
 */
export async function sendLeadRequestEmail(args: LeadRequestEmailArgs): Promise<void> {
  const env = getCloudflareEnv();
  const from = env.EMAIL_FROM || "Kinti <info@kinti.app>";
  const subject = `Új árajánlat-kérés: ${args.categoryLabel} — kinti.app`;

  // Figyelmeztető sáv az utolsó ingyenes leadnél (konverzió: lépj PRO-ra a 6. ELŐTT).
  const lastFreeBanner = args.lastFree
    ? `<div style="margin:0 0 16px;padding:12px 14px;background:#fff7e6;border:1px solid #f0d8a0;border-radius:12px;font-size:13px;color:#0e1f17;line-height:1.5;">
         ⭐ <strong>Ez a havi 5. (utolsó ingyenes) ajánlatkérésed.</strong> A következőt már Szaknévsor PRO-val kapod meg — <a href="https://kinti.app/profil" style="color:#1d4434;font-weight:700;">aktiváld itt</a>, hogy egy kérőt se hagyj ki.
       </div>`
    : "";
  const lastFreeText = args.lastFree
    ? `\n⭐ Ez a havi 5. (utolsó ingyenes) ajánlatkérésed. A következőt Szaknévsor PRO-val kapod: https://kinti.app/profil\n`
    : "";

  const text = `Szia, ${args.business.name}!

Valaki árajánlatot kért tőled a kinti.app-on:

Szolgáltatás: ${args.categoryLabel}
Kérező neve: ${args.senderName}
E-mail: ${args.senderEmail}
Telefon: ${args.senderPhone ?? "(nem adta meg)"}

Leírás / üzenet:
${args.message}

Válaszolj közvetlenül erre az emailre, vagy vedd fel a kapcsolatot ${args.senderEmail} e-mail-en.
${lastFreeText}
— kinti.app`;

  const html = baseLayout({
    preheader: `Új árajánlat-kérés érkezett: ${args.categoryLabel}`,
    body: `
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#94a097;">Kinti · Árajánlat-kérés</p>
      <p style="margin:0 0 16px;font-size:15px;font-weight:800;color:#0e1f17;">Új árajánlat-kérés érkezett!</p>
      ${lastFreeBanner}
      <div style="margin:0 0 20px;padding:16px;background:#fbf7ee;border:1px solid #e6ebe5;border-radius:14px;">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#94a097;margin-bottom:4px;">Keresett szolgáltatás</div>
        <div style="font-size:15px;font-weight:800;color:#0e1f17;margin-bottom:12px;">${escapeHtml(args.categoryLabel)}</div>
        <table style="border-collapse:collapse;width:100%;font-size:13px;color:#5c6d63;">
          <tr><td style="padding:3px 0;font-weight:600;width:80px;">Név:</td><td>${escapeHtml(args.senderName)}</td></tr>
          <tr><td style="padding:3px 0;font-weight:600;">E-mail:</td><td><a href="mailto:${escapeAttr(args.senderEmail)}" style="color:#1d4434;">${escapeHtml(args.senderEmail)}</a></td></tr>
          <tr><td style="padding:3px 0;font-weight:600;">Telefon:</td><td>${escapeHtml(args.senderPhone ?? "–")}</td></tr>
        </table>
        <div style="margin-top:14px;padding:12px;background:#f0ebe0;border-radius:10px;">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#94a097;margin-bottom:6px;">Leírás / üzenet</div>
          <div style="font-size:13.5px;line-height:1.6;color:#0e1f17;white-space:pre-wrap;">${escapeHtml(args.message)}</div>
        </div>
      </div>
      <p style="margin:0 0 20px;">
        <a href="mailto:${escapeAttr(args.senderEmail)}" style="display:inline-block;padding:13px 22px;background:#1d4434;color:#ffffff;text-decoration:none;border-radius:999px;font-size:14px;font-weight:800;">Válasz küldése →</a>
      </p>
      <p style="margin:0;font-size:11.5px;color:#94a097;line-height:1.5;">
        Ezt az árajánlat-kérést a kinti.app svájci-magyar közösségi platform közvetítette. A válaszodban közvetlenül a kérező e-mail-jét szólítsd meg.
      </p>`,
  });

  const { error } = await getResend().emails.send({
    from,
    to: args.business.contactEmail,
    replyTo: args.senderEmail,
    subject,
    html,
    text,
  });
  if (error) {
    throw new Error(`Resend: ${error.name ?? "hiba"} — ${error.message ?? "ismeretlen"}`);
  }
}



export interface StoryPublishedEmailArgs {
  to: string;
  title: string;
  url: string;
}

/** Értesítő a történet szerzőjének: megjelent — oszd meg (organikus terjedés). */
export async function sendStoryPublishedEmail(args: StoryPublishedEmailArgs): Promise<void> {
  const env = getCloudflareEnv();
  const from = env.EMAIL_FROM || "Kinti <info@kinti.app>";
  const subject = "Megjelent a történeted a Kintin! 🎉";

  const text = `Szia!

A történeted átment a szerkesztői ellenőrzésen, és megjelent a Kintin:

${args.title}
${args.url}

Oszd meg a linket a barátaiddal, a Facebook-csoportodban — hadd olvassák minél többen!

— kinti.app`;

  const html = baseLayout({
    preheader: `Megjelent: ${args.title}`,
    body: `
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#94a097;">Kinti · Élettörténetek</p>
      <p style="margin:0 0 16px;font-size:15px;font-weight:800;color:#0e1f17;">🎉 Megjelent a történeted!</p>
      <div style="margin:0 0 20px;padding:16px;background:#fbf7ee;border:1px solid #e6ebe5;border-radius:14px;">
        <div style="font-size:15px;font-weight:800;color:#0e1f17;">${escapeHtml(args.title)}</div>
      </div>
      <p style="margin:0 0 20px;">
        <a href="${escapeAttr(args.url)}" style="display:inline-block;padding:13px 22px;background:#1d4434;color:#ffffff;text-decoration:none;border-radius:999px;font-size:14px;font-weight:800;">Megnézem →</a>
      </p>
      <p style="margin:0;font-size:11.5px;color:#94a097;line-height:1.5;">
        Oszd meg a linket a barátaiddal vagy a Facebook-csoportodban — hadd olvassák minél többen! Köszönjük, hogy írtál.
      </p>`,
  });

  const { error } = await getResend().emails.send({ from, to: args.to, subject, html, text });
  if (error) {
    throw new Error(`Resend: ${error.name ?? "hiba"} — ${error.message ?? "ismeretlen"}`);
  }
}

export interface KeresekLeadEmailArgs {
  business: LeadRequestBusiness;
  title: string;
  description: string | null;
  city: string | null;
  whenText: string | null;
  /** A hirdető nyilvános, szabad-szöveges elérhetősége (telefon/WhatsApp/email). */
  contact: string;
}

/**
 * „Keresek"-lead a Szaknévsor PRO cégnek — a jóváhagyott igény-hirdetés TELJES
 * tartalma a hirdető elérhetőségével (a kontakt a Keresek-táblán nyilvános,
 * a hirdető kifejezetten azért adta meg, hogy a szakik elérjék).
 */
export async function sendKeresekLeadEmail(args: KeresekLeadEmailArgs): Promise<void> {
  const env = getCloudflareEnv();
  const from = env.EMAIL_FROM || "Kinti <info@kinti.app>";
  const shortTitle = args.title.length > 60 ? args.title.slice(0, 57) + "…" : args.title;
  const subject = `Új munka: ${shortTitle}${args.city ? ` — ${args.city}` : ""} — kinti.app`;
  const metaLine = [args.city ? `📍 ${args.city}` : null, args.whenText ? `🗓️ ${args.whenText}` : null]
    .filter(Boolean)
    .join(" · ");

  const text = `Szia, ${args.business.name}!

Egy ügyfél éppen a te szakmádban keres segítséget a kinti.app Keresek-tábláján:

${args.title}
${args.description ? "\n" + args.description + "\n" : ""}${metaLine ? metaLine + "\n" : ""}
Elérhetőség: ${args.contact}

Vedd fel vele a kapcsolatot közvetlenül — aki elsőként jelentkezik, jó eséllyel viszi a munkát.

— kinti.app`;

  const html = baseLayout({
    preheader: `Új munka a Keresek-tábláról: ${shortTitle}`,
    body: `
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#94a097;">Kinti · Keresek-tábla</p>
      <p style="margin:0 0 16px;font-size:15px;font-weight:800;color:#0e1f17;">Egy ügyfél éppen téged keres!</p>
      <div style="margin:0 0 20px;padding:16px;background:#fbf7ee;border:1px solid #e6ebe5;border-radius:14px;">
        <div style="font-size:15px;font-weight:800;color:#0e1f17;margin-bottom:6px;">${escapeHtml(args.title)}</div>
        ${args.description ? `<div style="font-size:13.5px;line-height:1.6;color:#5c6d63;white-space:pre-wrap;margin-bottom:10px;">${escapeHtml(args.description)}</div>` : ""}
        ${metaLine ? `<div style="font-size:12.5px;font-weight:700;color:#5c6d63;margin-bottom:10px;">${escapeHtml(metaLine)}</div>` : ""}
        <div style="padding:12px;background:#f0ebe0;border-radius:10px;">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#94a097;margin-bottom:4px;">A hirdető elérhetősége</div>
          <div style="font-size:14px;font-weight:800;color:#0e1f17;">${escapeHtml(args.contact)}</div>
        </div>
      </div>
      <p style="margin:0 0 20px;">
        <a href="https://kinti.app/keresek" style="display:inline-block;padding:13px 22px;background:#1d4434;color:#ffffff;text-decoration:none;border-radius:999px;font-size:14px;font-weight:800;">Keresek-tábla megnyitása →</a>
      </p>
      <p style="margin:0;font-size:11.5px;color:#94a097;line-height:1.5;">
        A kérés a kinti.app nyilvános Keresek-táblájáról érkezett — a hirdető azért adta meg az elérhetőségét, hogy a szakik közvetlenül elérjék. Aki elsőként jelentkezik, jó eséllyel viszi a munkát.
      </p>`,
  });

  const { error } = await getResend().emails.send({ from, to: args.business.contactEmail, subject, html, text });
  if (error) {
    throw new Error(`Resend: ${error.name ?? "hiba"} — ${error.message ?? "ismeretlen"}`);
  }
}

export interface KeresekLockedEmailArgs {
  business: LeadRequestBusiness;
  title: string;
  city: string | null;
  whenText: string | null;
}

/**
 * „Keresek"-teaser a nem-PRO cégnek — a munka LÁTSZIK (cím/város/mikor), a
 * hirdető elérhetősége NEM (FOMO → Szaknévsor PRO). A copy őszinte: a PRO
 * ígérete az azonnali, elérhetőséggel együtt érkező értesítés + inbox-feloldás,
 * NEM kizárólagosság (a tábla nyilvános).
 */
export async function sendKeresekLockedEmail(args: KeresekLockedEmailArgs): Promise<void> {
  const env = getCloudflareEnv();
  const from = env.EMAIL_FROM || "Kinti <info@kinti.app>";
  const shortTitle = args.title.length > 60 ? args.title.slice(0, 57) + "…" : args.title;
  const subject = `Új munka a szakmádban${args.city ? ` — ${args.city}` : ""}: várja az ajánlatod`;
  const metaLine = [args.city ? `📍 ${args.city}` : null, args.whenText ? `🗓️ ${args.whenText}` : null]
    .filter(Boolean)
    .join(" · ");

  const text = `Szia, ${args.business.name}!

Egy ügyfél éppen a te szakmádban keres segítséget a kinti.app-on:

${args.title}
${metaLine ? metaLine + "\n" : ""}
A hirdető elérhetőségét Szaknévsor PRO-val kapod meg: a postaládádban azonnal feloldódik, a jövőbeni kéréseket pedig e-mailben, elérhetőséggel együtt kapod — elsőként.

Oldd fel: https://kinti.app/profil

— kinti.app`;

  const html = baseLayout({
    preheader: `Új munka: ${shortTitle} — oldd fel PRO-val`,
    body: `
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#94a097;">Kinti · Szaknévsor PRO</p>
      <p style="margin:0 0 16px;font-size:15px;font-weight:800;color:#0e1f17;">💼 Egy ügyfél éppen téged keres!</p>
      <div style="margin:0 0 16px;padding:16px;background:#fbf7ee;border:1px solid #e6ebe5;border-radius:14px;">
        <div style="font-size:15px;font-weight:800;color:#0e1f17;margin-bottom:6px;">${escapeHtml(args.title)}</div>
        ${metaLine ? `<div style="font-size:12.5px;font-weight:700;color:#5c6d63;">${escapeHtml(metaLine)}</div>` : ""}
      </div>
      <div style="margin:0 0 20px;padding:14px;background:#fff7e6;border:1px solid #f0d8a0;border-radius:14px;">
        <div style="font-size:13.5px;line-height:1.6;color:#0e1f17;">
          🔒 A hirdető <strong>elérhetőségét Szaknévsor PRO-val</strong> kapod meg: a postaládádban azonnal feloldódik, a jövőbeni kéréseket pedig e-mailben, elérhetőséggel együtt kapod — elsőként. Plusz sárga kiemelés és hely a lista elején.
        </div>
      </div>
      <p style="margin:0 0 20px;">
        <a href="https://kinti.app/profil" style="display:inline-block;padding:13px 22px;background:#f59e0b;color:#ffffff;text-decoration:none;border-radius:999px;font-size:14px;font-weight:800;">Oldd fel PRO-val →</a>
      </p>
      <p style="margin:0;font-size:11.5px;color:#94a097;line-height:1.5;">
        Aki elsőként jelentkezik, jó eséllyel viszi a munkát — a PRO-val egyetlen fizető megrendelés bőven megtérül. A beérkezett kéréseket a /profil oldalon kezeled.
      </p>`,
  });

  const { error } = await getResend().emails.send({ from, to: args.business.contactEmail, subject, html, text });
  if (error) {
    throw new Error(`Resend: ${error.name ?? "hiba"} — ${error.message ?? "ismeretlen"}`);
  }
}

export interface LeadLockedEmailArgs {
  categoryLabel: string;
  business: LeadRequestBusiness;
  /** Hány zárolt kérés (digestnél több is lehet); alapból 1. */
  count?: number;
}

/**
 * „Zárolt lead" értesítő — a vállalkozó elérte a havi 5 ingyenes ajánlatkérést, ezért
 * a kérő ADATAIT NEM tartalmazza (valódi kapu). CTA: lépj PRO-ra a /profil oldalon.
 */
export async function sendLeadLockedEmail(args: LeadLockedEmailArgs): Promise<void> {
  const env = getCloudflareEnv();
  const from = env.EMAIL_FROM || "Kinti <info@kinti.app>";
  const n = args.count ?? 1;
  const subject = n > 1
    ? `${n} új árajánlat-kérés vár — Szaknévsor PRO`
    : `Új árajánlat-kérés vár: ${args.categoryLabel} — Szaknévsor PRO`;

  const text = `Szia, ${args.business.name}!

${n > 1 ? `${n} új árajánlat-kérés érkezett` : `Új árajánlat-kérés érkezett (${args.categoryLabel})`} a kinti.app-on.

Ebben a hónapban elérted az 5 ingyenes ajánlatkérést, ezért ${n > 1 ? "ezek" : "ennek"} a kérő adatait (név, üzenet, elérhetőség) Szaknévsor PRO-val tudod feloldani.

Oldd fel: https://kinti.app/profil

— kinti.app`;

  const html = baseLayout({
    preheader: `${n > 1 ? `${n} új árajánlat-kérés vár` : "Új árajánlat-kérés vár"} — oldd fel PRO-val`,
    body: `
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#94a097;">Kinti · Szaknévsor PRO</p>
      <p style="margin:0 0 16px;font-size:15px;font-weight:800;color:#0e1f17;">🔒 ${n > 1 ? `${n} új árajánlat-kérés vár rád!` : "Új árajánlat-kérésed érkezett!"}</p>
      <div style="margin:0 0 20px;padding:16px;background:#fff7e6;border:1px solid #f0d8a0;border-radius:14px;">
        <div style="font-size:13.5px;line-height:1.6;color:#0e1f17;">
          Ebben a hónapban elérted az <strong>5 ingyenes ajánlatkérést</strong>. ${n > 1 ? "Ezek" : "Ez"} a kérő neve, üzenete és elérhetősége <strong>Szaknévsor PRO</strong>-val oldható fel — plusz sárga kiemelés és megjelenés a lista elején, a kiemelt cégek között.
        </div>
      </div>
      <p style="margin:0 0 20px;">
        <a href="https://kinti.app/profil" style="display:inline-block;padding:13px 22px;background:#f59e0b;color:#ffffff;text-decoration:none;border-radius:999px;font-size:14px;font-weight:800;">Oldd fel PRO-val →</a>
      </p>
      <p style="margin:0;font-size:11.5px;color:#94a097;line-height:1.5;">
        A te ügyfeleid keresnek — a PRO-val egy fizető megrendelés bőven megtérül. A beérkezett kéréseket a /profil oldalon kezeled.
      </p>`,
  });

  const { error } = await getResend().emails.send({ from, to: args.business.contactEmail, subject, html, text });
  if (error) {
    throw new Error(`Resend: ${error.name ?? "hiba"} — ${error.message ?? "ismeretlen"}`);
  }
}

export interface LeadConfirmEmailArgs {
  to: string;
  senderName: string;
  categoryLabel: string;
  businessCount: number;
}

/**
 * Visszaigazoló email a kérező felhasználónak, hogy x vállalkozónak ment ki az árajánlat-kérése.
 */
export async function sendLeadConfirmEmail(args: LeadConfirmEmailArgs): Promise<void> {
  const env = getCloudflareEnv();
  const from = env.EMAIL_FROM || "Kinti <info@kinti.app>";
  const subject = `Árajánlat-kérésed elküldve ${args.businessCount} vállalkozónak — kinti.app`;

  const text = `Szia ${args.senderName}!

Árajánlat-kérésed sikeresen elküldtük ${args.businessCount} ${args.categoryLabel} kategóriájú vállalkozónak.

Hamarosan keresni fognak téged! Ha 48 óra elteltével sem keresnek meg, próbálj közvetlen üzenetet küldeni a kinti.app Szaknévsorában.

— kinti.app`;

  const html = baseLayout({
    preheader: `Árajánlat-kérésed ${args.businessCount} vállalkozónak elküldve`,
    body: `
      <p style="margin:0 0 12px;font-size:15px;line-height:1.55;color:#0e1f17;">Szia ${escapeHtml(args.senderName)} 👋</p>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#0e1f17;">
        Árajánlat-kérésed sikeresen elküldtük:
      </p>
      <div style="margin:0 0 20px;padding:16px;background:#fbf7ee;border:1px solid #e6ebe5;border-radius:14px;text-align:center;">
        <div style="font-size:36px;font-weight:800;color:#1d4434;">${args.businessCount}</div>
        <div style="font-size:13px;color:#5c6d63;margin-top:4px;font-weight:600;">${escapeHtml(args.categoryLabel)} kategóriájú vállalkozó kapta meg a kérésed</div>
      </div>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#5c6d63;">
        Hamarosan keresni fognak téged! Ha <strong>48 óra</strong> elteltével sem kapnál választ, próbálj közvetlen üzenetet küldeni a kinti.app Szaknévsorában.
      </p>
      <p style="margin:0 0 20px;">
        ${button("https://kinti.app/szaknevsor", "Szaknévsor megtekintése →")}
      </p>
      <p style="margin:0;font-size:11.5px;color:#94a097;line-height:1.5;">
        A kinti.app csak közvetíti a kérést — az árajánlat részleteiért és pontosságáért a megkeresett vállalkozók a felelősek.
      </p>`,
  });

  const { error } = await getResend().emails.send({ from, to: args.to, subject, html, text });
  if (error) {
    throw new Error(`Resend: ${error.name ?? "hiba"} — ${error.message ?? "ismeretlen"}`);
  }
}

// --- Napi lead digest email (vállalkozónak, összefoglaló) -------------------

export interface LeadDigestItem {
  senderName: string;
  senderEmail: string;
  senderPhone: string | null;
  categoryLabel: string | null;
  message: string;
  createdAt: string;
}

export interface LeadDigestEmailArgs {
  to: string;
  businessName: string;
  leads: LeadDigestItem[];
}

/**
 * Napi összefoglaló email a vállalkozónak a tegnap beérkezett, de
 * azonnali emailként még ki nem küldött árajánlat-kérésekről.
 * Max 1 ilyen email megy vállalkozónként naponta (a cron küldi).
 */
export async function sendLeadDigestEmail(args: LeadDigestEmailArgs): Promise<void> {
  const env = getCloudflareEnv();
  const from = env.EMAIL_FROM || "Kinti <info@kinti.app>";
  const n = args.leads.length;
  const subject = `${n} árajánlat-kérés érkezett tegnap — kinti.app`;

  const itemsText = args.leads
    .map((l, i) => {
      const cat = l.categoryLabel ? `${l.categoryLabel} · ` : "";
      return `${i + 1}. ${cat}${l.senderName}\n   📧 ${l.senderEmail}${l.senderPhone ? `  📞 ${l.senderPhone}` : ""}\n   ${l.message.slice(0, 120)}${l.message.length > 120 ? "…" : ""}`;
    })
    .join("\n\n");

  const text = `Szia, ${args.businessName}!\n\nTegnap ${n} árajánlat-kérés érkezett hozzád a kinti.app-on:\n\n${itemsText}\n\nVálaszolj közvetlenül az egyes kérők e-mail-jére.\n\nSzaknévsor: https://kinti.app/szaknevsor\n\n— kinti.app`;

  const itemsHtml = args.leads
    .map((l, i) => {
      const cat = l.categoryLabel ? escapeHtml(l.categoryLabel) : "Árajánlat-kérés";
      return `
      <div style="margin:0 0 14px;padding:14px;background:#fbf7ee;border:1px solid #e6ebe5;border-radius:14px;">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#94a097;margin-bottom:4px;">${i + 1}. kérés · ${cat}</div>
        <table style="border-collapse:collapse;width:100%;font-size:13px;color:#5c6d63;margin-bottom:10px;">
          <tr><td style="padding:2px 0;font-weight:600;width:70px;">Kérező:</td><td>${escapeHtml(l.senderName)}</td></tr>
          <tr><td style="padding:2px 0;font-weight:600;">E-mail:</td><td><a href="mailto:${escapeAttr(l.senderEmail)}" style="color:#1d4434;">${escapeHtml(l.senderEmail)}</a></td></tr>
          ${l.senderPhone ? `<tr><td style="padding:2px 0;font-weight:600;">Telefon:</td><td>${escapeHtml(l.senderPhone)}</td></tr>` : ""}
        </table>
        <div style="padding:10px;background:#f0ebe0;border-radius:10px;font-size:13px;line-height:1.6;color:#0e1f17;white-space:pre-wrap;">${escapeHtml(l.message.slice(0, 300))}${l.message.length > 300 ? "…" : ""}</div>
        <p style="margin:10px 0 0;"><a href="mailto:${escapeAttr(l.senderEmail)}" style="display:inline-block;padding:9px 16px;background:#1d4434;color:#fff;text-decoration:none;border-radius:999px;font-size:13px;font-weight:700;">Válasz küldése →</a></p>
      </div>`;
    })
    .join("");

  const html = baseLayout({
    preheader: `${n} új árajánlat-kérés érkezett tegnap — kinti.app`,
    body: `
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#94a097;">Kinti · Napi összefoglaló</p>
      <p style="margin:0 0 16px;font-size:15px;font-weight:800;color:#0e1f17;">Tegnap ${n} árajánlat-kérés érkezett!</p>
      <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#5c6d63;">Szia, <strong style="color:#0e1f17;">${escapeHtml(args.businessName)}</strong>! Az alábbi ügyfelek kértek tőled árajánlatot tegnap. Válaszolj közvetlenül az e-mail-jükre.</p>
      ${itemsHtml}
      <p style="margin:16px 0 0;"><a href="https://kinti.app/szaknevsor" style="display:inline-block;padding:12px 20px;background:#f0ebe0;color:#1d4434;text-decoration:none;border-radius:999px;font-size:13px;font-weight:700;">Szaknévsor megtekintése →</a></p>
      <p style="margin:14px 0 0;font-size:11.5px;color:#94a097;line-height:1.5;">Ha nem szeretnél ilyen értesítőket kapni, a vállalkozásod kezelő oldalán kikapcsolhatod az árajánlat-kéréseket.</p>`,
  });

  const { error } = await getResend().emails.send({ from, to: args.to, subject, html, text });
  if (error) {
    throw new Error(`Resend: ${error.name ?? "hiba"} — ${error.message ?? "ismeretlen"}`);
  }
}

// --- Hírlevél feliratkozás megerősítése ---------------------------------------

interface NewsletterConfirmEmailArgs {
  to: string;
  country: string;
  confirmUrl: string;
}

export async function sendNewsletterConfirmationEmail(args: NewsletterConfirmEmailArgs): Promise<void> {
  const env = getCloudflareEnv();
  const from = env.EMAIL_FROM || "Kinti <info@kinti.app>";
  const subject = "Erősítsd meg a feliratkozásod – kinti.app Hírlevél";

  const text = `Szia!

Egy feliratkozás érkezett a kinti.app hírlevélre erről az email címről.
Ország: ${args.country}

Kérjük, erősítsd meg a feliratkozásodat egy kattintással:
  ${args.confirmUrl}

Ha nem te kérted a feliratkozást, ezt az emailt nyugodtan figyelmen kívül hagyhatod, semmilyen listára nem kerülsz fel.

Üdv,
kinti.app`;

  const html = baseLayout({
    preheader: `Erősítsd meg a kinti.app hírlevél feliratkozásodat egy kattintással.`,
    body: `
      <p style="margin:0 0 12px;font-size:15px;line-height:1.55;color:#0e1f17;">
        Szia 👋
      </p>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#0e1f17;">
        Kértél egy feliratkozást a <strong>kinti.app hírlevelére</strong>.
      </p>
      <div style="margin:0 0 20px;padding:14px;background:#fbf7ee;border:1px solid #e6ebe5;border-radius:14px;">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#94a097;margin-bottom:4px;">Ország</div>
        <div style="font-size:15px;font-weight:800;color:#0e1f17;">${escapeHtml(args.country)}</div>
      </div>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#5c6d63;">
        Kérjük, egy kattintással erősítsd meg a címedet:
      </p>
      <p style="margin:0 0 20px;">
        ${button(args.confirmUrl, "Feliratkozás megerősítése →")}
      </p>
      <p style="margin:0;font-size:11.5px;color:#94a097;line-height:1.5;">
        Ha nem te kérted a feliratkozást, ezt az emailt nyugodtan figyelmen kívül hagyhatod, semmilyen listára nem kerülsz fel.
      </p>`,
  });

  const { error } = await getResend().emails.send({ from, to: args.to, subject, html, text });
  if (error) {
    throw new Error(`Resend: ${error.name ?? "hiba"} — ${error.message ?? "ismeretlen"}`);
  }
}

// --- Admin: heti operátori pulzus-jelentés (weekly-report) -------------------

/**
 * A hétfői pulzus-email az adminnak — a heti kulcsszámok + top oldalak/akciók.
 * A tartalmat a lib/weekly-report.ts állítja össze (tiszta, tesztelt); itt csak
 * a kézbesítés és a HTML-keret él.
 */
export async function sendWeeklyOpsReportEmail(args: { to: string; report: WeeklyReport }): Promise<void> {
  const env = getCloudflareEnv();
  const from = env.EMAIL_FROM || "Kinti <info@kinti.app>";
  const { report } = args;

  const rowsText = report.rows.map((r) => `• ${r.label}: ${r.value}`).join("\n");
  const pagesText = report.topPages.map((p) => `  ${p.count}× ${p.name}`).join("\n");
  const actionsText = report.topActions.map((a) => `  ${a.count}× ${a.name}`).join("\n");
  const text = `Kinti heti pulzus\n\n${rowsText}\n\nTop oldalak (7 nap):\n${pagesText}\n\nTop akciók (7 nap):\n${actionsText}\n\nRészletek: https://kinti.app/admin`;

  const rowsHtml = report.rows
    .map(
      (r) =>
        `<tr><td style="padding:5px 0;font-weight:600;color:#5c6d63;">${escapeHtml(r.label)}</td><td style="padding:5px 0;text-align:right;font-weight:800;color:#0e1f17;">${escapeHtml(r.value)}</td></tr>`,
    )
    .join("");
  const listHtml = (items: { name: string; count: number }[]) =>
    items.map((i) => `<div style="font-size:13px;color:#5c6d63;padding:2px 0;">${i.count}× ${escapeHtml(i.name)}</div>`).join("");

  const html = baseLayout({
    preheader: "A Kinti heti kulcsszámai egy percben.",
    body: `
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#94a097;">Kinti Admin — heti pulzus</p>
      <table style="border-collapse:collapse;width:100%;font-size:14px;margin:0 0 18px;">${rowsHtml}</table>
      <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#94a097;">TOP OLDALAK (7 NAP)</p>
      ${listHtml(report.topPages)}
      <p style="margin:14px 0 4px;font-size:12px;font-weight:700;color:#94a097;">TOP AKCIÓK (7 NAP)</p>
      ${listHtml(report.topActions)}
      <p style="margin:18px 0 0;font-size:13px;"><a href="https://kinti.app/admin" style="color:#1d4434;font-weight:700;">Teljes admin-panel →</a></p>
    `,
  });

  const { error } = await getResend().emails.send({ from, to: args.to, subject: report.subject, html, text });
  if (error) {
    throw new Error(`Resend: ${error.name ?? "hiba"} — ${error.message ?? "ismeretlen"}`);
  }
}
