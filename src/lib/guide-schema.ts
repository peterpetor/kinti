/**
 * guide-schema.ts — strukturált adat (JSON-LD) a tudásbázis-cikkekhez, AEO-hoz.
 *
 * ⚠️ MINDEN SÉMA MEGLÉVŐ, KURÁLT TARTALOMBÓL ÉPÜL. Nem generálunk kérdést egy
 * válaszból, és nem következtetünk hiányzó mezőt. Ha egy cikkhez nincs valódi
 * kérdés-válasz pár vagy teendőlista, akkor `null`-t adunk — üres/kitalált
 * sémát kiadni rosszabb, mint semmit (a keresők a hamis strukturált adatot
 * bünteti, az olvasó pedig félreinformálódik).
 *
 * ⚠️ MIÉRT NINCS `GovernmentService`?
 * Az a séma azt jelenti: „ezt a szolgáltatást EZ a szervezet nyújtja". A Kinti
 * nem hatóság — a cikkeink LEÍRJÁK a hivatali eljárásokat, de nem mi végezzük
 * őket. `GovernmentService`-ként jelölni az oldalainkat azt sugallná, hogy mi
 * vagyunk a hivatal. Helyette a cikk hivatalos forrásai `citation`-ként
 * kerülnek be — ez igaz, és a válaszgépeknek is ezt kell látniuk.
 *
 * ⚠️ A RICH RESULT ÉS AZ AEO KÉT KÜLÖN DOLOG. A Google 2023-ban a FAQPage
 * kiemelt találatot hiteles KORMÁNYZATI és EGÉSZSÉGÜGYI oldalakra korlátozta,
 * a HowTo kiemelt találatot pedig megszüntette. Ez a modul tehát NEM attól
 * hasznos, hogy harmonikás doboz lesz a Google-ben (arra ne számítsunk), hanem
 * mert a válaszgépek (Perplexity, ChatGPT, Gemini) és a többi kereső ebből
 * értik meg és idézik a tartalmat.
 */

import { guideCountry, type Guide, type GuideSection } from "./guides";
import { getChecklist } from "./guide-checklists";
import { countryAdjective, countryResidentialAdjective } from "./countries";

const BASE = "https://kinti.app";

const ORSZAG_NEV: Record<string, string> = {
  CH: "Svájc", AT: "Ausztria", DE: "Németország", NL: "Hollandia", GB: "Anglia", ES: "Spanyolország",
};

/**
 * Fejezet-cím → horgony-id. EZ AZ EGYETLEN FORRÁS: a cikkoldal is innen veszi
 * (`sectionId` helyett), különben a két képzés elcsúszhat.
 *
 * ⚠️ EZ MÁR MEGTÖRTÉNT. Először lemásoltam a szabályt, de lemaradt a végéről az
 * INDEX: az oldal `mi-az-az-id-austria-0`-t rendereli, én `mi-az-az-id-austria`-t
 * adtam — a „Részletek" link némán semmit sem csinált. A szerkezeti tesztem
 * („használ-e NFD-normalizálást") ezt nem fogta meg, mert forrás-mintát
 * hasonlított, nem VISELKEDÉST. Ezért lett közös a függvény, és ezért
 * hasonlítja a teszt a tényleges kimenetet.
 */
export function sectionAnchor(heading: string, i: number): string {
  const slug = heading
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug ? `${slug}-${i}` : `szakasz-${i}`;
}

/**
 * Önmagában értelmetlen kérdés-fejezetek. Ezek a cikk címe nélkül nem
 * kereshetők („Mi az?"), ezért ELÉ tesszük a cikk címét — ez SZŰKÍTÉS, nem
 * kitalálás: pontosan így keresne rá az olvasó („Családi pótlék: ki jogosult?").
 */

/** Egy fejezetből kérdés-válasz pár, ha a fejezet tényleg kérdés. */
export interface QaPar {
  kerdes: string;
  /** A teljes válasz (a séma ezt adja a keresőnek). */
  valasz: string;
  /** Rövid, egy mondatos válasz a látható blokkhoz. */
  rovid: string;
  /** A szakasz horgonya, hogy a látható blokkból oda lehessen ugrani. */
  anchor: string;
}

/**
 * A szakasz szövege egy folyamatos válasszá.
 *
 * ⚠️ A FELSOROLÁS-PONTOK NEM ÉRNEK VÉGET ÍRÁSJELLEL. Ha csak szóközzel fűzzük
 * őket össze, két önálló állítás egy mondattá folyik:
 *   „…a háztartásból egy személy fizeti Mentesség rászorultsági alapon kérhető”
 * Ezért a záró írásjel nélküli pontok végére pontot teszünk — így a mondat-
 * vágó is helyesen találja meg az első állítást.
 */
function szakaszSzoveg(s: GuideSection): string {
  const zar = (t: string) => {
    const x = t.trim();
    return /[.!?:;…]$/.test(x) ? x : `${x}.`;
  };
  const reszek = [...(s.body ?? []).map(zar), ...(s.bullets ?? []).map(zar)];
  return reszek.join(" ").trim();
}

/**
 * Magyar rövidítések, amik NEM mondatvéget jelölnek.
 *
 * ⚠️ Enélkül a mondatvágó a „(pl." után elvágta a szöveget, és a látható
 * válasz így nézett ki: „Ha VÁROSOK KÖZÖTT ingázol (pl." — csonka, és még
 * zárójelet is nyitva hagy.
 */
const ROVIDITESEK = ["pl", "kb", "ill", "stb", "vö", "ún", "kb", "min", "max", "kt", "sz", "ún", "ld", "vmi", "vki"];

const MAX_ROVID = 220;

/**
 * Hosszú mondat levágása.
 *
 * ⚠️ A vágás NYITOTT ZÁRÓJELBE eshet: „…pótdíj jöhet rá (az aktuálisat a…" —
 * a mondat így félbehagyott zárójellel ér véget. Ezért a levágás után
 * visszalépünk a le nem zárt zárójel elé. (Ezt a teszt találta meg, valós
 * cikk-szövegen — szemre nem tűnt fel.)
 */
function csonkit(s: string): string {
  if (s.length <= MAX_ROVID) return s;
  let v = s.slice(0, MAX_ROVID - 3);
  const nyitva = (v.match(/\(/g)?.length ?? 0) - (v.match(/\)/g)?.length ?? 0);
  if (nyitva > 0) {
    const utolso = v.lastIndexOf("(");
    if (utolso > 40) v = v.slice(0, utolso);
  }
  // Szó közepén se vágjunk el.
  const szokoz = v.lastIndexOf(" ");
  if (szokoz > 40) v = v.slice(0, szokoz);
  return v.replace(/[\s,;:—-]+$/, "") + "…";
}

/** Az első mondat — a látható Q&A blokk rövid válasza. */
function elsoMondat(szoveg: string): string {
  const teljes = szoveg.trim();
  let i = 0;
  while (i < teljes.length) {
    const p = teljes.slice(i).search(/[.!?](\s|$)/);
    if (p < 0) break;
    const vegIdx = i + p;
    // A pont előtti szó — ha rövidítés, nem itt van a mondatvég.
    const elotte = teljes.slice(0, vegIdx).match(/([A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű]+)$/)?.[1]?.toLowerCase() ?? "";
    const nyitottZarojel = (teljes.slice(0, vegIdx).match(/\(/g)?.length ?? 0) > (teljes.slice(0, vegIdx).match(/\)/g)?.length ?? 0);
    if (!ROVIDITESEK.includes(elotte) && !nyitottZarojel) {
      return csonkit(teljes.slice(0, vegIdx + 1).trim());
    }
    i = vegIdx + 1;
  }
  return csonkit(teljes);
}

const STOPSZAVAK = new Set(["hogyan", "mikor", "milyen", "mennyi", "kinek", "mire", "mit", "miért", "amit", "kell", "lehet", "tudni", "gyakorlatban", "figyelj", "jogosult", "működik", "tegyél"]);

/** Ékezet nélküli, kisbetűs, 3+ karakteres tartalmi szavak. */
function jelentosSzavak(s: string): string[] {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 3 && !STOPSZAVAK.has(w));
}

/**
 * Önmagában áll-e a kérdés? Akkor igen, ha van olyan tartalmi szava, ami a cikk
 * címében is szerepel (prefix-egyezéssel, hogy a „KSV" és a „KSV1870" egyezzen).
 *
 * ⚠️ Az első változatom PUSZTA HOSSZ alapján döntött (22 karakter), és emiatt a
 * „Mire jó a gyakorlatban?" kontextus nélkül maradt — 23 karakter, tehát
 * „önállónak" számított, miközben semmit nem mond arról, MIRE vonatkozik.
 */
function onalloKerdes(heading: string, title: string): boolean {
  const cimSzavak = jelentosSzavak(title);
  return jelentosSzavak(heading).some((h) => cimSzavak.some((c) => c.startsWith(h) || h.startsWith(c)));
}

/**
 * A cikk valódi kérdés-válasz párjai.
 *
 * ⚠️ CSAK a ténylegesen kérdés-formájú fejezetekből. NEM gyártunk kérdést a
 * `tldr` állításaiból: abból csak úgy lenne kérdés, hogy kitaláljuk — és egy
 * kitalált kérdésre adott helyes válasz is félrevezető.
 */
export function guideQaPairs(guide: Guide): QaPar[] {
  const kod = guideCountry(guide.slug);
  const orszag = ORSZAG_NEV[kod] ?? "";
  /*
   * ⚠️ Az ország csak akkor kerül a kérdésbe, ha a cím NEM utal rá már.
   * Kell a MELLÉKNÉVI alak is: az „ID Austria — az OSZTRÁK digitális azonosító"
   * címre az első változatom még odabiggyesztette a „(Ausztria)"-t, mert csak
   * magát az országnevet kereste. (Ugyanez volt a baj korábban a
   * „…közlekedés egész Ausztriában (Ausztria)" címnél is.)
   */
  const utalasok = [orszag, countryAdjective(kod), countryResidentialAdjective(kod)]
    .flatMap(jelentosSzavak)
    .filter((w) => w.length >= 5);
  const cimSzavak = jelentosSzavak(guide.title);
  const cimEmlitiOrszagot =
    orszag !== "" && utalasok.some((u) => cimSzavak.some((c) => c.startsWith(u) || u.startsWith(c)));
  const cimke = cimEmlitiOrszagot || orszag === "" ? guide.title : `${guide.title} (${orszag})`;

  const out: QaPar[] = [];
  guide.sections.forEach((s, i) => {
    const h = s.heading.trim();
    if (!h.endsWith("?")) return;
    const szoveg = szakaszSzoveg(s);
    if (szoveg.length < 40) return; // túl rövid törzs — nem válasz
    const kerdes = onalloKerdes(h, guide.title)
      ? h
      : `${cimke} — ${h.charAt(0).toLowerCase()}${h.slice(1)}`;
    out.push({ kerdes, valasz: szoveg, rovid: elsoMondat(szoveg), anchor: sectionAnchor(s.heading, i) });
  });
  return out;
}


/* ─── JSON-LD építők ──────────────────────────────────────────────────────── */

/**
 * Article — MINDEN cikkre. A `citation` a cikk hivatalos forrásai: ez mondja
 * meg a válaszgépnek, hogy az állítások mögött hatósági oldal áll.
 * A `speakable` a `tldr`-re mutat — a hangalapú keresés ezt olvassa fel.
 */
export function guideArticleLd(guide: Guide, updatedAt: Date): Record<string, unknown> {
  const url = `${BASE}/tudasbazis/${guide.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: guide.title,
    description: guide.summary,
    url,
    inLanguage: "hu",
    dateModified: updatedAt.toISOString(),
    author: { "@type": "Organization", name: "Kinti", url: BASE },
    publisher: { "@type": "Organization", name: "Kinti", url: BASE },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    about: { "@type": "Thing", name: guide.title },
    // A hivatalos források — NEM mi vagyunk a hatóság, csak hivatkozunk rá.
    ...(guide.sources.length > 0
      ? { citation: guide.sources.map((s) => ({ "@type": "CreativeWork", name: s.label, url: s.url })) }
      : {}),
    // Hangalapú keresés: a „Röviden" blokk a felolvasható összefoglaló.
    ...(guide.tldr && guide.tldr.length > 0
      ? { speakable: { "@type": "SpeakableSpecification", cssSelector: ["[data-speakable]"] } }
      : {}),
  };
}

/** FAQPage — csak ha VAN valódi kérdés-válasz pár. Különben `null`. */
export function guideFaqLd(guide: Guide): Record<string, unknown> | null {
  const parok = guideQaPairs(guide);
  if (parok.length === 0) return null;
  const url = `${BASE}/tudasbazis/${guide.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    mainEntity: parok.map((p) => ({
      "@type": "Question",
      name: p.kerdes,
      acceptedAnswer: { "@type": "Answer", text: p.valasz },
    })),
  };
}

/**
 * HowTo — a KURÁLT teendőlistából (`guide-checklists.ts`), nem a cikk
 * bekezdéseiből. A lista eleve sorrendben lévő, felszólító módú lépésekből áll,
 * vagyis pontosan az, amit ez a séma leír. Ahol nincs lista, `null`.
 */
export function guideHowToLd(guide: Guide): Record<string, unknown> | null {
  const lepesek = getChecklist(guide.slug);
  if (lepesek.length === 0) return null;
  const url = `${BASE}/tudasbazis/${guide.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${url}#howto`,
    name: guide.title,
    description: guide.summary,
    inLanguage: "hu",
    step: lepesek.map((l, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: l.text,
      ...(l.hint ? { text: `${l.text} ${l.hint}` } : { text: l.text }),
      url: `${url}#teendolista`,
    })),
  };
}

/**
 * A cikk összes sémája egy tömbben (a `null`-ok kiszűrve).
 * Több `<script type="application/ld+json">` helyett egy tömb is érvényes.
 */
export function guideJsonLd(guide: Guide, updatedAt: Date, breadcrumb: Record<string, unknown>): unknown[] {
  return [breadcrumb, guideArticleLd(guide, updatedAt), guideFaqLd(guide), guideHowToLd(guide)].filter(
    (x): x is Record<string, unknown> => x != null,
  );
}
