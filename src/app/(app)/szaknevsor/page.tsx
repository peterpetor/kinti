import { ScreenHeader } from "@/components/ui";
import { ExploreView } from "@/components/views/explore-view";
import { getBusinesses, getCategories } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Szaknévsor" };

export default async function SzaknevsorPage() {
  const [categories, businesses] = await Promise.all([getCategories(), getBusinesses()]);

  return (
    <div className="space-y-4 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <div className="px-5">
        <ScreenHeader eyebrow="Szaknévsor · Svájc" title="Kereső" />
      </div>
      <ExploreView categories={categories} businesses={businesses} />
    </div>
  );
}
