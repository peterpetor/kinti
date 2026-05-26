import { Resend } from "resend";
import { getCloudflareEnv } from "./cloudflare";

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

/** A Resend kliens kérés-hatókörű — minden szerver-route új példányt vesz. */
function getResend(): Resend {
  const env = getCloudflareEnv();
  if (!env.RESEND_API_KEY) {
    throw new Error("Hiányzó RESEND_API_KEY env-változó.");
  }
  return new Resend(env.RESEND_API_KEY);
}

// --- email-templátehelper-ek ------------------------------------------------

interface ConfirmEmailArgs {
  to: string;
  /** Megjelenő név vagy "Kedves kinti" ha üres. */
  posterName?: string | null;
  title: string;
  /** Teljes URL — pl. https://kinti.app/api/bulletin/confirm/<token>. */
  confirmUrl: string;
  /** Teljes URL — pl. https://kinti.app/hirdetes-kezeles/<token>. */
  manageUrl: string;
  /** Lejárati idő (ISO) — a megerősítő linké, NEM a posztté. */
  confirmExpiresAt: string;
}

export async function sendConfirmationEmail(args: ConfirmEmailArgs): Promise<void> {
  const env = getCloudflareEnv();
  const from = env.EMAIL_FROM || "Kinti <info@kinti.app>";

  const greet = args.posterName?.trim() ? args.posterName.trim() : "kinti";
  const expiresHu = formatHu(args.confirmExpiresAt);
  const subject = "Erősítsd meg a hirdetésed a kinti.app-on";

  const text = `Szia ${greet}!

Megkaptuk a hirdetésedet a kinti közösségi hirdetőfalon:
  "${args.title}"

A publikáláshoz erősítsd meg a kattintással:
  ${args.confirmUrl}

A megerősítő link ${expiresHu}-ig érvényes. Ha lemarad róla, csak küldd el újra a hirdetést.

A hirdetésed kezelése (szerkesztés / törlés) később:
  ${args.manageUrl}

Ha nem te küldted el ezt a hirdetést, hagyd figyelmen kívül.

Üdv,
kinti.app`;

  const html = baseLayout({
    preheader: `Egy kattintással publikáld a hirdetésedet: ${args.title}`,
    body: `
      <p style="margin:0 0 12px;font-size:15px;line-height:1.55;color:#0e1f17;">
        Szia ${escapeHtml(greet)} 👋
      </p>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#0e1f17;">
        Megkaptuk a hirdetésedet a kinti közösségi hirdetőfalra:
      </p>
      <p style="margin:0 0 20px;padding:12px 14px;background:#fbf7ee;border:1px solid #e6ebe5;border-radius:14px;font-size:14.5px;font-weight:700;color:#0e1f17;">
        ${escapeHtml(args.title)}
      </p>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#5c6d63;">
        A publikáláshoz erősítsd meg egy kattintással:
      </p>
      <p style="margin:0 0 20px;">
        ${button(args.confirmUrl, "Hirdetésem megerősítése →")}
      </p>
      <p style="margin:0 0 16px;font-size:12.5px;line-height:1.6;color:#5c6d63;">
        A megerősítő link <strong>${escapeHtml(expiresHu)}-ig</strong> érvényes.
        Ha lemaradnál róla, csak küldd el a hirdetést újra — bármikor.
      </p>
      <hr style="border:none;border-top:1px solid #e6ebe5;margin:20px 0;" />
      <p style="margin:0 0 6px;font-size:12px;color:#5c6d63;">
        Később szeretnéd szerkeszteni / törölni a hirdetésed?
        <br />
        <a href="${escapeAttr(args.manageUrl)}" style="color:#1d4434;text-decoration:underline;">
          Hirdetés kezelése
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
    // A Resend `error` egy `{ name, message, statusCode }` objektum.
    throw new Error(`Resend: ${error.name ?? "hiba"} — ${error.message ?? "ismeretlen"}`);
  }
}

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

interface BulletinContactEmailArgs {
  to: string;
  posterName: string;
  adTitle: string;
  senderName: string;
  senderEmail: string;
  message: string;
}

export async function sendBulletinContactEmail(args: BulletinContactEmailArgs): Promise<void> {
  const env = getCloudflareEnv();
  const from = env.EMAIL_FROM || "Kinti <info@kinti.app>";
  const subject = `Új érdeklődő a hirdetésedre: ${args.adTitle}`;

  const text = `Szia ${args.posterName}!

Új üzeneted érkezett a kinti.app-on feladott hirdetésedre ("${args.adTitle}")!

Érdeklődő neve: ${args.senderName}
Email címe: ${args.senderEmail}

Üzenet:
${args.message}

Közvetlenül válaszolhatsz erre az emailre a fenti email címre írva.

Üdv,
kinti.app`;

  const html = baseLayout({
    preheader: `Új érdeklődő a hirdetésedre: ${args.adTitle}`,
    body: `
      <p style="margin:0 0 12px;font-size:15px;line-height:1.55;color:#0e1f17;">
        Szia ${escapeHtml(args.posterName)} 👋
      </p>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#0e1f17;">
        Új érdeklődő írt a kinti.app hirdetőfalon feladott hirdetésedre:
      </p>
      <p style="margin:0 0 20px;padding:12px 14px;background:#fbf7ee;border:1px solid #e6ebe5;border-radius:14px;font-size:14.5px;font-weight:700;color:#0e1f17;">
        ${escapeHtml(args.adTitle)}
      </p>
      <div style="margin:0 0 20px;padding:14px;background:#f8f9f8;border-radius:14px;border:1px solid #e6ebe5;">
        <p style="margin:0 0 8px;font-size:13px;color:#5c6d63;">
          <strong>Feladó:</strong> ${escapeHtml(args.senderName)} (<a href="mailto:${escapeAttr(args.senderEmail)}" style="color:#1d4434;">${escapeHtml(args.senderEmail)}</a>)
        </p>
        <p style="margin:8px 0 0;font-size:14px;line-height:1.6;color:#0e1f17;white-space:pre-wrap;">
          ${escapeHtml(args.message)}
        </p>
      </div>
      <p style="margin:0 0 16px;font-size:13px;line-height:1.6;color:#5c6d63;">
        Válaszadáshoz írj közvetlenül az érdeklődőnek a <strong><a href="mailto:${escapeAttr(args.senderEmail)}" style="color:#1d4434;">${escapeHtml(args.senderEmail)}</a></strong> címre.
      </p>`,
  });

  const { error } = await getResend().emails.send({
    from,
    to: args.to,
    replyTo: args.senderEmail,
    subject,
    html,
    text,
  });

  if (error) {
    throw new Error(`Resend: ${error.name ?? "hiba"} — ${error.message ?? "ismeretlen"}`);
  }
}


// --- Esemény beküldő: megerősítő email -------------------------------------

interface EventConfirmEmailArgs {
  to: string;
  title: string;
  eventDate: string;
  venue: string;
  confirmUrl: string;
}

export async function sendEventConfirmationEmail(args: EventConfirmEmailArgs): Promise<void> {
  const env = getCloudflareEnv();
  const from = env.EMAIL_FROM || "Kinti <info@kinti.app>";
  const subject = "Erősítsd meg az eseményedet – kinti.app";

  const text = `Szia!\n\nMegkaptuk az eseménybeküldésedet a kinti.app-on:\n  Cím: ${args.title}\n  Dátum: ${args.eventDate}\n  Helyszín: ${args.venue}\n\nAz eseményt moderátor ellenőrzi, és hamarosan megjelenik az oldalon.\n\nAmíg erre várnál, erősítsd meg az email-cimedet egy kattintással:\n  ${args.confirmUrl}\n\nHa nem te küldted be ezt az eseményt, hagyd figyelmen kívül.\n\nÜdv,\nkinti.app`;

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

// --- Self-service vállalkozás-beküldés: megerősítő email --------------------

interface BusinessConfirmEmailArgs {
  to: string;
  businessName: string;
  /** Teljes URL — pl. https://kinti.app/api/business/confirm/<token>. */
  confirmUrl: string;
  confirmExpiresAt: string;
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

Amint rákattintasz, a vállalkozásod AZONNAL megjelenik a Szaknévsorban — nincs várakozás.

A megerősítő link ${expiresHu}-ig érvényes. Ha lemaradsz róla, csak küldd be újra.

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

function formatHu(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const HU_MONTH = ["jan.", "feb.", "márc.", "ápr.", "máj.", "jún.", "júl.", "aug.", "szept.", "okt.", "nov.", "dec."];
  return `${d.getFullYear()}. ${HU_MONTH[d.getMonth()]} ${d.getDate()}. ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// --- Hirdetés lejárati figyelmeztető email -----------------------------------

interface BulletinExpiryWarningArgs {
  to: string;
  posterName?: string | null;
  title: string;
  /** ISO datetime — mikor jár le a hirdetés */
  expiresAt: string;
  /** Teljes URL — pl. https://kinti.app/hirdetes-kezeles/<token> */
  manageUrl: string;
}

export async function sendBulletinExpiryWarningEmail(args: BulletinExpiryWarningArgs): Promise<void> {
  const env = getCloudflareEnv();
  const from = env.EMAIL_FROM || "Kinti <info@kinti.app>";

  const greet = args.posterName?.trim() ? args.posterName.trim() : "kinti";
  const expiresHu = (() => {
    const d = new Date(args.expiresAt);
    if (Number.isNaN(d.getTime())) return args.expiresAt;
    const HU_MONTH = ["jan.", "feb.", "márc.", "ápr.", "máj.", "jún.", "júl.", "aug.", "szept.", "okt.", "nov.", "dec."];
    return `${d.getFullYear()}. ${HU_MONTH[d.getMonth()]} ${d.getDate()}.`;
  })();

  const subject = `⏰ A hirdetésed 3 nap múlva lejár — kinti.app`;

  const text = `Szia ${greet}!

A kinti.app-on feladott hirdetésed hamarosan lejár:
  "${args.title}"

Lejárat dátuma: ${expiresHu}

Ha a hirdetés még aktuális, egyetlen kattintással meghosszabbíthatod újabb 30 nappal:
  ${args.manageUrl}

Ha nem hosszabbítod meg, a hirdetés automatikusan törlődik a lejárat után.

Üdv,
kinti.app`;

  const html = baseLayout({
    preheader: `A hirdetésed lejár ${expiresHu}-én — egyetlen kattintással meghosszabbíthatod!`,
    body: `
      <p style="margin:0 0 12px;font-size:15px;line-height:1.55;color:#0e1f17;">
        Szia ${escapeHtml(greet)} 👋
      </p>
      <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#0e1f17;">
        A kinti.app hirdetőfalon feladott hirdetésed <strong>3 nap múlva lejár</strong>:
      </p>
      <p style="margin:0 0 20px;padding:12px 14px;background:#fbf7ee;border:1px solid #e6ebe5;border-radius:14px;font-size:14.5px;font-weight:700;color:#0e1f17;">
        ${escapeHtml(args.title)}
      </p>
      <div style="margin:0 0 20px;padding:12px 14px;background:#fff8ed;border:2px solid #e3a233;border-radius:14px;display:flex;align-items:center;gap:10px;">
        <span style="font-size:22px;line-height:1;">⏰</span>
        <div>
          <div style="font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#9a6b00;margin-bottom:2px;">Lejárat</div>
          <div style="font-size:14.5px;font-weight:800;color:#0e1f17;">${escapeHtml(expiresHu)}</div>
        </div>
      </div>
      <p style="margin:0 0 10px;font-size:14px;line-height:1.6;color:#5c6d63;">
        Ha a hirdetés még aktuális, <strong>egyetlen kattintással</strong> meghosszabbíthatod újabb <strong>30 nappal</strong> — nem kell semmit újra megírni!
      </p>
      <p style="margin:0 0 20px;">
        ${button(args.manageUrl, "Hirdetésem meghosszabbítása →")}
      </p>
      <p style="margin:0;font-size:12px;line-height:1.6;color:#94a097;">
        Ha nem hosszabbítod meg, a hirdetés automatikusan törlődik a lejárat után. Bármikor újra feladhatod a hirdetőfalon.
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


