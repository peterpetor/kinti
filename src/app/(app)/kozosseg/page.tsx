import { ScreenHeader } from "@/components/ui";
import { CommunityView } from "@/components/views/community-view";
import { PushOptin } from "@/components/push-optin";
import { getBulletinKinds, getBulletinPosts, getEvents } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Piac" };

export default async function PiacPage() {
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
          eyebrow="Piac · Svájcban élő magyaroknak"
          title={
            <>
              Hirdetések és események
              <br />
              egy helyen.
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
        turnstileSiteKey={turnstileSiteKey}
      />
    </div>
  );
}
