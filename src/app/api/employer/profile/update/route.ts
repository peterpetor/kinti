import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getEmployerByOwner } from "@/lib/repo";
import { getDB } from "@/lib/cloudflare";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function PUT(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const existing = await getEmployerByOwner(userId);
  if (!existing) {
    return NextResponse.json({ error: "Munkáltatói fiók nem található." }, { status: 404 });
  }

  const companyName = typeof body.companyName === "string" ? body.companyName.trim() : "";
  const contactEmail = typeof body.contactEmail === "string" ? body.contactEmail.trim() : "";
  const website = typeof body.website === "string" ? body.website.trim() : null;
  const description = typeof body.description === "string" ? body.description.trim() : null;
  const companyUid = typeof body.companyUid === "string" && body.companyUid.trim() ? body.companyUid.trim() : null;

  if (companyName.length < 2) {
    return NextResponse.json({ error: "A cégnév túl rövid." }, { status: 400 });
  }
  if (!contactEmail.includes("@")) {
    return NextResponse.json({ error: "Érvénytelen email cím." }, { status: 400 });
  }

  // Ha a cég-azonosító változik, a „Hiteles" jelzés visszaáll → admin újra-ellenőrzi.
  const verified = companyUid === existing.companyUid ? existing.verified : false;

  try {
    const res = await getDB()
      .prepare(
        `UPDATE employers
         SET company_name = ?, contact_email = ?, website = ?, description = ?, company_uid = ?, verified = ?, updated_at = datetime('now')
         WHERE id = ? AND owner_user_id = ?`
      )
      .bind(
        companyName,
        contactEmail,
        website,
        description,
        companyUid,
        verified ? 1 : 0,
        existing.id,
        userId
      )
      .run();

    if ((res.meta.changes ?? 0) === 0) {
      throw new Error("Sikertelen frissítés");
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    safeLogError("[employer/profile/update]", err);
    return NextResponse.json({ error: "Belső hiba történt a mentés során." }, { status: 500 });
  }
}
