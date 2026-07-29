import type { Lesson } from "./data";

/**
 * Spanyol (Español) kurzus — a Spanyolországban élő magyaroknak. A svájci
 * Mundart (data.ts), az osztrák (data-at.ts), a német (data-de.ts), a holland
 * (data-nl.ts) és a brit (data-gb.ts) ország-megfelelője, AZONOS terjedelemmel:
 * 100 lecke, 20 fejezet (5/fejezet), 300 kérdés.
 *
 * ⚠️ KÉT DOLOGBAN TÉR EL a többi kurzustól, és mindkettő szándékos:
 *
 * 1) VAN KÜLÖN KIEJTÉS-FEJEZET (2.). A spanyol írás majdnem tökéletesen
 *    kiejtés-hű — DE csak akkor, ha ismered a hat szabályt (néma h, j=h,
 *    ll=j, ñ=ny, v=b, z/ce/ci = pöszés sz). Aki ezeket nem tudja, hónapokig
 *    „trabajo"-t mond „trabazsó"-nak. Ez a hat szabály többet ér az első
 *    héten, mint száz szó — ezért kapott saját fejezetet, mindjárt a
 *    köszönések után.
 *
 * 2) A HIVATALI FEJEZETEK ELŐRE KERÜLTEK (6–7.), nem a kurzus végére. A
 *    spanyolországi beilleszkedés szűk keresztmetszete az ügyintézés
 *    (cita previa, empadronamiento, NIE) — ezekre a szavakra az első
 *    hetekben van szükség, nem a nyolcvanadik leckében.
 *
 * ⚠️ A z és a lágy c ejtése SPANYOLORSZÁGBAN pöszített (a nyelv a fogak közt,
 * mint az angol „think"-ben). Andalúziában és a Kanári-szigeteken viszont sima
 * sz — a kurzus a KASZTÍLIAI normát tanítja, de a leckék kimondják, hol tér el.
 * A magyar fonetikai átírásban ezt „sz"-ként jelöljük, mert magyar hang nincs rá.
 *
 * A lecke-id-k „sl" előtaggal, a kérdés-id-k „sq" előtaggal, hogy NE ütközzenek
 * a CH („l"/„q"), AT („al"/„aq"), DE („dl"/„dq"), NL („nl"/„nq") és GB
 * („gl"/„gq") id-kkel. A TTS es-ES (kasztíliai, NEM latin-amerikai).
 */
export const LESSONS_ES: Lesson[] = [
  // ══ 1. Fejezet: Alapok ══════════════════════════════
  { id: "sl1", title: "Köszönés", description: "Hola, Buenos días, Buenas tardes.", chapter: 1, xpReward: 10, questions: [
    { id: "sq1", type: "multiple_choice", prompt: "Hogy köszönsz délelőtt?", options: [{ id: "o1", text: "Buenos días" }, { id: "o2", text: "Buenas noches" }, { id: "o3", text: "Hasta luego" }], correctOptionId: "o1" },
    { id: "sq2", type: "flashcard", prompt: "Informális köszönés (szia, helló)?", backText: "Hola", phonetic: "Ola (a h NÉMA!)" },
    { id: "sq3", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Jó reggelt / jó napot", right: "Buenos días" }, { id: "p2", left: "Jó napot (ebéd után)", right: "Buenas tardes" }, { id: "p3", left: "Jó estét / jó éjt", right: "Buenas noches" }] } ] },
  { id: "sl2", title: "⚠️ Mikor van „tarde”?", description: "A spanyol nap más ritmusú.", chapter: 1, xpReward: 10, questions: [
    { id: "sq4", type: "multiple_choice", prompt: "Nagyjából mikortól köszönnek „buenas tardes”-szel?", options: [{ id: "o1", text: "Az ebéd (kb. 14 óra) után" }, { id: "o2", text: "Pontban 12 órától" }, { id: "o3", text: "Csak este 8 után" }], correctOptionId: "o1" },
    { id: "sq5", type: "flashcard", prompt: "Miért fontos ez? Mert a spanyol nap eltolódik:", backText: "comida ~14h, cena ~21h", phonetic: "komída, széna" },
    { id: "sq6", type: "multiple_choice", prompt: "Este 10-kor melyik a helyes?", options: [{ id: "o1", text: "Buenas noches" }, { id: "o2", text: "Buenos días" }, { id: "o3", text: "Buenas tardes" }], correctOptionId: "o1" } ] },
  { id: "sl3", title: "Búcsúzás", description: "Adiós, Hasta luego, Chao.", chapter: 1, xpReward: 10, questions: [
    { id: "sq7", type: "multiple_choice", prompt: "Melyiket hallod a legtöbbször boltból kilépve?", options: [{ id: "o1", text: "Hasta luego" }, { id: "o2", text: "Buenos días" }, { id: "o3", text: "Por favor" }], correctOptionId: "o1" },
    { id: "sq8", type: "flashcard", prompt: "„Viszlát” (semleges, végleges)", backText: "Adiós", phonetic: "Adiósz" },
    { id: "sq9", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Viszlát (nemsokára)", right: "Hasta luego" }, { id: "p2", left: "Holnap találkozunk", right: "Hasta mañana" }, { id: "p3", left: "Szia (lazán)", right: "Chao" }] } ] },
  { id: "sl4", title: "Udvariasság", description: "Por favor, Gracias, Perdón.", chapter: 1, xpReward: 10, questions: [
    { id: "sq10", type: "multiple_choice", prompt: "Hogy mondod, hogy „köszönöm”?", options: [{ id: "o1", text: "Gracias" }, { id: "o2", text: "Por favor" }, { id: "o3", text: "De nada" }], correctOptionId: "o1" },
    { id: "sq11", type: "flashcard", prompt: "„Szívesen” (válasz a köszönetre)", backText: "De nada", phonetic: "De náda" },
    { id: "sq12", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Kérem", right: "Por favor" }, { id: "p2", left: "Elnézést (megszólítás)", right: "Perdón" }, { id: "p3", left: "Bocsánat (sajnálom)", right: "Lo siento" }] } ] },
  { id: "sl5", title: "Bemutatkozás", description: "Me llamo…, ¿Cómo te llamas?", chapter: 1, xpReward: 10, questions: [
    { id: "sq13", type: "multiple_choice", prompt: "Hogy kérdezed: „Hogy hívnak?”", options: [{ id: "o1", text: "¿Cómo te llamas?" }, { id: "o2", text: "¿Dónde vives?" }, { id: "o3", text: "¿Qué tal?" }], correctOptionId: "o1" },
    { id: "sq14", type: "flashcard", prompt: "„Engem … hívnak”", backText: "Me llamo…", phonetic: "Me jámo (az ll = j!)" },
    { id: "sq15", type: "multiple_choice", prompt: "Mit jelent: „Soy húngaro”?", options: [{ id: "o1", text: "Magyar vagyok" }, { id: "o2", text: "Éhes vagyok" }, { id: "o3", text: "Itt lakom" }], correctOptionId: "o1" } ] },

  // ══ 2. Fejezet: Kiejtés — a hat szabály ══════════════
  { id: "sl6", title: "⚠️ A néma h és a j", description: "hola = ola, trabajo = trabaho.", chapter: 2, xpReward: 10, questions: [
    { id: "sq16", type: "multiple_choice", prompt: "Hogy ejted: „hola”?", options: [{ id: "o1", text: "ola — a h mindig NÉMA" }, { id: "o2", text: "hola, ejtett h-val" }, { id: "o3", text: "zsola" }], correctOptionId: "o1" },
    { id: "sq17", type: "flashcard", prompt: "Hogy ejted: „trabajo” (munka)?", backText: "trabaho — a j = magyar h", phonetic: "trabáho" },
    { id: "sq18", type: "match", prompt: "Párosítsd az írást a kiejtéssel!", pairs: [{ id: "p1", left: "hijo (fia)", right: "iho" }, { id: "p2", left: "hora (óra)", right: "óra" }, { id: "p3", left: "jamón (sonka)", right: "hamón" }] } ] },
  { id: "sl7", title: "⚠️ Az ll és az ñ", description: "calle = kaje, año = anyo.", chapter: 2, xpReward: 10, questions: [
    { id: "sq19", type: "multiple_choice", prompt: "Hogy ejted: „calle” (utca)?", options: [{ id: "o1", text: "kaje — az ll = j" }, { id: "o2", text: "kalle, két l-lel" }, { id: "o3", text: "kacse" }], correctOptionId: "o1" },
    { id: "sq20", type: "flashcard", prompt: "Hogy ejted: „año” (év)?", backText: "anyo — az ñ = ny", phonetic: "ányo" },
    { id: "sq21", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "llave (kulcs)", right: "jábe" }, { id: "p2", left: "España", right: "Eszpánya" }, { id: "p3", left: "niño (gyerek)", right: "nínyo" }] } ] },
  { id: "sl8", title: "⚠️ A v = b", description: "vino = bíno, vivir = bibír.", chapter: 2, xpReward: 10, questions: [
    { id: "sq22", type: "multiple_choice", prompt: "Hogy ejted: „vino” (bor)?", options: [{ id: "o1", text: "bíno — a v és a b UGYANAZ a hang" }, { id: "o2", text: "víno, magyar v-vel" }, { id: "o3", text: "fíno" }], correctOptionId: "o1" },
    { id: "sq23", type: "flashcard", prompt: "„Barcelonában élek”", backText: "Vivo en Barcelona", phonetic: "Bíbo en Barszelóna" },
    { id: "sq24", type: "multiple_choice", prompt: "Miért fontos ez a szabály?", options: [{ id: "o1", text: "Mert a spanyolok maguk is keverik írásban — hallás után nem tudod, v vagy b" }, { id: "o2", text: "Mert a v betű nem is létezik" }, { id: "o3", text: "Csak Andalúziában igaz" }], correctOptionId: "o1" } ] },
  { id: "sl9", title: "⚠️ A z és a lágy c", description: "gracias, cerveza — a pöszés sz.", chapter: 2, xpReward: 10, questions: [
    { id: "sq25", type: "multiple_choice", prompt: "Spanyolországban hogy ejtik a „z”-t és a „c”-t e/i előtt?", options: [{ id: "o1", text: "Pöszített sz — a nyelv a fogak közt (mint az angol „think”)" }, { id: "o2", text: "Magyar z-nek" }, { id: "o3", text: "Magyar c-nek" }], correctOptionId: "o1" },
    { id: "sq26", type: "flashcard", prompt: "„Egy sört, kérem”", backText: "Una cerveza, por favor", phonetic: "Una szerbésza, por fabór" },
    { id: "sq27", type: "multiple_choice", prompt: "Hol NEM így ejtik?", options: [{ id: "o1", text: "Andalúziában és a Kanári-szigeteken — ott sima sz" }, { id: "o2", text: "Madridban" }, { id: "o3", text: "Sehol, mindenhol ugyanaz" }], correctOptionId: "o1" } ] },
  { id: "sl10", title: "⚠️ A fordított kérdőjel", description: "¿…? és ¡…! — elöl is kell.", chapter: 2, xpReward: 10, questions: [
    { id: "sq28", type: "multiple_choice", prompt: "Miért van a spanyolban fordított kérdőjel a mondat ELEJÉN?", options: [{ id: "o1", text: "Mert a szórend nem árulja el előre, hogy kérdés — a jel szól előre" }, { id: "o2", text: "Csak dísz, elhagyható" }, { id: "o3", text: "Csak a régi könyvekben van" }], correctOptionId: "o1" },
    { id: "sq29", type: "flashcard", prompt: "„Hogy vagy?” — helyes írásmóddal", backText: "¿Cómo estás?", phonetic: "Kómo esztász" },
    { id: "sq30", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Kérdés eleje", right: "¿" }, { id: "p2", left: "Felkiáltás eleje", right: "¡" }, { id: "p3", left: "Szia! (lelkesen)", right: "¡Hola!" }] } ] },

  // ══ 3. Fejezet: Számok & idő ═════════════════════════
  { id: "sl11", title: "Számok 1–10", description: "uno, dos, tres…", chapter: 3, xpReward: 10, questions: [
    { id: "sq31", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "egy", right: "uno" }, { id: "p2", left: "kettő", right: "dos" }, { id: "p3", left: "három", right: "tres" }] },
    { id: "sq32", type: "flashcard", prompt: "Négy, öt", backText: "cuatro, cinco", phonetic: "kuátro, színko" },
    { id: "sq33", type: "multiple_choice", prompt: "Melyik a „tíz”?", options: [{ id: "o1", text: "diez" }, { id: "o2", text: "doce" }, { id: "o3", text: "dos" }], correctOptionId: "o1" } ] },
  { id: "sl12", title: "Számok 11–100", description: "once, veinte, cien.", chapter: 3, xpReward: 10, questions: [
    { id: "sq34", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "húsz", right: "veinte" }, { id: "p2", left: "ötven", right: "cincuenta" }, { id: "p3", left: "száz", right: "cien" }] },
    { id: "sq35", type: "flashcard", prompt: "Huszonegy", backText: "veintiuno", phonetic: "beintiúno" },
    { id: "sq36", type: "multiple_choice", prompt: "Mennyi a „treinta”?", options: [{ id: "o1", text: "harminc" }, { id: "o2", text: "tizenhárom" }, { id: "o3", text: "háromszáz" }], correctOptionId: "o1" } ] },
  { id: "sl13", title: "Mennyi az idő?", description: "¿Qué hora es?", chapter: 3, xpReward: 10, questions: [
    { id: "sq37", type: "multiple_choice", prompt: "Hogy kérdezed: „Hány óra van?”", options: [{ id: "o1", text: "¿Qué hora es?" }, { id: "o2", text: "¿Cuánto cuesta?" }, { id: "o3", text: "¿Dónde está?" }], correctOptionId: "o1" },
    { id: "sq38", type: "flashcard", prompt: "„Három óra van”", backText: "Son las tres", phonetic: "Szon lasz tresz" },
    { id: "sq39", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "…és fél", right: "…y media" }, { id: "p2", left: "…és negyed", right: "…y cuarto" }, { id: "p3", left: "…múlva negyed", right: "…menos cuarto" }] } ] },
  { id: "sl14", title: "Napszakok", description: "mañana, tarde, noche.", chapter: 3, xpReward: 10, questions: [
    { id: "sq40", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "reggel / délelőtt", right: "la mañana" }, { id: "p2", left: "délután / kora este", right: "la tarde" }, { id: "p3", left: "éjszaka", right: "la noche" }] },
    { id: "sq41", type: "flashcard", prompt: "⚠️ A „mañana” KÉT dolgot jelent:", backText: "reggel ÉS holnap", phonetic: "mányána" },
    { id: "sq42", type: "multiple_choice", prompt: "Mit jelent „pasado mañana”?", options: [{ id: "o1", text: "holnapután" }, { id: "o2", text: "tegnapelőtt" }, { id: "o3", text: "ma reggel" }], correctOptionId: "o1" } ] },
  { id: "sl15", title: "Gyakoriság", description: "siempre, a veces, nunca.", chapter: 3, xpReward: 10, questions: [
    { id: "sq43", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "mindig", right: "siempre" }, { id: "p2", left: "néha", right: "a veces" }, { id: "p3", left: "soha", right: "nunca" }] },
    { id: "sq44", type: "flashcard", prompt: "„Most” és „később”", backText: "ahora / luego", phonetic: "aóra / luégo" },
    { id: "sq45", type: "multiple_choice", prompt: "Mit jelent „todos los días”?", options: [{ id: "o1", text: "minden nap" }, { id: "o2", text: "egész nap" }, { id: "o3", text: "néhány napja" }], correctOptionId: "o1" } ] },

  // ══ 4. Fejezet: Vásárlás & fizetés ═══════════════════
  { id: "sl16", title: "A boltban", description: "¿Cuánto cuesta?", chapter: 4, xpReward: 10, questions: [
    { id: "sq46", type: "multiple_choice", prompt: "Hogy kérdezed: „Mennyibe kerül?”", options: [{ id: "o1", text: "¿Cuánto cuesta?" }, { id: "o2", text: "¿Qué hora es?" }, { id: "o3", text: "¿Cómo estás?" }], correctOptionId: "o1" },
    { id: "sq47", type: "flashcard", prompt: "„Csak nézelődöm, köszönöm”", backText: "Solo estoy mirando, gracias", phonetic: "Szólo esztoj mirándo" },
    { id: "sq48", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "olcsó", right: "barato" }, { id: "p2", left: "drága", right: "caro" }, { id: "p3", left: "akció / kedvezmény", right: "oferta" }] } ] },
  { id: "sl17", title: "Fizetés", description: "Kártya vagy készpénz?", chapter: 4, xpReward: 10, questions: [
    { id: "sq49", type: "multiple_choice", prompt: "Mit kérdez a pénztáros: „¿En efectivo o con tarjeta?”", options: [{ id: "o1", text: "Készpénzzel vagy kártyával?" }, { id: "o2", text: "Kér zacskót?" }, { id: "o3", text: "Van hűségkártyája?" }], correctOptionId: "o1" },
    { id: "sq50", type: "flashcard", prompt: "„Kártyával fizetek”", backText: "Pago con tarjeta", phonetic: "Págo kon tarhéta" },
    { id: "sq51", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "készpénz", right: "efectivo" }, { id: "p2", left: "számla / blokk", right: "el ticket" }, { id: "p3", left: "visszajáró", right: "el cambio" }] } ] },
  { id: "sl18", title: "Mennyiségek", description: "un kilo, medio, un poco.", chapter: 4, xpReward: 10, questions: [
    { id: "sq52", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "egy kiló", right: "un kilo" }, { id: "p2", left: "fél kiló", right: "medio kilo" }, { id: "p3", left: "egy kicsit", right: "un poco" }] },
    { id: "sq53", type: "flashcard", prompt: "„Egy tucat tojás”", backText: "Una docena de huevos", phonetic: "Una doszéna de uébosz" },
    { id: "sq54", type: "multiple_choice", prompt: "Mit jelent „¿Algo más?”", options: [{ id: "o1", text: "Még valamit?" }, { id: "o2", text: "Mennyi lesz?" }, { id: "o3", text: "Hol van?" }], correctOptionId: "o1" } ] },
  { id: "sl19", title: "Boltok", description: "supermercado, panadería, farmacia.", chapter: 4, xpReward: 10, questions: [
    { id: "sq55", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "szupermarket", right: "el supermercado" }, { id: "p2", left: "pékség", right: "la panadería" }, { id: "p3", left: "gyógyszertár", right: "la farmacia" }] },
    { id: "sq56", type: "flashcard", prompt: "Piac", backText: "el mercado", phonetic: "el merkádo" },
    { id: "sq57", type: "multiple_choice", prompt: "⚠️ Mikor vannak zárva sok kisboltok?", options: [{ id: "o1", text: "Kora délután, kb. 14–17 óra közt" }, { id: "o2", text: "Egész délelőtt" }, { id: "o3", text: "Sosem zárnak" }], correctOptionId: "o1" } ] },
  { id: "sl20", title: "Csere & panasz", description: "Devolver, cambiar, no funciona.", chapter: 4, xpReward: 10, questions: [
    { id: "sq58", type: "multiple_choice", prompt: "„Ezt szeretném visszavinni”", options: [{ id: "o1", text: "Quiero devolver esto" }, { id: "o2", text: "Quiero comprar esto" }, { id: "o3", text: "Quiero pagar esto" }], correctOptionId: "o1" },
    { id: "sq59", type: "flashcard", prompt: "„Nem működik”", backText: "No funciona", phonetic: "No funszjóna" },
    { id: "sq60", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "kicserélni", right: "cambiar" }, { id: "p2", left: "garancia", right: "la garantía" }, { id: "p3", left: "panaszlap", right: "la hoja de reclamaciones" }] } ] },

  // ══ 5. Fejezet: Étterem & tapas ══════════════════════
  { id: "sl21", title: "Asztalfoglalás", description: "Una mesa para dos.", chapter: 5, xpReward: 10, questions: [
    { id: "sq61", type: "multiple_choice", prompt: "„Egy asztalt kérnék két főre”", options: [{ id: "o1", text: "Una mesa para dos, por favor" }, { id: "o2", text: "La cuenta, por favor" }, { id: "o3", text: "Un café, por favor" }], correctOptionId: "o1" },
    { id: "sq62", type: "flashcard", prompt: "„Van szabad asztaluk?”", backText: "¿Tienen mesa libre?", phonetic: "Tiénen mésza líbre" },
    { id: "sq63", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "terasz", right: "la terraza" }, { id: "p2", left: "belül", right: "dentro" }, { id: "p3", left: "foglalás", right: "la reserva" }] } ] },
  { id: "sl22", title: "⚠️ Menú del día", description: "A hétköznapi fix ebédmenü.", chapter: 5, xpReward: 10, questions: [
    { id: "sq64", type: "multiple_choice", prompt: "Mi a „menú del día”?", options: [{ id: "o1", text: "Hétköznapi, fix árú ebéd több fogásból" }, { id: "o2", text: "A napi ajánlott bor" }, { id: "o3", text: "A hétvégi különmenü" }], correctOptionId: "o1" },
    { id: "sq65", type: "flashcard", prompt: "Első fogás / második fogás", backText: "primer plato / segundo plato", phonetic: "primer pláto / szegúndo pláto" },
    { id: "sq66", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "desszert", right: "el postre" }, { id: "p2", left: "kenyér", right: "el pan" }, { id: "p3", left: "ital benne van", right: "bebida incluida" }] } ] },
  { id: "sl23", title: "Rendelés", description: "Para mí…, ¿Qué me recomienda?", chapter: 5, xpReward: 10, questions: [
    { id: "sq67", type: "flashcard", prompt: "„Nekem … lesz”", backText: "Para mí…", phonetic: "Pára mí" },
    { id: "sq68", type: "multiple_choice", prompt: "„Mit ajánl?”", options: [{ id: "o1", text: "¿Qué me recomienda?" }, { id: "o2", text: "¿Dónde está el baño?" }, { id: "o3", text: "¿Cuánto es?" }], correctOptionId: "o1" },
    { id: "sq69", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "előétel", right: "el entrante" }, { id: "p2", left: "köret", right: "la guarnición" }, { id: "p3", left: "étlap", right: "la carta" }] } ] },
  { id: "sl24", title: "Tapas & italok", description: "caña, vino, agua.", chapter: 5, xpReward: 10, questions: [
    { id: "sq70", type: "multiple_choice", prompt: "Mi az a „caña”?", options: [{ id: "o1", text: "Egy pohár csapolt sör (kis méret)" }, { id: "o2", text: "Egy üveg bor" }, { id: "o3", text: "Egy csésze kávé" }], correctOptionId: "o1" },
    { id: "sq71", type: "flashcard", prompt: "„Egy pohár vizet kérek”", backText: "Un vaso de agua, por favor", phonetic: "Un bászo de água" },
    { id: "sq72", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "vörösbor", right: "vino tinto" }, { id: "p2", left: "fehérbor", right: "vino blanco" }, { id: "p3", left: "csapvíz", right: "agua del grifo" }] } ] },
  { id: "sl25", title: "Fizetés & allergia", description: "La cuenta, soy alérgico a…", chapter: 5, xpReward: 10, questions: [
    { id: "sq73", type: "multiple_choice", prompt: "„A számlát, kérem”", options: [{ id: "o1", text: "La cuenta, por favor" }, { id: "o2", text: "La carta, por favor" }, { id: "o3", text: "La mesa, por favor" }], correctOptionId: "o1" },
    { id: "sq74", type: "flashcard", prompt: "„Allergiás vagyok a …-ra”", backText: "Soy alérgico/a a…", phonetic: "Szoj alérhiko a" },
    { id: "sq75", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "mogyoró / dió", right: "los frutos secos" }, { id: "p2", left: "laktóz", right: "la lactosa" }, { id: "p3", left: "glutén", right: "el gluten" }] } ] },

  // ══ 6. Fejezet: Hivatal — cita previa ════════════════
  { id: "sl26", title: "⚠️ Cita previa", description: "A legfontosabb szó az ügyintézésben.", chapter: 6, xpReward: 10, questions: [
    { id: "sq76", type: "multiple_choice", prompt: "Mit jelent „cita previa”?", options: [{ id: "o1", text: "Előzetes időpontfoglalás" }, { id: "o2", text: "Hivatalos igazolás" }, { id: "o3", text: "Sorszám a helyszínen" }], correctOptionId: "o1" },
    { id: "sq77", type: "flashcard", prompt: "„Időpontot szeretnék kérni”", backText: "Quiero pedir cita previa", phonetic: "Kiéro pedír szíta prébia" },
    { id: "sq78", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "időpont", right: "la cita" }, { id: "p2", left: "hivatal / iroda", right: "la oficina" }, { id: "p3", left: "ügyintézés", right: "el trámite" }] } ] },
  { id: "sl27", title: "„Nincs szabad időpont”", description: "No hay citas disponibles.", chapter: 6, xpReward: 10, questions: [
    { id: "sq79", type: "multiple_choice", prompt: "Mit jelent „No hay citas disponibles”?", options: [{ id: "o1", text: "Nincs szabad időpont" }, { id: "o2", text: "Az iroda zárva van" }, { id: "o3", text: "Az ügy elutasítva" }], correctOptionId: "o1" },
    { id: "sq80", type: "flashcard", prompt: "„Mikor lesz újra szabad hely?”", backText: "¿Cuándo habrá más citas?", phonetic: "Kuándo abrá mász szítasz" },
    { id: "sq81", type: "multiple_choice", prompt: "⚠️ Mennyibe kerül az időpont?", options: [{ id: "o1", text: "Semmibe — ingyenes; aki pénzt kér érte, viszonteladó" }, { id: "o2", text: "Kb. 30 euróba" }, { id: "o3", text: "Hivataltól függ" }], correctOptionId: "o1" } ] },
  { id: "sl28", title: "Empadronamiento", description: "Lakcím-bejelentés az önkormányzatnál.", chapter: 6, xpReward: 10, questions: [
    { id: "sq82", type: "multiple_choice", prompt: "Hol intézed az empadronamientót?", options: [{ id: "o1", text: "Az önkormányzatnál (ayuntamiento)" }, { id: "o2", text: "A rendőrségen" }, { id: "o3", text: "A bankban" }], correctOptionId: "o1" },
    { id: "sq83", type: "flashcard", prompt: "„Be szeretnék jelentkezni a lakcímemre”", backText: "Quiero empadronarme", phonetic: "Kiéro empadronárme" },
    { id: "sq84", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "önkormányzat", right: "el ayuntamiento" }, { id: "p2", left: "lakcímnyilvántartás", right: "el padrón" }, { id: "p3", left: "hivatalos igazolás", right: "el certificado" }] } ] },
  { id: "sl29", title: "⚠️ Volante vagy certificado?", description: "Két papír, nem cserélhetők fel.", chapter: 6, xpReward: 10, questions: [
    { id: "sq85", type: "multiple_choice", prompt: "Melyik a HIVATALOS igazolás hatósági ügyhez?", options: [{ id: "o1", text: "El certificado de empadronamiento" }, { id: "o2", text: "El volante de empadronamiento" }, { id: "o3", text: "Mindegy, ugyanaz" }], correctOptionId: "o1" },
    { id: "sq86", type: "flashcard", prompt: "„A certificadót kérem, nem a volantét”", backText: "Necesito el certificado, no el volante", phonetic: "Neszeszíto el szertifikádo" },
    { id: "sq87", type: "multiple_choice", prompt: "Miért számít a különbség?", options: [{ id: "o1", text: "Mert rossz papírral újra sorba kell állni" }, { id: "o2", text: "Mert az egyik fizetős" }, { id: "o3", text: "Nem számít" }], correctOptionId: "o1" } ] },
  { id: "sl30", title: "A hivatalban", description: "Documentos, formulario, firma.", chapter: 6, xpReward: 10, questions: [
    { id: "sq88", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "nyomtatvány", right: "el formulario" }, { id: "p2", left: "aláírás", right: "la firma" }, { id: "p3", left: "fénymásolat", right: "la fotocopia" }] },
    { id: "sq89", type: "flashcard", prompt: "„Nem beszélek jól spanyolul”", backText: "No hablo bien español", phonetic: "No áblo bien eszpanyól" },
    { id: "sq90", type: "multiple_choice", prompt: "„Meg tudná ismételni lassabban?”", options: [{ id: "o1", text: "¿Puede repetir más despacio?" }, { id: "o2", text: "¿Puede darme el ticket?" }, { id: "o3", text: "¿Dónde está la salida?" }], correctOptionId: "o1" } ] },

  // ══ 7. Fejezet: Okmányok, NIE, TB ════════════════════
  { id: "sl31", title: "NIE-szám", description: "A külföldiek azonosítója.", chapter: 7, xpReward: 10, questions: [
    { id: "sq91", type: "multiple_choice", prompt: "Mi a NIE?", options: [{ id: "o1", text: "Número de Identidad de Extranjero — a külföldiek azonosító száma" }, { id: "o2", text: "Egy adónem" }, { id: "o3", text: "A lakcímkártya" }], correctOptionId: "o1" },
    { id: "sq92", type: "flashcard", prompt: "„Szükségem van NIE-számra”", backText: "Necesito el NIE", phonetic: "Neszeszíto el nie" },
    { id: "sq93", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "külföldi", right: "el extranjero" }, { id: "p2", left: "útlevél", right: "el pasaporte" }, { id: "p3", left: "személyi igazolvány", right: "el DNI" }] } ] },
  { id: "sl32", title: "Uniós regisztráció", description: "Certificado de registro.", chapter: 7, xpReward: 10, questions: [
    { id: "sq94", type: "multiple_choice", prompt: "Mit kap az uniós polgár 3 hónap után?", options: [{ id: "o1", text: "Certificado de registro (a „zöld igazolás”)" }, { id: "o2", text: "Munkavállalási engedélyt" }, { id: "o3", text: "Állampolgárságot" }], correctOptionId: "o1" },
    { id: "sq95", type: "flashcard", prompt: "Idegenrendészeti hivatal", backText: "la Oficina de Extranjería", phonetic: "ofiszína de extranherja" },
    { id: "sq96", type: "multiple_choice", prompt: "⚠️ A zöld igazolás személyi igazolvány?", options: [{ id: "o1", text: "Nem — nincs rajta fénykép, az útlevelet is vinni kell" }, { id: "o2", text: "Igen, teljes értékű okmány" }, { id: "o3", text: "Csak bankban fogadják el" }], correctOptionId: "o1" } ] },
  { id: "sl33", title: "Seguridad Social", description: "A társadalombiztosítási szám.", chapter: 7, xpReward: 10, questions: [
    { id: "sq97", type: "multiple_choice", prompt: "Mire kell a Seguridad Social-szám?", options: [{ id: "o1", text: "Enélkül a munkáltató nem tud bejelenteni" }, { id: "o2", text: "Csak nyugdíjkorhatár után" }, { id: "o3", text: "Csak bankszámlanyitáshoz" }], correctOptionId: "o1" },
    { id: "sq98", type: "flashcard", prompt: "„Bejelentés” (munkaviszonyé)", backText: "el alta", phonetic: "el álta" },
    { id: "sq99", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "munkaviszony-igazolás", right: "la vida laboral" }, { id: "p2", left: "kijelentés", right: "la baja" }, { id: "p3", left: "járulék", right: "la cotización" }] } ] },
  { id: "sl34", title: "Cl@ve & online ügyintézés", description: "Digitális azonosító.", chapter: 7, xpReward: 10, questions: [
    { id: "sq100", type: "multiple_choice", prompt: "Mi a Cl@ve?", options: [{ id: "o1", text: "Az állam belépési rendszere az online ügyintézéshez" }, { id: "o2", text: "Egy bank" }, { id: "o3", text: "Egy telefonszolgáltató" }], correctOptionId: "o1" },
    { id: "sq101", type: "flashcard", prompt: "Elektronikus tanúsítvány", backText: "el certificado digital", phonetic: "szertifikádo dihitál" },
    { id: "sq102", type: "multiple_choice", prompt: "Miért éri meg beszerezni?", options: [{ id: "o1", text: "Mert sok ügyhöz így NEM kell időpontot kérni" }, { id: "o2", text: "Mert kötelező" }, { id: "o3", text: "Mert kedvezményt ad" }], correctOptionId: "o1" } ] },
  { id: "sl35", title: "Kérdések a pultnál", description: "¿Qué documentos necesito?", chapter: 7, xpReward: 10, questions: [
    { id: "sq103", type: "multiple_choice", prompt: "„Milyen dokumentumok kellenek?”", options: [{ id: "o1", text: "¿Qué documentos necesito?" }, { id: "o2", text: "¿Cuánto tarda?" }, { id: "o3", text: "¿Dónde firmo?" }], correctOptionId: "o1" },
    { id: "sq104", type: "flashcard", prompt: "„Mennyi ideig tart?”", backText: "¿Cuánto tarda?", phonetic: "Kuánto tárda" },
    { id: "sq105", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Hol írjam alá?", right: "¿Dónde firmo?" }, { id: "p2", left: "Kell fizetni?", right: "¿Hay que pagar?" }, { id: "p3", left: "Mikor jöjjek vissza?", right: "¿Cuándo vuelvo?" }] } ] },

  // ══ 8. Fejezet: Munka & nómina ═══════════════════════
  { id: "sl36", title: "Állásinterjú", description: "la entrevista de trabajo.", chapter: 8, xpReward: 10, questions: [
    { id: "sq106", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "önéletrajz", right: "el currículum" }, { id: "p2", left: "állásinterjú", right: "la entrevista" }, { id: "p3", left: "tapasztalat", right: "la experiencia" }] },
    { id: "sq107", type: "flashcard", prompt: "„Öt év tapasztalatom van”", backText: "Tengo cinco años de experiencia", phonetic: "Téngo színko ányosz" },
    { id: "sq108", type: "multiple_choice", prompt: "Mit jelent „¿Cuándo puedes empezar?”", options: [{ id: "o1", text: "Mikor tudsz kezdeni?" }, { id: "o2", text: "Hol dolgoztál?" }, { id: "o3", text: "Mennyit kérsz?" }], correctOptionId: "o1" } ] },
  { id: "sl37", title: "⚠️ 12 vagy 14 paga?", description: "A legfontosabb bér-kérdés.", chapter: 8, xpReward: 10, questions: [
    { id: "sq109", type: "multiple_choice", prompt: "Mit jelent „14 pagas”?", options: [{ id: "o1", text: "Az éves bért 14 részletben fizetik (12 havi + 2 extra)" }, { id: "o2", text: "14 nap szabadság" }, { id: "o3", text: "14 órás műszak" }], correctOptionId: "o1" },
    { id: "sq110", type: "flashcard", prompt: "„Hány részletben fizetnek?”", backText: "¿En cuántas pagas?", phonetic: "En kuántasz págasz" },
    { id: "sq111", type: "multiple_choice", prompt: "Miért fontos rákérdezni?", options: [{ id: "o1", text: "Mert ugyanaz az éves bér havi szinten egészen mást jelent" }, { id: "o2", text: "Mert több pénzt jelent" }, { id: "o3", text: "Csak formalitás" }], correctOptionId: "o1" } ] },
  { id: "sl38", title: "A szerződés", description: "indefinido vagy temporal.", chapter: 8, xpReward: 10, questions: [
    { id: "sq112", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "határozatlan idejű", right: "indefinido" }, { id: "p2", left: "határozott idejű", right: "temporal" }, { id: "p3", left: "próbaidő", right: "el periodo de prueba" }] },
    { id: "sq113", type: "flashcard", prompt: "Ágazati kollektív szerződés", backText: "el convenio colectivo", phonetic: "el konbénio kolektíbo" },
    { id: "sq114", type: "multiple_choice", prompt: "Miért fontos a convenio?", options: [{ id: "o1", text: "Mert a béredről és a szabadságodról sokszor jobbat ír elő, mint a törvény" }, { id: "o2", text: "Mert csak nagy cégeknél van" }, { id: "o3", text: "Mert az adót szabályozza" }], correctOptionId: "o1" } ] },
  { id: "sl39", title: "A nómina", description: "A bérpapír olvasása.", chapter: 8, xpReward: 10, questions: [
    { id: "sq115", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "bruttó", right: "el bruto" }, { id: "p2", left: "nettó", right: "el neto" }, { id: "p3", left: "levonás", right: "la deducción" }] },
    { id: "sq116", type: "flashcard", prompt: "Adóelőleg a bérpapíron", backText: "la retención (IRPF)", phonetic: "la retenszjón" },
    { id: "sq117", type: "multiple_choice", prompt: "Mi a „nómina”?", options: [{ id: "o1", text: "A havi bérpapír / bérjegyzék" }, { id: "o2", text: "A munkaszerződés" }, { id: "o3", text: "A munkaidő-nyilvántartás" }], correctOptionId: "o1" } ] },
  { id: "sl40", title: "Munkaidő & szabadság", description: "horario, vacaciones, baja.", chapter: 8, xpReward: 10, questions: [
    { id: "sq118", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "munkaidő-beosztás", right: "el horario" }, { id: "p2", left: "szabadság", right: "las vacaciones" }, { id: "p3", left: "táppénz / betegszabadság", right: "la baja" }] },
    { id: "sq119", type: "flashcard", prompt: "„Szabadságot szeretnék kérni”", backText: "Quiero pedir vacaciones", phonetic: "Kiéro pedír bakaszjónesz" },
    { id: "sq120", type: "multiple_choice", prompt: "Mennyi a törvényi minimum szabadság?", options: [{ id: "o1", text: "Évi 30 NAPTÁRI nap (kb. 22 munkanap)" }, { id: "o2", text: "Évi 20 munkanap" }, { id: "o3", text: "Évi 25 naptári nap" }], correctOptionId: "o1" } ] },

  // ══ 9. Fejezet: Lakhatás ═════════════════════════════
  { id: "sl41", title: "Lakáskeresés", description: "piso, alquiler, habitación.", chapter: 9, xpReward: 10, questions: [
    { id: "sq121", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "lakás", right: "el piso" }, { id: "p2", left: "bérlés / bérleti díj", right: "el alquiler" }, { id: "p3", left: "szoba", right: "la habitación" }] },
    { id: "sq122", type: "flashcard", prompt: "„Lakást keresek”", backText: "Busco piso", phonetic: "Búszko pískó" },
    { id: "sq123", type: "multiple_choice", prompt: "Mit jelent „amueblado”?", options: [{ id: "o1", text: "bútorozott" }, { id: "o2", text: "felújított" }, { id: "o3", text: "földszinti" }], correctOptionId: "o1" } ] },
  { id: "sl42", title: "⚠️ A szerződés típusa", description: "vivienda vagy temporada.", chapter: 9, xpReward: 10, questions: [
    { id: "sq124", type: "multiple_choice", prompt: "Melyik szerződés véd a bérlővédelmi törvénnyel?", options: [{ id: "o1", text: "Arrendamiento de vivienda habitual" }, { id: "o2", text: "Arrendamiento de temporada" }, { id: "o3", text: "Mindkettő ugyanúgy" }], correctOptionId: "o1" },
    { id: "sq125", type: "flashcard", prompt: "„Ez lakhatási bérlet?”", backText: "¿Es un contrato de vivienda habitual?", phonetic: "Esz un kontráto de bibjénda" },
    { id: "sq126", type: "multiple_choice", prompt: "Miért veszélyes a „temporada”?", options: [{ id: "o1", text: "Mert kikerüli a bérlővédelmet, pedig ugyanúgy ott laksz" }, { id: "o2", text: "Mert drágább" }, { id: "o3", text: "Mert nem lehet felmondani" }], correctOptionId: "o1" } ] },
  { id: "sl43", title: "Kaució & költségek", description: "fianza, comunidad, IBI.", chapter: 9, xpReward: 10, questions: [
    { id: "sq127", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "kaució", right: "la fianza" }, { id: "p2", left: "közös költség", right: "la comunidad" }, { id: "p3", left: "ingatlanadó", right: "el IBI" }] },
    { id: "sq128", type: "flashcard", prompt: "„Mennyi a kaució?”", backText: "¿Cuánto es la fianza?", phonetic: "Kuánto esz la fjánsza" },
    { id: "sq129", type: "multiple_choice", prompt: "Mennyi a törvényi fianza lakásbérletnél?", options: [{ id: "o1", text: "Egy havi bérleti díj" }, { id: "o2", text: "Három havi" }, { id: "o3", text: "Öt heti" }], correctOptionId: "o1" } ] },
  { id: "sl44", title: "A lakásban", description: "cocina, baño, salón.", chapter: 9, xpReward: 10, questions: [
    { id: "sq130", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "konyha", right: "la cocina" }, { id: "p2", left: "fürdőszoba", right: "el baño" }, { id: "p3", left: "nappali", right: "el salón" }] },
    { id: "sq131", type: "flashcard", prompt: "Hálószoba, erkély", backText: "el dormitorio, el balcón", phonetic: "dormitório, balkón" },
    { id: "sq132", type: "multiple_choice", prompt: "Mit jelent „exterior” a hirdetésben?", options: [{ id: "o1", text: "Az ablakok az utcára néznek (nem belső udvarra)" }, { id: "o2", text: "Kertes ház" }, { id: "o3", text: "Külvárosi" }], correctOptionId: "o1" } ] },
  { id: "sl45", title: "Rezsi & hibák", description: "luz, agua, gas, avería.", chapter: 9, xpReward: 10, questions: [
    { id: "sq133", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "áram", right: "la luz" }, { id: "p2", left: "víz", right: "el agua" }, { id: "p3", left: "gáz", right: "el gas" }] },
    { id: "sq134", type: "flashcard", prompt: "„Elromlott a fűtés”", backText: "La calefacción está averiada", phonetic: "La kalefakszjón esztá aberiáda" },
    { id: "sq135", type: "multiple_choice", prompt: "„Csöpög a csap”", options: [{ id: "o1", text: "El grifo gotea" }, { id: "o2", text: "La puerta no cierra" }, { id: "o3", text: "No hay luz" }], correctOptionId: "o1" } ] },

  // ══ 10. Fejezet: Egészségügy ═════════════════════════
  { id: "sl46", title: "Centro de salud", description: "A háziorvosi rendelő.", chapter: 10, xpReward: 10, questions: [
    { id: "sq136", type: "multiple_choice", prompt: "Hova mész elsőként, ha beteg vagy?", options: [{ id: "o1", text: "Al centro de salud (a körzeti rendelőbe)" }, { id: "o2", text: "Egyenesen a kórházba" }, { id: "o3", text: "A gyógyszertárba" }], correctOptionId: "o1" },
    { id: "sq137", type: "flashcard", prompt: "Háziorvos", backText: "el médico de cabecera", phonetic: "médiko de kabeszéra" },
    { id: "sq138", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "egészségügyi kártya", right: "la tarjeta sanitaria" }, { id: "p2", left: "beutaló", right: "el volante" }, { id: "p3", left: "szakorvos", right: "el especialista" }] } ] },
  { id: "sl47", title: "Időpontkérés orvoshoz", description: "Pedir cita con el médico.", chapter: 10, xpReward: 10, questions: [
    { id: "sq139", type: "multiple_choice", prompt: "„Időpontot kérnék az orvoshoz”", options: [{ id: "o1", text: "Quiero pedir cita con el médico" }, { id: "o2", text: "Quiero comprar medicina" }, { id: "o3", text: "Quiero cambiar de médico" }], correctOptionId: "o1" },
    { id: "sq140", type: "flashcard", prompt: "„Sürgős”", backText: "Es urgente", phonetic: "Esz urhénte" },
    { id: "sq141", type: "multiple_choice", prompt: "Mit jelent „¿Tiene tarjeta sanitaria?”", options: [{ id: "o1", text: "Van egészségügyi kártyája?" }, { id: "o2", text: "Van bankkártyája?" }, { id: "o3", text: "Van beutalója?" }], correctOptionId: "o1" } ] },
  { id: "sl48", title: "Panaszok", description: "Me duele…", chapter: 10, xpReward: 10, questions: [
    { id: "sq142", type: "flashcard", prompt: "„Fáj a …”", backText: "Me duele…", phonetic: "Me duéle" },
    { id: "sq143", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "fej", right: "la cabeza" }, { id: "p2", left: "torok", right: "la garganta" }, { id: "p3", left: "has", right: "la barriga" }] },
    { id: "sq144", type: "multiple_choice", prompt: "„Lázam van”", options: [{ id: "o1", text: "Tengo fiebre" }, { id: "o2", text: "Tengo hambre" }, { id: "o3", text: "Tengo frío" }], correctOptionId: "o1" } ] },
  { id: "sl49", title: "Gyógyszertár", description: "receta, pastilla, jarabe.", chapter: 10, xpReward: 10, questions: [
    { id: "sq145", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "recept", right: "la receta" }, { id: "p2", left: "tabletta", right: "la pastilla" }, { id: "p3", left: "szirup", right: "el jarabe" }] },
    { id: "sq146", type: "flashcard", prompt: "„Kell hozzá recept?”", backText: "¿Necesito receta?", phonetic: "Neszeszíto reszéta" },
    { id: "sq147", type: "multiple_choice", prompt: "Mit jelent „farmacia de guardia”?", options: [{ id: "o1", text: "Ügyeletes gyógyszertár (éjjel-nappal nyitva)" }, { id: "o2", text: "Kórházi gyógyszertár" }, { id: "o3", text: "Állatgyógyszertár" }], correctOptionId: "o1" } ] },
  { id: "sl50", title: "Vészhelyzet", description: "112, urgencias, ambulancia.", chapter: 10, xpReward: 10, questions: [
    { id: "sq148", type: "multiple_choice", prompt: "Mi az egységes segélyhívó szám?", options: [{ id: "o1", text: "112" }, { id: "o2", text: "911" }, { id: "o3", text: "999" }], correctOptionId: "o1" },
    { id: "sq149", type: "flashcard", prompt: "„Hívjanak mentőt!”", backText: "¡Llamen a una ambulancia!", phonetic: "Jámen a una ambulánszja" },
    { id: "sq150", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "sürgősségi osztály", right: "urgencias" }, { id: "p2", left: "baleset", right: "el accidente" }, { id: "p3", left: "segítség!", right: "¡Socorro!" }] } ] },

  // ══ 11. Fejezet: Közlekedés ══════════════════════════
  { id: "sl51", title: "Metró & busz", description: "metro, autobús, parada.", chapter: 11, xpReward: 10, questions: [
    { id: "sq151", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "metró", right: "el metro" }, { id: "p2", left: "busz", right: "el autobús" }, { id: "p3", left: "megálló", right: "la parada" }] },
    { id: "sq152", type: "flashcard", prompt: "„Hol a legközelebbi metrómegálló?”", backText: "¿Dónde está el metro más cercano?", phonetic: "Dónde esztá el métro" },
    { id: "sq153", type: "multiple_choice", prompt: "Mit jelent „transbordo”?", options: [{ id: "o1", text: "átszállás" }, { id: "o2", text: "végállomás" }, { id: "o3", text: "jegyellenőrzés" }], correctOptionId: "o1" } ] },
  { id: "sl52", title: "Jegyek & bérlet", description: "billete, abono, recargar.", chapter: 11, xpReward: 10, questions: [
    { id: "sq154", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "egyszeri jegy", right: "el billete sencillo" }, { id: "p2", left: "bérlet", right: "el abono" }, { id: "p3", left: "feltölteni", right: "recargar" }] },
    { id: "sq155", type: "flashcard", prompt: "„Havi bérletet kérek”", backText: "Quiero un abono mensual", phonetic: "Kiéro un abóno menszuál" },
    { id: "sq156", type: "multiple_choice", prompt: "⚠️ Mi az „abono joven”?", options: [{ id: "o1", text: "26 év alattiak kedvezményes bérlete — Madridban az egész közösségre" }, { id: "o2", text: "Diákigazolvány" }, { id: "o3", text: "Turistajegy" }], correctOptionId: "o1" } ] },
  { id: "sl53", title: "Vonat", description: "Renfe, Cercanías, AVE.", chapter: 11, xpReward: 10, questions: [
    { id: "sq157", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "elővárosi vonat", right: "Cercanías" }, { id: "p2", left: "nagysebességű vonat", right: "AVE" }, { id: "p3", left: "pályaudvar", right: "la estación" }] },
    { id: "sq158", type: "flashcard", prompt: "„Egy jegyet Madridba, kérem”", backText: "Un billete para Madrid, por favor", phonetic: "Un bijéte pára Madríd" },
    { id: "sq159", type: "multiple_choice", prompt: "Mit jelent „ida y vuelta”?", options: [{ id: "o1", text: "oda-vissza" }, { id: "o2", text: "csak oda" }, { id: "o3", text: "első osztály" }], correctOptionId: "o1" } ] },
  { id: "sl54", title: "Autó & DGT", description: "carnet, ITV, multa.", chapter: 11, xpReward: 10, questions: [
    { id: "sq160", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "jogosítvány", right: "el carnet de conducir" }, { id: "p2", left: "műszaki vizsga", right: "la ITV" }, { id: "p3", left: "bírság", right: "la multa" }] },
    { id: "sq161", type: "flashcard", prompt: "Benzin, gázolaj", backText: "gasolina, gasóleo (diésel)", phonetic: "gaszolína, gaszóleo" },
    { id: "sq162", type: "multiple_choice", prompt: "Mi a DGT?", options: [{ id: "o1", text: "A közlekedési hatóság" }, { id: "o2", text: "Az adóhivatal" }, { id: "o3", text: "A vasúttársaság" }], correctOptionId: "o1" } ] },
  { id: "sl55", title: "Taxi & reptér", description: "aeropuerto, maleta, vuelo.", chapter: 11, xpReward: 10, questions: [
    { id: "sq163", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "repülőtér", right: "el aeropuerto" }, { id: "p2", left: "bőrönd", right: "la maleta" }, { id: "p3", left: "járat", right: "el vuelo" }] },
    { id: "sq164", type: "flashcard", prompt: "„A repülőtérre, kérem”", backText: "Al aeropuerto, por favor", phonetic: "Al aeropuérto" },
    { id: "sq165", type: "multiple_choice", prompt: "Mit jelent „la salida”?", options: [{ id: "o1", text: "kijárat / indulás" }, { id: "o2", text: "érkezés" }, { id: "o3", text: "beszállókapu" }], correctOptionId: "o1" } ] },

  // ══ 12. Fejezet: Város & tájékozódás ═════════════════
  { id: "sl56", title: "Merre van?", description: "¿Dónde está…?", chapter: 12, xpReward: 10, questions: [
    { id: "sq166", type: "flashcard", prompt: "„Hol van …?”", backText: "¿Dónde está…?", phonetic: "Dónde esztá" },
    { id: "sq167", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "jobbra", right: "a la derecha" }, { id: "p2", left: "balra", right: "a la izquierda" }, { id: "p3", left: "egyenesen", right: "todo recto" }] },
    { id: "sq168", type: "multiple_choice", prompt: "Mit jelent „está cerca”?", options: [{ id: "o1", text: "közel van" }, { id: "o2", text: "zárva van" }, { id: "o3", text: "messze van" }], correctOptionId: "o1" } ] },
  { id: "sl57", title: "Helyek a városban", description: "plaza, calle, esquina.", chapter: 12, xpReward: 10, questions: [
    { id: "sq169", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "tér", right: "la plaza" }, { id: "p2", left: "utca", right: "la calle" }, { id: "p3", left: "sarok", right: "la esquina" }] },
    { id: "sq170", type: "flashcard", prompt: "Sugárút, körút", backText: "la avenida, el paseo", phonetic: "abenída, paszéo" },
    { id: "sq171", type: "multiple_choice", prompt: "Mit rövidít a „C/” a címekben?", options: [{ id: "o1", text: "Calle (utca)" }, { id: "o2", text: "Centro (központ)" }, { id: "o3", text: "Ciudad (város)" }], correctOptionId: "o1" } ] },
  { id: "sl58", title: "Középületek", description: "banco, correos, comisaría.", chapter: 12, xpReward: 10, questions: [
    { id: "sq172", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "bank", right: "el banco" }, { id: "p2", left: "posta", right: "correos" }, { id: "p3", left: "rendőrőrs", right: "la comisaría" }] },
    { id: "sq173", type: "flashcard", prompt: "Könyvtár, iskola", backText: "la biblioteca, el colegio", phonetic: "bibliotéka, kolého" },
    { id: "sq174", type: "multiple_choice", prompt: "⚠️ Mit jelent „la librería”?", options: [{ id: "o1", text: "Könyvesbolt — NEM könyvtár!" }, { id: "o2", text: "Könyvtár" }, { id: "o3", text: "Papírbolt" }], correctOptionId: "o1" } ] },
  { id: "sl59", title: "Nyitvatartás", description: "abierto, cerrado, horario.", chapter: 12, xpReward: 10, questions: [
    { id: "sq175", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "nyitva", right: "abierto" }, { id: "p2", left: "zárva", right: "cerrado" }, { id: "p3", left: "nyitvatartás", right: "el horario" }] },
    { id: "sq176", type: "flashcard", prompt: "„Hánykor nyitnak?”", backText: "¿A qué hora abren?", phonetic: "A ké óra ábren" },
    { id: "sq177", type: "multiple_choice", prompt: "Mit jelent „festivo”?", options: [{ id: "o1", text: "munkaszüneti nap / ünnepnap" }, { id: "o2", text: "hétvége" }, { id: "o3", text: "nyári szünet" }], correctOptionId: "o1" } ] },
  { id: "sl60", title: "Időjárás", description: "hace calor, llueve.", chapter: 12, xpReward: 10, questions: [
    { id: "sq178", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "meleg van", right: "hace calor" }, { id: "p2", left: "hideg van", right: "hace frío" }, { id: "p3", left: "esik az eső", right: "llueve" }] },
    { id: "sq179", type: "flashcard", prompt: "„Milyen az idő?”", backText: "¿Qué tiempo hace?", phonetic: "Ké tjémpo áesze" },
    { id: "sq180", type: "multiple_choice", prompt: "Mit jelent „hace sol”?", options: [{ id: "o1", text: "süt a nap" }, { id: "o2", text: "fúj a szél" }, { id: "o3", text: "felhős" }], correctOptionId: "o1" } ] },

  // ══ 13. Fejezet: Étel & bolt ═════════════════════════
  { id: "sl61", title: "Alapélelmiszerek", description: "pan, leche, huevos.", chapter: 13, xpReward: 10, questions: [
    { id: "sq181", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "kenyér", right: "el pan" }, { id: "p2", left: "tej", right: "la leche" }, { id: "p3", left: "tojás", right: "los huevos" }] },
    { id: "sq182", type: "flashcard", prompt: "Sajt, vaj", backText: "el queso, la mantequilla", phonetic: "készo, mantekíja" },
    { id: "sq183", type: "multiple_choice", prompt: "Mit jelent „el aceite de oliva”?", options: [{ id: "o1", text: "olívaolaj" }, { id: "o2", text: "ecet" }, { id: "o3", text: "olajbogyó" }], correctOptionId: "o1" } ] },
  { id: "sl62", title: "Hús & hal", description: "carne, pollo, pescado.", chapter: 13, xpReward: 10, questions: [
    { id: "sq184", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "hús", right: "la carne" }, { id: "p2", left: "csirke", right: "el pollo" }, { id: "p3", left: "hal", right: "el pescado" }] },
    { id: "sq185", type: "flashcard", prompt: "Sertés, marha", backText: "el cerdo, la ternera", phonetic: "szérdo, ternéra" },
    { id: "sq186", type: "multiple_choice", prompt: "Mit jelent „mariscos”?", options: [{ id: "o1", text: "tenger gyümölcsei" }, { id: "o2", text: "füstölt hús" }, { id: "o3", text: "darált hús" }], correctOptionId: "o1" } ] },
  { id: "sl63", title: "Zöldség & gyümölcs", description: "verdura, fruta.", chapter: 13, xpReward: 10, questions: [
    { id: "sq187", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "paradicsom", right: "el tomate" }, { id: "p2", left: "hagyma", right: "la cebolla" }, { id: "p3", left: "burgonya", right: "la patata" }] },
    { id: "sq188", type: "flashcard", prompt: "Alma, narancs", backText: "la manzana, la naranja", phonetic: "manszána, naránha" },
    { id: "sq189", type: "multiple_choice", prompt: "Mit jelent „el ajo”?", options: [{ id: "o1", text: "fokhagyma" }, { id: "o2", text: "saláta" }, { id: "o3", text: "bors" }], correctOptionId: "o1" } ] },
  { id: "sl64", title: "Főzés", description: "cocinar, freír, hervir.", chapter: 13, xpReward: 10, questions: [
    { id: "sq190", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "főzni", right: "cocinar" }, { id: "p2", left: "sütni (olajban)", right: "freír" }, { id: "p3", left: "forralni", right: "hervir" }] },
    { id: "sq191", type: "flashcard", prompt: "Só, bors, cukor", backText: "la sal, la pimienta, el azúcar", phonetic: "szal, pimjénta, aszúkar" },
    { id: "sq192", type: "multiple_choice", prompt: "Mit jelent „al horno”?", options: [{ id: "o1", text: "sütőben sült" }, { id: "o2", text: "grillezett" }, { id: "o3", text: "nyers" }], correctOptionId: "o1" } ] },
  { id: "sl65", title: "Ízek & étrend", description: "dulce, salado, vegetariano.", chapter: 13, xpReward: 10, questions: [
    { id: "sq193", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "édes", right: "dulce" }, { id: "p2", left: "sós", right: "salado" }, { id: "p3", left: "csípős", right: "picante" }] },
    { id: "sq194", type: "flashcard", prompt: "„Vegetáriánus vagyok”", backText: "Soy vegetariano/a", phonetic: "Szoj behetarjáno" },
    { id: "sq195", type: "multiple_choice", prompt: "Mit jelent „sin gluten”?", options: [{ id: "o1", text: "gluténmentes" }, { id: "o2", text: "cukormentes" }, { id: "o3", text: "laktózmentes" }], correctOptionId: "o1" } ] },

  // ══ 14. Fejezet: Család & emberek ════════════════════
  { id: "sl66", title: "Család", description: "madre, padre, hijo.", chapter: 14, xpReward: 10, questions: [
    { id: "sq196", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "anya", right: "la madre" }, { id: "p2", left: "apa", right: "el padre" }, { id: "p3", left: "gyerek (fiú)", right: "el hijo" }] },
    { id: "sq197", type: "flashcard", prompt: "Testvér (fiú / lány)", backText: "el hermano / la hermana", phonetic: "ermáno / ermána" },
    { id: "sq198", type: "multiple_choice", prompt: "Mit jelent „los padres”?", options: [{ id: "o1", text: "a szülők" }, { id: "o2", text: "a papok" }, { id: "o3", text: "a nagyszülők" }], correctOptionId: "o1" } ] },
  { id: "sl67", title: "Párkapcsolat", description: "pareja, casado, soltero.", chapter: 14, xpReward: 10, questions: [
    { id: "sq199", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "pár / élettárs", right: "la pareja" }, { id: "p2", left: "házas", right: "casado/a" }, { id: "p3", left: "egyedülálló", right: "soltero/a" }] },
    { id: "sq200", type: "flashcard", prompt: "„Két gyerekem van”", backText: "Tengo dos hijos", phonetic: "Téngo dosz íhosz" },
    { id: "sq201", type: "multiple_choice", prompt: "Mit jelent „el novio”?", options: [{ id: "o1", text: "barát (párkapcsolatban) / vőlegény" }, { id: "o2", text: "unokatestvér" }, { id: "o3", text: "szomszéd" }], correctOptionId: "o1" } ] },
  { id: "sl68", title: "Külső & jellem", description: "alto, simpático, amable.", chapter: 14, xpReward: 10, questions: [
    { id: "sq202", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "magas", right: "alto" }, { id: "p2", left: "kedves / szimpatikus", right: "simpático" }, { id: "p3", left: "udvarias, barátságos", right: "amable" }] },
    { id: "sq203", type: "flashcard", prompt: "Fiatal, idős", backText: "joven, mayor", phonetic: "hóben, majór" },
    { id: "sq204", type: "multiple_choice", prompt: "⚠️ Mit jelent „embarazada”?", options: [{ id: "o1", text: "terhes — NEM „zavarban”!" }, { id: "o2", text: "zavarban lévő" }, { id: "o3", text: "fáradt" }], correctOptionId: "o1" } ] },
  { id: "sl69", title: "Érzések", description: "cansado, contento, enfadado.", chapter: 14, xpReward: 10, questions: [
    { id: "sq205", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "fáradt", right: "cansado" }, { id: "p2", left: "elégedett / boldog", right: "contento" }, { id: "p3", left: "mérges", right: "enfadado" }] },
    { id: "sq206", type: "flashcard", prompt: "„Éhes vagyok / szomjas vagyok”", backText: "Tengo hambre / Tengo sed", phonetic: "Téngo ámbre / szed" },
    { id: "sq207", type: "multiple_choice", prompt: "⚠️ Melyik a helyes: „Éhes vagyok”?", options: [{ id: "o1", text: "Tengo hambre — a spanyol „birtokolja” az éhséget" }, { id: "o2", text: "Soy hambre" }, { id: "o3", text: "Estoy hambre" }], correctOptionId: "o1" } ] },
  { id: "sl70", title: "⚠️ Ser vagy estar?", description: "A magyarok klasszikus csapdája.", chapter: 14, xpReward: 10, questions: [
    { id: "sq208", type: "multiple_choice", prompt: "Melyik igét használod ÁLLANDÓ tulajdonságra (pl. magyar vagyok)?", options: [{ id: "o1", text: "ser — Soy húngaro" }, { id: "o2", text: "estar — Estoy húngaro" }, { id: "o3", text: "tener — Tengo húngaro" }], correctOptionId: "o1" },
    { id: "sq209", type: "flashcard", prompt: "Átmeneti állapot (pl. fáradt vagyok)", backText: "estar — Estoy cansado", phonetic: "Esztoj kanszádo" },
    { id: "sq210", type: "match", prompt: "Párosítsd a helyes igével!", pairs: [{ id: "p1", left: "Orvos vagyok (foglalkozás)", right: "Soy médico" }, { id: "p2", left: "Madridban vagyok (most)", right: "Estoy en Madrid" }, { id: "p3", left: "Beteg vagyok (most)", right: "Estoy enfermo" }] } ] },

  // ══ 15. Fejezet: Naptár & ünnepek ════════════════════
  { id: "sl71", title: "A hét napjai", description: "lunes, martes, miércoles…", chapter: 15, xpReward: 10, questions: [
    { id: "sq211", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "hétfő", right: "lunes" }, { id: "p2", left: "szerda", right: "miércoles" }, { id: "p3", left: "péntek", right: "viernes" }] },
    { id: "sq212", type: "flashcard", prompt: "Szombat, vasárnap", backText: "sábado, domingo", phonetic: "szábado, domíngo" },
    { id: "sq213", type: "multiple_choice", prompt: "⚠️ Nagybetűvel írjuk a napokat?", options: [{ id: "o1", text: "Nem — a spanyolban kisbetűs" }, { id: "o2", text: "Igen, mindig" }, { id: "o3", text: "Csak mondat elején" }], correctOptionId: "o1" } ] },
  { id: "sl72", title: "Hónapok", description: "enero, febrero, marzo…", chapter: 15, xpReward: 10, questions: [
    { id: "sq214", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "január", right: "enero" }, { id: "p2", left: "május", right: "mayo" }, { id: "p3", left: "december", right: "diciembre" }] },
    { id: "sq215", type: "flashcard", prompt: "Július, augusztus", backText: "julio, agosto", phonetic: "húlio, agószto" },
    { id: "sq216", type: "multiple_choice", prompt: "Mit jelent „el mes que viene”?", options: [{ id: "o1", text: "jövő hónap" }, { id: "o2", text: "múlt hónap" }, { id: "o3", text: "ez a hónap" }], correctOptionId: "o1" } ] },
  { id: "sl73", title: "Dátum", description: "el 5 de mayo de 2026.", chapter: 15, xpReward: 10, questions: [
    { id: "sq217", type: "multiple_choice", prompt: "Hogy mondod: „május 5.”?", options: [{ id: "o1", text: "el cinco de mayo" }, { id: "o2", text: "mayo cinco" }, { id: "o3", text: "el mayo cinco" }], correctOptionId: "o1" },
    { id: "sq218", type: "flashcard", prompt: "„Mikor van a születésnapod?”", backText: "¿Cuándo es tu cumpleaños?", phonetic: "Kumpleányosz" },
    { id: "sq219", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "tegnap", right: "ayer" }, { id: "p2", left: "ma", right: "hoy" }, { id: "p3", left: "holnap", right: "mañana" }] } ] },
  { id: "sl74", title: "Ünnepek", description: "Navidad, Reyes, Semana Santa.", chapter: 15, xpReward: 10, questions: [
    { id: "sq220", type: "multiple_choice", prompt: "⚠️ Mikor kapják a gyerekek hagyományosan az ajándékot?", options: [{ id: "o1", text: "Január 6-án, a Három Királyok (Reyes) hozzák" }, { id: "o2", text: "December 6-án" }, { id: "o3", text: "December 24-én" }], correctOptionId: "o1" },
    { id: "sq221", type: "flashcard", prompt: "Karácsony, húsvét", backText: "la Navidad, la Semana Santa", phonetic: "nabidád, szemána szánta" },
    { id: "sq222", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Boldog karácsonyt!", right: "¡Feliz Navidad!" }, { id: "p2", left: "Boldog új évet!", right: "¡Feliz Año Nuevo!" }, { id: "p3", left: "Boldog szülinapot!", right: "¡Feliz cumpleaños!" }] } ] },
  { id: "sl75", title: "Helyi ünnepek", description: "fiestas, puente.", chapter: 15, xpReward: 10, questions: [
    { id: "sq223", type: "multiple_choice", prompt: "Mit jelent a „puente” a naptárban?", options: [{ id: "o1", text: "Hosszú hétvége — az ünnep és a hétvége közti nap is szabad" }, { id: "o2", text: "Munkanap-áthelyezés" }, { id: "o3", text: "Iskolai szünet" }], correctOptionId: "o1" },
    { id: "sq224", type: "flashcard", prompt: "Helyi városi ünnep", backText: "las fiestas patronales", phonetic: "fjésztasz patronálesz" },
    { id: "sq225", type: "multiple_choice", prompt: "Hány munkaszüneti nap van évente?", options: [{ id: "o1", text: "14 — országos, közösségi és helyi ünnepek keveréke" }, { id: "o2", text: "8" }, { id: "o3", text: "20" }], correctOptionId: "o1" } ] },

  // ══ 16. Fejezet: Pénzügy & bank ══════════════════════
  { id: "sl76", title: "Bankszámla", description: "cuenta, abrir, comisión.", chapter: 16, xpReward: 10, questions: [
    { id: "sq226", type: "multiple_choice", prompt: "„Számlát szeretnék nyitni”", options: [{ id: "o1", text: "Quiero abrir una cuenta" }, { id: "o2", text: "Quiero cerrar una cuenta" }, { id: "o3", text: "Quiero cambiar dinero" }], correctOptionId: "o1" },
    { id: "sq227", type: "flashcard", prompt: "Számladíj / jutalék", backText: "la comisión", phonetic: "la komiszjón" },
    { id: "sq228", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "bankszámlaszám", right: "el IBAN" }, { id: "p2", left: "bankkártya", right: "la tarjeta" }, { id: "p3", left: "átutalás", right: "la transferencia" }] } ] },
  { id: "sl77", title: "⚠️ Havidíj-feltételek", description: "Sok számla csak feltétellel ingyenes.", chapter: 16, xpReward: 10, questions: [
    { id: "sq229", type: "multiple_choice", prompt: "Mit jelent „sin comisiones”?", options: [{ id: "o1", text: "Díjmentes — de nézd meg, milyen feltétellel" }, { id: "o2", text: "Kamatmentes" }, { id: "o3", text: "Hitelkeret nélküli" }], correctOptionId: "o1" },
    { id: "sq230", type: "flashcard", prompt: "„Milyen feltételekkel ingyenes?”", backText: "¿Con qué condiciones es gratis?", phonetic: "Kon ké kondiszjónesz" },
    { id: "sq231", type: "multiple_choice", prompt: "Mi a leggyakoribb feltétel?", options: [{ id: "o1", text: "Rendszeres bérjóváírás (domiciliar la nómina)" }, { id: "o2", text: "Minimum egyenleg 10 000 €" }, { id: "o3", text: "Éves hűségnyilatkozat" }], correctOptionId: "o1" } ] },
  { id: "sl78", title: "Adó & Hacienda", description: "IRPF, la Renta, IVA.", chapter: 16, xpReward: 10, questions: [
    { id: "sq232", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "adóhivatal", right: "Hacienda" }, { id: "p2", left: "személyi jövedelemadó", right: "el IRPF" }, { id: "p3", left: "áfa", right: "el IVA" }] },
    { id: "sq233", type: "flashcard", prompt: "Az éves adóbevallás neve", backText: "la Renta (declaración de la renta)", phonetic: "la rénta" },
    { id: "sq234", type: "multiple_choice", prompt: "⚠️ Miért függ a nettód attól, hol laksz?", options: [{ id: "o1", text: "Mert az IRPF fele az autonóm közösségé" }, { id: "o2", text: "Mert a városok külön adót vetnek ki" }, { id: "o3", text: "Nem függ" }], correctOptionId: "o1" } ] },
  { id: "sl79", title: "Autónomo", description: "Az egyéni vállalkozó.", chapter: 16, xpReward: 10, questions: [
    { id: "sq235", type: "multiple_choice", prompt: "Ki az „autónomo”?", options: [{ id: "o1", text: "Az önfoglalkoztató / egyéni vállalkozó" }, { id: "o2", text: "Az önkormányzati dolgozó" }, { id: "o3", text: "A nyugdíjas" }], correctOptionId: "o1" },
    { id: "sq236", type: "flashcard", prompt: "A havi járulék neve", backText: "la cuota de autónomos", phonetic: "la kuóta" },
    { id: "sq237", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "könyvelő / ügyintéző iroda", right: "la gestoría" }, { id: "p2", left: "számla (kiállított)", right: "la factura" }, { id: "p3", left: "bevétel", right: "los ingresos" }] } ] },
  { id: "sl80", title: "Utalás haza", description: "enviar dinero, cambio.", chapter: 16, xpReward: 10, questions: [
    { id: "sq238", type: "multiple_choice", prompt: "„Pénzt szeretnék utalni Magyarországra”", options: [{ id: "o1", text: "Quiero enviar dinero a Hungría" }, { id: "o2", text: "Quiero sacar dinero" }, { id: "o3", text: "Quiero cambiar dinero" }], correctOptionId: "o1" },
    { id: "sq239", type: "flashcard", prompt: "Árfolyam", backText: "el tipo de cambio", phonetic: "típo de kámbjo" },
    { id: "sq240", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "készpénzfelvétel", right: "sacar dinero" }, { id: "p2", left: "bankautomata", right: "el cajero" }, { id: "p3", left: "egyenleg", right: "el saldo" }] } ] },

  // ══ 17. Fejezet: Iskola & gyerek ═════════════════════
  { id: "sl81", title: "Iskolatípusok", description: "colegio, instituto, guardería.", chapter: 17, xpReward: 10, questions: [
    { id: "sq241", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "bölcsőde / óvoda", right: "la guardería" }, { id: "p2", left: "általános iskola", right: "el colegio" }, { id: "p3", left: "középiskola", right: "el instituto" }] },
    { id: "sq242", type: "flashcard", prompt: "Állami / egyházi-támogatott / magán", backText: "público / concertado / privado", phonetic: "públiko / konszertádo / pribádo" },
    { id: "sq243", type: "multiple_choice", prompt: "Mit jelent „concertado”?", options: [{ id: "o1", text: "Egyházi vagy alapítványi, de államilag támogatott" }, { id: "o2", text: "Teljesen ingyenes állami" }, { id: "o3", text: "Nemzetközi iskola" }], correctOptionId: "o1" } ] },
  { id: "sl82", title: "⚠️ Beiratkozás", description: "La escolarización.", chapter: 17, xpReward: 10, questions: [
    { id: "sq244", type: "multiple_choice", prompt: "Mikor lehet iskolát választani?", options: [{ id: "o1", text: "Egy szűk, évente EGYSZERI tavaszi időszakban" }, { id: "o2", text: "Bármikor a tanév során" }, { id: "o3", text: "Csak szeptemberben" }], correctOptionId: "o1" },
    { id: "sq245", type: "flashcard", prompt: "„Be szeretném íratni a gyerekemet”", backText: "Quiero matricular a mi hijo", phonetic: "Matrikulár a mi ího" },
    { id: "sq246", type: "multiple_choice", prompt: "Mi a felvétel legerősebb szempontja?", options: [{ id: "o1", text: "A lakóhely az iskola körzetében (empadronamiento!)" }, { id: "o2", text: "A gyerek jegyei" }, { id: "o3", text: "A jelentkezés sorrendje" }], correctOptionId: "o1" } ] },
  { id: "sl83", title: "Iskolai szintek", description: "primaria, ESO, bachillerato.", chapter: 17, xpReward: 10, questions: [
    { id: "sq247", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "általános (6–12 év)", right: "primaria" }, { id: "p2", left: "középiskola alsó (12–16)", right: "la ESO" }, { id: "p3", left: "érettségire készítő", right: "el bachillerato" }] },
    { id: "sq248", type: "flashcard", prompt: "Szakképzés", backText: "la Formación Profesional (FP)", phonetic: "formaszjón profeszjonál" },
    { id: "sq249", type: "multiple_choice", prompt: "Meddig tart a tankötelezettség?", options: [{ id: "o1", text: "6-tól 16 éves korig" }, { id: "o2", text: "5-től 18-ig" }, { id: "o3", text: "6-tól 14-ig" }], correctOptionId: "o1" } ] },
  { id: "sl84", title: "Az iskolában", description: "profesor, deberes, notas.", chapter: 17, xpReward: 10, questions: [
    { id: "sq250", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "tanár", right: "el profesor" }, { id: "p2", left: "házi feladat", right: "los deberes" }, { id: "p3", left: "jegyek", right: "las notas" }] },
    { id: "sq251", type: "flashcard", prompt: "Menza, iskolabusz", backText: "el comedor, el autobús escolar", phonetic: "komedór" },
    { id: "sq252", type: "multiple_choice", prompt: "Mit jelent „la tutoría”?", options: [{ id: "o1", text: "Szülői fogadóóra az osztályfőnökkel" }, { id: "o2", text: "Korrepetálás" }, { id: "o3", text: "Napközi" }], correctOptionId: "o1" } ] },
  { id: "sl85", title: "Bizonyítvány & támogatás", description: "homologación, beca.", chapter: 17, xpReward: 10, questions: [
    { id: "sq253", type: "multiple_choice", prompt: "Mi a „homologación”?", options: [{ id: "o1", text: "A külföldi bizonyítvány honosítása" }, { id: "o2", text: "Az érettségi vizsga" }, { id: "o3", text: "A beiratkozás" }], correctOptionId: "o1" },
    { id: "sq254", type: "flashcard", prompt: "Ösztöndíj / támogatás", backText: "la beca", phonetic: "la béka" },
    { id: "sq255", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "menza-támogatás", right: "beca de comedor" }, { id: "p2", left: "tankönyv-támogatás", right: "beca de libros" }, { id: "p3", left: "bizonyítvány", right: "el título" }] } ] },

  // ══ 18. Fejezet: Szolgáltatók & telefon ══════════════
  { id: "sl86", title: "Telefon & internet", description: "móvil, tarifa, fibra.", chapter: 18, xpReward: 10, questions: [
    { id: "sq256", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "mobiltelefon", right: "el móvil" }, { id: "p2", left: "díjcsomag", right: "la tarifa" }, { id: "p3", left: "optikai internet", right: "la fibra" }] },
    { id: "sq257", type: "flashcard", prompt: "„Szeretnék előfizetést kötni”", backText: "Quiero contratar una tarifa", phonetic: "Kontratár una tarífa" },
    { id: "sq258", type: "multiple_choice", prompt: "Mit jelent „permanencia”?", options: [{ id: "o1", text: "Hűségidő — előtte felmondva kötbért fizetsz" }, { id: "o2", text: "Állandó lakcím" }, { id: "o3", text: "Korlátlan adat" }], correctOptionId: "o1" } ] },
  { id: "sl87", title: "Szerződés felmondása", description: "dar de baja.", chapter: 18, xpReward: 10, questions: [
    { id: "sq259", type: "multiple_choice", prompt: "„Fel szeretném mondani a szerződést”", options: [{ id: "o1", text: "Quiero darme de baja" }, { id: "o2", text: "Quiero dar de alta" }, { id: "o3", text: "Quiero cambiar de tarifa" }], correctOptionId: "o1" },
    { id: "sq260", type: "flashcard", prompt: "⚠️ „Kérek igazolást a felmondásról”", backText: "Quiero un justificante de la baja", phonetic: "Husztifikánte" },
    { id: "sq261", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "bejelentés (szolgáltatásé)", right: "el alta" }, { id: "p2", left: "kijelentés", right: "la baja" }, { id: "p3", left: "ügyfélszolgálat", right: "atención al cliente" }] } ] },
  { id: "sl88", title: "Panaszkezelés", description: "reclamación, OMIC.", chapter: 18, xpReward: 10, questions: [
    { id: "sq262", type: "multiple_choice", prompt: "„Panaszt szeretnék tenni”", options: [{ id: "o1", text: "Quiero poner una reclamación" }, { id: "o2", text: "Quiero pedir cita" }, { id: "o3", text: "Quiero pagar la factura" }], correctOptionId: "o1" },
    { id: "sq263", type: "flashcard", prompt: "Fogyasztóvédelmi iroda", backText: "la OMIC (oficina del consumidor)", phonetic: "omík" },
    { id: "sq264", type: "multiple_choice", prompt: "Mit jelent „hoja de reclamaciones”?", options: [{ id: "o1", text: "Hivatalos panaszlap — az üzletnek kötelező adnia" }, { id: "o2", text: "Számla" }, { id: "o3", text: "Garancialevél" }], correctOptionId: "o1" } ] },
  { id: "sl89", title: "Posta & csomag", description: "correos, paquete, envío.", chapter: 18, xpReward: 10, questions: [
    { id: "sq265", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "csomag", right: "el paquete" }, { id: "p2", left: "levél", right: "la carta" }, { id: "p3", left: "bélyeg", right: "el sello" }] },
    { id: "sq266", type: "flashcard", prompt: "Ajánlott küldemény", backText: "carta certificada", phonetic: "kárta szertifikáda" },
    { id: "sq267", type: "multiple_choice", prompt: "Mit jelent „a domicilio”?", options: [{ id: "o1", text: "házhoz szállítva" }, { id: "o2", text: "átvevőponton" }, { id: "o3", text: "utánvéttel" }], correctOptionId: "o1" } ] },
  { id: "sl90", title: "Számlák", description: "factura, domiciliar, recibo.", chapter: 18, xpReward: 10, questions: [
    { id: "sq268", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "számla", right: "la factura" }, { id: "p2", left: "csoportos beszedés", right: "domiciliar" }, { id: "p3", left: "nyugta / terhelés", right: "el recibo" }] },
    { id: "sq269", type: "flashcard", prompt: "„Túl magas a számla”", backText: "La factura es muy alta", phonetic: "La faktúra esz muj álta" },
    { id: "sq270", type: "multiple_choice", prompt: "Mit jelent „recibo devuelto”?", options: [{ id: "o1", text: "Visszautasított terhelés (nem volt fedezet)" }, { id: "o2", text: "Visszatérített összeg" }, { id: "o3", text: "Kifizetett számla" }], correctOptionId: "o1" } ] },

  // ══ 19. Fejezet: Társalgás ═══════════════════════════
  { id: "sl91", title: "⚠️ Tú vagy usted?", description: "Tegezés és magázás.", chapter: 19, xpReward: 10, questions: [
    { id: "sq271", type: "multiple_choice", prompt: "Melyik a magázás?", options: [{ id: "o1", text: "usted" }, { id: "o2", text: "tú" }, { id: "o3", text: "vosotros" }], correctOptionId: "o1" },
    { id: "sq272", type: "flashcard", prompt: "⚠️ Mikor használd az „usted”-et?", backText: "Hivatalban, idősebbeknél, orvosnál — de Spanyolországban a tegezés SOKKAL gyakoribb, mint gondolnád", phonetic: "usztéd" },
    { id: "sq273", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Hogy vagy? (tegezve)", right: "¿Cómo estás?" }, { id: "p2", left: "Hogy van? (magázva)", right: "¿Cómo está?" }, { id: "p3", left: "Ti (több személy)", right: "vosotros" }] } ] },
  { id: "sl92", title: "Small talk", description: "¿Qué tal?, ¿Y tú?", chapter: 19, xpReward: 10, questions: [
    { id: "sq274", type: "multiple_choice", prompt: "Mit jelent „¿Qué tal?”", options: [{ id: "o1", text: "Hogy vagy? / Mi újság?" }, { id: "o2", text: "Mennyi az idő?" }, { id: "o3", text: "Hol laksz?" }], correctOptionId: "o1" },
    { id: "sq275", type: "flashcard", prompt: "„Jól, köszönöm. És te?”", backText: "Bien, gracias. ¿Y tú?", phonetic: "Bjen, grászjasz" },
    { id: "sq276", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Honnan jössz?", right: "¿De dónde eres?" }, { id: "p2", left: "Mivel foglalkozol?", right: "¿A qué te dedicas?" }, { id: "p3", left: "Mióta vagy itt?", right: "¿Cuánto tiempo llevas aquí?" }] } ] },
  { id: "sl93", title: "Egyetértés & vélemény", description: "vale, claro, creo que.", chapter: 19, xpReward: 10, questions: [
    { id: "sq277", type: "multiple_choice", prompt: "Mit jelent a mindenütt hallható „vale”?", options: [{ id: "o1", text: "Rendben / oké" }, { id: "o2", text: "Viszlát" }, { id: "o3", text: "Talán" }], correctOptionId: "o1" },
    { id: "sq278", type: "flashcard", prompt: "„Szerintem…”", backText: "Creo que…", phonetic: "Kréo ke" },
    { id: "sq279", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Persze / világos", right: "Claro" }, { id: "p2", left: "Egyetértek", right: "Estoy de acuerdo" }, { id: "p3", left: "Nem értek egyet", right: "No estoy de acuerdo" }] } ] },
  { id: "sl94", title: "Meghívás & találkozó", description: "quedar, invitar.", chapter: 19, xpReward: 10, questions: [
    { id: "sq280", type: "multiple_choice", prompt: "Mit jelent „¿Quedamos mañana?”", options: [{ id: "o1", text: "Találkozunk holnap?" }, { id: "o2", text: "Maradunk holnap?" }, { id: "o3", text: "Fizetünk holnap?" }], correctOptionId: "o1" },
    { id: "sq281", type: "flashcard", prompt: "„Meghívlak egy kávéra”", backText: "Te invito a un café", phonetic: "Te inbíto a un kafé" },
    { id: "sq282", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Szívesen!", right: "¡Con mucho gusto!" }, { id: "p2", left: "Sajnos nem tudok", right: "Lo siento, no puedo" }, { id: "p3", left: "Talán legközelebb", right: "Quizá otro día" }] } ] },
  { id: "sl95", title: "Hétköznapi szleng", description: "tío, guay, majo.", chapter: 19, xpReward: 10, questions: [
    { id: "sq283", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "haver / öreg (megszólítás)", right: "tío / tía" }, { id: "p2", left: "menő, klassz", right: "guay" }, { id: "p3", left: "kedves, rendes (emberre)", right: "majo" }] },
    { id: "sq284", type: "flashcard", prompt: "„Nincs gáz / semmi baj”", backText: "No pasa nada", phonetic: "No pásza náda" },
    { id: "sq285", type: "multiple_choice", prompt: "Mit jelent „¡Qué va!”?", options: [{ id: "o1", text: "Á, dehogy! / Szó sincs róla!" }, { id: "o2", text: "Menjünk!" }, { id: "o3", text: "Mennyi?" }], correctOptionId: "o1" } ] },

  // ══ 20. Fejezet: Túlélő mondatok ═════════════════════
  { id: "sl96", title: "Nem értem", description: "No entiendo.", chapter: 20, xpReward: 10, questions: [
    { id: "sq286", type: "multiple_choice", prompt: "„Nem értem”", options: [{ id: "o1", text: "No entiendo" }, { id: "o2", text: "No quiero" }, { id: "o3", text: "No tengo" }], correctOptionId: "o1" },
    { id: "sq287", type: "flashcard", prompt: "„Beszél angolul?”", backText: "¿Habla inglés?", phonetic: "Ábla inglész" },
    { id: "sq288", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Lassabban, kérem", right: "Más despacio, por favor" }, { id: "p2", left: "Le tudná írni?", right: "¿Puede escribirlo?" }, { id: "p3", left: "Hogy mondják spanyolul…?", right: "¿Cómo se dice en español…?" }] } ] },
  { id: "sl97", title: "Segítségkérés", description: "¿Me puede ayudar?", chapter: 20, xpReward: 10, questions: [
    { id: "sq289", type: "multiple_choice", prompt: "„Tudna segíteni?”", options: [{ id: "o1", text: "¿Me puede ayudar?" }, { id: "o2", text: "¿Me puede vender?" }, { id: "o3", text: "¿Me puede llamar?" }], correctOptionId: "o1" },
    { id: "sq290", type: "flashcard", prompt: "„Eltévedtem”", backText: "Me he perdido", phonetic: "Me e perdído" },
    { id: "sq291", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Elvesztettem a …-t", right: "He perdido mi…" }, { id: "p2", left: "Elloptak tőlem…", right: "Me han robado…" }, { id: "p3", left: "Feljelentést tennék", right: "Quiero poner una denuncia" }] } ] },
  { id: "sl98", title: "Fontos kérdések", description: "¿Hay…? ¿Puedo…?", chapter: 20, xpReward: 10, questions: [
    { id: "sq292", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Van itt …?", right: "¿Hay…?" }, { id: "p2", left: "Lehet …?", right: "¿Puedo…?" }, { id: "p3", left: "Kell …?", right: "¿Hace falta…?" }] },
    { id: "sq293", type: "flashcard", prompt: "„Hol van a mosdó?”", backText: "¿Dónde está el baño?", phonetic: "Dónde esztá el bányo" },
    { id: "sq294", type: "multiple_choice", prompt: "„Van ingyenes wifi?”", options: [{ id: "o1", text: "¿Hay wifi gratis?" }, { id: "o2", text: "¿Hay agua fría?" }, { id: "o3", text: "¿Hay descuento?" }], correctOptionId: "o1" } ] },
  { id: "sl99", title: "Udvarias visszautasítás", description: "No, gracias.", chapter: 20, xpReward: 10, questions: [
    { id: "sq295", type: "multiple_choice", prompt: "Hogy utasítasz vissza udvariasan valamit?", options: [{ id: "o1", text: "No, gracias" }, { id: "o2", text: "No hay" }, { id: "o3", text: "No sé" }], correctOptionId: "o1" },
    { id: "sq296", type: "flashcard", prompt: "„Meggondolom”", backText: "Me lo pienso", phonetic: "Me lo pjénszo" },
    { id: "sq297", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Most nem, köszönöm", right: "Ahora no, gracias" }, { id: "p2", left: "Nem érdekel, köszönöm", right: "No me interesa, gracias" }, { id: "p3", left: "Nem tudom", right: "No lo sé" }] } ] },
  { id: "sl100", title: "Az első hét mondatai", description: "Amit tényleg használni fogsz.", chapter: 20, xpReward: 10, questions: [
    { id: "sq298", type: "match", prompt: "Párosítsd a leggyakoribb mondatokat!", pairs: [{ id: "p1", left: "Most költöztem ide", right: "Acabo de mudarme aquí" }, { id: "p2", left: "Tanulok spanyolul", right: "Estoy aprendiendo español" }, { id: "p3", left: "Magyarországról jöttem", right: "Vengo de Hungría" }] },
    { id: "sq299", type: "flashcard", prompt: "⚠️ A legfontosabb hivatali mondat", backText: "Quiero pedir cita previa", phonetic: "Kiéro pedír szíta prébia" },
    { id: "sq300", type: "multiple_choice", prompt: "Mit mondj, ha nem tudod a szót?", options: [{ id: "o1", text: "¿Cómo se dice…? — így tanulsz a legtöbbet" }, { id: "o2", text: "Semmit, inkább hallgass" }, { id: "o3", text: "Beszélj magyarul" }], correctOptionId: "o1" } ] },
];
