import type { Lesson } from "./data";

/**
 * Szakmai Szótár — SPANYOL leckebank.
 *
 * ⚠️ HÁROM DOLOG, AMI EZT A BANKOT A NÉMET/HOLLAND MINTÁTÓL ELTÉRÍTI:
 *
 * 1) SPANYOLORSZÁGI, NEM LATIN-AMERIKAI SPANYOL. A magyar felhasználók
 *    jellemzően appból tanulnak, ami latin-amerikai szókincset ad — a
 *    munkahelyen viszont a spanyolországi szó a használatos, és a különbség
 *    néha teljes: „coche” (nem carro), „ordenador” (nem computadora), „móvil”
 *    (nem celular), „camarero” (nem mesero), „zumo” (nem jugo), „patata” (nem
 *    papa). Ahol ez félreértést okoz, a lecke kimondja.
 *
 * 2) A SZAKMÁKHOZ KÖTELEZŐ TANFOLYAM/KÁRTYA TARTOZIK, és a hirdetés kérdés
 *    nélkül felteszi. Aki nem tudja, mi a PRL 60 óra, a TPC, a carnet de
 *    carretillero, a TIP vagy a manipulador de alimentos, az nem nyelvi
 *    hátrányban van, hanem ki sem tud menni interjúra.
 *
 * 3) A MEGSZÓLÍTÁS REGISZTERE MUNKAHELYI KÉRDÉS. A „tú” és az „usted” közti
 *    választás Spanyolországban szakmánként eltér (vendéglátásban gyorsan
 *    tegeződnek, gondozásban és hivatalban nem) — a mesterkurzus erre külön
 *    kitér, mert a rossz regiszter itt sértés.
 *
 * A fonetika magyar olvasat szerinti KÖZELÍTÉS. A spanyol kiejtés magyar
 * szemmel könnyű, de van hat csapdája: j = h, ll = j, ñ = ny, h = néma,
 * v ≈ b, és a gue/gui-ban az u néma. ⚠️ A z és a ce/ci Spanyolországban
 * angolos „th”-hang (nem sz, mint Latin-Amerikában) — a fonetikában „sz”-szel
 * közelítjük, de a mesterkurzus kimondja a különbséget.
 * TTS-nyelv: es-ES (⚠️ NEM es-419 / es-MX).
 */
export const INDUSTRY_LESSONS_ES: Lesson[] = [
  // ── 1. Építőipar ────────────────────────────────────────────
  {
    id: "es_obra_1",
    title: "Építőipari Alapok 1.",
    description: "Szerszámok, munkavédelem és a PRL-tanfolyam — amit az első nap tudni kell.",
    industry: "Építőipar (Construcción)",
    xpReward: 15,
    isPro: false,
    lang: "es-ES",
    questions: [
      { id: "es_obra_q1", type: "flashcard", prompt: "Építkezés (a helyszín)", backText: "La obra", phonetic: "Lá ob-rá" },
      { id: "es_obra_q2", type: "flashcard", prompt: "Vízmérték", backText: "El nivel", phonetic: "El ni-vel" },
      {
        id: "es_obra_q3",
        type: "multiple_choice",
        prompt: "⚠️ Mi a „curso de PRL de 60 horas”, és miért kell?",
        options: [
          { id: "a", text: "Kötelező 60 órás munkavédelmi tanfolyam — a TPC-kártyához, ami nélkül építkezésre nem engednek" },
          { id: "b", text: "Egy nyelvtanfolyam" },
          { id: "c", text: "Egy önkéntes továbbképzés" },
        ],
        correctOptionId: "a",
      },
      { id: "es_obra_q4", type: "flashcard", prompt: "Védőkabát / láthatósági mellény", backText: "El chaleco reflectante", phonetic: "El csá-le-ko re-flek-tán-te" },
      {
        id: "es_obra_q5",
        type: "match",
        prompt: "Párosítsd a szerszámokat!",
        pairs: [
          { id: "p1", left: "Kalapács", right: "El martillo" },
          { id: "p2", left: "Mérőszalag", right: "La cinta métrica" },
          { id: "p3", left: "Állvány", right: "El andamio" },
          { id: "p4", left: "Védősisak", right: "El casco" },
        ],
      },
    ],
  },
  {
    id: "es_obra_2",
    title: "Építőipari Alapok 2.",
    description: "Anyagok, utasítások és a művezetővel való beszéd.",
    industry: "Építőipar (Construcción)",
    xpReward: 20,
    isPro: true,
    lang: "es-ES",
    questions: [
      { id: "es_obra2_q1", type: "flashcard", prompt: "Kérek egy zsák cementet.", backText: "Necesito un saco de cemento.", phonetic: "Ne-cse-szí-to un szá-ko de cse-men-to." },
      { id: "es_obra2_q2", type: "flashcard", prompt: "Hol van a művezető?", backText: "¿Dónde está el encargado?", phonetic: "Don-de esz-tá el en-kár-gá-do?" },
      {
        id: "es_obra2_q3",
        type: "multiple_choice",
        prompt: "Ki az „encargado” az építkezésen?",
        options: [
          { id: "a", text: "A művezető / brigádvezető" },
          { id: "b", text: "A takarító" },
          { id: "c", text: "A beszállító" },
        ],
        correctOptionId: "a",
      },
      { id: "es_obra2_q4", type: "flashcard", prompt: "Ez nem biztonságos, így nem csinálom.", backText: "Esto no es seguro, así no lo hago.", phonetic: "Esz-to no esz sze-gú-ro, á-szí no lo á-go." },
      {
        id: "es_obra2_q5",
        type: "match",
        prompt: "Párosítsd az anyagokat!",
        pairs: [
          { id: "p1", left: "Tégla", right: "El ladrillo" },
          { id: "p2", left: "Vakolat", right: "El yeso" },
          { id: "p3", left: "Beton", right: "El hormigón" },
          { id: "p4", left: "Habarcs", right: "El mortero" },
        ],
      },
    ],
  },

  // ── 2. Vendéglátás ──────────────────────────────────────────
  {
    id: "es_host_1",
    title: "Vendéglátás: Rendelésfelvétel",
    description: "Felszolgálás spanyolul — és a „menú del día”, ami a legtöbb bevétel.",
    industry: "Vendéglátás (Hostelería)",
    xpReward: 15,
    isPro: true,
    lang: "es-ES",
    questions: [
      { id: "es_host_q1", type: "flashcard", prompt: "Mit szeretne inni?", backText: "¿Qué quiere beber?", phonetic: "Ké kje-re be-ber?" },
      { id: "es_host_q2", type: "flashcard", prompt: "A számlát, kérem.", backText: "La cuenta, por favor.", phonetic: "Lá kuen-tá, por fá-vor." },
      {
        id: "es_host_q3",
        type: "multiple_choice",
        prompt: "⚠️ Hogy hívják Spanyolországban a felszolgálót?",
        options: [
          { id: "a", text: "Camarero — a „mesero” latin-amerikai" },
          { id: "b", text: "Mesero — a „camarero” latin-amerikai" },
          { id: "c", text: "Sirviente" },
        ],
        correctOptionId: "a",
      },
      { id: "es_host_q4", type: "flashcard", prompt: "Van bármilyen allergiája?", backText: "¿Tiene alguna alergia?", phonetic: "Tje-ne ál-gú-ná á-ler-hjá?" },
      {
        id: "es_host_q5",
        type: "match",
        prompt: "Párosítsd az éttermi szavakat!",
        pairs: [
          { id: "p1", left: "Étlap", right: "La carta" },
          { id: "p2", left: "Napi menü", right: "El menú del día" },
          { id: "p3", left: "Borravaló", right: "La propina" },
          { id: "p4", left: "Terasz", right: "La terraza" },
        ],
      },
    ],
  },
  {
    id: "es_host_2",
    title: "Vendéglátás Alapok 2.",
    description: "Panaszkezelés, műszakok és a bár nyelve.",
    industry: "Vendéglátás (Hostelería)",
    xpReward: 20,
    isPro: true,
    lang: "es-ES",
    questions: [
      { id: "es_host2_q1", type: "flashcard", prompt: "Elnézést, azonnal megoldom.", backText: "Disculpe, lo soluciono ahora mismo.", phonetic: "Disz-kúl-pe, lo szo-lu-cszjó-no á-o-rá miz-mo." },
      { id: "es_host2_q2", type: "flashcard", prompt: "Kicseréljem?", backText: "¿Se lo cambio?", phonetic: "Sze lo kám-bjo?" },
      {
        id: "es_host2_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a „¿Qué le pongo?” a bárban?",
        options: [
          { id: "a", text: "„Mit adhatok?” — a leggyakoribb bárpulti kérdés" },
          { id: "b", text: "„Hol szeretne ülni?”" },
          { id: "c", text: "„Fizetni szeretne?”" },
        ],
        correctOptionId: "a",
      },
      { id: "es_host2_q4", type: "flashcard", prompt: "Ma dupla műszakom van.", backText: "Hoy hago doble turno.", phonetic: "Oj á-go dob-le túr-no." },
      {
        id: "es_host2_q5",
        type: "match",
        prompt: "Párosítsd a műszak-szavakat!",
        pairs: [
          { id: "p1", left: "Műszak", right: "El turno" },
          { id: "p2", left: "Túlóra", right: "Las horas extras" },
          { id: "p3", left: "Szünet", right: "El descanso" },
          { id: "p4", left: "Beosztás", right: "El horario" },
        ],
      },
    ],
  },

  // ── 3. Egészségügy / gondozás ───────────────────────────────
  {
    id: "es_care_1",
    title: "Gondozás és Egészségügy 1.",
    description: "Idősgondozás spanyolul — az auxiliar munkakör nyelve.",
    industry: "Egészségügy (Sanidad y cuidados)",
    xpReward: 15,
    isPro: true,
    lang: "es-ES",
    questions: [
      { id: "es_care_q1", type: "flashcard", prompt: "Hogy érzi magát ma?", backText: "¿Cómo se encuentra hoy?", phonetic: "Kó-mo sze en-kuen-trá oj?" },
      { id: "es_care_q2", type: "flashcard", prompt: "Segítek felkelni.", backText: "Le ayudo a levantarse.", phonetic: "Le á-jú-do á le-ván-tár-sze." },
      {
        id: "es_care_q3",
        type: "multiple_choice",
        prompt: "Mi az „auxiliar de enfermería”?",
        options: [
          { id: "a", text: "Ápolási asszisztens — a gondozás leggyakoribb munkaköre" },
          { id: "b", text: "Szakorvos" },
          { id: "c", text: "Gyógyszerész" },
        ],
        correctOptionId: "a",
      },
      { id: "es_care_q4", type: "flashcard", prompt: "Fáj valahol?", backText: "¿Le duele algo?", phonetic: "Le due-le ál-go?" },
      {
        id: "es_care_q5",
        type: "match",
        prompt: "Párosítsd a gondozási szavakat!",
        pairs: [
          { id: "p1", left: "Idősek otthona", right: "La residencia" },
          { id: "p2", left: "Betegemelő", right: "La grúa" },
          { id: "p3", left: "Védőfelszerelés", right: "El EPI" },
          { id: "p4", left: "Vérnyomás", right: "La tensión" },
        ],
      },
    ],
  },
  {
    id: "es_care_2",
    title: "Gondozás és Egészségügy 2.",
    description: "Dokumentálás, gyógyszerezés és a műszakátadás.",
    industry: "Egészségügy (Sanidad y cuidados)",
    xpReward: 20,
    isPro: true,
    lang: "es-ES",
    questions: [
      { id: "es_care2_q1", type: "flashcard", prompt: "Beírtam a naplóba.", backText: "Lo he anotado en el registro.", phonetic: "Lo e á-no-tá-do en el re-hisz-tro." },
      { id: "es_care2_q2", type: "flashcard", prompt: "Beadtam a gyógyszert.", backText: "Le he dado la medicación.", phonetic: "Le e dá-do lá me-di-ká-cszjón." },
      {
        id: "es_care2_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a „cambio de turno”?",
        options: [
          { id: "a", text: "Műszakátadás — itt adják át a betegek állapotát" },
          { id: "b", text: "Ágycsere" },
          { id: "c", text: "Fizetésemelés" },
        ],
        correctOptionId: "a",
      },
      { id: "es_care2_q4", type: "flashcard", prompt: "Nem érzem magam elég képzettnek ehhez.", backText: "No me siento suficientemente formado para esto.", phonetic: "No me szjen-to szu-fi-cszjen-te-men-te for-má-do pá-rá esz-to." },
      {
        id: "es_care2_q5",
        type: "match",
        prompt: "Párosítsd a dokumentumokat!",
        pairs: [
          { id: "p1", left: "Kórtörténet", right: "La historia clínica" },
          { id: "p2", left: "Gondozási terv", right: "El plan de cuidados" },
          { id: "p3", left: "Esetjelentés", right: "El parte de incidencias" },
          { id: "p4", left: "Szakképesítés", right: "El título de FP" },
        ],
      },
    ],
  },

  // ── 4. Kiskereskedelem ──────────────────────────────────────
  {
    id: "es_retail_1",
    title: "Kiskereskedelem Alapok 1.",
    description: "Vevőkiszolgálás, pénztár és a spanyol bolti szófordulatok.",
    industry: "Kiskereskedelem (Comercio)",
    xpReward: 15,
    isPro: true,
    lang: "es-ES",
    questions: [
      { id: "es_retail_q1", type: "flashcard", prompt: "Segíthetek?", backText: "¿Le puedo ayudar?", phonetic: "Le pue-do á-jú-dár?" },
      { id: "es_retail_q2", type: "flashcard", prompt: "Kér szatyrot?", backText: "¿Necesita bolsa?", phonetic: "Ne-cse-szí-tá bol-szá?" },
      {
        id: "es_retail_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a „reponer” a boltban?",
        options: [
          { id: "a", text: "Árufeltöltés, polcpakolás" },
          { id: "b", text: "Visszaváltás" },
          { id: "c", text: "Leltározás" },
        ],
        correctOptionId: "a",
      },
      { id: "es_retail_q4", type: "flashcard", prompt: "Sajnos elfogyott.", backText: "Lo siento, está agotado.", phonetic: "Lo szjen-to, esz-tá á-go-tá-do." },
      {
        id: "es_retail_q5",
        type: "match",
        prompt: "Párosítsd a bolti szavakat!",
        pairs: [
          { id: "p1", left: "Pénztár", right: "La caja" },
          { id: "p2", left: "Nyugta", right: "El ticket" },
          { id: "p3", left: "Akció / leárazás", right: "Las rebajas" },
          { id: "p4", left: "Leltár", right: "El inventario" },
        ],
      },
    ],
  },

  // ── 5. Raktár ───────────────────────────────────────────────
  {
    id: "es_wh_1",
    title: "Raktár és Logisztika Alapok 1.",
    description: "Targonca, raklap és a carnet de carretillero.",
    industry: "Raktár (Almacén)",
    xpReward: 15,
    isPro: true,
    lang: "es-ES",
    questions: [
      { id: "es_wh_q1", type: "flashcard", prompt: "Targonca", backText: "La carretilla elevadora", phonetic: "Lá ká-rre-tí-já e-le-vá-dó-rá" },
      { id: "es_wh_q2", type: "flashcard", prompt: "Raklap", backText: "El palé", phonetic: "El pá-lé" },
      {
        id: "es_wh_q3",
        type: "multiple_choice",
        prompt: "⚠️ Mi a „carnet de carretillero”?",
        options: [
          { id: "a", text: "Targoncavezetői képzés igazolása — enélkül nem engednek gépre" },
          { id: "b", text: "Egy raktári szoftver" },
          { id: "c", text: "Egy szállítmányozási okmány" },
        ],
        correctOptionId: "a",
      },
      { id: "es_wh_q4", type: "flashcard", prompt: "Hova tegyem ezt?", backText: "¿Dónde pongo esto?", phonetic: "Don-de pon-go esz-to?" },
      {
        id: "es_wh_q5",
        type: "match",
        prompt: "Párosítsd a raktári szavakat!",
        pairs: [
          { id: "p1", left: "Raktáros", right: "El mozo de almacén" },
          { id: "p2", left: "Polcrendszer", right: "La estantería" },
          { id: "p3", left: "Szállítólevél", right: "El albarán" },
          { id: "p4", left: "Vonalkód-olvasó", right: "El escáner" },
        ],
      },
    ],
  },
  {
    id: "es_wh_2",
    title: "Raktár és Logisztika Alapok 2.",
    description: "Műszakok, teljesítmény és a biztonsági szabályok.",
    industry: "Raktár (Almacén)",
    xpReward: 20,
    isPro: true,
    lang: "es-ES",
    questions: [
      { id: "es_wh2_q1", type: "flashcard", prompt: "Éjszakai műszakban vagyok.", backText: "Estoy en el turno de noche.", phonetic: "Esz-toj en el túr-no de no-cse." },
      { id: "es_wh2_q2", type: "flashcard", prompt: "Ez túl nehéz egy embernek.", backText: "Esto es demasiado pesado para una persona.", phonetic: "Esz-to esz de-má-szjá-do pe-szá-do pá-rá ú-ná per-szó-ná." },
      {
        id: "es_wh2_q3",
        type: "multiple_choice",
        prompt: "Mit jelent az „ETT” a spanyol álláshirdetésben?",
        options: [
          { id: "a", text: "Munkaerő-közvetítő ügynökség (empresa de trabajo temporal)" },
          { id: "b", text: "Egy szakszervezet" },
          { id: "c", text: "Egy adónem" },
        ],
        correctOptionId: "a",
      },
      { id: "es_wh2_q4", type: "flashcard", prompt: "Elérem a napi célszámot.", backText: "Llego al objetivo diario.", phonetic: "Je-go ál ob-he-tí-vo di-á-rjo." },
      {
        id: "es_wh2_q5",
        type: "match",
        prompt: "Párosítsd a munkaszervezési szavakat!",
        pairs: [
          { id: "p1", left: "Határozatlan szerződés", right: "Contrato indefinido" },
          { id: "p2", left: "Határozott szerződés", right: "Contrato temporal" },
          { id: "p3", left: "Próbaidő", right: "El periodo de prueba" },
          { id: "p4", left: "Kollektív szerződés", right: "El convenio colectivo" },
        ],
      },
    ],
  },

  // ── 6. Takarítás ────────────────────────────────────────────
  {
    id: "es_clean_1",
    title: "Takarítás Alapok 1.",
    description: "Eszközök, vegyszerek — és a „fregona”, ami spanyol találmány.",
    industry: "Takarítás (Limpieza)",
    xpReward: 15,
    isPro: true,
    lang: "es-ES",
    questions: [
      { id: "es_clean_q1", type: "flashcard", prompt: "Felmosó (nyeles, csavarós)", backText: "La fregona", phonetic: "Lá fre-gó-ná" },
      { id: "es_clean_q2", type: "flashcard", prompt: "Porszívó", backText: "La aspiradora", phonetic: "Lá ász-pi-rá-dó-rá" },
      {
        id: "es_clean_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a „lejía”?",
        options: [
          { id: "a", text: "Hipó / fehérítő — a leggyakoribb fertőtlenítő" },
          { id: "b", text: "Mosószer" },
          { id: "c", text: "Ablaktisztító" },
        ],
        correctOptionId: "a",
      },
      { id: "es_clean_q4", type: "flashcard", prompt: "Vigyázat, csúszós a padló!", backText: "¡Cuidado, el suelo está mojado!", phonetic: "Kuj-dá-do, el szue-lo esz-tá mo-há-do!" },
      {
        id: "es_clean_q5",
        type: "match",
        prompt: "Párosítsd a takarítási szavakat!",
        pairs: [
          { id: "p1", left: "Vödör", right: "El cubo" },
          { id: "p2", left: "Gumikesztyű", right: "Los guantes" },
          { id: "p3", left: "Szemetes", right: "La basura" },
          { id: "p4", left: "Portörlő rongy", right: "El trapo" },
        ],
      },
    ],
  },

  // ── 7. Gyártás ──────────────────────────────────────────────
  {
    id: "es_prod_1",
    title: "Gyártás Alapok 1.",
    description: "Gépkezelés, műszak és minőségellenőrzés a spanyol üzemekben.",
    industry: "Gyártás (Producción)",
    xpReward: 15,
    isPro: true,
    lang: "es-ES",
    questions: [
      { id: "es_prod_q1", type: "flashcard", prompt: "Gépkezelő / betanított munkás", backText: "El operario", phonetic: "El o-pe-rá-rjo" },
      { id: "es_prod_q2", type: "flashcard", prompt: "Leállt a gép.", backText: "La máquina se ha parado.", phonetic: "Lá má-ki-ná sze á pá-rá-do." },
      {
        id: "es_prod_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a „cadena de producción”?",
        options: [
          { id: "a", text: "Gyártósor" },
          { id: "b", text: "Beszállítói lánc" },
          { id: "c", text: "Termékkatalógus" },
        ],
        correctOptionId: "a",
      },
      { id: "es_prod_q4", type: "flashcard", prompt: "Ez hibás termék.", backText: "Esta pieza está defectuosa.", phonetic: "Esz-tá pje-cszá esz-tá de-fek-tuó-szá." },
      {
        id: "es_prod_q5",
        type: "match",
        prompt: "Párosítsd az üzemi szavakat!",
        pairs: [
          { id: "p1", left: "Minőségellenőrzés", right: "El control de calidad" },
          { id: "p2", left: "Karbantartás", right: "El mantenimiento" },
          { id: "p3", left: "Selejt", right: "El desecho" },
          { id: "p4", left: "Vészleállító", right: "La parada de emergencia" },
        ],
      },
    ],
  },

  // ── 8. Szépségipar / fodrászat ──────────────────────────────
  {
    id: "es_hair_1",
    title: "Fodrászat Alapok 1.",
    description: "Vágás, festés és a vendéggel való egyeztetés.",
    industry: "Szépségipar (Peluquería)",
    xpReward: 15,
    isPro: true,
    lang: "es-ES",
    questions: [
      { id: "es_hair_q1", type: "flashcard", prompt: "Mennyit vágjunk le?", backText: "¿Cuánto le corto?", phonetic: "Kuán-to le kor-to?" },
      { id: "es_hair_q2", type: "flashcard", prompt: "Frufru", backText: "El flequillo", phonetic: "El fle-kí-jo" },
      {
        id: "es_hair_q3",
        type: "multiple_choice",
        prompt: "Mit jelentenek a „mechas”?",
        options: [
          { id: "a", text: "Melír / hajszálak világosítása" },
          { id: "b", text: "Hajvágó gép" },
          { id: "c", text: "Hajmosás" },
        ],
        correctOptionId: "a",
      },
      { id: "es_hair_q4", type: "flashcard", prompt: "Csak a végeket igazítom.", backText: "Solo le arreglo las puntas.", phonetic: "Szó-lo le á-rreg-lo lász pún-tász." },
      {
        id: "es_hair_q5",
        type: "match",
        prompt: "Párosítsd a fodrász-szavakat!",
        pairs: [
          { id: "p1", left: "Hajszárító", right: "El secador" },
          { id: "p2", left: "Festés", right: "El tinte" },
          { id: "p3", left: "Olló", right: "Las tijeras" },
          { id: "p4", left: "Hajmosás", right: "El lavado" },
        ],
      },
    ],
  },

  // ── 9. Szállítás ────────────────────────────────────────────
  {
    id: "es_driving_1",
    title: "Szállítás és Kézbesítés Alapok 1.",
    description: "Kamion, tachográf és a CAP-igazolvány.",
    industry: "Szállítás (Transporte)",
    xpReward: 15,
    isPro: true,
    lang: "es-ES",
    questions: [
      { id: "es_drive_q1", type: "flashcard", prompt: "Kamion", backText: "El camión", phonetic: "El ká-mjón" },
      { id: "es_drive_q2", type: "flashcard", prompt: "Menetíró (tachográf)", backText: "El tacógrafo", phonetic: "El tá-kó-grá-fo" },
      {
        id: "es_driving_q3",
        type: "multiple_choice",
        prompt: "⚠️ Mi a CAP (Certificado de Aptitud Profesional)?",
        options: [
          { id: "a", text: "Kötelező szakmai alkalmassági igazolás hivatásos járművezetéshez" },
          { id: "b", text: "Egy biztosítási kötvény" },
          { id: "c", text: "A gépjármű forgalmi engedélye" },
        ],
        correctOptionId: "a",
      },
      { id: "es_drive_q4", type: "flashcard", prompt: "Hol tudok kirakodni?", backText: "¿Dónde puedo descargar?", phonetic: "Don-de pue-do desz-kár-gár?" },
      {
        id: "es_driving_q5",
        type: "match",
        prompt: "Párosítsd az autós szavakat (spanyolországi alak)!",
        pairs: [
          { id: "p1", left: "Autó", right: "El coche" },
          { id: "p2", left: "Csomagtartó", right: "El maletero" },
          { id: "p3", left: "Üzemanyag", right: "El combustible" },
          { id: "p4", left: "Műszaki vizsga", right: "La ITV" },
        ],
      },
    ],
  },

  // ── 10. Gyermekgondozás ─────────────────────────────────────
  {
    id: "es_child_1",
    title: "Gyermekgondozás Alapok 1.",
    description: "Óvodai szókincs és a kötelező erkölcsi igazolás.",
    industry: "Gyermekgondozás (Cuidado infantil)",
    xpReward: 15,
    isPro: true,
    lang: "es-ES",
    questions: [
      { id: "es_child_q1", type: "flashcard", prompt: "Pelenka", backText: "El pañal", phonetic: "El pá-nyál" },
      { id: "es_child_q2", type: "flashcard", prompt: "Óvoda / bölcsőde", backText: "La guardería", phonetic: "Lá guár-de-rí-á" },
      {
        id: "es_child_q3",
        type: "multiple_choice",
        prompt: "⚠️ Milyen igazolás kell kiskorúakkal végzett munkához?",
        options: [
          { id: "a", text: "Certificado de delitos de naturaleza sexual — kötelező, e nélkül nem alkalmazhatnak" },
          { id: "b", text: "Csak egészségügyi alkalmassági" },
          { id: "c", text: "Semmilyen külön igazolás" },
        ],
        correctOptionId: "a",
      },
      { id: "es_child_q4", type: "flashcard", prompt: "Ideje pihenni.", backText: "Es la hora de la siesta.", phonetic: "Esz lá ó-rá de lá szjesz-tá." },
      {
        id: "es_child_q5",
        type: "match",
        prompt: "Párosítsd a gyermekgondozási szavakat!",
        pairs: [
          { id: "p1", left: "Játszótér", right: "El patio" },
          { id: "p2", left: "Uzsonna", right: "La merienda" },
          { id: "p3", left: "Cumi", right: "El chupete" },
          { id: "p4", left: "Nevelő", right: "El educador" },
        ],
      },
    ],
  },

  // ── 11. Mezőgazdaság ────────────────────────────────────────
  {
    id: "es_farm_1",
    title: "Mezőgazdaság Alapok 1.",
    description: "Szüret, üvegház és az idénymunka (campaña) nyelve.",
    industry: "Mezőgazdaság (Agricultura)",
    xpReward: 15,
    isPro: true,
    lang: "es-ES",
    questions: [
      { id: "es_farm_q1", type: "flashcard", prompt: "Szüret / betakarítás", backText: "La cosecha", phonetic: "Lá ko-szé-csá" },
      { id: "es_farm_q2", type: "flashcard", prompt: "Üvegház / fóliaház", backText: "El invernadero", phonetic: "El in-ver-ná-dé-ro" },
      {
        id: "es_farm_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a „temporero”?",
        options: [
          { id: "a", text: "Idénymunkás — a betakarítási kampányra szerződik" },
          { id: "b", text: "Gazdaságvezető" },
          { id: "c", text: "Állatorvos" },
        ],
        correctOptionId: "a",
      },
      { id: "es_farm_q4", type: "flashcard", prompt: "Hány ládát kell megtöltenem?", backText: "¿Cuántas cajas tengo que llenar?", phonetic: "Kuán-tász ká-hász ten-go ke je-nár?" },
      {
        id: "es_farm_q5",
        type: "match",
        prompt: "Párosítsd a mezőgazdasági szavakat!",
        pairs: [
          { id: "p1", left: "Idénymunka-időszak", right: "La campaña" },
          { id: "p2", left: "Traktor", right: "El tractor" },
          { id: "p3", left: "Csomagolóüzem", right: "El almacén de envasado" },
          { id: "p4", left: "Szedés / begyűjtés", right: "La recolección" },
        ],
      },
    ],
  },

  // ── 12. Gépjárműipar ────────────────────────────────────────
  {
    id: "es_auto_1",
    title: "Autószerelő Alapok 1.",
    description: "Alkatrészek, ITV és a műhely nyelve.",
    industry: "Gépjárműipar (Taller mecánico)",
    xpReward: 15,
    isPro: true,
    lang: "es-ES",
    questions: [
      { id: "es_auto_q1", type: "flashcard", prompt: "Gumi / abroncs", backText: "El neumático", phonetic: "El neu-má-ti-ko" },
      { id: "es_auto_q2", type: "flashcard", prompt: "Csavarkulcs", backText: "La llave inglesa", phonetic: "Lá já-ve in-glé-szá" },
      {
        id: "es_auto_q3",
        type: "multiple_choice",
        prompt: "Mi az ITV?",
        options: [
          { id: "a", text: "A kötelező időszakos műszaki vizsga" },
          { id: "b", text: "Egy biztosítási típus" },
          { id: "c", text: "Egy autómárka" },
        ],
        correctOptionId: "a",
      },
      { id: "es_auto_q4", type: "flashcard", prompt: "Furcsa hangot ad ki.", backText: "Hace un ruido raro.", phonetic: "Á-cse un ruj-do rá-ro." },
      {
        id: "es_auto_q5",
        type: "match",
        prompt: "Párosítsd az alkatrészeket!",
        pairs: [
          { id: "p1", left: "Motorháztető", right: "El capó" },
          { id: "p2", left: "Szélvédő", right: "El parabrisas" },
          { id: "p3", left: "Fékbetét", right: "La pastilla de freno" },
          { id: "p4", left: "Akkumulátor", right: "La batería" },
        ],
      },
    ],
  },

  // ── 13. Biztonsági szolgálat ────────────────────────────────
  {
    id: "es_security_1",
    title: "Biztonsági Szolgálat Alapok 1.",
    description: "⚠️ A TIP-engedély és a szolgálati nyelv — enélkül nem lehet dolgozni.",
    industry: "Biztonsági szolgálat (Seguridad)",
    xpReward: 15,
    isPro: true,
    lang: "es-ES",
    questions: [
      { id: "es_sec_q1", type: "flashcard", prompt: "Járőrözés", backText: "La ronda", phonetic: "Lá ron-dá" },
      { id: "es_sec_q2", type: "flashcard", prompt: "Ez a terület le van zárva.", backText: "Esta zona está cerrada.", phonetic: "Esz-tá cszó-ná esz-tá cse-rrá-dá." },
      {
        id: "es_security_q3",
        type: "multiple_choice",
        prompt: "⚠️ Mi a TIP (Tarjeta de Identidad Profesional)?",
        options: [
          { id: "a", text: "Kötelező szakmai engedély biztonsági őrként — vizsga és képzés után adják ki" },
          { id: "b", text: "Egy borravaló-rendszer" },
          { id: "c", text: "Egy magánbiztosítás" },
        ],
        correctOptionId: "a",
      },
      { id: "es_sec_q4", type: "flashcard", prompt: "Jelentést kell írnom.", backText: "Tengo que hacer un informe.", phonetic: "Ten-go ke á-cser un in-for-me." },
      {
        id: "es_security_q5",
        type: "match",
        prompt: "Párosítsd a biztonsági szavakat!",
        pairs: [
          { id: "p1", left: "Biztonsági őr", right: "El vigilante de seguridad" },
          { id: "p2", left: "Kamerarendszer", right: "Las cámaras (CCTV)" },
          { id: "p3", left: "Vészkijárat", right: "La salida de emergencia" },
          { id: "p4", left: "Szolgálati napló", right: "El libro de registro" },
        ],
      },
    ],
  },

  // ── 14. Szállodaipar ────────────────────────────────────────
  {
    id: "es_hotel_1",
    title: "Szállodaipar Alapok 1.",
    description: "Recepció, szobaasszony és a vendégkérések spanyolul.",
    industry: "Szállodaipar (Hotelería)",
    xpReward: 15,
    isPro: true,
    lang: "es-ES",
    questions: [
      { id: "es_hotel_q1", type: "flashcard", prompt: "Van foglalása?", backText: "¿Tiene reserva?", phonetic: "Tje-ne re-szer-vá?" },
      { id: "es_hotel_q2", type: "flashcard", prompt: "Szobalány / szobaasszony", backText: "La camarera de piso", phonetic: "Lá ká-má-ré-rá de pí-szo" },
      {
        id: "es_hotel_q3",
        type: "multiple_choice",
        prompt: "Ki a „gobernanta” a szállodában?",
        options: [
          { id: "a", text: "A housekeeping-vezető (a szobaasszonyok főnöke)" },
          { id: "b", text: "A recepciós" },
          { id: "c", text: "A szakács" },
        ],
        correctOptionId: "a",
      },
      { id: "es_hotel_q4", type: "flashcard", prompt: "Mikor szeretne kijelentkezni?", backText: "¿A qué hora quiere dejar la habitación?", phonetic: "Á ké ó-rá kje-re de-hár lá á-bi-tá-cszjón?" },
      {
        id: "es_hotel_q5",
        type: "match",
        prompt: "Párosítsd a szállodai szavakat!",
        pairs: [
          { id: "p1", left: "Recepció", right: "La recepción" },
          { id: "p2", left: "Kulcs", right: "La llave" },
          { id: "p3", left: "Ágynemű", right: "La ropa de cama" },
          { id: "p4", left: "Törölköző", right: "La toalla" },
        ],
      },
    ],
  },

  // ── 15. Konyhai személyzet ──────────────────────────────────
  {
    id: "es_kitchen_1",
    title: "Konyhai Személyzet Alapok 1.",
    description: "Konyhai hierarchia, allergének és a szakácsnyelv.",
    industry: "Konyhai személyzet (Cocina)",
    xpReward: 15,
    isPro: true,
    lang: "es-ES",
    questions: [
      { id: "es_kit_q1", type: "flashcard", prompt: "Konyhai kisegítő", backText: "El pinche de cocina", phonetic: "El pin-cse de ko-cszí-ná" },
      { id: "es_kit_q2", type: "flashcard", prompt: "Konyhafőnök", backText: "El jefe de cocina", phonetic: "El he-fe de ko-cszí-ná" },
      {
        id: "es_kitchen_q3",
        type: "multiple_choice",
        prompt: "⚠️ Mi a „carné de manipulador de alimentos”?",
        options: [
          { id: "a", text: "Élelmiszer-kezelői tanúsítvány — élelmiszerrel dolgozva elvárt" },
          { id: "b", text: "Egy szakácskönyv" },
          { id: "c", text: "Egy konyhai gép engedélye" },
        ],
        correctOptionId: "a",
      },
      { id: "es_kit_q4", type: "flashcard", prompt: "Ez glutént tartalmaz.", backText: "Esto contiene gluten.", phonetic: "Esz-to kon-tje-ne glú-ten." },
      {
        id: "es_kitchen_q5",
        type: "match",
        prompt: "Párosítsd a konyhai szavakat!",
        pairs: [
          { id: "p1", left: "Sütő", right: "El horno" },
          { id: "p2", left: "Hűtőkamra", right: "La cámara frigorífica" },
          { id: "p3", left: "Vágódeszka", right: "La tabla de cortar" },
          { id: "p4", left: "Serpenyő", right: "La sartén" },
        ],
      },
    ],
  },

  // ── 16. Élelmiszeripar / pékség ─────────────────────────────
  {
    id: "es_bakery_1",
    title: "Pékség Alapok 1.",
    description: "Tészta, kelesztés és a pékműhely szavai.",
    industry: "Élelmiszeripar (Panadería)",
    xpReward: 15,
    isPro: true,
    lang: "es-ES",
    questions: [
      { id: "es_bak_q1", type: "flashcard", prompt: "Tészta (kelt)", backText: "La masa", phonetic: "Lá má-szá" },
      { id: "es_bak_q2", type: "flashcard", prompt: "Élesztő", backText: "La levadura", phonetic: "Lá le-vá-dú-rá" },
      {
        id: "es_bakery_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a „bollería”?",
        options: [
          { id: "a", text: "Édes péksütemények (croissant, ensaimada, napolitana)" },
          { id: "b", text: "Kenyérfélék" },
          { id: "c", text: "Hűtött termékek" },
        ],
        correctOptionId: "a",
      },
      { id: "es_bak_q4", type: "flashcard", prompt: "Mikor jön ki a következő adag?", backText: "¿Cuándo sale la siguiente hornada?", phonetic: "Kuán-do szá-le lá szi-gjen-te or-ná-dá?" },
      {
        id: "es_bakery_q5",
        type: "match",
        prompt: "Párosítsd a pékség szavait!",
        pairs: [
          { id: "p1", left: "Liszt", right: "La harina" },
          { id: "p2", left: "Sütő", right: "El horno" },
          { id: "p3", left: "Kenyér", right: "El pan" },
          { id: "p4", left: "Sütési adag", right: "La hornada" },
        ],
      },
    ],
  },

  // ── 17. Villanyszerelés ─────────────────────────────────────
  {
    id: "es_elec_1",
    title: "Villanyszerelő Alapok 1.",
    description: "Kismegszakító-tábla, földelés és a boletín eléctrico.",
    industry: "Villanyszerelés (Electricista)",
    xpReward: 15,
    isPro: true,
    lang: "es-ES",
    questions: [
      { id: "es_elec_q1", type: "flashcard", prompt: "Konnektor / aljzat", backText: "El enchufe", phonetic: "El en-csú-fe" },
      { id: "es_elec_q2", type: "flashcard", prompt: "Földelés", backText: "La toma de tierra", phonetic: "Lá tó-má de tje-rrá" },
      {
        id: "es_elec_q3",
        type: "multiple_choice",
        prompt: "Mi a „boletín eléctrico” (CIE)?",
        options: [
          { id: "a", text: "Villamos megfelelőségi tanúsítvány — új bekötéshez, szerződéshez kell" },
          { id: "b", text: "Egy villanyszámla" },
          { id: "c", text: "Egy szakszervezeti lap" },
        ],
        correctOptionId: "a",
      },
      { id: "es_elec_q4", type: "flashcard", prompt: "Lekapcsoltam a főkapcsolót.", backText: "He desconectado el interruptor general.", phonetic: "E desz-ko-nek-tá-do el in-te-rrup-tór he-ne-rál." },
      {
        id: "es_elec_q5",
        type: "match",
        prompt: "Párosítsd a villanyszerelési szavakat!",
        pairs: [
          { id: "p1", left: "Kismegszakító-tábla", right: "El cuadro eléctrico" },
          { id: "p2", left: "Életvédelmi relé", right: "El diferencial" },
          { id: "p3", left: "Kábel", right: "El cable" },
          { id: "p4", left: "Villanyóra", right: "El contador" },
        ],
      },
    ],
  },

  // ── 18. Kozmetika ───────────────────────────────────────────
  {
    id: "es_beauty_1",
    title: "Kozmetika Alapok 1.",
    description: "Kezelések, konzultáció és a szalon nyelve.",
    industry: "Kozmetika (Estética)",
    xpReward: 15,
    isPro: true,
    lang: "es-ES",
    questions: [
      { id: "es_beauty_q1", type: "flashcard", prompt: "Gyantázás / szőrtelenítés", backText: "La depilación", phonetic: "Lá de-pi-lá-cszjón" },
      { id: "es_beauty_q2", type: "flashcard", prompt: "Arckezelés", backText: "El tratamiento facial", phonetic: "El trá-tá-mjen-to fá-cszjál" },
      {
        id: "es_beauty_q3",
        type: "multiple_choice",
        prompt: "Mi a „cabina” a szalonban?",
        options: [
          { id: "a", text: "A kezelőszoba / fülke" },
          { id: "b", text: "A pénztár" },
          { id: "c", text: "A várószoba" },
        ],
        correctOptionId: "a",
      },
      { id: "es_beauty_q4", type: "flashcard", prompt: "Érzékeny a bőre?", backText: "¿Tiene la piel sensible?", phonetic: "Tje-ne lá pjel szen-szí-ble?" },
      {
        id: "es_beauty_q5",
        type: "match",
        prompt: "Párosítsd a kozmetikai szavakat!",
        pairs: [
          { id: "p1", left: "Kézápolás", right: "La manicura" },
          { id: "p2", left: "Lábápolás", right: "La pedicura" },
          { id: "p3", left: "Masszázs", right: "El masaje" },
          { id: "p4", left: "Előjegyzés", right: "La cita" },
        ],
      },
    ],
  },

  // ── 19. Vízvezeték-szerelés ─────────────────────────────────
  {
    id: "es_plumb_1",
    title: "Vízvezeték-szerelő Alapok 1.",
    description: "Csap, kazán és a főelzáró — a fontanero nyelve.",
    industry: "Vízvezeték-szerelés (Fontanería)",
    xpReward: 15,
    isPro: true,
    lang: "es-ES",
    questions: [
      { id: "es_plumb_q1", type: "flashcard", prompt: "Csap", backText: "El grifo", phonetic: "El grí-fo" },
      { id: "es_plumb_q2", type: "flashcard", prompt: "Kazán", backText: "La caldera", phonetic: "Lá kál-dé-rá" },
      {
        id: "es_plumb_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a „llave de paso”?",
        options: [
          { id: "a", text: "Főelzáró csap" },
          { id: "b", text: "Bejárati kulcs" },
          { id: "c", text: "Csavarkulcs" },
        ],
        correctOptionId: "a",
      },
      { id: "es_plumb_q4", type: "flashcard", prompt: "Elzárom a vizet.", backText: "Voy a cerrar el agua.", phonetic: "Voj á cse-rrár el á-guá." },
      {
        id: "es_plumb_q5",
        type: "match",
        prompt: "Párosítsd a szerelési szavakat!",
        pairs: [
          { id: "p1", left: "Radiátor", right: "El radiador" },
          { id: "p2", left: "Lefolyó", right: "El desagüe" },
          { id: "p3", left: "Szivárgás", right: "La fuga" },
          { id: "p4", left: "Dugulás-elhárítás", right: "El desatasco" },
        ],
      },
    ],
  },

  // ── Mesterkurzus ────────────────────────────────────────────
  {
    id: "es_pro_1",
    title: "Mesterkurzus: Regiszter, Bér és Konfliktus",
    description: "⚠️ A tú/usted választás, a spanyolországi vs latin-amerikai szókincs, és a bérvita nyelve.",
    industry: "Munkahelyi kommunikáció (Trabajo)",
    xpReward: 25,
    isPro: true,
    lang: "es-ES",
    questions: [
      {
        id: "es_pro_q1",
        type: "multiple_choice",
        prompt: "⚠️ Mikor használj „usted”-et a munkahelyen Spanyolországban?",
        options: [
          { id: "a", text: "Idős vendégnél, gondozásban, hivatalban és első találkozáskor — a vendéglátásban és fiatal csapatban gyorsan tegeződnek" },
          { id: "b", text: "Mindig, minden helyzetben" },
          { id: "c", text: "Soha, Spanyolországban nincs ilyen forma" },
        ],
        correctOptionId: "a",
      },
      {
        id: "es_pro_q2",
        type: "multiple_choice",
        prompt: "⚠️ Melyik szó a SPANYOLORSZÁGI (nem latin-amerikai)?",
        options: [
          { id: "a", text: "Ordenador (számítógép) — a „computadora” latin-amerikai" },
          { id: "b", text: "Computadora" },
          { id: "c", text: "Mindkettő ugyanolyan gyakori Spanyolországban" },
        ],
        correctOptionId: "a",
      },
      { id: "es_pro_q3", type: "flashcard", prompt: "Szeretnék beszélni a fizetésemről.", backText: "Me gustaría hablar de mi salario.", phonetic: "Me gusz-tá-rí-á áb-lár de mi szá-lá-rjo." },
      { id: "es_pro_q4", type: "flashcard", prompt: "Ez nem szerepelt a szerződésemben.", backText: "Esto no estaba en mi contrato.", phonetic: "Esz-to no esz-tá-bá en mi kont-rá-to." },
      {
        id: "es_pro_q5",
        type: "match",
        prompt: "Párosítsd a munkajogi szavakat!",
        pairs: [
          { id: "p1", left: "Bérpapír", right: "La nómina" },
          { id: "p2", left: "Végelszámolás", right: "El finiquito" },
          { id: "p3", left: "Végkielégítés", right: "La indemnización" },
          { id: "p4", left: "Felmondás (munkáltatói)", right: "El despido" },
        ],
      },
    ],
  },
];
