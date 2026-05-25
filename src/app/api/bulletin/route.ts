import { NextResponse, type NextRequest } from "next/server";
import { getBulletinKinds, getBulletinPosts } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// GET /api/bulletin?kind=alberlet
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const [kinds, posts] = await Promise.all([
    getBulletinKinds(),
    getBulletinPosts(searchParams.get("kind")),
  ]);
  return NextResponse.json({ kinds, posts }, { headers: { "cache-control": "no-store" } });
}
