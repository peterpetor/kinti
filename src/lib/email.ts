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

  const text = `Szia, ${args.business.name}!

Valaki árajánlatot kért tőled a kinti.app-on:

Szolgáltatás: ${args.categoryLabel}
Kérező neve: ${args.senderName}
E-mail: ${args.senderEmail}
Telefon: ${args.senderPhone ?? "(nem adta meg)"}

Leírás / üzenet:
${args.message}

Válaszolj közvetlenül erre az emailre, vagy vedd fel a kapcsolatot ${args.senderEmail} e-mail-en.

— kinti.app`;

  const html = baseLayout({
    preheader: `Új árajánlat-kérés érkezett: ${args.categoryLabel}`,
    body: `
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#94a097;">Kinti · Árajánlat-kérés</p>
      <p style="margin:0 0 16px;font-size:15px;font-weight:800;color:#0e1f17;">Új árajánlat-kérés érkezett!</p>
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
