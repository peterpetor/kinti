"use client";

import { LegalPage } from "@/components/legal-page";
import { useLegalLang, type LegalLang } from "@/hooks/use-legal-lang";

const TITLE: Record<LegalLang, string> = {
  hu: "Visszatérítési és Elállási Szabályzat",
  de: "Rückerstattungs- und Widerrufsrichtlinie",
  en: "Refund and Withdrawal Policy",
};

export function VisszaterresBody() {
  const [lang, setLang] = useLegalLang();
  return (
    <LegalPage title={TITLE[lang]} updatedAt="2026-06-22" lang={lang} onLangChange={setLang}>
      {lang === "hu" && <VisszaterresHU />}
      {lang === "de" && <VisszaterresDE />}
      {lang === "en" && <VisszaterresEN />}
    </LegalPage>
  );
}

function VisszaterresHU() {
  return (
    <>
      <p>
        Ez a szabályzat a <strong>kinti.app</strong> díjköteles, digitális
        szolgáltatásaira (Kinti PRO előfizetés, Szaknévsor / vállalkozói PRO
        előfizetés, kiemelt álláshirdetés) vonatkozó fizetési, elállási és
        visszatérítési feltételeket ismerteti. A Szolgáltatás üzemeltetője a{" "}
        <strong>Feedback Jobs S.R.L.</strong> (Románia).
      </p>

      <h2>1. Fizetés és a számla kibocsátója (Merchant of Record)</h2>
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
    </>
  );
}

function VisszaterresDE() {
  return (
    <>
      <p>
        Diese Richtlinie beschreibt die Zahlungs-, Widerrufs- und
        Rückerstattungsbedingungen für die kostenpflichtigen digitalen Dienste von{" "}
        <strong>kinti.app</strong> (Kinti-PRO-Abonnement, Branchenbuch- /
        Unternehmer-PRO-Abonnement, hervorgehobene Stellenanzeige). Betreiber des
        Dienstes ist die <strong>Feedback Jobs S.R.L.</strong> (Rumänien).
      </p>

      <h2>1. Zahlung und Rechnungssteller (Merchant of Record)</h2>
      <div className="web-only-payment">
        <p>
          Kostenpflichtige Abonnements und Hervorhebungen werden von{" "}
          <strong>Paddle.com Market Limited</strong> (im Folgenden:{" "}
          <strong>„Paddle"</strong>) als <em>Merchant of Record</em> — also als
          vertraglicher Verkäufer und Rechnungssteller des Kaufs — abgewickelt.
          Dementsprechend:
        </p>
        <ul>
          <li>gelten für den Kauf auch die <strong>Vertrags- und Rückerstattungsbedingungen von Paddle</strong>;</li>
          <li>erfolgen die Berechnung und Einziehung der anfallenden <strong>Steuer (z. B. MwSt.)</strong> sowie die <strong>Rechnungsstellung</strong> bei Paddle;</li>
          <li>sendet Paddle den Zahlungsbeleg / die Rechnung per E-Mail an den Käufer.</li>
        </ul>
      </div>
      <div className="android-only-payment">
        <p>
          In der App werden kostenpflichtige Abonnements und Hervorhebungen vom{" "}
          <strong>Zahlungssystem von Google Play</strong> abgewickelt. Dementsprechend:
        </p>
        <ul>
          <li>gelten für den Kauf auch die <strong>Vertrags- und Rückerstattungsbedingungen von Google Play</strong>;</li>
          <li>erfolgen die Berechnung und Einziehung der anfallenden <strong>Steuer (z. B. MwSt.)</strong> sowie die <strong>Belegausstellung</strong> bei Google;</li>
          <li>sendet Google den Zahlungsbeleg per E-Mail an den Käufer.</li>
        </ul>
      </div>
      <p>
        Die Preise verstehen sich in der bei Bestellung angezeigten Währung
        und Höhe, inklusive der anwendbaren Steuer.
      </p>

      <h2>2. Widerrufsrecht (EU-/EWR-Verbraucher)</h2>
      <p>
        Wenn du Verbraucher in der Europäischen Union / im EWR bist, kannst du
        gemäß der <strong>Richtlinie 2011/83/EU</strong> über Verbraucherrechte den
        Kauf innerhalb von <strong>14 Tagen ab Vertragsschluss ohne Angabe von
        Gründen widerrufen</strong>.
      </p>
      <p>
        Da es sich bei PRO / der Hervorhebung um eine <strong>sofort verfügbare
        digitale Dienstleistung</strong> handelt, verlangst du bei der Bestellung{" "}
        <strong>ausdrücklich den Beginn der Dienstleistung innerhalb von 14
        Tagen</strong> und <strong>nimmst zur Kenntnis, dass du mit vollständiger
        Erbringung der Dienstleistung dein Widerrufsrecht verlierst</strong>{" "}
        (Art. 16 Buchst. m der Richtlinie). Für den bereits in Anspruch
        genommenen Zeitraum kann ein anteiliges Entgelt berechnet werden. Den
        Widerruf / die Rückerstattung kannst du{" "}
        <span className="web-only-payment">bei <strong>Paddle</strong> (über die
        Zahlungsbestätigungs-E-Mail) oder</span>
        <span className="android-only-payment">bei <strong>Google Play</strong> (Play
        Store → Zahlungen und Abos) oder</span>{" "}
        unter <a href="mailto:info@kinti.app">info@kinti.app</a> geltend machen.
      </p>

      <h2>3. Kündigung und Verlängerung</h2>
      <p>
        Das Abonnement ist <strong>jederzeit kündbar</strong>. Die Kündigung wird
        zum Ende des laufenden Abrechnungszeitraums wirksam — bis dahin bleiben
        die PRO-Funktionen verfügbar —, und für den nächsten Zeitraum entsteht
        keine weitere Gebühr.
      </p>
      <p>
        Die Kündigung begründet für den bereits abgerechneten, begonnenen
        Zeitraum — über das Widerrufsrecht gemäß Punkt 2 hinaus —{" "}
        <strong>keinen automatischen Rückerstattungsanspruch</strong>. Über eine
        Kulanzerstattung entscheiden wir nach{" "}
        <span className="web-only-payment">den Bedingungen von Paddle</span>
        <span className="android-only-payment">den Bedingungen von Google Play</span> und
        dem Ermessen des Betreibers im Einzelfall.
      </p>

      <h2>4. Mangelhafte Leistung / fehlerhafte Belastung</h2>
      <p>
        Wenn du der Ansicht bist, dass die Dienstleistung wesentlich
        mangelhaft war oder eine fehlerhafte Belastung erfolgt ist, schreibe
        an <a href="mailto:info@kinti.app">info@kinti.app</a>{" "}
        <span className="web-only-payment">(oder wende dich direkt an den
        Kundendienst von Paddle über die Bestätigungs-E-Mail)</span>
        <span className="android-only-payment">(oder wende dich direkt an den
        Kundendienst von Google Play)</span>. Wir prüfen solche Fälle einzeln
        und nach Treu und Glauben und gewähren bei berechtigtem Anlass eine
        vollständige oder anteilige Rückerstattung.
      </p>

      <h2>5. Schweizer Verbraucher</h2>
      <p style={{ fontStyle: "italic" }}>
        Als Schweizer Verbraucher sieht das schweizerische Recht für Online-
        / digitale Käufe im Allgemeinen keine zwingende Widerrufs- (Cooling-off-)
        Frist vor; das in Punkt 2 genannte 14-tägige Recht gilt für EU-/EWR-
        Verbraucher. Die zwingenden verbraucherschutzrechtlichen Bestimmungen
        bleiben unberührt.
      </p>

      <h2>6. Kontakt</h2>
      <p>
        Fragen zu Rückerstattung und Abrechnung:{" "}
        <a href="mailto:info@kinti.app">info@kinti.app</a>.{" "}
        <span className="web-only-payment">Der Kundendienst des
        Zahlungsabwicklers (Paddle) ist über die Zahlungsbestätigungs-E-Mail
        erreichbar.</span>
        <span className="android-only-payment">Der Kundendienst des
        Zahlungsabwicklers (Google Play) ist über den Play Store
        erreichbar.</span>
      </p>
    </>
  );
}

function VisszaterresEN() {
  return (
    <>
      <p>
        This policy describes the payment, withdrawal, and refund terms for{" "}
        <strong>kinti.app</strong>'s paid digital services (Kinti PRO
        subscription, Directory / Business PRO subscription, featured job
        listing). The Service is operated by <strong>Feedback Jobs
        S.R.L.</strong> (Romania).
      </p>

      <h2>1. Payment and billing entity (Merchant of Record)</h2>
      <div className="web-only-payment">
        <p>
          Paid subscriptions and highlights are processed by{" "}
          <strong>Paddle.com Market Limited</strong> (hereinafter:{" "}
          <strong>"Paddle"</strong>) as the <em>Merchant of Record</em> — i.e.
          the contracting seller and invoice issuer of the purchase.
          Accordingly:
        </p>
        <ul>
          <li>the purchase is also governed by <strong>Paddle's contractual and refund terms</strong>;</li>
          <li>the applicable <strong>tax (e.g. VAT)</strong> is calculated, collected, and <strong>invoiced</strong> by Paddle;</li>
          <li>Paddle sends the payment receipt / invoice to the buyer by email.</li>
        </ul>
      </div>
      <div className="android-only-payment">
        <p>
          In the app, paid subscriptions and highlights are processed by{" "}
          <strong>Google Play's payment system</strong>. Accordingly:
        </p>
        <ul>
          <li>the purchase is also governed by <strong>Google Play's contractual and refund terms</strong>;</li>
          <li>the applicable <strong>tax (e.g. VAT)</strong> is calculated, collected, and <strong>receipted</strong> by Google;</li>
          <li>Google sends the payment receipt to the buyer by email.</li>
        </ul>
      </div>
      <p>
        Prices are understood in the currency and amount shown at the time of
        order, including applicable tax.
      </p>

      <h2>2. Right of withdrawal (EU / EEA consumers)</h2>
      <p>
        If you are a consumer residing in the European Union / EEA, under{" "}
        <strong>Directive 2011/83/EU</strong> on consumer rights you may{" "}
        <strong>withdraw from the purchase within 14 days of conclusion of
        the contract without giving any reason</strong>.
      </p>
      <p>
        Because PRO / highlighting is an <strong>immediately available digital
        service</strong>, at the time of order you <strong>expressly request
        that the service begin within the 14-day period</strong> and{" "}
        <strong>acknowledge that once the service has been fully performed,
        you lose your right of withdrawal</strong> (point (m) of Article 16 of
        the Directive). A proportionate fee may be charged for any period
        already used. You may submit a withdrawal / refund request{" "}
        <span className="web-only-payment">to <strong>Paddle</strong> (via the
        payment confirmation email), or</span>
        <span className="android-only-payment">to <strong>Google Play</strong> (Play
        Store → Payments and subscriptions), or</span>{" "}
        at <a href="mailto:info@kinti.app">info@kinti.app</a>.
      </p>

      <h2>3. Cancellation and renewal</h2>
      <p>
        The subscription can be <strong>cancelled at any time</strong>.
        Cancellation takes effect at the end of the current billing period —
        PRO features remain available until then — and no further charge is
        incurred for the next period.
      </p>
      <p>
        Cancellation does not, for a period already billed and begun — beyond
        the right of withdrawal under point 2 — <strong>give rise to an
        automatic refund claim</strong>. Goodwill refunds are decided
        according to{" "}
        <span className="web-only-payment">Paddle's terms</span>
        <span className="android-only-payment">Google Play's terms</span> and
        the operator's discretion on a case-by-case basis.
      </p>

      <h2>4. Defective performance / incorrect charge</h2>
      <p>
        If you believe the service was materially defective, or an incorrect
        charge occurred, write to <a href="mailto:info@kinti.app">info@kinti.app</a>{" "}
        <span className="web-only-payment">(or contact Paddle's customer
        service directly via the confirmation email)</span>
        <span className="android-only-payment">(or contact Google Play's
        customer service directly)</span>. We review such cases individually
        and in good faith, and grant a full or proportionate refund where
        warranted.
      </p>

      <h2>5. Swiss consumers</h2>
      <p style={{ fontStyle: "italic" }}>
        As a Swiss consumer, Swiss law generally does not require a mandatory
        withdrawal (cooling-off) period for online / digital purchases; the
        14-day right described in point 2 applies to EU / EEA consumers.
        Mandatory consumer-protection provisions remain unaffected.
      </p>

      <h2>6. Contact</h2>
      <p>
        Refund and billing questions:{" "}
        <a href="mailto:info@kinti.app">info@kinti.app</a>.{" "}
        <span className="web-only-payment">The payment processor's (Paddle)
        customer service can be reached via the payment confirmation
        email.</span>
        <span className="android-only-payment">The payment processor's
        (Google Play) customer service can be reached via the Play
        Store.</span>
      </p>
    </>
  );
}
