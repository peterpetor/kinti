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
  }
];
