/**
 * guide-checklists.ts — bepipálható teendőlisták a tudásbázis-cikkekhez.
 *
 * ⚠️ MIÉRT KÜLÖN MODUL, ÉS MIÉRT NEM A CIKK-BULLETEKBŐL GENERÁLJUK?
 * Mert a cikkek bulletjei TÚLNYOMÓRÉSZT TÉNYEK, nem teendők. A svájci
 * bejelentkezés-cikk felsorolása például ez: „L – rövid távú tartózkodási
 * engedély”, „B – huzamos tartózkodási engedély”… Ezeket bepipálhatóvá tenni
 * értelmetlen listát adna („kipipáltam a B-engedély létezését”). A teendő-
 * listát ezért KÜLÖN, kézzel írjuk, a cikk tartalmából levezetve.
 *
 * ⚠️ Csak azoknak a cikkeknek van listája, amelyek tényleg ELJÁRÁST írnak le
 * (bejelentkezés, biztosítás, bankszámla, adó, jogosítvány…). Ahol a cikk
 * ismeretterjesztő, ott NINCS lista — üres checklistát mutatni rosszabb, mint
 * semmit. A felület csak akkor jeleníti meg a blokkot, ha van tétel.
 *
 * A lépések SORRENDBEN vannak: ami elöl van, azt kell előbb elintézni.
 */

export interface ChecklistLepes {
  /** A teendő — felszólító módban, egy konkrét lépés. */
  text: string;
  /** Rövid magyarázat / határidő (opcionális). */
  hint?: string;
}

/*
 * ⚠️ A TÁROLÁS A LÉPÉS SZÖVEGÉRE kulcsol, nem a sorszámára. Ha egy lépést
 * átfogalmazunk vagy beszúrunk egyet közé, az indexre kulcsolt mentés
 * elcsúszna, és a felhasználó NEM ÁLTALA kipipált tételeket látna késznek.
 * Szövegre kulcsolva az átírt lépés egyszerűen visszaáll pipálatlanra — ami
 * helyes: az már egy másik teendő.
 */
export const GUIDE_CHECKLISTS: Record<string, ChecklistLepes[]> = {
  // ─── SVÁJC ────────────────────────────────────────────────────────────────
  "bejelentkezes-letelepedes": [
    { text: "Szerezz lakcímet (albérlet vagy ideiglenes szállás igazolása)", hint: "A bejelentkezéshez cím kell — enélkül nem indul semmi." },
    { text: "Foglalj időpontot a községi hivatalnál (Gemeinde / commune)", hint: "Sok helyen online is megy, eMovingCH-val." },
    { text: "Készítsd elő: útlevél/személyi, bérleti szerződés, munkaszerződés", hint: "Fotózd le mindet, a papírokat gyakran újra kérik." },
    { text: "Jelentkezz be 14 napon belül a beköltözéstől", hint: "Ez törvényi határidő, nem ajánlás." },
    { text: "Kérd a tartózkodási engedélyt (L / B / C / G)", hint: "3 hónapnál hosszabb tartózkodáshoz kötelező." },
    { text: "Csak a bejelentkezés UTÁN kezdd el a munkát" },
    { text: "Tedd el a bejelentkezési igazolást (Wohnsitzbestätigung)", hint: "Bankszámlához és biztosításhoz kérni fogják." },
  ],
  "egeszsegbiztositas-krankenkasse": [
    { text: "Hasonlítsd össze a biztosítókat a priminfo.admin.ch-n", hint: "A szolgáltatás mindenhol azonos, csak az ár tér el." },
    { text: "Döntsd el az önrészt (Franchise): 300 vagy 2500 CHF", hint: "Magasabb önrész = alacsonyabb havi díj. Ha ritkán jársz orvoshoz, a 2500 éri meg." },
    { text: "Kösd meg az alapbiztosítást az érkezéstől számított 3 hónapon belül", hint: "A fedezet visszamenőleg az érkezés napjától él." },
    { text: "Küldd el a biztosítónak a bejelentkezési igazolást" },
    { text: "Nézd meg, jár-e prémium-támogatás (Prämienverbilligung)", hint: "Alacsony jövedelemnél a kanton hozzájárul — igényelni kell." },
    { text: "Mentsd el a biztosítási kártyát a telefonodra" },
  ],
  bankszamla: [
    { text: "Válassz bankot (hagyományos vagy digitális)", hint: "Digitális banknál gyakran nincs havi díj." },
    { text: "Készítsd elő: útlevél, bejelentkezési igazolás, munkaszerződés" },
    { text: "Nyisd meg a számlát", hint: "Sok banknál online is megy, videós azonosítással." },
    { text: "Add meg az IBAN-t a munkáltatódnak" },
    { text: "Állítsd be a csoportos beszedést a lakbérre és a biztosításra" },
  ],
  "adozas-quellensteuer": [
    { text: "Nézd meg a bérlapodon, vonnak-e forrásadót (Quellensteuer)", hint: "C-engedély nélkül jellemzően igen." },
    { text: "Ellenőrizd, jó tarifát alkalmaznak-e (családi állapot, gyerekek)", hint: "Rossz tarifánál sokat vonhatnak feleslegesen." },
    { text: "Gyűjtsd össze a levonható tételeket", hint: "3. pillér, ingázás, továbbképzés, gyerekfelügyelet." },
    { text: "Adj be korrekciós kérelmet, ha túl sokat vontak", hint: "Határidő jellemzően a következő év március 31." },
    { text: "Tedd el a Lohnausweist (éves bérigazolás)" },
  ],
  lakasberles: [
    { text: "Kérj Betreibungsauszugot (nemleges adósságigazolás)", hint: "Szinte minden bérbeadó kéri; a hivatalnál igényled." },
    { text: "Állítsd össze a pályázati csomagot", hint: "Utolsó 3 bérlap, munkaszerződés, engedély másolata, referencia." },
    { text: "Számold ki, futja-e: a lakbér ne legyen több a nettó bér harmadánál" },
    { text: "Fizesd be a kauciót külön letéti számlára (max 3 havi lakbér)", hint: "A pénz a TE nevedre szól — sosem a bérbeadó számlájára." },
    { text: "Az átadásnál fotózz le MINDEN hibát és vedd jegyzőkönyvbe", hint: "A kaució visszakapása ezen múlik." },
    { text: "Kösd meg a háztartási felelősségbiztosítást", hint: "Sok bérleti szerződés kötelezővé teszi." },
  ],
  "jogositvany-atiras": [
    { text: "Nézd meg, mikor jár le a 12 hónapos határidő", hint: "A svájci lakcím létesítésétől számít." },
    { text: "Csináltasd meg a látásvizsgálatot (Sehtest)", hint: "Optikusnál is megy, pár perc." },
    { text: "Töltsd ki a kantonális űrlapot (Führerausweis-Umtausch)" },
    { text: "Add be a magyar jogosítványt és a fotót a közlekedési hivatalnál" },
    { text: "Vedd át az új kártyát, és tedd el a magyar leadási igazolást" },
  ],
  munkavallalas: [
    { text: "Ellenőrizd, hogy a szakmád szabályozott-e", hint: "Orvos, ápoló, villanyszerelő stb. — ott elismertetés kell." },
    { text: "Írasd alá a munkaszerződést a kezdés ELŐTT", hint: "Nézd meg: felmondási idő, 13. havi, próbaidő." },
    { text: "Add meg a munkáltatónak az AHV-számod és az IBAN-t" },
    { text: "Ellenőrizd az első bérlapot tételesen", hint: "AHV, ALV, BVG, NBU — mind szerepeljen." },
    { text: "Nézd meg, milyen nyugdíjpénztárba (BVG) soroltak" },
  ],

  // ─── AUSZTRIA ────────────────────────────────────────────────────────────
  "at-bejelentkezes": [
    { text: "Töltsd ki a Meldezettelt, és írasd alá a szállásadóval" },
    { text: "Jelentkezz be a Meldeamtnál 3 napon belül", hint: "Törvényi határidő a beköltözéstől." },
    { text: "Tedd el a Meldebestätigungot", hint: "Ez kell bankhoz, munkához, e-cardhoz — mindenhez." },
    { text: "Igényeld az ID Austriát", hint: "Ezzel intézhetsz online szinte mindent." },
    { text: "EU-s polgárként igényeld az Anmeldebescheinigungot", hint: "4 hónapon belül, a Magistratnál." },
  ],
  "at-egeszsegbiztositas": [
    { text: "Ellenőrizd, bejelentett-e a munkáltatód az ÖGK-hoz", hint: "A munkaviszony első napjától kötelező." },
    { text: "Vedd át az e-cardot", hint: "Postán jön, pár hét. Orvoshoz mindig vidd magaddal." },
    { text: "Írasd be a családtagokat (mitversichert)", hint: "Házastárs és gyerek külön díj nélkül." },
    { text: "Válassz háziorvost (Kassenarzt)", hint: "A Wahlarzt magánrendelés — ott előre fizetsz." },
  ],
  "at-bankszamla": [
    { text: "Készítsd elő: útlevél, Meldebestätigung, munkaszerződés" },
    { text: "Nyisd meg a számlát (bankfiókban vagy online)" },
    { text: "Add meg az IBAN-t a munkáltatónak" },
    { text: "Állítsd be a csoportos beszedést a rezsire és a lakbérre" },
  ],
  "at-adozas": [
    { text: "Add meg a munkáltatónak a Sozialversicherungsnummerodat" },
    { text: "Ellenőrizd a bérlapon a KV-besorolást", hint: "A kollektív szerződés szabja meg a minimálbéredet." },
    { text: "Nézd meg, jár-e a 13./14. havi (Urlaubs- és Weihnachtsgeld)" },
    { text: "Add be az Arbeitnehmerveranlagungot", hint: "Éves adókiegyenlítés — az első években szinte biztosan visszajár pénz." },
    { text: "Igényeld a Familienbeihilfét, ha van gyereked", hint: "EU-s munkavállalóként akkor is jár, ha a gyerek Magyarországon él." },
  ],
  "at-lakasberles": [
    { text: "Számolj a belépő költséggel", hint: "Kaució + esetleg Ablöse + ingatlanos díj — ez több havi bér is lehet." },
    { text: "Kérdezd meg, mi tartozik a Betriebskostenbe" },
    { text: "Nézd meg a szerződés típusát (befristet / unbefristet)", hint: "A határozott idejű minimum 3 év lehet." },
    { text: "Az átadásnál készíts fotós jegyzőkönyvet" },
    { text: "Jelentkezz be az új címre a Meldeamtnál" },
  ],
  "at-jogositvany": [
    { text: "Nézd meg a 6 hónapos határidőt a lakcím létesítésétől" },
    { text: "Készítsd elő: jogosítvány, Meldezettel, útlevélkép" },
    { text: "Add be a cserét a Führerscheinbehördénél (BH / Magistrat)" },
    { text: "Vedd át az osztrák kártyát" },
  ],
  "at-munkavallalas": [
    { text: "Nézd meg a szakmád kollektív szerződését (Kollektivvertrag)", hint: "Ez adja a minimálbért — aláírás ELŐTT nézd meg." },
    { text: "Írasd alá a Dienstvertragot" },
    { text: "Ellenőrizd az ÖGK-bejelentést az első napon" },
    { text: "Kérd a Dienstzeugnist kilépéskor" },
  ],

  // ─── NÉMETORSZÁG ─────────────────────────────────────────────────────────
  "de-bejelentkezes": [
    { text: "Kérd el a főbérlőtől a Wohnungsgeberbestätigungot", hint: "Enélkül NEM tudsz bejelentkezni — ne indulj el nélküle." },
    { text: "Foglalj időpontot a Bürgeramtnál", hint: "Nagyvárosban hetekre előre telt; hajnalban szabadulnak fel helyek." },
    { text: "Jelentkezz be 14 napon belül (Anmeldung)" },
    { text: "Tedd el a Meldebescheinigungot" },
    { text: "Várd meg a Steuer-ID-t postán", hint: "2–3 hét. Enélkül a legrosszabb adósávba sorolnak." },
    { text: "Add meg a Steuer-ID-t a munkáltatódnak" },
  ],
  "de-egeszsegbiztositas": [
    { text: "Válassz törvényes biztosítót (gesetzliche Krankenkasse)", hint: "TK, AOK, Barmer… — az alapszolgáltatás azonos." },
    { text: "Add be a belépési kérelmet" },
    { text: "Add meg a biztosító adatait a munkáltatónak" },
    { text: "Vedd át a kártyát (Gesundheitskarte)" },
    { text: "Írasd be a nem dolgozó családtagokat", hint: "Familienversicherung — külön díj nélkül." },
  ],
  "de-bankszamla": [
    { text: "Készítsd elő: útlevél, Meldebescheinigung" },
    { text: "Nyisd meg a Girokontót" },
    { text: "Add meg az IBAN-t a munkáltatónak" },
    { text: "Állítsd be a SEPA-Lastschriftet a rezsire és a lakbérre" },
  ],
  "de-adozas": [
    { text: "Ellenőrizd az adóosztályod (Steuerklasse) a bérlapon", hint: "Házaspárként a III/V vagy IV/IV sok pénzt jelenthet." },
    { text: "Gyűjtsd a levonható tételeket", hint: "Ingázás, munkaeszköz, továbbképzés, költözés." },
    { text: "Add be az adóbevallást (Steuererklärung)", hint: "Az első években jellemzően visszajár pénz." },
    { text: "Igényeld a Kindergeldet, ha van gyereked" },
  ],
  "de-lakasberles": [
    { text: "Szerezz SCHUFA-Auskunftot", hint: "Évi egy példány ingyenes." },
    { text: "Állítsd össze a mappát", hint: "Utolsó 3 bérlap, SCHUFA, személyi, Mietschuldenfreiheitsbescheinigung." },
    { text: "Számolj a kaucióval (max 3 havi hideg bér)", hint: "Három részletben is fizethető — ez törvényi jog." },
    { text: "Az átadásnál fotózz és írj Übergabeprotokollt" },
    { text: "Írasd ki a neved a csengőre és a postaládára", hint: "Enélkül a csomagod visszamegy." },
    { text: "Jelentkezz be az új címre 14 napon belül" },
  ],
  "de-jogositvany": [
    { text: "Nézd meg, kell-e egyáltalán cserélned", hint: "EU-s jogosítvánnyal a lejáratig vezethetsz." },
    { text: "Készítsd elő: jogosítvány, Meldebescheinigung, biometrikus kép" },
    { text: "Add be a Führerscheinstellénél" },
    { text: "Vedd át az új kártyát" },
  ],
  "de-munkavallalas": [
    { text: "Ellenőrizd, szabályozott szakma-e (Anerkennung kell-e)" },
    { text: "Írasd alá az Arbeitsvertragot", hint: "Nézd meg: próbaidő, felmondási idő, túlóra-szabály." },
    { text: "Add meg a Steuer-ID-t és a biztosítót" },
    { text: "Ellenőrizd az első Lohnabrechnungot tételesen" },
    { text: "Ne lépj ki az automatikus nyugdíjpénztárból", hint: "A munkáltató is fizet bele." },
  ],

  // ─── HOLLANDIA ───────────────────────────────────────────────────────────
  "nl-bejelentkezes": [
    { text: "Foglalj időpontot a gemeenténél" },
    { text: "Jelentkezz be 5 napon belül (inschrijven)", hint: "Enélkül nincs BSN — és BSN nélkül semmi sem megy." },
    { text: "Vedd át a BSN-t", hint: "Adó, bank, biztosítás, orvos — mindenhez ez kell." },
    { text: "Igényeld a DigiD-t", hint: "Minden online ügyintézés ezzel megy." },
  ],
  "nl-digid": [
    { text: "Igényeld a DigiD-t a digid.nl oldalon", hint: "BSN-nel." },
    { text: "Várd meg az aktiváló kódot postán", hint: "Néhány munkanap." },
    { text: "Aktiváld és állítsd be az SMS- vagy app-ellenőrzést" },
    { text: "Próbáld ki egy valós ügyben", hint: "Pl. a Belastingdienst oldalán." },
  ],
  "nl-egeszsegbiztositas": [
    { text: "Kösd meg a zorgverzekeringet 4 hónapon belül", hint: "Kötelező; visszamenőleg is kiszámlázzák." },
    { text: "Hasonlítsd össze a díjakat és az önrészt (eigen risico)" },
    { text: "Regisztrálj háziorvoshoz (huisarts)", hint: "Ő a kapuőr: szakorvoshoz csak tőle jutsz el." },
    { text: "Igényeld a zorgtoeslagot, ha jogosult vagy", hint: "Alacsony jövedelemnél a díj nagy részét visszakapod." },
  ],
  "nl-bankszamla": [
    { text: "Készítsd elő: útlevél, BSN, lakcím" },
    { text: "Nyisd meg a számlát" },
    { text: "Kérj pinpast", hint: "Sok bolt NEM fogad hitelkártyát." },
    { text: "Add meg az IBAN-t a munkáltatónak" },
  ],
  "nl-adozas": [
    { text: "Nézd meg, jogosult vagy-e a 30%-regelingre", hint: "A MUNKÁLTATÓNAK kell igényelnie — kérdezz rá." },
    { text: "Add be az aangiftét március és május között" },
    { text: "Ellenőrizd a toeslagokat (zorg, huur, kind)", hint: "Ezek nem járnak automatikusan, igényelni kell." },
    { text: "Tedd el a jaaropgaafot (éves bérigazolás)" },
  ],
  "nl-lakasberles": [
    { text: "Regisztrálj a szociális bérlakás-várólistára", hint: "7–15 év a várakozás — kezdd el AZONNAL, akkor is, ha most nem kell." },
    { text: "Ellenőrizd, „kaal” vagy „gemeubileerd” a lakás", hint: "A „kaal” szó szerint kopasz: se padló, se lámpa, se konyha." },
    { text: "Nézd meg, benne van-e a rezsi (inclusief / exclusief)" },
    { text: "Fizesd a kauciót (jellemzően 1–2 havi)" },
    { text: "Jelentkezz be az új címre a gemeenténél" },
  ],
  "nl-jogositvany": [
    { text: "Nézd meg, kell-e cserélned", hint: "EU-s jogosítvány a lejáratig érvényes." },
    { text: "Készítsd elő: jogosítvány, BSN, fotó" },
    { text: "Add be a gemeenténél" },
    { text: "Vedd át az új kártyát" },
  ],

  // ─── ANGLIA ──────────────────────────────────────────────────────────────
  "gb-nin": [
    { text: "Igényeld a National Insurance numbert a gov.uk-n" },
    { text: "Készülj fel a telefonos vagy online azonosításra" },
    { text: "Addig is kezdhetsz dolgozni", hint: "De szólj a munkáltatónak, hogy folyamatban van." },
    { text: "Ha megjött, add meg a munkáltatónak" },
    { text: "Ellenőrizd a tax code-ot a bérlapon", hint: "Ha „BR” vagy „0T”, túl sok adót vonnak — jelezd a HMRC-nek." },
  ],
  "gb-nhs": [
    { text: "Keress háziorvosi rendelőt (GP surgery) a lakcímed közelében" },
    { text: "Töltsd ki a GMS1 regisztrációs űrlapot", hint: "Útlevelet vagy lakcímigazolást NEM kérhetnek kötelezően." },
    { text: "Mentsd el a 111-es számot", hint: "Nem sürgős esetre — sokszor megspórolja az A&E órákat." },
    { text: "Keress fogorvost külön", hint: "A fogászat NHS-en is külön díjas és nehéz helyet kapni." },
  ],
  "gb-bankszamla": [
    { text: "Szerezz lakcímigazolást (proof of address)", hint: "Klasszikus csapda: bankszámlához kell, de számla nélkül nehéz hozzájutni." },
    { text: "Próbálj digitális bankot, ha a hagyományos elakad", hint: "Ott gyakran elég az útlevél." },
    { text: "Nyisd meg a számlát" },
    { text: "Add meg a sort code-ot és a számlaszámot a munkáltatónak" },
    { text: "Iratkozz fel a választói névjegyzékre (electoral roll)", hint: "Ez építi a credit score-odat." },
  ],
  "gb-adozas": [
    { text: "Ellenőrizd a tax code-ot minden bérlapon" },
    { text: "Hozd létre a Personal Tax Account-ot a gov.uk-n" },
    { text: "Igényeld vissza a túlvont adót, ha van", hint: "Az első év után gyakori." },
    { text: "Tedd el a P60-at (éves igazolás) és a P45-öt (kilépéskor)" },
  ],
  "gb-lakhatas": [
    { text: "Számolj a belépő költséggel", hint: "Kaució (max 5 heti bér) + első havi bér előre." },
    { text: "Kérd el a deposit protection scheme hivatkozási számát", hint: "Törvény kötelezi a főbérlőt — enélkül nincs védve a pénzed." },
    { text: "Tisztázd, kell-e kezes (guarantor)" },
    { text: "Nézd meg a Council Tax sávot", hint: "Egyedülállóként 25% kedvezmény jár — igényelni kell." },
    { text: "Készíts fotós leltárt (inventory) beköltözéskor" },
    { text: "Intézd el a TV Licence-t, ha élő adást néztek" },
  ],
  "gb-jogositvany": [
    { text: "Nézd meg, kell-e cserélned", hint: "EU-s jogosítvánnyal vezethetsz — de a szabályok változhatnak." },
    { text: "Ha cserélsz: töltsd ki a D1-es űrlapot a DVLA-nak" },
    { text: "Küldd be a jogosítványt és az azonosítót" },
    { text: "Vedd át az UK jogosítványt" },
  ],
  "gb-munkavallalas": [
    { text: "Ellenőrizd a szerződés típusát", hint: "A zero-hours nem garantál óraszámot." },
    { text: "Nézd meg, eléri-e a National Living Wage-et" },
    { text: "Gyűjts két referenciát", hint: "Szinte minden álláshoz kérnek." },
    { text: "Ne lépj ki az auto-enrolment nyugdíjból", hint: "A munkáltató is fizet bele." },
    { text: "Intézd a DBS check-et, ha gyerekekkel vagy idősekkel dolgozol" },
  ],

  // ─── SPANYOLORSZÁG ───────────────────────────────────────────────────────
  "es-nie-regisztracio": [
    { text: "Foglalj cita previát a rendőrségre (Policía Nacional)", hint: "Ez a legnehezebb lépés — nézd naponta, hajnalban szabadulnak fel helyek." },
    { text: "Töltsd ki az EX-15 (NIE) vagy EX-18 (regisztráció) űrlapot" },
    { text: "Fizesd be a 790-es illetéket a bankban", hint: "A befizetési igazolás nélkül elküldenek." },
    { text: "Vidd magaddal: útlevél + másolat, űrlap, illeték-igazolás" },
    { text: "Vedd át a NIE-t / a zöld regisztrációs igazolást" },
    { text: "Fényképezd le és tedd el több helyre", hint: "Pótlása újabb cita previa." },
  ],
  "es-empadronamiento": [
    { text: "Foglalj időpontot az önkormányzatnál (ayuntamiento)" },
    { text: "Vidd: útlevél, bérleti szerződés vagy lakhatási nyilatkozat" },
    { text: "Jelentkezz be (empadronamiento)" },
    { text: "Kérj volante de empadronamientót", hint: "Szinte minden ügyhöz kérik, jellemzően 3 hónapnál frissebbet." },
  ],
  "es-seguridad-social": [
    { text: "Igényeld a Seguridad Social számot (NUSS)", hint: "Munkába álláshoz kötelező." },
    { text: "Ellenőrizd, bejelentett-e a munkáltatód" },
    { text: "Igényeld a tarjeta sanitariát a centro de saludban" },
    { text: "Válassz háziorvost (médico de cabecera)" },
    { text: "Töltsd le a vida laboralt", hint: "A teljes spanyol munkatörténeted egy lapon." },
  ],
  "es-cita-previa": [
    { text: "Nézd meg, melyik hivatalhoz kell időpont" },
    { text: "Regisztrálj a hivatal online rendszerébe" },
    { text: "Próbálkozz hajnalban és hétfőn", hint: "Akkor szabadulnak fel a legtöbb helyek." },
    { text: "Nézz szomszédos városokat is", hint: "Ott gyakran hamarabb van szabad időpont." },
    { text: "Nyomtasd ki a visszaigazolást", hint: "Telefonon mutatott képet nem mindenhol fogadnak el." },
  ],
  "es-bankszamla": [
    { text: "Készítsd elő: útlevél, NIE, empadronamiento" },
    { text: "Kérdezd meg a havi számlavezetési díjat", hint: "Sok spanyol banknál van, ha nincs ott a fizetésed." },
    { text: "Nyisd meg a számlát" },
    { text: "Állítsd be a domiciliaciónt a rezsire és a lakbérre" },
  ],
  "es-lakasberles": [
    { text: "Számolj a belépő költséggel", hint: "Fianza (1 havi) + esetleg aval + első havi bér." },
    { text: "Ne fizess ingatlanos jutalékot", hint: "2023 óta a bérbeadót terheli — ne hagyd magadra terhelni." },
    { text: "Kérdezd meg, benne van-e a gastos de comunidad" },
    { text: "Írasd alá a contrato de alquilert, és tarts meg egy példányt" },
    { text: "Jelentkezz be az új címre (empadronamiento)" },
  ],
  "es-adozas": [
    { text: "Tisztázd, adórezidens vagy-e", hint: "183 napnál több tartózkodás Spanyolországban = igen." },
    { text: "Szerezz certificado digitalt vagy Cl@ve-t", hint: "Ezzel online intézhetsz mindent, sorban állás nélkül." },
    { text: "Nézd át a borradort (előkitöltött tervezet)", hint: "Ne fogadd el ellenőrzés nélkül." },
    { text: "Add be a declaración de la rentát április és június között" },
  ],
};

/** Van-e teendőlista ehhez a cikkhez? */
export function hasChecklist(slug: string): boolean {
  return (GUIDE_CHECKLISTS[slug]?.length ?? 0) > 0;
}

export function getChecklist(slug: string): ChecklistLepes[] {
  return GUIDE_CHECKLISTS[slug] ?? [];
}
