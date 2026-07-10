import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";
import { BudgetPlannerView } from "@/components/views/budget-planner-view";
import { LegalDisclaimer } from "@/components/legal-disclaimer";

// Statikus kliens-shell (0 edge-route): minden számítás a böngészőben fut, a
// költség-adatokat a cache-elt /api/koltsegvetes adja (lásd budget-planner-view).
export const dynamic = "force-static";

export const metadata = {
  title: "Mennyi marad a fizetésedből? — Kiköltözési költségvetés-tervező",
  description:
    "X euró bruttóból meg lehet élni kint 2 gyerekkel? Bruttó bér + család + város → nettó fizetés, lakbér, megélhetés és ami a hónap végén MARAD. Svájc, Ausztria, Németország, Hollandia.",
  openGraph: {
    title: "Mennyi marad a fizetésedből külföldön?",
    description:
      "Bruttó bér + család + város → ennyi marad a hónap végén. Számold ki Svájcra, Ausztriára, Németországra vagy Hollandiára!",
  },
};

export default function BudgetPlannerPage() {
  return (
    <div className="mx-auto max-w-md space-y-5 px-5 pt-[calc(env(safe-area-inset-top)+2rem)] pb-12">
      <header className="flex items-center gap-3">
        <KintiLogo size={28} />
        <span className="truncate text-[16px] font-extrabold tracking-tight text-ink">
          Mennyi marad?
        </span>
        <Link
          href="/"
          aria-label="Vissza a Főoldalra"
          className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink transition-transform active:scale-95"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
        </Link>
      </header>

      <section className="animate-fade-up space-y-2">
        <h1 className="text-[24px] font-extrabold leading-tight tracking-tight text-ink text-balance">
          „X bruttóból meg lehet élni kint?"
        </h1>
        <p className="text-[14px] leading-relaxed text-ink-muted">
          Add meg az ajánlatot, a családot és a várost — mi kiszámoljuk a nettót, a
          várható lakbért és megélhetést, és megmutatjuk, <strong className="text-ink">mennyi
          marad a hónap végén</strong>.
        </p>
      </section>

      <div className="animate-fade-up animate-delay-100">
        <BudgetPlannerView />
      </div>

      <LegalDisclaimer
        toolName="Kiköltözési költségvetés-tervező"
        variant="info"
        notAdviceFor="adóügyi, pénzügyi vagy munkajogi"
        extraWarning="A nettó bér 2025-ös adó- és járulék-paraméterekkel készült EGYSZERŰSÍTETT becslés (a tényleges levonás munkáltatónként/községenként eltérhet); a költségek közösségi beküldésekből és referencia-szintekből származó BECSLÉSEK. A tényleges béredről mindig a munkaszerződés és a bérjegyzék dönt."
        officialSources={[
          { label: "Lohnsteuer (DE) — BMF", url: "https://www.bmf-steuerrechner.de" },
          { label: "Brutto-Netto (AT) — BMF", url: "https://onlinerechner.haude.at/bmf/brutto-netto-rechner.html" },
          { label: "Quellensteuer (CH) — ESTV", url: "https://www.estv.admin.ch" },
          { label: "Loonheffing (NL) — Belastingdienst", url: "https://www.belastingdienst.nl" },
        ]}
      />
    </div>
  );
}
