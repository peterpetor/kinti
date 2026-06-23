import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";
import { CustomsCalculator } from "@/components/views/customs-calculator";
import { LegalDisclaimer } from "@/components/legal-disclaimer";
import { CountryGuard } from "@/components/country-guard";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Vám-kalkulátor — Kinti",
  description:
    "Svájci vám-kalkulátor: hány embernek mennyi húst, alkoholt, dohányt szabad bevinni Svájcba az EU területéről.",
};

export default function VamPage() {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

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

      {/* Hero */}
      <section className="rounded-card border-2 border-primary/20 bg-primary-soft p-5 shadow-card">
        <div className="flex items-start gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-primary text-white text-2xl">
            🛂
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-[20px] font-extrabold tracking-tight text-ink">
              Vámmentes mennyiség BECSLÉSE
            </h1>
            <p className="mt-1 text-[12.5px] leading-snug text-ink-muted">
              Svájc nem EU-tag — vámmentes limit van. Tájékoztató kalkulátor.{" "}
              <strong className="text-ink">NEM hivatalos vámtanács.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Kalkulátor */}
      <section>
        <h2 className="mb-2 px-1 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
          💰 Vámmentes kalkulátor
        </h2>
        <CustomsCalculator />
      </section>

      {/* Jogi disclaimer */}
      <LegalDisclaimer
        toolName="vám-kalkulátor"
        variant="legal"
        notAdviceFor="vámjogi vagy adójogi"
        extraWarning="A vám-mentes limitek időnként változnak. A kalkulátor eredménye NEM hivatalos információ. Hivatalos átkeléshez és fizetéshez használd a QuickZoll alkalmazást."
        officialSources={[
          { label: "BAZG — Vámmentes mennyiség", url: "https://www.bazg.admin.ch/bazg/de/home/information-private/reisen-und-einkaufen--freimengen-und-mehrwertsteuer.html" },
          { label: "QuickZoll — Hivatalos app", url: "https://www.bazg.admin.ch/bazg/de/home/services/services-firmen/services-firmen-warenanmeldung/quickzoll.html" },
        ]}
      />
    </div>
  );
}
