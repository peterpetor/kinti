import type { Metadata } from "next";
import Link from "next/link";
import { ScreenHeader } from "@/components/ui";
import { LegalDisclaimer } from "@/components/legal-disclaimer";
import { CvWizard } from "@/components/views/cv-wizard";

// Tisztán kliens-oldali eszköz (a PDF a böngészőben készül) → force-static shell,
// NEM fogyaszt edge-route-ot (deploy-plafon). A profil-mentés külön /api/cv.
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Holland Önéletrajz (CV) Készítő | Kinti",
  description:
    "Ingyenes holland önéletrajz-készítő magyaroknak: több lépéses űrlap, a magyar szakmanevek bevett holland HR-megnevezéssel, egy kattintásra letölthető, holland szabvány szerinti CV. A böngésződben fut, 0 Ft.",
};

export default function DutchCvBuilderPage() {
  return (
    <div className="space-y-4 pb-12 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <div className="px-5">
        <ScreenHeader
          eyebrow="Állások · Ingyenes eszköz"
          title={
            <>
              Holland Önéletrajz
              <br />
              (CV) Készítő.
            </>
          }
        />
      </div>

      <div className="space-y-6 px-5 pt-2">
        <p className="text-[14px] leading-relaxed text-ink-muted">
          Töltsd ki lépésről lépésre — a magyar szakmanevet a bevett{" "}
          <strong className="text-ink">holland HR-megnevezésre</strong> fordítjuk (pl. Targoncás →
          Heftruckchauffeur), majd egy kattintással letöltesz egy letisztult, holland szabvány
          szerinti CV-t. Mindez a <strong className="text-ink">böngésződben</strong> készül — ingyen,
          feltöltés nélkül.
        </p>

        {/* A holland CV a némethez áll közel, de nem ugyanaz — aki a német CV-jét
            fordítja le, jellemzően ezeken bukik el. */}
        <div className="rounded-card border-2 border-primary/20 bg-primary-soft p-4">
          <p className="text-[13px] font-extrabold text-ink">
            🇳🇱 Amiben a holland CV más, mint a német
          </p>
          <ul className="mt-2 space-y-1.5 text-[12.5px] leading-relaxed text-ink-muted">
            <li>
              • <strong className="text-ink">„Curriculum Vitae", nem „Lebenslauf".</strong> A
              szakaszcímek is hollandul állnak: Werkervaring, Opleiding, Vaardigheden.
            </li>
            <li>
              • <strong className="text-ink">A fénykép és a születési év megengedett</strong>, de nem
              elvárás — a holland munkáltatók egyre kevésbé számítanak rá. Nálunk mindkettő
              opcionális.
            </li>
            <li>
              • <strong className="text-ink">Legfeljebb 2 oldal</strong> — a holland elvárás a tömör,
              fordított időrendű CV.
            </li>
            <li>
              • A végén{" "}
              <strong className="text-ink">„Referenties op aanvraag beschikbaar"</strong> — ezt
              automatikusan rátesszük.
            </li>
            <li>
              • ⚠️ Hollandiában a CV mellé szinte mindig kérnek{" "}
              <strong className="text-ink">motivatiebrief</strong>-et (motivációs levél) is. Ez az
              eszköz csak a CV-t készíti el — a levélre külön számíts.
            </li>
          </ul>
        </div>

        <CvWizard locale="nl" />

        {/* A kész CV önmagában kevés: munkába állni BSN nélkül nem lehet — ez a
            leggyakoribb elakadás a frissen kiköltözőknél. */}
        <p className="text-[12.5px] leading-relaxed text-ink-muted">
          A munkába álláshoz <strong className="text-ink">BSN-re</strong> (burgerservicenummer) is
          szükséged lesz, amit a gemeente-nél való bejelentkezéskor kapsz meg.{" "}
          <Link href="/tudasbazis/nl-bejelentkezes" className="font-bold text-primary-ink underline">
            A bejelentkezés lépésről lépésre →
          </Link>
        </p>

        <LegalDisclaimer
          toolName="Holland Önéletrajz Készítő"
          variant="info"
          notAdviceFor="jogi, munkajogi vagy karrier-tanácsadási"
          extraWarning="A szakma-fordítások bevett holland HR-megnevezések, de a végleges önéletrajz tartalmáért és a benne szereplő adatok helyességéért te felelsz — ellenőrizd a szöveget beadás előtt. A PDF a böngésződben készül, az üzemeltető nem fér hozzá; profil-mentés kizárólag a kifejezett hozzájárulásoddal történik."
        />
      </div>
    </div>
  );
}
