import Link from "next/link";
import { KintiLogo } from "@/components/ui";

export const runtime = "edge";
export const dynamic = "force-static";

export const metadata = {
  title: "kinti — Die Plattform für Ungarn in der Schweiz",
  description:
    "kinti.app ist eine Community-Plattform für in der Schweiz lebende Ungarn — Fachleute, Veranstaltungen, Kleinanzeigen und Mitfahrgelegenheiten.",
  alternates: { canonical: "https://kinti.app/de" },
  openGraph: {
    title: "kinti — Die Plattform für Ungarn in der Schweiz",
    description:
      "Community-Plattform für in der Schweiz lebende Ungarn — Fachleute, Veranstaltungen, Kleinanzeigen, Mitfahrgelegenheiten.",
    locale: "de_DE",
  },
};

/**
 * /de — deutschsprachige Landing Page für kinti.app.
 *
 * Hauptzweck: SEO + Verständlichkeit für deutsche Geschäftspartner. Die App
 * selbst bleibt auf Ungarisch (Zielgruppe sind in der Schweiz lebende Ungarn),
 * aber wer das Wort "kinti" googelt und kein Ungarisch spricht, soll
 * verstehen, was die Plattform ist.
 */
export default function DePage() {
  return (
    <div className="mx-auto max-w-2xl px-5 pb-16 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      {/* Sprachumschalter */}
      <div className="flex items-center justify-between gap-3 mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-ink" aria-label="Startseite">
          <KintiLogo size={24} />
          <span className="text-[16px] font-extrabold tracking-tight">kinti</span>
        </Link>
        <div className="flex gap-1 rounded-pill border border-line bg-surface p-1 shadow-card text-[11px] font-bold">
          <Link href="/" className="rounded-pill px-2.5 py-1 text-ink-muted hover:bg-surface-alt">
            🇭🇺 HU
          </Link>
          <span className="rounded-pill bg-primary text-white px-2.5 py-1">🇩🇪 DE</span>
        </div>
      </div>

      {/* Hero */}
      <section className="space-y-4 mb-10">
        <p className="text-[11px] font-bold uppercase tracking-wider text-accent">
          Community-Plattform
        </p>
        <h1 className="text-[32px] font-extrabold leading-tight tracking-tight text-ink text-balance">
          kinti — die Plattform für Ungarn in der Schweiz
        </h1>
        <p className="text-[15px] leading-relaxed text-ink-muted">
          Eine ehrenamtlich betriebene Community-Plattform für die rund{" "}
          <strong className="text-ink">28.000 Ungarn</strong>, die in der Schweiz leben — mit
          ungarischsprachigen Fachleuten, lokalen Veranstaltungen, einem
          Kleinanzeigenmarkt und Mitfahrgelegenheiten.
        </p>
        <p className="text-[13.5px] leading-relaxed text-ink-muted">
          Die App-Oberfläche ist auf Ungarisch (die Zielgruppe). Diese Seite ist für
          deutschsprachige Geschäftspartner, Behörden oder Interessierte gedacht, die
          verstehen möchten, was kinti.app eigentlich ist.
        </p>
      </section>

      {/* Was Kinti ist */}
      <section className="space-y-3 mb-10">
        <h2 className="text-[20px] font-extrabold tracking-tight text-ink">
          Was bietet kinti?
        </h2>
        <div className="grid gap-3">
          <Feature
            emoji="🔎"
            title="Branchenbuch (Szaknévsor)"
            text="Ungarischsprachige Ärzte, Anwälte, Handwerker, Friseure und Berater in allen 26 Kantonen — auf Karte und Liste, kantonweise filterbar."
          />
          <Feature
            emoji="📅"
            title="Veranstaltungen (Események)"
            text="Lokale ungarische Events — Bälle, Konzerte, Familienprogramme, kulturelle Treffen, Pfadfindertreffen, kirchliche Liturgien."
          />
          <Feature
            emoji="📢"
            title="Kleinanzeigen (Hirdetések)"
            text="Wohnungen, Jobs, gebrauchte Sachen — Marktplatz innerhalb der ungarischen Community in der Schweiz."
          />
          <Feature
            emoji="🚗"
            title="Mitfahrgelegenheiten (Telekocsi)"
            text="Fahrten innerhalb der Schweiz und nach Ungarn — Anbieter und Mitfahrer finden sich direkt, ohne Provision."
          />
        </div>
      </section>

      {/* Geschäftsmodell + Datenschutz */}
      <section className="space-y-3 mb-10 rounded-card border border-primary/20 bg-primary-soft p-5 shadow-card">
        <h2 className="text-[18px] font-extrabold tracking-tight text-ink">
          Non-Profit & DSGVO-konform
        </h2>
        <ul className="space-y-2 text-[13.5px] leading-relaxed text-ink">
          <li>
            <strong>Kostenlos für alle</strong> — weder Nutzer noch eingetragene Fachleute
            zahlen Gebühren.
          </li>
          <li>
            <strong>Kein Konto, kein E-Mail</strong> — Nutzer können Inhalte anonym
            veröffentlichen (Reddit-ähnliche generierte Handles). Optional kann eine
            E-Mail angegeben werden.
          </li>
          <li>
            <strong>Datenminimierung</strong> — keine Tracker, kein Profiling, IP-Adressen
            nur als kurzlebige Hash-Werte gegen Spam.
          </li>
          <li>
            <strong>Open-Hosting</strong> — Cloudflare Pages (Edge), Daten in der EU/CH.
          </li>
        </ul>
      </section>

      {/* Kontakt */}
      <section className="space-y-3 mb-10">
        <h2 className="text-[18px] font-extrabold tracking-tight text-ink">
          Kontakt
        </h2>
        <p className="text-[13.5px] leading-relaxed text-ink-muted">
          Allgemeine Fragen:{" "}
          <a href="mailto:info@kinti.app" className="text-primary underline font-bold">
            info@kinti.app
          </a>
          <br />
          Missbrauch melden:{" "}
          <a href="mailto:abuse@kinti.app" className="text-primary underline font-bold">
            abuse@kinti.app
          </a>
        </p>
        <p className="text-[12px] leading-relaxed text-ink-faint">
          Vollständige rechtliche Informationen (auf Ungarisch):{" "}
          <Link href="/impresszum" className="underline">Impresszum</Link> ·{" "}
          <Link href="/adatvedelem" className="underline">Datenschutzerklärung</Link> ·{" "}
          <Link href="/aszf" className="underline">AGB</Link>
        </p>
      </section>

      {/* CTA */}
      <Link
        href="/"
        className="flex items-center justify-center gap-2 rounded-pill bg-primary py-3 text-[14px] font-extrabold text-white shadow-card-hover"
      >
        🇭🇺 Zur ungarischen App →
      </Link>
    </div>
  );
}

function Feature({ emoji, title, text }: { emoji: string; title: string; text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-card border border-line bg-surface p-4 shadow-card">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-primary-soft text-2xl">
        {emoji}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-[14px] font-extrabold text-ink">{title}</h3>
        <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-muted">{text}</p>
      </div>
    </div>
  );
}
