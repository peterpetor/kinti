/**
 * Svájci Ügyintézés Varázsló — interaktív csekklisták a tipikus magyar-CH
 * bürokrácia-szituációkhoz.
 *
 * FORRÁS: ch.ch (svájci hivatalos info-portál), kantonális oldalak, BAG.
 * Minden adat tájékoztatás céljából — a részletek kantontól függnek, és
 * időben változnak. NEM jogi tanács.
 */

export interface ChecklistStep {
  title: string;
  body?: string;
  link?: { label: string; url: string };
  /** Becsült idő egy lépésre (pl. "10 perc", "1 nap"). */
  duration?: string;
}

export interface ChecklistSource {
  label: string;
  url: string;
}

export interface AdminChecklist {
  slug: string;
  title: string;
  emoji: string;
  /** Egy mondatos leírás a csekklista-listán. */
  summary: string;
  /** Részletes magyarázat a detail oldal tetején. */
  description: string;
  /** Mikor releváns (pl. "Az érkezést követő 14 napban"). */
  deadline?: string;
  /** Hány perc/óra/nap a teljes átfutás. */
  totalDuration?: string;
  steps: ChecklistStep[];
  /** Tipikus hibák / figyelmeztetések. */
  warnings?: string[];
  sources: ChecklistSource[];
}

export const CHECKLISTS_DISCLAIMER =
  "Ez tájékoztató jellegű ügyintézési segédlet hivatalos svájci forrásokból. A pontos eljárás kantontól és időtől függhet — döntés előtt mindig ellenőrizd a hivatalos oldalt és a lakóhelyed kantonját.";

export const CHECKLISTS: AdminChecklist[] = [
  {
    slug: "uj-bevandorlo",
    title: "Most költöztem Svájcba",
    emoji: "🇨🇭",
    summary: "Az első 90 nap dolgai — bejelentkezés, engedély, biztosítás, lakcímkártya.",
    description:
      "Az első hetekben több hivatalos lépést kell megtenned. Sorrendben végigmenve elkerülöd a leggyakoribb buktatókat (Quellensteuer, késedelmi pótlék, biztosítás-büntetés).",
    deadline: "Az érkezés után 14 nap (bejelentkezés), 90 nap (biztosítás).",
    totalDuration: "Kb. 4-6 hét teljes átfutás",
    steps: [
      {
        title: "Bejelentkezés a községnél (Gemeinde / commune)",
        body:
          "Az érkezés után 14 napon belül jelentkezz be a lakóhelyed szerinti községi hivatalnál. Vidd magaddal: útlevél, bérleti szerződés, munkáltatói igazolás, hozományi szerződés (ha házas). Sok helyen online is megy az eMovingCH-n.",
        link: { label: "eMovingCH — országos online bejelentkezés", url: "https://www.eumzug.swiss/" },
        duration: "1-2 óra (helyszín)",
      },
      {
        title: "Tartózkodási engedély (B-permit) átvétele",
        body:
          "A bejelentkezés után pár hét múlva kapsz egy B-engedélyt (EU/EFTA polgároknak). Ez igazolja a tartózkodási jogod. EU-s vagyon szabad mozgás alapján kapod.",
        link: { label: "SEM — engedélytípusok", url: "https://www.sem.admin.ch/sem/de/home/themen/aufenthalt/eu_efta/ausweis_b_eu_efta.html" },
        duration: "2-4 hét várakozás",
      },
      {
        title: "Egészségbiztosítás (Krankenkasse) megkötése",
        body:
          "90 napod van az érkezéstől, hogy alap egészségbiztosítást (Grundversicherung) kössél. Hasonlítsd össze a díjakat — kantonok és Krankenkasse-k között 100-200 CHF/hó eltérés lehet.",
        link: { label: "Priminfo — hivatalos összehasonlító", url: "https://www.priminfo.admin.ch/" },
        duration: "1-2 óra (online)",
      },
      {
        title: "Bankszámla nyitása",
        body:
          "Kell egy svájci bankszámla a fizetéshez, lakbér-utaláshoz. Vidd magaddal az útlevelet + tartózkodási engedélyt. Jellemzők: PostFinance (legolcsóbb), UBS / CS / Raiffeisen (drágább, de teljesebb). Neon / Yuh = digital-only, ingyenes.",
        duration: "30-45 perc",
      },
      {
        title: "AHV-szám (svájci TB-szám) — a munkáltató intézi",
        body:
          "Az AHV (Alters- und Hinterlassenenversicherung) — 13-számjegyű svájci társadalombiztosítási szám. A munkáltatód igényli neked az első munkanap után. A bérlapon megjelenik (756.XXXX.XXXX.XX).",
        link: { label: "AHV-info", url: "https://www.ahv-iv.ch/de" },
        duration: "Automatikus, 2-4 hét",
      },
      {
        title: "Adóbevallás-előkészítés (Quellensteuer)",
        body:
          "A B-engedélyes EU-állampolgárok forrásadót (Quellensteuer) fizetnek — a bér automatikusan adózott. Ha bérbruttód > 120k CHF/év, NOV-kötelezett vagy (Nachträgliche ordentliche Veranlagung). Másoknak: a NOV-kérelmet március 31-ig adhatod be ha visszatérítést akarsz (pl. 3a-piller, gyermek-támogatás).",
        link: { label: "ch.ch — Quellensteuer áttekintés", url: "https://www.ch.ch/de/quellensteuer/" },
        duration: "1-2 óra (március-ban)",
      },
    ],
    warnings: [
      "Késedelmes bejelentkezés bírsággal jár (50-500 CHF a kantontól függően).",
      "Ha 90 napon belül nincs Krankenkasse, a kanton automatikusan beoszt egy szolgáltatóhoz — ez gyakran drágább.",
      "A Quellensteuer-fizető nem automatikusan kapja vissza az adót — kérvényezni kell a NOV-ot határidőn belül.",
    ],
    sources: [
      { label: "ch.ch — Beköltözés Svájcba", url: "https://www.ch.ch/de/leben-in-der-schweiz/zuzug/" },
      { label: "SEM — Aufenthalt", url: "https://www.sem.admin.ch/sem/de/home/themen/aufenthalt.html" },
    ],
  },
  {
    slug: "lakcimbejelentes",
    title: "Lakcím-bejelentés / Átköltözés",
    emoji: "🏠",
    summary: "Új lakásba költöztél? 14 napon belül jelentkezz be a községnél.",
    description:
      "Akár Svájcon belül költözöl, akár külföldről jössz, az új lakcímet 14 napon belül be kell jelentened. Kanton-váltáskor mindkét helyen — a régi községnél kijelentkezés (Abmeldung), az újnál bejelentkezés (Anmeldung).",
    deadline: "14 nap a költözés után",
    totalDuration: "1 nap (online) / 1-2 óra (helyszín)",
    steps: [
      {
        title: "Iratok előkészítése",
        body:
          "Útlevél / személyi, tartózkodási engedély (ha van), új bérleti szerződés VAGY tulajdonos-nyilatkozat, családi állapot-igazolás, biztosítás-kártya.",
        duration: "10 perc",
      },
      {
        title: "Online vagy személyes bejelentkezés",
        body:
          "Sok kantonban (ZH, BE, AG, LU, SO, SG, GR) működik az eMovingCH online. Más kantonokban személyes megjelenés kell a Gemeinde / Stadtverwaltung-on.",
        link: { label: "eMovingCH — kanton-választóval", url: "https://www.eumzug.swiss/" },
        duration: "30 perc (online) / 1-2 óra (helyszín)",
      },
      {
        title: "Régi község: kijelentkezés (csak kanton-váltáskor)",
        body:
          "Ha más kantonba költözöl, a régi községben is kell egy Abmeldung. A legtöbb helyen online vagy levélben is megy. Az eMovingCH egyben intézi az új helyre bejelentkezést is.",
        duration: "15 perc",
      },
      {
        title: "Krankenkasse értesítése (kanton-váltáskor)",
        body:
          "Ha más kantonba költöztél, az egészségbiztosító díja megváltozhat (Prämien-régió). Értesítsd őket az új címről — a díj-változás automatikus, de a kommunikáció a te felelősséged.",
        duration: "10 perc",
      },
      {
        title: "Adó (Quellensteuer-kanton-váltás)",
        body:
          "A új kanton más adókulcsot alkalmaz. A munkáltatód automatikusan átállítja, de érdemes ellenőrizni a következő bérlapon.",
        duration: "5 perc ellenőrzés",
      },
      {
        title: "Cím-frissítés egyéb helyeken",
        body:
          "Bank, autóregisztráció (Strassenverkehrsamt), előfizetések (telefon, internet), címátirányítás (Post — Nachsendeauftrag).",
        link: { label: "Swiss Post — Nachsendeauftrag", url: "https://www.post.ch/de/empfangen/umleiten/nachsendeauftrag-bestellen" },
        duration: "1-2 óra",
      },
    ],
    warnings: [
      "Késedelmes bejelentkezés bírsággal jár (50-500 CHF).",
      "Ha eltér a postacímed a lakcímedtől, hivatalos levelek elveszhetnek — Nachsendeauftrag ajánlott.",
    ],
    sources: [
      { label: "ch.ch — Umzug", url: "https://www.ch.ch/de/leben-in-der-schweiz/wohnen-und-umzug/umzug-innerhalb-der-schweiz/" },
      { label: "eMovingCH portál", url: "https://www.eumzug.swiss/" },
    ],
  },
  {
    slug: "jogositvany-csere",
    title: "Magyar jogosítvány cseréje svájcira",
    emoji: "🚗",
    summary: "12 hónapod van Svájcba érkezéstől, hogy lecseréld magyar jogsidat.",
    description:
      "EU/EFTA-állampolgárként a magyar jogosítványod 12 hónapig érvényes Svájcban — utána kötelezően svájcira kell cserélned. Vizsga nem szükséges, papíralapú eljárás a kantoni Strassenverkehrsamt-on.",
    deadline: "Az érkezés után 12 hónapon belül",
    totalDuration: "Kb. 2-4 hét átfutás",
    steps: [
      {
        title: "Iratok összegyűjtése",
        body:
          "Magyar jogosítvány (eredeti), útlevél vagy svájci tartózkodási engedély, kantonális űrlap (lásd Strassenverkehrsamt), 35 mm × 45 mm fotó (passport-méret), szemorvosi vizsgálat eredménye (max 24 hónapnál régebbi, az illetékes szakorvostól / optikus).",
        duration: "1 nap (a szemorvos)",
      },
      {
        title: "Szemorvos / optikus látásvizsgálata",
        body:
          "Egy egyszerű látásvizsgálat — sok optikusnál mehet (Visilab, Fielmann, McOptic). Költség kb. 30-50 CHF. Kapsz egy igazolást.",
        duration: "20-30 perc, kb. 30-50 CHF",
      },
      {
        title: "Kérelem benyújtása a Strassenverkehrsamt-on",
        body:
          "Időpontfoglalás online a kantoni Strassenverkehrsamt oldalán. Magaddal viszed: jogsi, fotó, szemvizsgálat, útlevél/engedély, kitöltött űrlap, illeték (kb. 50-130 CHF kantontól függően).",
        link: { label: "Strassenverkehrsamt időpont — pl. ZH", url: "https://www.stva.zh.ch/" },
        duration: "30-60 perc",
      },
      {
        title: "Várakozás a svájci jogsi-ra",
        body:
          "A magyar jogosítványod beadod, és kapsz egy ideiglenes Lernfahrausweis-szerű igazolást. A végleges svájci jogsit 2-4 hét múlva küldik postán.",
        duration: "2-4 hét",
      },
      {
        title: "Ha közben vezetni akarsz",
        body:
          "A magyar jogsi 12 hónapig érvényes — ha még be sem adtad, vezethetsz vele. Ha leadtad, az ideiglenes igazolással mehetsz. NEM hagyhatod nyitva a 12 hónapos határt!",
      },
    ],
    warnings: [
      "Ha 12 hónapnál tovább vezetsz magyar jogsival Svájcban → érvénytelen, súlyos pénzbírság + járművezetéstől eltiltás.",
      "Néhány kantonban (pl. ZH) próba-időszak van (Probezeit) — új jogsi-tulajdonosokra. Magyar jogsi-cseréhez nem releváns, ha már 3+ éve vezetsz.",
    ],
    sources: [
      { label: "ch.ch — Führerausweis-Umtausch", url: "https://www.ch.ch/de/strassenverkehr/fuehrerausweis/auslaendischen-fuehrerausweis-umtauschen/" },
      { label: "ASTRA — Strassen", url: "https://www.astra.admin.ch/" },
    ],
  },
  {
    slug: "c-engedely",
    title: "C-letelepedési engedély igénylése",
    emoji: "🆔",
    summary: "5 év folyamatos tartózkodás után igényelhető — végleges letelepedés.",
    description:
      "A C-engedély a letelepedési engedély — gyakorlatilag a svájci 'permanent resident' státusz. EU/EFTA-állampolgároknak 5 év folyamatos tartózkodás után igényelhető. Előnyei: nincs munkahely-váltási korlátozás, nincs Quellensteuer (átáll Normalbesteuerung-ra), könnyebb a hitel-felvétel.",
    deadline: "5 év B-engedély után kérhető",
    totalDuration: "2-6 hónap a kérelem benyújtásától",
    steps: [
      {
        title: "Jogosultság ellenőrzése",
        body:
          "Minimum 5 év folyamatos B-engedélyes tartózkodás. NEM bíróságilag büntetett. NEM kapott szociális segélyt. Magyar állampolgárként a kétoldalú megállapodás miatt 5 év elég (más nem-EU-soknak 10).",
      },
      {
        title: "Nyelvi követelmény (B1 szóban + A2 írásban)",
        body:
          "A C-engedélyhez Svájc hivatalos nyelvén (német / francia / olasz) B1 szóban + A2 írásban kell igazolni. Elfogadott tesztek: fide, TELC, Goethe, DELF. A tesztelés árát te állod (kb. 200-300 CHF). Ha 8+ év tartózkodás után kéred, néha enyhébb a követelmény (kantontól függ).",
        link: { label: "fide — hivatalos svájci nyelvvizsga", url: "https://www.fide-info.ch/" },
        duration: "2-3 hónap felkészülés + 1 nap vizsga",
      },
      {
        title: "Kérelem benyújtása a kanton-migrációs hivatalhoz",
        body:
          "A lakhely-kantonod Migrationsamt / Office cantonal de la population oldalán találod a kérvény-űrlapot. Mellékelni kell: útlevél-másolat, B-engedély-másolat, fizetési igazolások (utolsó 6 hónap), nyelv-vizsga eredmény, kivonat a büntetlen előéletről (Strafregisterauszug — pénznek éri 18 CHF online), Betreibungs-kivonat (nincs végrehajtás).",
        link: { label: "Strafregister online", url: "https://www.e-service.admin.ch/crex/cms/content/strafregister/de/start/" },
        duration: "1-2 nap dokumentum-gyűjtés",
      },
      {
        title: "Költségek",
        body:
          "Kérvény-díj: kb. 100-200 CHF (kantontól függően). Plus: nyelvvizsga (200-300 CHF), Strafregister (18 CHF), Betreibungsregister (17 CHF), néha aktuális fotó (30 CHF).",
      },
      {
        title: "Várakozás a döntésre",
        body:
          "A migrációs hivatal 2-6 hónapon belül dönt. Sikeres esetben kapsz egy biometrikus C-engedélyt. Sikertelen esetben fellebbezhetsz 30 napon belül.",
        duration: "2-6 hónap",
      },
      {
        title: "Quellensteuer-kötelezettség megszűnik",
        body:
          "C-engedéllyel automatikusan átkerülsz a normál adóztatási rendszerre (Normalbesteuerung). Évente kapsz egy Steuererklärung-ot — be kell adni március 31-ig. Az első évben fele-fele arányban Quellensteuer + Normal.",
      },
    ],
    warnings: [
      "A 5 év SZÁMÍTÓDIK — nem szabad megszakítani 6 hónapnál hosszabbra (kivéve katonai szolgálat, kórház).",
      "A nyelv-vizsga elnyilása az utolsó 5 évben kell legyen — régebbi tesztek nem fogadottak.",
      "Ha aktív Betreibung (végrehajtás) van ellened, a kérelmedet visszautasítják.",
    ],
    sources: [
      { label: "SEM — Niederlassungsbewilligung C", url: "https://www.sem.admin.ch/sem/de/home/themen/aufenthalt/eu_efta/ausweis_c_eu_efta.html" },
      { label: "ch.ch — C-engedély", url: "https://www.ch.ch/de/leben-in-der-schweiz/aufenthalt/niederlassungsbewilligung/" },
    ],
  },
  {
    slug: "adobevallas",
    title: "Adóbevallás (Steuererklärung)",
    emoji: "💰",
    summary: "Évente március 31-ig. C-engedélyeseknek mindenki, B-eseknek csak ha >120k bér.",
    description:
      "Svájcban háromszintű az adó: szövetségi (direkte Bundessteuer), kantoni és községi (Gemeindesteuer). A bevallást a kantonod oldalán online töltheted ki, vagy papíron. Határidő: március 31. (kantontól függően néha április 30. — lehet hosszabbítást kérni).",
    deadline: "Március 31. (vagy meghosszabbítva április 30. / szept. 30.)",
    totalDuration: "2-5 óra (önállóan) vagy 1-2 hét adótanácsadóval",
    steps: [
      {
        title: "Iratok összegyűjtése",
        body:
          "Lohnausweis (a munkáltatótól, februárban kapod), bankszámla-egyenleg december 31-én (Bankbeleg), 3a-piller éves igazolás (ha van), Krankenkasse-igazolás (Prämienbestätigung), hitelek igazolása, ingatlan ha van (kataszteri érték).",
        duration: "1-2 óra gyűjtés",
      },
      {
        title: "Adóbevallás-űrlap megnyitása",
        body:
          "A kantonod adóhivatala küld egy levelet januárban — abban benne van az online belépési kód. Belépés a kantonális adó-portálra (pl. ZHprivateTax, BE eTax, AGtax). Sok kanton enged offline kitöltést (XML export/import).",
        link: { label: "ch.ch — Steuern", url: "https://www.ch.ch/de/steuern-und-finanzen/steuererklaerung-ausfuellen/" },
        duration: "30 perc beállítás",
      },
      {
        title: "Bevétel megadása",
        body:
          "A Lohnausweis adatait beírod (jellemzően ez 80%-a a bevallásnak). Plus: bérleti díj (ha bérbeadsz), tőkejövedelem (kamat, osztalék), egyéb (önálló, részmunkaidős).",
        duration: "30-60 perc",
      },
      {
        title: "Levonások (Abzüge)",
        body:
          "Itt nyerhetsz: Krankenkasse-prémium (3000-9000 CHF/év), 3a-piller (max 7056 CHF 2024-ben), gyermek-támogatás, utazási költség munkába (legfeljebb 3200 CHF), további szakmai költségek (laptop, könyv), önkéntes adományok.",
        duration: "1-2 óra",
      },
      {
        title: "Vagyon (Vermögen)",
        body:
          "Bankszámla, 3a-piller, részvények, ingatlan érték dec 31-én. Adósságok levonhatók (jelzálog, hitel).",
        duration: "30 perc",
      },
      {
        title: "Beküldés + visszafizetés / utalás",
        body:
          "Ellenőrzés, aláírás (online digitálisan / papíron postán). Az adóhivatal 2-12 hónap alatt feldolgozza. Az átlagos visszaigénylés 500-2000 CHF, ha jól kihasználod a levonásokat.",
        duration: "30 perc",
      },
    ],
    warnings: [
      "Ha késel a beadással → automatikus becslés + bírság (200-1000 CHF).",
      "B-engedélyeseknek (Quellensteuer-fizetőknek) NEM kötelező a normál bevallás, DE ha visszatérítést akarsz (pl. 3a-piller) → NOV-kérvényt kell beadni március 31-ig.",
      "Több kanton 'EasyTax' vagy 'TaxMe' szoftvere segít — pdf-importtal pl. a Lohnausweisből.",
    ],
    sources: [
      { label: "ch.ch — Steuererklärung", url: "https://www.ch.ch/de/steuern-und-finanzen/steuererklaerung-ausfuellen/" },
      { label: "ESTV — Bundessteuer", url: "https://www.estv.admin.ch/estv/de/home.html" },
    ],
  },
  {
    slug: "krankenkasse-valtas",
    title: "Krankenkasse váltása",
    emoji: "🏥",
    summary: "Évente november 30-ig (alap) — utána a jövő január 1-jétől új biztosító.",
    description:
      "A svájci Grundversicherung kötelező, és minden Krankenkasse-nál ugyanazt nyújtja. De a havi díjak között 100-200 CHF eltérés is lehet — érdemes évente összehasonlítani és váltani.",
    deadline: "November 30. (a következő naptári évre)",
    totalDuration: "1-2 óra (összehasonlítás + szerződés)",
    steps: [
      {
        title: "Új biztosító keresése — Priminfo.admin.ch",
        body:
          "A hivatalos összehasonlító portál: minden hitelesített Krankenkasse, kantontól + életkortól függő pontos díj. Beállítod a paramétereket (kor, kanton, franchise, baleseti modell), és látod az árakat.",
        link: { label: "Priminfo — hivatalos összehasonlító", url: "https://www.priminfo.admin.ch/" },
        duration: "15-30 perc",
      },
      {
        title: "Franchise (önrész) optimalizálása",
        body:
          "Választható: 300 / 500 / 1000 / 1500 / 2000 / 2500 CHF. Magasabb franchise = alacsonyabb havi díj, de magasabb saját költség kórház esetén. Egészséges fiatalnak: 2500 CHF nyerő. Idősebbnek / gyermekvállalási tervekkel: 300 CHF.",
      },
      {
        title: "Felmondás a régi biztosítótól",
        body:
          "Tértivevényes ajánlott levél (Einschreiben) a régi biztosítónak — postán bélyegezve LEGKÉSŐBB november 30-án (díjnak megfelelő évre). A levélben: 'Hiermit kündige ich die Grundversicherung per 31.12.[év]'.",
        duration: "30 perc + posta-bélyegzés",
      },
      {
        title: "Szerződés az új biztosítóval",
        body:
          "Online a választott Krankenkasse weboldalán. Általában automatikusan elfogadnak (a Grundversicherung-ot mindenkire kötelező felvenni). Kapcsolódó dokumentumok: AHV-szám, családtagok adatai, kanton-kód.",
        duration: "30 perc",
      },
      {
        title: "Január 1-jétől új biztosító",
        body:
          "A január 1-jétől az új Krankenkasse-d érvényes. Az új biztosító-kártyát postán megkapod december közepén. A régi biztosító automatikusan kifizeti a december utáni minden megkezdett ügyet.",
      },
    ],
    warnings: [
      "A felmondás LEVÉL november 30-án bélyegezve kell legyen — egy nap késéssel már nem mehet ki a változás.",
      "A kiegészítő biztosítás (Zusatzversicherung) NEM ugyanaz mint a Grundversicherung — annak külön felmondási feltétele van (általában 3 hónap, június 30-ig).",
      "Az 'olcsó' Krankenkasse-k (pl. Assura, KPT) jellemzően lassabb visszafizetést adnak — érdemes ezt is mérlegelni.",
    ],
    sources: [
      { label: "BAG — Grundversicherung", url: "https://www.bag.admin.ch/bag/de/home/versicherungen/krankenversicherung.html" },
      { label: "Priminfo — Prämienrechner", url: "https://www.priminfo.admin.ch/" },
    ],
  },
  {
    slug: "quellensteuer-nov",
    title: "Quellensteuer visszatérítés (NOV)",
    emoji: "📋",
    summary: "B-engedélyes vagy? Március 31-ig kérvényezz NOV-ot, ha visszaigényelni szeretnél.",
    description:
      "A B-engedélyes EU-állampolgárok forrásadót (Quellensteuer) fizetnek — a bér automatikusan adózott. DE: ha 3a-pillerbe fizetsz, vagy szakmai költséged van, vagy gyermek-támogatás jár neked, akkor érdemes egy Nachträgliche ordentliche Veranlagung-ot (NOV) kérvényezni — visszakapod a túlfizetést.",
    deadline: "Március 31. (a megelőző adóévre vonatkozó kérelem)",
    totalDuration: "1-2 óra (önállóan)",
    steps: [
      {
        title: "Ellenőrizd: érdemes-e NOV-ot kérni?",
        body:
          "Tipikus esetek ahol megéri: 3a-piller befizetés (akár 7056 CHF/év), gyermek-támogatás, magas Krankenkasse-prémium, hosszú munka-utazás, önkéntes adományok, részmunkaidős extra munka. Ha az éves bértét > 120k CHF: automatikusan NOV-kötelezett vagy.",
      },
      {
        title: "Kérvény az adóhivatalhoz",
        body:
          "A lakhely-kantonod adóhivatalához (Steueramt) küldött formális kérelem. Sok kantonban online (pl. ZH, BE), másoknál papír. A kérelmet március 31-ig kell beadni.",
        link: { label: "ESTV — Quellensteuer + NOV", url: "https://www.estv.admin.ch/estv/de/home/direkte-bundessteuer/quellensteuer.html" },
        duration: "30 perc",
      },
      {
        title: "Adóbevallás-űrlap kitöltése",
        body:
          "Ugyanaz mint a normál Steuererklärung. Beírod a bevételt (Lohnausweis), levonásokat, vagyont. A rendszer kiszámítja a 'szabályos' adót, és visszafizeti a Quellensteuer és a szabályos adó különbségét.",
        duration: "1-2 óra",
      },
      {
        title: "Visszafizetés érkezése",
        body:
          "A kantonális adóhivatal 6-12 hónap alatt feldolgozza, és átutalja a különbséget. A pénz a megadott bankszámlára érkezik.",
        duration: "6-12 hónap várakozás",
      },
    ],
    warnings: [
      "ÉRTÉKES határidő: március 31. — utána már NEM kérhető a megelőző évre. Egész nem-elveszett pénz!",
      "Ha NOV-ot kértél, attól kezdve MINDEN évre kötelező — nem ugorhatod át tetszés szerint.",
      "Ha bérbruttód >120k CHF/év, automatikusan NOV-kötelezett vagy, nem kell külön kérvényezni.",
    ],
    sources: [
      { label: "ch.ch — Quellensteuer", url: "https://www.ch.ch/de/quellensteuer/" },
      { label: "ESTV — Quellensteuer hivatalos", url: "https://www.estv.admin.ch/estv/de/home/direkte-bundessteuer/quellensteuer.html" },
    ],
  },
  {
    slug: "hazakoltozes",
    title: "Hazaköltözés Svájcból (Rückwanderung)",
    emoji: "🏡",
    summary: "Végleg elhagyod Svájcot? Ez a lépéssor segít rendezni minden ügyet: lakcím-kijelentés, adók, bank, BVG, autó, ingóságok.",
    description:
      "A svájci hazaköltözés tele van kevéssé ismert buktatóval — az Abmeldungtól a 2. pillérig. Ha nem intézed el időben, elmaradhat a Quellensteuer-visszatérítés, a zárolhatja a bankszámládat, vagy elveszítesz komoly összeget a nyugdíjpénztárból. Ez a csekklista sorban végigvezet minden fontos lépésen.",
    deadline: "Ideális esetben 1-3 hónappal a tervezett hazaköltözés előtt kezd el",
    totalDuration: "Kb. 4-8 hét teljes intézés",
    steps: [
      {
        title: "Lakcím-kijelentés a községnél (Abmeldung)",
        body:
          "A tervezett elmenetel dátuma előtt legalább 2 héttel kell a lakóhelyed szerinti községnél (Gemeinde / Stadtverwaltung) személyesen vagy online kijelentkezned. Vidd magaddal: tartózkodási engedélyt (leadod!), útlevelet, esetleg a bérleti felmondásigazolást. Egyes kantonokban (ZH, BE) online is megy az eMovingCH-n. Az engedélykártyádat (B/C) leadod, vagy postán visszaküldöd.",
        link: { label: "eMovingCH — online Abmeldung", url: "https://www.eumzug.swiss/" },
        duration: "30-60 perc",
      },
      {
        title: "Quellensteuer-igazolás (Lohnausweis / Quellensteuerausweis) igénylése",
        body:
          "Ha B-engedéllyel dolgoztál, a munkáltatód kiállít egy éves Quellensteuerausweis-t (forrásadó-igazolást). Kérd el a munkáltatódtól a távozásod évének összes bérpapírját (Lohnausweis). Ha NOV-ot (Nachträgliche ordentliche Veranlagung) kértél, az adóhivatal postán megküldi a lezárt adóhatározatot (Verfügung) a bejelentett külföldi címedre. Ha még volt visszatérítési igényed, érdemes NOV-ot beadni mielőtt elmész (határidő: március 31.).",
        link: { label: "ESTV — Quellensteuer visszatérítés", url: "https://www.estv.admin.ch/estv/de/home/direkte-bundessteuer/quellensteuer.html" },
        duration: "1-2 hét (munkáltatón múlik)",
      },
      {
        title: "2. pillér (Pensionskasse / BVG) — kivét vagy átutalás",
        body:
          "Ez a legfontosabb pénzügyi lépés! Ha véglegesen elhagyod Svájcot és EU-s ország (pl. Magyarország) állampolgára vagy, a kötelező BVG-megtakarításod egy részét KIVEHETED. Az Überobligatorium (kötelező feletti rész) készpénzben kifizetnek. A kötelező rész (Obligatorium) azonban EU-állampolgárként Svájcban marad egy zárolóalapban (Freizügigkeitsstiftung), egész a svájci nyugdíjkorhatárig. Lépések: (1) Értesítsd a Pensionskassét az elhagyásról, (2) töltsd ki a Freizügigkeitsleistung-kérelem nyomtatványyt, (3) add meg a külföldi bankszámládat (IBAN).",
        link: { label: "Freizügigkeitsstiftung — portál", url: "https://www.sfbvg.ch/" },
        duration: "2-4 hét kifizetési átfutás",
      },
      {
        title: "3. pillér (Säule 3a) lezárása — kivét",
        body:
          "A 3a-pillér (magán nyugdíjmegtakarítás) az Abmeldung napjától TELJES egészében kivehető! Ez azért érvényes, mert Svájcot végleg elhagyod. Értesítsd a bankodat vagy a Versicherungs-társaságot (pl. Swiss Life, AXA, Zurich) legalább 4-6 héttel előre. A kifizetésre végső forrásadót vonnak le (jellemzően 5-8% kantontól függően). Külföldi bankszámlára is lehet utalni.",
        link: { label: "ch.ch — Säule 3a kifizetés", url: "https://www.ch.ch/de/steuern-und-finanzen/altersvorsorge/saeule-3a/" },
        duration: "4-6 hét kifizetési átfutás",
      },
      {
        title: "Krankenkasse (egészségbiztosítás) felmondása",
        body:
          "Az Abmeldung napjával a Krankenkasse automatikusan megszűnik — de értesíteni KELL a biztosítót tértivevényes levélben (Einschreiben). Vigyázz: ha az Abmeldung hónap közepén van, a teljes hónap díját kiszámlázhatják. Tárgyald meg velük a pontos zárónapot. Ha volt visszatérítésed (Prämienrückerstattung), jelezd a külföldi IBAN-odat.",
        duration: "2-3 hét (levél + visszaigazolás)",
      },
      {
        title: "Bankszámla és Twint lezárása",
        body:
          "Értesítsd a svájci bankod (UBS, CS, ZKB, PostFinance, Neon stb.) az állandó lakcím-változásról és a számla zárási szándékodról. Előtte: (1) ellenőrizd, nincs-e aktív állandó megbízás (Dauerauftrag), (2) mond fel az összes direct debit-et (LSV), (3) utalj át minden egyenleget a magyar számlára, (4) zárd le a Twint-regisztrációt (a számlazárással automatikusan megszűnik). Néhány bank csak személyesen zárja le — ez esetben egy utolsó svájci látogatásra lesz szükség.",
        duration: "2-4 hét",
      },
      {
        title: "AHV / 1. pillér — tájékoztatás",
        body:
          "Az AHV (állami nyugdíjbiztosítás) befizetéseid ott maradnak a svájci rendszerben, és a svájci nyugdíjkorhatár (65 év) elérésekor automatikusan AHV-járadékként folyósítják, AKKOR IS, ha külföldön élsz. Ha rövid ideje voltál Svájcban: elképzelhető a befizetett összeg időarányos visszaigénylése az Abmeldung után (kivét nem lehetséges EU-állampolgárnak — a pénz ottmarad, de nyugdíjként kapod meg). Értesítsd az illetékes SVA-t (Sozialversicherungsanstalt) a lakcím-változásról, hogy tudják, hova küldjék a jövőbeli leveleket.",
        link: { label: "AHV — Rentenperspektiven külföldön", url: "https://www.ahv-iv.ch/de/Sozialversicherungen/Alters-und-Hinterlassenenversicherung-AHV" },
        duration: "1 levél / e-mail",
      },
      {
        title: "Gépjármű — exportálás vagy eladás",
        body:
          "Ha svájci rendszámú autóval szeretnél hazaköltözni: (1) Jelentsd be a Strassenverkehrsamt-nak az exportot, (2) kapsz Export-rendszámtáblát (érvényes 30 napig), (3) a szélvédő-matricát (Vignette) nem vihetted át, az az autóval maradt — de az export-rendszámmal nem kell matrica. Magyarországon: honosítási eljárás az okmányirodán (eredeti svájci forgalmi engedély, vámáru-nyilatkozat, CEMT-dokumentumok).",
        link: { label: "ASTRA — Export-rendszám", url: "https://www.astra.admin.ch/" },
        duration: "2-3 nap adminisztráció",
      },
      {
        title: "Ingóságok vámmentes hazaköltöztetése (Übersiedlungsgut)",
        body:
          "Az EU-s vámszabályok szerint: ha legalább 12 hónapja Svájcban éltél és állandó lakóhelyed volt, a személyes ingóságaidat (bútor, ruha, háztartási eszközök) VÁMMENTESEN hozhatod be Magyarországra. Feltételek: (1) Az ingóságoknak legalább 6 hónapja a tulajdonodban kell legyenek (számlákkal igazolva), (2) az összes ingóságot egyszerre kell behozni (vagy a behozatalt a határokon átlépést követő 12 hónapon belül teljesíteni), (3) kitöltött EU-s vámnyilatkozat (C1A formanyomtatvány). NEM vámmentesek: szesz, dohány, gépjárművek (azokra külön szabályok vonatkoznak).",
        link: { label: "Magyar Vámhatóság — Áttelepülés", url: "https://nav.gov.hu/vam/vasarlasok_kulfoldrol/letelepedes" },
        duration: "Tervez 1-2 napot a vámolásra",
      },
      {
        title: "Serafe (televíziós adó) lemondása",
        body:
          "Az Abmeldung dátumától a Serafe-díj (svájci média-adó, évi kb. 335 CHF) automatikusan leáll. De érdemes írni a Serafe-nek, hogy megerősítsék a lezárást és ne küldjenek tovább számlákat. Ha előre fizetted az évet, arányos visszatérítést kaphatsz.",
        link: { label: "Serafe — lemondás", url: "https://www.serafe.ch/" },
        duration: "10 perc (online)",
      },
      {
        title: "Leiratkozás: telefon, internet, előfizetések",
        body:
          "Mondj fel minden svájci előfizetést: Swisscom / Salt / Sunrise telefon+internet (figyelem: jellemzően 3-6 hónap felmondási idő!), streaming-szolgáltatások (Netflix, Disney+ — ha svájci fizetési módra kapcsolva), NZZ / Watson / egyéb svájci sajtó. Hagyd érvényben a Nachsendeauftrag-ot (levéltovábbítás) legalább 6 hónapra — így a visszakapott levelek és csekkek utolérnek.",
        link: { label: "Swiss Post — Nachsendeauftrag", url: "https://www.post.ch/de/empfangen/umleiten/nachsendeauftrag-bestellen" },
        duration: "1-2 óra",
      },
    ],
    warnings: [
      "A 3. pillér (3a) kivétele csak az Abmeldung UTÁN lehetséges — hamarabb nem fizeti ki a bank.",
      "Az EU-s vámmentesség NEM vonatkozik gépjárművekre — azokra külön honosítási/importvám szabályok érvényesek.",
      "Ha aktív svájci hiteled vagy lízinged van, a bank engedélye kell az elhagyáshoz — nem hagyhatod ott tartozással.",
      "A Pensionskasse (BVG) kötelező részét EU-állampolgárként NEM veheted ki, csak a kötelező feletti részt — a maradék a nyugdíjkorig zárolva marad Svájcban.",
      "A Quellensteuer NOV-kérelmet (ha visszaigényeltél) BE kell adni MIELŐTT kimész, különben az idei éves visszatérítés elvész.",
    ],
    sources: [
      { label: "ch.ch — Abmeldung külföldre", url: "https://www.ch.ch/de/leben-in-der-schweiz/zuzug/wegzug-ins-ausland/" },
      { label: "AHV — Freizügigkeitsleistung", url: "https://www.ahv-iv.ch/" },
      { label: "Magyar Vámhatóság — Áttelepülés", url: "https://nav.gov.hu/vam/vasarlasok_kulfoldrol/letelepedes" },
    ],
  },
];

export function getChecklist(slug: string): AdminChecklist | null {
  return CHECKLISTS.find((c) => c.slug === slug) ?? null;
}
