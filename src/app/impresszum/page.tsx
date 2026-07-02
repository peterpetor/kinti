import { LegalPage } from "@/components/legal-page";

export const dynamic = "force-static";

export const metadata = { title: "Impresszum" };

const OPERATOR = {
  name: "Feedback Jobs S.R.L.",
  role: "korlátolt felelősségű társaság (S.R.L., Románia)",
  address: "Cart. Bekecs, Bloc F, Ap. 15, 545500 Szováta (Sovata), Maros megye, Románia",
  addressNote: "Bejegyzett székhely — jogi kézbesítés is itt érvényes.",
  email: "info@kinti.app",
  contactEmail: "info@kinti.app",
  abuseEmail: "abuse@kinti.app",
  hostingProvider: "Cloudflare, Inc. — 101 Townsend St, San Francisco, CA 94107, USA",
  authDomain: "kinti.app",
  cui: "53137115",
  regNumber: "J2025098494007",
  phone: "+40 752 607 245",
};

export default function ImpresszumPage() {
  return (
    <LegalPage title="Impresszum" updatedAt="2026-06-15">
      <p>
        Az elektronikus kereskedelemről szóló <strong>2000/31/EK irányelv</strong> és a
        vonatkozó nemzeti jogszabályok alapján a kinti.app szolgáltatás üzemeltetőjének adatai:
      </p>

      <h2>Üzemeltető</h2>
      <ul>
        <li>Cégnév: <strong>{OPERATOR.name}</strong></li>
        <li>Jogállás: {OPERATOR.role}</li>
        <li>Cégjegyzékszám: <strong>{OPERATOR.regNumber}</strong></li>
        <li>Adószám (CUI): <strong>{OPERATOR.cui}</strong></li>
        <li>
          Székhely: {OPERATOR.address}
          <br />
          <span className="text-ink-muted">{OPERATOR.addressNote}</span>
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
    </LegalPage>
  );
}