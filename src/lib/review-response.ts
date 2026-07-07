/**
 * review-response.ts — a tulajdonosi vélemény-válasz KÖZÖS logikája (validáció +
 * AI-moderáció + írás). A konszolidált manage-akció hívja (edge-route-plafon):
 *   • POST /api/business/manage/[token]  { action: "review-response", ... }
 * A /profil (Clerk-tulajdonos) is ezt használja a saját cége manage-tokenjével.
 * A hívó a már IGAZOLT saját `businessId`-t adja át.
 */
import { setReviewOwnerResponse } from "./repo";
import { REVIEW_LIMITS } from "./reviews";
import { moderateText } from "./text-moderation";

export interface OwnerResponseResult {
  ok: boolean;
  status: number;
  error?: string;
}

/**
 * Egy tulajdonosi válasz beállítása/törlése. `rawResponse` üres/whitespace vagy
 * null → a válasz TÖRLÉSE. Nem üres → hosszkorlát + AI-moderáció, majd írás.
 */
export async function applyOwnerResponse(
  businessId: string,
  reviewId: unknown,
  rawResponse: unknown,
): Promise<OwnerResponseResult> {
  if (typeof reviewId !== "string" || !reviewId.trim()) {
    return { ok: false, status: 400, error: "Hiányzó vélemény-azonosító." };
  }

  const text = typeof rawResponse === "string" ? rawResponse.trim() : "";

  // Üres → törlés (a tulaj visszavonhatja a válaszát).
  if (!text) {
    const cleared = await setReviewOwnerResponse(reviewId, businessId, null);
    return cleared
      ? { ok: true, status: 200 }
      : { ok: false, status: 404, error: "A vélemény nem található, vagy nem a tiéd." };
  }

  if (text.length > REVIEW_LIMITS.ownerResponseMax) {
    return { ok: false, status: 400, error: `Legfeljebb ${REVIEW_LIMITS.ownerResponseMax} karakter.` };
  }

  // AI szöveg-moderáció (mint az egyéb felhasználói tartalomnál) — a tulaj se
  // tehessen közzé sértő/jogsértő választ.
  const mod = await moderateText(text);
  if (mod.action === "block") {
    return {
      ok: false,
      status: 400,
      error: mod.reason || "A válasz nem felel meg a közösségi irányelveknek.",
    };
  }

  const ok = await setReviewOwnerResponse(reviewId, businessId, text);
  return ok
    ? { ok: true, status: 200 }
    : { ok: false, status: 404, error: "A vélemény nem található, vagy nem a tiéd." };
}
