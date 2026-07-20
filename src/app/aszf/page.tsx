import { LegalPage } from "@/components/legal-page";

export const dynamic = "force-static";

export const metadata = { title: "Felhasználási Feltételek" };

export default function AszfPage() {
  return (
    <LegalPage title="Felhasználási Feltételek (ÁSZF)" updatedAt="2026-07-20">
      <p>
        A kinti.app szolgáltatás (a továbbiakban: <strong>„Szolgáltatás"</strong>) használatával
        elfogadod az itt rögzített feltételeket. Kérlek, olvasd el figyelmesen.
      </p>

      <h2>1. A Szolgáltatás jellege</h2>
      <p>
        A kinti.app egy közösségi platform, amely a Svájcban és Európában élő magyarokat
        és a velük kapcsolatban álló vállalkozásokat / szakembereket köti össze. A Szolgáltatás
        üzemeltetője a <strong>Feedback Jobs S.R.L.</strong> Az <strong>alapszolgáltatások</strong>{" "}
        (kereső, regisztráció, hirdetésfeladás, állásbörze, kalkulátorok) <strong>ingyenesek</strong>;
        egyes <strong>prémium funkciók opcionális, díjköteles PRO-előfizetés</strong> keretében
        érhetők el, amelyet <span className="web-only-payment">a Paddle fizetési szolgáltatón
        keresztül</span><span className="android-only-payment">a Google Play fizetési rendszerén
        keresztül</span> lehet megrendelni és bármikor lemondani.
      </p>
      <p>
        A Szolgáltatás <strong>közvetítő platform</strong>: nem vagyunk fél a felhasználók és
        a vállalkozások között létrejövő esetleges megállapodásokban, és nem garantáljuk a
        platformon található információk pontosságát.
      </p>

      <h3>1.1 Kinti PRO előfizetés: fizetés, elállás és visszatérítés</h3>
      {/* A fizetési szolgáltató kontextusfüggő: a weben Paddle, a Google Play
          áruházból telepített Android-appban a Google Play fizetési rendszere
          (a Play szabályzata az appban a webes fizetés említését is tiltja).
          A szakasz-SZÁMOZÁS változatlan — a kód hivatkozik rá (ÁSZF 1.1). */}
      <p className="web-only-payment">
        A díjköteles <strong>Kinti PRO</strong> (és a Szaknévsor-kiemelés / kiemelt állás)
        előfizetést a <strong>Paddle</strong> (Paddle.com Market Limited) mint{" "}
        <em>Merchant of Record</em> (a vásárlás szerződő eladója és számlakibocsátója)
        bonyolítja. A vásárlásra így a <strong>Paddle szerződési és visszatérítési
        feltételei is</strong> irányadók; az adó (pl. ÁFA/MWST) felszámítása és a számlázás
        is a Paddle-nél történik. Az árak a megrendeléskor feltüntetett pénznemben és
        összegben, az alkalmazandó adóval értendők.
      </p>
      <p className="android-only-payment">
        A díjköteles <strong>Kinti PRO</strong> (és a Szaknévsor-kiemelés / kiemelt állás)
        előfizetés az alkalmazásban a <strong>Google Play fizetési rendszerén</strong> keresztül
        vásárolható meg. A vásárlásra a <strong>Google Play szerződési és visszatérítési
        feltételei is</strong> irányadók; az adó (pl. ÁFA/MWST) felszámítása és a számlázás
        a Google-nál történik. Az árak a megrendeléskor feltüntetett pénznemben és
        összegben, az alkalmazandó adóval értendők.
      </p>
      <p>
        <strong>Elállási jog (EU/EGT fogyasztók).</strong> Ha az Európai Unióban / EGT-ben
        élő fogyasztó vagy, a fogyasztói jogokról szóló 2011/83/EU irányelv alapján a
        szerződéskötéstől számított <strong>14 napon belül indokolás nélkül elállhatsz</strong>{" "}
        a vásárlástól. Mivel a PRO egy <strong>azonnal hozzáférhetővé váló digitális
        szolgáltatás</strong>, a megrendeléskor <strong>kifejezetten kéred a szolgáltatás
        14 napon belüli megkezdését</strong>, és <strong>tudomásul veszed, hogy a szolgáltatás
        teljes körű teljesítésével elveszíted az elállási jogodat</strong> (az irányelv 16. cikk
        m) pontja). A részben igénybe vett időszakra az ellenérték arányos része számítható fel.
        Az elállási / visszatérítési kérelmet{" "}
        <span className="web-only-payment">a Paddle-nél, illetve</span>
        <span className="android-only-payment">a Google Play-nél, illetve</span> az{" "}
        <a href="mailto:info@kinti.app">info@kinti.app</a> címen jelezheted.
      </p>
      <p>
        <strong>Lemondás és megújulás.</strong> Az előfizetés <strong>bármikor lemondható</strong>;
        a lemondás a folyó számlázási időszak végén lép hatályba, addig a PRO funkciók elérhetők
        maradnak. A lemondás a már kiszámlázott, megkezdett időszakra — a fenti elállási jogon
        túl — nem keletkeztet automatikus visszatérítési igényt. Méltányossági visszatérítésről{" "}
        <span className="web-only-payment">a Paddle feltételei</span>
        <span className="android-only-payment">a Google Play feltételei</span> és az üzemeltető
        egyedi mérlegelése szerint dönthetünk.
      </p>
      <p style={{ fontStyle: "italic" }}>
        Svájci fogyasztóként a svájci jog az online/digitális vásárlásokra általában nem ír elő
        kötelező elállási (cooling-off) időszakot; a fenti 14 napos jog az EU/EGT-fogyasztókat
        illeti. A kötelező fogyasztóvédelmi rendelkezések érintetlenül maradnak (lásd 19. pont).
      </p>

      <h2>2. Felhasználói típusok</h2>
      <p>
        A Szolgáltatást <strong>18. életévét betöltött</strong> (nagykorú)
        természetes személyek vehetik igénybe. 18 év alatti
        felhasználók számára a regisztráció, a hirdetésfeladás és a
        vélemény-írás kizárt.
      </p>
      <h3>2.1 Kinti felhasználó (közösségi tag)</h3>
      <p>
        Bárki, aki a Szolgáltatást <strong>hagyományos regisztráció nélkül</strong> használja: böngészi a
        vállalkozásokat, hirdetést vagy értékelést
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
        <li>vállalkozói profilok a Szaknévsorban;</li>
        <li>felhasználói vélemények (értékelések);</li>
        <li>„Keresek" igény-hirdetések;</li>
        <li>Élettörténetek (felhasználói történetek, 3.3 pont);</li>
        <li>Albérlet-börze hirdetései (8.2 pont).</li>
      </ul>
      <p>
        A feltöltött képeket a kézi jóváhagyást megelőzően automatikus
        képmoderáció (Cloudflare Workers AI) is szűri.
      </p>
      <p>
        Az üzemeltető a hirdetéseket / értékeléseket / vállalkozói profilokat /
        történeteket <strong>indoklás nélkül elutasíthatja</strong>, ha
        valószínűsíthetően sérti a jelen ÁSZF 3., 3.1 vagy a vonatkozó
        jogszabályok rendelkezéseit. Az elutasított tartalmakat az 5.2 pont
        szerinti emailes csatornán lehet fellebbezve vitatni.
      </p>

      <h3>3.3 Élettörténetek (felhasználói történetek) és tartalmi licenc</h3>
      <p>
        Az „Élettörténetek" modulban a felhasználó saját, kiköltözéssel/külföldi
        élettel kapcsolatos írását küldheti be közzétételre. A beküldéssel a
        felhasználó:
      </p>
      <ul>
        <li>
          <strong>nem-kizárólagos, területi korlátozás nélküli, ingyenes
          felhasználási engedélyt</strong> ad az üzemeltetőnek a történet (és az
          opcionális borítókép) kinti.app-on való közzétételére, tárolására,
          megjelenítésére és a szolgáltatás népszerűsítésében részletként való
          idézésére — a szerzői minőség a megadott néven/becenéven feltüntetve;
        </li>
        <li>
          <strong>szavatolja</strong>, hogy a történet a saját szellemi terméke, és
          nem sérti harmadik személy szerzői, személyiségi vagy egyéb jogát —
          különösen: más, azonosítható személyekről csak azok hozzájárulásával
          vagy felismerhetetlenné téve írjon;
        </li>
        <li>
          tudomásul veszi, hogy a történet <strong>szerkesztői (kézi) jóváhagyás
          után</strong> jelenik meg, és az üzemeltető azt a 3.2 és 4. pont szerint
          elutasíthatja vagy eltávolíthatja.
        </li>
      </ul>
      <p>
        A közzétett történet a szerző <strong>személyes tapasztalata és
        véleménye</strong> — nem az üzemeltető álláspontja, és nem minősül
        tanácsadásnak (13. pont). A szerző a történet törlését bármikor kérheti
        az <a href="mailto:info@kinti.app">info@kinti.app</a> címen (az
        Adatvédelmi tájékoztató 5. pontja szerint), a beküldött történethez
        megadott (nem nyilvános) e-mail-címéről.
      </p>

      <h2>4. Szolgáltatásmegtagadás és Kitiltás joga</h2>
      <p>
        Az üzemeltető fenntartja a jogot, hogy indoklás és előzetes értesítés nélkül, azonnali hatállyal 
        eltávolítson bármilyen hirdetést, értékelést vagy vállalkozói profilt, illetve IP-cím vagy egyéb
        azonosító alapján véglegesen kitiltson bármely felhasználót a platformról, amennyiben az a 
        jelen ÁSZF-et, a közösségi irányelveket, vagy a svájci/uniós jogszabályokat megsérti, vagy a 
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
      <p>
        <strong>DSA monitoring (Art. 17):</strong> Az{" "}
        <a href="mailto:abuse@kinti.app">abuse@kinti.app</a> postafiók folyamatosan
        monitorozva van. A bejelentéseket általában <strong>72 órán belül</strong>{" "}
        feldolgozzuk; komplex ügyekben legkésőbb <strong>30 napon belül</strong>{" "}
        döntünk és írásban értesítjük a bejelentőt.
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

      <h3>5.3 Bűncselekmények gyanújának bejelentése (DSA Art. 18)</h3>
      <p>
        Az Európai Unió Digitális Szolgáltatások Rendelete (DSA) 18. cikke értelmében, amennyiben
        az üzemeltető olyan információ birtokába jut, amely alapján alapos gyanú merül fel egy
        személy vagy személyek életét, illetve biztonságát fenyegető bűncselekmény (pl. terrorizmus,
        gyermekbántalmazás, élet elleni fenyegetés) elkövetésére, azt <strong>haladéktalanul bejelenti a
        svájci vagy magyar bűnüldöző hatóságoknak</strong> (Fedpol / ORFK), és átadja számukra a rendelkezésre
        álló összes digitális bizonyítékot (IP-címek, hash-ek, tartalmak).
      </p>

      <h2>6. Tartalom lejárta és törlése</h2>
      <ul>
        <li>A felhasználók által beküldött tartalmak (pl. álláshirdetések, „Keresek"- és
          albérlet-hirdetések) a jellegüktől függő ideig láthatók, utána automatikusan
          eltűnnek (törlődnek);</li>
        <li>A feladó <strong>bármikor törölheti</strong> a saját tartalmát a beküldés után
          megjelenő (és a böngésző helyi tárolójában elmentett) <em>kezelő linkről</em>;</li>
        <li>Az üzemeltető fenntartja a jogot a jogszabálysértő vagy a 3. pontba ütköző tartalmak
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

      <h2>7. Értékelési rendszer (csillag + szöveges vélemény)</h2>
      <p>
        A platformon egy vállalkozásról <strong>1–5 csillagos értékelés</strong> adható, amelyhez a
        felhasználó <strong>opcionálisan rövid szöveges véleményt</strong> (max. 1000 karakter) és egy
        megjelenő nevet/álnevet is fűzhet. Az értékelések a felhasználók{" "}
        <strong>szubjektív megítélését és személyes tapasztalatát</strong> tükrözik — nem az
        üzemeltető álláspontja.
      </p>
      <p>
        <strong>Beküldés és közzététel.</strong> A beküldést Cloudflare Turnstile CAPTCHA és
        IP-alapú rate-limit védi a visszaélés ellen; ha a felhasználó e-mail-címet ad meg, a
        beküldés csak az e-mailre küldött <strong>megerősítő linkre kattintva</strong> válik
        érvényessé (ez igazolja, hogy a beküldő az adott e-mail-fiók felett rendelkezik). Minden
        értékelés — a csillag és a szöveg egyaránt — <strong>a közzététel előtt admin-moderáción
        esik át</strong> (visszaélés-, spam- és jogsértés-szűrés, tipikusan 24 órán belül); a
        szöveget ezen felül automatikus trágárság-szűrő is ellenőrzi.
      </p>
      <p>
        <strong>Amit nem szavatolunk (fogyasztói átláthatóság).</strong> Az előzetes moderáció a
        DSA 7. cikke szerinti önkéntes, saját kezdeményezésű intézkedés, és <strong>nem keletkeztet
        az üzemeltető részéről felelősséget az értékelések tartalmáért</strong>. Az értékelések{" "}
        <strong>valóságtartalmát, megalapozottságát nem vizsgáljuk és nem szavatoljuk</strong>, és —
        az (EU) 2019/2161 irányelv (Omnibus) szerinti kötelező tájékoztatásként — kifejezetten
        közöljük, hogy <strong>nem ellenőrizzük, hogy az értékelő ténylegesen igénybe vette-e</strong>{" "}
        az adott vállalkozás szolgáltatását. Ugyanez a tájékoztatás megjelenik ott is, ahol az
        értékelések láthatók (a vállalkozás oldalán).
      </p>
      <p>
        A közzétett értékelésekből fakadó esetleges hitelrontásért vagy személyiségi jogsértésért 
        kizárólag az értékelést leadó felhasználó felel, az üzemeltetőt felelősség nem terheli. 
        Kifejezetten fenntartjuk azonban a jogot, hogy a rágalmazó, obszcén vagy a jelen ÁSZF-be ütköző 
        értékeléseket bejelentés alapján vagy saját hatáskörben, indoklás nélkül eltávolítsuk.
      </p>

      <h2>8. Felhasználók közötti tranzakciók</h2>
      <p>
        A platformon keresztül létrejövő bármely adásvétel, megbízás vagy egyéb megállapodás kizárólag az
        érintett felhasználók (illetve felhasználó és vállalkozó) között jön létre. Az üzemeltető
        <strong>nem vesz részt a tranzakcióban</strong>, nem kezel fizetéseket, nem nyújt vásárlói garanciát,
        és nem vállal felelősséget a termékek vagy szolgáltatások minőségéért, eredetiségéért, biztonságáért
        vagy a megosztott információk valóságtartalmáért. Bármilyen anyagi kár vagy csalás esetén az üzemeltető
        felelősségre nem vonható.
      </p>

      <h3>8.1 „Keresek" igény-hirdetések és továbbításuk</h3>
      <p>
        A „Keresek" táblán a felhasználó szolgáltatás-igényt tehet közzé. A
        hirdetésben megadott elérhetőség a felhasználó döntése alapján{" "}
        <strong>nyilvánosan megjelenik</strong> (ezt a beküldő űrlap előzetesen
        jelzi), hogy a szakemberek közvetlenül jelentkezhessenek. A jóváhagyott
        hirdetést az üzemeltető emellett <strong>továbbítja a kategóriába vágó,
        Szaknévsorban szereplő vállalkozásoknak</strong> — ez a szolgáltatás
        rendeltetése. A hirdetés 30 nap után automatikusan lejár. A hirdető és a
        jelentkező szakember közötti megállapodásra a 8. pont irányadó: az
        üzemeltető a felek közötti ügyletben nem vesz részt.
      </p>

      <h3>8.2 Szoba- és albérlet-börze</h3>
      <p>
        Az Albérlet-börze felhasználók közötti <strong>hirdetőtábla</strong> lakhatási
        hirdetésekhez (kiadó szoba/lakás, illetve kereső hirdetés). Az üzemeltető{" "}
        <strong>kizárólag a hirdetési felületet biztosítja</strong>: nem ingatlanközvetítő,
        nem szed jutalékot, nem kezel bérleti díjat vagy kauciót, és nem részese a hirdető
        és az érdeklődő közötti semmilyen megállapodásnak — a felek közötti ügyletre a 8.
        pont felelősség-kizárása teljeskörűen irányadó.
      </p>
      <ul>
        <li>
          <strong>A hirdető nyilatkozata:</strong> kiadó hirdetés feladásának feltétele a
          hirdető kifejezett nyilatkozata arról, hogy rendelkezik a tulajdonos/főbérlő
          írásos engedélyével a lakás/szoba albérletbe (Untermiete) adásához. A nyilatkozat
          valóságtartalmáért kizárólag a hirdető felel; valótlan nyilatkozat esetén az
          üzemeltető a hirdetést eltávolítja, és a felhasználó hozzáférését megszüntetheti.
        </li>
        <li>
          <strong>Közzététel:</strong> a börze-hirdetés a 3.2 pont szerinti előzetes
          admin-jóváhagyás után jelenik meg (tipikusan 24 órán belül); a bejelentett
          (jogsértőnek jelzett) hirdetést az üzemeltető emellett a DSA szerinti
          bejelentés-kezelés keretében a vizsgálat idejére azonnal elrejti. A hirdetés a
          feladástól 60 nap után automatikusan lekerül a listáról.
        </li>
        <li>
          <strong>Elérhetőség:</strong> a hirdetésben megadott elérhetőség nem nyilvános —
          kizárólag bejelentkezett Kinti PRO-előfizetők kérhetik le, kizárólag az adott
          hirdetéssel kapcsolatos kapcsolatfelvételre; gyűjtése, marketing-célú
          felhasználása vagy továbbadása tilos.
        </li>
        <li>
          <strong>A 10. pont (feketemunka tilalma) mintájára</strong> a jogszabályba ütköző
          (pl. engedély nélküli, uzsora-jellegű vagy megtévesztő) hirdetés tilos, és
          eltávolításra kerül.
        </li>
      </ul>

      <h2>9. B2B Hub (zárt vállalkozói projektpiac)</h2>
      <p>
        A B2B Hub a Szaknévsor PRO előfizetéssel rendelkező vállalkozások zárt felülete, ahol
        alvállalkozói/projekt-kiírásokat tehetnek közzé és jelentkezhetnek egymás kiírásaira.
        A kiírások <strong>időrendben</strong> jelennek meg — a B2B Hubon belül fizetett
        rangsorolás vagy kiemelés <strong>nincs</strong>.
      </p>
      <ul>
        <li>
          <strong>Kiírás feltétele:</strong> aktív Szaknévsor PRO előfizetés ÉS admin által
          jóváhagyott (moderált) vállalkozói profil. A kiíró felel a kiírás tartalmáért és
          valóságtartalmáért.
        </li>
        <li>
          <strong>Az üzemeltető nem fél a tagok közötti ügyletekben</strong> (lásd 8. pont):
          nem közvetít, nem kezel fizetést, nem vállal garanciát a tagok megbízhatóságáért,
          fizetőképességéért vagy az elvégzett munka minőségéért. A tagok közötti megállapodás,
          teljesítés és vita kizárólag a felek ügye.
        </li>
        <li>
          <strong>Kapcsolati adatok:</strong> a kiírásban megadott elérhetőség kizárólag az adott
          projekttel kapcsolatos megkeresésre használható — marketing-célú felhasználása,
          gyűjtése vagy továbbadása tilos.
        </li>
        <li>
          <strong>A 10. pont (feketemunka tilalma) a B2B Hubra is teljeskörűen vonatkozik:</strong>
          be nem jelentett munkavégzésre irányuló kiírást az üzemeltető eltávolít, és a kiíró
          hozzáférését megszüntetheti.
        </li>
        <li>
          <strong>Moderáció és bejelentés:</strong> minden kiírás bejelenthető (5.1 pont, DSA
          Art. 16); a bejelentett kiírás a döntésig azonnal rejtésre kerül. Az üzemeltető a
          jogsértő vagy a jelen feltételekbe ütköző kiírást indokolás mellett eltávolíthatja.
        </li>
      </ul>

      <h2>10. Vállalkozói Szolgáltatások és Feketemunka Tilalma</h2>
      <p>
        A Szaknévsorban/Vállalkozói modulban szereplő szakemberek nem állnak az üzemeltető alkalmazásában. 
        Az üzemeltető nem ellenőrzi a vállalkozók szakképesítését, engedélyeit, vagy az általuk végzett munka 
        minőségét. A vállalkozó által okozott esetleges hibás teljesítésért, károkért vagy pénzügyi vitákért
        kizárólag az adott vállalkozó felel, az üzemeltető felelőssége kizárt. A vállalkozó köteles a profilján
        szereplő adatokat valósághűen tartani.
      </p>
      <p>
        <strong>A Szaknévsor adatainak forrása és pontossága:</strong> egyes bejegyzéseket a vállalkozás
        maga regisztrálja (admin-moderáció mellett), másokat az üzemeltető állít össze
        nyilvánosan elérhető forrásokból (pl. hivatalos nyilvántartások, a vállalkozás saját
        honlapja, szakmai és közösségi katalógusok). Az üzemeltető <strong>nem garantálja a
        megjelenített cím, telefonszám, weboldal vagy egyéb elérhetőségi adat pontosságát,
        teljességét vagy aktualitását</strong> — egy vállalkozás időközben költözhetett,
        megszűnhetett, vagy adatai megváltozhattak, és ezt az üzemeltető nem minden esetben
        tudja azonnal követni. A kinti.app <strong>nem vállal felelősséget</strong> a pontatlan,
        elavult vagy hibás cím-/elérhetőségi adatból eredő károkért vagy egyéb következményért
        (pl. sikertelen hívás, rossz címre érkezés). Fontos döntés (pl. időpontfoglalás, hosszabb
        útra indulás) előtt javasolt az adatot közvetlenül a vállalkozásnál ellenőrizni. Ha egy
        bejegyzés pontatlan, a vállalkozás tulajdonosa a profilt a <strong>„Foglald el a
        vállalkozásod"</strong> funkcióval igényelheti és javíthatja; egyéb hibajelzés az{" "}
        <a href="mailto:abuse@kinti.app">abuse@kinti.app</a> címen tehető.
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

      <h3>10.1 Állásbörze (Állások modul) — állás-lista, nem munkaközvetítés</h3>
      <p>
        Az <strong>„Állások" modul</strong> egy <strong>ingyenes állás-hirdetési felület
        (állás-lista)</strong>: a munkáltatók saját maguk töltik fel az álláshirdetéseiket
        (admin-moderáció mellett), a felhasználók pedig böngészhetik azokat, és — saját
        döntésük alapján — jelentkezhetnek rájuk.
      </p>
      <ul>
        <li>
          <strong>Az üzemeltető nem munkáltató és nem szerződő fél.</strong> A Kinti az
          álláshirdetés és a jelentkezés megjelenítésén / továbbításán túl <strong>nem hoz
          létre</strong> munkaviszonyt, megbízási vagy bármilyen foglalkoztatási jogviszonyt
          a jelentkező és a munkáltató között, és annak nem részese. A felvételi döntés
          kizárólag a munkáltatóé.
        </li>
        <li>
          <strong>Ez a felület önmagában nem minősül munkaerő-közvetítésnek
          (Arbeitsvermittlung) vagy munkaerő-kölcsönzésnek (Personalverleih).</strong> A
          Kinti az Állások modulban kizárólag hirdetéseket jelenít meg, és — a jelentkező
          kifejezett kezdeményezésére — továbbítja a jelentkezési adatokat a munkáltatónak;
          közvetítői díjat, sikerdíjat vagy hasonló ellenértéket <strong>nem számít fel</strong>,
          és <strong>az álláskeresőktől semmilyen díjat nem kér</strong>.
        </li>
        <li>
          <strong>A munkaközvetítés a Feedback Jobs S.R.L. külön, megfelelően
          engedélyezett tevékenysége.</strong> Amennyiben az üzemeltető (vagy kapcsolt
          vállalkozása) engedélyköteles munkaerő-közvetítést vagy -kölcsönzést végez, az
          a jelen ingyenes platformtól <strong>elkülönülő szolgáltatás</strong>, saját
          külön szerződés és a vonatkozó (pl. svájci AVG/Arbeitsvermittlungsgesetz szerinti)
          engedély alapján — és nem képezi a jelen ÁSZF tárgyát.
        </li>
        <li>
          <strong>Jelentkezési adatok továbbítása.</strong> Amikor egy állásra jelentkezel,
          a megadott adataidat (név, e-mail, opcionális telefonszám, üzenet és — ha
          feltöltötted — önéletrajz) <strong>a te kezdeményezésedre, a hozzájárulásoddal</strong>
          továbbítjuk a hirdető munkáltatónak. Ezt követően az adataidat a munkáltató önálló
          adatkezelőként kezeli; az ő adatkezeléséért az üzemeltető nem felel (lásd
          Adatkezelési Tájékoztató).
        </li>
        <li>
          <strong>Semmilyen garancia.</strong> Az üzemeltető nem garantálja az
          álláshirdetések valódiságát, pontosságát, betölthetőségét, sem azt, hogy a
          jelentkezésedre választ vagy állásajánlatot kapsz. A munkakörülményekért,
          bérezésért, a munkáltató magatartásáért és a hirdetés jogszerűségéért kizárólag
          a hirdető munkáltató felel.
        </li>
        <li>
          <strong>A munkáltató felelőssége.</strong> A hirdető szavatolja, hogy a
          hirdetés valós, nem megtévesztő, nem diszkriminatív, megfelel a munkajogi és
          adatvédelmi előírásoknak, és nem irányul be nem jelentett (Schwarzarbeit) vagy
          engedély nélküli foglalkoztatásra (lásd 10. pont). A jogsértő hirdetéseket
          értesítés vagy saját észlelés alapján eltávolítjuk.
        </li>
        <li>
          <strong>Külső (aggregált) hirdetések.</strong> Az Állások modul harmadik
          felek erre szolgáló aggregátor-API-jaiból (pl. Adzuna, Jooble, Arbeitnow,
          job-room.ch) származó hirdetéseket is megjeleníthet. Ezek látható
          forrás-jelöléssel („via …") jelennek meg, és a forrás oldalára mutatnak;
          tartalmukért, frissességükért és jogszerűségükért a forrás, illetve az
          eredeti hirdető felel. Az üzemeltető ezekből kizárólag alap-metaadatot
          (cím, cég, település, bér-sáv, forrás-link) tárol átmenetileg a lista
          megjelenítéséhez — a hirdetés szövegét nem veszi át, a régóta nem frissülő
          tételeket automatikusan törli.
        </li>
      </ul>

      <h2>10/A. Rangsorolás és fizetett kiemelés (átláthatóság)</h2>
      <p>
        A keresési találatok és listák <strong>fő rangsorolási paraméterei</strong>: (1) a{" "}
        <strong>fizetett kiemelés</strong> (Szaknévsor PRO, illetve Kiemelt Állás — a kiemelt
        bejegyzések a lista <strong>elején</strong> jelennek meg), (2) a keresési feltételeknek
        (kategória, kulcsszó, régió) való megfelelés, (3) a <strong>földrajzi közelség</strong>.
        A fizetett kiemelés tehát <strong>befolyásolja a megjelenési sorrendet</strong>; a kiemelt
        bejegyzéseket a felületen minden esetben <strong>jól látható jelöléssel</strong>{" "}
        („PRO” / „Kiemelt állás” címke, eltérő keret) különböztetjük meg a nem fizetett
        találatoktól. A kiemelés a nem fizetett találatok egymás közötti (relevancia- és
        közelség-alapú) sorrendjét nem változtatja meg, és nem minősül az adott vállalkozás
        vagy hirdetés minőségére vonatkozó ajánlásnak.
      </p>
      <p>
        Ugyanezek a szabályok vonatkoznak a Szolgáltatás eszközeibe ágyazott{" "}
        <strong>ajánló-modulokra</strong> is (például a kalkulátorok, a kvíz, a
        határidő-asszisztens, az asszisztens vagy a Telegram-bot felületén megjelenő
        vállalkozás- és állás-ajánlókra): ott is a fizetett kiemelés kerül előre, a kiemelt
        elem minden esetben <strong>„Kiemelt” jelölést</strong> visel, és a megjelenés nem
        minősül az adott vállalkozás vagy hirdetés minőségére, alkalmasságára vonatkozó
        ajánlásnak, sem szakmai (adó-, jogi vagy egyéb) tanácsadásnak — a szakember
        kiválasztása és megbízása a Felhasználó saját döntése és felelőssége.
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
        Az üzemeltető felelőssége az irányadó jog (lásd 19. pont — román jog) vonatkozó
        rendelkezései szerint, ingyenes szolgáltatás esetén a jogszabály által megengedett
        legszűkebb körre, <strong>elsősorban a szándékos vagy súlyosan gondatlan
        károkozásra</strong> korlátozódik. A felhasználók közötti, vagy felhasználó és
        vállalkozó közötti jogvitákból származó károkért az üzemeltető <strong>nem
        felelős</strong>. E korlátozás nem érinti a fogyasztót a lakóhelye szerinti jog
        kötelező rendelkezései által biztosított védelmet (lásd 19. pont).
      </p>
      <p>
        Ahol egy adott módul külön felelősség-kizáró nyilatkozatot tartalmaz (például a
        vám-kalkulátor, a bérkalkulátorok, a gyorshajtás-bírság kalkulátor, a lakbér-kalkulátor
        vagy az utalás-asszisztens), az ott rögzített kizáró feltételek a jelen 12. ponttal
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
          A leírás-asszisztens az AI-szolgáltató felé továbbítja a vállalkozó által
          beírt leírás szövegét — részletek az Adatkezelési Tájékoztatóban (2.9 szakasz).
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

      <h3>13.4 Kinti Telegram-bot</h3>
      <p>
        A Kinti a Telegram platformon botot üzemeltet (@KintiSzaknevsorBot),
        amely a <strong>nyilvános Szaknévsor-adatokból</strong> ad kereső-találatot
        (vállalkozás neve, kategóriája, régiója, értékelése és profil-linkje —
        közvetlen elérhetőséget a bot nem ad ki). A bot használatára a Telegram
        saját feltételei is vonatkoznak; a Telegram platform működéséért az
        üzemeltető nem felel. A bot a beszélgetések tartalmát nem tárolja
        (részletek az Adatvédelmi tájékoztatóban).
      </p>

      <h2>14. Közösségi jelentések</h2>
      <p>
        A platformon a felhasználók által beadott <strong>közösségi adatok</strong>{" "}
        (pl. vélemények, anonim bér- és lakbér-adatok, megélhetési-költség beküldések)
        a feladó felhasználó saját megfigyelései — az üzemeltető <strong>nem ellenőrzi
        ezek pontosságát</strong>. A felhasználó saját felelősségére használja a
        közösségi adatokat; ezekre alapozott döntésekért az üzemeltető és más
        felhasználók nem felelnek.
      </p>

      <h3>14.1 Kinti Radar (Push Értesítések)</h3>
      <p>
        A "Kinti Radar" funkció segítségével a felhasználók (böngészőjük beállításaitól függően) Push értesítéseket
        kérhetnek bizonyos eseményekről (pl. a szakmájukban megjelenő új álláshirdetésről). Az üzemeltető <strong>kifejezetten kizárja a felelősségét</strong>
        az értesítések késedelmes kézbesítéséből, technikai hiba miatti elmaradásából, vagy az azokban szereplő (harmadik féltől származó)
        adatok pontatlanságából eredő <strong>bármilyen anyagi vagy nem vagyoni kárért, elmaradt haszonért</strong>. Az értesítések
        kizárólag kényelmi és tájékoztató célt szolgálnak, ezek alapján hivatalos vagy pénzügyi döntést hozni a felhasználó
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
      <h3>15.1 Ajánlói (referral / affiliate) linkek</h3>
      <p>
        A platform egyes felületein <strong>jelölt</strong> ajánlói linkek találhatók (pl. pénzküldő
        szolgáltatókra mutató „Ajánló" jelzésű hivatkozások): ha rajtuk keresztül regisztrálsz vagy
        vásárolsz, az üzemeltető a partnertől juttatást kaphat — <strong>neked ez nem jelent
        többletköltséget</strong>. Az ajánlói kapcsolat a hivatkozás mellett minden esetben fel van
        tüntetve. A hivatkozott szolgáltatás feltételeiért, díjaiért, árfolyamaiért és teljesítéséért
        kizárólag a külső szolgáltató felel; az ilyen linkek elhelyezése nem minősül pénzügyi
        tanácsadásnak, és az összehasonlító eszközök rangsorát a jutalék <strong>nem
        befolyásolja</strong>.
      </p>

      <h2>16. Szellemi tulajdon, Adatbázisjog és Kártalanítás (Mentesítés)</h2>
      <p>
        A kinti.app márkajegye, logója, design rendszere az üzemeltető szellemi tulajdona.
        A platformon megjelenő felhasználói tartalmak, képek és logók a feltöltők tulajdonát képezik,
        akik a platform használatával engedélyt adnak ezek megjelenítésére a Szolgáltatás keretében.
      </p>
      <h3>16.1 Adatbázis-előállítói jog (Sui Generis) és Scraping tilalma</h3>
      <p>
        A platformon felhalmozott és strukturált tartalmak (Szaknévsor cégadatbázisa, Bérkalkulátor statisztikái)
        rendszerezése és karbantartása jelentős anyagi és szellemi ráfordítást igényelt. Ezek egésze az üzemeltető 
        <strong>adatbázis-előállítói jogának (sui generis védelmének)</strong> hatálya alá tartozik (az EU Adatbázis Irányelve, 96/9/EK, és a vonatkozó nemzeti jogszabályok alapján).
      </p>
      <p>
        Kifejezetten <strong>tilos a platform tartalmának automatizált módszerekkel (pl. web scraping, botok, crawlerek) 
        történő letöltése</strong>, tömeges kinyerése, másolása, vagy más (akár fizetős, akár ingyenes) szolgáltatásba 
        való átemelése az üzemeltető előzetes, kifejezett írásbeli engedélye nélkül. Az adatbázis jogosulatlan letöltése 
        esetén az üzemeltető azonnali jogi és kártérítési eljárást kezdeményez.
      </p>
      <p>
        A felhasználó garantálja, hogy az általa feltöltött képek, logók és szövegek <strong>nem sértik 
        harmadik fél szerzői vagy védjegyjogait</strong>. Amennyiben egy felhasználó által feltöltött 
        jogosulatlan tartalom miatt harmadik fél (pl. jogtulajdonos, ügyvédi iroda) kártérítési, 
        bírság- vagy perköltség-követeléssel lép fel az üzemeltetővel szemben, a jogsértő felhasználó 
        köteles az üzemeltetőt <strong>teljeskörűen mentesíteni, és az összes felmerülő kárt, bírságot 
        és jogi költséget azonnal megtéríteni</strong>.
      </p>

      <h2>17. A Szolgáltatás és a feltételek módosítása</h2>
      <p>
        Az üzemeltető fenntartja a jogot, hogy a jelen Felhasználási Feltételeket (ÁSZF){" "}
        <strong>bármikor, egyoldalúan módosítsa</strong>. A módosítás a jelen oldalon való
        közzétételkor (a frissített „utolsó módosítás" dátummal) lép hatályba; a{" "}
        <strong>lényeges</strong> változásokról a vállalkozói és munkáltatói regisztráltakat
        e-mailben is értesítjük, illetve a felületen figyelmeztetést jeleníthetünk meg és a
        hozzájárulást ismételten bekérhetjük. <strong>A Szolgáltatás módosítás utáni további
        használata a megváltozott feltételek elfogadását jelenti.</strong> Ha a felhasználó a
        módosított feltételekkel nem ért egyet, köteles a Szolgáltatás használatát megszüntetni;
        díjköteles előfizetés esetén azt az 1.1 pont szerint bármikor lemondhatja.
      </p>

      <h3>17.1 A Szolgáltatás és az egyes funkciók módosítása, szüneteltetése és megszüntetése</h3>
      <p>
        A Szolgáltatás folyamatos fejlesztés alatt álló, <strong>„adott állapotában" és
        „elérhetőség szerint" (as is / as available) nyújtott</strong> platform. Az üzemeltető{" "}
        <strong>fenntartja a jogot, hogy saját belátása szerint, bármikor, előzetes értesítés
        és indoklási kötelezettség nélkül</strong>:
      </p>
      <ul>
        <li>
          a Szolgáltatás egészét vagy annak bármely funkcióját, modulját, tartalmát vagy elemét
          (különösen, de nem kizárólagosan: Szaknévsor, Állások / állásbörze,
          kalkulátorok és varázslók, térképek, AI-funkciók, Kinti Pass, Kinti Radar /
          push-értesítések, hírlevél) <strong>módosítsa, korlátozza, átalakítsa, ideiglenesen
          szüneteltesse vagy véglegesen megszüntesse</strong>;
        </li>
        <li>
          új funkciókat vezessen be, meglévőket összevonjon, átnevezzen vagy eltávolítson, és a
          tartalmi vagy technikai feltételeket megváltoztassa;
        </li>
        <li>
          egy addig ingyenesen elérhető funkciót <strong>díjkötelessé tegyen</strong>, illetve a
          díjköteles szolgáltatások (Kinti PRO, Szaknévsor-kiemelés, Kiemelt Állás) árát,
          tartalmát, terjedelmét vagy igénybevételi feltételeit megváltoztassa. A már megkezdett
          és kifizetett előfizetési / kiemelési időszakot az árváltozás nem érinti — a változás a
          következő megújításkor, illetve új megrendeléskor lép hatályba;
        </li>
        <li>
          a Szolgáltatás elérhetőségét földrajzilag, felhasználói kör szerint, mennyiségi
          korlátokkal (pl. kvóta, rate-limit) vagy egyéb módon korlátozza.
        </li>
      </ul>
      <p>
        A fenti intézkedések — mivel a Szolgáltatás alapvetően ingyenes és önkéntesen igénybe vett —{" "}
        <strong>nem keletkeztetnek a felhasználó részéről kártérítési, kártalanítási vagy
        visszatérítési igényt</strong>, ide nem értve a díjköteles szolgáltatás már kifizetett, de
        a végleges megszüntetés miatt fel nem használható időszakának az 1.1 pont szerinti méltányos
        kezelését. A funkció módosítása vagy megszüntetése miatt esetlegesen elvesző, kizárólag a
        felhasználó böngészőjében (localStorage) tárolt adatokért az üzemeltető a 11. pont szerint
        nem felel.
      </p>

      <h3>17.2 Az adatok, díjak és jogszabályi feltételek változása</h3>
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
        összevesse. Az elavult vagy megváltozott adatokon alapuló döntésekből eredő
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
        A jelen feltételekre — az üzemeltető (Feedback Jobs S.R.L.) székhelyére tekintettel —
        a <strong>román jog</strong> az irányadó. Esetleges jogvitákban a román bíróságok
        rendelkeznek hatáskörrel és illetékességgel.
      </p>
      <p>
        <strong>Fogyasztóvédelmi kivétel:</strong> Amennyiben a felhasználó fogyasztónak minősül (Svájcban 
        vagy az Európai Unió tagállamában él), a jelen jogválasztás <strong>nem foszthatja meg a fogyasztót 
        a szokásos tartózkodási helye szerinti ország jogának olyan kötelező rendelkezései által biztosított 
        védelemtől</strong>, amelyektől szerződésben nem lehet eltérni. A svájci lakóhellyel rendelkező fogyasztók 
        jogosultak panaszaikkal és pereikkel a svájci bíróságokhoz fordulni a svájci GestG alapján.
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
        mellett működő <strong>békéltető testületekhez</strong> fordulhatsz; más
        uniós tagállamban élő fogyasztók a <strong>lakóhelyük szerinti fogyasztói
        vitarendezési (AVR/ADR) testülethez</strong> fordulhatnak. (Az Európai
        Bizottság központi ODR-platformja 2025. július 20-án megszűnt.)
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
