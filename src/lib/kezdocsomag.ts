/**
 * kezdocsomag.ts — „Kezdőcsomag": az első hetek hivatalos teendői ORSZÁGONKÉNT.
 *
 * ⚠️ EZ EGY VALÓS HIBÁBÓL SZÜLETETT. A lista korábban EGYETLEN, lapos tömb volt,
 * csupa svájci tétellel (AHV, Kreisbüro, Krankenkasse, Ausweis), a lap címe
 * pedig „Svájci Kezdőcsomag". A belépő viszont az ÁLTALÁNOS jelentkezés-
 * visszaigazolóból nyílik — vagyis aki angliai, német vagy spanyol állásra
 * jelentkezett, az is svájci teendőlistát kapott.
 *
 * A javítás TÁBLA, nem elágazás: egy 7. ország felvételekor a hiányzó sor
 * azonnal látszik (és a felület kimondja, hogy nincs listánk), nem örököl
 * csendben svájci tartalmat. Lásd a memóriában: binary-country-fallthrough.
 *
 * ⚠️ A TARTALOM a saját útmutatóinkból (lib/guides.ts) és a hozzájuk kurált
 * teendőlistákból (lib/guide-checklists.ts) származik — nem új tényállítás.
 * A határidőket a cikkek megfogalmazásában hagyjuk (ahol azok hedgelnek, mi
 * sem pontosítunk napra).
 *
 * ⚠️ A SVÁJCI TÉTELEK AZONOSÍTÓI VÁLTOZATLANOK (ahv, bank, kreisburo,
 * krankenkasse, permit, phone) — a haladás localStorage-ban ezekre kulcsol,
 * átnevezésük a meglévő felhasználók pipáit törölné.
 */

import type { IconName } from "@/components/ui";

export interface KezdoLepes {
  id: string;
  title: string;
  description: string;
  icon: IconName;
}

export const KEZDOCSOMAG: Record<string, KezdoLepes[]> = {
  CH: [
    { id: "ahv", title: "AHV-szám (TB-szám) igénylése", description: "A munkáltatónak kell kiváltania az első fizetéshez. Kérdezz rá a HR-nél!", icon: "briefcase" },
    { id: "bank", title: "Svájci bankszámla nyitása", description: "Kantonalbank, UBS vagy digitális bank. Szükség lesz a munkaszerződésre hozzá.", icon: "bank" },
    { id: "kreisburo", title: "Lakcím-bejelentés (Kreisbüro / Gemeinde)", description: "A beköltözéstől számított 14 napon belül be kell jelentkezned az önkormányzatnál.", icon: "home" },
    { id: "krankenkasse", title: "Egészségbiztosítás (Krankenkasse)", description: "3 hónapod van megkötni, de visszamenőleg az első naptól fizetsz. Az önrészt (franchise) válaszd meg okosan.", icon: "heart" },
    { id: "permit", title: "Tartózkodási engedély (Ausweis) átvétele", description: "Általában postán jön (L vagy B engedély) a bejelentkezés után pár héttel.", icon: "document" },
    { id: "phone", title: "Svájci telefonszám", description: "A legtöbb helyi cég nem szívesen hív vissza magyar számot.", icon: "phone" },
  ],
  AT: [
    { id: "at-meldezettel", title: "Meldezettel — lakcím-bejelentés", description: "A beköltözéstől 3 napon belül a Meldeamtnál; a Meldezettelt a szállásadónak is alá kell írnia.", icon: "home" },
    { id: "at-ecard", title: "Társadalombiztosítás és e-card", description: "A munkáltató jelent be az ÖGK-hoz az első naptól. Az e-card postán jön — orvoshoz mindig vidd magaddal.", icon: "heart" },
    { id: "at-bank", title: "Osztrák bankszámla", description: "Kell hozzá útlevél, Meldebestätigung és a munkaszerződés. Az IBAN-t add meg a munkáltatónak.", icon: "bank" },
    { id: "at-anmeldung", title: "Anmeldebescheinigung (EU-regisztráció)", description: "3 hónapnál hosszabb tartózkodáshoz, 4 hónapon belül, a Magistratnál.", icon: "document" },
    { id: "at-idaustria", title: "ID Austria igénylése", description: "Ezzel intézhetsz online szinte mindent — FinanzOnline, Familienbeihilfe, hivatalos levelek.", icon: "key" },
    { id: "at-phone", title: "Osztrák telefonszám", description: "A helyi cégek és hivatalok szívesebben hívnak vissza osztrák számot.", icon: "phone" },
  ],
  DE: [
    { id: "de-wohnungsgeber", title: "Wohnungsgeberbestätigung a főbérlőtől", description: "Enélkül NEM tudsz bejelentkezni — ne indulj el a hivatalba nélküle.", icon: "document" },
    { id: "de-anmeldung", title: "Anmeldung — lakcím-bejelentés", description: "A beköltözés után általában 1–2 héten belül a Bürgeramtnál (városonként eltér). Időpontot foglalj előre.", icon: "home" },
    { id: "de-steuerid", title: "Steuer-ID megérkezése", description: "Postán jön pár héten belül. Enélkül a legrosszabb adósávba sorolnak — add meg a munkáltatónak, amint megvan.", icon: "briefcase" },
    { id: "de-krankenkasse", title: "Egészségbiztosító (Krankenkasse) választása", description: "Törvényes biztosítót választasz, majd a biztosító adatait megadod a munkáltatónak.", icon: "heart" },
    { id: "de-bank", title: "Girokonto nyitása", description: "Kell hozzá útlevél és Meldebescheinigung. A rezsit és a lakbért SEPA-Lastschrifttel fizetik.", icon: "bank" },
    { id: "de-phone", title: "Német telefonszám", description: "A legtöbb hivatal és szolgáltató német számot kér.", icon: "phone" },
  ],
  NL: [
    { id: "nl-brp", title: "BRP-regisztráció a gemeenténél", description: "A beköltözés után pár napon belül, időpontfoglalással. Enélkül nincs BSN.", icon: "home" },
    { id: "nl-bsn", title: "BSN átvétele", description: "Munka, bankszámla, biztosítás, adó — mindenhez ez kell.", icon: "document" },
    { id: "nl-digid", title: "DigiD igénylése", description: "Minden online ügyintézés ezzel megy; az aktiváló kód postán jön.", icon: "key" },
    { id: "nl-zorg", title: "Zorgverzekering megkötése", description: "4 hónapon belül kötelező, és visszamenőleg is kiszámlázzák. Nézd meg, jár-e zorgtoeslag.", icon: "heart" },
    { id: "nl-bank", title: "Holland bankszámla és pinpas", description: "Sok bolt NEM fogad hitelkártyát — a pinpas mindennapos szükséglet.", icon: "bank" },
    { id: "nl-huisarts", title: "Regisztráció háziorvoshoz (huisarts)", description: "Ő a kapuőr: szakorvoshoz csak rajta keresztül jutsz el.", icon: "health" },
  ],
  GB: [
    { id: "gb-nin", title: "National Insurance number igénylése", description: "A gov.uk-n indítod. Addig is dolgozhatsz — szólj a munkáltatónak, hogy folyamatban van.", icon: "document" },
    { id: "gb-taxcode", title: "Tax code ellenőrzése a bérlapon", description: "Ha „BR” vagy „0T” áll rajta, túl sok adót vonnak — jelezd a HMRC-nek.", icon: "briefcase" },
    { id: "gb-bank", title: "Bankszámla nyitása", description: "Lakcímigazolást kérnek; ha a hagyományos bank elakad, próbálj digitálisat.", icon: "bank" },
    { id: "gb-gp", title: "Regisztráció háziorvoshoz (GP)", description: "Ingyenes, és nem kérhetnek hozzá kötelezően útlevelet vagy lakcímkártyát.", icon: "health" },
    { id: "gb-council", title: "Council Tax bejelentés", description: "A helyi councilnál. Egyedülállóként 25% kedvezmény jár — igényelni kell.", icon: "home" },
    { id: "gb-electoral", title: "Feliratkozás a választói névjegyzékre", description: "Nem csak szavazáshoz kell: ez építi a credit score-odat is.", icon: "users" },
  ],
  ES: [
    { id: "es-cita", title: "Cita previa foglalása", description: "Ez a legnehezebb lépés — nézd naponta, hajnalban szabadulnak fel helyek.", icon: "calendar" },
    { id: "es-nie", title: "NIE / zöld regisztrációs igazolás", description: "EX-15 vagy EX-18 űrlap + 790-es illeték befizetése. Fényképezd le, a pótlása újabb cita previa.", icon: "document" },
    { id: "es-padron", title: "Empadronamiento az ayuntamientónál", description: "Enélkül nincs egészségügyi kártya és iskolai hely. Kérj volante de empadronamientót is.", icon: "home" },
    { id: "es-ss", title: "Seguridad Social szám (NUSS)", description: "Munkába álláshoz kötelező. Utána igényeld a tarjeta sanitariát a centro de saludban.", icon: "heart" },
    { id: "es-bank", title: "Spanyol bankszámla", description: "Kérdezd meg a havi számlavezetési díjat — sok banknál van, ha nincs ott a fizetésed.", icon: "bank" },
    { id: "es-digital", title: "Certificado digital vagy Cl@ve", description: "Ezzel online intézhetsz mindent, sorban állás nélkül.", icon: "key" },
  ],
};

/** Van-e kezdőcsomagunk ehhez az országhoz? */
export function hasKezdocsomag(country: string): boolean {
  return (KEZDOCSOMAG[country]?.length ?? 0) > 0;
}

/** Az ország lépései. ÜRES tömb, ha nincs — a hívó ezt KI IS ÍRJA, nem esik vissza CH-ra. */
export function kezdoLepesek(country: string): KezdoLepes[] {
  return KEZDOCSOMAG[country] ?? [];
}
