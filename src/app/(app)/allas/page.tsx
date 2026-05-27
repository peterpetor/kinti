import { BorzeView } from "@/components/views/borze-view";
import { getBulletinPosts } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Állás-börze — magyaroknak Svájcban",
  description:
    "Állásajánlatok és munkalehetőségek kint élő magyaroknak Svájcban, kantononként szűrve.",
};

export default async function AllasPage() {
  const all = await getBulletinPosts();
  const posts = all.filter((p) => p.kindId === "allas");
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  return (
    <BorzeView
      posts={posts}
      title="Állás-börze"
      subtitle="Állásajánlatok és alkalmi munka — kint élő magyaroknak, kantononként."
      icon="trending"
      showPriceSort={false}
      turnstileSiteKey={turnstileSiteKey}
      newAdHref="/kozosseg/uj-hirdetes"
    />
  );
}
