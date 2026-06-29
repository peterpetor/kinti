import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { isPro } from "@/lib/subscriptions";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET /api/me/pro — a bejelentkezett user PRO-státusza a KLIENSNEK.
 * Kliens-gate-ekhez (pl. nyelvlecke PRO-zár): a tartalom úgyis a kliens-
 * bundle-ben van, így itt a gate UX/konverzió, nem titokvédelem. `isPro()`
 * követi a `PRO_ENFORCED` flaget (teszt-módban mindenkinek true).
 */
export async function GET() {
  let userId: string | null = null;
  try {
    userId = (await auth()).userId;
  } catch {
    /* nincs auth-kontextus → anonim */
  }
  const pro = await isPro(userId);
  return NextResponse.json({ pro }, { headers: { "Cache-Control": "no-store" } });
}
