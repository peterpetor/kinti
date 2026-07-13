import { LegalPage } from "@/components/legal-page";

export const dynamic = "force-static";

export const metadata = { title: "Visszatérítési és Elállási Szabályzat" };

export default function VisszateresPage() {
  return (
    <LegalPage title="Visszatérítési és Elállási Szabályzat" updatedAt="2026-06-22">
      <p>
        Ez a szabályzat a <strong>kinti.app</strong> díjköteles, digitális
        szolgáltatásaira (Kinti PRO előfizetés, Szaknévsor / vállalkozói PRO
        előfizetés, kiemelt álláshirdetés) vonatkozó fizetési, elállási és
        visszatérítési feltételeket ismerteti. A Szolgáltatás üzemeltetője a{" "}
        <strong>Feedback Jobs S.R.L.</strong> (Románia).
      </p>

      <h2>1. Fizetés és a számla kibocsátója (Merchant of Record)</h2>
      {/* Kontextusfüggő fizetési szolgáltató: weben Paddle, a Google Play-ből
          telepített Android-appban a Google Play (a .web-only-payment /
          .android-only-payment CSS-osztályok váltják, lásd globals.css). */}
      <div className="web-only-payment">
        <p>
          A díjköteles előfizetéseket és kiemeléseket a{" "}
          <strong>Paddle.com Market Limited</strong> (a továbbiakban:{" "}
          <strong>„Paddle"</strong>) mint <em>Merchant of Record</em> — azaz a
          vásárlás szerződő eladója és számlakibocsátója — bonyolítja. Ennek
          megfelelően:
        </p>
        <ul>
          <li>a vásárlásra a <strong>Paddle szerződési és visszatérítési feltételei is</strong> irányadók;</li>
          <li>a vonatkozó <strong>adó (pl. ÁFA / MWST)</strong> felszámítása, beszedése és a <strong>számla kiállítása</strong> a Paddle-nél történik;</li>
          <li>a fizetési bizonylatot / számlát a Paddle e-mailben küldi meg a vásárlónak.</li>
        </ul>
      </div>
      <div className="android-only-payment">
        <p>
          Az alkalmazásban a díjköteles előfizetéseket és kiemeléseket a{" "}
          <strong>Google Play fizetési rendszere</strong> bonyolítja. Ennek megfelelően:
        </p>
        <ul>
          <li>a vásárlásra a <strong>Google Play szerződési és visszatérítési feltételei is</strong> irányadók;</li>
          <li>a vonatkozó <strong>adó (pl. ÁFA / MWST)</strong> felszámítása, beszedése és a <strong>bizonylat kiállítása</strong> a Google-nál történik;</li>
          <li>a fizetési bizonylatot a Google e-mailben küldi meg a vásárlónak.</li>
        </ul>
      </div>
      <p>
        Az árak a megrendeléskor feltüntetett pénznemben és összegben, az
        alkalmazandó adóval értendők.
      </p>

      <h2>2. Elállási jog (EU / EGT fogyasztók)</h2>
      <p>
        Ha az Európai Unióban / EGT-ben élő fogyasztó vagy, a fogyasztói
        jogokról szóló <strong>2011/83/EU irányelv</strong> alapján a
        szerződéskötéstől számított <strong>14 napon belül indokolás nélkül
        elállhatsz</strong> a vásárlástól.
      </p>
      <p>
        Mivel a PRO / kiemelés egy <strong>azonnal hozzáférhetővé váló digitális
        szolgáltatás</strong>, a megrendeléskor <strong>kifejezetten kéred a
        szolgáltatás 14 napon belüli megkezdését</strong>, és{" "}
        <strong>tudomásul veszed, hogy a szolgáltatás teljes körű
        teljesítésével elveszíted az elállási jogodat</strong> (az irányelv 16.
        cikk m) pontja). A részben igénybe vett időszakra az ellenérték arányos
        része számítható fel. Az elállási / visszatérítési kérelmet{" "}
        <span className="web-only-payment">a <strong>Paddle-nél</strong> (a fizetési
        visszaigazoló e-mailből), illetve</span>
        <span className="android-only-payment">a <strong>Google Play-nél</strong> (Play
        Áruház → Fizetések és előfizetések), illetve</span>{" "}
        az <a href="mailto:info@kinti.app">info@kinti.app</a> címen jelezheted.
      </p>

      <h2>3. Lemondás és megújulás</h2>
      <p>
        Az előfizetés <strong>bármikor lemondható</strong>. A lemondás a folyó
        számlázási időszak végén lép hatályba — addig a PRO funkciók elérhetők
        maradnak —, és a következő időszakra nem keletkezik újabb díjfizetés.
      </p>
      <p>
        A lemondás a már kiszámlázott, megkezdett időszakra — a 2. pont szerinti
        elállási jogon túl — <strong>nem keletkeztet automatikus visszatérítési
        igényt</strong>. Méltányossági (goodwill) visszatérítésről{" "}
        <span className="web-only-payment">a Paddle feltételei</span>
        <span className="android-only-payment">a Google Play feltételei</span> és az
        üzemeltető egyedi mérlegelése szerint dönthetünk.
      </p>

      <h2>4. Hibás teljesítés / téves díjterhelés</h2>
      <p>
        Ha úgy ítéled meg, hogy a szolgáltatás lényegesen hibás, vagy téves
        díjterhelés történt, írj az <a href="mailto:info@kinti.app">info@kinti.app</a>{" "}
        címre <span className="web-only-payment">(vagy fordulj közvetlenül a Paddle
        ügyfélszolgálatához a visszaigazoló e-mailből)</span>
        <span className="android-only-payment">(vagy fordulj közvetlenül a Google Play
        ügyfélszolgálatához)</span>. Az ilyen eseteket egyedileg, jóhiszeműen
        vizsgáljuk ki, és indokolt esetben teljes vagy arányos visszatérítést
        adunk.
      </p>

      <h2>5. Svájci fogyasztók</h2>
      <p style={{ fontStyle: "italic" }}>
        Svájci fogyasztóként a svájci jog az online / digitális vásárlásokra
        általában nem ír elő kötelező elállási (cooling-off) időszakot; a 2.
        pontban írt 14 napos jog az EU / EGT-fogyasztókat illeti. A kötelező
        fogyasztóvédelmi rendelkezések érintetlenül maradnak.
      </p>

      <h2>6. Kapcsolat</h2>
      <p>
        Visszatérítési és számlázási kérdések:{" "}
        <a href="mailto:info@kinti.app">info@kinti.app</a>.{" "}
        <span className="web-only-payment">A fizetés lebonyolítójának (Paddle)
        ügyfélszolgálata a fizetési visszaigazoló e-mailből érhető el.</span>
        <span className="android-only-payment">A fizetés lebonyolítójának (Google Play)
        ügyfélszolgálata a Play Áruházból érhető el.</span>
      </p>
    </LegalPage>
  );
}
