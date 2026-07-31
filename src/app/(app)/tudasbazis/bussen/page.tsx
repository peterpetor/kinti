import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";
import { SpeedingCalculator } from "@/components/views/speeding-calculator";
import { CountryGuard } from "@/components/country-guard";

export const dynamic = "force-static";

export const metadata = {
  title: "Gyorshajtás-bírság kalkulátor — Svájc, Ausztria, Németország, Hollandia",
  description:
    "Gyorshajtás-bírság becslő: Svájc (Ordnungsbusse + jövedelem-arányos Tagessatz), Ausztria (Organmandat + Führerscheinentzug), Németország (Bußgeldkatalog + Punkte + Fahrverbot), Hollandia (WAHV-boete + CJIB, rijbewijs ingevorderd). Csak becslés!",
  alternates: { canonical: "/tudasbazis/bussen" },
  // ⚠️ Megosztási előnézet: e nélkül a Facebookra/WhatsAppra illesztett link
  // az ÁLTALÁNOS oldalcímet mutatta, nem a cikkét.
  openGraph: {
    title: "Gyorshajtás-bírság kalkulátor — Svájc, Ausztria, Németország, Hollandia",
    description: "Gyorshajtás-bírság becslő: Svájc (Ordnungsbusse + jövedelem-arányos Tagessatz), Ausztria (Organmandat + Führerscheinentzug), Németország (Bußgeldkatalog + Punkte + Fahrverbot), Hollandia (WAHV-boete + CJIB, rijbewijs ingevorderd). Csak becslés!",
    url: "https://kinti.app/tudasbazis/bussen",
    siteName: "Kinti",
    type: "article",
    locale: "hu_HU",
    images: [{ url: "/icons/og-default.png", width: 1200, height: 630, alt: "Kinti Tudásbázis" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gyorshajtás-bírság kalkulátor — Svájc, Ausztria, Németország, Hollandia",
    description: "Gyorshajtás-bírság becslő: Svájc (Ordnungsbusse + jövedelem-arányos Tagessatz), Ausztria (Organmandat + Führerscheinentzug), Németország (Bußgeldkatalog + Punkte + Fahrverbot), Hollandia (WAHV-boete + CJIB, rijbewijs ingevorderd). Csak becslés!",
    images: ["/icons/og-default.png"],
  },
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
