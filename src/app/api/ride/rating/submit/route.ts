import { NextResponse } from "next/server";
import { z } from "zod";
import { addRideRatingDraft } from "@/lib/repo";
import { sendRideRatingConfirmEmail } from "@/lib/email";

export const runtime = "edge";

const ratingSchema = z.object({
  targetPhone: z.string().min(3),
  email: z.string().email(),
  rating: z.number().int().min(1).max(5),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = ratingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Érvénytelen adatok." }, { status: 400 });
    }

    const { targetPhone, email, rating } = parsed.data;
    
    // Generate confirmation token and expiry
    const confirmToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Save to drafts
    const success = await addRideRatingDraft(targetPhone, email, rating, confirmToken, expiresAt);
    if (!success) {
      return NextResponse.json({ error: "Adatbázis hiba." }, { status: 500 });
    }

    // Send email
    const confirmUrl = `https://kinti.app/api/ride/rating/confirm/${confirmToken}`;
    await sendRideRatingConfirmEmail(email, targetPhone, rating, confirmUrl);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Ride rating submit error:", error);
    return NextResponse.json({ error: "Szerverhiba történt." }, { status: 500 });
  }
}
