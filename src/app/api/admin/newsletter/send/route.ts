import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin";
import { isValidCountry } from "@/lib/countries";
import { listConfirmedNewsletterSubscribers } from "@/lib/repo-newsletter";
import { getEmailUsageStats } from "@/lib/repo";
import { sendNewsletterBatch } from "@/lib/email";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/newsletter/send — ország-szegmentált hírlevél-küldés a saját
 * (D1) feliratkozó-listára Resend BATCH-csel. Admin-only. Napi-keret-tudatos
 * (Resend free 100/nap); minden e-mailben a meglévő leiratkozó-link.
 * Body: { subject, body (sima szöveg), country: 'all'|'CH'|'AT'|'DE'|'NL' }.
 */
function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
}
function textToHtml(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 14px">${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`)
    .join("\n");
}

export async function POST(req: Request) {
  const adminId = await getAdminUserId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { subject?: string; body?: string; country?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const text = typeof body.body === "string" ? body.body.trim() : "";
  const country = body.country && body.country !== "all" ? body.country : "all";

  if (subject.length < 3) return NextResponse.json({ error: "Adj meg tárgyat (min. 3 karakter)." }, { status: 400 });
  if (text.length < 10) return NextResponse.json({ error: "A hírlevél törzse túl rövid (min. 10 karakter)." }, { status: 400 });
  if (country !== "all" && !isValidCountry(country)) return NextResponse.json({ error: "Érvénytelen ország." }, { status: 400 });

  const subscribers = await listConfirmedNewsletterSubscribers(country);
  if (!subscribers.length) {
    return NextResponse.json({ ok: true, total: 0, sent: 0, skipped: 0, message: "Nincs megerősített feliratkozó ebben a szegmensben." });
  }

  // Napi keret (Resend free 100/nap) + batch-limit (100/hívás) — ne lépjük túl.
  const usage = await getEmailUsageStats();
  const remaining = Math.max(0, usage.dailyFreeLimit - usage.todayCount);
  const cap = Math.min(subscribers.length, remaining, 100);
  const targets = subscribers.slice(0, cap);
  const skipped = subscribers.length - targets.length;

  if (!targets.length) {
    return NextResponse.json({ ok: true, total: subscribers.length, sent: 0, skipped, message: "A napi e-mail-keret elfogyott — próbáld holnap (a maradékot is kiküldheted)." });
  }

  const baseUrl = getCloudflareEnv().PUBLIC_BASE_URL?.replace(/\/$/, "") || new URL(req.url).origin;
  const recipients = targets.map((s) => ({
    to: s.email,
    unsubscribeUrl: `${baseUrl}/api/newsletter/unsubscribe/${s.manageToken}`,
  }));

  try {
    const { sent, failed } = await sendNewsletterBatch({
      recipients,
      subject,
      bodyHtml: textToHtml(text),
      bodyText: text,
    });
    return NextResponse.json({ ok: true, total: subscribers.length, sent, failed, skipped });
  } catch (err) {
    safeLogError("[admin/newsletter/send]", err);
    return NextResponse.json({ error: "Küldési hiba történt a Resendnél." }, { status: 500 });
  }
}
