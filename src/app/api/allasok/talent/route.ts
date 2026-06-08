import { NextResponse } from "next/server";
import { getDB } from "@/lib/cloudflare";
import { sendEmail } from "@/lib/email";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";

interface TalentBody {
  firstName?: string; lastName?: string; email?: string; phone?: string; profession?: string;
  germanLevel?: string; drivingLicense?: boolean; hasCar?: boolean; isInSwitzerland?: boolean;
  permitType?: string; targetCanton?: string; availableFrom?: string; notes?: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as TalentBody;

    const id = "lead_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16);
    
    // Alapadatok validálása
    if (!body.firstName || !body.lastName || !body.email || !body.phone || !body.profession) {
      return NextResponse.json({ error: "Minden kötelező mezőt ki kell tölteni." }, { status: 400 });
    }

    const db = getDB();
    await db.prepare(
      `INSERT INTO job_leads 
       (id, first_name, last_name, email, phone, profession, german_level, driving_license, has_car, is_in_switzerland, permit_type, target_canton, available_from, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      body.firstName,
      body.lastName,
      body.email,
      body.phone,
      body.profession,
      body.germanLevel || "Nincs",
      body.drivingLicense ? 1 : 0,
      body.hasCar ? 1 : 0,
      body.isInSwitzerland ? 1 : 0,
      body.permitType || "Nincs",
      body.targetCanton || "Bárhol",
      body.availableFrom || "Azonnal",
      body.notes || null
    ).run();

    // Értesítő email a munkaközvetítőnek (Kinti adminnak)
    try {
      await sendEmail({
        to: "info@kinti.app", // Ezt majd állítsátok be a saját HR-es címetekre
        subject: `[Kinti Talent] Új jelölt: ${body.firstName} ${body.lastName} - ${body.profession}`,
        html: `
          <h2>Új Kinti Talent Jelentkező</h2>
          <p><strong>Név:</strong> ${body.firstName} ${body.lastName}</p>
          <p><strong>Szakma:</strong> ${body.profession}</p>
          <p><strong>Német tudás:</strong> ${body.germanLevel || "Nincs"}</p>
          <p><strong>Jogosítvány/Autó:</strong> ${body.drivingLicense ? "Van jogsi" : "Nincs jogsi"} / ${body.hasCar ? "Van autó" : "Nincs autó"}</p>
          <p><strong>Svájcban van már?</strong> ${body.isInSwitzerland ? "Igen (Engedély: " + body.permitType + ")" : "Nem"}</p>
          <p><strong>Kezdés:</strong> ${body.availableFrom || "Azonnal"}</p>
          <hr/>
          <h3>Kapcsolat</h3>
          <p><strong>Email:</strong> <a href="mailto:${body.email}">${body.email}</a></p>
          <p><strong>Telefon:</strong> <a href="tel:${body.phone}">${body.phone}</a></p>
          <p><strong>Megjegyzés:</strong><br/>${body.notes || "-"}</p>
        `,
      });
    } catch (emailErr) {
      safeLogError("talent-email", emailErr);
      // Ha az email elszáll (pl resend api kulcs hiány), a lead attól még el van mentve a D1-ben.
    }

    return NextResponse.json({ success: true, id });

  } catch (err) {
    safeLogError("api/allasok/talent", err);
    return NextResponse.json({ error: "Hiba történt a mentés során." }, { status: 500 });
  }
}
