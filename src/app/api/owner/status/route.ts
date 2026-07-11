import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getBusinessByOwner, getEmployerByOwner, countLockedBusinessLeads } from "@/lib/repo";
import { isPro } from "@/lib/subscriptions";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET /api/owner/status → { hasBusiness, hasEmployer, kintiPro, businessPro, lockedLeads }
 *
 * A bejelentkezett user SAJÁT állapota. Csak boolean-öket + egy darabszámot ad
 * vissza (nincs PII):
 *  - hasBusiness / hasEmployer: a menü ez alapján dönt (egy fiók = egy cég).
 *  - kintiPro:   van-e aktív Kinti PRO (user-előfizetés).
 *  - businessPro: a vállalkozása PRO-e (business.featured = Szaknévsor PRO).
 *  - lockedLeads: a SAJÁT cég zárolt ajánlatkéréseinek száma (csak nem-PRO cégnél
 *    számolva) — a /pro személyre szabott sürgetéséhez. Kontakt-adat nem megy ki.
 * A /pro oldal ez alapján jelzi, MELYIK csomag AKTÍV már — átláthatóság.
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ hasBusiness: false, hasEmployer: false, kintiPro: false, businessPro: false, lockedLeads: 0 });
  }
  const [business, employer, kintiPro] = await Promise.all([
    getBusinessByOwner(userId),
    getEmployerByOwner(userId),
    isPro(userId),
  ]);
  const lockedLeads =
    business && !business.featured ? await countLockedBusinessLeads(business.id) : 0;
  return NextResponse.json({
    hasBusiness: !!business,
    hasEmployer: !!employer,
    kintiPro,
    businessPro: !!business?.featured,
    lockedLeads,
  });
}
