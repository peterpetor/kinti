import { ExploreView } from "@/components/views/explore-view";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { PushOptin } from "@/components/push-optin";
import { TelegramBotCard } from "@/components/telegram-bot-card";
import { SzaknevsorHeader } from "./SzaknevsorHeader";
import { getBusinessesForList, getCategories } from "@/lib/repo";
import { cached } from "@/lib/edge-cache";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Szaknévsor" };

/** SSR-be kerülő rekordok száma ORSZÁGONKÉNT. A teljes (1000+) lista SSR-je
 *  worker CPU-limitbe ütközött (1102) és ~1,2 MB HTML-t adott — az első
 *  képernyőhöz országonként ennyi bőven elég, a többit az ExploreView tölti be
 *  aszinkron a /api/businesses/list-ből. */
const SSR_PER_COUNTRY = 60;

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
        </div>
      </PullToRefresh>
    </div>
  );
}
