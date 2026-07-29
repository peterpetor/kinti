/**
 * „CCSE" szimulátor — spanyol állampolgársági kérdés-bank.
 *
 * ⚠️ FONTOS: ez NEM hivatalos teszt. A valódi vizsga a CCSE (Conocimientos
 * Constitucionales y Socioculturales de España), amit az Instituto Cervantes
 * szervez: **25 kérdés, 45 perc, 60% az átmenő** (15 helyes válasz). A hivatalos
 * kérdések egy évente kiadott, nyilvános felkészítő anyagból származnak — ez a
 * bank a TÉMAKÖRÖKET követi, közelítő megfogalmazással, NEM a hivatalos
 * kérdés-szöveggel.
 *
 * ⚠️ A VIZSGA ORSZÁGOSAN AZONOS — nincs benne külön „a te közösséged" rész,
 * ellentétben a svájci (kanton) vagy az osztrák (Bundesland) vizsgával. A
 * szimulátorban azért van mégis régió-választó, mert az autonóm közösségek
 * ismerete a hivatalos anyag része (a területi szervezetről szóló feladat), és
 * a saját közösségeddel könnyebb megtanulni a rendszert. A UI és a disclaimer
 * ezt kimondja, hogy senki ne higgye: a vizsgán a lakóhelyéről kérdeznek.
 *
 * ⚠️ MÁSODIK FELTÉTEL: a spanyol állampolgársághoz a CCSE MELLETT jellemzően
 * **DELE A2** nyelvvizsga is kell (spanyol ajkú országból érkezőknek nem).
 * Magyar állampolgárként MINDKETTŐ szükséges — ezt a bank és a disclaimer is
 * kiemeli, mert sokan csak a CCSE-vel számolnak.
 *
 * A kérdések SZÁNDÉKOSAN kerülik a gyorsan avuló adatokat (mindenkori
 * miniszterelnök neve, minimálbér, aktuális összegek) — a bank tartós tudást
 * kérdez, hogy ne váljon csendben hibássá. Ld. [[ai-content-accuracy]].
 *
 * Forrás: az 1978-as alkotmány szövege (BOE), az Instituto Cervantes nyilvános
 * CCSE-témakör-leírása, és általános spanyol köztudás.
 */
import type { EbQuestion, EbTopic } from "./einburgerung-bank";

/** Kategória-meta a spanyol kvízhez (a CCSE feladat-blokkjaihoz igazítva). */
export const ES_TOPIC_META: Record<EbTopic, { label: string; emoji: string; color: string }> = {
  federal:   { label: "Állam és jog",   emoji: "🏛️", color: "#AA151B" },
  history:   { label: "Történelem",     emoji: "📜", color: "#7f4a1d" },
  geography: { label: "Területi rend",  emoji: "🗺️", color: "#2c7a7b" },
  civic:     { label: "Jogok, társadalom", emoji: "⚖️", color: "#5b21b6" },
  canton:    { label: "Közösséged",     emoji: "📍", color: "#F1BF00" },
};

/**
 * Autonóm közösségek, amikhez van külön kérdés (a regions.ts ES-kódjaival).
 * A magyar közösség fő gócai szerint válogatva — nem mind a 17, mert a valódi
 * vizsgán ez amúgy sem személyre szabott.
 */
export const ES_QUIZ_REGIONS = [
  { code: "MD", name: "Madrid" },
  { code: "CT", name: "Cataluña (Barcelona)" },
  { code: "AN", name: "Andalucía (Málaga, Sevilla)" },
  { code: "VC", name: "Comunitat Valenciana (Alicante)" },
  { code: "IB", name: "Illes Balears (Mallorca, Ibiza)" },
  { code: "CN", name: "Canarias (Tenerife, Gran Canaria)" },
  { code: "PV", name: "País Vasco (Bilbao)" },
  { code: "GA", name: "Galicia (Vigo)" },
  { code: "CL", name: "Castilla y León" },
  { code: "AR", name: "Aragón (Zaragoza)" },
];

export const ES_BANK: EbQuestion[] = [
  // ══════════ FEDERAL — Állam, alkotmány, intézmények ══════════
  { id: "e-f-constitucion", topic: "federal", question: "Melyik évben fogadták el a jelenlegi spanyol alkotmányt?", options: ["1975", "1978", "1981", "1986"], correct: 1, explanation: "1978. A népszavazás december 6-án volt — azóta ez a Día de la Constitución, munkaszüneti nap." },
  { id: "e-f-forma", topic: "federal", question: "Mi Spanyolország államformája az alkotmány szerint?", options: ["Köztársaság", "Parlamentáris monarchia", "Szövetségi állam", "Abszolút monarchia"], correct: 1, explanation: "Monarquía parlamentaria: a király az államfő, de a tényleges hatalom a választott intézményeké." },
  { id: "e-f-jefe", topic: "federal", question: "Ki az államfő Spanyolországban?", options: ["A miniszterelnök", "A király", "A Kongresszus elnöke", "Az Alkotmánybíróság elnöke"], correct: 1, explanation: "A király (el Rey) az államfő. VI. Fülöp 2014 óta, I. János Károly lemondása után." },
  { id: "e-f-cortes", topic: "federal", question: "Hogy hívják a spanyol parlamentet?", options: ["Las Cortes Generales", "El Consejo de Ministros", "La Diputación", "El Tribunal Supremo"], correct: 0, explanation: "Cortes Generales — két házból áll: Congreso de los Diputados és Senado." },
  { id: "e-f-camaras", topic: "federal", question: "Melyik a spanyol parlament két háza?", options: ["Kongresszus és Szenátus", "Alsóház és Felsőház", "Kongresszus és Államtanács", "Szenátus és Alkotmánybíróság"], correct: 0, explanation: "Congreso de los Diputados (alsóház) és Senado (a területi képviselet háza)." },
  { id: "e-f-diputados", topic: "federal", question: "Hány képviselő ül a Congreso de los Diputadosban?", options: ["250", "300", "350", "400"], correct: 2, explanation: "350 diputado, tartományi választókerületekből, arányos rendszerben." },
  { id: "e-f-presidente", topic: "federal", question: "Ki a kormányfő Spanyolországban?", options: ["A király", "El Presidente del Gobierno", "A Szenátus elnöke", "Az államügyész"], correct: 1, explanation: "A Presidente del Gobierno vezeti a kormányt; a Kongresszus szavazza meg (investidura)." },
  { id: "e-f-legislatura", topic: "federal", question: "Hány évre szól egy rendes törvényhozási ciklus?", options: ["2 év", "4 év", "5 év", "6 év"], correct: 1, explanation: "Négy év — de a kormányfő ezen belül is kiírhat előrehozott választást." },
  { id: "e-f-voto", topic: "federal", question: "Hány éves kortól lehet szavazni Spanyolországban?", options: ["16", "18", "20", "21"], correct: 1, explanation: "18 éves kortól, minden spanyol állampolgárnak." },
  { id: "e-f-tc", topic: "federal", question: "Mivel foglalkozik a Tribunal Constitucional?", options: ["A közlekedési bírságokkal", "A törvények alkotmányosságának vizsgálatával", "Az adóbeszedéssel", "A helyi ügyekkel"], correct: 1, explanation: "Az Alkotmánybíróság: eldönti, alkotmányos-e egy törvény, és védi az alapjogokat." },
  { id: "e-f-supremo", topic: "federal", question: "Melyik a legfelsőbb bírói fórum a rendes bíráskodásban?", options: ["Tribunal Constitucional", "Tribunal Supremo", "Audiencia Nacional", "Tribunal de Cuentas"], correct: 1, explanation: "Tribunal Supremo. Az Alkotmánybíróság ettől KÜLÖN áll, más a hatásköre." },
  { id: "e-f-defensor", topic: "federal", question: "Mi a Defensor del Pueblo feladata?", options: ["A hadsereg vezetése", "Az állampolgárok jogainak védelme a közigazgatással szemben", "Az adók beszedése", "A választások lebonyolítása"], correct: 1, explanation: "Ombudsman: a Cortes nevezi ki, és a hatóságok visszaéléseivel szemben véd." },
  { id: "e-f-boe", topic: "federal", question: "Mi a BOE?", options: ["A központi bank", "A hivatalos állami közlöny", "Egy politikai párt", "A statisztikai hivatal"], correct: 1, explanation: "Boletín Oficial del Estado — itt hirdetik ki a törvényeket; kihirdetés nélkül nem lépnek hatályba." },
  { id: "e-f-consejo", topic: "federal", question: "Mi a Consejo de Ministros?", options: ["A minisztertanács (a kormány testülete)", "A parlament felsőháza", "A bírói tanács", "A királyi tanácsadó testület"], correct: 0, explanation: "A kormány kollektív döntéshozó testülete, a Presidente del Gobierno vezetésével." },
  { id: "e-f-elecciones", topic: "federal", question: "Melyik NEM önálló választás-típus Spanyolországban?", options: ["Általános (generales)", "Autonóm közösségi (autonómicas)", "Önkormányzati (municipales)", "Bírói (judiciales)"], correct: 3, explanation: "A bírákat nem választják. Az európai parlamenti (europeas) viszont szintén létező típus." },
  { id: "e-f-ue", topic: "federal", question: "Melyik évben csatlakozott Spanyolország az Európai Közösséghez?", options: ["1975", "1981", "1986", "1992"], correct: 2, explanation: "1986-ban, Portugáliával együtt — a demokratikus átmenet lezárása." },
  { id: "e-f-euro", topic: "federal", question: "Mikor került forgalomba az euró készpénz Spanyolországban?", options: ["1999", "2002", "2004", "2008"], correct: 1, explanation: "2002 januárjában váltotta fel a pesetát a készpénzforgalomban." },
  { id: "e-f-otan", topic: "federal", question: "Tagja-e Spanyolország a NATO-nak?", options: ["Igen", "Nem", "Csak megfigyelő", "1986-ban kilépett"], correct: 0, explanation: "Igen, 1982 óta; az 1986-os népszavazás megerősítette a tagságot." },
  { id: "e-f-bandera", topic: "federal", question: "Milyen színű a spanyol zászló?", options: ["Piros-sárga-piros", "Piros-fehér-piros", "Sárga-piros-sárga", "Piros-sárga"], correct: 0, explanation: "Piros-sárga-piros vízszintes sávok — a sárga sáv kétszer olyan széles, mint egy-egy piros." },
  { id: "e-f-himno", topic: "federal", question: "Mi különleges a spanyol himnuszban (Marcha Real)?", options: ["Nagyon hosszú", "Nincs hivatalos szövege", "Csak ünnepeken játsszák", "Latinul van"], correct: 1, explanation: "Nincs hivatalos szövege — a világ néhány szöveg nélküli himnuszának egyike." },
  { id: "e-f-fiesta", topic: "federal", question: "Mikor van Spanyolország nemzeti ünnepe?", options: ["Március 19.", "Október 12.", "December 6.", "Május 2."], correct: 1, explanation: "Október 12., a Fiesta Nacional. December 6. az alkotmány napja — az is munkaszüneti nap, de nem ez a nemzeti ünnep." },
  { id: "e-f-estatuto", topic: "federal", question: "Mi az Estatuto de Autonomía?", options: ["Egy autonóm közösség alaptörvénye", "A munkajogi törvény", "Az adótörvény", "A választási szabályzat"], correct: 0, explanation: "Minden autonóm közösségnek saját autonómia-statútuma van, ami a hatásköreit és intézményeit rögzíti." },
  { id: "e-f-lenguas", topic: "federal", question: "Mit mond az alkotmány a kasztíliai (spanyol) nyelvről?", options: ["Csak Madridban hivatalos", "Az állam hivatalos nyelve, minden spanyolnak kötelessége ismerni", "Nincs róla rendelkezés", "Csak az iskolákban használható"], correct: 1, explanation: "Az állam hivatalos nyelve; az alkotmány szerint minden spanyolnak KÖTELESSÉGE ismerni és JOGA használni." },
  { id: "e-f-cooficial", topic: "federal", question: "Melyik nyelv NEM társhivatalos valamelyik autonóm közösségben?", options: ["Katalán", "Galiciai", "Baszk", "Portugál"], correct: 3, explanation: "A katalán/valenciai, a galiciai és a baszk társhivatalos a saját közösségében; a portugál nem." },
  { id: "e-f-sufragio", topic: "federal", question: "Milyen a szavazás Spanyolországban?", options: ["Kötelező", "Általános, szabad, egyenlő, közvetlen és titkos", "Csak levélben", "Csak a 25 év felettieknek"], correct: 1, explanation: "Nem kötelező. Az alkotmány az általános, szabad, egyenlő, közvetlen és titkos szavazást rögzíti." },
  { id: "e-f-monarquia-suc", topic: "federal", question: "Ki lett a király I. János Károly 2014-es lemondása után?", options: ["VI. Fülöp", "Leonor hercegnő", "Nem volt utódja", "II. János Károly"], correct: 0, explanation: "Fia, VI. Fülöp (Felipe VI). A trónörökös Leonor asztúriai hercegnő." },
  { id: "e-f-transicion", topic: "federal", question: "Mit jelent a „la Transición”?", options: ["Az euró bevezetése", "A Franco halála utáni demokratikus átmenet", "Az EU-csatlakozás", "Az iparosítás"], correct: 1, explanation: "Az 1975 utáni átmenet a diktatúrából a demokráciába; csúcspontja az 1978-as alkotmány." },
  { id: "e-f-gobiernos", topic: "federal", question: "Hány közigazgatási szint van Spanyolországban?", options: ["Egy: az állam", "Három: állam, autonóm közösség, önkormányzat", "Kettő: állam és tartomány", "Négy: állam, régió, tartomány, kerület"], correct: 1, explanation: "Állam (Estado), autonóm közösség (comunidad autónoma) és önkormányzat (municipio) — a tartomány (provincia) köztes szint." },

  // ══════════ CIVIC — Jogok, kötelességek, társadalom ══════════
  { id: "e-c-igualdad", topic: "civic", question: "Mit mond ki az alkotmány 14. cikke?", options: ["A kötelező katonai szolgálatot", "Mindenki egyenlő a törvény előtt", "Az adófizetés rendjét", "A királyi öröklést"], correct: 1, explanation: "Minden spanyol egyenlő a törvény előtt — nem érheti hátrány születés, faj, nem, vallás vagy vélemény miatt." },
  { id: "e-c-deberes", topic: "civic", question: "Melyik NEM alkotmányos kötelessége a spanyol állampolgároknak?", options: ["Adót fizetni", "Ismerni a kasztíliai nyelvet", "Szavazni a választásokon", "Együttműködni a hatóságokkal katasztrófa esetén"], correct: 2, explanation: "A szavazás JOG, nem kötelesség — Spanyolországban nincs kötelező részvétel." },
  { id: "e-c-educacion", topic: "civic", question: "Hány éves korig kötelező az oktatás?", options: ["14", "16", "18", "12"], correct: 1, explanation: "6-tól 16 éves korig (primaria + ESO), és ez az időszak ingyenes az állami iskolákban." },
  { id: "e-c-sanidad", topic: "civic", question: "Ki működteti a közegészségügyet Spanyolországban?", options: ["Kizárólag az állam", "Az autonóm közösségek", "A magánbiztosítók", "Az önkormányzatok"], correct: 1, explanation: "Az egészségügy közösségi hatáskör — ezért van minden közösségnek saját egészségügyi szolgálata." },
  { id: "e-c-tarjeta", topic: "civic", question: "Mi a tarjeta sanitaria?", options: ["Bankkártya", "Az egészségügyi ellátásra jogosító kártya", "Diákigazolvány", "Közlekedési bérlet"], correct: 1, explanation: "Az egészségügyi kártya, amit a lakóhelyed szerinti közösség egészségügyi szolgálata ad ki." },
  { id: "e-c-112", topic: "civic", question: "Mi az egységes segélyhívó szám?", options: ["091", "112", "061", "092"], correct: 1, explanation: "112 — az egész EU-ban ugyanaz. A Policía Nacional 091, a Guardia Civil 062, a helyi rendőrség 092." },
  { id: "e-c-016", topic: "civic", question: "Mire szolgál a 016-os telefonszám?", options: ["Fogyasztóvédelmi panasz", "Segítség a nők elleni erőszak áldozatainak", "Időjárás-jelentés", "Adóügyi tájékoztatás"], correct: 1, explanation: "Ingyenes, 0–24 órás segélyvonal a nők elleni erőszak áldozatainak; nem hagy nyomot a telefonszámlán." },
  { id: "e-c-empadron", topic: "civic", question: "Hol jelented be a lakcímedet (empadronamiento)?", options: ["A rendőrségen", "Az önkormányzatnál (ayuntamiento)", "Az adóhivatalban", "A bíróságon"], correct: 1, explanation: "Az önkormányzatnál. Erre épül az egészségügyi kártya és az iskolai beiratkozás is." },
  { id: "e-c-dni", topic: "civic", question: "Mi a DNI?", options: ["A spanyol személyi igazolvány", "A jogosítvány", "Az adószám", "A lakcímkártya"], correct: 0, explanation: "Documento Nacional de Identidad — a spanyol állampolgárok személyi igazolványa. A külföldieké a NIE/TIE." },
  { id: "e-c-ss", topic: "civic", question: "Mire szolgál a Seguridad Social?", options: ["A rendőri védelemre", "Az egészségügyi ellátás, a táppénz és a nyugdíj rendszerére", "A banki betétbiztosításra", "A közlekedésbiztonságra"], correct: 1, explanation: "A társadalombiztosítás: a munkaviszony bejelentése alapozza meg az ellátásokat." },
  { id: "e-c-sepe", topic: "civic", question: "Mit intéz a SEPE?", options: ["Az adóbevallást", "A munkanélküli-ellátást és a foglalkoztatást", "A nyugdíjfolyósítást", "Az útlevél-kiadást"], correct: 1, explanation: "Servicio Público de Empleo Estatal — a járulékalapú munkanélküli-ellátás (paro) is itt igényelhető." },
  { id: "e-c-hacienda", topic: "civic", question: "Mi az IRPF?", options: ["Az áfa", "A személyi jövedelemadó", "A társasági adó", "Az ingatlanadó"], correct: 1, explanation: "Impuesto sobre la Renta de las Personas Físicas. Az áfa az IVA, az ingatlanadó az IBI." },
  { id: "e-c-iva", topic: "civic", question: "Mennyi az általános áfakulcs (IVA general) Spanyolországban?", options: ["16%", "18%", "21%", "25%"], correct: 2, explanation: "21% az általános kulcs; van 10%-os kedvezményes és 4%-os szuperkedvezményes is." },
  { id: "e-c-jurado", topic: "civic", question: "Létezik-e esküdtszék (jurado popular) Spanyolországban?", options: ["Igen, meghatározott bűncselekményeknél", "Nem, sosem volt", "Csak polgári ügyekben", "Csak a katonai bíróságon"], correct: 0, explanation: "Igen — az alkotmány rögzíti, és bizonyos bűncselekmény-típusoknál állampolgárok döntenek a bűnösségről." },
  { id: "e-c-denuncia", topic: "civic", question: "Mi a „denuncia”?", options: ["Adóbevallás", "Feljelentés / bejelentés a hatóságnál", "Munkaszerződés", "Bérleti szerződés"], correct: 1, explanation: "Bejelentés a rendőrségen vagy a bíróságon. Lopás, baleset esetén ezt kell tenni." },
  { id: "e-c-omic", topic: "civic", question: "Hová fordulhatsz fogyasztói panasszal?", options: ["OMIC (fogyasztóvédelmi iroda)", "DGT", "SEPE", "INE"], correct: 0, explanation: "Oficina Municipal de Información al Consumidor. Az üzletnek kötelező hivatalos panaszlapot (hoja de reclamaciones) adnia." },
  { id: "e-c-dgt", topic: "civic", question: "Mivel foglalkozik a DGT?", options: ["Az oktatással", "A közúti közlekedéssel és a járműnyilvántartással", "Az egészségüggyel", "A nyugdíjakkal"], correct: 1, explanation: "Dirección General de Tráfico: jogosítvány, forgalmi engedély, pontrendszer, bírságok." },
  { id: "e-c-ine", topic: "civic", question: "Mit csinál az INE?", options: ["Statisztikákat készít és népszámlálást szervez", "Bíráskodik", "Adót szed", "Vízumot ad ki"], correct: 0, explanation: "Instituto Nacional de Estadística — a spanyol statisztikai hivatal; a padrón adatai is hozzá futnak be." },
  { id: "e-c-nacionalidad", topic: "civic", question: "Magyar állampolgárként jellemzően hány év tartózkodás után kérhető a spanyol állampolgárság?", options: ["2 év", "5 év", "10 év", "15 év"], correct: 2, explanation: "10 év. A 2 éves kedvezményes út latin-amerikai, portugál, andorrai, Fülöp-szigeteki és egyenlítői-guineai állampolgároknak jár." },
  { id: "e-c-ccse-dele", topic: "civic", question: "A CCSE mellett milyen vizsga kell jellemzően a honosításhoz?", options: ["Semmilyen", "DELE A2 nyelvvizsga", "Gépjárművezetői vizsga", "Egészségügyi alkalmassági"], correct: 1, explanation: "⚠️ DELE A2 spanyol nyelvvizsga is kell — spanyol ajkú országból érkezőknek nem. Magyarként MINDKETTŐ szükséges." },
  { id: "e-c-ccse-org", topic: "civic", question: "Ki szervezi a CCSE-vizsgát?", options: ["A belügyminisztérium", "Az Instituto Cervantes", "Az önkormányzat", "A rendőrség"], correct: 1, explanation: "Az Instituto Cervantes — a vizsga díjköteles, és előre kell rá jelentkezni." },
  { id: "e-c-ccse-nota", topic: "civic", question: "Hány százalék az átmenő a CCSE-vizsgán?", options: ["50%", "60%", "75%", "80%"], correct: 1, explanation: "60% — 25 kérdésből 15 helyes válasz. A vizsga 45 perces." },
  { id: "e-c-renuncia", topic: "civic", question: "Mi a fő szabály a korábbi állampolgárságról a spanyol honosításnál?", options: ["Mindenki megtarthatja", "Fő szabály szerint le kell mondani róla", "Csak EU-soknak kell lemondani", "Nincs róla szabály"], correct: 1, explanation: "⚠️ Fő szabályként le kell mondani; a kivétel a rövidített úthoz kötött országokat érinti, Magyarországot nem. Honosítás előtt kérj személyre szabott jogi tanácsot." },
  { id: "e-c-vivienda", topic: "civic", question: "Melyik törvény szabályozza a lakásbérlést?", options: ["LAU (Ley de Arrendamientos Urbanos)", "LOE", "LGSS", "ET"], correct: 0, explanation: "A Ley de Arrendamientos Urbanos. Lakhatási bérletnél a kaució (fianza) egy havi bér." },

  // ══════════ GEOGRAPHY — Területi szervezet és földrajz ══════════
  { id: "e-g-ccaa", topic: "geography", question: "Hány autonóm közösségből áll Spanyolország?", options: ["15", "17", "19", "22"], correct: 1, explanation: "17 autonóm közösség, PLUSZ két autonóm város: Ceuta és Melilla." },
  { id: "e-g-ciudades", topic: "geography", question: "Melyik két autonóm VÁROSA van Spanyolországnak?", options: ["Ceuta és Melilla", "Gibraltár és Tanger", "Palma és Ibiza", "Vigo és A Coruña"], correct: 0, explanation: "Ceuta és Melilla — mindkettő Afrika északi partján, Marokkóval határosan." },
  { id: "e-g-provincias", topic: "geography", question: "Hány tartomány (provincia) van Spanyolországban?", options: ["40", "45", "50", "52"], correct: 2, explanation: "50 provincia. Ceuta és Melilla autonóm város, nem tartomány." },
  { id: "e-g-capital", topic: "geography", question: "Mi Spanyolország fővárosa?", options: ["Barcelona", "Madrid", "Sevilla", "Valencia"], correct: 1, explanation: "Madrid — egyben a Comunidad de Madrid székhelye is." },
  { id: "e-g-ayuntamiento", topic: "geography", question: "Ki vezeti az önkormányzatot (ayuntamiento)?", options: ["El alcalde (a polgármester)", "El presidente", "El gobernador", "El delegado"], correct: 0, explanation: "A polgármester (alcalde/alcaldesa), akit a megválasztott képviselő-testület választ meg." },
  { id: "e-g-teide", topic: "geography", question: "Mi Spanyolország legmagasabb hegye?", options: ["Mulhacén", "Teide", "Aneto", "Veleta"], correct: 1, explanation: "A Teide (3715 m) Tenerifén. A szárazföld legmagasabb pontja a Mulhacén (3479 m) a Sierra Nevadában." },
  { id: "e-g-ebro", topic: "geography", question: "Melyik a leghosszabb folyó, amely teljes hosszában Spanyolországban folyik?", options: ["Tajo", "Ebro", "Duero", "Guadalquivir"], correct: 1, explanation: "Az Ebro. A Tajo hosszabb, de Portugáliában (Tejo néven) éri el a tengert." },
  { id: "e-g-guadalquivir", topic: "geography", question: "Melyik folyó folyik Sevillán keresztül?", options: ["Ebro", "Duero", "Guadalquivir", "Miño"], correct: 2, explanation: "A Guadalquivir — Andalúzia fő folyója, Sevilla történelmi kikötője." },
  { id: "e-g-fronteras", topic: "geography", question: "Melyik országgal NEM határos Spanyolország?", options: ["Portugália", "Franciaország", "Andorra", "Olaszország"], correct: 3, explanation: "Szárazföldi szomszédok: Portugália, Franciaország, Andorra, valamint Marokkó (Ceutánál és Melillánál) és Gibraltár." },
  { id: "e-g-pirineos", topic: "geography", question: "Melyik hegység választja el Spanyolországot Franciaországtól?", options: ["Sierra Nevada", "Pireneusok", "Cordillera Cantábrica", "Sistema Central"], correct: 1, explanation: "A Pireneusok (los Pirineos) — Andorra is ebben a hegységben fekszik." },
  { id: "e-g-baleares", topic: "geography", question: "Melyik tengerben fekszenek a Baleár-szigetek?", options: ["Atlanti-óceán", "Földközi-tenger", "Vizcayai-öböl", "Fekete-tenger"], correct: 1, explanation: "A Földközi-tengerben: Mallorca, Menorca, Ibiza, Formentera." },
  { id: "e-g-canarias", topic: "geography", question: "Hol találhatók a Kanári-szigetek?", options: ["A Földközi-tengerben", "Az Atlanti-óceánban, Afrika partjainál", "A Vizcayai-öbölben", "A Vörös-tengerben"], correct: 1, explanation: "Az Atlanti-óceánban, Marokkó magasságában — ezért van ott egy órával kevesebb, mint a szárazföldön." },
  { id: "e-g-huso", topic: "geography", question: "Mennyivel tér el a Kanári-szigetek ideje a szárazföldtől?", options: ["Nincs eltérés", "Egy órával kevesebb", "Egy órával több", "Két órával kevesebb"], correct: 1, explanation: "Egy órával kevesebb — a tévéműsorok ezért jelzik külön a „hora canaria”-t." },
  { id: "e-g-segunda", topic: "geography", question: "Melyik Spanyolország második legnépesebb városa?", options: ["Valencia", "Sevilla", "Barcelona", "Zaragoza"], correct: 2, explanation: "Barcelona. Madrid az első, Valencia a harmadik." },
  { id: "e-g-clima", topic: "geography", question: "Milyen éghajlat jellemzi a spanyol Földközi-tenger partvidékét?", options: ["Sarkvidéki", "Mediterrán: enyhe tél, meleg és száraz nyár", "Trópusi esős", "Sivatagi egész évben"], correct: 1, explanation: "Mediterrán éghajlat. Északon (Galicia, Asztúria, Baszkföld) ezzel szemben óceáni, csapadékos." },
  { id: "e-g-verde", topic: "geography", question: "Melyik területet hívják „España Verde”-nek?", options: ["Andalúziát", "Az északi, atlanti partvidéket", "A Kanári-szigeteket", "Kasztíliát"], correct: 1, explanation: "Galicia, Asztúria, Kantábria és Baszkföld — a csapadékos, zöld északi sáv." },
  { id: "e-g-meseta", topic: "geography", question: "Mi a Meseta Central?", options: ["Egy nagy tó", "A félsziget közepén elterülő fennsík", "Egy szigetcsoport", "Egy hegycsúcs"], correct: 1, explanation: "A központi fennsík, ami az Ibériai-félsziget nagy részét kitölti — Madrid is rajta fekszik." },
  { id: "e-g-poblacion", topic: "geography", question: "Nagyjából mekkora Spanyolország lakossága?", options: ["kb. 25 millió", "kb. 35 millió", "kb. 48 millió", "kb. 70 millió"], correct: 2, explanation: "Nagyjából 48 millió — az EU egyik legnépesebb tagállama." },
  { id: "e-g-gibraltar", topic: "geography", question: "Mi Gibraltár jogállása?", options: ["Spanyol autonóm város", "Brit tengerentúli terület", "Független állam", "Portugál terület"], correct: 1, explanation: "Brit tengerentúli terület az Ibériai-félsziget déli csücskén; Spanyolország vitatja a hovatartozását." },
  { id: "e-g-diputacion", topic: "geography", question: "Mi a Diputación Provincial?", options: ["A tartomány önkormányzati szerve", "A parlament bizottsága", "Egy bíróság", "A kormány hivatala"], correct: 0, explanation: "A tartományi szintű önkormányzati szerv, ami a kisebb települések feladatait segíti." },
  { id: "e-g-municipio", topic: "geography", question: "Mi a legkisebb közigazgatási egység?", options: ["A comunidad autónoma", "A provincia", "A municipio (település)", "A comarca"], correct: 2, explanation: "A municipio — ennek az önkormányzata az ayuntamiento, ahol az empadronamientót is intézed." },
  { id: "e-g-estrecho", topic: "geography", question: "Melyik tengerszoros választja el Spanyolországot Afrikától?", options: ["Bosporus", "Gibraltári-szoros", "Messinai-szoros", "Dardanellák"], correct: 1, explanation: "A Gibraltári-szoros (Estrecho de Gibraltar) — a legkeskenyebb pontján kb. 14 km." },

  // ══════════ HISTORY — Történelem és kultúra ══════════
  { id: "e-h-1492", topic: "history", question: "Mi történt 1492-ben?", options: ["A polgárháború kitörése", "Granada elfoglalása és Kolumbusz első útja", "Az alkotmány elfogadása", "Az EU-csatlakozás"], correct: 1, explanation: "A Katolikus Királyok elfoglalták Granadát (a reconquista vége), és ugyanabban az évben indult Kolumbusz." },
  { id: "e-h-reyes", topic: "history", question: "Kik voltak a Katolikus Királyok (Reyes Católicos)?", options: ["Kasztíliai Izabella és Aragóniai Ferdinánd", "II. Fülöp és Mária", "V. Károly és Johanna", "I. Alfonz és Uraca"], correct: 0, explanation: "Isabel de Castilla és Fernando de Aragón — házasságukkal indult a spanyol királyságok egyesülése." },
  { id: "e-h-alandalus", topic: "history", question: "Mit jelent az „Al-Ándalus”?", options: ["Az Ibériai-félsziget muszlim uralom alatti területét", "Andalúzia mai nevét", "Egy középkori lovagrendet", "Egy folyót"], correct: 0, explanation: "A muszlim uralom alatti terület a 8. századtól; öröksége a córdobai mecset és a granadai Alhambra." },
  { id: "e-h-alhambra", topic: "history", question: "Melyik városban áll az Alhambra?", options: ["Sevilla", "Granada", "Córdoba", "Toledo"], correct: 1, explanation: "Granadában — a Nasrida-dinasztia palotaegyüttese, ma az ország leglátogatottabb műemléke." },
  { id: "e-h-armada", topic: "history", question: "Mi volt a „Legyőzhetetlen Armada” (1588)?", options: ["Egy katedrális", "II. Fülöp Anglia ellen indított hajóhada", "Egy kereskedelmi társaság", "Egy lovagrend"], correct: 1, explanation: "A hadjárat kudarcba fulladt — részben az angol hajóhad, részben a viharok miatt." },
  { id: "e-h-siglodeoro", topic: "history", question: "Mi a „Siglo de Oro”?", options: ["Az aranybányászat kora", "A spanyol művészet és irodalom aranykora (16–17. sz.)", "A gazdasági válság kora", "Az iparosítás időszaka"], correct: 1, explanation: "Cervantes, Lope de Vega, Quevedo és Velázquez kora." },
  { id: "e-h-quijote", topic: "history", question: "Ki írta a Don Quijotét?", options: ["Lope de Vega", "Miguel de Cervantes", "Federico García Lorca", "Benito Pérez Galdós"], correct: 1, explanation: "Miguel de Cervantes, 1605-ben — sokan a modern regény első darabjának tartják." },
  { id: "e-h-velazquez", topic: "history", question: "Ki festette a Las Meninas című képet?", options: ["Goya", "Velázquez", "El Greco", "Murillo"], correct: 1, explanation: "Diego Velázquez, 1656 körül. A kép a madridi Prado Múzeumban látható." },
  { id: "e-h-goya", topic: "history", question: "Melyik festő készítette a „Los fusilamientos del 3 de mayo” című képet?", options: ["Francisco de Goya", "Pablo Picasso", "Joan Miró", "Salvador Dalí"], correct: 0, explanation: "Goya, a napóleoni megszállás elleni felkelés emlékére. A Pradóban látható." },
  { id: "e-h-guernica", topic: "history", question: "Ki festette a Guernicát?", options: ["Dalí", "Picasso", "Miró", "Goya"], correct: 1, explanation: "Pablo Picasso, 1937-ben, a baszk város bombázása után. A madridi Reina Sofíában látható." },
  { id: "e-h-gaudi", topic: "history", question: "Ki tervezte a barcelonai Sagrada Famíliát?", options: ["Antoni Gaudí", "Santiago Calatrava", "Rafael Moneo", "Ricardo Bofill"], correct: 0, explanation: "Antoni Gaudí. Az építkezés 1882-ben kezdődött, és máig tart." },
  { id: "e-h-prado", topic: "history", question: "Melyik városban van a Prado Múzeum?", options: ["Barcelona", "Madrid", "Bilbao", "Sevilla"], correct: 1, explanation: "Madridban — Velázquez, Goya és El Greco fő gyűjtőhelye." },
  { id: "e-h-guggenheim", topic: "history", question: "Melyik városban áll a Guggenheim Múzeum spanyol épülete?", options: ["Bilbao", "Valencia", "Málaga", "Zaragoza"], correct: 0, explanation: "Bilbaóban — Frank Gehry épülete önmagában újította meg a város arculatát." },
  { id: "e-h-guerracivil", topic: "history", question: "Mikor zajlott a spanyol polgárháború?", options: ["1914–1918", "1936–1939", "1945–1948", "1931–1933"], correct: 1, explanation: "1936 és 1939 között; a háborút Franco tábornok oldala nyerte." },
  { id: "e-h-franco", topic: "history", question: "Melyik évben halt meg Franco tábornok?", options: ["1969", "1975", "1978", "1981"], correct: 1, explanation: "1975-ben — halálával indult a demokratikus átmenet és a monarchia visszaállítása." },
  { id: "e-h-23f", topic: "history", question: "Mi történt 1981. február 23-án?", options: ["Az alkotmány elfogadása", "Sikertelen puccskísérlet a parlamentben", "Az EU-csatlakozás", "Az euró bevezetése"], correct: 1, explanation: "A „23-F”: fegyveresek behatoltak a Kongresszusba; a puccs megbukott, és megerősítette a demokráciát." },
  { id: "e-h-1992", topic: "history", question: "Mi tette 1992-t kiemelkedő évvé Spanyolországban?", options: ["Barcelonai olimpia és sevillai világkiállítás", "Az EU-csatlakozás", "Az alkotmány elfogadása", "Az euró bevezetése"], correct: 0, explanation: "A barcelonai nyári olimpia és a sevillai Expo — Spanyolország nemzetközi bemutatkozásának éve." },
  { id: "e-h-lorca", topic: "history", question: "Ki volt Federico García Lorca?", options: ["Költő és drámaíró", "Festő", "Építész", "Zeneszerző"], correct: 0, explanation: "A 20. század egyik legnagyobb spanyol költője és drámaírója; a polgárháború elején meggyilkolták." },
  { id: "e-h-cervantespremio", topic: "history", question: "Mi a Premio Cervantes?", options: ["Filmdíj", "A spanyol nyelvű irodalom legrangosabb díja", "Sportdíj", "Tudományos díj"], correct: 1, explanation: "A spanyol nyelvterület legrangosabb irodalmi díja, évente osztják ki." },
  { id: "e-h-camino", topic: "history", question: "Mi a Camino de Santiago?", options: ["Egy autópálya", "Zarándokút Santiago de Compostelába", "Egy vasútvonal", "Egy hegyi ösvény a Pireneusokban"], correct: 1, explanation: "Középkori eredetű zarándokút; az UNESCO világörökség része." },
  { id: "e-h-altamira", topic: "history", question: "Miről híres az altamirai barlang?", options: ["Őskori barlangfestményekről", "Római romokról", "Középkori kolostorról", "Sóbányáról"], correct: 0, explanation: "Kantábriában, világhírű őskori (paleolit) barlangfestményekkel — UNESCO világörökség." },
  { id: "e-h-sanfermin", topic: "history", question: "Melyik városban tartják a San Fermín ünnepet?", options: ["Sevilla", "Pamplona", "Valencia", "Bilbao"], correct: 1, explanation: "Pamplonában, júliusban — a bikafuttatásról (encierro) ismert." },
  { id: "e-h-fallas", topic: "history", question: "Melyik városhoz kötődnek a Fallas ünnepségek?", options: ["Valencia", "Granada", "Zaragoza", "Salamanca"], correct: 0, explanation: "Valenciához: márciusban óriási papírmasé-figurákat állítanak ki, majd elégetik őket." },
  { id: "e-h-feria", topic: "history", question: "Melyik városban tartják a Feria de Abrilt?", options: ["Sevilla", "Córdoba", "Málaga", "Cádiz"], correct: 0, explanation: "Sevillában, húsvét után — flamenco, sevillanas és díszes sátrak (casetas)." },
  { id: "e-h-reyesmagos", topic: "history", question: "Melyik napon kapják a spanyol gyerekek hagyományosan az ajándékot?", options: ["December 6.", "December 24.", "December 31.", "Január 6."], correct: 3, explanation: "Január 6-án, Vízkeresztkor — a Három Királyok (los Reyes Magos) hozzák; előtte este felvonulás (cabalgata)." },
  { id: "e-h-flamenco", topic: "history", question: "Melyik régióból származik a flamenco?", options: ["Katalónia", "Andalúzia", "Galicia", "Baszkföld"], correct: 1, explanation: "Andalúziából; az UNESCO az emberiség szellemi kulturális örökségének része." },
  { id: "e-h-paella", topic: "history", question: "Melyik régióból származik a paella?", options: ["Andalúzia", "Valencia", "Katalónia", "Asztúria"], correct: 1, explanation: "Valenciából. Az eredeti valenciai paellában csirke és nyúl van, nem tenger gyümölcsei." },
  { id: "e-h-mundial", topic: "history", question: "Melyik évben nyerte meg Spanyolország a labdarúgó-világbajnokságot?", options: ["2006", "2010", "2014", "1998"], correct: 1, explanation: "2010-ben, Dél-Afrikában — a döntőben Hollandiát győzte le." },
  { id: "e-h-santiago", topic: "history", question: "Ki Spanyolország védőszentje?", options: ["Szent Jakab (Santiago Apóstol)", "Szent Ferenc", "Szent Péter", "Szent György"], correct: 0, explanation: "Santiago Apóstol; ünnepe július 25., és Galicia ünnepnapja is." },
  { id: "e-h-quijote-manuscrito", topic: "history", question: "Melyik régió a Don Quijote helyszíne?", options: ["Andalúzia", "La Mancha (Castilla-La Mancha)", "Galicia", "Aragónia"], correct: 1, explanation: "„En un lugar de la Mancha…” — a regény nyitómondata La Manchát nevezi meg." },

  // ══════════ CANTON — Autonóm közösségek ══════════
  { id: "e-r-md-1", topic: "canton", cantonCode: "MD", question: "Mi a Comunidad de Madrid székhelye?", options: ["Alcalá de Henares", "Madrid", "Getafe", "Móstoles"], correct: 1, explanation: "Madrid — egyszerre az ország és a közösség fővárosa." },
  { id: "e-r-md-2", topic: "canton", cantonCode: "MD", question: "Melyik madridi tér számít a spanyol úthálózat nulla kilométerkövének?", options: ["Plaza Mayor", "Puerta del Sol", "Plaza de Cibeles", "Plaza de España"], correct: 1, explanation: "A Puerta del Sol — innen indul a hat sugárirányú főút számozása." },
  { id: "e-r-ct-1", topic: "canton", cantonCode: "CT", question: "Mi Katalónia székhelye?", options: ["Girona", "Tarragona", "Barcelona", "Lleida"], correct: 2, explanation: "Barcelona. Katalónia négy tartományból áll: Barcelona, Girona, Tarragona és Lleida." },
  { id: "e-r-ct-2", topic: "canton", cantonCode: "CT", question: "Melyik nyelv társhivatalos Katalóniában a kasztíliai mellett?", options: ["Baszk", "Katalán", "Galiciai", "Portugál"], correct: 1, explanation: "A katalán. A Val d'Aran völgyében az aranéz (okcitán) is hivatalos." },
  { id: "e-r-an-1", topic: "canton", cantonCode: "AN", question: "Mi Andalúzia székhelye?", options: ["Málaga", "Granada", "Sevilla", "Córdoba"], correct: 2, explanation: "Sevilla. Andalúzia nyolc tartományból áll — a legtöbb az összes közösség közül." },
  { id: "e-r-an-2", topic: "canton", cantonCode: "AN", question: "Melyik hegység található Andalúziában?", options: ["Pireneusok", "Sierra Nevada", "Cordillera Cantábrica", "Montes de León"], correct: 1, explanation: "A Sierra Nevada — itt van a szárazföld legmagasabb csúcsa, a Mulhacén (3479 m)." },
  { id: "e-r-vc-1", topic: "canton", cantonCode: "VC", question: "Mi a Valenciai Közösség székhelye?", options: ["Alicante", "Castellón", "Valencia", "Elche"], correct: 2, explanation: "Valencia. A közösség három tartománya: Valencia, Alicante és Castellón." },
  { id: "e-r-vc-2", topic: "canton", cantonCode: "VC", question: "Hogy hívják a Valenciai Közösségben társhivatalos nyelvet?", options: ["Valenciai", "Baszk", "Galiciai", "Aranéz"], correct: 0, explanation: "A valenciai (valencià) — nyelvészetileg a katalán nyelvterület része, a statútum ezen a néven rögzíti." },
  { id: "e-r-ib-1", topic: "canton", cantonCode: "IB", question: "Mi a Baleár-szigetek székhelye?", options: ["Ibiza", "Maó", "Palma", "Manacor"], correct: 2, explanation: "Palma, Mallorca szigetén — a közösség legnagyobb városa is." },
  { id: "e-r-ib-2", topic: "canton", cantonCode: "IB", question: "Melyik NEM tartozik a Baleár-szigetekhez?", options: ["Mallorca", "Menorca", "Formentera", "Lanzarote"], correct: 3, explanation: "Lanzarote a Kanári-szigetek egyike. A Baleárok: Mallorca, Menorca, Ibiza, Formentera." },
  { id: "e-r-cn-1", topic: "canton", cantonCode: "CN", question: "Hány székhelye van a Kanári-szigeteknek?", options: ["Egy: Las Palmas", "Kettő: Las Palmas és Santa Cruz de Tenerife", "Egy: Santa Cruz", "Három"], correct: 1, explanation: "Két társ-székhely váltja egymást négyévente — Spanyolországban egyedülálló megoldás." },
  { id: "e-r-cn-2", topic: "canton", cantonCode: "CN", question: "Milyen adó van a Kanári-szigeteken az IVA (áfa) helyett?", options: ["IGIC", "IBI", "IRPF", "ITP"], correct: 0, explanation: "IGIC (Impuesto General Indirecto Canario) — a szigetek külön közvetett adózási rendszere, alacsonyabb kulcsokkal." },
  { id: "e-r-pv-1", topic: "canton", cantonCode: "PV", question: "Mi Baszkföld székhelye?", options: ["Bilbao", "San Sebastián", "Vitoria-Gasteiz", "Pamplona"], correct: 2, explanation: "Vitoria-Gasteiz. Bilbao a legnagyobb város, Pamplona pedig már Navarrában van." },
  { id: "e-r-pv-2", topic: "canton", cantonCode: "PV", question: "Hogy hívják a baszk nyelvet baszkul?", options: ["Galego", "Euskera", "Català", "Aranés"], correct: 1, explanation: "Euskera (euskara). Baszkföldön és Navarra egy részén társhivatalos." },
  { id: "e-r-ga-1", topic: "canton", cantonCode: "GA", question: "Mi Galicia székhelye?", options: ["A Coruña", "Vigo", "Santiago de Compostela", "Ourense"], correct: 2, explanation: "Santiago de Compostela — a Camino zarándokút célpontja is. Vigo a legnagyobb város." },
  { id: "e-r-ga-2", topic: "canton", cantonCode: "GA", question: "Melyik nyelv társhivatalos Galiciában?", options: ["Galiciai (galego)", "Baszk", "Katalán", "Asztúriai"], correct: 0, explanation: "A galego, ami a portugállal áll közeli rokonságban." },
  { id: "e-r-cl-1", topic: "canton", cantonCode: "CL", question: "Mi jellemző Castilla y Leónra?", options: ["Spanyolország legnagyobb területű autonóm közössége", "A legkisebb közösség", "Sziget-közösség", "Nincs saját statútuma"], correct: 0, explanation: "Területileg a legnagyobb, kilenc tartománnyal; székhelye Valladolid." },
  { id: "e-r-cl-2", topic: "canton", cantonCode: "CL", question: "Melyik városban van Spanyolország egyik legrégebbi egyeteme?", options: ["Salamanca", "Burgos", "Segovia", "Zamora"], correct: 0, explanation: "Salamanca, 1218-as alapítású — a spanyol nyelvterület legrégebbi egyeteme." },
  { id: "e-r-ar-1", topic: "canton", cantonCode: "AR", question: "Mi Aragónia székhelye?", options: ["Huesca", "Teruel", "Zaragoza", "Jaca"], correct: 2, explanation: "Zaragoza. A közösség három tartománya: Zaragoza, Huesca és Teruel." },
  { id: "e-r-ar-2", topic: "canton", cantonCode: "AR", question: "Melyik középkori királyság központja volt Aragónia?", options: ["A Kasztíliai Királyságé", "Az Aragóniai Koronáé", "A Navarrai Királyságé", "A Leóni Királyságé"], correct: 1, explanation: "Az Aragóniai Korona (Corona de Aragón), ami Katalóniát, Valenciát és a Baleárokat is magába foglalta." },
];

/** A valódi CCSE 25 kérdés / 60% — a szimulátor ezt követi. */
export const ES_QUIZ_LENGTH = 25;
export const ES_PASS_THRESHOLD = 60;

/**
 * A menet összetétele a valódi vizsga BLOKK-arányait követi:
 *   • Bloque 1 (Gobierno, legislación y participación) — 15 kérdés
 *     → federal 6 + civic 5 + geography 4
 *   • Bloque 2 (Cultura, historia y sociedad) — 10 kérdés
 *     → history 7 + a választott közösség 3
 */
const ES_MIX: { topic: EbTopic; count: number }[] = [
  { topic: "federal",   count: 6 },
  { topic: "civic",     count: 5 },
  { topic: "geography", count: 4 },
  { topic: "history",   count: 7 },
  { topic: "canton",    count: 3 },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Egy menet sorsolása — országos témák + a választott közösség kérdései. */
export function generateQuizES(regionCode: string | null): EbQuestion[] {
  const result: EbQuestion[] = [];
  const used = new Set<string>();
  for (const mix of ES_MIX) {
    let pool: EbQuestion[];
    if (mix.topic === "canton") {
      pool = regionCode
        ? ES_BANK.filter((q) => q.topic === "canton" && q.cantonCode === regionCode)
        : ES_BANK.filter((q) => q.topic === "canton");
      // Ha a közösséghez kevés kérdés van, a többiével pótolunk (a menet hossza
      // így stabil marad — ugyanaz a minta, mint a CH/NL/GB bankban).
      if (pool.length < mix.count) {
        pool = [...pool, ...ES_BANK.filter((q) => q.topic === "canton" && q.cantonCode !== regionCode)];
      }
    } else {
      pool = ES_BANK.filter((q) => q.topic === mix.topic);
    }
    for (const q of shuffle(pool)) {
      if (result.length >= ES_QUIZ_LENGTH) break;
      if (!used.has(q.id)) { used.add(q.id); result.push(q); }
      if (result.filter((r) => r.topic === mix.topic).length >= mix.count) break;
    }
  }
  // Feltöltés a teljes hosszra, ha valamelyik témából kevés volt.
  for (const q of shuffle(ES_BANK)) {
    if (result.length >= ES_QUIZ_LENGTH) break;
    if (!used.has(q.id)) { used.add(q.id); result.push(q); }
  }
  return shuffle(result).slice(0, ES_QUIZ_LENGTH);
}
