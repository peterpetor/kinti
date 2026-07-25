/* ============================================================
   Kinti landing — i18n motor (HU alap, DE/EN fordítás).
   - Nyelv: tárolt (kézzel választott) → IP (/cdn-cgi/trace) → fallback EN.
   - Kapcsoló jobbra fent; a kézzel választott nyelv perzisztál (localStorage).
   - A statikus szöveget auto-bejárással fordítja (nulla data-i18n a markupban):
     minden "levél" szöveg-elem eredeti innerHTML-jét lementi, és a magyar
     textContent-kulcs alapján cseréli. Ismeretlen kulcs → marad magyarul.
   - A JS-generált tartalom (hero/demó/carousel) a globális kintiT/kintiCat-ot
     használja, és a 'kintilang' eseményre újrarenderel.
   ============================================================ */
(function () {
  'use strict';
  var LANGS = ['hu', 'de', 'en'];
  var KEY = 'kinti_lang';
  var norm = function (s) { return (s || '').replace(/\s+/g, ' ').trim(); };

  // ─── ország → nyelv ────────────────────────────
  // Németnyelvű terület → de; angolnyelvű → en; magyar → hu; minden más → en (fallback).
  var DE_C = { DE:1, AT:1, CH:1, LI:1 };
  var EN_C = { GB:1, IE:1, US:1, CA:1, AU:1, NZ:1, ZA:1, MT:1, JM:1, SG:1, PH:1, NG:1, KE:1, GH:1, IN:1 };
  function langForCountry(cc) {
    cc = (cc || '').toUpperCase();
    if (cc === 'HU') return 'hu';
    if (DE_C[cc]) return 'de';
    if (EN_C[cc]) return 'en';
    return 'en'; // Hollandia, Svédország, Norvégia stb. → angol fallback
  }

  // ─── kategória-címkék (chip + JS keres) ────────
  var CATS = {
    hu: { all:'Mind', fodrasz:'Fodrász', auto:'Autószerelő', orvos:'Orvos', ugyved:'Ügyvéd', pek:'Pék', etterem:'Étterem', villany:'Villany', takarito:'Takarítás', fordito:'Fordító', tanar:'Tanár' },
    de: { all:'Alle', fodrasz:'Friseur', auto:'KFZ-Werkstatt', orvos:'Arzt', ugyved:'Anwalt', pek:'Bäcker', etterem:'Restaurant', villany:'Elektriker', takarito:'Reinigung', fordito:'Übersetzer', tanar:'Lehrer' },
    en: { all:'All', fodrasz:'Hairdresser', auto:'Mechanic', orvos:'Doctor', ugyved:'Lawyer', pek:'Baker', etterem:'Restaurant', villany:'Electrician', takarito:'Cleaning', fordito:'Translator', tanar:'Teacher' }
  };
  // A JS BUSINESSES catLabel-jei (részletesebbek, mint a chipek) — HU → DE/EN.
  var JLABEL = {
    de: { 'Fodrász':'Friseur', 'Fogorvos':'Zahnarzt', 'Pék':'Bäcker', 'Autószerelő':'KFZ-Werkstatt', 'Étterem':'Restaurant', 'Ügyvéd':'Anwalt', 'Villanyszerelő':'Elektriker', 'Takarítás':'Reinigung', 'Fordító':'Übersetzer', 'Tanár':'Lehrer', 'Háziorvos':'Hausarzt' },
    en: { 'Fodrász':'Hairdresser', 'Fogorvos':'Dentist', 'Pék':'Baker', 'Autószerelő':'Mechanic', 'Étterem':'Restaurant', 'Ügyvéd':'Lawyer', 'Villanyszerelő':'Electrician', 'Takarítás':'Cleaning', 'Fordító':'Translator', 'Tanár':'Teacher', 'Háziorvos':'GP' }
  };
  // JS dinamikus kis-stringek.
  var JS = {
    de: { open:'Geöffnet', featured:'HERVORGEHOBEN', featuredStar:'★ HERVORGEHOBEN', by_distance:'Treffer · nach Entfernung', zero:'<strong>0 Treffer</strong> · versuch etwas anderes', empty:'<div class="big">🤷</div>Hoppla — dafür gibt es noch keinen Treffer. Sei der Erste, der sich in dieser Kategorie einträgt!', min:'Min.', native:'ungarisch' },
    en: { open:'Open', featured:'FEATURED', featuredStar:'★ FEATURED', by_distance:'results · by distance', zero:'<strong>0 results</strong> · try something else', empty:'<div class="big">🤷</div>Oops — no match for that yet. Be the first to register in this category!', min:'min', native:'Hungarian' }
  };

  // ─── STATIKUS FORDÍTÁSOK (kulcs = normalizált magyar textContent) ──────────
  // Az érték lehet HTML (megőrzi az <em>/<strong>/<br>/<a> formázást).
  var TR = { de: {}, en: {} };
  function add(hu, de, en) { TR.de[norm(hu)] = de; TR.en[norm(hu)] = en; }

  // NAV
  add('Hogyan működik', 'So funktioniert’s', 'How it works');
  add('Eszközök', 'Tools', 'Tools');
  add('AI', 'KI', 'AI');
  add('Vállalkozóknak', 'Für Unternehmer', 'For businesses');
  add('PRO', 'PRO', 'PRO');
  add('GYIK', 'FAQ', 'FAQ');
  add('Letöltés', 'Herunterladen', 'Get the app');

  // HERO
  add('Európa-szerte élőben · egy térkép, anyanyelven', 'Europaweit live · eine Karte, in deiner Sprache', 'Live across Europe · one map, in your language');
  add('Találj magyart a közeledben.', 'Finde <em>Ungarn</em> in deiner Nähe.', 'Find a <em>Hungarian</em> near you.');
  add('Fodrász, autószerelő, orvos, ügyvéd, pék — bármi. Egy térkép. Anyanyelven. A Kinti GPS-alapú szakemberkereső a külföldön élő magyaroknak.',
      'Friseur, KFZ-Werkstatt, Arzt, Anwalt, Bäcker — was auch immer. Eine Karte. In deiner Sprache. Kinti ist die GPS-basierte Fachkräfte-Suche für Ungarn im Ausland.',
      'Hairdresser, mechanic, doctor, lawyer, baker — anything. One map. In your language. Kinti is the GPS-based professional finder for Hungarians living abroad.');
  add('Letöltés — ingyenes', 'Herunterladen — kostenlos', 'Get the app — free');
  add('Vállalkozó vagyok', 'Ich bin Unternehmer', 'I’m a business');
  add('Magyar szakemberek és közösség Európa-szerte — egy térképen, anyanyelven.',
      '<strong>Ungarische Fachkräfte</strong> und Community<br>europaweit — auf einer Karte, in deiner Sprache.',
      '<strong>Hungarian professionals</strong> and community<br>across Europe — on one map, in your language.');

  // STATS
  add('külföldön élő magyar Európában', 'Ungarn leben im Ausland in Europa', 'Hungarians live abroad in Europe');
  add('európai ország — mind élőben', 'europäische Länder<br>— alle live', 'European countries<br>— all live');
  add('eszköz, kalkulátor, varázsló — magyarul, ingyen', 'Tools, Rechner, Assistenten<br>— auf Ungarisch, gratis', 'tools, calculators, wizards<br>— in Hungarian, free');
  add('Ingyenes', 'Kostenlos', 'Free');
  add('a keresés — felhasználói díj nincs, egyik országban sem', 'die Suche — keine Nutzergebühr,<br>in keinem Land', 'to search — no user fee,<br>in any country');

  // DEMO
  add('Próbáld ki — most', 'Jetzt ausprobieren', 'Try it — now');
  add('Élőben — egyetlen érintés a magyar segítségig.', 'Live — <em>ein Tipp</em> bis zur ungarischen Hilfe.', 'Live — <em>one tap</em> to Hungarian help.');
  add('Tényleg így működik. Gépelj a keresőbe vagy válassz kategóriát, és nézd ahogy real-time változnak a pinek és a lista. (A demó minta-adatokkal fut — az appban a valódi, moderált bejegyzések jelennek meg.)',
      'Genau so funktioniert es. Tippe in die Suche oder wähle eine Kategorie und sieh, wie sich Pins und Liste in Echtzeit ändern. (Die Demo läuft mit Beispieldaten — in der App erscheinen echte, moderierte Einträge.)',
      'This is exactly how it works. Type in the search or pick a category and watch the pins and list change in real time. (The demo runs on sample data — the app shows real, moderated listings.)');
  add('— vagy kattints egy kategória chipre ↑', '— oder klick auf einen Kategorie-Chip ↑', '— or click a category chip ↑');
  add('Próbáld:', 'Probier:', 'Try:');

  // VIDEO
  add('Nézd meg élőben', 'Sieh es dir an', 'See it in action');
  add('Egy perc, és érted is hogyan működik.', 'Eine Minute, und du <em>verstehst</em>, wie es funktioniert.', 'One minute and you’ll <em>get</em> how it works.');
  add('Rövid bemutató a Kintiről — hogyan találsz magyar szakembert vagy munkát pár érintéssel, ott ahol kint élsz.',
      'Kurze Vorstellung von Kinti — wie du mit ein paar Tipps eine ungarische Fachkraft oder einen Job findest, dort, wo du im Ausland lebst.',
      'A short intro to Kinti — how to find a Hungarian professional or a job with a few taps, right where you live abroad.');

  // CATS / carousel
  add('Így néz ki egy Kinti-profil — demó', 'So sieht ein Kinti-Profil aus — Demo', 'What a Kinti profile looks like — demo');
  add('Konkrét nevek, konkrét emberek.', 'Konkrete Namen, <em>konkrete Menschen.</em>', 'Real names, <em>real people.</em>');
  add('Nem absztrakt kategória, hanem szakember, akit egy érintéssel hívhatsz. Magyarul. (A kártyák illusztrációk — a valódi, admin által moderált bejegyzéseket az appban böngészheted.)',
      'Keine abstrakte Kategorie, sondern eine Fachkraft, die du mit einem Tipp anrufst. Auf Ungarisch. (Die Karten sind Illustrationen — die echten, vom Admin moderierten Einträge findest du in der App.)',
      'Not an abstract category, but a professional you can call with one tap. In Hungarian. (The cards are illustrations — browse the real, admin-moderated listings in the app.)');
  add('Hiányzik egy szakember vagy egy kategória? Szólj nekünk →', 'Fehlt eine Fachkraft oder eine Kategorie? Sag uns Bescheid →', 'Missing a professional or a category? Let us know →');

  // GEOMAP
  add('Európai közösség', 'Europäische Community', 'European community');
  add('Ott, ahol magyarok élnek.', 'Dort, wo <em>Ungarn</em> leben.', 'Where <em>Hungarians</em> live.');
  add('Hat országban, egy térképen, anyanyelven. Válaszd ki, hol vagy kint — a magyar közösség már ott van.',
      'In sechs Ländern, auf einer Karte, in deiner Sprache. Wähle, wo du im Ausland bist — die ungarische Community ist schon da.',
      'In six countries, on one map, in your language. Pick where you live abroad — the Hungarian community is already there.');
  add('Élőben', 'Live', 'Live');
  add('Svájc', 'Schweiz', 'Switzerland');
  add('Ausztria', 'Österreich', 'Austria');
  add('Németország', 'Deutschland', 'Germany');
  add('Hollandia', 'Niederlande', 'Netherlands');
  add('Anglia', 'England', 'England');
  add('Spanyolország', 'Spanien', 'Spain');
  add('Válaszd ki a menüből, melyik országban vagy kint — a térkép és a tartalom oda igazodik.',
      'Wähle im Menü, in welchem Land du im Ausland bist — Karte und Inhalte passen sich an.',
      'Pick your country from the menu — the map and content adapt to it.');

  // CTA
  add('★ INGYENES · 2026 ÓTA ÉL', '★ KOSTENLOS · SEIT 2026 LIVE', '★ FREE · LIVE SINCE 2026');
  add('Egy térkép. Egy közösség. Az otthon, ami kint maradt.', 'Eine Karte. Eine Community.<br><em>Das Zuhause, das im Ausland blieb.</em>', 'One map. One community.<br><em>The home you carried abroad.</em>');
  add('Töltsd le, és csatlakozz a magyar közösséghez — Európa hat országában, egy térképen. Ingyenes, és fiók nélkül is használható.',
      'Lade sie herunter und schließ dich der ungarischen Community an — in sechs Ländern Europas, auf einer Karte. Kostenlos und auch ohne Konto nutzbar.',
      'Download it and join the Hungarian community — in six European countries, on one map. Free, and usable without an account.');
  add('Iratkozz fel az értesítésre', 'Für Benachrichtigungen anmelden', 'Sign up for alerts');

  // FOOTER
  add('GPS-alapú magyar szakember- és állás-kereső a külföldön élő magyaroknak. Hat országban — Svájc, Ausztria, Németország, Hollandia, Anglia, Spanyolország —, ott, ahol kint élsz.',
      'GPS-basierte Suche nach ungarischen Fachkräften und Jobs für Ungarn im Ausland. In sechs Ländern — Schweiz, Österreich, Deutschland, Niederlande, England, Spanien —, dort, wo du lebst.',
      'GPS-based finder for Hungarian professionals and jobs, for Hungarians living abroad. In six countries — Switzerland, Austria, Germany, the Netherlands, England, Spain — right where you live.');
  add('Termék', 'Produkt', 'Product');
  add('Kategóriák', 'Kategorien', 'Categories');
  // 'Letöltés' fordítását a nav-CTA add()-ja adja (Herunterladen / Get the app) — a footer
  // link is azt használja; itt szándékosan NINCS külön (kulcs-ütközés lenne, ld. nav-CTA).
  add('Regisztráció', 'Registrieren', 'Register');
  add('Kiemelt csomag', 'Premium-Paket', 'Premium plan');
  add('Dashboard belépés', 'Dashboard-Login', 'Dashboard login');
  add('Munkaerő-közvetítés (AT·DE·NL)', 'Personalvermittlung (AT·DE·NL)', 'Recruitment (AT·DE·NL)');
  add('Cég', 'Unternehmen', 'Company');
  add('Impresszum', 'Impressum', 'Imprint');
  add('Adatvédelem', 'Datenschutz', 'Privacy');
  add('Felhasználási feltételek', 'Nutzungsbedingungen', 'Terms of use');
  add('Visszatérítés és elállás', 'Rückerstattung & Widerruf', 'Refunds & cancellation');
  add('AI-átláthatóság', 'KI-Transparenz', 'AI transparency');
  add('Kapcsolat', 'Kontakt', 'Contact');
  add('A Kinti kalkulátorai és útmutatói tájékoztató jellegű becslések — nem minősülnek jogi, adó-, pénzügyi vagy bevándorlási tanácsadásnak; hivatalos ügyben mindig az illetékes hatóság az irányadó. Az oldalon látható profil-, értékelés- és statisztika-példák illusztrációk. Térkép-adatok: © OpenStreetMap közreműködők (ODbL).',
      'Kintis Rechner und Ratgeber sind informative Schätzungen — sie stellen keine rechtliche, steuerliche, finanzielle oder migrationsbezogene Beratung dar; in offiziellen Angelegenheiten ist stets die zuständige Behörde maßgeblich. Die gezeigten Profil-, Bewertungs- und Statistik-Beispiele sind Illustrationen. Kartendaten: © OpenStreetMap-Mitwirkende (ODbL).',
      'Kinti’s calculators and guides are informational estimates — they are not legal, tax, financial or immigration advice; for official matters the competent authority always prevails. The profile, review and statistics examples shown are illustrations. Map data: © OpenStreetMap contributors (ODbL).');
  add('© 2026 kinti.app · Üzemelteti: Feedback Jobs S.R.L. — Made with ♥ for kintiek',
      '© 2026 kinti.app · Betrieben von <strong>Feedback Jobs S.R.L.</strong> — Made with ♥ für Auslandsungarn',
      '© 2026 kinti.app · Operated by <strong>Feedback Jobs S.R.L.</strong> — Made with ♥ for Hungarians abroad');

  // ESZKÖZÖK (modulok)
  add('Több, mint kereső', 'Mehr als eine Suche', 'More than a finder');
  add('Eszközök — magyarul a kinti hétköznapokhoz.', 'Tools — <em>auf Ungarisch</em> für den Alltag im Ausland.', 'Tools — <em>in Hungarian</em> for everyday life abroad.');
  add('Bérkalkulátor, árfolyam-kalkulátor, ügyintézés-varázsló, engedély-kalauz, állásbörze — minden, amit egy újonnan érkezett magyarnak külföldön tudni érdemes. Hat országban — 🇨🇭 Svájc, 🇦🇹 Ausztria, 🇩🇪 Németország, 🇳🇱 Hollandia, 🇬🇧 Anglia, 🇪🇸 Spanyolország — egy appban. Ahol egy eszköz még nem minden országban él, ott jelöljük.',
      'Lohnrechner, Wechselkurs-Rechner, Behörden-Assistent, Aufenthalts-Guide, Jobbörse — alles, was neu angekommene Ungarn im Ausland wissen sollten. In sechs Ländern — 🇨🇭 Schweiz, 🇦🇹 Österreich, 🇩🇪 Deutschland, 🇳🇱 Niederlande, 🇬🇧 England, 🇪🇸 Spanien — in einer App. Wo ein Tool noch nicht in jedem Land verfügbar ist, kennzeichnen wir es.',
      'Salary calculator, exchange-rate calculator, admin wizard, permit guide, job board — everything a newly arrived Hungarian should know abroad. In six countries — 🇨🇭 Switzerland, 🇦🇹 Austria, 🇩🇪 Germany, 🇳🇱 Netherlands, 🇬🇧 England, 🇪🇸 Spain — in one app. Where a tool isn’t live in every country yet, we flag it.');
  add('💰 Pénz', '💰 Geld', '💰 Money');
  add('Bérkalkulátor + Ajánlataim', 'Lohnrechner + Meine Angebote', 'Salary calculator + My offers');
  add('Nettó-bér becslés a helyi adó- és járulékszabályokkal, mind a 4 országban (🇳🇱 Box 1 + heffingskortingen is). Interjún kapott ajánlatokat elmenthetsz és összehasonlíthatsz.',
      'Nettolohn-Schätzung mit den lokalen Steuer- und Abgabenregeln, in allen 4 Ländern (🇳🇱 Box 1 + heffingskortingen inklusive). Angebote aus Vorstellungsgesprächen kannst du speichern und vergleichen.',
      'Net-salary estimate with local tax and contribution rules, in all 4 countries (🇳🇱 Box 1 + heffingskortingen too). Save and compare offers you get from interviews.');
  add('💱 Árfolyam', '💱 Wechselkurs', '💱 Exchange rate');
  add('CHF / EUR → HUF push-riasztó', 'CHF / EUR → HUF Push-Alarm', 'CHF / EUR → HUF push alert');
  add('Beállítasz egy küszöböt („értesíts ha 1 CHF ≥ 410 HUF"), és a böngésződ riaszt — bejelentkezés és email-cím nélkül. Mind a 4 országban.',
      'Du setzt einen Schwellenwert („benachrichtige mich, wenn 1 CHF ≥ 410 HUF"), und dein Browser warnt dich — ohne Login und E-Mail. In allen 4 Ländern.',
      'Set a threshold (“alert me when 1 CHF ≥ 410 HUF”) and your browser notifies you — no login or email. In all 4 countries.');
  add('🏠 Lakhatás', '🏠 Wohnen', '🏠 Housing');
  add('Lakásbérlés rejtett-költség', 'Miete: versteckte Kosten', 'Renting: hidden costs');
  add('Kaució blokkolása + rezsi (Nebenkosten/Betriebskosten/Servicekosten) év-végi elszámolás becslése, mind a 4 országban (🇨🇭 🇦🇹 🇩🇪 🇳🇱). Mire számíts havonta valójában?',
      'Mietkaution (Sperrkonto) + Jahresabrechnung der Nebenkosten (Betriebskosten/Servicekosten) — Schätzung, in allen 4 Ländern (🇨🇭 🇦🇹 🇩🇪 🇳🇱). Womit du monatlich wirklich rechnen musst.',
      'Deposit blocking + year-end utilities (Nebenkosten/Betriebskosten/Servicekosten) estimate, in all 4 countries (🇨🇭 🇦🇹 🇩🇪 🇳🇱). What to really expect per month.');
  add('🛂 Vám', '🛂 Zoll', '🛂 Customs');
  add('Vám- és határinfó', 'Zoll- & Grenzinfo', 'Customs & border info');
  add('300 CHF értékhatár, 1 kg/fő húskorlát, 5 l bor, 1 l pálinka. Mi van a kocsiban — mit deklarálj? (🇨🇭 svájci határ)',
      '300 CHF Freigrenze, 1 kg Fleisch/Person, 5 l Wein, 1 l Schnaps. Was ist im Auto — was musst du deklarieren? (🇨🇭 Schweizer Grenze)',
      '300 CHF allowance, 1 kg meat/person, 5 l wine, 1 l spirits. What’s in the car — what to declare? (🇨🇭 Swiss border)');
  add('🚓 Bírság', '🚓 Bußgeld', '🚓 Fines');
  add('Gyorshajtás-bírság becslő', 'Tempo-Bußgeld-Schätzer', 'Speeding-fine estimator');
  add('A helyi bírság-rendszerek becslője, mind a 4 országban (🇨🇭 Tagessätze/Raserdelikt, 🇦🇹, 🇩🇪 Bußgeldkatalog, 🇳🇱 WAHV-boete/CJIB). Mennyit fog fájni a gyorshajtás?',
      'Schätzer für die lokalen Bußgeld-Systeme, in allen 4 Ländern (🇨🇭 Tagessätze/Raserdelikt, 🇦🇹, 🇩🇪 Bußgeldkatalog, 🇳🇱 WAHV-boete/CJIB). Was kostet zu schnelles Fahren?',
      'Estimator for local fine systems, in all 4 countries (🇨🇭 Tagessätze/Raserdelikt, 🇦🇹, 🇩🇪 Bußgeldkatalog, 🇳🇱 WAHV-boete/CJIB). How much will speeding cost you?');
  add('🚆 Közlekedés', '🚆 Verkehr', '🚆 Transport');
  add('Tömegközlekedés-kalauz', 'ÖPNV-Guide', 'Public transport guide');
  add('Zónarendszerek + bérlet-kalkulátor + mobil-appok, mind a 4 országban (🇨🇭 GA/Halbtax·SBB, 🇦🇹 KlimaTicket, 🇩🇪 Deutschlandticket, 🇳🇱 OVpay/OV-chipkaart).',
      'Zonensysteme + Abo-Rechner + Mobil-Apps, in allen 4 Ländern (🇨🇭 GA/Halbtax·SBB, 🇦🇹 KlimaTicket, 🇩🇪 Deutschlandticket, 🇳🇱 OVpay/OV-chipkaart).',
      'Zone systems + pass calculator + mobile apps, in all 4 countries (🇨🇭 GA/Halbtax·SBB, 🇦🇹 KlimaTicket, 🇩🇪 Deutschlandticket, 🇳🇱 OVpay/OV-chipkaart).');
  add('🔄 Szolgáltató', '🔄 Anbieter', '🔄 Providers');
  add('Szolgáltató-váltó', 'Anbieterwechsel', 'Switch providers');
  add('Krankenkasse, áram, internet, mobil, bank — mikor és hogyan érdemes váltani, valós szolgáltató-listákkal mind a 4 országban (🇨🇭 🇦🇹 🇩🇪 🇳🇱). Német és holland felmondó-sablon is.',
      'Krankenkasse, Strom, Internet, Mobilfunk, Bank — wann und wie sich ein Wechsel lohnt, mit echten Anbieterlisten in allen 4 Ländern (🇨🇭 🇦🇹 🇩🇪 🇳🇱). Inkl. deutscher und niederländischer Kündigungsvorlage.',
      'Health insurance, electricity, internet, mobile, bank — when and how to switch, with real provider lists in all 4 countries (🇨🇭 🇦🇹 🇩🇪 🇳🇱). Plus German and Dutch cancellation templates.');
  add('📋 Ügyintézés', '📋 Behörden', '📋 Admin');
  add('Ügyintézés varázsló', 'Behörden-Assistent', 'Admin wizard');
  add('Az érkezéstől az állampolgárságig — csekklisták az Anmeldung-tól a letelepedésig, mind a 4 országban (🇨🇭 🇦🇹 🇩🇪 + 🇳🇱 BRP/BSN/DigiD), kattintható hivatali szó-magyarázattal.',
      'Von der Ankunft bis zur Staatsbürgerschaft — Checklisten von der Anmeldung bis zur Niederlassung, in allen 4 Ländern (🇨🇭 🇦🇹 🇩🇪 + 🇳🇱 BRP/BSN/DigiD), mit anklickbarer Erklärung von Behördenbegriffen.',
      'From arrival to citizenship — checklists from Anmeldung to settling in, in all 4 countries (🇨🇭 🇦🇹 🇩🇪 + 🇳🇱 BRP/BSN/DigiD), with clickable explanations of official terms.');
  add('🪪 Engedély', '🪪 Aufenthalt', '🪪 Permit');
  add('Melyik engedély kell?', 'Welchen Aufenthaltstitel brauchst du?', 'Which permit do you need?');
  add('Interaktív varázsló, ami megmondja melyik tartózkodási státusz vonatkozik rád (🇨🇭 B/C/L/G, 🇦🇹 🇩🇪 EU-regisztráció, 🇳🇱 BRP/BSN + duurzaam verblijf).',
      'Interaktiver Assistent, der dir sagt, welcher Aufenthaltsstatus für dich gilt (🇨🇭 B/C/L/G, 🇦🇹 🇩🇪 EU-Anmeldung, 🇳🇱 BRP/BSN + duurzaam verblijf).',
      'An interactive wizard that tells you which residence status applies to you (🇨🇭 B/C/L/G, 🇦🇹 🇩🇪 EU registration, 🇳🇱 BRP/BSN + duurzaam verblijf).');
  add('✈️ Repjegy', '✈️ Flug', '✈️ Flights');
  add('Budapest ↔ hazaút figyelő', 'Budapest ↔ Heimreise-Beobachter', 'Budapest ↔ home-trip watcher');
  add('Repjegy ár-sávok Zürich, Bécs, a német városok és Amszterdam felé-vissza (🇨🇭 🇦🇹 🇩🇪 🇳🇱) + szezonális tippek + link a foglalási oldalakra.',
      'Flugpreis-Bänder von/nach Zürich, Wien, den deutschen Städten und Amsterdam (🇨🇭 🇦🇹 🇩🇪 🇳🇱) + saisonale Tipps + Links zu Buchungsseiten.',
      'Flight-price ranges to/from Zürich, Vienna, the German cities and Amsterdam (🇨🇭 🇦🇹 🇩🇪 🇳🇱) + seasonal tips + links to booking sites.');
  add('💼 Munka', '💼 Arbeit', '💼 Work');
  add('Magyar állásbörze + radar', 'Ungarische Jobbörse + Radar', 'Hungarian job board + radar');
  add('Állások magyaroknak mind a 4 országban — CV-profillal és állás-radar push-értesítéssel, ha új találat jön a környékeden.',
      'Jobs für Ungarn in allen 4 Ländern — mit CV-Profil und Job-Radar-Push, wenn ein neuer Treffer in deiner Nähe erscheint.',
      'Jobs for Hungarians in all 4 countries — with a CV profile and job-radar push when a new match appears near you.');
  add('🛡️ Polgárság', '🛡️ Bürgerschaft', '🛡️ Citizenship');
  add('Állampolgárság-szimulátor', 'Einbürgerungs-Simulator', 'Citizenship simulator');
  add('Felkészítő kvíz mind a 4 országra (🇨🇭 Einbürgerung, 🇦🇹 Staatsbürgerschaft, 🇩🇪 Einbürgerungstest, 🇳🇱 inburgering). Hivatalos vizsgát nem helyettesít.',
      'Vorbereitungs-Quiz für alle 4 Länder (🇨🇭 Einbürgerung, 🇦🇹 Staatsbürgerschaft, 🇩🇪 Einbürgerungstest, 🇳🇱 inburgering). Ersetzt keine offizielle Prüfung.',
      'Prep quiz for all 4 countries (🇨🇭 Einbürgerung, 🇦🇹 Staatsbürgerschaft, 🇩🇪 Einbürgerungstest, 🇳🇱 inburgering). Not a substitute for the official exam.');
  add('🎯 Tudás', '🎯 Wissen', '🎯 Knowledge');
  add('Napi kvíz', 'Tägliches Quiz', 'Daily quiz');
  add('Egy kérdés naponta — kultúra, történelem, gasztronómia, az országodhoz igazítva (mind a 4 ország). Lazító ismeret-szerzés.',
      'Eine Frage pro Tag — Kultur, Geschichte, Gastronomie, an dein Land angepasst (alle 4 Länder). Entspanntes Dazulernen.',
      'One question a day — culture, history, food, tailored to your country (all 4 countries). Relaxed learning.');
  add('🧭 Iránytű', '🧭 Kompass', '🧭 Compass');
  add('Bér- és lakbér-iránytű', 'Lohn- & Miet-Kompass', 'Salary & rent compass');
  add('Anonim közösségi benchmark: mennyit keresnek és mennyi lakbért fizetnek a magyarok a régiódban. Mind a 4 országban.',
      'Anonymer Community-Benchmark: wie viel Ungarn in deiner Region verdienen und Miete zahlen. In allen 4 Ländern.',
      'Anonymous community benchmark: how much Hungarians earn and pay in rent in your region. In all 4 countries.');
  add('🧾 Megélhetés', '🧾 Lebenshaltung', '🧾 Cost of living');
  add('Mennyi marad?', 'Was bleibt übrig?', 'What’s left?');
  add('Kiköltözési költségvetés-tervező: bruttó bér + család + város → nettó fizetés, lakbér, megélhetés — és ami a hónap végén marad. Mind a 4 országban.',
      'Auswanderungs-Budgetplaner: Bruttolohn + Familie + Stadt → Nettolohn, Miete, Lebenshaltung — und was am Monatsende übrig bleibt. In allen 4 Ländern.',
      'Relocation budget planner: gross salary + family + city → net pay, rent, living costs — and what’s left at month-end. In all 4 countries.');
  add('💸 Utalás', '💸 Überweisung', '💸 Transfers');
  add('Utalás-asszisztens', 'Überweisungs-Assistent', 'Transfer assistant');
  add('Hazautalás-tervező: árfolyam-figyelés és költség-összevetés a szolgáltatók között. (Kinti PRO.)',
      'Heimüberweisungs-Planer: Kursüberwachung und Kostenvergleich zwischen Anbietern. (Kinti PRO.)',
      'Home-transfer planner: rate monitoring and cost comparison between providers. (Kinti PRO.)');
  add('⏰ Határidők', '⏰ Fristen', '⏰ Deadlines');
  add('Határidő-asszisztens', 'Fristen-Assistent', 'Deadline assistant');
  add('A kinti bürokrácia határidői (Krankenkasse-váltás, adóbevallás…) egy helyen, push-emlékeztetővel 14/7/1 nappal előtte. (Kinti PRO.)',
      'Die Fristen der Bürokratie im Ausland (Krankenkassenwechsel, Steuererklärung…) an einem Ort, mit Push-Erinnerung 14/7/1 Tage vorher. (Kinti PRO.)',
      'The deadlines of bureaucracy abroad (health-insurance switch, tax return…) in one place, with push reminders 14/7/1 days before. (Kinti PRO.)');
  add('📌 Hivatal', '📌 Behörde', '📌 Officials');
  add('Itt intézheted — hivatalos linkek', 'Hier erledigst du es — offizielle Links', 'Do it here — official links');
  add('Ellenőrzött hivatalos link-gyűjtemény + magyar konzulátusok és időpontfoglalás, mind a 4 országra. Nem tanácsadás — odavezet.',
      'Geprüfte Sammlung offizieller Links + ungarische Konsulate und Terminbuchung, für alle 4 Länder. Keine Beratung — führt dich hin.',
      'A verified collection of official links + Hungarian consulates and appointment booking, for all 4 countries. Not advice — it points you there.');
  add('🙋 Keresek', '🙋 Ich suche', '🙋 Wanted');
  add('„Keresek…" tábla', '„Ich suche…"-Board', '“Wanted…” board');
  add('Kiírod, mire van szükséged (költöztető, bébiszitter, fordító…), és a magyar szakik jelentkeznek. Mind a 4 országban.',
      'Du schreibst aus, was du brauchst (Umzug, Babysitter, Übersetzer…), und ungarische Profis melden sich. In allen 4 Ländern.',
      'Post what you need (mover, babysitter, translator…) and Hungarian pros reach out. In all 4 countries.');
  add('🔑 Albérlet', '🔑 Mietwohnung', '🔑 Rentals');
  add('Szoba- és albérlet-börze', 'Zimmer- & Wohnungsbörse', 'Rooms & flats board');
  add('Kiadó szobák és albérletek magyaroktól magyaroknak — vagy add fel, mit keresel. Ország-, régió- és település-szűrővel, moderált hirdetésekkel, mind a 4 országban. A hirdetők közvetlenül egymással egyeznek meg — a böngészés ingyenes, a hirdető elérhetőségének megnyitásához Kinti PRO kell. (Kinti PRO.)',
      'Zimmer und Wohnungen von Ungarn für Ungarn — oder inseriere, was du suchst. Mit Länder-, Regions- und Ortsfilter, moderierte Anzeigen, in allen 4 Ländern. Inserenten einigen sich direkt — Stöbern ist gratis, für die Kontaktdaten des Inserenten brauchst du Kinti PRO. (Kinti PRO.)',
      'Rooms and flats from Hungarians for Hungarians — or post what you’re looking for. With country, region and town filters, moderated listings, in all 4 countries. Posters arrange directly — browsing is free, opening a poster’s contact needs Kinti PRO. (Kinti PRO.)');
  add('🎟️ Kedvezmény', '🎟️ Rabatt', '🎟️ Discount');
  add('Kinti Pass kedvezménykártya', 'Kinti-Pass-Rabattkarte', 'Kinti Pass discount card');
  add('Ingyenes digitális kártya az appban — mutasd fel a Kinti Pass elfogadóhelyeken (magyar vállalkozások a Szaknévsorból), és kedvezményt kapsz. Az elfogadóhelyeket külön szűrővel találod meg.',
      'Kostenlose digitale Karte in der App — zeig sie an den Kinti-Pass-Akzeptanzstellen (ungarische Unternehmen aus dem Branchenbuch) vor und erhalte Rabatt. Die Akzeptanzstellen findest du mit einem eigenen Filter.',
      'Free digital card in the app — show it at Kinti Pass partner spots (Hungarian businesses from the directory) and get a discount. Find partner spots with a dedicated filter.');
  add('📚 Tudástár', '📚 Wissensbasis', '📚 Knowledge base');
  add('Tudásbázis — 80+ útmutató', 'Wissensbasis — 80+ Ratgeber', 'Knowledge base — 80+ guides');
  add('Bejelentkezés, egészségbiztosítás, adózás, lakásbérlés, nyugdíj, családi pótlék — hivatalos forrásokból, magyarul, mind a 4 országban (🇨🇭 🇦🇹 🇩🇪 🇳🇱).',
      'Anmeldung, Krankenversicherung, Steuern, Miete, Rente, Kindergeld — aus offiziellen Quellen, auf Ungarisch, in allen 4 Ländern (🇨🇭 🇦🇹 🇩🇪 🇳🇱).',
      'Registration, health insurance, taxes, renting, pension, family allowance — from official sources, in Hungarian, in all 4 countries (🇨🇭 🇦🇹 🇩🇪 🇳🇱).');
  add('📄 Önéletrajz', '📄 Lebenslauf', '📄 CV');
  add('Német önéletrajz-készítő', 'Deutscher Lebenslauf-Generator', 'German CV builder');
  add('Magyarul kitöltöd, DIN-szabványos német Lebenslauf PDF-et kapsz — ingyen, a szakmád hivatalos német nevével. A kész önéletrajzhoz magyar-barát állásokat is ajánlunk.',
      'Du füllst das Formular auf Ungarisch aus und erhältst einen DIN-konformen deutschen Lebenslauf als PDF — gratis, mit dem offiziellen deutschen Namen deines Berufs. Zum fertigen Lebenslauf empfehlen wir auch ungarnfreundliche Jobs.',
      'Fill it in Hungarian and get a DIN-standard German Lebenslauf PDF — free, with the official German name of your profession. We also suggest Hungarian-friendly jobs for your finished CV.');
  add('🏫 Iskola', '🏫 Schule', '🏫 School');
  add('Iskolarendszer-kalauz', 'Schulsystem-Guide', 'School-system guide');
  add('Hogyan épül fel a helyi iskolarendszer, és mikor mit kell intézned, ha gyerekkel érkezel — mind a 4 országban (🇨🇭 🇦🇹 🇩🇪 + 🇳🇱 basisschool→VWO).',
      'Wie das lokale Schulsystem aufgebaut ist und was du wann erledigen musst, wenn du mit Kind ankommst — in allen 4 Ländern (🇨🇭 🇦🇹 🇩🇪 + 🇳🇱 basisschool→VWO).',
      'How the local school system is structured and what to arrange when, if you arrive with a child — in all 4 countries (🇨🇭 🇦🇹 🇩🇪 + 🇳🇱 basisschool→VWO).');
  add('✍️ Történetek', '✍️ Geschichten', '✍️ Stories');
  add('Élettörténetek — magyarok külföldön', 'Lebensgeschichten — Ungarn im Ausland', 'Life stories — Hungarians abroad');
  add('Valódi kiköltözési sztorik magyaroktól — munka, lakás, mélypontok és sikerek. Olvasd, meríts belőle, és írd meg a sajátodat is; minden történet szerkesztői ellenőrzés után jelenik meg.',
      'Echte Auswanderungs-Geschichten von Ungarn — Arbeit, Wohnung, Tiefpunkte und Erfolge. Lies, lass dich inspirieren und schreib deine eigene; jede Geschichte erscheint nach redaktioneller Prüfung.',
      'Real relocation stories from Hungarians — work, housing, low points and wins. Read, take inspiration, and write your own; every story appears after editorial review.');
  add('🤖 Telegram', '🤖 Telegram', '🤖 Telegram');
  add('Kinti bot Telegramon', 'Kinti-Bot auf Telegram', 'Kinti bot on Telegram');
  add('A Szaknévsor ott is, ahol a csoportok élnek: írd be bármelyik Telegram-chatben, hogy @KintiSzaknevsorBot fodrász Graz, és azonnal hozza a magyar szakikat — letöltés nélkül, mind a 4 országban.',
      'Das Branchenbuch auch dort, wo die Gruppen leben: schreib in jedem Telegram-Chat <strong>@KintiSzaknevsorBot Friseur Graz</strong>, und es bringt sofort die ungarischen Profis — ohne Download, in allen 4 Ländern.',
      'The directory where the groups live too: type <strong>@KintiSzaknevsorBot hairdresser Graz</strong> in any Telegram chat and it instantly brings up Hungarian pros — no download, in all 4 countries.');
  add('🗣️ Nyelv', '🗣️ Sprache', '🗣️ Language');
  add('Nyelvlecke + napi szó', 'Sprachlektion + Wort des Tages', 'Language lesson + word of the day');
  add('100-100 lecke kiejtéssel, mind a 4 országra (🇨🇭 svájci-német Mundart, 🇦🇹 osztrák, 🇩🇪 német, 🇳🇱 holland) + napi szó a kezdőlapon. Teljesen ingyenes.',
      'Je 100 Lektionen mit Aussprache, für alle 4 Länder (🇨🇭 Schweizerdeutsch/Mundart, 🇦🇹 Österreichisch, 🇩🇪 Deutsch, 🇳🇱 Niederländisch) + Wort des Tages auf der Startseite. Komplett kostenlos.',
      '100 lessons each with pronunciation, for all 4 countries (🇨🇭 Swiss-German dialect, 🇦🇹 Austrian, 🇩🇪 German, 🇳🇱 Dutch) + word of the day on the home screen. Completely free.');

  // COMMUNITY (#kozosseg)
  add('Kint vagy, de nem vagy egyedül', 'Im Ausland, aber nicht allein', 'Abroad, but not alone');
  add('A Kinti több, mint egy kereső.', 'Kinti ist mehr als <em>eine Suche.</em>', 'Kinti is more than <em>a finder.</em>');
  add('Állásbörze, szakember-kereső, beilleszkedési útmutatók — minden, amit a magyar közösségnek kint adni tud.',
      'Jobbörse, Fachkräfte-Suche, Integrations-Ratgeber — alles, was es der ungarischen Community im Ausland bieten kann.',
      'Job board, professional finder, integration guides — everything it can offer the Hungarian community abroad.');
  add('Állásbörze', 'Jobbörse', 'Job board');
  add('Magyar állások — egy helyen.', 'Ungarische Jobs — an einem Ort.', 'Hungarian jobs — in one place.');
  add('Munkaadók és magyar munkavállalók kint egymásra találnak. Nyilvánosan, kategorizálva, magyarul — és német-tudás szerint szűrve.',
      'Arbeitgeber und ungarische Arbeitnehmer finden im Ausland zueinander. Öffentlich, kategorisiert, auf Ungarisch — und nach Deutschkenntnissen gefiltert.',
      'Employers and Hungarian workers find each other abroad. Publicly, categorized, in Hungarian — and filtered by German level.');
  add('TELJES', 'VOLLZEIT', 'FULL-TIME');
  add('RÉSZMUNKA', 'TEILZEIT', 'PART-TIME');
  add('ALKALMI', 'GELEGENHEIT', 'CASUAL');
  add('Magyarul beszélő pincér — belváros', 'Ungarischsprachiger Kellner — Innenstadt', 'Hungarian-speaking waiter — city centre');
  add('Zürich · 4 200 CHF / hó · ma', 'Zürich · 4 200 CHF / Monat · heute', 'Zürich · CHF 4,200 / month · today');
  add('Bébiszittert keresek heti 2x', 'Suche Babysitter, 2×/Woche', 'Looking for a babysitter, 2×/week');
  add('Wollishofen · 28 CHF/óra · 5 órája', 'Wollishofen · 28 CHF/Std. · vor 5 Std.', 'Wollishofen · CHF 28/hr · 5h ago');
  add('Költöztetéshez segítség, szombat', 'Umzugshilfe, Samstag', 'Moving help, Saturday');
  add('Oerlikon · 30 CHF/óra · tegnap', 'Oerlikon · 30 CHF/Std. · gestern', 'Oerlikon · CHF 30/hr · yesterday');

  // AI
  add('✨ AI a magyaroknak', '✨ KI für Ungarn', '✨ AI for Hungarians');
  add('Mesterséges intelligencia — magyar nyelven.', 'Künstliche Intelligenz — <em>auf Ungarisch.</em>', 'Artificial intelligence — <em>in Hungarian.</em>');
  add('Cloudflare Workers AI (nyílt forrású Meta Llama) — a szöveged nem használjuk fel modellek tanítására, és nem adjuk át harmadik félnek.',
      'Cloudflare Workers AI (Open-Source Meta Llama) — deinen Text nutzen wir nicht zum Training von Modellen und geben ihn nicht an Dritte weiter.',
      'Cloudflare Workers AI (open-source Meta Llama) — we don’t use your text to train models and don’t share it with third parties.');
  add('🔍 Természetes nyelvű keresés', '🔍 Suche in natürlicher Sprache', '🔍 Natural-language search');
  add('„Magyar villanyszerelő AG-ban aki angolul is tud."', '„Ungarischer Elektriker im Kanton AG, der auch Englisch spricht."', '“A Hungarian electrician in canton AG who also speaks English.”');
  add('Mondatba írod, amit keresel — az AI strukturált szűrőkre fordítja és automatikusan beállítja.',
      'Du schreibst als Satz, was du suchst — die KI übersetzt es in strukturierte Filter und stellt sie automatisch ein.',
      'Type what you want as a sentence — the AI turns it into structured filters and sets them automatically.');
  add('✍️ Leírás-asszisztens', '✍️ Beschreibungs-Assistent', '✍️ Description assistant');
  add('„Vállalkozói profil csiszolva."', '„Unternehmerprofil aufpoliert."', '“Business profile polished.”');
  add('A vállalkozó beírja a leírást, az AI helyesírás-ellenőriz + tömörebbé tesz + kategóriát javasol. Te döntesz, elfogadod-e.',
      'Der Unternehmer gibt die Beschreibung ein, die KI korrigiert die Rechtschreibung + fasst prägnanter + schlägt eine Kategorie vor. Du entscheidest, ob du es annimmst.',
      'The business enters a description, the AI spell-checks + tightens it + suggests a category. You decide whether to accept it.');
  add('📖 Hivatali szó-szótár', '📖 Behörden-Wörterbuch', '📖 Official-term dictionary');
  add('„Mit jelent az Aufenthaltsbewilligung?"', '„Was bedeutet Aufenthaltsbewilligung?"', '“What does Aufenthaltsbewilligung mean?”');
  add('Az ügyintézés-csekklistákban a hivatali kifejezések kattinthatóak — kézzel ellenőrzött magyarázat, AI-kiegészítés esetén „becslés" jelöléssel.',
      'In den Behörden-Checklisten sind Fachbegriffe anklickbar — handgeprüfte Erklärung, bei KI-Ergänzung mit „Schätzung"-Kennzeichnung.',
      'In the admin checklists, official terms are clickable — hand-checked explanations, marked “estimate” when AI-supplemented.');
  add('Minden AI-generált tartalom ✨ ikonnal van jelölve. Tényszerű hibákat is tartalmazhat — a hivatalos forrást mindig külön ellenőrizd. Hogy melyik funkció mögött milyen modell fut és milyen korlátokkal: AI-átláthatósági oldal.',
      'Alle KI-generierten Inhalte sind mit einem <strong>✨-Symbol</strong> gekennzeichnet. Sie können sachliche Fehler enthalten — prüfe die offizielle Quelle immer separat. Welches Modell hinter welcher Funktion läuft und mit welchen Grenzen: <a href="/ai-atlathatosag" style="color: inherit; text-decoration: underline;">KI-Transparenzseite</a>.',
      'All AI-generated content is marked with a <strong>✨ icon</strong>. It may contain factual errors — always verify the official source separately. Which model runs behind which feature and with what limits: <a href="/ai-atlathatosag" style="color: inherit; text-decoration: underline;">AI transparency page</a>.');

  // BIZ (#vallalkozok)
  add('Magyar vállalkozóknak kint', 'Für ungarische Unternehmer im Ausland', 'For Hungarian businesses abroad');
  add('A magyar közösség megtalál.', 'Die ungarische Community <em>findet dich.</em>', 'The Hungarian community <em>will find you.</em>');
  add('Több százezer magyar él Európa-szerte. Sokuknak te lehetsz az első hívás. Csak meg kell találniuk.',
      'Mehrere Hunderttausend Ungarn leben europaweit. Für viele kannst du <em>der</em> erste Anruf sein. Sie müssen dich nur finden.',
      'Hundreds of thousands of Hungarians live across Europe. For many, you could be <em>the</em> first call. They just need to find you.');
  add('Teljes profil — ingyen, fiók nélkül.', 'Vollständiges Profil — gratis, ohne Konto.', 'Full profile — free, no account.');
  add('Név, kategória, cím, nyitvatartás, telefon, galéria, social linkek. Nincs regisztráció — kezelő-linket kapsz, és admin-jóváhagyás (kb. 24 óra) után élesedik.',
      'Name, Kategorie, Adresse, Öffnungszeiten, Telefon, Galerie, Social-Links. Keine Registrierung — du bekommst einen Verwaltungs-Link, und nach Admin-Freigabe (ca. 24 Std.) geht es live.',
      'Name, category, address, opening hours, phone, gallery, social links. No sign-up — you get a manage link and it goes live after admin approval (~24h).');
  add('Megtalálnak — keresőben, térképen, a közeledben.', 'Sie finden dich — in der Suche, auf der Karte, in deiner Nähe.', 'They find you — in search, on the map, near you.');
  add('A profilod ott van a Szaknévsor keresőjében, a kategória-szűrőkben, a térképen és a „magyar szaki a közelemben" (GPS-alapú) találatokban. A részletes látogatottsági statisztika (megtekintés, hívás, 7/30 nap) a Szaknévsor PRO-ban.',
      'Dein Profil erscheint in der Branchenbuch-Suche, in den Kategorie-Filtern, auf der Karte und in den „ungarischer Profi in meiner Nähe"-Treffern (GPS-basiert). Die detaillierte Besuchsstatistik (Aufrufe, Anrufe, 7/30 Tage) gibt es in Branchenbuch PRO.',
      'Your profile appears in the directory search, in category filters, on the map and in the “Hungarian pro near me” (GPS-based) results. Detailed visit stats (views, calls, 7/30 days) are in Directory PRO.');
  add('AI-segéd a feladásnál.', 'KI-Assistent beim Einstellen.', 'AI assistant when you post.');
  add('Leírás csiszolása + kategória-javaslat + német szótár az ügyintézés-csekklistákon. Te döntesz, elfogadod-e.',
      'Beschreibung aufpolieren + Kategorie-Vorschlag + deutsches Wörterbuch in den Behörden-Checklisten. Du entscheidest, ob du es annimmst.',
      'Polish the description + category suggestion + German dictionary in the admin checklists. You decide whether to accept it.');
  add('„Hiteles" badge — admin-ellenőrzés után.', '„Verifiziert"-Badge — nach Admin-Prüfung.', '“Verified” badge — after admin review.');
  add('A magyarul beszélő vállalkozók ✓ Hiteles jelölést kapnak. Ez nem minőségi garancia — csak nyelvi hitelesítés.',
      'Ungarischsprachige Unternehmer erhalten die ✓ Verifiziert-Kennzeichnung. Das ist keine Qualitätsgarantie — nur eine sprachliche Verifizierung.',
      'Hungarian-speaking businesses get the ✓ Verified mark. This is not a quality guarantee — only a language verification.');
  add('Regisztrálok — ingyen', 'Registrieren — gratis', 'Register — free');
  add('Tudj meg többet', 'Mehr erfahren', 'Learn more');
  add('Szia,', 'Hallo,', 'Hi,');
  add('★ KIEMELT', '★ HERVORGEHOBEN', '★ FEATURED');
  add('EZ A HÉT', 'DIESE WOCHE', 'THIS WEEK');
  add('Kinti nézte meg a profilodat', 'Kinti-Nutzer haben dein Profil angesehen', 'Kinti users viewed your profile');
  add('Megtekintés', 'Aufrufe', 'Views');
  add('Megnyitás', 'Öffnungen', 'Opens');
  add('Hívás', 'Anrufe', 'Calls');
  add('14 napos trend', '14-Tage-Trend', '14-day trend');

  // PRICING (tiszta részek; a fizetési fine-print HU marad — beágyazott span-ek)
  add('Kinti PRO · opcionális', 'Kinti PRO · optional', 'Kinti PRO · optional');
  add('Az alap ingyenes. A PRO még többet ad.', 'Die Basis ist gratis. <em>PRO</em> gibt dir noch mehr.', 'The basics are free. <em>PRO</em> gives you more.');
  add('Magánszemélyeknek', 'Für Privatpersonen', 'For individuals');
  add('Nyisd meg az összes prémium modult és kalkulátort.', 'Schalte alle Premium-Module und Rechner frei.', 'Unlock all premium modules and calculators.');
  add('/ hó · nettó + ÁFA', '/ Monat · netto + MwSt.', '/ mo · net + VAT');
  add('Állás-találat (% match) + becsült nettó bér', 'Job-Match (% Übereinstimmung) + geschätzter Nettolohn', 'Job match (% match) + estimated net salary');
  add('AI CV-audit — önéletrajz-elemzés', 'KI-CV-Audit — Lebenslauf-Analyse', 'AI CV audit — resume analysis');
  add('Állampolgárság-szimulátor mind a 4 országra', 'Einbürgerungs-Simulator für alle 4 Länder', 'Citizenship simulator for all 4 countries');
  add('Szakmai gyors-szótár — iparági leckék kiejtéssel (🇨🇭 🇦🇹 🇩🇪 🇳🇱)', 'Fach-Schnellwörterbuch — Branchenlektionen mit Aussprache (🇨🇭 🇦🇹 🇩🇪 🇳🇱)', 'Pro quick dictionary — industry lessons with pronunciation (🇨🇭 🇦🇹 🇩🇪 🇳🇱)');
  add('Utalás- és Határidő-asszisztens push-emlékeztetőkkel', 'Überweisungs- und Fristen-Assistent mit Push-Erinnerungen', 'Transfer and deadline assistant with push reminders');
  add('Albérlet-börze kapcsolatfelvétel — a hirdetők elérhetőségének megnyitása', 'Wohnungsbörse-Kontakt — Kontaktdaten der Inserenten öffnen', 'Rentals board contact — open posters’ contact details');
  add('Válts Kinti PRO-ba', 'Auf Kinti PRO wechseln', 'Switch to Kinti PRO');
  add('★ Ajánlott vállalkozóknak', '★ Empfohlen für Unternehmer', '★ Recommended for businesses');
  add('Vállalkozóknak és szakembereknek', 'Für Unternehmer und Fachkräfte', 'For businesses and professionals');
  add('Szerezz több ügyfelet prémium láthatósággal.', 'Gewinne mehr Kunden mit Premium-Sichtbarkeit.', 'Win more clients with premium visibility.');
  add('🤝 B2B Hub — zárt projektpiac: alvállalkozói munkát írhatsz ki, és jelentkezhetsz más magyar PRO cégek projektjeire (jutalék nélkül)',
      '🤝 B2B-Hub — geschlossener Projektmarkt: schreib Subunternehmer-Aufträge aus und bewirb dich auf Projekte anderer ungarischer PRO-Firmen (ohne Provision)',
      '🤝 B2B Hub — closed project marketplace: post subcontractor jobs and apply to other Hungarian PRO companies’ projects (no commission)');
  add('Sárga PRO kiemelés a találati listákban', 'Gelbe PRO-Hervorhebung in den Trefferlisten', 'Yellow PRO highlight in result lists');
  add('A lista elején jelensz meg a kategóriádban (a kiemelt cégek között)', 'Du erscheinst oben in deiner Kategorie (unter den hervorgehobenen Firmen)', 'You appear at the top of your category (among featured companies)');
  add('Egyedi profil borítókép és arculat-szín', 'Individuelles Profil-Titelbild und Markenfarbe', 'Custom profile cover image and brand color');
  add('Analytics-műszerfal: megtekintések, hívások és ajánlatkérők (7/30 napos bontásban, konverzióval)', 'Analytics-Dashboard: Aufrufe, Anrufe und Anfragen (7/30-Tage-Ansicht, mit Conversion)', 'Analytics dashboard: views, calls and inquiries (7/30-day breakdown, with conversion)');
  add('Időpontfoglalás widget (Calendly-beágyazás)', 'Terminbuchungs-Widget (Calendly-Einbettung)', 'Appointment booking widget (Calendly embed)');
  add('Ajánlatkérő postafiók (lead-kezelő)', 'Anfragen-Postfach (Lead-Manager)', 'Inquiry inbox (lead manager)');
  add('Bővített referenciagaléria', 'Erweiterte Referenzgalerie', 'Extended reference gallery');
  add('🎟️ Kinti Pass elfogadóhely: kedvezményt kínálhatsz a felhasználóknak — arany jelvény + külön szűrő a keresőben', '🎟️ Kinti-Pass-Akzeptanzstelle: biete Nutzern Rabatt — goldenes Abzeichen + eigener Filter in der Suche', '🎟️ Kinti Pass partner spot: offer users a discount — gold badge + dedicated filter in search');
  add('A „hasonló vállalkozások" ajánló kikapcsolása a profilodon', 'Empfehlung „ähnliche Unternehmen" auf deinem Profil deaktivieren', 'Turn off the “similar businesses” suggestion on your profile');
  add('Kiemelés vásárlása', 'Hervorhebung kaufen', 'Buy highlight');
  add('A vállalkozásod kezelőjében véglegesíted. Havonta megújul, bármikor lemondható. A kiemelt profil a találati listán mindig jól látható „PRO" jelölést kap.',
      'Du schließt es im Verwaltungsbereich deines Unternehmens ab. Monatlich verlängerbar, jederzeit kündbar. Das hervorgehobene Profil erhält in der Trefferliste stets eine gut sichtbare „PRO"-Kennzeichnung.',
      'You finalize it in your business’s manager. Renews monthly, cancel anytime. The highlighted profile always gets a clearly visible “PRO” mark in results.');
  add('Munkáltatóknak', 'Für Arbeitgeber', 'For employers');
  add('Találj gyorsabban megbízható magyar munkaerőt.', 'Finde schneller zuverlässige ungarische Arbeitskräfte.', 'Find reliable Hungarian workers faster.');
  add('/ hirdetés · egyszeri, nettó + ÁFA', '/ Anzeige · einmalig, netto + MwSt.', '/ listing · one-time, net + VAT');
  add('30 napos piros kiemelés a Job Boardon', '30 Tage rote Hervorhebung im Job-Board', '30-day red highlight on the Job Board');
  add('A lista elején, jól látható „Kiemelt" jelöléssel', 'Ganz oben, mit gut sichtbarer „Hervorgehoben"-Kennzeichnung', 'At the top, with a clearly visible “Featured” mark');
  add('Egyedi céges arculat megjelenítése', 'Anzeige des individuellen Firmen-Brandings', 'Show custom company branding');
  add('Push-riasztás a régiód magyar jelöltjeinek (Kinti Radar — kanton + szakma szerint)', 'Push-Alarm an die ungarischen Kandidaten deiner Region (Kinti Radar — nach Kanton + Beruf)', 'Push alert to Hungarian candidates in your region (Kinti Radar — by canton + profession)');
  add('Jelentkezők egy helyen — beépített kezelő-felület, semmi nem vész el', 'Bewerber an einem Ort — integrierte Verwaltung, nichts geht verloren', 'Applicants in one place — built-in manager, nothing gets lost');
  add('E-mail minden új jelentkezésről + jelentkezés-számláló hirdetésenként', 'E-Mail bei jeder neuen Bewerbung + Bewerbungszähler pro Anzeige', 'Email on every new application + application counter per listing');
  add('Hirdetés kiemelése', 'Anzeige hervorheben', 'Feature listing');
  add('A hirdetésednél, a munkáltató kezelőben véglegesíted. Egyszeri díj — 30 napig él, és NEM újul meg automatikusan.',
      'Du schließt es bei deiner Anzeige im Arbeitgeber-Manager ab. Einmalige Gebühr — 30 Tage gültig, KEINE automatische Verlängerung.',
      'You finalize it at your listing in the employer manager. One-time fee — valid 30 days, does NOT auto-renew.');

  // VOICES
  add('Mit mondanak rólunk', 'Was man über uns sagt', 'What people say about us');
  add('Magyaroktól. Magyaroknak.', 'Von Ungarn. <em>Für Ungarn.</em>', 'From Hungarians. <em>For Hungarians.</em>');
  add('„Régóta kerestem magyarul beszélő fodrászt Zürichben. Öt perc alatt megvolt a telefonszáma, másnap már oda is ültem. Végre nem kell németül elmagyaráznom, mit szeretnék."',
      '„Ich habe lange einen ungarischsprachigen Friseur in Zürich gesucht. In fünf Minuten hatte ich die Nummer, am nächsten Tag saß ich schon dort. Endlich muss ich nicht auf Deutsch erklären, was ich möchte."',
      '“I’d long been looking for a Hungarian-speaking hairdresser in Zürich. In five minutes I had the number, the next day I was in the chair. Finally I don’t have to explain in German what I want.”');
  add('Zürich · 4 éve kint', 'Zürich · seit 4 Jahren im Ausland', 'Zürich · abroad for 4 years');
  add('„Feltettem a szervizemet, és pár nap alatt jöttek az első magyar ügyfelek a környékről. Nekik jó, hogy anyanyelvükön intézhetik, nekem meg új vendégeket hoz."',
      '„Ich habe meine Werkstatt eingetragen, und in wenigen Tagen kamen die ersten ungarischen Kunden aus der Umgebung. Für sie ist es schön, alles in ihrer Muttersprache zu regeln, und mir bringt es neue Kunden."',
      '“I listed my garage, and within days the first Hungarian customers came from nearby. It’s great for them to handle things in their language, and it brings me new clients.”');
  add('Autószerelő · Zürich', 'KFZ-Werkstatt · Zürich', 'Mechanic · Zürich');
  add('„Frissen költöztem ki, és minden ügyintézés kész rémálom volt. Itt találtam egy magyar könyvelőt a közelben — végre valaki, akivel értjük egymást."',
      '„Ich war frisch ausgewandert, und jede Behördensache war ein Albtraum. Hier habe ich einen ungarischen Buchhalter in der Nähe gefunden — endlich jemand, mit dem ich mich verstehe."',
      '“I’d just moved abroad and every bit of admin was a nightmare. Here I found a Hungarian accountant nearby — finally someone I understand.”');
  add('Wollishofen · 1 éve kint', 'Wollishofen · seit 1 Jahr im Ausland', 'Wollishofen · abroad for 1 year');
  add('A fenti idézetek illusztrációk, jellemző használati helyzeteket mutatnak be. A valódi, e-mailben megerősített és moderált értékeléseket a vállalkozói profiloknál olvashatod.',
      'Die obigen Zitate sind Illustrationen und zeigen typische Nutzungssituationen. Die echten, per E-Mail bestätigten und moderierten Bewertungen liest du bei den Unternehmensprofilen.',
      'The quotes above are illustrations showing typical use cases. You can read the real, email-verified and moderated reviews on the business profiles.');

  // FAQ (a 2 fizetési választ kivéve — azok HU maradnak)
  add('Gyakori kérdések', 'Häufige Fragen', 'Frequently asked questions');
  add('Amit tudni akarsz.', 'Was du <em>wissen</em> willst.', 'What you <em>want</em> to know.');
  add('Tényleg ingyenes a felhasználóknak?', 'Ist es für Nutzer wirklich kostenlos?', 'Is it really free for users?');
  add('A keresés, a profilok böngészése és a hívás ingyenes — ehhez fiók sem kell. A Kinti PRO (prémium modulok, kalkulátorok, AI-eszközök, reklámmentes élmény) opcionális felár, ahogy a vállalkozói és munkaadói kiemelés is. A fizetett kiemelés (PRO / Kiemelt állás) a lista elején jelenik meg, és minden esetben jól látható jelölést kap — a nem fizetett találatok egymás közötti, közelség-alapú sorrendjét nem változtatja meg.',
      'Suche, das Durchstöbern von Profilen und Anrufe sind <strong>kostenlos</strong> — dafür braucht es kein Konto. <strong>Kinti PRO</strong> (Premium-Module, Rechner, KI-Tools, werbefreies Erlebnis) ist ein optionaler Aufpreis, ebenso die Hervorhebung für Unternehmer und Arbeitgeber. Die bezahlte Hervorhebung (PRO / Hervorgehobene Stelle) erscheint oben in der Liste und erhält stets eine gut sichtbare Kennzeichnung — die entfernungsbasierte Reihenfolge der nicht bezahlten Treffer untereinander ändert sie nicht.',
      'Search, browsing profiles and calling are <strong>free</strong> — no account needed. <strong>Kinti PRO</strong> (premium modules, calculators, AI tools, ad-free experience) is an optional add-on, as are the business and employer highlights. Paid highlighting (PRO / Featured job) appears at the top of the list and always gets a clearly visible mark — it does not change the proximity-based order of the non-paid results among themselves.');
  add('Kell-e regisztráció / fiók?', 'Braucht man eine Registrierung / ein Konto?', 'Do I need to register / have an account?');
  add('Nem. Sem hirdetés, sem értékelés, sem vállalkozói profil feladásához nem kell fiók. Beküldés után azonnal kapsz egy kezelő-linket (manage-token) — ezzel bármikor szerkesztheted vagy törölheted a tartalmadat, jelszó nélkül. E-mailt megadhatsz, de nem kötelező.',
      '<strong>Nein.</strong> Weder für Anzeigen noch Bewertungen noch ein Unternehmensprofil braucht es ein Konto. Nach dem Absenden bekommst du <strong>sofort einen Verwaltungs-Link</strong> (Manage-Token) — damit kannst du deinen Inhalt jederzeit ohne Passwort bearbeiten oder löschen. Eine E-Mail ist möglich, aber nicht Pflicht.',
      '<strong>No.</strong> No account is needed to post a listing, a review or a business profile. After submitting you <strong>instantly get a manage link</strong> (manage token) — edit or delete your content anytime, no password. You may add an email, but it’s optional.');
  add('Hogyan kerülnek fel a vállalkozók?', 'Wie kommen Unternehmen hinein?', 'How do businesses get listed?');
  add('Maguk küldik be — fiók nélkül; azonnal kezelő-linket kapnak (e-mail nem kötelező). Az adminisztrátor 24 órán belül ellenőrzi és aktiválja. A „✓ Hiteles" badge külön nyelvi hitelesítést jelent — NEM minőségi garancia.',
      'Sie tragen sich selbst ein — ohne Konto; sie erhalten sofort einen Verwaltungs-Link (E-Mail nicht Pflicht). Der Administrator prüft und aktiviert innerhalb von 24 Stunden. Das „✓ Verifiziert"-Badge bedeutet eine sprachliche Verifizierung — KEINE Qualitätsgarantie.',
      'They submit themselves — no account; they instantly get a manage link (email optional). The administrator reviews and activates within 24 hours. The “✓ Verified” badge means a language verification — NOT a quality guarantee.');
  add('Mi a tartalom-moderációs eljárás?', 'Wie läuft die Inhalts-Moderation ab?', 'What is the content moderation process?');
  add('Minden hirdetés, értékelés és vállalkozói profil admin-jóváhagyásra vár (típikusan 24 órán belül). Llama AI szűri a szöveg + képtartalmat.',
      '<strong>Jede Anzeige, Bewertung und jedes Unternehmensprofil wartet auf Admin-Freigabe</strong> (typischerweise innerhalb von 24 Stunden). Llama-KI filtert Text- und Bildinhalte.',
      '<strong>Every listing, review and business profile awaits admin approval</strong> (typically within 24 hours). Llama AI filters text and image content.');
  add('Meddig van fent egy álláshirdetés?', 'Wie lange bleibt eine Stellenanzeige online?', 'How long does a job listing stay up?');
  add('A jóváhagyott álláshirdetés 30 napig aktív, utána automatikusan lejár — így nem maradnak fent elavult ajánlatok. A hirdetés nem törlődik: a munkáltató a saját irányítópultján egyetlen kattintással, ingyen megújíthatja újabb 30 napra, újragépelés nélkül. A 49 €-os Kiemelt Állás szintén 30 napos, és a kiemelés a hirdetés lejáratát is felfrissíti.',
      'Die freigegebene Stellenanzeige ist <strong>30 Tage aktiv</strong> und läuft danach automatisch ab — so bleiben keine veralteten Angebote stehen. Die Anzeige wird <strong>nicht gelöscht</strong>: der Arbeitgeber kann sie im eigenen Dashboard <strong>mit einem Klick, kostenlos um weitere 30 Tage verlängern</strong>, ohne Neueingabe. Die <strong>Hervorgehobene Stelle</strong> für 49 € läuft ebenfalls 30 Tage und die Hervorhebung frischt auch das Ablaufdatum auf.',
      'An approved job listing is <strong>active for 30 days</strong>, then expires automatically — so no stale offers linger. The listing is <strong>not deleted</strong>: the employer can <strong>renew it in one click, free, for another 30 days</strong> from their dashboard, no re-typing. The €49 <strong>Featured Job</strong> also runs 30 days, and featuring refreshes the expiry too.');
  add('Mely országokban érhető el?', 'In welchen Ländern ist es verfügbar?', 'Which countries is it available in?');
  add('Mind a hat országban élőben: Svájc, Ausztria, Németország, Hollandia, Anglia és Spanyolország — régió- és város-szintű szűrővel. Válaszd ki a menüből, melyikben vagy kint, és a térkép, a szakemberek és a tartalom helyre igazodik.',
      'In allen sechs Ländern <strong>live</strong>: Schweiz, Österreich, Deutschland, Niederlande, England und Spanien — mit Filter auf Regions- und Stadtebene. Wähle im Menü, in welchem du im Ausland bist, und Karte, Fachkräfte und Inhalte passen sich an.',
      'Live in all six countries: Switzerland, Austria, Germany, the Netherlands, England and Spain — with region- and city-level filters. Pick from the menu which one you’re in, and the map, professionals and content adapt.');
  add('Adatvédelem? Geolokáció? Cookie?', 'Datenschutz? Geolokalisierung? Cookies?', 'Privacy? Geolocation? Cookies?');
  add('A GPS pozíciód a böngészőben marad — szerverre nem küldjük. Csak a működéshez szükséges sütiket használjuk (pl. a bejelentkezett funkciókhoz Clerk-session) — marketing- vagy nyomkövető sütit nem. GDPR + svájci revFADP-kompatibilis, Cloudflare EU-edge szervereken. Az IP-címet csak SHA-256 hash-ként tároljuk; az e-mail-címed a megerősítéshez és a kapcsolatfelvételhez kerül tárolásra.',
      'Deine GPS-Position bleibt im Browser — wir senden sie nicht an den Server. Wir nutzen nur <strong>technisch notwendige Cookies</strong> (z. B. Clerk-Session für angemeldete Funktionen) — keine Marketing- oder Tracking-Cookies. DSGVO- + Schweizer revDSG-konform, auf Cloudflare-EU-Edge-Servern. Die IP-Adresse speichern wir nur als SHA-256-Hash; deine E-Mail wird zur Bestätigung und Kontaktaufnahme gespeichert.',
      'Your GPS position stays in the browser — we don’t send it to the server. We use only <strong>strictly necessary cookies</strong> (e.g. Clerk session for logged-in features) — no marketing or tracking cookies. GDPR + Swiss revFADP compliant, on Cloudflare EU edge servers. We store the IP address only as a SHA-256 hash; your email is stored for confirmation and contact.');
  add('Mit jelentenek az ✨ AI-jelölt funkciók?', 'Was bedeuten die ✨ KI-gekennzeichneten Funktionen?', 'What do the ✨ AI-marked features mean?');
  add('A Cloudflare Workers AI (Llama modell, EU-szervereken) használjuk: természetes nyelvű kereső, vállalkozói leírás-csiszolás, német szó-magyarázat. Automatikus becslés, nem szakvélemény — minden AI-output ✨ ikonnal jelölve.',
      'Wir nutzen Cloudflare Workers AI (Llama-Modell, auf EU-Servern): Suche in natürlicher Sprache, Aufpolieren von Unternehmensbeschreibungen, deutsche Worterklärung. <strong>Automatische Schätzung, kein Gutachten</strong> — jede KI-Ausgabe ist mit ✨-Symbol gekennzeichnet.',
      'We use Cloudflare Workers AI (Llama model, on EU servers): natural-language search, polishing business descriptions, German word explanations. <strong>Automated estimate, not professional advice</strong> — every AI output is marked with a ✨ icon.');
  add('A kalkulátorok pontosak?', 'Sind die Rechner genau?', 'Are the calculators accurate?');
  add('Bér-, vám-, gyorshajtás-, lakhatás-, repjegy-kalkulátorok mind BECSLŐK. Publikus forrásokat (ECB, ESTV, BAZG) és általános mintákat használnak. Hivatalos döntéshez (pl. nettó-bér, adóvallás) mindig a hivatalos forrás kell.',
      'Lohn-, Zoll-, Tempo-, Wohn- und Flugpreis-Rechner sind alle <strong>Schätzer</strong>. Sie nutzen öffentliche Quellen (EZB, ESTV, BAZG) und allgemeine Muster. Für offizielle Entscheidungen (z. B. Nettolohn, Steuererklärung) ist immer die offizielle Quelle maßgeblich.',
      'Salary, customs, speeding, housing and flight-price calculators are all <strong>estimators</strong>. They use public sources (ECB, ESTV, BAZG) and general patterns. For official decisions (e.g. net salary, tax return) the official source always applies.');
  add('Push-értesítéseket (Kinti Radar) hogyan kapok?', 'Wie erhalte ich Push-Benachrichtigungen (Kinti Radar)?', 'How do I get push notifications (Kinti Radar)?');
  add('A böngésződ engedélyt kér. Email-cím nélkül, anonim módon — csak az endpoint-od (anonim URL) van tárolva. Két radar: új magyar állás a környékeden, és CHF/HUF árfolyam-küszöb (te állítod be).',
      'Dein Browser fragt nach Erlaubnis. Ohne E-Mail, anonym — gespeichert wird nur dein Endpoint (anonyme URL). Zwei Radare: neuer ungarischer Job in deiner Nähe und CHF/HUF-Kursschwelle (du legst sie fest).',
      'Your browser asks for permission. No email, anonymous — only your endpoint (anonymous URL) is stored. Two radars: a new Hungarian job near you, and a CHF/HUF rate threshold (you set it).');
  add('Lesz iOS és Android app is?', 'Gibt es auch eine iOS- und Android-App?', 'Will there be iOS and Android apps?');
  add('A Kinti PWA-ként minden telefonra települ. Androidon a Google Play Store-ban is megtalálod; iPhone-on a Safari „Hozzáadás a kezdőképernyőhöz" gombbal teszed a kezdőképernyődre (App Store-jelenlét nincs). Így a felhasználóknak sosem kell store-díjat fizetniük.',
      'Kinti installiert sich als PWA auf jedem Handy. Auf Android findest du sie auch im <strong>Google Play Store</strong>; auf dem iPhone legst du sie mit Safari „Zum Home-Bildschirm" auf den Startbildschirm (keine App-Store-Präsenz). So müssen Nutzer nie eine Store-Gebühr zahlen.',
      'Kinti installs as a PWA on any phone. On Android you’ll also find it in the <strong>Google Play Store</strong>; on iPhone you add it to your home screen via Safari’s “Add to Home Screen” (no App Store presence). This way users never pay a store fee.');

  // FAQ #2/#3 kérdései (a válaszaik lentebb a fizetési blokkban) — korábban kimaradtak
  add('Mit ad a Kinti PRO?', 'Was bietet Kinti PRO?', 'What does Kinti PRO offer?');
  add('Hogyan mondhatom le a PRO-t? Van elállási jog?', 'Wie kündige ich PRO? Gibt es ein Widerrufsrecht?', 'How do I cancel PRO? Is there a right of withdrawal?');
  // Hero lebegő címkék (.float) — a név marad, a „kategória · idő" fordul
  add('Kovács Anna Fodrász · 4 perc', 'Kovács Anna<br><span style="color: var(--text-muted); font-weight: 500; font-size: 11.5px;">Friseur · 4 Min.</span>', 'Kovács Anna<br><span style="color: var(--text-muted); font-weight: 500; font-size: 11.5px;">Hairdresser · 4 min</span>');
  add('Horváth szerviz Autószerelő · 11 perc', 'Horváth<br><span style="color: var(--text-muted); font-weight: 500; font-size: 11.5px;">KFZ-Werkstatt · 11 Min.</span>', 'Horváth<br><span style="color: var(--text-muted); font-weight: 500; font-size: 11.5px;">Mechanic · 11 min</span>');
  add('Nagy pékség Pék · 6 perc', 'Nagy<br><span style="color: var(--text-muted); font-weight: 500; font-size: 11.5px;">Bäcker · 6 Min.</span>', 'Nagy<br><span style="color: var(--text-muted); font-weight: 500; font-size: 11.5px;">Baker · 6 min</span>');

  // Ország-kártyák város-listái (a névvariánsok fordulnak: Bécs→Wien, Hága→Den Haag, Genf→Geneva)
  add('Zürich · Genf · Basel', 'Zürich · Genf · Basel', 'Zürich · Geneva · Basel');
  add('Bécs · Graz · Linz', 'Wien · Graz · Linz', 'Vienna · Graz · Linz');
  add('Berlin · München · Frankfurt', 'Berlin · München · Frankfurt', 'Berlin · Munich · Frankfurt');
  add('Amszterdam · Rotterdam · Hága', 'Amsterdam · Rotterdam · Den Haag', 'Amsterdam · Rotterdam · The Hague');
  // Cookie-banner
  add('🍪 A kinti.app sütiket használ. A Clerk (bejelentkezés) és az alapvető működési sütik segítségével biztosítjuk a platform biztonságát és megfelelő működését. Marketing- vagy nyomkövető sütiket nem használunk. Részletes tájékoztató: Adatkezelési tájékoztató.',
    '🍪 <strong>kinti.app verwendet Cookies.</strong> Mit Clerk (Login) und den grundlegenden Betriebs-Cookies gewährleisten wir Sicherheit und Funktion der Plattform. Marketing- oder Tracking-Cookies verwenden wir nicht. Ausführliche Infos: <a href="/adatvedelem" class="cookie-link">Datenschutzhinweise</a>.',
    '🍪 <strong>kinti.app uses cookies.</strong> With Clerk (login) and essential operational cookies we ensure the platform’s security and proper function. We don’t use marketing or tracking cookies. Details: <a href="/adatvedelem" class="cookie-link">privacy notice</a>.');
  add('Elfogadom', 'Akzeptieren', 'Accept');

  // ── Fizetési/jogi fine-print (a web-only/android-only span-eket a fordítás reprodukálja) ──
  add('A keresés, a profilok böngészése és a hívás ingyenes marad. Ha mélyebbre mennél — vagy magyar ügyfeleket, munkaerőt szereznél — itt vannak az opcionális prémium csomagok. A feltüntetett árak nettó árak (ÁFA nélkül); az ÁFA-t a pénztár az adott ország szabályai szerint adja hozzá — a pontos, áfával együttes végső összeget a pénztár és a kinti.app/pro oldal mutatja. A fizetést a Paddle (Merchant of Record) bonyolítja; ha a Kinti Android-alkalmazásból vásárolsz, ott a Google Play fizetési rendszere érvényes.A fizetést a Google Play fizetési rendszere bonyolítja.',
    'Suche, das Durchstöbern von Profilen und Anrufe bleiben kostenlos. Wenn du tiefer einsteigen — oder ungarische Kunden und Arbeitskräfte gewinnen — möchtest, findest du hier die optionalen Premium-Pakete. Die angegebenen Preise sind <strong>Netto</strong>-Preise (ohne MwSt.); die MwSt. fügt die Kasse nach den Regeln des jeweiligen Landes hinzu — den genauen Endbetrag inkl. MwSt. zeigen die Kasse und die Seite <a href="/pro" style="color: inherit; text-decoration: underline;">kinti.app/pro</a>. <span class="web-only-payment">Die Zahlung wickelt <strong>Paddle</strong> (Merchant of Record) ab; kaufst du aus der Kinti-<strong>Android-App</strong>, gilt dort das Zahlungssystem von <strong>Google Play</strong>.</span><span class="android-only-payment">Die Zahlung wickelt das Zahlungssystem von <strong>Google Play</strong> ab.</span>',
    'Search, browsing profiles and calling stay free. If you want to go deeper — or win Hungarian clients or workers — the optional premium plans are here. The listed prices are <strong>net</strong> prices (excl. VAT); VAT is added at checkout per each country’s rules — the exact final amount incl. VAT is shown at checkout and on <a href="/pro" style="color: inherit; text-decoration: underline;">kinti.app/pro</a>. <span class="web-only-payment">Payment is handled by <strong>Paddle</strong> (Merchant of Record); if you buy from the Kinti <strong>Android app</strong>, <strong>Google Play</strong>’s payment system applies.</span><span class="android-only-payment">Payment is handled by <strong>Google Play</strong>’s payment system.</span>');
  add('Havonta megújul, bármikor lemondható. Fizetés: Paddle (Merchant of Record), 14 napos elállási joggal.Fizetés: Google Play fizetési rendszer, 14 napos elállási joggal.',
    'Monatlich verlängerbar, jederzeit kündbar. <span class="web-only-payment">Zahlung: Paddle (Merchant of Record), mit 14-tägigem Widerrufsrecht.</span><span class="android-only-payment">Zahlung: Google-Play-Zahlungssystem, mit 14-tägigem Widerrufsrecht.</span>',
    'Renews monthly, cancel anytime. <span class="web-only-payment">Payment: Paddle (Merchant of Record), with a 14-day right of withdrawal.</span><span class="android-only-payment">Payment: Google Play payment system, with a 14-day right of withdrawal.</span>');
  add('A fizetést a Paddle (Merchant of Record) kezeli, 14 napos elállási joggalA fizetést a Google Play fizetési rendszere kezeli, 14 napos elállási joggal — részletek: visszatérítési tájékoztató. A fizetett kiemelés a rangsorolást a jelölt módon befolyásolja — erről átláthatóan az ÁSZF 10/A pontja szól. Élő, országodra lokalizált árak: kinti.app/pro.',
    '<span class="web-only-payment">Die Zahlung wickelt <strong>Paddle</strong> (Merchant of Record) ab, mit 14-tägigem Widerrufsrecht</span><span class="android-only-payment">Die Zahlung wickelt das <strong>Google-Play</strong>-Zahlungssystem ab, mit 14-tägigem Widerrufsrecht</span> — Details: <a href="/visszateres" style="color: inherit; text-decoration: underline;">Rückerstattungshinweise</a>. Die bezahlte Hervorhebung beeinflusst das Ranking auf die gekennzeichnete Weise — transparent dazu <a href="/aszf" style="color: inherit; text-decoration: underline;">Punkt 10/A der AGB</a>. Aktuelle, auf dein Land lokalisierte Preise: <a href="/pro" style="color: inherit; text-decoration: underline;">kinti.app/pro</a>.',
    '<span class="web-only-payment">Payment is handled by <strong>Paddle</strong> (Merchant of Record), with a 14-day right of withdrawal</span><span class="android-only-payment">Payment is handled by the <strong>Google Play</strong> payment system, with a 14-day right of withdrawal</span> — details: <a href="/visszateres" style="color: inherit; text-decoration: underline;">refund information</a>. Paid highlighting affects ranking in the marked way — transparently covered in <a href="/aszf" style="color: inherit; text-decoration: underline;">section 10/A of the Terms</a>. Live, country-localized prices: <a href="/pro" style="color: inherit; text-decoration: underline;">kinti.app/pro</a>.');
  add('A Kinti PRO magánszemélyeknek a teljes prémium réteget nyitja meg: AI CV-audit, szakmai gyors-szótár, állampolgárság-szimulátor, Utalás- és Határidő-asszisztens, valamint az albérlet-börze kapcsolatfelvétel (a hirdetők elérhetőségének megnyitása). Vállalkozóknak a Szaknévsor PRO ad kiemelést és analitikát, munkaadóknak pedig a Kiemelt Állás a job boardon. Nettó árak (ÁFA nélkül): Kinti PRO 19 €/hó, Szaknévsor PRO 19 €/hó, Kiemelt Állás 49 €/hirdetés (egyszeri, 30 nap) — az ÁFÁ-t a pénztár az adott ország szabályai szerint adja hozzá; a pontos végső összeget a pénztár mutatja. A fizetést a Paddle (Merchant of Record) bonyolítja; az Android-appból vásárolva a Google Play fizetési rendszere érvényes.A fizetést a Google Play fizetési rendszere bonyolítja. Az alap funkciók PRO nélkül is ingyenesek maradnak.',
    '<strong>Kinti PRO</strong> öffnet Privatpersonen die gesamte Premium-Ebene: KI-CV-Audit, Fach-Schnellwörterbuch, Einbürgerungs-Simulator, Überweisungs- und Fristen-Assistent sowie den Wohnungsbörse-Kontakt (Öffnen der Kontaktdaten von Inserenten). Für Unternehmer bietet <strong>Branchenbuch PRO</strong> Hervorhebung und Analytik, für Arbeitgeber die <strong>Hervorgehobene Stelle</strong> im Job-Board. Nettopreise (ohne MwSt.): Kinti PRO <strong>19 €/Monat</strong>, Branchenbuch PRO <strong>19 €/Monat</strong>, Hervorgehobene Stelle <strong>49 €/Anzeige</strong> (einmalig, 30 Tage) — die MwSt. fügt die Kasse nach den Regeln des jeweiligen Landes hinzu; den genauen Endbetrag zeigt die Kasse. <span class="web-only-payment">Die Zahlung wickelt Paddle (Merchant of Record) ab; beim Kauf aus der Android-App gilt das Zahlungssystem von Google Play.</span><span class="android-only-payment">Die Zahlung wickelt das Zahlungssystem von Google Play ab.</span> Die Grundfunktionen bleiben auch ohne PRO kostenlos.',
    '<strong>Kinti PRO</strong> unlocks the full premium layer for individuals: AI CV audit, pro quick dictionary, citizenship simulator, transfer and deadline assistant, plus the rentals-board contact (opening posters’ contact details). For businesses, <strong>Directory PRO</strong> gives highlighting and analytics, and for employers the <strong>Featured Job</strong> on the job board. Net prices (excl. VAT): Kinti PRO <strong>€19/mo</strong>, Directory PRO <strong>€19/mo</strong>, Featured Job <strong>€49/listing</strong> (one-time, 30 days) — VAT is added at checkout per each country’s rules; the exact final amount is shown at checkout. <span class="web-only-payment">Payment is handled by Paddle (Merchant of Record); when buying from the Android app, Google Play’s payment system applies.</span><span class="android-only-payment">Payment is handled by Google Play’s payment system.</span> The basic features stay free without PRO.');
  add('A havidíjas csomagok (Kinti PRO, Szaknévsor PRO) havonta automatikusan megújulnak, és bármikor lemondhatók — a Kinti PRO a kinti.app/pro oldal „Előfizetésem kezelése" gombjával egy kattintással, vagy a Paddle visszaigazoló emailjében kapott linken, vagy az info@kinti.app címen; Android-appos vásárlásnál a Play Áruház → Előfizetések menüben. A lemondás a folyó időszak végén lép életbe. A Kiemelt Állás egyszeri díj: 30 napig él, és nem újul meg. A fizetést a Paddle (Merchant of Record) kezeli,A fizetést a Google Play fizetési rendszere kezeli, 14 napos elállási joggal — részletek a visszatérítési tájékoztatóban.',
    'Die Monatspakete (Kinti PRO, Branchenbuch PRO) <strong>verlängern sich monatlich automatisch und sind jederzeit kündbar</strong> — Kinti PRO mit einem Klick über die Schaltfläche „Mein Abo verwalten" auf <a href="/pro">kinti.app/pro</a>, oder über den Link in der Paddle-Bestätigungs-E-Mail, oder unter info@kinti.app; bei Kauf über die Android-App im Play Store → Abos. Die Kündigung wird zum Ende des laufenden Zeitraums wirksam. Die Hervorgehobene Stelle ist eine <strong>einmalige Gebühr</strong>: 30 Tage gültig, keine Verlängerung. <span class="web-only-payment">Die Zahlung wickelt Paddle (Merchant of Record) ab,</span><span class="android-only-payment">Die Zahlung wickelt das Zahlungssystem von Google Play ab,</span> <strong>mit 14-tägigem Widerrufsrecht</strong> — Details in den <a href="/visszateres">Rückerstattungshinweisen</a>.',
    'The monthly plans (Kinti PRO, Directory PRO) <strong>renew automatically each month and can be cancelled anytime</strong> — Kinti PRO in one click via the “Manage my subscription” button on <a href="/pro">kinti.app/pro</a>, or via the link in the Paddle confirmation email, or at info@kinti.app; for Android-app purchases in the Play Store → Subscriptions. Cancellation takes effect at the end of the current period. The Featured Job is a <strong>one-time fee</strong>: valid 30 days, no renewal. <span class="web-only-payment">Payment is handled by Paddle (Merchant of Record),</span><span class="android-only-payment">Payment is handled by Google Play’s payment system,</span> <strong>with a 14-day right of withdrawal</strong> — details in the <a href="/visszateres">refund information</a>.');
  // kbd demo-tipp (a data-fill a fordított kategória — a delegált kbd-kezelő túléli a cserét)
  add('Próbáld: fodrász autószerelő orvos pék — vagy kattints egy kategória chipre ↑',
    'Probier: <kbd data-fill="Friseur">Friseur</kbd> <kbd data-fill="KFZ-Werkstatt">KFZ-Werkstatt</kbd> <kbd data-fill="Arzt">Arzt</kbd> <kbd data-fill="Bäcker">Bäcker</kbd> — oder klick auf einen Kategorie-Chip ↑',
    'Try: <kbd data-fill="Hairdresser">Hairdresser</kbd> <kbd data-fill="Mechanic">Mechanic</kbd> <kbd data-fill="Doctor">Doctor</kbd> <kbd data-fill="Baker">Baker</kbd> — or click a category chip ↑');

  // ─── auto-bejárás: fordítható "levél" szöveg-elemek ────────────────────────
  var SEL = 'h1,h2,h3,h4,h5,p,span,a,button,li,div';
  var INLINE_OK = { EM:1, STRONG:1, B:1, I:1, BR:1, A:1, SPAN:1, KBD:1 };
  var units = null; // [{el, html, key}]
  function isLeaf(el) {
    // minden gyerek-eleme inline-biztos (nincs blokk-gyerek); az svg dekoratív → átugorjuk
    for (var i = 0; i < el.children.length; i++) {
      var t = el.children[i].tagName;
      if (t && t.toLowerCase() === 'svg') continue;
      if (!INLINE_OK[t]) return false;
    }
    return true;
  }
  function collect() {
    units = [];
    var added = [];
    var nodes = document.querySelectorAll(SEL);
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.closest('script,style,svg,.brand,.demo-chip,.cf-chip,.lang-switch,.hero-actions')) continue;
      if (el.classList && (el.classList.contains('gly') || el.classList.contains('hcard-ico') || el.classList.contains('ph-ico') || el.classList.contains('hbadge'))) continue;
      // Strukturált kombinált konténerek (fejléc+törzs, ill. összeg+pénznem+egység):
      // NE egyben fordítsuk — a részeket (strong/span, ill. .per) a saját add()-jaik fordítják.
      if (el.classList && (el.classList.contains('biz-feat-text') || el.classList.contains('price-amount'))) continue;
      // ikon-gomb (svg + szöveg) → kihagyjuk (külön kezeljük); a kbd-s és a fizetési-
      // span-es elemek MOST fordíthatók (a fordításuk reprodukálja a kbd-ket / span-eket).
      if (el.querySelector && el.querySelector('svg')) continue;
      if (!isLeaf(el)) continue;
      // Tiszta link-lista (nav-menü, footer link-sor): 2+ önálló link/gomb, és a linkeken
      // KÍVÜL alig van saját szöveg → NE a konténert fordítsuk egyben (összefűzött kulcs),
      // hanem a gyerekeket egyenként. (A bekezdés + néhány inline link — pl. GYIK-válasz —
      // NEM link-lista: ott van bőven saját szöveg, azt egyben fordítjuk.)
      var linkCount = 0;
      for (var lc = 0; lc < el.children.length; lc++) { var lt = el.children[lc].tagName; if (lt === 'A' || lt === 'BUTTON') linkCount++; }
      if (linkCount >= 2) {
        var bareLetters = 0;
        for (var tn = 0; tn < el.childNodes.length; tn++) { if (el.childNodes[tn].nodeType === 3) bareLetters += (el.childNodes[tn].textContent.match(/[A-Za-zÀ-ÿ]/g) || []).length; }
        if (bareLetters < 5) continue; // csak link-lista → gyerekek egyenként
      }
      // csak a legkülső levél-konténert tartjuk (egy már hozzáadott unit leszármazottja kimarad)
      var inside = false;
      for (var k = 0; k < added.length; k++) { if (added[k].contains(el)) { inside = true; break; } }
      if (inside) continue;
      var txt = norm(el.textContent);
      if (!txt || !/[A-Za-zÀ-ÿ]/.test(txt)) continue; // üres / csak szám-szimbólum
      // KULCS: a <br>-t SZÓKÖZKÉNT kezeljük (a textContent-ben a <br> nem ad szóközt, de a
      // szótár-kulcsok természetes szóközzel íródnak — enélkül a <br>-es elemek — stats-címke,
      // hero-proof, CTA-cím, lebegő címkék — nem találnának kulcsot). A többi inline tag
      // szóköz NÉLKÜL tűnik el, hogy a fizetési span-ek összefűzött kulcsa stimmeljen.
      var key = norm(el.innerHTML.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]*>/g, ''));
      units.push({ el: el, html: el.innerHTML, key: key });
      added.push(el);
    }
  }

  var current = 'hu';
  function applyLang(lang, persist) {
    if (LANGS.indexOf(lang) < 0) lang = 'en';
    current = lang;
    if (!units) collect();
    var map = TR[lang];
    for (var i = 0; i < units.length; i++) {
      var u = units[i];
      if (lang === 'hu') { if (u.el.innerHTML !== u.html) u.el.innerHTML = u.html; continue; }
      var tr = map[u.key];
      u.el.innerHTML = (tr != null) ? tr : u.html;
    }
    // chip-ek (data-cat)
    var chips = document.querySelectorAll('.demo-chip, .cf-chip');
    for (var c = 0; c < chips.length; c++) {
      var cat = chips[c].getAttribute('data-cat');
      var label = (CATS[lang] && CATS[lang][cat]) || (CATS.hu[cat]) || '';
      if (!label) continue;
      var gly = chips[c].querySelector('.gly');
      if (gly) { chips[c].innerHTML = ''; chips[c].appendChild(gly); chips[c].appendChild(document.createTextNode(label)); }
      else { chips[c].textContent = label; }
    }
    // hero gombok (kimaradtak a bejárásból): letöltés-gomb szövegcsomó (svg marad) + ghost
    var tr = function (huKey) { return lang === 'hu' ? huKey : (TR[lang][norm(huKey)] || huKey); };
    var hp = document.querySelector('.hero-actions .btn-primary');
    if (hp) { for (var n = 0; n < hp.childNodes.length; n++) { var cn = hp.childNodes[n]; if (cn.nodeType === 3 && norm(cn.textContent)) { cn.textContent = tr('Letöltés — ingyenes') + ' '; break; } } }
    var hg = document.querySelector('.hero-actions .btn-ghost');
    if (hg) hg.textContent = tr('Vállalkozó vagyok');

    // attribútumok
    var input = document.getElementById('demoInput');
    if (input) input.setAttribute('placeholder', ({ hu:'Mit keresel? pl. fodrász, autószerelő, magyar orvos…', de:'Wonach suchst du? z. B. Friseur, KFZ-Werkstatt, ungarischer Arzt…', en:'What are you looking for? e.g. hairdresser, mechanic, Hungarian doctor…' })[lang]);
    setAria('demoClear', { hu:'Törlés', de:'Löschen', en:'Clear' }[lang]);
    setAria('carPrev', { hu:'Előző', de:'Zurück', en:'Previous' }[lang]);
    setAria('carNext', { hu:'Következő', de:'Weiter', en:'Next' }[lang]);
    setAria('videoPoster', { hu:'Videó lejátszása', de:'Video abspielen', en:'Play video' }[lang]);
    document.documentElement.setAttribute('lang', lang);
    // kapcsoló állapot
    var btns = document.querySelectorAll('.lang-switch [data-lang]');
    for (var b = 0; b < btns.length; b++) btns[b].setAttribute('aria-pressed', btns[b].getAttribute('data-lang') === lang ? 'true' : 'false');
    if (persist) { try { localStorage.setItem(KEY, lang); } catch (e) {} }
    // esemény a JS-generátoroknak (hero/demó/carousel újrarenderel)
    window.kintiLang = lang;
    window.dispatchEvent(new CustomEvent('kintilang', { detail: lang }));
  }
  function setAria(id, v) { var el = document.getElementById(id); if (el && v) el.setAttribute('aria-label', v); }

  // ─── globális segédek a fő IIFE-nek (mindig az aktuális nyelvet tükrözik) ───
  window.kintiLang = 'hu';
  window.kintiCat = function (cat) { return (CATS[current] && CATS[current][cat]) || CATS.hu[cat] || cat; };
  window.kintiJLabel = function (huLabel) { return current === 'hu' ? huLabel : ((JLABEL[current] && JLABEL[current][huLabel]) || huLabel); };
  window.kintiJS = function (k) { return current === 'hu' ? null : (JS[current] && JS[current][k]); };
  // Demó cég-nevek (a személynév marad, a magyar közös főnév fordul).
  var NAMES = {
    de: {
      'Kovács Anna fodrászat': 'Friseursalon Anna Kovács', 'Dr. Szabó Eszter — fogorvos': 'Dr. Eszter Szabó — Zahnärztin',
      'Nagy pékség': 'Bäckerei Nagy', 'Horváth autószerviz': 'KFZ-Werkstatt Horváth',
      'Kiskocsma — magyar étterem': 'Kiskocsma — ungarisches Restaurant', 'Molnár & Partner ügyvédi iroda': 'Kanzlei Molnár & Partner',
      'Tóth villanyszerelő': 'Elektriker Tóth', 'Lakatos Krisztina takarítás': 'Gebäudereinigung Krisztina Lakatos',
      'Farkas István — fordító': 'István Farkas — Übersetzer', 'Kiss Bence — matek korrep.': 'Bence Kiss — Mathe-Nachhilfe',
      'Varga Péter — háziorvos': 'Dr. Péter Varga — Hausarzt', 'Bátori autószerviz': 'KFZ-Werkstatt Bátori',
    },
    en: {
      'Kovács Anna fodrászat': 'Anna Kovács Hair Salon', 'Dr. Szabó Eszter — fogorvos': 'Dr. Eszter Szabó — Dentist',
      'Nagy pékség': 'Nagy Bakery', 'Horváth autószerviz': 'Horváth Auto Repair',
      'Kiskocsma — magyar étterem': 'Kiskocsma — Hungarian Restaurant', 'Molnár & Partner ügyvédi iroda': 'Molnár & Partner Law Firm',
      'Tóth villanyszerelő': 'Tóth Electrician', 'Lakatos Krisztina takarítás': 'Krisztina Lakatos Cleaning',
      'Farkas István — fordító': 'István Farkas — Translator', 'Kiss Bence — matek korrep.': 'Bence Kiss — Maths Tutoring',
      'Varga Péter — háziorvos': 'Dr. Péter Varga — GP', 'Bátori autószerviz': 'Bátori Auto Repair',
    },
  };
  window.kintiName = function (n) { return current === 'hu' ? n : ((NAMES[current] && NAMES[current][n]) || n); };

  // ─── detektálás ────────────────────────────────
  function detect() {
    var stored;
    try { stored = localStorage.getItem(KEY); } catch (e) {}
    if (stored && LANGS.indexOf(stored) >= 0) { applyLang(stored, false); return; }
    // IP → nyelv (Cloudflare trace); hiba → EN fallback. Az auto-eredményt NEM mentjük.
    var done = false;
    var to = setTimeout(function () { if (!done) { done = true; applyLang('en', false); } }, 2500);
    fetch('/cdn-cgi/trace', { cache: 'no-store' }).then(function (r) { return r.text(); }).then(function (t) {
      if (done) return; done = true; clearTimeout(to);
      var m = /(?:^|\n)loc=([A-Z]{2})/.exec(t);
      applyLang(langForCountry(m && m[1]), false);
    }).catch(function () { if (!done) { done = true; clearTimeout(to); applyLang('en', false); } });
  }

  // ─── kapcsoló bekötése ─────────────────────────
  function wire() {
    var sw = document.querySelector('.lang-switch');
    if (!sw) return;
    sw.addEventListener('click', function (e) {
      var b = e.target.closest('[data-lang]'); if (!b) return;
      applyLang(b.getAttribute('data-lang'), true); // kézi váltás → mentés
    });
  }

  function boot() { collect(); wire(); detect(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
