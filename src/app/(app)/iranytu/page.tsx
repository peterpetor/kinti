import type { Metadata } from "next";
import Link from "next/link";
import BenchmarkClient from "./BenchmarkClient";
import { Icon, ScreenHeader } from "@/components/ui";
import { LegalDisclaimer } from "@/components/legal-disclaimer";

// Statikus oldal (kliens-shell / statikus adat) — nem fogyaszt edge-route-ot (deploy-plafon).
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Bér- és Lakbér Iránytű | Kinti",
  description: "Közösségi, anonim adatbázis a kint élő magyarok fizetéséről és lakbéréről (Svájc, Ausztria, Németország, Hollandia). Nézd meg, mennyit keresnek a régiódban!",
};

export default async function BenchmarkPage() {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
  return (
    <div className="space-y-4 pt-[calc(env(safe-area-inset-top)+2rem)] pb-12">
      <div className="px-5">
        <ScreenHeader
          eyebrow="Iránytű · Kint élő Magyaroknak"
          title={
            <>
              Anonim Bér- és<br />
              Lakbér Iránytű.
            </>
          }
        />
      </div>

      <div className="px-5 space-y-6 pt-2">
        <div className="space-y-4">
          <p className="text-[14px] text-ink-muted leading-relaxed">
            Anonim bér- és lakbér-statisztikák a lakóhelyed országában. Az induló szintek valós
            referencia-adatokon alapulnak, és a közösség anonim beküldéseivel folyamatosan
            pontosodnak — tudd meg, mennyit keresnek a szakmádban, és mennyit fizetnek egy hasonló lakásért!
          </p>
          <div className="inline-flex items-center space-x-2 bg-accent/5 text-ink-muted px-3 py-1.5 rounded-full text-xs font-medium border border-accent/20 text-left">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Referencia + közösségi adatok — nem hivatalos.</span>
          </div>
        </div>

        <BenchmarkClient turnstileSiteKey={turnstileSiteKey} />

        {/* Kereszt-tölcsér: aki a béreket böngészi, annak a következő kérdése
            „és ebből mennyi marad?" — az Iránytű a legforgalmasabb eszközünk,
            innen kötjük be a tervezőt. */}
        <Link
          href="/berkalkulator"
          className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 shadow-card transition active:scale-[0.99]"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-primary/10 text-lg">🧮</span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13.5px] font-extrabold leading-tight text-ink">
              És ebből mennyi marad?
            </span>
            <span className="block text-[11.5px] text-ink-muted">
              Bruttó bér + család + város → nettó, lakbér, megélhetés — egy kalkulátorban.
            </span>
          </span>
          <Icon name="chevR" size={15} strokeWidth={2.2} className="shrink-0 text-primary" />
        </Link>

        <LegalDisclaimer
          toolName="Bér- és Lakbér Iránytű"
          variant="legal"
          notAdviceFor="pénzügyi, munkajogi vagy adóügyi"
          extraWarning="A bér- és lakbér-adatok anonim közösségi beküldésekből és referencia-szintekből származó BECSLÉSEK — nem garantált piaci értékek, és nem helyettesítik a konkrét ajánlatot, szerződést vagy szakértői tanácsot."
        />
      </div>
    </div>
  );
}
