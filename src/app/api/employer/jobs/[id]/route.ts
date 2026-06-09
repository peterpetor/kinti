import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { deleteJob, getEmployerByOwner } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// DELETE /api/employer/jobs/:id — a munkáltató saját hirdetésének törlése.
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const employer = await getEmployerByOwner(userId);
  if (!employer) {
    return NextResponse.json({ error: "Nincs munkáltatói fiókod." }, { status: 403 });
  }

  try {
    // A deleteJob employer_id-re is szűr, így csak a SAJÁT hirdetés törölhető.
    const deleted = await deleteJob(params.id, employer.id);
    if (!deleted) {
      return NextResponse.json({ error: "A hirdetés nem található vagy nem a tiéd." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[employer/jobs/:id DELETE] error:", err);
    return NextResponse.json({ error: "Belső hiba történt a törlés során." }, { status: 500 });
  }
}
