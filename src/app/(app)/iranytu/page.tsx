import type { Metadata } from "next";
import BenchmarkClient from "./BenchmarkClient";
import { ScreenHeader } from "@/components/ui";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Svájci Bér- és Lakbér Iránytű | Kinti",
  description: "Közösségi, anonim adatbázis a svájci magyarok fizetéséről és lakbéréről. Nézd meg, mennyit keresnek a te kantonodban!",
};

export default function BenchmarkPage() {
  return (
    <div className="space-y-4 pt-[calc(env(safe-area-inset-top)+2rem)] pb-12">
      <div className="px-5">
        <ScreenHeader
          eyebrow="Iránytű · Svájci Magyaroknak"
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
            Közösség által feltöltött, 100%-ban anonim statisztikák. Tudd meg, mennyit keresnek a szakmádban Svájcban, és mennyit fizetnek egy hasonló lakásért! 
          </p>
          <div className="inline-flex items-center space-x-2 bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-3 py-1.5 rounded-full text-xs font-medium border border-amber-200 dark:border-amber-800 text-left">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Közösségi, nem hivatalos adatok.</span>
          </div>
        </div>

        <BenchmarkClient />
      </div>
    </div>
  );
}
