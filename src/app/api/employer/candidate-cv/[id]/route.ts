import { auth } from "@clerk/nextjs/server";
import { getEmployerByOwner, getWorkerProfileById } from "@/lib/repo";
import { getMediaBucket } from "@/lib/cloudflare";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET /api/employer/candidate-cv/:id — egy jelölt CV-jének letöltése.
 *
 * Védett: csak BEJELENTKEZETT, JÓVÁHAGYOTT munkáltató kérheti le, és csak
 * olyan jelölt CV-jét, aki kereshetőre (searchable) állította magát. A CV
 * az R2 bindingen át streamel — a kulcs sosem kerül a kliensre.
 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const employer = await getEmployerByOwner(userId);
  if (!employer || employer.moderationStatus !== 1) {
    return new Response("Forbidden", { status: 403 });
  }

  const worker = await getWorkerProfileById(params.id);
  if (!worker || !worker.searchable || !worker.cvKey) {
    return new Response("Not Found", { status: 404 });
  }

  const obj = await getMediaBucket().get(worker.cvKey);
  if (!obj || !("body" in obj) || obj.body == null) {
    return new Response("Not Found", { status: 404 });
  }

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("content-type", "application/pdf");
  headers.set("cache-control", "private, no-store");
  // Letöltésnél beszédes fájlnév a jelölt nevéből.
  const safeName = worker.fullName.replace(/[^\p{L}\p{N}\s_-]/gu, "").trim().replace(/\s+/g, "_") || "cv";
  headers.set("content-disposition", `inline; filename="${safeName}_CV.pdf"`);

  return new Response(obj.body, { status: 200, headers });
}
