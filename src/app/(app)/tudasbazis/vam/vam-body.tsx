"use client";

import { CustomsCalculator } from "@/components/views/customs-calculator";
import { LegalDisclaimer } from "@/components/legal-disclaimer";
import { usePreferredCountry } from "@/lib/country-pref";

/**
 * A vám-oldal ország-tudatos törzse. A vám-kalkulátor CH-ban és GB-ben él
 * (mindkettő vámhatár az EU felé); a hero-szöveg, a figyelmeztetés és a
 * hivatalos forrás-linkek ehhez igazodnak.
 */
export function VamBody() {
  const [country] = usePreferredCountry();
  const isGb = country === "GB";

  return (
    <>
      <section className="rounded-card border-2 border-primary/20 bg-primary-soft p-5 shadow-card">
        <div className="flex items-start gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-primary text-white text-2xl">
            🛂
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-[20px] font-extrabold tracking-tight text-ink">
              Vámmentes mennyiség BECSLÉSE
            </h1>
            <p className="mt-1 text-[12.5px] leading-snug text-ink-muted">
              {isGb
                ? "Anglia Brexit óta nem EU-tag — az EU-ból érkezve vámhatárt lépsz át."
                : "Svájc nem EU-tag — vámmentes limit van."}{" "}
              Tájékoztató kalkulátor.{" "}
              <strong className="text-ink">NEM hivatalos vámtanács.</strong>
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-2 px-1 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
          💰 Vámmentes kalkulátor
        </h2>
        <CustomsCalculator />
      </section>

      {isGb ? (
        <LegalDisclaimer
          toolName="vám-kalkulátor"
          variant="legal"
          notAdviceFor="vámjogi vagy adójogi"
          extraWarning="A vám-mentes keretek időnként változnak. A kalkulátor eredménye NEM hivatalos információ. Hús- és tejtermék személyes behozatala az EU-ból Nagy-Britanniába TILTOTT. A keret fölötti árut az érkezés előtti 5 napban online kell deklarálni."
          officialSources={[
            { label: "gov.uk — Duty free goods", url: "https://www.gov.uk/duty-free-goods" },
            { label: "gov.uk — Bringing food into Great Britain", url: "https://www.gov.uk/bringing-food-animals-plants-into-uk" },
          ]}
        />
      ) : (
        <LegalDisclaimer
          toolName="vám-kalkulátor"
          variant="legal"
          notAdviceFor="vámjogi vagy adójogi"
          extraWarning="A vám-mentes limitek időnként változnak. A kalkulátor eredménye NEM hivatalos információ. Hivatalos átkeléshez és fizetéshez használd a QuickZoll alkalmazást."
          officialSources={[
            { label: "BAZG — Vámmentes mennyiség", url: "https://www.bazg.admin.ch/bazg/de/home/information-private/reisen-und-einkaufen--freimengen-und-mehrwertsteuer.html" },
            { label: "QuickZoll — Hivatalos app", url: "https://www.bazg.admin.ch/bazg/de/home/services/services-firmen/services-firmen-warenanmeldung/quickzoll.html" },
          ]}
        />
      )}
    </>
  );
}
