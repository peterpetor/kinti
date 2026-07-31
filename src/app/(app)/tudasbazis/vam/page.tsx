import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";
import { CountryGuard } from "@/components/country-guard";
import { VamBody } from "./vam-body";

// Statikus oldal (kliens-shell / statikus adat) — nem fogyaszt edge-route-ot (deploy-plafon).
export const dynamic = "force-static";

export const metadata = {
  title: "Vám-kalkulátor — mit vihetsz be Svájcba és Angliába",
  description:
    "Vám-kalkulátor: hány embernek mennyi húst, alkoholt, dohányt szabad bevinni az EU területéről Svájcba, illetve Angliába (Brexit utáni keretek).",
  alternates: { canonical: "/tudasbazis/vam" },
  // ⚠️ Megosztási előnézet: e nélkül a Facebookra/WhatsAppra illesztett link
  // az ÁLTALÁNOS oldalcímet mutatta, nem a cikkét.
  openGraph: {
    title: "Vám-kalkulátor — mit vihetsz be Svájcba és Angliába",
    description: "Vám-kalkulátor: hány embernek mennyi húst, alkoholt, dohányt szabad bevinni az EU területéről Svájcba, illetve Angliába (Brexit utáni keretek).",
    url: "https://kinti.app/tudasbazis/vam",
    siteName: "Kinti",
    type: "article",
    locale: "hu_HU",
    images: [{ url: "/icons/og-default.png", width: 1200, height: 630, alt: "Kinti Tudásbázis" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vám-kalkulátor — mit vihetsz be Svájcba és Angliába",
    description: "Vám-kalkulátor: hány embernek mennyi húst, alkoholt, dohányt szabad bevinni az EU területéről Svájcba, illetve Angliába (Brexit utáni keretek).",
    images: ["/icons/og-default.png"],
  },
};

export default function VamPage() {
  return (
    <div className="space-y-5 px-5 pb-12 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <CountryGuard feature="vam" />
      <header className="flex items-center gap-3">
        <KintiLogo size={28} />
        <span className="text-[16px] font-extrabold tracking-tight text-ink">
          Vám-kalkulátor
        </span>
        <Link
          href="/"
          aria-label="Vissza a Főoldalra"
          className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
        </Link>
      </header>

      <VamBody />
    </div>
  );
}
