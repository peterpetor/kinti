import { LegalPage } from "@/components/legal-page";

export const runtime = "edge";
export const dynamic = "force-static";

export const metadata = { title: "Felhasználási Feltételek" };

export default function AszfPage() {
  return (
    <LegalPage title="Felhasználási Feltételek (ÁSZF)" updatedAt="2026-05-30">
      <p>
        A kinti.app szolgáltatás (a továbbiakban: <strong>„Szolgáltatás"</strong>) használatával
        elfogadod az itt rögzített feltételeket. Kérlek, olvasd el figyelmesen.
      </p>

      <h2>1. A Szolgáltatás jellege</h2>
      <p>
        A kinti.app egy közösségi platform, amely a Svájcban és Európában élő magyarokat
        és a velük kapcsolatban álló vállalkozásokat / szakembereket köti össze. A Szolgáltatás
        jelenleg <strong>ingyenes</strong>; sem regisztrációs, sem hirdetésfeladási díjat nem
        számolunk fel.
      </p>
      <p>
        A Szolgáltatás <strong>közvetítő platform</strong>: nem vagyunk fél a felhasználók és
        a vállalkozások között létrejövő esetleges megállapodásokban, és nem garantáljuk a
        platformon található információk pontosságát.
      </p>

      <h2>2. Felhasználói típusok</h2>
      <p>
        A Szolgáltatást <strong>18. életévét betöltött</strong> (nagykorú)
        természetes személyek vehetik igénybe (Ptk. 2:10 §). 18 év alatti
        felhasználók számára a regisztráció, a hirdetésfeladás és a
        vélemény-írás kizárt.
      </p>
      <h3>2.1 Kinti felhasználó (közösségi tag)</h3>
      <p>
        Bárki, aki a Szolgáltatást <strong>hagyományos regisztráció nélkül</strong> használja: böngészi a
        vállalkozásokat, nézi az eseményeket, hirdetést, eseményt vagy véleményt
        adhat fel. Felhasználói fiók és jelszó nem szükséges (a hitelesítés egyszeri megerősítő 
        e-maillel történik) — a beküldést ezen felül Cloudflare Turnstile CAPTCHA és IP-alapú rate-limit 
        védi a spam ellen.
      </p>
      <h3>2.2 Vállalkozó</h3>
      <p>
        Az a természetes vagy jogi személy, aki a saját vállalkozását kívánja a platformon
        megjeleníteni. <strong>Regisztráció nem szükséges</strong>: a vállalkozás-feladás
        ugyanolyan account-mentes flow-n megy, mint az egyéb tartalmak. A beküldés után
        kapott kezelő-linkkel szerkesztheti vagy törölheti az adatait.
      </p>

      <h2>3. Megengedett tartalom</h2>
      <p>A platformra felvitt tartalom (vállalkozási adat, hirdetés, fotó) NEM lehet:</p>
      <ul>
        <li>jogszabálysértő, mások jogait sértő, diszkriminatív, rágalmazó vagy obszcén;</li>
        <li>félrevezető, valótlan, csalárd;</li>
        <li>szellemi tulajdonjogot sértő (más logója, márkajegye engedély nélkül);</li>
        <li>spam, valamint olyan kereskedelmi tartalom, ami nem áll a feladó tényleges
          szolgáltatásával / termékével kapcsolatban;</li>
        <li>gyógyászati termék / dohánytermék / lőfegyver / pszichoaktív szer hirdetése;</li>
        <li>több-szintű marketing („MLM"), készpénzkölcsönzés, pénzügyi piramis;</li>
        <li>szexuális szolgáltatás vagy kísérő-szolgáltatás hirdetése;</li>
        <li>politikai propaganda vagy szervezett toborzás;</li>
        <li>idegen természetes személy adatát tartalmazó tartalom a saját kifejezett
          hozzájárulása nélkül (más telefonszáma, lakcíme, email-címe).
          Ennek megsértéséért a feladó GDPR-szabálysértésért és személyiségi
          jogsértésért felelős, az üzemeltetőt regressz-igénnyel kárpótolja.</li>
      </ul>

      <h3>3.1 Engedélyköteles tevékenységek</h3>
      <p>
        Az alábbi tevékenységek <strong>kizárólag érvényes hatósági engedéllyel /
        szakképesítéssel</strong> rendelkező vállalkozók által hirdethetők, és a
        hirdető köteles a profilján / hirdetésén az engedélyszámot is feltüntetni:
      </p>
      <ul>
        <li>orvosi, fogorvosi, gyógyszerészeti, pszichológiai, fizioterápiás
          tevékenység (Eütv., svájci MedBG, PsyG);</li>
        <li>ügyvédi, közjegyzői, adótanácsadói tevékenység (Üt., svájci BGFA, ASA);</li>
        <li>befektetési tanácsadás, vagyonkezelés, biztosításközvetítés
          (Bszt., svájci FINSA, FINIG, VAG);</li>
        <li>építészeti, statikus tervezői, energetikai-tanúsítói tevékenység
          (Étv., svájci REG-jegyzék);</li>
        <li>gyermek-/idősgondozás, oktatás (engedélyes szektorok).</li>
      </ul>
      <p>
        Ezen felül minden vállalkozó köteles a Svájcban (vagy a tevékenység helye
        szerint) szükséges iparűzési engedéllyel, AHV-bejelentéssel és érvényes
        munkavállalási engedéllyel rendelkezni (Schwarzarbeit-tilalom — lásd 10.
        pont). Az üzemeltető ezeket előzetesen nem ellenőrzi; az engedély hiányának
        bárminemű jogkövetkezménye kizárólag a hirdetőt terheli, az üzemeltető
        felelőssége teljes körűen kizárt.
      </p>

      <h3>3.2 Tartalom-moderációs eljárás</h3>
      <p>
        A platform <strong>előzetes admin-jóváhagyásos rendszerben</strong> működik.
        Az alábbi tartalmak <strong>kizárólag az adminisztrátor kézi jóváhagyása
        után válnak nyilvánosan elérhetővé</strong> (tipikusan 24 órán belül):
      </p>
      <ul>
        <li>hirdetések a Hirdetőfalon;</li>
        <li>vélemények a Szaknévsor profilokról;</li>
        <li>vállalkozói profilok a Szaknévsorban;</li>
        <li>közösségi események.</li>
      </ul>
      <p>
        Az alábbi idő-érzékeny tartalmak <strong>automatikus AI-moderáció után
        azonnal megjelennek</strong> (Cloudflare Workers AI szöveg- és
        képmoderáció):
      </p>
      <ul>
        <li>spontán találkozók (24 órás élettartam);</li>
        <li>Hofladen-térkép helyei;</li>
        <li>akciók a térképen (lejár éjfélkor).</li>
      </ul>
      <p>
        Az üzemeltető a hirdetéseket / véleményeket / vállalkozói profilokat /
        eseményeket <strong>indoklás nélkül elutasíthatja</strong>, ha
        valószínűsíthetően sérti a jelen ÁSZF 3., 3.1 vagy a vonatkozó
        jogszabályok rendelkezéseit. Az elutasított tartalmakat az 5.2 pont
        szerinti emailes csatornán lehet fellebbezve vitatni.
      </p>

      <h2>4. Szolgáltatásmegtagadás és Kitiltás joga</h2>
      <p>
        Az üzemeltető fenntartja a jogot, hogy indoklás és előzetes értesítés nélkül, azonnali hatállyal 
        eltávolítson bármilyen hirdetést, eseményt vagy vállalkozói profilt, illetve IP-cím vagy egyéb 
        azonosító alapján véglegesen kitiltson bármely felhasználót a platformról, amennyiben az a 
        jelen ÁSZF-et, a közösségi irányelveket, vagy a svájci/magyar jogszabályokat megsérti, vagy a 
        platform biztonságát és jó hírnevét veszélyezteti.
      </p>

      <h2>5. A tartalmakért való felelősség és jogsértési bejelentés</h2>
      <p>
        A feltöltött tartalomért <strong>a feltöltő felel</strong>. Az üzemeltető a
        jogszabálysértő tartalmakat — értesítés (notice-and-takedown) vagy saját
        észlelés alapján — haladéktalanul eltávolítja.
      </p>

      <h3>5.1 Jogsértési bejelentés (DSA Art. 16)</h3>
      <p>
        Az Európai Unió Digitális Szolgáltatások Rendelete (2022/2065 EU rendelet)
        16. cikke alapján bárki bejelenthet feltehetően jogsértő tartalmat. A
        bejelentés legyen elektronikus formában (email-en){" "}
        <a href="mailto:abuse@kinti.app">abuse@kinti.app</a> címre, és tartalmazza
        legalább:
      </p>
      <ul>
        <li>a bejelentő nevét és elektronikus elérhetőségét (kivéve szerzői jogot
          érintő bejelentésnél, ahol kötelező);</li>
        <li>a tartalom pontos elektronikus helyét (URL);</li>
        <li>a vélelmezett jogsértés indokolt magyarázatát (mely jogot vagy
          jogszabályt sérti);</li>
        <li>a bejelentő jóhiszemű nyilatkozatát a bejelentés valóságosságáról.</li>
      </ul>
      <p>
        Az üzemeltető a bejelentést <strong>indokolatlan késedelem nélkül</strong>{" "}
        feldolgozza, és e-mailben tájékoztatja a bejelentőt és (ha azonosítható)
        a tartalom feladóját az eredményről.
      </p>

      <h3>5.2 Tartalom-fellebbezés (DSA Art. 17 és 20)</h3>
      <p>
        Ha az üzemeltető a tartalmadat eltávolította vagy a hozzáférést korlátozta,
        a döntés ellen <strong>indokolt panaszt</strong> nyújthatsz be 6 hónapon
        belül emailben az <a href="mailto:info@kinti.app">info@kinti.app</a> címre.
        A panaszt érdemben felülvizsgáljuk, és a beérkezéstől számított ésszerű
        határidőn belül (jellemzően 30 napon belül) a döntésünk indokolásával
        válaszolunk. Ha az eredeti döntésünket fenntartjuk, a feladó bírósághoz
        vagy peren kívüli vitarendezéshez fordulhat (lásd 20.1 pont).
      </p>

      <h2>6. Hirdetés lejárta és törlése</h2>
      <ul>
        <li>A megerősített hirdetések <strong>30 napig</strong> láthatók, utána automatikusan
          eltűnnek (törlődnek);</li>
        <li>A feladó <strong>bármikor törölheti</strong> a hirdetését a beküldés után
          megjelenő (és a böngésző helyi tárolójában elmentett) <em>kezelő linkről</em>;</li>
        <li>Az üzemeltető fenntartja a jogot a jogszabálysértő vagy a 3. pontba ütköző hirdetések
          értesítés nélküli eltávolítására.</li>
      </ul>

      <h3>6.1 Hatósági/bírósági megőrzési kötelezettség (litigation hold)</h3>
      <p>
        Folyamatban lévő bírósági, hatósági vagy büntető-eljárás esetén — kifejezett
        hivatalos megkeresésre — az érintett tartalom (hirdetés, vélemény, vállalkozói
        adat, kapcsolódó metaadat, IP-hash) <strong>automatikus törlése felfüggesztésre kerül</strong>{" "}
        a kötelező megőrzési időtartamra (jellemzően az eljárás jogerős befejezéséig +
        a vonatkozó elévülési idő, általában 5 év). Ezen kötelező megőrzés a GDPR 6.
        cikk (1) c) pontján alapul (jogi kötelezettség), és a felhasználói törlési
        kérelem helyett is irányadó.
      </p>

      <h2>7. Értékelési Rendszer és Felhasználói Vélemények</h2>
      <p>
        A platformon leadott értékelések és vélemények a felhasználók szubjektív 
        magánvéleményét tükrözik. Az üzemeltető a véleményeket előzetesen nem moderálja és azok valóságtartalmát nem ellenőrzi.
      </p>
      <p>
        A közzétett értékelésekből fakadó esetleges hitelrontásért vagy személyiségi jogsértésért 
        kizárólag az értékelést leadó felhasználó felel, az üzemeltetőt felelősség nem terheli. 
        Kifejezetten fenntartjuk azonban a jogot, hogy a rágalmazó, obszcén vagy a jelen ÁSZF-be ütköző 
        véleményeket bejelentés alapján vagy saját hatáskörben, indoklás nélkül eltávolítsuk.
      </p>

      <h2>8. Börze (Apróhirdetések) és Adás-vétel</h2>
      <p>
        A platformon (Börze modul) közzétett hirdetések esetén az adásvétel kizárólag a hirdető és a vevő között 
        jön létre. Az üzemeltető <strong>nem vesz részt a tranzakcióban</strong>, nem kezel fizetéseket, nem nyújt 
        vásárlói garanciát, és nem vállal felelősséget a meghirdetett termékek minőségéért, eredetiségéért, 
        biztonságáért vagy a hirdetés valóságtartalmáért. Bármilyen anyagi kár vagy csalás esetén az üzemeltető 
        felelősségre nem vonható.
      </p>

      <h2>9. Események és Közösségi Találkozók</h2>
      <p>
        A platformon meghirdetett eseményeket a felhasználók maguk szervezik. Az üzemeltető <strong>nem 
        rendezvényszervező</strong>. Az eseményeken bekövetkező esetleges balesetekért, vagyoni károkért, 
        elmaradt rendezvényekért vagy a résztvevők közötti konfliktusokért az üzemeltető semmilyen felelősséget 
        nem vállal. A részvétel minden esetben a felhasználó saját felelősségére történik.
      </p>

      <h2>10. Vállalkozói Szolgáltatások és Feketemunka Tilalma</h2>
      <p>
        A Szaknévsorban/Vállalkozói modulban szereplő szakemberek nem állnak az üzemeltető alkalmazásában. 
        Az üzemeltető nem ellenőrzi a vállalkozók szakképesítését, engedélyeit, vagy az általuk végzett munka 
        minőségét. A vállalkozó által okozott esetleges hibás teljesítésért, károkért vagy pénzügyi vitákért 
        kizárólag az adott vállalkozó felel, az üzemeltető felelőssége kizárt. A vállalkozó köteles a profilján 
        szereplő adatokat valósághűen tartani.
      </p>
      <p>
        A platform kifejezetten <strong>tiltja a feketemunka (Schwarzarbeit)</strong> és a be nem jelentett 
        gazdasági tevékenységek hirdetését. A hirdető vállalkozó/szakember kizárólagos felelőssége, hogy 
        rendelkezzen a svájci (vagy a tevékenység helye szerinti) jogszabályok által előírt érvényes 
        munkavállalási és letelepedési engedélyekkel, cégbejegyzéssel (pl. UID, MWST), valamint az adó- és 
        társadalombiztosítási (pl. AHV, ALV) bejelentésekkel. Az üzemeltető kifejezetten kizárja a felelősségét 
        a hirdetők adó-, munka- és cégjogi megfelelőségéért. Bármilyen hatósági megkeresés, gyanú vagy bejelentés 
        esetén a feketemunkát vagy engedély nélküli tevékenységet hirdető profilt <strong>azonnal és véglegesen 
        töröljük</strong> a platformról.
      </p>

      <h2>11. A Szolgáltatás rendelkezésre állása, Adatbiztonság és Vis Maior</h2>
      <p>
        Igyekszünk a Szolgáltatást folyamatosan elérhetővé tenni, de <strong>garanciát nem
        vállalunk</strong> a 100%-os rendelkezésre állásra. Karbantartás, technikai hiba, vagy
        külső szolgáltatók leállása miatti elérhetetlenségért kártérítés nem jár.
      </p>
      <p>
        Mivel a rendszer (kiemelten a felhasználói hozzáférések, mentett posztok és csekklisták) 
        nagy mértékben támaszkodik a böngésző helyi tárolójára (localStorage), az adatok 
        megőrzéséért az üzemeltető <strong>nem vállal felelősséget</strong>. Böngésző-frissítés, 
        gyorsítótár-törlés vagy technikai hiba miatti <strong>adatvesztésért az üzemeltető nem perelhető</strong>.
      </p>

      <h3>11.1 Vis maior (Force Majeure)</h3>
      <p>
        Az üzemeltető <strong>nem felelős</strong> a Szolgáltatás részleges vagy teljes szüneteltetéséért,
        elérhetetlenségéért vagy adatvesztéséért, ha azt olyan rendkívüli körülmény okozza,
        amelyre az üzemeltetőnek nincs ráhatása és azt előre látni sem lehetett. Ilyen
        események különösen (nem kimerítő felsorolás):
      </p>
      <ul>
        <li>infrastrukturális szolgáltatók leállása vagy üzemeltetési hibája (Cloudflare, Resend, Clerk, R2 stb.);</li>
        <li>internet-hálózati infrastruktúra zavarai, DDoS-támadás;</li>
        <li>jogszabályi változások, hatósági végzés (pl. domain-tiltás, IP-blokk);</li>
        <li>természeti katasztrófa, járvány, áberelés;</li>
        <li>kibertámadás (hacker, ransomware) és 0-day exploit;</li>
        <li>harmadik fél API-jának vagy adatforrásának váratlan megszűnése
        (pl. Frankfurter ECB árfolyam API, repülőjegy adatforrás stb.).</li>
      </ul>
      <p>
        Vis maior esetén az üzemeltető haladéktalanul értesíti a felhasználókat és minden tőle
        telhetőt megtesz az elérhetőség mielőbbi visszaállítása érdekében.
        Kártérítés ilyen esetben sem jár.
      </p>
      <h2>12. Felelősség-korlátozás</h2>
      <p>
        Az üzemeltető felelőssége a magyar Polgári Törvénykönyv vonatkozó rendelkezései szerint,
        ingyenes szolgáltatás esetén <strong>csak szándékos károkozásra</strong> terjed ki.
        Gondatlanságból eredő, illetve felhasználók közötti, vagy felhasználó és vállalkozó
        közötti jogvitákból származó károkért az üzemeltető <strong>nem felelős</strong>.
      </p>
      <p>
        Ahol egy adott módul külön felelősség-kizáró nyilatkozatot tartalmaz (például a
        vám-kalkulátor, a bérkalkulátor, az eszköz-leg lejárati nyilatkozata, a határátkelő-figyelő,
        az akció-térkép), az ott rögzített kizáró feltételek a jelen 12. ponttal
        együtt alkalmazandók, és egymást erősítik, nem győzik le.
      </p>

      <h2>13. Eszközök, kalkulátorok és tájékoztató anyagok</h2>
      <p>
        A Szolgáltatáson belül elérhető <strong>kalkulátorok</strong> (gyorshajtás-bírság,
        vám, árfolyam, repülőjegy-becslő stb.), <strong>varázslók</strong> (engedély-választó,
        Einbürgerung-szimulátor stb.), <strong>csekklisták</strong> (ügyintézés varázsló stb.)
        és <strong>tájékoztató anyagok</strong> (Tudásbázis, Segítség oldal) kizárólag
        TÁJÉKOZTATÓ JELLEGŰEK.
      </p>
      <ul>
        <li>
          Ezek <strong>NEM minősülnek jogi, pénzügyi, adótanácsadási, befektetési, orvosi,
          vámjogi vagy bevándorlási szakvéleménynek.</strong> Az üzemeltető nem
          szakképzett jogász, adótanácsadó, pénzügyi szakember vagy bevándorlási ügyvéd.
        </li>
        <li>
          A megjelenített adatok, becslések és számítások publikus források (pl. ch.ch,
          sem.admin.ch, bazg.admin.ch, ECB) és általános minták alapján készülnek.
          Az adatok <strong>pontossága, frissessége és teljessége NEM garantált</strong>.
        </li>
        <li>
          A svájci jogszabályok, vámértékek, árfolyamok és hatósági eljárások időnként
          változnak. Az eszközök tartalma <strong>elavult lehet</strong>.
        </li>
        <li>
          A felhasználó <strong>saját felelősségére</strong> használja ezeket az
          eszközöket. Az üzemeltető <strong>kifejezetten kizárja</strong> a felelősségét
          minden olyan kárért, jogi vagy hatósági következményért, pénzügyi veszteségért,
          bírságért vagy egyéb hátrányért, amit a felhasználó az eszközök eredménye
          alapján hozott döntésével szenved.
        </li>
        <li>
          Hivatalos döntés előtt a felhasználó köteles a <strong>hivatalos forrásokat</strong>{" "}
          (illetékes svájci szövetségi/kantoni hivatal, megfelelő szakképzett szakember)
          önállóan ellenőrizni. A platformon megjelenő hivatalos linkek navigálási
          segédletek, nem szakvélemények.
        </li>
        <li>
          A felhasználói „pipált" csekklisták, mentett becslések, kvíz-eredmények csak a
          felhasználó saját böngészőjében (localStorage) tárolódnak. Nem hatóság előtti
          bizonyíték, nem jogi nyilatkozat.
        </li>
      </ul>
      <p>
        Az <strong>Einbürgerung-szimulátor</strong> (állampolgárság-felkészítő kvíz)
        eredménye semmilyen módon nem helyettesíti a hivatalos állampolgársági vizsgát.
        A <strong>napi Svájci kvíz</strong> kizárólag szórakoztató-oktatási céllal készült.
      </p>

      <h3>13.1 Mesterséges intelligencia (AI) alapú funkciók</h3>
      <p>
        A platformon helyenként <strong>nagy nyelvi modellen (LLM) alapuló mesterséges
        intelligencia (AI) funkciók</strong> érhetők el (Cloudflare Workers AI keretrendszerben
        futó nyílt forrású Meta Llama modell). Ezeket egyértelmű jelölés (✨ ikon, „AI"
        címke) különbözteti meg a manuálisan szerkesztett tartalmaktól. Ide tartozik
        (nem kimerítő felsorolás):
      </p>
      <ul>
        <li>
          <strong>AI vélemény-összegzés</strong> — a Szaknévsorban szereplő vállalkozók
          publikus vélemény-listája alapján generált rövid összegzés.
        </li>
        <li>
          <strong>Természetes nyelvű kereső</strong> — a felhasználó által beírt magyar
          mondatból strukturált keresési szűrőket generál.
        </li>
        <li>
          <strong>Vállalkozói leírás-asszisztens + kategória-javaslat</strong> — a
          beküldés során a felhasználó saját szövegéből csiszolt változatot és
          javasolt kategóriát ad; a végső szöveget és kategóriát mindig a
          felhasználó hagyja jóvá.
        </li>
        <li>
          <strong>Német szó-szótár</strong> — svájci hivatali német kifejezések
          rövid magyar magyarázata.
        </li>
      </ul>
      <ul>
        <li>
          Az AI által generált tartalom <strong>automatikus becslés</strong>, nem
          szakvélemény, nem hivatalos fordítás, nem jogi tanácsadás. Pontossága,
          frissessége és teljessége <strong>nem garantált</strong>; tartalmazhat
          tényszerű hibákat („hallucinációkat") vagy elavult információt.
        </li>
        <li>
          A felhasználó <strong>saját felelősségére</strong> használja az AI-funkciókat.
          Az üzemeltető <strong>kifejezetten kizárja</strong> a felelősségét minden
          olyan kárért, jogi vagy hatósági következményért, üzleti döntésért vagy
          megtévesztésért, ami AI-generált tartalom alapján következik be.
        </li>
        <li>
          A vélemény-összegzés és a leírás-csiszoló az AI-szolgáltató felé továbbítja
          az érintett vélemények és leírások szövegét — részletek az Adatkezelési
          Tájékoztatóban (2.9 szakasz).
        </li>
        <li>
          Az AI funkciók <strong>spam-, abúzív- vagy automatizált használata</strong>{" "}
          (pl. scraping, prompt injection-kísérlet, tömeges szöveg-generálás)
          tiltott, és az adott IP-cím vagy felhasználói azonosító kitiltását
          vonhatja maga után.
        </li>
        <li>
          Az AI-szolgáltatás bármikor, előzetes értesítés nélkül szüneteltethető
          vagy megszüntethető (pl. modell-frissítés, költségkeret kimerülése esetén).
        </li>
      </ul>

      <h3>13.2 Vállalkozói analitika</h3>
      <p>
        A regisztrált vállalkozók a saját kezelő-linkjükön anonim, aggregált
        statisztikákat látnak (profil-megnyitások és telefonszám-kattintások száma,
        utolsó 7/30 nap). Ezek <strong>nem tartalmaznak semmilyen személyes adatot</strong>
        a látogatókról (sem IP-címet, sem nevet, sem földrajzi helyet).
      </p>
      <ul>
        <li>
          Az analitika kizárólag a vállalkozó saját profiljához tartozik; más
          vállalkozók adatai nem érhetők el.
        </li>
        <li>
          A számlálók <strong>tájékoztató jellegűek</strong>, és technikai okból
          (pl. cache, dedupe-szabály, késedelmes feldolgozás) eltérhetnek a tényleges
          forgalomtól. Ezekre üzleti vagy hirdetési döntést alapozni a vállalkozó
          kizárólagos felelőssége.
        </li>
        <li>
          Az analitikai funkció <strong>jelenleg ingyenes</strong>. Az üzemeltető
          fenntartja a jogot, hogy a jövőben bizonyos kiterjesztett analitikai
          szolgáltatásokat fizetős vagy prémium konstrukcióban tegyen elérhetővé.
        </li>
      </ul>

      <h3>13.3 Mentett bér-ajánlatok (Bérkalkulátor „Ajánlataim")</h3>
      <p>
        A Bérkalkulátor lehetőséget ad arra, hogy az interjún kapott
        bér-ajánlatokat a felhasználó saját böngészőjében (localStorage) mentse és
        összehasonlítsa. <strong>Ezek az adatok kizárólag a felhasználó eszközén
        tárolódnak</strong>, az üzemeltető szervereire NEM kerülnek fel, és más
        felhasználók nem férnek hozzá.
      </p>
      <ul>
        <li>
          Az adatok elvesznek, ha a felhasználó törli a böngésző-tárolóját, eszközt
          vált, vagy privát módot használ. Az adatmegőrzésért az üzemeltető
          felelősséget nem vállal.
        </li>
        <li>
          A kalkulátor eredménye <strong>becslés</strong> (lásd a 13. pontot is) — a
          tényleges nettó bér eltérhet kanton, község, biztosító, kollektív szerződés
          és személyes körülmények szerint.
        </li>
      </ul>

      <h2>14. Közösségi jelentések</h2>
      <p>
        A platformon a felhasználók által beadott <strong>közösségi jelentések</strong>{" "}
        (akció-térkép, határátkelő-figyelő, SOS-radar, vélemény stb.)
        a feladó felhasználó saját megfigyelései — az üzemeltető <strong>nem ellenőrzi
        ezek pontosságát</strong>. A felhasználó saját felelősségére használja a
        közösségi jelentéseket; ezekre alapozott döntésekért az üzemeltető és más
        felhasználók nem felelnek.
      </p>
      <p>
        A <strong>Közösségi SOS-radar</strong> nem helyettesíti a hivatalos
        segélyhívást (Svájcban 112). Vészhelyzet esetén MINDIG hívd a 112-t.
      </p>

      <h3>14.1 Kinti Radar (Push Értesítések)</h3>
      <p>
        A "Kinti Radar" funkció segítségével a felhasználók (böngészőjük beállításaitól függően) Push értesítéseket 
        kérhetnek bizonyos eseményekről (pl. új albérlet, árfolyamváltozás). Az üzemeltető <strong>kifejezetten kizárja a felelősségét</strong> 
        az értesítések késedelmes kézbesítéséből, technikai hiba miatti elmaradásából, vagy az azokban szereplő (harmadik féltől származó) 
        adatok pontatlanságából eredő <strong>bármilyen anyagi vagy nem vagyoni kárért, elmaradt haszonért</strong>. Az árfolyam riasztások, illetve 
        hirdetés-értesítők kizárólag kényelmi és tájékoztató célt szolgálnak, ezek alapján hivatalos vagy pénzügyi döntést hozni a felhasználó 
        kizárólagos kockázata.
      </p>

      <h2>15. Külső Linkekért Való Felelősség</h2>
      <p>
        A platformon a felhasználók és vállalkozások által megosztott külső weblapokra mutató 
        hivatkozások (linkek) tartalmáért az üzemeltető nem vállal felelősséget. Az üzemeltető nem 
        ellenőrzi a külső oldalak tartalmát, adatvédelmi gyakorlatát vagy biztonságát. A külső 
        linkek megnyitása a felhasználó saját felelősségére történik. Bármilyen károkozás 
        (pl. adathalászat, vírusok) esetén az üzemeltető felelőssége kizárt.
      </p>

      <h2>16. Szellemi tulajdon és Kártalanítás (Mentesítés)</h2>
      <p>
        A kinti.app márkajegye, logója, design rendszere az üzemeltető szellemi tulajdona.
        A platformon megjelenő felhasználói tartalmak, képek és logók a feltöltők tulajdonát képezik,
        akik a platform használatával engedélyt adnak ezek megjelenítésére a Szolgáltatás keretében.
      </p>
      <p>
        A felhasználó garantálja, hogy az általa feltöltött képek, logók és szövegek <strong>nem sértik 
        harmadik fél szerzői vagy védjegyjogait</strong>. Amennyiben egy felhasználó által feltöltött 
        jogosulatlan tartalom miatt harmadik fél (pl. jogtulajdonos, ügyvédi iroda) kártérítési, 
        bírság- vagy perköltség-követeléssel lép fel az üzemeltetővel szemben, a jogsértő felhasználó 
        köteles az üzemeltetőt <strong>teljeskörűen mentesíteni, és az összes felmerülő kárt, bírságot 
        és jogi költséget azonnal megtéríteni</strong>.
      </p>

      <h2>17. Módosítás és adatok változása</h2>
      <p>
        Az üzemeltető fenntartja a jogot, hogy ezeket a feltételeket egyoldalúan módosítsa.
        A módosítás a közzétételkor lép hatályba; lényeges változásokról a vállalkozói
        regisztráltakat emailben is értesítjük.
      </p>
      <p>
        A platformon megjelenő <strong>adatok, szabályok, díjak, árfolyamok, hatósági
        eljárások és jogszabályi előírások bármikor megváltozhatnak, előzetes értesítés
        nélkül</strong> — különösen igaz ez a svájci közigazgatási szabályokra, vámhatár-értékekre,
        forrásadó-kulcsokra, repülőjegy-árakra és engedélyezési feltételekre.
        Az üzemeltetőt nem terheli kötelezettség arra, hogy az oldalon szereplő tartalmakat
        folyamatosan naprakészen tartsa; az adatok az utolsó szerkesztés időpontjában
        érvényes állapotra vonatkoznak.
      </p>
      <p>
        A felhasználó <strong>kizárólagos felelőssége</strong>, hogy a platformon talált
        információkat a döntés meghozatala előtt a hatályos, aktuális hivatalos forrásokkal
        összevetse. Az elavult vagy megváltozott adatokon alapuló döntésekből eredő
        <strong>bármilyen kárért az üzemeltető felelőssége teljes körűen kizárt.</strong>
      </p>

      <h2>18. Adatvédelem</h2>
      <p>
        A személyes adatok kezelésének szabályait, a kezelt adatok körét, a megőrzési időket és az 
        érintettek jogait a különálló <strong>Adatvédelmi Tájékoztató</strong> tartalmazza, amely 
        a jelen ÁSZF elválaszthatatlan részét képezi. A Szolgáltatás használatával a felhasználó 
        tudomásul veszi az Adatvédelmi Tájékoztatóban foglaltakat.
      </p>

      <h2>19. Jogválasztás és bíróság</h2>
      <p>
        A jelen feltételekre a <strong>magyar jog</strong> az irányadó. Esetleges jogvitákban
        a magyar bíróságok rendelkeznek hatáskörrel és illetékességgel.
      </p>

      <h2>20. Vitarendezés</h2>
      <h3>20.1 Peren kívüli vitarendezés (DSA Art. 21)</h3>
      <p>
        Ha a Szolgáltatással kapcsolatban panaszod van, és az 5.2 pont szerinti
        belső panaszkezelési eljárásunk sem hozott megnyugtató eredményt, a
        Digitális Szolgáltatások Rendelete (DSA) 21. cikke alapján jogosult vagy
        igénybe venni egy elismert{" "}
        <strong>peren kívüli vitarendezési szervet</strong>. Az Európai Bizottság
        tagállamonkénti listáját a{" "}
        <a href="https://digital-strategy.ec.europa.eu/" target="_blank" rel="noreferrer">
          digital-strategy.ec.europa.eu
        </a>{" "}
        oldalon találod. A vitarendezési szerv döntései az üzemeltetőre nézve
        ajánlás-jellegűek; a végső döntést bíróság hozhatja.
      </p>
      <h3>20.2 Fogyasztói vitarendezés</h3>
      <p>
        Magyarországi fogyasztóként a megyei (fővárosi) kereskedelmi és iparkamara
        mellett működő <strong>békéltető testületekhez</strong> fordulhatsz; az
        Európai Unióban élő fogyasztók az{" "}
        <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noreferrer">
          Online Dispute Resolution (ODR) platformon
        </a>{" "}
        is kezdeményezhetnek vitarendezést.
      </p>

      <h2>21. Kapcsolat</h2>
      <p>
        Kérdés, panasz, takedown-bejelentés: <a href="mailto:info@kinti.app">info@kinti.app</a>
        {" / "}
        <a href="mailto:abuse@kinti.app">abuse@kinti.app</a>
      </p>
    </LegalPage>
  );
}
