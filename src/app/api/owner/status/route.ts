import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getBusinessByOwner, getEmployerByOwner } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET /api/owner/status → { hasBusiness, hasEmployer }
 *
 * A bejelentkezett user SAJÁT tulajdonosi állapota (van-e már Szaknévsor-
 * vállalkozása / Munkáltatói profilja). Csak boolean-öket ad vissza (nincs PII),
 * a menü ez alapján dönti el, a „Vidd fel a vállalkozásod” vagy a „Vállalkozásom”
 * pontot mutassa — egy fiók = egy cég, ezért ne jelenjen meg mindkettő.
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ hasBusiness: false, hasEmployer: false });
  }
  const [business, employer] = await Promise.all([
    getBusinessByOwner(userId),
    getEmployerByOwner(userId),
  ]);
  return NextResponse.json({ hasBusiness: !!business, hasEmployer: !!employer });
}
