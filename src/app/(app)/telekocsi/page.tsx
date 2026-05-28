import { auth } from "@clerk/nextjs/server";
import { ScreenHeader } from "@/components/ui";
import { getActiveRides, toPublicRide } from "@/lib/repo";
import { TelekocsiView } from "@/components/views/telekocsi-view";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Telekocsi — magyaroknak Svájcban",
  description: "Szabad helyes utazások kint élő magyarok között, Svájc ↔ Magyarország és azon belül.",
};

export default async function TelekocsiPage() {
  const [rides, { userId }] = await Promise.all([getActiveRides(), auth()]);
  // SECURITY: a manage_token sose mehet ki publikus HTML-be — a publikus oldal
  // csak a PublicRide nézetét látja, a tokenek a feladó localStorage-ban élnek.
  const publicRides = rides.map(toPublicRide);

  return (
    <div className="space-y-4 pb-8 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <div className="px-5">
        <ScreenHeader
          eyebrow="Telekocsi · Svájc ↔ Magyarország"
          title="Utazz együtt kintivel!"
        />
      </div>

      <TelekocsiView rides={publicRides} currentUserId={userId} />
    </div>
  );
}
