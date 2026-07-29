/**
 * budget-landing.ts — a /mennyi-marad országonkénti SEO-céloldalainak kurált
 * tartalma (cím, leírás, bevezető, FAQ). A FB-csoportos kérdések („X bruttóból
 * meg lehet élni kint?") pontosan kereshető long-tail kifejezések — ezek az
 * oldalak erre a keresési szándékra céloznak, országonként EGYEDI szöveggel
 * (nem sablon-duplikátum). A számok a saját kalkulátor-paraméterekkel
 * konzisztens, „kb."-vel jelölt BECSLÉSEK — tényállítás-fegyelem.
 * Függőség-mentes tiszta adat (SSG page + sitemap is használja).
 */

import type { BudgetCountry } from "./budget-plan";

export interface BudgetLanding {
  slug: string;
  cc: BudgetCountry;
  /** Országnév alanyesetben (cím) és -ban/-ben alakban (mondatok). */
  name: string;
  inName: string;
  flag: string;
  title: string;
  description: string;
  intro: string;
  faq: { q: string; a: string }[];
}

export const BUDGET_LANDINGS: BudgetLanding[] = [
  {
    slug: "nemetorszag",
    cc: "DE",
    name: "Németország",
    inName: "Németországban",
    flag: "🇩🇪",
    title: "Németországi nettó bér és megélhetés kalkulátor",
    description:
      "Mennyi marad a német fizetésedből? Bruttó bér + Steuerklasse + család + város → nettó, Kindergeld, lakbér és megélhetés — ami a hónap végén marad. Ingyenes kalkulátor.",
    intro:
      "A német nettó bér a Steuerklasse-tól (adóosztály), a járulékoktól és a gyerekek számától függ — a megélhetés pedig leginkább attól, melyik tartományban élsz. Ez a kalkulátor egyben számolja a kettőt: add meg az ajánlatot és a családot, és megmutatjuk, mennyi maradhat a hónap végén.",
    faq: [
      {
        q: "Mennyi a nettó 3000 € bruttóból Németországban?",
        a: "Steuerklasse I-ben, gyerek nélkül kb. 2050–2150 € a nettó (2025-ös adó- és járulék-szintekkel számolt becslés). Házas fő keresőként (Steuerklasse III) érezhetően több marad. A kalkulátor a te adataiddal, régióddal számol.",
      },
      {
        q: "Meg lehet élni Németországban egy fizetésből, 2 gyerekkel?",
        a: "Sok családnak igen: a III-as adóosztály és a gyerekenként kb. 259 € Kindergeld (2026) sokat javít a képen — a döntő tényező a lakbér-régió. A kalkulátor tételesen megmutatja, mennyi maradna a hónap végén.",
      },
      {
        q: "Mi az a Steuerklasse, és melyik vonatkozik rám?",
        a: "A német béradó-osztály: I — egyedülálló; II — egyedülálló, gyerekkel; III — házas, fő kereső; IV — házas, hasonló keresetű felek. A kalkulátorban átkapcsolható, és azonnal látod a különbséget.",
      },
      {
        q: "Mennyi a lakbér Németországban?",
        a: "Tartományonként nagyon eltér — Münchenben a többszöröse lehet a keleti tartományokénak. A kalkulátor a kint élő magyarok anonim beküldésein és referencia-szinteken alapuló medián lakbérrel számol, tartomány- és szobaszám-szinten.",
      },
    ],
  },
  {
    slug: "ausztria",
    cc: "AT",
    name: "Ausztria",
    inName: "Ausztriában",
    flag: "🇦🇹",
    title: "Ausztriai nettó bér és megélhetés kalkulátor",
    description:
      "Mennyi marad az osztrák fizetésedből? Bruttó bér + 13./14. havi + család + tartomány → nettó, Familienbeihilfe, lakbér és megélhetés. Ingyenes kalkulátor.",
    intro:
      "Ausztriában a bérhez szinte mindig jár a 13. és 14. havi fizetés (Urlaubs- és Weihnachtsgeld), kedvezményes adózással — az összevetésnél ezt sokan elfelejtik. A kalkulátor a teljes éves nettót osztja havi átlagra, és levonja belőle a tartományod tipikus lakbérét és megélhetését.",
    faq: [
      {
        q: "Mennyi a nettó 2500 € bruttóból Ausztriában?",
        a: "Kb. 1850–1950 € havonta (2025-ös SV- és Lohnsteuer-szintekkel számolt becslés) — plusz a 13. és 14. havi fizetés, ami éves szinten érezhetően javítja az átlagot. A kalkulátor mindezt egyben mutatja.",
      },
      {
        q: "Mit jelent a 13. és 14. havi fizetés?",
        a: "Az Urlaubsgeld (nyári) és a Weihnachtsgeld (karácsonyi) különjuttatás — a kollektív szerződések alapján szinte minden alkalmazottnak jár, és kedvezményesen adózik. A kalkulátor havi átlagba szétosztva számolja, így reális képet kapsz.",
      },
      {
        q: "Mennyi családi támogatás jár Ausztriában?",
        a: "A Familienbeihilfe korfüggő, a Kinderabsetzbetraggal együtt gyerekenként kb. 230 €/hó (becslés), emellett a Familienbonus Plus az adót is csökkenti. A kalkulátor mindkettőt figyelembe veszi.",
      },
      {
        q: "Bécsben vagy vidéken olcsóbb megélni?",
        a: "A lakbér Bécsben jellemzően magasabb, de a nyugati tartományok (Tirol, Vorarlberg, Salzburg) sem olcsók. A kalkulátor tartomány-szintű medián lakbérrel számol, így össze tudod hasonlítani a helyszíneket.",
      },
    ],
  },
  {
    slug: "svajc",
    cc: "CH",
    name: "Svájc",
    inName: "Svájcban",
    flag: "🇨🇭",
    title: "Svájci nettó bér és megélhetés kalkulátor",
    description:
      "Mennyi marad a svájci fizetésedből? Bruttó bér + kanton (Quellensteuer) + család → nettó, Krankenkasse, lakbér és megélhetés. Ingyenes kalkulátor.",
    intro:
      "Svájcban magas a bér — de az adó kantononként eltér (Quellensteuer), az egészségbiztosítás (Krankenkasse) nem a bérből megy, hanem külön havidíj, és a lakbér is a legmagasabbak közt van Európában. Ezért a „mennyi marad?” kérdésre csak kanton-szintű számítás ad valós választ — ez a kalkulátor pontosan azt csinálja.",
    faq: [
      {
        q: "Mennyi a nettó 5500 CHF bruttóból Svájcban?",
        a: "Kantontól függően kb. 4300–4600 CHF (forrásadós becslés, egyedülállóként) — Zugban kevesebb az adó, Neuchâtelben több. A kalkulátor a kantonod kulcsával és a családi állapotoddal számol.",
      },
      {
        q: "Miért függ a svájci nettó a kantontól?",
        a: "A külföldi munkavállalók bérét jellemzően forrásadó (Quellensteuer) terheli, aminek kulcsa kantononként és családi állapotonként eltér. Ugyanaz a bruttó két kantonban több száz frank nettó-különbséget jelenthet.",
      },
      {
        q: "Mennyibe kerül a Krankenkasse Svájcban?",
        a: "Az egészségbiztosítás nem a bérből vonódik: külön havidíj, felnőttenként kb. 390 CHF, gyerekenként kb. 110 CHF (átlagos alapprémium, becslés). A kalkulátor költségként beszámítja — sok összehasonlítás ezt kihagyja, és torz képet ad.",
      },
      {
        q: "Magas svájci bérből mennyi marad valójában?",
        a: "A magas bruttót magas megélhetés kíséri — a lakbér és a Krankenkasse a két legnagyobb tétel. Tipikusan így is több marad, mint a környező országokban, de a pontos számhoz kanton-szintű kalkuláció kell: erre való ez az eszköz.",
      },
    ],
  },
  {
    slug: "hollandia",
    cc: "NL",
    name: "Hollandia",
    inName: "Hollandiában",
    flag: "🇳🇱",
    title: "Hollandiai nettó bér és megélhetés kalkulátor",
    description:
      "Mennyi marad a holland fizetésedből? Bruttó bér + vakantiegeld + 30%-ruling + család → nettó, lakbér és megélhetés. Ingyenes kalkulátor.",
    intro:
      "A holland nettót a sávos adó mellett két jóváírás (algemene heffingskorting, arbeidskorting) alakítja, a bérhez 8% vakantiegeld jár, az expat-oknak pedig szólhat a 30%-ruling adókedvezmény. A kalkulátor mindezt kezeli, és a provincia-szintű lakbér-mediánnal együtt mutatja, mennyi marad a hónap végén.",
    faq: [
      {
        q: "Mennyi a nettó 3000 € bruttóból Hollandiában?",
        a: "Kb. 2350–2450 € (2025-ös sávokkal és jóváírásokkal számolt becslés, vakantiegelddel együtt havi átlagban). A kalkulátor a te adataiddal számol, a 30%-rulinggal is, ha jogosult vagy.",
      },
      {
        q: "Mi az a 30%-ruling?",
        a: "Külföldről érkező munkavállalók adókedvezménye: a bér legfeljebb 30%-a adómentesen fizethető, engedélyhez és bérküszöbhöz kötött. Ha megkapod, a nettód jelentősen nő — a kalkulátorban egy kapcsolóval bekapcsolható.",
      },
      {
        q: "Mi az a vakantiegeld?",
        a: "Kötelező szabadságpénz: az éves bruttó 8%-a, jellemzően májusban fizetik. A kalkulátor havi átlagba szétosztva számolja, így a valós havi keretedet látod.",
      },
      {
        q: "Jár-e családi pótlék Hollandiában?",
        a: "Igen, a kinderbijslag korfüggő, negyedévente fizetett juttatás — havi átlagban kb. 115 €/gyerek (becslés); a jövedelemfüggő kindgebonden budget ezen felül jöhet. A kalkulátor a kinderbijslaggal számol.",
      },
    ],
  },
  {
    slug: "anglia",
    cc: "GB",
    name: "Anglia",
    inName: "Angliában",
    flag: "",
    title: "Angliai nettó bér és megélhetés kalkulátor",
    description:
      "Mennyi marad az angol fizetésedből? Bruttó bér + PAYE + National Insurance + család → nettó, lakbér és megélhetés. Ingyenes kalkulátor.",
    intro:
      "Az angol nettót a PAYE-adó és a National Insurance alakítja, a Personal Allowance (12 570 £) pedig adómentes keretet ad. ⚠️ Két dolog, ami meglepi az érkezőket: az adóév április 6-tól április 5-ig tart (nem naptári év), és nincs havi egészségbiztosítási díj — az NHS-t az adó fedezi. Cserébe a council tax a lakót terheli. A kalkulátor mindezt kezeli, és a régió-szintű lakbér-mediánnal együtt mutatja, mennyi marad a hónap végén.",
    faq: [
      {
        q: "Mennyi a nettó 3000 £ bruttóból Angliában?",
        a: "Kb. 2400–2450 £ havonta (2025/26-os sávokkal, nyugdíj nélkül számolt becslés). A kalkulátor a te adataiddal számol, az auto-enrolment nyugdíjjal és a diákhitellel is, ha releváns.",
      },
      {
        q: "Mikor kezdődik a brit adóév?",
        a: "Április 6-tól a következő április 5-ig — nem naptári év. Ez fontos a bevallásnál és a tax code-nál is: a P60-at az adóév végén kapod meg.",
      },
      {
        q: "Kell külön egészségbiztosítást fizetnem?",
        a: "Nem. Az NHS adóból finanszírozott, a használat pontján ingyenes — nincs havi biztosítási díj, mint Svájcban vagy Hollandiában. Vízumos érkezőknél viszont a kérelemkor egyszeri IHS-t (~1035 £/év) kell előre fizetni.",
      },
      {
        q: "Mi az a council tax, és ki fizeti?",
        a: "A helyi önkormányzatnak fizetett éves adó (szemétszállítás, közszolgáltatások), jellemzően 10-12 részletben. A LAKÓ fizeti, nem a tulajdonos. Egyedül élőként 25% kedvezmény jár, teljes idős hallgatóként jellemzően mentesség — de igényelni kell.",
      },
      {
        q: "Jár-e családi pótlék Angliában?",
        a: "Igen, a Child Benefit: az első gyerekre magasabb, a többire alacsonyabb összeg (havi átlagban kb. 90 £/gyerek becslés). ⚠️ Magas jövedelemnél fokozatosan visszaadózzák (High Income Child Benefit Charge).",
      },
    ],
  },
  {
    slug: "spanyolorszag",
    cc: "ES",
    name: "Spanyolország",
    inName: "Spanyolországban",
    flag: "🇪🇸",
    title: "Spanyolországi nettó bér és megélhetés kalkulátor",
    description:
      "Mennyi marad a spanyol fizetésedből? Bruttó bér + IRPF + Seguridad Social + család → nettó, lakbér és megélhetés. Ingyenes kalkulátor.",
    intro:
      "A spanyol nettót az IRPF (személyi jövedelemadó) és a Seguridad Social munkavállalói járuléka alakítja. ⚠️ Két dolog, ami meglepi az érkezőket: a fizetést gyakran 14 részletben adják (12 havi + nyári és karácsonyi extra), ezért ugyanaz az éves bér havi szinten egészen máshogy néz ki — és az IRPF fele az autonóm közösségé, tehát Madridban és Katalóniában eltér a nettó. A tervező a havi ÁTLAGGAL számol (a két extra fizetést szétosztva), mert a lakbért és a rezsit ebből kell fedezni.",
    faq: [
      {
        q: "Mennyi a nettó 24 000 € bruttóból Spanyolországban?",
        a: "Kb. 19 200 € évente, ami havi átlagban kb. 1600 € (2025-ös sávokkal, referencia-kulccsal számolt becslés). 14 pagás felosztásnál a bérpapíron ennél kevesebb, kb. 1370 € szerepel — júliusban és decemberben viszont ennek a duplája érkezik.",
      },
      {
        q: "Mit jelent a 12 és a 14 paga?",
        a: "Azt, hány részletben fizetik ki az éves bért. A 14 pagás modellben 12 havi fizetés mellé jön egy nyári és egy karácsonyi extra; a 12 pagásban ugyanaz az összeg egyenlően eloszlik. Nem több pénz, csak más eloszlás — de a havi költségvetést teljesen átírja, ezért állásinterjún érdemes rákérdezni.",
      },
      {
        q: "Miért függ a nettó attól, hol lakom?",
        a: "Mert az IRPF egyik fele állami, a másik fele az autonóm közösségé, és a közösségek maguk állapítják meg a sajátjukat. Emiatt azonos bruttónál Madridban valamivel több, Katalóniában valamivel kevesebb nettó marad. A kalkulátor a referencia-kulccsal számol — a pontos összeget az Agencia Tributaria hivatalos kalkulátora adja.",
      },
      {
        q: "Kell külön egészségbiztosítást fizetnem?",
        a: "Nem. A közellátást a Seguridad Social járulék fedezi, nincs havi biztosítási díj, mint Svájcban vagy Hollandiában. ⚠️ Az egészségügyi kártyát viszont az autonóm közösséged adja ki, és ehhez előbb empadronamiento (lakcím-bejelentés) kell.",
      },
      {
        q: "Jár-e családi pótlék Spanyolországban?",
        a: "⚠️ Nincs a magyarhoz vagy a némethez hasonló, alanyi jogon járó havi családi pótlék. A gyerek utáni támogatás jellemzően az adórendszeren keresztül érkezik (adóalap-csökkentő minimum, dolgozó anyák levonása), és több autonóm közösség ad saját kiegészítést. Emellett létezik rászorultsági alapú gyermektámogatás is. Ezért a tervező NEM ír be becsült havi családi pótlékot — az hamis biztonságot adna.",
      },
      {
        q: "Mennyi a megélhetés Spanyolországban?",
        a: "Az élelmiszer és a tömegközlekedés érzékelhetően olcsóbb, mint Nyugat-Európa nagy részén; a lakbér viszont Madridban, Barcelonában és a tengerparti üdülőövezetekben magas. A tervező a te régiód lakbér-mediánjával számol, és minden költség-sort felülírhatsz a saját összegeddel.",
      },
    ],
  },
];

export function budgetLandingBySlug(slug: string): BudgetLanding | null {
  return BUDGET_LANDINGS.find((l) => l.slug === slug) ?? null;
}
