import type { Metadata } from "next";
import BenchmarkClient from "./BenchmarkClient";
import { ScreenHeader } from "@/components/ui";

export const runtime = "edge";
export const dynamic = "force-dynamic";

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
      </div>
    </div>
  );
}
