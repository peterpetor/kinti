import { getAdminUserId } from "@/lib/admin";
import { getWorkerProfileById } from "@/lib/repo";
import { getMediaBucket } from "@/lib/cloudflare";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/candidate-cv/:id — egy jelölt CV-jének letöltése ADMINNAK
 * (a Feedback Jobs közvetítői konzolhoz). Csak admin (getAdminUserId) kérheti.
 * A CV az R2 bindingen át streamel — a kulcs sosem kerül a kliensre.
 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const adminId = await getAdminUserId();
  if (!adminId) return new Response("Forbidden", { status: 403 });

  const worker = await getWorkerProfileById(params.id);
  if (!worker || !worker.cvKey) return new Response("Not Found", { status: 404 });

  const obj = await getMediaBucket().get(worker.cvKey);
  if (!obj || !("body" in obj) || obj.body == null) return new Response("Not Found", { status: 404 });

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("content-type", "application/pdf");
  headers.set("cache-control", "private, no-store");
  const safeName = worker.fullName.replace(/[^\p{L}\p{N}\s_-]/gu, "").trim().replace(/\s+/g, "_") || "cv";
  headers.set("content-disposition", `inline; filename="${safeName}_CV.pdf"`);

  return new Response(obj.body, { status: 200, headers });
}
