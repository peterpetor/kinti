import { LegalPage } from "@/components/legal-page";

export const runtime = "edge";
export const dynamic = "force-static";

export const metadata = { title: "Felhasználási Feltételek" };

export default function AszfPage() {
  return (
    <LegalPage title="Felhasználási Feltételek (ÁSZF)" updatedAt="2026-05-29">
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
        Bárki, aki a Szolgáltatást <strong>regisztráció nélkül</strong> használja: böngészi a
        vállalkozásokat, nézi az eseményeket, hirdetést, eseményt, véleményt, telekocsit
        adhat fel. Sem email, sem jelszó nem szükséges — a beküldést Cloudflare Turnstile
        CAPTCHA + IP-alapú rate-limit védi spam ellen.
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
        <li>politikai propaganda vagy szervezett toborzás.</li>
      </ul>

      <h2>4. Szolgáltatásmegtagadás és Kitiltás joga</h2>
      <p>
        Az üzemeltető fenntartja a jogot, hogy indoklás és előzetes értesítés nélkül, azonnali hatállyal 
        eltávolítson bármilyen hirdetést, eseményt vagy vállalkozói profilt, illetve IP-cím vagy egyéb 
        azonosító alapján véglegesen kitiltson bármely felhasználót a platformról, amennyiben az a 
        jelen ÁSZF-et, a közösségi irányelveket, vagy a svájci/magyar jogszabályokat megsérti, vagy a 
        platform biztonságát és jó hírnevét veszélyezteti.
      </p>

      <h2>5. A tartalmakért való felelősség</h2>
      <p>
        A feltöltött tartalomért <strong>a feltöltő felel</strong>. Az üzemeltető a jogszabálysértő
        tartalmakat — értesítés (notice-and-takedown) vagy saját észlelés alapján — haladéktalanul
        eltávolítja. A bejelentés címe:{" "}
        <a href="mailto:abuse@kinti.app">abuse@kinti.app</a>.
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

      <h2>7. Telekocsi (Közösségi utazásmegosztás)</h2>
      <p>
        A platformon elérhető Telekocsi modul kizárólag a felhasználók egymás közötti kapcsolatfelvételét segíti. 
        Az üzemeltető <strong>nem fuvarszervező vagy személyfuvarozó cég</strong>. Nem ellenőrizzük a sofőrök személyazonosságát, 
        jogosítványát, a járművek műszaki állapotát vagy a biztosítások meglétét.
      </p>
      <p>
        A közös utazás kizárólag a sofőr és az utas(ok) magánmegállapodása. Az utazás során bekövetkező esetleges 
        balesetekért, késésekért, járatlekésésért, anyagi károkért vagy a felek közötti pénzügyi vitákért az 
        üzemeltető <strong>semmilyen felelősséget nem vállal</strong>. A felhasználók a Telekocsi modult kizárólag 
        saját kockázatukra használják.
      </p>

      <h2>8. Értékelési Rendszer és Felhasználói Vélemények</h2>
      <p>
        A platformon (pl. Telekocsi utazások után) leadott értékelések és vélemények a felhasználók szubjektív 
        magánvéleményét tükrözik. Az üzemeltető a véleményeket előzetesen nem moderálja és azok valóságtartalmát nem ellenőrzi.
      </p>
      <p>
        A közzétett értékelésekből fakadó esetleges hitelrontásért vagy személyiségi jogsértésért 
        kizárólag az értékelést leadó felhasználó felel, az üzemeltetőt felelősség nem terheli. 
        Kifejezetten fenntartjuk azonban a jogot, hogy a rágalmazó, obszcén vagy a jelen ÁSZF-be ütköző 
        véleményeket bejelentés alapján vagy saját hatáskörben, indoklás nélkül eltávolítsuk.
      </p>

      <h2>9. Börze (Apróhirdetések) és Adás-vétel</h2>
      <p>
        A platformon (Börze modul) közzétett hirdetések esetén az adásvétel kizárólag a hirdető és a vevő között 
        jön létre. Az üzemeltető <strong>nem vesz részt a tranzakcióban</strong>, nem kezel fizetéseket, nem nyújt 
        vásárlói garanciát, és nem vállal felelősséget a meghirdetett termékek minőségéért, eredetiségéért, 
        biztonságáért vagy a hirdetés valóságtartalmáért. Bármilyen anyagi kár vagy csalás esetén az üzemeltető 
        felelősségre nem vonható.
      </p>

      <h2>10. Események és Közösségi Találkozók</h2>
      <p>
        A platformon meghirdetett eseményeket a felhasználók maguk szervezik. Az üzemeltető <strong>nem 
        rendezvényszervező</strong>. Az eseményeken bekövetkező esetleges balesetekért, vagyoni károkért, 
        elmaradt rendezvényekért vagy a résztvevők közötti konfliktusokért az üzemeltető semmilyen felelősséget 
        nem vállal. A részvétel minden esetben a felhasználó saját felelősségére történik.
      </p>

      <h2>11. Vállalkozói Szolgáltatások</h2>
      <p>
        A Szaknévsorban/Vállalkozói modulban szereplő szakemberek nem állnak az üzemeltető alkalmazásában. 
        Az üzemeltető nem ellenőrzi a vállalkozók szakképesítését, engedélyeit, vagy az általuk végzett munka 
        minőségét. A vállalkozó által okozott esetleges hibás teljesítésért, károkért vagy pénzügyi vitákért 
        kizárólag az adott vállalkozó felel, az üzemeltető felelőssége kizárt. A vállalkozó köteles a profilján 
        szereplő adatokat valósághűen tartani.
      </p>

      <h2>12. A Szolgáltatás rendelkezésre állása</h2>
      <p>
        Igyekszünk a Szolgáltatást folyamatosan elérhetővé tenni, de <strong>garanciát nem
        vállalunk</strong> a 100%-os rendelkezésre állásra. Karbantartás, technikai hiba, vagy
        külső szolgáltatók (Cloudflare, Clerk, Resend) leállása miatti elérhetetlenségért
        kártérítés nem jár.
      </p>

      <h2>13. Felelősség-korlátozás</h2>
      <p>
        Az üzemeltető felelőssége a magyar Polgári Törvénykönyv vonatkozó rendelkezései szerint,
        ingyenes szolgáltatás esetén <strong>csak szándékos károkozásra</strong> terjed ki.
      </p>

      <h2>14. Eszközök, kalkulátorok és tájékoztató anyagok</h2>
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

      <h2>15. Közösségi jelentések</h2>
      <p>
        A platformon a felhasználók által beadott <strong>közösségi jelentések</strong>{" "}
        (akció-térkép, határátkelő-figyelő, SOS-radar, telekocsi-értékelés, vélemény stb.)
        a feladó felhasználó saját megfigyelései — az üzemeltető <strong>nem ellenőrzi
        ezek pontosságát</strong>. A felhasználó saját felelősségére használja a
        közösségi jelentéseket; ezekre alapozott döntésekért az üzemeltető és más
        felhasználók nem felelnek.
      </p>
      <p>
        A <strong>Közösségi SOS-radar</strong> nem helyettesíti a hivatalos
        segélyhívást (Svájcban 112). Vészhelyzet esetén MINDIG hívd a 112-t.
      </p>

      <h2>16. Külső Linkekért Való Felelősség</h2>
      <p>
        A platformon a felhasználók és vállalkozások által megosztott külső weblapokra mutató 
        hivatkozások (linkek) tartalmáért az üzemeltető nem vállal felelősséget. Az üzemeltető nem 
        ellenőrzi a külső oldalak tartalmát, adatvédelmi gyakorlatát vagy biztonságát. A külső 
        linkek megnyitása a felhasználó saját felelősségére történik. Bármilyen károkozás 
        (pl. adathalászat, vírusok) esetén az üzemeltető felelőssége kizárt.
      </p>

      <h2>17. Szellemi tulajdon</h2>
      <p>
        A kinti.app márkajegye, logója, design rendszere az üzemeltető szellemi tulajdona.
        A platformon megjelenő vállalkozási logók és képek a vállalkozók tulajdonát képezik,
        akik a platform használatával engedélyt adnak ezek megjelenítésére a Szolgáltatás
        keretében.
      </p>

      <h2>18. Módosítás</h2>
      <p>
        Az üzemeltető fenntartja a jogot, hogy ezeket a feltételeket egyoldalúan módosítsa.
        A módosítás a közzétételkor lép hatályba; lényeges változásokról a vállalkozói
        regisztráltakat emailben is értesítjük.
      </p>

      <h2>19. Jogválasztás és bíróság</h2>
      <p>
        A jelen feltételekre a <strong>magyar jog</strong> az irányadó. Esetleges jogvitákban
        a magyar bíróságok rendelkeznek hatáskörrel és illetékességgel.
      </p>

      <h2>20. Kapcsolat</h2>
      <p>
        Kérdés, panasz, takedown-bejelentés: <a href="mailto:info@kinti.app">info@kinti.app</a>
        {" / "}
        <a href="mailto:abuse@kinti.app">abuse@kinti.app</a>
      </p>
    </LegalPage>
  );
}
