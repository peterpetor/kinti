import { LegalPage } from "@/components/legal-page";

export const dynamic = "force-static";

export const metadata = { title: "Adatkezelési Tájékoztató" };

export default function AdatvedelemPage() {
  return (
    <LegalPage title="Adatkezelési Tájékoztató" updatedAt="2026-07-16">
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
        személyek vehetik igénybe. Ennél fiatalabb
        felhasználóktól tudatosan nem gyűjtünk adatot; ha mégis tudomást
        szerzünk ilyenről, az érintett adatokat haladéktalanul töröljük.
      </p>


      <h3>2.1 Belépés / fiók (Clerk)</h3>
      <p>
        A platform nagy része <strong>regisztráció-mentes</strong>. A Clerk Inc. (USA)
        bejelentkezési szolgáltatást két esetben használjuk: (1) az oldal
        <strong>adminisztrátorának</strong> belépéséhez, és (2) a <strong>Kinti PRO
        előfizetés</strong> megrendeléséhez és kezeléséhez, mivel az előfizetést a
        felhasználói fiókhoz kötjük (lásd 2.14). A látogatók / vállalkozók /
        tartalom-beküldők egyébként nem találkoznak Clerk regisztrációval. A Clerk a
        belépéshez az e-mail-címet (és az általad megadott profiladatokat) kezeli.
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
        A közösségi tartalmak (vélemény-értékelés, vállalkozás-beküldés stb.) feladásához nincs
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
        kezeli az adminisztrátor-értesítőket is (új tartalom moderálása, tartalom-bejelentés).
        Az email-címek kizárólag a technikai kiküldés idejére haladnak át a Resend szerverein.
      </p>
      <div style={{
        background: "var(--surface-alt, #f4ede0)",
        border: "1px solid var(--border, #e6ebe5)",
        borderRadius: 14,
        padding: "14px 16px",
        margin: "16px 0",
      }}>
        <p style={{ margin: 0, fontWeight: 700 }}>🚫 Nincs spam — marketing e-mail csak külön feliratkozással</p>
        <p style={{ margin: "6px 0 0" }}>
          A tartalom-beküldéskor / vásárláskor megadott e-mail-címedre és telefonszámodra{" "}
          <strong>kizárólag tranzakciós</strong> üzenetet küldünk (megerősítés, törlés, lejárat,
          számla). Marketing célú e-mailt (hírlevél) <strong>csak akkor</strong> kapsz, ha arra
          külön, kifejezett <strong>dupla opt-in</strong> feliratkozással hozzájárultál (lásd 2.16) —
          és onnan egy kattintással bármikor leiratkozhatsz. SMS-t soha nem küldünk.
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
          <strong>Természetes nyelvű kereső</strong>: a felhasználó által beírt keresési
          mondat (max 200 karakter). NEM tartalmazhat személyes adatot.
        </li>
        <li>
          <strong>Vállalkozói leírás-asszisztens</strong>: a vállalkozó által beírt
          leírás-szöveg (max 1000 karakter), ami egyébként is publikussá válik a
          profilján.
        </li>
        <li>
          <strong>AI interjú-szimulátor</strong>: a felhasználó által gyakorlásként
          beírt válaszok. Kérünk, hogy ide valós személyes adatot ne írj be.
        </li>
        <li>
          <strong>Német szó-szótár</strong>: egyetlen szó vagy rövid kifejezés (max
          60 karakter). Személyes adatot nem tartalmaz.
        </li>
      </ul>
      <ul>
        <li><strong>Jogalap</strong>: GDPR 6. cikk (1) f) — jogos érdek
          (felhasználói élmény javítása).</li>
        <li><strong>Tárolási idő</strong>: a Workers AI <strong>nem tárolja</strong>{" "}
          a feldolgozott bemenetet és kimenetet (training-célra sem); az AI-válaszok
          edge-cache-elve legfeljebb 7 napig (német szó-szótár).</li>
        <li><strong>Adatfeldolgozó</strong>: Cloudflare, Inc. (Workers AI) —{" "}
          <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noreferrer">privacy policy</a>;{" "}
          <a href="https://developers.cloudflare.com/workers-ai/privacy/" target="_blank" rel="noreferrer">Workers AI adatkezelés</a>.</li>
        <li><strong>Spam-védelem</strong>: az AI-hívásokat IP-cím hash alapú
          rate-limit védi; ennek logja maximum 24 óráig él, utána automatikusan
          törlődik.</li>
      </ul>
      <p>
        Az összes AI-funkció közérthető leírása, a használt modellek és a korlátok:{" "}
        <a href="/ai-atlathatosag">AI-átláthatóság oldal</a>.
      </p>

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

      <h3>2.12 Push értesítések (kanton-célzott)</h3>
      <p>
        A böngésződben engedélyezheted a Push értesítéseket, hogy szóljunk az új
        vállalkozásokról, állásokról és „Keresek" igény-hirdetésekről a kantonodban
        (illetve bizonyos témákban, pl. árfolyam-radar, napi emlékeztető). A
        kategóriák egyenként ki-be kapcsolhatók az Értesítések oldalon. A
        feliratkozáskor a következőket tároljuk az
        adatbázisunkban: a böngésződ által generált, személytelen feliratkozási
        <code>endpoint</code> URL, a hozzá tartozó nyilvános titkosító kulcsok
        (<code>p256dh</code>, <code>auth</code> — ezekkel titkosítjuk neked az értesítést),
        és az általad választott <strong>kanton-preferencia</strong> a célzáshoz.
      </p>
      <p>
        <strong>Adatbiztonság:</strong> az értesítés tartalmát <strong>végpontig titkosítva</strong>{" "}
        küldjük. Bár az a böngésződ push-szolgáltatóján (Apple, Google, Mozilla) halad át, azt
        <strong> kizárólag a te eszközöd tudja visszafejteni</strong> — a push-szolgáltató nem
        látja a tartalmat.
      </p>
      <ul>
        <li><strong>Jogalap:</strong> GDPR 6. cikk (1) a) — hozzájárulás (a böngésző szintjén és a feliratkozás gombbal)</li>
        <li><strong>Tárolási idő:</strong> amíg a böngésződben le nem tiltod az értesítéseket vagy le nem iratkozol; a megszűnt (érvénytelen) feliratkozásokat automatikusan töröljük.</li>
        <li><strong>Jogi nyilatkozat (Árfolyam):</strong> Az értesítések tartalmáért (különösen a pénzügyi, árfolyami adatokért) felelősséget nem vállalunk. Az adatok tájékoztató jellegűek, a késésekből vagy pontatlanságokból eredő anyagi károkért a kinti.app nem perelhető.</li>
      </ul>

      <h3>2.13 Akció-térkép (bolt-akció bejelentés)</h3>
      <p>
        Az akció bejelentésekor az alábbi adatok kerülnek rögzítésre:
      </p>
      <ul>
        <li><strong>GPS koordináta</strong> — a bejelentés helye a térképen</li>
        <li><strong>Bolt lánca, kategória, kedvezmény mértéke</strong></li>
        <li><strong>Opcionális:</strong> bolt neve, megjegyzés szövege</li>
      </ul>
      <ul>
        <li><strong>Jogalap:</strong> GDPR 6. cikk (1) a) — hozzájárulás</li>
        <li><strong>Tárolási idő:</strong> aznap éjfélig, automatikus törlés</li>
        <li><strong>Nyilvánosság:</strong> az akció pontosan a bejelentő GPS-pozícióján jelenik meg a nyilvános térképen</li>
      </ul>

      {/* Kontextusfüggő fizetési szolgáltató: weben Paddle, a Google Play-ből
          telepített Android-appban a Google Play (a szakasz-számozás közös). */}
      <div className="web-only-payment">
        <h3>2.14 Kinti PRO előfizetés és fizetés (Paddle)</h3>
        <p>
          A <strong>Kinti PRO</strong> (és a Szaknévsor-kiemelés / kiemelt állás) előfizetés
          megvásárlásakor a fizetést a <strong>Paddle</strong> (Paddle.com Market Limited, Egyesült Királyság)
          mint <em>Merchant of Record</em> bonyolítja. A bankkártya- és számlázási adataidat
          közvetlenül a Paddle kezeli — <strong>a kinti.app nem látja és nem tárolja a
          kártyaadatokat</strong>.
        </p>
        <p>
          A mi adatbázisunkban kizárólag az előfizetés <strong>állapotát</strong> tároljuk a
          funkciók feloldásához, a bejelentkezett felhasználói fiókhoz (Clerk userId) kötve:
          az előfizetés státusza, a csomag típusa, a Paddle előfizetés- és vásárló-
          azonosítója, valamint a következő számlázási időszak vége. Számlaadatot/kártyaadatot
          nem tárolunk.
        </p>
        <ul>
          <li><strong>Jogalap:</strong> GDPR 6. cikk (1) b) — szerződés teljesítése (az előfizetés nyújtása); a számviteli bizonylatok megőrzése: 6. cikk (1) c) — jogi kötelezettség.</li>
          <li><strong>Tárolási idő:</strong> az előfizetés fennállásáig, illetve a számviteli/adójogi megőrzési határidőig.</li>
          <li><strong>Adatfeldolgozó / Merchant of Record:</strong> Paddle.com Market Limited —{" "}
            <a href="https://www.paddle.com/legal/privacy" target="_blank" rel="noreferrer">privacy policy</a>.</li>
        </ul>
      </div>
      <div className="android-only-payment">
        <h3>2.14 Kinti PRO előfizetés és fizetés (Google Play)</h3>
        <p>
          A <strong>Kinti PRO</strong> (és a Szaknévsor-kiemelés / kiemelt állás) előfizetés
          az alkalmazásban a <strong>Google Play fizetési rendszerén</strong> (Google Ireland
          Limited) keresztül vásárolható meg. A bankkártya- és számlázási adataidat
          közvetlenül a Google kezeli — <strong>a kinti.app nem látja és nem tárolja a
          kártyaadatokat</strong>.
        </p>
        <p>
          A mi adatbázisunkban kizárólag az előfizetés <strong>állapotát</strong> tároljuk a
          funkciók feloldásához, a bejelentkezett felhasználói fiókhoz (Clerk userId) kötve:
          az előfizetés státusza, a csomag típusa, a Google Play vásárlás-azonosítója
          (purchase token), valamint a következő számlázási időszak vége.
          Számlaadatot/kártyaadatot nem tárolunk.
        </p>
        <ul>
          <li><strong>Jogalap:</strong> GDPR 6. cikk (1) b) — szerződés teljesítése (az előfizetés nyújtása); a számviteli bizonylatok megőrzése: 6. cikk (1) c) — jogi kötelezettség.</li>
          <li><strong>Tárolási idő:</strong> az előfizetés fennállásáig, illetve a számviteli/adójogi megőrzési határidőig.</li>
          <li><strong>Adatfeldolgozó:</strong> Google Ireland Limited —{" "}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">privacy policy</a>.</li>
        </ul>
      </div>

      <h3>2.15 Ajánlatkérés és kapcsolatfelvétel (lead)</h3>
      <p>
        Ha az <strong>„Kérj árajánlatot"</strong> funkcióval üzenetet küldesz vállalkozóknak,
        illetve egy nem megerősített listát a <strong>„Foglald el"</strong> gombbal igényelsz,
        a megadott adataidat (név, e-mail, opcionális telefonszám, üzenet) az érintett
        vállalkozónak / az adminisztrátornak továbbítjuk, és — a megkeresés kezeléséhez — az
        adatbázisban is rögzítjük.
      </p>
      <ul>
        <li><strong>Jogalap:</strong> GDPR 6. cikk (1) a) — hozzájárulás (a megkeresés elküldésével).</li>
        <li><strong>Tárolási idő:</strong> a megkeresés kezeléséig; törlést az <a href="mailto:info@kinti.app">info@kinti.app</a> címen kérhetsz.</li>
        <li><strong>Címzett:</strong> a megkeresett vállalkozó (lead), illetve a moderáló adminisztrátor (claim) — az e-mail-továbbítás a Resend-en keresztül történik (lásd 2.6).</li>
      </ul>

      <h3>2.16 Hírlevél (opcionális feliratkozás)</h3>
      <p>
        Ha feliratkozol a hírlevélre, az <strong>e-mail-címedet</strong> és az opcionális
        <strong> ország-preferenciádat</strong> tároljuk, hogy időszakos összefoglalót
        küldhessünk. A feliratkozás <strong>dupla opt-in</strong>: a megadott címre megerősítő
        linket küldünk, és csak a megerősítés után kerülsz a listára. Minden hírlevélben szerepel
        egy <strong>egy kattintásos leiratkozó</strong> link.
      </p>
      <ul>
        <li><strong>Jogalap:</strong> GDPR 6. cikk (1) a) — hozzájárulás.</li>
        <li><strong>Tárolási idő:</strong> a leiratkozásig; a megerősítetlen feliratkozásokat automatikusan töröljük.</li>
        <li><strong>Adatfeldolgozó:</strong> Resend, Inc. (kiküldés) — lásd 2.6.</li>
      </ul>

      <h3>2.17 Álláskeresés és jelentkezés (Állások modul)</h3>
      <p>
        Ha egy álláshirdetésre <strong>jelentkezel</strong>, a megadott adataidat
        (<strong>név, e-mail-cím, opcionális telefonszám, üzenet</strong>, és — ha
        feltöltöd — <strong>önéletrajz / CV</strong>) rögzítjük, és a <strong>te
        kezdeményezésedre</strong> továbbítjuk a hirdető munkáltatónak, hogy fel tudja
        venni veled a kapcsolatot. A feltöltött CV a Cloudflare R2 tárolóba kerül, és
        nem nyilvános — kizárólag az érintett munkáltató (és technikai okból az
        adminisztráció) férhet hozzá.
      </p>
      <p>
        A továbbítást követően a munkáltató az adataidat <strong>önálló adatkezelőként</strong>{" "}
        kezeli, a saját adatvédelmi gyakorlata szerint; ezért az üzemeltető nem felel.
        A Kinti az Állások modulban <strong>állás-listát</strong> üzemeltet, és nem hoz
        létre munkaviszonyt a felek között (lásd ÁSZF 10.1).
      </p>
      <ul>
        <li><strong>Jogalap:</strong> GDPR 6. cikk (1) a) — hozzájárulás (a jelentkezés elküldésével).</li>
        <li><strong>Címzett:</strong> a hirdető munkáltató (e-mail-továbbítás a Resend-en keresztül, lásd 2.6).</li>
        <li><strong>Tárolási idő:</strong> a jelentkezés kezeléséig; törlést a{" "}
          <a href="mailto:info@kinti.app">info@kinti.app</a> címen kérhetsz. A korábbi
          jelentkezéseidet a böngésződben a „Jelentkezéseim" nézetben követheted.</li>
      </ul>

      <h3>2.18 Kereshető munkavállalói profil (jelölt-adatbázis)</h3>
      <p>
        Ha az Állások modulban <strong>munkavállalói profilt</strong> hozol létre és azt
        <strong> „kereshető"-re</strong> állítod, a profilodat felvesszük egy jelölt-keresőbe,
        ahol a platform <strong>jóváhagyott (moderált) munkáltatói</strong> rákereshetnek és
        megnézhetik. A profil <strong>kereshetővé tétele a te kifejezett, bármikor visszavonható
        döntésed</strong>; a kapcsolót a profilodban kikapcsolhatod, vagy a profilt törölheted.
      </p>
      <ul>
        <li><strong>Kezelt / megjelenített adatok:</strong> a megadott neved, kantonod, szakmai
          kategóriád, elérhetőséged és — ha feltöltötted — az <strong>önéletrajzod (CV)</strong>.</li>
        <li><strong>Címzettek:</strong> nem egyetlen munkáltató, hanem a platform <strong>összes
          jóváhagyott munkáltatója</strong>, aki a jelölt-keresőt használja (ez különbözik a 2.17
          pont szerinti, egyetlen hirdetőnek küldött jelentkezéstől). A CV a Cloudflare R2-ben
          tárolt, nem nyilvános; kizárólag bejelentkezett, jóváhagyott munkáltató (és technikai
          okból az adminisztráció) töltheti le.</li>
        <li><strong>Jogalap:</strong> GDPR 6. cikk (1) a) — hozzájárulás (a profil kereshetővé
          tételével).</li>
        <li><strong>Tárolási idő:</strong> amíg a profilod kereshető, illetve a profil / a CV
          törléséig. A kereshetőséget bármikor kikapcsolhatod, vagy törlést kérhetsz a{" "}
          <a href="mailto:info@kinti.app">info@kinti.app</a> címen.</li>
      </ul>

      <h3>2.19 Határidő-asszisztens (határidő-emlékeztetők)</h3>
      <p>
        A Határidő-asszisztensbe felvitt határidőid <strong>alapértelmezetten kizárólag a
        böngésződben</strong> (<code>localStorage</code>) tárolódnak — ilyenkor semmilyen
        adat nem kerül a szerverünkre.
      </p>
      <p>
        Ha bekapcsolod a <strong>Push-emlékeztetőt</strong>, a határidőid <strong>címét és
        dátumát</strong> eltároljuk az adatbázisunkban, a <strong>személytelen
        push-feliratkozásodhoz</strong> kötve (user-azonosító nélkül — mint a 2.12 pont
        push-értesítéseinél), hogy 14, 7 és 1 nappal a lejárat előtt értesítést küldhessünk.
      </p>
      <p>
        Ha ezen felül bekapcsolod az <strong>emailes emlékeztetőt is</strong> (opcionális,
        külön kapcsoló), akkor a fentiek mellé a <strong>bejelentkezési email-címedet</strong>{" "}
        is eltároljuk ezekhez a határidőkhöz, és a lejárat előtt <strong>emailt</strong> is
        küldünk (a Resend, Inc. szolgáltatásán keresztül — lásd 2.6). Ez kifejezett, külön
        hozzájárulás; a kapcsolót bármikor kikapcsolhatod, amivel a szerveren tárolt
        email-címed és a hozzá kötött határidők törlődnek.
      </p>
      <ul>
        <li><strong>Jogalap:</strong> GDPR 6. cikk (1) a) — hozzájárulás (a push-, illetve az email-kapcsolóval).</li>
        <li><strong>Címzett:</strong> emailes emlékeztetőnél a Resend, Inc. (kiküldés) — lásd 2.6.</li>
        <li><strong>Tárolási idő:</strong> amíg ki nem kapcsolod az emlékeztetőt, vagy a feliratkozásod érvénytelenné nem válik; a megszűnt feliratkozásokat automatikusan töröljük. Az emlékeztetők a <strong>Kinti PRO</strong>-hoz kötöttek: a szerveren tárolt adatok minden aktív-PRO szinkronnál megújulnak, és ha a PRO lejár (nincs több szinkron), <strong>kb. 40 napon belül automatikusan lejárnak</strong>.</li>
      </ul>

      <h3>2.20 Hozzájárulás-napló (GDPR 7. cikk)</h3>
      <p>
        Amikor a belépéskor elfogadod a feltételeket (18+, ÁSZF, Adatkezelési Tájékoztató),
        a hozzájárulás tényét a <strong>bizonyíthatóság</strong> érdekében (GDPR 7. cikk (1))
        a szerverünkön is <strong>naplózzuk</strong>: az elfogadás <strong>időpontját</strong>, a
        feltételek <strong>verzióját</strong>, a három elfogadott pontot, az (opcionális) választott
        országot, és egy <strong>véletlenszerű, eszköz-szintű azonosítót</strong> (amit a böngésződ
        generál). <strong>IP-címet és személyes adatot ehhez NEM tárolunk</strong> (az IP-t csak a
        visszaélés elleni óradíj-limithez hasheljük, nem mentjük). Ez az azonosító nem szolgál
        nyomon követésre.
      </p>
      <ul>
        <li><strong>Jogalap:</strong> GDPR 6. cikk (1) c) — jogi kötelezettség (a hozzájárulás igazolhatósága), illetve 6. cikk (1) f) — jogos érdek (visszaélés-megelőzés).</li>
        <li><strong>Tárolási idő:</strong> a hozzájárulás bizonyíthatóságához szükséges ideig.</li>
      </ul>

      <h3>2.21 B2B Hub (zárt vállalkozói projektpiac)</h3>
      <p>
        A B2B Hubban Szaknévsor PRO vállalkozások projekt-kiírásokat tehetnek közzé. A kiíráshoz
        a következő adatokat kezeljük: a kiíró <strong>vállalkozásának neve</strong>, a kiírás
        szövege (cím, leírás, célország/város, keresett szakma), a kiíró által megadott{" "}
        <strong>kapcsolattartási telefonszám</strong>, valamint — kizárólag szerveroldalon, a
        jogosultság-ellenőrzéshez — a kiíró fiók-azonosítója. A kiírás (a telefonszámmal együtt){" "}
        <strong>csak a bejelentkezett, aktív Szaknévsor PRO előfizetéssel rendelkező
        vállalkozásoknak</strong> jelenik meg — nyilvánosan nem érhető el, keresők nem indexelik.
        A fiók-azonosítót a többi tag felé nem fedjük fel.
      </p>
      <ul>
        <li><strong>Jogalap:</strong> GDPR 6. cikk (1) b) — a szolgáltatás (előfizetés) teljesítése; a telefonszám megadása a kiíró döntése.</li>
        <li><strong>Tárolási idő:</strong> a kiírás lezárásáig/eltávolításáig; a kiíró a saját kiírását bármikor lezárhatja, törlést az info@kinti.app címen kérhet.</li>
        <li><strong>Címzettek:</strong> a többi Szaknévsor PRO tag (a kiírás tartalma); adatfeldolgozó: Cloudflare (tárolás).</li>
      </ul>

      <h3>2.22 Német Önéletrajz Készítő</h3>
      <p>
        A Német Önéletrajz Készítővel készített PDF <strong>kizárólag a böngésződben</strong> jön
        létre — az önéletrajzod adatai alapesetben <strong>nem kerülnek fel a szerverünkre</strong>.
        A profil elmentése <strong>opcionális</strong>, és kizárólag akkor történik, ha a végén{" "}
        <strong>kifejezetten bepipálod</strong> a „Keressenek meg állással" jelölőnégyzetet. Ebben az
        esetben elmentjük: a neved, elérhetőséged (e-mail és/vagy telefon), lakóhelyed, a szakmád és a
        kitöltött önéletrajz-adatok — <strong>a magyar munkaközvetítés (Feedback Jobs) céljából</strong>.
      </p>
      <ul>
        <li><strong>Jogalap:</strong> GDPR 6. cikk (1) a) — a te <strong>hozzájárulásod</strong> (a jelölőnégyzet). Enélkül nem mentünk semmit.</li>
        <li><strong>Visszavonás / törlés:</strong> a hozzájárulás bármikor visszavonható; a mentett profil törlését az <a href="mailto:info@kinti.app">info@kinti.app</a> címen kérheted.</li>
        <li><strong>Tárolási idő:</strong> a közvetítési cél megszűnéséig, illetve a törlési kérésedig.</li>
        <li><strong>Adatfeldolgozó:</strong> Cloudflare (D1 adatbázis, tárolás). A profilt nyilvánosan nem tesszük közzé.</li>
      </ul>

      <h3>2.23 Élettörténetek (felhasználói történetek)</h3>
      <p>
        Az „Élettörténetek" modulban beküldött történetnél a következő adatokat
        kezeljük:
      </p>
      <ul>
        <li><strong>Nyilvánosan megjelenik</strong> (a te döntésed alapján): a megadott név/becenév, az ország és a város, a történet szövege és az opcionális borítókép.</li>
        <li><strong>Nem nyilvános:</strong> az opcionálisan megadott e-mail-cím — kizárólag a megjelenésről szóló értesítéshez és a történeteddel kapcsolatos kapcsolattartáshoz használjuk.</li>
        <li><strong>Technikai:</strong> a beküldő IP-címének visszafejthetetlen hash-e, kizárólag visszaélés-védelemhez (napi beküldési korlát) — nem azonosításra.</li>
        <li><strong>Jogalap:</strong> GDPR 6. cikk (1) a) — a beküldéssel adott hozzájárulásod; a moderáció és visszaélés-védelem: 6. cikk (1) f) — jogos érdek.</li>
        <li><strong>Tárolási idő:</strong> a történeted kérésedre bármikor véglegesen töröljük (<a href="mailto:info@kinti.app">info@kinti.app</a>); a képet a történettel együtt töröljük.</li>
        <li><strong>Moderáció:</strong> minden történet kézi, szerkesztői jóváhagyás után jelenik meg; a képeket automatikus képmoderáció (Cloudflare Workers AI) is szűri.</li>
      </ul>

      <h3>2.24 Kinti Telegram-bot</h3>
      <p>
        A @KintiSzaknevsorBot Telegram-bot használatakor a Telegramtól kapott
        üzenetből <strong>kizárólag a kereséshez szükséges szöveget dolgozzuk fel
        átmenetileg</strong> — a beszélgetések tartalmát <strong>nem tároljuk</strong>.
        A visszaélés-védelemhez (óránkénti keresési korlát) a Telegram-azonosítódból
        képzett kulcsot naplózzuk rövid ideig (legfeljebb 48 óra), más adatot nem.
        A találatok a nyilvános Szaknévsor-adatokból származnak. A Telegram platform
        (Telegram FZ-LLC) a saját adatkezelési szabályzata szerint önálló adatkezelő.
      </p>

      <h3>2.25 „Keresek" hirdetések továbbítása</h3>
      <p>
        A „Keresek" táblára beküldött hirdetésed elérhetőség-mezője — ahogy a
        beküldő űrlap előzetesen jelzi — <strong>nyilvánosan megjelenik</strong>,
        és a jóváhagyott hirdetést a kategóriába vágó, Szaknévsorban szereplő
        vállalkozásoknak <strong>továbbítjuk</strong>, hogy jelentkezhessenek
        (ez a szolgáltatás rendeltetése — GDPR 6. cikk (1) b) szerinti
        szerződés-teljesítés). A hirdetés 30 nap után automatikusan lejár és
        lekerül a tábláról; törlését korábban is kérheted az{" "}
        <a href="mailto:info@kinti.app">info@kinti.app</a> címen.
      </p>

      <h3>2.26 Közösségi ranglista (opt-in)</h3>
      <p>
        A ranglistához önkéntesen, <strong>szabadon választott becenévvel</strong>{" "}
        csatlakozhatsz — valódi nevet, e-mail-címet vagy fiók-azonosítót nem tárolunk
        hozzá. Tárolt adatok: a becenév (nyilvánosan megjelenik), a pontszámok
        (a saját eszközöd gamifikációjából önbevallottan; a „Meghívók" pontot a
        meghívó-kódod konverzió-számából a szerver számolja — magát a kódot a
        ranglistán nem tároljuk), és egy véletlen, eszköz-oldali token, ami a
        bejegyzésed szerkesztésének bizonyítéka.
      </p>
      <ul>
        <li><strong>Jogalap:</strong> GDPR 6. cikk (1) a) — hozzájárulás (a csatlakozás gombbal).</li>
        <li><strong>Tárolási idő / törlés:</strong> a ranglistáról bármikor kiléphetsz a Ranglista oldalon — a bejegyzésed (becenév + pontok) azonnal, véglegesen törlődik.</li>
      </ul>

      <h3>2.27 Állás-radar e-mail riasztások</h3>
      <p>
        Az Állások modulban beállíthatsz <strong>állás-radart</strong>: megadod a
        keresési feltételeidet (pl. kategória, régió, kulcsszó), és az új, illeszkedő
        hirdetésekről értesítést kapsz. Két csatorna választható: <strong>push-értesítés</strong>{" "}
        (annak adatkezelését a 2.12 pont írja le) és/vagy <strong>e-mail riasztás</strong>.
        Az e-mail csatornához a következőket tároljuk: az általad megadott{" "}
        <strong>e-mail-címet</strong>, a radar <strong>keresési feltételeit</strong>, valamint a
        küldés-vezérléshez szükséges technikai időbélyegeket (utolsó riasztás ideje, a napi
        összefoglalóra váró találatok listája) — így naponta legfeljebb egy azonnali riasztást
        és egy összefoglalót kapsz (spam-védelem).
      </p>
      <ul>
        <li><strong>Jogalap:</strong> GDPR 6. cikk (1) a) — hozzájárulás (a radar beállításával; az e-mail-cím megadása önkéntes).</li>
        <li><strong>Adatfeldolgozó:</strong> Cloudflare (tárolás, lásd 2.4) és Resend (e-mail-kiküldés, lásd 2.6).</li>
        <li><strong>Tárolási idő / törlés:</strong> a radar törléséig. <strong>Minden riasztó
          e-mail alján egy kattintásos leiratkozó link van</strong> — a leiratkozás a radart
          (az e-mail-címeddel és a feltételekkel együtt) <strong>azonnal és véglegesen törli</strong>.
          A radarjaidat az Állások oldalon is kezelheted és törölheted.</li>
      </ul>

      <h3>2.28 Szoba- és albérlet-börze</h3>
      <p>
        Az Albérlet-börzén bejelentkezett felhasználóként lakhatási hirdetést adhatsz fel
        (kiadó szoba/lakás vagy kereső hirdetés); a hirdetés admin-jóváhagyás után válik
        nyilvánossá. A hirdetéshez a következőket tároljuk:
        a fiókod <strong>azonosítóját</strong> (Clerk userId — a hirdetés hozzád kötéséhez,
        a saját hirdetésed törléséhez és a napi feladási limithez), a hirdetés{" "}
        <strong>tartalmát</strong> (típus, ország, régió, település, ár, leírás), valamint az általad{" "}
        <strong>kapcsolatfelvételre megadott elérhetőséget</strong> (e-mail vagy telefonszám).
        Az elérhetőséged <strong>nem nyilvános</strong>: a hirdetés-listában nem jelenik meg,
        kizárólag bejelentkezett Kinti PRO-tagok kérhetik le, kifejezetten a veled való
        kapcsolatfelvétel céljából.
      </p>
      <ul>
        <li><strong>Jogalap:</strong> GDPR 6. cikk (1) b) — a hirdetés közzététele mint általad
          kért szolgáltatás; az elérhetőség megadása a hirdetés feladásának feltétele (enélkül
          a hirdetők nem tudnának válaszolni).</li>
        <li><strong>Adatfeldolgozó:</strong> Cloudflare (tárolás, lásd 2.4).</li>
        <li><strong>Tárolási idő / törlés:</strong> a hirdetésed a feladástól 60 nap után
          automatikusan lekerül a listáról; a hirdetés melletti „Levétel" gombbal bármikor{" "}
          <strong>azonnal és véglegesen törölheted</strong>. Bejelentett (jogsértőnek jelzett)
          hirdetést a vizsgálat idejére azonnal elrejtünk (lásd a DSA-bejelentési pontot).</li>
      </ul>

      <h2>3. Cookie-k</h2>
      <p>
        Kizárólag <strong>feltétlenül szükséges</strong> (technikai és biztonsági) cookie-kat
        használunk — ezekhez a GDPR/ePrivacy alapján NEM szükséges hozzájárulás, de a teljesség
        kedvéért tájékoztatunk róluk. <strong>Marketing-, hirdetési- vagy nyomon követő (tracking)
        cookie-t NEM használunk</strong>, és nem osztunk meg adatot hirdetési hálózatokkal.
      </p>
      <p>
        A technikai/biztonsági cookie-k, amelyek <strong>már a bejelentkezés előtt</strong> is
        beállítódhatnak (a szolgáltatás elé kapcsolt infrastruktúra miatt):
      </p>
      <ul>
        <li><strong>Clerk (hitelesítés):</strong> <code>__client</code>, <code>__client_uat</code> — a
          bejelentkezési rendszer működéséhez; a Clerk már a látogatáskor beállítja a munkamenet-állapot
          kezeléséhez, a tényleges belépésnél pedig session-cookie társul (lásd 2.1).</li>
        <li><strong>Cloudflare (biztonság / bot-védelem):</strong> <code>__cf_bm</code>, <code>_cfuvid</code> —
          a szolgáltatásunk elé kapcsolt Cloudflare állítja be a robot- és visszaélés-védelemhez;
          rövid élettartamú, kizárólag biztonsági célú (lásd 2.4).</li>
      </ul>
      <p>
        Ezek harmadik felek (Clerk, Inc. és Cloudflare, Inc.) technikai cookie-jai, kizárólag a
        szolgáltatás biztonságos működéséhez szükségesek.
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

      <h3>3.3 Böngészőben tárolt beállítások (localStorage)</h3>
      <p>
        A kényelmi és személyre szabási beállításaidat <strong>kizárólag a saját
        böngésződben</strong> (<code>localStorage</code> / <code>sessionStorage</code>)
        tároljuk — ezek <strong>nem cookie-k</strong>, és{" "}
        <strong>semmilyen formában nem kerülnek fel az üzemeltető szerverére</strong>,
        így más felhasználók sem férnek hozzájuk. Ezek a következők:
      </p>
      <ul>
        <li><strong>Választott ország</strong> (<code>kinti.country</code>) — melyik ország Kintijét nézed (Svájc, Ausztria, Németország, Hollandia). A térkép és a tartalom ehhez igazodik.</li>
        <li><strong>Választott régió / kanton</strong> (<code>kinti.canton</code>) — a helyi szűréshez és a kanton-célzott push-hoz.</li>
        <li><strong>Nézet- és szűrő-preferenciák</strong> — pl. lista vagy térkép nézet, a kalkulátorokba (bér, vám, lakhatás, árfolyam) utoljára beírt értékek, kiválasztott szűrők.</li>
        <li><strong>Kezdőlapi személyre szabás</strong> (<code>kinti.personalize</code>) — a „Szabjuk rád" varázsló válaszai (mióta élsz kint, mi a fő kihívásod); kizárólag az eszközödön, a kezdőlapi ajánló ehhez igazodik.</li>
        <li><strong>Mentett bér-ajánlatok</strong> — lásd a 2.11 pontot.</li>
        <li><strong>Látogatás-számláló és állapotjelzők</strong> — pl. hányadszor jársz itt (a feliratkozás-felkérés időzítéséhez), illetve hogy beküldtél-e már tartalmat.</li>
        <li><strong>Tartalom-kezelő tokenek</strong> — a saját vállalkozásod/eseményed/hirdetésed utólagos szerkesztéséhez (lásd 2.1).</li>
        <li><strong>Letöltött offline útmutatók</strong> — ha letöltöd a tudásbázist offline olvasásra, az a böngésződ gyorsítótárában marad.</li>
      </ul>
      <p>
        Mindezt bármikor <strong>véglegesen törölheted</strong> a böngésződ tárolójának
        (sütik és webhelyadatok) ürítésével. A választott ország és régió pusztán
        UX-segéd: nem azonosít téged, és nincs hozzá fiók.
      </p>

      <h3>3.4 Ajánlói (referral / affiliate) linkek</h3>
      <p>
        A platform egyes felületein <strong>„Ajánló" jelzéssel</strong> ellátott külső linkek
        találhatók (pl. pénzküldő szolgáltatók). Ezekhez <strong>mi semmilyen követési
        technológiát nem használunk</strong>: nem teszünk le cookie-t, nem mérjük a kattintást,
        és nem adunk át rólad adatot a partnernek. A linkre kattintva a külső szolgáltató
        oldalára kerülsz, ahol már az ő adatkezelési szabályzata érvényes (a hivatkozás az
        ajánlói kódunkat tartalmazza, ami rólad semmilyen adatot nem hordoz).
      </p>

      <h2>4. Adatok továbbítása harmadik országba</h2>
      <p>
        A Clerk, a Cloudflare és a Resend USA-ban bejegyzett, ottani szervereket
        is használó vállalatok. Az EU–USA adattranszferek a 2023-as EU–US Data Privacy Framework
        (DPF), illetve az Európai Bizottság által elfogadott általános adatvédelmi kikötések (SCC)
        alapján történnek, amelyek biztosítják a GDPR-nak megfelelő magas szintű adatvédelmet.{" "}
        <span className="web-only-payment">A fizetést bonyolító <strong>Paddle</strong> az{" "}
        <strong>Egyesült Királyságban</strong> bejegyzett; az EU–UK adattovábbítást az Európai
        Bizottság UK-ra vonatkozó megfelelőségi határozata fedi.</span>
        <span className="android-only-payment">A fizetést bonyolító <strong>Google Play</strong>{" "}
        szolgáltatója (Google Ireland Limited) az <strong>EU-ban (Írország)</strong> bejegyzett.</span>
      </p>
      <p>
        <strong>Svájci érintettek</strong>: a Svájcból az USA-ba történő adattovábbításra a{" "}
        <strong>Swiss–U.S. Data Privacy Framework</strong> (a svájci Szövetségi Tanács által
        elismert kiegészítés), illetve az SCC-k svájci adaptációja az irányadó — a revFADP/nDSG
        által megkívánt megfelelő védelmi szint biztosításával.
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
        <li>
          <strong>Bejelentkezési fiók (Clerk) törlése</strong>: a fiókod és a
          hozzá kapcsolódó adatok törlésének lépéseit — a törölt és megőrzött
          adattípusokkal együtt — külön oldalon foglaltuk össze:{" "}
          <a href="/fiok-torles">kinti.app/fiok-torles</a>.
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
