import Link from "next/link";
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

  // CSAK jövőbeli események: a forward-looking esemény-feed ne a rég lejárt
  // programokat mutassa a lista elején (event_date ASC).
  const events = await getEvents({ upcoming: true });

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

          {/* Esemény beküldése — a /esemenyek térkép-nézet beküldő modalját nyitja meg
              (admin-jóváhagyás után jelenik meg). */}
          <div className="px-5">
            <Link
              href="/esemenyek?submit=1"
              className="flex items-center justify-center gap-2 rounded-pill bg-primary py-3.5 text-[14.5px] font-black text-white shadow-card transition active:scale-[0.98]"
            >
              <span aria-hidden className="text-[17px] leading-none">+</span> Esemény beküldése
            </Link>
            <p className="mt-1.5 text-center text-[11px] text-ink-faint">Koncert, találkozó, közösségi program — jóváhagyás után felkerül a térképre és ide is.</p>
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
