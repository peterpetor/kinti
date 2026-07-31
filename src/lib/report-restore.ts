/**
 * report-restore.ts — bejelentett tartalom VISSZAÁLLÍTÁSA (a rejtés feloldása).
 *
 * ⚠️ MIÉRT KÜLÖN MODUL: ugyanezt a tartalomtípus-elágazást KÉT hívó használja —
 * az e-mailes moderációs link (`/api/report/moderate/[token]?action=keep`) és az
 * admin-áttekintő TÖMEGES visszaállítása. Ha két helyen élne, egy új
 * tartalomtípus hozzáadásakor az egyik biztosan lemaradna, és a visszaállítás
 * NÉMÁN nem csinálna semmit.
 *
 * ⚠️ KONTEXTUS (2026-07-31 biztonsági átvizsgálás): egyetlen névtelen bejelentés
 * AZONNAL elrejti a tartalmat — ez szándékos DSA Art. 16 (notice-and-action)
 * megfelelés, és NEM gyengítettük. A kockázatot nem a szabály enyhítésével
 * kezeljük, hanem azzal, hogy a HELYREÁLLÍTÁS azonnali és tömeges legyen: egy
 * rosszhiszemű kampányból egy kattintással vissza lehessen állni.
 */
import {
  setReviewHidden,
  recomputeBusinessRating,
  setBusinessHidden,
  setB2bProjectStatus,
  setStoryPublicVisibility,
  setServiceRequestVisibility,
  setHousingListingVisibility,
} from "./repo";

export type ReportedContentType =
  | "business"
  | "review"
  | "sos"
  | "b2b"
  | "story"
  | "request"
  | "housing";

/**
 * Egy bejelentett tartalom újra láthatóvá tétele.
 * @returns true, ha ismert típus volt (tehát ténylegesen csináltunk valamit).
 */
export async function restoreReportedContent(
  contentType: string,
  contentId: string,
): Promise<boolean> {
  switch (contentType) {
    case "business":
      await setBusinessHidden(contentId, false);
      return true;
    case "review": {
      const businessId = await setReviewHidden(contentId, false);
      if (businessId) await recomputeBusinessRating(businessId);
      return true;
    }
    case "sos": {
      const { unresolveSosAlert } = await import("./sos-repo");
      await unresolveSosAlert(contentId);
      return true;
    }
    case "b2b":
      await setB2bProjectStatus(contentId, "open");
      return true;
    case "story":
      await setStoryPublicVisibility(contentId, true);
      return true;
    case "request":
      await setServiceRequestVisibility(contentId, true);
      return true;
    case "housing":
      await setHousingListingVisibility(contentId, true);
      return true;
    default:
      // ⚠️ Ismeretlen típus: NEM dobunk (egy régi sor ne akassza meg a tömeges
      // visszaállítást), de false-szal jelezzük, hogy a hívó számolhassa.
      return false;
  }
}
