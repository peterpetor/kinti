/**
 * Svájci Ügyintézés Varázsló — interaktív csekklisták a tipikus magyar-CH
 * bürokrácia-szituációkhoz.
 *
 * FORRÁS: ch.ch (svájci hivatalos info-portál), kantonális oldalak, BAG.
 * Minden adat tájékoztatás céljából — a részletek kantontól függnek, és
 * időben változnak. NEM jogi tanács.
 */

import type { IconName } from "@/components/ui/icons";

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
  /** A csekklista vonal-ikonja (a korábbi nyers emoji helyett — egységes
   *  ikonrendszer, téma-reaktív currentColor). */
  icon: IconName;
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

export const CHECKLISTS_CH: AdminChecklist[] = [
  {
    slug: "uj-bevandorlo",
    title: "Most költöztem Svájcba",
    icon: "compass",
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
          "Kell egy svájci bankszámla a fizetéshez, lakbér-utaláshoz. Vidd magaddal az útlevelet + tartózkodási engedélyt. Tipikus jellemzők (díjak változhatnak — ellenőrizd!): PostFinance (jellemzően alacsony díj), UBS / Raiffeisen (általában magasabb díj, szélesebb szolgáltatás). Neon / Yuh = digital-only, jellemzően díjmentes.",
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
      { label: "ch.ch — Beköltözés Svájcba", url: "https://www.ch.ch/de/einreise-in-die-schweiz-das-muss-man-wissen/" },
      { label: "SEM — Aufenthalt", url: "https://www.sem.admin.ch/sem/de/home/themen/aufenthalt.html" },
    ],
  },
  {
    slug: "lakcimbejelentes",
    title: "Lakcím-bejelentés / Átköltözés",
    icon: "house",
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
        link: { label: "Swiss Post — Nachsendeauftrag", url: "https://www.post.ch/de/empfangen/umzug/adressaenderung-mit-nachsendung" },
        duration: "1-2 óra",
      },
    ],
    warnings: [
      "Késedelmes bejelentkezés bírsággal jár (50-500 CHF).",
      "Ha eltér a postacímed a lakcímedtől, hivatalos levelek elveszhetnek — Nachsendeauftrag ajánlott.",
    ],
    sources: [
      { label: "ch.ch — Umzug", url: "https://www.ch.ch/de/wohnen/umzug/ab-und-anmelden-bei-der-wohngemeinde/" },
      { label: "eMovingCH portál", url: "https://www.eumzug.swiss/" },
    ],
  },
  {
    slug: "jogositvany-csere",
    title: "Magyar jogosítvány cseréje svájcira",
    icon: "car",
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
        link: { label: "Strassenverkehrsamt időpont — pl. ZH", url: "https://www.zh.ch/de/mobilitaet/fuehrerausweis-fahren-lernen.html" },
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
      { label: "ch.ch — Führerausweis-Umtausch", url: "https://www.ch.ch/de/ausweise-und-dokumente/fuhrerausweis/fuhrerausweis-umtauschen/" },
      { label: "ASTRA — Strassen", url: "https://www.astra.admin.ch/" },
    ],
  },
  {
    slug: "c-engedely",
    title: "C-letelepedési engedély igénylése",
    icon: "document",
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
        link: { label: "Strafregister online", url: "https://www.ch.ch/de/ausweise-und-dokumente/strafregisterauszug/" },
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
      { label: "ch.ch — C-engedély", url: "https://www.ch.ch/de/ausweise-und-dokumente/aufenthaltsbewilligungen/" },
    ],
  },
  {
    slug: "adobevallas",
    title: "Adóbevallás (Steuererklärung)",
    icon: "wallet",
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
        link: { label: "ch.ch — Steuern", url: "https://www.ch.ch/de/steuern-und-finanzen/steuererklarung/" },
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
      { label: "ch.ch — Steuererklärung", url: "https://www.ch.ch/de/steuern-und-finanzen/steuererklarung/" },
      { label: "ESTV — Bundessteuer", url: "https://www.estv.admin.ch/" },
    ],
  },
  {
    slug: "krankenkasse-valtas",
    title: "Krankenkasse váltása",
    icon: "health",
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
      { label: "ch.ch — Krankenkasse", url: "https://www.ch.ch/de/versicherungen/krankenkasse/krankenkasse-abschliessen/" },
      { label: "Priminfo — Prämienrechner", url: "https://www.priminfo.admin.ch/" },
    ],
  },
  {
    slug: "quellensteuer-nov",
    title: "Quellensteuer visszatérítés (NOV)",
    icon: "list",
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
        link: { label: "ESTV — Quellensteuer + NOV", url: "https://www.ch.ch/de/steuern-und-finanzen/steuerarten/quellensteuer/" },
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
      { label: "ESTV — Quellensteuer hivatalos", url: "https://www.ch.ch/de/steuern-und-finanzen/steuerarten/quellensteuer/" },
    ],
  },
  {
    slug: "hazakoltozes",
    title: "Hazaköltözés Svájcból (Rückwanderung)",
    icon: "truck",
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
        link: { label: "ESTV — Quellensteuer visszatérítés", url: "https://www.ch.ch/de/steuern-und-finanzen/steuerarten/quellensteuer/" },
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
        link: { label: "ch.ch — Säule 3a kifizetés", url: "https://www.ch.ch/de/steuern-und-finanzen/altersvorsorge/3-saule/" },
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
        link: { label: "Swiss Post — Nachsendeauftrag", url: "https://www.post.ch/de/empfangen/umzug/adressaenderung-mit-nachsendung" },
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
      { label: "ch.ch — Abmeldung külföldre", url: "https://www.ch.ch/de/reisen-und-auswandern/im-ausland-leben/aus-der-schweiz-auswandern/" },
      { label: "AHV — Freizügigkeitsleistung", url: "https://www.ahv-iv.ch/" },
      { label: "Magyar Vámhatóság — Áttelepülés", url: "https://nav.gov.hu/vam/vasarlasok_kulfoldrol/letelepedes" },
    ],
  },
];

// ── Ausztria — osztrák ügyintézési csekklisták (EU-fókusz). ──
export const CHECKLISTS_AT: AdminChecklist[] = [
  {
    slug: "at-uj-bevandorlo",
    title: "Most költöztem Ausztriába",
    icon: "compass",
    summary: "Az első hetek lépései — Meldezettel, bankszámla, e-card, EU-regisztráció.",
    description: "EU-állampolgárként szabad mozgásod van, de pár hivatalos lépés kell az első hetekben. A Meldezettel határideje SZIGORÚAN 3 nap!",
    deadline: "Meldezettel: 3 napon belül! Anmeldebescheinigung: 4 hónapon belül (ha >3 hó maradsz).",
    totalDuration: "Kb. 2-4 hét",
    steps: [
      { title: "Lakcímbejelentés (Meldezettel)", body: "A beköltözéstől 3 NAPON belül a Meldeamtnál (Bécsben a kerületi Magistratisches Bezirksamt). Vidd: útlevél/igazolvány, kitöltött Meldezettel a szállásadó aláírásával.", link: { label: "oesterreich.gv.at — Meldepflicht", url: "https://www.oesterreich.gv.at/de/lebenslagen/Ich-wohne-bald-in-einem-neuen-Zuhause/Melden" }, duration: "30-60 perc" },
      { title: "Bankszámlanyitás", body: "Erste Bank/Sparkasse, Bank Austria, BAWAG vagy online (N26, bank99). A Meldezettel + útlevél kell. A fizetésedhez és a bérleti díjhoz elengedhetetlen.", duration: "30-60 perc" },
      { title: "Egészségbiztosítás (e-card / ÖGK)", body: "A munkaviszonnyal AUTOMATIKUSAN biztosított leszel — a munkáltató bejelent az ÖGK-hoz. Az e-card már csak FÉNYKÉPPEL készül: magyar állampolgárként a fotódat személyesen kell regisztráltatnod (útlevél-minőségű fotó + úti okmány, helyszínek: chipkarte.at/foto), utána postán jön a kártya.", link: { label: "chipkarte.at — fotó-regisztráció", url: "https://www.chipkarte.at/foto" }, duration: "fotó-regisztráció ~30 perc" },
      { title: "EU-regisztráció (Anmeldebescheinigung)", body: "3 hónapnál hosszabb tartózkodáshoz 4 hónapon belül kérd a tartózkodási hatóságnál (Bécsben MA 35). Kell: munkaviszony-igazolás VAGY elég jövedelem + biztosítás.", link: { label: "oesterreich.gv.at — Anmeldebescheinigung", url: "https://www.oesterreich.gv.at/de/themen/menschen_aus_anderen_staaten/aufenthalt/3/Seite.120221" }, duration: "1-2 óra" },
    ],
    warnings: ["A Meldezettel 3 napos határideje SZIGORÚ — a késés bírsággal járhat.", "Minden költözéskor frissíteni kell (Ummeldung)."],
    sources: [{ label: "oesterreich.gv.at", url: "https://www.oesterreich.gv.at/" }, { label: "migration.gv.at", url: "https://www.migration.gv.at/" }],
  },
  {
    slug: "at-meldezettel",
    title: "Lakcímbejelentés (Meldezettel)",
    icon: "house",
    summary: "Be-, át- és kijelentkezés a Meldeamtnál — 3 napon belül kötelező.",
    description: "Ausztriában minden lakcímváltozást 3 napon belül be kell jelenteni. A Meldezettel sok más ügyhöz (bank, hivatal) is kell.",
    deadline: "A beköltözéstől 3 napon belül.",
    totalDuration: "30-60 perc",
    steps: [
      { title: "Meldezettel-űrlap kitöltése", body: "Töltsd ki a Meldezettel nyomtatványt (online letölthető). A szállásadónak (Unterkunftgeber) alá kell írnia.", link: { label: "Meldezettel-űrlap (PDF)", url: "https://www.oesterreich.gv.at/dam/jcr:d0c97509-1a04-4b5a-8626-8a5f9e6b4b39/Meldezettel_2023_ausfuellbar.pdf" }, duration: "10 perc" },
      { title: "Személyes megjelenés a Meldeamtnál", body: "Bécsben a kerületi Magistratisches Bezirksamt; tartományokban a Gemeindeamt. Vidd: kitöltött Meldezettel + útlevél/igazolvány.", duration: "20-40 perc" },
      { title: "Meldebestätigung átvétele", body: "Megkapod az igazolást. Őrizd meg — bankhoz, hivatalokhoz kelleni fog.", duration: "azonnal" },
    ],
    warnings: ["Költözéskor Ummeldung, kiköltözéskor Abmeldung is kell."],
    sources: [{ label: "oesterreich.gv.at — Meldewesen", url: "https://www.oesterreich.gv.at/de/lebenslagen/Ich-wohne-bald-in-einem-neuen-Zuhause/Melden" }],
  },
  {
    slug: "at-adobevallas",
    title: "Adóelszámolás (Arbeitnehmerveranlagung)",
    icon: "wallet",
    summary: "Év végi munkavállalói adóelszámolás — gyakran VISSZAJÁR pénz!",
    description: "A bérből automatikusan vonják a Lohnsteuert. Év végén az Arbeitnehmerveranlagung (önkéntes elszámolás) gyakran visszatérítést hoz — érdemes beadni.",
    deadline: "Visszamenőleg 5 évig beadható.",
    totalDuration: "30-60 perc online",
    steps: [
      { title: "FinanzOnline regisztráció", body: "Regisztrálj a FinanzOnline-on (az osztrák adóhivatal portálja), vagy használd a 'Finanz' appot.", link: { label: "FinanzOnline", url: "https://finanzonline.bmf.gv.at/" }, duration: "15 perc" },
      { title: "Arbeitnehmerveranlagung kitöltése", body: "Add meg a levonható tételeket: ingázás (Pendlerpauschale), gyermek (Familienbonus Plus), továbbképzés, biztosítások.", duration: "30 perc" },
      { title: "Beadás és visszatérítés", body: "A Finanzamt kiszámolja; túlfizetés esetén a különbözetet a számládra utalja (Gutschrift).", duration: "néhány hét" },
    ],
    warnings: ["A Familienbonus Plus és a Pendlerpauschale jelentős összeg lehet — ne hagyd ki!"],
    sources: [{ label: "BMF — Arbeitnehmerveranlagung", url: "https://www.bmf.gv.at/" }],
  },
  {
    slug: "at-jogositvany",
    title: "Jogosítvány Ausztriában",
    icon: "car",
    summary: "A magyar (EU) jogosítvány érvényes — általában NEM kell cserélni!",
    description: "Jó hír: EU-állampolgárként a magyar jogosítványod Ausztriában korlátlanul érvényes. Cserére általában nincs szükség (ellentétben Svájccal).",
    deadline: "Nincs határidő — az EU-jogosítvány érvényes.",
    totalDuration: "0 (általában nincs teendő)",
    steps: [
      { title: "EU-jogosítvány = érvényes", body: "A magyar jogosítvány EU-s, így Ausztriában is érvényes. NEM kell osztrákra cserélni a használathoz.", duration: "—" },
      { title: "Opcionális csere", body: "Ha mégis osztrák jogosítványt szeretnél (lejár, elveszett), a Führerscheinbehörde-nél cserélheted. Kell: Meldezettel, fotó, a magyar jogosítvány.", link: { label: "oesterreich.gv.at — Führerschein", url: "https://www.oesterreich.gv.at/de/themen/mobilitaet/kfz/9/Seite.063502" }, duration: "ha kell: 1 óra + díj" },
    ],
    warnings: ["A magyar jogosítvány lejáratakor osztrák lakosként már Ausztriában kell megújítani."],
    sources: [{ label: "oesterreich.gv.at — Führerschein", url: "https://www.oesterreich.gv.at/de/themen/mobilitaet/kfz/9/Seite.063502" }],
  },
  {
    slug: "at-familienbeihilfe",
    title: "Családi pótlék (Familienbeihilfe)",
    icon: "users",
    summary: "Gyerek után járó osztrák családi támogatás — EU-munkavállalóként is jár.",
    description: "Ha Ausztriában dolgozol és gyereked van, jár a Familienbeihilfe + a Kinderabsetzbetrag — akkor is, ha a gyerek Magyarországon él (EU-szabály, különbözeti összeg).",
    deadline: "Visszamenőleg 5 évig igényelhető.",
    totalDuration: "30 perc + feldolgozás",
    steps: [
      { title: "Jogosultság ellenőrzése", body: "EU-munkavállalóként jár a Familienbeihilfe; ha a gyerek másik EU-országban él, kiegészítő/különbözeti összeg jár.", duration: "—" },
      { title: "Igénylés a Finanzamtnál", body: "FinanzOnline-on vagy a Finanzamtnál add be a Beih 100 űrlapot. Kell: a gyerek születési anyakönyve, Meldezettel, munkaviszony-igazolás.", link: { label: "BMF — Familienbeihilfe", url: "https://www.bmf.gv.at/themen/steuern/familienbeihilfe-faqs.html" }, duration: "30 perc" },
      { title: "Folyósítás", body: "Jóváhagyás után havonta a számládra utalják.", duration: "néhány hét" },
    ],
    warnings: ["A Familienbonus Plus az adóból külön levonható (Arbeitnehmerveranlagung) — a Familienbeihilfe mellett."],
    sources: [{ label: "BMF — Familienbeihilfe", url: "https://www.bmf.gv.at/themen/steuern/familienbeihilfe-faqs.html" }],
  },
];

// ── Németország — német ügyintézési csekklisták (EU-fókusz). ──
export const CHECKLISTS_DE: AdminChecklist[] = [
  {
    slug: "de-uj-bevandorlo",
    title: "Most költöztem Németországba",
    icon: "compass",
    summary: "Az első hetek lépései — Anmeldung, Steuer-ID, bankszámla, egészségbiztosítás.",
    description: "EU-állampolgárként szabad mozgásod van (nem kell tartózkodási engedély!), de pár hivatalos lépés kell az első hetekben. A legfontosabb az Anmeldung — abból jön minden más (Steuer-ID, bank, biztosítás).",
    deadline: "Anmeldung: a beköltözéstől 14 napon belül.",
    totalDuration: "Kb. 2-4 hét",
    steps: [
      { title: "Lakcímbejelentés (Anmeldung)", body: "A beköltözéstől 14 napon belül a Bürgeramt / Einwohnermeldeamt-nál (foglalj időpontot online — nagyvárosokban hetekre előre telt!). Vidd: útlevél/igazolvány + Wohnungsgeberbestätigung (a főbérlő/tulajdonos aláírt igazolása).", link: { label: "Bürgeramt-időpont — pl. Berlin service.berlin.de", url: "https://service.berlin.de/dienstleistung/120686/" }, duration: "20-40 perc + várakozási idő az időpontra" },
      { title: "Steuer-ID (adóazonosító) megérkezése", body: "Az Anmeldung után automatikusan postán kapod meg a steuerliche Identifikationsnummer-t (11 számjegy) — kb. 2-3 hét. A munkáltatódnak és a bérszámfejtéshez kell. NEM kell külön igényelni.", link: { label: "BZSt — Steuer-ID info", url: "https://www.bzst.de/DE/Privatpersonen/SteuerlicheIdentifikationsnummer/steuerlicheidentifikationsnummer_node.html" }, duration: "automatikus, 2-3 hét" },
      { title: "Bankszámla (Girokonto) nyitása", body: "Sparkasse, Commerzbank, DKB vagy online (N26, ING, C24). Kell: Anmeldung (Meldebescheinigung) + útlevél. A fizetésedhez és a lakbérhez elengedhetetlen.", duration: "20-45 perc" },
      { title: "Egészségbiztosítás (Krankenversicherung)", body: "Kötelező! Munkavállalóként a törvényes biztosítás (gesetzliche Krankenversicherung, GKV) az alap — válassz pénztárat (TK, AOK, Barmer, DAK). A munkáltató bejelent, a járulékot a bérből vonják. A díj mindenhol ~ugyanaz (14,6% + Zusatzbeitrag), a szolgáltatás/extra eltér.", link: { label: "Krankenkassen összehasonlító", url: "https://www.gesetzlichekrankenkassen.de/" }, duration: "30 perc (online belépés)" },
      { title: "Sozialversicherungsnummer (TB-szám)", body: "A nyugdíjbiztosítási szám (Rentenversicherungsnummer / Sozialversicherungsausweis) — a munkáltatód igényli az első bejelentéskor, vagy automatikusan kapod a Deutsche Rentenversicherungtól postán.", duration: "automatikus, 2-4 hét" },
    ],
    warnings: ["EU-állampolgárként NINCS szükség tartózkodási engedélyre (a Freizügigkeitsbescheinigung-ot 2013-ban eltörölték) — elég az Anmeldung.", "Az Anmeldung-időpontot nagyvárosokban (Berlin, München) hetekkel előre kell foglalni — intézd amint megvan a lakás."],
    sources: [{ label: "Make it in Germany — hivatalos portál", url: "https://www.make-it-in-germany.com/" }, { label: "BZSt — Steuer-ID", url: "https://www.bzst.de/" }],
  },
  {
    slug: "de-anmeldung",
    title: "Lakcímbejelentés (Anmeldung)",
    icon: "house",
    summary: "Be- és átjelentkezés a Bürgeramt-nál — 14 napon belül kötelező.",
    description: "Németországban minden beköltözést/költözést 14 napon belül be kell jelenteni a Bürgeramt-nál. Az Anmeldung-igazolás (Meldebescheinigung) sok más ügyhöz (bank, Steuer-ID, szerződések) is kell.",
    deadline: "A beköltözéstől 14 napon belül.",
    totalDuration: "20-40 perc (az időpontra várni kell)",
    steps: [
      { title: "Időpontfoglalás (Termin)", body: "Foglalj online időpontot a városod Bürgeramt / Bürgerbüro / KVR oldalán. Nagyvárosokban hetekre előre telt — intézd korán.", link: { label: "Berlin — Bürgeramt-időpont", url: "https://service.berlin.de/dienstleistung/120686/" }, duration: "5 perc" },
      { title: "Wohnungsgeberbestätigung beszerzése", body: "A főbérlőtől/tulajdonostól kérj egy aláírt Wohnungsgeberbestätigung (Vermieterbescheinigung) igazolást — ez igazolja, hogy tényleg ott laksz. Az Anmeldung-hoz KÖTELEZŐ.", duration: "10 perc" },
      { title: "Megjelenés a Bürgeramt-nál", body: "Vidd: kitöltött Anmeldung-űrlap, Wohnungsgeberbestätigung, útlevél/igazolvány (mindenkié, aki költözik). A helyszínen megkapod a Meldebescheinigung-ot.", duration: "20-30 perc" },
    ],
    warnings: ["Wohnungsgeberbestätigung nélkül elutasítják a bejelentést.", "Költözéskor Ummeldung (átjelentkezés), külföldre költözéskor Abmeldung is kell."],
    sources: [{ label: "Make it in Germany — Anmeldung", url: "https://www.make-it-in-germany.com/de/leben-in-deutschland/ankommen/anmeldung" }],
  },
  {
    slug: "de-krankenversicherung",
    title: "Egészségbiztosítás (Krankenversicherung)",
    icon: "health",
    summary: "Kötelező! Törvényes (GKV) pénztár választása — TK, AOK, Barmer.",
    description: "Németországban az egészségbiztosítás kötelező. Munkavállalóként a törvényes (gesetzliche, GKV) rendszerbe tartozol; magas jövedelem felett választható a magán (PKV). A GKV-díj nagyjából mindenhol azonos — a pénztár szolgáltatása és a Zusatzbeitrag tér el.",
    deadline: "A munkakezdéskor azonnal (a munkáltató bejelent).",
    totalDuration: "30 perc (pénztár-választás)",
    steps: [
      { title: "GKV vagy PKV?", body: "Munkavállalóként ~69 300 €/év bruttó alatt KÖTELEZŐEN a törvényes GKV-ban vagy. E felett (vagy önállóként) választható a magán PKV. A legtöbb kezdőnek a GKV az alap.", duration: "—" },
      { title: "Pénztár (Krankenkasse) választása", body: "Válassz egy törvényes pénztárat: Techniker Krankenkasse (TK), AOK, Barmer, DAK. A 14,6% alapjárulék mindenhol azonos, csak a Zusatzbeitrag (~1-2%) és a bónuszok térnek el.", link: { label: "Krankenkassen összehasonlító", url: "https://www.gesetzlichekrankenkassen.de/" }, duration: "20 perc" },
      { title: "Belépés + Mitgliedsbescheinigung", body: "Online belépsz a pénztárba; kapsz egy Mitgliedsbescheinigung-ot, amit a munkáltatónak leadsz. A járulékot automatikusan a bérből vonják (fele munkáltató, fele te).", duration: "15 perc" },
      { title: "Gesundheitskarte (kártya)", body: "Postán kapod meg az elektronikus egészségkártyát (eGK) — ezt viszed orvoshoz, gyógyszertárba.", duration: "automatikus, 2-3 hét" },
    ],
    warnings: ["A PKV-ből nehéz visszatérni a GKV-ba — alaposan mérlegelj, mielőtt magánra váltasz.", "A családtagok (nem dolgozó házastárs, gyerek) a GKV-ban INGYEN biztosítottak (Familienversicherung) — a PKV-ban mindenkiért külön fizetsz."],
    sources: [{ label: "Make it in Germany — Krankenversicherung", url: "https://www.make-it-in-germany.com/de/leben-in-deutschland/versicherungen/krankenversicherung" }],
  },
  {
    slug: "de-steuererklarung",
    title: "Adóbevallás (Steuererklärung)",
    icon: "wallet",
    summary: "ELSTER-en online — gyakran VISSZAJÁR pénz! Határidő: a következő év júl. 31.",
    description: "A bérből automatikusan vonják a Lohnsteuert (a Steuerklasse szerint). Az éves Steuererklärung gyakran visszatérítést hoz (átlag ~1000 €). Önállóan kitöltve a határidő a következő év július 31. — Steuerberaterrel később.",
    deadline: "A következő év július 31. (önállóan); Steuerberaterrel hosszabb.",
    totalDuration: "1-2 óra online",
    steps: [
      { title: "ELSTER-regisztráció", body: "Regisztrálj az ELSTER-en (a német adóhivatal hivatalos online portálja) a Steuer-ID-ddel. A regisztráció több lépés (aktivációs kód postán jön) — kezdd korán.", link: { label: "ELSTER — hivatalos portál", url: "https://www.elster.de/" }, duration: "20 perc + postai kód" },
      { title: "Steuerklasse ellenőrzése", body: "Ellenőrizd az adóosztályodat (Steuerklasse I-VI). Házasoknak a III/V vagy IV/IV kombináció nagy különbséget jelenthet — érdemes optimalizálni.", duration: "10 perc" },
      { title: "Levonások összegyűjtése", body: "Add meg a levonható tételeket: munkába járás (Pendlerpauschale, 0,30-0,38 €/km), home-office átalány, szakmai költségek (Werbungskosten), biztosítások, gyerek-költségek, áthelyezési költség.", duration: "30-60 perc" },
      { title: "Beadás + visszatérítés", body: "A Finanzamt feldolgozza (4-12 hét), és a túlfizetést a számládra utalja (Steuerbescheid-del értesít).", duration: "néhány hét feldolgozás" },
    ],
    warnings: ["Munkavállalóként sokszor NEM kötelező a bevallás, de ha visszaigényelni akarsz, érdemes — átlag ~1000 € jár vissza.", "Bizonyos esetekben (több munkáltató, Steuerklasse-kombináció, mellékjövedelem) KÖTELEZŐ a bevallás — ilyenkor tartsd a júl. 31-i határidőt."],
    sources: [{ label: "ELSTER — hivatalos", url: "https://www.elster.de/" }, { label: "Make it in Germany — Steuern", url: "https://www.make-it-in-germany.com/de/arbeiten-in-deutschland/steuern-finanzen" }],
  },
  {
    slug: "de-fuhrerschein",
    title: "Jogosítvány Németországban",
    icon: "car",
    summary: "A magyar (EU) jogosítvány érvényes — általában NEM kell cserélni!",
    description: "Jó hír: EU-állampolgárként a magyar jogosítványod Németországban korlátlanul érvényes a lejáratáig. Cserére általában nincs szükség (ellentétben Svájccal).",
    deadline: "Nincs határidő — az EU-jogosítvány érvényes.",
    totalDuration: "0 (általában nincs teendő)",
    steps: [
      { title: "EU-jogosítvány = érvényes", body: "A magyar jogosítvány EU-s, így Németországban is érvényes a rajta szereplő lejáratig. NEM kell németre cserélni a használathoz.", duration: "—" },
      { title: "Opcionális csere / megújítás", body: "Ha lejár, elveszett, vagy német jogsit szeretnél, a Führerscheinstelle-nél (Fahrerlaubnisbehörde) intézed. Kell: Anmeldung, biometrikus fotó, a magyar jogosítvány, esetleg látásteszt.", link: { label: "Bürgerservice — Führerschein", url: "https://verwaltung.bund.de/leistungsverzeichnis/de/rechte-und-pflichten/102837920" }, duration: "ha kell: 1 óra + díj" },
    ],
    warnings: ["A magyar jogosítvány lejáratakor német lakosként már Németországban kell megújítani.", "Tehergépjármű/busz (C, D kategória) esetén lehetnek külön orvosi/időbeli feltételek."],
    sources: [{ label: "BMDV — Führerschein", url: "https://verwaltung.bund.de/leistungsverzeichnis/de/rechte-und-pflichten/102837920" }],
  },
  {
    slug: "de-kindergeld",
    title: "Családi pótlék (Kindergeld)",
    icon: "users",
    summary: "Gyerek után járó német családi támogatás — havi 250 €/gyerek.",
    description: "Ha Németországban dolgozol/laksz és gyereked van, jár a Kindergeld (2024-től 250 €/hó/gyerek) — akkor is, ha a gyerek Magyarországon él (EU-szabály, különbözeti összeg). A Familienkasse intézi.",
    deadline: "Visszamenőleg 6 hónapra igényelhető.",
    totalDuration: "30 perc + feldolgozás",
    steps: [
      { title: "Steuer-ID beszerzése (szülő + gyerek)", body: "A Kindergeld-igényléshez kell a saját ÉS a gyerek Steuer-ID-je. A gyereké az Anmeldung után automatikusan jön postán.", duration: "—" },
      { title: "Igénylés a Familienkasse-nál", body: "Töltsd ki a Kindergeldantrag-ot (online vagy papíron) a Familienkasse-nál (a Bundesagentur für Arbeit része). Kell: a gyerek születési anyakönyve, Steuer-ID-k, Anmeldung.", link: { label: "Familienkasse — Kindergeld", url: "https://www.arbeitsagentur.de/familie-und-kinder/infos-rund-um-kindergeld" }, duration: "30 perc" },
      { title: "Folyósítás", body: "Jóváhagyás után havonta a számládra utalják. Ha a gyerek másik EU-országban él, kiegészítő/különbözeti összeg jár.", duration: "néhány hét" },
    ],
    warnings: ["Ha a gyerek Magyarországon él és ott is kaptok családi pótlékot, Németország a KÜLÖNBÖZETET fizeti (EU-koordináció).", "18 év felett (tanulmányok alatt) is járhat 25 éves korig — külön igazolással."],
    sources: [{ label: "Familienkasse — Kindergeld", url: "https://www.arbeitsagentur.de/familie-und-kinder/infos-rund-um-kindergeld" }],
  },
  {
    slug: "de-hazakoltozes",
    title: "Hazaköltözés Németországból (Abmeldung)",
    icon: "truck",
    summary: "Végleg elhagyod Németországot? Abmeldung, adók, bank, nyugdíj, Kindergeld leállítás.",
    description: "A német hazaköltözésnek is van pár fontos lépése — az Abmeldungtól a nyugdíjbiztosításig. Ha nem intézed időben, gondok lehetnek a banki/adóügyekkel és elmaradhat a túlfizetett adó visszatérítése.",
    deadline: "Az Abmeldung a kiköltözés körül (sok város 14 napos ablakot ad).",
    totalDuration: "Kb. 2-4 hét intézés",
    steps: [
      { title: "Lakcím-kijelentés (Abmeldung)", body: "Külföldre költözéskor a Bürgeramt-nál kell kijelentkezned (a sima belföldi költözésnél NEM kell, csak külföldre vagy lakásmegszűnéskor). Sok város online/levélben is intézi. Kapsz egy Abmeldebestätigung-ot.", link: { label: "Make it in Germany — Abmeldung", url: "https://www.make-it-in-germany.com/de/leben-in-deutschland/ankommen/anmeldung" }, duration: "20-40 perc" },
      { title: "Záró adóbevallás (Steuererklärung)", body: "A kiköltözés évére adj be egy Steuererklärung-ot az ELSTER-en — gyakran jelentős visszatérítés jár a részévre. Add meg a külföldi bankszámládat a Finanzamtnál.", link: { label: "ELSTER", url: "https://www.elster.de/" }, duration: "1-2 óra" },
      { title: "Nyugdíjbiztosítás (Deutsche Rentenversicherung)", body: "A befizetett nyugdíjjárulékaid a német rendszerben maradnak, és a nyugdíjkorhatár elérésekor — EU-koordinációval, a magyar évekkel összeszámítva — járadékként kapod meg. EU-állampolgárként a járulék NEM vehető ki készpénzben. Jelentsd be a külföldi címedet, hogy tudják, hova írjanak.", link: { label: "Deutsche Rentenversicherung", url: "https://www.deutsche-rentenversicherung.de/" }, duration: "1 levél / online" },
      { title: "Krankenversicherung felmondása", body: "Az Abmeldung-gal/munkaviszony-megszűnéssel értesítsd a Krankenkassét a kilépésről, hogy ne számlázzanak tovább. Add meg a pontos záró dátumot.", duration: "2-3 hét" },
      { title: "Bankszámla és előfizetések", body: "Mielőtt zárod a Girokontót: töröld az állandó megbízásokat (Dauerauftrag) és a beszedési megbízásokat (SEPA-Lastschrift), utalj át mindent. Mondd fel a szerződéseket (telefon/internet — figyelem: gyakran 1-3 hó felmondási idő!), villany/gáz, biztosítások.", duration: "2-4 hét" },
      { title: "Kindergeld leállítása", body: "Értesítsd a Familienkasse-t a kiköltözésről — különben túlfizetést kérhetnek vissza később. Ha Magyarországon élsz tovább, ott igényeld a magyar családi pótlékot.", duration: "10 perc" },
    ],
    warnings: ["A telefon/internet-szerződések felmondási ideje gyakran 1-3 hónap — intézd időben, különben tovább vonják.", "A nyugdíjjárulék EU-állampolgárként NEM vehető ki — a magyar és német évek összeszámítódnak a nyugdíjnál (EU-koordináció).", "Tartsd meg az összes Steuerbescheid-et és igazolást — később (pl. magyar nyugdíjnál) szükség lehet rá."],
    sources: [{ label: "Make it in Germany", url: "https://www.make-it-in-germany.com/" }, { label: "Deutsche Rentenversicherung", url: "https://www.deutsche-rentenversicherung.de/" }],
  },
];

export const CHECKLISTS_NL: AdminChecklist[] = [
  {
    slug: "nl-uj-bevandorlo",
    title: "Most költöztem Hollandiába",
    icon: "compass",
    summary: "Az első hetek lépései — inschrijving + BSN, DigiD, bankszámla, zorgverzekering.",
    description: "EU-állampolgárként szabad mozgásod van (nem kell tartózkodási engedély!), de pár hivatalos lépés kell az első hetekben. A legfontosabb az inschrijving a gemeentén — abból jön a BSN, és arra épül minden más (DigiD, bank, biztosítás).",
    deadline: "Inschrijving: ha 4 hónapnál tovább maradsz, az érkezéstől 5 napon belül.",
    totalDuration: "Kb. 2-4 hét",
    steps: [
      { title: "Bejelentkezés a gemeentén (inschrijving / BRP)", body: "Foglalj időpontot a lakóhelyed gemeente (önkormányzat) oldalán, és jelentkezz be a lakcímnyilvántartásba (Basisregistratie Personen). Vidd: érvényes útlevél/igazolvány, bérleti szerződés vagy a lakásadó hozzájárulása, és (ha van) nemzetközi születési anyakönyvi kivonat. A regisztrációkor kapod a BSN-t.", link: { label: "rijksoverheid.nl — persoonsgegevens (BRP)", url: "https://www.rijksoverheid.nl/themas/overheid-en-democratie/privacy-en-persoonsgegevens" }, duration: "20-30 perc + időpont-várakozás" },
      { title: "BSN (Burgerservicenummer) megérkezése", body: "A BSN a személyi azonosító szám — a regisztrációkor vagy pár napon belül megkapod. Szinte minden ügyhöz kell: munka, bank, zorgverzekering, adó.", duration: "azonnal / pár nap" },
      { title: "DigiD igénylése", body: "A DigiD a digitális azonosítód a hivatali ügyintézéshez. A BSN birtokában igényeld a digid.nl-en; az aktiváló kód postán jön a regisztrált címedre (kb. 3-5 munkanap).", link: { label: "digid.nl", url: "https://www.digid.nl/" }, duration: "10 perc + postai kód" },
      { title: "Bankszámla nyitása", body: "Holland bankszámla a fizetéshez és a lakbérhez. ING, ABN AMRO, Rabobank, vagy online bunq. Kell: BSN + útlevél/igazolvány + lakcím.", duration: "20-40 perc" },
      { title: "Egészségbiztosítás (zorgverzekering)", body: "KÖTELEZŐ! A regisztrációtól/biztosítottá válástól 4 hónapon belül köss alap-egészségbiztosítást (basisverzekering) egy holland biztosítónál — visszamenőleg az érkezés napjáig. Kb. 140 EUR/hó.", link: { label: "rijksoverheid.nl — zorgverzekering", url: "https://www.rijksoverheid.nl/onderwerpen/zorgverzekering" }, duration: "30 perc (online)" },
    ],
    warnings: ["EU-állampolgárként NINCS szükség tartózkodási engedélyre — elég az inschrijving a gemeentén.", "Ha kihagyod a zorgverzekeringet, a CAK utólag büntetést és visszamenőleges díjat szabhat ki.", "Sok gemeentén hetekkel előre kell időpontot foglalni — intézd, amint megvan a lakás."],
    sources: [{ label: "rijksoverheid.nl — bevándorlás", url: "https://www.rijksoverheid.nl/onderwerpen/immigratie-naar-nederland" }, { label: "ind.nl — EU-állampolgárok", url: "https://ind.nl/en" }],
  },
  {
    slug: "nl-inschrijving-bsn",
    title: "Bejelentkezés (inschrijving) + BSN",
    icon: "house",
    summary: "Regisztráció a gemeentén (BRP) — ebből jön a BSN, minden más alapja.",
    description: "Ha 4 hónapnál tovább élsz Hollandiában, be kell jelentkezned a gemeente lakcímnyilvántartásába (Basisregistratie Personen, BRP). A regisztráció adja a BSN-t, ami szinte minden hivatali és munkaügyi lépéshez kell.",
    deadline: "Az érkezéstől 5 napon belül (ha 4 hónapnál tovább maradsz).",
    totalDuration: "20-30 perc (időpontra várni kell)",
    steps: [
      { title: "Időpontfoglalás a gemeentén", body: "Keresd a lakóhelyed gemeente (pl. Amsterdam, Den Haag, Utrecht) hivatalos oldalát, és foglalj időpontot inschrijving / eerste inschrijving / vestiging vanuit het buitenland címszó alatt.", duration: "5 perc" },
      { title: "Dokumentumok összeállítása", body: "Érvényes útlevél vagy személyi igazolvány; bérleti szerződés vagy a lakásadó írásos hozzájárulása (toestemmingsverklaring); ha külföldön születtél/házasodtál, nemzetközi (többnyelvű) vagy hitelesített, lefordított anyakönyvi kivonat is kellhet.", duration: "változó" },
      { title: "Megjelenés és regisztráció", body: "A gemeentén személyesen regisztrálsz. A BSN-t a helyszínen vagy pár napon belül kapod meg. Ezzel bekerülsz a BRP-be.", duration: "20-30 perc" },
    ],
    warnings: ["Lakásadói hozzájárulás vagy bérleti szerződés nélkül elutasíthatják a bejelentést.", "Az anyakönyvi kivonatok fordítása/legalizálása időbe telhet — intézd előre."],
    sources: [{ label: "rijksoverheid.nl — BSN", url: "https://www.rijksoverheid.nl/themas/overheid-en-democratie/privacy-en-persoonsgegevens/burgerservicenummer-bsn" }],
  },
  {
    slug: "nl-digid",
    title: "DigiD igénylése",
    icon: "lock",
    summary: "Digitális azonosító az állami és egészségügyi online ügyintézéshez.",
    description: "A DigiD-vel lépsz be a holland hivatali online rendszerekbe: gemeente, Belastingdienst (adó), zorgverzekering, DUO, UWV. A BSN megléte után igényelheted.",
    deadline: "Amint megvan a BSN.",
    totalDuration: "10 perc + 3-5 munkanap (postai kód)",
    steps: [
      { title: "Igénylés online", body: "Menj a digid.nl oldalra, add meg a BSN-edet és az adataidat, válassz felhasználónevet és jelszót.", link: { label: "digid.nl", url: "https://www.digid.nl/" }, duration: "10 perc" },
      { title: "Aktiváló kód postán", body: "Egy aktiváló kódot küldenek a regisztrált (BRP-) címedre, jellemzően 3-5 munkanapon belül.", duration: "3-5 munkanap" },
      { title: "Aktiválás", body: "A kóddal aktiváld a DigiD-et a digid.nl-en. Érdemes a DigiD-appot is telepíteni a kényelmesebb és biztonságosabb belépéshez.", duration: "5 perc" },
    ],
    warnings: ["A DigiD csak a BRP-ben regisztrált címedre érkezik — előbb intézd az inschrijvinget.", "Soha ne add meg a DigiD-jelszavadat senkinek; a hivatalok sosem kérik telefonon."],
    sources: [{ label: "digid.nl", url: "https://www.digid.nl/" }],
  },
  {
    slug: "nl-zorgverzekering",
    title: "Egészségbiztosítás (zorgverzekering)",
    icon: "health",
    summary: "Kötelező alapbiztosítás 4 hónapon belül — + zorgtoeslag, ha alacsony a jövedelem.",
    description: "Hollandiában, ha dolgozol vagy itt élsz, kötelező holland alap-egészségbiztosítást (basisverzekering) kötni egy magán biztosítónál. A díj és a fedezet alapja törvényileg azonos, az extrák (aanvullend) és az önrész-kezelés eltér.",
    deadline: "A biztosítottá válástól (érkezés/regisztráció) 4 hónapon belül — visszamenőleg fizetsz.",
    totalDuration: "30 perc (online kötés)",
    steps: [
      { title: "Biztosító és csomag választása", body: "Hasonlítsd össze a biztosítókat (pl. Zilveren Kruis, VGZ, CZ, Menzis). Az alap (basisverzekering) törvényileg azonos; figyelj az eigen risico (önrész, 2024-ben 385 EUR/év) és az esetleges aanvullend (kiegészítő, pl. fogászat) csomagra.", link: { label: "rijksoverheid.nl — zorgverzekering", url: "https://www.rijksoverheid.nl/onderwerpen/zorgverzekering" }, duration: "20 perc" },
      { title: "Megkötés BSN-nel", body: "Online köthető; kell a BSN, lakcím, bankszámla (IBAN). A biztosítás visszamenőleg él az érkezés/biztosítottá válás napjáig.", duration: "10 perc" },
      { title: "Zorgtoeslag igénylése (ha jogosult vagy)", body: "Alacsonyabb jövedelemnél állami hozzájárulás (zorgtoeslag) jár a díjhoz — a Belastingdienst/Toeslagen-nél igényled DigiD-vel. A jogosultság jövedelemhatárhoz kötött.", link: { label: "toeslagen.nl — zorgtoeslag", url: "https://www.toeslagen.nl/" }, duration: "15 perc" },
    ],
    warnings: ["Ha 4 hónapon túl sincs biztosításod, a CAK felszólít és bírságot/visszamenőleges díjat szabhat ki.", "A magyar EU-kártya (EHIC) csak ideiglenes/sürgősségi ellátásra jó — tartós ittlétnél holland biztosítás kell."],
    sources: [{ label: "rijksoverheid.nl — zorgverzekering", url: "https://www.rijksoverheid.nl/onderwerpen/zorgverzekering" }, { label: "zorgverzekeringslijn.nl", url: "https://www.zorgverzekeringslijn.nl/" }],
  },
  {
    slug: "nl-bank-belasting",
    title: "Bankszámla + adózás (Belastingdienst)",
    icon: "bank",
    summary: "Holland IBAN-számla és a jövedelemadó / juttatások (toeslagen) alapjai.",
    description: "A holland bankszámla (IBAN) a fizetéshez, lakbérhez és a legtöbb fizetéshez kell (sok helyen csak iDEAL/PIN megy). Az adót a Belastingdienst kezeli; alacsonyabb jövedelemnél juttatások (toeslagen) járhatnak.",
    totalDuration: "Bankszámla: 20-40 perc; adóbevallás: évente",
    steps: [
      { title: "Bankszámla nyitása", body: "ING, ABN AMRO, Rabobank vagy online bunq. Kell: BSN, útlevél/igazolvány, lakcím. A legtöbb holland bolt iDEAL-t vagy PIN (maestro/V-pay) kártyát vár — a holland IBAN nagyon megkönnyíti az életet.", duration: "20-40 perc" },
      { title: "Adóazonosítás (BSN = adószám)", body: "Hollandiában a BSN egyben az adóazonosítód. A munkáltató ez alapján vonja a bérből az adót/járulékot (loonheffing).", duration: "automatikus" },
      { title: "Jövedelemadó-bevallás (aangifte)", body: "Az éves bevallást (inkomstenbelasting) a Belastingdienstnél, DigiD-vel teszed meg — jellemzően március 1. és május 1. között a Mijn Belastingdienst portálon.", link: { label: "belastingdienst.nl", url: "https://www.belastingdienst.nl/" }, duration: "30-60 perc" },
      { title: "Toeslagen (juttatások) ellenőrzése", body: "Alacsonyabb jövedelemnél járhat zorgtoeslag (egészségbiztosítás), huurtoeslag (lakbér) vagy kinderopvangtoeslag (gyermekfelügyelet). DigiD-vel igényled.", link: { label: "toeslagen.nl", url: "https://www.toeslagen.nl/" }, duration: "15 perc / juttatás" },
    ],
    warnings: ["A toeslagen előleg-alapú: ha többet kapsz a jogosnál, vissza kell fizetni — mindig frissítsd a várható jövedelmet.", "A 30%-os szabály (30%-regeling) csak bizonyos kiküldött szakembereknek jár, és 2024-től szigorodik — kérdezd meg a munkáltatód/könyvelőd."],
    sources: [{ label: "belastingdienst.nl", url: "https://www.belastingdienst.nl/" }, { label: "toeslagen.nl", url: "https://www.toeslagen.nl/" }],
  },
  {
    slug: "nl-rijbewijs",
    title: "Jogosítvány (rijbewijs)",
    icon: "car",
    summary: "Magyar (EU) jogosítvány érvényes; csere opcionális a gemeentén.",
    description: "EU-állampolgárként a magyar jogosítványod Hollandiában is érvényes a lejáratáig (legfeljebb 15 évig az adott kategóriától függően). Cserélni nem kötelező, de kérheted holland rijbewijsre.",
    totalDuration: "Csere esetén: 1-2 hét",
    steps: [
      { title: "Érvényesség ellenőrzése", body: "A magyar (EU/EGT) jogosítvány Hollandiában érvényes a rajta szereplő lejáratig (max. 15 év a kiállítástól). Tartós ittlétnél érdemes lehet holland kártyára cserélni.", duration: "—" },
      { title: "Csere a gemeentén (opcionális)", body: "Ha cserélni szeretnél: a gemeentén (rijbewijs-ügyintézés) intézed. Kell: jelenlegi jogosítvány, érvényes igazolvány, friss igazolványkép a holland szabvány szerint, és (esetenként) egészségügyi nyilatkozat a CBR-en (Gezondheidsverklaring).", link: { label: "rijksoverheid.nl — rijbewijs omwisselen", url: "https://www.rijksoverheid.nl/onderwerpen/rijbewijs" }, duration: "1-2 hét" },
    ],
    warnings: ["Csak EU/EGT jogosítványra igaz a problémamentes érvényesség — nem EU-s jogsit más szabályok szerint kell honosítani.", "70 év felett vagy bizonyos egészségi feltételeknél a CBR-nél egészségügyi nyilatkozat kellhet."],
    sources: [{ label: "rijksoverheid.nl — rijbewijs", url: "https://www.rijksoverheid.nl/onderwerpen/rijbewijs" }],
  },
];

/** Az összes csekklista (statikus generáláshoz + slug-kereséshez). */
export const CHECKLISTS: AdminChecklist[] = [...CHECKLISTS_CH, ...CHECKLISTS_AT, ...CHECKLISTS_DE, ...CHECKLISTS_NL];

/** A választott ország csekklistái (a lista-nézethez). */
export function getChecklists(country: string | null | undefined): AdminChecklist[] {
  if (country === "AT") return CHECKLISTS_AT;
  if (country === "DE") return CHECKLISTS_DE;
  if (country === "NL") return CHECKLISTS_NL;
  return CHECKLISTS_CH;
}

export function getChecklist(slug: string): AdminChecklist | null {
  return CHECKLISTS.find((c) => c.slug === slug) ?? null;
}
