import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";
import { SalaryOffersView } from "@/components/views/salary-offers-view";

export const runtime = "edge";
export const dynamic = "force-static";

export const metadata = {
  title: "Ajánlataim — Bérkalkulátor összehasonlítás",
  description:
    "A különböző svájci munkaajánlataid nettó-bérének és levonásainak összehasonlítása egy táblázatban.",
};

export default function AjanlataimPage() {
  return (
    <div className="mx-auto max-w-md space-y-5 px-5 pt-[calc(env(safe-area-inset-top)+2rem)] pb-12">
      <header className="flex items-center gap-3">
        <KintiLogo size={28} />
        <span className="text-[16px] font-extrabold tracking-tight text-ink truncate">
          Ajánlataim
        </span>
        <Link
          href="/berkalkulator"
          aria-label="Vissza a Bérkalkulátorhoz"
          className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95 transition-transform"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
        </Link>
      </header>

      <SalaryOffersView />
    </div>
  );
}
