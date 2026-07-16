import Link from "next/link";
import { Icon, ScreenHeader } from "@/components/ui";
import { GuideList } from "./GuideList";
import { CountryGuard } from "@/components/country-guard";

// Statikus oldal (kliens-shell / statikus adat) — nem fogyaszt edge-route-ot (deploy-plafon).
export const dynamic = "force-static";

export const metadata = {
  title: "Tudásbázis — útmutatók kint élő magyaroknak",
  description:
    "Hivatalos forrásból: bejelentkezés, egészségbiztosítás, adózás, iskola, munka, lakásbérlés — kint élő magyaroknak (Svájc, Ausztria, Németország, Hollandia).",
};

/**
 * Eszközök és kalauzok — a 2026-07-16-i konszolidációval a korábbi önálló
 * téma-oldalak (menüpontok) ide, a Tudásbázis alá költöztek. A menükben csak
 * a Tudásbázis szerepel; ez a szekció a belépő hozzájuk, témába rendezve.
 */
const TOOLS: { href: string; emoji: string; label: string; desc: string }[] = [
  { href: "/tudasbazis/kikoltozes", emoji: "✈️", label: "Kiköltözési teendőlista", desc: "Lépésről lépésre az indulásig — idővonallal" },
  { href: "/tudasbazis/vizum", emoji: "🪪", label: "Tartózkodás és engedélyek", desc: "Engedély-varázsló: mi kell, mikor, hova" },
  { href: "/tudasbazis/hivatalos", emoji: "🏛️", label: "Hivatalos linkek", desc: "Konzulátus, hivatalok — egy kattintásra" },
  { href: "/tudasbazis/iskolarendszer", emoji: "🎒", label: "Iskolarendszer", desc: "Óvodától az egyetemig, országonként" },
  { href: "/tudasbazis/allampolgarsag", emoji: "🏅", label: "Állampolgárság", desc: "Honosítási felkészítő és teszt" },
  { href: "/tudasbazis/bussen", emoji: "🚗", label: "Bírság-becslő", desc: "Gyorshajtás: mennyi büntetés jár?" },
  { href: "/tudasbazis/vam", emoji: "📦", label: "Vám-kalkulátor", desc: "Behozatal a svájci határon" },
];

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

      {/* Eszközök és kalauzok — a korábbi önálló menüpontok új otthona. */}
      <section className="space-y-2">
        <h2 className="px-1 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
          Eszközök és kalauzok
        </h2>
        <div className="grid gap-2">
          {TOOLS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 shadow-card transition active:scale-[0.99]"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-primary/10 text-lg">{t.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] font-extrabold tracking-[-0.01em] text-ink">{t.label}</span>
                <span className="block text-[11.5px] leading-snug text-ink-muted">{t.desc}</span>
              </span>
              <Icon name="chevR" size={15} strokeWidth={2.2} className="shrink-0 text-ink-faint" />
            </Link>
          ))}
        </div>
      </section>

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
