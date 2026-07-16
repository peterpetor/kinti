import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";
import { UtalasAssistant } from "@/components/views/utalas-assistant";
import { LegalDisclaimer } from "@/components/legal-disclaimer";
import { ExchangeRateSection } from "./exchange-rate-section";

// Force-static KLIENS-SHELL: az árfolyam ÉS az asszisztens is kliensoldalon
// kéri az adatot (/api/exchange-rate), így a lap NEM fogyaszt edge-route-ot.
export const dynamic = "force-static";

export const metadata = {
  title: "Utalás és árfolyam — CHF/EUR → HUF kalkulátor + utalás-asszisztens",
  description:
    "Aktuális árfolyam és utalás-szolgáltatók díjkalkulátora (Wise, Revolut, bank) egy helyen — plusz a PRO utalás-asszisztens, ami megmondja, mikor éri meg hazautalni.",
};

/**
 * Utalás — a korábbi /arfolyam + /utalas ÖSSZEVONVA (2026-07-16, user-döntés):
 * aki utalni akar, először az árfolyamra kíváncsi → az oldal tetején fut az élő
 * árfolyam-kártya + díjkalkulátor (Wise/Revolut/bank összehasonlítás), alatta a
 * PRO Utalás-asszisztens. A régi /arfolyam permanent redirecttel ide érkezik.
 */
export default function UtalasPage() {
  return (
    <div className="mx-auto max-w-md space-y-5 px-5 pt-[calc(env(safe-area-inset-top)+2rem)] pb-12">
      <header className="flex items-center gap-3">
        <KintiLogo size={28} />
        <span className="text-[16px] font-extrabold tracking-tight text-ink truncate">
          Utalás · Árfolyam
        </span>
        <Link
          href="/"
          aria-label="Vissza a Főoldalra"
          className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95 transition-transform"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
        </Link>
      </header>

      {/* Élő árfolyam + díjkalkulátor — aki utal, ezt nézi először. */}
      <ExchangeRateSection />

      {/* PRO Utalás-asszisztens — mérhető havi spórolás. Az id a kalkulátor
          „Szólj, ha jó az árfolyam" horgony-linkjének célpontja. */}
      <section id="utalas-asszisztens" className="scroll-mt-24 space-y-2">
        <h2 className="px-1 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
          Utalás-asszisztens
        </h2>
        <p className="text-[13px] leading-snug text-ink-muted">
          Beállítod a szokásos összeged, az asszisztens megmondja,{" "}
          <strong className="text-ink">mikor</strong> és{" "}
          <strong className="text-ink">melyik szolgáltatóval</strong> éri meg utalni — és
          vezeti, mennyit spóroltál a banki utaláshoz képest.
        </p>
        <UtalasAssistant />
      </section>

      <LegalDisclaimer
        toolName="árfolyam és hazautalás kalkulátor"
        variant="legal"
        notAdviceFor="pénzügyi vagy befektetési"
        extraWarning="Az ECB napi középárfolyama NEM ugyanaz, mint amit a bank vagy a szolgáltató ad — a tényleges váltáskor 0.3-2% spread van a károdra. A szolgáltatói díjbecslések publikált átlagos tarifa alapján, és gyakran változnak. Konkrét utaláshoz mindig az adott szolgáltatónál ellenőrizd az aktuális díjat."
        officialSources={[
          { label: "Frankfurter.app — ECB napi árfolyam", url: "https://api.frankfurter.app/" },
          { label: "SNB — Svájci Nemzeti Bank", url: "https://www.snb.ch/" },
        ]}
      />
    </div>
  );
}
