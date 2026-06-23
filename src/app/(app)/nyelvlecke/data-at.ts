import type { Lesson } from "./data";

/**
 * Osztrák német (Österreichisches Deutsch) kurzus — a svájci Mundart-kurzus
 * (data.ts) ország-megfelelője, 100 leckében, 12 tematikus fejezetben. Valódi
 * osztrák szókincs, ami eltér a németországi standardtól (Grüß Gott, Jänner,
 * Erdäpfel, Sessel, Krügerl, leiwand, Schmäh…).
 *
 * A lecke-id-k „al" előtaggal, hogy NE ütközzenek a CH „l" id-kkel (a lejátszó
 * mindkét készletben keres). A kérdés-id-k globálisan egyediek (q1…).
 */
export const LESSONS_AT: Lesson[] = [
  // ══ 1. Fejezet: Alapok ══════════════════════════════
  {
    id: "al1", title: "Köszönés", description: "Grüß Gott, Servus — így köszönnek Ausztriában.", chapter: 1, xpReward: 10,
    questions: [
      { id: "q1", type: "multiple_choice", prompt: "Hogy mondják hivatalosan: 'Jó napot'?", options: [{ id: "o1", text: "Grüß Gott" }, { id: "o2", text: "Grüezi" }, { id: "o3", text: "Moin" }], correctOptionId: "o1" },
      { id: "q2", type: "flashcard", prompt: "Informális köszönés (szia, helló)?", backText: "Servus", phonetic: "Szervusz" },
      { id: "q3", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Jó napot (hivatalos)", right: "Grüß Gott" }, { id: "p2", left: "Szia (informális)", right: "Servus" }, { id: "p3", left: "Helló", right: "Hallo" }] },
    ],
  },
  {
    id: "al2", title: "Búcsúzás", description: "Servus, Pfiat di, Auf Wiederschauen — elköszönés osztrák módra.", chapter: 1, xpReward: 10,
    questions: [
      { id: "q4", type: "multiple_choice", prompt: "Informális 'szia' búcsúzáskor (Ausztria-szerte)?", options: [{ id: "o1", text: "Servus" }, { id: "o2", text: "Ciao bella" }, { id: "o3", text: "Hi" }], correctOptionId: "o1" },
      { id: "q5", type: "flashcard", prompt: "'Viszlát' (informális, regionális)?", backText: "Pfiat di", phonetic: "Pfíjat di" },
      { id: "q6", type: "match", prompt: "Párosítsd a búcsúzásokat!", pairs: [{ id: "p1", left: "Szia (búcsú, Ausztria-szerte)", right: "Servus" }, { id: "p2", left: "Viszlát (regionális)", right: "Pfiat di" }, { id: "p3", left: "Viszontlátásra (hivatalos)", right: "Auf Wiederschauen" }] },
    ],
  },
  {
    id: "al3", title: "Udvariasság", description: "Danke, Bitte, Entschuldigung.", chapter: 1, xpReward: 10,
    questions: [
      { id: "q7", type: "multiple_choice", prompt: "Hogy mondod: 'Elnézést'?", options: [{ id: "o1", text: "Entschuldigung" }, { id: "o2", text: "Scusi" }, { id: "o3", text: "Pardon" }], correctOptionId: "o1" },
      { id: "q8", type: "flashcard", prompt: "'Szívesen' (válasz a köszönömre)?", backText: "Gern geschehen / Bitte", phonetic: "Gern gesehen" },
      { id: "q9", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Köszönöm", right: "Danke" }, { id: "p2", left: "Kérlek / Tessék", right: "Bitte" }, { id: "p3", left: "Bocsánat", right: "Tschuldigung" }] },
    ],
  },
  {
    id: "al4", title: "Bemutatkozás", description: "Wia geht's? Freut mi!", chapter: 1, xpReward: 15,
    questions: [
      { id: "q10", type: "multiple_choice", prompt: "Informális 'Hogy vagy?'", options: [{ id: "o1", text: "Wia geht's?" }, { id: "o2", text: "Wie gaht's?" }, { id: "o3", text: "Ça va?" }], correctOptionId: "o1" },
      { id: "q11", type: "flashcard", prompt: "'Örvendek (a találkozásnak)'?", backText: "Freut mi!", phonetic: "Frojt mih" },
      { id: "q12", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Hogy hívnak?", right: "Wie haaßt du?" }, { id: "p2", left: "Engem … hívnak", right: "I haaß …" }, { id: "p3", left: "Örvendek", right: "Freut mi" }] },
    ],
  },
  {
    id: "al5", title: "Igen, nem, talán", description: "Ja, Na, eh, passt.", chapter: 1, xpReward: 10,
    questions: [
      { id: "q13", type: "multiple_choice", prompt: "Hogy mondják szlengben: 'nem'?", options: [{ id: "o1", text: "Na" }, { id: "o2", text: "No" }, { id: "o3", text: "Net" }], correctOptionId: "o1" },
      { id: "q14", type: "flashcard", prompt: "Mit jelent: 'passt'?", backText: "rendben / oké", phonetic: "paszt" },
      { id: "q15", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Igen", right: "Ja" }, { id: "p2", left: "Nem", right: "Na / Nein" }, { id: "p3", left: "Talán", right: "Vielleicht" }] },
    ],
  },
  {
    id: "al6", title: "Kérdőszavak", description: "Wo, was, wann, wie, warum.", chapter: 1, xpReward: 10,
    questions: [
      { id: "q16", type: "multiple_choice", prompt: "Mit jelent 'Wo'?", options: [{ id: "o1", text: "Hol" }, { id: "o2", text: "Mikor" }, { id: "o3", text: "Mit" }], correctOptionId: "o1" },
      { id: "q17", type: "flashcard", prompt: "'Miért?'", backText: "Warum? / Wieso?", phonetic: "Varum" },
      { id: "q18", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Mit?", right: "Was?" }, { id: "p2", left: "Mikor?", right: "Wann?" }, { id: "p3", left: "Ki?", right: "Wer?" }, { id: "p4", left: "Hogyan?", right: "Wie?" }] },
    ],
  },
  {
    id: "al7", title: "Névmások", description: "Ich, du, er, sie — én, te, ő.", chapter: 1, xpReward: 10,
    questions: [
      { id: "q19", type: "multiple_choice", prompt: "Mit jelent 'i' (osztrák 'ich')?", options: [{ id: "o1", text: "én" }, { id: "o2", text: "te" }, { id: "o3", text: "ő" }], correctOptionId: "o1" },
      { id: "q20", type: "flashcard", prompt: "'nekem' (osztrák ejtés)?", backText: "mir", phonetic: "mia" },
      { id: "q21", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "én", right: "i / ich" }, { id: "p2", left: "te", right: "du" }, { id: "p3", left: "mi", right: "mir / wir" }] },
    ],
  },
  {
    id: "al8", title: "Hasznos mondatok", description: "Nem értem. Megismételné?", chapter: 1, xpReward: 15,
    questions: [
      { id: "q22", type: "multiple_choice", prompt: "'Nem értem' osztrákul?", options: [{ id: "o1", text: "I versteh des net" }, { id: "o2", text: "I ha kä Ahnig" }, { id: "o3", text: "Capisco no" }], correctOptionId: "o1" },
      { id: "q23", type: "flashcard", prompt: "'Beszél magyarul?'", backText: "Sprechen S' Ungarisch?", phonetic: "Sprehen Sze Ungáris" },
      { id: "q24", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Megismételné?", right: "Können S' das wiederholen?" }, { id: "p2", left: "Lassabban, kérem", right: "Langsamer, bitte" }, { id: "p3", left: "Nem tudom", right: "I waaß net" }] },
    ],
  },

  // ══ 2. Fejezet: Idő és számok ═══════════════════════
  {
    id: "al9", title: "Számok 1–10", description: "eins, zwa, drei …", chapter: 2, xpReward: 10,
    questions: [
      { id: "q25", type: "multiple_choice", prompt: "Mi a 'kettő' (osztrák ejtés)?", options: [{ id: "o1", text: "zwa / zwoa" }, { id: "o2", text: "zwöi" }, { id: "o3", text: "due" }], correctOptionId: "o1" },
      { id: "q26", type: "flashcard", prompt: "'három'?", backText: "drei", phonetic: "dráj" },
      { id: "q27", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "egy", right: "eins" }, { id: "p2", left: "öt", right: "fünf" }, { id: "p3", left: "tíz", right: "zehn" }] },
    ],
  },
  {
    id: "al10", title: "Számok 11–100", description: "elf, zwanzig, hundert.", chapter: 2, xpReward: 10,
    questions: [
      { id: "q28", type: "multiple_choice", prompt: "Mi a 'húsz'?", options: [{ id: "o1", text: "zwanzig" }, { id: "o2", text: "zwänzg" }, { id: "o3", text: "venti" }], correctOptionId: "o1" },
      { id: "q29", type: "flashcard", prompt: "'száz'?", backText: "hundert", phonetic: "hundert" },
      { id: "q30", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "tizenegy", right: "elf" }, { id: "p2", left: "harminc", right: "dreißig" }, { id: "p3", left: "ezer", right: "tausend" }] },
    ],
  },
  {
    id: "al11", title: "Hónapok", description: "Jänner, Feber — osztrák hónapnevek.", chapter: 2, xpReward: 15,
    questions: [
      { id: "q31", type: "multiple_choice", prompt: "'Január' osztrákul?", options: [{ id: "o1", text: "Jänner" }, { id: "o2", text: "Januar" }, { id: "o3", text: "Genner" }], correctOptionId: "o1" },
      { id: "q32", type: "flashcard", prompt: "'Február' (osztrák variáns)?", backText: "Feber", phonetic: "Féber" },
      { id: "q33", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Január", right: "Jänner" }, { id: "p2", left: "Február", right: "Feber" }, { id: "p3", left: "December", right: "Dezember" }] },
    ],
  },
  {
    id: "al12", title: "Napok és 'heuer'", description: "Montag … Sonntag, heuer.", chapter: 2, xpReward: 10,
    questions: [
      { id: "q34", type: "multiple_choice", prompt: "Mit jelent 'heuer'?", options: [{ id: "o1", text: "idén" }, { id: "o2", text: "tegnap" }, { id: "o3", text: "soha" }], correctOptionId: "o1" },
      { id: "q35", type: "flashcard", prompt: "'hétfő'?", backText: "Montag", phonetic: "Móntág" },
      { id: "q36", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "ma", right: "heute" }, { id: "p2", left: "tegnap", right: "gestern" }, { id: "p3", left: "holnap", right: "morgen" }, { id: "p4", left: "idén", right: "heuer" }] },
    ],
  },
  {
    id: "al13", title: "Napszakok", description: "in der Früh, am Abend.", chapter: 2, xpReward: 10,
    questions: [
      { id: "q37", type: "multiple_choice", prompt: "'reggel' osztrákul?", options: [{ id: "o1", text: "in der Früh" }, { id: "o2", text: "am Morge" }, { id: "o3", text: "di mattina" }], correctOptionId: "o1" },
      { id: "q38", type: "flashcard", prompt: "'délben'?", backText: "zu Mittag", phonetic: "cu Mittág" },
      { id: "q39", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "reggel", right: "in der Früh" }, { id: "p2", left: "délután", right: "am Nachmittag" }, { id: "p3", left: "este", right: "am Abend" }] },
    ],
  },
  {
    id: "al14", title: "Az óra", description: "viertel, dreiviertel — az osztrák időmondás.", chapter: 2, xpReward: 20,
    questions: [
      { id: "q40", type: "multiple_choice", prompt: "Mit jelent 'viertel fünf'?", options: [{ id: "o1", text: "negyed öt (4:15)" }, { id: "o2", text: "öt óra" }, { id: "o3", text: "fél öt" }], correctOptionId: "o1" },
      { id: "q41", type: "flashcard", prompt: "Mit jelent 'dreiviertel fünf'?", backText: "háromnegyed öt (4:45)", phonetic: "dráj-firtl fünf" },
      { id: "q42", type: "match", prompt: "Párosítsd az időt!", pairs: [{ id: "p1", left: "4:15", right: "viertel fünf" }, { id: "p2", left: "4:30", right: "halb fünf" }, { id: "p3", left: "4:45", right: "dreiviertel fünf" }] },
    ],
  },
  {
    id: "al15", title: "Mikor?", description: "jetzt, gleich, bald, später.", chapter: 2, xpReward: 10,
    questions: [
      { id: "q43", type: "multiple_choice", prompt: "Mit jelent 'gleich'?", options: [{ id: "o1", text: "mindjárt" }, { id: "o2", text: "soha" }, { id: "o3", text: "tegnap" }], correctOptionId: "o1" },
      { id: "q44", type: "flashcard", prompt: "'most'?", backText: "jetzt / jetzat", phonetic: "jetzt" },
      { id: "q45", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "most", right: "jetzt" }, { id: "p2", left: "hamarosan", right: "bald" }, { id: "p3", left: "később", right: "später" }] },
    ],
  },
  {
    id: "al16", title: "Évszakok", description: "Frühling, Sommer, Herbst, Winter.", chapter: 2, xpReward: 10,
    questions: [
      { id: "q46", type: "multiple_choice", prompt: "'tél'?", options: [{ id: "o1", text: "Winter" }, { id: "o2", text: "Summer" }, { id: "o3", text: "inverno" }], correctOptionId: "o1" },
      { id: "q47", type: "flashcard", prompt: "'tavasz'?", backText: "Frühling", phonetic: "Früling" },
      { id: "q48", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "nyár", right: "Sommer" }, { id: "p2", left: "ősz", right: "Herbst" }, { id: "p3", left: "tél", right: "Winter" }] },
    ],
  },
  {
    id: "al17", title: "Ünnepek", description: "Weihnachten, Ostern, Fasching.", chapter: 2, xpReward: 15,
    questions: [
      { id: "q49", type: "multiple_choice", prompt: "Mit jelent 'Fasching'?", options: [{ id: "o1", text: "farsang" }, { id: "o2", text: "húsvét" }, { id: "o3", text: "karácsony" }], correctOptionId: "o1" },
      { id: "q50", type: "flashcard", prompt: "'Szilveszter'?", backText: "Silvester", phonetic: "Szilveszter" },
      { id: "q51", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Karácsony", right: "Weihnachten" }, { id: "p2", left: "Húsvét", right: "Ostern" }, { id: "p3", left: "Farsang", right: "Fasching" }] },
    ],
  },

  // ══ 3. Fejezet: Étel ════════════════════════════════
  {
    id: "al18", title: "Zöldség", description: "Erdäpfel, Paradeiser, Fisolen.", chapter: 3, xpReward: 20,
    questions: [
      { id: "q52", type: "multiple_choice", prompt: "'burgonya / krumpli'?", options: [{ id: "o1", text: "Erdäpfel" }, { id: "o2", text: "Kartoffeln" }, { id: "o3", text: "Grumbeere" }], correctOptionId: "o1" },
      { id: "q53", type: "flashcard", prompt: "'zöldbab'?", backText: "Fisolen", phonetic: "Fizólen" },
      { id: "q54", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Burgonya", right: "Erdäpfel" }, { id: "p2", left: "Paradicsom", right: "Paradeiser" }, { id: "p3", left: "Karfiol", right: "Karfiol" }, { id: "p4", left: "Padlizsán", right: "Melanzani" }] },
    ],
  },
  {
    id: "al19", title: "Gyümölcs", description: "Marille, Ribisel, Zwetschke.", chapter: 3, xpReward: 20,
    questions: [
      { id: "q55", type: "multiple_choice", prompt: "'sárgabarack'?", options: [{ id: "o1", text: "Marille" }, { id: "o2", text: "Aprikose" }, { id: "o3", text: "Pfirsich" }], correctOptionId: "o1" },
      { id: "q56", type: "flashcard", prompt: "'ribizli'?", backText: "Ribisel", phonetic: "Ribizl" },
      { id: "q57", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Sárgabarack", right: "Marille" }, { id: "p2", left: "Szilva", right: "Zwetschke" }, { id: "p3", left: "Meggy", right: "Weichsel" }] },
    ],
  },
  {
    id: "al20", title: "Pékáru", description: "Semmel, Kipferl, Weckerl.", chapter: 3, xpReward: 15,
    questions: [
      { id: "q58", type: "multiple_choice", prompt: "'zsemle'?", options: [{ id: "o1", text: "Semmel" }, { id: "o2", text: "Brötchen" }, { id: "o3", text: "Weggli" }], correctOptionId: "o1" },
      { id: "q59", type: "flashcard", prompt: "'kifli'?", backText: "Kipferl", phonetic: "Kipferl" },
      { id: "q60", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Zsemle", right: "Semmel" }, { id: "p2", left: "Kifli", right: "Kipferl" }, { id: "p3", left: "Hosszú zsemle", right: "Weckerl" }] },
    ],
  },
  {
    id: "al21", title: "Tejtermék", description: "Topfen, Obers, Schlagobers.", chapter: 3, xpReward: 15,
    questions: [
      { id: "q61", type: "multiple_choice", prompt: "'túró'?", options: [{ id: "o1", text: "Topfen" }, { id: "o2", text: "Quark" }, { id: "o3", text: "Hüttenkäse" }], correctOptionId: "o1" },
      { id: "q62", type: "flashcard", prompt: "'tejszínhab'?", backText: "Schlagobers", phonetic: "Slág-óbersz" },
      { id: "q63", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Túró", right: "Topfen" }, { id: "p2", left: "Tejszín", right: "Obers" }, { id: "p3", left: "Vaj", right: "Butter" }] },
    ],
  },
  {
    id: "al22", title: "Hús", description: "Faschiertes, Backhendl, Würstel.", chapter: 3, xpReward: 15,
    questions: [
      { id: "q64", type: "multiple_choice", prompt: "'darált hús'?", options: [{ id: "o1", text: "Faschiertes" }, { id: "o2", text: "Hackfleisch" }, { id: "o3", text: "Gehacktes" }], correctOptionId: "o1" },
      { id: "q65", type: "flashcard", prompt: "'rántott csirke'?", backText: "Backhendl", phonetic: "Bák-hendl" },
      { id: "q66", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Virsli", right: "Würstel" }, { id: "p2", left: "Bécsi szelet", right: "Schnitzel" }, { id: "p3", left: "Darált hús", right: "Faschiertes" }] },
    ],
  },
  {
    id: "al23", title: "Édesség", description: "Palatschinke, Kaiserschmarrn, Sachertorte.", chapter: 3, xpReward: 15,
    questions: [
      { id: "q67", type: "multiple_choice", prompt: "'palacsinta'?", options: [{ id: "o1", text: "Palatschinke" }, { id: "o2", text: "Pfannkuchen" }, { id: "o3", text: "Crêpe" }], correctOptionId: "o1" },
      { id: "q68", type: "flashcard", prompt: "Híres bécsi torta?", backText: "Sachertorte", phonetic: "Záher-torte" },
      { id: "q69", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Palacsinta", right: "Palatschinke" }, { id: "p2", left: "Császármorzsa", right: "Kaiserschmarrn" }, { id: "p3", left: "Gőzgombóc", right: "Germknödel" }] },
    ],
  },
  {
    id: "al24", title: "Fűszer és egyéb", description: "Kren, Powidl, Kukuruz.", chapter: 3, xpReward: 15,
    questions: [
      { id: "q70", type: "multiple_choice", prompt: "'torma'?", options: [{ id: "o1", text: "Kren" }, { id: "o2", text: "Meerrettich" }, { id: "o3", text: "Senf" }], correctOptionId: "o1" },
      { id: "q71", type: "flashcard", prompt: "'kukorica'?", backText: "Kukuruz", phonetic: "Kukuruc" },
      { id: "q72", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Torma", right: "Kren" }, { id: "p2", left: "Szilvalekvár", right: "Powidl" }, { id: "p3", left: "Tárkony", right: "Estragon" }] },
    ],
  },
  {
    id: "al25", title: "Reggeli", description: "Frühstück, Jause, Marmelade.", chapter: 3, xpReward: 10,
    questions: [
      { id: "q73", type: "multiple_choice", prompt: "'tízórai / uzsonna'?", options: [{ id: "o1", text: "Jause" }, { id: "o2", text: "Znüni" }, { id: "o3", text: "Vesper" }], correctOptionId: "o1" },
      { id: "q74", type: "flashcard", prompt: "'reggeli'?", backText: "Frühstück", phonetic: "Frü-stük" },
      { id: "q75", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Lekvár", right: "Marmelade" }, { id: "p2", left: "Vajas kenyér", right: "Butterbrot" }, { id: "p3", left: "Uzsonna", right: "Jause" }] },
    ],
  },
  {
    id: "al26", title: "Ebéd", description: "Suppe, Hauptspeise, Mehlspeise.", chapter: 3, xpReward: 10,
    questions: [
      { id: "q76", type: "multiple_choice", prompt: "'tésztaétel / édes főétel'?", options: [{ id: "o1", text: "Mehlspeise" }, { id: "o2", text: "Pasta" }, { id: "o3", text: "Beilage" }], correctOptionId: "o1" },
      { id: "q77", type: "flashcard", prompt: "'leves'?", backText: "Suppe", phonetic: "Zuppe" },
      { id: "q78", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Leves", right: "Suppe" }, { id: "p2", left: "Főétel", right: "Hauptspeise" }, { id: "p3", left: "Köret", right: "Beilage" }] },
    ],
  },
  {
    id: "al27", title: "Vacsora", description: "Abendessen, Brettljause.", chapter: 3, xpReward: 10,
    questions: [
      { id: "q79", type: "multiple_choice", prompt: "'hidegtál / deszkás falatok'?", options: [{ id: "o1", text: "Brettljause" }, { id: "o2", text: "Plättli" }, { id: "o3", text: "Antipasti" }], correctOptionId: "o1" },
      { id: "q80", type: "flashcard", prompt: "'vacsora'?", backText: "Abendessen / Nachtmahl", phonetic: "Ábend-eszen" },
      { id: "q81", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Vacsora", right: "Nachtmahl" }, { id: "p2", left: "Hidegtál", right: "Brettljause" }, { id: "p3", left: "Sajt", right: "Käse" }] },
    ],
  },

  // ══ 4. Fejezet: Étterem és kávéház ══════════════════
  {
    id: "al28", title: "Rendelés", description: "Ich hätt gern …", chapter: 4, xpReward: 15,
    questions: [
      { id: "q82", type: "multiple_choice", prompt: "'Kérnék egy…'", options: [{ id: "o1", text: "I hätt gern a …" }, { id: "o2", text: "Ich nehme …" }, { id: "o3", text: "Vorrei …" }], correctOptionId: "o1" },
      { id: "q83", type: "flashcard", prompt: "'Az étlapot, kérem'?", backText: "Die Speisekarte, bitte", phonetic: "Di Spájze-karte" },
      { id: "q84", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Étlap", right: "Speisekarte" }, { id: "p2", left: "Itallap", right: "Getränkekarte" }, { id: "p3", left: "Pincér", right: "Kellner / Ober" }] },
    ],
  },
  {
    id: "al29", title: "Kávéház", description: "Melange, Brauner, Verlängerter.", chapter: 4, xpReward: 20,
    questions: [
      { id: "q85", type: "multiple_choice", prompt: "Tejes kávé bécsi neve?", options: [{ id: "o1", text: "Melange" }, { id: "o2", text: "Latte" }, { id: "o3", text: "Milchkaffee" }], correctOptionId: "o1" },
      { id: "q86", type: "flashcard", prompt: "Hosszú (vizezett) feketekávé?", backText: "Verlängerter", phonetic: "Ferlengerter" },
      { id: "q87", type: "match", prompt: "Párosítsd a kávékat!", pairs: [{ id: "p1", left: "Tejes kávé", right: "Melange" }, { id: "p2", left: "Kis tejeskávé", right: "Kleiner Brauner" }, { id: "p3", left: "Hosszú kávé", right: "Verlängerter" }] },
    ],
  },
  {
    id: "al30", title: "Sör", description: "Krügerl, Seidl, Pfiff.", chapter: 4, xpReward: 15,
    questions: [
      { id: "q88", type: "multiple_choice", prompt: "Fél liter sör neve?", options: [{ id: "o1", text: "Krügerl" }, { id: "o2", text: "Stange" }, { id: "o3", text: "Maß" }], correctOptionId: "o1" },
      { id: "q89", type: "flashcard", prompt: "0,3 liter sör?", backText: "Seidl", phonetic: "Szájdl" },
      { id: "q90", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "0,5 L sör", right: "Krügerl" }, { id: "p2", left: "0,3 L sör", right: "Seidl" }, { id: "p3", left: "0,2 L sör", right: "Pfiff" }] },
    ],
  },
  {
    id: "al31", title: "Bor és Heuriger", description: "Heuriger, Sturm, G'spritzter.", chapter: 4, xpReward: 20,
    questions: [
      { id: "q91", type: "multiple_choice", prompt: "Mi a 'Heuriger'?", options: [{ id: "o1", text: "újboros borozó" }, { id: "o2", text: "sörfőzde" }, { id: "o3", text: "pékség" }], correctOptionId: "o1" },
      { id: "q92", type: "flashcard", prompt: "Bor + szóda (fröccs)?", backText: "G'spritzter", phonetic: "Gspriccter" },
      { id: "q93", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Újbor (erjedő)", right: "Sturm" }, { id: "p2", left: "Must", right: "Most" }, { id: "p3", left: "Fröccs", right: "G'spritzter" }] },
    ],
  },
  {
    id: "al32", title: "Fizetés", description: "Zahlen bitte, Trinkgeld.", chapter: 4, xpReward: 15,
    questions: [
      { id: "q94", type: "multiple_choice", prompt: "'Fizetni szeretnék'?", options: [{ id: "o1", text: "Zahlen, bitte!" }, { id: "o2", text: "Rechnung, ciao!" }, { id: "o3", text: "Konto, bitte!" }], correctOptionId: "o1" },
      { id: "q95", type: "flashcard", prompt: "'borravaló'?", backText: "Trinkgeld", phonetic: "Trink-geld" },
      { id: "q96", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Számla", right: "Rechnung" }, { id: "p2", left: "Borravaló", right: "Trinkgeld" }, { id: "p3", left: "A többi a magáé", right: "Stimmt so" }] },
    ],
  },
  {
    id: "al33", title: "Asztalfoglalás", description: "Tisch reservieren.", chapter: 4, xpReward: 10,
    questions: [
      { id: "q97", type: "multiple_choice", prompt: "'Asztalt szeretnék foglalni'?", options: [{ id: "o1", text: "I möcht an Tisch reservieren" }, { id: "o2", text: "I will a Bett" }, { id: "o3", text: "Tavolo per due" }], correctOptionId: "o1" },
      { id: "q98", type: "flashcard", prompt: "'két főre'?", backText: "für zwei Personen", phonetic: "für cváj Perzónen" },
      { id: "q99", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Asztal", right: "Tisch" }, { id: "p2", left: "Foglalni", right: "reservieren" }, { id: "p3", left: "Ma estére", right: "für heute Abend" }] },
    ],
  },
  {
    id: "al34", title: "Würstelstand", description: "Käsekrainer, Eitrige.", chapter: 4, xpReward: 20,
    questions: [
      { id: "q100", type: "multiple_choice", prompt: "Sajtos kolbász a standnál?", options: [{ id: "o1", text: "Käsekrainer" }, { id: "o2", text: "Cervelat" }, { id: "o3", text: "Bratwurst" }], correctOptionId: "o1" },
      { id: "q101", type: "flashcard", prompt: "Bécsi szleng a Käsekrainerre?", backText: "Eitrige", phonetic: "Ájtrige" },
      { id: "q102", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Virsli-stand", right: "Würstelstand" }, { id: "p2", left: "Sült kolbász", right: "Bratwurst" }, { id: "p3", left: "Mustár", right: "Senf" }] },
    ],
  },
  {
    id: "al35", title: "Vendéglő-típusok", description: "Beisl, Gasthaus, Wirtshaus.", chapter: 4, xpReward: 10,
    questions: [
      { id: "q103", type: "multiple_choice", prompt: "Mi a 'Beisl'?", options: [{ id: "o1", text: "kocsma / kis vendéglő" }, { id: "o2", text: "pékség" }, { id: "o3", text: "mozi" }], correctOptionId: "o1" },
      { id: "q104", type: "flashcard", prompt: "'vendéglő / fogadó'?", backText: "Gasthaus / Wirtshaus", phonetic: "Gászt-hausz" },
      { id: "q105", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Kocsma", right: "Beisl" }, { id: "p2", left: "Vendéglő", right: "Gasthaus" }, { id: "p3", left: "Étterem", right: "Restaurant" }] },
    ],
  },
  {
    id: "al36", title: "Jó étvágyat!", description: "Mahlzeit, schmeckt's?", chapter: 4, xpReward: 10,
    questions: [
      { id: "q106", type: "multiple_choice", prompt: "Déli köszönés/étvágy-kívánás munkahelyen?", options: [{ id: "o1", text: "Mahlzeit!" }, { id: "o2", text: "En Guete!" }, { id: "o3", text: "Buon appetito!" }], correctOptionId: "o1" },
      { id: "q107", type: "flashcard", prompt: "'Ízlik?'", backText: "Schmeckt's?", phonetic: "Smekc" },
      { id: "q108", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Jó étvágyat", right: "Guten Appetit" }, { id: "p2", left: "Finom", right: "guat / lecker" }, { id: "p3", left: "Ízlik", right: "schmeckt" }] },
    ],
  },

  // ══ 5. Fejezet: Vásárlás ════════════════════════════
  {
    id: "al37", title: "Boltok", description: "Greißler, Spar, Hofer.", chapter: 5, xpReward: 15,
    questions: [
      { id: "q109", type: "multiple_choice", prompt: "Kis sarki fűszerbolt neve?", options: [{ id: "o1", text: "Greißler" }, { id: "o2", text: "Volg" }, { id: "o3", text: "Tante-Emma" }], correctOptionId: "o1" },
      { id: "q110", type: "flashcard", prompt: "Osztrák diszkont-lánc (Aldi)?", backText: "Hofer", phonetic: "Hófer" },
      { id: "q111", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Sarki bolt", right: "Greißler" }, { id: "p2", left: "Szupermarket", right: "Supermarkt" }, { id: "p3", left: "Diszkont", right: "Hofer" }] },
    ],
  },
  {
    id: "al38", title: "Pénz", description: "Bankomat, bar zahlen.", chapter: 5, xpReward: 15,
    questions: [
      { id: "q112", type: "multiple_choice", prompt: "Mi a 'Bankomat'?", options: [{ id: "o1", text: "bankautomata (ATM)" }, { id: "o2", text: "pénztárca" }, { id: "o3", text: "bankfiók" }], correctOptionId: "o1" },
      { id: "q113", type: "flashcard", prompt: "'készpénzzel fizetni'?", backText: "bar zahlen", phonetic: "bár cálen" },
      { id: "q114", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Bankkártya", right: "Bankomatkarte" }, { id: "p2", left: "Készpénz", right: "Bargeld" }, { id: "p3", left: "Aprópénz", right: "Kleingeld" }] },
    ],
  },
  {
    id: "al39", title: "Zacskó és csomag", description: "Sackerl, Stanitzel.", chapter: 5, xpReward: 10,
    questions: [
      { id: "q115", type: "multiple_choice", prompt: "'szatyor / zacskó'?", options: [{ id: "o1", text: "Sackerl" }, { id: "o2", text: "Tüte" }, { id: "o3", text: "Säckli" }], correctOptionId: "o1" },
      { id: "q116", type: "flashcard", prompt: "Papír-tölcsér (pl. gesztenyének)?", backText: "Stanitzel", phonetic: "Stánicl" },
      { id: "q117", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Zacskó", right: "Sackerl" }, { id: "p2", left: "Tölcsér", right: "Stanitzel" }, { id: "p3", left: "Doboz", right: "Schachtel" }] },
    ],
  },
  {
    id: "al40", title: "Mennyibe kerül?", description: "teuer, billig.", chapter: 5, xpReward: 10,
    questions: [
      { id: "q118", type: "multiple_choice", prompt: "'Mennyibe kerül?'", options: [{ id: "o1", text: "Was kostet das?" }, { id: "o2", text: "Wie viel Uhr?" }, { id: "o3", text: "Wo ist das?" }], correctOptionId: "o1" },
      { id: "q119", type: "flashcard", prompt: "'drága'?", backText: "teuer", phonetic: "tojer" },
      { id: "q120", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "drága", right: "teuer" }, { id: "p2", left: "olcsó", right: "billig" }, { id: "p3", left: "akció", right: "Aktion" }] },
    ],
  },
  {
    id: "al41", title: "Mennyiség", description: "Deka, Kilo.", chapter: 5, xpReward: 15,
    questions: [
      { id: "q121", type: "multiple_choice", prompt: "Mi a '10 Deka'?", options: [{ id: "o1", text: "10 dekagramm (100 g)" }, { id: "o2", text: "10 darab" }, { id: "o3", text: "10 liter" }], correctOptionId: "o1" },
      { id: "q122", type: "flashcard", prompt: "'fél kiló'?", backText: "a halbes Kilo", phonetic: "a halbesz Kíló" },
      { id: "q123", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "10 dkg", right: "10 Deka" }, { id: "p2", left: "1 kg", right: "a Kilo" }, { id: "p3", left: "egy darab", right: "a Stück" }] },
    ],
  },
  {
    id: "al42", title: "Ruházat", description: "Gewand, Leiberl, Haube.", chapter: 5, xpReward: 15,
    questions: [
      { id: "q124", type: "multiple_choice", prompt: "'ruha / ruházat' (általában)?", options: [{ id: "o1", text: "Gewand" }, { id: "o2", text: "Klamotten" }, { id: "o3", text: "Vestiti" }], correctOptionId: "o1" },
      { id: "q125", type: "flashcard", prompt: "'póló'?", backText: "Leiberl", phonetic: "Lájberl" },
      { id: "q126", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Póló", right: "Leiberl" }, { id: "p2", left: "Nadrág", right: "Hose" }, { id: "p3", left: "Sapka", right: "Haube" }] },
    ],
  },
  {
    id: "al43", title: "Méret és szín", description: "Größe, Farben.", chapter: 5, xpReward: 10,
    questions: [
      { id: "q127", type: "multiple_choice", prompt: "'piros'?", options: [{ id: "o1", text: "rot" }, { id: "o2", text: "rouge" }, { id: "o3", text: "rosso" }], correctOptionId: "o1" },
      { id: "q128", type: "flashcard", prompt: "'méret'?", backText: "Größe", phonetic: "Grősze" },
      { id: "q129", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "fehér", right: "weiß" }, { id: "p2", left: "fekete", right: "schwarz" }, { id: "p3", left: "kék", right: "blau" }] },
    ],
  },
  {
    id: "al44", title: "Trafik", description: "Zeitung, Briefmarke, Lotto.", chapter: 5, xpReward: 15,
    questions: [
      { id: "q130", type: "multiple_choice", prompt: "Mi a 'Trafik'?", options: [{ id: "o1", text: "dohány-/újságbolt" }, { id: "o2", text: "forgalom" }, { id: "o3", text: "benzinkút" }], correctOptionId: "o1" },
      { id: "q131", type: "flashcard", prompt: "'bélyeg'?", backText: "Briefmarke", phonetic: "Brífmarke" },
      { id: "q132", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Újság", right: "Zeitung" }, { id: "p2", left: "Bélyeg", right: "Briefmarke" }, { id: "p3", left: "Jegy (sárga csekk)", right: "Erlagschein" }] },
    ],
  },
  {
    id: "al45", title: "Piac", description: "Markt, Naschmarkt, Standl.", chapter: 5, xpReward: 10,
    questions: [
      { id: "q133", type: "multiple_choice", prompt: "Híres bécsi piac?", options: [{ id: "o1", text: "Naschmarkt" }, { id: "o2", text: "Migros" }, { id: "o3", text: "Borough" }], correctOptionId: "o1" },
      { id: "q134", type: "flashcard", prompt: "'bódé / pult' a piacon?", backText: "Standl", phonetic: "Stándl" },
      { id: "q135", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Piac", right: "Markt" }, { id: "p2", left: "Bódé", right: "Standl" }, { id: "p3", left: "Friss", right: "frisch" }] },
    ],
  },

  // ══ 6. Fejezet: Lakás ═══════════════════════════════
  {
    id: "al46", title: "Bútor", description: "Sessel, Kasten, Kredenz.", chapter: 6, xpReward: 20,
    questions: [
      { id: "q136", type: "multiple_choice", prompt: "'szék'?", options: [{ id: "o1", text: "Sessel" }, { id: "o2", text: "Stuhl" }, { id: "o3", text: "Sedia" }], correctOptionId: "o1" },
      { id: "q137", type: "flashcard", prompt: "'szekrény (ruhának)'?", backText: "Kasten", phonetic: "Kászten" },
      { id: "q138", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Szék", right: "Sessel" }, { id: "p2", left: "Szekrény", right: "Kasten" }, { id: "p3", left: "Fotel", right: "Fauteuil" }] },
    ],
  },
  {
    id: "al47", title: "Szobák", description: "Vorzimmer, Kabinett.", chapter: 6, xpReward: 15,
    questions: [
      { id: "q139", type: "multiple_choice", prompt: "'előszoba'?", options: [{ id: "o1", text: "Vorzimmer" }, { id: "o2", text: "Flur" }, { id: "o3", text: "Korridor" }], correctOptionId: "o1" },
      { id: "q140", type: "flashcard", prompt: "Kis szoba (kamra-szoba)?", backText: "Kabinett", phonetic: "Kabinett" },
      { id: "q141", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Előszoba", right: "Vorzimmer" }, { id: "p2", left: "Nappali", right: "Wohnzimmer" }, { id: "p3", left: "Hálószoba", right: "Schlafzimmer" }] },
    ],
  },
  {
    id: "al48", title: "Konyha", description: "Reindl, Häferl, Pfandl.", chapter: 6, xpReward: 15,
    questions: [
      { id: "q142", type: "multiple_choice", prompt: "'bögre'?", options: [{ id: "o1", text: "Häferl" }, { id: "o2", text: "Tasse" }, { id: "o3", text: "Becher" }], correctOptionId: "o1" },
      { id: "q143", type: "flashcard", prompt: "'lábas / fazék'?", backText: "Reindl", phonetic: "Rájndl" },
      { id: "q144", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Bögre", right: "Häferl" }, { id: "p2", left: "Serpenyő", right: "Pfandl" }, { id: "p3", left: "Edény", right: "Geschirr" }] },
    ],
  },
  {
    id: "al49", title: "Hálószoba", description: "Tuchent, Polster, Leintuch.", chapter: 6, xpReward: 15,
    questions: [
      { id: "q145", type: "multiple_choice", prompt: "'paplan'?", options: [{ id: "o1", text: "Tuchent" }, { id: "o2", text: "Bettdecke" }, { id: "o3", text: "Duvet" }], correctOptionId: "o1" },
      { id: "q146", type: "flashcard", prompt: "'párna'?", backText: "Polster", phonetic: "Polszter" },
      { id: "q147", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Paplan", right: "Tuchent" }, { id: "p2", left: "Párna", right: "Polster" }, { id: "p3", left: "Lepedő", right: "Leintuch" }] },
    ],
  },
  {
    id: "al50", title: "Lépcső és emelet", description: "Stiege, Stock, Parterre.", chapter: 6, xpReward: 15,
    questions: [
      { id: "q148", type: "multiple_choice", prompt: "'lépcső'?", options: [{ id: "o1", text: "Stiege" }, { id: "o2", text: "Treppe" }, { id: "o3", text: "Stäge" }], correctOptionId: "o1" },
      { id: "q149", type: "flashcard", prompt: "'földszint'?", backText: "Parterre / Erdgeschoß", phonetic: "Parter" },
      { id: "q150", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Lépcső", right: "Stiege" }, { id: "p2", left: "Emelet", right: "Stock" }, { id: "p3", left: "Lift", right: "Lift / Aufzug" }] },
    ],
  },
  {
    id: "al51", title: "Fürdő és WC", description: "Häusl, Klo, Bad.", chapter: 6, xpReward: 10,
    questions: [
      { id: "q151", type: "multiple_choice", prompt: "WC szleng (Ausztriában)?", options: [{ id: "o1", text: "Häusl" }, { id: "o2", text: "Hüsli" }, { id: "o3", text: "Bagno" }], correctOptionId: "o1" },
      { id: "q152", type: "flashcard", prompt: "'fürdőszoba'?", backText: "Badezimmer / Bad", phonetic: "Bád" },
      { id: "q153", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "WC", right: "Klo / Häusl" }, { id: "p2", left: "Zuhany", right: "Dusche" }, { id: "p3", left: "Mosdó", right: "Waschbecken" }] },
    ],
  },
  {
    id: "al52", title: "Háztartás", description: "aufräumen, Mistkübel.", chapter: 6, xpReward: 10,
    questions: [
      { id: "q154", type: "multiple_choice", prompt: "'kuka / szemetes'?", options: [{ id: "o1", text: "Mistkübel" }, { id: "o2", text: "Mülleimer" }, { id: "o3", text: "Abfalleimer" }], correctOptionId: "o1" },
      { id: "q155", type: "flashcard", prompt: "'porszívózni'?", backText: "Staub saugen", phonetic: "Staub zaugen" },
      { id: "q156", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Szemét", right: "Mist / Müll" }, { id: "p2", left: "Kuka", right: "Mistkübel" }, { id: "p3", left: "Takarítani", right: "putzen" }] },
    ],
  },
  {
    id: "al53", title: "Lakáskeresés", description: "Miete, Kaution, Ablöse.", chapter: 6, xpReward: 20,
    questions: [
      { id: "q157", type: "multiple_choice", prompt: "Mi az 'Ablöse'?", options: [{ id: "o1", text: "lelépési díj (bútorért/felújításért)" }, { id: "o2", text: "lakbér" }, { id: "o3", text: "kaució" }], correctOptionId: "o1" },
      { id: "q158", type: "flashcard", prompt: "'kaució'?", backText: "Kaution", phonetic: "Kaucijón" },
      { id: "q159", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Lakás", right: "Wohnung" }, { id: "p2", left: "Lakbér", right: "Miete" }, { id: "p3", left: "Kaució", right: "Kaution" }] },
    ],
  },
  {
    id: "al54", title: "Szomszéd", description: "Nachbar, Hausmeister.", chapter: 6, xpReward: 10,
    questions: [
      { id: "q160", type: "multiple_choice", prompt: "'házmester / gondnok'?", options: [{ id: "o1", text: "Hausmeister" }, { id: "o2", text: "Abwart" }, { id: "o3", text: "Portier" }], correctOptionId: "o1" },
      { id: "q161", type: "flashcard", prompt: "'szomszéd'?", backText: "Nachbar", phonetic: "Náhbár" },
      { id: "q162", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Szomszéd", right: "Nachbar" }, { id: "p2", left: "Házmester", right: "Hausmeister" }, { id: "p3", left: "Házirend", right: "Hausordnung" }] },
    ],
  },

  // ══ 7. Fejezet: Munka ═══════════════════════════════
  {
    id: "al55", title: "Dolgozni", description: "hackeln, die Hackn.", chapter: 7, xpReward: 15,
    questions: [
      { id: "q163", type: "multiple_choice", prompt: "'dolgozni' (szleng)?", options: [{ id: "o1", text: "hackeln" }, { id: "o2", text: "schaffen" }, { id: "o3", text: "büffeln" }], correctOptionId: "o1" },
      { id: "q164", type: "flashcard", prompt: "Mit jelent 'die Hackn'?", backText: "a meló / a munka", phonetic: "di Hakn" },
      { id: "q165", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Dolgozni", right: "arbeiten / hackeln" }, { id: "p2", left: "Munka", right: "Arbeit / Hackn" }, { id: "p3", left: "Munkás", right: "Hackler" }] },
    ],
  },
  {
    id: "al56", title: "Munkahely", description: "Chef, Firma, Büro.", chapter: 7, xpReward: 10,
    questions: [
      { id: "q166", type: "multiple_choice", prompt: "'főnök'?", options: [{ id: "o1", text: "Chef" }, { id: "o2", text: "Boss" }, { id: "o3", text: "Capo" }], correctOptionId: "o1" },
      { id: "q167", type: "flashcard", prompt: "'kolléga'?", backText: "Kollege", phonetic: "Kollége" },
      { id: "q168", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Cég", right: "Firma" }, { id: "p2", left: "Iroda", right: "Büro" }, { id: "p3", left: "Főnök", right: "Chef" }] },
    ],
  },
  {
    id: "al57", title: "Szakmák", description: "Maurer, Tischler, Installateur.", chapter: 7, xpReward: 15,
    questions: [
      { id: "q169", type: "multiple_choice", prompt: "'kőműves'?", options: [{ id: "o1", text: "Maurer" }, { id: "o2", text: "Maler" }, { id: "o3", text: "Muratore" }], correctOptionId: "o1" },
      { id: "q170", type: "flashcard", prompt: "'asztalos'?", backText: "Tischler", phonetic: "Tisler" },
      { id: "q171", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Kőműves", right: "Maurer" }, { id: "p2", left: "Vízvezeték-szerelő", right: "Installateur" }, { id: "p3", left: "Festő", right: "Maler" }] },
    ],
  },
  {
    id: "al58", title: "Fizetés", description: "Gehalt, Lohn, Überstunden.", chapter: 7, xpReward: 15,
    questions: [
      { id: "q172", type: "multiple_choice", prompt: "'túlóra'?", options: [{ id: "o1", text: "Überstunden" }, { id: "o2", text: "Mehrzeit" }, { id: "o3", text: "Extrazeit" }], correctOptionId: "o1" },
      { id: "q173", type: "flashcard", prompt: "Havi fizetés (alkalmazotté)?", backText: "Gehalt", phonetic: "Gehalt" },
      { id: "q174", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Bér (órabéres)", right: "Lohn" }, { id: "p2", left: "Fizetés (havi)", right: "Gehalt" }, { id: "p3", left: "Túlóra", right: "Überstunden" }] },
    ],
  },
  {
    id: "al59", title: "Munkaidő", description: "Dienst, Schicht, Feierabend.", chapter: 7, xpReward: 10,
    questions: [
      { id: "q175", type: "multiple_choice", prompt: "'műszak'?", options: [{ id: "o1", text: "Schicht" }, { id: "o2", text: "Runde" }, { id: "o3", text: "Turno" }], correctOptionId: "o1" },
      { id: "q176", type: "flashcard", prompt: "'munkaidő vége / szabadidő'?", backText: "Feierabend", phonetic: "Fájer-ábend" },
      { id: "q177", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Szolgálat", right: "Dienst" }, { id: "p2", left: "Műszak", right: "Schicht" }, { id: "p3", left: "Szünet", right: "Pause" }] },
    ],
  },
  {
    id: "al60", title: "Szabadság, betegség", description: "Urlaub, Krankenstand.", chapter: 7, xpReward: 15,
    questions: [
      { id: "q178", type: "multiple_choice", prompt: "'táppénz / betegszabadság'?", options: [{ id: "o1", text: "Krankenstand" }, { id: "o2", text: "Krankschreibung" }, { id: "o3", text: "Malattia" }], correctOptionId: "o1" },
      { id: "q179", type: "flashcard", prompt: "'szabadság (nyaralás)'?", backText: "Urlaub", phonetic: "Úrlaub" },
      { id: "q180", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Szabadság", right: "Urlaub" }, { id: "p2", left: "Betegszabadság", right: "Krankenstand" }, { id: "p3", left: "Ünnepnap", right: "Feiertag" }] },
    ],
  },
  {
    id: "al61", title: "Álláskeresés", description: "Stelle, Bewerbung, AMS.", chapter: 7, xpReward: 20,
    questions: [
      { id: "q181", type: "multiple_choice", prompt: "Mi az 'AMS'?", options: [{ id: "o1", text: "munkaügyi hivatal (Arbeitsmarktservice)" }, { id: "o2", text: "bank" }, { id: "o3", text: "biztosító" }], correctOptionId: "o1" },
      { id: "q182", type: "flashcard", prompt: "'önéletrajz'?", backText: "Lebenslauf", phonetic: "Lébenz-lauf" },
      { id: "q183", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Állás", right: "Stelle" }, { id: "p2", left: "Pályázat", right: "Bewerbung" }, { id: "p3", left: "Önéletrajz", right: "Lebenslauf" }] },
    ],
  },
  {
    id: "al62", title: "Építkezés", description: "Baustelle, Polier, Schaufel.", chapter: 7, xpReward: 15,
    questions: [
      { id: "q184", type: "multiple_choice", prompt: "'építkezés / építési terület'?", options: [{ id: "o1", text: "Baustelle" }, { id: "o2", text: "Bauplatz" }, { id: "o3", text: "Cantiere" }], correctOptionId: "o1" },
      { id: "q185", type: "flashcard", prompt: "'művezető (építkezésen)'?", backText: "Polier", phonetic: "Polír" },
      { id: "q186", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Lapát", right: "Schaufel" }, { id: "p2", left: "Daru", right: "Kran" }, { id: "p3", left: "Sisak", right: "Helm" }] },
    ],
  },
  {
    id: "al63", title: "Vendéglátás", description: "Kellner, Koch, Stammtisch.", chapter: 7, xpReward: 10,
    questions: [
      { id: "q187", type: "multiple_choice", prompt: "'pincér'?", options: [{ id: "o1", text: "Kellner" }, { id: "o2", text: "Servierer" }, { id: "o3", text: "Cameriere" }], correctOptionId: "o1" },
      { id: "q188", type: "flashcard", prompt: "Törzsasztal a kocsmában?", backText: "Stammtisch", phonetic: "Stamm-tis" },
      { id: "q189", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Pincér", right: "Kellner" }, { id: "p2", left: "Szakács", right: "Koch" }, { id: "p3", left: "Konyha", right: "Küche" }] },
    ],
  },

  // ══ 8. Fejezet: Hivatal ═════════════════════════════
  {
    id: "al64", title: "Bejelentkezés", description: "Meldezettel, anmelden.", chapter: 8, xpReward: 20,
    questions: [
      { id: "q190", type: "multiple_choice", prompt: "Mi a 'Meldezettel'?", options: [{ id: "o1", text: "lakcímbejelentő lap" }, { id: "o2", text: "fizetési felszólítás" }, { id: "o3", text: "menetjegy" }], correctOptionId: "o1" },
      { id: "q191", type: "flashcard", prompt: "'bejelentkezni (lakcímre)'?", backText: "sich anmelden", phonetic: "zih án-melden" },
      { id: "q192", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Lakcímbejelentő", right: "Meldezettel" }, { id: "p2", left: "Bejelentő hivatal", right: "Meldeamt" }, { id: "p3", left: "Bejelentkezni", right: "anmelden" }] },
    ],
  },
  {
    id: "al65", title: "Iratok", description: "Reisepass, e-card, Aufenthaltstitel.", chapter: 8, xpReward: 15,
    questions: [
      { id: "q193", type: "multiple_choice", prompt: "'útlevél'?", options: [{ id: "o1", text: "Reisepass" }, { id: "o2", text: "Ausweis" }, { id: "o3", text: "Passaporto" }], correctOptionId: "o1" },
      { id: "q194", type: "flashcard", prompt: "'tartózkodási engedély'?", backText: "Aufenthaltstitel", phonetic: "Auf-enthaltsz-títel" },
      { id: "q195", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Útlevél", right: "Reisepass" }, { id: "p2", left: "Személyi", right: "Personalausweis" }, { id: "p3", left: "TB-kártya", right: "e-card" }] },
    ],
  },
  {
    id: "al66", title: "Hivatalok", description: "Magistrat, Bezirk, Gemeindeamt.", chapter: 8, xpReward: 15,
    questions: [
      { id: "q196", type: "multiple_choice", prompt: "Bécsi városi hivatal neve?", options: [{ id: "o1", text: "Magistrat" }, { id: "o2", text: "Rathaus-Büro" }, { id: "o3", text: "Comune" }], correctOptionId: "o1" },
      { id: "q197", type: "flashcard", prompt: "'kerület'?", backText: "Bezirk", phonetic: "Becirk" },
      { id: "q198", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Hivatal", right: "Amt" }, { id: "p2", left: "Kerület", right: "Bezirk" }, { id: "p3", left: "Községi hivatal", right: "Gemeindeamt" }] },
    ],
  },
  {
    id: "al67", title: "Adó", description: "Finanzamt, Lohnzettel, Steuer.", chapter: 8, xpReward: 15,
    questions: [
      { id: "q199", type: "multiple_choice", prompt: "'adóhivatal'?", options: [{ id: "o1", text: "Finanzamt" }, { id: "o2", text: "Steueramt" }, { id: "o3", text: "Fisco" }], correctOptionId: "o1" },
      { id: "q200", type: "flashcard", prompt: "'bérjegyzék / fizetési papír'?", backText: "Lohnzettel", phonetic: "Lón-cettl" },
      { id: "q201", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Adó", right: "Steuer" }, { id: "p2", left: "Adóhivatal", right: "Finanzamt" }, { id: "p3", left: "Adóbevallás", right: "Steuererklärung" }] },
    ],
  },
  {
    id: "al68", title: "Biztosítás", description: "Sozialversicherung, ÖGK.", chapter: 8, xpReward: 15,
    questions: [
      { id: "q202", type: "multiple_choice", prompt: "Mi az 'ÖGK'?", options: [{ id: "o1", text: "osztrák egészségbiztosító" }, { id: "o2", text: "vasúttársaság" }, { id: "o3", text: "autóklub" }], correctOptionId: "o1" },
      { id: "q203", type: "flashcard", prompt: "'társadalombiztosítás'?", backText: "Sozialversicherung", phonetic: "Szociál-ferziherung" },
      { id: "q204", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Egészségbiztosító", right: "Krankenkasse / ÖGK" }, { id: "p2", left: "TB-szám", right: "SV-Nummer" }, { id: "p3", left: "TB-kártya", right: "e-card" }] },
    ],
  },
  {
    id: "al69", title: "Bank", description: "Konto, IBAN, Dauerauftrag.", chapter: 8, xpReward: 15,
    questions: [
      { id: "q205", type: "multiple_choice", prompt: "'bankszámlát nyitni'?", options: [{ id: "o1", text: "ein Konto eröffnen" }, { id: "o2", text: "a Konto aufmachen lassen" }, { id: "o3", text: "aprire conto" }], correctOptionId: "o1" },
      { id: "q206", type: "flashcard", prompt: "'állandó átutalási megbízás'?", backText: "Dauerauftrag", phonetic: "Dauer-auftrág" },
      { id: "q207", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Számla", right: "Konto" }, { id: "p2", left: "Átutalás", right: "Überweisung" }, { id: "p3", left: "Sárga csekk", right: "Erlagschein" }] },
    ],
  },
  {
    id: "al70", title: "Integráció", description: "Deutschkurs, ÖIF.", chapter: 8, xpReward: 15,
    questions: [
      { id: "q208", type: "multiple_choice", prompt: "Mi az 'ÖIF'?", options: [{ id: "o1", text: "Osztrák Integrációs Alap" }, { id: "o2", text: "focibajnokság" }, { id: "o3", text: "filmfesztivál" }], correctOptionId: "o1" },
      { id: "q209", type: "flashcard", prompt: "'németkurzus'?", backText: "Deutschkurs", phonetic: "Dojcs-kursz" },
      { id: "q210", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Németkurzus", right: "Deutschkurs" }, { id: "p2", left: "Integrációs vizsga", right: "Integrationsprüfung" }, { id: "p3", left: "Nyelvvizsga", right: "Sprachprüfung" }] },
    ],
  },
  {
    id: "al71", title: "Állampolgárság", description: "Staatsbürgerschaft, Niederlassung.", chapter: 8, xpReward: 20,
    questions: [
      { id: "q211", type: "multiple_choice", prompt: "'állampolgárság'?", options: [{ id: "o1", text: "Staatsbürgerschaft" }, { id: "o2", text: "Bürgerrecht" }, { id: "o3", text: "Cittadinanza" }], correctOptionId: "o1" },
      { id: "q212", type: "flashcard", prompt: "'letelepedés / letelepedési engedély'?", backText: "Niederlassung", phonetic: "Níder-lászung" },
      { id: "q213", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Állampolgárság", right: "Staatsbürgerschaft" }, { id: "p2", left: "Letelepedés", right: "Niederlassung" }, { id: "p3", left: "Honosítás", right: "Einbürgerung" }] },
    ],
  },
  {
    id: "al72", title: "Űrlapok", description: "Antrag, Formular, Unterschrift.", chapter: 8, xpReward: 10,
    questions: [
      { id: "q214", type: "multiple_choice", prompt: "'kérelem / igénylés'?", options: [{ id: "o1", text: "Antrag" }, { id: "o2", text: "Anfrage" }, { id: "o3", text: "Domanda" }], correctOptionId: "o1" },
      { id: "q215", type: "flashcard", prompt: "'aláírás'?", backText: "Unterschrift", phonetic: "Unter-srift" },
      { id: "q216", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Kérelem", right: "Antrag" }, { id: "p2", left: "Űrlap", right: "Formular" }, { id: "p3", left: "Kitölteni", right: "ausfüllen" }] },
    ],
  },

  // ══ 9. Fejezet: Egészség ════════════════════════════
  {
    id: "al73", title: "Orvos", description: "Arzt, Hausarzt, Ordination.", chapter: 9, xpReward: 15,
    questions: [
      { id: "q217", type: "multiple_choice", prompt: "'háziorvos'?", options: [{ id: "o1", text: "Hausarzt" }, { id: "o2", text: "Hausdoktor" }, { id: "o3", text: "Medico" }], correctOptionId: "o1" },
      { id: "q218", type: "flashcard", prompt: "'orvosi rendelő'?", backText: "Ordination / Ordi", phonetic: "Ordináción" },
      { id: "q219", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Orvos", right: "Arzt / Doktor" }, { id: "p2", left: "Rendelő", right: "Ordination" }, { id: "p3", left: "Időpont", right: "Termin" }] },
    ],
  },
  {
    id: "al74", title: "Kórház és mentő", description: "Spital, Rettung, Notarzt.", chapter: 9, xpReward: 20,
    questions: [
      { id: "q220", type: "multiple_choice", prompt: "'kórház' osztrákul?", options: [{ id: "o1", text: "Spital" }, { id: "o2", text: "Krankenhaus" }, { id: "o3", text: "Ospedale" }], correctOptionId: "o1" },
      { id: "q221", type: "flashcard", prompt: "'mentő'?", backText: "Rettung", phonetic: "Rettung" },
      { id: "q222", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Kórház", right: "Spital" }, { id: "p2", left: "Mentő", right: "Rettung" }, { id: "p3", left: "Ügyelet/ambulancia", right: "Ambulanz" }] },
    ],
  },
  {
    id: "al75", title: "Gyógyszertár", description: "Apotheke, Rezept, Medikament.", chapter: 9, xpReward: 15,
    questions: [
      { id: "q223", type: "multiple_choice", prompt: "'gyógyszertár'?", options: [{ id: "o1", text: "Apotheke" }, { id: "o2", text: "Drogerie" }, { id: "o3", text: "Farmacia" }], correctOptionId: "o1" },
      { id: "q224", type: "flashcard", prompt: "'recept (orvosi)'?", backText: "Rezept", phonetic: "Recept" },
      { id: "q225", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Gyógyszertár", right: "Apotheke" }, { id: "p2", left: "Gyógyszer", right: "Medikament" }, { id: "p3", left: "Tabletta", right: "Tablette" }] },
    ],
  },
  {
    id: "al76", title: "Tünetek", description: "Verkühlung, Husten, Fieber.", chapter: 9, xpReward: 15,
    questions: [
      { id: "q226", type: "multiple_choice", prompt: "'megfázás'?", options: [{ id: "o1", text: "Verkühlung" }, { id: "o2", text: "Erkältung" }, { id: "o3", text: "Raffreddore" }], correctOptionId: "o1" },
      { id: "q227", type: "flashcard", prompt: "'láz'?", backText: "Fieber", phonetic: "Fíber" },
      { id: "q228", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Köhögés", right: "Husten" }, { id: "p2", left: "Nátha", right: "Schnupfen" }, { id: "p3", left: "Láz", right: "Fieber" }] },
    ],
  },
  {
    id: "al77", title: "Testrészek", description: "Kopf, Bauch, Fuß, Hand.", chapter: 9, xpReward: 10,
    questions: [
      { id: "q229", type: "multiple_choice", prompt: "'fej'?", options: [{ id: "o1", text: "Kopf" }, { id: "o2", text: "Haupt" }, { id: "o3", text: "Testa" }], correctOptionId: "o1" },
      { id: "q230", type: "flashcard", prompt: "'has'?", backText: "Bauch", phonetic: "Bauh" },
      { id: "q231", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Kéz", right: "Hand" }, { id: "p2", left: "Láb", right: "Fuß" }, { id: "p3", left: "Hát", right: "Rücken" }] },
    ],
  },
  {
    id: "al78", title: "Fájdalom", description: "Bauchweh, Zahnweh, Kopfweh.", chapter: 9, xpReward: 10,
    questions: [
      { id: "q232", type: "multiple_choice", prompt: "'fáj a hasam'?", options: [{ id: "o1", text: "I hab Bauchweh" }, { id: "o2", text: "Mein Bauch tut leid" }, { id: "o3", text: "Mal di pancia" }], correctOptionId: "o1" },
      { id: "q233", type: "flashcard", prompt: "'fejfájás'?", backText: "Kopfweh", phonetic: "Kopf-vé" },
      { id: "q234", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Hasfájás", right: "Bauchweh" }, { id: "p2", left: "Fogfájás", right: "Zahnweh" }, { id: "p3", left: "Fáj", right: "tut weh" }] },
    ],
  },
  {
    id: "al79", title: "Vészhelyzet", description: "Rettung 144, Notruf.", chapter: 9, xpReward: 20,
    questions: [
      { id: "q235", type: "multiple_choice", prompt: "A mentő hívószáma Ausztriában?", options: [{ id: "o1", text: "144" }, { id: "o2", text: "112" }, { id: "o3", text: "911" }], correctOptionId: "o1" },
      { id: "q236", type: "flashcard", prompt: "'Segítség!'", backText: "Hilfe!", phonetic: "Hilfe" },
      { id: "q237", type: "match", prompt: "Párosítsd a hívószámokat!", pairs: [{ id: "p1", left: "Mentő", right: "144" }, { id: "p2", left: "Rendőrség", right: "133" }, { id: "p3", left: "Tűzoltóság", right: "122" }] },
    ],
  },
  {
    id: "al80", title: "Fogorvos", description: "Zahnarzt, Plombe.", chapter: 9, xpReward: 10,
    questions: [
      { id: "q238", type: "multiple_choice", prompt: "'fogorvos'?", options: [{ id: "o1", text: "Zahnarzt" }, { id: "o2", text: "Mundarzt" }, { id: "o3", text: "Dentista" }], correctOptionId: "o1" },
      { id: "q239", type: "flashcard", prompt: "'tömés'?", backText: "Plombe", phonetic: "Plombe" },
      { id: "q240", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Fog", right: "Zahn" }, { id: "p2", left: "Fogorvos", right: "Zahnarzt" }, { id: "p3", left: "Fogfájás", right: "Zahnweh" }] },
    ],
  },
  {
    id: "al81", title: "e-card", description: "e-card, Krankenstand.", chapter: 9, xpReward: 10,
    questions: [
      { id: "q241", type: "multiple_choice", prompt: "Mi az 'e-card'?", options: [{ id: "o1", text: "TB-kártya (e-card)" }, { id: "o2", text: "bankkártya" }, { id: "o3", text: "diákigazolvány" }], correctOptionId: "o1" },
      { id: "q242", type: "flashcard", prompt: "'beteget jelenteni / táppénz'?", backText: "in den Krankenstand gehen", phonetic: "Kranken-stand" },
      { id: "q243", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "TB-kártya", right: "e-card" }, { id: "p2", left: "Igazolás", right: "Bestätigung" }, { id: "p3", left: "Beutaló", right: "Überweisung" }] },
    ],
  },

  // ══ 10. Fejezet: Közlekedés ═════════════════════════
  {
    id: "al82", title: "Tömegközlekedés", description: "Öffis, U-Bahn, Bim.", chapter: 10, xpReward: 15,
    questions: [
      { id: "q244", type: "multiple_choice", prompt: "Villamos bécsi szleng-neve?", options: [{ id: "o1", text: "Bim" }, { id: "o2", text: "Tram" }, { id: "o3", text: "Tramvaj" }], correctOptionId: "o1" },
      { id: "q245", type: "flashcard", prompt: "Tömegközlekedés (köznyelvi gyűjtőszó)?", backText: "Öffis", phonetic: "Öffisz" },
      { id: "q246", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Metró", right: "U-Bahn" }, { id: "p2", left: "Villamos", right: "Bim / Straßenbahn" }, { id: "p3", left: "Busz", right: "Bus / Autobus" }] },
    ],
  },
  {
    id: "al83", title: "Vasút", description: "ÖBB, Bahnhof, Gleis.", chapter: 10, xpReward: 15,
    questions: [
      { id: "q247", type: "multiple_choice", prompt: "Az osztrák vasút neve?", options: [{ id: "o1", text: "ÖBB" }, { id: "o2", text: "SBB" }, { id: "o3", text: "MÁV" }], correctOptionId: "o1" },
      { id: "q248", type: "flashcard", prompt: "'vágány'?", backText: "Gleis", phonetic: "Glájsz" },
      { id: "q249", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Pályaudvar", right: "Bahnhof" }, { id: "p2", left: "Peron", right: "Bahnsteig" }, { id: "p3", left: "Vonat", right: "Zug" }] },
    ],
  },
  {
    id: "al84", title: "Jegy", description: "Fahrkarte, Klimaticket, entwerten.", chapter: 10, xpReward: 15,
    questions: [
      { id: "q250", type: "multiple_choice", prompt: "Országos bérlet neve?", options: [{ id: "o1", text: "Klimaticket" }, { id: "o2", text: "GA" }, { id: "o3", text: "Interrail" }], correctOptionId: "o1" },
      { id: "q251", type: "flashcard", prompt: "'jegyet érvényesíteni / lyukasztani'?", backText: "entwerten / stempeln", phonetic: "ent-vérten" },
      { id: "q252", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Jegy", right: "Fahrkarte / Ticket" }, { id: "p2", left: "Bérlet (éves)", right: "Jahreskarte" }, { id: "p3", left: "Ellenőr", right: "Kontrolor / Schaffner" }] },
    ],
  },
  {
    id: "al85", title: "Irányok", description: "links, rechts, Sackgasse.", chapter: 10, xpReward: 10,
    questions: [
      { id: "q253", type: "multiple_choice", prompt: "'balra'?", options: [{ id: "o1", text: "links" }, { id: "o2", text: "rechts" }, { id: "o3", text: "sinistra" }], correctOptionId: "o1" },
      { id: "q254", type: "flashcard", prompt: "'zsákutca'?", backText: "Sackgasse", phonetic: "Zák-gásze" },
      { id: "q255", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Balra", right: "links" }, { id: "p2", left: "Jobbra", right: "rechts" }, { id: "p3", left: "Egyenesen", right: "geradeaus" }] },
    ],
  },
  {
    id: "al86", title: "Autó", description: "Pickerl, Autobahn, tanken.", chapter: 10, xpReward: 20,
    questions: [
      { id: "q256", type: "multiple_choice", prompt: "Mi a 'Pickerl' (az autón)?", options: [{ id: "o1", text: "autópálya-matrica / műszaki matrica" }, { id: "o2", text: "rendszám" }, { id: "o3", text: "kormány" }], correctOptionId: "o1" },
      { id: "q257", type: "flashcard", prompt: "'tankolni'?", backText: "tanken", phonetic: "tánken" },
      { id: "q258", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Autópálya", right: "Autobahn" }, { id: "p2", left: "Matrica", right: "Pickerl / Vignette" }, { id: "p3", left: "Benzinkút", right: "Tankstelle" }] },
    ],
  },
  {
    id: "al87", title: "Parkolás", description: "Kurzparkzone, Parkpickerl.", chapter: 10, xpReward: 15,
    questions: [
      { id: "q259", type: "multiple_choice", prompt: "Mi a 'Kurzparkzone'?", options: [{ id: "o1", text: "rövid idejű (fizetős) parkolási zóna" }, { id: "o2", text: "ingyenes parkoló" }, { id: "o3", text: "garázs" }], correctOptionId: "o1" },
      { id: "q260", type: "flashcard", prompt: "Lakossági parkoló-engedély?", backText: "Parkpickerl", phonetic: "Park-pikerl" },
      { id: "q261", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Parkolójegy (papír)", right: "Parkschein" }, { id: "p2", left: "Parkoló-engedély", right: "Parkpickerl" }, { id: "p3", left: "Büntetés", right: "Strafe" }] },
    ],
  },
  {
    id: "al88", title: "Gyalog", description: "Gehsteig, Zebrastreifen, Ampel.", chapter: 10, xpReward: 10,
    questions: [
      { id: "q262", type: "multiple_choice", prompt: "'járda'?", options: [{ id: "o1", text: "Gehsteig" }, { id: "o2", text: "Trottoir" }, { id: "o3", text: "Marciapiede" }], correctOptionId: "o1" },
      { id: "q263", type: "flashcard", prompt: "'jelzőlámpa'?", backText: "Ampel", phonetic: "Ámpel" },
      { id: "q264", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Járda", right: "Gehsteig" }, { id: "p2", left: "Zebra", right: "Zebrastreifen" }, { id: "p3", left: "Kereszteződés", right: "Kreuzung" }] },
    ],
  },
  {
    id: "al89", title: "Taxi", description: "Taxi, Funktaxi.", chapter: 10, xpReward: 10,
    questions: [
      { id: "q265", type: "multiple_choice", prompt: "'Hívna egy taxit?'", options: [{ id: "o1", text: "Können S' a Taxi rufen?" }, { id: "o2", text: "Mach a Taxi!" }, { id: "o3", text: "Chiama un taxi!" }], correctOptionId: "o1" },
      { id: "q266", type: "flashcard", prompt: "'Hova megy?' (sofőr kérdése)?", backText: "Wohin geht's?", phonetic: "Vohin gécc" },
      { id: "q267", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Taxi", right: "Taxi" }, { id: "p2", left: "Cím", right: "Adresse" }, { id: "p3", left: "Itt jó lesz", right: "Da passt's" }] },
    ],
  },
  {
    id: "al90", title: "Útközben", description: "Stau, Umleitung, Baustelle.", chapter: 10, xpReward: 10,
    questions: [
      { id: "q268", type: "multiple_choice", prompt: "'forgalmi dugó'?", options: [{ id: "o1", text: "Stau" }, { id: "o2", text: "Verkehr" }, { id: "o3", text: "Coda" }], correctOptionId: "o1" },
      { id: "q269", type: "flashcard", prompt: "'terelőút'?", backText: "Umleitung", phonetic: "Um-lájtung" },
      { id: "q270", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Dugó", right: "Stau" }, { id: "p2", left: "Terelés", right: "Umleitung" }, { id: "p3", left: "Útépítés", right: "Baustelle" }] },
    ],
  },

  // ══ 11. Fejezet: Szabadidő ══════════════════════════
  {
    id: "al91", title: "Sport", description: "Schi fahren, Rodeln, Wandern.", chapter: 11, xpReward: 15,
    questions: [
      { id: "q271", type: "multiple_choice", prompt: "'síelni' osztrák írásmód?", options: [{ id: "o1", text: "Schi fahren" }, { id: "o2", text: "Ski laufen" }, { id: "o3", text: "Sciare" }], correctOptionId: "o1" },
      { id: "q272", type: "flashcard", prompt: "'túrázni / kirándulni'?", backText: "wandern", phonetic: "vándern" },
      { id: "q273", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Síelés", right: "Schi fahren" }, { id: "p2", left: "Szánkózás", right: "Rodeln" }, { id: "p3", left: "Foci", right: "Fußball" }] },
    ],
  },
  {
    id: "al92", title: "Hegyek", description: "Berg, Alm, Hütte.", chapter: 11, xpReward: 10,
    questions: [
      { id: "q274", type: "multiple_choice", prompt: "Havasi legelő/menedék?", options: [{ id: "o1", text: "Alm" }, { id: "o2", text: "Wiese" }, { id: "o3", text: "Alpe" }], correctOptionId: "o1" },
      { id: "q275", type: "flashcard", prompt: "'csúcs'?", backText: "Gipfel", phonetic: "Gipfel" },
      { id: "q276", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Hegy", right: "Berg" }, { id: "p2", left: "Menedékház", right: "Hütte" }, { id: "p3", left: "Tó", right: "See" }] },
    ],
  },
  {
    id: "al93", title: "Kultúra", description: "Theater, Oper, Kino.", chapter: 11, xpReward: 10,
    questions: [
      { id: "q277", type: "multiple_choice", prompt: "'mozi'?", options: [{ id: "o1", text: "Kino" }, { id: "o2", text: "Lichtspiel" }, { id: "o3", text: "Cinema" }], correctOptionId: "o1" },
      { id: "q278", type: "flashcard", prompt: "'színház'?", backText: "Theater", phonetic: "Teáter" },
      { id: "q279", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Opera", right: "Oper" }, { id: "p2", left: "Múzeum", right: "Museum" }, { id: "p3", left: "Hangverseny", right: "Konzert" }] },
    ],
  },
  {
    id: "al94", title: "Bécs", description: "Prater, Riesenrad, Schönbrunn.", chapter: 11, xpReward: 15,
    questions: [
      { id: "q280", type: "multiple_choice", prompt: "A bécsi óriáskerék neve?", options: [{ id: "o1", text: "Riesenrad" }, { id: "o2", text: "Karussell" }, { id: "o3", text: "Ruota" }], correctOptionId: "o1" },
      { id: "q281", type: "flashcard", prompt: "Bécsi vidámpark/liget?", backText: "Prater", phonetic: "Práter" },
      { id: "q282", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Óriáskerék", right: "Riesenrad" }, { id: "p2", left: "Dóm", right: "Stephansdom" }, { id: "p3", left: "Kastély", right: "Schönbrunn" }] },
    ],
  },
  {
    id: "al95", title: "Este", description: "fortgehen, Beisl, Lokal.", chapter: 11, xpReward: 10,
    questions: [
      { id: "q283", type: "multiple_choice", prompt: "'bulizni menni / szórakozni'?", options: [{ id: "o1", text: "fortgehen" }, { id: "o2", text: "ausgehen lassen" }, { id: "o3", text: "uscire" }], correctOptionId: "o1" },
      { id: "q284", type: "flashcard", prompt: "'szórakozóhely / lokál'?", backText: "Lokal", phonetic: "Lokál" },
      { id: "q285", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Elmenni bulizni", right: "fortgehen" }, { id: "p2", left: "Kocsma", right: "Beisl" }, { id: "p3", left: "Diszkó", right: "Disco / Club" }] },
    ],
  },
  {
    id: "al96", title: "Játékok", description: "Schnapsen, Tarock, Wuzzler.", chapter: 11, xpReward: 15,
    questions: [
      { id: "q286", type: "multiple_choice", prompt: "Csocsó osztrák neve?", options: [{ id: "o1", text: "Wuzzler" }, { id: "o2", text: "Töggeli" }, { id: "o3", text: "Calcetto" }], correctOptionId: "o1" },
      { id: "q287", type: "flashcard", prompt: "Népszerű osztrák kártyajáték?", backText: "Schnapsen", phonetic: "Snapszen" },
      { id: "q288", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Csocsó", right: "Wuzzler" }, { id: "p2", left: "Kártyajáték", right: "Schnapsen / Tarock" }, { id: "p3", left: "Sakk", right: "Schach" }] },
    ],
  },
  {
    id: "al97", title: "Ünneplés", description: "Fasching, Silvester, Maibaum.", chapter: 11, xpReward: 10,
    questions: [
      { id: "q289", type: "multiple_choice", prompt: "Mi a 'Maibaum'?", options: [{ id: "o1", text: "májusfa" }, { id: "o2", text: "karácsonyfa" }, { id: "o3", text: "húsvéti tojás" }], correctOptionId: "o1" },
      { id: "q290", type: "flashcard", prompt: "'tűzijáték'?", backText: "Feuerwerk", phonetic: "Fojer-verk" },
      { id: "q291", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Farsang", right: "Fasching" }, { id: "p2", left: "Szilveszter", right: "Silvester" }, { id: "p3", left: "Májusfa", right: "Maibaum" }] },
    ],
  },

  // ══ 12. Fejezet: Társalgás és szleng ════════════════
  {
    id: "al98", title: "Bécsi szleng", description: "Schmäh, Hawara, Tschick.", chapter: 12, xpReward: 20,
    questions: [
      { id: "q292", type: "multiple_choice", prompt: "Mi a 'Schmäh'?", options: [{ id: "o1", text: "bécsi humor / sármos duma" }, { id: "o2", text: "fájdalom" }, { id: "o3", text: "vihar" }], correctOptionId: "o1" },
      { id: "q293", type: "flashcard", prompt: "'haver / cimbora'?", backText: "Hawara / Haberer", phonetic: "Havara" },
      { id: "q294", type: "match", prompt: "Párosítsd a szleng-szavakat!", pairs: [{ id: "p1", left: "Cigi", right: "Tschick" }, { id: "p2", left: "Haver", right: "Hawara" }, { id: "p3", left: "Öregem / haver (megszólítás)", right: "Oida" }] },
    ],
  },
  {
    id: "al99", title: "Hangulat", description: "leiwand, deppert, fad, grantig.", chapter: 12, xpReward: 20,
    questions: [
      { id: "q295", type: "multiple_choice", prompt: "'szuper / menő'?", options: [{ id: "o1", text: "leiwand" }, { id: "o2", text: "geil" }, { id: "o3", text: "fico" }], correctOptionId: "o1" },
      { id: "q296", type: "flashcard", prompt: "Mit jelent 'fad'?", backText: "unalmas", phonetic: "fád" },
      { id: "q297", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Szuper", right: "leiwand" }, { id: "p2", left: "Buta", right: "deppert" }, { id: "p3", left: "Mogorva", right: "grantig" }, { id: "p4", left: "Unalmas", right: "fad" }] },
    ],
  },
  {
    id: "al100", title: "Tipikus mondatok", description: "Passt scho, Geh bitte, Eh.", chapter: 12, xpReward: 25,
    questions: [
      { id: "q298", type: "multiple_choice", prompt: "Mit jelent 'Passt scho'?", options: [{ id: "o1", text: "rendben van / hagyjuk" }, { id: "o2", text: "nem érdekel" }, { id: "o3", text: "siess" }], correctOptionId: "o1" },
      { id: "q299", type: "flashcard", prompt: "Mit jelent 'Des geht si aus'?", backText: "ez kijön / belefér (időben/pénzben)", phonetic: "Desz gét szi ausz" },
      { id: "q300", type: "match", prompt: "Párosítsd a tipikus mondatokat!", pairs: [{ id: "p1", left: "Rendben van", right: "Passt scho" }, { id: "p2", left: "Ugyan már!", right: "Geh bitte!" }, { id: "p3", left: "Persze / amúgy is", right: "Eh" }] },
    ],
  },
];
