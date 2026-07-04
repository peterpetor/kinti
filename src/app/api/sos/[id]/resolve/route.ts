import { NextResponse } from "next/server";
import { resolveSosAlert } from "@/lib/sos-repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  // Elsődleges tulajdonlás: a beküldéskor kapott resolve-token (body-ban).
  const body = (await req.json().catch(() => ({}))) as { token?: unknown };
  const resolveToken = typeof body.token === "string" && body.token ? body.token : null;

  // Fallback (token előtti riasztások): IP-hash-ből származó userId.
  const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || "unknown";

  const ipHash = Array.from(
    new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip)))
  ).map((b) => b.toString(16).padStart(2, "0")).join("");

  const userId = `ip_${ipHash.substring(0, 16)}`;

  const success = await resolveSosAlert(params.id, { resolveToken, posterUserId: userId });

  if (!success) {
    return NextResponse.json({ error: "Not found or not authorized" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
