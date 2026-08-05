import Link from "next/link";
import type { Metadata } from "next";
import { safeJsonLdStringify } from "@/lib/json-ld";
import { Icon, ScreenHeader } from "@/components/ui";
import { HovaKoltozzekMatrix } from "@/components/views/hova-koltozzek-matrix";
import { ORSZAG_TENYEK } from "@/lib/hova-koltozzek";

// Kliens-shell: a számítás a böngészőben fut, az adat a cache-elt
// /api/koltsegvetes-ből jön → force-static, NEM fogyaszt edge-route-ot
// (~205-ös deploy-plafon, lásd deploy-edge-route-ceiling).
export const dynamic = "force-static";

const PATH = "/hova-koltozzek";
const TITLE = "Hová költözzek? — Svájc, Ausztria, Németország, Hollandia, Anglia, Spanyolország";
const DESCRIPTION =
  "Interaktív döntési mátrix magyaroknak: mennyi marad a hónap végén, mekkora az albérlet, hány év az állampolgárság és megtarthatod-e a magyart. Állítsd be, mi fontos neked.";
const OG_IMAGE = "https://kinti.app/icons/og-default.png";

export const metadata: Metadata = {
  title: `${TITLE} — Kinti`,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    title: `${TITLE} — Kinti`,
    description: DESCRIPTION,
    url: PATH,
    type: "website",
    siteName: "Kinti",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Kinti — hová költözzek?" }],
  },
  twitter: { card: "summary_large_image", title: `${TITLE} — Kinti`, description: DESCRIPTION, images: [OG_IMAGE] },
};

/**
 * /hova-koltozzek — döntési mátrix.
 *
 * Szándékosan MÁS, mint a /tudasbazis/osszehasonlitas: az témánkénti,
 * szöveges referencia-táblázat (olvasásra), ez pedig személyre szabott,
 * számszerű rangsor (döntésre). A kettő egymásra hivatkozik, hogy ne
 * versenyezzenek ugyanarra a keresésre.
 */
export default function HovaKoltozzekPage() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Melyik országban tarthatom meg a magyar állampolgárságomat?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "A saját útmutatóink szerint Németországban (a 2024-es reform óta) és Svájcban a kettős állampolgárság engedélyezett, " +
            "Ausztriában, Hollandiában és Spanyolországban viszont fő szabályként le kell mondani a korábbi állampolgárságról. " +
            "Honosítás előtt mindig kérj személyre szabott jogi tanácsot.",
        },
      },
      {
        "@type": "Question",
        name: "Hány év után igényelhető az állampolgárság?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            `Németország ${ORSZAG_TENYEK.DE.allampolgarsagEv} év, Hollandia ${ORSZAG_TENYEK.NL.allampolgarsagEv} év, ` +
            `Ausztria ${ORSZAG_TENYEK.AT.allampolgarsagEv} év, Svájc ${ORSZAG_TENYEK.CH.allampolgarsagEv} év, ` +
            `Spanyolország ${ORSZAG_TENYEK.ES.allampolgarsagEv} év jogszerű tartózkodás után. ` +
            "Angliára Brexit óta más szabályok vonatkoznak.",
        },
      },
    ],
  };

  return (
    <div className="mx-auto max-w-md space-y-5 px-5 pt-[calc(env(safe-area-inset-top)+2rem)] pb-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(faqLd) }} />

      <ScreenHeader title="Hová költözzek?" />

      <section className="animate-fade-up space-y-2">
        <h1 className="text-[24px] font-extrabold leading-tight tracking-tight text-ink text-balance">
          Hat ország, egy döntés
        </h1>
        <p className="text-[14px] leading-relaxed text-ink-muted">
          Állítsd be, mi fontos neked, és milyen jól keresel — összerakjuk, hol{" "}
          <strong className="text-ink">marad több a hónap végén</strong>, hol jutsz hamarabb
          állampolgársághoz, és hol <strong className="text-ink">tarthatod meg a magyart</strong>.
        </p>
      </section>

      <div className="animate-fade-up animate-delay-100">
        <HovaKoltozzekMatrix />
      </div>

      <div className="grid gap-2.5">
        <Link
          href="/tudasbazis/osszehasonlitas"
          className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 shadow-card transition active:scale-[0.99]"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-primary/10 text-primary-ink">
            <Icon name="list" size={16} strokeWidth={2.4} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13.5px] font-extrabold tracking-[-0.01em] text-ink">
              Témánkénti összehasonlítás
            </span>
            <span className="block text-[11.5px] text-ink-muted">
              Egészségbiztosítás, adózás, nyugdíj, felmondás — 11 táblázat.
            </span>
          </span>
          <Icon name="chevR" size={16} strokeWidth={2.4} className="shrink-0 text-ink-faint" />
        </Link>

        <Link
          href="/berkalkulator"
          className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 shadow-card transition active:scale-[0.99]"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-primary/10 text-primary-ink">
            <Icon name="sliders" size={16} strokeWidth={2.4} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13.5px] font-extrabold tracking-[-0.01em] text-ink">
              Számold ki a SAJÁT béreddel
            </span>
            <span className="block text-[11.5px] text-ink-muted">
              Bruttóból nettó, család, régió — és mennyi marad.
            </span>
          </span>
          <Icon name="chevR" size={16} strokeWidth={2.4} className="shrink-0 text-ink-faint" />
        </Link>
      </div>
    </div>
  );
}
