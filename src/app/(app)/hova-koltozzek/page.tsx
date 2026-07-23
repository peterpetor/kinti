import type { Metadata } from "next";
import Link from "next/link";
import { Icon, ScreenHeader } from "@/components/ui";
import { MegelhetoView } from "@/components/views/megelheto-view";
import { LegalDisclaimer } from "@/components/legal-disclaimer";

// Statikus shell (a MegelhetoView kliensoldali, az adat a /api/megelheto-ról jön,
// ami maga is cache-elt) — force-static, runtime NÉLKÜL: nem fogyaszt edge-route-ot.
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Hova költözzek? — megélhetési térkép | Kinti",
  description:
    "Melyik régióban marad a legtöbb a hónap végén? Nettó bér − lakbér − megélhetés régiónként, térképen — Svájc, Ausztria, Németország, Hollandia.",
};

export default function HovaKoltozzekPage() {
  return (
    <div className="space-y-4 pt-[calc(env(safe-area-inset-top)+2rem)] pb-12">
      <div className="px-5">
        <ScreenHeader
          eyebrow="Megélhetés"
          title="Hova költözzek?"
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
        <MegelhetoView />

        <LegalDisclaimer
          toolName="megélhetési térkép"
          variant="info"
          notAdviceFor="pénzügyi vagy adótanácsadási"
          extraWarning="A „mennyi marad” becslés: a nettó bér a bérkalkulátor motorjából, a lakbér a régiós közösségi medián (rent_benchmarks), a megélhetés országos referencia. A tényleges összeg a konkrét lakástól, adóhelyzettől és élethelyzettől függ — nagyobb döntés előtt ellenőrizd hivatalos forrásból."
        />
      </div>
    </div>
  );
}
