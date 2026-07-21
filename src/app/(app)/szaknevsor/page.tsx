import { ExploreView } from "@/components/views/explore-view";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { PushOptin } from "@/components/push-optin";
import { TelegramBotCard } from "@/components/telegram-bot-card";
import { SzaknevsorSeoLinks, type SeoLinkGroup } from "@/components/views/szaknevsor-seo-links";
import { SzaknevsorHeader } from "./SzaknevsorHeader";
import { getBusinessesForList, getCategories } from "@/lib/repo";
import { cached } from "@/lib/edge-cache";

/** Ország → az ország-szintű SEO-céloldal terület-slugja (lib/seo-areas). */
const COUNTRY_SLUG: Record<string, string> = {
  CH: "svajc", AT: "ausztria", DE: "nemetorszag", NL: "hollandia",
};

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Szaknévsor" };

/** SSR-be kerülő rekordok száma ORSZÁGONKÉNT. A teljes (2000+) lista SSR-je worker
 *  CPU-limitbe ütközött (1102) és ~1,2 MB HTML-t adott. A kliens EGYSZERRE csak EGY
 *  ország szeletét mutatja, de a szerver nem tudja, melyiket (az ország-pref
 *  kliensoldali) → mind a 4 ország szeletét be kell ágyazni a HTML-be. 30/ország
 *  bőven fedi az első (passzív) képernyőt bármelyik országra; amint a user szűkít
 *  (kategória/kereső/régió) vagy térképre vált, az ExploreView AZONNAL betölti a
 *  teljes listát (a többinél idle-ben). A 60→30 csökkentés ~felére vágja a
 *  kezdeti HTML-payloadot és a szerver render-CPU-t. */
const SSR_PER_COUNTRY = 30;

export default async function SzaknevsorPage() {
  // Payload-diéta + izolátum-cache: a lista karcsú vetület (getBusinessesForList,
  // benne 3 perces cache — a kezdőlappal KÖZÖS kulcson), a kategória-tábla pedig
  // gyakorlatilag statikus seed → 10 percig nem kell újra D1-re menni.
  const [categories, allBusinesses] = await Promise.all([
    cached("szaknevsor:categories", 600_000, () => getCategories()),
    getBusinessesForList(),
  ]);

  // Országonkénti szelet (a lista featured→rating rendezett): mindegyik ország
  // induló nézete kap tartalmat — a kliens-oldali ország-szűrő egyiken sem
  // talál üres listát, amíg a teljes adat betölt.
  const perCountry = new Map<string, number>();
  const businesses = allBusinesses.filter((b) => {
    const c = b.country ?? "CH";
    const n = (perCountry.get(c) ?? 0) + 1;
    perCountry.set(c, n);
    return n <= SSR_PER_COUNTRY;
  });

  // SEO belső-link blokk adatai: országonként a 4 legnépesebb kategória
  // ország-szintű céloldala (/magyar/[kat]/[ország]) — a TELJES listából
  // számolva. A megjelenítés kliens-oldalon az AKTÍV ország linkjeire szűr
  // (SzaknevsorSeoLinks — user-visszajelzés: a 4 ország keveréke zavaró volt);
  // a /magyar hub a teljes index.
  const countryCatCount = new Map<string, Map<string, number>>();
  for (const b of allBusinesses) {
    const c = b.country ?? "CH";
    const perCat = countryCatCount.get(c) ?? new Map<string, number>();
    perCat.set(b.categoryId, (perCat.get(b.categoryId) ?? 0) + 1);
    countryCatCount.set(c, perCat);
  }
  const seoGroups: SeoLinkGroup[] = (["CH", "AT", "DE", "NL"] as const).map((c) => {
    const slug = COUNTRY_SLUG[c];
    const perCat = countryCatCount.get(c);
    if (!slug || !perCat) return { country: c, links: [] };
    return {
      country: c,
      links: [...perCat.entries()]
        .filter(([catId]) => categories.some((k) => k.id === catId))
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([catId]) => ({
          href: `/magyar/${catId}/${slug}`,
          label: categories.find((k) => k.id === catId)?.label ?? catId,
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
          <ExploreView categories={categories} businesses={businesses} />
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
