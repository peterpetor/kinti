import type { Metadata } from "next";
import { ScreenHeader } from "@/components/ui";
import { LegalDisclaimer } from "@/components/legal-disclaimer";
import { CvWizard } from "@/components/views/cv-wizard";

// Tisztán kliens-oldali eszköz (a PDF a böngészőben készül) → force-static shell,
// NEM fogyaszt edge-route-ot (deploy-plafon). A profil-mentés külön /api/cv.
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Német Önéletrajz (Lebenslauf) Készítő | Kinti",
  description:
    "Ingyenes német önéletrajz-készítő magyaroknak: több lépéses űrlap, a magyar szakmanevek német HR-megnevezéssel, egy kattintásra letölthető, DIN-5008 igazodású PDF. A böngésződben fut, 0 Ft.",
};

export default function CvBuilderPage() {
  return (
    <div className="space-y-4 pb-12 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <div className="px-5">
        <ScreenHeader
          eyebrow="Állások · Ingyenes eszköz"
          title={
            <>
              Német Önéletrajz
              <br />
              (Lebenslauf) Készítő.
            </>
          }
        />
      </div>

      <div className="space-y-6 px-5 pt-2">
        <p className="text-[14px] leading-relaxed text-ink-muted">
          Töltsd ki lépésről lépésre — a magyar szakmanevet a bevett{" "}
          <strong className="text-ink">német HR-megnevezésre</strong> fordítjuk (pl. Targoncás →
          Gabelstaplerfahrer/in), majd egy kattintással letöltesz egy letisztult, német szabvány
          szerinti PDF-et. Mindez a <strong className="text-ink">böngésződben</strong> készül —
          ingyen, feltöltés nélkül.
        </p>

        <CvWizard />

        <LegalDisclaimer
          toolName="Német Önéletrajz Készítő"
          variant="info"
          notAdviceFor="jogi, munkajogi vagy karrier-tanácsadási"
          extraWarning="A szakma-fordítások bevett HR-megnevezések, de a végleges önéletrajz tartalmáért és a benne szereplő adatok helyességéért te felelsz — ellenőrizd a szöveget beadás előtt. A PDF a böngésződben készül, az üzemeltető nem fér hozzá; profil-mentés kizárólag a kifejezett hozzájárulásoddal történik."
        />
      </div>
    </div>
  );
}
