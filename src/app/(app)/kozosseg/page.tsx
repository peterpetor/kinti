import { ScreenHeader } from "@/components/ui";
import { CommunityView } from "@/components/views/community-view";
import { PushOptin } from "@/components/push-optin";
import {
  getEvents,
  getActiveSpontaneous,
} from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Közösség" };

export default async function KozossegPage() {
  const [events, spontaneous] = await Promise.all([
    getEvents(),
    getActiveSpontaneous(),
  ]);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  return (
    <div className="space-y-4 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <div className="px-5">
        <ScreenHeader
          eyebrow="Közösség · Svájcban élő magyaroknak"
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

      <CommunityView
        events={events}
        spontaneous={spontaneous}
        turnstileSiteKey={turnstileSiteKey}
      />
    </div>
  );
}
