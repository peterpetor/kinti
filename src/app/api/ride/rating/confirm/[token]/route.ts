import { NextResponse } from "next/server";
import { getRideRatingDraftByToken, confirmRideRatingDraft } from "@/lib/repo";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";

export async function GET(
  req: Request,
  { params }: { params: { token: string } }
) {
  try {
    const draft = await getRideRatingDraftByToken(params.token);
    if (!draft) {
      return new NextResponse(
        "Érvénytelen vagy lejárt megerősítő link.",
        { status: 400 }
      );
    }

    if (new Date() > new Date(draft.expires_at)) {
      return new NextResponse(
        "A megerősítő link lejárt. Kérjük, küldj be egy új értékelést.",
        { status: 400 }
      );
    }

    const success = await confirmRideRatingDraft(draft.id);
    if (!success) {
      return new NextResponse(
        "Sikertelen megerősítés (szerverhiba).",
        { status: 500 }
      );
    }

    // Redirect to a success page or the ride list
    return NextResponse.redirect(new URL("/telekocsi?rating=success", req.url));
  } catch (err) {
    safeLogError("[ride/rating/confirm] error", err);
    return new NextResponse(
      "Szerverhiba történt a megerősítés során.",
      { status: 500 }
    );
  }
}
