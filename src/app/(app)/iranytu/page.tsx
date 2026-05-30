import type { Metadata } from "next";
import BenchmarkClient from "./BenchmarkClient";

export const metadata: Metadata = {
  title: "Svájci Bér- és Lakbér Iránytű | Kinti",
  description: "Közösségi, anonim adatbázis a svájci magyarok fizetéséről és lakbéréről. Nézd meg, mennyit keresnek a te kantonodban!",
};

export default function BenchmarkPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="text-center space-y-4 mb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Anonim Bér- és Lakbér <span className="text-brand-600 dark:text-brand-400">Iránytű</span>
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Közösség által feltöltött, 100%-ban anonim statisztikák. Tudd meg, mennyit keresnek a szakmádban Svájcban, és mennyit fizetnek egy hasonló lakásért! 
          </p>
          <div className="inline-flex items-center space-x-2 bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-4 py-2 rounded-full text-sm font-medium border border-amber-200 dark:border-amber-800">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Közösségi adatok, nem hivatalos pénzügyi tanácsadás.</span>
          </div>
        </header>

        <BenchmarkClient />
      </div>
    </div>
  );
}
