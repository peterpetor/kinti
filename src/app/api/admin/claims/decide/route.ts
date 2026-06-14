import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin";
import { safeLogError } from "@/lib/safe-log";
import { approveBusinessClaim, rejectBusinessClaim } from "@/lib/repo";
import { sendEmail } from "@/lib/email";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/claims/decide
 * Body: { id: string, decision: 'approved' | 'rejected' }
 * Jóváhagyáskor: a vállalkozás claimed=1 + manage_token, és a kezelő-linket
 * elküldjük az igénylő e-mailjére.
 */
export async function POST(req: Request) {
  try {
    const adminId = await getAdminUserId();
    if (!adminId) return NextResponse.json({ error: "forbidden" }, { status: 403 });

    const body = (await req.json().catch(() => ({}))) as { id?: string; decision?: string };
    const id = typeof body.id === "string" ? body.id : "";
    const decision = body.decision;
    if (!id) return NextResponse.json({ error: "invalid_id" }, { status: 400 });

    if (decision === "rejected") {
      const ok = await rejectBusinessClaim(id, adminId);
      return NextResponse.json({ ok });
    }

    if (decision === "approved") {
      const result = await approveBusinessClaim(id, adminId);
      if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

      const manageUrl = `https://kinti.app/szaknevsor/kezeles/${result.manageToken}`;
      try {
        await sendEmail({
          to: result.claimantEmail,
          subject: "Átvetted a vállalkozásod a Kintin 🎉",
          html: `<p>Jóváhagytuk az igénylésed — mostantól tiéd a profil.</p>
                 <p><a href="${manageUrl}">Kezeld a vállalkozásod itt</a> (logó, nyitvatartás, leírás, kapcsolat).
                 Ezt a linket őrizd meg — ezzel szerkesztheted bármikor.</p>
                 <p>${manageUrl}</p>`,
          text: `Jóváhagytuk az igénylésed. Kezelő-link: ${manageUrl}`,
        });
      } catch (e) {
        safeLogError("claims/decide/email", e);
        // Nem fatális — a claim jóvá lett hagyva; a linket az adminon is látni.
      }
      return NextResponse.json({ ok: true, manageUrl });
    }

    return NextResponse.json({ error: "invalid_decision" }, { status: 400 });
  } catch (err) {
    safeLogError("api/admin/claims/decide", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
