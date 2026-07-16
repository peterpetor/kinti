import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getHousingContactInfo } from "@/lib/repo";
import { isPro } from "@/lib/subscriptions";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET /api/housing/contact?id=… — a hirdető elérhetőségének felfedése.
 *
 * EZ a kapuőr: a kontakt a lista-payloadban SOSEM szerepel (anti-leak elv,
 * ld. lead-freemium minta), kizárólag itt, SZERVER-oldali Kinti PRO ellenőrzés
 * után adjuk ki. A kliens-oldali paywall-modal csak UX — a tényleges zár ez.
 *   401 → nincs belépve;  403 { error: "pro_required" } → nem PRO;
 *   404 → nincs ilyen aktív hirdetés.
 */
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Jelentkezz be a kapcsolatfelvételhez." }, { status: 401 });
  }
  if (!(await isPro(userId))) {
    return NextResponse.json({ error: "pro_required" }, { status: 403 });
  }
  const id = req.nextUrl.searchParams.get("id")?.trim() ?? "";
  if (!id) return NextResponse.json({ error: "Hiányzó azonosító." }, { status: 400 });

  const contact = await getHousingContactInfo(id);
  if (!contact) return NextResponse.json({ error: "A hirdetés már nem elérhető." }, { status: 404 });

  return NextResponse.json({ contact }, { headers: { "cache-control": "no-store" } });
}
