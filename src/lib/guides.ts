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

export const GUIDES_CH: Guide[] = [
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
  {
    slug: "lakasberles",
    title: "Lakásbérlés Svájcban",
    summary:
      "A lakáspiac feszes: erős jelentkezési dosszié, legfeljebb 3 havi kaució külön letéti számlán, és kötött felmondási idők jellemzik.",
    icon: "home",
    sections: [
      {
        heading: "Hol keress lakást",
        body: [
          "A legtöbb kiadó lakás online hirdetőkön jelenik meg (Homegate, ImmoScout24, Comparis, Flatfox), de érdemes a helyi újságokat és a faliújságokat is figyelni.",
          "A nagyvárosokban (Zürich, Genf, Bázel, Zug) erős a verseny — egy-egy megtekintésre sokan jönnek, ezért a gyors, hiánytalan jelentkezés sokat számít.",
        ],
      },
      {
        heading: "A jelentkezési dosszié (Bewerbungsdossier)",
        bullets: [
          "Kitöltött jelentkezési lap (Anmeldeformular)",
          "Útlevél / személyi és tartózkodási engedély másolata",
          "Friss fizetésigazolás(ok) vagy munkaszerződés",
          "Behajtási kivonat (Betreibungsauszug) — a lakóhelyed Betreibungsamt-jától, max. pár franc",
          "Néha referencia az előző bérbeadótól",
        ],
      },
      {
        heading: "Kaució (Mietkaution)",
        body: [
          "A bérbeadó legfeljebb 3 havi (nettó) bérnek megfelelő letétet kérhet.",
          "A pénzt törvény szerint a bérlő nevére szóló, elkülönített banki letéti számlán kell tartani — nem a bérbeadó saját számláján. A kamat téged illet.",
          "Kiköltözéskor a letét csak a kifogástalan átadás-átvétel (és az esetleges károk rendezése) után szabadul fel.",
        ],
      },
      {
        heading: "Bérleti szerződés és felmondás",
        body: [
          "A felmondási időt és a hivatalos felmondási időpontokat (Kündigungstermine) a szerződés és a kantonális szokások határozzák meg — gyakran 3 hónap.",
          "Ha hamarabb költöznél, általában akkor szabadulsz a szerződéstől, ha megfelelő, fizetőképes utódbérlőt (Nachmieter) állítasz.",
          "A bérbeadó felmondását hivatalos űrlapon kell közölnie; egyes felmondások megtámadhatók a bérleti egyeztető hatóságnál (Schlichtungsbehörde).",
        ],
      },
      {
        heading: "Átadás-átvétel és mellékköltségek",
        body: [
          "Beköltözéskor és kiköltözéskor is készül átadási jegyzőkönyv (Übergabeprotokoll) — minden meglévő hibát írj bele, különben később rajtad maradhat.",
          "A bérleti díj mellett mellékköltségek (Nebenkosten: fűtés, melegvíz, közös területek) is felmerülnek, gyakran átalány + éves elszámolás formájában.",
        ],
      },
      {
        heading: "Hasznos lépés a Kintin",
        body: [
          "Költözéshez vagy kisebb felújításhoz a Szaknévsorban kereshetsz magyarul beszélő szakembert (költöztető, festő, villanyszerelő) a saját kantonodban.",
          "Bejelentkezésről és az engedélyekről a „Bejelentkezés és letelepedés” útmutató segít.",
        ],
      },
    ],
    sources: [
      {
        label: "ch.ch – Lakásbérlés Svájcban",
        url: "https://www.ch.ch/en/housing/renting-a-home/",
      },
      {
        label: "ch.ch – Letét (kaució) bérléskor",
        url: "https://www.ch.ch/en/housing/renting-a-home/rental-deposit/",
      },
    ],
  },
  {
    slug: "mobil-internet-elofizetes",
    title: "Mobil- és internet-előfizetés",
    summary:
      "A svájci telekom drága, de a kötöttség oldódott: gyakran havi felmondású csomagok és olcsóbb másodmárkák között válogathatsz — érdemes összehasonlítani.",
    icon: "phone",
    sections: [
      {
        heading: "A három fő hálózat és a másodmárkák",
        body: [
          "Három nagy hálózat van: Swisscom, Sunrise és Salt. A tényleges lefedettség mindháromnál jó, a különbség inkább az árban és az ügyfélszolgálatban van.",
          "Sokszor a nagyok olcsóbb másodmárkái (pl. Wingo, yallo, Lebara, Coop Mobile, Aldi Suisse Mobile) ugyanazon a hálózaton adnak lényegesen olcsóbb csomagot.",
        ],
      },
      {
        heading: "Előfizetés vs. feltöltőkártya (Prepaid)",
        bullets: [
          "Prepaid: nincs hűségidő, kötöttség nélkül kipróbálhatod a lefedettséget — jó az első hónapokra.",
          "Abo (előfizetés): kedvezőbb havidíj, de figyelj a minimális futamidőre és a felmondási időre.",
          "Sok új csomag már havi felmondású — nem ragadsz bele 24 hónapba.",
        ],
      },
      {
        heading: "Mire figyelj szerződéskötéskor",
        bullets: [
          "Roaming/EU-adat: utazol-e sokat — egyes csomagokban benne van, másokban drága.",
          "Készülék részletre: a „féláras telefon” gyakran hosszú hűségidővel jár.",
          "Otthoni internet: a TV + internet + mobil csomag (bundle) néha olcsóbb, de nehezebb külön felmondani.",
        ],
      },
      {
        heading: "Spórolj a Kinti szolgáltató-váltó eszközével",
        body: [
          "A Kinti beépített szolgáltató-váltó varázslója végigvezet, hogyan válts olcsóbb mobil- vagy internetcsomagra, és mire figyelj a felmondásnál.",
          "Mindig hasonlítsd össze a tényleges havidíjat (Comparis és a szolgáltatók saját oldalai) a hűségidővel együtt — a legolcsóbb listaár nem mindig a legolcsóbb összköltség.",
        ],
      },
    ],
    sources: [
      {
        label: "ch.ch – Telefon és internet",
        url: "https://www.ch.ch/en/communications-and-media/telephone-and-internet/",
      },
      {
        label: "comparis.ch – Mobilcsomagok összehasonlítása",
        url: "https://en.comparis.ch/telecom/mobile/uebersicht",
      },
    ],
  },
  {
    slug: "auto-svajcban",
    title: "Autó Svájcban",
    summary:
      "A forgalomba helyezéshez kötelező felelősségbiztosítás és kantonális regisztráció kell, a nemzeti utakra autópálya-matrica, az autót pedig időszakosan műszakira (MFK) viszik.",
    icon: "car",
    sections: [
      {
        heading: "Forgalomba helyezés és rendszám",
        body: [
          "Az autót a lakóhelyed kantonjának közúti hivatalánál (Strassenverkehrsamt / service des automobiles) kell forgalomba helyezni — innen kapod a rendszámot is.",
          "A regisztráció előtt kötelező felelősségbiztosítást (Haftpflicht) kötni; a biztosító elektronikus igazolást küld a hivatalnak.",
        ],
      },
      {
        heading: "Külföldről behozott autó",
        bullets: [
          "Behozatalkor vámkezelés és a jármű vámeljárása szükséges.",
          "Általában 1 hónapon belül forgalomba kell helyezni Svájcban.",
          "Sok esetben műszaki vizsga (MFK) és adott típusjóváhagyás kell a regisztrációhoz.",
        ],
      },
      {
        heading: "Időszakos műszaki vizsga (MFK)",
        body: [
          "A járműveket rendszeresen műszaki ellenőrzésre (Motorfahrzeugkontrolle, MFK) hívják be — a kantonális hivataltól kapsz értesítést, időpontot.",
        ],
      },
      {
        heading: "Autópálya-matrica (Vignette)",
        body: [
          "A nemzeti autópályák és autóutak használatához éves autópálya-matrica (Autobahnvignette) kötelező. Kapható ragasztós és elektronikus (e-vignette) formában is, és a naptári évre szól.",
        ],
      },
      {
        heading: "Hasznos lépés a Kintin",
        body: [
          "Szervizhez vagy gumicseréhez a Szaknévsorban kereshetsz magyarul beszélő autószerelőt a saját kantonodban.",
        ],
      },
    ],
    sources: [
      {
        label: "ch.ch – Gépjárművek és vezetés",
        url: "https://www.ch.ch/en/driving-and-transport/",
      },
      {
        label: "ch.ch – Autópálya-matrica (vignette)",
        url: "https://www.ch.ch/en/driving-and-transport/motorway-charge-sticker-vignette/",
      },
    ],
  },
  {
    slug: "serafe-tv-radio-dij",
    title: "Serafe — rádió- és TV-díj",
    summary:
      "Svájcban minden háztartás kötelező rádió- és televízió-díjat fizet (a Serafe szedi), függetlenül attól, hogy van-e otthon készüléked.",
    icon: "home",
    sections: [
      {
        heading: "Háztartásonkénti kötelező díj",
        body: [
          "A médiadíjat háztartásonként (nem személyenként) kell fizetni, és akkor is jár, ha nincs tévéd vagy rádiód.",
          "A díjat a Serafe AG szedi be; a számlát a községi lakcímnyilvántartás alapján automatikusan küldik, miután bejelentkeztél.",
        ],
      },
      {
        heading: "Mikor kapod az első számlát",
        body: [
          "Miután a községnél bejelentkeztél, a háztartásod bekerül a nyilvántartásba, és a Serafe automatikusan kiállítja az éves számlát — külön regisztrálni nem kell.",
          "Ha társbérletben (WG) laksz, a háztartás egészére egy díj jár, amit a lakók egymás közt osztanak meg.",
        ],
      },
      {
        heading: "Mentesség",
        bullets: [
          "Kiegészítő ellátásban (Ergänzungsleistungen, EL) részesülők kérhetnek mentességet.",
          "Egyes kollektív háztartások (pl. otthonok) külön szabályok alá esnek.",
        ],
      },
    ],
    sources: [
      {
        label: "ch.ch – Rádió- és TV-díj",
        url: "https://www.ch.ch/en/communications-and-media/radio-and-television-licence-fee/",
      },
      {
        label: "Serafe AG – hivatalos oldal",
        url: "https://www.serafe.ch/en/",
      },
    ],
  },
  {
    slug: "szulesi-apasagi-szabadsag",
    title: "Szülési és apasági szabadság",
    summary:
      "Az anya 14 hét anyasági szabadságra és a kereset 80%-ára jogosult, a másik szülő 2 hét apasági szabadságra — a jövedelemkiesést a keresetpótló rendszer (EO/APG) fedezi.",
    icon: "heart",
    sections: [
      {
        heading: "Anyasági szabadság (14 hét)",
        body: [
          "A szülés után az anya 14 hét (98 nap) anyasági szabadságra jogosult, ezalatt a korábbi keresete 80%-át kapja, napi felső határig.",
          "A juttatás akkor jár, ha az anya a szülés előtt megfelelő ideig AHV-biztosított volt és dolgozott — a pontos feltételeket a kifizetést intéző pénztár (Ausgleichskasse) ellenőrzi.",
        ],
      },
      {
        heading: "A másik szülő szabadsága (2 hét)",
        body: [
          "A másik szülő (apa vagy az anya bejegyzett partnere) 2 hét szabadságra jogosult, amelyet a szülést követő 6 hónapon belül lehet kivenni — egyben vagy napokra elosztva.",
          "Erre az időre is a kereset 80%-a jár, napi felső határig.",
        ],
      },
      {
        heading: "Hogyan igényeld",
        body: [
          "A juttatást általában a munkáltatón keresztül, a megfelelő űrlappal igényled a kompenzációs pénztárnál (Ausgleichskasse).",
          "Beteg gyermek gondozására külön gondozási szabadság és juttatás is létezhet.",
        ],
      },
      {
        heading: "Kapcsolódó",
        body: [
          "A gyermek után járó rendszeres támogatásról a „Családi pótlék (Kinderzulage)” útmutató szól.",
        ],
      },
    ],
    sources: [
      {
        label: "ch.ch – Anyasági szabadság és juttatás",
        url: "https://www.ch.ch/en/family-and-partnership/having-children/maternity-leave-and-maternity-benefits/",
      },
      {
        label: "ch.ch – A másik szülő szabadsága",
        url: "https://www.ch.ch/en/family-and-partnership/having-children/paternity-leave/",
      },
    ],
  },
  {
    slug: "harmadik-piller-saule-3a",
    title: "3. pillér (Säule 3a)",
    summary:
      "A svájci nyugdíj 3 pilléren áll; a 3. pillér önkéntes magán-előtakarékosság. A kötött 3a adókedvezményes, de a pénz jellemzően a nyugdíjig le van kötve.",
    icon: "trending",
    sections: [
      {
        heading: "A három pillér röviden",
        bullets: [
          "1. pillér — AHV/IV: állami alapnyugdíj, a létfenntartást fedezi.",
          "2. pillér — BVG (Pensionskasse): foglalkoztatói nyugdíj, a megszokott életszínvonalat célozza.",
          "3. pillér — önkéntes magán-előtakarékosság, a kettő kiegészítésére.",
        ],
      },
      {
        heading: "Kötött 3. pillér (Säule 3a)",
        body: [
          "A 3a adókedvezményes: az évente befizetett összeg (egy törvényi felső határig) levonható az adóköteles jövedelmedből.",
          "Alkalmazottra és önálló vállalkozóra eltérő éves plafon vonatkozik — a pontos, aktuális összeget mindig a hivatalos forrásnál ellenőrizd.",
        ],
      },
      {
        heading: "Mikor férsz hozzá",
        bullets: [
          "Nyugdíjazás előtt néhány évvel.",
          "Saját lakás/ház vásárlására.",
          "Önálló vállalkozás indításakor.",
          "Svájcból való végleges kivándorláskor.",
        ],
      },
      {
        heading: "Szabad 3. pillér (Säule 3b) és segítség",
        body: [
          "A 3b szabad megtakarítás: rugalmasabb hozzáférés, de általában nincs külön adókedvezmény.",
          "Konkrét, rád szabott tervhez a Szaknévsorban kereshetsz magyarul beszélő könyvelőt vagy pénzügyi tanácsadót; az adózásról az „Adózás és adóbevallás” útmutató segít.",
        ],
      },
    ],
    sources: [
      {
        label: "ch.ch – A svájci nyugdíjrendszer (3 pillér)",
        url: "https://www.ch.ch/en/retirement/the-3-pillar-system/",
      },
      {
        label: "ch.ch – Magán-előtakarékosság (3. pillér)",
        url: "https://www.ch.ch/en/retirement/private-pension-provision/",
      },
    ],
  },
  {
    slug: "felmondas-munkabizonyitvany",
    title: "Felmondás és munkabizonyítvány",
    summary:
      "A felmondási idő a ledolgozott évektől függ (próbaidő után jellemzően 1–3 hónap), bizonyos időszakokban a munkáltató nem mondhat fel, és jogod van munkabizonyítványra.",
    icon: "send",
    sections: [
      {
        heading: "Próbaidő (Probezeit)",
        body: [
          "A munkaviszony elején általában van próbaidő (jellemzően 1–3 hónap), amely alatt mindkét fél rövidebb, gyakran 7 napos felmondási idővel léphet ki.",
        ],
      },
      {
        heading: "Felmondási idő próbaidő után",
        bullets: [
          "1. szolgálati évben: jellemzően 1 hónap.",
          "2.–9. évben: jellemzően 2 hónap.",
          "10. évtől: jellemzően 3 hónap, mindig a hónap végére.",
          "A szerződés vagy a kollektív szerződés (GAV) ettől eltérhet — azt nézd elsőként.",
        ],
      },
      {
        heading: "Védett időszakok (Sperrfrist)",
        body: [
          "A munkáltató nem mondhat fel bizonyos védett időszakokban: pl. betegség vagy baleset miatti munkaképtelenség, terhesség és a szülés utáni hetek, illetve katonai/polgári szolgálat alatt.",
          "Az ilyen időszak alatt közölt munkáltatói felmondás érvénytelen.",
        ],
      },
      {
        heading: "Munkabizonyítvány (Arbeitszeugnis)",
        body: [
          "A munkaviszony végén jogod van munkabizonyítványra: kérhetsz teljes (a teljesítményt és magatartást is minősítő) vagy egyszerű (csak a tényeket rögzítő) bizonyítványt.",
        ],
      },
      {
        heading: "Felmondás után",
        body: [
          "Ha elveszíted az állásod, mielőbb jelentkezz be a regionális munkaközvetítőnél (RAV) — a munkanélküli ellátásról az „Munkanélküli biztosítás (ALV)” útmutató szól.",
        ],
      },
    ],
    sources: [
      {
        label: "ch.ch – Munkaviszony megszűnése",
        url: "https://www.ch.ch/en/work/employees/termination-of-employment/",
      },
      {
        label: "ch.ch – Munkabizonyítvány",
        url: "https://www.ch.ch/en/work/employees/job-reference/",
      },
    ],
  },
  {
    slug: "hulladek-ujrahasznositas",
    title: "Hulladék és újrahasznosítás",
    summary:
      "Sok községben a háztartási szemetet csak hivatalos, díjköteles zsákban szabad kitenni, és a papír, üveg, PET, zöldhulladék szelektíven megy — a rossz kukázásért bírság jár.",
    icon: "home",
    sections: [
      {
        heading: "Díjköteles szemeteszsák (Gebührensack)",
        body: [
          "Számos községben a vegyes háztartási hulladékot csak a hivatalos, községi zsákban (Gebührensack — pl. Züri-Sack, Bebbi-Sagg) szabad kitenni; a zsák ára tartalmazza a szemétdíjat.",
          "A nem megfelelő zsákban kitett szemetet nem viszik el, és bírság is járhat érte.",
        ],
      },
      {
        heading: "Szelektív gyűjtés",
        bullets: [
          "Papír és karton — kötegelve vagy gyűjtőpontra, a naptár szerinti napokon.",
          "Üveg szín szerint (zöld/barna/fehér) — gyűjtőkonténerbe.",
          "PET-palack, alumínium, fém — boltokban/gyűjtőpontokon.",
          "Zöldhulladék (Grüngut) és komposzt — külön elszállítással, ahol van.",
        ],
      },
      {
        heading: "Gyűjtési naptár (Abfuhrkalender)",
        body: [
          "Minden község kiad egy hulladéknaptárat, amely megmondja, mikor viszik az egyes frakciókat. Sok helyen app vagy online naptár is van.",
          "A pontos szabályok községenként eltérnek — a lakóhelyed község oldalát nézd.",
        ],
      },
    ],
    sources: [
      {
        label: "ch.ch – Hulladék és újrahasznosítás",
        url: "https://www.ch.ch/en/housing/waste-disposal-and-recycling/",
      },
    ],
  },
  {
    slug: "lakasvasarlas-jelzalog",
    title: "Lakásvásárlás és jelzálog",
    summary:
      "Saját lakáshoz jellemzően a vételár legalább 20%-a önerő kell (ennek fele kemény saját pénz), a jelzálog tarthatóságát pedig kalkulált kamattal vizsgálja a bank.",
    icon: "trending",
    sections: [
      {
        heading: "Önerő (Eigenkapital)",
        body: [
          "Általában a vételár legalább 20%-át önerőből kell fedezned. Ennek legalább a fele (a vételár ~10%-a) „kemény” saját pénz legyen, ne a 2. pillérből.",
          "Saját lakás vásárlásához a 2. és 3. pillér megtakarítása részben felhasználható (előrehozás vagy elzálogosítás).",
        ],
      },
      {
        heading: "Jelzálog és tarthatóság (Tragbarkeit)",
        body: [
          "A vételár fennmaradó részét jelzáloghitel (Hypothek) finanszírozza. A bank a tarthatóságot nem a tényleges, hanem egy magasabb, kalkulált kamatlábbal számolja.",
          "Ökölszabály: a lakás összes éves költsége (kalkulált kamat + amortizáció + fenntartás) ne haladja meg a bruttó jövedelmed kb. egyharmadát.",
        ],
      },
      {
        heading: "Amortizáció",
        body: [
          "A jelzálog egy részét (a 2. jelzálogot) meghatározott időn belül vissza kell fizetni (amortizáció), hogy az adósság a vételárhoz képest csökkenjen.",
        ],
      },
      {
        heading: "Segítség",
        body: [
          "A számok rád szabásához a Szaknévsorban kereshetsz magyarul beszélő könyvelőt vagy pénzügyi tanácsadót; az előtakarékosságról a „3. pillér (Säule 3a)” útmutató segít.",
        ],
      },
    ],
    sources: [
      {
        label: "ch.ch – Lakástulajdon vásárlása",
        url: "https://www.ch.ch/en/housing/buying-a-home/",
      },
    ],
  },
  {
    slug: "vallalkozasinditas-svajcban",
    title: "Vállalkozásindítás Svájcban",
    summary:
      "A legegyszerűbb forma az egyéni cég (Einzelfirma); az AHV-nál önállóként be kell jelentkezned, és 100 000 CHF árbevétel felett cégjegyzék és ÁFA (MWST) is kötelező.",
    icon: "users",
    sections: [
      {
        heading: "Jogi formák",
        bullets: [
          "Egyéni cég (Einzelfirma) — a legegyszerűbb, nincs minimáltőke; a tulajdonos teljes vagyonával felel.",
          "GmbH (kft) — jellemzően 20 000 CHF törzstőke, korlátozott felelősség.",
          "AG (rt) — jellemzően 100 000 CHF alaptőke.",
        ],
      },
      {
        heading: "Önálló státusz és AHV",
        body: [
          "Önálló vállalkozóként be kell jelentkezned a kompenzációs pénztárhoz (Ausgleichskasse), amely elismeri (vagy nem) az önálló státuszt és beszedi a társadalombiztosítási járulékot.",
          "Önállóként nincs munkanélküli-biztosításod (ALV), a nyugdíj-előtakarékosságról magadnak kell gondoskodnod.",
        ],
      },
      {
        heading: "Cégjegyzék és ÁFA (MWST)",
        bullets: [
          "Egyéni cég 100 000 CHF éves árbevétel felett kötelezően a cégjegyzékbe (Handelsregister) kerül; a GmbH/AG mindig bejegyzendő.",
          "100 000 CHF árbevétel felett ÁFA-regisztráció (MWST) is kötelező.",
        ],
      },
      {
        heading: "Hasznos lépés a Kintin",
        body: [
          "Könyveléshez, adóhoz magyarul beszélő könyvelőt találsz a Szaknévsorban.",
          "Ha a saját vállalkozásod már működik Svájcban, a Szaknévsorba ingyen felveheted a „Vállalkozásod van?” gombbal.",
        ],
      },
    ],
    sources: [
      {
        label: "ch.ch – Vállalkozás alapítása",
        url: "https://www.ch.ch/en/business/setting-up-a-business/",
      },
      {
        label: "ch.ch – Önálló vállalkozói tevékenység",
        url: "https://www.ch.ch/en/work/self-employment/",
      },
    ],
  },
];

// ════════════════════ AUSZTRIA — osztrák tudásbázis (EU-fókusz) ════════════════════
export const GUIDES_AT: Guide[] = [
  {
    slug: "at-bejelentkezes",
    title: "Bejelentkezés és tartózkodás",
    summary: "Meldezettel 3 napon belül; 3 hónapnál hosszabb tartózkodáshoz Anmeldebescheinigung (EU-regisztráció).",
    icon: "home",
    sections: [
      { heading: "Lakcímbejelentés (Meldezettel)", body: ["A beköltözéstől 3 NAPON belül be kell jelentkezned a Meldeamtnál (Bécsben a kerületi Magistratisches Bezirksamt, tartományokban a Gemeindeamt).", "A Meldezettel-űrlapot a szállásadónak (Unterkunftgeber) is alá kell írnia. A kapott Meldebestätigung sok más ügyhöz kell."] },
      { heading: "EU-regisztráció (Anmeldebescheinigung)", body: ["EU-állampolgárként szabad mozgásod van. Ha 3 hónapnál tovább maradsz, a beköltözéstől 4 hónapon belül kérned kell az Anmeldebescheinigungot.", "Feltétel: munkaviszony / önfoglalkoztatás VAGY elég megélhetés + egészségbiztosítás."] },
      { heading: "Hosszabb távon", bullets: ["5 év jogszerű tartózkodás → Daueraufenthalt (tartós tartózkodás)", "10 év (különleges esetben 6) → Staatsbürgerschaft — DE le kell mondani a magyar állampolgárságról!"] },
    ],
    sources: [{ label: "oesterreich.gv.at — Aufenthalt", url: "https://www.oesterreich.gv.at/themen/leben_in_oesterreich/aufenthalt.html" }, { label: "migration.gv.at", url: "https://www.migration.gv.at/" }],
  },
  {
    slug: "at-egeszsegbiztositas",
    title: "Egészségbiztosítás (ÖGK / e-card)",
    summary: "A munkaviszonnyal automatikusan biztosított vagy — nem kell pénztárt választani, mint Svájcban.",
    icon: "heart",
    sections: [
      { heading: "Automatikus biztosítás", body: ["Ha munkaviszonyban állsz, a munkáltató bejelent az ÖGK-hoz (Österreichische Gesundheitskasse), és AUTOMATIKUSAN biztosított leszel. Az e-card postán érkezik.", "Itt NEM kell biztosítót választani és külön díjat fizetni, mint a svájci Krankenkasse-nál — a járulékot a bérből vonják."] },
      { heading: "e-card", body: ["Az e-card a TB-kártyád: orvosnál, gyógyszertárban, kórházban ezt mutatod fel.", "A háziorvos (Hausarzt) az első kontakt; beutalóval mész szakorvoshoz."] },
      { heading: "Családtagok", bullets: ["A nem dolgozó házastárs és a gyerekek jellemzően társbiztosítottak (mitversichert)", "Önfoglalkoztatóknak az SVS (Sozialversicherung der Selbständigen)"] },
    ],
    sources: [{ label: "gesundheitskasse.at — ÖGK", url: "https://www.gesundheitskasse.at/" }, { label: "oesterreich.gv.at — e-card", url: "https://www.oesterreich.gv.at/themen/gesundheit_und_notfaelle.html" }],
  },
  {
    slug: "at-adozas",
    title: "Adózás (Lohnsteuer)",
    summary: "A bérből automatikusan vonják a Lohnsteuert; év végén az Arbeitnehmerveranlagung gyakran visszatérítést hoz.",
    icon: "document",
    sections: [
      { heading: "Bérből vont adó", body: ["Munkavállalóként a Lohnsteuert (jövedelemadó) és a társadalombiztosítási járulékot a munkáltató automatikusan levonja a bérből, és befizeti.", "A nettó bér a bruttóból a Lohnsteuer + SV-járulék levonása után marad."] },
      { heading: "Arbeitnehmerveranlagung", body: ["Év végén önkéntesen beadhatod az Arbeitnehmerveranlagungot (munkavállalói adóelszámolás) a FinanzOnline-on — visszamenőleg 5 évig.", "Gyakran VISSZAJÁR pénz: levonható az ingázás (Pendlerpauschale), gyermek (Familienbonus Plus), továbbképzés, bizonyos biztosítások."] },
      { heading: "Hasznos tudni", bullets: ["FinanzOnline = az osztrák adóhivatal online portálja", "Familienbonus Plus: jelentős gyermek-adókedvezmény", "13./14. havi fizetés (Urlaubs- és Weihnachtsgeld) kedvezményesen adózik"] },
    ],
    sources: [{ label: "BMF — Finanzministerium", url: "https://www.bmf.gv.at/" }, { label: "FinanzOnline", url: "https://finanzonline.bmf.gv.at/" }],
  },
  {
    slug: "at-iskola",
    title: "Iskola és gyerek",
    summary: "Kötelező, ingyenes oktatás; nemzeti rendszer (Volksschule → Mittelschule/AHS → Matura/Lehre).",
    icon: "bookmark",
    sections: [
      { heading: "Tankötelezettség", body: ["9 év tankötelezettség (6–15 éves kor). Az állami iskola ingyenes. Az utolsó óvodai év (5 éves kortól) is kötelező.", "Ha a gyerek nem tud németül, a Deutschförderklasse / Deutschförderkurs segíti a felzárkózást."] },
      { heading: "A rendszer", bullets: ["Volksschule (1–4. osztály)", "Sekundarstufe I: Mittelschule vagy AHS-Unterstufe", "Sekundarstufe II: AHS-Oberstufe (Matura), BHS (HTL/HAK), BMS, vagy Lehre"] },
      { heading: "Beiratkozás", body: ["Kell: útlevél/igazolvány, Meldezettel, e-card, az előző iskola bizonyítványa (lehetőleg hitelesített fordítással). Részletek a Kinti Osztrák Iskolarendszer modulban."] },
    ],
    sources: [{ label: "oesterreich.gv.at — Bildung", url: "https://www.oesterreich.gv.at/themen/bildung_und_neue_medien.html" }, { label: "BMBWF", url: "https://www.bmbwf.gv.at/" }],
  },
  {
    slug: "at-munkavallalas",
    title: "Munkavállalás",
    summary: "EU-állampolgárként szabadon dolgozhatsz; a Kollektivvertrag szabja a minimálbért és a feltételeket.",
    icon: "briefcase",
    sections: [
      { heading: "Szabad munkavállalás", body: ["EU-állampolgárként engedély nélkül, szabadon vállalhatsz munkát Ausztriában.", "A legtöbb ágazatban Kollektivvertrag (kollektív szerződés) szabja a minimálbért, a béremelést és a feltételeket — szakmánként eltér."] },
      { heading: "Munkaidő és szabadság", bullets: ["Normál munkaidő: heti 40 óra (sok KV-ben 38,5)", "Évi 5 hét (25 munkanap) fizetett szabadság", "13. és 14. havi fizetés (Urlaubsgeld + Weihnachtsgeld) szokásos"] },
      { heading: "Felmondás", body: ["A felmondási idők és a próbaidő (Probezeit, jellemzően 1 hónap) a KV / szerződés szerint. Munkaviszony végén Arbeitszeugnis (munkáltatói igazolás) jár.", "Munkanélküliség esetén az AMS-nél (Arbeitsmarktservice) jelentkezz."] },
    ],
    sources: [{ label: "arbeiterkammer.at — AK (munkavállalói jogok)", url: "https://www.arbeiterkammer.at/" }, { label: "AMS — Arbeitsmarktservice", url: "https://www.ams.at/" }],
  },
  {
    slug: "at-bankszamla",
    title: "Bankszámla",
    summary: "A fizetésedhez és a lakbérhez kell; a Meldezettel + útlevél elég a nyitáshoz.",
    icon: "trending",
    sections: [
      { heading: "Számlanyitás", body: ["Nyiss Girokonto-t (folyószámla) banknál (Erste, Bank Austria, BAWAG, Raiffeisen) vagy online (N26, bank99).", "Általában kell: érvényes útlevél/igazolvány + Meldezettel. A bérutaláshoz és a Daueraufträge (állandó megbízás, pl. lakbér) beállításához is ez kell."] },
      { heading: "Fizetés", bullets: ["A kártya = Bankomatkarte (debit); a Bankomat = ATM", "Erlagschein / Zahlschein = sárga csekk (számlák befizetése)", "Sok helyen kártya/kontaktless; piacon, kis boltban inkább készpénz"] },
      { heading: "Betétvédelem", body: ["Az EU-szabály szerint a betétek bankonként 100 000 €-ig védettek (Einlagensicherung)."] },
    ],
    sources: [{ label: "oesterreich.gv.at — Konto", url: "https://www.oesterreich.gv.at/themen/bauen_wohnen_und_umwelt.html" }],
  },
  {
    slug: "at-nyugdij",
    title: "Nyugdíj (Pensionsversicherung)",
    summary: "A bérből kötelező nyugdíjjárulékot vonnak; az EU-ban szerzett évek összeszámítódnak.",
    icon: "globe",
    sections: [
      { heading: "Kötelező rendszer", body: ["Munkavállalóként kötelező nyugdíjbiztosítás (Pensionsversicherung); a járulékot a bérből vonják (PVA — Pensionsversicherungsanstalt).", "A magyar és az osztrák (és más EU-) szolgálati évek a nyugdíjnál összeszámítódnak — az EU-koordináció miatt nem vész el a külföldön szerzett idő."] },
      { heading: "Pillérek", bullets: ["1. pillér: állami Pensionsversicherung (kötelező)", "2. pillér: vállalati nyugdíj (Betriebliche Vorsorge) — egyes munkáltatóknál", "3. pillér: magán-előtakarékosság (pl. prämienbegünstigte Zukunftsvorsorge)"] },
    ],
    sources: [{ label: "pv.at — Pensionsversicherungsanstalt", url: "https://www.pv.at/" }, { label: "oesterreich.gv.at — Pension", url: "https://www.oesterreich.gv.at/themen/arbeit_und_pension.html" }],
  },
  {
    slug: "at-lakasberles",
    title: "Lakásbérlés",
    summary: "Hauptmietvertrag, Kaution (kb. 3 havi bér), esetleg Provision; figyelj a Betriebskostenre.",
    icon: "home",
    sections: [
      { heading: "Bérleti szerződés", body: ["A leggyakoribb a Hauptmietvertrag (fő bérleti szerződés). Lehet határozott (befristet) vagy határozatlan (unbefristet) idejű.", "A bérleti díjon (Miete) felül jön a Betriebskosten (üzemeltetési/rezsi költség) — kérdezd meg az összköltséget (Bruttomiete)."] },
      { heading: "Költségek beköltözéskor", bullets: ["Kaution (kaució): jellemzően 3 havi bruttó lakbér", "Provision (ingatlanos jutalék): max. 2 havi lakbér (ha ingatlanoson keresztül)", "Esetleg Ablöse (bútorért/felújításért a régi bérlőnek)"] },
      { heading: "Jogvédelem", body: ["A Mietrechtsgesetz (MRG) sok bérleményt véd (díjkorlát, felmondási védelem). Vitás kérdésben az Arbeiterkammer (AK) vagy a Mietervereinigung segít."] },
    ],
    sources: [{ label: "oesterreich.gv.at — Wohnen", url: "https://www.oesterreich.gv.at/themen/bauen_wohnen_und_umwelt.html" }, { label: "mietervereinigung.at", url: "https://mietervereinigung.at/" }],
  },
  {
    slug: "at-jogositvany",
    title: "Jogosítvány Ausztriában",
    summary: "A magyar (EU) jogosítvány érvényes — átírni nem kötelező; csere lejáratkor/elvesztéskor a Führerscheinbehördénél.",
    icon: "car",
    sections: [
      { heading: "Érvényes a magyar jogsi?", body: ["IGEN — az EU-s magyar jogosítvány Ausztriában korlátlanul érvényes, beköltözéskor NEM kell osztrák okmányra cserélni.", "Csere (Umschreibung) lejáratkor, elvesztéskor vagy rongálódáskor kell — a Führerscheinbehördénél (LPD / Bezirkshauptmannschaft), vizsga nélkül."] },
      { heading: "Gyakorlati tudnivalók", bullets: ["A cseréhez kell: érvényes okmány, fotó, Meldezettel", "A régi, papíralapú jogosítványokat az EU-ban fokozatosan (2033-ig) kártyára kell cserélni", "Az osztrák Probeführerschein-szabályok (próbaidő) az AUSZTRIÁBAN szerzett jogsira vonatkoznak"] },
    ],
    sources: [{ label: "oesterreich.gv.at — Führerschein", url: "https://www.oesterreich.gv.at/" }],
  },
  {
    slug: "at-munkanelkuli",
    title: "Munkanélküli-ellátás (AMS)",
    summary: "Arbeitslosengeld az AMS-nél: első alkalommal 52 hét biztosítás kell 2 éven belül; a magyar időszak is beszámíthat (U1).",
    icon: "briefcase",
    sections: [
      { heading: "Jogosultság", body: ["Első igénylésnél az utolsó 2 évben legalább 52 hét munkanélküli-biztosítással járó munkaviszony kell (25 év alatt és ismételt igénylésnél kevesebb).", "Az ellátás alapja a korábbi nettó kb. 55%-a (Grundbetrag), pótlékokkal (család) többre nőhet. FONTOS: már az utolsó munkanap MÁSNAPJÁN jelentkezz az AMS-nél — a késés ellátás-vesztés."] },
      { heading: "Magyar munkaviszonnyal", body: ["EU-koordináció: a magyar biztosítási idők az U1-es igazolással beszámíthatnak, ha Ausztriában is dolgoztál már.", "Az eAMS-fiók (online) a legegyszerűbb út: időpont, igénylés, álláskeresés egy helyen."] },
      { heading: "Ha lejár", bullets: ["Notstandshilfe (kb. az ellátás 92–95%-a) kérelemre, rászorultság szerint", "Az ellátás alatt a betegbiztosításod (ÖGK) tovább él", "Az AMS képzéseket is finanszíroz — kérdezz rá (deutschkurs, átképzés)"] },
    ],
    sources: [{ label: "AMS — Arbeitsmarktservice", url: "https://www.ams.at/" }],
  },
  {
    slug: "at-csaladi-potlek",
    title: "Familienbeihilfe (családi pótlék)",
    summary: "A Finanzamtnál (FinanzOnline) igényled; kor szerint sávos, EU-koordinációval a magyar ellátással összehangolva.",
    icon: "users",
    sections: [
      { heading: "Ki jogosult?", body: ["Ha Ausztriában élsz vagy itt dolgozol, a gyerek(ek) után Familienbeihilfe járhat — EU-állampolgárként magyarként is, akkor is, ha a gyerek Magyarországon él (különbözet-fizetés a két ország között).", "Az összeg a gyerek korával sávosan nő, és évente valorizálják — az aktuális összegeket a hivatalos oldalon találod. Mellé automatikusan jár a Kinderabsetzbetrag (adójóváírás)."] },
      { heading: "Igénylés", bullets: ["A FinanzOnline-on (vagy papíron a Finanzamtnál) — Beih 100 nyomtatvány", "Kell: születési anyakönyvi kivonat, Meldezettel, munkaviszony-igazolás", "Magyar ellátásról igazolás (a koordinációhoz) — egy gyerek után egyszerre csak egy országból jár teljes összeg", "Ausztriában született babánál gyakran HIVATALBÓL, kérelem nélkül elindul"] },
    ],
    sources: [{ label: "oesterreich.gv.at — Familienbeihilfe", url: "https://www.oesterreich.gv.at/" }, { label: "BMF — FinanzOnline", url: "https://www.bmf.gv.at/" }],
  },
  {
    slug: "at-szules",
    title: "Szülés, Karenz és Kinderbetreuungsgeld",
    summary: "Mutterschutz 8+8 hét (Wochengeld), Karenz a 2. életévig, Kinderbetreuungsgeld átalány vagy jövedelemfüggő.",
    icon: "users",
    sections: [
      { heading: "Mutterschutz (anyavédelem)", body: ["A szülés előtt és után 8-8 hét abszolút munkavégzési tilalom (koraszülésnél/császárnál utána 12) — ez idő alatt Wochengeld jár (az ÖGK fizeti, a korábbi nettó alapján).", "A terhesség bejelentésétől erős felmondási védelem él."] },
      { heading: "Karenz és Kinderbetreuungsgeld", body: ["A Karenz (fizetés nélküli szülői szabadság, felmondási védelemmel) legfeljebb a gyerek 2. születésnapjáig tart.", "A Kinderbetreuungsgeld (gyermekgondozási pénz) két modellben kérhető: átalány (pauschal, rugalmas időtartammal) VAGY jövedelemfüggő (a korábbi kereset ~80%-a, rövidebb ideig) — az ÖGK-nál igényled, a modellek nem kombinálhatók szabadon, számold ki előre."] },
      { heading: "Jó tudni", bullets: ["Papa-hónap (Familienzeitbonus) az apának közvetlenül a születés után", "A Familienbeihilfe ettől FÜGGETLENÜL jár (lásd külön cikk)", "A bölcsőde/óvoda tartományonként eltér — Bécsben az óvoda ingyenes"] },
    ],
    sources: [{ label: "oesterreich.gv.at — Geburt és Karenz", url: "https://www.oesterreich.gv.at/" }],
  },
  {
    slug: "at-auto",
    title: "Autó Ausztriában",
    summary: "Az átíratás a BIZTOSÍTÓ Zulassungsstelle-jénél megy; §57a Pickerl évente, autópályán Vignette.",
    icon: "car",
    sections: [
      { heading: "Regisztráció", body: ["Ausztriában az autó forgalomba helyezése a biztosítók által működtetett Zulassungsstellén történik — ELŐBB köss kötelező biztosítást (Haftpflicht), utána kapsz rendszámot.", "Magyarországról hozott autónál: EU-n belül vám nincs, de behozatalkor NoVA (normfogyasztási adó) és regisztráció esedékes — a NoVA-t a FinanzOnline-on vallod be."] },
      { heading: "Kötelezettségek", bullets: ["§57a Begutachtung („Pickerl”) — éves műszaki vizsga (új autónál 3-2-1 ritmusban), a szélvédőn matricával", "A gépjárműadót (motorbezogene Versicherungssteuer) a biztosítási díjjal EGYÜTT fizeted", "Autópályán/gyorsforgalmin Vignette kötelező (digitális az asfinag.at-on), egyes szakaszokon külön Streckenmaut", "Télen (11.01.–04.15.) téli felszereltség kötelező, ha téliesek az útviszonyok"] },
    ],
    sources: [{ label: "oesterreich.gv.at — Kfz", url: "https://www.oesterreich.gv.at/" }, { label: "ASFINAG — digitális Vignette", url: "https://www.asfinag.at/" }],
  },
  {
    slug: "at-orf-dij",
    title: "ORF-Beitrag (TV-rádió díj)",
    summary: "2024 óta a GIS helyett háztartásonkénti ORF-Beitrag (~15,30 €/hó) — készüléktől függetlenül.",
    icon: "bell",
    sections: [
      { heading: "Hogyan működik?", body: ["2024-től a régi GIS-díjat az ORF-Beitrag váltotta: főlakhelyenként (Hauptwohnsitz) fizetendő, függetlenül attól, van-e tévéd — az összeg kb. 15,30 €/hó, tartományi pótdíj jöhet rá (az aktuálisat a hivatalos oldalon találod).", "A Meldezettel alapján automatikusan megtalálnak — a levélre reagálj, különben visszamenőleg követelik."] },
      { heading: "Mire figyelj?", bullets: ["EGY főlakhely = EGY díj — a háztartásból egy személy fizeti", "Mentesség rászorultsági alapon kérhető (pl. bizonyos ellátások mellett)", "Kiköltözéskor (külföldre) jelentsd le — igazolással"] },
    ],
    sources: [{ label: "ORF-Beitrag — hivatalos oldal", url: "https://orf.beitrag.at/" }],
  },
];

export const GUIDES_DE: Guide[] = [
  {
    slug: "de-bejelentkezes",
    title: "Bejelentkezés (Anmeldung) és tartózkodás",
    summary: "Anmeldung a Bürgeramtnál ~1-2 héten belül; EU-állampolgárként Freizügigkeit — nincs külön engedély.",
    icon: "home",
    sections: [
      { heading: "Lakcímbejelentés (Anmeldung)", body: ["A beköltözéstől általában 1-2 héten belül (városonként eltér, pl. Berlin 14 nap) be kell jelentkezned a Bürgeramt / Einwohnermeldeamt-nál — Termin-foglalással (nagyvárosban hetekre előre telt!).", "Kell: a Wohnungsgeberbestätigung (a főbérlő/tulajdonos aláírt igazolása) + útlevél/igazolvány. A kapott Meldebescheinigung sok más ügyhöz kell (bankszámla, Steuer-ID, biztosítás)."] },
      { heading: "Szabad mozgás (Freizügigkeit)", body: ["EU-állampolgárként szabad mozgásod van — NINCS szükség tartózkodási engedélyre. A korábbi Freizügigkeitsbescheinigungot 2013-ban eltörölték.", "3 hónapnál tovább a feltétel: munka / önfoglalkoztatás VAGY elég megélhetés + egészségbiztosítás."] },
      { heading: "Hosszabb távon", bullets: ["5 év jogszerű tartózkodás → Daueraufenthalt-EU (tartós tartózkodás)", "Állampolgárság a 2024-es reform óta már 5 év után (kivételes integrációval 3) — és a KETTŐS állampolgárság ENGEDÉLYEZETT, NEM kell lemondani a magyarról!"] },
    ],
    sources: [{ label: "make-it-in-germany.com — Anmeldung", url: "https://www.make-it-in-germany.com/" }, { label: "BAMF", url: "https://www.bamf.de/" }],
  },
  {
    slug: "de-egeszsegbiztositas",
    title: "Egészségbiztosítás (Krankenversicherung)",
    summary: "Kötelező; gesetzlich (GKV — AOK/TK/Barmer) vagy privat (PKV). A GKV-nál a pénztárt TE választod.",
    icon: "heart",
    sections: [
      { heading: "Kötelező biztosítás", body: ["Németországban KÖTELEZŐ az egészségbiztosítás. A legtöbb munkavállaló a gesetzliche Krankenversicherung (GKV) tagja.", "A munkáltató bejelent, de a Krankenkassét TE választod (AOK, TK, Barmer, DAK…) — eltér a Zusatzbeitrag és a szolgáltatás. Svájccal ellentétben itt választani KELL pénztárt."] },
      { heading: "GKV vs. PKV", body: ["A GKV-járulék kb. 14,6% + a pénztár Zusatzbeitragja (átlag ~2,5%), nagyjából fele-fele a munkáltatóval.", "Magas jövedelem felett (a Versicherungspflichtgrenze, ~73 800 €/év 2025) választható a magán (PKV) is — de oda visszalépni nehéz, jól gondold meg."] },
      { heading: "Gyakorlat", bullets: ["A Gesundheitskarte (Versichertenkarte) a TB-kártyád", "A Hausarzt (háziorvos) az első kontakt", "Nem dolgozó házastárs + gyerekek a GKV-ban gyakran ingyen társbiztosítottak (Familienversicherung)"] },
    ],
    sources: [{ label: "make-it-in-germany.com — Krankenversicherung", url: "https://www.make-it-in-germany.com/" }, { label: "GKV-Spitzenverband", url: "https://www.gkv-spitzenverband.de/" }],
  },
  {
    slug: "de-adozas",
    title: "Adózás (Steuer / Lohnsteuer)",
    summary: "Steuer-ID postán; a bérből vonják a Lohnsteuert; a Steuererklärung (ELSTER) gyakran visszatérítést hoz.",
    icon: "document",
    sections: [
      { heading: "Steuer-ID és Steuerklasse", body: ["Az Anmeldung után postán kapsz egy Steuerliche Identifikationsnummert (Steuer-ID) — ez kell a munkához és a bankhoz.", "A Steuerklasse (I–VI) szabja a levont Lohnsteuert: I egyedülálló, III/V vagy IV/IV házasoknak, VI a második állásra."] },
      { heading: "Levonások a bérből", body: ["A munkáltató automatikusan levonja a Lohnsteuert + a társadalombiztosítási járulékot (egészség, nyugdíj, ápolás, munkanélküli).", "A Solidaritätszuschlag (Soli) 2021 óta a dolgozók ~90%-ánál MEGSZŰNT. A Kirchensteuer (egyházi adó, 8–9%) CSAK akkor, ha bejelentett egyháztag vagy."] },
      { heading: "Steuererklärung (adóbevallás)", body: ["Az éves bevallást az ELSTER portálon (vagy adós appal) adod be — sokszor VISSZAJÁR pénz (ingázás/Pendlerpauschale, home office, továbbképzés).", "Sok munkavállalónak önkéntes, de szinte mindig megéri beadni."] },
    ],
    sources: [{ label: "ELSTER — online adóportál", url: "https://www.elster.de/" }, { label: "BZSt — Bundeszentralamt für Steuern", url: "https://www.bzst.de/" }],
  },
  {
    slug: "de-iskola",
    title: "Iskola és gyerek (Schule)",
    summary: "Tankötelezettség, ingyenes állami iskola; a rendszer tartományonként (Bundesland) eltér.",
    icon: "bookmark",
    sections: [
      { heading: "Tankötelezettség", body: ["Általában 9–10 év Schulpflicht (kb. 6 éves kortól). Az állami iskola ingyenes.", "Ha a gyerek nem tud németül, Willkommensklasse / Sprachförderung segíti a felzárkózást."] },
      { heading: "A rendszer (Bundesland-függő!)", bullets: ["Grundschule (1–4. osztály; Berlin/Brandenburg 1–6.)", "Utána: Gymnasium (Abitur felé), Realschule, Hauptschule vagy Gesamtschule", "A nevek és az átmenet tartományonként ELTÉRNEK — nézd a lakóhelyed Bundeslandját"] },
      { heading: "Duális képzés", body: ["A híres Ausbildung (duális szakképzés): iskola + céges gyakorlat, fizetéssel. Erős, megbecsült út egy szakmához (kb. 3 év)."] },
    ],
    sources: [{ label: "make-it-in-germany.com — Schule", url: "https://www.make-it-in-germany.com/" }, { label: "KMK — Kultusministerkonferenz", url: "https://www.kmk.org/" }],
  },
  {
    slug: "de-munkavallalas",
    title: "Munkavállalás (Arbeit)",
    summary: "EU-állampolgárként szabadon dolgozhatsz; Mindestlohn + írott Arbeitsvertrag véd.",
    icon: "briefcase",
    sections: [
      { heading: "Szabad munkavállalás", body: ["EU-állampolgárként engedély nélkül, szabadon dolgozhatsz Németországban.", "Az írott Arbeitsvertrag (munkaszerződés) rögzíti a bért, a munkaidőt, a szabadságot és a felmondási időt."] },
      { heading: "Bér és munkaidő", bullets: ["Törvényi Mindestlohn: kb. 13,90 €/óra (2026; évente emelkedik — ellenőrizd az aktuálisat)", "Sok ágazatban Tarifvertrag (kollektív szerződés) magasabb bért ad", "Min. évi 20 munkanap fizetett szabadság (5 napos hétnél); a gyakorlat gyakran 25–30"] },
      { heading: "Felmondás és munkanélküliség", body: ["A Kündigung (felmondás) mindig ÍRÁSBAN, törvényi/szerződéses Kündigungsfrist-tel.", "Munkanélküliség esetén az Agentur für Arbeit-nál jelentkezz (Arbeitslosengeld) — lehetőleg már a felmondás napján."] },
    ],
    sources: [{ label: "make-it-in-germany.com — Arbeit", url: "https://www.make-it-in-germany.com/" }, { label: "Agentur für Arbeit", url: "https://www.arbeitsagentur.de/" }],
  },
  {
    slug: "de-bankszamla",
    title: "Bankszámla (Girokonto)",
    summary: "A fizetéshez és a lakbérhez kell; banknál vagy online (N26, DKB, ING).",
    icon: "trending",
    sections: [
      { heading: "Számlanyitás", body: ["Nyiss Girokonto-t (folyószámla) — Sparkasse, Volksbank, vagy online (N26, DKB, ING).", "Kell: útlevél/igazolvány + Meldebescheinigung (gyakran a Steuer-ID is). EU-ban jogod van Basiskonto-hoz akkor is, ha még nincs minden papírod."] },
      { heading: "Fizetés", bullets: ["A kártya jellemzően Girocard (EC) vagy debit; az Überweisung (SEPA-átutalás) az alap", "A Lastschrift (beszedési megbízás) gyakori a rezsire/biztosításra", "Készpénz még sok helyen elterjedt — vigyél magaddal"] },
      { heading: "Betétvédelem", body: ["Az EU-szabály szerint a betétek bankonként 100 000 €-ig védettek (Einlagensicherung)."] },
    ],
    sources: [{ label: "make-it-in-germany.com — Konto", url: "https://www.make-it-in-germany.com/" }],
  },
  {
    slug: "de-lakasberles",
    title: "Lakásbérlés (Wohnung)",
    summary: "Mietvertrag, Kaution (max 3 havi Kaltmiete); figyelj a Warmmiete-re és a Schufa-ra.",
    icon: "home",
    sections: [
      { heading: "Bérleti szerződés", body: ["A Mietvertrag rögzíti a Kaltmiete-t (hideg bérleti díj) + a Nebenkosten (rezsi/üzemeltetés) = Warmmiete (a TÉNYLEGES havi díj). Mindig az összköltséget nézd!", "Lehet határozott (befristet) vagy határozatlan (unbefristet) idejű."] },
      { heading: "Költségek beköltözéskor", bullets: ["Kaution (kaució): max. 3 havi Kaltmiete", "Gyakran kell Schufa-Auskunft (hitelképességi igazolás) + Mietschuldenfreiheitsbescheinigung", "A Maklerprovision-t 2015 óta a megrendelő fizeti (Bestellerprinzip) — bérlőként ritkán a tiéd"] },
      { heading: "Jogvédelem", body: ["A német Mietrecht erősen védi a bérlőt (felmondási védelem, sok városban Mietpreisbremse). Vitában a Mieterverein (Deutscher Mieterbund) segít."] },
    ],
    sources: [{ label: "make-it-in-germany.com — Wohnung", url: "https://www.make-it-in-germany.com/" }, { label: "Deutscher Mieterbund", url: "https://www.mieterbund.de/" }],
  },
  {
    slug: "de-csaladi-potlek",
    title: "Kindergeld (családi pótlék) Németországban",
    summary:
      "A német családi pótlék (Kindergeld) minden Németországban adóköteles szülőnek járhat — a jogosultságot a lakóhely és a munkaviszony alapozza meg, nem az állampolgárság.",
    icon: "users",
    sections: [
      {
        heading: "Mi az a Kindergeld és ki jogosult rá?",
        body: [
          "A Kindergeld a német családi pótlék, amelyet a gyermek után havonta fizetnek. Általában az a szülő jogosult rá, aki Németországban él és adóköteles (bejelentett lakóhely + korlátlan adókötelezettség), vagy itt dolgozik. EU-állampolgárként magyarként is igényelheted.",
          "Egy gyermek után jellemzően csak egy országból jár családi támogatás; ha Magyarországon is kapnál, a két rendszer közötti különbözetet koordinálják. Ezt a Familienkasse vizsgálja.",
        ],
      },
      {
        heading: "Szükséges dokumentumok magyar igénylőknek",
        bullets: [
          "A gyermek(ek) nemzetközi születési anyakönyvi kivonata",
          "Házassági anyakönyvi kivonat (ha releváns)",
          "Német lakcímbejelentő (Anmeldung / Meldebescheinigung)",
          "Adóazonosító (steuerliche Identifikationsnummer) — a tiéd és a gyermeké",
          "Igazolás arról, kaptok-e Magyarországon családi támogatást (a koordinációhoz)",
        ],
      },
      {
        heading: "Hogyan nyújtsd be a kérelmet?",
        body: [
          "A kérelmet (Antrag auf Kindergeld) a lakóhelyed szerinti Familienkasse felé kell benyújtani, plusz az Anlage Kind mellékletet gyermekenként. Ma már online is intézhető a Bundesagentur für Arbeit felületén.",
          "A nemzetközi anyakönyvi kivonatokat érdemes előre beszerezni — ez a leggyakoribb csúszás oka.",
        ],
      },
      {
        heading: "Mennyi idő, és mire figyelj?",
        body: [
          "Az ügyintézés jellemzően néhány hét, de EU-s koordinációnál hosszabb is lehet. Visszamenőleg csak korlátozottan igényelhető, ezért a jogosultság kezdetétől mielőbb add be. A pontos, aktuális összegeket mindig a hivatalos oldalon ellenőrizd.",
        ],
      },
    ],
    sources: [
      { label: "Familienkasse (Bundesagentur für Arbeit) — Kindergeld", url: "https://www.arbeitsagentur.de/familie-und-kinder/kindergeld" },
    ],
  },
  {
    slug: "de-nyugdij",
    title: "Nyugdíj (Rente) Németországban",
    summary: "A Deutsche Rentenversicherung a kötelező pillér; a magyar és a német évek EU-szabály szerint összeszámítanak.",
    icon: "clock",
    sections: [
      { heading: "Hogyan épül fel?", body: ["Munkavállalóként automatikusan a gesetzliche Rentenversicherung tagja vagy — a járulékot (18,6%, fele-fele a munkáltatóval) a bérből vonják.", "A nyugdíjjogosultsághoz minimum 5 év (Wartezeit) kell — de EU-állampolgárként a MAGYAR biztosítási éveid is BESZÁMÍTANAK a jogosultságba (a kifizetést országonként arányosan kapod)."] },
      { heading: "Mire figyelj?", bullets: ["A Renteninformation levelet évente kapod ~27 éves kortól — őrizd meg, mutatja a várható nyugdíjad", "A nyugdíjkorhatár fokozatosan 67 év felé tolódik (évjárattól függ)", "Rövidebb kint dolgozás után is: az itt szerzett évek NEM vesznek el, nyugdíjkor a német részt is folyósítják"] },
      { heading: "Kiegészítő pillérek", body: ["A betriebliche Altersvorsorge (üzemi nyugdíj) sok munkáltatónál jár vagy választható — kérdezz rá, gyakran munkáltatói hozzájárulással.", "Magánmegtakarítás (pl. ETF-alapú) szintén bevett — a részletekhez kérj pénzügyi tanácsot."] },
    ],
    sources: [{ label: "Deutsche Rentenversicherung", url: "https://www.deutsche-rentenversicherung.de/" }],
  },
  {
    slug: "de-jogositvany",
    title: "Jogosítvány Németországban",
    summary: "A magyar (EU) jogosítvány érvényes — nem kell átírni; cserélni lejáratkor vagy elvesztéskor kell.",
    icon: "car",
    sections: [
      { heading: "Érvényes a magyar jogsi?", body: ["IGEN — az EU-s (kártyaformátumú) magyar jogosítvány Németországban korlátlanul érvényes, NEM kell átíratni német okmányra a beköltözéskor.", "Csere (Umtausch) akkor kell, ha lejár, elveszik, vagy megrongálódik — ilyenkor a lakóhelyed Führerscheinstelle-jénél német okmányt kapsz, vizsga nélkül."] },
      { heading: "Gyakorlati tudnivalók", bullets: ["A cseréhez kell: érvényes okmány(ok), biometrikus fotó, Meldebescheinigung", "A régi, papíralapú jogosítványokat az EU-ban fokozatosan (2033-ig) kártyára kell cserélni", "Friss jogsisként a német Probezeit-szabályok (2 év próbaidő) csak a NÉMETORSZÁGBAN szerzett jogsira vonatkoznak"] },
    ],
    sources: [{ label: "Your Europe — jogosítvány-elismerés az EU-ban", url: "https://europa.eu/youreurope/citizens/vehicles/driving-licence/index_en.htm" }, { label: "ADAC", url: "https://www.adac.de/" }],
  },
  {
    slug: "de-munkanelkuli",
    title: "Munkanélküli-ellátás (Arbeitslosengeld)",
    summary: "ALG I: az utolsó 30 hónapból 12 hónap biztosítás kell; a magyar időszakok is beszámíthatnak (U1).",
    icon: "briefcase",
    sections: [
      { heading: "Arbeitslosengeld I", body: ["Jogosultság: az utolsó 30 hónapban legalább 12 hónap járulékfizetés. Az ellátás a korábbi nettó kb. 60%-a (gyerekkel 67%), jellemzően 6–12 hónapig (50 felett tovább).", "FONTOS határidő: legkésőbb a felmondás kézhezvétele után 3 nappal (de lehetőleg azonnal) jelentkezz arbeitsuchend-nek az Agentur für Arbeit-nál — a késés az ellátás csökkentésével járhat."] },
      { heading: "Magyar munkaviszonnyal", body: ["EU-koordináció: a magyarországi biztosítási időszakok az U1-es igazolással beszámíthatnak a német jogosultságba, ha már dolgoztál Németországban is.", "Az ellátás mellett az Agentur für Arbeit közvetít is — a Jobcenter a tartós (Bürgergeld) ellátásnál lép be."] },
      { heading: "Ha az ALG I lejárt", bullets: ["Bürgergeld (alapellátás) a Jobcenternél — jövedelem-/vagyonvizsgálattal", "A Krankenversicherung az ellátás alatt is megy tovább (az ügynökség fizeti)", "Az álláskeresést dokumentáld — a Mitwirkungspflicht (együttműködés) feltétel"] },
    ],
    sources: [{ label: "Agentur für Arbeit — Arbeitslosengeld", url: "https://www.arbeitsagentur.de/" }],
  },
  {
    slug: "de-auto",
    title: "Autó Németországban",
    summary: "Zulassung a lakóhelyeden, kötelező Haftpflicht, HU (TÜV) 2 évente; behozott autót is regisztrálni kell.",
    icon: "car",
    sections: [
      { heading: "Regisztráció (Zulassung)", body: ["Ha Németországban élsz, az autódat itt kell forgalomba helyezni — a Zulassungsstelle-nél (kell: eVB-szám a biztosítótól, okmányok, adásvételi, SEPA-mandátum a Kfz-Steuerhez).", "Magyarországról hozott autónál is ez a menet: EU-n belül vám nincs, de a német regisztráció (és jellemzően friss HU-vizsga) kell."] },
      { heading: "Kötelezettségek", bullets: ["Kfz-Haftpflichtversicherung (kötelező felelősségbiztosítás) nélkül nincs rendszám", "Hauptuntersuchung (HU, köznyelven „TÜV”) 2 évente — új autónál először 3 év után", "Kfz-Steuer (gépjárműadó) automatikusan, a Zollamt szedi", "Sok belvárosban Umweltplakette (zöld matrica) kell"] },
      { heading: "Tipp", body: ["A tagság az ADAC-nál (assistance) nem kötelező, de népszerű; a biztosítási díj erősen függ az SF-Klasse-tól (kármentes évek) — a magyar kármentességi igazolást sok biztosító elfogadja, kérd ki itthonról."] },
    ],
    sources: [{ label: "ADAC", url: "https://www.adac.de/" }],
  },
  {
    slug: "de-tv-radio-dij",
    title: "TV-rádió díj (Rundfunkbeitrag)",
    summary: "Háztartásonként EGY díj (~18,36 €/hó) — automatikusan megtalálnak az Anmeldung után.",
    icon: "bell",
    sections: [
      { heading: "Hogyan működik?", body: ["A Rundfunkbeitrag háztartásonként fizetendő (jelenleg 18,36 €/hó — az aktuálisat a hivatalos oldalon találod), függetlenül attól, van-e tévéd vagy rádiód.", "A lakcímbejelentés után a Beitragsservice automatikusan LEVÉLBEN megkeres — ne dobd ki, válaszolj, különben visszamenőleg is követelik."] },
      { heading: "Mire figyelj?", bullets: ["EGY lakás = EGY díj: ha lakótársad már fizeti, jelentsd be az ő Beitragsnummer-jével — nem kell duplán fizetni", "Mentesség/kedvezmény: pl. bizonyos szociális ellátások mellett (kérelemre)", "Költözéskor cím-változást jelents, kiköltözéskor (külföldre) szüntesd meg (Abmeldung + igazolás)"] },
    ],
    sources: [{ label: "rundfunkbeitrag.de", url: "https://www.rundfunkbeitrag.de/" }],
  },
  {
    slug: "de-szules-elterngeld",
    title: "Szülés, Elternzeit és Elterngeld",
    summary: "Mutterschutz (6+8 hét), Elternzeit max. 3 év, Elterngeld a nettó ~65%-a (min. 300 / max. 1800 €/hó).",
    icon: "users",
    sections: [
      { heading: "Mutterschutz (anyavédelem)", body: ["A szülés előtt 6 és utána 8 héttel védett időszak jár (Mutterschutzfrist) — ilyenkor a Mutterschaftsgeld + munkáltatói kiegészítés a teljes nettót fedezi.", "A terhességet érdemes (nem kötelező) korán jelezni — onnantól erős felmondási védelem él."] },
      { heading: "Elterngeld (szülői pénz)", body: ["A korábbi nettó kb. 65–67%-a, minimum 300, maximum 1800 €/hó — alap esetben 12 hónapig, +2 „partnerhónappal”, ha a másik szülő is kivesz legalább 2 hónapot.", "Az ElterngeldPlus fél összeggel dupla ideig adható (részmunkaidő mellett éri meg). Az igénylés a tartományi Elterngeldstelle-nél megy."] },
      { heading: "Elternzeit (szülői szabadság)", bullets: ["Gyermekenként max. 3 év, a 8. életévig rugalmasan felhasználható", "Az Elternzeit alatt felmondási védelem van", "A munkáltatónak 7 héttel előre, ÍRÁSBAN kell bejelenteni"] },
    ],
    sources: [{ label: "Familienportal (BMFSFJ)", url: "https://familienportal.de/" }],
  },
  {
    slug: "de-felmondas",
    title: "Felmondás és a jogaid (Kündigung)",
    summary: "Felmondás csak ÍRÁSBAN érvényes; vitatni 3 HÉTEN belül lehet (Kündigungsschutzklage).",
    icon: "document",
    sections: [
      { heading: "A felmondás szabályai", body: ["Németországban a felmondás CSAK papíron, eredeti aláírással érvényes (e-mail/WhatsApp NEM az).", "A törvényi felmondási idő alap esetben 4 hét (a hó 15-ére vagy végére); a munkáltató oldalán a munkaviszony hosszával nő (2 év után 1 hónap, 5 év után 2 hónap…)."] },
      { heading: "Véd a Kündigungsschutz?", body: ["6 hónap munkaviszony után és 10 főnél nagyobb cégnél a Kündigungsschutzgesetz véd: a felmondáshoz indok kell (üzemi, magatartási vagy személyi).", "KRITIKUS HATÁRIDŐ: ha vitatni akarod, a kézhezvételtől számított 3 HÉTEN belül kell keresetet (Kündigungsschutzklage) beadni a munkaügyi bíróságon — utána a felmondás automatikusan érvényessé válik."] },
      { heading: "Ami jár", bullets: ["Arbeitszeugnis (munkabizonyítvány) — mindig kérd ki, „jóindulatúan és igazul” kell szólnia", "A ki nem vett szabadság pénzbeli megváltása", "Abfindung (végkielégítés) NEM automatikus — jellemzően megállapodásból vagy Sozialplanból ered", "Azonnal jelentkezz az Agentur für Arbeit-nál (lásd a munkanélküli-cikket)"] },
    ],
    sources: [{ label: "BMAS — Bundesministerium für Arbeit und Soziales", url: "https://www.bmas.de/" }],
  },
  {
    slug: "de-minijob",
    title: "Minijob és Midijob",
    summary: "A Minijob-határ ~556 €/hó (évente emelkedik) — adómentes zsebpénz vagy kiegészítés, bejelentve.",
    icon: "briefcase",
    sections: [
      { heading: "Minijob", body: ["A Minijob havi keresethatárig (2025-ben 556 €; a minimálbérrel évente emelkedik — az aktuálisat a Minijob-Zentrale oldalán találod) adó- és járulékmentes a munkavállalónak.", "Főállás MELLETT egy Minijob vállalható a főállás érintése nélkül; a Minijob is BEJELENTETT munka — ragaszkodj hozzá (a feketemunka biztosítás nélkül hagy és bírsággal jár)."] },
      { heading: "Midijob", body: ["A Minijob-határ fölött kb. 2000 €/hó-ig Midijob: csökkentett munkavállalói járulék, TELJES társadalombiztosítási védelemmel (egészség, nyugdíj, munkanélküli).", "Több kis állásnál a keresetek összeadódnak — a határ átlépése átsorolást jelent."] },
      { heading: "Jó tudni", bullets: ["Minijobban is jár: minimálbér, fizetett szabadság, betegszabadság, Kündigungsfrist", "A nyugdíjjárulék alól kérhetsz mentességet (Befreiung) — de a fizetése nyugdíjéveket hoz", "Háztartási Minijob (takarítás, gyerekfelügyelet) külön, egyszerűsített bejelentéssel megy"] },
    ],
    sources: [{ label: "Minijob-Zentrale", url: "https://www.minijob-zentrale.de/" }],
  },
  {
    slug: "de-schufa",
    title: "SCHUFA — a német hitelképesség",
    summary: "Lakásbérléshez, mobil-szerződéshez, hitelhez kérik; évente ingyenes önlekérdezés (Datenkopie) jár.",
    icon: "document",
    sections: [
      { heading: "Mi az a SCHUFA?", body: ["A SCHUFA a legnagyobb német hitelinformációs rendszer: bankok, mobilszolgáltatók és főbérlők ellenőrzik rajta a fizetési megbízhatóságod (score).", "Frissen érkezőként még nincs SCHUFA-történeted — ez nem negatív, de emiatt kérhetnek kauciót/előrefizetést az elején."] },
      { heading: "Hogyan kérd le ingyen?", body: ["A GDPR (Art. 15) szerinti Datenkopie ingyenes — a schufa.de-n igényelhető. Lakáspályázathoz a fizetős „SCHUFA-BonitätsAuskunft” a bevett, de sok főbérlőnek az ingyenes másolat is megfelel.", "Hibás bejegyzést (pl. kifizetett, mégis nyitottként szereplő számla) írásban vitathatsz — kötelesek javítani."] },
      { heading: "Így marad jó a score-od", bullets: ["Számlák, részletek határidőre — a fizetési késedelem (Mahnung után) bejegyzést szülhet", "Ne nyiss feleslegesen sok bankszámlát/hitelkeretet rövid idő alatt", "Költözéskor minden szerződést (áram, mobil, internet) rendezz le — az „elfelejtett” számla a leggyakoribb SCHUFA-csapda"] },
    ],
    sources: [{ label: "SCHUFA — ingyenes Datenkopie", url: "https://www.schufa.de/" }, { label: "Verbraucherzentrale", url: "https://www.verbraucherzentrale.de/" }],
  },
  {
    slug: "de-vallalkozas",
    title: "Vállalkozásindítás Németországban",
    summary: "Gewerbeanmeldung pár tízezer forintnyi díjért, vagy Freiberufler közvetlenül a Finanzamtnál; Kleinunternehmer-áfamentesség.",
    icon: "trending",
    sections: [
      { heading: "Gewerbe vagy Freiberufler?", body: ["A legtöbb tevékenység Gewerbe: a helyi Gewerbeamt-nál jelented be (Gewerbeanmeldung, jellemzően 20–60 €) — EU-állampolgárként ugyanúgy, mint egy német.", "A „szabad foglalkozások” (Freie Berufe: pl. fordító, oktató, tervező, orvos) NEM Gewerbék — ők közvetlenül a Finanzamt-nál regisztrálnak. A besorolás adót is érint (Gewerbesteuer csak a Gewerbénél)."] },
      { heading: "Első lépések", bullets: ["Fragebogen zur steuerlichen Erfassung az ELSTER-en → Steuernummer a számlázáshoz", "Kleinunternehmerregelung: az áfa alól mentesülhetsz az éves forgalomhatárig (az aktuális határt az existenzgruender.de mutatja) — számlára kötelező ráírni", "Gewerbeként automatikus az IHK/HWK-tagság (kamara) — kezdőknek gyakran díjkedvezmény", "Egészségbiztosításod önállóként MAGADNAK kell intézni (GKV önkéntes tagság vagy PKV) — ne maradj fedezet nélkül"] },
      { heading: "Magyar vállalkozóként", body: ["Ha Németországban élsz és itt dolgozol, itt kell a tevékenységet bejelenteni — a magyarországi kata/ev. NEM helyettesíti. Határon átnyúló ügyekben (áfa, kettős adóztatás) adótanácsadó (Steuerberater) erősen ajánlott."] },
    ],
    sources: [{ label: "existenzgruender.de (BMWK)", url: "https://www.existenzgruender.de/" }],
  },
];

export const GUIDES_NL: Guide[] = [
  {
    slug: "nl-bejelentkezes",
    title: "Bejelentkezés (inschrijving BRP) és BSN",
    summary: "4+ hónap tartózkodásnál a gemeenténél BRP-regisztráció → BSN; EU-állampolgárként vrij verkeer — nincs engedély.",
    icon: "home",
    sections: [
      { heading: "BRP-regisztráció + BSN", body: ["Ha 4 hónapnál tovább maradsz, a lakóhelyed szerinti gemeenténél (önkormányzat) be kell jelentkezned a BRP-be (Basisregistratie Personen) — időpontfoglalással (afspraak), a beköltözéstől néhány napon belül.", "Ekkor kapod a BSN-t (burgerservicenummer), ami MINDENHEZ kell: munka, bankszámla, zorgverzekering, adó. 4 hónapnál rövidebb tartózkodásnál RNI-regisztrációval kaphatsz BSN-t."] },
      { heading: "Szabad mozgás (vrij verkeer)", body: ["EU-állampolgárként szabad mozgásod van — NINCS szükség tartózkodási engedélyre. Az IND EU-verblijfsdocumentje 2014 óta opcionális.", "3 hónapnál tovább a feltétel: munka / önfoglalkoztatás VAGY elég megélhetés + zorgverzekering."] },
      { heading: "Hosszabb távon", bullets: ["5 év jogszerű tartózkodás → duurzaam verblijfsrecht (tartós tartózkodás), kérhető dokumentummal az IND-nél", "Állampolgárság (naturalisatie) 5 év után, inburgering (A2 nyelv + KNM) vizsgával — FIGYELEM: Hollandia fő szabály szerint a korábbi állampolgárság LEMONDÁSÁT kéri (sok kivétellel, pl. holland házastárs)"] },
    ],
    sources: [{ label: "IND — EU/EER-burgers", url: "https://ind.nl/en/eu-eea-and-swiss-citizens" }, { label: "Rijksoverheid — BSN", url: "https://www.government.nl/topics/personal-data/citizen-service-number-bsn" }],
  },
  {
    slug: "nl-egeszsegbiztositas",
    title: "Egészségbiztosítás (zorgverzekering)",
    summary: "Kötelező basisverzekering (~140 €/hó) a biztosítás/munka kezdetétől 4 hónapon belül; a biztosítót TE választod.",
    icon: "heart",
    sections: [
      { heading: "Kötelező alapbiztosítás", body: ["Hollandiában KÖTELEZŐ a basisverzekering (alap-egészségbiztosítás), ha itt laksz vagy dolgozol — jellemzően a start-tól számított 4 hónapon belül kell megkötnöd (visszamenőleg is fizetendő).", "A zorgverzekeraart TE választod (Zilveren Kruis, VGZ, CZ, Menzis…) — az alapcsomag tartalma törvényi, de az ár és a szolgáltatás eltér. Havidíj ~140 €/hó (2025)."] },
      { heading: "Eigen risico és zorgtoeslag", body: ["Van egy éves eigen risico (önrész, ~385 €/év) — bizonyos költségeknél előbb ezt fizeted, mielőtt a biztosító fizet (a háziorvos és a gyerekek mentesek).", "Alacsony jövedelemnél a Belastingdienst zorgtoeslag (egészségügyi hozzájárulás) támogatást ad — igényelhető."] },
      { heading: "Gyakorlat", bullets: ["A huisarts (háziorvos) az első kontakt és a „kapuőr” a szakorvoshoz", "18 év alatti gyerekek díjmentesen biztosítottak a szülő csomagjában", "Fogászat és fizioterápia jellemzően NEM az alapcsomagban — kiegészítő (aanvullend) kell"] },
    ],
    sources: [{ label: "Rijksoverheid — Zorgverzekering", url: "https://www.government.nl/topics/health-insurance" }, { label: "Zorgverzekeringslijn", url: "https://www.zorgverzekeringslijn.nl/" }],
  },
  {
    slug: "nl-adozas",
    title: "Adózás (belasting) és DigiD",
    summary: "A bérből loonheffing; éves aangifte a Belastingdiensten DigiD-vel; expatnak 30%-regeling.",
    icon: "document",
    sections: [
      { heading: "DigiD és a BSN", body: ["A DigiD a holland digitális azonosítód — ezzel intézed online a hivatali ügyeket (adó, gemeente, egészségügy). A BRP-regisztráció (BSN) után igényelhető.", "A jövedelemadó a Box 1 (munka/otthon) progresszív sávjaiban működik; a munkáltató a bérből vonja a loonheffinget."] },
      { heading: "30%-regeling (expat-kedvezmény)", body: ["Külföldről toborzott, képzett munkavállalóknak a bér max. 30%-a adómentesen fizethető (belastingdienst-engedéllyel, 150 km-szabály + bérküszöb). A kulcs 2027-től 27%-ra csökken.", "A kedvezményt a munkáltatóddal együtt igényled az IND/Belastingdienst felé."] },
      { heading: "Aangifte (adóbevallás)", body: ["Az éves aangifte-t a Mijn Belastingdienst portálon (DigiD-vel) adod be — a heffingskortingen (algemene + arbeidskorting) miatt gyakran VISSZAJÁR pénz.", "Határidő jellemzően május 1.; halasztás kérhető."] },
    ],
    sources: [{ label: "Belastingdienst", url: "https://www.belastingdienst.nl/" }, { label: "DigiD", url: "https://www.digid.nl/en" }],
  },
  {
    slug: "nl-iskola",
    title: "Iskola és gyerek (school)",
    summary: "Leerplicht 5–16 év, ingyenes állami iskola; a nieuwkomers-osztály segít a holland nyelvvel.",
    icon: "bookmark",
    sections: [
      { heading: "Tankötelezettség (leerplicht)", body: ["A leerplicht 5 éves kortól 16 éves korig tart (utána 18-ig kwalificatieplicht, amíg nincs startkwalificatie). Az állami iskola ingyenes (kis önkéntes hozzájárulás lehet).", "A legtöbb gyerek már 4 évesen kezdi a basisschoolt."] },
      { heading: "A rendszer", bullets: ["Basisschool (4–12 év, 8 csoport)", "A végén doorstroomtoets (korábban CITO) segíti a középiskola-szintet", "Középiskola: VMBO (szakmai), HAVO, VWO (egyetem felé) — a szint a toets + tanári javaslat alapján"] },
      { heading: "Újonnan érkező gyerek", body: ["Ha a gyerek nem tud hollandul, nieuwkomersklas / schakelklas (felzárkóztató osztály) segíti a nyelvet, mielőtt a rendes osztályba kerül."] },
    ],
    sources: [{ label: "Rijksoverheid — Onderwijs", url: "https://www.government.nl/topics/primary-education" }, { label: "Rijksoverheid — Leerplicht", url: "https://www.rijksoverheid.nl/onderwerpen/leerplicht" }],
  },
  {
    slug: "nl-munkavallalas",
    title: "Munkavállalás (werk)",
    summary: "EU-állampolgárként szabadon dolgozhatsz; minimumloon + 8% vakantiegeld + írott arbeidsovereenkomst véd.",
    icon: "briefcase",
    sections: [
      { heading: "Szabad munkavállalás", body: ["EU-állampolgárként engedély nélkül, szabadon dolgozhatsz Hollandiában — csak BSN kell.", "Az írott arbeidsovereenkomst (munkaszerződés) rögzíti a bért, a munkaidőt és a felmondási feltételeket. Gyakori a láncszerződés (max 3 határozott idejű, utána határozatlan)."] },
      { heading: "Bér és juttatások", bullets: ["Törvényi minimumloon: órabérben megadva (2024 óta egységes óradíj), ~14 €/óra körül (2025 — ellenőrizd az aktuálisat)", "8% vakantiegeld (szabadságpénz), jellemzően májusban kifizetve", "Min. évi 4× a heti munkaóraszám fizetett szabadság (teljes munkaidőnél ~20 nap)"] },
      { heading: "Felmondás és WW", body: ["Az ontslag (felmondás) útja az UWV-n vagy a kantonrechteren keresztül megy; jár transitievergoeding (végkielégítés).", "Munkanélküliség esetén az UWV-nél igényelhető WW (werkloosheidsuitkering) — bizonyos munkahónapok után."] },
    ],
    sources: [{ label: "Rijksoverheid — Minimumloon", url: "https://www.government.nl/topics/minimum-wage" }, { label: "UWV", url: "https://www.uwv.nl/" }],
  },
  {
    slug: "nl-bankszamla",
    title: "Bankszámla (betaalrekening)",
    summary: "A fizetéshez és a lakbérhez kell; ING/Rabobank/ABN AMRO vagy online (bunq). iDEAL a fő fizetőmód.",
    icon: "trending",
    sections: [
      { heading: "Számlanyitás", body: ["Nyiss betaalrekeninget (folyószámla) — ING, Rabobank, ABN AMRO, vagy online (bunq, Revolut, N26).", "Kell: BSN + útlevél/igazolvány (gyakran lakcím-igazolás). EU-ban jogod van alap-fizetési számlához akkor is, ha még nincs minden papírod."] },
      { heading: "Fizetés", bullets: ["Az iDEAL a domináns online fizetés (banki átutalás alapú)", "A PIN (debit/betaalpas) mindenhol elfogadott; hitelkártya kevésbé elterjedt — vigyél debitet", "SEPA-átutalás (overschrijving) az alap; automatische incasso a rezsire/biztosításra"] },
      { heading: "Betétvédelem", body: ["Az EU-szabály szerint a betétek bankonként 100 000 €-ig védettek (depositogarantiestelsel)."] },
    ],
    sources: [{ label: "Rijksoverheid — Bankrekening", url: "https://www.government.nl/topics/banking" }],
  },
  {
    slug: "nl-lakasberles",
    title: "Lakásbérlés (huren)",
    summary: "Huurcontract; waarborgsom max 2 havi (2023); figyelj a servicekosten-re és a lakáshiányra.",
    icon: "home",
    sections: [
      { heading: "Bérleti szerződés", body: ["A huurcontract rögzíti a kale huurt (csupasz bér) + a servicekosten-t (rezsi/szolgáltatás). Mindig az összköltséget nézd!", "2023 óta (Wet goed verhuurderschap) a waarborgsom (kaució) max 2 havi bér lehet, és a kiköltözés után max 14 napon belül vissza kell adni."] },
      { heading: "Bérfajták és plafon", bullets: ["Sociale huur (szociális, ponthatár alatt) vs. vrije sector (piaci)", "A puntensysteem (WWS) a lakás pontszáma alapján maximalizálja a bért — a Huurcommissie ellenőrzi", "Bérlőként 2015 óta általában NEM fizetsz bemiddelingskosten-t (ügynöki díjat), ha az ügynök a bérbeadónak dolgozik"] },
      { heading: "Lakáshiány és jogvédelem", body: ["Hollandiában SÚLYOS a lakáshiány, főleg a Randstadban — nehéz és versengő a keresés. Vigyázz a csalókkal (előre kért kaució lakásnézés nélkül).", "Bérleti vitában vagy túl magas bér gyanújánál a Huurcommissie, jogi kérdésben a Juridisch Loket segít."] },
    ],
    sources: [{ label: "Rijksoverheid — Huurwoning", url: "https://www.rijksoverheid.nl/onderwerpen/huurwoning" }, { label: "Huurcommissie", url: "https://www.huurcommissie.nl/" }],
  },
  {
    slug: "nl-digid",
    title: "DigiD — a holland digitális ügyintézés kulcsa",
    summary: "BSN-nel igényled; enélkül nincs online adóbevallás, toeslagen, egészségügyi portál — az első dolgok egyike legyen.",
    icon: "lock",
    sections: [
      { heading: "Mi az a DigiD?", body: ["A DigiD a holland állami digitális azonosító: ezzel lépsz be az adóhivatalhoz (Belastingdienst), a támogatásokhoz (toeslagen), az egészségügyi portálokhoz, a településedhez (gemeente) — szinte MINDEN hivatalos ügyhöz kell.", "Igényléséhez BSN (burgerservicenummer) kell — azt a gemeente-bejelentkezéskor kapod."] },
      { heading: "Igénylés és használat", bullets: ["A digid.nl-en igényled → postai aktiváló kód érkezik a bejelentett címedre (pár nap)", "Töltsd le a DigiD appot — a legtöbb helyre ma már app + PIN a belépés", "Az sms-es belépés gyengébb szint; egyes szolgáltatásokhoz (pl. egészségügy) magasabb szint kell", "A MijnOverheid a hivatalos digitális postaládád — kapcsold be az értesítéseket, a hivatalok IDE leveleznek"] },
    ],
    sources: [{ label: "netherlandsworldwide.nl — DigiD", url: "https://www.netherlandsworldwide.nl/digid" }],
  },
  {
    slug: "nl-jogositvany",
    title: "Jogosítvány Hollandiában",
    summary: "A magyar (EU) jogosítvány érvényes; cserélni (omwisselen) lejáratkor a gemeentén keresztül, az RDW-nél kell.",
    icon: "car",
    sections: [
      { heading: "Érvényes a magyar jogsi?", body: ["IGEN — az EU-s magyar jogosítvány Hollandiában érvényes; beköltözéskor NEM kötelező holland okmányra cserélni (az EU-szabály szerinti érvényességi időn belül).", "Csere (omwisselen) lejáratkor vagy elvesztéskor: a lakóhelyed gemeente-jénél adod be, az RDW intézi — vizsga nélkül."] },
      { heading: "Gyakorlati tudnivalók", bullets: ["A cseréhez kell: BSN, érvényes okmány, fotó (holland szabvány szerinti)", "Egyes kategóriáknál/eseteknél egészségügyi nyilatkozat (Gezondheidsverklaring, CBR) kell", "A holland jogsi 10 évig érvényes; a cserét az RDW oldalán tudod követni"] },
    ],
    sources: [{ label: "RDW — rijbewijs", url: "https://www.rdw.nl/" }],
  },
  {
    slug: "nl-munkanelkuli",
    title: "Munkanélküli-ellátás (WW-uitkering)",
    summary: "UWV: 26 hét munka az utolsó 36 hétben; az első 2 hónapban 75%, utána 70% — DigiD-vel igényled.",
    icon: "briefcase",
    sections: [
      { heading: "Jogosultság", body: ["WW-uitkering jár, ha az utolsó 36 hétből legalább 26-ban dolgoztál, és nem a te hibádból szűnt meg a munkaviszony.", "Az ellátás az első 2 hónapban a (maximált) napi bér 75%-a, utána 70%; az időtartam a munkatörténetedtől függ (minimum 3 hónap). Az igénylés az uwv.nl-en, DigiD-vel — lehetőleg az utolsó munkanap utáni EGY héten belül."] },
      { heading: "Magyar munkaviszonnyal", body: ["EU-koordináció: a magyar biztosítási idők az U1-es igazolással beszámíthatnak, ha Hollandiában is dolgoztál.", "A WW mellett álláskeresési kötelezettség van (sollicitatieplicht) — jellemzően heti 1 dokumentált pályázat, a Werkmap-ban vezetve."] },
      { heading: "Jó tudni", bullets: ["Betegség esetén jelentsd az UWV-nek — más ellátás (ZW) léphet be", "Ha lejár a WW: a gemeente bijstand (szociális segély) a következő háló", "A vakantiegeld (szabadságpénz, 8%) a WW-re is jár, májusban fizetik"] },
    ],
    sources: [{ label: "UWV — WW-uitkering", url: "https://www.uwv.nl/" }],
  },
  {
    slug: "nl-csaladi-potlek",
    title: "Kinderbijslag (családi pótlék)",
    summary: "Az SVB fizeti, NEGYEDÉVENTE, a gyerek kora szerint; mellé jövedelemfüggő kindgebonden budget járhat.",
    icon: "users",
    sections: [
      { heading: "Ki jogosult?", body: ["Ha Hollandiában élsz vagy dolgozol, a 18 év alatti gyerek(ek) után kinderbijslag jár — EU-állampolgárként magyarként is, akkor is, ha a gyerek Magyarországon él (EU-koordinációval, különbözet-elszámolással).", "Az összeg a gyerek korával nő (0–5 / 6–11 / 12–17 sáv), és NEGYEDÉVENTE utalják — az aktuális összegeket az SVB oldalán találod."] },
      { heading: "Igénylés", bullets: ["Az SVB-nél, DigiD-vel — ha a baba Hollandiában születik és be van jelentve, az SVB gyakran magától felveszi a kapcsolatot", "Külföldi (magyar) anyakönyvi kivonatot kérhetnek", "Egy gyerek után egyszerre egy országból jár teljes ellátás — a magyar családi pótlékról nyilatkozni kell"] },
      { heading: "Kindgebonden budget", body: ["A kinderbijslag MELLÉ jövedelemfüggő kiegészítés (kindgebonden budget) járhat a Belastingdienst toeslagen-rendszeréből — gyakran automatikusan felajánlják, de a Mijn toeslagen-ben magad is igényelheted (lásd a támogatások-cikket)."] },
    ],
    sources: [{ label: "SVB — kinderbijslag", url: "https://www.svb.nl/nl/" }],
  },
  {
    slug: "nl-toeslagen",
    title: "Támogatások (toeslagen): zorg-, huur-, kinderopvangtoeslag",
    summary: "Jövedelemfüggő állami támogatások a Belastingdiensttől — sok magyar NEM igényli, pedig járna neki.",
    icon: "trending",
    sections: [
      { heading: "Milyen toeslag létezik?", bullets: ["Zorgtoeslag — az egészségbiztosítási díjhoz (alacsony/közepes jövedelemnél a havi díj jelentős részét fedezheti)", "Huurtoeslag — lakbér-támogatás (bérleti díj- és jövedelemhatárokkal)", "Kinderopvangtoeslag — bölcsőde/gyerekfelügyelet költségeihez (dolgozó szülőknél)", "Kindgebonden budget — gyerekek utáni jövedelemfüggő kiegészítés"] },
      { heading: "Hogyan igényeld?", body: ["A Mijn toeslagen felületen (Belastingdienst), DigiD-vel — ÉV KÖZBEN is beadható, és visszamenőleg is jár az adott évre.", "A támogatás ELŐLEG: a becsült jövedelmed alapján kapod. Ha többet keresel a becsültnél, a különbözetet VISSZAKÉRIK — ezért a jövedelmed inkább felfelé becsüld, és minden változást (fizetésemelés, munkahelyváltás) azonnal jelents be."] },
      { heading: "Magyar munkavállalóként", body: ["Sok kint dolgozó magyar nem tud a zorgtoeslagról, pedig a kötelező (drága) egészségbiztosítás mellé ez a rendszer beépített ellensúlya — egy 5 perces ellenőrzést mindenképp megér."] },
    ],
    sources: [{ label: "Belastingdienst — toeslagen", url: "https://www.belastingdienst.nl/" }],
  },
  {
    slug: "nl-nyugdij",
    title: "Nyugdíj Hollandiában (AOW + pensioen)",
    summary: "Az AOW államnyugdíj a NL-ben töltött évekkel épül (évi ~2%); mellé munkahelyi pensioen — a magyar évek koordinálva.",
    icon: "clock",
    sections: [
      { heading: "AOW — az állami pillér", body: ["Az AOW nem járulék-, hanem LAKÓHELY-alapú: minden Hollandiában (biztosítottként) töltött év a teljes AOW kb. 2%-át építi — 50 év alatt épül fel a teljes összeg.", "Aki csak pár évet él itt, arányos AOW-t kap majd nyugdíjkorban — a magyar nyugdíjjal EU-koordinációban, a kint töltött évek NEM vesznek el. Az AOW-korhatár a várható élettartammal emelkedik (jelenleg 67 körül) — az aktuálisat az SVB oldalán találod."] },
      { heading: "Munkahelyi nyugdíj (pensioen)", body: ["A legtöbb munkáltatónál kötelező ágazati nyugdíjalap (pensioenfonds) van — a levonást a bérlapon látod.", "A mijnpensioenoverzicht.nl (DigiD-vel) EGY helyen mutatja az összes holland nyugdíj-jogosultságod — évente nézz rá."] },
      { heading: "Jó tudni", bullets: ["Munkahelyváltásnál a kis nyugdíjakat az alapok ma már jellemzően automatikusan viszik át az új alapba", "Hazaköltözéskor a jogosultságok megmaradnak — nyugdíjkorban Magyarországra is folyósítják", "Az AOW-hoz élettársi/házastársi státusz is számít (összegkülönbség egyedülálló/páros között)"] },
    ],
    sources: [{ label: "SVB — AOW", url: "https://www.svb.nl/nl/" }, { label: "mijnpensioenoverzicht.nl", url: "https://www.mijnpensioenoverzicht.nl/" }],
  },
];

/** Az összes guide (statikus generáláshoz + slug-kereséshez). */
export const GUIDES: Guide[] = [...GUIDES_CH, ...GUIDES_AT, ...GUIDES_DE, ...GUIDES_NL];

/** A választott ország guide-jai (a lista + kereső). */
export function getGuides(country: string | null | undefined): Guide[] {
  if (country === "AT") return GUIDES_AT;
  if (country === "DE") return GUIDES_DE;
  if (country === "NL") return GUIDES_NL;
  return GUIDES_CH;
}

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

/** A cikk országa a slug-előtagból (at-/de-/nl-, egyébként CH). */
export function guideCountry(slug: string): "CH" | "AT" | "DE" | "NL" {
  if (slug.startsWith("at-")) return "AT";
  if (slug.startsWith("de-")) return "DE";
  if (slug.startsWith("nl-")) return "NL";
  return "CH";
}

// ---------------------------------------------------------------------------
// Belső linkelés: Tudásbázis ↔ Szaknévsor (SEO + konverzió).
// A cikk-slug → kapcsolódó Szaknévsor-kategóriák; az {id} a /szaknevsor?cat=<id>
// szűrőhöz, a {label} a megjelenítéshez. A kategória-id-k a kanonikusak
// (lásd scripts/gen-categories.mjs). Külön map-ben, a guide-objektumok nélkül.
// ---------------------------------------------------------------------------
export interface RelatedCategory {
  id: string;
  label: string;
}

const GUIDE_RELATED_CATEGORIES: Record<string, RelatedCategory[]> = {
  "bejelentkezes-letelepedes": [
    { id: "koltoztetes", label: "Költöztetés" },
    { id: "jogtanacsado", label: "Jogtanácsadó" },
  ],
  "egeszsegbiztositas-krankenkasse": [
    { id: "biztositas", label: "Biztosítás" },
    { id: "alkusz", label: "Biztosítási alkusz" },
  ],
  "adozas-quellensteuer": [
    { id: "adotanacsado", label: "Adótanácsadó" },
    { id: "konyveles", label: "Könyvelés" },
  ],
  "iskola-es-gyerek": [
    { id: "babysitter", label: "Gyermekfelügyelet" },
    { id: "gyermekorvos", label: "Gyermekorvos" },
  ],
  "munkavallalas": [
    { id: "jogtanacsado", label: "Jogtanácsadó" },
    { id: "fordito", label: "Fordító" },
  ],
  "bankszamla": [
    { id: "banki_ugyintezo", label: "Banki ügyintéző" },
    { id: "penzugyi_tanacsado", label: "Pénzügyi tanácsadó" },
  ],
  "ahv-nyugdij": [
    { id: "penzugyi_tanacsado", label: "Pénzügyi tanácsadó" },
    { id: "biztositas", label: "Biztosítás" },
  ],
  "magyar-kepviselet": [
    { id: "fordito", label: "Fordító" },
    { id: "forditasszak", label: "Szakfordító" },
  ],
  "csaladi-potlek": [
    { id: "penzugyi_tanacsado", label: "Pénzügyi tanácsadó" },
  ],
  "munkanelkuli-biztositas": [
    { id: "jogtanacsado", label: "Jogtanácsadó" },
    { id: "penzugyi_tanacsado", label: "Pénzügyi tanácsadó" },
  ],
};

/**
 * Slug → ország-semleges "topic"-kulcs a GUIDE_RELATED_CATEGORIES-hoz. A svájci
 * (előtag nélküli) slug MAGA a topic-kulcs (pl. "iskola-es-gyerek"); az
 * AT/DE/NL megfelelőjük ("at-iskola", "de-iskola", "nl-iskola") ugyanarra a
 * kulcsra képződik, hogy egy osztrák/német/holland vállalkozásnál is a SAJÁT
 * országának cikke linkelődjön be, ne a svájci (lásd: gyermekorvos AT-nál
 * korábban a "kantononként szervezve" / ch.ch-s cikkre mutatott).
 */
const GUIDE_TOPIC: Record<string, string> = {
  "at-bejelentkezes": "bejelentkezes-letelepedes",
  "de-bejelentkezes": "bejelentkezes-letelepedes",
  "nl-bejelentkezes": "bejelentkezes-letelepedes",
  "at-egeszsegbiztositas": "egeszsegbiztositas-krankenkasse",
  "de-egeszsegbiztositas": "egeszsegbiztositas-krankenkasse",
  "nl-egeszsegbiztositas": "egeszsegbiztositas-krankenkasse",
  "at-adozas": "adozas-quellensteuer",
  "de-adozas": "adozas-quellensteuer",
  "nl-adozas": "adozas-quellensteuer",
  "at-iskola": "iskola-es-gyerek",
  "de-iskola": "iskola-es-gyerek",
  "nl-iskola": "iskola-es-gyerek",
  "at-munkavallalas": "munkavallalas",
  "de-munkavallalas": "munkavallalas",
  "nl-munkavallalas": "munkavallalas",
  "at-bankszamla": "bankszamla",
  "de-bankszamla": "bankszamla",
  "nl-bankszamla": "bankszamla",
  "at-nyugdij": "ahv-nyugdij",
  "de-nyugdij": "ahv-nyugdij",
  "nl-nyugdij": "ahv-nyugdij",
  "de-csaladi-potlek": "csaladi-potlek",
  "at-csaladi-potlek": "csaladi-potlek",
  "nl-csaladi-potlek": "csaladi-potlek",
  "at-szules": "csaladi-potlek",
  "de-szules-elterngeld": "csaladi-potlek",
  "nl-toeslagen": "csaladi-potlek",
  "de-munkanelkuli": "munkanelkuli-biztositas",
  "at-munkanelkuli": "munkanelkuli-biztositas",
  "nl-munkanelkuli": "munkanelkuli-biztositas",
  "de-felmondas": "munkavallalas",
  "de-minijob": "munkavallalas",
  "de-schufa": "bankszamla",
  "de-vallalkozas": "adozas-quellensteuer",
  "nl-digid": "bejelentkezes-letelepedes",
  "at-lakasberles": "lakasberles",
  "de-lakasberles": "lakasberles",
  "nl-lakasberles": "lakasberles",
};
function guideTopic(slug: string): string {
  return GUIDE_TOPIC[slug] ?? slug;
}

/** Egy cikkhez kapcsolódó Szaknévsor-kategóriák (üres tömb, ha nincs). */
export function relatedCategoriesForGuide(slug: string): RelatedCategory[] {
  return GUIDE_RELATED_CATEGORIES[guideTopic(slug)] ?? [];
}

/**
 * Pénz-témájú cikkek — ezeken a cikk-oldal a (jelölt) hazautalás-affiliate
 * CTA-t is mutatja (aki a kinti fizetésről/ellátásról olvas, annak releváns
 * a kedvező hazautalás). Explicit lista, nem heurisztika.
 */
const MONEY_GUIDE_SLUGS = new Set<string>([
  // CH
  "bankszamla", "adozas-quellensteuer", "munkavallalas", "ahv-nyugdij",
  "csaladi-potlek", "munkanelkuli-biztositas", "harmadik-piller-saule-3a",
  // AT
  "at-bankszamla", "at-adozas", "at-munkavallalas", "at-nyugdij",
  "at-csaladi-potlek", "at-munkanelkuli", "at-szules",
  // DE
  "de-bankszamla", "de-adozas", "de-munkavallalas", "de-nyugdij",
  "de-csaladi-potlek", "de-munkanelkuli", "de-szules-elterngeld",
  "de-minijob", "de-schufa",
  // NL
  "nl-bankszamla", "nl-adozas", "nl-munkavallalas", "nl-nyugdij",
  "nl-csaladi-potlek", "nl-munkanelkuli", "nl-toeslagen",
]);

export function isMoneyGuide(slug: string): boolean {
  return MONEY_GUIDE_SLUGS.has(slug);
}

/**
 * Egy Szaknévsor-kategóriához kapcsolódó útmutatók (fordított irány) — CSAK a
 * vállalkozás országának saját cikkei közül (lásd guideTopic fenti kommentje).
 */
export function guidesForCategory(categoryId: string, country?: string | null): Guide[] {
  if (!categoryId) return [];
  const pool = getGuides(country);
  return pool.filter((g) =>
    (GUIDE_RELATED_CATEGORIES[guideTopic(g.slug)] ?? []).some((c) => c.id === categoryId),
  );
}
