/**
 * napi-szo.ts — „Napi szó": napi helyi kifejezés a kezdőlapon, a napi
 * szokás tartalom-horga. Ország-tudatos: CH = svájci német (Mundart), AT =
 * osztrák német, DE = hétköznapi/hivatali német, NL = hétköznapi holland.
 * A választás determinisztikus a nap sorszámából (nincs Math.random —
 * SSR-stabil), így mindenkinek ugyanaz a szó aznap.
 *
 * Hang: a kártya böngésző-TTS-t használ (speechSynthesis, de-CH / de-AT /
 * de-DE / nl-NL) — nincs hangfájl, és kecsesen elmarad, ha nem támogatott.
 */

export interface DailyWord {
  /** Magyar jelentés. */
  hu: string;
  /** A nyelvjárási szó/kifejezés (ezt mondatja ki a hang). */
  word: string;
  /** Egyszerű, magyaros kiejtés. */
  phonetic: string;
  /** Sztenderd megfelelő (CH/AT/DE: Hochdeutsch; NL: formális/teljes alak), vagy „—". */
  standard: string;
  /** Rövid használati tipp (opcionális). */
  note?: string;
}

/** Svájci német (Mundart) — hétköznapi kifejezések. */
const CH_WORDS: DailyWord[] = [
  { hu: "Jó napot (üdvözlés)", word: "Grüezi", phonetic: "grüöci", standard: "Guten Tag", note: "A leggyakoribb udvarias köszönés Svájcban." },
  { hu: "Szia (egy embernek)", word: "Hoi / Sali", phonetic: "hoj / száli", standard: "Hallo" },
  { hu: "Köszönöm szépen", word: "Merci vilmal", phonetic: "merszi filmál", standard: "Vielen Dank", note: "A franciás 'merci' Svájcban általános." },
  { hu: "Elnézést / Bocsánat", word: "Exgüsi", phonetic: "ekszgüzi", standard: "Entschuldigung" },
  { hu: "Hogy vagy?", word: "Wie gaht's?", phonetic: "vi gáhc", standard: "Wie geht's?" },
  { hu: "Jó étvágyat", word: "En Guete", phonetic: "en gúöte", standard: "Guten Appetit" },
  { hu: "Szívesen", word: "Gärn gscheh", phonetic: "gern gséh", standard: "Gern geschehen" },
  { hu: "Viszlát", word: "Adie / Ade", phonetic: "ádjö / áde", standard: "Auf Wiedersehen" },
  { hu: "Jó reggelt", word: "Guete Morge", phonetic: "gúöte morge", standard: "Guten Morgen" },
  { hu: "Tízórai (reggeli falat)", word: "Znüni", phonetic: "cnüni", standard: "Znüni (Vormittagssnack)", note: "A '9 órás' falatozás — szó szerint 'zu neun'." },
  { hu: "Ebéd", word: "Zmittag", phonetic: "cmittág", standard: "Mittagessen" },
  { hu: "Vacsora", word: "Znacht", phonetic: "cnáht", standard: "Abendessen" },
  { hu: "Bicikli", word: "Velo", phonetic: "velo", standard: "Fahrrad" },
  { hu: "Mobiltelefon", word: "Natel", phonetic: "nátel", standard: "Handy" },
  { hu: "Fagylalt", word: "Glace", phonetic: "glászé", standard: "Eis" },
  { hu: "Bevásárolni", word: "Poschte", phonetic: "poste", standard: "Einkaufen" },
  { hu: "Sárgarépa", word: "Rüebli", phonetic: "rüöbli", standard: "Karotte" },
  { hu: "Burgonya", word: "Härdöpfel", phonetic: "herdöpfel", standard: "Kartoffel" },
  { hu: "Járda", word: "Trottoir", phonetic: "trotoár", standard: "Gehsteig" },
  { hu: "Jegy", word: "Billet", phonetic: "bijé", standard: "Fahrkarte / Ticket" },
  { hu: "Kávé", word: "Kafi", phonetic: "káfi", standard: "Kaffee" },
  { hu: "Pohár sör (3 dl)", word: "Stange", phonetic: "stánge", standard: "ein kleines Bier" },
  { hu: "Árajánlat", word: "Offerte", phonetic: "oferte", standard: "Angebot" },
  { hu: "Parkolni", word: "parkiere", phonetic: "párkire", standard: "parken" },
  { hu: "Grillezni", word: "grilliere", phonetic: "grilire", standard: "grillen" },
  { hu: "Kórház", word: "Spital", phonetic: "spitál", standard: "Krankenhaus" },
  { hu: "Papucs (otthoni)", word: "Finken", phonetic: "finken", standard: "Hausschuhe" },
  { hu: "Dolgozni", word: "schaffe", phonetic: "saffe", standard: "arbeiten" },
  { hu: "Jó éjt", word: "Guet Nacht", phonetic: "gúöt náht", standard: "Gute Nacht" },
  { hu: "Konyhaszekrény (a híres nyelvtörő)", word: "Chuchichäschtli", phonetic: "huhihestli", standard: "Küchenschrank", note: "A svájci kiejtés próbaköve — a torokhang miatt." },
];

/** Osztrák német — hétköznapi kifejezések. */
const AT_WORDS: DailyWord[] = [
  { hu: "Szia (üdvözlés és búcsú)", word: "Servus", phonetic: "szervusz", standard: "Hallo / Tschüss" },
  { hu: "Jó napot", word: "Grüß Gott", phonetic: "grüsz gott", standard: "Guten Tag", note: "Hivatalos, mindennapi köszönés Ausztriában." },
  { hu: "Szia (búcsú)", word: "Pfiat di", phonetic: "pfiat di", standard: "Tschüss / Mach's gut" },
  { hu: "Uzsonna / tízórai", word: "Jause", phonetic: "jauze", standard: "Zwischenmahlzeit / Snack" },
  { hu: "Sárgabarack", word: "Marille", phonetic: "marille", standard: "Aprikose" },
  { hu: "Burgonya", word: "Erdäpfel", phonetic: "erdepfel", standard: "Kartoffel" },
  { hu: "Paradicsom", word: "Paradeiser", phonetic: "parádájzer", standard: "Tomate" },
  { hu: "Zacskó / szatyor", word: "Sackerl", phonetic: "zákkerl", standard: "Tüte / Beutel" },
  { hu: "Zsemle", word: "Semmel", phonetic: "zemmel", standard: "Brötchen" },
  { hu: "Karfiol", word: "Karfiol", phonetic: "kárfiol", standard: "Blumenkohl" },
  { hu: "Zöldbab", word: "Fisolen", phonetic: "fizolen", standard: "grüne Bohnen" },
  { hu: "Túró", word: "Topfen", phonetic: "topfen", standard: "Quark" },
  { hu: "Tejszín", word: "Obers", phonetic: "óbersz", standard: "Sahne" },
  { hu: "Palacsinta", word: "Palatschinke", phonetic: "palatsinke", standard: "Pfannkuchen" },
  { hu: "Desszert", word: "Nachspeise", phonetic: "náhspájze", standard: "Dessert / Nachtisch" },
  { hu: "Cukorka", word: "Zuckerl", phonetic: "cukkerl", standard: "Bonbon" },
  { hu: "Bögre", word: "Häferl", phonetic: "heferl", standard: "Tasse / Becher" },
  { hu: "Párna", word: "Polster", phonetic: "polszter", standard: "Kissen" },
  { hu: "Lépcső", word: "Stiege", phonetic: "stíge", standard: "Treppe" },
  { hu: "Villamos", word: "Bim", phonetic: "bim", standard: "Straßenbahn", note: "Bécsi köznyelvi szó a villamosra." },
  { hu: "Dohánybolt / újságos", word: "Trafik", phonetic: "tráfik", standard: "Tabak-/Zeitungsladen" },
  { hu: "Kocsma / vendéglő", word: "Beisl", phonetic: "bájzl", standard: "Kneipe / Wirtshaus" },
  { hu: "Borozó (újbor-kimérés)", word: "Heuriger", phonetic: "hojriger", standard: "Weinlokal" },
  { hu: "Bankautomata", word: "Bankomat", phonetic: "bánkomát", standard: "Geldautomat" },
  { hu: "Kórház", word: "Spital", phonetic: "spitál", standard: "Krankenhaus" },
  { hu: "Szuper / klassz", word: "leiwand", phonetic: "lájvánd", standard: "großartig / super", note: "Bécsi szleng — informális." },
  { hu: "Rendesen / okosan", word: "gscheit", phonetic: "gsájt", standard: "gescheit / richtig" },
  { hu: "Humor / duma", word: "Schmäh", phonetic: "smé", standard: "Witz / Charme", note: "A 'Wiener Schmäh' a bécsi humor." },
  { hu: "Jó étvágyat", word: "Mahlzeit", phonetic: "málcájt", standard: "Guten Appetit" },
  { hu: "Köszönöm", word: "Danke schön", phonetic: "dánke sőn", standard: "Danke sehr" },
];

/** Németország — hasznos hétköznapi + hivatali szavak (a sztenderd német a cél). */
const DE_WORDS: DailyWord[] = [
  { hu: "Időpont / foglalás", word: "Termin", phonetic: "termin", standard: "Verabredung / Reservierung", note: "Németországban SZINTE MINDENHEZ Termin kell — orvos, hivatal, bank." },
  { hu: "Lakcím-bejelentés", word: "Anmeldung", phonetic: "ánmeldung", standard: "Wohnsitz-Registrierung", note: "Beköltözés után a Bürgeramtnál — ez kell mindenhez (bankszámla, adószám)." },
  { hu: "Betét (üveg/doboz)", word: "Pfand", phonetic: "pfand", standard: "Flaschenpfand", note: "A palack/doboz ára (0,25 €) visszajár az automatánál (Pfandautomat)." },
  { hu: "Munka utáni szabadidő", word: "Feierabend", phonetic: "fájerábend", standard: "Arbeitsende", note: "„Schönen Feierabend!\" = szép pihenést munka után." },
  { hu: "Egészségbiztosító", word: "Krankenkasse", phonetic: "kránkenkásze", standard: "Krankenversicherung", note: "Kötelező; gesetzlich (AOK, TK, Barmer…) vagy privat." },
  { hu: "Táppénzes papír", word: "Krankschreibung", phonetic: "kránksrájbung", standard: "Arbeitsunfähigkeitsbescheinigung", note: "Az orvostól; a munkáltatónak ÉS a Krankenkassénak küldeni kell." },
  { hu: "Médiajárulék", word: "Rundfunkbeitrag", phonetic: "rundfunkbájtrág", standard: "GEZ", note: "Háztartásonként kötelező (~18,36 €/hó), a lakcímre jön." },
  { hu: "Családi pótlék", word: "Kindergeld", phonetic: "kindergeld", standard: "—", note: "A Familienkassénál igényled; gyermekenként havi ~250 €." },
  { hu: "Adóhivatal", word: "Finanzamt", phonetic: "fináncámt", standard: "Steuerbehörde" },
  { hu: "Adóbevallás", word: "Steuererklärung", phonetic: "stojer-erklérung", standard: "—", note: "Sokszor visszajár pénz — érdemes beadni (ELSTER vagy app)." },
  { hu: "Nyugta / blokk", word: "Kassenbon", phonetic: "kásszenbon", standard: "Quittung / Beleg" },
  { hu: "Zsemle", word: "Brötchen", phonetic: "bröthen", standard: "Semmel (dél) / Schrippe (Berlin)", note: "Délen Semmel, Berlinben Schrippe ugyanaz." },
  { hu: "Csirke (sült)", word: "Hähnchen", phonetic: "hénhen", standard: "Hühnchen" },
  { hu: "Túró", word: "Quark", phonetic: "kvark", standard: "—" },
  { hu: "Forgalmi dugó", word: "Stau", phonetic: "stau", standard: "Verkehrsstau", note: "Az Autobahn-on gyakori — a DB Navigator/Google jelzi." },
  { hu: "Vágány", word: "Gleis", phonetic: "glájsz", standard: "Bahnsteig", note: "„Gleis 7\" = 7-es vágány a pályaudvaron." },
  { hu: "Késés", word: "Verspätung", phonetic: "ferspétung", standard: "—", note: "A DB klasszikusa; 60+ perc késésnél jegyár-visszatérítés jár." },
  { hu: "Gyógyszertár", word: "Apotheke", phonetic: "ápotéke", standard: "—", note: "Recept = Rezept; a Drogerie (dm, Rossmann) NEM gyógyszertár." },
  { hu: "Bliccelés", word: "Schwarzfahren", phonetic: "svárcfáren", standard: "Fahren ohne Ticket", note: "Büntetés (~60 €) + a Deutschlandticket szinte kizárja." },
  { hu: "Szemétszelektálás", word: "Mülltrennung", phonetic: "mülltrennung", standard: "—", note: "Gelber Sack (műanyag), Papier, Bio, Restmüll, Glas — szigorú!" },
  { hu: "Gondnok / házmester", word: "Hausmeister", phonetic: "hauszmájszter", standard: "—" },
  { hu: "Köszönés (északon)", word: "Moin", phonetic: "mojn", standard: "Hallo / Guten Tag", note: "Észak-Németország — egész nap használható, nem csak reggel." },
  { hu: "Szia (búcsú)", word: "Tschüss", phonetic: "csüsz", standard: "Auf Wiedersehen" },
  { hu: "Egészségedre (koccintás)", word: "Prost", phonetic: "proszt", standard: "Zum Wohl" },
  { hu: "Pontosan / így van", word: "Genau", phonetic: "genau", standard: "Richtig", note: "A németek beszéd-tölteléke — nagyon sokszor hallod." },
  { hu: "Rendben / megvan", word: "Alles klar", phonetic: "ÁLlesz klár", standard: "In Ordnung" },
  { hu: "Jó étvágyat (déli köszönés)", word: "Mahlzeit", phonetic: "málcájt", standard: "Guten Appetit", note: "Munkahelyen délben köszönésként is használják." },
  { hu: "Felmondás", word: "Kündigung", phonetic: "kündigung", standard: "—", note: "Munka- és lakásszerződésnél is; mindig írásban, határidővel (Frist)." },
  { hu: "Kaució", word: "Kaution", phonetic: "kaucion", standard: "Mietkaution", note: "Lakásnál max 3 havi hideg-bérleti díj (Kaltmiete)." },
  { hu: "Mellékköltség (rezsi)", word: "Nebenkosten", phonetic: "nébenkoszten", standard: "Betriebskosten", note: "A Kaltmiete + Nebenkosten = Warmmiete (a tényleges havi díj)." },
];

/**
 * Hollandia — hétköznapi + hivatali holland. A szókincs a nyelvlecke-modul
 * kurált NL-tananyagából (data-nl.ts) és az NL-útmutatók (BRP/BSN, huren,
 * zorgverzekering) kulcsszavaiból válogat — nem gépi fordítás.
 */
const NL_WORDS: DailyWord[] = [
  { hu: "Jó napot", word: "Goedendag", phonetic: "hudendah", standard: "—", note: "Semleges, egész nap használható köszönés." },
  { hu: "Szia (köszönés)", word: "Hallo", phonetic: "halló", standard: "Goedendag" },
  { hu: "Jó reggelt", word: "Goedemorgen", phonetic: "hudemorhe", standard: "—" },
  { hu: "Jó estét", word: "Goedenavond", phonetic: "hudenávond", standard: "—" },
  { hu: "Szia (búcsúzás)", word: "Doei", phonetic: "dúj", standard: "Tot ziens", note: "Informális — boltban, ismerősöknek; a „Tot ziens\" az udvarias." },
  { hu: "Viszontlátásra", word: "Tot ziens", phonetic: "tot zíensz", standard: "—" },
  { hu: "Köszönöm szépen", word: "Dank je wel", phonetic: "dank je vel", standard: "Dank u wel", note: "Magázva: „Dank u wel\" — hivatalban, idősebbeknek." },
  { hu: "Kérlek / tessék", word: "Alsjeblieft", phonetic: "alsjeblíft", standard: "Alstublieft", note: "Magázva: „Alstublieft\" — a pénztáros is ezzel ad át mindent." },
  { hu: "Elnézést", word: "Sorry", phonetic: "szorri", standard: "Excuses", note: "A hollandok is simán az angol „sorry\"-t használják." },
  { hu: "Szívesen (válasz)", word: "Graag gedaan", phonetic: "hráh hedán", standard: "—" },
  { hu: "Finom / kellemes", word: "Lekker", phonetic: "lekker", standard: "—", note: "Mindenre: étel, idő, alvás — „lekker weer\" = jó idő. Nagyon holland." },
  { hu: "Hangulatos / otthonos", word: "Gezellig", phonetic: "hezellih", standard: "—", note: "A hollandok kedvenc lefordíthatatlan szava — társaság, hely, este is lehet az." },
  { hu: "Bicikli", word: "Fiets", phonetic: "fíc", standard: "—", note: "Több bicikli van, mint ember — a fietspad (bicikliút) szent." },
  { hu: "Bevásárlás", word: "Boodschappen", phonetic: "bótszhappe", standard: "—", note: "„Boodschappen doen\" = bevásárolni menni." },
  { hu: "Kedvezmény / akció", word: "Korting", phonetic: "korting", standard: "—", note: "A Bonuskaart/app-os akciók kulcsszava az Albert Heijnben." },
  { hu: "Önkormányzat", word: "Gemeente", phonetic: "hemejnte", standard: "—", note: "Itt intézed a BRP-regisztrációt és a legtöbb hivatali ügyet." },
  { hu: "Időpont", word: "Afspraak", phonetic: "afszprák", standard: "—", note: "„Afspraak maken\" — orvoshoz, gemeentéhez szinte mindig kell." },
  { hu: "Lakbér", word: "Huur", phonetic: "hűr", standard: "—", note: "Huurcontract = bérleti szerződés; huurtoeslag = lakbér-támogatás." },
  { hu: "Kaució", word: "Borg", phonetic: "borh", standard: "Waarborgsom", note: "Jellemzően 1–2 havi lakbér." },
  { hu: "Állás / munkahely", word: "Baan", phonetic: "bán", standard: "—" },
  { hu: "Fizetés", word: "Salaris", phonetic: "szaláris", standard: "—", note: "A loonstrook a fizetési papír — érdemes érteni a levonásokat." },
  { hu: "Adó", word: "Belasting", phonetic: "belaszting", standard: "—", note: "Belastingdienst = adóhivatal; az éves bevallás a „aangifte\"." },
  { hu: "Biztosítás", word: "Verzekering", phonetic: "ferzékering", standard: "—", note: "A zorgverzekering (egészségbiztosítás) kötelező, 4 hónapon belül." },
  { hu: "Háziorvos", word: "Huisarts", phonetic: "höüszarc", standard: "—", note: "Mindig ő az első — szakorvoshoz csak beutalóval (verwijzing) mész." },
  { hu: "Gyógyszertár", word: "Apotheek", phonetic: "apoték", standard: "—" },
  { hu: "Vonat", word: "Trein", phonetic: "trejn", standard: "—", note: "NS = a holland vasút; OVpay-jel bankkártyával is csekkolhatsz." },
  { hu: "Pályaudvar / állomás", word: "Station", phonetic: "sztasjon", standard: "—" },
  { hu: "Talán", word: "Misschien", phonetic: "miszhín", standard: "—" },
  { hu: "Ma", word: "Vandaag", phonetic: "fandáh", standard: "—" },
  { hu: "Beszél angolul?", word: "Spreekt u Engels?", phonetic: "szprékt ü engelsz", standard: "—", note: "Szinte mindenki igen — de a holland próbálkozást nagyon értékelik." },
];

const LISTS: Record<string, DailyWord[]> = { CH: CH_WORDS, AT: AT_WORDS, DE: DE_WORDS, NL: NL_WORDS };

/** Van-e napi szó az adott országhoz? (Csak az élő nyelvi tartalmú országok.) */
export function hasDailyWord(country: string): boolean {
  return country in LISTS;
}

/** A BCP-47 nyelvi kód a TTS-hez. */
export function ttsLang(country: string): string {
  if (country === "AT") return "de-AT";
  if (country === "DE") return "de-DE";
  if (country === "NL") return "nl-NL";
  return "de-CH";
}

/**
 * A mai szó az országhoz. A `dayIndex` a nap sorszáma (pl. epoch-nap), így a
 * választás determinisztikus és kliens/szerver között stabil.
 */
export function getDailyWord(country: string, dayIndex: number): DailyWord | null {
  const list = LISTS[country];
  if (!list || list.length === 0) return null;
  const idx = ((dayIndex % list.length) + list.length) % list.length;
  return list[idx];
}
