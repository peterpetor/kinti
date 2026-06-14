import { NextResponse } from "next/server";
import { hashIp } from "@/lib/security";
import { checkAiRateLimit, logAiRateLimit } from "@/lib/ai";
import { safeLogError } from "@/lib/safe-log";
import { createBusinessClaim } from "@/lib/repo";
import { sendEmail } from "@/lib/email";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "info@kinti.app";

/**
 * POST /api/szaknevsor/[id]/claim — „Foglald el a vállalkozásod".
 * Body: { name?, email, phone?, message? }
 * Csak NEM megerősített (claimed = 0) listára enged claim-kérést.
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const ipHash = await hashIp(req.headers.get("cf-connecting-ip") ?? null);
    const rl = await checkAiRateLimit("business-claim", ipHash);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Túl sok igénylés. Próbáld újra 1 óra múlva." }, { status: 429 });
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : null;
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const phone = typeof body.phone === "string" && body.phone.trim() ? body.phone.trim().slice(0, 40) : null;
    const message = typeof body.message === "string" ? body.message.trim().slice(0, 1000) : null;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Érvénytelen e-mail-cím." }, { status: 400 });
    }

    const result = await createBusinessClaim({
      businessId: params.id,
      claimantName: name,
      claimantEmail: email,
      claimantPhone: phone,
      message,
      ipHash,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Admin értesítés (best-effort) — a jóváhagyás az /admin felületen történik.
    try {
      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `Új claim-igénylés: ${result.businessName}`,
        html: `<p><strong>Vállalkozás:</strong> ${escapeHtml(result.businessName)} (id: ${escapeHtml(params.id)})</p>
               <p><strong>Igénylő:</strong> ${escapeHtml(name ?? "—")} · ${escapeHtml(email)}${phone ? " · " + escapeHtml(phone) : ""}</p>
               <p><strong>Üzenet:</strong> ${escapeHtml(message ?? "—")}</p>
               <p>Jóváhagyás: /admin → Claim-igénylések.</p>`,
        text: `Claim: ${result.businessName} (${params.id}) — ${name ?? "—"} ${email} ${phone ?? ""}\n${message ?? ""}`,
      });
    } catch (e) {
      safeLogError("business-claim/admin-email", e);
    }

    await logAiRateLimit("business-claim", ipHash);
    return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
  } catch (err) {
    safeLogError("api/szaknevsor/claim", err);
    return NextResponse.json({ error: "Belső hiba. Próbáld újra később." }, { status: 500 });
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
