import type { Metadata } from "next";
import BenchmarkClient from "./BenchmarkClient";
import { KintiLogo, DropdownMenu } from "@/components/ui";

export const metadata: Metadata = {
  title: "Svájci Bér- és Lakbér Iránytű | Kinti",
  description: "Közösségi, anonim adatbázis a svájci magyarok fizetéséről és lakbéréről. Nézd meg, mennyit keresnek a te kantonodban!",
};

export default function BenchmarkPage() {
  return (
    <div className="space-y-6 px-5 pb-4 pt-[calc(env(safe-area-inset-top)+2rem)]">
      
      {/* Szabványos Kinti Fejléc (kereső nélkül) */}
      <header className="flex items-center gap-2.5">
        <div className="flex items-center gap-2">
          <KintiLogo size={28} />
          <span className="text-[22px] font-extrabold tracking-tight text-ink">kinti</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/switzerland-flag.png"
            alt="Svájc"
            className="h-[36px] w-[36px] rounded-[6px] object-contain select-none"
          />
        </div>
        <div className="flex-1" />
        <DropdownMenu />
      </header>

      <div className="space-y-6">
        <header className="text-center space-y-4 mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-ink">
            Anonim Bér- és Lakbér <span className="text-primary">Iránytű</span>
          </h1>
          <p className="text-sm text-ink-muted max-w-2xl mx-auto">
            Közösség által feltöltött, 100%-ban anonim statisztikák. Tudd meg, mennyit keresnek a szakmádban Svájcban, és mennyit fizetnek egy hasonló lakásért! 
          </p>
          <div className="inline-flex items-center space-x-2 bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-3 py-1.5 rounded-full text-xs font-medium border border-amber-200 dark:border-amber-800 text-left">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Közösségi, nem hivatalos adatok.</span>
          </div>
        </header>

        <BenchmarkClient />
      </div>
    </div>
  );
}
