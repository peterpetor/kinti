import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Icon } from "@/components/ui";
import { ScreenHeader } from "@/components/ui/headers";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { getHousingListings } from "@/lib/repo";
import { isPro } from "@/lib/subscriptions";
import { PiacterTabs, type PiacterTab } from "./piacter-tabs";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Piactér — albérlet-börze, lakbér-kalkulátor és saját hirdetéseid",
  description:
    "Kiadó szobák és albérletek a kinti magyar közösségtől, lakásbérlés rejtett-költség kalkulátor, és a saját hirdetéseid kezelése — egy helyen.",
};

/**
 * Piactér — a „keres-kínál" funkciók KÖZÖS oldala (2026-07-16 összevonás,
 * user-döntés): Börze (a korábbi /szallas-borze), Lakbér-kalkulátor (a korábbi
 * /lakberles) és Sajátjaim (a korábbi /sajatjaim) egy füles felületen. A régi
 * útvonalak permanent redirecttel ide érkeznek (?tab=…). A börze-adat + PRO-
 * státusz szerveren számolódik (a kontakt-kapuőr változatlan).
 */
/** A ?tab= validálása ITT (szerver-oldalon) — a piacter-tabs "use client"
 *  modul függvényei client reference-ként nem hívhatók szerver-komponensből. */
function parseTab(v: string | undefined): PiacterTab {
  return v === "kalkulator" || v === "sajatjaim" ? v : "borze";
}

export default function PiacterPage({ searchParams }: { searchParams: { tab?: string } }) {
  return <PiacterContent tab={parseTab(searchParams.tab)} />;
}

async function PiacterContent({ tab }: { tab: PiacterTab }) {
  const { userId } = await auth();
  const [listings, pro] = await Promise.all([
    getHousingListings(null, userId),
    isPro(userId),
  ]);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  return (
    <PullToRefresh>
      <div className="mx-auto max-w-md space-y-4 px-4 pb-12 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
        <ScreenHeader
          eyebrow="Piactér"
          title="Albérlet és hirdetések"
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

        <PiacterTabs
          initialTab={tab}
          listings={listings}
          isPro={pro}
          signedIn={!!userId}
          turnstileSiteKey={turnstileSiteKey}
        />
      </div>
    </PullToRefresh>
  );
}
