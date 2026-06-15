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

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
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

/** Egy cikkhez kapcsolódó Szaknévsor-kategóriák (üres tömb, ha nincs). */
export function relatedCategoriesForGuide(slug: string): RelatedCategory[] {
  return GUIDE_RELATED_CATEGORIES[slug] ?? [];
}

/** Egy Szaknévsor-kategóriához kapcsolódó útmutatók (fordított irány). */
export function guidesForCategory(categoryId: string): Guide[] {
  if (!categoryId) return [];
  return GUIDES.filter((g) =>
    (GUIDE_RELATED_CATEGORIES[g.slug] ?? []).some((c) => c.id === categoryId),
  );
}
