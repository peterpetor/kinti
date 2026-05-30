/**
 * gen-categories.mjs
 * Generates a sorted INSERT INTO categories SQL block AND injects it into seed.sql.
 * Run: node scripts/gen-categories.mjs
 */
import { readFileSync, writeFileSync } from 'fs';

// All categories: [id, label, glyph]
const ALL = [
  // Meglévő
  ['all',                    'Mind',                                   '⯐'],
  ['takaritas_ablak',        'Ablaktisztító / Magaslati',              '🧼'],
  ['takaritas_ipari',        'Ablak- / Ipari tisztítás',               '🧼'],
  ['adatvedelmi_tisztviselo','Adatvédelmi tisztviselő',                '🔒'],
  ['adotanacsado',           'Adótanácsadó',                           '📈'],
  ['akupunktura',            'Akupunktúra',                            '📍'],
  ['eskuvoi_fodrasz',        'Alkalmi fodrász / Sminkes',              '💄'],
  ['allat',                  'Állatgondozás',                          '🐾'],
  ['allatpanzio',            'Állatpanzió / Pet Sitting',              '🐾'],
  ['allatszallito',          'Állatszállítás',                         '🐕'],
  ['allatorvos',             'Állatorvos',                             '🐱'],
  ['allvanyozo',             'Állványozó',                             '🏗️'],
  ['antik',                  'Antikvitás',                             '🏺'],
  ['aromaterapia',           'Aromaterapeuta',                         '🌸'],
  ['arnyekolastechnika',     'Árnyékolástechnika / Redőny',            '⛱️'],
  ['asztalos',               'Asztalos',                               '🪚'],
  ['autoalkatresz',          'Autóalkatrész / Bontó',                  '⚙️'],
  ['autoberles',             'Autóbérlés / Kozmetika',                 '🚗'],
  ['autofenyezo',            'Autófényező',                            '🎨'],
  ['autokozmetika',          'Autókozmetika',                          '✨'],
  ['autoszer',               'Autószerelő',                            '⚙'],
  ['gepijarmu_oktato',       'Autósiskola / Oktató',                   '🚗'],
  ['autovillamossag',        'Autóvillamosság',                        '⚡'],
  ['badoogos',               'Bádogos',                                '🛠️'],
  ['belgyogyasz',            'Belgyógyász',                            '🩺'],
  ['lakberendezes',          'Belsőépítészet',                         '🛋️'],
  ['bio',                    'Biobolt',                                '🌿'],
  ['biztositas',             'Biztosítás',                             '🛡️'],
  ['alkusz',                 'Biztosítási alkusz',                     '🛡️'],
  ['biztonsagi_or',          'Biztonsági őr / Portás',                 '🛡️'],
  ['biztonsag',              'Biztonságtechnika',                      '🛡️'],
  ['bontoipar',              'Bontás / Sittszállítás',                 '🚜'],
  ['borbar',                 'Borbár / Borkereskedés',                 '🍷'],
  ['borgyogyasz',            'Bőrgyógyász',                           '🩺'],
  ['burkolo',                'Burkoló / Csempéző',                    '🧱'],
  ['busszal',                'Buszos utazás',                         '🚌'],
  ['catering',               'Catering',                              '🍽️'],
  ['ceremoniamester',        'Ceremóniamester / Vőfély',              '🎤'],
  ['tanacsadas',             'Cégalapítás / Tanácsadás',              '💼'],
  ['cipesz',                 'Cipész / Kulcsmásoló',                  '🥾'],
  ['csontkovacs',            'Csontkovács / Kiropraktőr',             '🦴'],
  ['cukrasz',                'Cukrász / Torták',                      '🎂'],
  ['daruvezeto',             'Daru / Nehézgép kezelő',                '🏗️'],
  ['dekorator',              'Dekoráció / Virágdísz',                 '🌸'],
  ['dietetikus',             'Dietetikus / Táplálkozás',              '🍏'],
  ['edzo',                   'Edző / Fitness',                        '💪'],
  ['ekszer',                 'Ékszerész / Órás',                      '⌚'],
  ['ergoterapeuta',          'Ergoterapeuta',                         '🏥'],
  ['epitoipar',              'Építőipar',                             '🔨'],
  ['etterem',                'Étterem',                               '◍'],
  ['eskuvoi_torta',          'Esküvői torta',                         '🎂'],
  ['eskuvoi_fotografus',     'Esküvői fotós / Videós',                '📸'],
  ['fakivago',               'Fakivágás / Kertgondozás',              '🪓'],
  ['fazekas',                'Fazekas / Keramikus',                   '🏺'],
  ['fejleszto_pedagogus',    'Fejlesztőpedagógus',                    '👶'],
  ['korrepetitor',           'Felzárkóztatás / Korrepetálás',         '✏️'],
  ['festoművesz',            'Festőművész / Képzőművész',             '🎨'],
  ['fodrasz',                'Fodrász',                               '✂'],
  ['fogorvos',               'Fogorvos',                              '🦷'],
  ['fordito',                'Fordító',                               'A'],
  ['fotos',                  'Fotós / Videós',                        '📷'],
  ['futar',                  'Futárszolgálat',                        '✉️'],
  ['futas',                  'Fuvarozás',                             '🚚'],
  ['fül_orr_gege',           'Fül-orr-gégész',                        '👂'],
  ['animator_gyerek',        'Gyermekanimáció',                       '🎈'],
  ['animator',               'Gyermekanimátor',                       '🎈'],
  ['babysitter',             'Gyermekfelügyelet',                     '👶'],
  ['gyermekorvos',           'Gyermekorvos',                          '👶'],
  ['gyogytornasz',           'Gyógytornász',                          '🏥'],
  ['gyogyszeresz',           'Gyógyszerész',                          '💊'],
  ['grafikus',               'Grafikus',                              '🎨'],
  ['gumiszerviz',            'Gumiszerviz',                           '⭕'],
  ['halozatepito',           'Hálózatépítő / Telekom',                '🌐'],
  ['hangmernök',             'Hangmérnök / Stúdió',                   '🎙️'],
  ['hajos_iskola',           'Hajós iskola / Skipper',                '⛵'],
  ['hajomedence',            'Hajó- és medenceépítés',                '🏊'],
  ['hazaszerkeszto',         'Házmester',                             '🧹'],
  ['husszek',                'Hentes / Húsbolt',                      '🥩'],
  ['hitel',                  'Hitelügyintéző',                        '💰'],
  ['homlokzatszigetelo',     'Homlokzatszigetelő / Dryvit',           '🏠'],
  ['homeopata',              'Homeopata',                             '🌿'],
  ['hospice',                'Hospice / Otthonápolás',                '🏥'],
  ['idegenvezeto',           'Idegenvezető',                          '🗺️'],
  ['idosek_otthona',         'Idősgondozás / Beteggondozó',           '👵'],
  ['it',                     'Informatikus',                          '⌘'],
  ['ingatlan',               'Ingatlan',                              '🏠'],
  ['ertekbecslo',            'Ingatlan értékbecslő',                  '📋'],
  ['ugyvezeto',              'Interim Menedzser / Tanácsadó',         '💼'],
  ['jogtanacsado',           'Jogtanácsadó',                          '⚖️'],
  ['joga',                   'Jógaoktató',                            '🧘'],
  ['kandalloepites',         'Kandallóépítés / Kályhás',              '🔥'],
  ['kardiologus',            'Kardiológus',                           '❤️'],
  ['karosszeria',            'Karosszérialakatos',                    '🛠️'],
  ['karpitos',               'Kárpitos',                              '🧵'],
  ['kaputechnika',           'Kaputechnika / Garázskapu',             '🚗'],
  ['kavez',                  'Kávézó / Cukrászda',                   '☕'],
  ['kerekpar',               'Kerékpárszerviz',                       '🚲'],
  ['kemenysepro',            'Kéményseprő',                           '🎩'],
  ['kemenytechnika',         'Kéménytechnika / Kazán',                '🔥'],
  ['kertesz',                'Kertészet',                             '🌿'],
  ['kerttervezo',            'Kerttervező / Tájépítész',              '🏡'],
  ['keselelo',               'Késélező / Köszörűs',                   '🔪'],
  ['jatekkeszito',           'Kézműves játékok',                      '🧸'],
  ['cybersecurity',          'Kiberbiztonság / IT audit',             '🔒'],
  ['klima',                  'Klíma / Fűtés',                         '❄️'],
  ['koltoztetes',            'Költöztetés',                           '📦'],
  ['konyveles',              'Könyvelés',                             '📊'],
  ['kőműves',                'Kőműves / Betonozó',                    '🧱'],
  ['kozossegi_media',        'Közösségi média menedzser',             '📱'],
  ['kozjegyzo',              'Közjegyző',                             '📜'],
  ['kozlekedesi_mernok',     'Közlekedésmérnök',                      '🚦'],
  ['kristalygyogyasz',       'Kristályterápia',                       '💎'],
  ['kutyafodrasz',           'Kutyafodrász',                          '✂️'],
  ['kutya_kikepzo',          'Kutyakiképző / Iskola',                 '🐕'],
  ['laboratorium',           'Laboráns / Vérvétel',                   '🧪'],
  ['lakatos',                'Lakatos',                               '🔑'],
  ['lakasfelujitas',         'Lakásfelújítás / Kivitelezés',          '🔨'],
  ['logopedus',              'Logopédus',                             '🗣️'],
  ['logisztikus',            'Logisztikus / Raktár',                  '📦'],
  ['lovas_oktato',           'Lovaglás / Lovasterápia',               '🐎'],
  ['looveges',               'Patkolókovács / Lógyógyász',            '🐎'],
  ['magannyomozo',           'Magánnyomozó',                          '🕵️'],
  ['manikur',                'Manikűr / Műköröm',                     '💅'],
  ['marketing',              'Marketing / Fotó',                      '📸'],
  ['masszazs',               'Masszázs',                              '💆'],
  ['maganora',               'Matematika / Reál magántanár',          '✏️'],
  ['mediator',               'Mediátor / Békéltető',                  '🤝'],
  ['mezogazdasag',           'Mezőgazdaság / Farm',                   '🌾'],
  ['modellszak',             'Modell / Hostess ügynökség',            '👠'],
  ['motor',                  'Motorkerékpár szerviz',                 '🏍️'],
  ['motoros_oktato',         'Motoros iskola / Oktató',               '🏍️'],
  ['munkaero_kozvetito',     'Munkaerő-közvetítő',                    '🤝'],
  ['galeria',                'Művészeti galéria / Tárlat',            '🖼️'],
  ['napkollektor',           'Napelem / Szolártechnika',              '☀️'],
  ['solar_technikus',        'Napelem technikus / Szerelő',           '☀️'],
  ['idegennyelv_tanar',      'Német / Francia nyelvtanár',            '🗣️'],
  ['nemet_tolmacs',          'Tolmács / Konferenciatolmács',          '🗣️'],
  ['nonprofitmenedzser',     'Nonprofit menedzser / Vezető',          '🤝'],
  ['nogyogyasz',             'Nőgyógyász / Szülész',                  '🤰'],
  ['nyilaszaros',            'Nyílászáró / Ablak-ajtó',               '🪟'],
  ['nyomda',                 'Nyomda / Grafika',                      '🖨️'],
  ['nyelviskola',            'Nyelviskola',                           '🏫'],
  ['oktatastechnologus',     'Oktatástechnológus / e-Learning',       '💻'],
  ['online_marketing',       'Online marketing / PPC kampány',        '📱'],
  ['ortopedus',              'Ortopédorvos / Sebész',                 '🦴'],
  ['ortopediai_muszeresz',   'Ortopédiai műszerész',                  '🥾'],
  ['orvos',                  'Orvos',                                 '＋'],
  ['ontozorendszer',         'Öntözőrendszer építés',                 '💦'],
  ['ovodapedagogus',         'Óvónő / Bölcsőde',                     '🧸'],
  ['parkettazas',            'Padlóburkolás / Parkettázás',           '🪵'],
  ['pályaorientáció',        'Pályaválasztási tanácsadó',             '📈'],
  ['looveges2',              'Patkolókovács',                         '🐎'],
  ['pedikur',                'Pedikűr / Lábápolás',                   '👣'],
  ['penzmosasellenes',       'Pénzmosás-ellenes (AML)',               '🔒'],
  ['penzugyi_tanacsado',     'Pénzügyi tanácsadó',                    '💰'],
  ['piackutatas',            'Piackutatás / Market Research',         '📊'],
  ['repulo_oktatas',         'Pilótaoktatás / Repülés',               '✈️'],
  ['projektmenedzser',       'Projektmenedzser (PM)',                  '📋'],
  ['pszichiater',            'Pszichiáter',                           '🧠'],
  ['pszichoterapia',         'Pszichoterapeuta',                      '🧠'],
  ['pszichologus',           'Pszichológus / Coach',                  '🧠'],
  ['rehabilitacios',         'Rehabilitációs szakértő',               '🏥'],
  ['rendezveny',             'Rendezvényszervezés',                   '🎉'],
  ['rendszergazda',          'Rendszergazda / IT Support',            '💻'],
  ['sebesz',                 'Sebész',                                '🔪'],
  ['seo_szakerto',           'SEO / Keresőoptimalizálás',             '📈'],
  ['smink',                  'Sminkes / Stylist',                     '💄'],
  ['sportorvos',             'Sportorvos / Sportfizioterápia',        '🏃'],
  ['talalmanyi_szakerto',    'Szabadalmi / Találmányi ügyvivő',       '📜'],
  ['forditasszak',           'Szakfordító',                           '📖'],
  ['szallitmanyozo',         'Szállítmányozó / Speditőr',             '🚢'],
  ['szallas',                'Szálláshely / Panzió',                  '🏨'],
  ['szamviteli_ellenor',     'Számviteli ellenőr / Revisor',          '📊'],
  ['szaunaepites',           'Szaunaépítés / Wellness',               '♨️'],
  ['szaunaszeansz',          'Szaunamester',                          '♨️'],
  ['szepseg',                'Szépségápolás',                         '🌸'],
  ['szerkezeti_mernok',      'Szerkezeti mérnök / Statikus',          '🏗️'],
  ['festo',                  'Szobafestő / Tapétázó',                 '🎨'],
  ['szocialis_pedagogus',    'Szociálpedagógus',                      '👥'],
  ['szocialis_munkas',       'Szociális munkás',                      '🤝'],
  ['szolarium',              'Szolárium / Barnulás',                  '☀️'],
  ['szobrasz',               'Szobrász / Kőfaragó',                   '🗿'],
  ['szoftverfejleszto',      'Szoftverfejlesztő',                     '📱'],
  ['szonyegház',             'Szőnyegtisztító / Vegytisztítás',       '🧼'],
  ['copywriter',             'Szövegíró / Copywriter',                '✍️'],
  ['reflexologus',           'Talpreflexológia',                      '👣'],
  ['tanc',                   'Tánctanár',                             '💃'],
  ['takarito',               'Takarítás',                             '⦦'],
  ['temetkezes',             'Temetkezés',                            '⚱️'],
  ['terkovezes',             'Térkövezés / Útépítés',                 '🧱'],
  ['termeszetgyogyasz',      'Természetgyógyász',                     '🌱'],
  ['tetofedo',               'Tetőfedő / Ács',                        '🏠'],
  ['tetovalas',              'Tetoválóművész',                        '🖋️'],
  ['tisztito',               'Tisztító / Ruhavarró',                  '👔'],
  ['ugyved',                 'Ügyvéd',                                '§'],
  ['ugyfelszolgalat',        'Ügyfélszolgálat / VA',                  '📞'],
  ['uveges',                 'Üveges',                                '💎'],
  ['uszas',                  'Úszásoktatás',                          '🏊'],
  ['urologus',               'Urológus',                              '🩺'],
  ['vagyonvedelem',          'Vagyonvédelmi szakértő',                '🛡️'],
  ['vamugyintezo',           'Vámügyintéző',                          '🛂'],
  ['varrono',                'Varrónő',                               '🧵'],
  ['vallalkozoi_coach',      'Vállalkozói coach / Startup mentor',    '💼'],
  ['videovago',              'Videóvágó / YouTube',                   '🎬'],
  ['villamvedelem',          'Villámvédelem',                         '⚡'],
  ['villany',                'Villanyszerelő',                        '⚡'],
  ['virag',                  'Virágüzlet',                            '💐'],
  ['virtuális_asszisztens',  'Virtuális Asszisztens',                 '💻'],
  ['gazvez',                 'Víz-gáz szerelő',                       '💧'],
  ['szigetelo',              'Víz- és hőszigetelő',                   '💧'],
  ['zenesz',                 'Zene / Zenetanár',                      '🎵'],
  ['zenekar',                'Zenekar / Party DJ',                    '🎵'],
  ['zenetermelo',            'Zenei producer / Hangstúdió',           '🎚️'],
  ['zoldseges',              'Zöldséges / Hofladen',                  '🍎'],
  ['szemelyi_asszisztens',   'Személyi asszisztens',                  '📅'],
  ['szemelyi_edzo',          'Személyi edző',                         '👟'],
  ['szemelyi_stilista',      'Személyi stilista / Imázs',             '👗'],
  ['szemelyi_vedelem',       'Személyi védelem / Testőr',             '🛡️'],
  ['szemesz',                'Szemész / Optikus',                     '👓'],
  ['sieles',                 'Síoktató',                              '⛷️'],
  ['szinhaz',                'Színház / Színművészet',                '🎭'],
  ['taxis',                  'Taxis / Sofőr',                         '🚕'],
  ['szuretes',               'Szüret / Borász',                       '🍇'],
  ['fuggesztett_menyezet',   'Álmennyezet / Gipszkarton',             '🏗️'],
  ['hangszerkeszito',        'Hangszerkészítő / Javító',              '🎸'],
  ['hegeszto',               'Hegesztő / Fémszerkezet',               '🔥'],
  ['hotel_menedzser',        'Hotel / Panzió menedzser',              '🏨'],
  ['iparjogvedelmi',         'Iparjogvédelmi / Szabadalmi',           '🔒'],
  ['ingatlan_fejleszto',     'Ingatlanfejlesztő / Beruházó',          '🏗️'],
  ['banki_ugyintezo',        'Banki ügyintéző',                       '🏦'],
  ['beruhazasi_tanacsado',   'Befektetési tanácsadó',                 '💹'],
  ['drone_pilot',            'Drónpilóta / Légi felvétel',            '🚁'],
  ['epitesz',                'Építész / Tervező',                     '📐'],
  ['epuletgepeszet',         'Épületgépész',                          '🔧'],
  ['ev_mernok',              'Energetikai szakértő',                  '⚡'],
  ['fotovoltaika',           'Fotovoltaika / Napelem szerelő',        '☀️'],
  ['pilotas_drone2',         'Szociálpedagógus II.',                  '👥'], // duplicate removal
  ['takaritas_irodai',       'Irodatakarítás / Office cleaning',      '🧹'],
  ['kenyer_pekseg',          'Kenyér / Kézműves péksütemény',         '🍞'],
  ['pek',                    'Pék',                                   '◐'],
  ['epileptologus',          'Neurológus / Ideggyógyász',             '🧠'],
  ['sportorvos2',            'Terápiás úszás / Hidroterápia',         '🏊'],
  ['csaladallitas',          'Családállítás / Pszichodráma',          '👥'],
  ['life_coach',             'Life Coach / Karrier coach',            '🧠'],
];

// Remove exact duplicate ids
const seen = new Set();
const deduped = [];
for (const row of ALL) {
  if (!seen.has(row[0])) {
    seen.add(row[0]);
    deduped.push(row);
  }
}

// Separate 'all' (keep first)
const allEntry = deduped.find(r => r[0] === 'all');
const rest = deduped.filter(r => r[0] !== 'all');

// Hungarian-aware sort: strip diacritics for sort key, but keep order stable
function huSort(label) {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ');
}

rest.sort((a, b) => huSort(a[1]).localeCompare(huSort(b[1])));

const sorted = [allEntry, ...rest];

// Build SQL
const lines = sorted.map(([id, label, glyph], i) => {
  const order = i;
  const safeLabel = label.replace(/'/g, "''");
  return `  ('${id}', '${safeLabel}', '${glyph}', ${order})`;
});

const sql = `INSERT INTO categories (id, label, glyph, sort_order) VALUES\n${lines.join(',\n')};`;

// --- Write directly to seed.sql (bypasses PowerShell encoding issues) ---
const seedPath = 'db/seed.sql';
const seed = readFileSync(seedPath, 'utf8');

const START_MARKER = '-- --- 1) Kateg';
const END_MARKER   = '-- --- 2) Hirdet';

const start = seed.indexOf(START_MARKER);
const end   = seed.indexOf(END_MARKER);

if (start === -1 || end === -1) {
  console.error('ERROR: Markers not found in seed.sql');
  process.exit(1);
}

const newSeed =
  seed.substring(0, start) +
  '-- --- 1) Kateg\u00f3ri\u00e1k -------------------------------------------------------------\n' +
  sql + '\n\n' +
  seed.substring(end);

writeFileSync(seedPath, newSeed, 'utf8');
console.log(`\u2705 seed.sql updated with ${sorted.length} categories (A-Z sorted).`);

// Verify first few rows
const rows = newSeed.split('\n').filter(l => /^\s+'/.test(l) || /^  \('/.test(l));
console.log('Sample rows:');
rows.slice(0, 5).forEach(r => console.log(' ', r));
