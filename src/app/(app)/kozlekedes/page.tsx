import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";
import { TransportGuide } from "@/components/views/transport-guide";

export const dynamic = "force-static";

export const metadata = {
  title: "Tömegközlekedési Kalauz — Svájc, Ausztria, Németország",
  description:
    "Zóna- és Verkehrsverbund-rendszerek egyszerűen: SBB/ZVV (CH), ÖBB/Wiener Linien (AT), DB/VBB/MVV (DE). Jegytípusok, mobilappok, GA/Klimaticket/Deutschlandticket kalkulátor.",
};

export default function KozlekedesPage() {
  return (
    <div className="mx-auto max-w-md space-y-5 px-5 pt-[calc(env(safe-area-inset-top)+2rem)] pb-12">
      <header className="flex items-center gap-3">
        <KintiLogo size={28} />
        <span className="text-[16px] font-extrabold tracking-tight text-ink truncate">
          Tömegközlekedés
        </span>
        <Link
          href="/"
          aria-label="Vissza a Főoldalra"
          className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95 transition-transform"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
        </Link>
      </header>

      <TransportGuide />
    </div>
  );
}
