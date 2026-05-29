import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";
import { CustomsCalculator } from "@/components/views/customs-calculator";
import { BorderReports } from "@/components/views/border-reports";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Vám- és Határinfó — Kinti",
  description:
    "Svájci vám-kalkulátor: hány embernek mennyi húst, alkoholt, dohányt szabad bevinni. Közösségi határátkelő-jelentések (Thayngen, St. Margrethen, Basel).",
};

export default function VamPage() {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  return (
    <div className="space-y-5 px-5 pb-12 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <header className="flex items-center gap-3">
        <Link
          href="/"
          aria-label="Vissza a Főoldalra"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
        </Link>
        <KintiLogo size={28} />
        <span className="text-[16px] font-extrabold tracking-tight text-ink">
          Vám- és Határinfó
        </span>
      </header>

      {/* Hero */}
      <section className="rounded-card border-2 border-primary/20 bg-primary-soft p-5 shadow-card">
        <div className="flex items-start gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-primary text-white text-2xl">
            🛂
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-[20px] font-extrabold tracking-tight text-ink">
              Vámmentes? Vagy büntetés?
            </h1>
            <p className="mt-1 text-[12.5px] leading-snug text-ink-muted">
              Svájc nem EU-tag — vámmentes limit van. Csúszkás kalkulátor + közösségi határ-figyelő.
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

      {/* Border reports */}
      <section className="border-t-2 border-dashed border-line pt-6">
        <BorderReports turnstileSiteKey={turnstileSiteKey} />
      </section>

      {/* Disclaimer */}
      <div className="rounded-card border border-line bg-surface-alt/60 px-4 py-3 text-[11px] leading-relaxed text-ink-muted">
        <strong className="text-ink">Tájékoztató jellegű.</strong> A vám-limitek és vámrátok időnként
        változnak. A pontos, mindig aktuális adatokért nézd meg a{" "}
        <a
          href="https://www.bazg.admin.ch/bazg/de/home/information-private/reisen-und-einkaufen--freimengen-und-mehrwertsteuer.html"
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-bold text-primary"
        >
          BAZG hivatalos oldalát
        </a>
        . A közösségi határ-jelentések a felhasználók beadványai, NEM hivatalos — saját felelősségre.
      </div>
    </div>
  );
}
