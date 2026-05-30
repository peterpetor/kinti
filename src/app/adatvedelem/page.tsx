import { LegalPage } from "@/components/legal-page";

export const runtime = "edge";
export const dynamic = "force-static";

export const metadata = { title: "Adatkezelési Tájékoztató" };

export default function AdatvedelemPage() {
  return (
    <LegalPage title="Adatkezelési Tájékoztató" updatedAt="2026-05-30">
      <p>
        Ez a tájékoztató ismerteti, milyen személyes adatokat kezelünk a kinti.app szolgáltatás
        nyújtása során, milyen jogalapon, mennyi ideig, és milyen jogaid vannak ezzel kapcsolatban.
        Az adatkezelés az Európai Parlament és a Tanács (EU) <strong>2016/679. számú rendelete
        (GDPR)</strong>, valamint a svájci Szövetségi Adatvédelmi Törvény (FADP/DSG) alapján történik.
      </p>

      <h2>1. Adatkezelő</h2>
      <p>
        Adatkezelő: <strong>{"Petor Péter"}</strong> (közösségi kezdeményezés).<br />
        Postai cím: 2660 Balassagyarmat, Madách liget 13/2. fsz. 2., Magyarország.<br />
        Elérhetőség: <a href="mailto:info@kinti.app">info@kinti.app</a>
      </p>
      <p>
        Adatvédelmi tisztviselő kijelölésére jogszabály nem kötelez, mivel az adatkezelés
        nem felel meg a GDPR 37. cikk (1) szerinti feltételeknek.
      </p>

      <h2>2. Milyen adatokat kezelünk?</h2>

      <h3>2.0 Korhatár</h3>
      <p>
        A Szolgáltatást <strong>18. életévét betöltött</strong> (nagykorú)
        személyek vehetik igénybe (Ptk. 2:10 §). Ennél fiatalabb
        felhasználóktól tudatosan nem gyűjtünk adatot; ha mégis tudomást
        szerzünk ilyenről, az érintett adatokat haladéktalanul töröljük.
      </p>


      <h3>2.1 Adminisztrátor-belépés (Clerk)</h3>
      <p>
        <strong>A vállalkozói flow regisztráció-mentes</strong> — a Clerk Inc. (USA) szolgáltatást
        kizárólag az oldal adminisztrátorának belépéséhez használjuk (egyetlen admin email).
        A látogatók / vállalkozók / hirdetésfeladók sehol nem találkoznak Clerk regisztrációval.
      </p>
      <ul>
        <li><strong>Jogalap:</strong> GDPR 6. cikk (1) b) — szerződés teljesítése</li>
        <li><strong>Tárolási idő:</strong> a fiók törléséig + 30 nap (audit)</li>
        <li><strong>Adatfeldolgozó:</strong> Clerk Inc. — <a href="https://clerk.com/privacy" target="_blank" rel="noreferrer">privacy policy</a></li>
      </ul>

      <h3>2.2 Vállalkozási adatok (D1 adatbázis)</h3>
      <p>
        A vállalkozó által megadott céges adatok (cégnév, cím, telefonszám, kategória, fotó / logó).
        Ezek a vállalkozás megtalálhatóságát szolgálják.
      </p>
      <ul>
        <li><strong>Jogalap:</strong> GDPR 6. cikk (1) b) — szerződés teljesítése</li>
        <li><strong>Tárolási idő:</strong> a vállalkozás törléséig</li>
      </ul>

      <h3>2.3 Hirdetésfeladás (account nélkül)</h3>
      <p>
        Hirdetés feladásához nincs szükség regisztrációra. A hirdetésfeladáskor megadott adatok:
      </p>
      <ul>
        <li>Email-cím (kizárólag tranzakciós megerősítő linkek küldésére — sehol nem jelenik meg nyilvánosan)</li>
        <li>Hirdetés szövege és kategóriája</li>
        <li>Opcionális megjelenő név</li>
        <li><strong>Technikai és kapcsolattartási folyamatok</strong>:
          <ul>
            <li><strong>Kapcsolatfelvétel</strong>: A feladó a telefonszámát vagy egyéb publikus elérhetőségét adhatja meg a hirdetésében. A kinti.app belső üzenetküldőt nem üzemeltet, és nem közvetít üzeneteket a felek között.</li>
            <li><strong>Képek feltöltése</strong>: A feltöltött képek a Cloudflare R2 felhőtárolóba kerülnek, amiket a hirdetés lejártával fizikailag törlünk.</li>
            <li><strong>Esemény jelentkezés (RSVP)</strong>: A spam-védelem érdekében a jelentkezések során az IP-címeket egyirányú, visszafejthetetlen (SHA-256) hash formátumban tároljuk.</li>
            <li><strong>Biztonságos tartalomkezelés</strong>: A hirdetések utólagos szerkesztéséhez szükséges azonosító kulcsok (tokenek) kizárólag a felhasználó böngészőjében (<code>localStorage</code>) tárolódnak.</li>
          </ul>
        </li>
      </ul>
      <ul>
        <li><strong>Jogalap:</strong> GDPR 6. cikk (1) a) — hozzájárulás</li>
        <li><strong>Tárolási idő:</strong> a hirdetés lejártáig (30 nap), vagy a feladó által
          kezdeményezett törlésig (a kezelő-link a böngésző localStorage-jában él).</li>
      </ul>

      <div style={{
        background: "var(--surface-alt, #f4ede0)",
        border: "1px solid var(--border, #e6ebe5)",
        borderRadius: 14,
        padding: "14px 16px",
        margin: "16px 0",
      }}>
        <p style={{ margin: 0, fontWeight: 700 }}>🔒 Automatikus, visszavonhatatlan törlés</p>
        <p style={{ margin: "6px 0 0" }}>
          Az adattakarékosság elve alapján csak addig tárolunk adatot, amíg muszáj. Egy
          automatikus napi szkript (Cloudflare cron) <strong>fizikailag és véglegesen törli</strong>:
        </p>
        <ul style={{ margin: "8px 0 0" }}>
          <li>a <strong>lejárt hirdetéseket</strong> (30 nap) a hozzájuk tartozó képekkel (R2) együtt;</li>
          <li>a <strong>30 napnál régebben lezajlott eseményeket</strong> a képeikkel és a leadott
            RSVP-kkel együtt;</li>
          <li>a meg nem erősített piszkozatokat és beküldéseket (24 órán túl).</li>
        </ul>
        <p style={{ margin: "8px 0 0" }}>
          Ami már nincs nálunk, az nem szivároghat ki. A törlés visszaállíthatatlan.
        </p>
      </div>

      <h3>2.4 Technikai adatok (Cloudflare)</h3>
      <p>
        A Cloudflare automatikusan kezeli a kérések metaadatait (IP-cím, User-Agent, kérés
        időbélyege) a DDoS-védelem és rendelkezésre állás biztosítása érdekében. Ezeket az
        adatokat <strong>nem tároljuk saját adatbázisban</strong>.
      </p>
      <ul>
        <li><strong>Jogalap:</strong> GDPR 6. cikk (1) f) — jogos érdek (rendszer-biztonság)</li>
        <li><strong>Adatfeldolgozó:</strong> Cloudflare, Inc. — <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noreferrer">privacy policy</a></li>
      </ul>

      <h3>2.5 Cloudflare Turnstile (CAPTCHA)</h3>
      <p>
        A hirdetésfeladó űrlapon a Cloudflare Turnstile szolgáltatás védi a rendszert a
        spam-bot támadásoktól. A Turnstile <strong>nem használ cookie-t</strong> és <strong>nem
        gyűjt személyazonosításra alkalmas adatot</strong>, csak az IP-cím alapján értékeli
        a kérés jellegét (bot vagy ember).
      </p>

      <h3>2.6 Tranzakciós emailek és Értesítők (Resend)</h3>
      <p>
        A felhasználók által kért megerősítő linkeket, biztonsági másolatokat (backup) és lejárati 
        figyelmeztetőket a Resend Inc. (USA) szolgáltatásán keresztül küldjük ki. Ezen kívül a Resend 
        kezeli az adminisztrátor-értesítőket is (új esemény moderálása, tartalom-bejelentés). 
        Az email-címek kizárólag a technikai kiküldés idejére haladnak át a Resend szerverein.
      </p>
      <div style={{
        background: "var(--surface-alt, #f4ede0)",
        border: "1px solid var(--border, #e6ebe5)",
        borderRadius: 14,
        padding: "14px 16px",
        margin: "16px 0",
      }}>
        <p style={{ margin: 0, fontWeight: 700 }}>🚫 Szigorúan reklám- és hírlevélmentes</p>
        <p style={{ margin: "6px 0 0" }}>
          A kinti.app üzemeltetője semmilyen marketing célú (hírlevél, reklám, ajánlat) e-mailt 
          vagy SMS-t nem küld a megadott e-mail címekre és telefonszámokra. A megadott adatokat 
          <strong>kizárólag</strong> az általad indított folyamatok (megerősítés, törlés, lejárat) 
          hitelesítésére használjuk. Nincs "spam".
        </p>
      </div>
      <ul>
        <li><strong>Adatfeldolgozó:</strong> Resend, Inc. — <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noreferrer">privacy policy</a></li>
      </ul>

      <h3>2.7 Helyadatok (GPS koordináták)</h3>
      <p>
        A Szolgáltatás használata során — a közeledben lévő szakemberek, vállalkozások vagy közösségi 
        bejegyzések megjelenítése érdekében — engedélyezheted az eszközöd helymeghatározó funkcióját (GPS). 
        A helyadatok feldolgozása átmeneti: azokat <strong>nem kötjük a személyazonosságodhoz, nem tároljuk 
        szerveroldali adatbázisban</strong>, és nem használjuk nyomkövetésre vagy profilalkotásra. A helymeghatározás 
        bármikor letiltható a böngésződ beállításaiban.
      </p>

      <h3>2.8 Moderáció és Tiltólisták (Jogos érdek)</h3>
      <p>
        A platform biztonsága, a spam-támadások kivédése és a közösség védelme érdekében a moderátorok 
        által az ÁSZF súlyos megsértése miatt véglegesen kitiltott felhasználók technikai azonosítóit 
        (pl. IP-cím hash, visszaélésszerű e-mail címek hash formátuma) egy belső tiltólistán (blocklist) tárolhatjuk.
      </p>
      <ul>
        <li><strong>Jogalap:</strong> GDPR 6. cikk (1) f) — jogos érdek (visszaélések megakadályozása)</li>
        <li><strong>Tárolási idő:</strong> a kitiltás visszavonásáig (jellemzően határozatlan ideig)</li>
      </ul>

      <h3>2.9 Kinti Radar (Push Értesítések)</h3>
      <p>
        A böngésződben engedélyezheted a Push értesítéseket, és feliratkozhatsz bizonyos témákra (pl. albérlet, árfolyam). 
        Ezeket a preferenciákat (Radar paraméterek) és a böngésződ által generált, személytelen <code>push_endpoint</code> URL-t 
        tároljuk az adatbázisunkban, hogy ki tudjuk küldeni az értesítőt.
      </p>
      <ul>
        <li><strong>Jogalap:</strong> GDPR 6. cikk (1) a) — hozzájárulás (a böngésző szintjén és a "Radar Aktiválása" gombbal)</li>
        <li><strong>Tárolási idő:</strong> Amíg a böngésződben le nem tiltod az értesítéseket, vagy a felületen a "Radar törlése" gombra nem kattintasz.</li>
        <li><strong>Jogi nyilatkozat (Árfolyam):</strong> Az értesítések tartalmáért (különösen a pénzügyi, árfolyami adatokért) felelősséget nem vállalunk. Az adatok tájékoztató jellegűek, a késésekből vagy pontatlanságokból eredő anyagi károkért a kinti.app nem perelhető.</li>
      </ul>

      <h2>3. Cookie-k</h2>
      <p>
        Csak <strong>feltétlenül szükséges</strong> cookie-kat használunk: a Clerk session-cookie
        kizárólag az adminisztrátor belépéséhez (egyetlen admin email). A látogatóknak,
        vállalkozóknak, hirdetésfeladóknak <strong>nincs cookie-juk</strong>. Marketing-,
        analitikai-, vagy 3rd-party tracking cookie-kat <strong>nem használunk</strong>.
      </p>

      <h2>4. Adatok továbbítása harmadik országba</h2>
      <p>
        A Clerk, a Cloudflare és a Resend USA-ban bejegyzett, ottani szervereket is használó 
        vállalatok. Az EU–USA adattranszferek a 2023-as EU–US Data Privacy Framework (DPF), 
        illetve az Európai Bizottság által elfogadott általános adatvédelmi kikötések (SCC)
        alapján történnek, amelyek biztosítják a GDPR-nak megfelelő magas szintű adatvédelmet.
      </p>

      <h2>5. Jogaid</h2>
      <ul>
        <li><strong>Hozzáférés (Art. 15)</strong> — kérheted az adataid másolatát</li>
        <li><strong>Helyesbítés (Art. 16)</strong> — pontatlan adat javítása</li>
        <li><strong>Törlés (Art. 17)</strong> — adataid törlése („elfeledtetés joga")</li>
        <li><strong>Korlátozás (Art. 18)</strong> — az adatkezelés ideiglenes leállítása</li>
        <li><strong>Hordozhatóság (Art. 20)</strong> — adataid kiadása strukturált formában</li>
        <li><strong>Tiltakozás (Art. 21)</strong> — különösen a jogos érdek alapján kezelt adatok ellen</li>
      </ul>
      <p>
        Bármelyik jog gyakorlásához írj erre a címre:{" "}
        <a href="mailto:info@kinti.app">info@kinti.app</a> — a beérkezéstől számított
        <strong> 30 napon belül</strong> válaszolunk.
      </p>

      <h3>5.1 Hogyan kérheted az adataid végleges törlését?</h3>
      <p>
        A platformon tárolt adataid végleges és visszaállíthatatlan törlését az alábbi egyszerű és automatizált módokon tudod kezdeményezni:
      </p>
      <ul>
        <li>
          <strong>Hirdetések törlése</strong>: Minden feladott hirdetés megerősítő e-mailjében küldünk egy egyedi <em>hirdetés-kezelő linket</em>. Erre rákattintva egyetlen gombnyomással azonnal és véglegesen törölheted a hirdetésedet a kinti.app felületéről.
        </li>
        <li>
          <strong>Vélemények törlése</strong>: Hasonlóan a hirdetésekhez, a véleményed elküldése után kapott megerősítő e-mail tartalmaz egy egyedi <em>vélemény-kezelő linket</em>, amellyel bármikor azonnal és véglegesen törölheted a leadott értékelésedet.
        </li>
        <li>
          <strong>Vállalkozás törlése</strong>: A beküldés után kapott (és a böngésződben mentett) egyedi <em>vállalkozás-kezelő link</em> segítségével bármikor azonnal és véglegesen törölheted a szaknévsoros profilodat, anélkül, hogy ehhez jelszó vagy fiók kellene.
        </li>
        <li>
          <strong>Kézi törlési kérelem (E-mailben)</strong>: Ha a fenti automatizált linkek már nem állnak rendelkezésedre, bármikor írhatsz nekünk az <a href="mailto:info@kinti.app">info@kinti.app</a> címre a regisztrált vagy hirdetéskor használt e-mail címedről, és kérésedre munkatársaink haladéktalanul (legfeljebb 5 munkanapon belül) véglegesen törlik a hirdetéseidet, véleményeidet vagy vállalkozói profilodat.
        </li>
      </ul>

      <h2>6. Panasz</h2>
      <p>
        Ha úgy érzed, hogy az adatkezelésünk sérti a jogaidat, panasszal fordulhatsz a Nemzeti
        Adatvédelmi és Információszabadság Hatósághoz (NAIH):
      </p>
      <ul>
        <li>Cím: 1055 Budapest, Falk Miksa utca 9-11.</li>
        <li>Posta: 1363 Budapest, Pf. 9.</li>
        <li>Email: <a href="mailto:ugyfelszolgalat@naih.hu">ugyfelszolgalat@naih.hu</a></li>
        <li>Web: <a href="https://naih.hu" target="_blank" rel="noreferrer">naih.hu</a></li>
      </ul>

      <h2>7. Adatvédelmi Incidensek Kezelése (Data Breach)</h2>
      <p>
        Bár rendszerünk account-mentes és minimalizált adatkezelést folytat (az IP-címeket hash-eljük, a tartalmakat auto-töröljük), 
        egy esetleges adatvédelmi incidens (pl. hacker támadás, adatbázis kompromittálódása) esetén a GDPR 33. cikkének 
        megfelelően járunk el: az incidenst indokolatlan késedelem nélkül, de legkésőbb a tudomásszerzéstől számított 
        <strong>72 órán belül bejelentjük a NAIH-nak</strong>. Amennyiben az incidens magas kockázattal jár a 
        felhasználók jogaira nézve, az érintetteket nyilvános felhívás útján és (ha rendelkezésre áll) e-mailben is tájékoztatjuk.
      </p>

      <h2>8. Változtatások</h2>
      <p>
        Ezt a tájékoztatót szükség szerint frissítjük. A módosításokat ezen az oldalon
        jelezzük, a tetején lévő „Utolsó frissítés" dátum jelzi az aktuális verziót.
      </p>
    </LegalPage>
  );
}
