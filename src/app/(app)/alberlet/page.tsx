import { BorzeView } from "@/components/views/borze-view";
import { getBulletinPosts } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Albérlet-börze — magyaroknak Svájcban",
  description:
    "Kiadó lakások, szobák és lakótárs-keresés kint élő magyaroknak Svájcban, kantononként szűrve.",
};

const HOUSING_KINDS = new Set(["alberlet", "lakotars"]);

export default async function AlberletPage() {
  const all = await getBulletinPosts();
  const posts = all.filter((p) => HOUSING_KINDS.has(p.kindId));
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  return (
    <BorzeView
      posts={posts}
      title="Albérlet-börze"
      subtitle="Kiadó lakások, szobák és lakótárs — kint élő magyaroknak, kantononként."
      icon="home"
      showPriceSort
      turnstileSiteKey={turnstileSiteKey}
      newAdHref="/kozosseg/uj-hirdetes"
    />
  );
}
