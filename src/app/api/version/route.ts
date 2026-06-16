import { NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET /api/version — az AKTUÁLISAN deployolt build azonosítója.
 *
 * A kliens (sw-register.tsx) ezt hasonlítja össze a saját, build-időben beégetett
 * NEXT_PUBLIC_BUILD_ID-jával. Ha eltér, új deploy van → frissítés-prompt. Így a
 * PWA „melegindításnál" (memóriából visszatérve, friss oldalbetöltés nélkül) is
 * észreveszi az új verziót — amit a sima SW-update nem mindig kap el.
 */
export async function GET() {
  return NextResponse.json(
    { buildId: process.env.NEXT_PUBLIC_BUILD_ID ?? "dev" },
    { headers: { "cache-control": "no-store" } },
  );
}
