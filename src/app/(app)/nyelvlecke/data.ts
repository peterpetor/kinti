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
  }
];
