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

  // ── 8. PRO LECKÉK ─────────────────────────────────────────────
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
