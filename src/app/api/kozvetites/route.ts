import { NextResponse } from "next/server";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { verifyTurnstile } from "@/lib/turnstile";
import { checkAiRateLimit, logAiRateLimit } from "@/lib/ai";
import { checkBlocklistOrReject } from "@/lib/blocklist-guard";
import { containsProfanity } from "@/lib/profanity";
import { hashIp } from "@/lib/security";
import { sendEmail } from "@/lib/email";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// CH szándékosan NINCS: a svájci munkaközvetítés SECO-engedélyköteles.
const COUNTRIES = new Set(["AT", "DE", "NL"]);

/**
 * POST /api/kozvetites — munkáltatói megkeresés a Feedback Jobs közvetítéshez.
 * A B2B tölcsér bejárata: cég + pozíció + kontakt → email az adminnak
 * (ADMIN_EMAILS). Nincs új tábla — a pipeline az admin /kozvetites felületen él.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 });
  }
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

  // Honeypot: bot kitöltötte → csendes "siker".
  if (str(body.website, 10)) return NextResponse.json({ ok: true });

  const company = str(body.company, 120);
  const name = str(body.name, 80);
  const email = str(body.email, 254).toLowerCase();
  const phone = str(body.phone, 40) || null;
  const country = str(body.country, 2).toUpperCase();
  const position = str(body.position, 120);
  const message = str(body.message, 1200) || null;
  const turnstileToken = typeof body.turnstileToken === "string" ? body.turnstileToken : null;

  if (company.length < 2) return NextResponse.json({ error: "Add meg a cég nevét." }, { status: 400 });
  if (name.length < 2) return NextResponse.json({ error: "Add meg a neved." }, { status: 400 });
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "Érvénytelen email-cím." }, { status: 400 });
  if (!COUNTRIES.has(country)) return NextResponse.json({ error: "Válassz országot (AT/DE/NL)." }, { status: 400 });
  if (position.length < 2) return NextResponse.json({ error: "Add meg, milyen pozícióra keresel." }, { status: 400 });
  for (const t of [company, name, position, message ?? ""]) {
    if (t && containsProfanity(t).hit) {
      return NextResponse.json({ error: "Nem megfelelő szöveg." }, { status: 400 });
    }
  }

  const ip = req.headers.get("cf-connecting-ip") ?? null;
  const captcha = await verifyTurnstile(turnstileToken, ip);
  if (!captcha.ok) {
    return NextResponse.json({ error: "A robot-ellenőrzés sikertelen. Próbáld újra." }, { status: 400 });
  }
  const banned = await checkBlocklistOrReject({ ip, email });
  if (banned) return banned;

  const ipHash = await hashIp(ip);
  const rl = await checkAiRateLimit("placement-inquiry", ipHash);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Túl sok megkeresés rövid idő alatt. Próbáld később." }, { status: 429 });
  }
  await logAiRateLimit("placement-inquiry", ipHash);

  const env = getCloudflareEnv() as unknown as { ADMIN_EMAILS?: string };
  const admins = (env.ADMIN_EMAILS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (admins.length === 0) {
    safeLogError("api/kozvetites", new Error("ADMIN_EMAILS nincs beállítva"));
    return NextResponse.json({ error: "Átmeneti hiba — próbáld később." }, { status: 500 });
  }

  const esc = (s: string) => s.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const html = `<div style="font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;max-width:560px;margin:0 auto;padding:8px">
<p style="font-size:18px;font-weight:800;margin:0 0 10px">🤝 Új munkáltatói megkeresés — közvetítés</p>
<p style="margin:0 0 4px"><strong>Cég:</strong> ${esc(company)} (${country})</p>
<p style="margin:0 0 4px"><strong>Kapcsolattartó:</strong> ${esc(name)} · <a href="mailto:${esc(email)}">${esc(email)}</a>${phone ? ` · ${esc(phone)}` : ""}</p>
<p style="margin:0 0 12px"><strong>Keresett pozíció:</strong> ${esc(position)}</p>
${message ? `<p style="margin:0 0 12px;white-space:pre-line;border-left:3px solid #e6ebe5;padding-left:10px">${esc(message)}</p>` : ""}
<a href="https://kinti.app/admin/kozvetites" style="display:inline-block;background:#1d4434;color:#fff;text-decoration:none;font-weight:700;padding:10px 18px;border-radius:999px">Közvetítő-kereső megnyitása</a>
</div>`;

  try {
    for (const to of admins) {
      await sendEmail({
        to,
        subject: `🤝 Közvetítés-megkeresés: ${company} — ${position} (${country})`,
        html,
        text: `Cég: ${company} (${country})\nKapcsolat: ${name} <${email}>${phone ? ` ${phone}` : ""}\nPozíció: ${position}\n\n${message ?? ""}`,
      });
    }
  } catch (err) {
    safeLogError("api/kozvetites:sendEmail", err);
    return NextResponse.json({ error: "Az üzenetet nem sikerült elküldeni — próbáld később." }, { status: 502 });
  }

  return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}
