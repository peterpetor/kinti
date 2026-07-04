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
  
  // ── 4. PRO LECKÉK ─────────────────────────────────────────────
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
