import { auth } from "@clerk/nextjs/server";
import { getEmployerByOwner, getJobApplicationById } from "@/lib/repo";
import { getMediaBucket } from "@/lib/cloudflare";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET /api/employer/application-cv/:id — egy beérkezett pályázathoz csatolt CV
 * letöltése.
 *
 * Védett: csak BEJELENTKEZETT, JÓVÁHAGYOTT munkáltató kérheti le, és kizárólag
 * a SAJÁT állásaira beérkezett pályázat CV-jét (employer_id egyezés). A CV az R2
 * bindingen át streamel — a kulcs sosem kerül a kliensre.
 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const employer = await getEmployerByOwner(userId);
  if (!employer || employer.moderationStatus !== 1) {
    return new Response("Forbidden", { status: 403 });
  }

  const app = await getJobApplicationById(params.id);
  if (!app || app.employerId !== employer.id || !app.cvKey) {
    return new Response("Not Found", { status: 404 });
  }

  const obj = await getMediaBucket().get(app.cvKey);
  if (!obj || !("body" in obj) || obj.body == null) {
    return new Response("Not Found", { status: 404 });
  }

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("content-type", "application/pdf");
  headers.set("cache-control", "private, no-store");
  const safeName = app.fullName.replace(/[^\p{L}\p{N}\s_-]/gu, "").trim().replace(/\s+/g, "_") || "cv";
  headers.set("content-disposition", `inline; filename="${safeName}_CV.pdf"`);

  return new Response(obj.body, { status: 200, headers });
}
