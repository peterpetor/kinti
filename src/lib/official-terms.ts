/**
 * official-terms.ts — KURÁLT (kézzel ellenőrzött) hivatali kifejezés-szótár.
 *
 * A /api/ai/german-term végpont ELŐSZÖR ezt nézi meg: a leggyakrabban keresett,
 * NAGY TÉTŰ hivatali kifejezéseket itt tartjuk, kézzel írt, PONTOS magyar
 * magyarázattal — így ezekre SOHA nem az AI hallucinál (a Betreibung nem
 * „kivégzés", hanem adósságbehajtás). Csak az itt NEM szereplő kifejezésekre
 * fut az AI, megerősített (szó-szerinti-fordítást TILTÓ) prompttal.
 *
 * Kulcs: kisbetűs, cikkely nélküli alak. Az érték: 1-2 mondat (meaning + kontextus).
 */

export const OFFICIAL_TERMS: Record<string, string> = {
  // — Svájc: adósság / behajtás —
  "betreibung": "Adósságbehajtási (végrehajtási) eljárás Svájcban: ha egy számlát nem fizetsz, a hitelező a Betreibungsamtnál indíthatja. NEM „kivégzés”, hanem pénzügyi behajtás. Lakásbérlésnél gyakran kérnek tiszta Betreibungsauszug-ot.",
  "betreibungsauszug": "Igazolás a Betreibungsamttól, hogy van-e ellened folyamatban adósságbehajtás. Lakásbérléskor és munkaszerződésnél gyakran kérik (a „tiszta” kivonat előny).",
  "betreibungsamt": "Az adósságbehajtási hivatal (körzeti), amely a fizetési meghagyásokat és a végrehajtást intézi.",
  "mahnung": "Fizetési felszólítás — a lejárt számla utáni emlékeztető. Ismételt nemfizetésnél Betreibung lehet a következő lépés.",

  // — Svájc: egészségbiztosítás —
  "krankenkasse": "Egészségbiztosító (betegpénztár). Svájcban az alapbiztosítás kötelező, beköltözés után 3 hónapon belül meg kell kötnöd; te választhatsz pénztárt.",
  "krankenversicherung": "Egészségbiztosítás. Svájcban a Grundversicherung (alap) kötelező; Németországban gesetzlich (törvényi) vagy privat (magán) lehet.",
  "grundversicherung": "A kötelező svájci alap-egészségbiztosítás. A szolgáltatás-csomag minden pénztárnál azonos, csak az ár és a modell tér el.",
  "franchise": "Az egészségbiztosítás éves önrésze: eddig az összegig te állod az orvosi költséget, felette a biztosító. Magasabb franchise = alacsonyabb havi díj.",
  "selbstbehalt": "A franchise fölötti önrész (jellemzően 10%, éves felső korláttal) — ennyit még rád terhel a biztosító a költségekből.",
  "prämie": "A havi biztosítási díj (pl. az egészségbiztosításé).",

  // — Svájc: nyugdíj / adó / bér —
  "ahv": "Öregségi és hátramaradotti biztosítás (AHV/AVS) — a svájci állami alapnyugdíj (1. pillér). A bérből levonják, a járulék kötelező.",
  "iv": "Rokkantsági biztosítás (IV/AI) — az AHV-val az 1. pillér része, munkaképesség-csökkenés esetén nyújt ellátást.",
  "pensionskasse": "Foglalkoztatói nyugdíjpénztár (2. pillér, BVG) — a munkáltatóddal közösen fizetitek, az AHV-t egészíti ki.",
  "quellensteuer": "Forrásadó — a bérből közvetlenül levont jövedelemadó (jellemzően C-engedély nélküli külföldieknél).",
  "steuererklärung": "Adóbevallás — az éves jövedelem- és (Svájcban) vagyonbevallás az adóhivatalnak.",
  "lohnausweis": "Bérigazolás — a munkáltató éves összesítője a fizetésedről, az adóbevalláshoz.",

  // — Svájc: tartózkodás / lakcím —
  "aufenthaltsbewilligung": "Tartózkodási engedély (Svájc). Gyakori típusok: L (rövid táv), B (tartós), C (letelepedés).",
  "niederlassungsbewilligung": "C-engedély — határozatlan idejű svájci letelepedési engedély (jellemzően 5-10 év után).",
  "anmeldung": "Bejelentkezés a lakóhely szerinti önkormányzatnál (Gemeinde/Einwohneramt) — beköltözés után jellemzően 14 napon belül kötelező.",
  "abmeldung": "Kijelentkezés az önkormányzatnál el-/kiköltözéskor.",
  "gemeinde": "Község/önkormányzat — a helyi ügyintézés (be-/kijelentkezés, sok engedély) alapszintje.",

  // — Lakás / bérlés —
  "nebenkosten": "Rezsi/mellékköltség a lakbér mellett (fűtés, víz, közös költségek) — gyakran előlegként fizeted, év végén elszámolják.",
  "betriebskosten": "Üzemeltetési/rezsiköltség a lakbér mellett (Ausztriában ez a jellemző szó a Nebenkosten helyett).",
  "mietkaution": "Bérleti kaució — Svájcban jellemzően max. 3 havi lakbér, külön letéti kaució-számlán tartják.",
  "kaution": "Kaució — a bérbeadónak letett biztosíték (bérleti szerződésnél).",
  "kündigung": "Felmondás (munka vagy bérlet). Figyeld a Kündigungsfrist-et és a formát (gyakran ajánlott levél kell).",
  "kündigungsfrist": "Felmondási idő — a felmondás és a tényleges megszűnés közti kötelező időszak.",

  // — Egyéb hivatali (CH) —
  "vignette": "Autópálya-matrica — Svájcban éves, az autópálya-használathoz kötelező.",
  "serafe": "A svájci média-illeték (rádió/TV) beszedője — háztartásonként kötelező éves díj.",
  "rav": "Regionális munkaközvetítő iroda (Svájc) — munkanélküliként itt kell jelentkezned az ellátáshoz és álláskereséshez.",
  "arbeitslosenkasse": "Munkanélküli-pénztár — a munkanélküli ellátást (ALV) folyósítja.",
  "kinderzulage": "Családi pótlék — gyerek után járó rendszeres támogatás (Svájc).",
  "sozialhilfe": "Szociális segély — végső háló, ha a jövedelem nem fedezi a létminimumot.",
  "verfügung": "Hatósági határozat (írásbeli döntés), amely ellen jellemzően megadott határidőn belül fellebbezhetsz.",
  "gesuch": "Kérelem/beadvány egy hatósághoz.",
  "vollmacht": "Meghatalmazás — felhatalmazol valakit, hogy a nevedben hivatalosan eljárjon.",
  "vorsorgeauftrag": "Gondoskodási megbízás (Svájc) — előre kijelölöd, ki dönthet helyetted személyi és vagyoni ügyekben, ha cselekvőképtelenné válnál. NEM adóssággal kapcsolatos.",
  "patientenverfügung": "Betegrendelkezés — előre leírod, milyen orvosi kezelést szeretnél vagy sem, ha már nem tudsz nyilatkozni.",
  "kurzarbeit": "Rövidített munkaidő — a munkáltató gazdasági okból átmenetileg csökkenti a munkaidőt, az állam részben pótolja a kieső bért.",
  "lohnfortzahlung": "Bérfolytatás — a munkáltató betegség/baleset esetén (törvényi vagy szerződéses ideig) tovább fizeti a béredet.",
  "handelsregister": "Cégjegyzék — a bejegyzett cégek nyilvános nyilvántartása.",
  "grundbuch": "Telekkönyv — az ingatlanok tulajdoni és teher-nyilvántartása.",
  "zivilstandsamt": "Anyakönyvi hivatal — születés, házasság, haláleset, névváltoztatás ügyei.",
  "familienzulage": "Családi pótlék — gyerek után járó rendszeres támogatás (a Kinderzulage tágabb neve).",
  "erbschein": "Örökösödési bizonyítvány — igazolja, ki az örökös; bankokhoz, ingatlan-átíráshoz kérik.",
  "betreibungsregister": "Az adósságbehajtási nyilvántartás — a Betreibungsamt vezeti; ebből készül a Betreibungsauszug.",

  // — Ausztria —
  "meldezettel": "Lakcímbejelentő lap (Ausztria) — a lakóhely bejelentésének/igazolásának hivatalos dokumentuma.",
  "e-card": "Az osztrák egészségbiztosítási kártya — az orvosnál ezt olvassák le.",
  "ögk": "Österreichische Gesundheitskasse — a legnagyobb osztrák (törvényi) egészségbiztosító.",
  "arbeitnehmerveranlagung": "Munkavállalói adókiegyenlítés (Ausztria) — az éves adóbevallás, amivel gyakran adót igényelhetsz vissza.",
  "ams": "Arbeitsmarktservice — az osztrák munkaügyi hivatal (munkanélküli ellátás, közvetítés).",
  "hauptwohnsitz": "Fő lakóhely — a bejelentett elsődleges lakcím (szemben a Nebenwohnsitz mellék-lakhellyel).",
  "pickerl": "A kötelező műszaki vizsga (§57a) matricája Ausztriában.",
  "aufenthaltstitel": "Tartózkodási engedély/cím (Ausztria, Németország) — a jogszerű tartózkodás okmánya.",

  // — Németország —
  "bürgeramt": "Polgármesteri ügyfélszolgálat (Németország) — bejelentkezés, igazolványok, sok helyi ügy.",
  "steuer-id": "Adóazonosító szám (Németország) — élethosszig szóló, a béreléshez és az adóhoz kell.",
  "rundfunkbeitrag": "Média-illeték (Németország) — háztartásonként kötelező rádió/TV díj.",
  "kindergeld": "Családi pótlék (Németország).",
  "tüv": "Műszaki vizsga (Németország) — a jármű forgalombiztonsági ellenőrzése.",

  // — Hollandia —
  "bsn": "Burgerservicenummer — a holland személyi/állampolgári azonosító szám; szinte minden ügyhöz kell.",
  "digid": "A holland elektronikus azonosító (online hivatali ügyintézéshez).",
  "zorgverzekering": "Egészségbiztosítás (Hollandia) — kötelező alapbiztosítás, magad kötöd meg.",
  "belastingdienst": "A holland adóhivatal.",
  "zorgtoeslag": "Egészségbiztosítási támogatás (Hollandia) — jövedelemfüggő hozzájárulás a biztosítási díjhoz.",
  "huurtoeslag": "Lakbértámogatás (Hollandia) — jövedelemfüggő.",
  "gemeente": "Önkormányzat (Hollandia) — bejelentkezés, okmányok, helyi ügyek (a német Gemeinde holland megfelelője).",
};

/** Cikkely-előtag (der/die/das/le/la/de/het…) leválasztása a normalizáláshoz. */
const ARTICLE = /^(der|die|das|den|le|la|les|l['’]|de|het|een)\s+/i;

/**
 * Kurált magyarázat egy kifejezésre (vagy null, ha nincs a listában).
 * Kisbetűsít, trimmel, leválasztja a névelőt; a bemenet már validált a hívónál.
 */
export function lookupOfficialTerm(input: string): string | null {
  const t = input.trim().toLowerCase().replace(ARTICLE, "").trim();
  if (!t) return null;
  if (OFFICIAL_TERMS[t]) return OFFICIAL_TERMS[t];
  // „B-Bewilligung" / „Bewilligung B" jellegű gyakori összetételek → aufenthaltsbewilligung
  if (/\bbewilligung\b/.test(t) && /\b[blc]\b/.test(t)) return OFFICIAL_TERMS["aufenthaltsbewilligung"];
  return null;
}
