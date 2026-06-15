import { LegalPage } from "@/components/legal-page";

export const runtime = "edge";
export const dynamic = "force-static";

export const metadata = { title: "Adatkezelési Tájékoztató" };

export default function AdatvedelemPage() {
  return (
    <LegalPage title="Adatkezelési Tájékoztató" updatedAt="2026-06-15">
      <p>
        Ez a tájékoztató ismerteti, milyen személyes adatokat kezelünk a kinti.app szolgáltatás
        nyújtása során, milyen jogalapon, mennyi ideig, és milyen jogaid vannak ezzel kapcsolatban.
        Az adatkezelés az Európai Parlament és a Tanács (EU) <strong>2016/679. számú rendelete
        (GDPR)</strong>, valamint a svájci Szövetségi Adatvédelmi Törvény (FADP/DSG) alapján történik.
      </p>

      <h2>1. Adatkezelő</h2>
      <p>
        Adatkezelő: <strong>Feedback Jobs S.R.L.</strong><br />
        Székhely: Cart. Bekecs, Bloc F, Ap. 15, 545500 Szováta (Sovata), Maros megye, Románia.<br />
        Cégjegyzékszám: J2025098494007 · Adószám (CUI): 53137115.<br />
        Elérhetőség: <a href="mailto:info@kinti.app">info@kinti.app</a> · Telefon:{" "}
        <a href="tel:+40752607245">+40 752 607 245</a>
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
        A látogatók / vállalkozók / tartalom-beküldők sehol nem találkoznak Clerk regisztrációval.
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

      <h3>2.3 Tartalom-beküldés (account nélkül)</h3>
      <p>
        A közösségi tartalmak (esemény, vélemény, vállalkozás-beküldés stb.) feladásához nincs
        szükség regisztrációra. A beküldéskor megadott adatok:
      </p>
      <ul>
        <li>Email-cím (kizárólag tranzakciós megerősítő linkek küldésére — sehol nem jelenik meg nyilvánosan)</li>
        <li>A beküldött tartalom szövege és kategóriája</li>
        <li>Opcionális megjelenő név</li>
        <li><strong>Technikai és kapcsolattartási folyamatok</strong>:
          <ul>
            <li><strong>Kapcsolatfelvétel</strong>: A feladó a telefonszámát vagy egyéb publikus elérhetőségét adhatja meg. A kinti.app belső üzenetküldőt nem üzemeltet, és nem közvetít üzeneteket a felek között.</li>
            <li><strong>Képek feltöltése</strong>: A feltöltött képek a Cloudflare R2 felhőtárolóba kerülnek, amiket a tartalom lejártával / törlésével fizikailag törlünk.</li>
            <li><strong>Esemény jelentkezés (RSVP)</strong>: A spam-védelem érdekében a jelentkezések során az IP-címeket egyirányú, visszafejthetetlen (SHA-256) hash formátumban tároljuk.</li>
            <li><strong>Biztonságos tartalomkezelés</strong>: A tartalom utólagos szerkesztéséhez szükséges azonosító kulcsok (tokenek) kizárólag a felhasználó böngészőjében (<code>localStorage</code>) tárolódnak.</li>
          </ul>
        </li>
      </ul>
      <ul>
        <li><strong>Jogalap:</strong> GDPR 6. cikk (1) a) — hozzájárulás</li>
        <li><strong>Tárolási idő:</strong> a tartalom lejártáig vagy a feladó által
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
        A beküldő űrlapokon a Cloudflare Turnstile szolgáltatás védi a rendszert a
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

      <h3>2.9 Mesterséges intelligencia (AI) feldolgozás — Cloudflare Workers AI</h3>
      <p>
        A platform helyenként <strong>nagy nyelvi modellre (LLM) épülő AI-funkciókat</strong>{" "}
        kínál (lásd ÁSZF 13.1). A modell-hívások a Cloudflare Workers AI infrastruktúráján
        futnak, az Európában elhelyezett Cloudflare edge-szervereken (Meta Llama nyílt
        forrású modell, payload-szintű loggolás nélkül).
      </p>
      <p>
        Az AI funkciók által feldolgozott adatok:
      </p>
      <ul>
        <li>
          <strong>Vélemény-összegzés</strong>: az érintett vállalkozó publikus,
          megerősített véleményeinek szövege és csillag-értékelése. Ezek a vélemények
          már a publikus profil-oldalon elérhetők; a Workers AI feldolgozással új
          személyes adat nem keletkezik.
        </li>
        <li>
          <strong>Természetes nyelvű kereső</strong>: a felhasználó által beírt keresési
          mondat (max 200 karakter). NEM tartalmazhat személyes adatot.
        </li>
        <li>
          <strong>Vállalkozói leírás-asszisztens</strong>: a vállalkozó által beírt
          leírás-szöveg (max 1000 karakter), ami egyébként is publikussá válik a
          profilján.
        </li>
        <li>
          <strong>Német szó-szótár</strong>: egyetlen szó vagy rövid kifejezés (max
          60 karakter). Személyes adatot nem tartalmaz.
        </li>
      </ul>
      <ul>
        <li><strong>Jogalap</strong>: GDPR 6. cikk (1) f) — jogos érdek
          (felhasználói élmény javítása); a vélemény-összegzésnél a publikus tartalom
          további feldolgozása szintén jogos érdek alapján történik.</li>
        <li><strong>Tárolási idő</strong>: a Workers AI <strong>nem tárolja</strong>{" "}
          a feldolgozott bemenetet és kimenetet (training-célra sem); az AI-válaszok
          edge-cache-elve maximum 30 napig (vélemény-összegzés) vagy 7 napig
          (német szó-szótár).</li>
        <li><strong>Adatfeldolgozó</strong>: Cloudflare, Inc. (Workers AI) —{" "}
          <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noreferrer">privacy policy</a>;{" "}
          <a href="https://developers.cloudflare.com/workers-ai/privacy/" target="_blank" rel="noreferrer">Workers AI adatkezelés</a>.</li>
        <li><strong>Spam-védelem</strong>: az AI-hívásokat IP-cím hash alapú
          rate-limit védi; ennek logja maximum 24 óráig él, utána automatikusan
          törlődik.</li>
      </ul>

      <h3>2.10 Vállalkozói analitika</h3>
      <p>
        A vállalkozó saját kezelő-linkjén látható aggregált forgalmi adatokat (profil-
        megnyitás-szám, telefonszám-kattintás-szám napi bontásban) az alábbiak szerint
        kezeljük:
      </p>
      <ul>
        <li>A számlálók <strong>anonim aggregátumok</strong> — nem tartalmaznak IP-címet,
          böngésző-azonosítót vagy bármilyen, az egyes látogatókra visszavezethető
          adatot a vállalkozó felé.</li>
        <li>A duplikáció elkerülésére rövid ideig (legfeljebb 7 nap) tároljuk a látogatói
          IP-cím <strong>SHA-256 hash-ét</strong> + óra-pontosságú időbélyeget. Ezt
          a vállalkozó NEM látja; kizárólag a számláló helyességét biztosítja.</li>
        <li><strong>Jogalap</strong>: GDPR 6. cikk (1) f) — jogos érdek (a vállalkozó
          tájékoztatása a saját profiljának forgalmáról).</li>
        <li><strong>Tárolási idő</strong>: az aggregált számlálók a vállalkozói rekord
          létezéséig, a dedupe-tábla IP-hash-rekordjai 7 napig.</li>
      </ul>

      <h3>2.11 Mentett bér-ajánlatok (Bérkalkulátor „Ajánlataim")</h3>
      <p>
        A Bérkalkulátor „Ajánlataim" funkciója a felhasználó által megadott
        bér-ajánlatokat (cégcímke + bér + kanton + családi állapot + kor-sáv stb.)
        kizárólag a felhasználó saját böngészőjében (<code>localStorage</code>)
        tárolja. Az üzemeltető szerverére <strong>semmilyen adat nem kerül fel</strong>,
        és más felhasználók nem férnek hozzá. Az adatok a böngésző-tároló kiürítésével
        bármikor véglegesen törölhetők.
      </p>

      <h3>2.12 Kinti Radar (Push Értesítések)</h3>
      <p>
        A böngésződben engedélyezheted a Push értesítéseket, és feliratkozhatsz bizonyos témákra (pl. árfolyam-változás).
        Ezeket a preferenciákat (Radar paraméterek) és a böngésződ által generált, személytelen <code>push_endpoint</code> URL-t 
        tároljuk az adatbázisunkban, hogy ki tudjuk küldeni az értesítőt. 
        <strong>Adatbiztonság:</strong> Az értesítések tartalmát nem küldjük át a böngésződ szolgáltatójának (Apple, Google, Mozilla) 
        push szerverein (azok csak egy üres "ébresztő" jelet kapnak), az érdemi információt a készüléked közvetlenül a mi 
        szerverünkről tölti le, így semmilyen személyes adat nem kerül harmadik félhez.
      </p>
      <ul>
        <li><strong>Jogalap:</strong> GDPR 6. cikk (1) a) — hozzájárulás (a böngésző szintjén és a "Radar Aktiválása" gombbal)</li>
        <li><strong>Tárolási idő:</strong> Amíg a böngésződben le nem tiltod az értesítéseket, vagy a felületen a "Radar törlése" gombra nem kattintasz.</li>
        <li><strong>Jogi nyilatkozat (Árfolyam):</strong> Az értesítések tartalmáért (különösen a pénzügyi, árfolyami adatokért) felelősséget nem vállalunk. Az adatok tájékoztató jellegűek, a késésekből vagy pontatlanságokból eredő anyagi károkért a kinti.app nem perelhető.</li>
      </ul>

      <h3>2.13 Akció-térkép (bolt-akció bejelentés)</h3>
      <p>
        Az akció bejelentésekor az alábbi adatok kerülnek rögzítésre:
      </p>
      <ul>
        <li><strong>GPS koordináta</strong> — a bejelentés helye a térképen</li>
        <li><strong>Bolt lánca, kategória, kedvezmény mértéke</strong></li>
        <li><strong>Opcionális:</strong> boltнév, megjegyzés szövege</li>
      </ul>
      <ul>
        <li><strong>Jogalap:</strong> GDPR 6. cikk (1) a) — hozzájárulás</li>
        <li><strong>Tárolási idő:</strong> azéjfélig (aznap), automatikus törlés</li>
        <li><strong>Nyilvánosság:</strong> az akció pontosan a bejelentő GPS-pozícióján jelenik meg a nyilvános térképen</li>
      </ul>

      <h3>2.14 Hofladen-térkép (farmárusi értékesítőhelyek bejelentése)</h3>
      <p>
        A Hofladen bejelentésekor az alábbi adatok kerülnek rögzítésre:
      </p>
      <ul>
        <li><strong>GPS koordináta</strong> — az értékesítőhely helye a térképen</li>
        <li><strong>Név, kanton, kategóriák, fizetési módok, nyitvatartás</strong></li>
        <li><strong>Opcionális megjegyzés</strong></li>
      </ul>
      <ul>
        <li><strong>Jogalap:</strong> GDPR 6. cikk (1) a) — hozzájárulás</li>
        <li><strong>Tárolási idő:</strong> határozatlan (az adat közérdekű közösségi információ — a bejegyzés törlését az info@kinti.app címen kérheted)</li>
        <li><strong>Nyilvánosság:</strong> a hely nyilvános térképen megjelenik</li>
      </ul>

      <h2>3. Cookie-k</h2>
      <p>
        Csak <strong>feltétlenül szükséges</strong> cookie-kat használunk: a Clerk session-cookie
        kizárólag az adminisztrátor belépéséhez (egyetlen admin email). A látogatóknak,
        vállalkozóknak, hirdetésfeladóknak <strong>nincs cookie-juk</strong>. Marketing-,
        analitikai-, vagy 3rd-party tracking cookie-kat <strong>nem használunk</strong>.
      </p>

      <h3>3.1 Cloudflare Web Analytics (Beacon)</h3>
      <p>
        A platform a <strong>Cloudflare Web Analytics</strong> (CF Beacon) cookie-mentes,
        GDPR-barát látogatói statisztikai eszközt használja, amennyiben a{" "}
        <code>NEXT_PUBLIC_CF_BEACON_TOKEN</code> környezeti változó be van állítva.
        Ez az eszköz <strong>nem használ cookie-t</strong>, nem gyűjt személyazonosításra
        alkalmas adatot (sem IP-cím teljes formában, sem User-Agent string),
        és nem követ felhasználókat oldalak között.
      </p>
      <ul>
        <li><strong>Kezelt adatok:</strong> oldalletöltések aggregált száma, forrás-ország (anonim), betöltési idők</li>
        <li><strong>Jogalap:</strong> GDPR 6. cikk (1) f) — jogos érdek (szolgáltatás teljesítményének mérése) — a{" "}
          <a href="https://developers.cloudflare.com/analytics/web-analytics/" target="_blank" rel="noreferrer">Cloudflare Web Analytics</a>{" "}
          kifejezetten PECR/ePrivacy-mentes megoldás, consent nem szükséges</li>
        <li><strong>Adatfeldolgozó:</strong> Cloudflare, Inc. —{" "}
          <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noreferrer">privacy policy</a></li>
      </ul>

      <h3>3.2 Svájci adatkezelési rendelkezések (revFADP)</h3>
      <p>
        Mivel a Szolgáltatás célzottan a Svájcban élő magyarokat szolgálja ki, és
        ennek során svájci illetőségű felhasználók személyes adatait is kezeljük, a
        2023. szeptember 1-én hatályba lépett svájci szövetségi adatvédelmi törvény
        (revFADP / nDSG) is irányadó. Az érintettek a magyar GDPR-hoz hasonló
        jogokkal rendelkeznek: hozzáférés, helyesbítés, törlés, korlátozás,
        adathordozhatóság, tiltakozás. Panasszal a svájci Eidgenössischer
        Datenschutz- und Öffentlichkeitsbeauftragter (EDÖB,{" "}
        <a href="https://www.edoeb.admin.ch/" target="_blank" rel="noreferrer">edoeb.admin.ch</a>
        ) hatósághoz lehet fordulni.
      </p>
      <p>
        <strong>Svájci képviselő kijelölése</strong>: a revFADP 14. cikke alapján a
        Svájcon kívüli székhelyű adatkezelőnek bizonyos feltételek mellett svájci
        képviselőt kell kijelölnie. Az üzemeltető folyamatosan értékeli ezt a
        kötelezettséget, és amennyiben a feldolgozás mértéke / rendszeressége azt
        szükségessé teszi, a képviselő kijelölését dokumentáljuk. Addig is az
        EDÖB-höz forduláshoz vagy érintetti jog gyakorlásához írj a{" "}
        <a href="mailto:info@kinti.app">info@kinti.app</a> címre — kérelmedet
        haladéktalanul továbbítjuk.
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
          <strong>Vélemények törlése</strong>: A véleményed elküldése után kapott megerősítő e-mail tartalmaz egy egyedi <em>vélemény-kezelő linket</em>, amellyel bármikor azonnal és véglegesen törölheted a leadott értékelésedet.
        </li>
        <li>
          <strong>Vállalkozás törlése</strong>: A beküldés után kapott (és a böngésződben mentett) egyedi <em>vállalkozás-kezelő link</em> segítségével bármikor azonnal és véglegesen törölheted a szaknévsoros profilodat, anélkül, hogy ehhez jelszó vagy fiók kellene.
        </li>
        <li>
          <strong>Kézi törlési kérelem (E-mailben)</strong>: Ha a fenti automatizált linkek már nem állnak rendelkezésedre, bármikor írhatsz nekünk az <a href="mailto:info@kinti.app">info@kinti.app</a> címre a beküldéskor használt e-mail címedről, és kérésedre munkatársaink haladéktalanul (legfeljebb 5 munkanapon belül) véglegesen törlik a véleményeidet vagy vállalkozói profilodat.
        </li>
      </ul>

      <h2>6. Panasz</h2>
      <p>
        Ha úgy érzed, hogy az adatkezelésünk sérti a jogaidat, panasszal fordulhatsz az
        adatkezelő székhelye szerinti felügyeleti hatósághoz, a román Nemzeti Adatvédelmi
        Felügyelő Hatósághoz (ANSPDCP):
      </p>
      <ul>
        <li>Cím: B-dul G-ral. Gheorghe Magheru nr. 28-30, Sector 1, 010336 Bukarest, Románia</li>
        <li>Email: <a href="mailto:anspdcp@dataprotection.ro">anspdcp@dataprotection.ro</a></li>
        <li>Web: <a href="https://www.dataprotection.ro" target="_blank" rel="noreferrer">dataprotection.ro</a></li>
      </ul>
      <p>
        Uniós tagállamban élő felhasználóként a <strong>szokásos tartózkodási helyed</strong>{" "}
        szerinti adatvédelmi hatósághoz is fordulhatsz.
      </p>

      <h2>7. Adatvédelmi Incidensek Kezelése (Data Breach)</h2>
      <p>
        Bár rendszerünk account-mentes és minimalizált adatkezelést folytat (az IP-címeket hash-eljük, a tartalmakat auto-töröljük), 
        egy esetleges adatvédelmi incidens (pl. hacker támadás, adatbázis kompromittálódása) esetén a GDPR 33. cikkének 
        megfelelően járunk el: az incidenst indokolatlan késedelem nélkül, de legkésőbb a tudomásszerzéstől számított 
        <strong>72 órán belül bejelentjük az illetékes felügyeleti hatóságnak (ANSPDCP)</strong>. Amennyiben az incidens magas kockázattal jár a
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
