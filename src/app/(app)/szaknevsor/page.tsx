import { ExploreView } from "@/components/views/explore-view";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { PushOptin } from "@/components/push-optin";
import { TelegramBotCard } from "@/components/telegram-bot-card";
import { SzaknevsorSeoLinks, type SeoLinkGroup } from "@/components/views/szaknevsor-seo-links";
import { SzaknevsorHeader } from "./SzaknevsorHeader";
import { getBusinessesForListSlice, getBusinessCountsByCountry, getTopCategoriesByCountry, getCategories } from "@/lib/repo";
import { cached } from "@/lib/edge-cache";

/** Ország → az ország-szintű SEO-céloldal terület-slugja (lib/seo-areas). */
const COUNTRY_SLUG: Record<string, string> = {
  CH: "svajc", AT: "ausztria", DE: "nemetorszag", NL: "hollandia",
};

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Szaknévsor",
  // Kanonikus URL: a listát ország-/kategória-paraméterekkel is hívjuk
  // (?canton=, ?cat=), és azok NEM külön oldalak a Google szemében.
  alternates: { canonical: "/szaknevsor" },
};

/** SSR-be kerülő rekordok száma ORSZÁGONKÉNT. A teljes (2000+) lista SSR-je worker
 *  CPU-limitbe ütközött (1102) és ~1,2 MB HTML-t adott. A kliens EGYSZERRE csak EGY
 *  ország szeletét mutatja, de a szerver nem tudja, melyiket (az ország-pref
 *  kliensoldali) → mind a 6 ország szeletét be kell ágyazni a HTML-be. 30/ország
 *  bőven fedi az első (passzív) képernyőt bármelyik országra; amint a user szűkít
 *  (kategória/kereső/régió) vagy térképre vált, az ExploreView AZONNAL betölti a
 *  teljes listát (a többinél idle-ben). A 60→30 csökkentés ~felére vágja a
 *  kezdeti HTML-payloadot és a szerver render-CPU-t. */
const SSR_PER_COUNTRY = 30;

export default async function SzaknevsorPage() {
  // Payload-diéta + izolátum-cache: karcsú vetület (getBusinessesForListSlice,
  // benne 3 perces cache — a kezdőlappal KÖZÖS kulcson), a kategória-tábla pedig
  // gyakorlatilag statikus seed → 10 percig nem kell újra D1-re menni.
  // ⚠️ ÉLES INCIDENS (Cloudflare Error 1102): korábban a TELJES, 2200+ tételes
  // lista jött be ide, hogy utána 30/ország szelet maradjon, plusz a
  // darabszámok és a SEO-kategóriák is a teljes bejárásból. A worker ettől
  // túllépte az erőforrás-korlátot, és a lap az esetek nagy részében 500/503-at
  // adott. Mostantól HÁROM olcsó lekérdezés: szelet + két aggregátum — a worker
  // legfeljebb ~180 sort lát.
  const [categories, businesses, countryTotals, topCats] = await Promise.all([
    cached("szaknevsor:categories", 600_000, () => getCategories()),
    getBusinessesForListSlice(SSR_PER_COUNTRY),
    getBusinessCountsByCountry(),
    getTopCategoriesByCountry(8),
  ]);
  const seoGroups: SeoLinkGroup[] = (["CH", "AT", "DE", "NL"] as const).map((c) => {
    const slug = COUNTRY_SLUG[c];
    // A kategória-sorrend MÁR az SQL-ből rendezve jön (COUNT DESC).
    const perCat = topCats[c];
    if (!slug || !perCat) return { country: c, links: [] };
    return {
      country: c,
      links: perCat
        .filter((x) => categories.some((k) => k.id === x.categoryId))
        .slice(0, 4)
        .map((x) => ({
          href: `/magyar/${x.categoryId}/${slug}`,
          label: categories.find((k) => k.id === x.categoryId)?.label ?? x.categoryId,
        })),
    };
  });

  return (
    <div className="pt-[calc(env(safe-area-inset-top)+2rem)]">
      <PullToRefresh>
        <div className="space-y-4">
          <div className="px-5">
            <SzaknevsorHeader />
          </div>
          <div className="px-5">
            <PushOptin
              title="Szólunk, ha új magyar vállalkozás kerül a régiódba"
              subtitle="Engedélyezd, és értesítünk, amint új magyar szakember vagy vállalkozás jelenik meg a környékeden."
            />
          </div>
          <ExploreView categories={categories} businesses={businesses} countryTotals={countryTotals} />
          {/* Telegram-bot promó — a Szaknévsor ott is él, ahol a csoportok:
              inline mód (@botnév + keresés) bármely chatben, hozzáadás nélkül. */}
          <div className="px-5">
            <TelegramBotCard />
          </div>
          {/* SEO belső-linkek: kattintható út a /magyar landing-fába — az
              aktív ország linkjeivel (kliens-oldali szűrés, hidratálás-biztos). */}
          <div className="px-5">
            <SzaknevsorSeoLinks groups={seoGroups} />
          </div>
        </div>
      </PullToRefresh>
    </div>
  );
}
