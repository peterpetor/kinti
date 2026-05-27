/**
 * Tudásbázis — útmutatók kint élő magyaroknak. A tartalom HIVATALOS svájci
 * forrásokból (ch.ch, bag.admin.ch) származik, minden cikk végén citálva.
 *
 * FONTOS: ez általános tájékoztatás, NEM jogi tanács. A részletek kantononként
 * és időben változnak — mindig ellenőrizd a hivatalos forrást és a lakóhelyed
 * kantonjának oldalát.
 */

import type { IconName } from "@/components/ui";

export interface GuideSource {
  label: string;
  url: string;
}

export interface GuideSection {
  heading: string;
  body?: string[];
  bullets?: string[];
}

export interface Guide {
  slug: string;
  title: string;
  summary: string;
  icon: IconName;
  sections: GuideSection[];
  sources: GuideSource[];
}

export const GUIDES_DISCLAIMER =
  "Ez általános tájékoztatás hivatalos forrásokból, nem jogi tanács. A részletek kantononként és időben változnak — a pontos, rád vonatkozó információért mindig a hivatalos oldalt és a lakóhelyed kantonját nézd.";

export const GUIDES: Guide[] = [
  {
    slug: "bejelentkezes-letelepedes",
    title: "Bejelentkezés és letelepedés",
    summary:
      "Költözés után 14 napon belül be kell jelentkezned a községnél, és 3 hónapnál hosszabb tartózkodáshoz engedély kell.",
    icon: "home",
    sections: [
      {
        heading: "Bejelentkezés a községnél (14 nap)",
        body: [
          "Ha Svájcba költözöl (vagy belföldön másik községbe), a lakóhelyed szerinti községi hivatalnál (Gemeinde / commune / comune) 14 napon belül be kell jelentkezned.",
          "Sok helyen online is intézhető az eMovingCH szolgáltatással.",
        ],
      },
      {
        heading: "Tartózkodási engedély",
        body: [
          "Ha 3 hónapnál tovább maradsz Svájcban, tartózkodási engedély szükséges. Magyar állampolgárként (EU/EFTA) a személyek szabad mozgásáról szóló megállapodás vonatkozik rád.",
          "Munkát csak azután kezdhetsz, hogy bejelentkeztél a községi hatóságnál.",
        ],
      },
      {
        heading: "Engedélytípusok",
        bullets: [
          "L – rövid távú tartózkodási engedély",
          "B – (huzamos) tartózkodási engedély",
          "C – letelepedési engedély",
          "G – határ menti ingázó engedély",
        ],
      },
    ],
    sources: [
      {
        label: "ch.ch – Kijelentkezés és bejelentkezés (költözés)",
        url: "https://www.ch.ch/en/housing/moving/notification-of-departure-and-registration/",
      },
      {
        label: "ch.ch – Svájci tartózkodási engedélyek",
        url: "https://www.ch.ch/en/documents-and-register-extracts/permits-for-living-in-switzerland/",
      },
      {
        label: "ch.ch – Munkavállalás külföldiként",
        url: "https://www.ch.ch/en/foreign-nationals-in-switzerland/working-in-switzerland/",
      },
    ],
  },
  {
    slug: "egeszsegbiztositas-krankenkasse",
    title: "Egészségbiztosítás (Krankenkasse)",
    summary:
      "Az alapbiztosítás mindenkinek kötelező, aki Svájcban lakik — az érkezéstől számított 3 hónapon belül meg kell kötnöd.",
    icon: "heart",
    sections: [
      {
        heading: "Kötelező alapbiztosítás",
        body: [
          "Az alapbiztosítás (hivatalos néven kötelező egészségbiztosítás, KVG / LAMal) mindenki számára kötelező, aki Svájcban lakik.",
          "Az érkezésedtől számított 3 hónapon belül meg kell kötnöd. A fedezet visszamenőleg az érkezés napjától él, így ez alatt a 3 hónap alatt is biztosítva vagy.",
        ],
      },
      {
        heading: "Szabad biztosító-választás",
        body: [
          "Bármelyik engedélyezett biztosítónál megkötheted. Az alapbiztosításnál a biztosító mindenkit köteles felvenni — kortól és egészségi állapottól függetlenül, kizárás és várakozási idő nélkül.",
          "Az alap- és a (nem kötelező) kiegészítő biztosítást akár külön biztosítóknál is tarthatod.",
        ],
      },
      {
        heading: "Ugyanaz a szolgáltatás, eltérő díj",
        body: [
          "Az alapbiztosítás szolgáltatásai minden biztosítónál azonosak, de a havi díj (prémium) biztosítónként és kantononként eltér.",
          "Érdemes összehasonlítani a hivatalos díjkalkulátorral, mielőtt választasz.",
        ],
      },
    ],
    sources: [
      {
        label: "BAG (Szövetségi Egészségügyi Hivatal) – Biztosítási kötelezettség",
        url: "https://www.bag.admin.ch/en/health-insurance-requirement-to-obtain-insurance-for-persons-resident-in-switzerland",
      },
      {
        label: "BAG – Egészségbiztosítás: a lényeg röviden",
        url: "https://www.bag.admin.ch/en/health-insurance-key-points-in-brief",
      },
      {
        label: "priminfo.admin.ch – Hivatalos prémium-összehasonlító",
        url: "https://www.priminfo.admin.ch/",
      },
    ],
  },
  {
    slug: "adozas-quellensteuer",
    title: "Adózás és adóbevallás",
    summary:
      "B/L engedéllyel a munkáltató forrásadót von le; C engedéllyel rendes adóbevallást adsz be, mint a svájciak.",
    icon: "trending",
    sections: [
      {
        heading: "Forrásadó (Quellensteuer)",
        body: [
          "Ha B vagy L engedélyed van (nincs C engedélyed, és nincs svájci vagy C-engedélyes házastársad), a munkáltatód minden hónapban levonja a forrásadót a fizetésedből, és befizeti a kantoni adóhatóságnak.",
          "Ez a levonás fedezi a szövetségi, a kantoni és a községi jövedelemadódat.",
        ],
      },
      {
        heading: "Adóbevallás",
        body: [
          "C (letelepedési) engedéllyel — vagy ha a házastársad svájci, illetve C engedélyes — ugyanazt az adóbevallást adod be, mint a svájci állampolgárok.",
          "A bevallásra általában van egy határidő (a nyomtatványon szerepel); ha kell, hosszabbítás kérhető.",
        ],
      },
      {
        heading: "Kantononként eltér",
        body: [
          "Az adó mértéke és a részletek kantononként és községenként különböznek — a pontos adatokért a lakóhelyed kantoni adóhivatalát nézd.",
        ],
      },
    ],
    sources: [
      {
        label: "ch.ch – Forrásadó Svájcban",
        url: "https://www.ch.ch/en/foreign-nationals-in-switzerland/living-in-switzerland/tax-at-source/",
      },
      {
        label: "ch.ch – Adóbevallás kitöltése",
        url: "https://www.ch.ch/en/taxes-and-finances/tax-return/",
      },
    ],
  },
  {
    slug: "iskola-es-gyerek",
    title: "Iskola és gyerek",
    summary:
      "A kötelező oktatás 11 év és ingyenes; a gyerekek kb. 4 évesen kezdik, a beiratkozás határideje általában július 31.",
    icon: "users",
    sections: [
      {
        heading: "Kötelező, ingyenes oktatás",
        body: [
          "A kötelező oktatás 11 évig tart, és minden gyerek számára ingyenes.",
          "A gyerekek általában 4 évesen kezdik (óvoda / Kindergarten / első tanulási ciklus).",
        ],
      },
      {
        heading: "Beiratkozás",
        body: [
          "A beiratkozás határideje általában július 31. — aki addig betölti a megfelelő kort, a nyári szünet után kezdi.",
          "A beiratkozást a lakóhelyed szerinti községnél / a helyi iskolánál intézed.",
        ],
      },
      {
        heading: "Kantononként szervezve",
        body: [
          "Az iskolarendszert az egyes kantonok szervezik, így a részletek (oktatási nyelv, struktúra, korhatár) kantononként eltérnek.",
        ],
      },
    ],
    sources: [
      {
        label: "ch.ch – Óvoda és kötelező oktatás",
        url: "https://www.ch.ch/en/school-and-education/compulsory-education/school-and-kindergarten/",
      },
      {
        label: "ch.ch – Mikor kezdik a gyerekek az iskolát?",
        url: "https://www.ch.ch/en/start-school/",
      },
      {
        label: "ch.ch – A kötelező oktatás hossza és felépítése",
        url: "https://www.ch.ch/en/length-compulsory-schooling/",
      },
    ],
  },
  {
    slug: "munkavallalas",
    title: "Munkavállalás Svájcban",
    summary:
      "Heti max. 45 óra a legtöbb ágazatban, évi minimum 4 hét szabadság, alapból 1 hónap próbaidő — a részleteket a munkaszerződés adja.",
    icon: "trending",
    sections: [
      {
        heading: "Munkaszerződés és kollektív szerződés",
        body: [
          "A munkafeltételeidet a munkaszerződés rögzíti. Sok ágazatban kollektív szerződés (GAV / CCT) is van, ami minimálbért és minimumfeltételeket határoz meg.",
          "Ahol nincs kollektív szerződés, ott szövetségi vagy kantoni hatóság írhat elő normál (standard) munkaszerződést kötelező minimálbérrel.",
        ],
      },
      {
        heading: "Munkaidő",
        body: [
          "A heti munkaóráidat a szerződés adja. A törvényi felső határ a legtöbb dolgozónál (ipar, irodai, technikai, valamint a nagy kiskereskedelmi eladók) heti 45 óra.",
        ],
      },
      {
        heading: "Szabadság és ünnepnapok",
        body: [
          "Minden dolgozónak évente legalább 4 hét szabadság jár.",
          "Egyetlen országos ünnepnap van: augusztus 1. A kantonok ezen felül legfeljebb 8 további ünnepnapot határozhatnak meg, ami kantononként eltér.",
        ],
      },
      {
        heading: "Próbaidő és felmondás",
        body: [
          "Határozatlan idejű szerződésnél a próbaidő alapból 1 hónap (a szerződésben rövidebb vagy hosszabb is lehet, legfeljebb 3 hónap).",
          "A próbaidő alatt mindkét félnek 7 naptári nap a felmondási ideje.",
        ],
      },
    ],
    sources: [
      {
        label: "ch.ch – Munkavállalás külföldiként",
        url: "https://www.ch.ch/en/foreign-nationals-in-switzerland/working-in-switzerland/",
      },
      {
        label: "ch.ch – Munkaszerződés és kollektív szerződések",
        url: "https://www.ch.ch/en/work/employment-contract-and-collective-agreements/",
      },
      {
        label: "ch.ch – Szabadság és ünnepnapok",
        url: "https://www.ch.ch/en/work/working-hours/vacation--public-holidays-and-absences-from-work/",
      },
      {
        label: "ch.ch – Munkaviszony megszüntetése (felmondás)",
        url: "https://www.ch.ch/en/work/termination-or-dismissal/",
      },
    ],
  },
  {
    slug: "bankszamla",
    title: "Bankszámla nyitása",
    summary:
      "Bármelyik banknál nyithatsz számlát; a betétek bankonként és ügyfelenként 100 000 CHF-ig törvényileg védettek.",
    icon: "send",
    sections: [
      {
        heading: "Mire lesz szükséged (általában)",
        body: [
          "A feltételeket a bankok maguk szabják meg, de a számlanyitáshoz általában érvényes személyazonosító okmány (útlevél / személyi), a svájci tartózkodási engedélyed és egy lakcímigazolás kell.",
          "Több bank közül választhatsz (pl. posta / PostFinance, kantoni bankok, nagybankok) — a díjak és feltételek bankonként eltérnek, érdemes összehasonlítani.",
        ],
      },
      {
        heading: "Betétvédelem (100 000 CHF)",
        body: [
          "A svájci betétvédelem törvényileg szabályozott: a számládon lévő pénz ügyfelenként és bankonként 100 000 CHF-ig védett.",
          "Minden Svájcban fiókot működtető bank köteles tagja lenni az esisuisse betétbiztosítási rendszernek; a bankokat a FINMA (pénzügyi felügyelet) felügyeli.",
        ],
      },
    ],
    sources: [
      {
        label: "esisuisse – A svájci banki betétek védelme",
        url: "https://www.esisuisse.ch/en/deposit-insurance/protection-of-swiss-bank-deposits",
      },
      {
        label: "FINMA – Betétvédelem",
        url: "https://www.finma.ch/en/supervision/banks-and-securities-firms/depositor-protection/",
      },
    ],
  },
  {
    slug: "ahv-nyugdij",
    title: "Nyugdíj és AHV",
    summary:
      "Három pillér: az 1. (AHV, állami) kötelező; a 2. (foglalkoztatói) évi kb. 22 680 CHF kereset felett kötelező; a 3. önkéntes magánmegtakarítás.",
    icon: "clock",
    sections: [
      {
        heading: "A három pillér",
        body: [
          "A svájci nyugdíjrendszer három pillérből áll: 1. pillér – állami (AHV / AVS), 2. pillér – foglalkoztatói, 3. pillér – önkéntes magánmegtakarítás.",
        ],
      },
      {
        heading: "1. pillér – AHV (állami)",
        body: [
          "Az 1. pillér (öregségi és hozzátartozói biztosítás, AHV / OASI) kötelező, és az alapszükségletek fedezésére szolgál nyugdíjas korban.",
          "A nyugdíjkorhatárig kötelező AHV-járulékot fizetni. Egyedülállónál a minimális öregségi nyugdíj jelenleg havi 1 260 CHF, a maximális 2 520 CHF.",
        ],
      },
      {
        heading: "2. pillér – foglalkoztatói",
        body: [
          "A 2. pillér kiegészíti az államit. Akkor kötelező, ha fix munkaviszonyban évente legalább 22 680 CHF-et keresel.",
          "A 2. pillér nyugdíjad a munkás éveid alatt befizetett járulékokból és a nyugdíjpénztárad szabályzata szerint áll össze.",
        ],
      },
      {
        heading: "3. pillér – magán",
        body: [
          "A 3. pillér önkéntes magánmegtakarítás (3a / 3b), ami adókedvezménnyel egészítheti ki az első két pillért.",
        ],
      },
    ],
    sources: [
      {
        label: "ch.ch – Öregségi és hozzátartozói biztosítás (AHV)",
        url: "https://www.ch.ch/en/insurance/old-age-pension/old-age-pension-system/",
      },
      {
        label: "ch.ch – AHV-járulékok fizetése",
        url: "https://www.ch.ch/en/retirement/old-age-pension/the-first-pillar/oasi-contributions/",
      },
      {
        label: "ch.ch – A 2. pillér",
        url: "https://www.ch.ch/en/retirement/old-age-pension/the-2nd-pillar/",
      },
      {
        label: "ahv-iv.ch – OASI/DI információs központ",
        url: "https://www.ahv-iv.ch/en/",
      },
    ],
  },
  {
    slug: "magyar-kepviselet",
    title: "Magyar képviselet és vészhelyzet",
    summary:
      "Konzuli ügyek a berni magyar nagykövetségen (előzetes időpontfoglalással); vészhelyzetben Svájcban a 112 a központi segélyhívó.",
    icon: "flag",
    sections: [
      {
        heading: "Magyarország Nagykövetsége, Bern",
        body: [
          "A konzuli ügyeket (útlevél, okmányok, állampolgári segítségnyújtás) a berni magyar nagykövetség intézi.",
          "Az ügyfélfogadás kizárólag előzetes időpontfoglalással történik a Külgazdasági és Külügyminisztérium központi Konzinfo rendszerén keresztül. A pontos elérhetőséget és nyitvatartást a nagykövetség hivatalos oldalán találod.",
        ],
      },
      {
        heading: "Vészhelyzeti segélyhívók Svájcban",
        bullets: [
          "112 – általános európai segélyhívó",
          "117 – rendőrség",
          "144 – mentő",
          "118 – tűzoltóság",
          "1414 – Rega (légi mentés)",
        ],
      },
    ],
    sources: [
      {
        label: "Magyarország Nagykövetsége, Bern – hivatalos oldal",
        url: "https://bern.mfa.gov.hu/",
      },
      {
        label: "Nagykövetség – Elérhetőségek",
        url: "https://bern.mfa.gov.hu/page/elerhetoseg",
      },
    ],
  },
  {
    slug: "csaladi-potlek",
    title: "Családi pótlék (Kinderzulage)",
    summary:
      "Gyerekenként havi 215 CHF (0–16 év), tanuló gyereknél 268 CHF (max. 25 évig) — alkalmazottként a munkáltatón keresztül igényled.",
    icon: "users",
    sections: [
      {
        heading: "Kinek jár",
        body: [
          "Akkor jár családi pótlék, ha alkalmazott vagy önálló vállalkozó vagy, illetve ha nem dolgozol, de alacsony az adóköteles jövedelmed (a határ kantononként eltér).",
          "Ha regisztrált munkanélküli vagy, családi pótlék helyett a munkanélküli-ellátáshoz kapsz pótlékot.",
        ],
      },
      {
        heading: "Összegek",
        body: [
          "Havi 215 CHF minden 0–16 éves gyerek után (egészségügyi ok miatt nem dolgozó gyereknél 20 éves korig).",
          "Tanuló gyerek után 25 éves korig havi 268 CHF. Egyes kantonokban (és egyes munkáltatóknál) ennél több is lehet, és születéskor/örökbefogadáskor külön juttatás is járhat.",
        ],
      },
      {
        heading: "Hogyan igényled",
        bullets: [
          "Alkalmazottként: a munkáltatódtól kéred — ő intézi a családi pótlék pénztáránál, és a fizetéseddel együtt fizeti ki.",
          "Önálló vállalkozóként: a saját családi pótlék pénztáradnál igényled.",
          "Ha nem dolgozol: a kantoni kiegyenlítő pénztárnál (AHV) igényled.",
        ],
      },
      {
        heading: "Visszamenőleg",
        body: [
          "Ha lemaradtál róla vagy nem tudtál róla, akár 5 évre visszamenőleg is igényelheted.",
        ],
      },
    ],
    sources: [
      {
        label: "ch.ch – Családi pótlék Svájcban",
        url: "https://www.ch.ch/en/family-and-partnership/maternity-and-paternity/pregnancy-and-birth/family-allowance/",
      },
    ],
  },
  {
    slug: "munkanelkuli-biztositas",
    title: "Munkanélküli biztosítás (ALV)",
    summary:
      "Munkanélküliség esetén jelentkezz a RAV-nál; ellátás jár, ha 2 éven belül legalább 12 hónapot dolgoztál Svájcban.",
    icon: "search",
    sections: [
      {
        heading: "Jelentkezés a RAV-nál",
        body: [
          "Munkanélküliség esetén minél hamarabb jelentkezz be a regionális munkaügyi központban (RAV) — legkésőbb az első napon, amelytől ellátást szeretnél.",
          "A bejelentkezés online vagy személyesen is megtehető; a RAV-nál te magad jelented be a munkanélküliséget.",
        ],
      },
      {
        heading: "Kinek jár ellátás",
        bullets: [
          "Aki a bejelentkezés előtti 2 évben legalább 12 hónapot dolgozott (járulékot fizetett) Svájcban.",
          "Részben vagy teljesen munkanélküli, Svájcban lakik, és befejezte a kötelező oktatást.",
          "Az ellátás a nyugdíjkorhatárig jár.",
        ],
      },
      {
        heading: "Fontos tudnivalók",
        body: [
          "Az önálló vállalkozók nem fizetnek ALV-járulékot, így nem jogosultak munkanélküli-ellátásra.",
          "Külföldiként B vagy C engedély kell az ellátás igényléséhez. A határ menti ingázók általában a lakóhelyük országából kapják az ellátást, de a RAV szolgáltatásait igénybe vehetik álláskereséshez.",
        ],
      },
    ],
    sources: [
      {
        label: "ch.ch – Munkanélküliség Svájcban",
        url: "https://www.ch.ch/en/insurance/unemployment-insurance/",
      },
      {
        label: "arbeit.swiss – Bejelentkezés (RAV)",
        url: "https://www.arbeit.swiss/secoalv/en/home/menue/stellensuchende/arbeitslos-was-tun-/anmeldung.html",
      },
    ],
  },
  {
    slug: "jogositvany-atiras",
    title: "Jogosítvány átírása",
    summary:
      "Külföldi jogsival 12 hónapig vezethetsz; utána svájci jogosítványra kell cserélni — EU/EGT (így magyar) jogsi vizsga nélkül.",
    icon: "nav",
    sections: [
      {
        heading: "12 hónapos türelmi idő",
        body: [
          "Ha Svájcban laksz, a külföldi jogosítványoddal 12 hónapig vezethetsz. Utána svájci jogosítványra kell cserélned.",
          "A határidő után is lecserélheted, de előfordulhat, hogy bírságot kell fizetned.",
        ],
      },
      {
        heading: "A csere menete",
        body: [
          "Minden esetben be kell mutatnod az eredeti jogosítványodat, és egy látásvizsgálaton is részt kell venned.",
          "A folyamat attól függ, melyik ország állította ki a jogsidat.",
        ],
      },
      {
        heading: "EU/EGT vs. egyéb országok",
        bullets: [
          "EU/EGT jogsi (így a magyar is): vezetési vizsga nélkül kapsz svájci jogosítványt.",
          "Más országok: a legtöbb esetben vezetési vizsgával kell igazolnod a tudásod.",
        ],
      },
      {
        heading: "Hova fordulj",
        body: [
          "A cserét a lakóhelyed kantonjának közúti közlekedési hivatala (Strassenverkehrsamt / service des automobiles) intézi.",
        ],
      },
    ],
    sources: [
      {
        label: "ch.ch – Jogosítvány cseréje Svájcban",
        url: "https://www.ch.ch/en/documents-and-register-extracts/driving-licence/exchanging-your-driving-licence/",
      },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
