/**
 * regions.ts — a többország-rendszer GENERIKUS geográfia-rétege.
 *
 * Eddig a hely-fogalom kizárólag a svájci kanton volt (cantons.ts). A 6 ország
 * indulásához ezt általánosítjuk: minden országnak van egy „régió" listája
 * (CH=kanton, AT=Bundesland, DE=Land, NL=provincia, DK=region, SE=län). A CH
 * régiók a meglévő CANTONS-ból jönnek (egyetlen forrás marad).
 *
 * A `code` országon belül egyedi (ASCII, DB/URL-barát); országok között
 * ütközhet (pl. CH-ZH Zürich vs NL-ZH Zuid-Holland) — ezért MINDIG a
 * country_code + region_code párral azonosítunk.
 */
import { CANTONS } from "./cantons";

export interface Region {
  code: string;
  name: string;
  aliases?: string[];
}

/** Az adott ország régió-szintjének magyar megnevezése (UI-felirat). */
export const REGION_LABEL: Record<string, string> = {
  CH: "kanton",
  AT: "tartomány",
  DE: "tartomány",
  NL: "provincia",
  GB: "régió",
  // ⚠️ ES-nél SZÁNDÉKOSAN „régió", nem „tartomány". Spanyolországban KÉT
  // közigazgatási szint van, és mindkettőt „tartomány"-nak szokás fordítani:
  // a 17 comunidad autónoma (ez a mi listánk) és az 50 provincia. Ha
  // „tartomány"-t írnánk, a Málagában élő user a provinciáját keresné a
  // listában, és Andalucíát találna — a „régió" ezt a félreértést kizárja.
  ES: "régió",
};

// Ausztria — 9 Bundesland. Az aliasok közt a NAGYVÁROSOK is (a szabad-szöveges
// hely-feloldáshoz: kereső-heurisztika, Telegram-bot, külső állás-szinkron) —
// egy város CSAK a saját tartományánál szerepelhet (a feloldás egyértelmű marad).
const AT_REGIONS: Region[] = [
  { code: "W", name: "Wien", aliases: ["bécs", "vienna"] },
  { code: "NOE", name: "Niederösterreich", aliases: ["alsó-ausztria", "lower austria", "st pölten", "sankt pölten", "wiener neustadt"] },
  { code: "OOE", name: "Oberösterreich", aliases: ["felső-ausztria", "upper austria", "linz", "wels", "steyr"] },
  { code: "STM", name: "Steiermark", aliases: ["stájerország", "styria", "graz", "leoben"] },
  { code: "TIR", name: "Tirol", aliases: ["tyrol", "innsbruck", "kufstein"] },
  { code: "KTN", name: "Kärnten", aliases: ["karintia", "carinthia", "klagenfurt", "villach"] },
  { code: "SBG", name: "Salzburg", aliases: [] },
  { code: "VBG", name: "Vorarlberg", aliases: ["bregenz", "dornbirn", "feldkirch"] },
  { code: "BGL", name: "Burgenland", aliases: ["eisenstadt"] },
];

// Németország — 16 Land (hivatalos kódok). Város-aliasok: lásd az AT-megjegyzést.
// Frankfurt SZÁNDÉKOSAN a HE-nél (Frankfurt am Main — az Oder-parti kicsi);
// Freiburg SZÁNDÉKOSAN kimarad (ütközne a svájci Freiburg kantonnal).
const DE_REGIONS: Region[] = [
  { code: "BW", name: "Baden-Württemberg", aliases: ["stuttgart", "karlsruhe", "mannheim", "heidelberg", "ulm"] },
  { code: "BY", name: "Bayern", aliases: ["bajorország", "bavaria", "münchen", "munich", "nürnberg", "augsburg", "regensburg", "ingolstadt"] },
  { code: "BE", name: "Berlin", aliases: [] },
  { code: "BB", name: "Brandenburg", aliases: ["potsdam"] },
  { code: "HB", name: "Bremen", aliases: ["bréma"] },
  { code: "HH", name: "Hamburg", aliases: [] },
  { code: "HE", name: "Hessen", aliases: ["hesse", "frankfurt", "wiesbaden", "darmstadt", "kassel"] },
  { code: "MV", name: "Mecklenburg-Vorpommern", aliases: ["rostock", "schwerin"] },
  { code: "NI", name: "Niedersachsen", aliases: ["alsó-szászország", "lower saxony", "hannover", "braunschweig", "osnabrück"] },
  { code: "NW", name: "Nordrhein-Westfalen", aliases: ["észak-rajna-vesztfália", "köln", "cologne", "düsseldorf", "dortmund", "essen", "bonn", "duisburg", "aachen", "bochum", "wuppertal", "bielefeld", "münster"] },
  { code: "RP", name: "Rheinland-Pfalz", aliases: ["mainz", "koblenz", "trier"] },
  { code: "SL", name: "Saarland", aliases: ["saarbrücken"] },
  { code: "SN", name: "Sachsen", aliases: ["szászország", "saxony", "dresden", "drezda", "leipzig", "lipcse", "chemnitz"] },
  { code: "ST", name: "Sachsen-Anhalt", aliases: ["magdeburg"] },
  { code: "SH", name: "Schleswig-Holstein", aliases: ["kiel", "lübeck"] },
  { code: "TH", name: "Thüringen", aliases: ["türingia", "thuringia", "erfurt", "jena"] },
];

// Hollandia — 12 provincia (ISO 3166-2 kódok). Város-aliasok: lásd az AT-megjegyzést.
const NL_REGIONS: Region[] = [
  { code: "NH", name: "Noord-Holland", aliases: ["amszterdam", "amsterdam", "haarlem", "alkmaar", "zaandam"] },
  { code: "ZH", name: "Zuid-Holland", aliases: ["rotterdam", "hága", "den haag", "leiden", "delft", "dordrecht"] },
  { code: "UT", name: "Utrecht", aliases: ["amersfoort"] },
  { code: "NB", name: "Noord-Brabant", aliases: ["eindhoven", "tilburg", "breda", "den bosch", "s-hertogenbosch"] },
  { code: "GE", name: "Gelderland", aliases: ["arnhem", "nijmegen", "apeldoorn"] },
  { code: "OV", name: "Overijssel", aliases: ["enschede", "zwolle", "deventer"] },
  { code: "LI", name: "Limburg", aliases: ["maastricht", "venlo"] },
  { code: "FR", name: "Friesland", aliases: ["fryslân", "leeuwarden"] },
  { code: "GR", name: "Groningen", aliases: [] },
  { code: "DR", name: "Drenthe", aliases: ["assen", "emmen"] },
  { code: "FL", name: "Flevoland", aliases: ["almere", "lelystad"] },
  { code: "ZE", name: "Zeeland", aliases: ["middelburg"] },
];


// Anglia — a 9 hivatalos angol régió (ONS „regions of England"). ⚠️ SZÁNDÉKOSAN
// csak ANGLIA, nem a teljes Egyesült Királyság: Skócia/Wales/Észak-Írország
// más jogrend (külön egészségügy, oktatás, sőt Skóciában külön adósáv), ezért
// ide nem vesszük fel. Város-aliasok: lásd az AT-megjegyzést.
// Anglia — a 9 statisztikai régió.
// ⚠️ A MEGYE-ALIASOK NEM DÍSZEK. A külső állás-aggregátor (Adzuna) az angol
// hirdetésekhez többnyire VÁROS + MEGYE alakot ad („Basildon, Essex"), nem
// régiót — megye-alias nélkül ezek a sorok régió nélkül maradnak, és a
// /allasok régió-szűrője ELDOBJA őket. A ceremoniális megyeneveket használom,
// mert az aggregátorok is azokat adják.
// ⚠️ A név-illesztés TOKEN-határos, ezért a többszór-alakot IS fel kell venni:
// a „hampshire" nem illeszkedik a „northamptonshire"-re, és ez jó — az két
// KÜLÖNBÖZŐ régió (SE, illetve EM).
const GB_REGIONS: Region[] = [
  { code: "LDN", name: "London", aliases: ["londonban", "greater london", "croydon", "wembley", "middlesex"] },
  { code: "SE", name: "South East", aliases: ["délkelet-anglia", "south east england", "brighton", "reading", "oxford", "southampton", "portsmouth", "milton keynes", "slough", "luton", "kent", "surrey", "west sussex", "east sussex", "sussex", "hampshire", "berkshire", "buckinghamshire", "oxfordshire", "isle of wight"] },
  { code: "SW", name: "South West", aliases: ["délnyugat-anglia", "south west england", "bristol", "plymouth", "exeter", "bournemouth", "swindon", "gloucester", "devon", "cornwall", "somerset", "dorset", "gloucestershire", "wiltshire"] },
  { code: "EE", name: "East of England", aliases: ["kelet-anglia", "east anglia", "cambridge", "norwich", "ipswich", "peterborough", "colchester", "chelmsford", "essex", "hertfordshire", "bedfordshire", "cambridgeshire", "norfolk", "suffolk"] },
  { code: "WM", name: "West Midlands", aliases: ["birmingham", "coventry", "wolverhampton", "stoke-on-trent", "stoke", "staffordshire", "warwickshire", "worcestershire", "shropshire", "herefordshire", "solihull", "dudley", "walsall"] },
  { code: "EM", name: "East Midlands", aliases: ["nottingham", "leicester", "derby", "northampton", "lincoln", "derbyshire", "nottinghamshire", "leicestershire", "lincolnshire", "northamptonshire", "rutland"] },
  { code: "YH", name: "Yorkshire and the Humber", aliases: ["yorkshire", "leeds", "sheffield", "bradford", "hull", "york", "doncaster", "humberside", "rotherham", "barnsley", "huddersfield", "wakefield", "harrogate"] },
  { code: "NW", name: "North West", aliases: ["manchester", "liverpool", "preston", "blackpool", "bolton", "warrington", "chester", "lancashire", "cheshire", "merseyside", "cumbria", "wigan", "stockport", "oldham", "rochdale", "salford"] },
  { code: "NE", name: "North East", aliases: ["newcastle", "sunderland", "middlesbrough", "durham", "gateshead", "northumberland", "tyne and wear", "tyneside", "teesside", "darlington", "hartlepool", "stockton-on-tees"] },
];

// Spanyolország — a 17 comunidad autónoma + a 2 autonóm város (Ceuta, Melilla),
// hivatalos ISO 3166-2:ES kódokkal. ⚠️ SZÁNDÉKOSAN a közösség-szint, NEM az 50
// provincia: a provincia-lista háromszor hosszabb választót adna, és a magyar
// közösség földrajzilag amúgy is néhány gócban él (Costa del Sol, Costa Blanca,
// Baleárok, Kanári-szigetek, Madrid, Barcelona) — azok mind egy-egy közösségen
// belül vannak. A provincia-székhelyek és az üdülővárosok ezért ALIASKÉNT
// szerepelnek, hogy a szabad-szöveges hely-feloldás (kereső-heurisztika,
// Telegram-bot, külső állás-szinkron) „Marbella"-ra is megtalálja Andalúziát.
// Az ékezet nélküli alak is bent van, mert a felhasználók ritkán ékezetesen írják.
const ES_REGIONS: Region[] = [
  { code: "MD", name: "Comunidad de Madrid", aliases: ["madrid", "alcalá de henares", "alcala de henares", "móstoles", "mostoles", "getafe", "leganés", "leganes", "fuenlabrada", "alcorcón", "alcorcon", "torrejón", "torrejon", "las rozas"] },
  { code: "CT", name: "Cataluña", aliases: ["katalónia", "katalonia", "catalunya", "barcelona", "girona", "gerona", "tarragona", "lleida", "lérida", "lerida", "badalona", "sabadell", "terrassa", "hospitalet", "l'hospitalet", "mataró", "mataro", "sitges", "salou", "lloret de mar", "costa brava", "costa dorada"] },
  { code: "AN", name: "Andalucía", aliases: ["andalúzia", "andaluzia", "andalucia", "sevilla", "málaga", "malaga", "granada", "córdoba", "cordoba", "cádiz", "cadiz", "almería", "almeria", "huelva", "jaén", "jaen", "marbella", "fuengirola", "torremolinos", "benalmádena", "benalmadena", "estepona", "nerja", "mijas", "jerez", "costa del sol"] },
  { code: "VC", name: "Comunitat Valenciana", aliases: ["valencia", "valència", "alicante", "alacant", "castellón", "castellon", "benidorm", "torrevieja", "elche", "elx", "dénia", "denia", "jávea", "javea", "xàbia", "gandía", "gandia", "calpe", "altea", "orihuela", "costa blanca"] },
  { code: "IB", name: "Illes Balears", aliases: ["baleár-szigetek", "balear-szigetek", "baleárok", "balearok", "baleares", "mallorca", "palma", "palma de mallorca", "ibiza", "eivissa", "menorca", "formentera", "manacor", "alcúdia", "alcudia", "magaluf"] },
  { code: "CN", name: "Canarias", aliases: ["kanári-szigetek", "kanari-szigetek", "kanárik", "kanarik", "tenerife", "gran canaria", "las palmas", "santa cruz de tenerife", "lanzarote", "fuerteventura", "la palma", "la gomera", "el hierro", "maspalomas", "playa del inglés", "playa del ingles", "arrecife", "puerto de la cruz", "adeje", "arona"] },
  { code: "PV", name: "País Vasco", aliases: ["baszkföld", "baszkfold", "euskadi", "bilbao", "bilbo", "san sebastián", "san sebastian", "donostia", "vitoria", "gasteiz", "vitoria-gasteiz", "barakaldo", "getxo", "irún", "irun"] },
  { code: "GA", name: "Galicia", aliases: ["galícia", "galicia", "a coruña", "a coruna", "la coruña", "la coruna", "vigo", "santiago de compostela", "santiago", "ourense", "orense", "pontevedra", "lugo", "ferrol"] },
  { code: "CL", name: "Castilla y León", aliases: ["kasztília és león", "kasztilia es leon", "valladolid", "salamanca", "burgos", "león", "leon", "segovia", "ávila", "avila", "zamora", "palencia", "soria", "ponferrada"] },
  { code: "CM", name: "Castilla-La Mancha", aliases: ["kasztília-la mancha", "kasztilia-la mancha", "toledo", "albacete", "ciudad real", "guadalajara", "cuenca", "talavera", "puertollano"] },
  { code: "AR", name: "Aragón", aliases: ["aragónia", "aragonia", "aragon", "zaragoza", "saragossza", "huesca", "teruel", "calatayud"] },
  { code: "MC", name: "Región de Murcia", aliases: ["murcia", "cartagena", "lorca", "molina de segura", "mar menor", "san javier", "los alcázares", "los alcazares"] },
  { code: "AS", name: "Asturias", aliases: ["asztúria", "aszturia", "asturia", "oviedo", "gijón", "gijon", "avilés", "aviles", "langreo"] },
  { code: "EX", name: "Extremadura", aliases: ["badajoz", "cáceres", "caceres", "mérida", "merida", "plasencia", "don benito"] },
  { code: "NC", name: "Navarra", aliases: ["nafarroa", "pamplona", "iruña", "iruna", "tudela", "barañáin", "baranain"] },
  { code: "CB", name: "Cantabria", aliases: ["kantábria", "kantabria", "santander", "torrelavega", "castro-urdiales"] },
  { code: "RI", name: "La Rioja", aliases: ["rioja", "logroño", "logrono", "calahorra"] },
  { code: "CE", name: "Ceuta", aliases: [] },
  { code: "ML", name: "Melilla", aliases: [] },
];

/** Ország → régiók. A CH a meglévő CANTONS-ra mutat (egyetlen forrás). */
export const REGIONS: Record<string, Region[]> = {
  CH: CANTONS,
  AT: AT_REGIONS,
  DE: DE_REGIONS,
  NL: NL_REGIONS,
  GB: GB_REGIONS,
  ES: ES_REGIONS,
};

/** Az adott ország régiói (ismeretlen ország → üres lista). */
export function getRegions(country: string | null | undefined): Region[] {
  if (!country) return [];
  return REGIONS[country] ?? [];
}

/** Egy konkrét régió az országon belül kód alapján. */
export function getRegion(country: string | null | undefined, code: string | null | undefined): Region | undefined {
  if (!country || !code) return undefined;
  return getRegions(country).find((r) => r.code === code);
}

/** Egy régió kijelző-neve (vagy maga a kód, ha nincs találat). */
export function regionName(country: string | null | undefined, code: string | null | undefined): string {
  return getRegion(country, code)?.name ?? code ?? "";
}

/** A régió-szint magyar felirata az országhoz (alapértelmezett: „régió"). */
export function regionLabel(country: string | null | undefined): string {
  return (country && REGION_LABEL[country]) || "régió";
}
