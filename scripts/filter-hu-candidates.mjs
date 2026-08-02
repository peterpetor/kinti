/**
 * filter-hu-candidates.mjs — a Maps-felderítés zajából a VALÓDI magyar jel kiemelése.
 *
 * ⚠️ MIÉRT KELL: a „hungarian hairdresser Madrid" lekérdezés Madrid ÖSSZES
 * fodrászát visszaadja, nem csak a magyarokat. 1200+ jelöltből a többség zaj.
 *
 * ⚠️ A SZŰRŐ SZIGORÚ, mert a hamis pozitív KÖLTSÉGESEBB, mint a kihagyás:
 * egy nem-magyar cég a szaknévsorban aláássa a termék egyetlen ígéretét.
 *
 * ⚠️ ANGOL NYELVŰ CSAPDA: a „Kiss" gyakori magyar vezetéknév, DE angolul
 * köznév is („Kiss Hair Salon" szójáték). Ezért a vezetéknév-jel ÖNMAGÁBAN
 * GB-ben nem elég — kell mellé egy második jel.
 */
import { readFileSync, writeFileSync } from "node:fs";

const rows = JSON.parse(readFileSync(process.argv[2], "utf8"));

/** Egyértelmű magyar jelek — ezek önmagukban elegendők. */
const ERŐS = [
  /\bmagyar\b/i, /\bhungar/i, /\bhúngar/i, /\bhungria\b/i, /\bungarisch/i,
  /\bbudapest\b/i, /\bpuszta\b/i, /\bcsárda\b/i, /\bcsarda\b/i,
  /l[áa]ngos/i, /\bgulyás\b/i, /\bkürtős/i, /\bkurtos/i, /\bpalacsinta\b/i,
  /\bpaprika\b/i, /\bpálinka\b/i, /\bhortobágy/i, /\btokaji?\b/i,
];

/**
 * Magyar vezetéknevek. ⚠️ Csak MÁSODIK jelként számítanak (ld. „Kiss" csapda),
 * kivéve a nagyon ritka, egyértelműen magyar alakokat.
 */
const VEZETEKNEV = /\b(nagy|kovács|kovacs|szabó|szabo|tóth|toth|horváth|horvath|varga|kiss|molnár|molnar|németh|nemeth|farkas|balogh|papp|lakatos|juhász|juhasz|mészáros|meszaros|oláh|olah|simon|rácz|racz|fekete|szűcs|szucs|török|torok|fehér|feher)\b/i;

/** Magyar keresztnevek — ezek erősebb jelek, mert idegen nyelvben ritkák. */
const KERESZTNEV = /\b(zoltán|zoltan|attila|csaba|lászló|laszlo|gábor|gabor|tamás|tamas|zsolt|szilvia|katalin|erzsébet|erzsebet|ildikó|ildiko|zsuzsanna|krisztina|bence|levente|árpád|arpad|béla|bela|gyula|imre|jános|janos|józsef|jozsef|ferenc|sándor|sandor|istván|istvan|andrás|andras|péter|peter|szabolcs|norbert|dénes|denes|kinga|emese|réka|reka|orsolya|bettina|nikolett)\b/i;

/** Magyar helyesírás-jelek: ő/ű SEHOL máshol nem fordul elő. */
const MAGYAR_BETU = /[őűŐŰ]/;

const out = [];
for (const r of rows) {
  const szoveg = `${r.nev} ${r.kartya || ""}`;
  const jelek = [];
  if (ERŐS.some((re) => re.test(szoveg))) jelek.push("erős");
  if (MAGYAR_BETU.test(szoveg)) jelek.push("ő/ű");
  if (KERESZTNEV.test(szoveg)) jelek.push("keresztnév");
  if (VEZETEKNEV.test(szoveg)) jelek.push("vezetéknév");

  // Elfogadás: erős jel ÖNMAGÁBAN, vagy legalább KÉT gyengébb jel.
  const erős = jelek.includes("erős") || jelek.includes("ő/ű");
  const elfogad = erős || jelek.length >= 2;
  if (elfogad) out.push({ ...r, jelek });
}

out.sort((a, b) => b.jelek.length - a.jelek.length);
writeFileSync(process.argv[3] || "hu-candidates.json", JSON.stringify(out, null, 1), "utf8");
console.log(`${rows.length} jelöltből ${out.length} maradt magyar jellel\n`);
for (const x of out.slice(0, 60)) {
  console.log(`[${x.country}/${x.category}] ${x.nev.slice(0, 56).padEnd(58)} ${x.jelek.join("+")}`);
}
