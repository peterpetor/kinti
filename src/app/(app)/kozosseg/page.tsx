import { auth } from "@clerk/nextjs/server";
import { ScreenHeader } from "@/components/ui";
import { CommunityView } from "@/components/views/community-view";
import { PushOptin } from "@/components/push-optin";
import {
  getActiveRides,
  getBulletinKinds,
  getBulletinPosts,
  getEvents,
} from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Piac" };

export default async function PiacPage() {
  const [events, kinds, posts, rides, { userId }] = await Promise.all([
    getEvents(),
    getBulletinKinds(),
    getBulletinPosts(),
    getActiveRides(),
    auth(),
  ]);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  return (
    <div className="space-y-4 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <div className="px-5">
        <ScreenHeader
          eyebrow="Piac · Svájcban élő magyaroknak"
          title={
            <>
              Hirdetések, események,
              <br />
              telekocsi — egy helyen.
            </>
          }
        />
      </div>

      {/* Push-értesítés feliratkozás (új esemény a kantonodban) */}
      <div className="px-5">
        <PushOptin />
      </div>

      <CommunityView
        events={events}
        kinds={kinds}
        posts={posts}
        rides={rides}
        currentUserId={userId}
        turnstileSiteKey={turnstileSiteKey}
      />
    </div>
  );
}
