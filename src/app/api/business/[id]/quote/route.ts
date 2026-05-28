import { NextResponse } from "next/server";
import { getBusinessById } from "@/lib/repo";
import { sendBusinessQuoteEmail } from "@/lib/email";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const b = await getBusinessById(params.id);
    if (!b) return NextResponse.json({ error: "Nem található a vállalkozás" }, { status: 404 });
    
    // A vállalkozónak lennie kell megadott kapcsolattartó emailnek
    const toEmail = b.contactEmail || null;
    if (!toEmail) {
      return NextResponse.json({ error: "A vállalkozó nem fogad üzeneteket, kérlek hívd fel." }, { status: 400 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      name?: string;
      email?: string;
      phone?: string;
      message?: string;
    };
    const { name, email, phone, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Kérlek, töltsd ki az összes kötelező mezőt!" }, { status: 400 });
    }

    await sendBusinessQuoteEmail({
      to: toEmail,
      businessName: b.name,
      senderName: name,
      senderEmail: email,
      senderPhone: phone,
      message,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Quote email error:", err);
    return NextResponse.json({ error: "Hálózati hiba történt a küldés során." }, { status: 500 });
  }
}
