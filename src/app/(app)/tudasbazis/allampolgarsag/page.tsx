import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Icon, KintiLogo } from "@/components/ui";
import { PermitWizardClient } from "./PermitWizardClient";
import { CitizenshipQuizSection } from "./CitizenshipQuizSection";
import { CountryGuard } from "@/components/country-guard";
import { isPro } from "@/lib/subscriptions";

// Az Edge runtime marad, de a force-static kikerül, így megszűnik a build warning!
export const runtime = "edge";
export const dynamic = "force-dynamic";

// A funkció mind a 6 országban él (CH/AT/DE/NL kérdésbank) — a metadata statikus
// (minden országnak ugyanaz az URL), ezért ország-SEMLEGES, nem svájci copy.
export const metadata = {
  title: "Letelepedés és állampolgárság — engedély-varázsló",
  description:
    "Mikor kaphatsz letelepedési engedélyt vagy állampolgárságot az országodban? Számold ki a varázslóval, és teszteld a tudásod a kvízzel!",
  alternates: { canonical: "/tudasbazis/allampolgarsag" },
  // ⚠️ Megosztási előnézet: e nélkül a Facebookra/WhatsAppra illesztett link
  // az ÁLTALÁNOS oldalcímet mutatta, nem a cikkét.
  openGraph: {
    title: "Letelepedés és állampolgárság — engedély-varázsló",
    description: "Mikor kaphatsz letelepedési engedélyt vagy állampolgárságot az országodban? Számold ki a varázslóval, és teszteld a tudásod a kvízzel!",
    url: "https://kinti.app/tudasbazis/allampolgarsag",
    siteName: "Kinti",
    type: "article",
    locale: "hu_HU",
    images: [{ url: "/icons/og-default.png", width: 1200, height: 630, alt: "Kinti Tudásbázis" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Letelepedés és állampolgárság — engedély-varázsló",
    description: "Mikor kaphatsz letelepedési engedélyt vagy állampolgárságot az országodban? Számold ki a varázslóval, és teszteld a tudásod a kvízzel!",
    images: ["/icons/og-default.png"],
  },
};

export default async function AllampolgarsagPage() {
  const { userId } = await auth();
  const userIsPro = userId ? await isPro(userId) : false;
  return (
    <div className="mx-auto max-w-md space-y-8 px-5 pt-[calc(env(safe-area-inset-top)+2rem)] pb-12">
      <CountryGuard feature="allampolgarsag" />
      <header className="flex items-center gap-3">
        <KintiLogo size={28} />
        <span className="text-[16px] font-extrabold tracking-tight text-ink">
          Papírok & Állampolgárság
        </span>
        <Link
          href="/"
          aria-label="Vissza a Főoldalra"
          className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95 transition-transform"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
        </Link>
      </header>

      {/* Az új Idősávos Varázsló modul */}
      <PermitWizardClient />

      {/* Állampolgársági kvíz-szekció — ország-tudatos */}
      <CitizenshipQuizSection isPro={userIsPro} />
    </div>
  );
}
