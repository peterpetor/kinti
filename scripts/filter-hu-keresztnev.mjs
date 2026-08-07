// A cégjegyzék-aratás szűrése: (1) csak RÉS-szakmák, (2) magyar hitelesség.
// ⚠️ A keresztnév ÖNMAGÁBAN kevés: az „Attila" török is, a „Bela"/„Aron" szláv
// és német is. Kell egy MÁSODIK jel — magyar vezetéknév, ő/ű betű, vagy magyar szó.
import { readFileSync, writeFileSync } from "node:fs";

const BE = process.argv[2];
const KI = process.argv[3];

/** német szakma → a mi kategóriánk; csak azok, ahol RÉS van */
const SZAKMA = {
  "Dachdeckereien": ["tetofedo", "Tetőfedő / Ács"],
  "Fliesenverlegungen": ["burkolo", "Burkoló / Csempéző"],
  "Parkettfußböden": ["parkettazas", "Padlóburkolás / Parkettázás"],
  "Taxiunternehmen": ["taxis", "Taxis / Sofőr"],
  "Umzüge": ["koltoztetes", "Költöztetés"],
  "Isolierarbeiten": ["szigetelo", "Víz- és hőszigetelő"],
  "Bestattungen": ["temetkezes", "Temetkezés"],
  "Trockenbau": ["fuggesztett_menyezet", "Álmennyezet / Gipszkarton"],
  "Heizungs- und Lüftungsbau": ["klima", "Klíma / Fűtés"],
  "Polstereien": ["karpitos", "Kárpitos"],
  "Blumen und Pflanzen": ["virag", "Virágüzlet"],
  "Gold- und Silberschmieden": ["ekszer", "Ékszerész / Órás"],
  "Sanitärinstallationen": ["gazvez", "Víz-gáz szerelő"],
  "Elektroinstallationen": ["villany", "Villanyszerelő"],
  "Malerbetriebe": ["festo", "Szobafestő / Tapétázó"],
  "Tischlereien": ["asztalos", "Asztalos"],
  "Bautischlereien": ["asztalos", "Asztalos"],
  "Bauunternehmen": ["kőműves", "Kőműves / Betonozó"],
  "Bausanierungen": ["lakasfelujitas", "Lakásfelújítás / Kivitelezés"],
  "Handwerkerdienste": ["lakasfelujitas", "Lakásfelújítás / Kivitelezés"],
  "Montagearbeiten": ["lakasfelujitas", "Lakásfelújítás / Kivitelezés"],
  "Gebäudereinigung": ["takarito", "Takarítás"],
  "Hausmeisterdienste": ["hazaszerkeszto", "Házmester"],
  "Garten- und Landschaftsbau": ["kertesz", "Kertészet"],
  "Transporte": ["futas", "Fuvarozás"],
  "Speditionen": ["szallitmanyozo", "Szállítmányozó / Speditőr"],
  "Schlüssel und Schlösser": ["lakatos", "Lakatos"],
  "Autoreparaturen": ["autoszer", "Autószerelő"],
  "Bäckereien": ["pek", "Pék"],
  "Fußpflege": ["pedikur", "Pedikűr / Lábápolás"],
  "Fahrschulen": ["gepijarmu_oktato", "Autósiskola / Oktató"],
  "Kfz-Werkstätten": ["autoszer", "Autószerelő"],
  "Fahrräder und Fahrradzubehör": ["kerekpar", "Kerékpárszerviz"],
  "Reifen": ["gumiszerviz", "Gumiszerviz"],
  "Glasereien": ["uveges", "Üveges"],
  "Schornsteinfeger": ["kemenysepro", "Kéményseprő"],
  "Schuhmacher und Schuhreparaturen": ["cipesz", "Cipész / Kulcsmásoló"],
  "Änderungsschneidereien": ["varrono", "Varrónő"],
  "Metallbau": ["lakatos", "Lakatos"],
  "Schweißtechnik": ["hegeszto", "Hegesztő / Fémszerkezet"],
  "Karosseriebau": ["karosszeria", "Karosszérialakatos"],
  "Autolackierereien": ["autofenyezo", "Autófényező"],
  "Möbeltischlereien": ["asztalos", "Asztalos"],
  "Raumausstattung": ["lakberendezes", "Belsőépítészet"],
  "Gerüstbau": ["allvanyozo", "Állványozó"],
  "Straßen- und Tiefbau": ["terkovezes", "Térkövezés / Útépítés"],
  "Pflasterarbeiten": ["terkovezes", "Térkövezés / Útépítés"],
  "Fensterbau": ["nyilaszaros", "Nyílászáró / Ablak-ajtó"],
  "Rolladen und Jalousien": ["arnyekolastechnika", "Árnyékolástechnika / Redőny"],
  "Wärmedämmung": ["homlokzatszigetelo", "Homlokzatszigetelő / Dryvit"],
  "Kurier- und Botendienste": ["futar", "Futárszolgálat"],
  "Elektrogeräte und -bedarf": ["haztartasigep_szerelo", "Háztartásigép- / Légkondiszerelő"],
};

/** Magyar vezetéknevek — a leggyakoribbak + a jellegzetesek. */
const VEZETEKNEV = `nagy kovacs kovács szabo szabó toth tóth horvath horváth varga kiss molnar molnár
nemeth németh farkas balogh papp takacs takács juhasz juhász lakatos meszaros mészáros olah oláh
racz rácz fekete szilagyi szilágyi torok török feher fehér gal gál balazs balázs szucs szűcs kocsis
pinter pintér fodor veres bogdan bogdán kiraly király laszlo lászló katona jonas jónás somogyi boros
biro bíró vincze illes illés sipos gaspar gáspár antal marton márton erdelyi erdélyi nemes halasz
halász bakos sandor sándor bognar bognár vass voros vörös balint bálint fabian fábián hegedus hegedűs
varadi váradi budai vigh pasztor pásztor szalai csonka deak deák sebestyen sebestyén dudas dudás barta
kelemen major hajdu mate máté csordas csordás lengyel bene pal pál tamas tamás kerekes bodnar bodnár
barna szekeres dobos fulop fülöp borbely borbély csorba cseh gulyas gulyás berki orosz santa sánta
kis magyar hollo holló csik csík dombi galambos gyori győri jakab kalmar kalmár lukacs lukács mezei
molnarne nyari nyári oravecz orban orbán pataki peterfi pintye rigo rigó sass suto sütő szanto szántó
szendrei szoke szőke tar tarr toldi urban urbán vago vágó vamos vámos vida virag virág zsigmond
csanadi csanádi elek gombos gyorgy györgy heves hidasi imre janko jankó kardos kaszas kaszás kis-toth
kozma lorincz lőrincz madarasz madarász mohacsi mohácsi nadasdi paloczi rekasi révész solymosi sos sós
tarjan tarján temesvari temesvári tisza ujvari újvári valyi varkonyi várkonyi zambo zámbó zsoldos
adamek arany asztalos bacsi baksa banhegyi bathory batori becsi belenyi berta bertalan bicskei bihari
csajbi csiszar csiszár egedi eszenyi ferencz galfi gile gorog görög karalyos lehel lokodi medgyessy
olajos posalaki rabek rethelyi szelei szeremy tellinger timar tímár trenka szinte gajdos penzes pénzes
schonekker banyai bányai debreczeni dobo dobó erdei ficsor forgacs forgács fulop galla garai gerencser
hercegh horvat kabai kalocsai kanyo karacsonyi karácsonyi kertesz kertész kondor kosa kósa kubinyi
lantos leko lenart lénárt lippai marosi matyas mátyás mezo mező mikola miskolczi moricz móricz
nemesszeghy nyerges pallagi pinczes pocsai pongracz pongrácz rakoczi rákóczi rozsa rózsa salgo
somodi szendi szentesi szepesi szigeti szoboszlai szollosi tarczali tegzes tolnai tordai ujhelyi
vajda vecsei vitez vitéz zilahi zoldi zöldi`
  .split(/\s+/)
  .filter(Boolean);

/** ⚠️ Az „Attila" TÖRÖK név is — ezek a vezetéknevek kizárnak. */
const TOROK = `cengiz pehlivanoglu tannrikut yilmaz ozturk öztürk kaya demir celik çelik sahin şahin
yildiz yıldız aydin aydın ozdemir özdemir arslan dogan doğan kilic kılıç aslan cetin çetin kara koc
koç kurt ozkan özkan simsek şimşek polat korkmaz cakir çakır erdogan erdoğan gunes güneş aktas aktaş
bulut karaca yildirim yıldırım ozer özer tekin bayram gul gül duman ates ateş kaplan sen şen turan
akin akın avci avcı bozkurt cakmak eren guler güler kartal ozcan özcan sari sarı sonmez sönmez
tas taş toprak ucar uçar yalcin yalçın yavuz sahan uzun keskin gunay güenay ergin balci balcı
mehmet pinar pınar ali mustafa ahmet hasan huseyin hüseyin ibrahim ibrahím murat osman yusuf emre
serkan fatih kemal suleyman süleyman ramazan bekir halil recep erdal ayse ayşe fatma emine hatice
zeynep elif meryem sultan hulya hülya gul ozlem özlem seda derya aysel cemal ismail cetin ilhan
selim cengiz erhan bulent bülent nihat vedat sinan tuncay okan volkan ercan hakan levent`
  .split(/\s+/)
  .filter(Boolean);

const norm = (s) =>
  (s || "")
    .toLowerCase()
    .replace(/[^\p{L}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Magyar hitelesség pontozás — MINDIG kell második jel a keresztnév mellé. */
function hitelesseg(nev) {
  const n = norm(nev);
  const tokenek = new Set(n.split(" "));
  const okok = [];
  let pont = 0;

  if (/[őű]/.test(nev.toLowerCase())) { pont += 3; okok.push("ő/ű betű"); }
  // ⚠️ A vezetéknév- és a keresztnév-találat NEM lehet UGYANAZ a token.
  // „Wiechmann Sandor” egyetlen magyar jel (Sandor), nem kettő — a `Sandor`
  // ugyanis mindkét listán szerepel. Enélkül minden német+egy magyar szó
  // ugyanannyi pontot kapna, mint egy valódi „Kovács Zoltán”.
  const kereszttalalat = new Set();
  for (const v of VEZETEKNEV) if (tokenek.has(v)) { pont += 3; okok.push(`vezetéknév:${v}`); kereszttalalat.add(v); break; }
  if (/\b(magyar|ungarisch|hungar|puszta|budapest|balaton|csarda|csárda|gulyas|gulyás|betyar|tisza|duna|paprika|hungaria)\b/i.test(nev)) {
    pont += 3; okok.push("magyar szó");
  }
  // két magyar keresztnév egymás mellett (pl. „Hajdu Csaba Jozsef”)
  // ⚠️ A listát TARTSD SZINKRONBAN a lekérdezett nevekkel: ha egy néven
  // kerestél, de itt nincs benne, a találat CSAK EGY jelet kap, és a
  // két-jeles küszöbön kiesik. Így maradt ki elsőre a „Gál Jenő”.
  const KERESZT = ["zoltan","zoltán","csaba","attila","laszlo","lászló","tibor","sandor","sándor","gabor","gábor","istvan","istván","ferenc","bela","béla","arpad","árpád","zsolt","balazs","balázs","gergely","levente","akos","ákos","imre","geza","géza","janos","jános","jozsef","józsef","andras","andrás","miklos","miklós","gyula","lajos","karoly","károly","ildiko","ildikó","katalin","zsuzsanna","aniko","anikó","eniko","enikő","tunde","tünde","csilla","emese","reka","réka","kinga","bernadett","szilard","szilárd","kalman","kálmán","dezso","dezső","vilmos","botond","marton","márton","aron","áron","szabolcs","krisztian","krisztián","barnabas","barnabás","elemer","elemér","zsombor","bence",
    "jeno","jenő","denes","dénes","kristof","kristóf","balint","bálint","gergo","gergő","odon","ödön","zsigmond","kazmer","kázmér","bertalan","domonkos","benedek","ambrus","kornel","kornél","nandor","nándor","tivadar","aladar","aladár","csongor","zalan","zalán","almos","álmos","elod","előd","bulcsu","bulcsú","samuel","sámuel",
    "piroska","ilona","jolan","jolán","sarolta","ibolya","boglarka","boglárka","hajnalka","orsolya","noemi","noémi","beata","beáta","melinda","zsofia","zsófia","judit","marta","márta","erzsebet","erzsébet","gizella","margit","etelka","rozalia","rozália","terezia","terézia","lilla","zita","borbala","borbála","franciska","henrietta"];
  const kereszt = KERESZT.filter((k) => tokenek.has(k) && !kereszttalalat.has(k));
  if (kereszt.length >= 2) { pont += 2; okok.push("két magyar keresztnév"); }
  if (kereszt.length >= 1) { pont += 3; okok.push(`keresztnév:${kereszt[0]}`); }

  for (const t of TOROK) if (tokenek.has(t)) { pont -= 9; okok.push(`⚠️TÖRÖK:${t}`); break; }

  return { pont, okok, ketJel: okok.filter((o) => /^(vezetéknév|keresztnév|ő\/ű|magyar szó)/.test(o)).length >= 2 };
}

const nyers = JSON.parse(readFileSync(BE, "utf8"));
const ki = [];
for (const x of nyers) {
  const m = SZAKMA[x.szakma];
  if (!m) continue;
  if (!x.tel || x.tel.length < 6) continue; // elérhetőség nélkül zsákutca
  const h = hitelesseg(x.nev);
  ki.push({ ...x, kategoria: m[0], kategoria_cimke: m[1], pont: h.pont, okok: h.okok, ketJel: h.ketJel });
}
ki.sort((a, b) => b.pont - a.pont || a.kategoria.localeCompare(b.kategoria));
writeFileSync(KI, JSON.stringify(ki, null, 1), "utf8");

// ⚠️ KÉT FÜGGETLEN JEL a küszöb, nem a nyers pontszám.
const erosek = ki.filter((x) => x.ketJel && x.pont >= 6);
console.log(`${nyers.length} nyers → ${ki.length} rés-szakmában, ebből ${erosek.length} erős jelű (pont ≥ 4)`);
const cnt = {};
for (const x of erosek) cnt[x.kategoria] = (cnt[x.kategoria] || 0) + 1;
console.log(Object.entries(cnt).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}`).join("  "));
