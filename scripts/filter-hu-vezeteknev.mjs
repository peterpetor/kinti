/**
 * filter-hu-vezeteknev.mjs — a VEZETÉKNÉV-vezérelt aratás szűrése.
 *
 * ⚠️ MIÉRT KÜLÖN SZŰRŐ: a keresztnév-vezérelt aratásnál (`filter-hu-keresztnev.mjs`)
 * KÉT független magyar jelet követeltünk, mert az „Attila" török is. A
 * vezetéknév-vezérelt aratás más eloszlású: a cégnév tipikusan
 * „Kovacs Johann Maler + Lackierbetrieb" — magyar vezetéknév + NÉMET keresztnév.
 * Ez a második generáció, és a szaknévsorban a helye van; a két-jeles szabály
 * viszont mindet kidobná.
 *
 * ⚠️⚠️ EZÉRT A VEZETÉKNÉV HELYESÍRÁSA a jel, nem a darabszám. Három csoport:
 *
 *   SZIGORU  — a helyesírás csak magyar lehet (`th`, `gh`, `sz`, `cs`, `zs`,
 *              kettőzött `pp`): Tóth, Balogh, Papp, Szabó, Mészáros…
 *              EGY ilyen token elég.
 *   KETES    — magyar IS, de lengyel/román/horvát/német is: Bogdan, Fabian,
 *              Gaspar, Horvat (h NÉLKÜL = horvát!), Vajda, Bodnar, Katona.
 *              Ezekhez KELL magyar keresztnév is.
 *   IDEGEN_VEG — ha a névben van `-ski/-wicz/-escu/-ović` végű token, a találat
 *              lengyel/román/délszláv, akkor is, ha „Bogdan" van benne.
 *              Mérve: „Igielski Bogdan", „Libowski Bogdan", „Skalski Fabian".
 *
 * Futtatás: node scripts/filter-hu-vezeteknev.mjs nyers.json ki.json
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const BE = process.argv[2];
const KI = process.argv[3];

/** német szakma → a mi kategóriánk; CSAK ott, ahol rés van a szaknévsorban */
const SZAKMA = {
  Dachdeckereien: ["tetofedo", "Tetőfedő / Ács"],
  Fliesenverlegungen: ["burkolo", "Burkoló / Csempéző"],
  Parkettfußböden: ["parkettazas", "Padlóburkolás / Parkettázás"],
  Taxiunternehmen: ["taxis", "Taxis / Sofőr"],
  Umzüge: ["koltoztetes", "Költöztetés"],
  Isolierarbeiten: ["szigetelo", "Víz- és hőszigetelő"],
  Bestattungen: ["temetkezes", "Temetkezés"],
  Trockenbau: ["fuggesztett_menyezet", "Álmennyezet / Gipszkarton"],
  "Heizungs- und Lüftungsbau": ["klima", "Klíma / Fűtés"],
  Polstereien: ["karpitos", "Kárpitos"],
  "Blumen und Pflanzen": ["virag", "Virágüzlet"],
  "Gold- und Silberschmieden": ["ekszer", "Ékszerész / Órás"],
  Sanitärinstallationen: ["gazvez", "Víz-gáz szerelő"],
  Elektroinstallationen: ["villany", "Villanyszerelő"],
  Malerbetriebe: ["festo", "Szobafestő / Tapétázó"],
  Tischlereien: ["asztalos", "Asztalos"],
  Bautischlereien: ["asztalos", "Asztalos"],
  Bauunternehmen: ["kőműves", "Kőműves / Betonozó"],
  Bausanierungen: ["lakasfelujitas", "Lakásfelújítás / Kivitelezés"],
  Handwerkerdienste: ["lakasfelujitas", "Lakásfelújítás / Kivitelezés"],
  Montagearbeiten: ["lakasfelujitas", "Lakásfelújítás / Kivitelezés"],
  Gebäudereinigung: ["takarito", "Takarítás"],
  Hausmeisterdienste: ["hazaszerkeszto", "Házmester"],
  "Garten- und Landschaftsbau": ["kertesz", "Kertészet"],
  Transporte: ["futas", "Fuvarozás"],
  Speditionen: ["szallitmanyozo", "Szállítmányozó / Speditőr"],
  "Schlüssel und Schlösser": ["lakatos", "Lakatos"],
  Autoreparaturen: ["autoszer", "Autószerelő"],
  Bäckereien: ["pek", "Pék"],
  Fußpflege: ["pedikur", "Pedikűr / Lábápolás"],
  Fahrschulen: ["gepijarmu_oktato", "Autósiskola / Oktató"],
  "Kfz-Werkstätten": ["autoszer", "Autószerelő"],
  "Fahrräder und Fahrradzubehör": ["kerekpar", "Kerékpárszerviz"],
  Reifen: ["gumiszerviz", "Gumiszerviz"],
  Glasereien: ["uveges", "Üveges"],
  Schornsteinfeger: ["kemenysepro", "Kéményseprő"],
  "Schuhmacher und Schuhreparaturen": ["cipesz", "Cipész / Kulcsmásoló"],
  Änderungsschneidereien: ["varrono", "Varrónő"],
  Metallbau: ["lakatos", "Lakatos"],
  Schweißtechnik: ["hegeszto", "Hegesztő / Fémszerkezet"],
  Karosseriebau: ["karosszeria", "Karosszérialakatos"],
  Autolackierereien: ["autofenyezo", "Autófényező"],
  Möbeltischlereien: ["asztalos", "Asztalos"],
  Raumausstattung: ["lakberendezes", "Belsőépítészet"],
  Gerüstbau: ["allvanyozo", "Állványozó"],
  "Straßen- und Tiefbau": ["terkovezes", "Térkövezés / Útépítés"],
  Pflasterarbeiten: ["terkovezes", "Térkövezés / Útépítés"],
  Fensterbau: ["nyilaszaros", "Nyílászáró / Ablak-ajtó"],
  "Rolladen und Jalousien": ["arnyekolastechnika", "Árnyékolástechnika / Redőny"],
  Wärmedämmung: ["homlokzatszigetelo", "Homlokzatszigetelő / Dryvit"],
  "Kurier- und Botendienste": ["futar", "Futárszolgálat"],
  "Elektrogeräte und -bedarf": ["haztartasigep_szerelo", "Háztartásigép- / Légkondiszerelő"],
};

/**
 * SZIGORÚ vezetéknevek: a helyesírásuk gyakorlatilag csak magyar lehet.
 * ⚠️ A `th`/`gh` végződés a kulcs: „Tóth" magyar, „Horvat" HORVÁT.
 */
const SZIGORU = `szabo szabó kovacs kovács toth tóth horvath horváth nemeth németh takacs takács
meszaros mészáros szilagyi szilágyi feher fehér szucs szűcs kocsis pinter pintér hegedus hegedűs
gulyas gulyás lukacs lukács szanto szántó szoke szőke kertesz kertész matyas mátyás moricz móricz
pongracz rakoczi rákóczi szigeti csordas csordás borbely borbély dudas dudás sebestyen sebestyén
pasztor pásztor juhasz juhász balogh papp kiraly király somogyi sipos balazs balázs torok török
hajdu zsigmond racz rácz olah oláh bognar bognár illes illés vincze biro bíró tolnai vamos vámos
nagy varga molnar molnár fodor veres kelemen fulop fülöp rozsa rózsa farkas
csiszar csiszár csik csík csonka gyori győri herczeg lorincz lőrincz madarasz madarász kaszas kaszás
szekely székely sarkozi sárközi zsoldos zambo zámbó ujvari újvári ujhelyi újhelyi varady várady
halasz halász hollo holló galambos revesz révész rigo rigó suto sütő vago vágó voros vörös orsos
pusztai banyai bányai bartha tarjan tarján vermes erdelyi erdélyi deak deák solymosi magyar ferencz
mezei nyari nyári pataki kozma lantos kardos kerekes dobos`
  .split(/\s+/)
  .filter(Boolean);

/**
 * KÉTES vezetéknevek: magyarul is léteznek, de más nyelven GYAKORIBBAK.
 * Ezekhez magyar keresztnév is kell.
 * ⚠️ `horvat` (h nélkül) horvát/szlovén — NEM ugyanaz, mint a magyar „Horváth".
 * ⚠️ `bogdan`, `fabian`, `gaspar` másutt KERESZTNÉV, és sokszorosan gyakoribb.
 */
const KETES = `bogdan fabian gaspar gáspár horvat katona vajda bodnar bodnár kosa kósa orban orbán
boros kalmar kalmár veresz`
  .split(/\s+/)
  .filter(Boolean);

/** ⚠️ Idegen (lengyel/román/délszláv) névvég — ez a találatot MEGFOGJA akkor is,
 *  ha „Bogdan"/„Fabian" van benne. Mérve: Igielski Bogdan, Skalski Fabian. */
const IDEGEN_VEG = /\b\w+(ski|sky|cki|wicz|czyk|escu|eanu|ovic|ović|ić|enko|chuk|shvili)\b/i;

/** ⚠️ Az „Attila"/„Bela" török is — ezek a nevek kizárnak. */
const TOROK = `yilmaz ozturk öztürk kaya demir celik çelik sahin şahin yildiz aydin ozdemir arslan
dogan kilic aslan cetin kara koc kurt ozkan simsek polat korkmaz cakir erdogan gunes aktas bulut
karaca yildirim ozer tekin bayram gul duman ates kaplan sen turan akin avci bozkurt cakmak eren
guler kartal ozcan sari sonmez tas toprak ucar yalcin yavuz sahan uzun keskin gunay ergin balci
mehmet ali mustafa ahmet hasan huseyin ibrahim murat osman yusuf emre serkan fatih kemal suleyman
ramazan bekir halil recep erdal ayse fatma emine hatice zeynep elif meryem sultan hulya ozlem seda
derya aysel cemal ismail ilhan selim cengiz erhan bulent nihat vedat sinan tuncay okan volkan
ercan hakan levent`
  .split(/\s+/)
  .filter(Boolean);

/** magyar keresztnevek — a KÉTES vezetéknevek megerősítéséhez */
const KERESZT = `zoltan zoltán csaba attila laszlo lászló tibor sandor sándor gabor gábor istvan
istván ferenc bela béla arpad árpád zsolt balazs balázs gergely levente akos ákos imre geza géza
janos jános jozsef józsef andras andrás miklos miklós gyula lajos karoly károly ildiko ildikó
katalin zsuzsanna aniko anikó eniko enikő tunde tünde csilla emese reka réka kinga bernadett
szilard szilárd kalman kálmán dezso dezső vilmos botond marton márton aron áron szabolcs krisztian
krisztián barnabas barnabás elemer elemér zsombor bence jeno jenő denes dénes kristof kristóf
balint bálint gergo gergő odon ödön zsigmond kazmer kázmér bertalan domonkos benedek ambrus kornel
kornél nandor nándor tivadar aladar aladár csongor zalan zalán almos álmos elod előd bulcsu samuel
piroska ilona jolan jolán sarolta ibolya boglarka boglárka hajnalka orsolya noemi noémi beata beáta
melinda zsofia zsófia judit marta márta erzsebet erzsébet gizella margit etelka rozalia terezia
lilla zita borbala borbála franciska henrietta`
  .split(/\s+/)
  .filter(Boolean);

const norm = (s) =>
  (s || "")
    .toLowerCase()
    .replace(/[^\p{L}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

export function hitelesseg(nev) {
  const n = norm(nev);
  const tokenek = new Set(n.split(" "));
  const okok = [];
  let pont = 0;

  if (IDEGEN_VEG.test(n)) return { pont: -9, okok: ["⚠️ idegen névvég (lengyel/román/délszláv)"], elfogad: false };
  for (const t of TOROK) if (tokenek.has(t)) return { pont: -9, okok: [`⚠️ TÖRÖK:${t}`], elfogad: false };

  const szigoru = SZIGORU.filter((v) => tokenek.has(v));
  const ketes = KETES.filter((v) => tokenek.has(v));
  const kereszt = KERESZT.filter((k) => tokenek.has(k) && !szigoru.includes(k) && !ketes.includes(k));

  if (szigoru.length) { pont += 4; okok.push(`szigorú vezetéknév:${szigoru[0]}`); }
  if (ketes.length) { pont += 1; okok.push(`kétes vezetéknév:${ketes[0]}`); }
  if (kereszt.length) { pont += 3; okok.push(`keresztnév:${kereszt[0]}`); }
  if (/[őű]/.test(nev.toLowerCase())) { pont += 2; okok.push("ő/ű betű"); }
  if (/\b(magyar|ungarisch|hungar|puszta|budapest|balaton|csarda|csárda|betyar|tisza|duna|paprika|hungaria)\b/i.test(nev)) {
    pont += 3;
    okok.push("magyar szó");
  }

  // ELFOGADÁS: egy szigorú vezetéknév elég; a kétes CSAK magyar keresztnévvel.
  const elfogad = szigoru.length > 0 || (ketes.length > 0 && kereszt.length > 0);
  return { pont, okok, elfogad };
}

// ⚠️ A modult a `filter-hu-11880.mjs` IMPORTÁLJA a hitelesség-vizsgálatért.
// A feltétel ezért NEM lehet `if (BE && KI)`: a process.argv az IMPORTÁLÓ
// szkript argumentumait tartalmazza, tehát a szűrő ott is lefutna, és
// FELÜLÍRNÁ a másik szűrő kimeneti fájlját (mérve: két „elfogadott jelölt"
// sor egyetlen futásban). A belépési pontot kell összehasonlítani.
const kozvetlenulFut =
  process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (kozvetlenulFut) {
  const nyers = JSON.parse(readFileSync(BE, "utf8"));
  const ki = [];
  for (const x of nyers) {
    const m = SZAKMA[x.szakma];
    if (!m) continue;
    if (!x.tel || x.tel.replace(/\D/g, "").length < 7) continue; // elérhetőség nélkül zsákutca
    if (!x.cim || !/\d{5}/.test(x.cim)) continue; // ⚠️ irányítószám nélkül nincs régió és nincs geokód
    const h = hitelesseg(x.nev);
    if (!h.elfogad) continue;
    ki.push({ ...x, kategoria: m[0], kategoria_cimke: m[1], pont: h.pont, okok: h.okok });
  }
  ki.sort((a, b) => b.pont - a.pont || a.kategoria.localeCompare(b.kategoria));
  writeFileSync(KI, JSON.stringify(ki, null, 1), "utf8");

  const cnt = {};
  for (const x of ki) cnt[x.kategoria] = (cnt[x.kategoria] || 0) + 1;
  console.log(`${nyers.length} nyers → ${ki.length} elfogadott jelölt`);
  console.log(
    Object.entries(cnt)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k}:${v}`)
      .join("  "),
  );

}
