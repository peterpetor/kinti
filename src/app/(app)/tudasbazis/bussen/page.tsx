import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";
import { SpeedingCalculator } from "@/components/views/speeding-calculator";
import { CountryGuard } from "@/components/country-guard";

export const dynamic = "force-static";

export const metadata = {
  title: "Gyorshajtás-bírság kalkulátor — Svájc, Ausztria, Németország, Hollandia",
  description:
    "Gyorshajtás-bírság becslő: Svájc (Ordnungsbusse + jövedelem-arányos Tagessatz), Ausztria (Organmandat + Führerscheinentzug), Németország (Bußgeldkatalog + Punkte + Fahrverbot), Hollandia (WAHV-boete + CJIB, rijbewijs ingevorderd). Csak becslés!",
};

export default function BussenPage() {
  return (
    <div className="mx-auto max-w-md space-y-5 px-5 pt-[calc(env(safe-area-inset-top)+2rem)] pb-12">
      <CountryGuard feature="bussen" />
      <header className="flex items-center gap-3">
        <KintiLogo size={28} />
        <span className="text-[16px] font-extrabold tracking-tight text-ink">
          Gyorshajtás kalkulátor
        </span>
        <Link
          href="/"
          aria-label="Vissza a Főoldalra"
          className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
        </Link>
      </header>

      <SpeedingCalculator />
    </div>
  );
}
