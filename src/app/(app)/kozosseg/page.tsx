import Link from "next/link";
import { Icon, ScreenHeader } from "@/components/ui";
import { CommunityView } from "@/components/views/community-view";
import { getBulletinKinds, getBulletinPosts, getEvents } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Közösség" };

export default async function KozossegPage() {
  const [events, kinds, posts] = await Promise.all([
    getEvents(),
    getBulletinKinds(),
    getBulletinPosts(),
  ]);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  return (
    <div className="space-y-4 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <div className="px-5">
        <ScreenHeader
          eyebrow="Közösség · Svájc"
          title={
            <>
              Kint vagy, de
              <br />
              nem vagy egyedül.
            </>
          }
        />
      </div>
      <CommunityView events={events} kinds={kinds} posts={posts} turnstileSiteKey={turnstileSiteKey} />
    </div>
  );
}
