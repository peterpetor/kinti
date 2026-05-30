import { LegalPage } from "@/components/legal-page";

export const runtime = "edge";
export const dynamic = "force-static";

export const metadata = { title: "Impresszum" };

const OPERATOR = {
  name: "Petor Péter",
  role: "közösségi kezdeményezés",
  address: "2660 Balassagyarmat, Madách liget 13/2. fsz. 2., Magyarország",
  addressNote: "Levelezési cím — jogi kézbesítés is itt érvényes.",
  email: "info@kinti.app",
  contactEmail: "info@kinti.app",
  abuseEmail: "abuse@kinti.app",
  hostingProvider: "Cloudflare, Inc. — 101 Townsend St, San Francisco, CA 94107, USA",
  authDomain: "kinti.app",
};

export default function ImpresszumPage() {
  return (
    <LegalPage title="Impresszum" updatedAt="2026-05-30">
      <p>
        Az elektronikus kereskedelmi szolgáltatásokról szóló <strong>2001. évi CVIII. törvény</strong>{" "}
        4. §-a alapján a kinti.app szolgáltatás üzemeltetőjének adatai:
      </p>

      <h2>Üzemeltető</h2>
      <ul>
        <li>Név: <strong>{OPERATOR.name}</strong></li>
        <li>Jogállás: {OPERATOR.role} (magánszemély, nem gazdasági társaság)</li>
        <li>
          Postai cím: {OPERATOR.address}
          <br />
          <span className="text-ink-muted">{OPERATOR.addressNote}</span>
        </li>
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
        A platform <strong>non-profit, ingyenes, közösségi kezdeményezés</strong> — sem a felhasználóktól,
        sem a regisztrált vállalkozóktól nem szed díjat. A Szolgáltatás <strong>közvetítő
        platformként</strong> működik (DSA 2022/2065 értelmében „közvetítő szolgáltató").
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
        © 2024–2026 Petor Péter / kinti.app. Minden jog fenntartva.
        A platform arculata, logója, kódbázisa és szerkesztett tartalmai szerzői jogi
        védelem alatt állnak. A felhasználók által feltöltött tartalmak (hirdetések, fotók,
        vélemények) az adott felhasználó szellemi tulajdonát képezik; a platform csak a
        megjelenítéshez szükséges, nem kizárólagos licencet kap ezek közlésére.
      </p>

      <h2>Online vitarendezés (ODR)</h2>
      <p>
        Az Európai Bizottság online vitarendezési platformot működtet fogyasztói jogviták
        rendezésére:{" "}
        <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noreferrer">
          ec.europa.eu/consumers/odr
        </a>. Ezen a platformon fogyasztói panasz nyújtható be az üzemeltetővel szemben.
        Az üzemeltető email-alapú vitarendezésre is nyitott: <a href={`mailto:${OPERATOR.contactEmail}`}>{OPERATOR.contactEmail}</a>.
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
    </LegalPage>
  );
}