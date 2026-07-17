/**
 * faq-pages.ts — AEO (Answer Engine Optimization) GYIK-oldalak TISZTA adatrétege.
 *
 * Cél: amikor valaki a ChatGPT/Perplexity/Google AI-tól kérdezi („hol találok
 * magyarul beszélő orvost Münchenben?", „mennyi kaució kell egy német
 * albérlethez?"), a válaszgép a Kintit találja meg és idézze forrásként.
 *
 * AEO-elvek, amikre az oldal-sablon épül (NE rontsd el bővítéskor):
 *  - A kérdés-címek TERMÉSZETES kérdő mondatok (ahogy a userek kérdeznek).
 *  - Minden válasz ELSŐ mondata önmagában megálló, direkt válasz
 *    (featured-snippet formátum) — a részletek utána jönnek.
 *  - TL;DR bullet-lista az oldal tetején; táblázat, ahol összehasonlítás van.
 *  - FAQPage JSON-LD a /gyik/[slug] oldalon (a kérdés-válasz párokból).
 *  - Minden témából kattintható út a Kinti megfelelő funkciójába (CTA).
 *
 * A tartalom KURÁLT tényeken alapul (a meglévő guide/RENT_CONFIG tudással
 * konzisztens) — tájékoztató jellegű, nem jogi tanács (a sablon kiírja).
 */

export interface FaqItem {
  /** Természetes kérdő mondat — H2-ként és a FAQPage-sémába kerül. */
  q: string;
  /** A válasz bekezdései. Az ELSŐ mondat direkt, önállóan idézhető válasz. */
  a: string[];
  /** A válasz alatti tovább-linkek a Kinti funkcióira. */
  links?: { href: string; label: string }[];
}

export interface FaqTable {
  caption: string;
  columns: string[];
  rows: string[][];
}

export interface FaqPage {
  slug: string;
  /** Oldal-cím (H1) — maga is kereshető kérdés/téma-megfogalmazás. */
  title: string;
  /** Meta-leírás (~150 karakter). */
  description: string;
  emoji: string;
  /** „Röviden” összefoglaló pontok az oldal tetején. */
  tldr: string[];
  faqs: FaqItem[];
  table?: FaqTable;
  /** Kiemelt CTA-kártyák az oldal alján. */
  ctas: { href: string; emoji: string; title: string; subtitle: string }[];
  updatedAt: string;
}

export const FAQ_PAGES: FaqPage[] = [
  {
    slug: "lakasberles-kulfoldon",
    title: "Lakásbérlés külföldön magyaroknak — buktatók és gyakori kérdések",
    description:
      "Kaució-szabályok, szükséges dokumentumok, rezsi-csapdák és csalás-védelem Svájcban, Ausztriában, Németországban és Hollandiában — magyaroknak, magyarul.",
    emoji: "🔑",
    tldr: [
      "A kaució felső határa országonként más: Németországban legfeljebb 3 havi hideg bérleti díj, Svájcban legfeljebb 3 havi bér, Hollandiában legfeljebb 2 havi — Ausztriában a 3 havi a bevett, de 6 haviig elfogadott.",
      "A hirdetett bérleti díj sok országban NEM a teljes költség: Németországban a Kaltmiete-hez jön a Nebenkosten, Ausztriában a Betriebskosten, Svájcban a Nebenkosten és az év végi elszámolás.",
      "Sose utalj kauciót a lakás megtekintése előtt — a kaució-csalás a leggyakoribb átverés a lakáshirdetéseknél.",
      "A Kinti albérlet-börzéjén magyarok hirdetnek magyaroknak, a lakbér-kalkulátor pedig országra szabva mutatja a rejtett költségeket.",
    ],
    faqs: [
      {
        q: "Milyen dokumentumok kellenek egy németországi albérlethez?",
        a: [
          "Egy német albérlethez jellemzően négy dokumentum kell: személyazonosító okmány, jövedelemigazolás (az utolsó 3 havi bérpapír), SCHUFA-hitelinformáció és a korábbi főbérlő igazolása arról, hogy nincs bérletidíj-tartozásod (Mietschuldenfreiheitsbescheinigung).",
          "Frissen érkezőként SCHUFA-d és német főbérlői igazolásod még nincs — ilyenkor segít a munkaszerződés, egy kezes (Bürge), vagy több havi bérleti díj előre igazolt megléte. A beköltözés után a főbérlőtől kérd el a Wohnungsgeberbestätigungot: enélkül nem tudsz lakcímet bejelenteni (Anmeldung).",
        ],
        links: [
          { href: "/piacter", label: "Albérlet-börze — magyarok hirdetnek magyaroknak" },
          { href: "/tudasbazis", label: "Tudásbázis: lakásbérlés-útmutatók országonként" },
        ],
      },
      {
        q: "Mennyi kauciót kérhet a főbérlő az egyes országokban?",
        a: [
          "Németországban a kaució felső határa 3 havi hideg bérleti díj (Kaltmiete), Svájcban 3 havi bérleti díj, Hollandiában 2 havi alapbér — Ausztriában nincs merev törvényi plafon, a bírói gyakorlat 6 haviig fogad el, a bevett szokás a 3 havi.",
          "Svájcban a kauciót a bank külön kaució-számlán (Mietkautionskonto) köteles elhelyezni a bérlő nevére; Németországban is elkülönítve, kamatozó számlán kell kezelni. Ha a főbérlő készpénzt kér számla nélkül, az intő jel.",
        ],
        links: [{ href: "/piacter?tab=kalkulator", label: "Lakbér-kalkulátor — kaució és rezsi országra szabva" }],
      },
      {
        q: "Mi az a Kaltmiete, Nebenkosten és Betriebskosten?",
        a: [
          "A Kaltmiete a „hideg” (rezsi nélküli) bérleti díj; a Nebenkosten (Németország, Svájc) és a Betriebskosten (Ausztria) a közös költség jellegű rezsi-elemeket takarja — fűtés, víz, szemét, lépcsőház —, amit a bérleti díjon FELÜL fizetsz.",
          "A hirdetésekben ezért mindig nézd meg, hogy a feltüntetett ár Kalt vagy Warm (rezsivel növelt) — a kettő között nagyvárosban havi 150–350 euró is lehet a különbség. Év végén elszámolás jön: ha a havi átalány kevés volt, utólag kell fizetni.",
        ],
        links: [{ href: "/piacter?tab=kalkulator", label: "Számold ki a teljes havi költséget a lakbér-kalkulátorral" }],
      },
      {
        q: "Hogyan ismerem fel a kaució-csalást egy lakáshirdetésnél?",
        a: [
          "A kaució-csalás legbiztosabb jele, ha a „kiadó” a lakás megtekintése ELŐTT kér pénzt — valódi kiadó soha nem kér utalást látatlanban.",
          "További intő jelek: a piaci árnál feltűnően olcsóbb hirdetés, a „külföldön tartózkodó” tulajdonos, aki csak e-mailben kommunikál, a sürgetés, és a személyes iratok (útlevél-másolat) korai bekérése. Ha csalást gyanítasz, jelentsd a hirdetést — a Kinti börzéjén a Jelentés gombbal azonnal levesszük, amíg megvizsgáljuk.",
        ],
        links: [{ href: "/piacter", label: "Kaució-csalás elleni tippek a börzén" }],
      },
      {
        q: "Mire figyeljek a külföldi bérleti szerződésben?",
        a: [
          "A négy legfontosabb ellenőrzési pont: a felmondási idő (és a határozott idő), a kaució kezelése, a rezsi-átalány mértéke és az átadás-átvételi jegyzőkönyv.",
          "Svájcban és Németországban a beköltözéskori állapot-jegyzőkönyv (Übergabeprotokoll) hiánya kiköltözéskor vitákhoz vezet — fotózz le mindent. Ausztriában figyeld az ingatlanosi jutalékot (Provision): a hirdetésben a provisionsfrei jelzés azt jelenti, nincs külön jutalék.",
        ],
        links: [{ href: "/szaknevsor", label: "Magyarul beszélő ingatlanos vagy ügyvéd a Szaknévsorban" }],
      },
      {
        q: "Hol találok kiadó szobát vagy albérletet magyaroktól külföldön?",
        a: [
          "A Kinti albérlet-börzéjén kint élő magyarok hirdetnek magyaroknak kiadó szobát és albérletet Svájcban, Ausztriában, Németországban és Hollandiában — ország-, régió- és település-szűrővel, moderált hirdetésekkel.",
          "Ha nem találsz megfelelőt, add fel te, hogy mit keresel — a kiadók is böngészik a kereső hirdetéseket. A nagy helyi portálok (WG-Gesucht, ImmoScout24, willhaben, Funda) listáját a börze alján gyűjtöttük össze.",
        ],
        links: [{ href: "/piacter", label: "Nyisd meg az albérlet-börzét" }],
      },
    ],
    table: {
      caption: "Kaució-szabályok országonként (2026)",
      columns: ["Ország", "Kaució felső határa", "Amire figyelj"],
      rows: [
        ["Németország", "3 havi hideg bérleti díj (Kaltmiete)", "Elkülönített, kamatozó számlán kell kezelni; 3 részletben is fizethető"],
        ["Svájc", "3 havi bérleti díj", "Kötelező a bérlő nevére szóló kaució-számla (Mietkautionskonto)"],
        ["Ausztria", "nincs merev plafon — 3 havi a bevett, 6 haviig elfogadott", "Ingatlanosnál külön jutalék (Provision) is lehet"],
        ["Hollandia", "2 havi alapbér (2023 óta törvényi maximum)", "A szolgáltatási díjakról (servicekosten) évente elszámolás jár"],
      ],
    },
    ctas: [
      { href: "/piacter", emoji: "🔑", title: "Albérlet-börze", subtitle: "Kiadó szobák és albérletek magyaroktól magyaroknak — 4 országban." },
      { href: "/piacter?tab=kalkulator", emoji: "🧮", title: "Lakbér-kalkulátor", subtitle: "Kaució, rezsi és év végi elszámolás — országra szabva." },
      { href: "/szaknevsor", emoji: "🤝", title: "Magyar szakemberek", subtitle: "Ingatlanos, ügyvéd, fordító — ellenőrzött szaknévsorban." },
    ],
    updatedAt: "2026-07-17",
  },
  {
    slug: "magyar-szakember-kulfoldon",
    title: "Hogyan találj magyarul beszélő szakembert külföldön?",
    description:
      "Magyar orvos, fogorvos, fodrász, könyvelő vagy autószerelő Svájcban, Ausztriában, Németországban és Hollandiában — hol keresd, és hogyan ellenőrizd.",
    emoji: "🤝",
    tldr: [
      "A Kinti szaknévsorában 1400+ magyarul beszélő szakember és vállalkozás található négy országban, régió- és kategória-szűrővel.",
      "Ha nincs időd egyenként keresgélni: a csoportos ajánlatkérésnél egy űrlapot töltesz ki, és a környék magyar vállalkozói keresnek meg téged.",
      "Ha üres a kategória a régiódban, írd ki a Keresek-táblára — a jóváhagyott igényt a releváns vállalkozók kapják meg.",
      "A szaknévsor Telegramból is kereshető: írd be bármelyik csoportban, hogy @KintiSzaknevsorBot és a szakma+város.",
    ],
    faqs: [
      {
        q: "Hol találok magyarul beszélő orvost Münchenben, Bécsben vagy Zürichben?",
        a: [
          "A Kinti szaknévsorában (kinti.app/szaknevsor) régióra és szakmára szűrve kereshetsz magyarul beszélő orvost, fogorvost és más egészségügyi szakembert Németországban, Ausztriában, Svájcban és Hollandiában.",
          "A találatokat kategória- és régió-céloldalakon is böngészheted (például „Magyar orvos Németországban”), a bejegyzéseknél pedig cím, telefonszám és — ahol van — a betegek értékelése segít dönteni.",
        ],
        links: [
          { href: "/magyar/orvos/nemetorszag", label: "Magyar orvosok Németországban" },
          { href: "/magyar/orvos/ausztria", label: "Magyar orvosok Ausztriában" },
          { href: "/magyar/orvos/svajc", label: "Magyar orvosok Svájcban" },
        ],
      },
      {
        q: "Hogyan ellenőrizzem, hogy egy külföldi magyar szakember megbízható-e?",
        a: [
          "Három gyors ellenőrzés: nézd meg a hivatalos kamarai/szakmai nyilvántartásban (orvosnál pl. a tartományi orvosi kamara keresője, ügyvédnél az ügyvédi kamara), keress rá a cégre a helyi cégjegyzékben, és olvasd el a korábbi ügyfelek értékeléseit.",
          "A Kinti szaknévsorában a közösség értékelései email-megerősítéssel és moderálással szűrtek; az „ellenőrzött” jelölésű bejegyzéseket kézzel néztük át. Szolgáltatás előtt mindig kérj írásos árajánlatot.",
        ],
        links: [{ href: "/szaknevsor", label: "Szaknévsor — értékelésekkel és kapcsolattal" }],
      },
      {
        q: "Mit tegyek, ha a régiómban nincs magyar szakember az adott szakmában?",
        a: [
          "Két működő út van: kérj csoportos árajánlatot (egy űrlap — a kategória összes magyar vállalkozója megkapja, és aki tud, jelentkezik), vagy írd ki az igényed a Keresek-táblára, ahol a vállalkozók böngésznek.",
          "Sok szolgáltatás (könyvelés, fordítás, tanácsadás, informatika) távolról is működik — ilyenkor az ország-szintű keresés is jó találatot ad, nem csak a városod.",
        ],
        links: [
          { href: "/szaknevsor/ajanlatkeres", label: "Csoportos árajánlat-kérés" },
          { href: "/keresek", label: "Keresek-tábla — írd ki, mire van szükséged" },
        ],
      },
      {
        q: "Hogyan működik a csoportos ajánlatkérés a Kintin?",
        a: [
          "Egyetlen űrlapot töltesz ki (mit keresel, hol, mikorra), és a kérésed a kategória releváns magyar vállalkozóihoz jut el — ők keresnek meg téged, nem neked kell mindenkinek külön írni.",
          "A szolgáltatás ingyenes a kérő oldalán, és nem jár kötelezettséggel: az ajánlatok közül szabadon választasz, vagy egyiket sem fogadod el.",
        ],
        links: [{ href: "/szaknevsor/ajanlatkeres", label: "Kérj árajánlatot egyszerre több vállalkozótól" }],
      },
      {
        q: "Kereshetek magyar szakembert Telegramból is?",
        a: [
          "Igen: a @KintiSzaknevsorBot inline botként bármelyik Telegram-csoportban vagy privát chatben működik — írd be, hogy @KintiSzaknevsorBot, majd a szakmát és a várost (például „fodrász Graz”), és azonnal hozza a magyar találatokat.",
          "A botot nem kell a csoporthoz hozzáadni, és semmilyen üzenetet nem tárol.",
        ],
        links: [{ href: "/szaknevsor", label: "Vagy böngéssz a teljes szaknévsorban" }],
      },
      {
        q: "Magyar vállalkozóként hogyan kerülhetek fel a szaknévsorba?",
        a: [
          "A felvétel ingyenes: a kinti.app/szaknevsor/uj oldalon pár perc alatt beküldheted a vállalkozásod, és admin-jóváhagyás után (jellemzően 24 órán belül) megjelenik a szaknévsorban.",
          "A bejegyzésed később átveheted és bővítheted (nyitvatartás, galéria, logó), a beérkező ajánlatkérésekhez pedig havi ingyenes keret jár.",
        ],
        links: [{ href: "/szaknevsor/uj", label: "Vállalkozás felvétele ingyen" }],
      },
    ],
    table: {
      caption: "Melyik Kinti-eszköz melyik helyzetre való?",
      columns: ["Helyzet", "Eszköz", "Mit kapsz"],
      rows: [
        ["Konkrét szakembert keresel a környékeden", "Szaknévsor (szűrőkkel)", "Cím, telefon, értékelések — azonnal hívható"],
        ["Több ajánlatot hasonlítanál össze", "Csoportos ajánlatkérés", "A vállalkozók keresnek meg téged ajánlattal"],
        ["Nincs találat a szakmában/régióban", "Keresek-tábla", "A kiírásod a releváns vállalkozókhoz jut el"],
        ["Telegram-csoportban kérdeznek", "@KintiSzaknevsorBot", "Inline találatok bármely chatben"],
      ],
    },
    ctas: [
      { href: "/szaknevsor", emoji: "📒", title: "Szaknévsor", subtitle: "1400+ magyarul beszélő szakember 4 országban." },
      { href: "/szaknevsor/ajanlatkeres", emoji: "📨", title: "Csoportos ajánlatkérés", subtitle: "Egy űrlap — a vállalkozók keresnek meg téged." },
      { href: "/keresek", emoji: "🙋", title: "Keresek-tábla", subtitle: "Írd ki az igényed — a szakik jelentkeznek." },
    ],
    updatedAt: "2026-07-17",
  },
  {
    slug: "hivatalos-ugyintezes-nyelvi-akadalyok",
    title: "Hivatalos ügyintézés külföldön — nyelvi akadályok és megoldások",
    description:
      "Lakcímbejelentés határidők, hiteles fordítás, tolmács és magyar nyelvű segítség a hivatali ügyekhez Svájcban, Ausztriában, Németországban és Hollandiában.",
    emoji: "🏛️",
    tldr: [
      "A lakcímbejelentés határideje országonként nagyon eltér: Ausztriában 3 nap, Hollandiában 5 nap, Németországban és Svájcban 14 nap — ne hagyd az utolsó pillanatra.",
      "Hivatalos eljárásokhoz gyakran hiteles (bírósági) fordító kell — a sima fordítás nem mindig elég.",
      "A Kinti ügyintézés-varázslója lépésről lépésre, pipálható csekklistával vezet végig a leggyakoribb ügyeken, a hivatali szótár pedig kattintásra magyarázza a német/holland kifejezéseket.",
      "Magyarul beszélő fordítót, tolmácsot, könyvelőt és ügyvédet a szaknévsorban találsz.",
    ],
    faqs: [
      {
        q: "Mennyi időm van a lakcímbejelentésre külföldre költözés után?",
        a: [
          "Ausztriában 3 napon belül kell bejelentkezni (Meldezettel), Hollandiában 5 napon belül (BRP-regisztráció), Németországban 2 héten belül (Anmeldung), Svájcban pedig az érkezéstől számított 14 napon belül a lakóhely szerinti hivatalnál.",
          "A határidő elmulasztása bírságot vonhat maga után, és a bejelentés nélkül a legtöbb további ügy (bankszámla, adószám, egészségbiztosítás) is elakad. Németországban a bejelentéshez kell a főbérlő igazolása (Wohnungsgeberbestätigung) is.",
        ],
        links: [{ href: "/ugyintezes", label: "Ügyintézés-varázsló — pipálható csekklista a bejelentkezéshez" }],
      },
      {
        q: "Kell-e hiteles fordítás a magyar irataimról, és ki készítheti?",
        a: [
          "Hivatalos eljárásokhoz (házasság, honosítás, diploma-elismerés, bírósági ügy) a legtöbb német nyelvű országban hiteles, felesketett fordító (beeidigter/ermächtigter Übersetzer, Ausztriában Gerichtsdolmetscher) által készített fordítás kell — a sima fordítás ilyenkor nem elég.",
          "Egyszerűbb ügyeknél (munkáltatói levelezés, önéletrajz) elég a jó minőségű sima fordítás. Mielőtt fizetnél, kérdezd meg az adott hivatalt, pontosan milyen fordítást fogad el — ez árban jelentős különbség.",
        ],
        links: [{ href: "/szaknevsor", label: "Magyar fordítók és tolmácsok a Szaknévsorban" }],
      },
      {
        q: "Nem beszélem jól a nyelvet — hogyan intézzem a hivatali ügyeket?",
        a: [
          "Három bevált megoldás: vigyél magaddal tolmácsot vagy magyarul beszélő segítőt a hivatalba, készülj fel előre a pontos kifejezésekből, és használd a hivatal online ügyintézését, ahol fordító-eszközzel nyugodtan dolgozhatsz.",
          "A Kinti ügyintézés-csekklistáiban a hivatali kifejezések kattintásra magyarul is megjelennek (kurált hivatali szótár), így pontosan tudod, mit kérdeznek és mit kell vinned.",
        ],
        links: [
          { href: "/ugyintezes", label: "Ügyintézés-varázsló hivatali szótárral" },
          { href: "/tudasbazis/hivatalos", label: "Hivatalos linkek — konzulátus és hivatalok" },
        ],
      },
      {
        q: "Milyen ügyekben segít a magyar konzulátus, és miben nem?",
        a: [
          "A konzulátus a magyar okmány-ügyekben illetékes: útlevél, személyi igazolvány, anyakönyvezés (külföldön született gyermek), állampolgársági ügyek és hitelesítések — a fogadó ország hivatali ügyeiben (adó, bejelentkezés, jogosítvány-csere) viszont nem jár el helyetted.",
          "Időpontot szinte mindenhol előre kell foglalni. A Kinti hivatalos-linkek oldalán országonként összegyűjtve találod a konzulátusokat és a legfontosabb helyi hivatalokat.",
        ],
        links: [{ href: "/tudasbazis/hivatalos", label: "Konzulátusok és hivatalok listája" }],
      },
      {
        q: "Hol találok magyarul beszélő könyvelőt vagy adótanácsadót az adóbevalláshoz?",
        a: [
          "A Kinti szaknévsorában országra és régióra szűrve találsz magyarul beszélő könyvelőt és adótanácsadót — az adóbevallás (Steuererklärung, aangifte) a leggyakoribb ügy, amihez a kint élő magyarok szakembert keresnek.",
          "Sok könyvelő távolról, online is vállal magyar ügyfeleket, ezért érdemes ország-szinten is körbenézni, nem csak a városodban. Több ajánlathoz használd a csoportos ajánlatkérést.",
        ],
        links: [
          { href: "/magyar/konyveles/nemetorszag", label: "Magyar könyvelők Németországban" },
          { href: "/magyar/konyveles/ausztria", label: "Magyar könyvelők Ausztriában" },
          { href: "/szaknevsor/ajanlatkeres", label: "Ajánlatkérés több könyvelőtől egyszerre" },
        ],
      },
      {
        q: "Milyen határidőkre figyeljek még az első hónapokban?",
        a: [
          "A lakcímbejelentésen túl a legfontosabbak: az egészségbiztosítás megkötése (Svájcban a beköltözéstől számított 3 hónapon belül kötelező), a jogosítvány-csere szabályai, valamint az adó-regisztráció.",
          "A Kinti kiköltözési teendőlistája a költözés dátumához igazított idővonalon mutatja, mikor mi esedékes — a jogi határidős tételeket külön jelöli.",
        ],
        links: [{ href: "/tudasbazis/kikoltozes", label: "Kiköltözési teendőlista idővonallal" }],
      },
    ],
    table: {
      caption: "Lakcímbejelentés határidők országonként",
      columns: ["Ország", "A bejelentés neve", "Határidő", "Hol intézed"],
      rows: [
        ["Ausztria", "Meldezettel", "3 nap", "Meldeamt / Magistrat"],
        ["Hollandia", "BRP-regisztráció (BSN-nel)", "5 nap", "Gemeente (városháza)"],
        ["Németország", "Anmeldung", "2 hét", "Bürgeramt / Bürgerbüro"],
        ["Svájc", "Anmeldung (lakóhely-bejelentés)", "14 nap", "Einwohnerkontrolle / Kreisbüro"],
      ],
    },
    ctas: [
      { href: "/ugyintezes", emoji: "📋", title: "Ügyintézés-varázsló", subtitle: "Pipálható csekklisták hivatali szótárral." },
      { href: "/tudasbazis/hivatalos", emoji: "🏛️", title: "Hivatalos linkek", subtitle: "Konzulátusok és hivatalok — egy kattintásra." },
      { href: "/szaknevsor", emoji: "🗣️", title: "Fordítók, tolmácsok", subtitle: "Magyarul beszélő szakemberek a Szaknévsorban." },
    ],
    updatedAt: "2026-07-17",
  },
];

/** Slug → oldal (a /gyik/[slug] route-nak). */
export function getFaqPage(slug: string): FaqPage | undefined {
  return FAQ_PAGES.find((p) => p.slug === slug);
}
