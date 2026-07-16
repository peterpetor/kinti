import Link from "next/link";
import { ExploreView } from "@/components/views/explore-view";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { PushOptin } from "@/components/push-optin";
import { TelegramBotCard } from "@/components/telegram-bot-card";
import { Icon } from "@/components/ui";
import { SzaknevsorHeader } from "./SzaknevsorHeader";
import { getBusinessesForList, getCategories } from "@/lib/repo";
import { cached } from "@/lib/edge-cache";
import { COUNTRY_NAMES } from "@/lib/seo-areas";

/** Ország → az ország-szintű SEO-céloldal terület-slugja (lib/seo-areas). */
const COUNTRY_SLUG: Record<string, string> = {
  CH: "svajc", AT: "ausztria", DE: "nemetorszag", NL: "hollandia",
};

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

  // SEO belső-link blokk: országonként a 3 legnépesebb kategória ország-szintű
  // céloldala (/magyar/[kat]/[ország]) — a TELJES listából számolva, SSR-ben
  // (a crawler kattintható utat kap a landing-fába; eddig azok árva-közeliek
  // voltak). A /magyar hub a teljes index.
  const countryCatCount = new Map<string, Map<string, number>>();
  for (const b of allBusinesses) {
    const c = b.country ?? "CH";
    const perCat = countryCatCount.get(c) ?? new Map<string, number>();
    perCat.set(b.categoryId, (perCat.get(b.categoryId) ?? 0) + 1);
    countryCatCount.set(c, perCat);
  }
  const seoLinks = (["CH", "AT", "DE", "NL"] as const).flatMap((c) => {
    const slug = COUNTRY_SLUG[c];
    const perCat = countryCatCount.get(c);
    if (!slug || !perCat) return [];
    return [...perCat.entries()]
      .filter(([catId]) => categories.some((k) => k.id === catId))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([catId]) => ({
        href: `/magyar/${catId}/${slug}`,
        label: `${categories.find((k) => k.id === catId)?.label} — ${COUNTRY_NAMES[c] ?? c}`,
      }));
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
          {/* SEO belső-linkek: kattintható út a /magyar landing-fába. */}
          {seoLinks.length > 0 && (
            <section className="px-5">
              <h2 className="mb-2 text-[12px] font-bold uppercase tracking-wide text-ink-muted">
                Magyar szakemberek régiónként
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {seoLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="inline-flex items-center rounded-pill border border-line bg-surface px-2.5 py-1 text-[12px] font-bold text-ink-muted transition hover:border-primary/40 hover:text-primary"
                  >
                    {l.label}
                  </Link>
                ))}
                <Link
                  href="/magyar"
                  className="inline-flex items-center gap-1 rounded-pill border border-primary/40 bg-primary/10 px-2.5 py-1 text-[12px] font-extrabold text-primary transition active:scale-[0.98]"
                >
                  Minden régió és szakma
                  <Icon name="chevR" size={12} strokeWidth={2.6} />
                </Link>
              </div>
            </section>
          )}
        </div>
      </PullToRefresh>
    </div>
  );
}
