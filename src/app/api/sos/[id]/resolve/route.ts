import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { resolveSosAlert } from "@/lib/sos-repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const success = await resolveSosAlert(params.id, userId);

  if (!success) {
    return NextResponse.json({ error: "Not found or not authorized" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
