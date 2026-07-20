import Link from "next/link";
import { Icon, ScreenHeader } from "@/components/ui";
import { GuideList } from "./GuideList";
import { ToolsList } from "./ToolsList";
import { CountryGuard } from "@/components/country-guard";
import { getGuides } from "@/lib/guides";
import { foldSearchText } from "@/lib/sql-fold";
import type { GuideSearchItem } from "@/components/guide-search";

/**
 * A könnyű lista+kereső index SZERVEREN (build-időben, force-static) épül fel
 * mind a 4 országra — a teljes `guides.ts` modul (81 cikk, teljes szakasz-
 * szöveg, forrás-linkek, exportált segédfüggvények) így SOSE kerül a kliens-
 * JS-bundle-be: a GuideList csak ezt a lapos {slug,title,summary,icon,hay}
 * tömböt kapja propként. Korábban a "use client" GuideList importálta
 * közvetlenül a guides.ts-t → az /tudasbazis oldal saját JS-e ~51 kB volt.
 */
function buildIndex(country: string): GuideSearchItem[] {
  return getGuides(country).map((g) => ({
    slug: g.slug,
    title: g.title,
    summary: g.summary,
    icon: g.icon,
    hay: foldSearchText(
      [
        g.title,
        g.summary,
        ...(g.tldr ?? []),
        ...g.sections.flatMap((s) => [s.heading, s.body?.join(" ") ?? "", s.bullets?.join(" ") ?? ""]),
      ].join(" "),
    ),
  }));
}

const INDEX_BY_COUNTRY: Record<"CH" | "AT" | "DE" | "NL", GuideSearchItem[]> = {
  CH: buildIndex("CH"),
  AT: buildIndex("AT"),
  DE: buildIndex("DE"),
  NL: buildIndex("NL"),
};

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

      {/* Országos összehasonlító hub — a „melyik ország?" döntéshez a 4 ország
          egymás mellett (CH/AT/DE/NL), az összes cikk-adatból. */}
      <Link
        href="/tudasbazis/osszehasonlitas"
        className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 shadow-card transition active:scale-[0.99]"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-primary/10 text-lg">⚖️</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13.5px] font-extrabold tracking-[-0.01em] text-ink">Országok összehasonlítása</span>
          <span className="block text-[11.5px] leading-snug text-ink-muted">
            Svájc, Ausztria, Németország, Hollandia egymás mellett — biztosítás, adó, bér, lakhatás.
          </span>
        </span>
        <Icon name="chevR" size={15} strokeWidth={2.2} className="shrink-0 text-ink-faint" />
      </Link>

      <GuideList indexByCountry={INDEX_BY_COUNTRY} />

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
