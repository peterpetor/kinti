import Link from "next/link";
import { Icon } from "@/components/ui";
import type { BudgetCountry } from "@/lib/budget-plan";

const SLUG_BY_CC: Record<BudgetCountry, string> = {
  DE: "nemetorszag",
  AT: "ausztria",
  CH: "svajc",
  NL: "hollandia",
};

/**
 * BudgetToolCta — karcsú, egysoros belső CTA a „Mennyi marad?" tervezőre a
 * pénz-témájú tudásbázis-cikkeken (kontextus: aki bérről/megélhetésről olvas,
 * annak a következő kérdése „és mennyi marad?"). Ország-tudatos: a cikk
 * országának céloldalára visz (belső linkháló az SEO-oldalakhoz). Szándékosan
 * visszafogottabb, mint az affiliate-kártya — nem versenyez vele.
 */
export function BudgetToolCta({ country }: { country: BudgetCountry }) {
  return (
    <Link
      href={`/berkalkulator/${SLUG_BY_CC[country]}`}
      className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 shadow-card transition active:scale-[0.99]"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-primary/10 text-lg">🧮</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13.5px] font-extrabold leading-tight text-ink">
          Mennyi marad a fizetésedből?
        </span>
        <span className="block text-[11.5px] text-ink-muted">
          Nettó bér + lakbér + megélhetés — egy kalkulátorban.
        </span>
      </span>
      <Icon name="chevR" size={15} strokeWidth={2.2} className="shrink-0 text-primary" />
    </Link>
  );
}
