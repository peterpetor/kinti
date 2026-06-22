import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Icon, KintiLogo } from "@/components/ui";
import { PermitWizardClient } from "./PermitWizardClient";
import { CitizenshipQuizSection } from "./CitizenshipQuizSection";
import { isPro } from "@/lib/subscriptions";

// Az Edge runtime marad, de a force-static kikerül, így megszűnik a build warning!
export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Engedély Varázsló & Kvíz | Kinti",
  description:
    "Mikor kaphatsz C-engedélyt vagy svájci útlevelet? Számold ki a varázslóval, és teszteld a tudásod a kvízzel!",
};

export default async function AllampolgarsagPage() {
  const { userId } = await auth();
  const userIsPro = userId ? await isPro(userId) : false;
  return (
    <div className="mx-auto max-w-md space-y-8 px-5 pt-[calc(env(safe-area-inset-top)+2rem)] pb-12">
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
