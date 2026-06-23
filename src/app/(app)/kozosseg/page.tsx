import { ScreenHeader } from "@/components/ui";
import { CommunityView } from "@/components/views/community-view";
import { PushOptin } from "@/components/push-optin";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { getEvents, ensureFreshEvents, kickoffEventFeedSync } from "@/lib/repo";
import { getCloudflareCtx } from "@/lib/cloudflare";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Közösség" };

export default async function KozossegPage() {
  // Megbízható, render-úton await-elt tartalom-frissítés (generált megemlékezések +
  // CHW Bécs, ha elavult). A waitUntil Pages-en nem futott le megbízhatóan, ezért a
  // kulcs-tartalmat inline biztosítjuk; az iCal feedek maradnak a háttér-szinkronban.
  await ensureFreshEvents();
  getCloudflareCtx()?.waitUntil(kickoffEventFeedSync());

  const events = await getEvents();

  return (
    <div className="pt-[calc(env(safe-area-inset-top)+2rem)]">
      <PullToRefresh>
        <div className="space-y-4">
          <div className="px-5">
            <ScreenHeader
              eyebrow="Közösség · külföldön élő magyaroknak"
              title={
                <>
                  Események és meetupok
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

          <CommunityView events={events} />
        </div>
      </PullToRefresh>
    </div>
  );
}
