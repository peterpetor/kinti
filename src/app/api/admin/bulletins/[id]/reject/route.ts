import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin";
import { deleteBulletinPostById } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const adminId = await getAdminUserId();
  if (!adminId) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  await deleteBulletinPostById(params.id);

  const origin = new URL(req.url).origin;
  return NextResponse.redirect(`${origin}/admin`);
}
