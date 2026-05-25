import { LegalPage } from "@/components/legal-page";

export const runtime = "edge";
export const dynamic = "force-static";

export const metadata = { title: "Felhasználási Feltételek" };

export default function AszfPage() {
  return (
    <LegalPage title="Felhasználási Feltételek (ÁSZF)" updatedAt="2026-05-25">
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
        A Szolgáltatást <strong>16. életévét betöltött</strong> természetes
        személyek vehetik igénybe (GDPR 8. cikk). 16 év alatti felhasználók
        számára a regisztráció és a hirdetésfeladás kizárt.
      </p>
      <h3>2.1 Kinti felhasználó (közösségi tag)</h3>
      <p>
        Bárki, aki a Szolgáltatást regisztráció nélkül használja: böngészi a vállalkozásokat,
        nézi az eseményeket, és <strong>email-megerősítéssel</strong> hirdetést adhat fel.
      </p>
      <h3>2.2 Vállalkozó</h3>
      <p>
        Az a természetes vagy jogi személy, aki a saját vállalkozását kívánja a platformon
        megjeleníteni. A vállalkozói regisztráció Clerk-szolgáltatáson keresztül történik.
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

      <h2>4. A tartalmakért való felelősség</h2>
      <p>
        A feltöltött tartalomért <strong>a feltöltő felel</strong>. Az üzemeltető a jogszabálysértő
        tartalmakat — értesítés (notice-and-takedown) vagy saját észlelés alapján — haladéktalanul
        eltávolítja. A bejelentés címe:{" "}
        <a href="mailto:abuse@kinti.app">abuse@kinti.app</a>.
      </p>

      <h2>5. Hirdetés lejárta és törlése</h2>
      <ul>
        <li>A megerősített hirdetések <strong>30 napig</strong> láthatók, utána automatikusan
          eltűnnek (törlődnek);</li>
        <li>A feladó <strong>bármikor törölheti</strong> a hirdetését a megerősítő emailben
          kapott <em>kezelő linkről</em>;</li>
        <li>Az üzemeltető fenntartja a jogot a jogszabálysértő vagy a 3. pontba ütköző hirdetések
          értesítés nélküli eltávolítására.</li>
      </ul>

      <h2>6. Vállalkozói profil pontossága</h2>
      <p>
        A vállalkozó köteles a profilján szereplő adatokat naprakészen és valósághűen tartani.
        Az adatok pontatlansága miatt esetlegesen kárt szenvedő harmadik féllel szemben az
        üzemeltető nem felel.
      </p>

      <h2>7. A Szolgáltatás rendelkezésre állása</h2>
      <p>
        Igyekszünk a Szolgáltatást folyamatosan elérhetővé tenni, de <strong>garanciát nem
        vállalunk</strong> a 100%-os rendelkezésre állásra. Karbantartás, technikai hiba, vagy
        külső szolgáltatók (Cloudflare, Clerk, Resend) leállása miatti elérhetetlenségért
        kártérítés nem jár.
      </p>

      <h2>8. Felelősség-korlátozás</h2>
      <p>
        Az üzemeltető felelőssége a magyar Polgári Törvénykönyv vonatkozó rendelkezései szerint,
        ingyenes szolgáltatás esetén <strong>csak szándékos károkozásra</strong> terjed ki.
      </p>

      <h2>9. Szellemi tulajdon</h2>
      <p>
        A kinti.app márkajegye, logója, design rendszere az üzemeltető szellemi tulajdona.
        A platformon megjelenő vállalkozási logók és képek a vállalkozók tulajdonát képezik,
        akik a platform használatával engedélyt adnak ezek megjelenítésére a Szolgáltatás
        keretében.
      </p>

      <h2>10. Módosítás</h2>
      <p>
        Az üzemeltető fenntartja a jogot, hogy ezeket a feltételeket egyoldalúan módosítsa.
        A módosítás a közzétételkor lép hatályba; lényeges változásokról a vállalkozói
        regisztráltakat emailben is értesítjük.
      </p>

      <h2>11. Jogválasztás és bíróság</h2>
      <p>
        A jelen feltételekre a <strong>magyar jog</strong> az irányadó. Esetleges jogvitákban
        a magyar bíróságok rendelkeznek hatáskörrel és illetékességgel.
      </p>

      <h2>12. Kapcsolat</h2>
      <p>
        Kérdés, panasz, takedown-bejelentés: <a href="mailto:info@kinti.app">info@kinti.app</a>
        {" / "}
        <a href="mailto:abuse@kinti.app">abuse@kinti.app</a>
      </p>
    </LegalPage>
  );
}
