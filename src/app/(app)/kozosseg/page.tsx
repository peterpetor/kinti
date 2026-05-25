import { Icon, IconButton, ScreenHeader } from "@/components/ui";
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
            <IconButton variant="primary" aria-label="Új bejegyzés">
              <Icon name="plus" size={18} strokeWidth={2.6} />
            </IconButton>
          }
        />
      </div>
      <CommunityView events={events} kinds={kinds} posts={posts} />
    </div>
  );
}
