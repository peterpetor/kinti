import { NextResponse } from "next/server";
import { getDB } from "@/lib/cloudflare";
import { sendBulletinContactEmail } from "@/lib/email";

export const runtime = "edge";
export const dynamic = "force-dynamic";

interface PostRow {
  email: string | null;
  poster: string | null;
  title: string;
}

/**
 * POST /api/bulletin/contact  — nyilvános kapcsolatfelvételi végpont.
 *
 * Lehetővé teszi, hogy egy látogató kapcsolatba lépjen a hirdetés feladójával
 * anélkül, hogy a feladó email címe nyilvánossá válna.
 */
export async function POST(req: Request) {
  let body: {
    postId?: unknown;
    message?: unknown;
    senderEmail?: unknown;
    senderName?: unknown;
  } = {};

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 });
  }

  const postId = typeof body.postId === "string" ? body.postId.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const senderEmail = typeof body.senderEmail === "string" ? body.senderEmail.trim() : "";
  const senderName = typeof body.senderName === "string" ? body.senderName.trim() : "";

  if (!postId || !message || !senderEmail || !senderName) {
    return NextResponse.json({ error: "Minden mező kitöltése kötelező." }, { status: 400 });
  }

  // 1) Lekérjük a hirdetés adatait a DB-ből (beleértve a rejtett emailt is!)
  try {
    const post = await getDB()
      .prepare("SELECT email, poster, title FROM bulletin_posts WHERE id = ?")
      .bind(postId)
      .first<PostRow>();

    if (!post || !post.email) {
      return NextResponse.json({ error: "A hirdetés nem található vagy nem aktív." }, { status: 404 });
    }

    // 2) Email küldése a Resend integráción keresztül
    await sendBulletinContactEmail({
      to: post.email,
      posterName: post.poster || "Hirdető",
      adTitle: post.title,
      senderName,
      senderEmail,
      message,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Ismeretlen hiba.";
    return NextResponse.json({ error: `Hiba történt az üzenet küldésekor: ${errorMsg}` }, { status: 500 });
  }
}
