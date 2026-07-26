"use client";

import { useEffect, useState } from "react";
import { useCheckout } from "@/hooks/useCheckout";
import { usePaddlePrices } from "@/hooks/usePaddlePrices";
import type { CountryCode } from "@/lib/payments-config";
import { Icon, KintiLogo, DropdownMenu } from "@/components/ui";
import { LegalLangSwitch } from "@/components/ui/legal-lang-switch";
import { useLegalLang, type LegalLang } from "@/hooks/use-legal-lang";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY, isValidCountry } from "@/lib/countries";

type OwnerStatus = { kintiPro?: boolean; businessPro?: boolean; lockedLeads?: number };

// A /pro marketing-szövege DE/EN-re is fordul (footer-linkelt oldal — a landing
// németre/angolra váltott látogatói ide is eljutnak). A tényleges vásárlás/
// bejelentkezés/előfizetés-kezelés LOGIKÁJA nyelv-független (Clerk, Paddle),
// csak a megjelenő szöveg vált — lásd src/hooks/use-legal-lang.ts.
const COUNTRY_IN: Record<LegalLang, Record<string, string>> = {
  hu: { CH: "Svájcban", AT: "Ausztriában", DE: "Németországban", NL: "Hollandiában", GB: "Angliában" },
  de: { CH: "in der Schweiz", AT: "in Österreich", DE: "in Deutschland", NL: "in den Niederlanden", GB: "in England" },
  en: { CH: "in Switzerland", AT: "in Austria", DE: "in Germany", NL: "in the Netherlands", GB: "in England" },
};

const PRO_FEATURES: Record<LegalLang, string[]> = {
  hu: [
    "Állás-találat (%-egyezés) — melyik állás illik a profilodhoz + becsült nettó bér a régiódban",
    "AI CV-audit — önéletrajz-elemzés, konkrét javítási tippekkel",
    "Utalás-asszisztens — megmondja, MIKOR éri meg hazautalni (árfolyam-időzítés), és követi a megtakarításod (a díj-összevetés ingyen is elérhető)",
    "Határidő-asszisztens — push-emlékeztető 14/7/1 nappal a fontos határidők előtt",
    "Állampolgársági teszt-szimulátor — mind a 6 országra",
    "Albérlet-börze kapcsolatfelvétel — a hirdetők elérhetőségének megnyitása",
    "Szakmai gyors-szótár — iparági szakszavak leckékben, kiejtéssel (mind a 6 ország)",
  ],
  de: [
    "Job-Treffer (%-Übereinstimmung) — welche Stelle zu deinem Profil passt + geschätztes Nettogehalt in deiner Region",
    "KI-CV-Audit — Lebenslauf-Analyse mit konkreten Verbesserungstipps",
    "Überweisungs-Assistent — sagt dir, WANN sich eine Überweisung nach Hause lohnt (Wechselkurs-Timing), und verfolgt deine Ersparnis (der Gebührenvergleich ist auch gratis verfügbar)",
    "Fristen-Assistent — Push-Erinnerung 14/7/1 Tage vor wichtigen Fristen",
    "Einbürgerungstest-Simulator — für alle 6 Länder",
    "Kontaktaufnahme in der Zimmer-/Wohnungsbörse — Kontaktdaten der Inserenten einsehen",
    "Fach-Schnellwörterbuch — Fachbegriffe in Lektionen, mit Aussprache (alle 6 Länder)",
  ],
  en: [
    "Job match (% match) — which job fits your profile + estimated net salary in your region",
    "AI CV audit — CV analysis with concrete improvement tips",
    "Money-transfer assistant — tells you WHEN it's worth transferring money home (exchange-rate timing), and tracks your savings (the fee comparison is also free)",
    "Deadline assistant — push reminders 14/7/1 days before important deadlines",
    "Citizenship test simulator — for all 6 countries",
    "Room/flat marketplace contact — unlock listers' contact details",
    "Professional quick dictionary — industry terms in lessons, with pronunciation (all 6 countries)",
  ],
};

const BIZ_FEATURES: Record<LegalLang, string[]> = {
  hu: [
    "🤝 B2B Hub — zárt projektpiac: alvállalkozói munkát írhatsz ki, és jelentkezhetsz más magyar PRO cégek projektjeire (jutalék nélkül)",
    "Sárga PRO kiemelés a találati listákban",
    "A lista elején jelensz meg a kategóriádban (a kiemelt cégek között)",
    "Egyedi profil borítókép és arculat-szín",
    "Analytics-műszerfal: profil-megtekintések, hívások és ajánlatkérők (7/30 napos bontásban, konverzióval)",
    "Időpontfoglalás widget (Calendly-beágyazás)",
    "Ajánlatkérő postafiók — a beérkező érdeklődők egy helyen (lead-kezelő)",
    "Bővített referenciagaléria (több fotó a munkáidról)",
    "🎟️ Kinti Pass elfogadóhely: kedvezményt kínálhatsz a felhasználóknak — arany jelvény a profilodon + külön „Csak Kinti Pass helyek” szűrő a keresőben",
    "Nem jelenik meg „hasonló vállalkozások” ajánló a profilodon (nem küldünk konkurenshez)",
  ],
  de: [
    "🤝 B2B Hub — geschlossener Projektmarkt: Du kannst Subunternehmer-Aufträge ausschreiben und dich für Projekte anderer ungarischer PRO-Unternehmen bewerben (ohne Provision)",
    "Gelbe PRO-Hervorhebung in den Trefferlisten",
    "Du erscheinst an erster Stelle in deiner Kategorie (unter den hervorgehobenen Unternehmen)",
    "Individuelles Profil-Titelbild und Markenfarbe",
    "Analytics-Dashboard: Profilaufrufe, Anrufe und Anfragen (in 7/30-Tage-Aufschlüsselung, mit Konversion)",
    "Terminbuchungs-Widget (Calendly-Einbettung)",
    "Anfrage-Postfach — eingehende Interessenten an einem Ort (Lead-Verwaltung)",
    "Erweiterte Referenzgalerie (mehr Fotos deiner Arbeiten)",
    "🎟️ Kinti-Pass-Akzeptanzstelle: Du kannst Nutzern einen Rabatt anbieten — goldenes Abzeichen auf deinem Profil + eigener Filter „Nur Kinti-Pass-Orte“ in der Suche",
    "Keine „ähnliche Unternehmen“-Empfehlung auf deinem Profil (wir schicken niemanden zur Konkurrenz)",
  ],
  en: [
    "🤝 B2B Hub — closed project marketplace: post subcontractor work and apply to other Hungarian PRO businesses' projects (no commission)",
    "Yellow PRO highlight in results lists",
    "You appear first in your category (among featured businesses)",
    "Custom profile cover image and brand colour",
    "Analytics dashboard: profile views, calls, and inquiries (broken down by 7/30 days, with conversion)",
    "Booking widget (Calendly embed)",
    "Inquiry inbox — incoming leads in one place (lead manager)",
    "Extended reference gallery (more photos of your work)",
    "🎟️ Kinti Pass accepting location: offer users a discount — gold badge on your profile + a dedicated “Kinti Pass places only” filter in search",
    "No “similar businesses” recommendation shown on your profile (we never send visitors to a competitor)",
  ],
};

const JOB_FEATURES: Record<LegalLang, string[]> = {
  hu: [
    "30 napos piros kiemelés a Job Boardon",
    "A kiemelt hirdetések a lista elején, jelölten jelennek meg",
    "Egyedi céges arculat megjelenítése a hirdetésen",
    "Push-riasztás a régiód magyar jelöltjeinek (Kinti Radar — kanton + szakma szerint)",
    "Jelentkezők egy helyen — beépített kezelő-felület, semmi nem vész el",
    "E-mail minden új jelentkezésről + jelentkezés-számláló hirdetésenként",
  ],
  de: [
    "30 Tage rote Hervorhebung im Job Board",
    "Hervorgehobene Anzeigen erscheinen gekennzeichnet an erster Stelle der Liste",
    "Individuelle Firmen-Optik auf der Anzeige",
    "Push-Benachrichtigung an ungarische Kandidaten deiner Region (Kinti Radar — nach Kanton + Beruf)",
    "Bewerber an einem Ort — integrierte Verwaltungsoberfläche, nichts geht verloren",
    "E-Mail bei jeder neuen Bewerbung + Bewerbungszähler pro Anzeige",
  ],
  en: [
    "30-day red highlight on the Job Board",
    "Featured listings appear marked at the top of the list",
    "Custom company branding on the listing",
    "Push alert to Hungarian candidates in your region (Kinti Radar — by canton + profession)",
    "Applicants in one place — built-in management interface, nothing gets lost",
    "Email on every new application + application counter per listing",
  ],
};

const T: Record<LegalLang, {
  h1a: string; h1b: string; intro: (loc: string) => string;
  lockedTitle: (n: number) => string; lockedBody: string;
  whichTitle: string; whichIntro: string;
  planUser: string; planUserDesc: string; planBiz: string; planBizDesc: string; planJob: string; planJobDesc: string;
  userBadge: string; userTitle: string; userDesc: string; perMonth: string;
  netPriceLive: string; netPriceStatic: string; webPay: string; androidPay: string;
  activeSub: string; switchBtn: string;
  bizBadge: string; bizTitle: string; bizDesc: string; recommended: string;
  proLabelNote: string; aszfLink: string;
  bizActive: string; bizActiveNote: string; buyHighlight: string; buyHighlightNote: string;
  jobBadge: string; jobTitle: string; jobDesc: string; perListing: string; netPriceLiveJob: string; netPriceStaticJob: string;
  postJob: string; postJobNote: string;
  manageSub: string; manageSubOpening: string; managePlay: string;
  paddleTrust: string; cancelInfo1: string; cancelInfo2: string; androidTrust: string; androidCancelInfo: string;
  withdrawalPre: string; withdrawalPost: string; aiNotePre: string; aiTransparencyLabel: string;
  navAszf: string; navPriv: string; navRefund: string; navImprint: string;
  active: string;
}> = {
  hu: {
    h1a: "Lépj szintet a ", h1b: "-val",
    intro: (loc) => `${loc} élő magyaroknak, szakembereknek és munkáltatóknak fejlesztett exkluzív csomagok, melyekkel maximalizálhatod a platform lehetőségeit.`,
    lockedTitle: (n) => `🔒 ${n} zárolt ajánlatkérés vár a cégednél`,
    lockedBody: "Valódi ügyfelek kerestek meg a Szaknévsorban, de az elérhetőségük a havi ingyenes kereten felül zárolva van. A Szaknévsor PRO aktiválása visszamenőleg mindet feloldja — lentebb találod a csomagot.",
    whichTitle: "Melyik csomag kell nekem?",
    whichIntro: "Három külön dolog, három célra — nem kell mind. A színek végigkísérnek lent is:",
    planUser: "Kinti PRO", planUserDesc: "ha te magad élsz kint (álláskeresés %-match, AI-eszközök, kalkulátorok).",
    planBiz: "Szaknévsor PRO", planBizDesc: "ha vállalkozásod van, és ügyfeleket szereznél.",
    planJob: "Kiemelt Állás", planJobDesc: "ha munkáltatóként állást hirdetsz.",
    userBadge: "🧑 Neked · magánszemély", userTitle: "Kinti PRO",
    userDesc: "Magánszemélyeknek. AI-asszisztens, prémium modulok és kalkulátorok — egy havidíjért, mind a 6 országra 🇨🇭 🇦🇹 🇩🇪 🇳🇱 🏴󠁧󠁢󠁥󠁮󠁧󠁿 🇪🇸 🏴󠁧󠁢󠁥󠁮󠁧󠁿 🇪🇸.",
    perMonth: " / hó",
    netPriceLive: "Nettó ár — az ÁFÁ-t a pénztár az országod szabályai szerint adja hozzá. Havonta automatikusan megújul, bármikor lemondható.",
    netPriceStatic: "Tájékoztató nettó ár (ÁFA nélkül) — a pontos, áfával együttes végső összeget a pénztár mutatja. Havonta automatikusan megújul, bármikor lemondható.",
    webPay: "A fizetést a Paddle (Merchant of Record) bonyolítja — az Android-alkalmazásból vásárolva a Google Play fizetési rendszere érvényes.",
    androidPay: "A fizetést a Google Play fizetési rendszere bonyolítja.",
    activeSub: "✓ Aktív — előfizetve", switchBtn: "Válts Kinti PRO-ba",
    bizBadge: "🏪 A vállalkozásodnak", bizTitle: "Szaknévsor PRO",
    bizDesc: "Vállalkozóknak és szakembereknek. Szerezz több ügyfelet prémium láthatósággal — a Szaknévsor mind a 6 országban él 🇨🇭 🇦🇹 🇩🇪 🇳🇱 🏴󠁧󠁢󠁥󠁮󠁧󠁿 🇪🇸 🏴󠁧󠁢󠁥󠁮󠁧󠁿 🇪🇸.",
    recommended: "Ajánlott",
    proLabelNote: "A kiemelt találatok a listában „PRO” jelöléssel, a nem fizetett találatok előtt jelennek meg — a rangsorolás elveiről az ÁSZF 10/A ad tájékoztatást.",
    aszfLink: "ÁSZF 10/A",
    bizActive: "✓ Aktív — a céged PRO", bizActiveNote: "A vállalkozásod a Szaknévsorban kiemelten jelenik meg. Kezelés: „…” menü → Vállalkozásom.",
    buyHighlight: "Kiemelés Vásárlása", buyHighlightNote: "A vállalkozásod kezelőjében véglegesíted. Ha még nincs Szaknévsor-listázásod, ott 1 perc alatt létrehozod — utána fizethetsz elő.",
    jobBadge: "💼 Munkáltatóként", jobTitle: "Kiemelt Állás",
    jobDesc: "Munkáltatóknak. Találj gyorsabban megbízható magyar munkaerőt — hirdetés a 6 ország magyar közösségének 🇨🇭 🇦🇹 🇩🇪 🇳🇱 🏴󠁧󠁢󠁥󠁮󠁧󠁿 🇪🇸.",
    perListing: " / hirdetés",
    netPriceLiveJob: "Nettó ár — az ÁFÁ-t a pénztár az országod szabályai szerint adja hozzá. Egyszeri díj: a kiemelés 30 napig él, NEM újul meg automatikusan.",
    netPriceStaticJob: "Tájékoztató nettó ár (ÁFA nélkül) — a pontos, áfával együttes végső összeget a pénztár mutatja. Egyszeri díj: a kiemelés 30 napig él, NEM újul meg automatikusan.",
    postJob: "Hirdetés Kiemelése", postJobNote: "A hirdetésednél, a munkáltató kezelőben véglegesíted.",
    manageSub: "Előfizetésem kezelése — lemondás, számlák", manageSubOpening: "Megnyitás…",
    managePlay: "Előfizetésem kezelése a Google Play-ben",
    paddleTrust: "A fizetéseket a biztonságos Paddle (Merchant of Record) dolgozza fel — a számlát is ő állítja ki.",
    cancelInfo1: "Lemondás: aktív előfizetésnél a fenti „Előfizetésem kezelése” gombbal, a Paddle vásárlás-visszaigazoló emailjében kapott linken, vagy az info@kinti.app címen — a már kifizetett időszak végéig a PRO aktív marad.",
    cancelInfo2: "Ha a Kinti Android-alkalmazásból vásárolsz (Google Play-ből letöltve), a fizetést a Google Play fizetési rendszere kezeli — a lemondás ott a Play Áruház → Előfizetések menüben történik.",
    androidTrust: "A fizetéseket a Google Play fizetési rendszere dolgozza fel — a számlát is a Google állítja ki.",
    androidCancelInfo: "Lemondás: az előfizetés bármikor lemondható a fenti gombbal vagy a Google Play Áruház → Előfizetések menüjében — a már kifizetett időszak végéig a PRO aktív marad.",
    withdrawalPre: "A vásárlással kéred a PRO azonnali aktiválását, és tudomásul veszed, hogy a teljesítéssel elveszíted a 14 napos elállási jogod (EU/EGT fogyasztók — lásd ",
    withdrawalPost: ").",
    aiNotePre: "Az AI-alapú funkciók (CV-audit) működéséről és korlátairól: ",
    aiTransparencyLabel: "AI-átláthatóság",
    navAszf: "ÁSZF", navPriv: "Adatvédelem", navRefund: "Visszatérítés", navImprint: "Impresszum",
    active: "Aktív",
  },
  de: {
    h1a: "Leg mit ", h1b: " einen Gang zu",
    intro: (loc) => `Exklusive Pakete für Ungarn, Fachkräfte und Arbeitgeber ${loc} — damit holst du das Maximum aus der Plattform heraus.`,
    lockedTitle: (n) => `🔒 ${n} gesperrte Anfrage${n === 1 ? "" : "n"} warten bei deinem Unternehmen`,
    lockedBody: "Echte Kunden haben dich im Branchenbuch kontaktiert, aber ihre Kontaktdaten sind über das kostenlose Monatskontingent hinaus gesperrt. Die Aktivierung von Branchenbuch PRO schaltet rückwirkend alle frei — das Paket findest du weiter unten.",
    whichTitle: "Welches Paket brauche ich?",
    whichIntro: "Drei getrennte Dinge für drei Zwecke — du brauchst nicht alle. Die Farben begleiten dich auch weiter unten:",
    planUser: "Kinti PRO", planUserDesc: "wenn du selbst im Ausland lebst (Job-%-Match, KI-Tools, Rechner).",
    planBiz: "Branchenbuch PRO", planBizDesc: "wenn du ein Unternehmen hast und Kunden gewinnen möchtest.",
    planJob: "Hervorgehobene Stelle", planJobDesc: "wenn du als Arbeitgeber eine Stelle ausschreibst.",
    userBadge: "🧑 Für dich · Privatperson", userTitle: "Kinti PRO",
    userDesc: "Für Privatpersonen. KI-Assistent, Premium-Module und Rechner — für eine monatliche Gebühr, für alle 6 Länder 🇨🇭 🇦🇹 🇩🇪 🇳🇱 🏴󠁧󠁢󠁥󠁮󠁧󠁿 🇪🇸.",
    perMonth: " / Monat",
    netPriceLive: "Nettopreis — die MwSt. wird an der Kasse gemäß den Regeln deines Landes hinzugefügt. Verlängert sich monatlich automatisch, jederzeit kündbar.",
    netPriceStatic: "Informativer Nettopreis (ohne MwSt.) — den genauen Endbetrag inklusive MwSt. zeigt die Kasse. Verlängert sich monatlich automatisch, jederzeit kündbar.",
    webPay: "Die Zahlung wickelt Paddle (Merchant of Record) ab — kaufst du aus der Android-App, gilt dort das Zahlungssystem von Google Play.",
    androidPay: "Die Zahlung wickelt das Zahlungssystem von Google Play ab.",
    activeSub: "✓ Aktiv — abonniert", switchBtn: "Zu Kinti PRO wechseln",
    bizBadge: "🏪 Für dein Unternehmen", bizTitle: "Branchenbuch PRO",
    bizDesc: "Für Unternehmer und Fachkräfte. Gewinne mehr Kunden mit Premium-Sichtbarkeit — das Branchenbuch ist in allen 6 Ländern aktiv 🇨🇭 🇦🇹 🇩🇪 🇳🇱 🏴󠁧󠁢󠁥󠁮󠁧󠁿 🇪🇸.",
    recommended: "Empfohlen",
    proLabelNote: "Hervorgehobene Treffer erscheinen in der Liste mit „PRO“-Kennzeichnung vor den nicht bezahlten Treffern — über die Rangordnungsprinzipien informieren die AGB, Punkt 10/A.",
    aszfLink: "AGB Punkt 10/A",
    bizActive: "✓ Aktiv — dein Unternehmen ist PRO", bizActiveNote: "Dein Unternehmen erscheint hervorgehoben im Branchenbuch. Verwaltung: „…“-Menü → Mein Unternehmen.",
    buyHighlight: "Hervorhebung kaufen", buyHighlightNote: "Du schließt es in der Verwaltung deines Unternehmens ab. Falls du noch keinen Branchenbuch-Eintrag hast, erstellst du ihn dort in 1 Minute — danach kannst du abonnieren.",
    jobBadge: "💼 Als Arbeitgeber", jobTitle: "Hervorgehobene Stelle",
    jobDesc: "Für Arbeitgeber. Finde schneller verlässliche ungarische Arbeitskräfte — Anzeige für die ungarische Community in 6 Ländern 🇨🇭 🇦🇹 🇩🇪 🇳🇱 🏴󠁧󠁢󠁥󠁮󠁧󠁿 🇪🇸 🏴󠁧󠁢󠁥󠁮󠁧󠁿 🇪🇸.",
    perListing: " / Anzeige",
    netPriceLiveJob: "Nettopreis — die MwSt. wird an der Kasse gemäß den Regeln deines Landes hinzugefügt. Einmalige Gebühr: die Hervorhebung gilt 30 Tage und verlängert sich NICHT automatisch.",
    netPriceStaticJob: "Informativer Nettopreis (ohne MwSt.) — den genauen Endbetrag inklusive MwSt. zeigt die Kasse. Einmalige Gebühr: die Hervorhebung gilt 30 Tage und verlängert sich NICHT automatisch.",
    postJob: "Stelle hervorheben", postJobNote: "Du schließt es bei deiner Anzeige in der Arbeitgeber-Verwaltung ab.",
    manageSub: "Mein Abo verwalten — kündigen, Rechnungen", manageSubOpening: "Wird geöffnet…",
    managePlay: "Mein Abo in Google Play verwalten",
    paddleTrust: "Zahlungen werden vom sicheren Zahlungsabwickler Paddle (Merchant of Record) verarbeitet — auch die Rechnung stellt Paddle aus.",
    cancelInfo1: "Kündigung: bei aktivem Abo über die obige Schaltfläche „Mein Abo verwalten“, über den Link in der Paddle-Kaufbestätigungs-E-Mail oder unter info@kinti.app — bis zum Ende des bereits bezahlten Zeitraums bleibt PRO aktiv.",
    cancelInfo2: "Kaufst du in der Kinti-Android-App (aus Google Play heruntergeladen), wird die Zahlung vom Zahlungssystem von Google Play verwaltet — die Kündigung erfolgt dort im Play Store → Abos.",
    androidTrust: "Zahlungen werden vom Zahlungssystem von Google Play verarbeitet — auch die Rechnung stellt Google aus.",
    androidCancelInfo: "Kündigung: das Abo ist jederzeit über die obige Schaltfläche oder im Google Play Store → Abos kündbar — bis zum Ende des bereits bezahlten Zeitraums bleibt PRO aktiv.",
    withdrawalPre: "Mit dem Kauf verlangst du die sofortige Aktivierung von PRO und nimmst zur Kenntnis, dass du mit der Erbringung der Leistung dein 14-tägiges Widerrufsrecht verlierst (EU-/EWR-Verbraucher — siehe ",
    withdrawalPost: ").",
    aiNotePre: "Zu Funktionsweise und Grenzen der KI-Funktionen (CV-Audit): ",
    aiTransparencyLabel: "KI-Transparenz",
    navAszf: "AGB", navPriv: "Datenschutz", navRefund: "Rückerstattung", navImprint: "Impressum",
    active: "Aktiv",
  },
  en: {
    h1a: "Level up with ", h1b: "",
    intro: (loc) => `Exclusive packages built for Hungarians, professionals, and employers living ${loc} — to help you make the most of the platform.`,
    lockedTitle: (n) => `🔒 ${n} locked inquir${n === 1 ? "y" : "ies"} waiting at your business`,
    lockedBody: "Real customers have reached out to you in the Directory, but their contact details are locked beyond the free monthly quota. Activating Directory PRO unlocks all of them retroactively — you'll find the plan further below.",
    whichTitle: "Which plan do I need?",
    whichIntro: "Three separate things for three purposes — you don't need them all. The colours carry through below too:",
    planUser: "Kinti PRO", planUserDesc: "if you yourself live abroad (job % match, AI tools, calculators).",
    planBiz: "Directory PRO", planBizDesc: "if you have a business and want to win customers.",
    planJob: "Featured Job", planJobDesc: "if you're an employer posting a job listing.",
    userBadge: "🧑 For you · individual", userTitle: "Kinti PRO",
    userDesc: "For individuals. AI assistant, premium modules, and calculators — for one monthly fee, across all 6 countries 🇨🇭 🇦🇹 🇩🇪 🇳🇱 🏴󠁧󠁢󠁥󠁮󠁧󠁿 🇪🇸 🏴󠁧󠁢󠁥󠁮󠁧󠁿 🇪🇸.",
    perMonth: " / month",
    netPriceLive: "Net price — VAT is added at checkout per your country's rules. Renews automatically each month, cancel anytime.",
    netPriceStatic: "Informational net price (excl. VAT) — the exact final amount incl. VAT is shown at checkout. Renews automatically each month, cancel anytime.",
    webPay: "Payment is handled by Paddle (Merchant of Record) — if you buy from the Android app, Google Play's payment system applies there.",
    androidPay: "Payment is handled by Google Play's payment system.",
    activeSub: "✓ Active — subscribed", switchBtn: "Switch to Kinti PRO",
    bizBadge: "🏪 For your business", bizTitle: "Directory PRO",
    bizDesc: "For businesses and professionals. Win more customers with premium visibility — the Directory is live in all 6 countries 🇨🇭 🇦🇹 🇩🇪 🇳🇱 🏴󠁧󠁢󠁥󠁮󠁧󠁿 🇪🇸 🏴󠁧󠁢󠁥󠁮󠁧󠁿 🇪🇸.",
    recommended: "Recommended",
    proLabelNote: "Featured results appear in the list marked “PRO”, ahead of unpaid results — Terms of Use, section 10/A, explains the ranking principles.",
    aszfLink: "Terms of Use 10/A",
    bizActive: "✓ Active — your business is PRO", bizActiveNote: "Your business appears featured in the Directory. Manage it via the “…” menu → My business.",
    buyHighlight: "Buy highlight", buyHighlightNote: "You finalize it in your business dashboard. If you don't have a Directory listing yet, you'll create one there in 1 minute — then you can subscribe.",
    jobBadge: "💼 As an employer", jobTitle: "Featured Job",
    jobDesc: "For employers. Find reliable Hungarian workers faster — your listing reaches the Hungarian community in 6 countries 🇨🇭 🇦🇹 🇩🇪 🇳🇱 🏴󠁧󠁢󠁥󠁮󠁧󠁿 🇪🇸 🏴󠁧󠁢󠁥󠁮󠁧󠁿 🇪🇸.",
    perListing: " / listing",
    netPriceLiveJob: "Net price — VAT is added at checkout per your country's rules. One-time fee: the highlight is valid for 30 days and does NOT renew automatically.",
    netPriceStaticJob: "Informational net price (excl. VAT) — the exact final amount incl. VAT is shown at checkout. One-time fee: the highlight is valid for 30 days and does NOT renew automatically.",
    postJob: "Feature listing", postJobNote: "You finalize it on your listing in the employer dashboard.",
    manageSub: "Manage my subscription — cancel, invoices", manageSubOpening: "Opening…",
    managePlay: "Manage my subscription in Google Play",
    paddleTrust: "Payments are processed by the secure Paddle (Merchant of Record) — they also issue the invoice.",
    cancelInfo1: "Cancellation: for an active subscription, via the “Manage my subscription” button above, via the link in Paddle's purchase confirmation email, or at info@kinti.app — PRO remains active until the end of the period already paid for.",
    cancelInfo2: "If you buy from the Kinti Android app (downloaded from Google Play), payment is handled by Google Play's payment system — cancellation happens there, in Play Store → Subscriptions.",
    androidTrust: "Payments are processed by Google Play's payment system — Google also issues the invoice.",
    androidCancelInfo: "Cancellation: the subscription can be cancelled anytime via the button above or in Google Play Store → Subscriptions — PRO remains active until the end of the period already paid for.",
    withdrawalPre: "By purchasing, you request immediate activation of PRO and acknowledge that once the service has been performed, you lose your 14-day right of withdrawal (EU/EEA consumers — see ",
    withdrawalPost: ").",
    aiNotePre: "On how the AI-based features (CV audit) work and their limits: ",
    aiTransparencyLabel: "AI transparency",
    navAszf: "Terms of Use", navPriv: "Privacy", navRefund: "Refunds", navImprint: "Imprint",
    active: "Active",
  },
};

export default function ProPage() {
  const { startCheckout, isLoading } = useCheckout();
  const { user } = useUser();
  const [prefCountry] = usePreferredCountry();
  const country = prefCountry ?? DEFAULT_COUNTRY;
  const [lang, setLang] = useLegalLang();
  const t = T[lang];
  // ÉLŐ, lokalizált NETTÓ árak a Paddle-től (az ÁFÁ-t a pénztár adja hozzá) —
  // a feltüntetett ár a pénztárral egyezik (a fix EUR-ár CH-ban félrevezető volt).
  // Hiba esetén statikus tájékoztató ár + „a végső árat a pénztár mutatja" jelzés.
  const paddleCountry: CountryCode = isValidCountry(country) ? (country as CountryCode) : "CH";
  const livePrices = usePaddlePrices(paddleCountry);
  // Melyik csomag AKTÍV már nálad? (átláthatóság — a kártyák „Aktív” jelzést kapnak)
  const [status, setStatus] = useState<OwnerStatus | null>(null);
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    fetch("/api/owner/status")
      .then((r) => (r.ok ? (r.json() as Promise<OwnerStatus>) : null))
      .then((d) => { if (!cancelled && d) setStatus(d); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user?.id]);
  const kintiProActive = !!status?.kintiPro;
  const businessProActive = !!status?.businessPro;

  // Előfizetés-kezelő (lemondás/számlák) — Paddle customer portal. A gomb csak
  // aktív Kinti PRO-nál látszik; a portál-URL rövid életű, kattintáskor kérjük.
  const [portalBusy, setPortalBusy] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);
  const openPortal = async () => {
    setPortalBusy(true);
    setPortalError(null);
    try {
      const res = await fetch("/api/payments/portal");
      const data = (await res.json()) as { provider?: string; url?: string; error?: string };
      if (data.provider === "play") {
        window.location.href = "https://play.google.com/store/account/subscriptions";
        return;
      }
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setPortalError(data.error || "Az előfizetés-kezelő megnyitása nem sikerült.");
    } catch {
      setPortalError("Az előfizetés-kezelő megnyitása nem sikerült. Próbáld újra később.");
    } finally {
      setPortalBusy(false);
    }
  };

  const handleCheckout = (product: "kinti_pro_monthly" | "business_pro_monthly" | "job_featured") => {
    // PRO előfizetés a Clerk userId-hez kötődik — bejelentkezés nélkül nincs
    // értelme (a webhook nem tudná kihez kötni). Ezért előbb beléptetünk.
    if (!user?.id) {
      window.location.href = "/belepes?redirect_url=/pro";
      return;
    }

    let customType = "";
    if (product === "kinti_pro_monthly") customType = "user_pro";
    else if (product === "business_pro_monthly") customType = "business_pro";
    else if (product === "job_featured") customType = "job_featured";

    startCheckout({
      product,
      customerEmail: user?.emailAddresses?.[0]?.emailAddress,
      customData: {
        type: customType,
        userId: user.id,
      }
    });
  };

  return (
    <div className="relative mx-auto max-w-md px-5 pb-24 pt-[calc(env(safe-area-inset-top)+2rem)]">
      {/* "..." menü a jobb felső sarokban + nyelv-kapcsoló */}
      <div className="absolute right-5 top-[calc(env(safe-area-inset-top)+2rem)] z-10 flex items-center gap-2">
        <LegalLangSwitch lang={lang} onChange={setLang} />
        <DropdownMenu />
      </div>

      {/* Header */}
      <header className="mb-10 text-center flex flex-col items-center">
        <Link href="/" className="mb-6 inline-block active:scale-95 transition-transform">
          <KintiLogo size={42} />
        </Link>
        <h1 className="text-[28px] font-black text-ink tracking-tight mb-4">
          {t.h1a}<span className="text-primary">Kinti PRO</span>{t.h1b}
        </h1>
        <p className="text-[15px] text-ink-muted text-balance">
          {t.intro(COUNTRY_IN[lang][country] ?? COUNTRY_IN[lang].CH)}
        </p>
      </header>

      {/* Személyre szabott sürgetés: ha a SAJÁT cégednél zárolt ajánlatkérések
          várnak, azt itt fekete-fehéren látod — ez a legerősebb, mert VALÓS,
          már megtörtént kereslet (nem általános marketing-ígéret). */}
      {(status?.lockedLeads ?? 0) > 0 && !businessProActive && (
        <div className="mb-8 rounded-3xl border-2 border-pro/40 bg-pro/10 p-5">
          <p className="text-[15px] font-black leading-snug text-ink">
            {t.lockedTitle(status!.lockedLeads!)}
          </p>
          <p className="mt-1.5 text-[12.5px] leading-snug text-ink-muted">
            {t.lockedBody}
          </p>
        </div>
      )}

      {/* Orientáció: HÁROM külön csomag, HÁROM célra — szín-kód, hogy egyértelmű
          legyen, melyik kinek szól és hogy nem kell mind. */}
      <div className="mb-8 rounded-3xl border-2 border-line bg-surface p-5">
        <p className="mb-3 text-[13.5px] font-black text-ink">{t.whichTitle}</p>
        <p className="mb-3 text-[12px] text-ink-muted leading-snug">{t.whichIntro}</p>
        <div className="space-y-2.5 text-[12.5px] leading-snug">
          <div className="flex items-start gap-2.5">
            <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-primary" />
            <span className="text-ink"><strong className="text-primary">{t.planUser}</strong> — {t.planUserDesc}</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-pro" />
            <span className="text-ink"><strong className="text-pro">{t.planBiz}</strong> — {t.planBizDesc}</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-accent" />
            <span className="text-ink"><strong className="text-accent">{t.planJob}</strong> — {t.planJobDesc}</span>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 gap-8">

        {/* Kinti PRO (Users) */}
        <div className="flex flex-col rounded-[32px] border-2 border-line bg-surface p-6 shadow-card hover:border-primary/30 transition-colors relative">
          <div className="mb-3 inline-flex items-center justify-center rounded-full bg-primary/10 w-14 h-14 text-primary text-2xl">
            🎓
          </div>
          <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-pill bg-primary/10 px-2.5 py-1 text-[10.5px] font-black uppercase tracking-wide text-primary">
            {t.userBadge}
          </span>
          <div className="flex items-center gap-2">
            <h2 className="text-[22px] font-black text-ink">{t.userTitle}</h2>
            {kintiProActive && <ActiveBadge label={t.active} />}
          </div>
          <p className="text-[13px] text-ink-muted mt-2 mb-6 flex-1">{t.userDesc}</p>

          <div className="mb-6">
            <span className="text-3xl font-black text-ink">{livePrices?.total.kinti_pro_monthly ?? "19 €"}</span>
            <span className="text-[14px] font-bold text-ink-muted">{t.perMonth}</span>
            <p className="mt-1 text-[11px] text-ink-faint">
              {livePrices?.total.kinti_pro_monthly ? t.netPriceLive : t.netPriceStatic}{" "}
              <span className="web-only-payment">{t.webPay}</span>
              <span className="android-only-payment">{t.androidPay}</span>
            </p>
          </div>

          <ul className="space-y-3 mb-8 flex-1">
            {PRO_FEATURES[lang].map((txt) => (
              <FeatureItem key={txt} text={txt} />
            ))}
          </ul>

          {kintiProActive ? (
            <div className="w-full rounded-pill bg-primary/10 py-3.5 text-center text-[15px] font-black text-primary">
              {t.activeSub}
            </div>
          ) : (
            <button
              onClick={() => handleCheckout("kinti_pro_monthly")}
              disabled={isLoading}
              className={cn(
                "w-full rounded-pill bg-primary py-3.5 text-[15px] font-black text-white shadow-card transition active:scale-[0.98]",
                isLoading && "opacity-60 cursor-not-allowed"
              )}
            >
              {t.switchBtn}
            </button>
          )}
        </div>

        {/* Szaknévsor PRO (Businesses) */}
        <div className="flex flex-col rounded-[32px] border-2 border-pro bg-surface p-6 shadow-pop relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pro/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
          <div className="absolute top-4 right-4 bg-pro text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-pill shadow-sm">
            {t.recommended}
          </div>

          <div className="mb-3 inline-flex items-center justify-center rounded-full bg-pro/10 w-14 h-14 text-pro text-2xl">
            🚀
          </div>
          <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-pill bg-pro/10 px-2.5 py-1 text-[10.5px] font-black uppercase tracking-wide text-pro">
            {t.bizBadge}
          </span>
          <div className="flex items-center gap-2">
            <h2 className="text-[22px] font-black text-pro">{t.bizTitle}</h2>
            {businessProActive && <ActiveBadge label={t.active} />}
          </div>
          <p className="text-[13px] text-ink-muted mt-2 mb-6 flex-1">{t.bizDesc}</p>

          <div className="mb-6">
            <span className="text-3xl font-black text-ink">{livePrices?.total.business_pro_monthly ?? "19 €"}</span>
            <span className="text-[14px] font-bold text-ink-muted">{t.perMonth}</span>
            <p className="mt-1 text-[11px] text-ink-faint">
              {livePrices?.total.business_pro_monthly ? t.netPriceLive : t.netPriceStatic}{" "}
              <span className="web-only-payment">{t.webPay}</span>
              <span className="android-only-payment">{t.androidPay}</span>
            </p>
          </div>

          <ul className="space-y-3 mb-8 flex-1">
            {BIZ_FEATURES[lang].map((txt) => (
              <FeatureItem key={txt} text={txt} />
            ))}
          </ul>
          {/* P2B rangsor-átláthatóság: a fizetett kiemelés előre sorol és JELÖLT. */}
          <p className="mb-4 text-[11px] leading-snug text-ink-faint">
            {t.proLabelNote}
          </p>

          {businessProActive ? (
            <>
              <div className="block w-full rounded-pill bg-pro/10 py-3.5 text-center text-[15px] font-black text-pro">
                {t.bizActive}
              </div>
              <p className="mt-2 text-center text-[11px] text-ink-faint">
                {t.bizActiveNote}
              </p>
            </>
          ) : (
            <>
              <Link
                href="/profil?pro=1"
                className="block w-full rounded-pill bg-pro py-3.5 text-center text-[15px] font-black text-white shadow-[0_4px_0_0_#cc7700] transition active:translate-y-1 active:shadow-none hover:bg-[#e68600]"
              >
                {t.buyHighlight}
              </Link>
              <p className="mt-2 text-center text-[11px] text-ink-faint">
                {t.buyHighlightNote}
              </p>
            </>
          )}
        </div>

        {/* Kiemelt Állás (Employers) */}
        <div className="flex flex-col rounded-[32px] border-2 border-line bg-surface p-6 shadow-card hover:border-accent/30 transition-colors relative">
          <div className="mb-3 inline-flex items-center justify-center rounded-full bg-accent/10 w-14 h-14 text-accent text-2xl">
            💼
          </div>
          <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-pill bg-accent/10 px-2.5 py-1 text-[10.5px] font-black uppercase tracking-wide text-accent">
            {t.jobBadge}
          </span>
          <h2 className="text-[22px] font-black text-ink">{t.jobTitle}</h2>
          <p className="text-[13px] text-ink-muted mt-2 mb-6 flex-1">{t.jobDesc}</p>

          <div className="mb-6">
            <span className="text-3xl font-black text-ink">{livePrices?.total.job_featured ?? "49 €"}</span>
            <span className="text-[14px] font-bold text-ink-muted">{t.perListing}</span>
            <p className="mt-1 text-[11px] text-ink-faint">
              {livePrices?.total.job_featured ? t.netPriceLiveJob : t.netPriceStaticJob}{" "}
              <span className="web-only-payment">{t.webPay}</span>
              <span className="android-only-payment">{t.androidPay}</span>
            </p>
          </div>

          <ul className="space-y-3 mb-8 flex-1">
            {JOB_FEATURES[lang].map((txt) => (
              <FeatureItem key={txt} text={txt} />
            ))}
          </ul>

          <Link
            href="/munkaltato"
            className="block w-full rounded-pill border-2 border-ink py-3.5 text-center text-[15px] font-black text-ink shadow-card transition hover:bg-ink hover:text-surface active:scale-[0.98]"
          >
            {t.postJob}
          </Link>
          <p className="mt-2 text-center text-[11px] text-ink-faint">{t.postJobNote}</p>
        </div>

      </div>

      {/* FAQ / Trust / jogi szekció — a fizetési szolgáltató kontextusfüggő:
          weben Paddle, az Android-appban KIZÁRÓLAG Google Play (a Play
          szabályzata szerint ott a webes fizetés említése is tilos). A váltást
          a globals.css .web-only-payment / .android-only-payment osztályai
          végzik, villanásmentesen. */}
      <div className="mt-16 text-center">
        <div className="web-only-payment">
          {kintiProActive && (
            <div className="mb-6">
              <button
                type="button"
                onClick={openPortal}
                disabled={portalBusy}
                className="inline-flex items-center gap-2 rounded-pill border border-line bg-surface px-5 py-2.5 text-[13px] font-bold text-ink shadow-card transition active:scale-[0.98] disabled:opacity-60"
              >
                {portalBusy ? t.manageSubOpening : t.manageSub}
              </button>
              {portalError && (
                <p className="mx-auto mt-2 max-w-md text-[11.5px] leading-snug text-accent">{portalError}</p>
              )}
            </div>
          )}
          <p className="text-[13px] font-semibold text-ink-muted">{t.paddleTrust}</p>
          <p className="mx-auto mt-2 max-w-md text-[11px] leading-snug text-ink-faint">{t.cancelInfo1}</p>
          <p className="mx-auto mt-2 max-w-md text-[11px] leading-snug text-ink-faint">{t.cancelInfo2}</p>
        </div>
        <div className="android-only-payment">
          {kintiProActive && (
            <div className="mb-6">
              <a
                href="https://play.google.com/store/account/subscriptions"
                className="inline-flex items-center gap-2 rounded-pill border border-line bg-surface px-5 py-2.5 text-[13px] font-bold text-ink shadow-card transition active:scale-[0.98]"
              >
                {t.managePlay}
              </a>
            </div>
          )}
          <p className="text-[13px] font-semibold text-ink-muted">{t.androidTrust}</p>
          <p className="mx-auto mt-2 max-w-md text-[11px] leading-snug text-ink-faint">{t.androidCancelInfo}</p>
        </div>
        <p className="mx-auto mt-2 max-w-md text-[11px] leading-snug text-ink-faint">
          {t.withdrawalPre}
          <Link href="/aszf" target="_blank" className="underline">{t.aszfLink}</Link>
          {t.withdrawalPost}
        </p>
        <p className="mx-auto mt-2 max-w-md text-[11px] leading-snug text-ink-faint">
          {t.aiNotePre}
          <Link href="/ai-atlathatosag" className="underline">{t.aiTransparencyLabel}</Link>.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] font-semibold text-ink-faint">
          <Link href="/aszf" className="underline">{t.navAszf}</Link>
          <Link href="/adatvedelem" className="underline">{t.navPriv}</Link>
          <Link href="/visszateres" className="underline">{t.navRefund}</Link>
          <Link href="/impresszum" className="underline">{t.navImprint}</Link>
        </div>
      </div>
    </div>
  );
}

/** „Aktív” jelvény — a már megvett csomagon (átláthatóság). */
function ActiveBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-pill bg-success/15 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-success">
      <Icon name="check" size={11} strokeWidth={3.5} /> {label}
    </span>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2.5">
      <div className="mt-0.5 grid shrink-0 h-4 w-4 place-items-center rounded-full bg-success/20 text-success">
        <Icon name="check" size={10} strokeWidth={4} />
      </div>
      <span className="text-[13.5px] font-semibold text-ink/80 leading-snug">{text}</span>
    </li>
  );
}
