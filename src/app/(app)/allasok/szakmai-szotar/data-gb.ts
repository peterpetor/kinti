import type { Lesson } from "./data";

/**
 * Szakmai Szótár — ANGOL (brit) leckebank.
 *
 * ⚠️ EZ A BANK SZÁNDÉKOSAN MÁS LOGIKÁJÚ, mint a német/holland. Az angolt a
 * legtöbb magyar TANULTA valamennyire — csak jellemzően AMERIKAI angolt, appból
 * vagy filmből. A munkahelyen viszont a brit szó a használatos, és a különbség
 * néha teljes félreértés: a „hoover” nem márkanév, a „nappy” nem „diaper”, a
 * „spanner” nem „wrench”, és aki „gas”-t kér a benzinkúton, gázt kér.
 * Ezért minden leckében szerepel a BRIT ↔ AMERIKAI csapda, ahol van ilyen.
 *
 * ⚠️ MÁSODIK, ENNÉL IS FONTOSABB RÉTEG: a brit szakmákban a MUNKAVÉGZÉS
 * ENGEDÉLYHEZ kötött, és ezeket a rövidítéseket a hirdetés kérdés nélkül
 * felteszi. Aki nem tudja, mi a CSCS, a DBS, az SIA vagy a Gas Safe, az nem
 * nyelvi hátrányban van, hanem ki sem tud menni interjúra. Ezért ezek nem
 * „érdekesség”, hanem a leckék gerince.
 *
 * A fonetika magyar olvasat szerinti KÖZELÍTÉS (nem IPA) — a cél, hogy a
 * felhasználó ki tudja mondani, ne az, hogy nyelvészetileg pontos legyen.
 * TTS-nyelv: en-GB (⚠️ NEM en-US — az pont azt a kiejtést adná vissza, amit a
 * bank megkülönböztetni tanít).
 */
export const INDUSTRY_LESSONS_GB: Lesson[] = [
  // ── 1. Építőipar ────────────────────────────────────────────
  {
    id: "gb_constr_1",
    title: "Építőipari Alapok 1.",
    description: "Szerszámok, munkavédelem és a CSCS-kártya — amit az első nap tudni kell.",
    industry: "Építőipar (Construction)",
    xpReward: 15,
    isPro: false,
    lang: "en-GB",
    questions: [
      { id: "gb_constr_q1", type: "flashcard", prompt: "Vízmérték", backText: "Spirit level", phonetic: "Szpi-rit le-völ" },
      { id: "gb_constr_q2", type: "flashcard", prompt: "Csavarkulcs", backText: "Spanner", phonetic: "Szpe-nör" },
      {
        id: "gb_constr_q3",
        type: "multiple_choice",
        prompt: "⚠️ Mi a CSCS-kártya, és miért kell?",
        options: [
          { id: "a", text: "Munkavédelmi képzést igazoló kártya — a legtöbb építkezésre enélkül be sem engednek" },
          { id: "b", text: "Egy szakszervezeti tagkártya" },
          { id: "c", text: "Kedvezménykártya szerszámboltokba" },
        ],
        correctOptionId: "a",
      },
      { id: "gb_constr_q4", type: "flashcard", prompt: "Láthatósági mellény", backText: "Hi-vis vest", phonetic: "Háj-viz veszt" },
      {
        id: "gb_constr_q5",
        type: "match",
        prompt: "Párosítsd a szerszámokat!",
        pairs: [
          { id: "p1", left: "Kalapács", right: "Hammer" },
          { id: "p2", left: "Mérőszalag", right: "Tape measure" },
          { id: "p3", left: "Állvány", right: "Scaffolding" },
          { id: "p4", left: "Védőszemüveg", right: "Safety goggles" },
        ],
      },
    ],
  },
  {
    id: "gb_constr_2",
    title: "Építőipari Alapok 2.",
    description: "Anyagok, utasítások és a napi biztonsági megbeszélés (toolbox talk).",
    industry: "Építőipar (Construction)",
    xpReward: 20,
    isPro: true,
    lang: "en-GB",
    questions: [
      { id: "gb_constr2_q1", type: "flashcard", prompt: "Kérek egy zsák cementet.", backText: "Can I have a bag of cement, please?", phonetic: "Ken áj hev ö beg ov szö-ment, plíz?" },
      { id: "gb_constr2_q2", type: "flashcard", prompt: "Hol van a művezető?", backText: "Where is the site manager?", phonetic: "Veör iz dö szájt me-nid-zsör?" },
      {
        id: "gb_constr2_q3",
        type: "multiple_choice",
        prompt: "Mi az a „toolbox talk”?",
        options: [
          { id: "a", text: "Rövid, munka előtti biztonsági megbeszélés a csapattal" },
          { id: "b", text: "A szerszámláda leltározása" },
          { id: "c", text: "Fizetési tárgyalás" },
        ],
        correctOptionId: "a",
      },
      { id: "gb_constr2_q4", type: "flashcard", prompt: "Ez nem biztonságos, nem csinálom meg.", backText: "This isn't safe, I'm not doing it.", phonetic: "Disz í-znt széjf, ájm not dú-ing it." },
      {
        id: "gb_constr2_q5",
        type: "match",
        prompt: "Párosítsd az anyagokat!",
        pairs: [
          { id: "p1", left: "Tégla", right: "Brick" },
          { id: "p2", left: "Vakolat", right: "Plaster" },
          { id: "p3", left: "Zsaluzat", right: "Formwork" },
          { id: "p4", left: "Gipszkarton", right: "Plasterboard" },
        ],
      },
    ],
  },

  // ── 2. Vendéglátás ──────────────────────────────────────────
  {
    id: "gb_hosp_1",
    title: "Vendéglátás: Rendelésfelvétel",
    description: "Felszolgálás angolul — a rendeléstől a számláig, brit udvariassággal.",
    industry: "Vendéglátás (Hospitality)",
    xpReward: 15,
    isPro: true,
    lang: "en-GB",
    questions: [
      { id: "gb_hosp_q1", type: "flashcard", prompt: "Készen állnak a rendelésre?", backText: "Are you ready to order?", phonetic: "Ár jú re-di tu ór-dör?" },
      { id: "gb_hosp_q2", type: "flashcard", prompt: "A számlát, kérem.", backText: "Could I have the bill, please?", phonetic: "Kud áj hev dö bil, plíz?" },
      {
        id: "gb_hosp_q3",
        type: "multiple_choice",
        prompt: "⚠️ Angliában „bill”-t vagy „check”-et kér a vendég?",
        options: [
          { id: "a", text: "Bill — a „check” amerikai" },
          { id: "b", text: "Check — a „bill” amerikai" },
          { id: "c", text: "Mindkettő ugyanolyan gyakori" },
        ],
        correctOptionId: "a",
      },
      { id: "gb_hosp_q4", type: "flashcard", prompt: "Van bármilyen allergiája?", backText: "Do you have any allergies?", phonetic: "Dú jú hev e-ni e-lör-dzsíz?" },
      {
        id: "gb_hosp_q5",
        type: "match",
        prompt: "Párosítsd az éttermi szavakat!",
        pairs: [
          { id: "p1", left: "Étlap", right: "Menu" },
          { id: "p2", left: "Borravaló", right: "Tip" },
          { id: "p3", left: "Szervizdíj", right: "Service charge" },
          { id: "p4", left: "Pénztárgép", right: "Till" },
        ],
      },
    ],
  },
  {
    id: "gb_hosp_2",
    title: "Vendéglátás Alapok 2.",
    description: "Panaszkezelés, műszakok és a „front of house” nyelve.",
    industry: "Vendéglátás (Hospitality)",
    xpReward: 20,
    isPro: true,
    lang: "en-GB",
    questions: [
      { id: "gb_hosp2_q1", type: "flashcard", prompt: "Elnézést kérek, azonnal megoldom.", backText: "I'm very sorry, I'll sort it out straight away.", phonetic: "Ájm ve-ri szo-ri, ájl szórt it aut sztréjt ö-véj." },
      { id: "gb_hosp2_q2", type: "flashcard", prompt: "Cserélhetem ki?", backText: "Shall I replace it for you?", phonetic: "Sel áj ri-pléjsz it for jú?" },
      {
        id: "gb_hosp2_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a „front of house”?",
        options: [
          { id: "a", text: "A vendégtérben dolgozó személyzet (felszolgálás, recepció)" },
          { id: "b", text: "Az épület homlokzata" },
          { id: "c", text: "A konyha hátsó része" },
        ],
        correctOptionId: "a",
      },
      { id: "gb_hosp2_q4", type: "flashcard", prompt: "Ma dupla műszakom van.", backText: "I'm on a double shift today.", phonetic: "Ájm on ö dab-öl sift tu-déj." },
      {
        id: "gb_hosp2_q5",
        type: "match",
        prompt: "Párosítsd a műszak-szavakat!",
        pairs: [
          { id: "p1", left: "Műszak", right: "Shift" },
          { id: "p2", left: "Túlóra", right: "Overtime" },
          { id: "p3", left: "Szünet", right: "Break" },
          { id: "p4", left: "Beosztás", right: "Rota" },
        ],
      },
    ],
  },

  // ── 3. Egészségügy / gondozás ───────────────────────────────
  {
    id: "gb_care_1",
    title: "Gondozás és Egészségügy 1.",
    description: "Idősgondozás angolul — és a DBS-ellenőrzés, ami nélkül nem lehet dolgozni.",
    industry: "Egészségügy (Care work)",
    xpReward: 15,
    isPro: true,
    lang: "en-GB",
    questions: [
      { id: "gb_care_q1", type: "flashcard", prompt: "Hogy érzi magát ma?", backText: "How are you feeling today?", phonetic: "Hau ár jú fí-ling tu-déj?" },
      { id: "gb_care_q2", type: "flashcard", prompt: "Segítek felkelni.", backText: "Let me help you up.", phonetic: "Let mi help jú ap." },
      {
        id: "gb_care_q3",
        type: "multiple_choice",
        prompt: "⚠️ Mi a DBS check?",
        options: [
          { id: "a", text: "Erkölcsi bizonyítvány-jellegű háttérellenőrzés — gondozásban és gyerekek mellett kötelező" },
          { id: "b", text: "Egészségügyi alkalmassági vizsgálat" },
          { id: "c", text: "Nyelvvizsga" },
        ],
        correctOptionId: "a",
      },
      { id: "gb_care_q4", type: "flashcard", prompt: "Fáj valahol?", backText: "Are you in any pain?", phonetic: "Ár jú in e-ni péjn?" },
      {
        id: "gb_care_q5",
        type: "match",
        prompt: "Párosítsd a gondozási szavakat!",
        pairs: [
          { id: "p1", left: "Idősek otthona", right: "Care home" },
          { id: "p2", left: "Gondozási terv", right: "Care plan" },
          { id: "p3", left: "Betegemelő", right: "Hoist" },
          { id: "p4", left: "Védőfelszerelés", right: "PPE" },
        ],
      },
    ],
  },
  {
    id: "gb_care_2",
    title: "Gondozás és Egészségügy 2.",
    description: "Dokumentálás, jelentés és a „safeguarding” — a szakma jogi gerince.",
    industry: "Egészségügy (Care work)",
    xpReward: 20,
    isPro: true,
    lang: "en-GB",
    questions: [
      { id: "gb_care2_q1", type: "flashcard", prompt: "Jelentenem kell egy esetet.", backText: "I need to report an incident.", phonetic: "Áj níd tu ri-pórt en in-szi-dönt." },
      { id: "gb_care2_q2", type: "flashcard", prompt: "Beírtam a naplóba.", backText: "I've recorded it in the notes.", phonetic: "Ájv ri-kór-did it in dö nóutsz." },
      {
        id: "gb_care2_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a „safeguarding”?",
        options: [
          { id: "a", text: "A kiszolgáltatott személyek védelme a bántalmazástól és elhanyagolástól" },
          { id: "b", text: "Az épület őrzése" },
          { id: "c", text: "Az adatok biztonsági mentése" },
        ],
        correctOptionId: "a",
      },
      { id: "gb_care2_q4", type: "flashcard", prompt: "Nem érzem magam elég képzettnek ehhez.", backText: "I don't feel trained enough for this.", phonetic: "Áj dónt fíl tréjnd i-naf for disz." },
      {
        id: "gb_care2_q5",
        type: "match",
        prompt: "Párosítsd a dokumentumokat!",
        pairs: [
          { id: "p1", left: "Gyógyszerlap", right: "MAR chart" },
          { id: "p2", left: "Esetjelentés", right: "Incident report" },
          { id: "p3", left: "Kockázatértékelés", right: "Risk assessment" },
          { id: "p4", left: "Szakképesítés", right: "NVQ" },
        ],
      },
    ],
  },

  // ── 4. Kiskereskedelem ──────────────────────────────────────
  {
    id: "gb_retail_1",
    title: "Kiskereskedelem Alapok 1.",
    description: "Vevőkiszolgálás, pénztár és a brit bolti szófordulatok.",
    industry: "Kiskereskedelem (Retail)",
    xpReward: 15,
    isPro: true,
    lang: "en-GB",
    questions: [
      { id: "gb_retail_q1", type: "flashcard", prompt: "Segíthetek?", backText: "Can I help you at all?", phonetic: "Ken áj help jú et ól?" },
      { id: "gb_retail_q2", type: "flashcard", prompt: "Kér szatyrot?", backText: "Would you like a bag?", phonetic: "Vud jú lájk ö beg?" },
      {
        id: "gb_retail_q3",
        type: "multiple_choice",
        prompt: "⚠️ Hogy hívják Angliában a pénztárgépet?",
        options: [
          { id: "a", text: "Till" },
          { id: "b", text: "Cash register (amerikaias)" },
          { id: "c", text: "Counter" },
        ],
        correctOptionId: "a",
      },
      { id: "gb_retail_q4", type: "flashcard", prompt: "Sajnos elfogyott.", backText: "I'm afraid it's out of stock.", phonetic: "Ájm öf-réjd itsz aut ov sztok." },
      {
        id: "gb_retail_q5",
        type: "match",
        prompt: "Párosítsd a bolti szavakat!",
        pairs: [
          { id: "p1", left: "Árufeltöltés", right: "Shelf stacking" },
          { id: "p2", left: "Leltár", right: "Stock take" },
          { id: "p3", left: "Nyugta", right: "Receipt" },
          { id: "p4", left: "Visszaváltás", right: "Refund" },
        ],
      },
    ],
  },

  // ── 5. Raktár ───────────────────────────────────────────────
  {
    id: "gb_wh_1",
    title: "Raktár és Logisztika Alapok 1.",
    description: "Targonca, raklap és az RTITB-engedély — a raktári munka nyelve.",
    industry: "Raktár (Warehouse)",
    xpReward: 15,
    isPro: true,
    lang: "en-GB",
    questions: [
      { id: "gb_wh_q1", type: "flashcard", prompt: "Targonca", backText: "Forklift", phonetic: "Fórk-lift" },
      { id: "gb_wh_q2", type: "flashcard", prompt: "Raklap", backText: "Pallet", phonetic: "Pe-lit" },
      {
        id: "gb_wh_q3",
        type: "multiple_choice",
        prompt: "⚠️ Mi az RTITB (vagy hasonló) targonca-engedély?",
        options: [
          { id: "a", text: "Elismert targoncavezetői képzés — enélkül nem engednek gépre" },
          { id: "b", text: "Egy szállítmányozási cég" },
          { id: "c", text: "Egy raktárkezelő szoftver" },
        ],
        correctOptionId: "a",
      },
      { id: "gb_wh_q4", type: "flashcard", prompt: "Hova tegyem ezt?", backText: "Where shall I put this?", phonetic: "Veör sel áj put disz?" },
      {
        id: "gb_wh_q5",
        type: "match",
        prompt: "Párosítsd a raktári szavakat!",
        pairs: [
          { id: "p1", left: "Komissiózás", right: "Pick and pack" },
          { id: "p2", left: "Polcrendszer", right: "Racking" },
          { id: "p3", left: "Szállítólevél", right: "Delivery note" },
          { id: "p4", left: "Vonalkód-olvasó", right: "Scanner" },
        ],
      },
    ],
  },
  {
    id: "gb_wh_2",
    title: "Raktár és Logisztika Alapok 2.",
    description: "Műszakok, teljesítmény-elvárás és a biztonsági szabályok.",
    industry: "Raktár (Warehouse)",
    xpReward: 20,
    isPro: true,
    lang: "en-GB",
    questions: [
      { id: "gb_wh2_q1", type: "flashcard", prompt: "Éjszakai műszakban vagyok.", backText: "I'm on nights this week.", phonetic: "Ájm on nájtsz disz vík." },
      { id: "gb_wh2_q2", type: "flashcard", prompt: "Ez túl nehéz egy embernek.", backText: "This is too heavy for one person.", phonetic: "Disz iz tú he-vi for van pör-szn." },
      {
        id: "gb_wh2_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a „manual handling” oktatás?",
        options: [
          { id: "a", text: "Helyes emelési és teheremelési technika" },
          { id: "b", text: "Kézi vezérlésű gépek kezelése" },
          { id: "c", text: "Kézírásos dokumentálás" },
        ],
        correctOptionId: "a",
      },
      { id: "gb_wh2_q4", type: "flashcard", prompt: "Elérem a napi célszámot.", backText: "I'm hitting my targets.", phonetic: "Ájm hi-ting máj tár-gitsz." },
      {
        id: "gb_wh2_q5",
        type: "match",
        prompt: "Párosítsd a munkaszervezési szavakat!",
        pairs: [
          { id: "p1", left: "Beosztás", right: "Rota" },
          { id: "p2", left: "Napi célszám", right: "Target" },
          { id: "p3", left: "Ügynökségi munka", right: "Agency work" },
          { id: "p4", left: "Állandó szerződés", right: "Permanent contract" },
        ],
      },
    ],
  },

  // ── 6. Takarítás ────────────────────────────────────────────
  {
    id: "gb_clean_1",
    title: "Takarítás Alapok 1.",
    description: "Eszközök, vegyszerek és a COSHH — plusz a „hoover” csapdája.",
    industry: "Takarítás (Cleaning)",
    xpReward: 15,
    isPro: true,
    lang: "en-GB",
    questions: [
      { id: "gb_clean_q1", type: "flashcard", prompt: "Felmosó", backText: "Mop", phonetic: "Mop" },
      { id: "gb_clean_q2", type: "flashcard", prompt: "Porszívó (és porszívózni)", backText: "Hoover (to hoover)", phonetic: "Hú-vör" },
      {
        id: "gb_clean_q3",
        type: "multiple_choice",
        prompt: "⚠️ Miért érdemes tudni a „hoover” szót?",
        options: [
          { id: "a", text: "Britek gyakran ezt használják porszívó és porszívózás helyett is — márkanévből lett köznév" },
          { id: "b", text: "Ez egy takarítócég neve" },
          { id: "c", text: "Ez egy vegyszertípus" },
        ],
        correctOptionId: "a",
      },
      { id: "gb_clean_q4", type: "flashcard", prompt: "Vigyázat, csúszós a padló!", backText: "Careful, the floor is wet!", phonetic: "Ke-örfl, dö flór iz vet!" },
      {
        id: "gb_clean_q5",
        type: "match",
        prompt: "Párosítsd a takarítási szavakat!",
        pairs: [
          { id: "p1", left: "Vödör", right: "Bucket" },
          { id: "p2", left: "Hipó / fehérítő", right: "Bleach" },
          { id: "p3", left: "Gumikesztyű", right: "Rubber gloves" },
          { id: "p4", left: "Vegyszer-biztonsági szabály", right: "COSHH" },
        ],
      },
    ],
  },

  // ── 7. Gyártás ──────────────────────────────────────────────
  {
    id: "gb_prod_1",
    title: "Gyártás Alapok 1.",
    description: "Gépkezelés, műszak és minőségellenőrzés a brit üzemekben.",
    industry: "Gyártás (Manufacturing)",
    xpReward: 15,
    isPro: true,
    lang: "en-GB",
    questions: [
      { id: "gb_prod_q1", type: "flashcard", prompt: "Gépkezelő", backText: "Machine operator", phonetic: "Mö-sín o-pö-réj-tör" },
      { id: "gb_prod_q2", type: "flashcard", prompt: "Leállt a gép.", backText: "The machine has stopped.", phonetic: "Dö mö-sín hez sztopt." },
      {
        id: "gb_prod_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a „QC” a gyártásban?",
        options: [
          { id: "a", text: "Quality control — minőségellenőrzés" },
          { id: "b", text: "Quick change — gyors átállás" },
          { id: "c", text: "Quantity check — mennyiségi ellenőrzés" },
        ],
        correctOptionId: "a",
      },
      { id: "gb_prod_q4", type: "flashcard", prompt: "Ez hibás termék.", backText: "This one's faulty.", phonetic: "Disz vansz fól-ti." },
      {
        id: "gb_prod_q5",
        type: "match",
        prompt: "Párosítsd az üzemi szavakat!",
        pairs: [
          { id: "p1", left: "Gyártósor", right: "Production line" },
          { id: "p2", left: "Karbantartás", right: "Maintenance" },
          { id: "p3", left: "Selejt", right: "Scrap" },
          { id: "p4", left: "Vészleállító", right: "Emergency stop" },
        ],
      },
    ],
  },

  // ── 8. Szépségipar / fodrászat ──────────────────────────────
  {
    id: "gb_hair_1",
    title: "Fodrászat Alapok 1.",
    description: "Vágás, festés és a vendéggel való egyeztetés — brit szakszavakkal.",
    industry: "Szépségipar (Hairdressing)",
    xpReward: 15,
    isPro: true,
    lang: "en-GB",
    questions: [
      { id: "gb_hair_q1", type: "flashcard", prompt: "Mennyit vágjunk le?", backText: "How much would you like off?", phonetic: "Hau macs vud jú lájk of?" },
      { id: "gb_hair_q2", type: "flashcard", prompt: "Frufru", backText: "Fringe", phonetic: "Frindzs" },
      {
        id: "gb_hair_q3",
        type: "multiple_choice",
        prompt: "⚠️ Hogy hívják Angliában a frufrut?",
        options: [
          { id: "a", text: "Fringe — a „bangs” amerikai" },
          { id: "b", text: "Bangs — a „fringe” amerikai" },
          { id: "c", text: "Front hair" },
        ],
        correctOptionId: "a",
      },
      { id: "gb_hair_q4", type: "flashcard", prompt: "Csak a végeket igazítom.", backText: "I'll just trim the ends.", phonetic: "Ájl dzsaszt trim di endz." },
      {
        id: "gb_hair_q5",
        type: "match",
        prompt: "Párosítsd a fodrász-szavakat!",
        pairs: [
          { id: "p1", left: "Melír", right: "Highlights" },
          { id: "p2", left: "Hajszárítás", right: "Blow dry" },
          { id: "p3", left: "Festés", right: "Colour" },
          { id: "p4", left: "Réteges vágás", right: "Layers" },
        ],
      },
    ],
  },

  // ── 9. Szállítás ────────────────────────────────────────────
  {
    id: "gb_driving_1",
    title: "Szállítás és Kézbesítés Alapok 1.",
    description: "HGV, tachográf és a brit autós szavak — ahol a legtöbb félreértés van.",
    industry: "Szállítás (Driving)",
    xpReward: 15,
    isPro: true,
    lang: "en-GB",
    questions: [
      { id: "gb_drive_q1", type: "flashcard", prompt: "Kamion", backText: "Lorry", phonetic: "Lo-ri" },
      { id: "gb_drive_q2", type: "flashcard", prompt: "Benzin", backText: "Petrol", phonetic: "Pet-röl" },
      {
        id: "gb_driving_q3",
        type: "multiple_choice",
        prompt: "⚠️ Mit kérsz, ha a benzinkúton „gas”-t kérsz Angliában?",
        options: [
          { id: "a", text: "Gázt — a benzin brit angolul „petrol”" },
          { id: "b", text: "Benzint, ez a bevett szó" },
          { id: "c", text: "Gázolajat" },
        ],
        correctOptionId: "a",
      },
      { id: "gb_drive_q4", type: "flashcard", prompt: "Mi a HGV-jogosítvány?", backText: "Heavy Goods Vehicle licence", phonetic: "He-vi gudz ví-ikl láj-szönsz" },
      {
        id: "gb_driving_q5",
        type: "match",
        prompt: "Párosítsd az autós szavakat (brit alak)!",
        pairs: [
          { id: "p1", left: "Csomagtartó", right: "Boot" },
          { id: "p2", left: "Motorháztető", right: "Bonnet" },
          { id: "p3", left: "Szélvédő", right: "Windscreen" },
          { id: "p4", left: "Menetíró", right: "Tachograph" },
        ],
      },
    ],
  },

  // ── 10. Gyermekgondozás ─────────────────────────────────────
  {
    id: "gb_child_1",
    title: "Gyermekgondozás Alapok 1.",
    description: "Óvodai szókincs, pelenka és a DBS — plusz a brit-amerikai csapdák.",
    industry: "Gyermekgondozás (Childcare)",
    xpReward: 15,
    isPro: true,
    lang: "en-GB",
    questions: [
      { id: "gb_child_q1", type: "flashcard", prompt: "Pelenka", backText: "Nappy", phonetic: "Ne-pi" },
      { id: "gb_child_q2", type: "flashcard", prompt: "Óvoda / bölcsőde", backText: "Nursery", phonetic: "Nör-szö-ri" },
      {
        id: "gb_child_q3",
        type: "multiple_choice",
        prompt: "⚠️ Hogy hívják Angliában a pelenkát?",
        options: [
          { id: "a", text: "Nappy — a „diaper” amerikai" },
          { id: "b", text: "Diaper — a „nappy” amerikai" },
          { id: "c", text: "Pad" },
        ],
        correctOptionId: "a",
      },
      { id: "gb_child_q4", type: "flashcard", prompt: "Ideje pihenni.", backText: "It's time for a nap.", phonetic: "Itsz tájm for ö nep." },
      {
        id: "gb_child_q5",
        type: "match",
        prompt: "Párosítsd a gyermekgondozási szavakat!",
        pairs: [
          { id: "p1", left: "Kijelölt gondozó", right: "Key worker" },
          { id: "p2", left: "Játszótér", right: "Playground" },
          { id: "p3", left: "Uzsonna", right: "Snack" },
          { id: "p4", left: "Háttérellenőrzés", right: "DBS check" },
        ],
      },
    ],
  },

  // ── 11. Mezőgazdaság ────────────────────────────────────────
  {
    id: "gb_farm_1",
    title: "Mezőgazdaság Alapok 1.",
    description: "Szüret, üvegház és a szezonális munka nyelve.",
    industry: "Mezőgazdaság (Agriculture)",
    xpReward: 15,
    isPro: true,
    lang: "en-GB",
    questions: [
      { id: "gb_farm_q1", type: "flashcard", prompt: "Szüret / betakarítás", backText: "Harvest", phonetic: "Hár-viszt" },
      { id: "gb_farm_q2", type: "flashcard", prompt: "Üvegház", backText: "Greenhouse", phonetic: "Grín-hausz" },
      {
        id: "gb_farm_q3",
        type: "multiple_choice",
        prompt: "Mi a „seasonal worker” szerep?",
        options: [
          { id: "a", text: "Idénymunkás — a betakarítási szezonra szerződik" },
          { id: "b", text: "Állandó gazdaságvezető" },
          { id: "c", text: "Állatorvos" },
        ],
        correctOptionId: "a",
      },
      { id: "gb_farm_q4", type: "flashcard", prompt: "Hány ládát kell megtöltenem?", backText: "How many crates do I need to fill?", phonetic: "Hau me-ni krétsz dú áj níd tu fil?" },
      {
        id: "gb_farm_q5",
        type: "match",
        prompt: "Párosítsd a mezőgazdasági szavakat!",
        pairs: [
          { id: "p1", left: "Termés", right: "Crop" },
          { id: "p2", left: "Traktor", right: "Tractor" },
          { id: "p3", left: "Csomagoló üzem", right: "Pack house" },
          { id: "p4", left: "Teljesítménybér", right: "Piece rate" },
        ],
      },
    ],
  },

  // ── 12. Gépjárműipar ────────────────────────────────────────
  {
    id: "gb_auto_1",
    title: "Autószerelő Alapok 1.",
    description: "Alkatrészek, MOT és a brit autós szótár.",
    industry: "Gépjárműipar (Vehicle mechanic)",
    xpReward: 15,
    isPro: true,
    lang: "en-GB",
    questions: [
      { id: "gb_auto_q1", type: "flashcard", prompt: "Gumi / abroncs", backText: "Tyre", phonetic: "Tá-jör" },
      { id: "gb_auto_q2", type: "flashcard", prompt: "Csavarkulcs", backText: "Spanner", phonetic: "Szpe-nör" },
      {
        id: "gb_auto_q3",
        type: "multiple_choice",
        prompt: "⚠️ Mi az MOT?",
        options: [
          { id: "a", text: "A kötelező éves műszaki vizsga (3 évnél idősebb autónál)" },
          { id: "b", text: "Egy biztosítási típus" },
          { id: "c", text: "Egy autómárka" },
        ],
        correctOptionId: "a",
      },
      { id: "gb_auto_q4", type: "flashcard", prompt: "Furcsa hangot ad ki.", backText: "It's making a strange noise.", phonetic: "Itsz méj-king ö sztréjndzs nojz." },
      {
        id: "gb_auto_q5",
        type: "match",
        prompt: "Párosítsd az alkatrészeket (brit alak)!",
        pairs: [
          { id: "p1", left: "Fékbetét", right: "Brake pad" },
          { id: "p2", left: "Kipufogó", right: "Exhaust" },
          { id: "p3", left: "Akkumulátor", right: "Battery" },
          { id: "p4", left: "Sárvédő", right: "Wing" },
        ],
      },
    ],
  },

  // ── 13. Biztonsági szolgálat ────────────────────────────────
  {
    id: "gb_security_1",
    title: "Biztonsági Szolgálat Alapok 1.",
    description: "Az SIA-engedély és a szolgálati nyelv — enélkül nem lehet dolgozni.",
    industry: "Biztonsági szolgálat (Security)",
    xpReward: 15,
    isPro: true,
    lang: "en-GB",
    questions: [
      { id: "gb_sec_q1", type: "flashcard", prompt: "Járőrözés", backText: "Patrol", phonetic: "Pö-tról" },
      { id: "gb_sec_q2", type: "flashcard", prompt: "Ez a terület zárva van.", backText: "This area is closed off.", phonetic: "Disz eö-riö iz klóuzd of." },
      {
        id: "gb_security_q3",
        type: "multiple_choice",
        prompt: "⚠️ Mi az SIA licence?",
        options: [
          { id: "a", text: "Kötelező állami engedély biztonsági munkához — enélkül a munka jogszerűtlen" },
          { id: "b", text: "Egy magánbiztosítás" },
          { id: "c", text: "Egy szakszervezeti tagság" },
        ],
        correctOptionId: "a",
      },
      { id: "gb_sec_q4", type: "flashcard", prompt: "Jelentést kell írnom.", backText: "I need to write an incident report.", phonetic: "Áj níd tu rájt en in-szi-dönt ri-pórt." },
      {
        id: "gb_security_q5",
        type: "match",
        prompt: "Párosítsd a biztonsági szavakat!",
        pairs: [
          { id: "p1", left: "Kamerarendszer", right: "CCTV" },
          { id: "p2", left: "Beléptetés", right: "Access control" },
          { id: "p3", left: "Szolgálati napló", right: "Logbook" },
          { id: "p4", left: "Menekülési útvonal", right: "Fire exit" },
        ],
      },
    ],
  },

  // ── 14. Szállodaipar ────────────────────────────────────────
  {
    id: "gb_hotel_1",
    title: "Szállodaipar Alapok 1.",
    description: "Recepció, szobaasszony és a vendégkérések angolul.",
    industry: "Szállodaipar (Hotel)",
    xpReward: 15,
    isPro: true,
    lang: "en-GB",
    questions: [
      { id: "gb_hotel_q1", type: "flashcard", prompt: "Foglalása van?", backText: "Do you have a booking?", phonetic: "Dú jú hev ö bu-king?" },
      { id: "gb_hotel_q2", type: "flashcard", prompt: "Szobatakarítás", backText: "Housekeeping", phonetic: "Hausz-kí-ping" },
      {
        id: "gb_hotel_q3",
        type: "multiple_choice",
        prompt: "⚠️ Angliában „booking”-ot vagy „reservation”-t mondanak jellemzően?",
        options: [
          { id: "a", text: "Booking — a „reservation” inkább amerikai és formálisabb" },
          { id: "b", text: "Kizárólag reservation" },
          { id: "c", text: "Egyik sem, „order”-t mondanak" },
        ],
        correctOptionId: "a",
      },
      { id: "gb_hotel_q4", type: "flashcard", prompt: "Mikor szeretne kijelentkezni?", backText: "What time would you like to check out?", phonetic: "Vot tájm vud jú lájk tu csek aut?" },
      {
        id: "gb_hotel_q5",
        type: "match",
        prompt: "Párosítsd a szállodai szavakat!",
        pairs: [
          { id: "p1", left: "Recepció", right: "Reception" },
          { id: "p2", left: "Kulcskártya", right: "Key card" },
          { id: "p3", left: "Ágynemű", right: "Bed linen" },
          { id: "p4", left: "Pótágy", right: "Extra bed" },
        ],
      },
    ],
  },

  // ── 15. Konyhai személyzet ──────────────────────────────────
  {
    id: "gb_kitchen_1",
    title: "Konyhai Személyzet Alapok 1.",
    description: "Konyhai hierarchia, allergének és a szakácsnyelv.",
    industry: "Konyhai személyzet (Kitchen)",
    xpReward: 15,
    isPro: true,
    lang: "en-GB",
    questions: [
      { id: "gb_kit_q1", type: "flashcard", prompt: "Konyhai kisegítő", backText: "Kitchen porter (KP)", phonetic: "Ki-csön pór-tör" },
      { id: "gb_kit_q2", type: "flashcard", prompt: "Kész, elvihető!", backText: "Service!", phonetic: "Ször-visz!" },
      {
        id: "gb_kitchen_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a „mise en place”?",
        options: [
          { id: "a", text: "Az előkészített alapanyagok szolgálat előtti rendben tartása" },
          { id: "b", text: "Egy francia étel" },
          { id: "c", text: "A számla kiállítása" },
        ],
        correctOptionId: "a",
      },
      { id: "gb_kit_q4", type: "flashcard", prompt: "Ez glutént tartalmaz.", backText: "This contains gluten.", phonetic: "Disz kön-téjnz glú-tön." },
      {
        id: "gb_kitchen_q5",
        type: "match",
        prompt: "Párosítsd a konyhai szavakat!",
        pairs: [
          { id: "p1", left: "Sütő", right: "Oven" },
          { id: "p2", left: "Hűtőkamra", right: "Walk-in fridge" },
          { id: "p3", left: "Vágódeszka", right: "Chopping board" },
          { id: "p4", left: "Élelmiszer-higiéniai tanúsítvány", right: "Food hygiene certificate" },
        ],
      },
    ],
  },

  // ── 16. Élelmiszeripar / pékség ─────────────────────────────
  {
    id: "gb_bakery_1",
    title: "Pékség Alapok 1.",
    description: "Tészta, kelesztés és a pékműhely szavai.",
    industry: "Élelmiszeripar (Bakery)",
    xpReward: 15,
    isPro: true,
    lang: "en-GB",
    questions: [
      { id: "gb_bak_q1", type: "flashcard", prompt: "Tészta (kelt)", backText: "Dough", phonetic: "Dó" },
      { id: "gb_bak_q2", type: "flashcard", prompt: "Kelesztés", backText: "Proving", phonetic: "Prú-ving" },
      {
        id: "gb_bakery_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a „batch” a pékségben?",
        options: [
          { id: "a", text: "Egy sütési adag / tétel" },
          { id: "b", text: "Egy tésztatípus" },
          { id: "c", text: "A sütő hőmérséklete" },
        ],
        correctOptionId: "a",
      },
      { id: "gb_bak_q4", type: "flashcard", prompt: "Mikor jön ki a következő adag?", backText: "When is the next batch out?", phonetic: "Ven iz dö nekszt becs aut?" },
      {
        id: "gb_bakery_q5",
        type: "match",
        prompt: "Párosítsd a pékség szavait!",
        pairs: [
          { id: "p1", left: "Élesztő", right: "Yeast" },
          { id: "p2", left: "Liszt", right: "Flour" },
          { id: "p3", left: "Sütő", right: "Oven" },
          { id: "p4", left: "Hűtőrács", right: "Cooling rack" },
        ],
      },
    ],
  },

  // ── 17. Villanyszerelés ─────────────────────────────────────
  {
    id: "gb_elec_1",
    title: "Villanyszerelő Alapok 1.",
    description: "⚠️ A brit villanyszerelés más szavakat használ: earth, socket, consumer unit.",
    industry: "Villanyszerelés (Electrician)",
    xpReward: 15,
    isPro: true,
    lang: "en-GB",
    questions: [
      { id: "gb_elec_q1", type: "flashcard", prompt: "Konnektor / aljzat", backText: "Socket", phonetic: "Szo-kit" },
      { id: "gb_elec_q2", type: "flashcard", prompt: "Földelés", backText: "Earth", phonetic: "Örsz" },
      {
        id: "gb_elec_q3",
        type: "multiple_choice",
        prompt: "⚠️ Hogy hívják a földelést brit angolul?",
        options: [
          { id: "a", text: "Earth — a „ground” amerikai" },
          { id: "b", text: "Ground — az „earth” amerikai" },
          { id: "c", text: "Neutral" },
        ],
        correctOptionId: "a",
      },
      { id: "gb_elec_q4", type: "flashcard", prompt: "Lekapcsoltam a főkapcsolót.", backText: "I've turned the power off at the mains.", phonetic: "Ájv törnd dö pau-ör of et dö méjnz." },
      {
        id: "gb_elec_q5",
        type: "match",
        prompt: "Párosítsd a villanyszerelési szavakat!",
        pairs: [
          { id: "p1", left: "Kismegszakító-tábla", right: "Consumer unit" },
          { id: "p2", left: "Életvédelmi relé", right: "RCD" },
          { id: "p3", left: "Kábel", right: "Cable" },
          { id: "p4", left: "Villanyszerelési szabvány", right: "18th Edition" },
        ],
      },
    ],
  },

  // ── 18. Kozmetika ───────────────────────────────────────────
  {
    id: "gb_beauty_1",
    title: "Kozmetika Alapok 1.",
    description: "Kezelések, konzultáció és a szalon nyelve.",
    industry: "Kozmetika (Beauty therapy)",
    xpReward: 15,
    isPro: true,
    lang: "en-GB",
    questions: [
      { id: "gb_beauty_q1", type: "flashcard", prompt: "Gyantázás", backText: "Waxing", phonetic: "Vek-szing" },
      { id: "gb_beauty_q2", type: "flashcard", prompt: "Arckezelés", backText: "Facial", phonetic: "Féj-sl" },
      {
        id: "gb_beauty_q3",
        type: "multiple_choice",
        prompt: "Mi a „patch test”, és miért fontos?",
        options: [
          { id: "a", text: "Allergia-próba a kezelés előtt — jogi és biztonsági okból is elvárt" },
          { id: "b", text: "A szoba hőmérsékletének ellenőrzése" },
          { id: "c", text: "A számla ellenőrzése" },
        ],
        correctOptionId: "a",
      },
      { id: "gb_beauty_q4", type: "flashcard", prompt: "Érzékeny a bőre?", backText: "Do you have sensitive skin?", phonetic: "Dú jú hev szen-szi-tiv szkin?" },
      {
        id: "gb_beauty_q5",
        type: "match",
        prompt: "Párosítsd a kozmetikai szavakat!",
        pairs: [
          { id: "p1", left: "Kézápolás", right: "Manicure" },
          { id: "p2", left: "Lábápolás", right: "Pedicure" },
          { id: "p3", left: "Kezelőszoba", right: "Treatment room" },
          { id: "p4", left: "Előfoglalás", right: "Appointment" },
        ],
      },
    ],
  },

  // ── 19. Vízvezeték-szerelés ─────────────────────────────────
  {
    id: "gb_plumb_1",
    title: "Vízvezeték-szerelő Alapok 1.",
    description: "⚠️ Csap „tap”, nem „faucet” — és a Gas Safe nyilvántartás.",
    industry: "Vízvezeték-szerelés (Plumbing)",
    xpReward: 15,
    isPro: true,
    lang: "en-GB",
    questions: [
      { id: "gb_plumb_q1", type: "flashcard", prompt: "Csap", backText: "Tap", phonetic: "Tep" },
      { id: "gb_plumb_q2", type: "flashcard", prompt: "Kazán", backText: "Boiler", phonetic: "Boj-lör" },
      {
        id: "gb_plumb_q3",
        type: "multiple_choice",
        prompt: "⚠️ Mi a Gas Safe Register?",
        options: [
          { id: "a", text: "Kötelező nyilvántartás gázszereléshez — enélkül gázmunkát végezni jogszerűtlen" },
          { id: "b", text: "Egy gázszolgáltató" },
          { id: "c", text: "Egy biztosítási termék" },
        ],
        correctOptionId: "a",
      },
      { id: "gb_plumb_q4", type: "flashcard", prompt: "Elzárom a főcsapot.", backText: "I'll turn the water off at the stopcock.", phonetic: "Ájl törn dö vó-tör of et dö sztop-kok." },
      {
        id: "gb_plumb_q5",
        type: "match",
        prompt: "Párosítsd a szerelési szavakat!",
        pairs: [
          { id: "p1", left: "Radiátor", right: "Radiator" },
          { id: "p2", left: "Lefolyó", right: "Drain" },
          { id: "p3", left: "Szivárgás", right: "Leak" },
          { id: "p4", left: "Főelzáró", right: "Stopcock" },
        ],
      },
    ],
  },

  // ── Mesterkurzus ────────────────────────────────────────────
  {
    id: "gb_pro_1",
    title: "Mesterkurzus: Fizetésemelés és Konfliktus",
    description: "⚠️ A brit munkahelyi nyelv indirekt — a „nem” is udvarias mondat. Itt megtanulod dekódolni.",
    industry: "Munkahelyi kommunikáció (Workplace)",
    xpReward: 25,
    isPro: true,
    lang: "en-GB",
    questions: [
      { id: "gb_pro_q1", type: "flashcard", prompt: "Szeretnék beszélni a fizetésemről.", backText: "I'd like to discuss my pay, please.", phonetic: "Ájd lájk tu disz-kasz máj péj, plíz." },
      {
        id: "gb_pro_q2",
        type: "multiple_choice",
        prompt: "⚠️ A vezetőd azt mondja: „I'll bear it in mind.” Mit jelent ez valójában?",
        options: [
          { id: "a", text: "Udvarias elutasítás — jellemzően nem lesz belőle semmi" },
          { id: "b", text: "Biztos ígéret, hogy megkapod" },
          { id: "c", text: "Azt kéri, írd le e-mailben" },
        ],
        correctOptionId: "a",
      },
      { id: "gb_pro_q3", type: "flashcard", prompt: "Ez nem szerepelt a szerződésemben.", backText: "That wasn't in my contract.", phonetic: "Det vo-znt in máj kont-rekt." },
      {
        id: "gb_pro_q4",
        type: "multiple_choice",
        prompt: "⚠️ Hova fordulhatsz INGYEN munkaügyi vitával Angliában?",
        options: [
          { id: "a", text: "ACAS — ingyenes, pártatlan munkaügyi tanácsadás és egyeztetés" },
          { id: "b", text: "Csak fizetős ügyvédhez" },
          { id: "c", text: "A rendőrséghez" },
        ],
        correctOptionId: "a",
      },
      { id: "gb_pro_q5", type: "flashcard", prompt: "Írásban is megerősítenéd, kérlek?", backText: "Could you put that in writing, please?", phonetic: "Kud jú put det in ráj-ting, plíz?" },
    ],
  },
];
