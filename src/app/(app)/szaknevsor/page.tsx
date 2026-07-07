import { ExploreView } from "@/components/views/explore-view";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { PushOptin } from "@/components/push-optin";
import { SzaknevsorHeader } from "./SzaknevsorHeader";
import { getBusinessesForList, getCategories } from "@/lib/repo";
import { cached } from "@/lib/edge-cache";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Szaknévsor" };

export default async function SzaknevsorPage() {
  // Payload-diéta + izolátum-cache: a lista karcsú vetület (getBusinessesForList,
  // benne 3 perces cache — a kezdőlappal KÖZÖS kulcson), a kategória-tábla pedig
  // gyakorlatilag statikus seed → 10 percig nem kell újra D1-re menni.
  const [categories, businesses] = await Promise.all([
    cached("szaknevsor:categories", 600_000, () => getCategories()),
    getBusinessesForList(),
  ]);

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
        </div>
      </PullToRefresh>
    </div>
  );
}
