import type { Metadata } from "next";
import Link from "next/link";
import { ScreenHeader } from "@/components/ui";
import { LegalDisclaimer } from "@/components/legal-disclaimer";
import { CvWizard } from "@/components/views/cv-wizard";

// Tisztán kliens-oldali eszköz (a PDF a böngészőben készül) → force-static shell,
// NEM fogyaszt edge-route-ot (deploy-plafon). A profil-mentés külön /api/cv.
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Spanyol Önéletrajz (Currículum) Készítő | Kinti",
  description:
    "Ingyenes spanyol önéletrajz-készítő magyaroknak: több lépéses űrlap, a magyar szakmanevek bevett spanyol HR-megnevezéssel, egy kattintásra letölthető, spanyol szabvány szerinti currículum vítae. A böngésződben fut, 0 Ft.",
};

export default function SpanishCvBuilderPage() {
  return (
    <div className="space-y-4 pb-12 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <div className="px-5">
        <ScreenHeader
          eyebrow="Állások · Ingyenes eszköz"
          title={
            <>
              Spanyol Önéletrajz
              <br />
              (Currículum) Készítő.
            </>
          }
        />
      </div>

      <div className="space-y-6 px-5 pt-2">
        <p className="text-[14px] leading-relaxed text-ink-muted">
          Töltsd ki lépésről lépésre — a magyar szakmanevet a bevett{" "}
          <strong className="text-ink">spanyol HR-megnevezésre</strong> fordítjuk (pl. Targoncás →
          Carretillero), majd egy kattintással letöltesz egy letisztult, spanyol szabvány szerinti
          currículumot. Mindez a <strong className="text-ink">böngésződben</strong> készül — ingyen,
          feltöltés nélkül.
        </p>

        {/* A spanyol CV a némethez áll közel (fotó igen), de a részletekben eltér —
            aki a német CV-jét fordítja le, jellemzően ezeken bukik el. */}
        <div className="rounded-card border-2 border-primary/20 bg-primary-soft p-4">
          <p className="text-[13px] font-extrabold text-ink">
            🇪🇸 Amiben a spanyol CV más
          </p>
          <ul className="mt-2 space-y-1.5 text-[12.5px] leading-relaxed text-ink-muted">
            <li>
              • <strong className="text-ink">„Currículum vítae", a szakaszcímek spanyolul:</strong>{" "}
              Experiencia laboral, Formación, Idiomas, Conocimientos.
            </li>
            <li>
              • <strong className="text-ink">A fénykép bevett, sőt jellemzően elvárás</strong> — a
              brit gyakorlattal ellentétben itt nyugodtan tedd rá. A születési év is megszokott.
            </li>
            <li>
              • <strong className="text-ink">Legfeljebb 1–2 oldal</strong>, fordított időrendben — a
              friss tapasztalat legyen elöl.
            </li>
            <li>
              • ⚠️ <strong className="text-ink">A szakma-megnevezés nemtől függ.</strong> A
              generátor a hímnemű alapalakot adja (Camarero, Carretillero) — ha nő vagy, egyetlen
              betűt írj át az „Egyedi megnevezés" mezőben: Camarera, Carretillera.
            </li>
            <li>
              • A végén <strong className="text-ink">„Referencias disponibles a petición"</strong> —
              ezt automatikusan rátesszük.
            </li>
          </ul>
        </div>

        <CvWizard locale="es" />

        {/* A kész CV önmagában kevés: bejelentés NIE és TB-szám nélkül nem lehet —
            ez a leggyakoribb elakadás a frissen kiköltözőknél. */}
        <div className="space-y-2">
          <p className="text-[12.5px] leading-relaxed text-ink-muted">
            A munkába álláshoz <strong className="text-ink">NIE-számra</strong> és{" "}
            <strong className="text-ink">Seguridad Social-számra</strong> is szükséged lesz — a
            munkáltató enélkül nem tud bejelenteni.{" "}
            <Link href="/tudasbazis/es-nie-regisztracio" className="font-bold text-primary-ink underline">
              A NIE és az uniós regisztráció →
            </Link>
          </p>
          <p className="text-[12.5px] leading-relaxed text-ink-muted">
            ⚠️ A hivatali ügyekhez szinte mindenhol{" "}
            <strong className="text-ink">előzetes időpont (cita previa)</strong> kell, és az hetekre
            előre elfogyhat — ezzel a CV-írással párhuzamosan érdemes elindulni.{" "}
            <Link href="/tudasbazis/es-cita-previa" className="font-bold text-primary-ink underline">
              Mit tegyél, ha nincs szabad időpont →
            </Link>
          </p>
        </div>

        <LegalDisclaimer
          toolName="Spanyol Önéletrajz Készítő"
          variant="info"
          notAdviceFor="jogi, munkajogi vagy karrier-tanácsadási"
          extraWarning="A szakma-fordítások bevett spanyol HR-megnevezések, de a végleges önéletrajz tartalmáért és a benne szereplő adatok helyességéért te felelsz — ellenőrizd a szöveget beadás előtt. A PDF a böngésződben készül, az üzemeltető nem fér hozzá; profil-mentés kizárólag a kifejezett hozzájárulásoddal történik."
        />
      </div>
    </div>
  );
}
