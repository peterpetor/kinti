import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";
import { FlightFinder } from "@/components/views/flight-finder";
import { CountryGuard } from "@/components/country-guard";

export const dynamic = "force-static";

export const metadata = {
  title: "Repülőjegy-figyelő — hazautazás Budapestre",
  description:
    "Mikor érdemes hazautazni? Becsült ár-sávok és szezonális naptár Svájcból (ZRH/BSL/GVA), Ausztriából (VIE) és Németországból (BER/MUC/FRA) Budapestre, foglalási linkek (Skyscanner, Google Flights, Kiwi) + vonat/busz tippek.",
};

export default function RepulojegyPage() {
  return (
    <div className="mx-auto max-w-md space-y-5 px-5 pt-[calc(env(safe-area-inset-top)+2rem)] pb-12">
      <CountryGuard feature="repulojegy" />
      <header className="flex items-center gap-3">
        <KintiLogo size={28} />
        <span className="text-[16px] font-extrabold tracking-tight text-ink">
          Repülőjegy-figyelő
        </span>
        <Link
          href="/"
          aria-label="Vissza a Főoldalra"
          className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
        </Link>
      </header>

      <FlightFinder />
    </div>
  );
}
