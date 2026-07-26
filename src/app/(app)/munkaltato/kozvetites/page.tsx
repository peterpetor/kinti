import { KozvetitesBody } from "./kozvetites-body";

// Statikus pitch-oldal (a PlacementInquiryForm kliensoldali; csak build-időben
// inline-olt NEXT_PUBLIC_ Turnstile-kulcsot olvas) → force-static, runtime NÉLKÜL:
// nem fogyaszt edge-route-ot (deploy-plafon-tartalék).
export const dynamic = "force-static";

export const metadata = {
  title: "Magyar munkaerő közvetítés — Ausztria, Németország, Hollandia",
  description:
    "Előszűrt, motivált magyar jelöltek Ausztriában, Németországban és Hollandiában — a Feedback Jobs közvetítésével. A jelöltnek ingyenes; a munkáltatónak sikerdíjas. Kérj ajánlatot kötelezettség nélkül.",
};

/**
 * /kozvetites — nyilvános B2B oldal: a Feedback Jobs munkaerő-közvetítés
 * szolgáltatás-pitch-e munkáltatóknak + megkeresés-űrlap. A Kinti a
 * jelölt-csatorna (layer3 opt-in pool), a bevétel a közvetítésből jön.
 * CH szándékosan kimarad (SECO-engedélyköteles).
 *
 * A marketing-szöveg DE/EN-re fordul (footer-linkelt oldal); az űrlap maga
 * (PlacementInquiryForm) magyar marad — a beérkező megkeresést a Feedback
 * Jobs csapata magyarul/németül dolgozza fel, ez "app"-szintű folyamat.
 */
export default function KozvetitesPage() {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
  return <KozvetitesBody turnstileSiteKey={turnstileSiteKey} />;
}
