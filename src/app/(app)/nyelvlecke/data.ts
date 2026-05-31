export type QuestionType = "multiple_choice" | "flashcard" | "match";

export type Option = {
  id: string;
  text: string;
};

export type MatchPair = {
  id: string;
  left: string; // Hungarian
  right: string; // Swiss German
};

export type Question = {
  id: string;
  type: QuestionType;
  prompt: string;
  // Multiple Choice
  options?: Option[];
  correctOptionId?: string;
  // Flashcard
  backText?: string;
  phonetic?: string;
  // Match
  pairs?: MatchPair[];
};

export type Lesson = {
  id: string;
  title: string;
  description: string;
  chapter: number;
  xpReward: number;
  questions: Question[];
};

export const LESSONS: Lesson[] = [
  // ── 1. Fejezet: Alapok ──────────────────────────────
  {
    id: "l1",
    title: "1. Lecke: Alapvető köszönések",
    description: "Tanuld meg, hogyan kell helyesen köszönni Svájcban!",
    chapter: 1,
    xpReward: 10,
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        prompt: "Hogy mondják hivatalosan: 'Jó napot' (egy személynek)?",
        options: [
          { id: "o1", text: "Guten Tag" },
          { id: "o2", text: "Grüezi" },
          { id: "o3", text: "Hoi" },
        ],
        correctOptionId: "o2",
      },
      {
        id: "q2",
        type: "flashcard",
        prompt: "Hogyan köszönsz több embernek hivatalosan?",
        backText: "Grüezi mitenand",
        phonetic: "Grüeci mitenand",
      },
      {
        id: "q3",
        type: "match",
        prompt: "Párosítsd a kifejezéseket!",
        pairs: [
          { id: "p1", left: "Szia (1 fő)", right: "Hoi / Sali" },
          { id: "p2", left: "Sziasztok (több fő)", right: "Hoi zäme" },
          { id: "p3", left: "Viszlát (informális)", right: "Tschüss" },
        ],
      },
    ],
  },
  {
    id: "l2",
    title: "2. Lecke: A munkahelyen (Uf dr Baustelle)",
    description: "Fontos kifejezések, ha svájci munkatársakkal beszélsz.",
    chapter: 1,
    xpReward: 15,
    questions: [
      {
        id: "q4",
        type: "multiple_choice",
        prompt: "Hogy mondják: 'Dolgozom'?",
        options: [
          { id: "o1", text: "Ich schaffe" },
          { id: "o2", text: "Ich arbeite" },
          { id: "o3", text: "Ich macha" },
        ],
        correctOptionId: "o1",
      },
      {
        id: "q5",
        type: "flashcard",
        prompt: "Ebédidő",
        backText: "Mittagspause / Zmittag",
        phonetic: "Cmitag",
      },
      {
        id: "q6",
        type: "multiple_choice",
        prompt: "Hogy mondják: 'Készen vagyunk / Végeztünk'?",
        options: [
          { id: "o1", text: "Mer sind fertig" },
          { id: "o2", text: "Mir händ Fiirabig" },
          { id: "o3", text: "Beide jók" },
        ],
        correctOptionId: "o3",
      },
    ],
  },

  // ── 2. Fejezet: Bevásárlás és Étterem ────────────────
  {
    id: "l3",
    title: "3. Lecke: A pékségben / Étteremben",
    description: "Hogyan rendelj kávét és péksütit úgy, mint egy igazi helyi.",
    chapter: 2,
    xpReward: 15,
    questions: [
      {
        id: "q7",
        type: "multiple_choice",
        prompt: "Kérek szépen egy kávét!",
        options: [
          { id: "o1", text: "Ich ha gern es Kafi." },
          { id: "o2", text: "Ich brauche ein Kaffee." },
          { id: "o3", text: "Kafi bitte." },
        ],
        correctOptionId: "o1",
      },
      {
        id: "q8",
        type: "flashcard",
        prompt: "Vajaskifli (svájci specialitás)",
        backText: "Gipfeli",
        phonetic: "Gipfeli",
      },
      {
        id: "q9",
        type: "match",
        prompt: "Párosítsd az ételeket/italokat!",
        pairs: [
          { id: "p1", left: "Kávé", right: "Kafi" },
          { id: "p2", left: "Sör", right: "Bier (es Bier)" },
          { id: "p3", left: "Víz", right: "Wasser" },
          { id: "p4", left: "Fizetni szeretnék", right: "Ich wet zahle" },
        ],
      },
    ],
  },
  {
    id: "l4",
    title: "4. Lecke: A Migrosban",
    description: "Alapvető kifejezések a kasszánál.",
    chapter: 2,
    xpReward: 20,
    questions: [
      {
        id: "q10",
        type: "flashcard",
        prompt: "Bevásárlószatyor (Nylon zacskó)",
        backText: "Säckli",
        phonetic: "Szekli",
      },
      {
        id: "q11",
        type: "multiple_choice",
        prompt: "Mit kérdez a pénztáros, amikor a blokkot akarja odaadni?",
        options: [
          { id: "o1", text: "Wollen Sie den Kassenzettel?" },
          { id: "o2", text: "Quittig?" },
          { id: "o3", text: "Zettelchen?" },
        ],
        correctOptionId: "o2",
      },
      {
        id: "q12",
        type: "multiple_choice",
        prompt: "Hogyan köszönöd meg a visszajárót?",
        options: [
          { id: "o1", text: "Danke vielmal" },
          { id: "o2", text: "Merci vilmal" },
          { id: "o3", text: "Mindkettő tökéletes" },
        ],
        correctOptionId: "o3",
      },
    ]
  },

  // ── 3. Fejezet: Hétköznapi Élet ────────────────────
  {
    id: "l5",
    title: "5. Lecke: Pénz és Számok",
    description: "Fizetés és árak Svájcban.",
    chapter: 3,
    xpReward: 20,
    questions: [
      {
        id: "q13",
        type: "match",
        prompt: "Párosítsd a számokat!",
        pairs: [
          { id: "p1", left: "Egy", right: "Eins" },
          { id: "p2", left: "Kettő", right: "Zwei" },
          { id: "p3", left: "Három", right: "Drü" },
          { id: "p4", left: "Négy", right: "Vier" },
        ],
      },
      {
        id: "q14",
        type: "flashcard",
        prompt: "Mennyibe kerül?",
        backText: "Was choschtet das?",
        phonetic: "Vasz khostet dasz?",
      },
      {
        id: "q15",
        type: "multiple_choice",
        prompt: "Hogy mondják a frankot a szlengben?",
        options: [
          { id: "o1", text: "Stutz" },
          { id: "o2", text: "Geld" },
          { id: "o3", text: "Kröten" },
        ],
        correctOptionId: "o1",
      },
    ]
  },
  {
    id: "l6",
    title: "6. Lecke: A szomszédok (Nachbare)",
    description: "Hogyan legyél jó viszonyban a svájci szomszédokkal.",
    chapter: 3,
    xpReward: 20,
    questions: [
      {
        id: "q16",
        type: "flashcard",
        prompt: "Mosókonyha (közös mosóhelyiség)",
        backText: "Wöschchuchi",
        phonetic: "Vöskhukhi",
      },
      {
        id: "q17",
        type: "multiple_choice",
        prompt: "Hogy mondjuk, hogy 'Elnézést!'?",
        options: [
          { id: "o1", text: "Entschuldigung" },
          { id: "o2", text: "Exgüse" },
          { id: "o3", text: "Pardon" },
        ],
        correctOptionId: "o2",
      },
      {
        id: "q18",
        type: "match",
        prompt: "Házirend kifejezések",
        pairs: [
          { id: "p1", left: "Lépcsőház", right: "Stägehuus" },
          { id: "p2", left: "Biciklitároló", right: "Velochäller" },
          { id: "p3", left: "Szemét", right: "Abfall" },
        ]
      }
    ]
  },

  // ── 4. Fejezet: Közlekedés ────────────────────
  {
    id: "l7",
    title: "7. Lecke: Vonaton (SBB)",
    description: "Közlekedj Svájcban problémamentesen.",
    chapter: 4,
    xpReward: 25,
    questions: [
      {
        id: "q19",
        type: "multiple_choice",
        prompt: "Hogy mondják: 'Jegyeket, kérem!'?",
        options: [
          { id: "o1", text: "Billet bitte!" },
          { id: "o2", text: "Fahrkarte bitte!" },
          { id: "o3", text: "Ticket bitte!" },
        ],
        correctOptionId: "o1",
      },
      {
        id: "q20",
        type: "flashcard",
        prompt: "Bicikli (Kerékpár)",
        backText: "Velo",
        phonetic: "Velo",
      },
      {
        id: "q21",
        type: "match",
        prompt: "Közlekedési eszközök",
        pairs: [
          { id: "p1", left: "Villamos", right: "Tram" },
          { id: "p2", left: "Vonat", right: "Zug" },
          { id: "p3", left: "Autó", right: "Auto" },
          { id: "p4", left: "Pályaudvar", right: "Bahnhof" },
        ]
      }
    ]
  },
  // ── 5. Fejezet: Hivatal és Ügyintézés ────────────────────
  {
    id: "l8",
    title: "8. Lecke: A Kreisbüroban",
    description: "Kifejezések az önkormányzati ügyintézéshez.",
    chapter: 5,
    xpReward: 30,
    questions: [
      {
        id: "q22",
        type: "multiple_choice",
        prompt: "Mit kérdez az ügyintéző, amikor megkérdezi, hol laksz?",
        options: [
          { id: "o1", text: "Wo wohne Sie?" },
          { id: "o2", text: "Wo lebsch?" },
          { id: "o3", text: "Wo isch dis Huus?" },
        ],
        correctOptionId: "o1",
      },
      {
        id: "q23",
        type: "flashcard",
        prompt: "Személyi igazolvány",
        backText: "ID (Identitätscharte)",
        phonetic: "Ídé",
      },
      {
        id: "q24",
        type: "match",
        prompt: "Párosítsd a hivatali szavakat!",
        pairs: [
          { id: "p1", left: "Lakcím", right: "Adrässe" },
          { id: "p2", left: "Tartózkodási engedély", right: "Uuswiis" },
          { id: "p3", left: "Aláírás", right: "Underschrift" },
        ]
      }
    ]
  },
  {
    id: "l9",
    title: "9. Lecke: A postán (Uf de Poscht)",
    description: "Csomagok és levelek feladása Svájcban.",
    chapter: 5,
    xpReward: 30,
    questions: [
      {
        id: "q25",
        type: "flashcard",
        prompt: "Egy csomagot szeretnék feladni.",
        backText: "Ich wet es Päckli ufgäh.",
        phonetic: "Ich vet esz pekli uf-ge.",
      },
      {
        id: "q26",
        type: "multiple_choice",
        prompt: "Hogy mondják a 'postás' szót?",
        options: [
          { id: "o1", text: "Pösteler" },
          { id: "o2", text: "Briefträger" },
          { id: "o3", text: "Postmann" },
        ],
        correctOptionId: "o1",
      },
      {
        id: "q27",
        type: "multiple_choice",
        prompt: "A-Post vagy B-Post? Melyik a gyorsabb?",
        options: [
          { id: "o1", text: "A-Post (elsőbbségi)" },
          { id: "o2", text: "B-Post (sima)" },
        ],
        correctOptionId: "o1",
      }
    ]
  },

  // ── 6. Fejezet: Barátkozás ────────────────────
  {
    id: "l10",
    title: "10. Lecke: Füürobebier (Munka utáni sör)",
    description: "Lazítás és szocializáció a kollégákkal.",
    chapter: 6,
    xpReward: 50,
    questions: [
      {
        id: "q28",
        type: "multiple_choice",
        prompt: "Hogyan hívod meg a munkatársadat egy sörre munka után?",
        options: [
          { id: "o1", text: "Chömed mir es Bier go trinke?" },
          { id: "o2", text: "Trinke mer eis?" },
          { id: "o3", text: "Mindkettő tökéletes!" },
        ],
        correctOptionId: "o3",
      },
      {
        id: "q29",
        type: "flashcard",
        prompt: "Egészségedre! (Koccintáskor)",
        backText: "Proscht! / Zum Wohl!",
        phonetic: "Prost!",
      },
      {
        id: "q30",
        type: "match",
        prompt: "Kifejezések az estére",
        pairs: [
          { id: "p1", left: "Finom volt", right: "Es isch fein gsii" },
          { id: "p2", left: "Nagyon jó", right: "Tiptop / Super" },
          { id: "p3", left: "Nincs probléma", right: "Kes Problem" },
          { id: "p4", left: "Meghívhatlak?", right: "Darf ich dii iilade?" },
        ]
      }
    ]
  },

  // ── 7. Fejezet: Időjárás és Természet ────────────────────
  {
    id: "l11",
    title: "11. Lecke: Időjárás (Wätter)",
    description: "Beszélgessünk az időjárásról Svájcban.",
    chapter: 7,
    xpReward: 30,
    questions: [
      {
        id: "q31",
        type: "multiple_choice",
        prompt: "Hogy mondják: 'Süt a nap'?",
        options: [
          { id: "o1", text: "D Sunne schiint" },
          { id: "o2", text: "Die Sonne scheint" },
          { id: "o3", text: "Es isch Sunne" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q32",
        type: "flashcard",
        prompt: "Esik az eső",
        backText: "Es rägnet",
        phonetic: "Esz regnet",
      },
      {
        id: "q33",
        type: "match",
        prompt: "Párosítsd az időjárási szavakat!",
        pairs: [
          { id: "p1", left: "Hó", right: "Schnee" },
          { id: "p2", left: "Szél", right: "Wind" },
          { id: "p3", left: "Hideg van", right: "Es isch chalt" },
          { id: "p4", left: "Meleg van", right: "Es isch heiss" },
        ]
      }
    ]
  },
  {
    id: "l12",
    title: "12. Lecke: Túrázás (Wandere)",
    description: "A svájciak kedvenc hétvégi programja.",
    chapter: 7,
    xpReward: 35,
    questions: [
      {
        id: "q34",
        type: "flashcard",
        prompt: "Hegyek",
        backText: "Bärge",
        phonetic: "Berge",
      },
      {
        id: "q35",
        type: "multiple_choice",
        prompt: "Hogy hívják a tipikus svájci hátizsákot?",
        options: [
          { id: "o1", text: "Rucksack" },
          { id: "o2", text: "Täsche" },
          { id: "o3", text: "Sack" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q36",
        type: "match",
        prompt: "Túra kifejezések",
        pairs: [
          { id: "p1", left: "Túraútvonal", right: "Wanderwäg" },
          { id: "p2", left: "Kábelvasút", right: "Seilbahn" },
          { id: "p3", left: "Erdő", right: "Wald" },
        ]
      }
    ]
  },

  // ── 8. Fejezet: Otthon és Lakás ────────────────────
  {
    id: "l13",
    title: "13. Lecke: Lakáskeresés",
    description: "Kifejezések, ha lakást bérelsz (Wohnungssuche).",
    chapter: 8,
    xpReward: 40,
    questions: [
      {
        id: "q37",
        type: "flashcard",
        prompt: "Lakbér",
        backText: "Mieti",
        phonetic: "Míeti",
      },
      {
        id: "q38",
        type: "multiple_choice",
        prompt: "Hogy mondják a 'Szoba' szót?",
        options: [
          { id: "o1", text: "Zimmer" },
          { id: "o2", text: "Chammere" },
          { id: "o3", text: "Stube" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q39",
        type: "match",
        prompt: "Lakás részei",
        pairs: [
          { id: "p1", left: "Konyha", right: "Chuchi" },
          { id: "p2", left: "Nappali", right: "Stube" },
          { id: "p3", left: "Erkély", right: "Balkon" },
        ]
      }
    ]
  },
  {
    id: "l14",
    title: "14. Lecke: A ház körül",
    description: "Mindennapi dolgok a lakásban.",
    chapter: 8,
    xpReward: 40,
    questions: [
      {
        id: "q40",
        type: "flashcard",
        prompt: "Szemetes",
        backText: "Chübel",
        phonetic: "Khibel",
      },
      {
        id: "q41",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Fäster' szó?",
        options: [
          { id: "o1", text: "Ablak" },
          { id: "o2", text: "Ajtó" },
          { id: "o3", text: "Szőnyeg" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q42",
        type: "match",
        prompt: "Tárgyak a házban",
        pairs: [
          { id: "p1", left: "Ajtó", right: "Türe" },
          { id: "p2", left: "Ágy", right: "Bett" },
          { id: "p3", left: "Asztal", right: "Tisch" },
          { id: "p4", left: "Szék", right: "Stuehl" },
        ]
      }
    ]
  },

  // ── 9. Fejezet: Egészség és Orvos ────────────────────
  {
    id: "l15",
    title: "15. Lecke: Betegség",
    description: "Ha nem érzed jól magad.",
    chapter: 9,
    xpReward: 45,
    questions: [
      {
        id: "q43",
        type: "multiple_choice",
        prompt: "Hogy mondod, hogy 'Beteg vagyok'?",
        options: [
          { id: "o1", text: "Ich bi chrank" },
          { id: "o2", text: "Ich bin krank" },
          { id: "o3", text: "Ich ha weh" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q44",
        type: "flashcard",
        prompt: "Fáj a fejem",
        backText: "Ich ha Chopfweh",
        phonetic: "Ich ha khopfvé",
      },
      {
        id: "q45",
        type: "match",
        prompt: "Tünetek",
        pairs: [
          { id: "p1", left: "Fájdalom", right: "Schmärze" },
          { id: "p2", left: "Láz", right: "Fieber" },
          { id: "p3", left: "Köhögés", right: "Hueschte" },
        ]
      }
    ]
  },
  {
    id: "l16",
    title: "16. Lecke: Az Orvosnál",
    description: "Kifejezések az orvosi rendelőben.",
    chapter: 9,
    xpReward: 45,
    questions: [
      {
        id: "q46",
        type: "flashcard",
        prompt: "Orvos",
        backText: "Dokter",
        phonetic: "Dokter",
      },
      {
        id: "q47",
        type: "multiple_choice",
        prompt: "Mit kérdez az orvos: 'Mi a panasza?'",
        options: [
          { id: "o1", text: "Was fählt Ihne?" },
          { id: "o2", text: "Was isch los?" },
          { id: "o3", text: "Was wends?" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q48",
        type: "match",
        prompt: "Gyógyászat",
        pairs: [
          { id: "p1", left: "Gyógyszertár", right: "Apotheke" },
          { id: "p2", left: "Gyógyszer", right: "Medikamänt" },
          { id: "p3", left: "Recept", right: "Rezäpt" },
        ]
      }
    ]
  },

  // ── 10. Fejezet: Szabadidő és Hobbik ────────────────────
  {
    id: "l17",
    title: "17. Lecke: Sport és Hobbik",
    description: "Mit csinálsz hétvégén?",
    chapter: 10,
    xpReward: 50,
    questions: [
      {
        id: "q49",
        type: "multiple_choice",
        prompt: "Hogy mondják a 'focizni' szót svájci németül?",
        options: [
          { id: "o1", text: "Tschuute" },
          { id: "o2", text: "Fussball spiele" },
          { id: "o3", text: "Kicke" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q50",
        type: "flashcard",
        prompt: "Síelés",
        backText: "Schiifahre",
        phonetic: "Sífáre",
      },
      {
        id: "q51",
        type: "match",
        prompt: "Szabadidő",
        pairs: [
          { id: "p1", left: "Úszás", right: "Schwümme" },
          { id: "p2", left: "Biciklizés", right: "Velofahre" },
          { id: "p3", left: "Olvasás", right: "Läse" },
        ]
      }
    ]
  },

  // ── 11. Fejezet: Svájci Ételek és Ünnepek ────────────────────
  {
    id: "l18",
    title: "18. Lecke: Svájci Ételek",
    description: "Kulináris kifejezések.",
    chapter: 11,
    xpReward: 50,
    questions: [
      {
        id: "q52",
        type: "flashcard",
        prompt: "Sajt",
        backText: "Chäs",
        phonetic: "Khész",
      },
      {
        id: "q53",
        type: "multiple_choice",
        prompt: "Melyik a híres svájci krumpliétel?",
        options: [
          { id: "o1", text: "Röschti" },
          { id: "o2", text: "Pommes" },
          { id: "o3", text: "Kartoffelstock" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q54",
        type: "match",
        prompt: "Édességek és italok",
        pairs: [
          { id: "p1", left: "Csokoládé", right: "Schoggi" },
          { id: "p2", left: "Tej", right: "Milch" },
          { id: "p3", left: "Sütemény", right: "Chueche" }
        ]
      }
    ]
  },
  {
    id: "l19",
    title: "19. Lecke: Ünnepek (Fäscht)",
    description: "Amikor a svájciak ünnepelnek.",
    chapter: 11,
    xpReward: 60,
    questions: [
      {
        id: "q55",
        type: "flashcard",
        prompt: "Karácsony",
        backText: "Wiehnachte",
        phonetic: "Víenahte",
      },
      {
        id: "q56",
        type: "multiple_choice",
        prompt: "Mit kívánnak születésnapra?",
        options: [
          { id: "o1", text: "Alles Gueti zum Geburi" },
          { id: "o2", text: "Herzliche Glückwunsch" },
          { id: "o3", text: "Viel Glück" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q57",
        type: "match",
        prompt: "Ünnepi szavak",
        pairs: [
          { id: "p1", left: "Húsvét", right: "Oschtere" },
          { id: "p2", left: "Újév", right: "Nöijohr" },
          { id: "p3", left: "Ajándék", right: "Gschänk" },
        ]
      }
    ]
  },

  // ── 12. Fejezet: Haladó Svájci Német ────────────────────
  {
    id: "l20",
    title: "20. Lecke: Szleng és Kifejezések",
    description: "Beszélj úgy, mint a fiatalok.",
    chapter: 12,
    xpReward: 100,
    questions: [
      {
        id: "q58",
        type: "flashcard",
        prompt: "Szuper, király",
        backText: "Huere geil",
        phonetic: "Huere gájl",
      },
      {
        id: "q59",
        type: "multiple_choice",
        prompt: "Mit mondasz, ha valami egyáltalán nem érdekel (szlengben)?",
        options: [
          { id: "o1", text: "Das isch mir Wurscht" },
          { id: "o2", text: "Ich ha kei Lust" },
          { id: "o3", text: "Das intressiert mi nöd" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q60",
        type: "match",
        prompt: "Tipikus töltelékszavak",
        pairs: [
          { id: "p1", left: "Mondjuk / Hát", right: "Also" },
          { id: "p2", left: "De tényleg", right: "Aber würkli" },
          { id: "p3", left: "Tényleg?", right: "Würkli?" },
          { id: "p4", left: "Nézd csak", right: "Lueg emol" },
        ]
      }
    ]
  },

  // ── 13. Fejezet: Autó és Közlekedés II ────────────────────
  {
    id: "l21",
    title: "21. Lecke: Autózás és Parkolás",
    description: "Kifejezések, ha autóval járod Svájcot.",
    chapter: 13,
    xpReward: 60,
    questions: [
      {
        id: "q61",
        type: "flashcard",
        prompt: "Jogosítvány",
        backText: "Führerschiin",
        phonetic: "Fírer-sín",
      },
      {
        id: "q62",
        type: "multiple_choice",
        prompt: "Hogy mondják a 'parkolóhely' szót?",
        options: [
          { id: "o1", text: "Parkplatz" },
          { id: "o2", text: "Parkfäld" },
          { id: "o3", text: "Mindkettő használatos" }
        ],
        correctOptionId: "o3",
      },
      {
        id: "q63",
        type: "match",
        prompt: "Autós kifejezések",
        pairs: [
          { id: "p1", left: "Sebességtúllépés", right: "Z schnäll gfahre" },
          { id: "p2", left: "Bírság (Büntetés)", right: "Buess" },
          { id: "p3", left: "Autópálya-matrica", right: "Vignette" },
        ]
      }
    ]
  },
  {
    id: "l22",
    title: "22. Lecke: A szerelőnél (Garagist)",
    description: "Ha valami elromlik az autón.",
    chapter: 13,
    xpReward: 65,
    questions: [
      {
        id: "q64",
        type: "flashcard",
        prompt: "Autószerelő",
        backText: "Garagist",
        phonetic: "Garázsisz",
      },
      {
        id: "q65",
        type: "multiple_choice",
        prompt: "Hogyan mondod: 'Eltört / Elromlott'?",
        options: [
          { id: "o1", text: "Kaputt" },
          { id: "o2", text: "Es isch hi" },
          { id: "o3", text: "Mindkettő jó" }
        ],
        correctOptionId: "o3",
      },
      {
        id: "q66",
        type: "match",
        prompt: "Alkatrészek",
        pairs: [
          { id: "p1", left: "Gumiabroncs", right: "Pneu" },
          { id: "p2", left: "Kormány", right: "Stüürrad" },
          { id: "p3", left: "Motor", right: "Motor" },
        ]
      }
    ]
  },

  // ── 14. Fejezet: Munkahely és Karrier ────────────────────
  {
    id: "l23",
    title: "23. Lecke: Állásinterjú",
    description: "Hogyan mutatkozz be egy interjún.",
    chapter: 14,
    xpReward: 70,
    questions: [
      {
        id: "q67",
        type: "flashcard",
        prompt: "Állásinterjú",
        backText: "Bewerbigsgspröch",
        phonetic: "Bewerbigsz-göprökh",
      },
      {
        id: "q68",
        type: "multiple_choice",
        prompt: "Hogy mondod: 'Nagy tapasztalatom van'?",
        options: [
          { id: "o1", text: "Ich ha viel Erfahrig" },
          { id: "o2", text: "Ich bi sehr guet" },
          { id: "o3", text: "Ich schaffe gern" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q69",
        type: "match",
        prompt: "Karrier kifejezések",
        pairs: [
          { id: "p1", left: "Főnök", right: "Chef" },
          { id: "p2", left: "Fizetés", right: "Lohn" },
          { id: "p3", left: "Munkaszerződés", right: "Arbeitsvertrag" },
        ]
      }
    ]
  },
  {
    id: "l24",
    title: "24. Lecke: Irodai Szleng",
    description: "Túlélni a hétköznapokat az irodában.",
    chapter: 14,
    xpReward: 70,
    questions: [
      {
        id: "q70",
        type: "flashcard",
        prompt: "Értekezlet / Meeting",
        backText: "Sitzig",
        phonetic: "Sziccig",
      },
      {
        id: "q71",
        type: "multiple_choice",
        prompt: "Hogy mondják: 'Szabadságon vagyok'?",
        options: [
          { id: "o1", text: "Ich ha Ferie" },
          { id: "o2", text: "Ich bi frei" },
          { id: "o3", text: "Ich schaffe nöd" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q72",
        type: "match",
        prompt: "Irodai élet",
        pairs: [
          { id: "p1", left: "Betegszabadság", right: "Chrankschriibig" },
          { id: "p2", left: "Kávészünet", right: "Kafipause" },
          { id: "p3", left: "Munkaidő vége", right: "Fiirabig" },
        ]
      }
    ]
  },

  // ── 15. Fejezet: Pénzügyek ────────────────────
  {
    id: "l25",
    title: "25. Lecke: Számlák és Adók",
    description: "Minden, ami pénz Svájcban.",
    chapter: 15,
    xpReward: 80,
    questions: [
      {
        id: "q73",
        type: "flashcard",
        prompt: "Számla",
        backText: "Rächnig",
        phonetic: "Rehnig",
      },
      {
        id: "q74",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Stüüre'?",
        options: [
          { id: "o1", text: "Adók" },
          { id: "o2", text: "Biztosítás" },
          { id: "o3", text: "Kormány" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q75",
        type: "match",
        prompt: "Pénzügyi szavak",
        pairs: [
          { id: "p1", left: "Fizetni", right: "Zahle" },
          { id: "p2", left: "Költség", right: "Choschte" },
          { id: "p3", left: "Megtakarítás", right: "Gsparts" },
        ]
      }
    ]
  },
  {
    id: "l26",
    title: "26. Lecke: A Bankban",
    description: "Számlanyitás és utalások.",
    chapter: 15,
    xpReward: 80,
    questions: [
      {
        id: "q76",
        type: "flashcard",
        prompt: "Bankszámla",
        backText: "Bankkonto",
        phonetic: "Bank-konto",
      },
      {
        id: "q77",
        type: "multiple_choice",
        prompt: "Hogy mondják a 'készpénz' szót?",
        options: [
          { id: "o1", text: "Bargäld" },
          { id: "o2", text: "Cash" },
          { id: "o3", text: "Stutz" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q78",
        type: "match",
        prompt: "Banki műveletek",
        pairs: [
          { id: "p1", left: "Kártya", right: "Charte" },
          { id: "p2", left: "Átutalás", right: "Überwiisig" },
          { id: "p3", left: "Bankautomata", right: "Bankomat" },
        ]
      }
    ]
  },

  // ── 16. Fejezet: Érzelmek és Vélemény ────────────────────
  {
    id: "l27",
    title: "27. Lecke: Érzelmek",
    description: "Fejezd ki, hogyan érzed magad.",
    chapter: 16,
    xpReward: 90,
    questions: [
      {
        id: "q79",
        type: "multiple_choice",
        prompt: "Hogy mondod: 'Fáradt vagyok'?",
        options: [
          { id: "o1", text: "Ich bi müed" },
          { id: "o2", text: "Ich ha Schlof" },
          { id: "o3", text: "Ich bi chrank" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q80",
        type: "flashcard",
        prompt: "Boldog",
        backText: "Glückli",
        phonetic: "Glükli",
      },
      {
        id: "q81",
        type: "match",
        prompt: "Érzések",
        pairs: [
          { id: "p1", left: "Szomorú", right: "Truurig" },
          { id: "p2", left: "Mérges", right: "Hässig" },
          { id: "p3", left: "Félős / Fél", right: "Angscht" },
        ]
      }
    ]
  },
  {
    id: "l28",
    title: "28. Lecke: Vita és Egyetértés",
    description: "Vélemény kifejezése a mindennapokban.",
    chapter: 16,
    xpReward: 90,
    questions: [
      {
        id: "q82",
        type: "flashcard",
        prompt: "Igazad van",
        backText: "Du hesch Rächt",
        phonetic: "Du hes reht",
      },
      {
        id: "q83",
        type: "multiple_choice",
        prompt: "Hogy mondod: 'Nem hiszem'?",
        options: [
          { id: "o1", text: "Ich dänke nöd" },
          { id: "o2", text: "Ich glaube scho" },
          { id: "o3", text: "Vellicht" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q84",
        type: "match",
        prompt: "Vélemények",
        pairs: [
          { id: "p1", left: "Egyetértek", right: "Ich bi iiverschtande" },
          { id: "p2", left: "Szerintem...", right: "Ich finde..." },
          { id: "p3", left: "Lehetséges", right: "Mögli" },
        ]
      }
    ]
  },

  // ── 17. Fejezet: Család és Barátok ────────────────────
  {
    id: "l29",
    title: "29. Lecke: Családtagok",
    description: "Kik a legfontosabbak az életedben?",
    chapter: 17,
    xpReward: 100,
    questions: [
      {
        id: "q85",
        type: "flashcard",
        prompt: "Nagyszülők",
        backText: "Grosseltere",
        phonetic: "Grosz-eltere",
      },
      {
        id: "q86",
        type: "multiple_choice",
        prompt: "Hogy mondják a 'fiúgyermek' szót?",
        options: [
          { id: "o1", text: "Bueb" },
          { id: "o2", text: "Sohn" },
          { id: "o3", text: "Mindkettő használatos" }
        ],
        correctOptionId: "o3",
      },
      {
        id: "q87",
        type: "match",
        prompt: "Családtagok",
        pairs: [
          { id: "p1", left: "Lánygyermek", right: "Meitli / Tochter" },
          { id: "p2", left: "Feleség", right: "Frou" },
          { id: "p3", left: "Férj", right: "Maa" },
        ]
      }
    ]
  },
  {
    id: "l30",
    title: "30. Lecke: Ünneplés és Meghívások",
    description: "Kifejezések bulizáshoz és partikhoz.",
    chapter: 17,
    xpReward: 120,
    questions: [
      {
        id: "q88",
        type: "flashcard",
        prompt: "Meghívás",
        backText: "Iiladig",
        phonetic: "I-ladig",
      },
      {
        id: "q89",
        type: "multiple_choice",
        prompt: "Mit jelent: 'Chömed ihr au?'",
        options: [
          { id: "o1", text: "Ti is jöttök?" },
          { id: "o2", text: "Ti mit csináltok?" },
          { id: "o3", text: "Hol vagytok?" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q90",
        type: "match",
        prompt: "Bulizás",
        pairs: [
          { id: "p1", left: "Buli / Parti", right: "Fäscht" },
          { id: "p2", left: "Zene", right: "Musig" },
          { id: "p3", left: "Táncolni", right: "Tanze" },
          { id: "p4", left: "Nagyon jó volt", right: "Es isch mega gsii" },
        ]
      }
    ]
  },

  // ── 18. Fejezet: Lakóközösség és Szomszédok ────────────────────
  {
    id: "l31",
    title: "31. Lecke: Szomszédok",
    description: "Viselkedés a svájci lakóközösségben.",
    chapter: 18,
    xpReward: 120,
    questions: [
      {
        id: "q91",
        type: "flashcard",
        prompt: "Szomszéd",
        backText: "Nochber",
        phonetic: "Nokhber",
      },
      {
        id: "q92",
        type: "multiple_choice",
        prompt: "Hogy mondják: 'Csendet kérek'?",
        options: [
          { id: "o1", text: "Bitte Rueh" },
          { id: "o2", text: "Siit still" },
          { id: "o3", text: "Schwiig" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q93",
        type: "match",
        prompt: "Együttélés",
        pairs: [
          { id: "p1", left: "Éjszakai csend", right: "Nachtrueh" },
          { id: "p2", left: "Lépcsőház", right: "Stägehuus" },
          { id: "p3", left: "Házirend", right: "Huusordnig" },
        ]
      }
    ]
  },
  {
    id: "l32",
    title: "32. Lecke: Mosókonyha",
    description: "A híres svájci Waschküche rejtelmei.",
    chapter: 18,
    xpReward: 130,
    questions: [
      {
        id: "q94",
        type: "flashcard",
        prompt: "Mosógép",
        backText: "Wäschmaschine",
        phonetic: "Ves-maschine",
      },
      {
        id: "q95",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Wäschplan'?",
        options: [
          { id: "o1", text: "Mosási beosztás" },
          { id: "o2", text: "Mosószer" },
          { id: "o3", text: "Szárító" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q96",
        type: "match",
        prompt: "Mosás",
        pairs: [
          { id: "p1", left: "Tiszta", right: "Suuber" },
          { id: "p2", left: "Piszkos", right: "Dräckig" },
          { id: "p3", left: "Teregetni", right: "Ufhänke" },
        ]
      }
    ]
  },

  // ── 19. Fejezet: Természetjárás és Szabályok ────────────────────
  {
    id: "l33",
    title: "33. Lecke: Szelektív hulladék",
    description: "Hogyan kell szemetelni Svájcban?",
    chapter: 19,
    xpReward: 130,
    questions: [
      {
        id: "q97",
        type: "flashcard",
        prompt: "Szemeteszsák",
        backText: "Abfallsagg",
        phonetic: "Abfal-szak",
      },
      {
        id: "q98",
        type: "multiple_choice",
        prompt: "Hogy mondják a 'műanyagot' (PET)?",
        options: [
          { id: "o1", text: "PET-Fläsche" },
          { id: "o2", text: "Plastik" },
          { id: "o3", text: "Gummi" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q99",
        type: "match",
        prompt: "Újrahasznosítás",
        pairs: [
          { id: "p1", left: "Üveg", right: "Glas" },
          { id: "p2", left: "Papír", right: "Bapier" },
          { id: "p3", left: "Karton", right: "Charton" },
        ]
      }
    ]
  },
  {
    id: "l34",
    title: "34. Lecke: Grillezés a természetben",
    description: "Sütögetés a szabadban.",
    chapter: 19,
    xpReward: 140,
    questions: [
      {
        id: "q100",
        type: "flashcard",
        prompt: "Kolbász",
        backText: "Wurscht",
        phonetic: "Vurst",
      },
      {
        id: "q101",
        type: "multiple_choice",
        prompt: "Mit jelent: 'Brätle'?",
        options: [
          { id: "o1", text: "Tűzön sütögetni" },
          { id: "o2", text: "Fázni" },
          { id: "o3", text: "Fára mászni" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q102",
        type: "match",
        prompt: "Tűzrakás",
        pairs: [
          { id: "p1", left: "Tűz", right: "Füür" },
          { id: "p2", left: "Fa", right: "Holz" },
          { id: "p3", left: "Tó", right: "See" },
        ]
      }
    ]
  },

  // ── 20. Fejezet: Téli Szabadidő ────────────────────
  {
    id: "l35",
    title: "35. Lecke: Téli Sportok",
    description: "Síelés és hófödte hegyek.",
    chapter: 20,
    xpReward: 140,
    questions: [
      {
        id: "q103",
        type: "flashcard",
        prompt: "Síelés",
        backText: "Schifahre",
        phonetic: "Sífáre",
      },
      {
        id: "q104",
        type: "multiple_choice",
        prompt: "Hogy mondják a 'Szánkózni' szót?",
        options: [
          { id: "o1", text: "Schlittele" },
          { id: "o2", text: "Ruttsche" },
          { id: "o3", text: "Fahre" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q105",
        type: "match",
        prompt: "A hóban",
        pairs: [
          { id: "p1", left: "Hó", right: "Schnee" },
          { id: "p2", left: "Hideg", right: "Chalt" },
          { id: "p3", left: "Jég", right: "Iis" },
        ]
      }
    ]
  },
  {
    id: "l36",
    title: "36. Lecke: Karácsonyi Vásár",
    description: "Glühwein és hangulat.",
    chapter: 20,
    xpReward: 150,
    questions: [
      {
        id: "q106",
        type: "flashcard",
        prompt: "Forralt bor",
        backText: "Glüewii",
        phonetic: "Glüeví",
      },
      {
        id: "q107",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Chrömli'?",
        options: [
          { id: "o1", text: "Karácsonyi keksz" },
          { id: "o2", text: "Sapka" },
          { id: "o3", text: "Csillag" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q108",
        type: "match",
        prompt: "Karácsony",
        pairs: [
          { id: "p1", left: "Karácsonyfa", right: "Chrischtbaum" },
          { id: "p2", left: "Ajándék", right: "Gschänk" },
          { id: "p3", left: "Gyertya", right: "Chärze" },
        ]
      }
    ]
  },

  // ── 21. Fejezet: Média és Kommunikáció ────────────────────
  {
    id: "l37",
    title: "37. Lecke: Telefonálás",
    description: "Hogyan vedd fel a telefont?",
    chapter: 21,
    xpReward: 150,
    questions: [
      {
        id: "q109",
        type: "flashcard",
        prompt: "Telefonálni",
        backText: "Aalüüte",
        phonetic: "A-lűte",
      },
      {
        id: "q110",
        type: "multiple_choice",
        prompt: "Mit mondasz, ha bemutatkozol telefonban?",
        options: [
          { id: "o1", text: "Do isch de..." },
          { id: "o2", text: "Ich bi..." },
          { id: "o3", text: "Hallo" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q111",
        type: "match",
        prompt: "Telefonálás",
        pairs: [
          { id: "p1", left: "Üzenethagyás", right: "Uf d Combox spreche" },
          { id: "p2", left: "Foglalt", right: "Bsetzt" },
          { id: "p3", left: "Mobilszám", right: "Handynummere" },
        ]
      }
    ]
  },
  {
    id: "l38",
    title: "38. Lecke: Email és Üzenetek",
    description: "WhatsApp és hivatalos levelek.",
    chapter: 21,
    xpReward: 160,
    questions: [
      {
        id: "q112",
        type: "flashcard",
        prompt: "Üzenet",
        backText: "Nochricht",
        phonetic: "Nokh-riht",
      },
      {
        id: "q113",
        type: "multiple_choice",
        prompt: "Hogyan búcsúzol el baráti üzenetben?",
        options: [
          { id: "o1", text: "Liebi Grüess" },
          { id: "o2", text: "Fründlichi Grüess" },
          { id: "o3", text: "Tschüss" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q114",
        type: "match",
        prompt: "Levelezés",
        pairs: [
          { id: "p1", left: "Írni", right: "Schriibe" },
          { id: "p2", left: "Olvasni", right: "Läse" },
          { id: "p3", left: "Küldeni", right: "Schigge" },
        ]
      }
    ]
  },

  // ── 22. Fejezet: Vásárlás és Szolgáltatások ────────────────────
  {
    id: "l39",
    title: "39. Lecke: A Fodrásznál",
    description: "Hajvágás svájci módra.",
    chapter: 22,
    xpReward: 160,
    questions: [
      {
        id: "q115",
        type: "flashcard",
        prompt: "Fodrász",
        backText: "Coiffeur",
        phonetic: "Kva-főr",
      },
      {
        id: "q116",
        type: "multiple_choice",
        prompt: "Hogy mondod: 'Rövidebbre kérem'?",
        options: [
          { id: "o1", text: "Chürzer bitte" },
          { id: "o2", text: "Länger bitte" },
          { id: "o3", text: "So loh" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q117",
        type: "match",
        prompt: "Haj",
        pairs: [
          { id: "p1", left: "Haj", right: "Hoor" },
          { id: "p2", left: "Olló", right: "Schäär" },
          { id: "p3", left: "Fésű", right: "Chämel" },
        ]
      }
    ]
  },
  {
    id: "l40",
    title: "40. Lecke: Ruhavásárlás",
    description: "A plázában.",
    chapter: 22,
    xpReward: 170,
    questions: [
      {
        id: "q118",
        type: "flashcard",
        prompt: "Ruha",
        backText: "Chleider",
        phonetic: "Hlejder",
      },
      {
        id: "q119",
        type: "multiple_choice",
        prompt: "Mit jelent: 'Das basst mir nöd'?",
        options: [
          { id: "o1", text: "Ez nem jó rám (nem illik)" },
          { id: "o2", text: "Nem tetszik" },
          { id: "o3", text: "Túl drága" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q120",
        type: "match",
        prompt: "Ruhadarabok",
        pairs: [
          { id: "p1", left: "Cipő", right: "Schueh" },
          { id: "p2", left: "Nadrág", right: "Hose" },
          { id: "p3", left: "Póló", right: "Liibli" },
        ]
      }
    ]
  },

  // ── 23. Fejezet: Utazás a Világban ────────────────────
  {
    id: "l41",
    title: "41. Lecke: A Repülőtéren",
    description: "Készülődés az utazásra.",
    chapter: 23,
    xpReward: 170,
    questions: [
      {
        id: "q121",
        type: "flashcard",
        prompt: "Repülőtér",
        backText: "Flughafe",
        phonetic: "Flug-háfe",
      },
      {
        id: "q122",
        type: "multiple_choice",
        prompt: "Hogy mondják a 'bőrönd' szót?",
        options: [
          { id: "o1", text: "Choffer" },
          { id: "o2", text: "Täsche" },
          { id: "o3", text: "Rucksack" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q123",
        type: "match",
        prompt: "Utazás",
        pairs: [
          { id: "p1", left: "Jegy", right: "Billet" },
          { id: "p2", left: "Repülni", right: "Flüge" },
          { id: "p3", left: "Nyarlás", right: "Ferie" },
        ]
      }
    ]
  },
  {
    id: "l42",
    title: "42. Lecke: Nyaralás",
    description: "Strand, napfény és pihenés.",
    chapter: 23,
    xpReward: 180,
    questions: [
      {
        id: "q124",
        type: "flashcard",
        prompt: "Strand",
        backText: "Strand / Badi",
        phonetic: "Strand / Badi",
      },
      {
        id: "q125",
        type: "multiple_choice",
        prompt: "Mit csinálsz nyaralás alatt?",
        options: [
          { id: "o1", text: "Entspanne" },
          { id: "o2", text: "Schaffe" },
          { id: "o3", text: "Putze" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q126",
        type: "match",
        prompt: "Nyaralás kifejezések",
        pairs: [
          { id: "p1", left: "Tenger", right: "Meer" },
          { id: "p2", left: "Meleg van", right: "Es isch heiss" },
          { id: "p3", left: "Nap", right: "Sunne" },
        ]
      }
    ]
  },

  // ── 24. Fejezet: Hivatalos ügyek ────────────────────
  {
    id: "l43",
    title: "43. Lecke: Biztosítás (Krankenkasse)",
    description: "Az elkerülhetetlen svájci papírmunka.",
    chapter: 24,
    xpReward: 180,
    questions: [
      {
        id: "q127",
        type: "flashcard",
        prompt: "Egészségbiztosító",
        backText: "Chrankekasse",
        phonetic: "Kranke-kassze",
      },
      {
        id: "q128",
        type: "multiple_choice",
        prompt: "Hogy mondják a 'kivétel / önrész' szót (amit neked kell fizetni)?",
        options: [
          { id: "o1", text: "Franchise" },
          { id: "o2", text: "Prämie" },
          { id: "o3", text: "Lohn" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q129",
        type: "match",
        prompt: "Hivatal",
        pairs: [
          { id: "p1", left: "Díjfizetés", right: "Prämie" },
          { id: "p2", left: "Kórház", right: "Spital" },
          { id: "p3", left: "Beteg", right: "Chrank" },
        ]
      }
    ]
  },
  {
    id: "l44",
    title: "44. Lecke: Lakcímbejelentés",
    description: "Hogyan intézkedj a Gemeindehaus-ban.",
    chapter: 24,
    xpReward: 190,
    questions: [
      {
        id: "q130",
        type: "flashcard",
        prompt: "Községháza",
        backText: "Gmeindshuus",
        phonetic: "Gmeindsz-húz",
      },
      {
        id: "q131",
        type: "multiple_choice",
        prompt: "Hogy hívják az 'igazolványt / engedélyt'?",
        options: [
          { id: "o1", text: "Uuswiis" },
          { id: "o2", text: "Pass" },
          { id: "o3", text: "Mindkettő használatos" }
        ],
        correctOptionId: "o3",
      },
      {
        id: "q132",
        type: "match",
        prompt: "Papírmunka",
        pairs: [
          { id: "p1", left: "Aláírás", right: "Underschrift" },
          { id: "p2", left: "Nyomtatvány", right: "Formular" },
          { id: "p3", left: "Költözés", right: "Züügle" },
        ]
      }
    ]
  },

  // ── 25. Fejezet: A Svájci Konyha II ────────────────────
  {
    id: "l45",
    title: "45. Lecke: Sütés-Főzés",
    description: "Csináljunk egy jó vacsorát.",
    chapter: 25,
    xpReward: 200,
    questions: [
      {
        id: "q133",
        type: "flashcard",
        prompt: "Főzni",
        backText: "Choche",
        phonetic: "Khohe",
      },
      {
        id: "q134",
        type: "multiple_choice",
        prompt: "Mit csinálsz egy 'Chueche'-vel (Sütemény)?",
        options: [
          { id: "o1", text: "Bache (Sütöd)" },
          { id: "o2", text: "Trinke (Iszod)" },
          { id: "o3", text: "Wäsche (Mosod)" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q135",
        type: "match",
        prompt: "Konyhai szavak",
        pairs: [
          { id: "p1", left: "Serpenyő", right: "Bratpfanne" },
          { id: "p2", left: "Kés", right: "Mässer" },
          { id: "p3", left: "Tányér", right: "Däller" },
        ]
      }
    ]
  },
  {
    id: "l46",
    title: "46. Lecke: Étteremben II",
    description: "Reklamáció és számlafizetés.",
    chapter: 25,
    xpReward: 200,
    questions: [
      {
        id: "q136",
        type: "flashcard",
        prompt: "Fizetni szeretnék",
        backText: "Ich wett zahle",
        phonetic: "Ih vet cále",
      },
      {
        id: "q137",
        type: "multiple_choice",
        prompt: "Mit mondasz, ha a leves túl hideg?",
        options: [
          { id: "o1", text: "D Suppe isch z chalt" },
          { id: "o2", text: "D Suppe isch fein" },
          { id: "o3", text: "D Suppe isch heiss" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q138",
        type: "match",
        prompt: "Éttermi kifejezések",
        pairs: [
          { id: "p1", left: "Borravaló", right: "Trinkgäld" },
          { id: "p2", left: "Pincér", right: "Chällner" },
          { id: "p3", left: "Számla", right: "Rächnig" },
        ]
      }
    ]
  },

  // ── 26. Fejezet: Technológia és IT ────────────────────
  {
    id: "l47",
    title: "47. Lecke: Számítógép",
    description: "Internetezés Svájcban.",
    chapter: 26,
    xpReward: 210,
    questions: [
      {
        id: "q139",
        type: "flashcard",
        prompt: "Képernyő",
        backText: "Bildschirm",
        phonetic: "Bils-sirm",
      },
      {
        id: "q140",
        type: "multiple_choice",
        prompt: "Mit csinálsz, ha nem működik valami?",
        options: [
          { id: "o1", text: "Neu starte (Újraindítod)" },
          { id: "o2", text: "Wegrüehre (Kidobod)" },
          { id: "o3", text: "Bache (Megsütöd)" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q141",
        type: "match",
        prompt: "Tech szavak",
        pairs: [
          { id: "p1", left: "Jelszó", right: "Passwort" },
          { id: "p2", left: "Billentyűzet", right: "Taschtatur" },
          { id: "p3", left: "Egér", right: "Muus" },
        ]
      }
    ]
  },
  {
    id: "l48",
    title: "48. Lecke: Elektronika",
    description: "Kütyük a házban.",
    chapter: 26,
    xpReward: 210,
    questions: [
      {
        id: "q142",
        type: "flashcard",
        prompt: "Mobiltelefon",
        backText: "Natel / Handy",
        phonetic: "Nátel",
      },
      {
        id: "q143",
        type: "multiple_choice",
        prompt: "Hogy mondják a 'Tévé'-t?",
        options: [
          { id: "o1", text: "Färnseh" },
          { id: "o2", text: "Radio" },
          { id: "o3", text: "Computer" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q144",
        type: "match",
        prompt: "Otthoni eszközök",
        pairs: [
          { id: "p1", left: "Akkumulátor", right: "Akku" },
          { id: "p2", left: "Töltő", right: "Ladegrät" },
          { id: "p3", left: "Konnektor", right: "Stäckdose" },
        ]
      }
    ]
  },

  // ── 27. Fejezet: Mester szintű Szleng ────────────────────
  {
    id: "l49",
    title: "49. Lecke: Káromkodás (Mértékkel)",
    description: "Amikor a svájci is elveszíti a türelmét.",
    chapter: 27,
    xpReward: 250,
    questions: [
      {
        id: "q145",
        type: "flashcard",
        prompt: "A fenébe! / Basszus!",
        backText: "Gopferdeckel!",
        phonetic: "Gopfer-dekkel",
      },
      {
        id: "q146",
        type: "multiple_choice",
        prompt: "Melyik a híres, enyhe svájci mérgeskedő kifejezés?",
        options: [
          { id: "o1", text: "Gopfertammi" },
          { id: "o2", text: "Guten Tag" },
          { id: "o3", text: "Merci vilmal" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q147",
        type: "match",
        prompt: "Durvább szleng",
        pairs: [
          { id: "p1", left: "Hülye (Szelíd)", right: "Spinnsch?" },
          { id: "p2", left: "Csend legyen!", right: "Heb d Schnurre" },
          { id: "p3", left: "Hülyeség", right: "Seich" },
        ]
      }
    ]
  },
  {
    id: "l50",
    title: "50. Lecke: A Svájci Identitás",
    description: "Légy igazi 'Bünzli'. (Mestervizsga)",
    chapter: 27,
    xpReward: 500,
    questions: [
      {
        id: "q148",
        type: "flashcard",
        prompt: "Túlságosan szabálykövető (Nyárspolgár)",
        backText: "Bünzli",
        phonetic: "Büncli",
      },
      {
        id: "q149",
        type: "multiple_choice",
        prompt: "Mit csinál egy igazi Bünzli este 10 után?",
        options: [
          { id: "o1", text: "Szigorúan csendben van (Nachtrueh)" },
          { id: "o2", text: "Porszívózik" },
          { id: "o3", text: "Hangosan zenét hallgat" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q150",
        type: "match",
        prompt: "A legfontosabb szavak svájcban",
        pairs: [
          { id: "p1", left: "Pontosság", right: "Pünktlichkeit" },
          { id: "p2", left: "Titoktartás", right: "Diskretion" },
          { id: "p3", left: "Kantonok", right: "Kanton" },
          { id: "p4", left: "Büszkeség", right: "Stolz" },
        ]
      }
    ]
  },

  // ── 28. Fejezet: Test és Lélek ────────────────────
  {
    id: "l51",
    title: "51. Lecke: Edzőteremben",
    description: "Izzadjunk a konditeremben.",
    chapter: 28,
    xpReward: 260,
    questions: [
      {
        id: "q151",
        type: "flashcard",
        prompt: "Edzőterem / Konditerem",
        backText: "Fitnesszänter",
        phonetic: "Fitnesz-center",
      },
      {
        id: "q152",
        type: "multiple_choice",
        prompt: "Hogy mondod: 'Edzeni megyek'?",
        options: [
          { id: "o1", text: "Ich gah go trainiere" },
          { id: "o2", text: "Ich dänke" },
          { id: "o3", text: "Ich bi chrank" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q153",
        type: "match",
        prompt: "Sporteszközök",
        pairs: [
          { id: "p1", left: "Súly", right: "Gwicht" },
          { id: "p2", left: "Izom", right: "Muskel" },
          { id: "p3", left: "Futópad", right: "Laufband" },
        ]
      }
    ]
  },
  {
    id: "l52",
    title: "52. Lecke: Szépségápolás",
    description: "Relaxálj egy nehéz nap után.",
    chapter: 28,
    xpReward: 260,
    questions: [
      {
        id: "q154",
        type: "flashcard",
        prompt: "Fürdőkád",
        backText: "Badwanne",
        phonetic: "Bád-vanne",
      },
      {
        id: "q155",
        type: "multiple_choice",
        prompt: "Mit jelent: 'Entspanne'?",
        options: [
          { id: "o1", text: "Kikapcsolódni / Relaxálni" },
          { id: "o2", text: "Sietni" },
          { id: "o3", text: "Aludni" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q156",
        type: "match",
        prompt: "Fürdőszoba",
        pairs: [
          { id: "p1", left: "Szappan", right: "Seife" },
          { id: "p2", left: "Törölköző", right: "Frotteetüechli" },
          { id: "p3", left: "Sampon", right: "Schampoo" },
        ]
      }
    ]
  },

  // ── 29. Fejezet: Zene és Művészet ────────────────────
  {
    id: "l53",
    title: "53. Lecke: Koncerten",
    description: "Fesztiválok Svájcban.",
    chapter: 29,
    xpReward: 270,
    questions: [
      {
        id: "q157",
        type: "flashcard",
        prompt: "Koncert",
        backText: "Konzärt",
        phonetic: "Koncert",
      },
      {
        id: "q158",
        type: "multiple_choice",
        prompt: "Mit csinálsz a zenére?",
        options: [
          { id: "o1", text: "Tanze (Táncolok)" },
          { id: "o2", text: "Schlafe (Alszom)" },
          { id: "o3", text: "Ränne (Futok)" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q159",
        type: "match",
        prompt: "Zenei szavak",
        pairs: [
          { id: "p1", left: "Zenekar", right: "Bänd" },
          { id: "p2", left: "Dal", right: "Lied" },
          { id: "p3", left: "Énekes", right: "Sänger" },
        ]
      }
    ]
  },
  {
    id: "l54",
    title: "54. Lecke: Múzeum és Kultúra",
    description: "Egy kis művészet hétvégére.",
    chapter: 29,
    xpReward: 270,
    questions: [
      {
        id: "q160",
        type: "flashcard",
        prompt: "Kép / Festmény",
        backText: "Bild",
        phonetic: "Bilt",
      },
      {
        id: "q161",
        type: "multiple_choice",
        prompt: "Hogy mondják a 'kiállítás' szót?",
        options: [
          { id: "o1", text: "Uusschtellig" },
          { id: "o2", text: "Kino" },
          { id: "o3", text: "Bühne" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q162",
        type: "match",
        prompt: "Művészet",
        pairs: [
          { id: "p1", left: "Múzeum", right: "Museum" },
          { id: "p2", left: "Szobor", right: "Statue" },
          { id: "p3", left: "Művész", right: "Künschtler" },
        ]
      }
    ]
  },

  // ── 30. Fejezet: Hétvégi Programok 2.0 ────────────────────
  {
    id: "l55",
    title: "55. Lecke: A Svájci Tavaknál",
    description: "Séta a Zürichsee vagy a Bodensee partján.",
    chapter: 30,
    xpReward: 280,
    questions: [
      {
        id: "q163",
        type: "flashcard",
        prompt: "Tó",
        backText: "See",
        phonetic: "Szé",
      },
      {
        id: "q164",
        type: "multiple_choice",
        prompt: "Mit jelents a 'Schiff fahre'?",
        options: [
          { id: "o1", text: "Hajózni" },
          { id: "o2", text: "Autózni" },
          { id: "o3", text: "Vonatozni" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q165",
        type: "match",
        prompt: "Tópart",
        pairs: [
          { id: "p1", left: "Kacsa", right: "Änte" },
          { id: "p2", left: "Hajó", right: "Schiff" },
          { id: "p3", left: "Víz", right: "Wasser" },
        ]
      }
    ]
  },
  {
    id: "l56",
    title: "56. Lecke: Állatkert és Park",
    description: "Irány a Zürcher Zoo!",
    chapter: 30,
    xpReward: 280,
    questions: [
      {
        id: "q166",
        type: "flashcard",
        prompt: "Állatkert",
        backText: "Zoo (Züü)",
        phonetic: "Cú",
      },
      {
        id: "q167",
        type: "multiple_choice",
        prompt: "Hogy mondják a 'Majom' szót?",
        options: [
          { id: "o1", text: "Aff" },
          { id: "o2", text: "Hund" },
          { id: "o3", text: "Vogel" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q168",
        type: "match",
        prompt: "Állatok",
        pairs: [
          { id: "p1", left: "Medve", right: "Bär" },
          { id: "p2", left: "Madár", right: "Vogel" },
          { id: "p3", left: "Oroszlán", right: "Leu" },
        ]
      }
    ]
  },

  // ── 31. Fejezet: Utazás Vonattal (SBB Masterclass) ────────────────────
  {
    id: "l57",
    title: "57. Lecke: Jegyvásárlás",
    description: "Halbtax, GA, és a jegyautomata.",
    chapter: 31,
    xpReward: 290,
    questions: [
      {
        id: "q169",
        type: "flashcard",
        prompt: "Pályaudvar",
        backText: "Bahnhof",
        phonetic: "Bánhóf",
      },
      {
        id: "q170",
        type: "multiple_choice",
        prompt: "Mit jelent a svájci 'Halbtax'?",
        options: [
          { id: "o1", text: "Féláru kártya" },
          { id: "o2", text: "Büntetés" },
          { id: "o3", text: "Teljes árú jegy" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q171",
        type: "match",
        prompt: "SBB szavak",
        pairs: [
          { id: "p1", left: "Jegy", right: "Billet" },
          { id: "p2", left: "Vonat", right: "Zug" },
          { id: "p3", left: "Vágány", right: "Gleis" },
        ]
      }
    ]
  },
  {
    id: "l58",
    title: "58. Lecke: A Kalauz és Késések",
    description: "Amikor a svájci vonat 2 percet késik.",
    chapter: 31,
    xpReward: 290,
    questions: [
      {
        id: "q172",
        type: "flashcard",
        prompt: "Kalauz / Ellenőr",
        backText: "Konduktöör",
        phonetic: "Konduktőr",
      },
      {
        id: "q173",
        type: "multiple_choice",
        prompt: "Hogyan mondod: 'A vonat késik'?",
        options: [
          { id: "o1", text: "De Zug hed Verspötig" },
          { id: "o2", text: "De Zug chunnt pünktli" },
          { id: "o3", text: "De Zug isch abgfahre" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q174",
        type: "match",
        prompt: "Késések",
        pairs: [
          { id: "p1", left: "Késés", right: "Verspötig" },
          { id: "p2", left: "Átszállás", right: "Umschtiige" },
          { id: "p3", left: "Csatlakozás", right: "Aaschluss" },
        ]
      }
    ]
  },

  // ── 32. Fejezet: Buli és Éjszakai Élet ────────────────────
  {
    id: "l59",
    title: "59. Lecke: Kocsmázás",
    description: "Rendeljünk egy sört a bárban.",
    chapter: 32,
    xpReward: 300,
    questions: [
      {
        id: "q175",
        type: "flashcard",
        prompt: "Kocsma / Bár",
        backText: "Beiz",
        phonetic: "Bájc",
      },
      {
        id: "q176",
        type: "multiple_choice",
        prompt: "Hogy kérsz egy nagy sört?",
        options: [
          { id: "o1", text: "Es grosses Bier bitte" },
          { id: "o2", text: "Eis Chliises" },
          { id: "o3", text: "Es Wasser bitte" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q177",
        type: "match",
        prompt: "Italok",
        pairs: [
          { id: "p1", left: "Sör", right: "Bier" },
          { id: "p2", left: "Bor", right: "Wii" },
          { id: "p3", left: "Pohár", right: "Glaas" },
        ]
      }
    ]
  },
  {
    id: "l60",
    title: "60. Lecke: Másnaposság",
    description: "Amikor a buli túl jól sikerült.",
    chapter: 32,
    xpReward: 300,
    questions: [
      {
        id: "q178",
        type: "flashcard",
        prompt: "Másnaposság",
        backText: "Chater",
        phonetic: "Kháter",
      },
      {
        id: "q179",
        type: "multiple_choice",
        prompt: "Mit mondasz, ha fáj a fejed a buli után?",
        options: [
          { id: "o1", text: "Ich ha e huere Chater" },
          { id: "o2", text: "Ich bi zwääg" },
          { id: "o3", text: "Es isch lustig gsii" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q180",
        type: "match",
        prompt: "Másnap",
        pairs: [
          { id: "p1", left: "Fáradt", right: "Müed" },
          { id: "p2", left: "Víz", right: "Wasser" },
          { id: "p3", left: "Fájdalomcsillapító", right: "Schmärztablette" },
        ]
      }
    ]
  },

  // ── 33. Fejezet: Álláskeresés és Interjú II ────────────────────
  {
    id: "l61",
    title: "61. Lecke: Önéletrajz",
    description: "Készülj fel a svájci HR-esekre.",
    chapter: 33,
    xpReward: 320,
    questions: [
      {
        id: "q181",
        type: "flashcard",
        prompt: "Önéletrajz",
        backText: "Lebenslauf (CV)",
        phonetic: "Lébensz-lauf",
      },
      {
        id: "q182",
        type: "multiple_choice",
        prompt: "Hogy mondják a 'Képzettség / Végzettség' szót?",
        options: [
          { id: "o1", text: "Uusbildig" },
          { id: "o2", text: "Arbeit" },
          { id: "o3", text: "Schuel" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q183",
        type: "match",
        prompt: "HR Szavak",
        pairs: [
          { id: "p1", left: "Jelentkezés", right: "Bewerbig" },
          { id: "p2", left: "Tapasztalat", right: "Erfahrig" },
          { id: "p3", left: "Bizonyítvány", right: "Zügnis" },
        ]
      }
    ]
  },
  {
    id: "l62",
    title: "62. Lecke: Bérezés és Juttatások",
    description: "Beszéljünk a pénzről az interjún.",
    chapter: 33,
    xpReward: 330,
    questions: [
      {
        id: "q184",
        type: "flashcard",
        prompt: "Fizetés (Bér)",
        backText: "Lohn",
        phonetic: "Lón",
      },
      {
        id: "q185",
        type: "multiple_choice",
        prompt: "Hogy mondják a bruttó fizetést?",
        options: [
          { id: "o1", text: "Bruttolohn" },
          { id: "o2", text: "Nettolohn" },
          { id: "o3", text: "Zuelag" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q186",
        type: "match",
        prompt: "Juttatások",
        pairs: [
          { id: "p1", left: "Adó", right: "Stüür" },
          { id: "p2", left: "13. Havi fizetés", right: "Driizähnte" },
          { id: "p3", left: "Szerződés", right: "Vertrag" },
        ]
      }
    ]
  },

  // ── 34. Fejezet: Romantika ────────────────────
  {
    id: "l63",
    title: "63. Lecke: Randizás",
    description: "Hogyan hívd el kávézni a kiszemeltet?",
    chapter: 34,
    xpReward: 340,
    questions: [
      {
        id: "q187",
        type: "flashcard",
        prompt: "Kávézni menni",
        backText: "Es Kafi go trinke",
        phonetic: "Esz kafi go trinke",
      },
      {
        id: "q188",
        type: "multiple_choice",
        prompt: "Hogy mondod: 'Szép a szemed'?",
        options: [
          { id: "o1", text: "Du hesch schöni Auge" },
          { id: "o2", text: "Du bisch chli" },
          { id: "o3", text: "Ich bi müed" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q189",
        type: "match",
        prompt: "Randi",
        pairs: [
          { id: "p1", left: "Szép", right: "Schön" },
          { id: "p2", left: "Csinos", right: "Hübsch" },
          { id: "p3", left: "Csók", right: "Kuss / Schmutzli" },
        ]
      }
    ]
  },
  {
    id: "l64",
    title: "64. Lecke: Szerelmes Szavak",
    description: "Szerelmi vallomás svájci módra.",
    chapter: 34,
    xpReward: 350,
    questions: [
      {
        id: "q190",
        type: "flashcard",
        prompt: "Szeretlek",
        backText: "Ich ha di gärn",
        phonetic: "Ih ha di gern",
      },
      {
        id: "q191",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Schätzli'?",
        options: [
          { id: "o1", text: "Kincsem / Drágám" },
          { id: "o2", text: "Macska" },
          { id: "o3", text: "Kávé" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q192",
        type: "match",
        prompt: "Kapcsolat",
        pairs: [
          { id: "p1", left: "Barát / Barátnő", right: "Fründ / Fründin" },
          { id: "p2", left: "Szív", right: "Härz" },
          { id: "p3", left: "Házasság", right: "Hüroot" },
        ]
      }
    ]
  },

  // ── 35. Fejezet: Háziállatok ────────────────────
  {
    id: "l65",
    title: "65. Lecke: Kutya és Macska",
    description: "Kisállatok a házban.",
    chapter: 35,
    xpReward: 360,
    questions: [
      {
        id: "q193",
        type: "flashcard",
        prompt: "Kutya",
        backText: "Hund",
        phonetic: "Hund",
      },
      {
        id: "q194",
        type: "multiple_choice",
        prompt: "Hogy mondják a macskát?",
        options: [
          { id: "o1", text: "Chatz / Büsi" },
          { id: "o2", text: "Müüsli" },
          { id: "o3", text: "Vogel" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q195",
        type: "match",
        prompt: "Állatok",
        pairs: [
          { id: "p1", left: "Kiscica", right: "Büsi" },
          { id: "p2", left: "Kiskutya", right: "Hündli" },
          { id: "p3", left: "Séta a kutyával", right: "Gassi gah" },
        ]
      }
    ]
  },
  {
    id: "l66",
    title: "66. Lecke: Állatorvosnál",
    description: "Ha beteg a házi kedvenc.",
    chapter: 35,
    xpReward: 360,
    questions: [
      {
        id: "q196",
        type: "flashcard",
        prompt: "Állatorvos",
        backText: "Tierarzt",
        phonetic: "Tír-arct",
      },
      {
        id: "q197",
        type: "multiple_choice",
        prompt: "Mit mondasz, ha beteg a kutyád?",
        options: [
          { id: "o1", text: "Miis Hündli isch chrank" },
          { id: "o2", text: "Er hed Hunger" },
          { id: "o3", text: "Er lauft schnäll" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q198",
        type: "match",
        prompt: "Gyógyítás",
        pairs: [
          { id: "p1", left: "Gyógyszer", right: "Medikamänt" },
          { id: "p2", left: "Fájdalom", right: "Schmärze" },
          { id: "p3", left: "Meggyógyulni", right: "Gsund wärde" },
        ]
      }
    ]
  },

  // ── 36. Fejezet: Svájci Földrajz ────────────────────
  {
    id: "l67",
    title: "67. Lecke: Kantonok és Nyelvek",
    description: "Tájékozódás az országban.",
    chapter: 36,
    xpReward: 380,
    questions: [
      {
        id: "q199",
        type: "flashcard",
        prompt: "Svájc",
        backText: "Schwiiz",
        phonetic: "Svíjc",
      },
      {
        id: "q200",
        type: "multiple_choice",
        prompt: "Hány hivatalos nyelve van Svájcnak?",
        options: [
          { id: "o1", text: "Négy (Vier)" },
          { id: "o2", text: "Három (Drüü)" },
          { id: "o3", text: "Kettő (Zwei)" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q201",
        type: "match",
        prompt: "Térkép",
        pairs: [
          { id: "p1", left: "Német rész", right: "Dütschschwiiz" },
          { id: "p2", left: "Francia rész", right: "Wälschland" },
          { id: "p3", left: "Olasz rész", right: "Tessin" },
        ]
      }
    ]
  },
  {
    id: "l68",
    title: "68. Lecke: Hegycsúcsok",
    description: "Alpok és természet.",
    chapter: 36,
    xpReward: 390,
    questions: [
      {
        id: "q202",
        type: "flashcard",
        prompt: "Hegy (Mount)",
        backText: "Bärg",
        phonetic: "Berg",
      },
      {
        id: "q203",
        type: "multiple_choice",
        prompt: "Melyik Svájc leghíresebb hegycsúcsa (Toblerone logó)?",
        options: [
          { id: "o1", text: "Matterhorn" },
          { id: "o2", text: "Jungfrau" },
          { id: "o3", text: "Pilatus" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q204",
        type: "match",
        prompt: "Alpok",
        pairs: [
          { id: "p1", left: "Csúcs", right: "Spitz" },
          { id: "p2", left: "Gleccser", right: "Gletscher" },
          { id: "p3", left: "Völgy", right: "Tal" },
        ]
      }
    ]
  },

  // ── 37. Fejezet: Vásárlás a Piacon ────────────────────
  {
    id: "l69",
    title: "69. Lecke: Zöldség és Gyümölcs",
    description: "A helyi piacon (Määrt).",
    chapter: 37,
    xpReward: 400,
    questions: [
      {
        id: "q205",
        type: "flashcard",
        prompt: "Piac",
        backText: "Määrt",
        phonetic: "Mért",
      },
      {
        id: "q206",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Öpfel'?",
        options: [
          { id: "o1", text: "Alma" },
          { id: "o2", text: "Körte" },
          { id: "o3", text: "Krumpli" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q207",
        type: "match",
        prompt: "Gyümölcsök",
        pairs: [
          { id: "p1", left: "Eper", right: "Ärdbeeri" },
          { id: "p2", left: "Krumpli", right: "Härdöpfel" },
          { id: "p3", left: "Paradicsom", right: "Tomate" },
        ]
      }
    ]
  },
  {
    id: "l70",
    title: "70. Lecke: Alku és Fizetés",
    description: "Mennyibe kerül a helyi áru?",
    chapter: 37,
    xpReward: 410,
    questions: [
      {
        id: "q208",
        type: "flashcard",
        prompt: "Mennyibe kerül?",
        backText: "Was choschtet das?",
        phonetic: "Vász hostet dász?",
      },
      {
        id: "q209",
        type: "multiple_choice",
        prompt: "Hogy mondod: 'Túl drága'?",
        options: [
          { id: "o1", text: "S isch z tüür" },
          { id: "o2", text: "S isch billig" },
          { id: "o3", text: "Ich chaufe es" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q210",
        type: "match",
        prompt: "Fizetés a piacon",
        pairs: [
          { id: "p1", left: "Olcsó", right: "Günschtig" },
          { id: "p2", left: "Drága", right: "Tüür" },
          { id: "p3", left: "Készpénz", right: "Bargäld" },
        ]
      }
    ]
  },

  // ── 38. Fejezet: Váratlan Helyzetek (Vészhelyzet) ────────────────────
  {
    id: "l71",
    title: "71. Lecke: Rendőrség",
    description: "Mit mondj, ha baj van.",
    chapter: 38,
    xpReward: 450,
    questions: [
      {
        id: "q211",
        type: "flashcard",
        prompt: "Rendőrség",
        backText: "Polizei",
        phonetic: "Policej",
      },
      {
        id: "q212",
        type: "multiple_choice",
        prompt: "Hogyan kiabálsz segítségért?",
        options: [
          { id: "o1", text: "Hilfä!" },
          { id: "o2", text: "Grüezi!" },
          { id: "o3", text: "Tschüss!" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q213",
        type: "match",
        prompt: "Bajban",
        pairs: [
          { id: "p1", left: "Ellopták", right: "Gschtohle" },
          { id: "p2", left: "Baleset", right: "Unfall" },
          { id: "p3", left: "Pénztárca", right: "Portmonnaie" },
        ]
      }
    ]
  },
  {
    id: "l72",
    title: "72. Lecke: Mentők és Kórház",
    description: "Orvosi vészhelyzet Svájcban.",
    chapter: 38,
    xpReward: 460,
    questions: [
      {
        id: "q214",
        type: "flashcard",
        prompt: "Mentőautó",
        backText: "Chrankewage",
        phonetic: "Kranke-váge",
      },
      {
        id: "q215",
        type: "multiple_choice",
        prompt: "Hogy mondod: 'Szükségem van egy orvosra!'?",
        options: [
          { id: "o1", text: "Ich bruuche en Dokter!" },
          { id: "o2", text: "Ich go schlafe!" },
          { id: "o3", text: "Es isch guet!" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q216",
        type: "match",
        prompt: "Kórház",
        pairs: [
          { id: "p1", left: "Kórház", right: "Spital" },
          { id: "p2", left: "Sürgősségi", right: "Notfall" },
          { id: "p3", left: "Vérzik", right: "Bluetet" },
        ]
      }
    ]
  },

  // ── 39. Fejezet: Nyelvjárások Különbségei ────────────────────
  {
    id: "l73",
    title: "73. Lecke: Zürich vs. Bern",
    description: "Nem mindenki beszél ugyanúgy Svájcban.",
    chapter: 39,
    xpReward: 500,
    questions: [
      {
        id: "q217",
        type: "flashcard",
        prompt: "Jó napot (Bernben)",
        backText: "Grüessech",
        phonetic: "Grüesszeh",
      },
      {
        id: "q218",
        type: "multiple_choice",
        prompt: "Hogyan köszönnek Zürichben?",
        options: [
          { id: "o1", text: "Grüezi" },
          { id: "o2", text: "Grüessech" },
          { id: "o3", text: "Ciao" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q219",
        type: "match",
        prompt: "Dialektus",
        pairs: [
          { id: "p1", left: "Zürich", right: "Züritüütsch" },
          { id: "p2", left: "Bern", right: "Bärndütsch" },
          { id: "p3", left: "Gyors beszéd", right: "Schnurrä" },
        ]
      }
    ]
  },
  {
    id: "l74",
    title: "74. Lecke: Bázel és Aargau",
    description: "Egy kis ízelítő a határmenti svájciból.",
    chapter: 39,
    xpReward: 550,
    questions: [
      {
        id: "q220",
        type: "flashcard",
        prompt: "Kisfiú (Bázelben)",
        backText: "Bebbi",
        phonetic: "Bebbi",
      },
      {
        id: "q221",
        type: "multiple_choice",
        prompt: "Melyik kanton híres a fura akcentusáról és a fehér zoknikról a viccek szerint?",
        options: [
          { id: "o1", text: "Aargau (Rüebliland)" },
          { id: "o2", text: "Genf" },
          { id: "o3", text: "Graubünden" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q222",
        type: "match",
        prompt: "Szavak",
        pairs: [
          { id: "p1", left: "Bázeli német", right: "Baaseldytsch" },
          { id: "p2", left: "Vicces", right: "Lustig" },
          { id: "p3", left: "Furcsa", right: "Komisch" },
        ]
      }
    ]
  },

  // ── 40. Fejezet: Végső Vizsga (Masterclass) ────────────────────
  {
    id: "l75",
    title: "75. Lecke: A Nagy Svájci Német Teszt",
    description: "Bizonyítsd be, hogy te vagy a legnagyobb Bünzli!",
    chapter: 40,
    xpReward: 1000,
    questions: [
      {
        id: "q223",
        type: "multiple_choice",
        prompt: "Hogy mondod a legtökéletesebb svájci búcsút?",
        options: [
          { id: "o1", text: "Uf Wiederluege, mach's guet!" },
          { id: "o2", text: "Tschüss" },
          { id: "o3", text: "Ciao" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q224",
        type: "flashcard",
        prompt: "Zsebkés (A híres svájci bicska)",
        backText: "Sackmässer",
        phonetic: "Szakk-meszer",
      },
      {
        id: "q225",
        type: "match",
        prompt: "Mindennapi élet",
        pairs: [
          { id: "p1", left: "Kerékpár", right: "Velo" },
          { id: "p2", left: "Hűtőszekrény", right: "Chüelschrank" },
          { id: "p3", left: "Svájci frank", right: "Stutz" },
          { id: "p4", left: "Tejszínhab", right: "Schlagrahm" },
        ]
      }
    ]
  },

  // ── 41. Fejezet: Ingatlan és Lakásvásárlás ────────────────────
  {
    id: "l76",
    title: "76. Lecke: Háznézőben",
    description: "Ingatlanügynök és a lakáskeresés.",
    chapter: 41,
    xpReward: 300,
    questions: [
      {
        id: "q226",
        type: "flashcard",
        prompt: "Ingatlan (Ház)",
        backText: "Immobilie (Huus)",
        phonetic: "Húz",
      },
      {
        id: "q227",
        type: "multiple_choice",
        prompt: "Hogy mondod: 'Szeretném megnézni a lakást'?",
        options: [
          { id: "o1", text: "Ich wett d Wohnig aaluege" },
          { id: "o2", text: "Ich wett schlafe" },
          { id: "o3", text: "Ich bi dusse" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q228",
        type: "match",
        prompt: "Házrészek",
        pairs: [
          { id: "p1", left: "Kert", right: "Garte" },
          { id: "p2", left: "Erkély", right: "Balkon" },
          { id: "p3", left: "Tető", right: "Dach" },
        ]
      }
    ]
  },
  {
    id: "l77",
    title: "77. Lecke: Jelzáloghitel",
    description: "Amikor a banké a házad.",
    chapter: 41,
    xpReward: 320,
    questions: [
      {
        id: "q229",
        type: "flashcard",
        prompt: "Jelzálog",
        backText: "Hypothek",
        phonetic: "Hipoték",
      },
      {
        id: "q230",
        type: "multiple_choice",
        prompt: "Mit jelent a svájci 'Eigäkapital'?",
        options: [
          { id: "o1", text: "Önerő (Saját tőke)" },
          { id: "o2", text: "Kamat" },
          { id: "o3", text: "Adomány" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q231",
        type: "match",
        prompt: "Pénzügy a bankban",
        pairs: [
          { id: "p1", left: "Kamat", right: "Zins" },
          { id: "p2", left: "Szerződés", right: "Vertrag" },
          { id: "p3", left: "Adósság", right: "Schulde" },
        ]
      }
    ]
  },

  // ── 42. Fejezet: Pénzügyi Szaknyelv ────────────────────
  {
    id: "l78",
    title: "78. Lecke: Részvények",
    description: "A zürichi Paradeplatz világa.",
    chapter: 42,
    xpReward: 330,
    questions: [
      {
        id: "q232",
        type: "flashcard",
        prompt: "Részvény",
        backText: "Aktie",
        phonetic: "Akcie",
      },
      {
        id: "q233",
        type: "multiple_choice",
        prompt: "Hogy mondják a 'Tőzsde' szót?",
        options: [
          { id: "o1", text: "Börse" },
          { id: "o2", text: "Määrt" },
          { id: "o3", text: "Lade" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q234",
        type: "match",
        prompt: "Befektetések",
        pairs: [
          { id: "p1", left: "Nyereség", right: "Gwünn" },
          { id: "p2", left: "Veszteség", right: "Verluscht" },
          { id: "p3", left: "Osztalék", right: "Dividände" },
        ]
      }
    ]
  },
  {
    id: "l79",
    title: "79. Lecke: Megtakarítások",
    description: "Säule 3a és a nyugdíj.",
    chapter: 42,
    xpReward: 350,
    questions: [
      {
        id: "q235",
        type: "flashcard",
        prompt: "Nyugdíj",
        backText: "Ränte",
        phonetic: "Rente",
      },
      {
        id: "q236",
        type: "multiple_choice",
        prompt: "Mit takar a 'Säule 3a'?",
        options: [
          { id: "o1", text: "Önkéntes magánnyugdíjpénztár" },
          { id: "o2", text: "Balesetbiztosítás" },
          { id: "o3", text: "Autóhitel" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q237",
        type: "match",
        prompt: "Spórolás",
        pairs: [
          { id: "p1", left: "Megtakarítani", right: "Spara" },
          { id: "p2", left: "Számla", right: "Konto" },
          { id: "p3", left: "Jövő", right: "Zuekunft" },
        ]
      }
    ]
  },

  // ── 43. Fejezet: Politika és Szavazás ────────────────────
  {
    id: "l80",
    title: "80. Lecke: A Svájci Demokrácia",
    description: "Közvetlen demokrácia a mindennapokban.",
    chapter: 43,
    xpReward: 360,
    questions: [
      {
        id: "q238",
        type: "flashcard",
        prompt: "Szavazás (Voksolás)",
        backText: "Abstimmig",
        phonetic: "Abs-timmig",
      },
      {
        id: "q239",
        type: "multiple_choice",
        prompt: "Mit csinálnak a svájciak majdnem minden hónapban?",
        options: [
          { id: "o1", text: "Szavaznak valamilyen kérdésről" },
          { id: "o2", text: "Síelnek" },
          { id: "o3", text: "Tüntetnek" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q240",
        type: "match",
        prompt: "Politika",
        pairs: [
          { id: "p1", left: "Törvény", right: "Gsetz" },
          { id: "p2", left: "Állam", right: "Staat" },
          { id: "p3", left: "Nép", right: "Volk" },
        ]
      }
    ]
  },
  {
    id: "l81",
    title: "81. Lecke: A Szövetségi Tanács",
    description: "A svájci kormány.",
    chapter: 43,
    xpReward: 380,
    questions: [
      {
        id: "q241",
        type: "flashcard",
        prompt: "Svájci kormány (Szövetségi Tanács)",
        backText: "Bundesrot",
        phonetic: "Bundesz-rót",
      },
      {
        id: "q242",
        type: "multiple_choice",
        prompt: "Hány tagja van a Bundesrat-nak (Kormánynak)?",
        options: [
          { id: "o1", text: "Hét (Sibe)" },
          { id: "o2", text: "Egy (Eis)" },
          { id: "o3", text: "Tíz (Zäh)" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q243",
        type: "match",
        prompt: "Hivatalok",
        pairs: [
          { id: "p1", left: "Elnök", right: "Presidänt" },
          { id: "p2", left: "Kanton", right: "Kanton" },
          { id: "p3", left: "Község", right: "Gmeind" },
        ]
      }
    ]
  },

  // ── 44. Fejezet: Gyerekek és Iskola ────────────────────
  {
    id: "l82",
    title: "82. Lecke: Óvoda",
    description: "Az első lépések a svájci rendszerben.",
    chapter: 44,
    xpReward: 400,
    questions: [
      {
        id: "q244",
        type: "flashcard",
        prompt: "Óvoda",
        backText: "Chindsgi",
        phonetic: "Khin-dzgi",
      },
      {
        id: "q245",
        type: "multiple_choice",
        prompt: "Hogyan mondják a 'Gyerekek' szót?",
        options: [
          { id: "o1", text: "Chind" },
          { id: "o2", text: "Erwachseni" },
          { id: "o3", text: "Lüüt" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q246",
        type: "match",
        prompt: "Játékok",
        pairs: [
          { id: "p1", left: "Játszani", right: "Spile" },
          { id: "p2", left: "Játékszer", right: "Spilzüüg" },
          { id: "p3", left: "Udvar", right: "Pausenplatz" },
        ]
      }
    ]
  },
  {
    id: "l83",
    title: "83. Lecke: Iskola",
    description: "Szülői értekezlet és házi feladat.",
    chapter: 44,
    xpReward: 420,
    questions: [
      {
        id: "q247",
        type: "flashcard",
        prompt: "Iskola",
        backText: "Schuel",
        phonetic: "Suel",
      },
      {
        id: "q248",
        type: "multiple_choice",
        prompt: "Mit jelent az 'Uufgab' (vagy Huusufgab)?",
        options: [
          { id: "o1", text: "Házi feladat" },
          { id: "o2", text: "Tízórai" },
          { id: "o3", text: "Késés" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q249",
        type: "match",
        prompt: "Iskolai kifejezések",
        pairs: [
          { id: "p1", left: "Tanár", right: "Lehrer" },
          { id: "p2", left: "Diák", right: "Schüeler" },
          { id: "p3", left: "Jegy / Osztályzat", right: "Note" },
        ]
      }
    ]
  },

  // ── 45. Fejezet: Hadsereg és Védelem ────────────────────
  {
    id: "l84",
    title: "84. Lecke: Sorkatonaság",
    description: "Zöld ruhában a hegyek között.",
    chapter: 45,
    xpReward: 440,
    questions: [
      {
        id: "q250",
        type: "flashcard",
        prompt: "Katonaság (Hadsereg)",
        backText: "Militär",
        phonetic: "Militér",
      },
      {
        id: "q251",
        type: "multiple_choice",
        prompt: "Hogy hívják a katonai hátizsákot Svájcban?",
        options: [
          { id: "o1", text: "Rucksack" },
          { id: "o2", text: "Sack" },
          { id: "o3", text: "Täsche" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q252",
        type: "match",
        prompt: "Hadsereg",
        pairs: [
          { id: "p1", left: "Fegyver", right: "Waffe" },
          { id: "p2", left: "Lőni", right: "Schiesse" },
          { id: "p3", left: "Egyenruha", right: "Uniform" },
        ]
      }
    ]
  },
  {
    id: "l85",
    title: "85. Lecke: Az Óvóhely (Bunker)",
    description: "Minden háznak lennie kell egynek.",
    chapter: 45,
    xpReward: 450,
    questions: [
      {
        id: "q253",
        type: "flashcard",
        prompt: "Pince / Óvóhely",
        backText: "Chäller / Luftschutzruum",
        phonetic: "Keller / Luft-sutz-rúm",
      },
      {
        id: "q254",
        type: "multiple_choice",
        prompt: "Mi található majdnem minden svájci ház pincéjében?",
        options: [
          { id: "o1", text: "Egy atombiztos óvóhely" },
          { id: "o2", text: "Egy medence" },
          { id: "o3", text: "Egy bankfiók" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q255",
        type: "match",
        prompt: "Vészhelyzeti dolgok",
        pairs: [
          { id: "p1", left: "Sziréna", right: "Sirene" },
          { id: "p2", left: "Biztonság", right: "Sicherheit" },
          { id: "p3", left: "Veszély", right: "Gfohr" },
        ]
      }
    ]
  },

  // ── 46. Fejezet: Barkácsolás és Kert ────────────────────
  {
    id: "l86",
    title: "86. Lecke: Szerszámok",
    description: "Ha szerelni kell valamit.",
    chapter: 46,
    xpReward: 470,
    questions: [
      {
        id: "q256",
        type: "flashcard",
        prompt: "Kalapács",
        backText: "Hammer",
        phonetic: "Hammer",
      },
      {
        id: "q257",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Wärchzüüg'?",
        options: [
          { id: "o1", text: "Szerszám(ok)" },
          { id: "o2", text: "Autó" },
          { id: "o3", text: "Játék" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q258",
        type: "match",
        prompt: "Szerelés",
        pairs: [
          { id: "p1", left: "Csavar", right: "Schruube" },
          { id: "p2", left: "Szeg", right: "Nagel" },
          { id: "p3", left: "Fúrógép", right: "Bohrmaschine" },
        ]
      }
    ]
  },
  {
    id: "l87",
    title: "87. Lecke: A Kertben",
    description: "Fűnyírás, de csak csendben!",
    chapter: 46,
    xpReward: 480,
    questions: [
      {
        id: "q259",
        type: "flashcard",
        prompt: "Fűnyíró",
        backText: "Rase-mäier",
        phonetic: "Ráze-méjer",
      },
      {
        id: "q260",
        type: "multiple_choice",
        prompt: "Mikor szigorúan tilos füvet nyírni Svájcban?",
        options: [
          { id: "o1", text: "Vasárnap (Sunntig)" },
          { id: "o2", text: "Hétfőn" },
          { id: "o3", text: "Szerdán" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q261",
        type: "match",
        prompt: "Kerti munkák",
        pairs: [
          { id: "p1", left: "Fű", right: "Graas" },
          { id: "p2", left: "Virág", right: "Blueme" },
          { id: "p3", left: "Fa", right: "Baum" },
        ]
      }
    ]
  },

  // ── 47. Fejezet: Sportok II. - Nyár ────────────────────
  {
    id: "l88",
    title: "88. Lecke: Hegymászás",
    description: "Túrázás az Alpokban.",
    chapter: 47,
    xpReward: 500,
    questions: [
      {
        id: "q262",
        type: "flashcard",
        prompt: "Túrázni",
        backText: "Wandere",
        phonetic: "Vandere",
      },
      {
        id: "q263",
        type: "multiple_choice",
        prompt: "Hogy mondják a túrabakancsot?",
        options: [
          { id: "o1", text: "Wanderschueh" },
          { id: "o2", text: "Turnschueh" },
          { id: "o3", text: "Finke" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q264",
        type: "match",
        prompt: "Hegyi szavak",
        pairs: [
          { id: "p1", left: "Hátizsák", right: "Rucksack" },
          { id: "p2", left: "Ösvény", right: "Wäg" },
          { id: "p3", left: "Kő / Szikla", right: "Stei" },
        ]
      }
    ]
  },
  {
    id: "l89",
    title: "89. Lecke: Kerékpározás",
    description: "Két keréken a hegyekben.",
    chapter: 47,
    xpReward: 520,
    questions: [
      {
        id: "q265",
        type: "flashcard",
        prompt: "Bicikli",
        backText: "Velo",
        phonetic: "Vélo",
      },
      {
        id: "q266",
        type: "multiple_choice",
        prompt: "Mit csinálsz egy Veló-val?",
        options: [
          { id: "o1", text: "Velo fahre (Biciklizem)" },
          { id: "o2", text: "Velo ässe (Megeszem)" },
          { id: "o3", text: "Velo trinke (Megiszom)" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q267",
        type: "match",
        prompt: "Biciklis alkatrészek",
        pairs: [
          { id: "p1", left: "Kerék", right: "Rad" },
          { id: "p2", left: "Sisak", right: "Hälm" },
          { id: "p3", left: "Elektromos bicikli", right: "E-Bike" },
        ]
      }
    ]
  },

  // ── 48. Fejezet: Kórházban Haladó ────────────────────
  {
    id: "l90",
    title: "90. Lecke: Műtét",
    description: "Amikor nagy a baj.",
    chapter: 48,
    xpReward: 550,
    questions: [
      {
        id: "q268",
        type: "flashcard",
        prompt: "Műtét",
        backText: "Operation",
        phonetic: "Operació",
      },
      {
        id: "q269",
        type: "multiple_choice",
        prompt: "Hogy mondod: 'Fájdalmam van'?",
        options: [
          { id: "o1", text: "Ich ha Schmärze" },
          { id: "o2", text: "Ich ha Hunger" },
          { id: "o3", text: "Ich bi gsund" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q270",
        type: "match",
        prompt: "Testrészek II",
        pairs: [
          { id: "p1", left: "Vér", right: "Bluet" },
          { id: "p2", left: "Csont", right: "Chnoche" },
          { id: "p3", left: "Szív", right: "Härz" },
        ]
      }
    ]
  },
  {
    id: "l91",
    title: "91. Lecke: A Gyógyszertárban",
    description: "Receptek és tabletták.",
    chapter: 48,
    xpReward: 560,
    questions: [
      {
        id: "q271",
        type: "flashcard",
        prompt: "Gyógyszertár",
        backText: "Apotheke",
        phonetic: "Apotéke",
      },
      {
        id: "q272",
        type: "multiple_choice",
        prompt: "Mit kapsz a gyógyszertárban?",
        options: [
          { id: "o1", text: "Tablette / Medikamänt" },
          { id: "o2", text: "Brot" },
          { id: "o3", text: "Bier" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q273",
        type: "match",
        prompt: "Betegségek",
        pairs: [
          { id: "p1", left: "Láz", right: "Fieber" },
          { id: "p2", left: "Köhögés", right: "Hueschte" },
          { id: "p3", left: "Nátha / Megfázás", right: "Schnuppe" },
        ]
      }
    ]
  },

  // ── 49. Fejezet: Üzleti Tárgyalások ────────────────────
  {
    id: "l92",
    title: "92. Lecke: Szerződéskötés",
    description: "Komoly üzlet a svájciakkal.",
    chapter: 49,
    xpReward: 600,
    questions: [
      {
        id: "q274",
        type: "flashcard",
        prompt: "Szerződés",
        backText: "Vertrag",
        phonetic: "Fertrág",
      },
      {
        id: "q275",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Firma'?",
        options: [
          { id: "o1", text: "Cég / Vállalat" },
          { id: "o2", text: "Iskola" },
          { id: "o3", text: "Kórház" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q276",
        type: "match",
        prompt: "Üzlet",
        pairs: [
          { id: "p1", left: "Aláírás", right: "Underschrift" },
          { id: "p2", left: "Főnök", right: "Chef" },
          { id: "p3", left: "Megbeszélés", right: "Sitzig" },
        ]
      }
    ]
  },
  {
    id: "l93",
    title: "93. Lecke: Munkahelyi Email",
    description: "Hogyan írj a főnöködnek?",
    chapter: 49,
    xpReward: 620,
    questions: [
      {
        id: "q277",
        type: "flashcard",
        prompt: "Tisztelt Hölgyem/Uram (hivatalos email kezdés)",
        backText: "Sehr geehrti Dame und Herre",
        phonetic: "Zér ge-érti dáme und herre",
      },
      {
        id: "q278",
        type: "multiple_choice",
        prompt: "Hogyan zársz le egy teljesen hivatalos levelet?",
        options: [
          { id: "o1", text: "Fründlichi Grüess" },
          { id: "o2", text: "Tschüssli" },
          { id: "o3", text: "Bis bald" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q279",
        type: "match",
        prompt: "Irodai munka",
        pairs: [
          { id: "p1", left: "Nyomtató", right: "Drucker" },
          { id: "p2", left: "Asztal", right: "Tisch" },
          { id: "p3", left: "Kolléga", right: "Kolleg / Mitarbeiter" },
        ]
      }
    ]
  },

  // ── 50. Fejezet: Svájci Humor ────────────────────
  {
    id: "l94",
    title: "94. Lecke: Viccek",
    description: "Hogyan nevetnek Svájcban?",
    chapter: 50,
    xpReward: 650,
    questions: [
      {
        id: "q280",
        type: "flashcard",
        prompt: "Vicc",
        backText: "Witz",
        phonetic: "Vic",
      },
      {
        id: "q281",
        type: "multiple_choice",
        prompt: "Mit mondanak a svájciak, if valami 'vicces'?",
        options: [
          { id: "o1", text: "S isch luschtig" },
          { id: "o2", text: "S isch truurig" },
          { id: "o3", text: "S isch tüür" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q282",
        type: "match",
        prompt: "Érzelmek a viccekben",
        pairs: [
          { id: "p1", left: "Nevetni", right: "Lache" },
          { id: "p2", left: "Mosolyogni", right: "Lächle" },
          { id: "p3", left: "Sírtam a nevetéstől", right: "Träne glachet" },
        ]
      }
    ]
  },
  {
    id: "l95",
    title: "95. Lecke: Svájci Irónia",
    description: "Félig komoly, félig vicc.",
    chapter: 50,
    xpReward: 680,
    questions: [
      {
        id: "q283",
        type: "flashcard",
        prompt: "Tényleg? (Irónikusan)",
        backText: "Wirklich? / Äbä?",
        phonetic: "Virk-lih / Ebe?",
      },
      {
        id: "q284",
        type: "multiple_choice",
        prompt: "A svájciak humorukról melyik jelző illik a legjobban?",
        options: [
          { id: "o1", text: "Száraz és visszafogott" },
          { id: "o2", text: "Nagyon hangos" },
          { id: "o3", text: "Nincs humoruk" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q285",
        type: "match",
        prompt: "Reakciók",
        pairs: [
          { id: "p1", left: "Pontosan (Igen)", right: "Genau" },
          { id: "p2", left: "Hát persze", right: "Sicher" },
          { id: "p3", left: "Meglepetés", right: "Überraschig" },
        ]
      }
    ]
  },

  // ── 51. Fejezet: Mesteri Kifejezések ────────────────────
  {
    id: "l96",
    title: "96. Lecke: A híres Chuchichäschtli",
    description: "A szó, amit minden külföldivel kimondatnak.",
    chapter: 51,
    xpReward: 750,
    questions: [
      {
        id: "q286",
        type: "flashcard",
        prompt: "Konyhaszekrény",
        backText: "Chuchichäschtli",
        phonetic: "Huhi-khestli",
      },
      {
        id: "q287",
        type: "multiple_choice",
        prompt: "Miért szeretik a svájciak a 'Chuchichäschtli' szót?",
        options: [
          { id: "o1", text: "Mert a 'ch' hangokat nagyon nehéz kimondani külföldiként" },
          { id: "o2", text: "Mert szeretnek enni" },
          { id: "o3", text: "Mert a szekrények drágák" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q288",
        type: "match",
        prompt: "Konyha hardcore",
        pairs: [
          { id: "p1", left: "Konyha", right: "Chuchi" },
          { id: "p2", left: "Szekrényke", right: "Chäschtli" },
          { id: "p3", left: "Mosogatógép", right: "Gschirrspüeler" },
        ]
      }
    ]
  },
  {
    id: "l97",
    title: "97. Lecke: A Bünzli mentalitás 2.0",
    description: "Légy te is büszke Bünzli.",
    chapter: 51,
    xpReward: 800,
    questions: [
      {
        id: "q289",
        type: "flashcard",
        prompt: "Nyárspolgár / Maximalista",
        backText: "Bünzli",
        phonetic: "Büncli",
      },
      {
        id: "q290",
        type: "multiple_choice",
        prompt: "Mit csinál a Bünzli, ha meglátja, hogy rosszul parkoltál?",
        options: [
          { id: "o1", text: "Hagy egy passzív-agresszív cetlit a szélvédődön" },
          { id: "o2", text: "Lemossa az autódat" },
          { id: "o3", text: "Nem csinál semmit" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q291",
        type: "match",
        prompt: "Bünzli dolgok",
        pairs: [
          { id: "p1", left: "Cetli", right: "Zettel" },
          { id: "p2", left: "Panasz", right: "Reklamation" },
          { id: "p3", left: "Szabály", right: "Regle" },
        ]
      }
    ]
  },

  // ── 52. Fejezet: A Végső Kihívás ────────────────────
  {
    id: "l98",
    title: "98. Lecke: Dialektus Turmix",
    description: "Találd ki, honnan jött ez a szó!",
    chapter: 52,
    xpReward: 900,
    questions: [
      {
        id: "q292",
        type: "flashcard",
        prompt: "Szia (Berniül)",
        backText: "Tschou",
        phonetic: "Csoó",
      },
      {
        id: "q293",
        type: "multiple_choice",
        prompt: "Mit jelent az 'Uf Wiederluege'?",
        options: [
          { id: "o1", text: "Viszontlátásra" },
          { id: "o2", text: "Jó reggelt" },
          { id: "o3", text: "Köszönöm" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q294",
        type: "match",
        prompt: "Üdvözlések mix",
        pairs: [
          { id: "p1", left: "Szia (Zürich)", right: "Hoi / Sali" },
          { id: "p2", left: "Jó napot (Bern)", right: "Grüessech" },
          { id: "p3", left: "Jó napot (Zürich)", right: "Grüezi" },
        ]
      }
    ]
  },
  {
    id: "l99",
    title: "99. Lecke: Integráció",
    description: "Majdnem svájci vagy.",
    chapter: 52,
    xpReward: 1200,
    questions: [
      {
        id: "q295",
        type: "flashcard",
        prompt: "Külföldi (nem svájci)",
        backText: "Uusländer",
        phonetic: "Uusz-lender",
      },
      {
        id: "q296",
        type: "multiple_choice",
        prompt: "Mit esznek a svájciak minden vasárnap reggel?",
        options: [
          { id: "o1", text: "Zopf (Fonott kalács)" },
          { id: "o2", text: "Pizza" },
          { id: "o3", text: "Rizs" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q297",
        type: "match",
        prompt: "Kultúra",
        pairs: [
          { id: "p1", left: "Sajt", right: "Chääs" },
          { id: "p2", left: "Fonott kalács", right: "Zopf" },
          { id: "p3", left: "Csokoládé", right: "Schoggi" },
        ]
      }
    ]
  },
  {
    id: "l100",
    title: "100. Lecke: Az Állampolgársági Teszt",
    description: "A mindent eldöntő, 2000 XP-s Végső Vizsga.",
    chapter: 52,
    xpReward: 2000,
    questions: [
      {
        id: "q298",
        type: "multiple_choice",
        prompt: "Melyik évben alapították Svájcot (Rütlischwur)?",
        options: [
          { id: "o1", text: "1291" },
          { id: "o2", text: "1848" },
          { id: "o3", text: "1990" }
        ],
        correctOptionId: "o1",
      },
      {
        id: "q299",
        type: "flashcard",
        prompt: "Svájci útlevél",
        backText: "Schwiizer Pass",
        phonetic: "Svíjcer Passz",
      },
      {
        id: "q300",
        type: "match",
        prompt: "A legfontosabb szimbólumok",
        pairs: [
          { id: "p1", left: "Zászló", right: "Fahne" },
          { id: "p2", left: "Kereszt", right: "Chrüz" },
          { id: "p3", left: "Alpok", right: "Alpe" },
          { id: "p4", left: "Nemzeti ünnep", right: "Bundesfiir" },
        ]
      }
    ]
  }
];
