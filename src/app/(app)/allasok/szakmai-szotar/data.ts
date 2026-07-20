export type QuestionType = "multiple_choice" | "flashcard" | "match";

export type Option = {
  id: string;
  text: string;
};

export type MatchPair = {
  id: string;
  left: string; // Hungarian
  right: string; // Swiss German / German
};

export type Question = {
  id: string;
  type: QuestionType;
  prompt: string;
  options?: Option[];
  correctOptionId?: string;
  backText?: string;
  phonetic?: string;
  pairs?: MatchPair[];
};

export type Lesson = {
  id: string;
  title: string;
  description: string;
  industry: string;
  xpReward: number;
  isPro?: boolean;
  /** TTS-nyelv a kiejtéshez (default: de-CH). Ország szerint: de-AT/de-DE/nl-NL. */
  lang?: string;
  questions: Question[];
};

export const INDUSTRY_LESSONS: Lesson[] = [
  // ── 1. Építőipar (Baubranche) ──────────────────────────────
  {
    id: "bau_1",
    title: "Építőipari Alapok 1.",
    description: "Alapvető szerszámok és kifejezések a svájci építkezéseken (Baustelle).",
    industry: "Építőipar (Baubranche)",
    xpReward: 15,
    isPro: true,
    questions: [
      {
        id: "bau_q1",
        type: "flashcard",
        prompt: "Fúrógép",
        backText: "Bohrmaschine (Svájcban gyakran: Bohrmaschine / Borer)",
        phonetic: "Bórmá-sínö",
      },
      {
        id: "bau_q2",
        type: "flashcard",
        prompt: "Talicska",
        backText: "Karette",
        phonetic: "Ká-ret-te",
      },
      {
        id: "bau_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Polier' szó a svájci építkezésen?",
        options: [
          { id: "a", text: "Művezető / Építésvezető" },
          { id: "b", text: "Rendőr" },
          { id: "c", text: "Takarító" },
        ],
        correctOptionId: "a",
      },
      {
        id: "bau_q4",
        type: "flashcard",
        prompt: "Létra",
        backText: "Leiter",
        phonetic: "Láj-ter",
      },
      {
        id: "bau_q5",
        type: "match",
        prompt: "Párosítsd a szerszámokat!",
        pairs: [
          { id: "p1", left: "Kalapács", right: "Hammer" },
          { id: "p2", left: "Csavarhúzó", right: "Schraubenzieher" },
          { id: "p3", left: "Mérőszalag", right: "Massband (Rollmeter)" },
          { id: "p4", left: "Vízmérték", right: "Wasserwaage" },
        ],
      },
    ],
  },
  
  // ── 2. Vendéglátás (Gastronomie) ──────────────────────────────
  {
    id: "gastro_1",
    title: "Vendéglátás: Rendelésfelvétel",
    description: "Hogyan szolgálj ki svájci vendégeket egy étteremben?",
    industry: "Vendéglátás (Gastronomie)",
    xpReward: 15,
    isPro: true,
    questions: [
      {
        id: "gas_q1",
        type: "flashcard",
        prompt: "Mit hozhatok inni?",
        backText: "Was darf ich Ihne zum Trinke bringe?",
        phonetic: "Vász dárf ih inö cum trinkö bringö?",
      },
      {
        id: "gas_q2",
        type: "flashcard",
        prompt: "Fizetni szeretnék, kérem.",
        backText: "Zahle, bitte. (Vagy: Zahlen, bitte)",
        phonetic: "Cá-lö, bit-te",
      },
      {
        id: "gas_q3",
        type: "multiple_choice",
        prompt: "Hogyan kérdezed meg, hogy ízlett-e az étel?",
        options: [
          { id: "a", text: "Isch es guet gsi?" },
          { id: "b", text: "Was wänd Sie?" },
          { id: "c", text: "Scho fertig?" },
        ],
        correctOptionId: "a",
      },
      {
        id: "gas_q4",
        type: "flashcard",
        prompt: "Borravaló",
        backText: "Trinkgeld",
        phonetic: "Trink-gelt",
      },
      {
        id: "gas_q5",
        type: "match",
        prompt: "Párosítsd az éttermi szavakat!",
        pairs: [
          { id: "p1", left: "Étlap", right: "Speisekarte" },
          { id: "p2", left: "Számla", right: "Rechnung" },
          { id: "p3", left: "Kés", right: "Mässer" },
          { id: "p4", left: "Villa", right: "Gable" },
        ],
      },
    ],
  },

  // ── 3. Egészségügy (Pflege & Gesundheit) ──────────────────────
  {
    id: "pflege_1",
    title: "Ápolás és Egészségügy 1.",
    description: "Alapvető kifejezések az idősgondozásban és kórházban.",
    industry: "Egészségügy (Gesundheitswesen)",
    xpReward: 15,
    isPro: true,
    questions: [
      {
        id: "pfl_q1",
        type: "flashcard",
        prompt: "Fájdalomcsillapító",
        backText: "Schmerzmittel",
        phonetic: "Smerc-mit-tel",
      },
      {
        id: "pfl_q2",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Rollstuhl'?",
        options: [
          { id: "a", text: "Kerekesszék" },
          { id: "b", text: "Mankó" },
          { id: "c", text: "Injekció" },
        ],
        correctOptionId: "a",
      },
      {
        id: "pfl_q3",
        type: "flashcard",
        prompt: "Van fájdalma?",
        backText: "Händ Sie Schmerze?",
        phonetic: "Hent zí Smercö?",
      },
    ],
  },

  // ── 4. Kiskereskedelem (Verkauf) ────────────────────────────────
  {
    id: "verk_1",
    title: "Kiskereskedelem Alapok 1.",
    description: "Pénztár, polc és vevőkiszolgálás egy svájci boltban.",
    industry: "Kiskereskedelem (Verkauf)",
    xpReward: 15,
    isPro: true,
    questions: [
      {
        id: "verk_q1",
        type: "flashcard",
        prompt: "Segíthetek?",
        backText: "Chan ich Ihne hälfe?",
        phonetic: "Hán ih í-ne hel-fe?",
      },
      {
        id: "verk_q2",
        type: "flashcard",
        prompt: "Blokk / nyugta",
        backText: "Bon (a svájci boltokban így hívják a nyugtát; Németországban: Kassenbon)",
        phonetic: "Bon",
      },
      {
        id: "verk_q3",
        type: "multiple_choice",
        prompt: "Mit jelent az 'Umkleidekabine'?",
        options: [
          { id: "a", text: "Próbafülke" },
          { id: "b", text: "Raktár" },
          { id: "c", text: "Pénztár" },
        ],
        correctOptionId: "a",
      },
      {
        id: "verk_q4",
        type: "flashcard",
        prompt: "Van elég aprópénze?",
        backText: "Händ Sie's Passende?",
        phonetic: "Hent zísz pász-szen-de?",
      },
      {
        id: "verk_q5",
        type: "match",
        prompt: "Párosítsd a boltos szavakat!",
        pairs: [
          { id: "p1", left: "Polc", right: "Regal" },
          { id: "p2", left: "Vevő", right: "Kunde" },
          { id: "p3", left: "Árengedmény", right: "Rabatt" },
          { id: "p4", left: "Készlet", right: "Lager" },
        ],
      },
    ],
  },

  // ── 5. Raktár és Logisztika (Lager) ─────────────────────────────
  {
    id: "lager_1",
    title: "Raktár és Logisztika Alapok 1.",
    description: "Targonca, raklap és szállítás egy svájci raktárban.",
    industry: "Raktár (Lager)",
    xpReward: 15,
    isPro: true,
    questions: [
      {
        id: "lager_q1",
        type: "flashcard",
        prompt: "Targonca",
        backText: "Gabelstapler",
        phonetic: "Gá-bel-stáp-ler",
      },
      {
        id: "lager_q2",
        type: "flashcard",
        prompt: "Raklap",
        backText: "Palette",
        phonetic: "Pá-let-te",
      },
      {
        id: "lager_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Lieferschein'?",
        options: [
          { id: "a", text: "Szállítólevél" },
          { id: "b", text: "Munkaszerződés" },
          { id: "c", text: "Fizetési csekk" },
        ],
        correctOptionId: "a",
      },
      {
        id: "lager_q4",
        type: "flashcard",
        prompt: "Vigyázz, nehéz!",
        backText: "Vorsicht, s'isch schwär!",
        phonetic: "Fór-ziht, sis svér!",
      },
      {
        id: "lager_q5",
        type: "match",
        prompt: "Párosítsd a raktáros szavakat!",
        pairs: [
          { id: "p1", left: "Raktárkészlet", right: "Lagerbestand" },
          { id: "p2", left: "Vonalkód-olvasó", right: "Scanner" },
          { id: "p3", left: "Komissiózás", right: "Kommissionierung" },
          { id: "p4", left: "Rakomány", right: "Ladung" },
        ],
      },
    ],
  },

  // ── 6. Takarítás (Reinigung) ────────────────────────────────────
  {
    id: "reinig_1",
    title: "Takarítás Alapok 1.",
    description: "Tisztítószerek és biztonsági alapszavak takarítóknak.",
    industry: "Takarítás (Reinigung)",
    xpReward: 15,
    isPro: true,
    questions: [
      {
        id: "reinig_q1",
        type: "flashcard",
        prompt: "Vödör",
        backText: "Eimer",
        phonetic: "Áj-mer",
      },
      {
        id: "reinig_q2",
        type: "flashcard",
        prompt: "Porszívó",
        backText: "Staubsauger",
        phonetic: "Stáub-záu-ger",
      },
      {
        id: "reinig_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Desinfektionsmittel'?",
        options: [
          { id: "a", text: "Fertőtlenítőszer" },
          { id: "b", text: "Mosószer" },
          { id: "c", text: "Padlóviasz" },
        ],
        correctOptionId: "a",
      },
      {
        id: "reinig_q4",
        type: "flashcard",
        prompt: "Vigyázat, csúszós a padló!",
        backText: "Vorsicht, dä Bode isch glitschig!",
        phonetic: "Fór-ziht, de bó-de is glít-sih!",
      },
      {
        id: "reinig_q5",
        type: "match",
        prompt: "Párosítsd a takarítós szavakat!",
        pairs: [
          { id: "p1", left: "Gumikesztyű", right: "Gummihandschuhe" },
          { id: "p2", left: "Szemeteszsák", right: "Müllsack" },
          { id: "p3", left: "Felmosó", right: "Wischmopp" },
          { id: "p4", left: "Ablaktisztító", right: "Fensterreiniger" },
        ],
      },
    ],
  },

  // ── 7. Gyártás (Produktion) ─────────────────────────────────────
  {
    id: "prod_1",
    title: "Gyártás Alapok 1.",
    description: "Futószalag, alkatrészek és biztonsági szabályok egy üzemben.",
    industry: "Gyártás (Produktion)",
    xpReward: 15,
    isPro: true,
    questions: [
      {
        id: "prod_q1",
        type: "flashcard",
        prompt: "Futószalag",
        backText: "Fliessband (svájci írásmód — Németországban/Ausztriában: Fließband)",
        phonetic: "Flísz-bánt",
      },
      {
        id: "prod_q2",
        type: "flashcard",
        prompt: "Alkatrész",
        backText: "Bauteil",
        phonetic: "Báu-tájl",
      },
      {
        id: "prod_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Schichtleiter'?",
        options: [
          { id: "a", text: "Műszakvezető" },
          { id: "b", text: "Gépkezelő" },
          { id: "c", text: "Takarító" },
        ],
        correctOptionId: "a",
      },
      {
        id: "prod_q4",
        type: "flashcard",
        prompt: "Kapcsold ki a gépet!",
        backText: "Schalt d'Maschine us!",
        phonetic: "Sált d'má-sí-ne usz!",
      },
      {
        id: "prod_q5",
        type: "match",
        prompt: "Párosítsd az üzemi szavakat!",
        pairs: [
          { id: "p1", left: "Védőszemüveg", right: "Schutzbrille" },
          { id: "p2", left: "Éjszakai műszak", right: "Nachtschicht" },
          { id: "p3", left: "Minőségellenőrzés", right: "Qualitätskontrolle" },
          { id: "p4", left: "Gyártósor", right: "Produktionslinie" },
        ],
      },
    ],
  },

  // ── 8. Szépségipar (Coiffeur) ───────────────────────────────────
  {
    id: "coif_1",
    title: "Fodrászat Alapok 1.",
    description: "Alapvető szerszámok és kifejezések egy svájci fodrászatban.",
    industry: "Szépségipar (Coiffeur)",
    xpReward: 15,
    isPro: true,
    questions: [
      {
        id: "coif_q1",
        type: "flashcard",
        prompt: "Olló",
        backText: "Schere",
        phonetic: "Sé-re",
      },
      {
        id: "coif_q2",
        type: "flashcard",
        prompt: "Hajszárító",
        backText: "Föhn",
        phonetic: "Főn",
      },
      {
        id: "coif_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Coiffeur'?",
        options: [
          { id: "a", text: "Fodrász / Fodrászat" },
          { id: "b", text: "Kozmetikus" },
          { id: "c", text: "Manikűrös" },
        ],
        correctOptionId: "a",
      },
      {
        id: "coif_q4",
        type: "flashcard",
        prompt: "Hogy szeretné vágatni a haját?",
        backText: "Wie hätted Sie gern Ihri Haar gschnitte?",
        phonetic: "Ví het-ted zí gern í-ri hár gsnit-te?",
      },
      {
        id: "coif_q5",
        type: "match",
        prompt: "Párosítsd a fodrászati szavakat!",
        pairs: [
          { id: "p1", left: "Fésű", right: "Kamm" },
          { id: "p2", left: "Hajfesték", right: "Haarfarbe" },
          { id: "p3", left: "Samponozás", right: "Haare waschen" },
          { id: "p4", left: "Borotva", right: "Rasierer" },
        ],
      },
    ],
  },

  // ── 9. Szállítás (Fahrer) ───────────────────────────────────────
  {
    id: "fahrer_1",
    title: "Szállítás és Kézbesítés Alapok 1.",
    description: "Alapvető kifejezések futárként vagy sofőrként Svájcban.",
    industry: "Szállítás (Fahrer)",
    xpReward: 15,
    isPro: true,
    questions: [
      {
        id: "fahrer_q1",
        type: "flashcard",
        prompt: "Jogosítvány",
        backText: "Führerschein",
        phonetic: "Fü-rer-sájn",
      },
      {
        id: "fahrer_q2",
        type: "flashcard",
        prompt: "Csomag",
        backText: "Paket",
        phonetic: "Pá-két",
      },
      {
        id: "fahrer_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Lieferung'?",
        options: [
          { id: "a", text: "Kézbesítés / Szállítás" },
          { id: "b", text: "Számla" },
          { id: "c", text: "Útvonal" },
        ],
        correctOptionId: "a",
      },
      {
        id: "fahrer_q4",
        type: "flashcard",
        prompt: "Hol írjam alá?",
        backText: "Wo söll ich unterschriibe?",
        phonetic: "Vó söl ih un-ter-sríj-be?",
      },
      {
        id: "fahrer_q5",
        type: "match",
        prompt: "Párosítsd a szállítási szavakat!",
        pairs: [
          { id: "p1", left: "Rakomány", right: "Ladung" },
          { id: "p2", left: "Útvonal", right: "Route" },
          { id: "p3", left: "Kipakolás", right: "Entladen" },
          { id: "p4", left: "Áruszállítás", right: "Warentransport" },
        ],
      },
    ],
  },

  // ── 10. Gyermekgondozás (Kinderbetreuung) ────────────────────────
  {
    id: "kinder_1",
    title: "Gyermekgondozás Alapok 1.",
    description: "Alapvető kifejezések bébiszitterként vagy bölcsődei dolgozóként.",
    industry: "Gyermekgondozás (Kinderbetreuung)",
    xpReward: 15,
    isPro: true,
    questions: [
      {
        id: "kinder_q1",
        type: "flashcard",
        prompt: "Pelenka",
        backText: "Windel",
        phonetic: "Vin-del",
      },
      {
        id: "kinder_q2",
        type: "flashcard",
        prompt: "Etetés",
        backText: "Füttern",
        phonetic: "Füt-tern",
      },
      {
        id: "kinder_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Kita' (Kindertagesstätte)?",
        options: [
          { id: "a", text: "Bölcsőde / Óvoda" },
          { id: "b", text: "Iskola" },
          { id: "c", text: "Kórház" },
        ],
        correctOptionId: "a",
      },
      {
        id: "kinder_q4",
        type: "flashcard",
        prompt: "Anya/apa mindjárt jön.",
        backText: "D'Mama/dä Papa chunt gli.",
        phonetic: "D'má-má/de pá-pá hunt hlí.",
      },
      {
        id: "kinder_q5",
        type: "match",
        prompt: "Párosítsd a gyermekgondozási szavakat!",
        pairs: [
          { id: "p1", left: "Játszótér", right: "Spielplatz" },
          { id: "p2", left: "Altatódal", right: "Schlaflied" },
          { id: "p3", left: "Babakocsi", right: "Kinderwagen" },
          { id: "p4", left: "Cumi", right: "Schnuller" },
        ],
      },
    ],
  },

  // ── 11. Mezőgazdaság (Landwirtschaft) ────────────────────────────
  {
    id: "landw_1",
    title: "Mezőgazdaság Alapok 1.",
    description: "Alapvető kifejezések aratáshoz és üvegházi munkához Svájcban.",
    industry: "Mezőgazdaság (Landwirtschaft)",
    xpReward: 15,
    isPro: true,
    questions: [
      {
        id: "landw_q1",
        type: "flashcard",
        prompt: "Aratás",
        backText: "Ernte",
        phonetic: "Ern-te",
      },
      {
        id: "landw_q2",
        type: "flashcard",
        prompt: "Üvegház",
        backText: "Gewächshaus",
        phonetic: "Ge-veksz-háusz",
      },
      {
        id: "landw_q3",
        type: "multiple_choice",
        prompt: "Mit jelent az 'Obsternte'?",
        options: [
          { id: "a", text: "Gyümölcsszedés" },
          { id: "b", text: "Vetés" },
          { id: "c", text: "Öntözés" },
        ],
        correctOptionId: "a",
      },
      {
        id: "landw_q4",
        type: "flashcard",
        prompt: "Vigyázz a tövisekkel!",
        backText: "Vorsicht vor de Dörn!",
        phonetic: "Fór-ziht for de dörn!",
      },
      {
        id: "landw_q5",
        type: "match",
        prompt: "Párosítsd a mezőgazdasági szavakat!",
        pairs: [
          { id: "p1", left: "Öntözés", right: "Bewässerung" },
          { id: "p2", left: "Traktor", right: "Traktor" },
          { id: "p3", left: "Vetés", right: "Aussaat" },
          { id: "p4", left: "Szüret", right: "Weinlese" },
        ],
      },
    ],
  },

  // ── 12. Gépjárműipar (Automechaniker) ────────────────────────────
  {
    id: "auto_1",
    title: "Autószerelő Alapok 1.",
    description: "Alapvető kifejezések egy svájci autószervizben.",
    industry: "Gépjárműipar (Automechaniker)",
    xpReward: 15,
    isPro: true,
    questions: [
      {
        id: "auto_q1",
        type: "flashcard",
        prompt: "Fékek",
        backText: "Bremse",
        phonetic: "Brém-ze",
      },
      {
        id: "auto_q2",
        type: "flashcard",
        prompt: "Olajcsere",
        backText: "Ölwechsel",
        phonetic: "Öl-vek-szel",
      },
      {
        id: "auto_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Reifen'?",
        options: [
          { id: "a", text: "Gumiabroncs" },
          { id: "b", text: "Akkumulátor" },
          { id: "c", text: "Kipufogó" },
        ],
        correctOptionId: "a",
      },
      {
        id: "auto_q4",
        type: "flashcard",
        prompt: "Mikor lesz kész az autó?",
        backText: "Wenn isch s'Auto parat?",
        phonetic: "Ven is száu-tó pá-rát?",
      },
      {
        id: "auto_q5",
        type: "match",
        prompt: "Párosítsd az autószerelős szavakat!",
        pairs: [
          { id: "p1", left: "Akkumulátor", right: "Batterie" },
          { id: "p2", left: "Kipufogó", right: "Auspuff" },
          { id: "p3", left: "Szerviz / Műhely", right: "Werkstatt" },
          { id: "p4", left: "Motor", right: "Motor" },
        ],
      },
    ],
  },

  // ── 13. Biztonsági szolgálat (Sicherheitsdienst) ─────────────────
  {
    id: "sich_1",
    title: "Biztonsági Szolgálat Alapok 1.",
    description: "Alapvető kifejezések biztonsági őrként Svájcban.",
    industry: "Biztonsági szolgálat (Sicherheitsdienst)",
    xpReward: 15,
    isPro: true,
    questions: [
      {
        id: "sich_q1",
        type: "flashcard",
        prompt: "Riasztó",
        backText: "Alarm",
        phonetic: "Á-lárm",
      },
      {
        id: "sich_q2",
        type: "flashcard",
        prompt: "Vészkijárat",
        backText: "Notausgang",
        phonetic: "Nót-áusz-gáng",
      },
      {
        id: "sich_q3",
        type: "multiple_choice",
        prompt: "Mit jelent az 'Überwachungskamera'?",
        options: [
          { id: "a", text: "Biztonsági kamera" },
          { id: "b", text: "Belépőkártya" },
          { id: "c", text: "Riasztó" },
        ],
        correctOptionId: "a",
      },
      {
        id: "sich_q4",
        type: "flashcard",
        prompt: "Mutassa kérem az igazolványát!",
        backText: "Zeiged Sie bitte Ihre Usswiis!",
        phonetic: "Cáj-ged zí bit-te í-re usz-vísz!",
      },
      {
        id: "sich_q5",
        type: "match",
        prompt: "Párosítsd a biztonsági szavakat!",
        pairs: [
          { id: "p1", left: "Belépőkártya", right: "Zutrittskarte" },
          { id: "p2", left: "Őrjárat", right: "Kontrollgang" },
          { id: "p3", left: "Behatolás", right: "Einbruch" },
          { id: "p4", left: "Kulcscsomó", right: "Schlüsselbund" },
        ],
      },
    ],
  },

  // ── 14. Szállodaipar (Hotellerie) ────────────────────────────────
  {
    id: "hotel_1",
    title: "Szállodaipar Alapok 1.",
    description: "Alapvető kifejezések recepciósként vagy szobalányként egy svájci szállodában.",
    industry: "Szállodaipar (Hotellerie)",
    xpReward: 15,
    isPro: true,
    questions: [
      {
        id: "hotel_q1",
        type: "flashcard",
        prompt: "Szobakulcs",
        backText: "Zimmerschlüssel",
        phonetic: "Cim-mer-slüs-szel",
      },
      {
        id: "hotel_q2",
        type: "flashcard",
        prompt: "Törölköző",
        backText: "Handtuch",
        phonetic: "Hánt-túh",
      },
      {
        id: "hotel_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Reservierung'?",
        options: [
          { id: "a", text: "Foglalás" },
          { id: "b", text: "Számla" },
          { id: "c", text: "Bejelentkezés" },
        ],
        correctOptionId: "a",
      },
      {
        id: "hotel_q4",
        type: "flashcard",
        prompt: "Sajnos a szoba még nincs kész.",
        backText: "S'Zimmer isch leider no nid parat.",
        phonetic: "Szim-mer is láj-der nó nid pá-rát.",
      },
      {
        id: "hotel_q5",
        type: "match",
        prompt: "Párosítsd a szállodai szavakat!",
        pairs: [
          { id: "p1", left: "Recepció", right: "Rezeption" },
          { id: "p2", left: "Ágyazás", right: "Bett machen" },
          { id: "p3", left: "Bejelentkezés", right: "Check-in" },
          { id: "p4", left: "Takarítónő", right: "Zimmermädchen" },
        ],
      },
    ],
  },

  // ── 15. Konyhai személyzet (Küche) ───────────────────────────────
  {
    id: "kueche_1",
    title: "Konyhai Személyzet Alapok 1.",
    description: "Alapvető kifejezések konyhai kisegítőként egy svájci étteremben.",
    industry: "Konyhai személyzet (Küche)",
    xpReward: 15,
    isPro: true,
    questions: [
      {
        id: "kueche_q1",
        type: "flashcard",
        prompt: "Mosogatás",
        backText: "Abwasch",
        phonetic: "Áb-vas",
      },
      {
        id: "kueche_q2",
        type: "flashcard",
        prompt: "Vágódeszka",
        backText: "Schneidebrett",
        phonetic: "Snáj-de-bret",
      },
      {
        id: "kueche_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Gewürz'?",
        options: [
          { id: "a", text: "Fűszer" },
          { id: "b", text: "Serpenyő" },
          { id: "c", text: "Hámozás" },
        ],
        correctOptionId: "a",
      },
      {
        id: "kueche_q4",
        type: "flashcard",
        prompt: "Vigyázz, forró!",
        backText: "Vorsicht, heiss!",
        phonetic: "Fór-ziht, hájsz!",
      },
      {
        id: "kueche_q5",
        type: "match",
        prompt: "Párosítsd a konyhai szavakat!",
        pairs: [
          { id: "p1", left: "Serpenyő", right: "Pfanne" },
          { id: "p2", left: "Hámozás", right: "Schälen" },
          { id: "p3", left: "Higiénia", right: "Hygiene" },
          { id: "p4", left: "Fazék", right: "Topf" },
        ],
      },
    ],
  },

  // ── 16. PRO LECKÉK ─────────────────────────────────────────────
  {
    id: "bau_pro_1",
    title: "Mesterkurzus: Fizetésemelés és Konfliktus",
    description: "Svájci német párbeszédek: hogyan kérj fizetésemelést, vagy intézz el egy konfliktust a svájci főnököddel.",
    industry: "Építőipar (Baubranche)",
    xpReward: 50,
    isPro: true,
    questions: [
      {
        id: "bau_pro_q1",
        type: "flashcard",
        prompt: "Szeretnék beszélni a fizetésemről.",
        backText: "Ich wett gern über min Lohn rede.",
        phonetic: "Ih vet gern über min Lón ré-dö",
      },
      {
        id: "bau_pro_q2",
        type: "multiple_choice",
        prompt: "Hogyan mondod: 'Úgy gondolom, több felelősséget vállalok mostanában'?",
        options: [
          { id: "a", text: "Ich find, ich übernimm in letschter Ziit meh Verantwortig." },
          { id: "b", text: "Ich schaffe meh als die andere." },
          { id: "c", text: "Ich bruch meh Gäld." },
        ],
        correctOptionId: "a",
      },
      {
        id: "bau_pro_q3",
        type: "flashcard",
        prompt: "Ez nem az én hibám volt.",
        backText: "Das isch nid min Fähler gsii.",
        phonetic: "Dász is nid min Fél-ler gszí",
      }
    ],
  }
];

/* ═══════════════════════════ AUSZTRIA (Österreichisches Deutsch) ═══════════════════════════
 * Osztrák munkahelyi szókincs — a német alapokra épül, de a jellegzetes osztrák
 * szavakkal (Scheibtruhe, Sackerl, Paradeiser). TTS: de-AT. Első lecke INGYENES.
 */
export const INDUSTRY_LESSONS_AT: Lesson[] = [
  {
    id: "at_bau_1",
    title: "Építőipari Alapok 1.",
    description: "Alapvető szerszámok és kifejezések az osztrák építkezéseken (Baustelle).",
    industry: "Építőipar (Baubranche)",
    xpReward: 15,
    isPro: false,
    lang: "de-AT",
    questions: [
      { id: "at_bau_q1", type: "flashcard", prompt: "Fúrógép", backText: "Bohrmaschine", phonetic: "Bór-má-si-ne" },
      { id: "at_bau_q2", type: "flashcard", prompt: "Talicska", backText: "Scheibtruhe (osztrák szó — Németországban: Schubkarre)", phonetic: "Sájb-tru-he" },
      {
        id: "at_bau_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Polier' szó az építkezésen?",
        options: [
          { id: "a", text: "Művezető / Építésvezető" },
          { id: "b", text: "Rendőr" },
          { id: "c", text: "Takarító" },
        ],
        correctOptionId: "a",
      },
      { id: "at_bau_q4", type: "flashcard", prompt: "Létra", backText: "Leiter", phonetic: "Láj-ter" },
      {
        id: "at_bau_q5",
        type: "match",
        prompt: "Párosítsd a szerszámokat!",
        pairs: [
          { id: "p1", left: "Kalapács", right: "Hammer" },
          { id: "p2", left: "Csavarhúzó", right: "Schraubenzieher" },
          { id: "p3", left: "Mérőszalag", right: "Maßband" },
          { id: "p4", left: "Vízmérték", right: "Wasserwaage" },
        ],
      },
    ],
  },
  {
    id: "at_gastro_1",
    title: "Vendéglátás: Rendelésfelvétel",
    description: "Hogyan szolgálj ki osztrák vendégeket egy étteremben?",
    industry: "Vendéglátás (Gastronomie)",
    xpReward: 15,
    isPro: true,
    lang: "de-AT",
    questions: [
      { id: "at_gas_q1", type: "flashcard", prompt: "Mit hozhatok inni?", backText: "Was darf ich Ihnen zum Trinken bringen?", phonetic: "Vász dárf ih ínen cum trin-ken brin-gen?" },
      { id: "at_gas_q2", type: "flashcard", prompt: "Fizetni szeretnék, kérem.", backText: "Zahlen bitte. (Ausztriában gyakran: „Herr Ober, zahlen bitte!”)", phonetic: "Cá-len bit-te" },
      {
        id: "at_gas_q3",
        type: "multiple_choice",
        prompt: "Hogy hívják Ausztriában a paradicsomot?",
        options: [
          { id: "a", text: "Paradeiser" },
          { id: "b", text: "Erdapfel" },
          { id: "c", text: "Marille" },
        ],
        correctOptionId: "a",
      },
      { id: "at_gas_q4", type: "flashcard", prompt: "Szatyor / zacskó", backText: "Sackerl", phonetic: "Zak-kerl" },
      {
        id: "at_gas_q5",
        type: "match",
        prompt: "Párosítsd az éttermi szavakat!",
        pairs: [
          { id: "p1", left: "Étlap", right: "Speisekarte" },
          { id: "p2", left: "Számla", right: "Rechnung" },
          { id: "p3", left: "Kés", right: "Messer" },
          { id: "p4", left: "Villa", right: "Gabel" },
        ],
      },
    ],
  },
  {
    id: "at_pflege_1",
    title: "Ápolás és Egészségügy 1.",
    description: "Alapvető kifejezések az idősgondozásban és kórházban.",
    industry: "Egészségügy (Gesundheitswesen)",
    xpReward: 15,
    isPro: true,
    lang: "de-AT",
    questions: [
      { id: "at_pfl_q1", type: "flashcard", prompt: "Fájdalomcsillapító", backText: "Schmerzmittel", phonetic: "Smerc-mit-tel" },
      {
        id: "at_pfl_q2",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Rollstuhl'?",
        options: [
          { id: "a", text: "Kerekesszék" },
          { id: "b", text: "Mankó" },
          { id: "c", text: "Injekció" },
        ],
        correctOptionId: "a",
      },
      { id: "at_pfl_q3", type: "flashcard", prompt: "Fáj valamije?", backText: "Haben Sie Schmerzen?", phonetic: "Há-ben zí smer-cen?" },
    ],
  },
  {
    id: "at_verk_1",
    title: "Kiskereskedelem Alapok 1.",
    description: "Pénztár, polc és vevőkiszolgálás egy osztrák boltban.",
    industry: "Kiskereskedelem (Verkauf)",
    xpReward: 15,
    isPro: true,
    lang: "de-AT",
    questions: [
      { id: "at_verk_q1", type: "flashcard", prompt: "Segíthetek?", backText: "Kann ich Ihnen helfen?", phonetic: "Kan ih í-nen hel-fen?" },
      { id: "at_verk_q2", type: "flashcard", prompt: "Pénztár", backText: "Kassa (osztrák szó — Németországban/Svájcban: Kasse)", phonetic: "Kász-szá" },
      {
        id: "at_verk_q3",
        type: "multiple_choice",
        prompt: "Mit jelent az 'Umkleidekabine'?",
        options: [
          { id: "a", text: "Próbafülke" },
          { id: "b", text: "Raktár" },
          { id: "c", text: "Pénztár" },
        ],
        correctOptionId: "a",
      },
      { id: "at_verk_q4", type: "flashcard", prompt: "Blokk / nyugta", backText: "Kassenbon", phonetic: "Kász-szen-bon" },
      {
        id: "at_verk_q5",
        type: "match",
        prompt: "Párosítsd a boltos szavakat!",
        pairs: [
          { id: "p1", left: "Polc", right: "Regal" },
          { id: "p2", left: "Vevő", right: "Kunde" },
          { id: "p3", left: "Árengedmény", right: "Rabatt" },
          { id: "p4", left: "Készlet", right: "Lager" },
        ],
      },
    ],
  },
  {
    id: "at_lager_1",
    title: "Raktár és Logisztika Alapok 1.",
    description: "Targonca, raklap és szállítás egy osztrák raktárban.",
    industry: "Raktár (Lager)",
    xpReward: 15,
    isPro: true,
    lang: "de-AT",
    questions: [
      { id: "at_lager_q1", type: "flashcard", prompt: "Targonca", backText: "Gabelstapler", phonetic: "Gá-bel-stáp-ler" },
      { id: "at_lager_q2", type: "flashcard", prompt: "Raklap", backText: "Palette", phonetic: "Pá-let-te" },
      {
        id: "at_lager_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Lieferschein'?",
        options: [
          { id: "a", text: "Szállítólevél" },
          { id: "b", text: "Munkaszerződés" },
          { id: "c", text: "Fizetési csekk" },
        ],
        correctOptionId: "a",
      },
      { id: "at_lager_q4", type: "flashcard", prompt: "Vigyázz, nehéz!", backText: "Vorsicht, schwer!", phonetic: "Fór-ziht, svér!" },
      {
        id: "at_lager_q5",
        type: "match",
        prompt: "Párosítsd a raktáros szavakat!",
        pairs: [
          { id: "p1", left: "Raktárkészlet", right: "Lagerbestand" },
          { id: "p2", left: "Vonalkód-olvasó", right: "Scanner" },
          { id: "p3", left: "Komissiózás", right: "Kommissionierung" },
          { id: "p4", left: "Rakomány", right: "Ladung" },
        ],
      },
    ],
  },
  {
    id: "at_reinig_1",
    title: "Takarítás Alapok 1.",
    description: "Tisztítószerek és biztonsági alapszavak takarítóknak.",
    industry: "Takarítás (Reinigung)",
    xpReward: 15,
    isPro: true,
    lang: "de-AT",
    questions: [
      { id: "at_reinig_q1", type: "flashcard", prompt: "Vödör", backText: "Eimer", phonetic: "Áj-mer" },
      { id: "at_reinig_q2", type: "flashcard", prompt: "Porszívó", backText: "Staubsauger", phonetic: "Stáub-záu-ger" },
      {
        id: "at_reinig_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Desinfektionsmittel'?",
        options: [
          { id: "a", text: "Fertőtlenítőszer" },
          { id: "b", text: "Mosószer" },
          { id: "c", text: "Padlóviasz" },
        ],
        correctOptionId: "a",
      },
      { id: "at_reinig_q4", type: "flashcard", prompt: "Vigyázat, csúszós a padló!", backText: "Vorsicht, rutschiger Boden!", phonetic: "Fór-ziht, ruc-si-ger bó-den!" },
      {
        id: "at_reinig_q5",
        type: "match",
        prompt: "Párosítsd a takarítós szavakat!",
        pairs: [
          { id: "p1", left: "Gumikesztyű", right: "Gummihandschuhe" },
          { id: "p2", left: "Szemeteszsák", right: "Müllsack" },
          { id: "p3", left: "Felmosó", right: "Wischmopp" },
          { id: "p4", left: "Ablaktisztító", right: "Fensterreiniger" },
        ],
      },
    ],
  },
  {
    id: "at_prod_1",
    title: "Gyártás Alapok 1.",
    description: "Futószalag, alkatrészek és biztonsági szabályok egy üzemben.",
    industry: "Gyártás (Produktion)",
    xpReward: 15,
    isPro: true,
    lang: "de-AT",
    questions: [
      { id: "at_prod_q1", type: "flashcard", prompt: "Futószalag", backText: "Fließband", phonetic: "Flísz-bánt" },
      { id: "at_prod_q2", type: "flashcard", prompt: "Alkatrész", backText: "Bauteil", phonetic: "Báu-tájl" },
      {
        id: "at_prod_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Schichtleiter'?",
        options: [
          { id: "a", text: "Műszakvezető" },
          { id: "b", text: "Gépkezelő" },
          { id: "c", text: "Takarító" },
        ],
        correctOptionId: "a",
      },
      { id: "at_prod_q4", type: "flashcard", prompt: "Kapcsold ki a gépet!", backText: "Schalte die Maschine aus!", phonetic: "Sál-te dí má-sí-ne aus!" },
      {
        id: "at_prod_q5",
        type: "match",
        prompt: "Párosítsd az üzemi szavakat!",
        pairs: [
          { id: "p1", left: "Védőszemüveg", right: "Schutzbrille" },
          { id: "p2", left: "Éjszakai műszak", right: "Nachtschicht" },
          { id: "p3", left: "Minőségellenőrzés", right: "Qualitätskontrolle" },
          { id: "p4", left: "Gyártósor", right: "Produktionslinie" },
        ],
      },
    ],
  },
  {
    id: "at_coif_1",
    title: "Fodrászat Alapok 1.",
    description: "Alapvető szerszámok és kifejezések egy osztrák fodrászatban.",
    industry: "Szépségipar (Friseur)",
    xpReward: 15,
    isPro: true,
    lang: "de-AT",
    questions: [
      { id: "at_coif_q1", type: "flashcard", prompt: "Olló", backText: "Schere", phonetic: "Sé-re" },
      { id: "at_coif_q2", type: "flashcard", prompt: "Hajszárító", backText: "Föhn", phonetic: "Főn" },
      {
        id: "at_coif_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Friseur'?",
        options: [
          { id: "a", text: "Fodrász / Fodrászat" },
          { id: "b", text: "Kozmetikus" },
          { id: "c", text: "Manikűrös" },
        ],
        correctOptionId: "a",
      },
      { id: "at_coif_q4", type: "flashcard", prompt: "Hogy szeretné vágatni a haját?", backText: "Wie hätten Sie Ihre Haare gerne geschnitten?", phonetic: "Ví het-ten zí í-re há-re ger-ne ge-snit-ten?" },
      {
        id: "at_coif_q5",
        type: "match",
        prompt: "Párosítsd a fodrászati szavakat!",
        pairs: [
          { id: "p1", left: "Fésű", right: "Kamm" },
          { id: "p2", left: "Hajfesték", right: "Haarfarbe" },
          { id: "p3", left: "Samponozás", right: "Haare waschen" },
          { id: "p4", left: "Borotva", right: "Rasierer" },
        ],
      },
    ],
  },
  {
    id: "at_fahrer_1",
    title: "Szállítás és Kézbesítés Alapok 1.",
    description: "Alapvető kifejezések futárként vagy sofőrként Ausztriában.",
    industry: "Szállítás (Fahrer)",
    xpReward: 15,
    isPro: true,
    lang: "de-AT",
    questions: [
      { id: "at_fahrer_q1", type: "flashcard", prompt: "Jogosítvány", backText: "Führerschein", phonetic: "Fü-rer-sájn" },
      { id: "at_fahrer_q2", type: "flashcard", prompt: "Csomag", backText: "Paket", phonetic: "Pá-két" },
      {
        id: "at_fahrer_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Lieferung'?",
        options: [
          { id: "a", text: "Kézbesítés / Szállítás" },
          { id: "b", text: "Számla" },
          { id: "c", text: "Útvonal" },
        ],
        correctOptionId: "a",
      },
      { id: "at_fahrer_q4", type: "flashcard", prompt: "Hol írjam alá?", backText: "Wo soll ich unterschreiben?", phonetic: "Vó zol ih un-ter-sráj-ben?" },
      {
        id: "at_fahrer_q5",
        type: "match",
        prompt: "Párosítsd a szállítási szavakat!",
        pairs: [
          { id: "p1", left: "Rakomány", right: "Ladung" },
          { id: "p2", left: "Útvonal", right: "Route" },
          { id: "p3", left: "Kipakolás", right: "Entladen" },
          { id: "p4", left: "Áruszállítás", right: "Warentransport" },
        ],
      },
    ],
  },
  {
    id: "at_kinder_1",
    title: "Gyermekgondozás Alapok 1.",
    description: "Alapvető kifejezések bébiszitterként vagy bölcsődei dolgozóként.",
    industry: "Gyermekgondozás (Kinderbetreuung)",
    xpReward: 15,
    isPro: true,
    lang: "de-AT",
    questions: [
      { id: "at_kinder_q1", type: "flashcard", prompt: "Pelenka", backText: "Windel", phonetic: "Vin-del" },
      { id: "at_kinder_q2", type: "flashcard", prompt: "Etetés", backText: "Füttern", phonetic: "Füt-tern" },
      {
        id: "at_kinder_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Kindergarten'?",
        options: [
          { id: "a", text: "Óvoda" },
          { id: "b", text: "Iskola" },
          { id: "c", text: "Kórház" },
        ],
        correctOptionId: "a",
      },
      { id: "at_kinder_q4", type: "flashcard", prompt: "Anya/apa mindjárt jön.", backText: "Die Mama/der Papa kommt gleich.", phonetic: "Dí má-má/der pá-pá komt glájh." },
      {
        id: "at_kinder_q5",
        type: "match",
        prompt: "Párosítsd a gyermekgondozási szavakat!",
        pairs: [
          { id: "p1", left: "Játszótér", right: "Spielplatz" },
          { id: "p2", left: "Altatódal", right: "Schlaflied" },
          { id: "p3", left: "Babakocsi", right: "Kinderwagen" },
          { id: "p4", left: "Cumi", right: "Schnuller" },
        ],
      },
    ],
  },
  {
    id: "at_landw_1",
    title: "Mezőgazdaság Alapok 1.",
    description: "Alapvető kifejezések aratáshoz és üvegházi munkához Ausztriában.",
    industry: "Mezőgazdaság (Landwirtschaft)",
    xpReward: 15,
    isPro: true,
    lang: "de-AT",
    questions: [
      { id: "at_landw_q1", type: "flashcard", prompt: "Aratás", backText: "Ernte", phonetic: "Ern-te" },
      { id: "at_landw_q2", type: "flashcard", prompt: "Üvegház", backText: "Gewächshaus", phonetic: "Ge-veksz-háusz" },
      {
        id: "at_landw_q3",
        type: "multiple_choice",
        prompt: "Mit jelent az 'Obsternte'?",
        options: [
          { id: "a", text: "Gyümölcsszedés" },
          { id: "b", text: "Vetés" },
          { id: "c", text: "Öntözés" },
        ],
        correctOptionId: "a",
      },
      { id: "at_landw_q4", type: "flashcard", prompt: "Vigyázz a tövisekkel!", backText: "Vorsicht vor den Dornen!", phonetic: "Fór-ziht for den dór-nen!" },
      {
        id: "at_landw_q5",
        type: "match",
        prompt: "Párosítsd a mezőgazdasági szavakat!",
        pairs: [
          { id: "p1", left: "Öntözés", right: "Bewässerung" },
          { id: "p2", left: "Traktor", right: "Traktor" },
          { id: "p3", left: "Vetés", right: "Aussaat" },
          { id: "p4", left: "Szüret", right: "Weinlese" },
        ],
      },
    ],
  },
  {
    id: "at_auto_1",
    title: "Autószerelő Alapok 1.",
    description: "Alapvető kifejezések egy osztrák autószervizben.",
    industry: "Gépjárműipar (Automechaniker)",
    xpReward: 15,
    isPro: true,
    lang: "de-AT",
    questions: [
      { id: "at_auto_q1", type: "flashcard", prompt: "Fékek", backText: "Bremse", phonetic: "Brém-ze" },
      { id: "at_auto_q2", type: "flashcard", prompt: "Olajcsere", backText: "Ölwechsel", phonetic: "Öl-vek-szel" },
      {
        id: "at_auto_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Reifen'?",
        options: [
          { id: "a", text: "Gumiabroncs" },
          { id: "b", text: "Akkumulátor" },
          { id: "c", text: "Kipufogó" },
        ],
        correctOptionId: "a",
      },
      { id: "at_auto_q4", type: "flashcard", prompt: "Mikor lesz kész az autó?", backText: "Wann ist das Auto fertig?", phonetic: "Van iszt dász áu-tó fer-tih?" },
      {
        id: "at_auto_q5",
        type: "match",
        prompt: "Párosítsd az autószerelős szavakat!",
        pairs: [
          { id: "p1", left: "Akkumulátor", right: "Batterie" },
          { id: "p2", left: "Kipufogó", right: "Auspuff" },
          { id: "p3", left: "Szerviz / Műhely", right: "Werkstatt" },
          { id: "p4", left: "Motor", right: "Motor" },
        ],
      },
    ],
  },
  {
    id: "at_sich_1",
    title: "Biztonsági Szolgálat Alapok 1.",
    description: "Alapvető kifejezések biztonsági őrként Ausztriában.",
    industry: "Biztonsági szolgálat (Sicherheitsdienst)",
    xpReward: 15,
    isPro: true,
    lang: "de-AT",
    questions: [
      { id: "at_sich_q1", type: "flashcard", prompt: "Riasztó", backText: "Alarm", phonetic: "Á-lárm" },
      { id: "at_sich_q2", type: "flashcard", prompt: "Vészkijárat", backText: "Notausgang", phonetic: "Nót-áusz-gáng" },
      {
        id: "at_sich_q3",
        type: "multiple_choice",
        prompt: "Mit jelent az 'Überwachungskamera'?",
        options: [
          { id: "a", text: "Biztonsági kamera" },
          { id: "b", text: "Belépőkártya" },
          { id: "c", text: "Riasztó" },
        ],
        correctOptionId: "a",
      },
      { id: "at_sich_q4", type: "flashcard", prompt: "Mutassa kérem az igazolványát!", backText: "Zeigen Sie bitte Ihren Ausweis!", phonetic: "Cáj-gen zí bit-te í-ren áusz-vájsz!" },
      {
        id: "at_sich_q5",
        type: "match",
        prompt: "Párosítsd a biztonsági szavakat!",
        pairs: [
          { id: "p1", left: "Belépőkártya", right: "Zutrittskarte" },
          { id: "p2", left: "Őrjárat", right: "Kontrollgang" },
          { id: "p3", left: "Behatolás", right: "Einbruch" },
          { id: "p4", left: "Kulcscsomó", right: "Schlüsselbund" },
        ],
      },
    ],
  },
  {
    id: "at_hotel_1",
    title: "Szállodaipar Alapok 1.",
    description: "Alapvető kifejezések recepciósként vagy szobalányként egy osztrák szállodában.",
    industry: "Szállodaipar (Hotellerie)",
    xpReward: 15,
    isPro: true,
    lang: "de-AT",
    questions: [
      { id: "at_hotel_q1", type: "flashcard", prompt: "Szobakulcs", backText: "Zimmerschlüssel", phonetic: "Cim-mer-slüs-szel" },
      { id: "at_hotel_q2", type: "flashcard", prompt: "Törölköző", backText: "Handtuch", phonetic: "Hánt-túh" },
      {
        id: "at_hotel_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Reservierung'?",
        options: [
          { id: "a", text: "Foglalás" },
          { id: "b", text: "Számla" },
          { id: "c", text: "Bejelentkezés" },
        ],
        correctOptionId: "a",
      },
      { id: "at_hotel_q4", type: "flashcard", prompt: "Sajnos a szoba még nincs kész.", backText: "Das Zimmer ist leider noch nicht fertig.", phonetic: "Dász cim-mer iszt láj-der noh niht fer-tih." },
      {
        id: "at_hotel_q5",
        type: "match",
        prompt: "Párosítsd a szállodai szavakat!",
        pairs: [
          { id: "p1", left: "Recepció", right: "Rezeption" },
          { id: "p2", left: "Ágyazás", right: "Bett machen" },
          { id: "p3", left: "Bejelentkezés", right: "Check-in" },
          { id: "p4", left: "Takarítónő", right: "Zimmermädchen" },
        ],
      },
    ],
  },
  {
    id: "at_kueche_1",
    title: "Konyhai Személyzet Alapok 1.",
    description: "Alapvető kifejezések konyhai kisegítőként egy osztrák étteremben.",
    industry: "Konyhai személyzet (Küche)",
    xpReward: 15,
    isPro: true,
    lang: "de-AT",
    questions: [
      { id: "at_kueche_q1", type: "flashcard", prompt: "Mosogatás", backText: "Abwasch", phonetic: "Áb-vas" },
      { id: "at_kueche_q2", type: "flashcard", prompt: "Vágódeszka", backText: "Schneidebrett", phonetic: "Snáj-de-bret" },
      {
        id: "at_kueche_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Gewürz'?",
        options: [
          { id: "a", text: "Fűszer" },
          { id: "b", text: "Serpenyő" },
          { id: "c", text: "Hámozás" },
        ],
        correctOptionId: "a",
      },
      { id: "at_kueche_q4", type: "flashcard", prompt: "Vigyázz, forró!", backText: "Vorsicht, heiß!", phonetic: "Fór-ziht, hájsz!" },
      {
        id: "at_kueche_q5",
        type: "match",
        prompt: "Párosítsd a konyhai szavakat!",
        pairs: [
          { id: "p1", left: "Serpenyő", right: "Pfanne" },
          { id: "p2", left: "Hámozás", right: "Schälen" },
          { id: "p3", left: "Higiénia", right: "Hygiene" },
          { id: "p4", left: "Fazék", right: "Topf" },
        ],
      },
    ],
  },
  {
    id: "at_pro_1",
    title: "Mesterkurzus: Fizetésemelés és Konfliktus",
    description: "Osztrák párbeszédek: hogyan kérj fizetésemelést, vagy rendezz el egy konfliktust a főnököddel.",
    industry: "Építőipar (Baubranche)",
    xpReward: 50,
    isPro: true,
    lang: "de-AT",
    questions: [
      { id: "at_pro_q1", type: "flashcard", prompt: "Szeretnék beszélni a fizetésemről.", backText: "Ich möchte gerne über mein Gehalt sprechen.", phonetic: "Ih möh-te ger-ne über mejn ge-halt spre-hen" },
      {
        id: "at_pro_q2",
        type: "multiple_choice",
        prompt: "Hogyan mondod: 'Az utóbbi időben több felelősséget vállalok'?",
        options: [
          { id: "a", text: "Ich übernehme in letzter Zeit mehr Verantwortung." },
          { id: "b", text: "Ich arbeite mehr als die anderen." },
          { id: "c", text: "Ich brauche mehr Geld." },
        ],
        correctOptionId: "a",
      },
      { id: "at_pro_q3", type: "flashcard", prompt: "Ez nem az én hibám volt.", backText: "Das war nicht mein Fehler.", phonetic: "Dász vár niht mejn fé-ler" },
    ],
  },
];

/* ═══════════════════════════ NÉMETORSZÁG (Hochdeutsch) ═══════════════════════════
 * Standard német munkahelyi szókincs. TTS: de-DE. Első lecke INGYENES.
 */
export const INDUSTRY_LESSONS_DE: Lesson[] = [
  {
    id: "de_bau_1",
    title: "Építőipari Alapok 1.",
    description: "Alapvető szerszámok és kifejezések a német építkezéseken (Baustelle).",
    industry: "Építőipar (Baubranche)",
    xpReward: 15,
    isPro: false,
    lang: "de-DE",
    questions: [
      { id: "de_bau_q1", type: "flashcard", prompt: "Fúrógép", backText: "Bohrmaschine", phonetic: "Bór-má-si-ne" },
      { id: "de_bau_q2", type: "flashcard", prompt: "Talicska", backText: "Schubkarre", phonetic: "Súb-kár-re" },
      {
        id: "de_bau_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Polier' szó az építkezésen?",
        options: [
          { id: "a", text: "Művezető / Építésvezető" },
          { id: "b", text: "Rendőr" },
          { id: "c", text: "Takarító" },
        ],
        correctOptionId: "a",
      },
      { id: "de_bau_q4", type: "flashcard", prompt: "Létra", backText: "Leiter", phonetic: "Láj-ter" },
      {
        id: "de_bau_q5",
        type: "match",
        prompt: "Párosítsd a szerszámokat!",
        pairs: [
          { id: "p1", left: "Kalapács", right: "Hammer" },
          { id: "p2", left: "Csavarhúzó", right: "Schraubenzieher" },
          { id: "p3", left: "Mérőszalag", right: "Maßband" },
          { id: "p4", left: "Vízmérték", right: "Wasserwaage" },
        ],
      },
    ],
  },
  {
    id: "de_gastro_1",
    title: "Vendéglátás: Rendelésfelvétel",
    description: "Hogyan szolgálj ki német vendégeket egy étteremben?",
    industry: "Vendéglátás (Gastronomie)",
    xpReward: 15,
    isPro: true,
    lang: "de-DE",
    questions: [
      { id: "de_gas_q1", type: "flashcard", prompt: "Mit hozhatok inni?", backText: "Was darf ich Ihnen zu trinken bringen?", phonetic: "Vász dárf ih ínen cu trin-ken brin-gen?" },
      { id: "de_gas_q2", type: "flashcard", prompt: "Fizetni szeretnék, kérem.", backText: "Ich möchte zahlen, bitte.", phonetic: "Ih möh-te cá-len bit-te" },
      {
        id: "de_gas_q3",
        type: "multiple_choice",
        prompt: "Hogyan kérdezed meg, hogy ízlett-e az étel?",
        options: [
          { id: "a", text: "Hat es Ihnen geschmeckt?" },
          { id: "b", text: "Was möchten Sie?" },
          { id: "c", text: "Schon fertig?" },
        ],
        correctOptionId: "a",
      },
      { id: "de_gas_q4", type: "flashcard", prompt: "Borravaló", backText: "Trinkgeld", phonetic: "Trink-gelt" },
      {
        id: "de_gas_q5",
        type: "match",
        prompt: "Párosítsd az éttermi szavakat!",
        pairs: [
          { id: "p1", left: "Étlap", right: "Speisekarte" },
          { id: "p2", left: "Számla", right: "Rechnung" },
          { id: "p3", left: "Kés", right: "Messer" },
          { id: "p4", left: "Villa", right: "Gabel" },
        ],
      },
    ],
  },
  {
    id: "de_pflege_1",
    title: "Ápolás és Egészségügy 1.",
    description: "Alapvető kifejezések az idősgondozásban és kórházban.",
    industry: "Egészségügy (Gesundheitswesen)",
    xpReward: 15,
    isPro: true,
    lang: "de-DE",
    questions: [
      { id: "de_pfl_q1", type: "flashcard", prompt: "Fájdalomcsillapító", backText: "Schmerzmittel", phonetic: "Smerc-mit-tel" },
      {
        id: "de_pfl_q2",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Rollstuhl'?",
        options: [
          { id: "a", text: "Kerekesszék" },
          { id: "b", text: "Mankó" },
          { id: "c", text: "Injekció" },
        ],
        correctOptionId: "a",
      },
      { id: "de_pfl_q3", type: "flashcard", prompt: "Fáj valamije?", backText: "Haben Sie Schmerzen?", phonetic: "Há-ben zí smer-cen?" },
    ],
  },
  {
    id: "de_verk_1",
    title: "Kiskereskedelem Alapok 1.",
    description: "Pénztár, polc és vevőkiszolgálás egy német boltban.",
    industry: "Kiskereskedelem (Verkauf)",
    xpReward: 15,
    isPro: true,
    lang: "de-DE",
    questions: [
      { id: "de_verk_q1", type: "flashcard", prompt: "Segíthetek?", backText: "Kann ich Ihnen helfen?", phonetic: "Kan ih í-nen hel-fen?" },
      { id: "de_verk_q2", type: "flashcard", prompt: "Blokk / nyugta", backText: "Kassenbon", phonetic: "Kász-szen-bon" },
      {
        id: "de_verk_q3",
        type: "multiple_choice",
        prompt: "Mit jelent az 'Umkleidekabine'?",
        options: [
          { id: "a", text: "Próbafülke" },
          { id: "b", text: "Raktár" },
          { id: "c", text: "Pénztár" },
        ],
        correctOptionId: "a",
      },
      { id: "de_verk_q4", type: "flashcard", prompt: "Van elég aprópénze?", backText: "Haben Sie es passend?", phonetic: "Há-ben zí esz pász-szent?" },
      {
        id: "de_verk_q5",
        type: "match",
        prompt: "Párosítsd a boltos szavakat!",
        pairs: [
          { id: "p1", left: "Polc", right: "Regal" },
          { id: "p2", left: "Vevő", right: "Kunde" },
          { id: "p3", left: "Árengedmény", right: "Rabatt" },
          { id: "p4", left: "Készlet", right: "Lager" },
        ],
      },
    ],
  },
  {
    id: "de_lager_1",
    title: "Raktár és Logisztika Alapok 1.",
    description: "Targonca, raklap és szállítás egy német raktárban.",
    industry: "Raktár (Lager)",
    xpReward: 15,
    isPro: true,
    lang: "de-DE",
    questions: [
      { id: "de_lager_q1", type: "flashcard", prompt: "Targonca", backText: "Gabelstapler", phonetic: "Gá-bel-stáp-ler" },
      { id: "de_lager_q2", type: "flashcard", prompt: "Raklap", backText: "Palette", phonetic: "Pá-let-te" },
      {
        id: "de_lager_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Lieferschein'?",
        options: [
          { id: "a", text: "Szállítólevél" },
          { id: "b", text: "Munkaszerződés" },
          { id: "c", text: "Fizetési csekk" },
        ],
        correctOptionId: "a",
      },
      { id: "de_lager_q4", type: "flashcard", prompt: "Vigyázz, nehéz!", backText: "Vorsicht, schwer!", phonetic: "Fór-ziht, svér!" },
      {
        id: "de_lager_q5",
        type: "match",
        prompt: "Párosítsd a raktáros szavakat!",
        pairs: [
          { id: "p1", left: "Raktárkészlet", right: "Lagerbestand" },
          { id: "p2", left: "Vonalkód-olvasó", right: "Scanner" },
          { id: "p3", left: "Komissiózás", right: "Kommissionierung" },
          { id: "p4", left: "Rakomány", right: "Ladung" },
        ],
      },
    ],
  },
  {
    id: "de_reinig_1",
    title: "Takarítás Alapok 1.",
    description: "Tisztítószerek és biztonsági alapszavak takarítóknak.",
    industry: "Takarítás (Reinigung)",
    xpReward: 15,
    isPro: true,
    lang: "de-DE",
    questions: [
      { id: "de_reinig_q1", type: "flashcard", prompt: "Vödör", backText: "Eimer", phonetic: "Áj-mer" },
      { id: "de_reinig_q2", type: "flashcard", prompt: "Porszívó", backText: "Staubsauger", phonetic: "Stáub-záu-ger" },
      {
        id: "de_reinig_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Desinfektionsmittel'?",
        options: [
          { id: "a", text: "Fertőtlenítőszer" },
          { id: "b", text: "Mosószer" },
          { id: "c", text: "Padlóviasz" },
        ],
        correctOptionId: "a",
      },
      { id: "de_reinig_q4", type: "flashcard", prompt: "Vigyázat, csúszós a padló!", backText: "Vorsicht, rutschiger Boden!", phonetic: "Fór-ziht, ruc-si-ger bó-den!" },
      {
        id: "de_reinig_q5",
        type: "match",
        prompt: "Párosítsd a takarítós szavakat!",
        pairs: [
          { id: "p1", left: "Gumikesztyű", right: "Gummihandschuhe" },
          { id: "p2", left: "Szemeteszsák", right: "Müllsack" },
          { id: "p3", left: "Felmosó", right: "Wischmopp" },
          { id: "p4", left: "Ablaktisztító", right: "Fensterreiniger" },
        ],
      },
    ],
  },
  {
    id: "de_prod_1",
    title: "Gyártás Alapok 1.",
    description: "Futószalag, alkatrészek és biztonsági szabályok egy üzemben.",
    industry: "Gyártás (Produktion)",
    xpReward: 15,
    isPro: true,
    lang: "de-DE",
    questions: [
      { id: "de_prod_q1", type: "flashcard", prompt: "Futószalag", backText: "Fließband", phonetic: "Flísz-bánt" },
      { id: "de_prod_q2", type: "flashcard", prompt: "Alkatrész", backText: "Bauteil", phonetic: "Báu-tájl" },
      {
        id: "de_prod_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Schichtleiter'?",
        options: [
          { id: "a", text: "Műszakvezető" },
          { id: "b", text: "Gépkezelő" },
          { id: "c", text: "Takarító" },
        ],
        correctOptionId: "a",
      },
      { id: "de_prod_q4", type: "flashcard", prompt: "Kapcsold ki a gépet!", backText: "Schalte die Maschine aus!", phonetic: "Sál-te dí má-sí-ne aus!" },
      {
        id: "de_prod_q5",
        type: "match",
        prompt: "Párosítsd az üzemi szavakat!",
        pairs: [
          { id: "p1", left: "Védőszemüveg", right: "Schutzbrille" },
          { id: "p2", left: "Éjszakai műszak", right: "Nachtschicht" },
          { id: "p3", left: "Minőségellenőrzés", right: "Qualitätskontrolle" },
          { id: "p4", left: "Gyártósor", right: "Produktionslinie" },
        ],
      },
    ],
  },
  {
    id: "de_coif_1",
    title: "Fodrászat Alapok 1.",
    description: "Alapvető szerszámok és kifejezések egy német fodrászatban.",
    industry: "Szépségipar (Friseur)",
    xpReward: 15,
    isPro: true,
    lang: "de-DE",
    questions: [
      { id: "de_coif_q1", type: "flashcard", prompt: "Olló", backText: "Schere", phonetic: "Sé-re" },
      { id: "de_coif_q2", type: "flashcard", prompt: "Hajszárító", backText: "Föhn", phonetic: "Főn" },
      {
        id: "de_coif_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Friseur'?",
        options: [
          { id: "a", text: "Fodrász / Fodrászat" },
          { id: "b", text: "Kozmetikus" },
          { id: "c", text: "Manikűrös" },
        ],
        correctOptionId: "a",
      },
      { id: "de_coif_q4", type: "flashcard", prompt: "Hogy szeretné vágatni a haját?", backText: "Wie hätten Sie Ihre Haare gerne geschnitten?", phonetic: "Ví het-ten zí í-re há-re ger-ne ge-snit-ten?" },
      {
        id: "de_coif_q5",
        type: "match",
        prompt: "Párosítsd a fodrászati szavakat!",
        pairs: [
          { id: "p1", left: "Fésű", right: "Kamm" },
          { id: "p2", left: "Hajfesték", right: "Haarfarbe" },
          { id: "p3", left: "Samponozás", right: "Haare waschen" },
          { id: "p4", left: "Borotva", right: "Rasierer" },
        ],
      },
    ],
  },
  {
    id: "de_fahrer_1",
    title: "Szállítás és Kézbesítés Alapok 1.",
    description: "Alapvető kifejezések futárként vagy sofőrként Németországban.",
    industry: "Szállítás (Fahrer)",
    xpReward: 15,
    isPro: true,
    lang: "de-DE",
    questions: [
      { id: "de_fahrer_q1", type: "flashcard", prompt: "Jogosítvány", backText: "Führerschein", phonetic: "Fü-rer-sájn" },
      { id: "de_fahrer_q2", type: "flashcard", prompt: "Csomag", backText: "Paket", phonetic: "Pá-két" },
      {
        id: "de_fahrer_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Lieferung'?",
        options: [
          { id: "a", text: "Kézbesítés / Szállítás" },
          { id: "b", text: "Számla" },
          { id: "c", text: "Útvonal" },
        ],
        correctOptionId: "a",
      },
      { id: "de_fahrer_q4", type: "flashcard", prompt: "Hol írjam alá?", backText: "Wo soll ich unterschreiben?", phonetic: "Vó zol ih un-ter-sráj-ben?" },
      {
        id: "de_fahrer_q5",
        type: "match",
        prompt: "Párosítsd a szállítási szavakat!",
        pairs: [
          { id: "p1", left: "Rakomány", right: "Ladung" },
          { id: "p2", left: "Útvonal", right: "Route" },
          { id: "p3", left: "Kipakolás", right: "Entladen" },
          { id: "p4", left: "Áruszállítás", right: "Warentransport" },
        ],
      },
    ],
  },
  {
    id: "de_kinder_1",
    title: "Gyermekgondozás Alapok 1.",
    description: "Alapvető kifejezések bébiszitterként vagy bölcsődei dolgozóként.",
    industry: "Gyermekgondozás (Kinderbetreuung)",
    xpReward: 15,
    isPro: true,
    lang: "de-DE",
    questions: [
      { id: "de_kinder_q1", type: "flashcard", prompt: "Pelenka", backText: "Windel", phonetic: "Vin-del" },
      { id: "de_kinder_q2", type: "flashcard", prompt: "Etetés", backText: "Füttern", phonetic: "Füt-tern" },
      {
        id: "de_kinder_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Kita' (Kindertagesstätte)?",
        options: [
          { id: "a", text: "Bölcsőde / Óvoda" },
          { id: "b", text: "Iskola" },
          { id: "c", text: "Kórház" },
        ],
        correctOptionId: "a",
      },
      { id: "de_kinder_q4", type: "flashcard", prompt: "Anya/apa mindjárt jön.", backText: "Die Mama/der Papa kommt gleich.", phonetic: "Dí má-má/der pá-pá komt glájh." },
      {
        id: "de_kinder_q5",
        type: "match",
        prompt: "Párosítsd a gyermekgondozási szavakat!",
        pairs: [
          { id: "p1", left: "Játszótér", right: "Spielplatz" },
          { id: "p2", left: "Altatódal", right: "Schlaflied" },
          { id: "p3", left: "Babakocsi", right: "Kinderwagen" },
          { id: "p4", left: "Cumi", right: "Schnuller" },
        ],
      },
    ],
  },
  {
    id: "de_landw_1",
    title: "Mezőgazdaság Alapok 1.",
    description: "Alapvető kifejezések aratáshoz és üvegházi munkához Németországban.",
    industry: "Mezőgazdaság (Landwirtschaft)",
    xpReward: 15,
    isPro: true,
    lang: "de-DE",
    questions: [
      { id: "de_landw_q1", type: "flashcard", prompt: "Aratás", backText: "Ernte", phonetic: "Ern-te" },
      { id: "de_landw_q2", type: "flashcard", prompt: "Üvegház", backText: "Gewächshaus", phonetic: "Ge-veksz-háusz" },
      {
        id: "de_landw_q3",
        type: "multiple_choice",
        prompt: "Mit jelent az 'Obsternte'?",
        options: [
          { id: "a", text: "Gyümölcsszedés" },
          { id: "b", text: "Vetés" },
          { id: "c", text: "Öntözés" },
        ],
        correctOptionId: "a",
      },
      { id: "de_landw_q4", type: "flashcard", prompt: "Vigyázz a tövisekkel!", backText: "Vorsicht vor den Dornen!", phonetic: "Fór-ziht for den dór-nen!" },
      {
        id: "de_landw_q5",
        type: "match",
        prompt: "Párosítsd a mezőgazdasági szavakat!",
        pairs: [
          { id: "p1", left: "Öntözés", right: "Bewässerung" },
          { id: "p2", left: "Traktor", right: "Traktor" },
          { id: "p3", left: "Vetés", right: "Aussaat" },
          { id: "p4", left: "Szüret", right: "Weinlese" },
        ],
      },
    ],
  },
  {
    id: "de_auto_1",
    title: "Autószerelő Alapok 1.",
    description: "Alapvető kifejezések egy német autószervizben.",
    industry: "Gépjárműipar (Automechaniker)",
    xpReward: 15,
    isPro: true,
    lang: "de-DE",
    questions: [
      { id: "de_auto_q1", type: "flashcard", prompt: "Fékek", backText: "Bremse", phonetic: "Brém-ze" },
      { id: "de_auto_q2", type: "flashcard", prompt: "Olajcsere", backText: "Ölwechsel", phonetic: "Öl-vek-szel" },
      {
        id: "de_auto_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Reifen'?",
        options: [
          { id: "a", text: "Gumiabroncs" },
          { id: "b", text: "Akkumulátor" },
          { id: "c", text: "Kipufogó" },
        ],
        correctOptionId: "a",
      },
      { id: "de_auto_q4", type: "flashcard", prompt: "Mikor lesz kész az autó?", backText: "Wann ist das Auto fertig?", phonetic: "Van iszt dász áu-tó fer-tih?" },
      {
        id: "de_auto_q5",
        type: "match",
        prompt: "Párosítsd az autószerelős szavakat!",
        pairs: [
          { id: "p1", left: "Akkumulátor", right: "Batterie" },
          { id: "p2", left: "Kipufogó", right: "Auspuff" },
          { id: "p3", left: "Szerviz / Műhely", right: "Werkstatt" },
          { id: "p4", left: "Motor", right: "Motor" },
        ],
      },
    ],
  },
  {
    id: "de_sich_1",
    title: "Biztonsági Szolgálat Alapok 1.",
    description: "Alapvető kifejezések biztonsági őrként Németországban.",
    industry: "Biztonsági szolgálat (Sicherheitsdienst)",
    xpReward: 15,
    isPro: true,
    lang: "de-DE",
    questions: [
      { id: "de_sich_q1", type: "flashcard", prompt: "Riasztó", backText: "Alarm", phonetic: "Á-lárm" },
      { id: "de_sich_q2", type: "flashcard", prompt: "Vészkijárat", backText: "Notausgang", phonetic: "Nót-áusz-gáng" },
      {
        id: "de_sich_q3",
        type: "multiple_choice",
        prompt: "Mit jelent az 'Überwachungskamera'?",
        options: [
          { id: "a", text: "Biztonsági kamera" },
          { id: "b", text: "Belépőkártya" },
          { id: "c", text: "Riasztó" },
        ],
        correctOptionId: "a",
      },
      { id: "de_sich_q4", type: "flashcard", prompt: "Mutassa kérem az igazolványát!", backText: "Zeigen Sie bitte Ihren Ausweis!", phonetic: "Cáj-gen zí bit-te í-ren áusz-vájsz!" },
      {
        id: "de_sich_q5",
        type: "match",
        prompt: "Párosítsd a biztonsági szavakat!",
        pairs: [
          { id: "p1", left: "Belépőkártya", right: "Zutrittskarte" },
          { id: "p2", left: "Őrjárat", right: "Kontrollgang" },
          { id: "p3", left: "Behatolás", right: "Einbruch" },
          { id: "p4", left: "Kulcscsomó", right: "Schlüsselbund" },
        ],
      },
    ],
  },
  {
    id: "de_hotel_1",
    title: "Szállodaipar Alapok 1.",
    description: "Alapvető kifejezések recepciósként vagy szobalányként egy német szállodában.",
    industry: "Szállodaipar (Hotellerie)",
    xpReward: 15,
    isPro: true,
    lang: "de-DE",
    questions: [
      { id: "de_hotel_q1", type: "flashcard", prompt: "Szobakulcs", backText: "Zimmerschlüssel", phonetic: "Cim-mer-slüs-szel" },
      { id: "de_hotel_q2", type: "flashcard", prompt: "Törölköző", backText: "Handtuch", phonetic: "Hánt-túh" },
      {
        id: "de_hotel_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Reservierung'?",
        options: [
          { id: "a", text: "Foglalás" },
          { id: "b", text: "Számla" },
          { id: "c", text: "Bejelentkezés" },
        ],
        correctOptionId: "a",
      },
      { id: "de_hotel_q4", type: "flashcard", prompt: "Sajnos a szoba még nincs kész.", backText: "Das Zimmer ist leider noch nicht fertig.", phonetic: "Dász cim-mer iszt láj-der noh niht fer-tih." },
      {
        id: "de_hotel_q5",
        type: "match",
        prompt: "Párosítsd a szállodai szavakat!",
        pairs: [
          { id: "p1", left: "Recepció", right: "Rezeption" },
          { id: "p2", left: "Ágyazás", right: "Bett machen" },
          { id: "p3", left: "Bejelentkezés", right: "Check-in" },
          { id: "p4", left: "Takarítónő", right: "Zimmermädchen" },
        ],
      },
    ],
  },
  {
    id: "de_kueche_1",
    title: "Konyhai Személyzet Alapok 1.",
    description: "Alapvető kifejezések konyhai kisegítőként egy német étteremben.",
    industry: "Konyhai személyzet (Küche)",
    xpReward: 15,
    isPro: true,
    lang: "de-DE",
    questions: [
      { id: "de_kueche_q1", type: "flashcard", prompt: "Mosogatás", backText: "Abwasch", phonetic: "Áb-vas" },
      { id: "de_kueche_q2", type: "flashcard", prompt: "Vágódeszka", backText: "Schneidebrett", phonetic: "Snáj-de-bret" },
      {
        id: "de_kueche_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Gewürz'?",
        options: [
          { id: "a", text: "Fűszer" },
          { id: "b", text: "Serpenyő" },
          { id: "c", text: "Hámozás" },
        ],
        correctOptionId: "a",
      },
      { id: "de_kueche_q4", type: "flashcard", prompt: "Vigyázz, forró!", backText: "Vorsicht, heiß!", phonetic: "Fór-ziht, hájsz!" },
      {
        id: "de_kueche_q5",
        type: "match",
        prompt: "Párosítsd a konyhai szavakat!",
        pairs: [
          { id: "p1", left: "Serpenyő", right: "Pfanne" },
          { id: "p2", left: "Hámozás", right: "Schälen" },
          { id: "p3", left: "Higiénia", right: "Hygiene" },
          { id: "p4", left: "Fazék", right: "Topf" },
        ],
      },
    ],
  },
  {
    id: "de_pro_1",
    title: "Mesterkurzus: Fizetésemelés és Konfliktus",
    description: "Német párbeszédek: hogyan kérj fizetésemelést, vagy rendezz el egy konfliktust a főnököddel.",
    industry: "Építőipar (Baubranche)",
    xpReward: 50,
    isPro: true,
    lang: "de-DE",
    questions: [
      { id: "de_pro_q1", type: "flashcard", prompt: "Szeretnék beszélni a fizetésemről.", backText: "Ich möchte gerne über mein Gehalt sprechen.", phonetic: "Ih möh-te ger-ne über mejn ge-halt spre-hen" },
      {
        id: "de_pro_q2",
        type: "multiple_choice",
        prompt: "Hogyan mondod: 'Az utóbbi időben több felelősséget vállalok'?",
        options: [
          { id: "a", text: "Ich übernehme in letzter Zeit mehr Verantwortung." },
          { id: "b", text: "Ich arbeite mehr als die anderen." },
          { id: "c", text: "Ich brauche mehr Geld." },
        ],
        correctOptionId: "a",
      },
      { id: "de_pro_q3", type: "flashcard", prompt: "Ez nem az én hibám volt.", backText: "Das war nicht mein Fehler.", phonetic: "Dász vár niht mejn fé-ler" },
    ],
  },
];

/* ═══════════════════════════ HOLLANDIA (Nederlands) ═══════════════════════════
 * Holland munkahelyi szókincs. TTS: nl-NL. Első lecke INGYENES.
 */
export const INDUSTRY_LESSONS_NL: Lesson[] = [
  {
    id: "nl_bouw_1",
    title: "Építőipari Alapok 1.",
    description: "Alapvető szerszámok és kifejezések a holland építkezéseken (bouwplaats).",
    industry: "Építőipar (Bouw)",
    xpReward: 15,
    isPro: false,
    lang: "nl-NL",
    questions: [
      { id: "nl_bouw_q1", type: "flashcard", prompt: "Fúrógép", backText: "Boormachine", phonetic: "Bór-má-hí-ne" },
      { id: "nl_bouw_q2", type: "flashcard", prompt: "Talicska", backText: "Kruiwagen", phonetic: "Kröi-vá-hen" },
      {
        id: "nl_bouw_q3",
        type: "multiple_choice",
        prompt: "Mit jelent az 'Uitvoerder' szó az építkezésen?",
        options: [
          { id: "a", text: "Művezető / Építésvezető" },
          { id: "b", text: "Takarító" },
          { id: "c", text: "Sofőr" },
        ],
        correctOptionId: "a",
      },
      { id: "nl_bouw_q4", type: "flashcard", prompt: "Létra", backText: "Ladder", phonetic: "Lad-der" },
      {
        id: "nl_bouw_q5",
        type: "match",
        prompt: "Párosítsd a szerszámokat!",
        pairs: [
          { id: "p1", left: "Kalapács", right: "Hamer" },
          { id: "p2", left: "Csavarhúzó", right: "Schroevendraaier" },
          { id: "p3", left: "Mérőszalag", right: "Rolmaat" },
          { id: "p4", left: "Vízmérték", right: "Waterpas" },
        ],
      },
    ],
  },
  {
    id: "nl_horeca_1",
    title: "Vendéglátás: Rendelésfelvétel",
    description: "Hogyan szolgálj ki holland vendégeket egy étteremben (horeca)?",
    industry: "Vendéglátás (Horeca)",
    xpReward: 15,
    isPro: true,
    lang: "nl-NL",
    questions: [
      { id: "nl_hor_q1", type: "flashcard", prompt: "Mit szeretne inni?", backText: "Wat wilt u drinken?", phonetic: "Vat vilt ü drin-ken?" },
      { id: "nl_hor_q2", type: "flashcard", prompt: "A számlát, kérem.", backText: "De rekening, alstublieft.", phonetic: "De ré-ke-ning, alsz-tü-blíft" },
      {
        id: "nl_hor_q3",
        type: "multiple_choice",
        prompt: "Hogy hívják hollandul a borravalót?",
        options: [
          { id: "a", text: "Fooi" },
          { id: "b", text: "Rekening" },
          { id: "c", text: "Bon" },
        ],
        correctOptionId: "a",
      },
      { id: "nl_hor_q4", type: "flashcard", prompt: "Köszönöm szépen", backText: "Dank u wel", phonetic: "Dank ü vel" },
      {
        id: "nl_hor_q5",
        type: "match",
        prompt: "Párosítsd az éttermi szavakat!",
        pairs: [
          { id: "p1", left: "Étlap", right: "Menukaart" },
          { id: "p2", left: "Számla", right: "Rekening" },
          { id: "p3", left: "Kés", right: "Mes" },
          { id: "p4", left: "Villa", right: "Vork" },
        ],
      },
    ],
  },
  {
    id: "nl_zorg_1",
    title: "Ápolás és Egészségügy 1.",
    description: "Alapvető kifejezések az idősgondozásban és kórházban (zorg).",
    industry: "Egészségügy (Zorg)",
    xpReward: 15,
    isPro: true,
    lang: "nl-NL",
    questions: [
      { id: "nl_zorg_q1", type: "flashcard", prompt: "Fájdalomcsillapító", backText: "Pijnstiller", phonetic: "Pejn-sztil-ler" },
      {
        id: "nl_zorg_q2",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Rolstoel'?",
        options: [
          { id: "a", text: "Kerekesszék" },
          { id: "b", text: "Mankó" },
          { id: "c", text: "Injekció" },
        ],
        correctOptionId: "a",
      },
      { id: "nl_zorg_q3", type: "flashcard", prompt: "Fáj valamije?", backText: "Heeft u pijn?", phonetic: "Héft ü pejn?" },
    ],
  },
  {
    id: "nl_verk_1",
    title: "Kiskereskedelem Alapok 1.",
    description: "Pénztár, polc és vevőkiszolgálás egy holland boltban.",
    industry: "Kiskereskedelem (Detailhandel)",
    xpReward: 15,
    isPro: true,
    lang: "nl-NL",
    questions: [
      { id: "nl_verk_q1", type: "flashcard", prompt: "Segíthetek?", backText: "Kan ik u helpen?", phonetic: "Kan ik ü hel-pen?" },
      { id: "nl_verk_q2", type: "flashcard", prompt: "Blokk / nyugta", backText: "Kassabon", phonetic: "Kász-szá-bon" },
      {
        id: "nl_verk_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Paskamer'?",
        options: [
          { id: "a", text: "Próbafülke" },
          { id: "b", text: "Raktár" },
          { id: "c", text: "Pénztár" },
        ],
        correctOptionId: "a",
      },
      { id: "nl_verk_q4", type: "flashcard", prompt: "Pénztár", backText: "Kassa", phonetic: "Kász-szá" },
      {
        id: "nl_verk_q5",
        type: "match",
        prompt: "Párosítsd a boltos szavakat!",
        pairs: [
          { id: "p1", left: "Polc", right: "Schap" },
          { id: "p2", left: "Vevő", right: "Klant" },
          { id: "p3", left: "Árengedmény", right: "Korting" },
          { id: "p4", left: "Készlet", right: "Voorraad" },
        ],
      },
    ],
  },
  {
    id: "nl_mag_1",
    title: "Raktár és Logisztika Alapok 1.",
    description: "Targonca, raklap és szállítás egy holland raktárban.",
    industry: "Raktár (Magazijn)",
    xpReward: 15,
    isPro: true,
    lang: "nl-NL",
    questions: [
      { id: "nl_mag_q1", type: "flashcard", prompt: "Targonca", backText: "Heftruck", phonetic: "Héf-truk" },
      { id: "nl_mag_q2", type: "flashcard", prompt: "Raklap", backText: "Pallet", phonetic: "Pál-let" },
      {
        id: "nl_mag_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Heftruck'?",
        options: [
          { id: "a", text: "Targonca" },
          { id: "b", text: "Teherautó" },
          { id: "c", text: "Daru" },
        ],
        correctOptionId: "a",
      },
      { id: "nl_mag_q4", type: "flashcard", prompt: "Vigyázz, nehéz!", backText: "Voorzichtig, het is zwaar!", phonetic: "Vór-zih-tih, het isz zvár!" },
      {
        id: "nl_mag_q5",
        type: "match",
        prompt: "Párosítsd a raktáros szavakat!",
        pairs: [
          { id: "p1", left: "Raktárkészlet", right: "Voorraad" },
          { id: "p2", left: "Szállítólevél", right: "Pakbon" },
          { id: "p3", left: "Komissiózás", right: "Orderpicken" },
          { id: "p4", left: "Vonalkód-olvasó", right: "Scanner" },
        ],
      },
    ],
  },
  {
    id: "nl_schoon_1",
    title: "Takarítás Alapok 1.",
    description: "Tisztítószerek és biztonsági alapszavak takarítóknak.",
    industry: "Takarítás (Schoonmaak)",
    xpReward: 15,
    isPro: true,
    lang: "nl-NL",
    questions: [
      { id: "nl_schoon_q1", type: "flashcard", prompt: "Vödör", backText: "Emmer", phonetic: "Em-mer" },
      { id: "nl_schoon_q2", type: "flashcard", prompt: "Porszívó", backText: "Stofzuiger", phonetic: "Sztof-zöi-ger" },
      {
        id: "nl_schoon_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Stofzuiger'?",
        options: [
          { id: "a", text: "Porszívó" },
          { id: "b", text: "Felmosó" },
          { id: "c", text: "Vödör" },
        ],
        correctOptionId: "a",
      },
      { id: "nl_schoon_q4", type: "flashcard", prompt: "Vigyázat, csúszós a padló!", backText: "Let op, gladde vloer!", phonetic: "Let op, hlad-de vlúr!" },
      {
        id: "nl_schoon_q5",
        type: "match",
        prompt: "Párosítsd a takarítós szavakat!",
        pairs: [
          { id: "p1", left: "Gumikesztyű", right: "Rubberen handschoenen" },
          { id: "p2", left: "Szemeteszsák", right: "Vuilniszak" },
          { id: "p3", left: "Fertőtlenítőszer", right: "Desinfectiemiddel" },
          { id: "p4", left: "Felmosó", right: "Mop" },
        ],
      },
    ],
  },
  {
    id: "nl_prod_1",
    title: "Gyártás Alapok 1.",
    description: "Futószalag, alkatrészek és biztonsági szabályok egy üzemben.",
    industry: "Gyártás (Productie)",
    xpReward: 15,
    isPro: true,
    lang: "nl-NL",
    questions: [
      { id: "nl_prod_q1", type: "flashcard", prompt: "Futószalag", backText: "Lopende band", phonetic: "Ló-pen-de bant" },
      { id: "nl_prod_q2", type: "flashcard", prompt: "Alkatrész", backText: "Onderdeel", phonetic: "On-der-déll" },
      {
        id: "nl_prod_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Ploegleider'?",
        options: [
          { id: "a", text: "Műszakvezető" },
          { id: "b", text: "Gépkezelő" },
          { id: "c", text: "Takarító" },
        ],
        correctOptionId: "a",
      },
      { id: "nl_prod_q4", type: "flashcard", prompt: "Kapcsold ki a gépet!", backText: "Zet de machine uit!", phonetic: "Zet de má-sí-ne öit!" },
      {
        id: "nl_prod_q5",
        type: "match",
        prompt: "Párosítsd az üzemi szavakat!",
        pairs: [
          { id: "p1", left: "Védőszemüveg", right: "Veiligheidsbril" },
          { id: "p2", left: "Éjszakai műszak", right: "Nachtdienst" },
          { id: "p3", left: "Minőségellenőrzés", right: "Kwaliteitscontrole" },
          { id: "p4", left: "Gyártósor", right: "Productielijn" },
        ],
      },
    ],
  },
  {
    id: "nl_kapper_1",
    title: "Fodrászat Alapok 1.",
    description: "Alapvető szerszámok és kifejezések egy holland fodrászatban.",
    industry: "Szépségipar (Kapper)",
    xpReward: 15,
    isPro: true,
    lang: "nl-NL",
    questions: [
      { id: "nl_kapper_q1", type: "flashcard", prompt: "Olló", backText: "Schaar", phonetic: "Szkhár" },
      { id: "nl_kapper_q2", type: "flashcard", prompt: "Hajszárító", backText: "Föhn", phonetic: "Főn" },
      {
        id: "nl_kapper_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Kapper'?",
        options: [
          { id: "a", text: "Fodrász / Fodrászat" },
          { id: "b", text: "Kozmetikus" },
          { id: "c", text: "Manikűrös" },
        ],
        correctOptionId: "a",
      },
      { id: "nl_kapper_q4", type: "flashcard", prompt: "Hogy szeretné vágatni a haját?", backText: "Hoe wilt u uw haar geknipt hebben?", phonetic: "Hú vilt ü üv hár he-knipt heb-ben?" },
      {
        id: "nl_kapper_q5",
        type: "match",
        prompt: "Párosítsd a fodrászati szavakat!",
        pairs: [
          { id: "p1", left: "Fésű", right: "Kam" },
          { id: "p2", left: "Hajfesték", right: "Haarkleuring" },
          { id: "p3", left: "Samponozás", right: "Haren wassen" },
          { id: "p4", left: "Borotva", right: "Scheerapparaat" },
        ],
      },
    ],
  },
  {
    id: "nl_chauffeur_1",
    title: "Szállítás és Kézbesítés Alapok 1.",
    description: "Alapvető kifejezések futárként vagy sofőrként Hollandiában.",
    industry: "Szállítás (Chauffeur)",
    xpReward: 15,
    isPro: true,
    lang: "nl-NL",
    questions: [
      { id: "nl_chauffeur_q1", type: "flashcard", prompt: "Jogosítvány", backText: "Rijbewijs", phonetic: "Réj-be-vejsz" },
      { id: "nl_chauffeur_q2", type: "flashcard", prompt: "Csomag", backText: "Pakket", phonetic: "Pak-ket" },
      {
        id: "nl_chauffeur_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Levering'?",
        options: [
          { id: "a", text: "Kézbesítés / Szállítás" },
          { id: "b", text: "Számla" },
          { id: "c", text: "Útvonal" },
        ],
        correctOptionId: "a",
      },
      { id: "nl_chauffeur_q4", type: "flashcard", prompt: "Hol írjam alá?", backText: "Waar moet ik tekenen?", phonetic: "Vár mút ik té-ke-nen?" },
      {
        id: "nl_chauffeur_q5",
        type: "match",
        prompt: "Párosítsd a szállítási szavakat!",
        pairs: [
          { id: "p1", left: "Rakomány", right: "Lading" },
          { id: "p2", left: "Útvonal", right: "Route" },
          { id: "p3", left: "Kipakolás", right: "Lossen" },
          { id: "p4", left: "Áruszállítás", right: "Goederenvervoer" },
        ],
      },
    ],
  },
  {
    id: "nl_kinderopvang_1",
    title: "Gyermekgondozás Alapok 1.",
    description: "Alapvető kifejezések bébiszitterként vagy bölcsődei dolgozóként.",
    industry: "Gyermekgondozás (Kinderopvang)",
    xpReward: 15,
    isPro: true,
    lang: "nl-NL",
    questions: [
      { id: "nl_kinderopvang_q1", type: "flashcard", prompt: "Pelenka", backText: "Luier", phonetic: "Löi-er" },
      { id: "nl_kinderopvang_q2", type: "flashcard", prompt: "Etetés", backText: "Voeden", phonetic: "Fú-den" },
      {
        id: "nl_kinderopvang_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Kinderdagverblijf'?",
        options: [
          { id: "a", text: "Bölcsőde" },
          { id: "b", text: "Iskola" },
          { id: "c", text: "Kórház" },
        ],
        correctOptionId: "a",
      },
      { id: "nl_kinderopvang_q4", type: "flashcard", prompt: "Anya/apa mindjárt jön.", backText: "Mama/papa komt zo.", phonetic: "Má-má/pá-pá komt zó." },
      {
        id: "nl_kinderopvang_q5",
        type: "match",
        prompt: "Párosítsd a gyermekgondozási szavakat!",
        pairs: [
          { id: "p1", left: "Játszótér", right: "Speeltuin" },
          { id: "p2", left: "Altatódal", right: "Slaapliedje" },
          { id: "p3", left: "Babakocsi", right: "Kinderwagen" },
          { id: "p4", left: "Cumi", right: "Speen" },
        ],
      },
    ],
  },
  {
    id: "nl_landbouw_1",
    title: "Mezőgazdaság Alapok 1.",
    description: "Alapvető kifejezések aratáshoz és üvegházi (kassen) munkához Hollandiában.",
    industry: "Mezőgazdaság (Landbouw)",
    xpReward: 15,
    isPro: true,
    lang: "nl-NL",
    questions: [
      { id: "nl_landbouw_q1", type: "flashcard", prompt: "Aratás", backText: "Oogst", phonetic: "Ógszt" },
      { id: "nl_landbouw_q2", type: "flashcard", prompt: "Üvegház", backText: "Kas (a hollandiai üvegházi ágazat, pl. paradicsom/virág, gyakori magyar munkahely)", phonetic: "Kász" },
      {
        id: "nl_landbouw_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Fruitpluk'?",
        options: [
          { id: "a", text: "Gyümölcsszedés" },
          { id: "b", text: "Vetés" },
          { id: "c", text: "Öntözés" },
        ],
        correctOptionId: "a",
      },
      { id: "nl_landbouw_q4", type: "flashcard", prompt: "Vigyázz a tövisekkel!", backText: "Pas op voor de doornen!", phonetic: "Pász op vór de dór-nen!" },
      {
        id: "nl_landbouw_q5",
        type: "match",
        prompt: "Párosítsd a mezőgazdasági szavakat!",
        pairs: [
          { id: "p1", left: "Öntözés", right: "Bewatering" },
          { id: "p2", left: "Traktor", right: "Tractor" },
          { id: "p3", left: "Vetés", right: "Zaaien" },
          { id: "p4", left: "Betakarítás", right: "Oogsten" },
        ],
      },
    ],
  },
  {
    id: "nl_auto_1",
    title: "Autószerelő Alapok 1.",
    description: "Alapvető kifejezések egy holland autószervizben.",
    industry: "Gépjárműipar (Automonteur)",
    xpReward: 15,
    isPro: true,
    lang: "nl-NL",
    questions: [
      { id: "nl_auto_q1", type: "flashcard", prompt: "Fékek", backText: "Rem", phonetic: "Rem" },
      { id: "nl_auto_q2", type: "flashcard", prompt: "Olajcsere", backText: "Olieverversing", phonetic: "Ó-lí-fer-fer-zing" },
      {
        id: "nl_auto_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Band'?",
        options: [
          { id: "a", text: "Gumiabroncs" },
          { id: "b", text: "Akkumulátor" },
          { id: "c", text: "Kipufogó" },
        ],
        correctOptionId: "a",
      },
      { id: "nl_auto_q4", type: "flashcard", prompt: "Mikor lesz kész az autó?", backText: "Wanneer is de auto klaar?", phonetic: "Van-nér isz de áu-tó klár?" },
      {
        id: "nl_auto_q5",
        type: "match",
        prompt: "Párosítsd az autószerelős szavakat!",
        pairs: [
          { id: "p1", left: "Akkumulátor", right: "Accu" },
          { id: "p2", left: "Kipufogó", right: "Uitlaat" },
          { id: "p3", left: "Szerviz / Műhely", right: "Werkplaats" },
          { id: "p4", left: "Motor", right: "Motor" },
        ],
      },
    ],
  },
  {
    id: "nl_bewaking_1",
    title: "Biztonsági Szolgálat Alapok 1.",
    description: "Alapvető kifejezések biztonsági őrként Hollandiában.",
    industry: "Biztonsági szolgálat (Beveiliging)",
    xpReward: 15,
    isPro: true,
    lang: "nl-NL",
    questions: [
      { id: "nl_bewaking_q1", type: "flashcard", prompt: "Riasztó", backText: "Alarm", phonetic: "Á-lárm" },
      { id: "nl_bewaking_q2", type: "flashcard", prompt: "Vészkijárat", backText: "Nooduitgang", phonetic: "Nód-öit-hang" },
      {
        id: "nl_bewaking_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Bewakingscamera'?",
        options: [
          { id: "a", text: "Biztonsági kamera" },
          { id: "b", text: "Belépőkártya" },
          { id: "c", text: "Riasztó" },
        ],
        correctOptionId: "a",
      },
      { id: "nl_bewaking_q4", type: "flashcard", prompt: "Mutassa kérem az igazolványát!", backText: "Mag ik uw legitimatie zien?", phonetic: "Mah ik üv lé-hí-tí-má-cí zín?" },
      {
        id: "nl_bewaking_q5",
        type: "match",
        prompt: "Párosítsd a biztonsági szavakat!",
        pairs: [
          { id: "p1", left: "Belépőkártya", right: "Toegangspas" },
          { id: "p2", left: "Őrjárat", right: "Surveillance" },
          { id: "p3", left: "Behatolás", right: "Inbraak" },
          { id: "p4", left: "Kulcscsomó", right: "Sleutelbos" },
        ],
      },
    ],
  },
  {
    id: "nl_hotel_1",
    title: "Szállodaipar Alapok 1.",
    description: "Alapvető kifejezések recepciósként vagy szobalányként egy holland szállodában.",
    industry: "Szállodaipar (Hotellerie)",
    xpReward: 15,
    isPro: true,
    lang: "nl-NL",
    questions: [
      { id: "nl_hotel_q1", type: "flashcard", prompt: "Szobakulcs", backText: "Kamersleutel", phonetic: "Ká-mer-szlő-tel" },
      { id: "nl_hotel_q2", type: "flashcard", prompt: "Törölköző", backText: "Handdoek", phonetic: "Hánd-dúk" },
      {
        id: "nl_hotel_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Reservering'?",
        options: [
          { id: "a", text: "Foglalás" },
          { id: "b", text: "Számla" },
          { id: "c", text: "Bejelentkezés" },
        ],
        correctOptionId: "a",
      },
      { id: "nl_hotel_q4", type: "flashcard", prompt: "Sajnos a szoba még nincs kész.", backText: "De kamer is helaas nog niet klaar.", phonetic: "De ká-mer isz he-lász noh nít klár." },
      {
        id: "nl_hotel_q5",
        type: "match",
        prompt: "Párosítsd a szállodai szavakat!",
        pairs: [
          { id: "p1", left: "Recepció", right: "Receptie" },
          { id: "p2", left: "Ágyazás", right: "Bed opmaken" },
          { id: "p3", left: "Bejelentkezés", right: "Inchecken" },
          { id: "p4", left: "Takarítónő", right: "Kamermeisje" },
        ],
      },
    ],
  },
  {
    id: "nl_keuken_1",
    title: "Konyhai Személyzet Alapok 1.",
    description: "Alapvető kifejezések konyhai kisegítőként egy holland étteremben.",
    industry: "Konyhai személyzet (Keuken)",
    xpReward: 15,
    isPro: true,
    lang: "nl-NL",
    questions: [
      { id: "nl_keuken_q1", type: "flashcard", prompt: "Mosogatás", backText: "Afwas", phonetic: "Áf-vasz" },
      { id: "nl_keuken_q2", type: "flashcard", prompt: "Vágódeszka", backText: "Snijplank", phonetic: "Sznej-plank" },
      {
        id: "nl_keuken_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Kruiden'?",
        options: [
          { id: "a", text: "Fűszer" },
          { id: "b", text: "Serpenyő" },
          { id: "c", text: "Hámozás" },
        ],
        correctOptionId: "a",
      },
      { id: "nl_keuken_q4", type: "flashcard", prompt: "Vigyázz, forró!", backText: "Pas op, heet!", phonetic: "Pász op, hét!" },
      {
        id: "nl_keuken_q5",
        type: "match",
        prompt: "Párosítsd a konyhai szavakat!",
        pairs: [
          { id: "p1", left: "Serpenyő", right: "Pan" },
          { id: "p2", left: "Hámozás", right: "Schillen" },
          { id: "p3", left: "Higiénia", right: "Hygiëne" },
          { id: "p4", left: "Fazék", right: "Pot" },
        ],
      },
    ],
  },
  {
    id: "nl_pro_1",
    title: "Mesterkurzus: Fizetésemelés és Konfliktus",
    description: "Holland párbeszédek: hogyan kérj fizetésemelést, vagy rendezz el egy konfliktust a főnököddel.",
    industry: "Építőipar (Bouw)",
    xpReward: 50,
    isPro: true,
    lang: "nl-NL",
    questions: [
      { id: "nl_pro_q1", type: "flashcard", prompt: "Szeretnék beszélni a fizetésemről.", backText: "Ik wil graag over mijn salaris praten.", phonetic: "Ik vil hrág over mejn szá-lá-risz prá-ten" },
      {
        id: "nl_pro_q2",
        type: "multiple_choice",
        prompt: "Hogyan mondod: 'Az utóbbi időben több felelősséget vállalok'?",
        options: [
          { id: "a", text: "Ik neem de laatste tijd meer verantwoordelijkheid op me." },
          { id: "b", text: "Ik werk meer dan de anderen." },
          { id: "c", text: "Ik heb meer geld nodig." },
        ],
        correctOptionId: "a",
      },
      { id: "nl_pro_q3", type: "flashcard", prompt: "Ez nem az én hibám volt.", backText: "Dat was niet mijn fout.", phonetic: "Dat vász nít mejn faut" },
    ],
  },
];

/** Ország → szótár-leckék (CH default). A menüből választott ország szerint. */
export function getIndustryLessons(country: string | null | undefined): Lesson[] {
  if (country === "AT") return INDUSTRY_LESSONS_AT;
  if (country === "DE") return INDUSTRY_LESSONS_DE;
  if (country === "NL") return INDUSTRY_LESSONS_NL;
  return INDUSTRY_LESSONS;
}

/** Lecke keresése ID alapján az ÖSSZES ország bankjában (az URL csak az id-t hordozza). */
export function findLessonById(id: string): Lesson | undefined {
  return [
    ...INDUSTRY_LESSONS,
    ...INDUSTRY_LESSONS_AT,
    ...INDUSTRY_LESSONS_DE,
    ...INDUSTRY_LESSONS_NL,
  ].find((l) => l.id === id);
}
