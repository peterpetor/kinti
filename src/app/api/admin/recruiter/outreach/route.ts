import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { sendOutreachBatch } from "@/lib/email";
import {
  listShortlistByCandidate,
  markShortlistContacted,
  type ShortlistJob,
} from "@/lib/repo-recruiting";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_PER_SEND = 100; // Resend batch + free-tier napi keret

/** Sablon-helyettesítés: {{pozicio}}, {{ceg}}, {{helyszin}}. */
function fill(tpl: string, j: ShortlistJob): string {
  return tpl
    .replace(/\{\{\s*pozicio\s*\}\}/gi, j.jobTitle)
    .replace(/\{\{\s*ceg\s*\}\}/gi, j.jobCompany || "Ihrem Unternehmen")
    .replace(/\{\{\s*helyszin\s*\}\}/gi, j.jobLocation || "");
}

function htmlBody(text: string): string {
  const esc = text.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:14px;line-height:1.6;color:#1a1a1a;max-width:600px">${esc.replace(/\n/g, "<br/>")}</div>`;
}

/**
 * POST /api/admin/recruiter/outreach — körlevél a jelölt shortlistjén lévő
 * munkáltatóknak (azoknak, akiknél megadtál e-mailt). Minden levél személyre
 * szabott (pozíció/cég) és külön To-ra megy; a hirdető a `replyTo`-ra (a te
 * címedre) válaszol. A kiküldött sorok státusza „contacted" lesz.
 * Body: { candidateId, subject, body, replyTo }.
 */
export async function POST(req: Request) {
  if (!(await getAdminUserId())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  try {
    const body = (await req.json().catch(() => ({}))) as { candidateId?: string; subject?: string; body?: string; replyTo?: string };
    const subjectTpl = (body.subject ?? "").trim();
    const bodyTpl = (body.body ?? "").trim();
    const replyTo = (body.replyTo ?? "").trim();
    if (!body.candidateId || !subjectTpl || !bodyTpl) return NextResponse.json({ error: "Hiányzó tárgy/szöveg/jelölt." }, { status: 400 });
    if (!EMAIL_RE.test(replyTo)) return NextResponse.json({ error: "Adj meg egy érvényes válasz-címet (a te e-mailed)." }, { status: 400 });

    const all = await listShortlistByCandidate(body.candidateId);
    const targets = all.filter((j) => j.employerEmail && EMAIL_RE.test(j.employerEmail));
    if (targets.length === 0) return NextResponse.json({ error: "Egyik shortlist-tételnél sincs érvényes munkáltatói e-mail." }, { status: 422 });
    const capped = targets.slice(0, MAX_PER_SEND);

    const env = getCloudflareEnv();
    const fromAddr = env.EMAIL_FROM?.match(/<([^>]+)>/)?.[1] || env.EMAIL_FROM || "info@kinti.app";
    const from = `Feedback Jobs <${fromAddr}>`;

    const recipients = capped.map((j) => {
      const text = fill(bodyTpl, j);
      return { to: j.employerEmail!, subject: fill(subjectTpl, j), html: htmlBody(text), text };
    });

    const { sent, failed } = await sendOutreachBatch({ from, replyTo, recipients });
    if (sent > 0) await markShortlistContacted(capped.map((j) => j.id));

    return NextResponse.json({
      sent,
      failed,
      total: targets.length,
      skipped: targets.length - capped.length,
      noEmail: all.length - targets.length,
    });
  } catch (err) {
    safeLogError("admin/recruiter/outreach", err);
    return NextResponse.json({ error: "A kiküldés nem sikerült." }, { status: 500 });
  }
}
