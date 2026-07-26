import type { Metadata } from "next";
import { ScreenHeader } from "@/components/ui";
import { LegalDisclaimer } from "@/components/legal-disclaimer";
import { CvWizard } from "@/components/views/cv-wizard";

// Tisztán kliens-oldali eszköz (a PDF a böngészőben készül) → force-static shell,
// NEM fogyaszt edge-route-ot (deploy-plafon). A profil-mentés külön /api/cv.
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Angol Önéletrajz (CV) Készítő | Kinti",
  description:
    "Ingyenes angol önéletrajz-készítő magyaroknak: több lépéses űrlap, a magyar szakmanevek bevett brit HR-megnevezéssel, egy kattintásra letölthető, UK-szabvány szerinti CV. Fotó és születési év nélkül, ahogy a brit munkáltatók elvárják.",
};

export default function EnglishCvBuilderPage() {
  return (
    <div className="space-y-4 pb-12 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <div className="px-5">
        <ScreenHeader
          eyebrow="Állások · Ingyenes eszköz"
          title={
            <>
              Angol Önéletrajz
              <br />
              (CV) Készítő.
            </>
          }
        />
      </div>

      <div className="space-y-6 px-5 pt-2">
        <p className="text-[14px] leading-relaxed text-ink-muted">
          Töltsd ki lépésről lépésre — a magyar szakmanevet a bevett{" "}
          <strong className="text-ink">brit HR-megnevezésre</strong> fordítjuk (pl. Targoncás →
          Forklift Driver), majd egy kattintással letöltesz egy letisztult, brit szabvány szerinti
          CV-t. Mindez a <strong className="text-ink">böngésződben</strong> készül — ingyen,
          feltöltés nélkül.
        </p>

        {/* A brit CV érdemben más, mint a német — ez a leggyakoribb hibaforrás
            azoknál, akik a német CV-jüket fordítják le. */}
        <div className="rounded-card border-2 border-primary/20 bg-primary-soft p-4">
          <p className="text-[13px] font-extrabold text-ink">
            🇬🇧 Amiben a brit CV más, mint a német
          </p>
          <ul className="mt-2 space-y-1.5 text-[12.5px] leading-relaxed text-ink-muted">
            <li>
              • <strong className="text-ink">Nincs fénykép és nincs születési év.</strong> A brit
              munkáltatók a diszkrimináció elkerülése miatt kifejezetten kerülik — a fotós CV sok
              helyen visszatetsző. Ezért ezeket be sem kérjük.
            </li>
            <li>
              • <strong className="text-ink">Nincs aláírás</strong> és nincs „Ort/Datum" sor.
            </li>
            <li>
              • <strong className="text-ink">Legfeljebb 2 oldal</strong> — a brit elvárás a tömör CV.
            </li>
            <li>
              • A végén <strong className="text-ink">„References available on request"</strong> —
              ezt automatikusan rátesszük.
            </li>
            <li>
              • A <strong className="text-ink">Personal Profile</strong> (rövid bemutatkozás) a
              legfontosabb blokk: 3–4 mondat arról, mit tudsz és mit keresel.
            </li>
          </ul>
        </div>

        <CvWizard locale="en" />

        <LegalDisclaimer
          toolName="Angol Önéletrajz Készítő"
          variant="info"
          notAdviceFor="jogi, munkajogi vagy karrier-tanácsadási"
          extraWarning="A szakma-fordítások bevett brit HR-megnevezések, de a végleges önéletrajz tartalmáért és a benne szereplő adatok helyességéért te felelsz — ellenőrizd a szöveget beadás előtt. A PDF a böngésződben készül, az üzemeltető nem fér hozzá; profil-mentés kizárólag a kifejezett hozzájárulásoddal történik. ⚠️ Angliában a munkavállaláshoz Brexit óta megfelelő vízum vagy letelepedési státusz kell — az önéletrajz önmagában nem jogosít munkavállalásra."
        />
      </div>
    </div>
  );
}
