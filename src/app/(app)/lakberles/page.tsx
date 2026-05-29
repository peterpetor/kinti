import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";
import { RentCostCalculator } from "@/components/views/rent-cost-calculator";

export const runtime = "edge";
export const dynamic = "force-static";

export const metadata = {
  title: "Lakásbérlés rejtett-költség kalkulátor — Kaúció + Nebenkosten",
  description:
    "Mietkaution blokkolása + Nebenkosten év végi elszámolásának becslése Svájcban. Tájékoztató kalkulátor — NEM jogi tanács.",
};

export default function LakberlesPage() {
  return (
    <div className="mx-auto max-w-md space-y-5 px-5 pt-[calc(env(safe-area-inset-top)+2rem)] pb-12">
      <header className="flex items-center gap-3">
        <Link
          href="/"
          aria-label="Vissza a Főoldalra"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95 transition-transform"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
        </Link>
        <KintiLogo size={28} />
        <span className="text-[16px] font-extrabold tracking-tight text-ink truncate">
          Bérlés rejtett-költség
        </span>
      </header>

      <RentCostCalculator />
    </div>
  );
}
