/**
 * Angol Kvíz — kérdés-bank (a napi 3 kérdéses kvíz GB-változata).
 *
 * Témák: földrajz, történelem, kultúra, nyelv, étel & ital, közlekedés,
 * intézmények, hétköznapok. Minden kérdés 4 választás + magyarázat.
 *
 * ⚠️ Ez a KÖNNYED napi kvíz, NEM a Life in the UK vizsga-szimulátor (az a
 * gb-lifeintheuk-bank.ts). Itt szórakoztató köztudás van, ott vizsga-anyag.
 *
 * Forrás: általános brit köztudás + hivatalos ügyintézési alapok (NIN, NHS,
 * council tax). Tájékoztató jellegű, nem hivatalos tanácsadás.
 */

import type { QuizCategory, QuizQuestion } from "./quiz-bank";

/** Kategória-meta a GB kvízhez. */
export const GB_QUIZ_CATEGORY_META: Record<QuizCategory, { label: string; emoji: string }> = {
  geography:    { label: "Földrajz",       emoji: "🗺️" },
  history:      { label: "Történelem",     emoji: "📜" },
  culture:      { label: "Kultúra",        emoji: "🎭" },
  language:     { label: "Nyelv",          emoji: "💬" },
  food:         { label: "Étel & ital",    emoji: "🍽️" },
  transport:    { label: "Közlekedés",     emoji: "🚆" },
  institutions: { label: "Intézmények",    emoji: "🏛️" },
  everyday:     { label: "Hétköznapok",    emoji: "☕" },
};

export const GB_QUIZ_BANK: QuizQuestion[] = [
  // === FÖLDRAJZ ===
  { id: "gb-geo-nations", category: "geography", question: "Mely négy országból áll az Egyesült Királyság?", options: ["Anglia, Skócia, Wales, Írország", "Anglia, Skócia, Wales, Észak-Írország", "Anglia, Wales, Cornwall, Man-sziget", "Nagy-Britannia, Skócia, Wales, Ulster"], correct: 1, explanation: "Észak-Írország a negyedik — az Ír Köztársaság önálló ország, nem tagja az Egyesült Királyságnak." },
  { id: "gb-geo-longest-river", category: "geography", question: "Melyik a leghosszabb folyó az Egyesült Királyságban?", options: ["Temze", "Severn", "Trent", "Mersey"], correct: 1, explanation: "A Severn (354 km) hosszabb, mint a jóval ismertebb Temze." },
  { id: "gb-geo-highest", category: "geography", question: "Mi Anglia legmagasabb hegye?", options: ["Ben Nevis", "Snowdon", "Scafell Pike", "Helvellyn"], correct: 2, explanation: "Scafell Pike (978 m) a Lake Districtben. A Ben Nevis skót, a Snowdon walesi." },
  { id: "gb-geo-second-city", category: "geography", question: "Melyik Anglia második legnépesebb városa?", options: ["Manchester", "Birmingham", "Liverpool", "Leeds"], correct: 1, explanation: "Birmingham, a West Midlands központja." },
  { id: "gb-geo-regions", category: "geography", question: "Hány hivatalos (ONS) régiója van Angliának?", options: ["6", "9", "12", "16"], correct: 1, explanation: "9 régió: London, South East, South West, East of England, West és East Midlands, North West, North East, Yorkshire and the Humber." },
  { id: "gb-geo-lakedistrict", category: "geography", question: "Miről híres a Lake District?", options: ["Sivatagos táj", "Tavak és hegyek, nemzeti park", "Ipari kikötők", "Szőlőültetvények"], correct: 1, explanation: "Anglia legnagyobb nemzeti parkja, tavakkal és hegyekkel — a romantikus költők tája." },

  // === TÖRTÉNELEM ===
  { id: "gb-hist-1066", category: "history", question: "Mi történt 1066-ban Hastingsnél?", options: ["A Magna Carta aláírása", "A normann hódítás", "A londoni nagy tűzvész", "Az ipari forradalom kezdete"], correct: 1, explanation: "Hódító Vilmos legyőzte II. Haroldot — az utolsó sikeres invázió Anglia ellen." },
  { id: "gb-hist-magnacarta", category: "history", question: "Mit korlátozott a Magna Carta 1215-ben?", options: ["A parlament hatalmát", "A király hatalmát", "Az egyház vagyonát", "A kereskedelmet"], correct: 1, explanation: "A király hatalmát korlátozta — a brit alkotmányos hagyomány egyik alapköve." },
  { id: "gb-hist-industrial", category: "history", question: "Hol indult az ipari forradalom a 18. században?", options: ["Franciaországban", "Nagy-Britanniában", "Németországban", "Hollandiában"], correct: 1, explanation: "Nagy-Britanniában — gőzgép, textilipar, vasút." },
  { id: "gb-hist-nhs", category: "history", question: "Mikor jött létre az NHS (az állami egészségügy)?", options: ["1918", "1948", "1968", "1979"], correct: 1, explanation: "1948-ban — adóból finanszírozott, a használat pontján ingyenes ellátás." },
  { id: "gb-hist-fire", category: "history", question: "Melyik évben pusztított a londoni nagy tűzvész?", options: ["1605", "1666", "1745", "1812"], correct: 1, explanation: "1666-ban — a City nagy részét elpusztította, de a pestisjárványnak is véget vetett." },
  { id: "gb-hist-brexit", category: "history", question: "Mikor lépett ki ténylegesen az Egyesült Királyság az EU-ból?", options: ["2016", "2018", "2020", "2022"], correct: 2, explanation: "2020. január 31-én lépett ki; az átmeneti időszak 2020. december 31-én ért véget — ekkor szűnt meg a szabad mozgás." },

  // === KULTÚRA ===
  { id: "gb-cult-shakespeare", category: "culture", question: "Melyik városban született Shakespeare?", options: ["London", "Stratford-upon-Avon", "Oxford", "Canterbury"], correct: 1, explanation: "Stratford-upon-Avon, Warwickshire — ma is zarándokhely." },
  { id: "gb-cult-beatles", category: "culture", question: "Melyik városból származik a Beatles?", options: ["Manchester", "Liverpool", "London", "Birmingham"], correct: 1, explanation: "Liverpool — a Cavern Clubban kezdték." },
  { id: "gb-cult-bbc", category: "culture", question: "Hogyan finanszírozzák elsősorban a BBC-t?", options: ["Reklámokból", "A nézők által fizetett TV licence-ből", "Kizárólag állami költségvetésből", "Előfizetői díjból, mint a Netflix"], correct: 1, explanation: "A TV licence fee-ből — ezért nincs reklám a BBC csatornáin." },
  { id: "gb-cult-premier", category: "culture", question: "Hogy hívják Anglia legfelső szintű futballbajnokságát?", options: ["Championship", "Premier League", "FA Cup", "League One"], correct: 1, explanation: "A Premier League — a világ egyik legnézettebb bajnoksága." },
  { id: "gb-cult-queue", category: "culture", question: "Melyik szokás számít különösen fontosnak a brit hétköznapokban?", options: ["A hangos beszéd tömegben", "A sorban állás (queuing) rendjének betartása", "A kézfogás minden találkozáskor", "Az előre nem jelzett látogatás"], correct: 1, explanation: "A sor betartása komoly társadalmi norma — a besorolás („queue jumping”) sértésnek számít." },

  // === NYELV ===
  { id: "gb-lang-flat", category: "language", question: "Mit jelent brit angolban a „flat”?", options: ["Lapos terület", "Lakás", "Defekt", "Alagsor"], correct: 1, explanation: "Lakás (amerikai angolban: apartment). Autónál viszont a „flat tyre” defektet jelent." },
  { id: "gb-lang-cheers", category: "language", question: "Mit jelenthet hétköznapi brit használatban a „cheers”?", options: ["Csak koccintáskor: egészségedre", "Köszönöm / szia is", "Sajnálom", "Vigyázz"], correct: 1, explanation: "Koccintáson kívül gyakran „köszi” vagy „szia” értelemben használják." },
  { id: "gb-lang-queue", category: "language", question: "Mit jelent a „queue”?", options: ["Kérdés", "Sor (várakozó)", "Gyorsaság", "Nyugta"], correct: 1, explanation: "Sor — az amerikai angol a „line” szót használja." },
  { id: "gb-lang-pants", category: "language", question: "Mit jelent brit angolban a „pants”?", options: ["Nadrág", "Alsónadrág", "Zokni", "Kabát"], correct: 1, explanation: "Alsónadrág! A nadrág brit angolul „trousers” — ez klasszikus félreértés-forrás." },
  { id: "gb-lang-fortnight", category: "language", question: "Mennyi idő egy „fortnight”?", options: ["4 nap", "1 hét", "2 hét", "1 hónap"], correct: 2, explanation: "Két hét — a bérek és a szabadságok kapcsán is gyakran használják." },

  // === ÉTEL & ITAL ===
  { id: "gb-food-sunday", category: "food", question: "Mi a „Sunday roast”?", options: ["Vasárnapi sült hús körettel", "Egy édesség", "Reggeli müzli", "Halas leves"], correct: 0, explanation: "Vasárnapi sült hús (marha, csirke, bárány) sült krumplival, zöldséggel és Yorkshire puddinggal." },
  { id: "gb-food-fishchips", category: "food", question: "Mi a hagyományos kísérője a fish and chipsnek?", options: ["Majonéz", "Ecet és sós borsó (mushy peas)", "Ketchup és uborka", "Tejföl"], correct: 1, explanation: "Malátaecet és mushy peas — a klasszikus kombináció." },
  { id: "gb-food-tea", category: "food", question: "Mit jelent az „builder's tea”?", options: ["Zöld tea cukor nélkül", "Erős fekete tea tejjel", "Gyógytea", "Jeges tea"], correct: 1, explanation: "Erős fekete tea sok tejjel — a hétköznapi brit teázás alapja." },
  { id: "gb-food-fullenglish", category: "food", question: "Mi NEM szokott szerepelni egy „full English breakfast”-ben?", options: ["Bacon és tojás", "Sült bab (baked beans)", "Croissant", "Grillezett paradicsom és gomba"], correct: 2, explanation: "A croissant francia — a full English bacon, tojás, kolbász, bab, paradicsom, gomba és pirítós." },
  { id: "gb-food-pub", category: "food", question: "Mit jelent a „pub” szó eredetileg?", options: ["Public house — nyilvános ház, azaz közösségi kocsma", "Publikus bank", "Publikált menü", "Pubertás kori klub"], correct: 0, explanation: "Public house — a brit közösségi élet egyik központja." },

  // === KÖZLEKEDÉS ===
  { id: "gb-tran-tube", category: "transport", question: "Mi a londoni metró beceneve?", options: ["The Metro", "The Tube", "The Loop", "The Line"], correct: 1, explanation: "„The Tube” — a világ legrégebbi metróhálózata (1863)." },
  { id: "gb-tran-contactless", category: "transport", question: "Hogyan a legolcsóbb Londonban utazni?", options: ["Papírjeggyel minden útra", "Érintős bankkártyával/telefonnal (napi és heti plafonnal)", "Csak havi bérlettel", "Taxival"], correct: 1, explanation: "Az érintős fizetés automatikusan plafonoz (capping) — sosem fizetsz többet a napi/heti bérlet áránál." },
  { id: "gb-tran-side", category: "transport", question: "Melyik oldalon közlekednek az autók?", options: ["Jobb oldalon", "Bal oldalon", "Városonként eltér", "Sávtól függ"], correct: 1, explanation: "Bal oldalon — a körforgalom pedig az óramutató járásával megegyezően megy." },
  { id: "gb-tran-mot", category: "transport", question: "Mi az MOT?", options: ["Egy autópálya-matrica", "Kötelező éves műszaki vizsga 3 évnél idősebb autókra", "Parkolási engedély", "Egy biztosítási forma"], correct: 1, explanation: "MOT nélkül a biztosítás is érvénytelen lehet — a kamerák automatikusan szűrik." },
  { id: "gb-tran-speed", category: "transport", question: "Milyen mértékegységben adják meg a sebességhatárokat?", options: ["Kilométer/óra", "Mérföld/óra (mph)", "Csomó", "Méter/másodperc"], correct: 1, explanation: "Mérföld/óra — jellemzően 30 mph lakott területen, 70 mph autópályán." },
  { id: "gb-tran-railcard", category: "transport", question: "Mit ad a Railcard?", options: ["Ingyenes utazást", "Kb. harmadával olcsóbb vonatjegyet", "Parkolóhelyet", "Repülőjegy-kedvezményt"], correct: 1, explanation: "Kb. ⅓ kedvezmény a vonatjegyekre; egy-két hosszabb út alatt megtérül az éves díja." },

  // === INTÉZMÉNYEK ===
  { id: "gb-inst-nin", category: "institutions", question: "Mire kell a National Insurance Number?", options: ["Az autó biztosításához", "Munkához, adóhoz és nyugdíjhoz", "A lakásbérléshez", "Az útlevélhez"], correct: 1, explanation: "Ezen tartják nyilván a járulék-befizetéseidet — élethosszig ugyanaz a szám." },
  { id: "gb-inst-gp", category: "institutions", question: "Ki a „kapuőr” a brit egészségügyben?", options: ["A kórházi sürgősségi", "A GP (háziorvos)", "A gyógyszertár", "A biztosító"], correct: 1, explanation: "Szinte minden a GP-nél kezdődik — ő utal tovább szakorvoshoz." },
  { id: "gb-inst-999", category: "institutions", question: "Melyik a brit sürgősségi hívószám?", options: ["112 vagy 999", "911", "110", "118"], correct: 0, explanation: "999 a hagyományos brit szám, a 112 is működik. Nem sürgős egészségügyi ügyben: 111." },
  { id: "gb-inst-counciltax", category: "institutions", question: "Ki fizeti általában a council taxet?", options: ["A tulajdonos", "A lakó (bérlő)", "A munkáltató", "Senki"], correct: 1, explanation: "A lakó — egyedül élőként 25% kedvezmény jár, de igényelni kell." },
  { id: "gb-inst-taxyear", category: "institutions", question: "Mikor kezdődik a brit adóév?", options: ["Január 1.", "Április 6.", "Július 1.", "Szeptember 1."], correct: 1, explanation: "Április 6-tól a következő április 5-ig — nem naptári év!" },
  { id: "gb-inst-hmrc", category: "institutions", question: "Mi a HMRC?", options: ["A brit adóhatóság", "Az egészségbiztosító", "A rendőrség", "A vasúttársaság"], correct: 0, explanation: "His Majesty's Revenue and Customs — az adó- és vámhatóság." },

  // === HÉTKÖZNAPOK ===
  { id: "gb-day-deposit", category: "everyday", question: "Mit KELL tennie a bérbeadónak a kaucióval 30 napon belül?", options: ["Bankba tennie a saját nevén", "Állami engedélyű védelmi sémába helyeznie és igazolást adnia", "Készpénzben megőriznie", "Semmit"], correct: 1, explanation: "Ha nem teszi, a kaució 1-3-szorosát perelheted — ez a leggyakoribb visszaélés újonnan érkezőkkel." },
  { id: "gb-day-creditscore", category: "everyday", question: "Mi történik a magyar hitel-előéleteddel Angliában?", options: ["Automatikusan átkerül", "Nem számít — nulláról indulsz", "Fele értékben számít", "Csak hitelnél számít"], correct: 1, explanation: "A brit credit score nulláról indul; a választói névjegyzékre való feliratkozás segít építeni." },
  { id: "gb-day-bankaccount", category: "everyday", question: "Mi a leggyakoribb akadály az első brit bankszámlánál?", options: ["A nyelvvizsga hiánya", "A lakcímigazolás (proof of address) hiánya", "Az életkor", "A magyar útlevél"], correct: 1, explanation: "Klasszikus 22-es csapdája — a digitális bankok (Monzo, Starling) kerülőutat adnak." },
  { id: "gb-day-prescription", category: "everyday", question: "Mi igaz a receptre Angliában?", options: ["Mindig ingyenes", "Tételenként fix díjat kell fizetni", "Csak magánorvosnál kell fizetni", "A biztosító téríti"], correct: 1, explanation: "Angliában tételenként fix díj (~10 £); Skóciában és Walesben ingyenes." },
  { id: "gb-day-uniform", category: "everyday", question: "Mi igaz az állami iskolára Angliában?", options: ["Tandíjas", "Tandíjmentes, de az egyenruha kötelező és költséges", "Nincs egyenruha", "Csak délelőtt van tanítás"], correct: 1, explanation: "A tandíj nincs, de az uniform kötelező — sok iskolának van használt-egyenruha börzéje." },
  { id: "gb-day-bankholiday", category: "everyday", question: "Mit jelent a „bank holiday”?", options: ["A bankok sztrájkja", "Munkaszüneti nap", "Fizetési határidő", "Kamatmentes nap"], correct: 1, explanation: "Munkaszüneti nap — a legtöbb hétfőre esik, ilyenkor sok bolt rövidített nyitvatartással üzemel." },
];
