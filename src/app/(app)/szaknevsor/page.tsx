import { ScreenHeader } from "@/components/ui";
import { ExploreView } from "@/components/views/explore-view";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { PushOptin } from "@/components/push-optin";
import { getBusinesses, getCategories } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Szaknévsor" };

export default async function SzaknevsorPage() {
  const [categories, businesses] = await Promise.all([getCategories(), getBusinesses()]);

  return (
    <div className="pt-[calc(env(safe-area-inset-top)+2rem)]">
      <PullToRefresh>
        <div className="space-y-4">
          <div className="px-5">
            <ScreenHeader eyebrow="Szaknévsor · Svájc" title="Kereső" />
          </div>
          <div className="px-5">
            <PushOptin
              title="Szólunk, ha új magyar vállalkozás kerül a kantonodba"
              subtitle="Engedélyezd, és értesítünk, amint új magyar szakember vagy vállalkozás jelenik meg a környékeden."
            />
          </div>
          <ExploreView categories={categories} businesses={businesses} />
        </div>
      </PullToRefresh>
    </div>
  );
}
