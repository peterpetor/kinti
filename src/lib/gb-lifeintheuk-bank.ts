/**
 * „Life in the UK Test" szimulátor — angol kérdés-bank.
 *
 * ⚠️ FONTOS: ez NEM hivatalos teszt. A valódi Life in the UK Test 24 kérdésből
 * áll, 75% (18 helyes) az átmenő, és a hivatalos „Life in the United Kingdom:
 * A Guide for New Residents" (3. kiadás) tananyagából kérdez. Ez egy FELKÉSZÍTŐ
 * szimulátor a tipikus témakörökhöz — közelítő megfogalmazással, NEM a
 * hivatalos kérdés-szöveggel.
 *
 * ⚠️ A vizsga az EGÉSZ Egyesült Királyságról kérdez (Anglia, Skócia, Wales,
 * Észak-Írország), akkor is, ha a Kinti egyébként csak Angliát kezeli
 * országként — ezért a bankban skót/walesi/északír tételek is szerepelnek.
 *
 * Forrás: a hivatalos gov.uk témakörök (értékek és alapelvek, történelem,
 * kormányzás és jog, mindennapi élet).
 */
import type { EbQuestion, EbTopic } from "./einburgerung-bank";

export const GB_TOPIC_META: Record<EbTopic, { label: string; emoji: string; color: string }> = {
  federal:   { label: "Kormányzás",   emoji: "🏛️", color: "#1d4434" },
  history:   { label: "Történelem",   emoji: "📜", color: "#7f4a1d" },
  geography: { label: "Földrajz",     emoji: "🗺️", color: "#2c7a7b" },
  civic:     { label: "Értékek/jog",  emoji: "⚖️", color: "#5b21b6" },
  canton:    { label: "Régió",        emoji: "📍", color: "#CE1124" },
};

/** Angol régiók, ahol vannak régió-specifikus kérdések (a regions.ts GB-kódjaival). */
export const GB_QUIZ_REGIONS = [
  { code: "LDN", name: "London" },
  { code: "NW", name: "North West (Manchester, Liverpool)" },
  { code: "WM", name: "West Midlands (Birmingham)" },
  { code: "YH", name: "Yorkshire and the Humber (Leeds)" },
  { code: "SE", name: "South East" },
  { code: "SW", name: "South West (Bristol)" },
  { code: "NE", name: "North East (Newcastle)" },
  { code: "EM", name: "East Midlands (Nottingham)" },
  { code: "EE", name: "East of England (Cambridge)" },
];

export const GB_BANK: EbQuestion[] = [
  // ============ FEDERAL — Kormányzás és államszervezet ============
  { id: "g-f-parliament", topic: "federal", question: "Hogy hívják a brit parlament két házát?", options: ["Bundestag és Bundesrat", "House of Commons és House of Lords", "Senate és Congress", "Assembly és Council"], correct: 1, explanation: "House of Commons (alsóház, választott) és House of Lords (felsőház, kinevezett/örökletes)." },
  { id: "g-f-pm", topic: "federal", question: "Ki a kormányfő az Egyesült Királyságban?", options: ["A király", "A Prime Minister", "A Speaker", "A Lord Chancellor"], correct: 1, explanation: "A miniszterelnök (Prime Minister) vezeti a kormányt; az uralkodó államfő, de nem kormányoz." },
  { id: "g-f-monarch", topic: "federal", question: "Milyen államforma az Egyesült Királyság?", options: ["Köztársaság", "Alkotmányos monarchia", "Abszolút monarchia", "Föderáció"], correct: 1, explanation: "Alkotmányos monarchia: az uralkodó az államfő, de a tényleges hatalom a választott parlamenté." },
  { id: "g-f-noconstitution", topic: "federal", question: "Van-e az Egyesült Királyságnak egyetlen írott alkotmánya?", options: ["Igen, 1689 óta", "Nincs — több törvényből, szokásjogból és precedensből áll", "Igen, 1707 óta", "Igen, az EU írta"], correct: 1, explanation: "Nincs egyetlen dokumentumba foglalt („kodifikált”) alkotmány — ez az egyik legfontosabb különbség a kontinentális rendszerekhez képest." },
  { id: "g-f-mp", topic: "federal", question: "Mi az MP rövidítés jelentése?", options: ["Ministry of Police", "Member of Parliament", "Municipal President", "Master of Politics"], correct: 1, explanation: "Member of Parliament — a House of Commons választott képviselője; mindenkinek van egy helyi MP-je." },
  { id: "g-f-election", topic: "federal", question: "Legfeljebb hány évente kell általános választást tartani?", options: ["4 év", "5 év", "6 év", "7 év"], correct: 1, explanation: "Legfeljebb 5 évente; a miniszterelnök ezen belül korábban is kiírhatja." },
  { id: "g-f-devolution", topic: "federal", question: "Mit jelent a devolution?", options: ["Az EU-ból való kilépés", "Hatáskörök átadása Skócia, Wales és Észak-Írország saját törvényhozásának", "A monarchia eltörlése", "Az adók csökkentése"], correct: 1, explanation: "Skóciának, Walesnek és Észak-Írországnak saját parlamentje/gyűlése van, saját hatáskörökkel (pl. egészségügy, oktatás)." },
  { id: "g-f-civilservice", topic: "federal", question: "Mi jellemzi a brit civil service-t (közszolgálatot)?", options: ["Politikailag semleges és pártatlan", "A kormánypárt tagjaiból áll", "Az uralkodó nevezi ki személyesen", "Négyévente teljesen lecserélik"], correct: 0, explanation: "Politikailag semleges: kormányváltáskor is a helyén marad, és minden kormányt egyformán szolgál." },
  { id: "g-f-council", topic: "federal", question: "Mit intéz a helyi önkormányzat (local council)?", options: ["A hadsereget", "Szemétszállítás, iskolák, könyvtárak, helyi utak", "A külpolitikát", "A jegybanki kamatot"], correct: 1, explanation: "Helyi szolgáltatások — ezt finanszírozza többek között a council tax." },
  { id: "g-f-commonwealth", topic: "federal", question: "Mi a Commonwealth?", options: ["Katonai szövetség", "Nagyrészt egykori brit gyarmatokból álló, önkéntes társulás", "Az EU másik neve", "Egy brit bank"], correct: 1, explanation: "Kb. 56 tagország önkéntes társulása; nincs kötelező érvényű hatalma a tagok felett." },

  // ============ HISTORY — Történelem ============
  { id: "g-h-1066", topic: "history", question: "Mi történt 1066-ban?", options: ["A Magna Carta aláírása", "A normann hódítás (Hastings-i csata)", "A tűzvész Londonban", "Az Ipari forradalom kezdete"], correct: 1, explanation: "Hódító Vilmos legyőzte II. Haroldot Hastingsnél — ez az utolsó sikeres invázió Anglia ellen." },
  { id: "g-h-magnacarta", topic: "history", question: "Mi volt a Magna Carta (1215)?", options: ["Egy hadüzenet", "Charta, amely korlátozta a király hatalmát", "Egy templom", "Egy kereskedelmi szerződés"], correct: 1, explanation: "A király hatalmát korlátozó, a jogok felé mutató dokumentum — a brit alkotmányos hagyomány egyik alapköve." },
  { id: "g-h-henry8", topic: "history", question: "Miért fontos VIII. Henrik?", options: ["Felfedezte Amerikát", "Szakított Rómával, és létrehozta az anglikán egyházat", "Megnyerte a waterlooi csatát", "Feltalálta a gőzgépet"], correct: 1, explanation: "A reformáció során szakított a pápával; létrejött a Church of England." },
  { id: "g-h-industrial", topic: "history", question: "Hol indult az ipari forradalom?", options: ["Franciaországban", "Nagy-Britanniában", "Németországban", "Az USA-ban"], correct: 1, explanation: "A 18. század végén Nagy-Britanniában — gőzgép, textilipar, vasút." },
  { id: "g-h-ww2", topic: "history", question: "Ki volt a brit miniszterelnök a II. világháború nagy részében?", options: ["Neville Chamberlain", "Winston Churchill", "Clement Attlee", "Anthony Eden"], correct: 1, explanation: "Winston Churchill (1940-től) — a háborús ellenállás jelképe." },
  { id: "g-h-nhs", topic: "history", question: "Mikor jött létre az NHS?", options: ["1918", "1948", "1968", "1979"], correct: 1, explanation: "1948-ban — adóból finanszírozott, a használat pontján ingyenes egészségügy." },
  { id: "g-h-union", topic: "history", question: "Melyik évben egyesült Anglia és Skócia egy királyságban?", options: ["1603", "1707", "1801", "1922"], correct: 1, explanation: "Az 1707-es Act of Union hozta létre Nagy-Britannia Királyságát." },
  { id: "g-h-suffrage", topic: "history", question: "Kik voltak a suffragettek?", options: ["Munkásmozgalmi bányászok", "A női választójogért küzdő aktivisták", "Egy zenekar", "Tengerészek"], correct: 1, explanation: "A 20. század elején a nők választójogáért küzdöttek; 1928-ra a nők a férfiakkal azonos feltételekkel szavazhattak." },

  // ============ GEOGRAPHY — Földrajz ============
  { id: "g-g-nations", topic: "geography", question: "Mely négy országból áll az Egyesült Királyság?", options: ["Anglia, Skócia, Wales, Írország", "Anglia, Skócia, Wales, Észak-Írország", "Anglia, Wales, Írország, Man-sziget", "Nagy-Britannia, Skócia, Wales, Cornwall"], correct: 1, explanation: "⚠️ Észak-Írország, NEM az Ír Köztársaság — az önálló ország." },
  { id: "g-g-capitals", topic: "geography", question: "Mi Skócia, Wales és Észak-Írország fővárosa?", options: ["Glasgow, Swansea, Derry", "Edinburgh, Cardiff, Belfast", "Aberdeen, Newport, Lisburn", "Dundee, Bangor, Armagh"], correct: 1, explanation: "Edinburgh (Skócia), Cardiff (Wales), Belfast (Észak-Írország)." },
  { id: "g-g-flag", topic: "geography", question: "Mi a Union Jack?", options: ["Anglia zászlaja", "Az Egyesült Királyság zászlaja", "Skócia zászlaja", "A Commonwealth zászlaja"], correct: 1, explanation: "Az Egyesült Királyság zászlaja — az angol, skót és északír keresztek kombinációja. ⚠️ Anglia saját zászlaja a Szent György-kereszt (fehér alap, piros kereszt)." },
  { id: "g-g-longestriver", topic: "geography", question: "Melyik a leghosszabb folyó az Egyesült Királyságban?", options: ["Temze", "Severn", "Trent", "Mersey"], correct: 1, explanation: "A Severn a leghosszabb; a Temze a legismertebb (Londonon folyik át)." },
  { id: "g-g-currency", topic: "geography", question: "Mi az Egyesült Királyság hivatalos pénzneme?", options: ["Euró", "Font sterling (£)", "Korona", "Dollár"], correct: 1, explanation: "Font sterling (pound sterling, £) — az UK sosem vezette be az eurót." },
  { id: "g-g-bennevis", topic: "geography", question: "Mi az Egyesült Királyság legmagasabb hegye?", options: ["Snowdon", "Scafell Pike", "Ben Nevis", "Slieve Donard"], correct: 2, explanation: "Ben Nevis Skóciában (1345 m)." },

  // ============ CIVIC — Értékek, jog, mindennapi élet ============
  { id: "g-c-values", topic: "civic", question: "Melyik NEM tartozik a hivatalos brit alapértékek közé?", options: ["Demokrácia", "Jogállamiság", "Egyetlen államvallás kötelező követése", "Kölcsönös tisztelet és tolerancia"], correct: 2, explanation: "Az alapértékek: demokrácia, jogállamiság, egyéni szabadság, kölcsönös tisztelet és a különböző hitek toleranciája." },
  { id: "g-c-equality", topic: "civic", question: "Mit tilt az Equality Act?", options: ["A külföldi munkavállalást", "A diszkriminációt védett tulajdonságok (kor, nem, faj, vallás, fogyatékosság…) alapján", "A sztrájkot", "A magániskolákat"], correct: 1, explanation: "Ez az oka annak is, hogy a brit önéletrajzra nem tesznek fényképet és születési dátumot." },
  { id: "g-c-emergency", topic: "civic", question: "Melyik szám a sürgősségi hívószám?", options: ["112 vagy 999", "911", "110", "118"], correct: 0, explanation: "999 a hagyományos brit szám; a 112 is működik. Nem sürgős egészségügyi kérdésben 111, nem sürgős rendőrségi ügyben 101." },
  { id: "g-c-jury", topic: "civic", question: "Mi az esküdtszéki szolgálat (jury service)?", options: ["Önkéntes közmunka", "Állampolgári kötelezettség: a bíróságon esküdtként kell szolgálni, ha behívnak", "Katonai szolgálat", "Adónem"], correct: 1, explanation: "Behíváskor kötelező megjelenni; a munkáltatónak el kell engednie a munkavállalót." },
  { id: "g-c-votingage", topic: "civic", question: "Hány éves kortól lehet szavazni az általános választáson?", options: ["16", "17", "18", "21"], correct: 2, explanation: "18 évtől (Skóciában és Walesben egyes helyi/devolvált választásokon 16-tól)." },
  { id: "g-c-taxyear", topic: "civic", question: "Mikor kezdődik a brit adóév?", options: ["Január 1.", "Április 6.", "Július 1.", "Szeptember 1."], correct: 1, explanation: "⚠️ Április 6-tól a következő április 5-ig — nem naptári év, ez sokakat meglep." },
  { id: "g-c-ni", topic: "civic", question: "Mire kell a National Insurance Number?", options: ["Az autó biztosításához", "A munkához, adóhoz és nyugdíjhoz", "A lakásbérléshez", "Az útlevélhez"], correct: 1, explanation: "Ezen tartják nyilván a járulék-befizetéseidet; élethosszig ugyanaz a szám." },
  { id: "g-c-counciltax", topic: "civic", question: "Ki fizeti általában a council taxet?", options: ["A tulajdonos", "A lakó (bérlő)", "A munkáltató", "Senki, adóból megy"], correct: 1, explanation: "Jellemzően a LAKÓ — egyedül élőnek 25% kedvezmény, teljes idős hallgatónak jellemzően mentesség jár (igényelni kell)." },

  // ============ RÉGIÓ-SPECIFIKUS kérdések ============
  { id: "g-r-ldn", topic: "canton", cantonCode: "LDN", question: "Melyik állítás igaz Londonra?", options: ["Nincs saját polgármestere", "Van közvetlenül választott polgármestere (Mayor of London)", "Skócia fővárosa", "Nincs metrója"], correct: 1, explanation: "A Mayor of London közvetlenül választott; a TfL (Transport for London) a közlekedésért felel." },
  { id: "g-r-ldn2", topic: "canton", cantonCode: "LDN", question: "Mi a londoni metró beceneve?", options: ["The Metro", "The Tube", "The Underground Express", "The Loop"], correct: 1, explanation: "„The Tube” — a világ legrégebbi metróhálózata (1863)." },
  { id: "g-r-nw", topic: "canton", cantonCode: "NW", question: "Melyik város található a North West régióban?", options: ["Leeds", "Manchester", "Birmingham", "Newcastle"], correct: 1, explanation: "Manchester és Liverpool is a North Westben van." },
  { id: "g-r-nw2", topic: "canton", cantonCode: "NW", question: "Melyik világhírű zenekar származik Liverpoolból?", options: ["The Rolling Stones", "The Beatles", "Oasis", "Queen"], correct: 1, explanation: "A Beatles Liverpoolban alakult; az Oasis manchesteri." },
  { id: "g-r-wm", topic: "canton", cantonCode: "WM", question: "Melyik város a West Midlands központja?", options: ["Birmingham", "Bristol", "Sheffield", "Nottingham"], correct: 0, explanation: "Birmingham — az Egyesült Királyság második legnépesebb városa." },
  { id: "g-r-yh", topic: "canton", cantonCode: "YH", question: "Melyik város van Yorkshire-ben?", options: ["Cardiff", "Leeds", "Southampton", "Norwich"], correct: 1, explanation: "Leeds, Sheffield, York és Hull is Yorkshire and the Humber régióban van." },
  { id: "g-r-se", topic: "canton", cantonCode: "SE", question: "Melyik híres egyetem található a South East régióban?", options: ["Cambridge", "Oxford", "Edinburgh", "Durham"], correct: 1, explanation: "Oxford a South Eastben; Cambridge az East of Englandben." },
  { id: "g-r-sw", topic: "canton", cantonCode: "SW", question: "Melyik város a South West legnagyobb városa?", options: ["Bristol", "Portsmouth", "Coventry", "Derby"], correct: 0, explanation: "Bristol — kikötőváros, a régió gazdasági központja." },
  { id: "g-r-ne", topic: "canton", cantonCode: "NE", question: "Melyik város a North East központja?", options: ["Newcastle upon Tyne", "Leeds", "Manchester", "Hull"], correct: 0, explanation: "Newcastle upon Tyne; a Tyne and Wear Metro szolgálja ki a régiót." },
  { id: "g-r-em", topic: "canton", cantonCode: "EM", question: "Melyik város található az East Midlandsben?", options: ["Nottingham", "Bristol", "Liverpool", "Brighton"], correct: 0, explanation: "Nottingham, Leicester és Derby is East Midlands." },
  { id: "g-r-ee", topic: "canton", cantonCode: "EE", question: "Melyik híres egyetemi város van az East of England régióban?", options: ["Oxford", "Cambridge", "Bath", "York"], correct: 1, explanation: "Cambridge — a világ egyik legrégebbi egyeteme." },
];

/** A valódi teszt 24 kérdés / 75% — a szimulátor ezt követi. */
export const GB_QUIZ_LENGTH = 24;
export const GB_PASS_THRESHOLD = 75;

const GB_MIX: { topic: EbTopic; count: number }[] = [
  { topic: "federal",   count: 7 },
  { topic: "history",   count: 6 },
  { topic: "geography", count: 5 },
  { topic: "civic",     count: 4 },
  { topic: "canton",    count: 2 },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Egy menet sorsolása — országos témák + a választott régió kérdései. */
export function generateQuizGB(regionCode: string | null): EbQuestion[] {
  const result: EbQuestion[] = [];
  const used = new Set<string>();
  for (const mix of GB_MIX) {
    let pool: EbQuestion[];
    if (mix.topic === "canton") {
      pool = regionCode
        ? GB_BANK.filter((q) => q.topic === "canton" && q.cantonCode === regionCode)
        : GB_BANK.filter((q) => q.topic === "canton");
      // Ha a régióhoz kevés kérdés van, a többi régióéval pótolunk (a menet
      // hossza így stabil marad — ugyanaz a minta, mint a CH/NL bankban).
      if (pool.length < mix.count) {
        pool = [...pool, ...GB_BANK.filter((q) => q.topic === "canton" && q.cantonCode !== regionCode)];
      }
    } else {
      pool = GB_BANK.filter((q) => q.topic === mix.topic);
    }
    for (const q of shuffle(pool)) {
      if (result.length >= GB_QUIZ_LENGTH) break;
      if (!used.has(q.id)) { used.add(q.id); result.push(q); }
      if (result.filter((r) => r.topic === mix.topic).length >= mix.count) break;
    }
  }
  // Feltöltés a teljes hosszra, ha valamelyik témából kevés volt.
  for (const q of shuffle(GB_BANK)) {
    if (result.length >= GB_QUIZ_LENGTH) break;
    if (!used.has(q.id)) { used.add(q.id); result.push(q); }
  }
  return shuffle(result).slice(0, GB_QUIZ_LENGTH);
}
