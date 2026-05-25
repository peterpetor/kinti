import { NextResponse } from "next/server";
import {
  deleteBulletinPostByManageToken,
  getBulletinPostByManageToken,
} from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * /api/bulletin/manage/<token>
 *
 * GET    — visszaadja a hirdetést a kezelő UI-nak (nem cache-elve).
 * DELETE — törli a hirdetést. Csak az tudja, akinél a manage-token email-ben.
 *
 * Itt nincs Clerk-auth — a token MAGA a bizonyíték, hogy a feladó vagyunk.
 * A tokenek crypto.randomUUID-vel készülnek (122 bit entrópia), így gyakorlatilag
 * brute-force-hatatlanok.
 */
export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const post = await getBulletinPostByManageToken(params.token);
  if (!post) return NextResponse.json({ error: "Nem található." }, { status: 404 });
  return NextResponse.json(
    { post },
    { headers: { "cache-control": "no-store" } },
  );
}

export async function DELETE(_req: Request, { params }: { params: { token: string } }) {
  const ok = await deleteBulletinPostByManageToken(params.token);
  if (!ok) return NextResponse.json({ error: "Nem található." }, { status: 404 });
  return NextResponse.json(
    { ok: true },
    { headers: { "cache-control": "no-store" } },
  );
}
