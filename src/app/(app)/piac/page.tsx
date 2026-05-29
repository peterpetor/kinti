import { ScreenHeader } from "@/components/ui";
import { BulletinList } from "@/components/views/community-view";
import { getBulletinKinds, getBulletinPosts } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Piac - Apróhirdetések" };

export default async function PiacPage() {
  const [kinds, posts] = await Promise.all([
    getBulletinKinds(),
    getBulletinPosts(),
  ]);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  return (
    <div className="space-y-4 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <div className="px-5">
        <ScreenHeader
          eyebrow="Börze · Svájci Magyaroknak"
          title={
            <>
              Hirdetések a<br />
              Közösségből.
            </>
          }
        />
      </div>

      <div className="space-y-2.5 px-5">
        <BulletinList 
          posts={posts} 
          kinds={kinds} 
          turnstileSiteKey={turnstileSiteKey} 
        />
      </div>
    </div>
  );
}
