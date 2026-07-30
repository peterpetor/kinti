/**
 * Országos összehasonlító táblázatok a tudásbázis-cikkekhez (AEO — a
 * válaszgépek/featured-snippet a struktúrált összehasonlítást idézik a
 * „melyik országban jobb/könnyebb X?" kérdésekre; a magyar olvasónak pedig
 * a CH/AT/DE/NL/GB/ES közti választáshoz ad egy-pillantásos képet).
 *
 * ⚠️ ANGLIA MIATT: az `intro` mondatok NEM általánosíthatnak az egész
 * táblázatra. Ami a négy kontinentális országban közös EU-szabály (szabad
 * letelepedés, engedély nélküli munkavállalás, U1-beszámítás, családi
 * ellátás koordinációja), az Angliára Brexit óta NEM igaz — új sor vagy új
 * intro írásakor ezt külön ellenőrizd, különben a bevezető az alatta lévő
 * saját cellájának mond ellent.
 *
 * FONTOS: minden cella a MEGLÉVŐ, hivatalos forrásokból írt guide-tartalom
 * (lib/guides.ts) tömörítése — NEM új tényállítás. A pontos, dátumozott
 * számokat a guide-ok szándékosan hedgelik („az aktuálisat a hivatalos
 * oldalon") — a táblázat ugyanezt a szintet tartja, alul figyelmeztetéssel.
 * A „—" azt jelenti: az adott ország cikke ezt a szempontot nem tárgyalja
 * (nem tippelünk értéket, ld. a precise-address / no-new-claim fegyelem).
 */

import type { IconName } from "@/components/ui";

export interface ComparisonRow {
  label: string;
  ch: string;
  at: string;
  de: string;
  nl: string;
  /** ⚠️ Anglia. A „—" itt is azt jelenti: az angol cikkek ezt a szempontot nem
   *  tárgyalják — NEM tippelünk értéket (ugyanaz a fegyelem, mint a többinél). */
  gb: string;
  /** ⚠️ Spanyolország. Ugyanaz a fegyelem: a „—" itt is hiányzó CIKK-TARTALMAT
   *  jelent, nem azt, hogy a dolog nem létezik. */
  es: string;
}

export interface GuideComparison {
  id: string;
  /** Téma-ikon (a cím elé + a hub ugró-navjába) — wayfinding a hosszú listában. */
  icon: IconName;
  /** A táblázat címe (H2). */
  caption: string;
  /** Egy mondat kontextus a táblázat fölé. */
  intro: string;
  /** Országonkénti guide-slug — EZEKEN a lapokon jelenik meg a táblázat, és a
   *  reader országának oszlopa kiemelve. */
  slugs: { ch: string; at: string; de: string; nl: string; gb?: string; es?: string };
  rows: ComparisonRow[];
}

export const GUIDE_COMPARISONS: GuideComparison[] = [
  {
    id: "egeszsegbiztositas",
    icon: "heart",
    caption: "Egészségbiztosítás — egy pillantásra",
    intro:
      "A fő szerkezeti különbség: Svájcban és Hollandiában fix havi díjat fizetsz és biztosítót választasz, Ausztriában és Németországban a bérből vont járulék fedezi — Angliában pedig egyik sincs: az NHS-t az általános adó állja, biztosítót nem választasz.",
    slugs: {
      ch: "egeszsegbiztositas-krankenkasse",
      at: "at-egeszsegbiztositas",
      de: "de-egeszsegbiztositas",
      nl: "nl-egeszsegbiztositas",
      gb: "gb-nhs",
      es: "es-egeszsegugy",
    },
    rows: [
      { label: "Rendszer", ch: "Alapbiztosítás (KVG/LAMal)", at: "ÖGK + e-card", de: "GKV (vagy PKV)", nl: "Basisverzekering", gb: "NHS — adóból finanszírozott", es: "SNS — az autonóm közösséged szolgálata" },
      { label: "Pénztárt te választod?", ch: "Igen, szabad választás", at: "Nem — automatikus ÖGK", de: "Igen (AOK, TK, Barmer…)", nl: "Igen", gb: "Nem — nincs biztosító", es: "Nem — nincs biztosító" },
      { label: "Mikorra kell meglennie", ch: "3 hónap az érkezéstől", at: "A bejelentéssel automatikus", de: "A munkaviszonnyal indul", nl: "4 hónap a start-tól", gb: "Nincs teendő (vízumnál IHS előre fizetve)", es: "Empadronamiento + TB-bejelentés után igényled" },
      { label: "Havi teher", ch: "Fix díj (biztosítónként/kantononként eltér)", at: "Bérből vont járulék (nincs külön díj)", de: "~14,6% + Zusatzbeitrag, fele-fele a munkáltatóval", nl: "Fix díj ~140 €/hó + éves önrész (eigen risico)", gb: "Nincs havi díj", es: "Nincs havi díj; gyógyszernél önrész (copago)" },
      { label: "Első kontakt", ch: "Háziorvos", at: "Hausarzt", de: "Hausarzt", nl: "Huisarts (kapuőr a szakorvoshoz)", gb: "GP (háziorvos) — kapuőr", es: "Médico de cabecera a centro de saludban" },
    ],
  },
  {
    id: "bejelentkezes",
    icon: "home",
    caption: "Bejelentkezés és tartózkodás — egy pillantásra",
    intro:
      "⚠️ Az öt kontinentális országban EU-állampolgárként szabadon letelepedhetsz — Angliában Brexit óta NEM: 2021 januárja óta vízum kell hozzá (kivéve, akinek EUSS-státusza van). A határidők és a kapott azonosítók egyébként is eltérnek.",
    slugs: {
      ch: "bejelentkezes-letelepedes",
      at: "at-bejelentkezes",
      de: "de-bejelentkezes",
      nl: "nl-bejelentkezes",
      gb: "gb-letelepedes",
      es: "es-nie-regisztracio",
    },
    rows: [
      { label: "Lakcím-bejelentés határideje", ch: "14 nap", at: "3 nap", de: "kb. 1–2 hét (városfüggő)", nl: "néhány nap (4+ hó tartózkodásnál)", gb: "⚠️ Nincs lakcímbejelentés", es: "Empadronamiento — beköltözéskor (nincs napra szóló határidő)" },
      { label: "3 hónap feletti tartózkodás", ch: "Tartózkodási engedély (B/L)", at: "Anmeldebescheinigung (4 hón belül)", de: "Nincs külön engedély (Freizügigkeit)", nl: "Nincs (vrij verkeer)", gb: "⚠️ Vízum kell (2021 óta); korábbi érkezőnek EUSS", es: "Regisztráció a külföldiek nyilvántartásába" },
      { label: "Amit elsőként kapsz", ch: "Engedély-kártya", at: "Meldezettel", de: "Meldebescheinigung + Steuer-ID", nl: "BSN (mindenhez kell)", gb: "National Insurance Number", es: "NIE + zöld regisztrációs igazolás" },
      { label: "Állampolgárság (jellemzően)", ch: "—", at: "~10 év", de: "5 év", nl: "5 év + inburgering-vizsga", gb: "6 év (5 év + ILR után 12 hónap)", es: "10 év (magyar állampolgárként)" },
      { label: "Magyar állampolgárság megtartható?", ch: "—", at: "Nem — le kell mondani", de: "Igen (2024 óta engedélyezett)", nl: "Fő szabály: nem (kivételekkel)", gb: "Igen", es: "Fő szabály: nem — le kell mondani" },
    ],
  },
  {
    id: "munkavallalas",
    icon: "briefcase",
    caption: "Munka és bér — egy pillantásra",
    intro:
      "⚠️ EU-állampolgárként az öt kontinentális országban engedély nélkül dolgozhatsz — Angliában viszont munkavállalási jogot adó vízum vagy EUSS-státusz kell. A szabadság, a minimálbér és a 13.–14. havi juttatás mindenhol más.",
    slugs: {
      ch: "munkavallalas",
      at: "at-munkavallalas",
      de: "de-munkavallalas",
      nl: "nl-munkavallalas",
      gb: "gb-munkavallalas",
      es: "es-munkavallalas",
    },
    rows: [
      { label: "Munkavállalási engedély", ch: "Nem kell (bejelentkezés után)", at: "Nem kell", de: "Nem kell", nl: "Nem kell (csak BSN)", gb: "⚠️ KELL (vízum vagy EUSS-státusz)", es: "Nem kell (uniós polgárként)" },
      { label: "Törvényi munkaidő", ch: "max. 45 óra/hét", at: "40 óra/hét (sok KV 38,5)", de: "Szerződés / Tarifvertrag szerint", nl: "Szerződés szerint", gb: "átlag 48 óra/hét (egyénileg feloldható)", es: "40 óra/hét (éves átlagban)" },
      { label: "Fizetett szabadság minimum", ch: "4 hét", at: "5 hét (25 munkanap)", de: "min. 20 munkanap", nl: "~20 nap (4× heti óraszám)", gb: "5,6 hét (28 nap, ünnepnapokkal együtt)", es: "30 NAPTÁRI nap (~22 munkanap)" },
      { label: "13.–14. havi fizetés", ch: "Nem jellemző", at: "Igen (14 havi bér szokásos)", de: "Nem törvényi", nl: "8% vakantiegeld (májusban)", gb: "Nem jellemző", es: "Igen — 14 paga szokásos (vagy 12-re elosztva)" },
      { label: "Minimálbér", ch: "Nincs országos (kantoni/GAV)", at: "Kollektívszerződés szerint", de: "~13,90 €/óra (2026)", nl: "~14 €/óra (2025)", gb: "National Living Wage (éves emelés — gov.uk)", es: "SMI — évente kormányrendeletben, 14 pagára" },
    ],
  },
  {
    id: "munkanelkuli",
    icon: "search",
    caption: "Munkanélküli-ellátás — egy pillantásra",
    intro:
      "A hivatal és a jogosultsági minimum országonként más. Az öt kontinentális országban a magyar biztosítási idők U1-igazolással beszámíthatnak; ⚠️ Angliára ez Brexit után nem általánosítható — ott a saját jogosultságodat a DWP-nél kell tisztázni.",
    slugs: {
      ch: "munkanelkuli-biztositas",
      at: "at-munkanelkuli",
      de: "de-munkanelkuli",
      nl: "nl-munkanelkuli",
      gb: "gb-munkanelkuli",
    },
    rows: [
      { label: "Hol igényled", ch: "RAV", at: "AMS", de: "Agentur für Arbeit", nl: "UWV", gb: "gov.uk — DWP (Universal Credit / New Style JSA)", es: "SEPE" },
      { label: "Jogosultsági minimum", ch: "12 hó munka / 2 év", at: "52 hét / 2 év", de: "12 hó / 30 hó", nl: "26 hét / 36 hét", gb: "New Style JSA-hoz NI-járulék-előélet", es: "360 nap járulék / 6 év" },
      { label: "Ellátás mértéke", ch: "—", at: "~55% nettó", de: "~60% nettó (gyerekkel 67%)", nl: "75%, majd 70%", gb: "Fix összegű, NEM bérarányos", es: "A járulékalapból, sávosan csökkenő" },
      { label: "Mikor jelentkezz", ch: "Legkésőbb az 1. ellátásra jogosult napon", at: "Az utolsó munkanap másnapján", de: "A felmondás után max. 3 nap", nl: "Az utolsó munkanap utáni 1 hét", gb: "Amint munkanélkülivé válsz", es: "⚠️ 15 MUNKANAPON belül" },
      { label: "Magyar évek beszámítása", ch: "Igen (U1)", at: "Igen (U1)", de: "Igen (U1)", nl: "Igen (U1)", gb: "—", es: "Igen (U1)" },
    ],
  },
  {
    id: "csaladi-potlek",
    icon: "users",
    caption: "Családi pótlék — egy pillantásra",
    intro:
      "Ha a gyerek Magyarországon él, az öt kontinentális országban EU-koordináció szerint, különbözet-elszámolással jár az ellátás; ⚠️ Angliára ez Brexit után nem általánosítható.",
    slugs: {
      ch: "csaladi-potlek",
      at: "at-csaladi-potlek",
      de: "de-csaladi-potlek",
      nl: "nl-csaladi-potlek",
      gb: "gb-csaladi-potlek",
    },
    rows: [
      { label: "Neve", ch: "Kinderzulage", at: "Familienbeihilfe", de: "Kindergeld", nl: "Kinderbijslag", gb: "Child Benefit", es: "⚠️ Nincs alanyi jogú havi ellátás — adókedvezmény" },
      { label: "Hol igényled", ch: "Munkáltató / pénztár", at: "FinanzOnline (Beih 100)", de: "Familienkasse", nl: "SVB", gb: "gov.uk — HMRC", es: "Agencia Tributaria (az adóbevallásban)" },
      { label: "Kifizetés gyakorisága", ch: "Havonta", at: "Havonta", de: "Havonta", nl: "Negyedévente", gb: "4 hetente", es: "Éves adóelszámolásban (anya-levonás havi is kérhető)" },
      { label: "Ha a gyerek Magyarországon él", ch: "EU-koordináció, különbözet", at: "EU-koordináció, különbözet", de: "EU-koordináció, különbözet", nl: "EU-koordináció, különbözet", gb: "—", es: "EU-koordináció, különbözet" },
    ],
  },
  {
    id: "adozas",
    icon: "document",
    caption: "Adózás és adóbevallás — egy pillantásra",
    intro:
      "A bérből mindenhol vonják az adót (Angliában PAYE néven, ez áll a bérpapíron is) — a különbség, hogy az éves bevallás mikor kötelező, és hol jár vissza gyakran pénz.",
    slugs: {
      ch: "adozas-quellensteuer",
      at: "at-adozas",
      de: "de-adozas",
      nl: "nl-adozas",
      gb: "gb-adozas",
      es: "es-adozas",
    },
    rows: [
      { label: "Bérből vont adó", ch: "Forrásadó (Quellensteuer) — B/L engedéllyel", at: "Lohnsteuer", de: "Lohnsteuer", nl: "Loonheffing", gb: "PAYE + National Insurance", es: "IRPF-előleg (retención) + TB-járulék" },
      { label: "Éves adóbevallás", ch: "C engedéllyel (B/L-nél a forrásadó fedez)", at: "Önkéntes — gyakran visszajár", de: "Gyakran önkéntes — gyakran visszajár", nl: "Jellemzően kötelező (határidő: máj. 1.)", gb: "A legtöbbnek NEM kell; Self Assessment jan. 31.", es: "La Renta — tavasztól nyár elejéig; alacsony jövedelemnél mentesülhetsz" },
      { label: "Online portál", ch: "Kantoni adóhivatal", at: "FinanzOnline", de: "ELSTER", nl: "Mijn Belastingdienst (DigiD)", gb: "gov.uk — Personal Tax Account (HMRC)", es: "AEAT sede electrónica (Cl@ve / tanúsítvány)" },
    ],
  },
  {
    id: "lakasberles",
    icon: "key",
    caption: "Lakásbérlés — egy pillantásra",
    intro:
      "A kaució felső határa és a bérlővédelem országonként más — a hirdetett díj pedig sehol sem a teljes költség.",
    slugs: {
      ch: "lakasberles",
      at: "at-lakasberles",
      de: "de-lakasberles",
      nl: "nl-lakasberles",
      gb: "gb-lakhatas",
      es: "es-lakasberles",
    },
    rows: [
      { label: "Kaució felső határa", ch: "max. 3 havi (nettó) bér", at: "~3 havi (bruttó, bevett)", de: "max. 3 havi hideg bér (Kaltmiete)", nl: "max. 2 havi (2023 óta)", gb: "5 heti bér (50 000 £ éves bér alatt)", es: "1 havi bér (fianza) + korlátozott extra garancia" },
      { label: "A teljes havi költség", ch: "bér + Nebenkosten", at: "bér + Betriebskosten (kérd a Bruttomiete-t)", de: "Warmmiete (Kaltmiete + Nebenkosten)", nl: "kale huur + servicekosten", gb: "Bér + council tax + rezsi", es: "bér + comunidad + IBI/rezsi (szerződés szerint)" },
      { label: "Ingatlanos jutalék a bérlőnek", ch: "—", at: "max. 2 havi (ha rajta keresztül)", de: "Ritkán — a megrendelő fizeti (2015 óta)", nl: "Jellemzően nem (ha a bérbeadónak dolgozik)", gb: "⚠️ Tilos (2019 óta)", es: "⚠️ 2023 óta a TULAJDONOST terheli" },
      { label: "Bérlővédelem / vitarendezés", ch: "Egyeztető hatóság (Schlichtungsbehörde)", at: "MRG + Arbeiterkammer / Mietervereinigung", de: "Mietrecht + Mieterverein", nl: "Huurcommissie / Juridisch Loket", gb: "Kötelező kaució-védelem (TDP) 30 napon belül", es: "LAU + kötelező fianza-letét a közösségnél" },
    ],
  },
  {
    id: "auto",
    icon: "car",
    caption: "Autó és behozatal — egy pillantásra",
    intro:
      "EU-n belül nincs vám, ⚠️ Angliába viszont Brexit óta lehet vám és áfa a behozott autón. A behozatali adók és a műszaki-vizsga rendje egyébként is élesen eltér — Hollandiában a BPM miatt sokszor nem éri meg autót hozni.",
    slugs: {
      ch: "auto-svajcban",
      at: "at-auto",
      de: "de-auto",
      nl: "nl-auto",
      gb: "gb-jogositvany",
      es: "es-kozlekedes-jogositvany",
    },
    rows: [
      { label: "Behozatali teher (magyar autó)", ch: "Vám + import-eljárás (nem EU)", at: "NoVA (normfogyasztási adó)", de: "Nincs vám (EU) — csak regisztráció", nl: "BPM (CO2-alapú — magas lehet!)", gb: "⚠️ Brexit óta vám/áfa lehet — gov.uk", es: "Nincs vám (EU); CO₂-alapú regisztrációs adó lehet" },
      { label: "Forgalomba helyezés", ch: "Kantoni közúti hivatal (Strassenverkehrsamt)", at: "Biztosító Zulassungsstelle-je", de: "Zulassungsstelle", nl: "RDW", gb: "DVLA-regisztráció", es: "DGT (Jefatura Provincial de Tráfico)" },
      { label: "Kötelező felelősségbiztosítás", ch: "Haftpflicht (a regisztráció előtt)", at: "Haftpflicht (előbb, utána rendszám)", de: "Kfz-Haftpflicht (nélküle nincs rendszám)", nl: "WA-verzekering (a be nem biztosított autó bírságolható!)", gb: "Kötelező (ANPR-kamera ellenőrzi)", es: "Seguro obligatorio — kötelező" },
      { label: "Időszakos műszaki vizsga", ch: "MFK", at: "§57a Pickerl (évente)", de: "HU / „TÜV” (2 évente)", nl: "APK (évente)", gb: "MOT, évente (3 évnél idősebb autó)", es: "ITV — a jármű korától függő gyakorisággal" },
    ],
  },
  {
    id: "nyugdij",
    icon: "clock",
    caption: "Nyugdíj — egy pillantásra",
    intro:
      "A fő különbség: Svájc, Ausztria és Németország a bérből vont járulékra épít, Hollandia (AOW) a lakóhelyen töltött évekre, Anglia (State Pension) a National Insurance-évekre.",
    slugs: {
      ch: "ahv-nyugdij",
      at: "at-nyugdij",
      de: "de-nyugdij",
      nl: "nl-nyugdij",
      gb: "gb-nyugdij",
    },
    rows: [
      { label: "Állami pillér", ch: "AHV (1. pillér)", at: "Pensionsversicherung (PVA)", de: "Gesetzliche Rentenversicherung", nl: "AOW", gb: "State Pension", es: "Seguridad Social — pensión de jubilación" },
      { label: "Mi alapján épül", ch: "Bérből vont járulék", at: "Bérből vont járulék", de: "Bérből vont járulék (18,6%, fele-fele)", nl: "Lakóhely — minden itt-töltött év ~2%", gb: "National Insurance-évek (qualifying years)", es: "Bérből vont járulék" },
      { label: "Kiegészítő pillér", ch: "2. foglalkoztatói (22 680 CHF felett kötelező) + 3. magán", at: "Vállalati + magán (opcionális)", de: "Üzemi + magán (opcionális)", nl: "Munkahelyi pensioenfonds (jellemzően kötelező)", gb: "Auto-enrolment munkahelyi nyugdíj", es: "—" },
    ],
  },
  {
    id: "felmondas",
    icon: "send",
    caption: "Felmondás és a jogaid — egy pillantásra",
    intro:
      "A felmondás-védelem országonként nagyon eltér — Németországban és Hollandiában kemény határidők köthetik a kezed, ⚠️ Angliában pedig a valódi védelem jellemzően csak 2 év szolgálati idő után kezdődik.",
    slugs: {
      ch: "felmondas-munkabizonyitvany",
      at: "at-felmondas",
      de: "de-felmondas",
      nl: "nl-felmondas",
    },
    rows: [
      { label: "Felmondási idő (munkáltatói)", ch: "1–3 hó (szolgálati idő szerint)", at: "6 hét – 5 hó (Angestellte)", de: "4 hét, majd a szolg. idővel nő", nl: "Alap 1 hó, szolg. idővel nő", gb: "Szolgálati idő szerint (1 hét/év, max. 12)", es: "A convenio colectivo szerint" },
      { label: "Fő szabály", ch: "Védett időszakokban tilos a felmondás", at: "Erős végkielégítés-rendszer; kérj írásosat", de: "Csak írásban érvényes; Kündigungsschutz véd", nl: "A munkáltató nem mondhat fel egyoldalúan (UWV / bíróság)", gb: "2 év után erősebb védelem (unfair dismissal)", es: "Írásbeli felmondás kötelező; ET + convenio véd" },
      { label: "Ha vitatnál / segítség", ch: "Egyes esetek az egyeztető hatóságnál", at: "Arbeiterkammer — ingyenes jogi segítség", de: "3 HÉTEN belül keresetet kell adni!", nl: "Megállapodásnál 14 nap elállási jog", gb: "ACAS, majd Employment Tribunal", es: "⚠️ 20 MUNKANAPON belül egyeztetési kérelem" },
      { label: "Végkielégítés", ch: "—", at: "Abfertigung Neu (az 1. naptól gyűlik)", de: "Nem automatikus", nl: "Transitievergoeding (az 1. naptól jár)", gb: "Statutory redundancy pay (2 év után)", es: "Indemnización — a jogcímtől és az évektől függ" },
    ],
  },
  {
    id: "vallalkozas",
    icon: "trending",
    caption: "Vállalkozásindítás — egy pillantásra",
    intro:
      "A bejelentés helye, a kötelező társadalombiztosítás és az áfa-küszöb országonként más — a magyar ev./kata sehol nem helyettesíti a helyi bejelentést.",
    slugs: {
      ch: "vallalkozasinditas-svajcban",
      at: "at-vallalkozas",
      de: "de-vallalkozas",
      nl: "nl-vallalkozas",
      gb: "gb-vallalkozas",
      es: "es-autonomo",
    },
    rows: [
      { label: "Legegyszerűbb forma", ch: "Egyéni cég (Einzelfirma)", at: "Gewerbe", de: "Gewerbe vagy Freiberufler", nl: "Eenmanszaak (zzp)", gb: "Sole trader", es: "Autónomo (persona física)" },
      { label: "Hol jelented be", ch: "Kompenzációs pénztár (AHV)", at: "BH / Magistrat vagy WKO Gründerservice", de: "Gewerbeamt (v. Finanzamt szabadfoglalkozásnál)", nl: "KVK (Kamer van Koophandel)", gb: "gov.uk — HMRC (Self Assessment)", es: "AEAT (alta censal) + Seguridad Social (RETA)" },
      { label: "Társadalombiztosítás önállóként", ch: "AHV önálló státusz; nincs munkanélküli (ALV)", at: "SVS (kötelező eü + nyugdíj)", de: "Magadnak kell (GKV önkéntes v. PKV)", nl: "Nincs automatikus táppénz (AOV / broodfonds)", gb: "Class 2 / Class 4 National Insurance", es: "RETA — HAVI cuota a jövedelmi sáv szerint" },
      { label: "Áfa-küszöb", ch: "ÁFA (MWST) 100 000 CHF árbevétel felett", at: "Kleinunternehmer-mentesség a forgalomhatárig", de: "Kleinunternehmerregelung a forgalomhatárig", nl: "KOR a forgalomhatárig", gb: "VAT-regisztrációs küszöb — gov.uk (változhat)", es: "⚠️ Nincs magyar értelemben vett alanyi mentesség" },
    ],
  },
];

/** Slug → a hozzá tartozó összehasonlítás (bármelyik ország cikke a kulcs). */
const BY_SLUG: Map<string, GuideComparison> = (() => {
  const m = new Map<string, GuideComparison>();
  for (const c of GUIDE_COMPARISONS) {
    for (const slug of Object.values(c.slugs)) m.set(slug, c);
  }
  return m;
})();

export function comparisonForSlug(slug: string): GuideComparison | undefined {
  return BY_SLUG.get(slug);
}
