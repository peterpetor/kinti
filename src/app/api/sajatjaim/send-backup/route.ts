import { NextResponse } from "next/server";
import { sendBackupEmail } from "@/lib/email";
import { verifyTurnstile } from "@/lib/turnstile";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface BackupItem {
  type: string;
  id: string;
  title: string;
  manageToken: string;
  manageUrl: string;
  createdAt: string;
}

/**
 * POST /api/sajatjaim/send-backup  — backup-kézbesítés a user emailjére.
 *
 * Lényeges privacy-elv:
 *   - Az emailt SOSE tároljuk (nincs INSERT, nincs log).
 *   - A manage-token + email párosítás csak ezen az 1 requesten halad át.
 *   - A Resend SMTP-relayként működik, edge-runtime → fetch.
 *
 * A kliens (MyPostsManager) küldi a teljes lista-szettet — a szerver nem keres
 * a DB-ben, csak továbbít.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const turnstileToken = typeof body.turnstileToken === "string" ? body.turnstileToken : null;
  const items = Array.isArray(body.items) ? (body.items as BackupItem[]) : [];

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Érvénytelen email-cím." }, { status: 400 });
  }
  if (items.length === 0) {
    return NextResponse.json({ error: "Üres lista — nincs mit küldeni." }, { status: 400 });
  }
  if (items.length > 100) {
    return NextResponse.json({ error: "Túl sok elem (max 100)." }, { status: 400 });
  }

  const ip = req.headers.get("cf-connecting-ip") ?? null;
  const captcha = await verifyTurnstile(turnstileToken, ip);
  if (!captcha.ok) {
    return NextResponse.json(
      { error: "Robot-ellenőrzés sikertelen." },
      { status: 400 },
    );
  }

  // Sanitize: csak a szükséges mezőket vesszük át, a manage_token-t NEM küldjük el
  // (a manageUrl-ban már benne van, mint URL-path).
  const safeItems = items
    .filter((it) => typeof it.title === "string" && typeof it.manageUrl === "string")
    .map((it) => ({
      type: String(it.type ?? ""),
      title: String(it.title).slice(0, 200),
      manageUrl: String(it.manageUrl).slice(0, 200),
      createdAt: String(it.createdAt ?? ""),
    }));

  const origin = new URL(req.url).origin;

  try {
    await sendBackupEmail({ to: email, items: safeItems, origin });
  } catch (err) {
    safeLogError("[sajatjaim/send-backup] email send failed", err);
    return NextResponse.json(
      { error: "Nem sikerült elküldeni az emailt. Próbáld újra később." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}
