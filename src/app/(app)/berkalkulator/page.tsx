import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";
import { SalaryCalculatorSwitch } from "@/components/views/salary-calculator-switch";
import { BudgetPlannerView } from "@/components/views/budget-planner-view";
import { LegalDisclaimer } from "@/components/legal-disclaimer";
import { CountryGuard } from "@/components/country-guard";
import { BUDGET_LANDINGS } from "@/lib/budget-landing";

// Statikus kliens-shell (0 edge-route): minden számítás a böngészőben fut, a
// költség-adatokat a cache-elt /api/koltsegvetes adja (lásd budget-planner-view).
export const dynamic = "force-static";

export const metadata = {
  title: "Bérkalkulátor — bruttóból nettó, és ami a hónap végén marad",
  description:
    "Számold ki a nettó fizetésed Svájcra, Ausztriára, Németországra vagy Hollandiára — és azonnal látod azt is, mennyi megy el lakbérre és megélhetésre, mennyi marad a hónap végén.",
  openGraph: {
    title: "Bérkalkulátor — mennyi marad a fizetésedből külföldön?",
    description:
      "Bruttó bér + család + város → nettó fizetés, várható lakbér és megélhetés, és ami a hónap végén MARAD.",
    images: [{ url: "/icons/og-mennyi-marad.png", width: 1200, height: 630, alt: "Bérkalkulátor — kinti.app" }],
  },
  twitter: { card: "summary_large_image", images: ["/icons/og-mennyi-marad.png"] },
};

/**
 * Bérkalkulátor — a korábbi /berkalkulator + /mennyi-marad ÖSSZEVONVA
 * (2026-07-16, user-döntés): a bruttó bérből EGY képernyőn jön a nettó ÉS a
 * „mennyi marad a hónap végén" bontás (lakbér, megélhetés, maradék) — a
 * BudgetPlannerView eleve integrálja a nettó-motorokat a költség-benchmarkkal.
 * A tételes levonás-bontás (AHV/SV/Lohnsteuer soronként) lenyithatóként maradt.
 */
export default function SalaryCalculatorPage() {
  return (
    <div className="mx-auto max-w-md space-y-5 px-5 pt-[calc(env(safe-area-inset-top)+2rem)] pb-12">
      <CountryGuard feature="berkalkulator" />
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

      <section className="animate-fade-up space-y-2">
        <h1 className="text-[24px] font-extrabold leading-tight tracking-tight text-ink text-balance">
          Bruttóból nettó — és ami a hónap végén marad
        </h1>
        <p className="text-[14px] leading-relaxed text-ink-muted">
          Add meg a bruttó béred, a családot és a várost — kiszámoljuk a{" "}
          <strong className="text-ink">nettót</strong>, a várható lakbért és megélhetést,
          és megmutatjuk, <strong className="text-ink">mennyi marad a hónap végén</strong>.
        </p>
      </section>

      <div className="animate-fade-up animate-delay-100">
        <BudgetPlannerView />
      </div>

      {/* Tételes levonás-bontás (a korábbi önálló bérkalkulátor) — lenyitható:
          aki a bruttó→nettó levonás-sorokra kíváncsi (AHV/SV/Lohnsteuer…),
          itt kapja a részletes, ország-specifikus kalkulátort. */}
      <details className="group rounded-card border border-line bg-surface p-4 shadow-card">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-[14px] font-bold text-ink [&::-webkit-details-marker]:hidden">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-primary/10 text-primary">
            <Icon name="sliders" size={15} strokeWidth={2.4} />
          </span>
          <span className="min-w-0 flex-1">
            Tételes levonás-bontás
            <span className="block text-[11.5px] font-medium text-ink-muted">
              AHV / SV / Lohnsteuer soronként — a részletes kalkulátor
            </span>
          </span>
          <Icon name="chevD" size={16} strokeWidth={2.4} className="shrink-0 text-ink-muted transition-transform group-open:rotate-180" />
        </summary>
        <div className="mt-4">
          <SalaryCalculatorSwitch />
        </div>
      </details>

      {/* Ország-céloldalak (SEO belső linkháló + gyors ország-ugrás). */}
      <section className="space-y-2">
        <h2 className="px-1 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
          Országonként, gyakori kérdésekkel
        </h2>
        <div className="flex flex-wrap gap-2">
          {BUDGET_LANDINGS.map((o) => (
            <Link
              key={o.slug}
              href={`/berkalkulator/${o.slug}`}
              className="rounded-pill border border-line bg-surface px-3.5 py-2 text-[13px] font-bold text-ink transition active:scale-95"
            >
              {o.flag} {o.name}
            </Link>
          ))}
        </div>
      </section>

      <LegalDisclaimer
        toolName="Bérkalkulátor és költségvetés-tervező"
        variant="info"
        notAdviceFor="adóügyi, pénzügyi vagy munkajogi"
        extraWarning="A nettó bér 2025/2026-os adó- és járulék-paraméterekkel készült EGYSZERŰSÍTETT becslés (a tényleges levonás munkáltatónként/községenként eltérhet); a költségek és a gyerek-juttatások közösségi beküldésekből és referencia-szintekből származó BECSLÉSEK. A tényleges béredről mindig a munkaszerződés és a bérjegyzék dönt."
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
