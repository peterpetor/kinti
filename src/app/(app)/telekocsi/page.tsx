import { auth } from "@clerk/nextjs/server";
import { ScreenHeader } from "@/components/ui";
import { getActiveRides } from "@/lib/repo";
import { TelekocsiView } from "@/components/views/telekocsi-view";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Telekocsi — magyaroknak Svájcban",
  description: "Szabad helyes utazások kint élő magyarok között, Svájc ↔ Magyarország és azon belül.",
};

export default async function TelekocsiPage() {
  const [rides, { userId }] = await Promise.all([getActiveRides(), auth()]);

  return (
    <div className="space-y-4 pb-8 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <div className="px-5">
        <ScreenHeader
          eyebrow="Telekocsi · Svájc ↔ Magyarország"
          title="Utazz együtt kintivel!"
        />
      </div>

      <TelekocsiView rides={rides} currentUserId={userId} />
    </div>
  );
}
