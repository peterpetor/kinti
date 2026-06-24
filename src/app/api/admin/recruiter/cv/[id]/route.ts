import { getAdminUserId } from "@/lib/admin";
import { getRecruitingCandidate } from "@/lib/repo-recruiting";
import { getMediaBucket } from "@/lib/cloudflare";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/recruiter/cv/:id — egy közvetítői jelölt CV-jének letöltése.
 * Admin-only. R2-ből streamel, a kulcs sosem kerül a kliensre.
 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const adminId = await getAdminUserId();
  if (!adminId) return new Response("Forbidden", { status: 403 });

  const cand = await getRecruitingCandidate(params.id);
  if (!cand || !cand.cvKey) return new Response("Not Found", { status: 404 });

  const obj = await getMediaBucket().get(cand.cvKey);
  if (!obj || !("body" in obj) || obj.body == null) return new Response("Not Found", { status: 404 });

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("content-type", "application/pdf");
  headers.set("cache-control", "private, no-store");
  const safeName = cand.fullName.replace(/[^\p{L}\p{N}\s_-]/gu, "").trim().replace(/\s+/g, "_") || "cv";
  headers.set("content-disposition", `inline; filename="${safeName}_CV.pdf"`);

  return new Response(obj.body, { status: 200, headers });
}
