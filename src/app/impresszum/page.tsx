import { LegalPage } from "@/components/legal-page";

export const runtime = "edge";
export const dynamic = "force-static";

export const metadata = { title: "Impresszum" };

const OPERATOR = {
  name: "Petor Péter",
  role: "magánszemély üzemeltető (közösségi kezdeményezés)",
  address: "A postai cím jogi levelezés céljából írásos kérésre elérhető.",
  email: "info@kinti.app",
  contactEmail: "info@kinti.app",
  abuseEmail: "abuse@kinti.app",
  hostingProvider: "Cloudflare, Inc. — 101 Townsend St, San Francisco, CA 94107, USA",
  authDomain: "kinti.app",
};

export default function ImpresszumPage() {
  return (
    <LegalPage title="Impresszum" updatedAt="2026-05-25">
      <p>
        Az elektronikus kereskedelmi szolgáltatásokról szóló <strong>2001. évi CVIII. törvény</strong>{" "}
        4. §-a alapján a kinti.app szolgáltatás üzemeltetőjének adatai:
      </p>

      <h2>Üzemeltető</h2>
      <ul>
        <li>Név: <strong>{OPERATOR.name}</strong></li>
        <li>Jogállás: {OPERATOR.role}</li>
        <li>Tartózkodási hely: {OPERATOR.address}</li>
        <li>
          Kapcsolat: <a href={`mailto:${OPERATOR.contactEmail}`}>{OPERATOR.contactEmail}</a>
        </li>
        <li>
          Visszaélés-bejelentés: <a href={`mailto:${OPERATOR.abuseEmail}`}>{OPERATOR.abuseEmail}</a>
        </li>
      </ul>

      <h2>Tárhely-szolgáltató</h2>
      <p>{OPERATOR.hostingProvider}</p>

      <h2>A szolgáltatás jellege</h2>
      <p>
        A kinti.app egy <strong>közösségi platform</strong>, amely a Svájcban és Európában élő magyar
        közösség és a velük kapcsolatban álló vállalkozások / szakemberek találkozását segíti.
        A platform <strong>non-profit, ingyenes, közösségi kezdeményezés</strong> — sem a felhasználóktól,
        sem a regisztrált vállalkozóktól nem szed díjat.
      </p>

      <h2>Felelősség</h2>
      <p>
        Az üzemeltető nem felelős a felhasználók által közzétett tartalmakért. A platform
        értesítési-eltávolítási („notice-and-takedown") rendszerrel működik: jogsértőnek vélt
        tartalom esetén küldj értesítést az <a href={`mailto:${OPERATOR.abuseEmail}`}>{OPERATOR.abuseEmail}</a> címre,
        és haladéktalanul intézkedünk.
      </p>

      <h2>Domain</h2>
      <p>A szolgáltatás a {OPERATOR.authDomain} domain alatt érhető el.</p>
    </LegalPage>
  );
}