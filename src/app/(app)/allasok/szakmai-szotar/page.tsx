import Link from "next/link";
import { Icon } from "@/components/ui/icons";
import { KintiLogo } from "@/components/ui/kinti-logo";
import { auth } from "@clerk/nextjs/server";
import { isPro } from "@/lib/subscriptions";
import { CountryGuard } from "@/components/country-guard";
import { SzakmaiSzotarGrid } from "./grid";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Szakmai Gyors-Szótár | Kinti",
  description: "Szakmaspecifikus svájci-német, osztrák, német és holland kifejezések, hanganyaggal.",
};

export default async function SzakmaiSzotarPage() {
  const { userId } = await auth();
  const userIsPro = userId ? await isPro(userId) : false;

  return (
    <div className="mx-auto max-w-2xl px-5 pt-[calc(env(safe-area-inset-top)+2rem)] pb-24">
      <CountryGuard feature="szakmai-szotar" />
      <div className="mb-4 flex items-center justify-between">
        <KintiLogo size={34} />
        <Link
          href="/"
          aria-label="Vissza a Főoldalra"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
        </Link>
      </div>

      <SzakmaiSzotarGrid userIsPro={userIsPro} />

      <div className="mt-8 text-center">
        <Link
          href="/allasok"
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-ink-muted hover:text-ink transition underline"
        >
          ← Vissza az állásokhoz
        </Link>
      </div>
    </div>
  );
}
