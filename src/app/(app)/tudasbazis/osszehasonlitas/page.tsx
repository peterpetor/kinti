import Link from "next/link";
import { safeJsonLdStringify } from "@/lib/json-ld";
import type { Metadata } from "next";
import { Icon, ScreenHeader } from "@/components/ui";
import { CountryFlag } from "@/components/ui/country-flag";
import { COUNTRIES } from "@/lib/countries";
import { GUIDE_COMPARISONS } from "@/lib/guide-comparisons";
import { ComparisonTable } from "@/components/comparison-table";

// Tisztán statikus (lib/guide-comparisons.ts) — force-static, NEM fogyaszt
// edge-route-ot (deploy-plafon), mint a többi tudásbázis-oldal.
export const dynamic = "force-static";

const PATH = "/tudasbazis/osszehasonlitas";
const TITLE = "Svájc, Ausztria, Németország, Hollandia — összehasonlítás magyaroknak";
const DESCRIPTION =
  "Egészségbiztosítás, adózás, bér, lakásbérlés, nyugdíj, felmondás és további témák a 4 országban egymás mellett — hivatalos forrásból, magyaroknak. Melyik országban éri meg kint élni és dolgozni?";
const OG_IMAGE = "https://kinti.app/icons/og-default.png";

export const metadata: Metadata = {
  title: `${TITLE} — Kinti`,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    title: `${TITLE} — Kinti`,
    description: DESCRIPTION,
    url: PATH,
    type: "article",
    siteName: "Kinti",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Kinti — országok összehasonlítása" }],
  },
  twitter: { card: "summary_large_image", title: `${TITLE} — Kinti`, description: DESCRIPTION, images: [OG_IMAGE] },
};

export default function OsszehasonlitasPage() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tudásbázis", item: "https://kinti.app/tudasbazis" },
      { "@type": "ListItem", position: 2, name: "Országok összehasonlítása", item: `https://kinti.app${PATH}` },
    ],
  };

  return (
    <div className="space-y-5 px-5 pb-10 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(breadcrumbLd) }} />

      <ScreenHeader
        eyebrow="Összehasonlítás"
        title={
          <>
            Melyik ország?
            <br />
            A 4 ország egymás mellett.
          </>
        }
        back={
          <Link
            href="/tudasbazis"
            aria-label="Vissza a Tudásbázishoz"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95"
          >
            <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
          </Link>
        }
      />

      <p className="text-[13.5px] leading-relaxed text-ink-muted">
        Svájc, Ausztria, Németország vagy Hollandia? A legfontosabb hétköznapi témák — biztosítás, adó, bér,
        lakásbérlés, nyugdíj, felmondás — a 4 országban egymás mellett, hivatalos forrásból. Minden sor a
        részletes cikkek tömör kivonata; a táblázatok alól a teljes, országra szabott útmutatóra lépsz tovább.
      </p>

      {/* A 4 ország — a lap tézise egy pillantásra. */}
      <div className="grid grid-cols-4 gap-2 rounded-card border border-line bg-surface p-3 shadow-card">
        {COUNTRIES.map((c) => (
          <div key={c.code} className="flex flex-col items-center gap-1.5">
            <CountryFlag code={c.code} className="h-[22px] w-[32px]" />
            <span className="text-[10.5px] font-bold tracking-tight text-ink-muted">{c.name}</span>
          </div>
        ))}
      </div>

      {/* Ugró-navigáció a 11 táblázathoz (téma-ikonnal a wayfindinghez). */}
      <nav className="flex flex-wrap gap-1.5">
        {GUIDE_COMPARISONS.map((c) => (
          <a
            key={c.id}
            href={`#${c.id}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-[12px] font-bold text-ink transition active:scale-95"
          >
            <Icon name={c.icon} size={13} strokeWidth={2.4} className="text-primary" />
            {c.caption.split(" — ")[0]}
          </a>
        ))}
      </nav>

      <div className="space-y-7">
        {GUIDE_COMPARISONS.map((c) => (
          <div key={c.id} id={c.id} className="scroll-mt-24">
            <ComparisonTable comparison={c} currentCountry={null} showNote={false} />
          </div>
        ))}
      </div>

      <p className="px-1 text-[11px] leading-relaxed text-ink-faint">
        A számok tájékoztató nagyságrendek — a részletek kantononként/tartományonként és időben változnak. A pontos,
        rád vonatkozó információért mindig az adott ország cikkét és a hivatalos forrást nézd. Ez általános
        tájékoztatás, nem jogi tanács.
      </p>

      {/* Tovább-lépés: a teljes tudásbázis és a bér-összehasonlító. */}
      <div className="grid grid-cols-1 gap-2.5">
        <Link
          href="/tudasbazis"
          className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 shadow-card transition active:scale-[0.99]"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-primary/10 text-lg">📚</span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13.5px] font-extrabold tracking-[-0.01em] text-ink">Teljes tudásbázis</span>
            <span className="block text-[11.5px] leading-snug text-ink-muted">Minden téma országra szabva, lépésről lépésre.</span>
          </span>
          <Icon name="chevR" size={15} strokeWidth={2.2} className="shrink-0 text-ink-faint" />
        </Link>
        <Link
          href="/berkalkulator"
          className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 shadow-card transition active:scale-[0.99]"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-primary/10 text-lg">💶</span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13.5px] font-extrabold tracking-[-0.01em] text-ink">Nettó bér-kalkulátor</span>
            <span className="block text-[11.5px] leading-snug text-ink-muted">Mennyi marad a kézben országonként? Számold ki.</span>
          </span>
          <Icon name="chevR" size={15} strokeWidth={2.2} className="shrink-0 text-ink-faint" />
        </Link>
      </div>
    </div>
  );
}
