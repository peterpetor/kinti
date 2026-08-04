/**
 * napi-szo.ts — „Napi szó": napi helyi kifejezés a kezdőlapon, a napi
 * szokás tartalom-horga. Ország-tudatos: CH = svájci német (Mundart), AT =
 * osztrák német, DE = hétköznapi/hivatali német, NL = hétköznapi holland,
 * GB = brit angol (britizmusok), ES = spanyol (hétköznapi + hivatali szavak).
 * A választás determinisztikus a nap sorszámából (nincs Math.random —
 * SSR-stabil), így mindenkinek ugyanaz a szó aznap.
 *
 * Hang: a kártya böngésző-TTS-t használ (speechSynthesis, de-CH / de-AT /
 * de-DE / nl-NL / en-GB / es-ES) — nincs hangfájl, és kecsesen elmarad, ha nem
 * támogatott.
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
  // — 2026-08: bővítés, hogy a napi szó ne ismétlődjön havonta (lásd getDailyWord) —
  { hu: "Sziasztok (többeknek)", word: "Grüezi mitenand", phonetic: "grüöci mitenánd", standard: "Guten Tag zusammen", note: "Ha egyszerre több emberhez szólsz — boltban, liftben." },
  { hu: "Viszontlátásra (udvarias)", word: "Uf Widerluege", phonetic: "uf viderlúöge", standard: "Auf Wiedersehen" },
  { hu: "Jó napot (berni változat)", word: "Grüessech", phonetic: "grüösszeh", standard: "Guten Tag", note: "Bernben és környékén ezt hallod a „Grüezi” helyett." },
  { hu: "Ugye? / Nemde?", word: "Gäll?", phonetic: "gell", standard: "Nicht wahr?", note: "Mondat végi megerősítés — nagyon svájcias töltelékszó." },
  { hu: "A többi a magáé (borravaló)", word: "Schtimmt so", phonetic: "stimmt zo", standard: "Stimmt so", note: "Fizetéskor mondod: felkerekíted, a maradék borravaló." },
  { hu: "Uzsonna (délutáni falat)", word: "Zvieri", phonetic: "cfíri", standard: "Nachmittagssnack", note: "A „négyórai” — a Znüni délutáni párja." },
  { hu: "Vaj", word: "Anke", phonetic: "ánke", standard: "Butter" },
  { hu: "Tejszín", word: "Nidle", phonetic: "nidle", standard: "Sahne" },
  { hu: "Aprósütemény", word: "Guetzli", phonetic: "gúöcli", standard: "Plätzchen", note: "Karácsonykor kulcsszó: Weihnachtsguetzli." },
  { hu: "Grillezés a szabadban", word: "Brätle", phonetic: "bretle", standard: "Grillieren", note: "Nyáron a tóparti tűzrakóhelyeknél nemzeti sport." },
  { hu: "Bevásárlószatyor / zacskó", word: "Sack", phonetic: "szák", standard: "Tüte", note: "A szemeteszsák is „Züri-Sack” / „Gebührensack”." },
  { hu: "Szemét / hulladék", word: "Kehricht", phonetic: "kérriht", standard: "Müll", note: "A hivatalos szó a kukanaptáron és a községi levelekben." },
  { hu: "Nagytakarítás", word: "Putzete", phonetic: "puccete", standard: "Grossreinigung", note: "Kiköltözéskor kötelező — az átadási szemle könyörtelen." },
  { hu: "Mosókonyha", word: "Waschküche", phonetic: "vaskühe", standard: "Waschküche", note: "Társasházban beosztás szerint jár — a „Waschplan” szent." },
  { hu: "Padlás", word: "Estrich", phonetic: "estrih", standard: "Dachboden", note: "Svájcban padlás — Németországban ugyanez esztrich-aljzatot jelent!" },
  { hu: "Házmester / gondnok", word: "Abwart", phonetic: "ápvárt", standard: "Hausmeister" },
  { hu: "Peron / vágány", word: "Perron", phonetic: "perrong", standard: "Bahnsteig", note: "Franciás szó — a kijelzőkön is így szerepel." },
  { hu: "Retúrjegy", word: "Retourbillet", phonetic: "rötúr bijé", standard: "Rückfahrkarte" },
  { hu: "Félárú bérlet", word: "Halbtax", phonetic: "hálbtáksz", standard: "Halbtax-Abo", note: "Minden jegy fele árba kerül — sokat utazóknak azonnal megtérül." },
  { hu: "Motor (kismotor)", word: "Töff", phonetic: "töff", standard: "Motorrad" },
  { hu: "Kamion", word: "Camion", phonetic: "kámion", standard: "Lastwagen" },
  { hu: "Autópálya-matrica", word: "Vignette", phonetic: "vinyett", standard: "Autobahnvignette", note: "Éves, a szélvédőre — hiánya azonnali bírság." },
  { hu: "Pénztárca", word: "Portemonnaie", phonetic: "portmoné", standard: "Geldbörse" },
  { hu: "Fodrász", word: "Coiffeur", phonetic: "koáför", standard: "Friseur", note: "A cégtáblákon is franciául — így keresd a Maps-en." },
  { hu: "Önrész (egészségbiztosítás)", word: "Franchise", phonetic: "fransíz", standard: "Selbstbehalt", note: "Évi 300–2500 Fr. — amíg ezt el nem költöd, mindent te fizetsz." },
  { hu: "Betegbiztosítás", word: "Krankenkasse", phonetic: "kránkenkásze", standard: "Grundversicherung", note: "Kötelező, 3 hónapon belül kötni kell beköltözés után." },
  { hu: "Háziorvos", word: "Hausarzt", phonetic: "hauszárct", standard: "Hausarzt" },
  { hu: "Ügyelet / sürgősségi", word: "Notfall", phonetic: "nótfál", standard: "Notaufnahme", note: "Segélyhívó: 144 (mentő), 117 (rendőrség), 118 (tűzoltó)." },
  { hu: "Drogéria (nem gyógyszertár)", word: "Drogerie", phonetic: "drogerí", standard: "Drogerie", note: "Vény nélküli szerek és kozmetikum — receptre az Apotheke kell." },
  { hu: "Szakmatanulás (duális képzés)", word: "Lehre", phonetic: "lére", standard: "Berufslehre", note: "A svájci karrier fő útja — a fiatalok kétharmada ezt választja." },
  { hu: "Forrásadó (külföldieknél)", word: "Quellensteuer", phonetic: "kvellenstojer", standard: "Quellensteuer", note: "C-engedély nélkül a bérből közvetlenül vonják." },
  { hu: "Bérjegyzék (éves igazolás)", word: "Lohnausweis", phonetic: "lónauszvájsz", standard: "Lohnausweis", note: "Az adóbevalláshoz kell — a munkáltató küldi januárban." },
  { hu: "Öregségi nyugdíjpénztár (1. pillér)", word: "AHV", phonetic: "á-há-fau", standard: "Alters- und Hinterlassenenversicherung" },
  { hu: "Nyugdíjpénztár (2. pillér)", word: "Pensionskasse", phonetic: "penzionszkásze", standard: "Berufliche Vorsorge", note: "Kilépéskor a felhalmozott összeg elvihető — ne felejtsd el!" },
  { hu: "Behajtási eljárás", word: "Betreibung", phonetic: "betrájbung", standard: "Schuldbetreibung", note: "A „Betreibungsauszug” (nemleges igazolás) lakásbérléshez kell." },
  { hu: "Felmondási idő", word: "Kündigungsfrist", phonetic: "kündigungszfriszt", standard: "Kündigungsfrist", note: "Lakásnál jellemzően 3 hónap, negyedéves fordulónapra." },
  { hu: "Lakbér", word: "Mietzins", phonetic: "mítcinsz", standard: "Miete", note: "Svájcban a „Zins” szó a lakbérre is vonatkozik, nem csak kamatra." },
  { hu: "Lakótársak / közös lakás", word: "WG", phonetic: "vé-gé", standard: "Wohngemeinschaft", note: "A drága városokban (Zürich, Genf) a leggyakoribb belépő lakhatás." },
  { hu: "Szabadság (nyaralás)", word: "Ferie", phonetic: "ferie", standard: "Ferien" },
  { hu: "Munka utáni sör", word: "Feierabendbier", phonetic: "fájerábendbír", standard: "Feierabendbier" },
  { hu: "Zsebkés (svájci bicska)", word: "Sackmesser", phonetic: "szákmeszer", standard: "Taschenmesser" },
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
  // — 2026-08: bővítés, hogy a napi szó ne ismétlődjön havonta (lásd getDailyWord) —
  { hu: "Viszlát (búcsúzás)", word: "Baba / Wiederschauen", phonetic: "bábá / vídersauen", standard: "Auf Wiedersehen", note: "A „Baba” baráti, a „Wiederschauen” udvarias." },
  { hu: "Szia (fiatalosan)", word: "Servas", phonetic: "szervász", standard: "Hallo", note: "A „Servus” kötetlenebb, bécsies alakja." },
  { hu: "Torma", word: "Kren", phonetic: "krén", standard: "Meerrettich", note: "A sonkához és a Tafelspitzhez elmaradhatatlan." },
  { hu: "Tejföl", word: "Sauerrahm", phonetic: "zauerrám", standard: "Saure Sahne" },
  { hu: "Darált hús", word: "Faschiertes", phonetic: "fasírtesz", standard: "Hackfleisch", note: "Innen a magyar „fasírt” szó." },
  { hu: "Rántott hús (bécsi szelet)", word: "Schnitzel", phonetic: "snicel", standard: "Schnitzel", note: "Az igazi „Wiener Schnitzel” borjúból van — a sertés a „Schnitzel Wiener Art”." },
  { hu: "Csirke (sült)", word: "Backhendl", phonetic: "bákhendl", standard: "Brathähnchen" },
  { hu: "Kifli", word: "Kipferl", phonetic: "kipferl", standard: "Hörnchen" },
  { hu: "Kenyérvég / püspökfalat", word: "Scherzl", phonetic: "sercl", standard: "Brotkanten" },
  { hu: "Gomba", word: "Schwammerl", phonetic: "svámmerl", standard: "Pilz" },
  { hu: "Sárgabarackíz", word: "Marillenmarmelade", phonetic: "mariller marmeláde", standard: "Aprikosenkonfitüre", note: "A Sacher-torta és a palacsinta klasszikus tölteléke." },
  { hu: "Bögre kávé habbal", word: "Melange", phonetic: "meláázs", standard: "Milchkaffee", note: "A bécsi kávéház alapdarabja — kb. cappuccino." },
  { hu: "Feketekávé kis csészében", word: "Kleiner Brauner", phonetic: "klájner brauner", standard: "Espresso mit Milch", note: "Kávéházban így rendelj — a „Kaffee” önmagában értetlenkedést szül." },
  { hu: "Fröccs", word: "Gespritzter", phonetic: "gespriccter", standard: "Weinschorle" },
  { hu: "Sör (0,5 l)", word: "Krügerl", phonetic: "krügerl", standard: "Halber Liter Bier", note: "A 0,3 l a „Seidl”, a 0,2 l a „Pfiff”." },
  { hu: "Számla / fizetek", word: "Zahlen bitte", phonetic: "cálen bitte", standard: "Die Rechnung, bitte" },
  { hu: "Villamos-/buszjegy", word: "Fahrschein", phonetic: "fársájn", standard: "Fahrkarte", note: "Bécsben az éves bérlet („Jahreskarte”) napi 1 euró körül van." },
  { hu: "Éves bérlet", word: "Jahreskarte", phonetic: "járeszkárte", standard: "Jahresticket" },
  { hu: "Bejelentkezés (lakcím)", word: "Meldezettel", phonetic: "meldecettel", standard: "Meldebestätigung", note: "3 napon belül kötelező beköltözés után — minden ügyintézés alapja." },
  { hu: "Társadalombiztosítási szám", word: "Sozialversicherungsnummer", phonetic: "szociálferzicherungsznummer", standard: "SV-Nummer", note: "10 jegyű, a végén a születési dátumod — az e-card-on találod." },
  { hu: "TB-kártya", word: "e-card", phonetic: "í-kárd", standard: "e-card", note: "Orvoshoz mindig vidd magaddal — enélkül magánbetegként kezelnek." },
  { hu: "Táppénzes papír", word: "Krankenstand", phonetic: "kránkenstánd", standard: "Krankmeldung", note: "A munkáltatót az első nap értesíteni kell — utólag nem pótolható." },
  { hu: "Családi pótlék", word: "Familienbeihilfe", phonetic: "fámílienbájhilfe", standard: "Kinderbeihilfe", note: "EU-s munkavállalóként akkor is jár, ha a gyerek Magyarországon él." },
  { hu: "13./14. havi fizetés", word: "Urlaubs- und Weihnachtsgeld", phonetic: "urlaubszgeld", standard: "Sonderzahlungen", note: "Ausztriában szinte mindenhol jár — kedvezményes, 6%-os adóval." },
  { hu: "Kollektív szerződés", word: "Kollektivvertrag", phonetic: "kollektívfertrág", standard: "KV", note: "A szakmád minimálbérét ez szabja meg — nézd meg aláírás előtt!" },
  { hu: "Munkaügyi hivatal", word: "AMS", phonetic: "á-em-esz", standard: "Arbeitsmarktservice", note: "Álláskeresés, átképzés, munkanélküli-ellátás egy helyen." },
  { hu: "Munkakönyv-igazolás", word: "Dienstzeugnis", phonetic: "dínsztcojgnisz", standard: "Arbeitszeugnis" },
  { hu: "Kamara (kötelező tagság)", word: "Wirtschaftskammer", phonetic: "virtsáftszkámmer", standard: "WKO", note: "Vállalkozóként automatikusan tag leszel — a tagdíj kötelező." },
  { hu: "Adószám (vállalkozói)", word: "Steuernummer", phonetic: "stojernummer", standard: "Abgabenkontonummer" },
  { hu: "Bérleti szerződés-illeték", word: "Betriebskosten", phonetic: "betrípszkoszten", standard: "Betriebskosten", note: "A bécsi önkormányzati lakásoknál („Gemeindebau”) külön tétel." },
  { hu: "Önkormányzati bérlakás", word: "Gemeindebau", phonetic: "gemájndebau", standard: "Gemeindewohnung", note: "Bécs sajátossága — olcsó, de 2 év bejelentett lakcím kell hozzá." },
  { hu: "Lakásátadási díj", word: "Ablöse", phonetic: "áblőze", standard: "Ablösezahlung", note: "A távozó bérlőnek fizetett összeg a bútorokért — gyakran túlárazott." },
  { hu: "Szemetes / kuka", word: "Mistkübel", phonetic: "misztkübel", standard: "Mülleimer", note: "Bécsben a szemétszállítás a „MA 48”." },
  { hu: "Létra", word: "Leiter", phonetic: "lájter", standard: "Leiter" },
  { hu: "Párna (fejpárna)", word: "Polsterl", phonetic: "polszterl", standard: "Kissen" },
  { hu: "Nagyon jó / szuper", word: "Passt", phonetic: "pászt", standard: "In Ordnung", note: "Mindenre jó válasz: rendben, jó lesz, megfelel." },
  { hu: "Fáradt / kimerült", word: "Hatschert", phonetic: "hácsert", standard: "Erschöpft" },
  { hu: "Fura / különös", word: "Deppert", phonetic: "deppert", standard: "Blöd", note: "Enyhén sértő — magadra mondva vicces, másra mondva már nem." },
  { hu: "Sietni", word: "Sich tummeln", phonetic: "zih tummeln", standard: "Sich beeilen" },
  { hu: "Beszélgetés / traccsparti", word: "Tratschen", phonetic: "trácsen", standard: "Plaudern" },
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
  // — 2026-08: bővítés, hogy a napi szó ne ismétlődjön havonta (lásd getDailyWord) —
  { hu: "Adóazonosító jel", word: "Steuer-ID", phonetic: "stojer-í-dé", standard: "Steueridentifikationsnummer", note: "11 jegyű, életre szól. Enélkül a munkáltató a legrosszabb adósávba sorol." },
  { hu: "Adóosztály", word: "Steuerklasse", phonetic: "stojerklásze", standard: "Lohnsteuerklasse", note: "I–VI. Házaspárként a III/V vagy IV/IV kombináció sok pénzt jelent." },
  { hu: "Bérelszámoló lap", word: "Lohnabrechnung", phonetic: "lónáprehnung", standard: "Gehaltsabrechnung", note: "Őrizd meg mindet — lakásbérléshez az utolsó 3 kell." },
  { hu: "Nettó / bruttó bér", word: "Netto / Brutto", phonetic: "nettó / bruttó", standard: "Nettolohn / Bruttolohn", note: "Németországban a bruttóból ~35–45% levonás megy." },
  { hu: "Társadalombiztosítási szám", word: "Sozialversicherungsnummer", phonetic: "szociálferzicherungsznummer", standard: "Rentenversicherungsnummer" },
  { hu: "Nyugdíjbiztosítás", word: "Rentenversicherung", phonetic: "rentenferzicherung", standard: "Gesetzliche Rentenversicherung", note: "A magyarországi évek EU-n belül összeszámítódnak." },
  { hu: "Munkanélküli-ellátás", word: "Arbeitslosengeld", phonetic: "árbájtszlózengeld", standard: "ALG I", note: "12 hónap befizetés után jár — előtte nem." },
  { hu: "Munkaügyi hivatal", word: "Agentur für Arbeit", phonetic: "ágentúr für árbájt", standard: "Arbeitsamt" },
  { hu: "Munkaszerződés", word: "Arbeitsvertrag", phonetic: "árbájcfertrág", standard: "Arbeitsvertrag" },
  { hu: "Próbaidő", word: "Probezeit", phonetic: "próbecájt", standard: "Probezeit", note: "Max 6 hónap; alatta 2 hét a felmondási idő mindkét oldalon." },
  { hu: "Túlóra", word: "Überstunden", phonetic: "überstunden", standard: "Mehrarbeit" },
  { hu: "Szabadság (fizetett)", word: "Urlaub", phonetic: "urlaub", standard: "Erholungsurlaub", note: "Törvényi minimum 20 nap (5 napos hétnél) — a legtöbb cég 25–30-at ad." },
  { hu: "Munkabizonyítvány", word: "Arbeitszeugnis", phonetic: "árbájcconisz", standard: "Arbeitszeugnis", note: "Kódolt nyelv! A „stets zu unserer vollsten Zufriedenheit” a legjobb minősítés." },
  { hu: "Végzettség-elismerés", word: "Anerkennung", phonetic: "ánerkennung", standard: "Anerkennung ausländischer Abschlüsse", note: "Szabályozott szakmákhoz (orvos, ápoló, villanyszerelő) kötelező." },
  { hu: "Lakásigazolás (a főbérlőtől)", word: "Wohnungsgeberbestätigung", phonetic: "vónungszgéberbestétigung", standard: "Vermieterbescheinigung", note: "Az Anmeldunghoz kötelező — a főbérlő adja, ne indulj el nélküle." },
  { hu: "Hitelképességi igazolás", word: "SCHUFA-Auskunft", phonetic: "súfa-auszkunft", standard: "Bonitätsauskunft", note: "Lakásbérléshez szinte mindig kérik. Évi egy példány ingyenes." },
  { hu: "Lakásátadási jegyzőkönyv", word: "Übergabeprotokoll", phonetic: "übergábeprotokoll", standard: "Wohnungsübergabeprotokoll", note: "Fotózz mindent be — a kaució visszakapása ezen múlik." },
  { hu: "Bérleti díj (rezsi nélkül)", word: "Kaltmiete", phonetic: "káltmíte", standard: "Nettokaltmiete" },
  { hu: "Albérlet-hirdetés", word: "Wohnungsanzeige", phonetic: "vónungszáncájge", standard: "Mietangebot" },
  { hu: "Bejelentkezés-igazolás", word: "Meldebescheinigung", phonetic: "meldebesájnigung", standard: "Meldebestätigung" },
  { hu: "Tartózkodási engedély", word: "Aufenthaltstitel", phonetic: "aufenthálcstítel", standard: "Aufenthaltserlaubnis", note: "EU-s állampolgárként NEM kell — elég az Anmeldung." },
  { hu: "Idegenrendészet", word: "Ausländerbehörde", phonetic: "auszlenderbehörde", standard: "Ausländerbehörde" },
  { hu: "Polgármesteri hivatal", word: "Bürgeramt", phonetic: "bürgerámt", standard: "Bürgerbüro", note: "Városonként más a neve: Bürgeramt, Bürgerbüro, KVR, Einwohnermeldeamt." },
  { hu: "Időpont-portál", word: "Terminvergabe", phonetic: "termínfergábe", standard: "Online-Terminbuchung", note: "Nagyvárosban hetekre előre telt — nézd hajnalban, akkor szabadulnak fel." },
  { hu: "Számlaszám (IBAN)", word: "Kontonummer", phonetic: "kontónummer", standard: "IBAN" },
  { hu: "Csoportos beszedés", word: "Lastschrift", phonetic: "lásztsrift", standard: "SEPA-Lastschriftmandat", note: "Németországban szinte minden így megy — de 8 hétig visszakérhető." },
  { hu: "Átutalás", word: "Überweisung", phonetic: "übervájzung", standard: "Banküberweisung" },
  { hu: "Készpénz", word: "Bargeld", phonetic: "bárgeld", standard: "Bargeld", note: "Sok pékség, orvos, kocsma máig csak ezt fogadja — legyen nálad." },
  { hu: "Számla (fizetendő)", word: "Rechnung", phonetic: "rehnung", standard: "Rechnung" },
  { hu: "Felszólítás (fizetési)", word: "Mahnung", phonetic: "mánung", standard: "Zahlungserinnerung", note: "Ne hagyd figyelmen kívül — a harmadik után behajtó jön, plusz költséggel." },
  { hu: "Felelősségbiztosítás", word: "Haftpflichtversicherung", phonetic: "háftpflihtferzicherung", standard: "Privathaftpflicht", note: "Nem kötelező, de Németországban gyakorlatilag mindenkinek van. Évi ~50 €." },
  { hu: "Kutyaadó", word: "Hundesteuer", phonetic: "hundestojer", standard: "Hundesteuer", note: "Tényleg létezik: városonként évi 90–180 €, a kutyát be kell jelenteni." },
  { hu: "Betétdíjas üveg/palack", word: "Mehrweg", phonetic: "mérvég", standard: "Mehrwegflasche", note: "Az „Einweg” egyutas — a Pfand mindkettőre jár, de más összegben." },
  { hu: "Akció / kedvezmény", word: "Angebot", phonetic: "ángebót", standard: "Sonderangebot" },
  { hu: "Zárva (vasárnap)", word: "Sonntagsruhe", phonetic: "zonntágszrúe", standard: "Ladenschlussgesetz", note: "Vasárnap minden bolt zárva — csak pályaudvari és benzinkúti üzletek nyitnak." },
  { hu: "Vasárnapi csend", word: "Ruhezeit", phonetic: "rúecájt", standard: "Ruhezeit", note: "22:00–6:00 és vasárnap: fúrni, mosógépezni tilos. A szomszéd feljelent." },
  { hu: "Csengőnév a postaládán", word: "Klingelschild", phonetic: "klingelsild", standard: "Namensschild", note: "Ha nincs rajta a neved, a posta és a csomag visszamegy." },
  { hu: "Csomagátvevő pont", word: "Packstation", phonetic: "pákstáción", standard: "DHL Packstation" },
  { hu: "Szomszéd átvette a csomagot", word: "Nachbarschaftsabgabe", phonetic: "náhbársáfcápgábe", standard: "Zustellung beim Nachbarn", note: "Németországban bevett — nézd meg a postaládában hagyott cédulát." },
  { hu: "Jó munkát! / Sok sikert!", word: "Viel Erfolg", phonetic: "fíl erfolg", standard: "Viel Erfolg" },
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
  // — 2026-08: bővítés, hogy a napi szó ne ismétlődjön havonta (lásd getDailyWord) —
  { hu: "Adó- és társadalombiztosítási szám", word: "BSN", phonetic: "bé-esz-en", standard: "Burgerservicenummer", note: "Minden ügyintézés alapja. A gemeente adja bejelentkezéskor." },
  { hu: "Bejelentkezés a városnál", word: "Inschrijven", phonetic: "insz-hrejven", standard: "Inschrijving bij de gemeente", note: "5 napon belül. Enélkül nincs BSN, bankszámla, biztosítás — semmi." },
  { hu: "Egészségbiztosítás", word: "Zorgverzekering", phonetic: "zorhferzékering", standard: "Basisverzekering", note: "Kötelező, 4 hónapon belül. Havi ~140 €, önrész (eigen risico) 385 €." },
  { hu: "Önrész", word: "Eigen risico", phonetic: "éjhe rizikó", standard: "Eigen risico", note: "Évi 385 € — eddig te fizetsz. A háziorvos viszont ingyenes!" },
  { hu: "Egészségügyi támogatás", word: "Zorgtoeslag", phonetic: "zorhtúszlah", standard: "Zorgtoeslag", note: "Alacsony jövedelemnél a biztosítás nagy részét visszakapod. Igényelni kell!" },
  { hu: "Lakhatási támogatás", word: "Huurtoeslag", phonetic: "hűrtúszlah", standard: "Huurtoeslag", note: "Bérleti díj alapján jár — a Belastingdienst oldalán számold ki." },
  { hu: "Adóhivatal", word: "Belastingdienst", phonetic: "belásztinhdínszt", standard: "Belastingdienst" },
  { hu: "Adóbevallás", word: "Aangifte", phonetic: "ánhifte", standard: "Belastingaangifte", note: "Március–május. Az első évben szinte biztosan visszakapsz pénzt." },
  { hu: "30%-os adókedvezmény", word: "30%-regeling", phonetic: "dertih procent réheling", standard: "Expatregeling", note: "Külföldi szakembereknek — a munkáltatónak kell igényelnie." },
  { hu: "DigiD (elektronikus azonosító)", word: "DigiD", phonetic: "didzsi-dé", standard: "DigiD", note: "Orvos, adó, önkormányzat — minden online ügy ezzel megy." },
  { hu: "Háziorvosi beutaló", word: "Verwijzing", phonetic: "fervéjzing", standard: "Doorverwijzing", note: "Szakorvoshoz CSAK ezzel jutsz el — a huisarts a kapuőr." },
  { hu: "Fájdalomcsillapító (paracetamol)", word: "Paracetamol", phonetic: "párászétámol", standard: "Paracetamol", note: "Holland orvos-klasszikus: sokszor ez az első (és egyetlen) javaslat." },
  { hu: "Ügyeletes orvos (esti/hétvégi)", word: "Huisartsenpost", phonetic: "hejszárcenposzt", standard: "HAP", note: "Rendelési időn kívül ide telefonálj — ne a kórházba menj." },
  { hu: "Fogorvos", word: "Tandarts", phonetic: "tándárc", standard: "Tandarts", note: "Az alapbiztosítás 18 év felett NEM fedezi — külön kiegészítő kell." },
  { hu: "Bérlakás (szociális)", word: "Sociale huurwoning", phonetic: "szociále hűrvóning", standard: "Sociale huur", note: "Olcsó, de a várólista 7–15 év. Kezdd el a regisztrációt azonnal." },
  { hu: "Szabadpiaci bérlakás", word: "Vrije sector", phonetic: "fréje szektor", standard: "Vrije sector huur" },
  { hu: "Ideiglenes bérleti szerződés", word: "Tijdelijk contract", phonetic: "téjdelek kontrákt", standard: "Tijdelijke huurovereenkomst" },
  { hu: "Bútorozott / bútorozatlan", word: "Gemeubileerd / kaal", phonetic: "hemőbilérd / kál", standard: "Gemeubileerd / ongemeubileerd", note: "A „kaal” szó szerint kopasz: se padló, se lámpa, se konyha!" },
  { hu: "Költözés", word: "Verhuizen", phonetic: "ferhejzen", standard: "Verhuizing", note: "A gemeenténél is át kell jelentkezni — online, DigiD-vel." },
  { hu: "Energiaszerződés", word: "Energiecontract", phonetic: "enerzsi kontrákt", standard: "Energieleverancier" },
  { hu: "Munkaszerződés", word: "Arbeidsovereenkomst", phonetic: "árbéjdszóverénkomszt", standard: "Arbeidscontract" },
  { hu: "Munkaerő-kölcsönző", word: "Uitzendbureau", phonetic: "ejtzendbürő", standard: "Uitzendbureau", note: "Hollandiában sok magyar így kezd — a „fase A” a legbizonytalanabb szint." },
  { hu: "Óradíj", word: "Uurloon", phonetic: "űrlón", standard: "Uurtarief" },
  { hu: "Nyaralási pótlék", word: "Vakantiegeld", phonetic: "fákánszíheld", standard: "Vakantietoeslag", note: "A bruttó bér 8%-a, májusban egy összegben — mindenkinek jár." },
  { hu: "Felmondás", word: "Ontslag", phonetic: "onteszlah", standard: "Ontslag" },
  { hu: "Munkanélküli-ellátás", word: "WW-uitkering", phonetic: "vé-vé ejtkering", standard: "Werkloosheidsuitkering" },
  { hu: "Vállalkozó (egyéni)", word: "ZZP'er", phonetic: "zet-zet-pé-er", standard: "Zelfstandige zonder personeel", note: "A holland „katás” — a KvK-nál (cégbíróság) kell bejelentkezni." },
  { hu: "Cégbíróság / kamara", word: "KvK", phonetic: "ká-fau-ká", standard: "Kamer van Koophandel" },
  { hu: "Kerékpárút", word: "Fietspad", phonetic: "fíccpád", standard: "Fietspad", note: "A biciklinek elsőbbsége van — gyalog rálépni komoly hiba." },
  { hu: "Biciklizár", word: "Fietsslot", phonetic: "fícclot", standard: "Fietsslot", note: "Kettőt használj: a bicikli-lopás Amszterdamban mindennapos." },
  { hu: "Utazókártya", word: "OV-chipkaart", phonetic: "ó-fé csipkárt", standard: "OV-chipkaart", note: "Be- ÉS kicsekkolás kötelező — kicsekkolás nélkül 20 € levonás." },
  { hu: "Vonatjegy csúcsidőn kívül", word: "Daluren", phonetic: "dálüren", standard: "Buiten de spits", note: "9:00–16:00 és 18:30 után 40% kedvezmény a bérletekkel." },
  { hu: "Bankkártya (holland)", word: "Pinpas", phonetic: "pinpász", standard: "Bankpas", note: "„Pinnen” = kártyával fizetni. Sok bolt NEM fogad hitelkártyát!" },
  { hu: "Fizetési kérés (link)", word: "Tikkie", phonetic: "tikí", standard: "Betaalverzoek", note: "A közös számla rendezésének nemzeti módja — mindenki ezt küldi." },
  { hu: "Születésnapi köszöntés a családnak", word: "Gefeliciteerd", phonetic: "hefeliszitérd", standard: "Gefeliciteerd", note: "Holland szokás: a szülinapost ÉS a családtagjait is köszöntik!" },
  { hu: "Beszéljünk meg egy időpontot", word: "Even inplannen", phonetic: "éve inplánnen", standard: "Een afspraak maken", note: "Hollandiában a spontán beugrás ritka — mindent naptárba tesznek." },
  { hu: "Egyenes / nyílt beszéd", word: "Recht voor zijn raap", phonetic: "reht for zejn ráp", standard: "Direct", note: "A holland őszinteség nem gorombaság — ne vedd magadra." },
  { hu: "Rendben van", word: "Prima", phonetic: "prímá", standard: "Goed" },
  { hu: "Ne aggódj", word: "Geen zorgen", phonetic: "hén zorhe", standard: "Maak je geen zorgen" },
  { hu: "Jó hétvégét", word: "Fijn weekend", phonetic: "féjn víkend", standard: "Prettig weekend" },
];

/** Brit angol — hétköznapi kifejezések és britizmusok (amit egy magyar nem tanul az iskolában). */
const GB_WORDS: DailyWord[] = [
  { hu: "Kösz (és „szia” is)", word: "Cheers", phonetic: "csírsz", standard: "Thanks / Bye", note: "Briteknél a „cheers” köszönetet ÉS elköszönést is jelent, nemcsak koccintást." },
  { hu: "Szia, minden oké?", word: "You alright?", phonetic: "ju ólrájt", standard: "Hello / How are you?", note: "Bevett köszönés — nem tényleges kérdés, elég rá a „Yeah, you?”." },
  { hu: "Kösz (röviden)", word: "Ta", phonetic: "tá", standard: "Thanks", note: "Nagyon informális „köszi”." },
  { hu: "Sor (várakozó)", word: "Queue", phonetic: "kjú", standard: "Line", note: "A britek szentsége — SOHA ne tolakodj be a queue-ba." },
  { hu: "Két hét", word: "Fortnight", phonetic: "fótnájt", standard: "Two weeks", note: "Fizetés és bérlet gyakran „per fortnight”." },
  { hu: "Hulla fáradt", word: "Knackered", phonetic: "nekörd", standard: "Very tired" },
  { hu: "Vécé", word: "Loo", phonetic: "lú", standard: "Toilet", note: "„Where's the loo?” — a legbarátságosabb forma." },
  { hu: "Font (szleng)", word: "Quid", phonetic: "kvid", standard: "Pound (£)", note: "„Ten quid” = 10 font. Fiver = 5 £, tenner = 10 £." },
  { hu: "Örülök / meg vagyok elégedve", word: "Chuffed", phonetic: "csaft", standard: "Pleased" },
  { hu: "Csalódott / le vagyok törve", word: "Gutted", phonetic: "gatid", standard: "Very disappointed" },
  { hu: "Kedve van vmihez", word: "Fancy (a…)", phonetic: "fenszi", standard: "Would like", note: "„Fancy a cuppa?” = Kérsz egy teát?" },
  { hu: "Egy tea (bögrével)", word: "Cuppa", phonetic: "kapö", standard: "Cup of tea" },
  { hu: "Pulóver", word: "Jumper", phonetic: "dzsampör", standard: "Sweater", note: "USA-ban „sweater”, de itt „jumper”." },
  { hu: "Sportcipő", word: "Trainers", phonetic: "trénörz", standard: "Sneakers" },
  { hu: "Bevásárlókocsi", word: "Trolley", phonetic: "troli", standard: "Shopping cart" },
  { hu: "Elvitel (étel)", word: "Takeaway", phonetic: "tékövéj", standard: "Takeout" },
  { hu: "Kuka / szemetes", word: "Bin", phonetic: "bin", standard: "Trash can", note: "A szelektív kukák színe városonként más — nézd meg a council oldalát." },
  { hu: "Járda", word: "Pavement", phonetic: "pévment", standard: "Sidewalk" },
  { hu: "Benzin", word: "Petrol", phonetic: "petrol", standard: "Gasoline" },
  { hu: "Csomagtartó (autó)", word: "Boot", phonetic: "bút", standard: "Trunk" },
  { hu: "Gyógyszertár", word: "Chemist", phonetic: "kemiszt", standard: "Pharmacy", note: "A Boots és a Superdrug a legismertebb láncok." },
  { hu: "Háziorvos", word: "GP", phonetic: "dzsí-pí", standard: "General Practitioner", note: "Előbb GP-hez KELL regisztrálni (surgery) — enélkül nincs NHS-ellátás." },
  { hu: "Munkaszüneti nap", word: "Bank Holiday", phonetic: "benk holidéj", standard: "Public holiday" },
  { hu: "Kassza (bolt)", word: "Till", phonetic: "til", standard: "Checkout / Register" },
  { hu: "Lakás", word: "Flat", phonetic: "flet", standard: "Apartment", note: "USA „apartment”, itt „flat”." },
  { hu: "Szemtelen / vagány", word: "Cheeky", phonetic: "csíki", standard: "Cheeky", note: "„A cheeky pint” = egy gyors sör spontán." },
  { hu: "Rendben / szuper", word: "Brilliant", phonetic: "briliönt", standard: "Great", note: "Britek gyakran röviden: „Brill!”" },
  { hu: "Beszélgetni / cseverészni", word: "To have a chat", phonetic: "cset", standard: "To talk" },
  { hu: "Köszönöm, nagyon kedves", word: "Cheers, much appreciated", phonetic: "csírsz macs öprísiétid", standard: "Thank you very much" },
  // — 2026-08: bővítés, hogy a napi szó ne ismétlődjön havonta (lásd getDailyWord) —
  { hu: "Adóazonosító (adószám)", word: "National Insurance number", phonetic: "nesönöl inseöröansz namber", standard: "NI number", note: "Munkába álláshoz kell. Enélkül „emergency tax” sávba raknak — sokat vonnak." },
  { hu: "Adószámkód a bérlapon", word: "Tax code", phonetic: "teksz kód", standard: "PAYE tax code", note: "A „1257L” a normál. Ha „BR” vagy „0T”, túl sok adót vonnak — jelezd!" },
  { hu: "Bérből levont adó rendszere", word: "PAYE", phonetic: "pí-éj-váj-í", standard: "Pay As You Earn" },
  { hu: "Bérlap", word: "Payslip", phonetic: "péjszlip", standard: "Wage slip", note: "Őrizd meg — lakásbérléshez és hitelhez az utolsó 3 kell." },
  { hu: "Háziorvosi regisztráció", word: "To register with a GP", phonetic: "redzsisztör vid ö dzsí-pí", standard: "GP registration", note: "Ingyenes, és nem kérhetnek útlevelet vagy lakcímkártyát hozzá." },
  { hu: "Sürgősségi (kórházi)", word: "A&E", phonetic: "éj end í", standard: "Accident & Emergency", note: "Nem életveszélynél hívd a 111-et — az A&E várakozása órákban mérhető." },
  { hu: "Nem sürgős egészségügyi vonal", word: "111", phonetic: "van van van", standard: "NHS 111", note: "Ingyenes, 0–24. Megmondja, hova menj — sokszor megspórolja az A&E-t." },
  { hu: "Recept-díj", word: "Prescription charge", phonetic: "priszkripsön csárdzs", standard: "NHS prescription", note: "Angliában tételenként ~10 £ — Skóciában és Walesben ingyenes." },
  { hu: "Helyi önkormányzat", word: "Council", phonetic: "kaunszil", standard: "Local council", note: "Szemét, parkolás, iskola, Council Tax — minden helyi ügy náluk van." },
  { hu: "Helyi adó", word: "Council Tax", phonetic: "kaunszil teksz", standard: "Council Tax", note: "Havi 100–250 £, sávokba (A–H) sorolva. Egyedülállóként 25% kedvezmény!" },
  { hu: "Egyedülálló kedvezmény", word: "Single person discount", phonetic: "szingl pörszön diszkaunt", standard: "Council Tax discount", note: "Sokan nem tudják, hogy jár nekik — igényelni kell a councilnál." },
  { hu: "Választói névjegyzék", word: "Electoral roll", phonetic: "ilektorál ról", standard: "Electoral register", note: "Nem csak szavazáshoz: a hitelképességedet is ez erősíti." },
  { hu: "Hitelképesség", word: "Credit score", phonetic: "kredit szkór", standard: "Credit rating", note: "Új érkezőként nulláról indul — mobil-előfizetés és bankszámla építi." },
  { hu: "Lakcímigazolás", word: "Proof of address", phonetic: "prúf öv ödressz", standard: "Proof of address", note: "Bankszámlához kell — de bankszámla nélkül nehéz hozzájutni. Klasszikus csapda." },
  { hu: "Bérleti szerződés", word: "Tenancy agreement", phonetic: "tenönszi ögrímönt", standard: "Assured shorthold tenancy" },
  { hu: "Kaució-védelmi rendszer", word: "Deposit protection scheme", phonetic: "dipozit protekson szkím", standard: "Tenancy deposit scheme", note: "Törvény kötelezi a főbérlőt — kérd el a hivatkozási számot, különben nincs védve." },
  { hu: "Kezes", word: "Guarantor", phonetic: "geröntór", standard: "Rent guarantor", note: "Sok főbérlő UK-ban élő kezest kér — vagy 6 havi bérleti díjat előre." },
  { hu: "Albérlőtárs", word: "Housemate / flatmate", phonetic: "hauszméjt / fletméjt", standard: "Housemate" },
  { hu: "Rezsi", word: "Bills", phonetic: "bilsz", standard: "Utility bills", note: "„Bills included” = a rezsi benne van a bérleti díjban." },
  { hu: "Tévé-előfizetési díj", word: "TV Licence", phonetic: "tí-ví lájszensz", standard: "TV Licence", note: "Évi ~170 £. Élő tévéadás és BBC iPlayer nézéséhez kötelező." },
  { hu: "Előrefizetős mérőóra", word: "Prepayment meter", phonetic: "prípéjmönt míter", standard: "Pay-as-you-go meter", note: "Drágább a normálnál — költözéskor kérd az átállítást." },
  { hu: "Munkaszerződés", word: "Contract of employment", phonetic: "kontrekt öv imploimönt", standard: "Employment contract" },
  { hu: "Nulla órás szerződés", word: "Zero-hours contract", phonetic: "zíró-auersz kontrekt", standard: "Zero-hours contract", note: "Nincs garantált óraszám. Nagyon rugalmas — és nagyon bizonytalan." },
  { hu: "Minimálbér", word: "National Living Wage", phonetic: "nesönöl living véjdzs", standard: "Minimum wage", note: "Korcsoportonként más. A munkáltatónak kötelező — ellenőrizd a gov.uk-n." },
  { hu: "Táppénz", word: "Sick pay", phonetic: "szik péj", standard: "Statutory Sick Pay", note: "Az SSP nagyon alacsony — nézd meg, a céged ad-e többet." },
  { hu: "Szabadság", word: "Annual leave", phonetic: "enjuöl lív", standard: "Holiday entitlement", note: "Törvényi minimum 28 nap — de ebbe a 8 bank holiday is beleszámíthat." },
  { hu: "Felmondási idő", word: "Notice period", phonetic: "nótisz píriöd", standard: "Notice period" },
  { hu: "Ajánlás (munkáltatói)", word: "Reference", phonetic: "referönsz", standard: "Employment reference", note: "UK-ban szinte minden álláshoz kérnek kettőt — gyűjtsd őket." },
  { hu: "Önéletrajz", word: "CV", phonetic: "szí-ví", standard: "Curriculum vitae", note: "⚠️ A briteknél NINCS fénykép és születési dátum — az diszkriminációnak számít." },
  { hu: "Motivációs levél", word: "Cover letter", phonetic: "kavör letör", standard: "Covering letter" },
  { hu: "Erkölcsi bizonyítvány", word: "DBS check", phonetic: "dí-bí-esz csek", standard: "Disclosure and Barring Service", note: "Gyerekekkel vagy idősekkel dolgozóknak kötelező." },
  { hu: "Nyugdíj-automatizmus", word: "Auto-enrolment", phonetic: "ótó-inrólmönt", standard: "Workplace pension", note: "Automatikusan beléptetnek — ne lépj ki, a munkáltató is fizet bele!" },
  { hu: "Állami nyugdíj", word: "State Pension", phonetic: "sztéjt pensön", standard: "State Pension", note: "Legalább 10 év NI-befizetés kell hozzá — a magyar évek beszámíthatók." },
  { hu: "Zöldségesbolt / kisbolt", word: "Corner shop", phonetic: "kórnör sop", standard: "Convenience store" },
  { hu: "Használtcikk-bolt (jótékonysági)", word: "Charity shop", phonetic: "cseriti sop", standard: "Second-hand shop", note: "Bútor, ruha, könyv olcsón — költözéskor az első hely, ahova menj." },
  { hu: "Kiárusítás", word: "Sale", phonetic: "széjl", standard: "Sale", note: "A karácsony utáni „Boxing Day sale” a legnagyobb az évben." },
  { hu: "Hűségkártya", word: "Loyalty card", phonetic: "lojölti kárd", standard: "Clubcard / Nectar", note: "A Tescónál és a Sainsbury'snál az ár is más vele — kérd az elsőnél." },
  { hu: "Postai kézbesítés helyett átvétel", word: "Click and collect", phonetic: "klik end kolekt", standard: "Click & Collect" },
  { hu: "Sorban állás szabálya", word: "Queue jumping", phonetic: "kjú dzsamping", standard: "Cutting in line", note: "A sor előre furakodás a legsúlyosabb brit társadalmi vétség." },
  { hu: "Kellemes hétvégét", word: "Have a lovely weekend", phonetic: "hev ö lavli víkend", standard: "Have a good weekend" },
];

/** Spanyol — hétköznapi kifejezések + a kint élőnek fontos hivatali szavak. */
const ES_WORDS: DailyWord[] = [
  { hu: "Szia / Helló", word: "Hola", phonetic: "ola", standard: "Hola", note: "A „h” néma a spanyolban." },
  { hu: "Jó reggelt / jó napot", word: "Buenos días", phonetic: "buenosz díász", standard: "Buenos días" },
  { hu: "Jó napot (délután)", word: "Buenas tardes", phonetic: "buenasz tardesz", standard: "Buenas tardes", note: "Kb. déltől estig." },
  { hu: "Köszönöm", word: "Gracias", phonetic: "grásziász", standard: "Gracias" },
  { hu: "Szívesen", word: "De nada", phonetic: "de nada", standard: "De nada" },
  { hu: "Kérem / legyen szíves", word: "Por favor", phonetic: "por favor", standard: "Por favor" },
  { hu: "Bocsánat / elnézést", word: "Perdona", phonetic: "perdona", standard: "Perdón", note: "Figyelemfelkeltésre és bocsánatkérésre is." },
  { hu: "Hogy vagy?", word: "¿Qué tal?", phonetic: "ke tál", standard: "¿Qué tal?" },
  { hu: "Oké / rendben", word: "Vale", phonetic: "bále", standard: "Vale", note: "A LEGgyakoribb spanyol szó — „oké” értelemben mindenre." },
  { hu: "Jó étvágyat", word: "Buen provecho", phonetic: "buen provecso", standard: "Buen provecho" },
  { hu: "Viszlát", word: "Hasta luego", phonetic: "aszta luego", standard: "Hasta luego", note: "Szó szerint „a későbbiig” — boltból kimenet is ezt mondják." },
  { hu: "Menő / klassz", word: "Guay", phonetic: "gvái", standard: "Guay", note: "Fiatalos „szuper”." },
  { hu: "Haver / csávó (szleng)", word: "Tío / Tía", phonetic: "tío / tía", standard: "Tío", note: "Szó szerint „nagybácsi/néni”, de baráti megszólítás is." },
  { hu: "Előzetes időpont", word: "Cita previa", phonetic: "szita prévia", standard: "Cita previa", note: "SZINTE MINDENHEZ ez kell (orvos, hivatal, NIE) — enélkül nem fogadnak." },
  { hu: "Egyéni vállalkozó", word: "Autónomo", phonetic: "autonomo", standard: "Autónomo", note: "A magyar „ev.” megfelelője — havi cuota jár vele." },
  { hu: "Lakcímre bejelentkezni", word: "Empadronarse", phonetic: "empadronarsze", standard: "Empadronarse", note: "Az első hivatali kör: a padrón (lakónyilvántartás) sok ügyhöz alapfeltétel." },
  { hu: "Ügyintéző iroda", word: "Gestoría", phonetic: "hesztoría", standard: "Gestoría", note: "A gestor intézi a hivatali/adó papírmunkát — kint gyakran nélkülözhetetlen." },
  { hu: "Külföldi azonosító szám", word: "NIE", phonetic: "ní-e", standard: "Número de Identidad de Extranjero", note: "A spanyol adószám/azonosító — szinte minden ügyhöz kell." },
  { hu: "Napi menü", word: "Menú del día", phonetic: "menú del día", standard: "Menú del día", note: "Ebédkor fix áras 2-3 fogás itallal — a legjobb ár-érték." },
  { hu: "Csapolt sör (kicsi)", word: "Caña", phonetic: "kanya", standard: "Caña", note: "A bárban „una caña” = egy kis csapolt sör." },
  { hu: "Számla (fizetés)", word: "La cuenta", phonetic: "la kuenta", standard: "La cuenta", note: "„La cuenta, por favor” = a számlát kérem." },
  { hu: "Leárazás / kiárusítás", word: "Rebajas", phonetic: "rebahász", standard: "Rebajas", note: "A nagy szezonvégi akciók (január, július)." },
  { hu: "Gyógyszertár", word: "Farmacia", phonetic: "farmászia", standard: "Farmacia", note: "A zöld kereszt jelzi; ügyeletes = „farmacia de guardia”." },
  { hu: "Egészségügyi kártya", word: "Tarjeta sanitaria", phonetic: "tarheta szanitária", standard: "Tarjeta sanitaria", note: "A közegészségügyi ellátáshoz — a centro de salud-ban igényled." },
  { hu: "Hosszú hétvége", word: "Puente", phonetic: "puente", standard: "Puente", note: "Ha az ünnep csütörtökre esik, a pénteket is „hídként” kiveszik." },
  { hu: "Ebéd utáni beszélgetés", word: "Sobremesa", phonetic: "szobremesza", standard: "Sobremesa", note: "Az asztalnál maradás étkezés után — fontos társasági szokás." },
  { hu: "Lakás", word: "Piso", phonetic: "pizo", standard: "Piso", note: "„Piso de alquiler” = kiadó lakás." },
  { hu: "Egészségedre!", word: "¡Salud!", phonetic: "szalúd", standard: "¡Salud!" },
  { hu: "Beszél angolul?", word: "¿Habla inglés?", phonetic: "abla inglész", standard: "¿Habla inglés?", note: "Sok helyen nem — a spanyol próbálkozást nagyra értékelik." },
  // — 2026-08: bővítés, hogy a napi szó ne ismétlődjön havonta (lásd getDailyWord) —
  { hu: "Jó éjszakát", word: "Buenas noches", phonetic: "buenasz nocsesz", standard: "Buenas noches", note: "Este 8 után köszönésre ÉS búcsúzásra is ez jár." },
  { hu: "Örülök a találkozásnak", word: "Mucho gusto", phonetic: "mucso guszto", standard: "Encantado / Encantada" },
  { hu: "Elnézést (megszólítás)", word: "Disculpe", phonetic: "diszkulpe", standard: "Perdone", note: "Idegennek ez az udvarias — a „perdona” tegező alak." },
  { hu: "Nem értem", word: "No entiendo", phonetic: "no entyendo", standard: "No comprendo" },
  { hu: "Lassabban, kérem", word: "Más despacio, por favor", phonetic: "mász deszpaszio", standard: "Más despacio", note: "A spanyolok gyorsan beszélnek — ezt a mondatot tanuld meg elsőnek." },
  { hu: "Hogy mondják spanyolul…?", word: "¿Cómo se dice…?", phonetic: "komo sze disze", standard: "¿Cómo se dice en español?" },
  { hu: "Társadalombiztosítási szám", word: "Número de la Seguridad Social", phonetic: "numero de la szeguridád szoszjál", standard: "NUSS", note: "Munkába álláshoz kell — a Seguridad Social irodájában igényled." },
  { hu: "Külföldi személyi igazolvány", word: "TIE", phonetic: "té-i-e", standard: "Tarjeta de Identidad de Extranjero", note: "EU-s polgárnak a zöld „Certificado de registro” elég." },
  { hu: "Lakcím-bejelentés", word: "Padrón", phonetic: "padron", standard: "Empadronamiento", note: "Az önkormányzatnál. Enélkül nincs egészségügyi kártya és iskolai hely." },
  { hu: "Lakcímigazolás", word: "Volante de empadronamiento", phonetic: "volante de empadronamjento", standard: "Certificado de empadronamiento", note: "Szinte minden ügyintézéshez kérik — általában 3 hónapnál frissebbet." },
  { hu: "Digitális aláírás", word: "Certificado digital", phonetic: "szertifikádo digitál", standard: "Certificado electrónico", note: "Ezzel online intézhetsz mindent — sorban állás nélkül. Szerezd meg korán." },
  { hu: "Egyszeri belépési kód", word: "Cl@ve", phonetic: "kláve", standard: "Cl@ve PIN", note: "A digitális aláírás egyszerűbb alternatívája adóügyekhez." },
  { hu: "Háziorvos", word: "Médico de cabecera", phonetic: "mediko de kabeszera", standard: "Médico de familia", note: "A centro de saludban jelölik ki lakcím szerint." },
  { hu: "Egészségügyi központ", word: "Centro de salud", phonetic: "szentro de szalud", standard: "Ambulatorio" },
  { hu: "Sürgősségi", word: "Urgencias", phonetic: "urhenszjasz", standard: "Servicio de urgencias", note: "Segélyhívó: 112." },
  { hu: "Recept", word: "Receta", phonetic: "reszeta", standard: "Receta médica", note: "Spanyolországban elektronikus — elég a tarjeta sanitaria a patikában." },
  { hu: "Ügyeletes gyógyszertár", word: "Farmacia de guardia", phonetic: "farmaszja de gvárdja", standard: "Farmacia 24 horas", note: "Éjjel-nappal nyitva; a zárt patikák ajtaján kiírják, melyik az." },
  { hu: "Adóhivatal", word: "Hacienda", phonetic: "aszjenda", standard: "Agencia Tributaria" },
  { hu: "Adóbevallás", word: "Declaración de la renta", phonetic: "deklaraszjon de la renta", standard: "IRPF", note: "Április–június. A „borrador” egy előkitöltött tervezet — mindig ellenőrizd." },
  { hu: "Áfa", word: "IVA", phonetic: "iba", standard: "Impuesto sobre el Valor Añadido", note: "Az általános kulcs 21%, az alapélelmiszereké 4%." },
  { hu: "Vállalkozói havi járulék", word: "Cuota de autónomo", phonetic: "kvota de autonomo", standard: "Cuota mensual", note: "Bevételtől függő sávok; kezdőknek 1 évig kedvezményes „tarifa plana”." },
  { hu: "Munkaszerződés", word: "Contrato de trabajo", phonetic: "kontráto de trabaho", standard: "Contrato laboral", note: "„Indefinido” = határozatlan, „temporal” = határozott idejű." },
  { hu: "Bérlap", word: "Nómina", phonetic: "nomina", standard: "Recibo de salario", note: "Lakásbérléshez rendszerint az utolsó 3-at kérik." },
  { hu: "Munkaviszony-igazolás", word: "Vida laboral", phonetic: "vida laborál", standard: "Informe de vida laboral", note: "A teljes spanyol munkatörténeted egy lapon — online azonnal letölthető." },
  { hu: "Kollektív szerződés", word: "Convenio colectivo", phonetic: "konvenjo kolektivo", standard: "Convenio", note: "A szakmád bérét és szabadságát ez szabja meg, nem a törvény minimuma." },
  { hu: "Végkielégítés", word: "Finiquito", phonetic: "finikito", standard: "Liquidación", note: "Kilépéskor jár: ki nem vett szabadság + arányos extra havi bér." },
  { hu: "Munkanélküli-ellátás", word: "Paro", phonetic: "paro", standard: "Prestación por desempleo", note: "A SEPE-nél igényled, a munkaviszony vége után 15 napon belül." },
  { hu: "Munkaügyi hivatal", word: "SEPE", phonetic: "szepe", standard: "Servicio Público de Empleo Estatal" },
  { hu: "Bérleti szerződés", word: "Contrato de alquiler", phonetic: "kontráto de alkiler", standard: "Contrato de arrendamiento" },
  { hu: "Kaució", word: "Fianza", phonetic: "fjansza", standard: "Fianza", note: "Törvény szerint 1 havi bér lakásnál — de sokan „aval”-t is kérnek mellé." },
  { hu: "Ingatlanközvetítői díj", word: "Honorarios de agencia", phonetic: "onorárjosz de ahenszja", standard: "Comisión inmobiliaria", note: "2023 óta a bérbeadó fizeti, nem a bérlő — ne hagyd magadra terhelni!" },
  { hu: "Közös költség", word: "Gastos de comunidad", phonetic: "gasztosz de komunidád", standard: "Cuota de comunidad", note: "Kérdezd meg, benne van-e a bérleti díjban — havi 30–100 € is lehet." },
  { hu: "Lakás bútorozva", word: "Amueblado", phonetic: "amueblado", standard: "Piso amueblado" },
  { hu: "Szoba kiadó", word: "Habitación en alquiler", phonetic: "abitaszjon en alkiler", standard: "Alquiler de habitación", note: "Nagyvárosban a legjárhatóbb belépő — Idealista, Badi." },
  { hu: "Bankszámla", word: "Cuenta bancaria", phonetic: "kventa bankárja", standard: "Cuenta corriente", note: "Kérdezd a havi díjat: sok spanyol banknál van, ha nincs ott a fizetésed." },
  { hu: "Csoportos beszedés", word: "Domiciliación", phonetic: "domiszilijaszjon", standard: "Domiciliación bancaria", note: "A rezsit és a mobilt így fizetik — csak spanyol IBAN-nal megy zökkenő nélkül." },
  { hu: "Nyugta / blokk", word: "Ticket", phonetic: "tiket", standard: "Recibo" },
  { hu: "Kis harapnivaló ital mellé", word: "Tapa", phonetic: "tapa", standard: "Tapa", note: "Granadában és Leónban a sör mellé ingyen jár — Madridban általában nem." },
  { hu: "Reggeli (délelőtti)", word: "Almuerzo", phonetic: "almuerszo", standard: "Segundo desayuno", note: "⚠️ Régiónként mást jelent: van, ahol ez az ebéd (comida) neve!" },
  { hu: "Sziesztaidő", word: "Hora de la siesta", phonetic: "ora de la szjeszta", standard: "Descanso", note: "Kisvárosban 14–17 óra közt sok bolt és iroda zárva — tervezz vele." },
];

const LISTS: Record<string, DailyWord[]> = { CH: CH_WORDS, AT: AT_WORDS, DE: DE_WORDS, NL: NL_WORDS, GB: GB_WORDS, ES: ES_WORDS };

/** Van-e napi szó az adott országhoz? (Csak az élő nyelvi tartalmú országok.) */
export function hasDailyWord(country: string): boolean {
  return country in LISTS;
}

/** A BCP-47 nyelvi kód a TTS-hez. */
export function ttsLang(country: string): string {
  if (country === "AT") return "de-AT";
  if (country === "DE") return "de-DE";
  if (country === "NL") return "nl-NL";
  if (country === "GB") return "en-GB";
  if (country === "ES") return "es-ES";
  return "de-CH";
}

/** Az ország teljes szó-bankja (tanulási statisztikához, ismétlőhöz). */
export function getWordBank(country: string): DailyWord[] {
  return LISTS[country] ?? [];
}

/**
 * A legkisebb `n`-hez relatív prím lépésköz a `ciklus`-adik körhöz.
 *
 * ⚠️ A relatív prímség NEM kozmetika: csak akkor bijekció a `d → d*step`
 * leképezés modulo n, ha lnko(step, n) = 1 — különben egy körön belül lennének
 * KIMARADÓ és KÉTSZER előjövő szavak. (Pl. n=70, step=2 esetén a körből 35 szó
 * teljesen kiesne.)
 */
function lepeskoz(n: number, ciklus: number): number {
  const lnko = (a: number, b: number): number => (b === 0 ? a : lnko(b, a % b));
  let s = (((ciklus * 7 + 3) % n) + n) % n;
  for (let i = 0; i < n; i++) {
    const jelolt = ((s + i) % n) + 1; // 1..n, sosem 0
    if (lnko(jelolt, n) === 1) return jelolt;
  }
  return 1;
}

/**
 * A mai szó az országhoz. A `dayIndex` a nap sorszáma (pl. epoch-nap), így a
 * választás determinisztikus és kliens/szerver között stabil (nincs
 * Math.random — az SSR és a kliens ugyanazt kell adja).
 *
 * KÖRÖNKÉNT MÁS A SORREND. A sima `dayIndex % n` minden körben ugyanabban a
 * sorrendben pörgette a listát, ezért a visszatérő felhasználó nemcsak a
 * szavakat, hanem a MINTÁT is felismerte („már megint ez jön a Grüezi után”).
 * Egy körön belül továbbra is minden szó pontosan egyszer szerepel — a
 * `lepeskoz` relatív prímsége garantálja.
 */
export function getDailyWord(country: string, dayIndex: number): DailyWord | null {
  const list = LISTS[country];
  if (!list || list.length === 0) return null;
  const n = list.length;
  const d = ((dayIndex % n) + n) % n; // hányadik nap a cikluson belül
  const ciklus = Math.floor(dayIndex / n); // hányadik körben járunk
  // ⚠️ A ciklus NEGATÍV is lehet (dayIndex < 0), és akkor a `%` is negatívat ad
  // → tömbön kívüli index, `undefined` szó. Ezért kell a második normalizálás.
  const idx = (((d * lepeskoz(n, ciklus) + ciklus) % n) + n) % n;
  return list[idx];
}
