/**
 * tudastar.ts — a „Tudástár" (expat guides / wiki) STATIKUS adatrétege.
 *
 * KRITIKUS (Cloudflare Pages Edge): NINCS futásidejű `fs` — minden cikk itt,
 * build-időben importálható TS-struktúrában él. A cikk-oldalak SSG-vel
 * (generateStaticParams + force-static) statikus HTML-lé fordulnak, így NEM
 * fogyasztanak edge-route-ot (deploy-plafon) — lásd a /tudasbazis mintát.
 *
 * FIGYELEM (jog): ez általános, tájékoztató tartalom hivatalos forrásokból, NEM
 * jogi/adó/bevándorlási tanácsadás. A részletek országonként/tartományonként és
 * időben változnak — minden cikk hivatkozik a hivatalos forrásra, azt ellenőrizd.
 *
 * Megjegyzés: külön a meglévő `src/lib/guides.ts`-től (az a CH-only Tudásbázis,
 * szekció-alapú). Ez a többország-tudatos, SEO-first, contentHtml-alapú modul.
 */

export type TudastarCountry = "de" | "at" | "ch" | "nl";
export type TudastarCategory = "admin" | "tax" | "family" | "jobs" | "health";

export interface Guide {
  slug: string;
  country: TudastarCountry;
  category: TudastarCategory;
  title: string;
  description: string; // SEO meta description
  lastUpdated: string; // pl. "2026. július"
  readTime: string; // pl. "6 perc olvasás"
  contentHtml: string; // formázott HTML (a .prose-kinti stílussal renderelve)
  /** Kinti Szaknévsor kategória-slug a záró CTA-hoz (pl. "konyveles"). */
  relatedSearchCategory?: string;
  /** Hivatalos forrás(ok) — hitelesség + SEO + jogi biztonság. */
  officialSources?: { label: string; url: string }[];
}

// --- Ország- és kategória-metaadatok ----------------------------------------

export const TUDASTAR_COUNTRIES: { code: TudastarCountry; label: string; flag: string }[] = [
  { code: "de", label: "Németország", flag: "🇩🇪" },
  { code: "at", label: "Ausztria", flag: "🇦🇹" },
  { code: "ch", label: "Svájc", flag: "🇨🇭" },
  { code: "nl", label: "Hollandia", flag: "🇳🇱" },
];

export const TUDASTAR_CATEGORIES: { id: TudastarCategory; label: string; emoji: string }[] = [
  { id: "admin", label: "Hivatalos ügyintézés", emoji: "📋" },
  { id: "tax", label: "Adózás", emoji: "🧾" },
  { id: "family", label: "Családi támogatások", emoji: "👨‍👩‍👧" },
  { id: "jobs", label: "Munka", emoji: "💼" },
  { id: "health", label: "Egészségügy", emoji: "🩺" },
];

/** A Tudástár ország-kódja (kisbetűs) → a Szaknévsor ország-kódja (nagybetűs). */
export function szaknevsorCountry(c: TudastarCountry): "CH" | "AT" | "DE" | "NL" {
  return c.toUpperCase() as "CH" | "AT" | "DE" | "NL";
}

/** CTA-felirat egy Szaknévsor-kategóriához (mit keressen a látogató). */
export const CTA_PROFESSION: Record<string, string> = {
  konyveles: "magyar könyvelőt",
  adotanacsado: "magyar adótanácsadót",
  ugyved: "magyar ügyvédet",
  orvos: "magyar orvost",
  biztositas: "magyar biztosítási szakértőt",
  fordito: "magyar fordítót / tolmácsot",
  koltoztetes: "magyar költöztetőt",
};

export function countryMeta(code: string) {
  return TUDASTAR_COUNTRIES.find((c) => c.code === code) ?? null;
}
export function categoryMeta(id: string) {
  return TUDASTAR_CATEGORIES.find((c) => c.id === id) ?? null;
}

const DISCLAIMER =
  "Ez általános tájékoztatás hivatalos forrásokból, nem jogi, adó- vagy bevándorlási tanácsadás. A feltételek országonként/tartományonként és időben változnak — a rád vonatkozó pontos információért mindig a hivatalos oldalt nézd.";
export const TUDASTAR_DISCLAIMER = DISCLAIMER;

// --- A cikkek ---------------------------------------------------------------

export const GUIDES: Guide[] = [
  {
    slug: "kindergeld-nemetorszagban",
    country: "de",
    category: "family",
    title: "Kindergeld igénylés Németországban lépésről lépésre",
    description:
      "Részletes útmutató a német családi pótlék (Kindergeld) igényléséhez magyaroknak. Szükséges dokumentumok, feltételek és a benyújtás menete egy helyen.",
    lastUpdated: "2026. július",
    readTime: "6 perc olvasás",
    relatedSearchCategory: "adotanacsado",
    officialSources: [
      { label: "Familienkasse (Bundesagentur für Arbeit)", url: "https://www.arbeitsagentur.de/familie-und-kinder/kindergeld" },
    ],
    contentHtml: `
      <h2>Mi az a Kindergeld és ki jogosult rá?</h2>
      <p>A <strong>Kindergeld</strong> a német családi pótlék, amelyet a gyermek után havonta fizetnek. Általában az a szülő jogosult rá, aki Németországban él és adóköteles (bejelentett lakóhely + korlátlan adókötelezettség), vagy itt dolgozik. EU-állampolgárként magyarként is igényelheted — a jogosultságot a lakóhelyed és a munkaviszonyod alapozza meg, nem az állampolgárság.</p>
      <p>Egy gyermek után jellemzően csak egy országból jár családi támogatás; ha Magyarországon is kapnál, a két rendszer közötti különbözetet rendezik (koordináció). Ezt a Familienkasse vizsgálja.</p>

      <h2>Szükséges dokumentumok magyar igénylőknek</h2>
      <ul>
        <li>A gyermek(ek) <strong>nemzetközi születési anyakönyvi kivonata</strong></li>
        <li>Házassági anyakönyvi kivonat (ha releváns)</li>
        <li>Német lakcímbejelentő (<strong>Anmeldung / Meldebescheinigung</strong>)</li>
        <li>Adóazonosító (<strong>steuerliche Identifikationsnummer</strong>) — a tiéd és a gyermeké</li>
        <li>Igazolás arról, kaptok-e Magyarországon családi támogatást (a koordinációhoz)</li>
      </ul>

      <h2>Hogyan nyújtsd be a kérelmet?</h2>
      <p>A kérelmet (<em>Antrag auf Kindergeld</em>) a lakóhelyed szerinti <strong>Familienkasse</strong> felé kell benyújtani, plusz az <em>Anlage Kind</em> mellékletet gyermekenként. Ma már online is intézhető a Bundesagentur für Arbeit felületén; a nemzetközi anyakönyvi kivonatokat érdemes előre beszerezni, mert ez a leggyakoribb csúszás oka.</p>

      <h2>Mennyi idő, és mire figyelj?</h2>
      <p>Az ügyintézés jellemzően néhány hét, de EU-s koordinációnál hosszabb is lehet. A támogatás visszamenőleg általában korlátozottan igényelhető, ezért érdemes a jogosultság kezdetétől mielőbb beadni. A pontos, aktuális összegeket és feltételeket mindig a hivatalos oldalon ellenőrizd.</p>
    `,
  },
  {
    slug: "adobevallas-nemetorszagban",
    country: "de",
    category: "tax",
    title: "Adóbevallás Németországban magyaroknak (Steuererklärung)",
    description:
      "Mikor kötelező és mikor éri meg az önkéntes német adóbevallás? Steuerklasse, határidők és a leggyakoribb visszaigényelhető tételek magyaroknak.",
    lastUpdated: "2026. július",
    readTime: "7 perc olvasás",
    relatedSearchCategory: "adotanacsado",
    officialSources: [
      { label: "ELSTER — hivatalos online adóbevallás", url: "https://www.elster.de/" },
    ],
    contentHtml: `
      <h2>Kötelező vagy önkéntes a bevallás?</h2>
      <p>Sok alkalmazottnak nem kötelező bevallást beadni, mert a munkáltató havonta levonja az adót (Lohnsteuer). Kötelező lehet viszont többek között akkor, ha több munkáltatód volt, ha bizonyos béren kívüli juttatásaid vannak, vagy ha a Steuerklasse-kombinációd ezt megkívánja. Sok magyarnak az <strong>önkéntes</strong> bevallás is megéri, mert gyakran <strong>visszajár</strong> pénz.</p>

      <h2>Steuerklasse — miért számít?</h2>
      <p>Az adóosztály (I–VI) befolyásolja a havi nettódat. Házaspároknál a III/V vagy IV/IV kombináció eltérő havi levonást ad, de éves szinten a bevallás rendezi a különbséget. Ha a párod Magyarországon él vagy nem dolgozik, érdemes utánajárni, melyik osztály a kedvezőbb.</p>

      <h2>Mit lehet jellemzően visszaigényelni?</h2>
      <ul>
        <li>Munkába járás költsége (<strong>Pendlerpauschale</strong>)</li>
        <li>Kettős háztartás (ha a család Magyarországon maradt — <em>doppelte Haushaltsführung</em>)</li>
        <li>Munkaeszközök, továbbképzés, szakmai költségek</li>
        <li>Bizonyos biztosítások és gondozási költségek</li>
      </ul>

      <h2>Határidők és benyújtás</h2>
      <p>A bevallást elektronikusan az <strong>ELSTER</strong> rendszeren adhatod be. A kötelező bevallás határideje jellemzően a következő év közepe (adótanácsadóval hosszabb); az önkéntesre több éved van visszamenőleg. A konkrét dátumokat és kereteket a hivatalos forráson nézd — vagy bízd adótanácsadóra.</p>
    `,
  },
  {
    slug: "anmeldung-bejelentkezes-ausztriaban",
    country: "at",
    category: "admin",
    title: "Bejelentkezés Ausztriában: Meldezettel lépésről lépésre",
    description:
      "Költözés után Ausztriában 3 napon belül be kell jelentkezni (Meldezettel). Hol, milyen papírokkal és mire figyelj magyarként — gyakorlati útmutató.",
    lastUpdated: "2026. július",
    readTime: "5 perc olvasás",
    relatedSearchCategory: "ugyved",
    officialSources: [
      { label: "oesterreich.gv.at — Meldewesen", url: "https://www.oesterreich.gv.at/themen/dokumente_und_recht/meldewesen.html" },
    ],
    contentHtml: `
      <h2>Mi az a Meldezettel, és miért fontos?</h2>
      <p>A <strong>Meldezettel</strong> a lakcímbejelentő igazolása. Ausztriában a beköltözéstől számított <strong>3 napon belül</strong> be kell jelentkezni a lakóhely szerinti hivatalnál (Meldeamt / Magistratisches Bezirksamt). Szinte minden további ügyhöz (bankszámla, e-card, munkába állás) kelleni fog.</p>

      <h2>Milyen papírok kellenek?</h2>
      <ul>
        <li>Kitöltött és a <strong>szállásadó által aláírt</strong> Meldezettel-nyomtatvány</li>
        <li>Érvényes útlevél vagy személyi igazolvány</li>
        <li>Bérleti szerződés vagy a szállásadó igazolása (helyenként kérik)</li>
      </ul>

      <h2>Hol és hogyan intézd?</h2>
      <p>Személyesen a lakóhelyed szerinti Meldeamtnál. Sok városban időpontot kell foglalni. A bejelentés díjmentes; a Meldezettel-t helyben megkapod. Ha elköltözöl, a kijelentés (Abmeldung) is kötelező.</p>

      <h2>EU-állampolgárként mire figyelj?</h2>
      <p>Magyarként EU-polgár vagy, de 3 hónapnál hosszabb tartózkodásnál <strong>Anmeldebescheinigung</strong> (bejelentkezési igazolás) is szükséges lehet — ez külön a Meldezetteltől. A pontos, aktuális feltételeket a hivatalos oldalon ellenőrizd.</p>
    `,
  },
  {
    slug: "e-card-egeszsegbiztositas-ausztriaban",
    country: "at",
    category: "health",
    title: "e-card és egészségbiztosítás Ausztriában magyaroknak",
    description:
      "Hogyan jutsz e-card-hoz Ausztriában, mit fedez az ÖGK, és mit tegyél az első orvosi ügyekig — gyakorlati összefoglaló újonnan érkezett magyaroknak.",
    lastUpdated: "2026. július",
    readTime: "5 perc olvasás",
    relatedSearchCategory: "orvos",
    officialSources: [
      { label: "ÖGK — Österreichische Gesundheitskasse", url: "https://www.gesundheitskasse.at/" },
    ],
    contentHtml: `
      <h2>Hogyan leszel biztosított?</h2>
      <p>Ha Ausztriában alkalmazottként dolgozol, a munkáltató bejelent a társadalombiztosításba, és jellemzően az <strong>ÖGK</strong> (Österreichische Gesundheitskasse) lesz a biztosítód. A bejelentés után postázzák az <strong>e-card</strong>-ot a bejelentett címedre — ezért is fontos a Meldezettel.</p>

      <h2>Mit tudsz az e-card-dal?</h2>
      <p>Az e-card az egészségügyi kártyád: ezt viszed az orvoshoz (Kassenarzt), és vele veszik igénybe a közfinanszírozott ellátást. Nézd meg, hogy a választott orvos szerződött-e az ÖGK-val (<em>Kassenarzt</em>) vagy magánorvos (<em>Wahlarzt</em>), mert utóbbinál előbb fizetsz, majd részben visszaigényelheted.</p>

      <h2>Amíg megjön a kártya</h2>
      <p>Ha sürgősen orvoshoz kell menned, mielőtt megérkezne az e-card, kérj a biztosítótól ideiglenes igazolást, vagy EU-s biztosításnál használd az <strong>EHIC/Európai Egészségbiztosítási Kártyát</strong> átmenetileg. A részletekért az ÖGK ügyfélszolgálatát vagy a hivatalos oldalt keresd.</p>
    `,
  },
  {
    slug: "krankenkasse-valasztas-svajcban",
    country: "ch",
    category: "health",
    title: "Krankenkasse választás Svájcban: az első 3 hónap",
    description:
      "Svájcban a betegbiztosítás (Krankenkasse) kötelező és magad választod. Határidők, franchise, és hogyan spórolj az alap-biztosításon magyarként.",
    lastUpdated: "2026. július",
    readTime: "6 perc olvasás",
    relatedSearchCategory: "biztositas",
    officialSources: [
      { label: "priminfo.admin.ch — hivatalos díj-összehasonlító", url: "https://www.priminfo.admin.ch/" },
    ],
    contentHtml: `
      <h2>Kötelező és határidős</h2>
      <p>Svájcban az alap-egészségbiztosítás (<strong>Grundversicherung</strong>) mindenkinek kötelező, és a beköltözéstől számított <strong>3 hónapon belül</strong> meg kell kötnöd — de a fedezet visszamenőleg az érkezés napjától él. A biztosítót <strong>te választod</strong> a szabad piacon.</p>

      <h2>Az alap-fedezet mindenhol azonos</h2>
      <p>Az alapcsomag törvényileg meghatározott, tehát a szolgáltatás tartalma minden pénztárnál ugyanaz — csak az <strong>ár</strong> tér el. Ezért érdemes a hivatalos díj-összehasonlítón (priminfo.admin.ch) nézni, és nem a reklámokból választani.</p>

      <h2>Franchise és önrész — így spórolsz</h2>
      <ul>
        <li>A <strong>franchise</strong> (évi önrész) minél magasabb, annál olcsóbb a havi díj — de többet fizetsz, ha sokat jársz orvoshoz.</li>
        <li>A <strong>modellválasztás</strong> (pl. háziorvos- vagy telemedicina-modell) tovább csökkentheti a díjat.</li>
        <li>Alacsony jövedelemnél <strong>díjcsökkentés</strong> (Prämienverbilligung) igényelhető a kantonnál.</li>
      </ul>

      <h2>Mire figyelj magyarként?</h2>
      <p>A biztosító nem utasíthat el az alap-fedezetre. A pontos díjakat, franchise-szinteket és a kantoni támogatást mindig az aktuális hivatalos forráson ellenőrizd.</p>
    `,
  },
  {
    slug: "tartozkodasi-engedely-svajcban",
    country: "ch",
    category: "admin",
    title: "Tartózkodási engedély Svájcban (B/L/C) magyaroknak",
    description:
      "Mit jelent a B, L és C engedély Svájcban, mikor melyikre vagy jogosult EU-állampolgárként, és mi az első lépés a bejelentkezéskor.",
    lastUpdated: "2026. július",
    readTime: "6 perc olvasás",
    relatedSearchCategory: "ugyved",
    officialSources: [
      { label: "sem.admin.ch — Állami Migrációs Titkárság", url: "https://www.sem.admin.ch/sem/de/home.html" },
    ],
    contentHtml: `
      <h2>Bejelentkezés először</h2>
      <p>Svájcba érkezés után a lakóhelyed szerinti községnél (Gemeinde / Einwohnerkontrolle) kell bejelentkezned, jellemzően <strong>14 napon belül</strong> és a munkakezdés előtt. Itt indul az engedélyed ügye is.</p>

      <h2>A leggyakoribb engedély-típusok</h2>
      <ul>
        <li><strong>L</strong> — rövid tartózkodás (jellemzően 1 évnél rövidebb munkaviszonyhoz).</li>
        <li><strong>B</strong> — huzamos tartózkodás (általában határozatlan/hosszabb munkaszerződéssel), évente megújítható.</li>
        <li><strong>C</strong> — letelepedési engedély (jellemzően több év folyamatos tartózkodás után).</li>
      </ul>

      <h2>EU-állampolgárként mire számíts?</h2>
      <p>Magyarként a személyek szabad mozgásáról szóló megállapodás keretében dolgozhatsz Svájcban; az engedély típusát főként a munkaviszonyod hossza határozza meg. A feltételek és a kvóták időnként változnak — a hivatalos SEM-oldal és a kantoni migrációs hivatal az irányadó.</p>
    `,
  },
  {
    slug: "quellensteuer-forrasado-svajcban",
    country: "ch",
    category: "tax",
    title: "Quellensteuer (forrásadó) Svájcban: mit jelent magyaroknak?",
    description:
      "B-engedéllyel a béredből forrásadót (Quellensteuer) vonnak. Mikor kérhetsz utólagos rendes adózást, és mit lehet visszaigényelni.",
    lastUpdated: "2026. július",
    readTime: "5 perc olvasás",
    relatedSearchCategory: "adotanacsado",
    officialSources: [
      { label: "ch.ch — Adózás Svájcban", url: "https://www.ch.ch/de/steuern-und-finanzen/" },
    ],
    contentHtml: `
      <h2>Mi az a Quellensteuer?</h2>
      <p>Ha B- vagy L-engedéllyel dolgozol, a munkáltató a béredből közvetlenül levonja az adót — ez a <strong>forrásadó (Quellensteuer)</strong>. Nem kell tehát alapesetben klasszikus adóbevallást beadnod, a levonás „a forrásnál" történik. A kulcs kantononként és a jövedelem/családi helyzet szerint eltér.</p>

      <h2>Utólagos rendes adózás (NOV)</h2>
      <p>Bizonyos esetben kérheted vagy kötelező a <strong>rendes utólagos adózás</strong> (nachträgliche ordentliche Veranlagung) — például magasabb jövedelem felett, vagy ha levonásokat szeretnél érvényesíteni (pl. harmadik pillér, ingázás, gyermek utáni tételek). Ilyenkor a ténylegesen fizetendő adót újraszámolják, és lehet visszatérítés.</p>

      <h2>Mire figyelj?</h2>
      <p>A tarifa-besorolás hibái (pl. rossz családi státusz) miatt túl sokat is levonhatnak — érdemes ellenőrizni. A határidők és a visszaigénylés menete kantononként eltér; a pontos szabályért a kantoni adóhivatal vagy egy adótanácsadó az irányadó.</p>
    `,
  },
  {
    slug: "bsn-es-inschrijving-hollandiaban",
    country: "nl",
    category: "admin",
    title: "BSN és inschrijving Hollandiában: az első hivatalos lépés",
    description:
      "Hollandiában szinte mindenhez BSN-szám kell. Hogyan iratkozz be az önkormányzatnál (inschrijving) és szerezd meg a BSN-t magyarként.",
    lastUpdated: "2026. július",
    readTime: "5 perc olvasás",
    relatedSearchCategory: "ugyved",
    officialSources: [
      { label: "government.nl — BSN (citizen service number)", url: "https://www.government.nl/topics/personal-data/citizen-service-number-bsn" },
    ],
    contentHtml: `
      <h2>Mi az a BSN, és miért az első lépés?</h2>
      <p>A <strong>BSN</strong> (Burgerservicenummer) a holland személyi azonosító szám. Munkához, bankszámlához, egészségbiztosításhoz és szinte minden hivatalos ügyhöz kell. BSN-t az önkormányzatnál való beiratkozáskor (<strong>inschrijving</strong>) kapsz.</p>

      <h2>Rövid vagy tartós tartózkodás?</h2>
      <ul>
        <li><strong>4 hónapnál rövidebb</strong> tartózkodásnál a nem-lakosok nyilvántartásába (RNI) iratkozol be — BSN-t itt is kapsz, kijelölt RNI-városokban.</li>
        <li><strong>4 hónapnál hosszabb</strong> tartózkodásnál a lakóhelyed szerinti önkormányzatnál (Gemeente) iratkozol be lakosként.</li>
      </ul>

      <h2>Mit vigyél magaddal?</h2>
      <p>Érvényes útlevél/személyi, és jellemzően a lakcímedet igazoló irat (bérleti szerződés vagy a szállásadó hozzájárulása). A legtöbb Gemeente-hez időpontot kell foglalni; a nemzetközi anyakönyvi kivonatokat érdemes előre beszerezni.</p>

      <h2>BSN után</h2>
      <p>A BSN birtokában kötheted meg a kötelező holland egészségbiztosítást és kezdheted a munkát. A pontos, aktuális teendőket a hivatalos government.nl oldalon ellenőrizd.</p>
    `,
  },
  {
    slug: "zorgverzekering-egeszsegbiztositas-hollandiaban",
    country: "nl",
    category: "health",
    title: "Zorgverzekering: kötelező egészségbiztosítás Hollandiában",
    description:
      "Hollandiában 4 hónapon belül kötelező alap-egészségbiztosítást (zorgverzekering) kötni. Határidő, önrész (eigen risico) és a zorgtoeslag támogatás.",
    lastUpdated: "2026. július",
    readTime: "5 perc olvasás",
    relatedSearchCategory: "biztositas",
    officialSources: [
      { label: "government.nl — Health insurance", url: "https://www.government.nl/topics/health-insurance" },
    ],
    contentHtml: `
      <h2>Kötelező és határidős</h2>
      <p>Ha Hollandiában élsz vagy dolgozol, jellemzően kötelező <strong>alap-egészségbiztosítást (basisverzekering)</strong> kötnöd egy holland biztosítónál, általában a biztosítási kötelezettség kezdetétől számított <strong>4 hónapon belül</strong> — a fedezet visszamenőleg az első naptól él. Ehhez BSN kell.</p>

      <h2>Eigen risico (önrész)</h2>
      <p>Az alapbiztosításnak van egy éves kötelező önrésze (<strong>eigen risico</strong>): egy bizonyos összegig te állod a költséget, utána fizet a biztosító (a háziorvos jellemzően mentes ez alól). Vállalható magasabb önrészért cserébe olcsóbb a havi díj.</p>

      <h2>Zorgtoeslag — támogatás</h2>
      <p>Alacsonyabb jövedelemnél járhat <strong>zorgtoeslag</strong> (egészségbiztosítási hozzájárulás) a Belastingdiensttől, ami a havi díj egy részét visszatéríti. A jogosultságot és az összeget a hivatalos adóhatósági oldalon ellenőrizd.</p>
    `,
  },
];

// --- Lekérdező segédfüggvények ----------------------------------------------

export function getGuide(country: string, slug: string): Guide | null {
  return GUIDES.find((g) => g.country === country && g.slug === slug) ?? null;
}

export function guidesForCountry(country: string): Guide[] {
  return GUIDES.filter((g) => g.country === country);
}

/** Van-e a cikkhez CTA-hoz használható (ismert feliratú) szakma-kategória? */
export function ctaProfession(guide: Guide): string | null {
  if (!guide.relatedSearchCategory) return null;
  return CTA_PROFESSION[guide.relatedSearchCategory] ?? null;
}

// --- Tartalomjegyzék (TOC) — PURE, build-időben, DOM/fs nélkül ---------------

export interface TocItem {
  id: string;
  text: string;
}

function slugifyHeading(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * A cikk HTML-jéből kinyeri a <h2> fejezeteket (tartalomjegyzékhez), és beszúrja
 * a horgony-`id`-ket a fejlécekbe, hogy az anchor-linkek működjenek. Regex-alapú,
 * determinisztikus (a tartalom saját, megbízható HTML) — nincs DOM, nincs fs.
 */
export function tocFromHtml(html: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const seen = new Set<string>();
  const out = html.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/g, (_full, attrs: string, inner: string) => {
    const text = inner.replace(/<[^>]+>/g, "").trim();
    const base = slugifyHeading(text) || "szakasz";
    let unique = base;
    let n = 2;
    while (seen.has(unique)) unique = `${base}-${n++}`;
    seen.add(unique);
    toc.push({ id: unique, text });
    if (/\bid=/.test(attrs)) return `<h2${attrs}>${inner}</h2>`; // már van id → ne duplázd
    return `<h2${attrs} id="${unique}">${inner}</h2>`;
  });
  return { html: out, toc };
}
