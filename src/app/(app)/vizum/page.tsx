import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";
import { PermitWizard } from "@/components/views/permit-wizard";

export const runtime = "edge";
export const dynamic = "force-static";

export const metadata = {
  title: "Melyik engedély kell? — L/B/C/G vízum-varázsló",
  description:
    "Interaktív kérdés-sor, ami megmondja, melyik svájci tartózkodási engedély-típus (L, B, C, G) releváns a helyzetedre.",
};

export default function VizumPage() {
  return (
    <div className="mx-auto max-w-md space-y-5 px-5 pt-[calc(env(safe-area-inset-top)+2rem)] pb-12">
      <header className="flex items-center gap-3">
        <Link
          href="/"
          aria-label="Vissza a Főoldalra"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
        </Link>
        <KintiLogo size={28} />
        <span className="text-[16px] font-extrabold tracking-tight text-ink">
          Engedély-varázsló
        </span>
      </header>

      <PermitWizard />
    </div>
  );
}
