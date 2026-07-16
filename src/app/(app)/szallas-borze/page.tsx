import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Icon } from "@/components/ui";
import { ScreenHeader } from "@/components/ui/headers";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { getHousingListings } from "@/lib/repo";
import { isPro } from "@/lib/subscriptions";
import { HOUSING_DISCLAIMER } from "@/lib/housing";
import { HousingFeed } from "./housing-feed";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Szoba- és albérlet-börze — kiadó szobák magyaroktól | Kinti",
  description:
    "Kiadó szobák, albérletek és lakást keresők hirdetései a kinti magyar közösségtől — Svájc, Ausztria, Németország, Hollandia.",
};

/**
 * „Szoba- és albérlet-börze" — felhasználók közötti (UGC) lakhatási hirdetőtábla.
 * A Kinti CSAK hirdetőfelület (safe harbor, ld. HOUSING_DISCLAIMER); a hirdető
 * elérhetőségét kizárólag a PRO-gated /api/housing/contact adja ki — a lista-
 * payload kontaktot SOSEM tartalmaz. A PRO-státuszt itt, a szerveren számítjuk.
 */
export default async function SzallasBorzePage() {
  const { userId } = await auth();
  const [listings, pro] = await Promise.all([
    getHousingListings(null, userId),
    isPro(userId),
  ]);

  return (
    <PullToRefresh>
      <div className="mx-auto max-w-md space-y-4 px-4 pb-12 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
        <ScreenHeader
          eyebrow="Börze"
          title="Szoba- és albérlet-börze"
          back={
            <Link
              href="/"
              aria-label="Vissza a Főoldalra"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95"
            >
              <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
            </Link>
          }
        />

        <p className="text-[13px] leading-snug text-ink-muted">
          Kiadó szobák és albérletek a kinti magyar közösségtől — vagy add fel, mit keresel.
          A hirdetők közvetlenül egymással egyeznek meg.
        </p>

        {/* Jogi tájékoztató (safe harbor) — halvány, de mindig látható. */}
        <div className="rounded-card border border-line bg-surface-alt/60 p-3">
          <p className="text-[11px] leading-relaxed text-ink-faint">{HOUSING_DISCLAIMER}</p>
        </div>

        <HousingFeed listings={listings} isPro={pro} signedIn={!!userId} />
      </div>
    </PullToRefresh>
  );
}
