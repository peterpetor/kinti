import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getEmployerByOwner, renewJob } from "@/lib/repo";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/employer/jobs/:id/renew — lejárt hirdetés ingyenes megújítása.
 *
 * Tartalom-szerkesztés nincs (a meglévő adatok változatlanok maradnak), ezért
 * nincs újra-moderáció sem — csak a láthatóság ('expired' → 'active') és a
 * lejárat (+JOB_LISTING_DAYS nap) éled újra. Csak 'expired' hirdetésen működik.
 */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const employer = await getEmployerByOwner(userId);
  if (!employer) {
    return NextResponse.json({ error: "Nincs munkáltatói fiókod." }, { status: 403 });
  }

  try {
    const renewed = await renewJob(params.id, employer.id);
    if (!renewed) {
      return NextResponse.json(
        { error: "A hirdetés nem található, nem a tiéd, vagy nem lejárt." },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    safeLogError("[employer/jobs/:id/renew POST]", err);
    return NextResponse.json({ error: "Belső hiba történt a megújítás során." }, { status: 500 });
  }
}
