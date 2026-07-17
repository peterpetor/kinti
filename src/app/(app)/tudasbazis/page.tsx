import Link from "next/link";
import { Icon, ScreenHeader } from "@/components/ui";
import { GuideList } from "./GuideList";
import { ToolsList } from "./ToolsList";
import { CountryGuard } from "@/components/country-guard";

// Statikus oldal (kliens-shell / statikus adat) — nem fogyaszt edge-route-ot (deploy-plafon).
export const dynamic = "force-static";

export const metadata = {
  title: "Tudásbázis — útmutatók kint élő magyaroknak",
  description:
    "Hivatalos forrásból: bejelentkezés, egészségbiztosítás, adózás, iskola, munka, lakásbérlés — kint élő magyaroknak (Svájc, Ausztria, Németország, Hollandia).",
};

export default function TudasbazisPage() {
  return (
    <div className="space-y-4 px-5 pb-8 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <CountryGuard feature="tudasbazis" />
      <ScreenHeader
        eyebrow="Tudásbázis"
        title={
          <>
            Hasznos tudnivalók,
            <br />
            hivatalos forrásból.
          </>
        }
      />

      {/* Eszközök és kalauzok — a korábbi önálló menüpontok új otthona
          (ország-tudatos kliens-lista, ld. ToolsList). */}
      <ToolsList />

      {/* AEO GYIK-belépő: a leggyakoribb kérdés-témák válaszgép-barát oldalai. */}
      <Link
        href="/gyik"
        className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 shadow-card transition active:scale-[0.99]"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-primary/10 text-lg">❓</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13.5px] font-extrabold tracking-[-0.01em] text-ink">Gyakori kérdések</span>
          <span className="block text-[11.5px] leading-snug text-ink-muted">
            Lakásbérlés, szakember-keresés, hivatali ügyek — azonnali válaszokkal.
          </span>
        </span>
        <Icon name="chevR" size={15} strokeWidth={2.2} className="shrink-0 text-ink-faint" />
      </Link>

      <GuideList />

      {/* Cross-link: Ügyintézés Varázsló */}
      <Link
        href="/ugyintezes"
        className="flex items-center gap-3 rounded-card border-2 border-primary/30 bg-primary-soft/60 p-4 shadow-card transition active:scale-[0.99]"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-primary text-white text-xl">
          📋
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14.5px] font-extrabold tracking-[-0.01em] text-ink">
            Ügyintézés Varázsló — pipálható csekklisták
          </span>
          <span className="mt-0.5 block text-[11.5px] leading-snug text-ink-muted">
            Lépésről lépésre: bejelentkezés, jogosítvány-csere, adóbevallás, C-engedély…
          </span>
        </span>
        <Icon name="chevR" size={16} strokeWidth={2.2} className="shrink-0 text-primary" />
      </Link>

      <p className="px-1 text-[11px] leading-relaxed text-ink-faint">
        Ez általános tájékoztatás hivatalos forrásokból, nem jogi tanács. A részletek időben és régiónként változhatnak — a pontos, rád vonatkozó információért mindig a hivatalos oldalt nézd.
      </p>
    </div>
  );
}
