/**
 * napi-szo.ts — „Napi szó": napi nyelvjárási kifejezés a kezdőlapon, a napi
 * szokás tartalom-horga. Ország-tudatos: CH = svájci német (Mundart), AT =
 * osztrák német. A választás determinisztikus a nap sorszámából (nincs
 * Math.random — SSR-stabil), így mindenkinek ugyanaz a szó aznap.
 *
 * Hang: a kártya böngésző-TTS-t használ (speechSynthesis, de-CH / de-AT) —
 * nincs hangfájl, és kecsesen elmarad, ha a böngésző nem támogatja.
 */

export interface DailyWord {
  /** Magyar jelentés. */
  hu: string;
  /** A nyelvjárási szó/kifejezés (ezt mondatja ki a hang). */
  word: string;
  /** Egyszerű, magyaros kiejtés. */
  phonetic: string;
  /** Irodalmi német (Hochdeutsch) megfelelő. */
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

const LISTS: Record<string, DailyWord[]> = { CH: CH_WORDS, AT: AT_WORDS };

/** Van-e napi szó az adott országhoz? (Csak az élő nyelvi tartalmú országok.) */
export function hasDailyWord(country: string): boolean {
  return country in LISTS;
}

/** A BCP-47 nyelvi kód a TTS-hez. */
export function ttsLang(country: string): string {
  return country === "AT" ? "de-AT" : "de-CH";
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
