import type { Metadata } from "next";
import Link from "next/link";
import { Icon, ScreenHeader } from "@/components/ui";
import { HunPopulationBoard } from "@/components/views/hun-population-board";
import { LegalDisclaimer } from "@/components/legal-disclaimer";

// Statikus oldal (kliens-shell, az adat a /api/hun-population-ról jön, ami
// maga is napi cache-elt) — nem fogyaszt edge-route-ot (deploy-plafon).
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Merre élnek a legtöbb magyarok? | Kinti",
  description:
    "Hivatalos statisztikai hivatalok (BFS, Statistik Austria, CBS) nyilvános adatai alapján — hol él a legtöbb magyar Svájcban, Ausztriában, Németországban és Hollandiában.",
};

export default function HunPopulationPage() {
  return (
    <div className="space-y-4 pt-[calc(env(safe-area-inset-top)+2rem)] pb-12">
      <div className="px-5">
        <ScreenHeader
          eyebrow="Közösség"
          title="Merre élnek a legtöbb magyarok?"
          back={
            <Link
              href="/"
              aria-label="Vissza a főoldalra"
              className="grid h-[38px] w-[38px] place-items-center rounded-[12px] border border-line bg-surface text-ink shadow-card transition-all active:scale-95"
            >
              <Icon name="arrowLeft" size={18} strokeWidth={2.4} />
            </Link>
          }
        />
      </div>

      <div className="space-y-5 px-5">
        <p className="text-[13px] leading-relaxed text-ink-muted">
          NEM az appban mért, saját adat — hanem a négy ország hivatalos statisztikai hivatalának
          (BFS, Statistik Austria, CBS) nyilvános, régiónkénti népességszáma. Válts országot a menüben,
          hogy lásd, hol a legerősebb a magyar közösség.
        </p>

        <HunPopulationBoard />

        <LegalDisclaimer
          toolName="Merre élnek a legtöbb magyarok"
          variant="info"
          notAdviceFor="statisztikai"
          extraWarning="A számok a hivatkozott statisztikai hivatal legutóbbi közzétett adatai — az aktuális állapot ettől eltérhet, és a kis településeknél a hivatal adatvédelmi okból nem közöl pontos (5 fő alatti) számot."
        />
      </div>
    </div>
  );
}
