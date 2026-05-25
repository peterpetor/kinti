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

  return (
    <div className="space-y-4 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <div className="px-5">
        <ScreenHeader
          eyebrow="Közösség · Zürich"
          title={
            <>
              Kint vagy, de
              <br />
              nem vagy egyedül.
            </>
          }
          right={
            <Link
              href="/kozosseg/uj-hirdetes"
              aria-label="Új hirdetés feladása"
              className="grid h-[38px] w-[38px] place-items-center rounded-[12px] bg-primary text-white shadow-card transition active:scale-95"
            >
              <Icon name="plus" size={18} strokeWidth={2.6} />
            </Link>
          }
        />
      </div>
      <CommunityView events={events} kinds={kinds} posts={posts} />
    </div>
  );
}
