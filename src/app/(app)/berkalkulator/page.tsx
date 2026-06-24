import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";
import { SalaryCalculatorSwitch } from "@/components/views/salary-calculator-switch";


export const metadata = {
  title: "Bérkalkulátor (Nettó-Bruttó) — Svájc, Ausztria, Németország",
  description: "Számold ki a nettó fizetésed! Svájc: Quellensteuer/AHV/BVG kantononként. Ausztria: SV + Lohnsteuer + 13./14. havi. Németország: SV + Lohnsteuer (§32a) Steuerklasse szerint + Soli/Kirchensteuer.",
};

export default function SalaryCalculatorPage() {
  return (
    <div className="mx-auto max-w-md space-y-5 px-5 pt-[calc(env(safe-area-inset-top)+2rem)] pb-12">
      <header className="flex items-center gap-3">
        <KintiLogo size={28} />
        <span className="text-[16px] font-extrabold tracking-tight text-ink truncate">
          Bérkalkulátor
        </span>
        <Link
          href="/"
          aria-label="Vissza a Főoldalra"
          className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95 transition-transform"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
        </Link>
      </header>

      <SalaryCalculatorSwitch />
    </div>
  );
}
