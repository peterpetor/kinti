"use client";

import { LegalPage } from "@/components/legal-page";
import { useLegalLang, type LegalLang } from "@/hooks/use-legal-lang";

const OPERATOR = {
  name: "Feedback Jobs S.R.L.",
  representative: "Gellért Fülöp",
  address: "Cart. Bekecs, Bloc F, Ap. 15, 545500 Szováta (Sovata), Maros megye, Románia",
  email: "info@kinti.app",
  contactEmail: "info@kinti.app",
  abuseEmail: "abuse@kinti.app",
  hostingProvider: "Cloudflare, Inc. — 101 Townsend St, San Francisco, CA 94107, USA",
  authDomain: "kinti.app",
  cui: "53137115",
  regNumber: "J2025098494007",
  phone: "+40 752 607 245",
};

const TITLE: Record<LegalLang, string> = { hu: "Impresszum", de: "Impressum", en: "Imprint" };

export function ImpresszumBody() {
  const [lang, setLang] = useLegalLang();
  return (
    <LegalPage title={TITLE[lang]} updatedAt="2026-07-20" lang={lang} onLangChange={setLang}>
      {lang === "hu" && <ImpresszumHU />}
      {lang === "de" && <ImpresszumDE />}
      {lang === "en" && <ImpresszumEN />}
    </LegalPage>
  );
}

function ImpresszumHU() {
  return (
    <>
      <p>
        Az elektronikus kereskedelemről szóló <strong>2000/31/EK irányelv</strong> és a
        vonatkozó nemzeti jogszabályok alapján a kinti.app szolgáltatás üzemeltetőjének adatai:
      </p>

      <h2>Üzemeltető</h2>
      <ul>
        <li>Cégnév: <strong>{OPERATOR.name}</strong></li>
        <li>Jogállás: korlátolt felelősségű társaság (S.R.L., Románia)</li>
        <li>Képviseletre jogosult (ügyvezető): <strong>{OPERATOR.representative}</strong></li>
        <li>Cégjegyzékszám: <strong>{OPERATOR.regNumber}</strong></li>
        <li>Adószám (CUI): <strong>{OPERATOR.cui}</strong></li>
        <li>
          Székhely: {OPERATOR.address}
          <br />
          <span className="text-ink-muted">Bejegyzett székhely — jogi kézbesítés is itt érvényes.</span>
        </li>
        <li>Telefon: <a href={`tel:${OPERATOR.phone.replace(/\s/g, "")}`}>{OPERATOR.phone}</a></li>
        <li>
          Kapcsolat e-mail: <a href={`mailto:${OPERATOR.contactEmail}`}>{OPERATOR.contactEmail}</a>
        </li>
        <li>
          Visszaélés-bejelentés: <a href={`mailto:${OPERATOR.abuseEmail}`}>{OPERATOR.abuseEmail}</a>
        </li>
        <li>
          DSA szerinti kapcsolattartó: <a href={`mailto:${OPERATOR.contactEmail}`}>{OPERATOR.contactEmail}</a>{" "}
          (Az EU Digitális Szolgáltatások Rendeletének (2022/2065) 11. cikke alapján)
        </li>
      </ul>

      <h2>Tárhely-szolgáltató</h2>
      <p>{OPERATOR.hostingProvider}</p>

      <h2>A szolgáltatás jellege</h2>
      <p>
        A kinti.app egy <strong>közösségi platform</strong>, amely a Svájcban és Európában élő magyar
        közösség és a velük kapcsolatban álló vállalkozások / szakemberek találkozását segíti.
        Az <strong>alapszolgáltatások</strong> (kereső, események, kalkulátorok) ingyenesen
        használhatók; egyes <strong>prémium funkciók opcionális PRO-előfizetés</strong> keretében
        érhetők el. A Szolgáltatás <strong>közvetítő platformként</strong> működik (DSA 2022/2065
        értelmében „közvetítő szolgáltató").
      </p>

      <h2>Felelősség</h2>
      <p>
        Az üzemeltető nem felelős a felhasználók által közzétett tartalmakért. A platform
        értesítési-eltávolítási („notice-and-takedown") rendszerrel működik: jogsértőnek vélt
        tartalom esetén küldj értesítést az <a href={`mailto:${OPERATOR.abuseEmail}`}>{OPERATOR.abuseEmail}</a> címre,
        és haladéktalanul intézkedünk.
      </p>
      <p>
        A platformon megjelenő <strong>adatok, kalkulációs eredmények, térképi pontok és közösségi
        jelentések</strong> tájékoztató jellegűek; az üzemeltető ezek pontosságáért, frissességéért
        és következményeiért <strong>kizárólagos felelősséget nem vállal.</strong> A szabályok
        és adatok előzetes értesítés nélkül változhatnak.
      </p>

      <h2>Szerzői jog</h2>
      <p>
        © 2025–2026 Feedback Jobs S.R.L. / kinti.app. Minden jog fenntartva.
        A platform arculata, logója, kódbázisa és szerkesztett tartalmai szerzői jogi
        védelem alatt állnak. A felhasználók által feltöltött tartalmak (hirdetések, fotók,
        vélemények) az adott felhasználó szellemi tulajdonát képezik; a platform csak a
        megjelenítéshez szükséges, nem kizárólagos licencet kap ezek közlésére.
      </p>

      <h2>Adatforrások</h2>
      <p>
        A Szaknévsor egyes bejegyzéseinek alapadatai (név, cím, koordináta) részben az{" "}
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">
          OpenStreetMap
        </a>{" "}
        adatbázisából származnak — © OpenStreetMap közreműködők, az{" "}
        <a href="https://opendatacommons.org/licenses/odbl/" target="_blank" rel="noopener noreferrer">
          ODbL licenc
        </a>{" "}
        szerint. A térképcsempéket a CARTO / Esri szolgáltatja. Az árfolyam-adatok
        tájékoztató jellegűek, harmadik féltől származnak.
      </p>

      <h2>Online vitarendezés (ODR)</h2>
      <p>
        Az Európai Bizottság korábbi online vitarendezési (ODR) platformja{" "}
        <strong>2025. július 20-án megszűnt</strong>. Fogyasztói jogvita esetén a
        szokásos tartózkodási helyed szerinti tagállam <strong>fogyasztói
        vitarendezési testületéhez</strong> (alternatív vitarendezés, AVR/ADR)
        fordulhatsz. Az üzemeltető emellett email-alapú, peren kívüli vitarendezésre
        is nyitott: <a href={`mailto:${OPERATOR.contactEmail}`}>{OPERATOR.contactEmail}</a>.
      </p>

      <h2>DSA Átláthatóság</h2>
      <p>
        A kinti.app az Európai Unió Digitális Szolgáltatások Rendelete (2022/2065/EU — DSA)
        hatálya alá tartozó <strong>„kisméretű platform"</strong>. A DSA 24. cikk szerinti
        éves átláthatósági jelentés közzétételére vonatkozó küszöbértéket a platform jelenlegi
        felhasználószámával nem éri el. A jogszabályban előírt kapcsolattartó: <a href={`mailto:${OPERATOR.contactEmail}`}>{OPERATOR.contactEmail}</a>.
      </p>

      <h2>Domain</h2>
      <p>A szolgáltatás a {OPERATOR.authDomain} domain alatt érhető el.</p>
    </>
  );
}

function ImpresszumDE() {
  return (
    <>
      <p>
        Gemäß der <strong>Richtlinie 2000/31/EG</strong> über den elektronischen Geschäftsverkehr
        und den einschlägigen nationalen Rechtsvorschriften folgen die Angaben zum Betreiber
        des Dienstes kinti.app:
      </p>

      <h2>Betreiber</h2>
      <ul>
        <li>Firmenname: <strong>{OPERATOR.name}</strong></li>
        <li>Rechtsform: Gesellschaft mit beschränkter Haftung (S.R.L., Rumänien)</li>
        <li>Vertretungsberechtigt (Geschäftsführer): <strong>{OPERATOR.representative}</strong></li>
        <li>Handelsregisternummer: <strong>{OPERATOR.regNumber}</strong></li>
        <li>Steuernummer (CUI): <strong>{OPERATOR.cui}</strong></li>
        <li>
          Sitz: {OPERATOR.address}
          <br />
          <span className="text-ink-muted">Eingetragener Sitz — auch für rechtliche Zustellungen maßgeblich.</span>
        </li>
        <li>Telefon: <a href={`tel:${OPERATOR.phone.replace(/\s/g, "")}`}>{OPERATOR.phone}</a></li>
        <li>
          Kontakt-E-Mail: <a href={`mailto:${OPERATOR.contactEmail}`}>{OPERATOR.contactEmail}</a>
        </li>
        <li>
          Meldung von Missbrauch: <a href={`mailto:${OPERATOR.abuseEmail}`}>{OPERATOR.abuseEmail}</a>
        </li>
        <li>
          Kontaktstelle gemäß DSA: <a href={`mailto:${OPERATOR.contactEmail}`}>{OPERATOR.contactEmail}</a>{" "}
          (gemäß Artikel 11 der EU-Verordnung über digitale Dienste, 2022/2065)
        </li>
      </ul>

      <h2>Hosting-Anbieter</h2>
      <p>{OPERATOR.hostingProvider}</p>

      <h2>Art des Dienstes</h2>
      <p>
        kinti.app ist eine <strong>Community-Plattform</strong>, die die Begegnung der in der
        Schweiz und in Europa lebenden ungarischen Community mit den damit verbundenen
        Unternehmen und Fachkräften unterstützt. Die <strong>Grundfunktionen</strong> (Suche,
        Veranstaltungen, Rechner) sind kostenlos nutzbar; einzelne <strong>Premium-Funktionen</strong>{" "}
        stehen im Rahmen eines optionalen PRO-Abonnements zur Verfügung. Der Dienst fungiert als{" "}
        <strong>Vermittlungsplattform</strong> (im Sinne des DSA 2022/2065 ein „Vermittlungsdienst").
      </p>

      <h2>Haftung</h2>
      <p>
        Der Betreiber haftet nicht für von Nutzern veröffentlichte Inhalte. Die Plattform arbeitet
        nach dem „Notice-and-Takedown"-Prinzip: Bei vermutetem rechtswidrigem Inhalt sende eine
        Meldung an <a href={`mailto:${OPERATOR.abuseEmail}`}>{OPERATOR.abuseEmail}</a>, und wir
        werden unverzüglich tätig.
      </p>
      <p>
        Die auf der Plattform angezeigten <strong>Daten, Rechenergebnisse, Kartenpunkte und
        Community-Berichte</strong> sind informativer Natur; der Betreiber übernimmt{" "}
        <strong>keine Gewähr</strong> für deren Richtigkeit, Aktualität und Folgen. Regeln und
        Daten können sich ohne vorherige Ankündigung ändern.
      </p>

      <h2>Urheberrecht</h2>
      <p>
        © 2025–2026 Feedback Jobs S.R.L. / kinti.app. Alle Rechte vorbehalten.
        Das Erscheinungsbild, das Logo, die Codebasis und die redaktionellen Inhalte der
        Plattform sind urheberrechtlich geschützt. Von Nutzern hochgeladene Inhalte (Anzeigen,
        Fotos, Bewertungen) sind geistiges Eigentum des jeweiligen Nutzers; die Plattform
        erhält lediglich eine nicht-exklusive Lizenz, die für die Anzeige erforderlich ist.
      </p>

      <h2>Datenquellen</h2>
      <p>
        Die Basisdaten (Name, Adresse, Koordinaten) einzelner Einträge im Branchenbuch stammen
        teilweise aus der Datenbank von{" "}
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">
          OpenStreetMap
        </a>{" "}
        — © OpenStreetMap-Mitwirkende, gemäß der{" "}
        <a href="https://opendatacommons.org/licenses/odbl/" target="_blank" rel="noopener noreferrer">
          ODbL-Lizenz
        </a>
        . Die Kartenkacheln werden von CARTO / Esri bereitgestellt. Die Wechselkursdaten sind
        informativer Natur und stammen von Drittanbietern.
      </p>

      <h2>Online-Streitbeilegung (OS)</h2>
      <p>
        Die frühere OS-Plattform der Europäischen Kommission wurde{" "}
        <strong>am 20. Juli 2025 eingestellt</strong>. Bei einer verbraucherrechtlichen
        Streitigkeit kannst du dich an die <strong>Verbraucherschlichtungsstelle</strong> deines
        gewöhnlichen Aufenthalts-Mitgliedstaats (alternative Streitbeilegung, AS) wenden. Der
        Betreiber ist zudem offen für eine außergerichtliche Streitbeilegung per E-Mail:{" "}
        <a href={`mailto:${OPERATOR.contactEmail}`}>{OPERATOR.contactEmail}</a>.
      </p>

      <h2>DSA-Transparenz</h2>
      <p>
        kinti.app ist eine <strong>„Kleinstplattform"</strong> im Sinne der EU-Verordnung über
        digitale Dienste (2022/2065/EU — DSA). Die für die Veröffentlichung eines jährlichen
        Transparenzberichts gemäß Artikel 24 DSA maßgebliche Nutzerschwelle wird mit der
        aktuellen Nutzerzahl der Plattform nicht erreicht. Gesetzlich vorgeschriebene
        Kontaktstelle: <a href={`mailto:${OPERATOR.contactEmail}`}>{OPERATOR.contactEmail}</a>.
      </p>

      <h2>Domain</h2>
      <p>Der Dienst ist unter der Domain {OPERATOR.authDomain} erreichbar.</p>
    </>
  );
}

function ImpresszumEN() {
  return (
    <>
      <p>
        Under <strong>Directive 2000/31/EC</strong> on electronic commerce and the applicable
        national legislation, the details of the operator of the kinti.app service are as follows:
      </p>

      <h2>Operator</h2>
      <ul>
        <li>Company name: <strong>{OPERATOR.name}</strong></li>
        <li>Legal form: limited liability company (S.R.L., Romania)</li>
        <li>Authorized representative (managing director): <strong>{OPERATOR.representative}</strong></li>
        <li>Company registration number: <strong>{OPERATOR.regNumber}</strong></li>
        <li>Tax ID (CUI): <strong>{OPERATOR.cui}</strong></li>
        <li>
          Registered address: {OPERATOR.address}
          <br />
          <span className="text-ink-muted">Registered seat — also valid for legal service of documents.</span>
        </li>
        <li>Phone: <a href={`tel:${OPERATOR.phone.replace(/\s/g, "")}`}>{OPERATOR.phone}</a></li>
        <li>
          Contact e-mail: <a href={`mailto:${OPERATOR.contactEmail}`}>{OPERATOR.contactEmail}</a>
        </li>
        <li>
          Report abuse: <a href={`mailto:${OPERATOR.abuseEmail}`}>{OPERATOR.abuseEmail}</a>
        </li>
        <li>
          DSA point of contact: <a href={`mailto:${OPERATOR.contactEmail}`}>{OPERATOR.contactEmail}</a>{" "}
          (under Article 11 of the EU Digital Services Act, 2022/2065)
        </li>
      </ul>

      <h2>Hosting provider</h2>
      <p>{OPERATOR.hostingProvider}</p>

      <h2>Nature of the service</h2>
      <p>
        kinti.app is a <strong>community platform</strong> that helps connect the Hungarian
        community living in Switzerland and Europe with related businesses and professionals.
        The <strong>core features</strong> (search, events, calculators) are free to use;
        certain <strong>premium features</strong> are available through an optional PRO
        subscription. The Service operates as an <strong>intermediary platform</strong> (an
        "intermediary service" within the meaning of DSA 2022/2065).
      </p>

      <h2>Liability</h2>
      <p>
        The operator is not responsible for content published by users. The platform operates
        a "notice-and-takedown" system: if you believe content is unlawful, send a notice to{" "}
        <a href={`mailto:${OPERATOR.abuseEmail}`}>{OPERATOR.abuseEmail}</a>, and we will act
        without delay.
      </p>
      <p>
        The <strong>data, calculation results, map points, and community reports</strong> shown
        on the platform are for informational purposes only; the operator <strong>accepts no
        liability</strong> for their accuracy, currency, or consequences. Rules and data may
        change without prior notice.
      </p>

      <h2>Copyright</h2>
      <p>
        © 2025–2026 Feedback Jobs S.R.L. / kinti.app. All rights reserved.
        The platform's design, logo, codebase, and edited content are protected by copyright.
        Content uploaded by users (listings, photos, reviews) remains the intellectual property
        of the respective user; the platform receives only a non-exclusive licence necessary
        for displaying it.
      </p>

      <h2>Data sources</h2>
      <p>
        The base data (name, address, coordinates) of some Directory entries originates in part
        from the{" "}
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">
          OpenStreetMap
        </a>{" "}
        database — © OpenStreetMap contributors, under the{" "}
        <a href="https://opendatacommons.org/licenses/odbl/" target="_blank" rel="noopener noreferrer">
          ODbL licence
        </a>
        . Map tiles are provided by CARTO / Esri. Exchange-rate data is for informational
        purposes only and comes from third parties.
      </p>

      <h2>Online dispute resolution (ODR)</h2>
      <p>
        The European Commission's former ODR platform <strong>was discontinued on 20 July
        2025</strong>. In the event of a consumer dispute, you may contact the{" "}
        <strong>consumer dispute resolution body</strong> of your member state of habitual
        residence (alternative dispute resolution, ADR). The operator is also open to
        out-of-court dispute resolution by email: <a href={`mailto:${OPERATOR.contactEmail}`}>{OPERATOR.contactEmail}</a>.
      </p>

      <h2>DSA transparency</h2>
      <p>
        kinti.app is a <strong>"micro platform"</strong> under the EU Digital Services Act
        (2022/2065/EU — DSA). The user threshold for publishing an annual transparency report
        under Article 24 DSA is not met by the platform's current user count. Point of contact
        required by law: <a href={`mailto:${OPERATOR.contactEmail}`}>{OPERATOR.contactEmail}</a>.
      </p>

      <h2>Domain</h2>
      <p>The service is available under the domain {OPERATOR.authDomain}.</p>
    </>
  );
}
