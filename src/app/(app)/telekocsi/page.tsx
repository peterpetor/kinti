import { auth } from "@clerk/nextjs/server";
import { ScreenHeader } from "@/components/ui";
import { getActiveRides, getRideCountsByPhone, getRideRatingsByPhone, toPublicRide } from "@/lib/repo";
import { TelekocsiView } from "@/components/views/telekocsi-view";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Telekocsi — magyaroknak Svájcban",
  description: "Szabad helyes utazások kint élő magyarok között, Svájc ↔ Magyarország és azon belül.",
};

export default async function TelekocsiPage({
  searchParams,
}: {
  searchParams: { rating?: string };
}) {
  const [rides, rideCounts, rideRatings, { userId }] = await Promise.all([
    getActiveRides(),
    getRideCountsByPhone(),
    getRideRatingsByPhone(),
    auth(),
  ]);
  // SECURITY: a manage_token sose mehet ki publikus HTML-be — a publikus oldal
  // csak a PublicRide nézetét látja, a tokenek a feladó localStorage-ban élnek.
  const publicRides = rides.map((r) => toPublicRide(r, rideCounts, rideRatings));

  return (
    <div className="space-y-4 pb-8 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <div className="px-5 space-y-4">
        <ScreenHeader
          eyebrow="Telekocsi · Svájc ↔ Magyarország"
          title="Utazz együtt kintivel!"
        />
        
        {searchParams.rating === "success" && (
          <div className="rounded-xl border border-success/30 bg-success/10 px-4 py-3">
            <div className="text-[13px] font-bold text-success flex items-center justify-center gap-1.5">
              Értékelés sikeresen mentve! 🎉
            </div>
            <div className="mt-1 text-[12px] text-success/80 text-center leading-snug">
              Köszönjük, hogy hozzájárulsz a közösség bizalmának építéséhez.
            </div>
          </div>
        )}
      </div>

      <TelekocsiView rides={publicRides} currentUserId={userId} />
    </div>
  );
}
