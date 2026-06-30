"use client";

import { useState, type ReactNode } from "react";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY } from "@/lib/countries";

/** Ország-specifikus letelepedési/honosítási konfiguráció (EU-állampolgár magyarként). */
interface PermitConfig {
  intro: string;
  arrivalLabel: string;
  residenceYears: number;
  citizenYears: number;
  resTitle: string;
  resDesc: string;
  resDoneMsg: string;
  resConds: ReactNode[];
  citTitle: string;
  citDesc: string;
  citDoneMsg: string;
  citConds: ReactNode[];
}

const PERMIT_CONFIG: Record<string, PermitConfig> = {
  CH: {
    intro: "Magyar állampolgárként mikor lehetsz jogosult a svájci C-engedélyre (Niederlassungsbewilligung) és a svájci útlevélre (Einbürgerung)? Add meg, mikor költöztél ki.",
    arrivalLabel: "Svájci bejelentkezésed",
    residenceYears: 5,
    citizenYears: 10,
    resTitle: "Letelepedési Engedély (C-Bewilligung)",
    resDesc: "A C-engedéllyel végleges tartózkodási jogot kapsz, és megszűnik a munkáltatóhoz / kvótákhoz való kötődésed.",
    resDoneMsg: "Az 5 éves (EU/EFTA) időtartamot elérted! Már beadhatod a kérelmet a Gemeinde-nél.",
    resConds: [
      "Megszakítás nélküli, 5 év B-engedéllyel történő szabályos svájci tartózkodás.",
      <>Nyelvtudás igazolása (Fide / Goethe): szóban <strong>B1</strong>, írásban <strong>A2</strong> szint.</>,
      "Tiszta svájci erkölcsi bizonyítvány (Strafregisterauszug).",
      "Nincs betömetlen adósságod (Betreibungsauskunft).",
      "Szociális segély (Sozialhilfe) hiánya az elmúlt 3 évben.",
    ],
    citTitle: "Svájci Állampolgárság (Einbürgerung)",
    citDesc: "Rendes honosítási eljárás (Ordentliche Einbürgerung). Svájc ENGEDI a kettős állampolgárságot — a magyart megtarthatod.",
    citDoneMsg: "A szövetségi 10 éves szabályt elérted! (Vedd figyelembe a kantonális éveket is.)",
    citConds: [
      "Legalább 10 év igazolt svájci tartózkodás (a 8–18 életév között töltött évek duplán számítanak).",
      <><strong>Követelmény: már rendelkezz C-engedéllyel!</strong></>,
      "Sikeres integráció: svájci szokások és rend ismerete (Einbürgerungstest / interjú a Gemeinde-n).",
      <><strong>Minimális helyben lakás:</strong> kantontól függően 2–5 év egyazon településen/kantonban (átköltözésnél nullázódhat!).</>,
      "Szigorú büntetlen előélet és anyagi függetlenség.",
    ],
  },
  AT: {
    intro: "Magyar állampolgárként mikor lehetsz jogosult az osztrák tartós tartózkodásra (Daueraufenthalt, 5 év) és az osztrák állampolgárságra (Staatsbürgerschaft, jellemzően 10 év)? Add meg, mikor jelentkeztél be.",
    arrivalLabel: "Ausztriai bejelentkezésed",
    residenceYears: 5,
    citizenYears: 10,
    resTitle: "Tartós tartózkodás (Daueraufenthalt)",
    resDesc: "5 év jogszerű tartózkodás után a Daueraufenthalt megerősített letelepedési státuszt és erősebb védelmet ad a kiutasítás ellen.",
    resDoneMsg: "Az 5 évet elérted! Kérheted a Daueraufenthalt-igazolást a tartózkodási hatóságnál.",
    resConds: [
      "5 év megszakítás nélküli, jogszerű ausztriai tartózkodás (EU-állampolgárként a szabad mozgás alapján).",
      "Folyamatos megélhetés (munka/önfoglalkoztatás vagy elég jövedelem) + egészségbiztosítás.",
      "Nem terhelted túlzottan a szociális rendszert.",
      "A »Bescheinigung des Daueraufenthalts« kérelmezése a tartózkodási hatóságnál.",
    ],
    citTitle: "Osztrák Állampolgárság (Staatsbürgerschaft)",
    citDesc: "Honosítás (Verleihung). FONTOS: Ausztria általában NEM enged kettős állampolgárságot — a magyar állampolgárságról le kell mondanod!",
    citDoneMsg: "A 10 évet elérted! (Különleges esetben már 6 év is elég lehet — lásd a feltételeket.)",
    citConds: [
      <>Legalább <strong>10 év</strong> jogszerű tartózkodás (ebből min. 5 év Niederlassung/Daueraufenthalt). Különleges esetben <strong>6 év</strong> (kiemelkedő integráció B2-vel, Ausztriában született, elismert menekült).</>,
      <>Nyelvtudás <strong>B1</strong> + a <strong>Staatsbürgerschaftstest</strong> sikeres letétele.</>,
      <><strong className="text-accent">A magyar állampolgárságról LE KELL MONDANOD — Ausztria általában nem enged kettős állampolgárságot!</strong></>,
      "Biztos megélhetés (az elmúlt 6 évből kb. 3 év igazolt jövedelem), tartós szociális segély-függés nélkül.",
      "Tiszta büntetlen előélet (osztrák és külföldi), az alkotmányos rend elfogadása.",
    ],
  },
  DE: {
    intro: "Magyar (EU-)állampolgárként mikor lehetsz jogosult a tartós tartózkodásra (Daueraufenthaltsrecht, 5 év) és a német állampolgárságra (Einbürgerung)? A 2024-es reform óta jellemzően 5 év. Add meg, mikor jelentkeztél be (Anmeldung).",
    arrivalLabel: "Németországi bejelentkezésed (Anmeldung)",
    residenceYears: 5,
    citizenYears: 5,
    resTitle: "Tartós tartózkodás (Daueraufenthaltsrecht-EU)",
    resDesc: "EU-állampolgárként 5 év jogszerű tartózkodás után automatikusan tartós tartózkodási jogot szerzel; kérheted a »Bescheinigung des Daueraufenthaltsrechts«-et.",
    resDoneMsg: "Az 5 évet elérted! Kérheted a tartós tartózkodás igazolását az Ausländerbehörde / Bürgeramt-nál.",
    resConds: [
      "5 év megszakítás nélküli, jogszerű németországi tartózkodás (a szabad mozgás / Freizügigkeit alapján).",
      "Folyamatos megélhetés (munka/önfoglalkoztatás vagy elég jövedelem) + egészségbiztosítás.",
      "EU-állampolgárként a jog automatikusan keletkezik — az igazolás (Bescheinigung) deklaratív.",
    ],
    citTitle: "Német Állampolgárság (Einbürgerung)",
    citDesc: "A 2024-es reform óta: jellemzően 5 év (kiemelkedő integrációval 3 év). FONTOS: Németország MOSTANTÓL ENGEDI a kettős állampolgárságot — a magyart megtarthatod!",
    citDoneMsg: "Az 5 évet elérted! (Kivételes integrációval — C1 + különös teljesítmény — már 3 év is elég lehet.)",
    citConds: [
      <>Legalább <strong>5 év</strong> jogszerű tartózkodás (a 2024-es reform előtt 8 volt). Kiemelkedő integrációval (C1 + különös teljesítmény) <strong>3 év</strong>.</>,
      <>Nyelvtudás <strong>B1</strong> (a gyorsított úthoz C1) + a <strong>„Leben in Deutschland" / Einbürgerungstest</strong> sikeres letétele.</>,
      <><strong className="text-success">A magyar állampolgárságodat MEGTARTHATOD — a 2024-es reform óta megengedett a kettős állampolgárság.</strong></>,
      "Önálló megélhetés (általában tartós Bürgergeld-függés nélkül), tiszta büntetlen előélet.",
      "A szabad demokratikus alaprend (freiheitliche demokratische Grundordnung) elismerése.",
    ],
  },
  NL: {
    intro: "Magyar (EU-)állampolgárként mikor lehetsz jogosult a tartós tartózkodásra (duurzaam verblijfsrecht, 5 év) és a holland állampolgárságra (naturalisatie, 5 év)? Add meg, mikor jelentkeztél be (inschrijving).",
    arrivalLabel: "Hollandiai bejelentkezésed (inschrijving)",
    residenceYears: 5,
    citizenYears: 5,
    resTitle: "Tartós tartózkodás (Duurzaam verblijfsrecht)",
    resDesc: "EU-állampolgárként 5 év jogszerű tartózkodás után tartós tartózkodási jogot szerzel; igazolást az IND-nél (Immigratie- en Naturalisatiedienst) kérhetsz.",
    resDoneMsg: "Az 5 évet elérted! Kérheted a tartós tartózkodás igazolását az IND-nél.",
    resConds: [
      "5 év megszakítás nélküli, jogszerű hollandiai tartózkodás (a szabad mozgás alapján).",
      "Folyamatos megélhetés (munka/önfoglalkoztatás vagy elég jövedelem) + egészségbiztosítás (zorgverzekering).",
      "EU-állampolgárként a jog a tartózkodással keletkezik — az IND igazolása deklaratív.",
    ],
    citTitle: "Holland Állampolgárság (Naturalisatie)",
    citDesc: "Honosítás (naturalisatie). FONTOS: Hollandia általában NEM enged kettős állampolgárságot — a magyar állampolgárságodról le kell mondanod (kivételek: holland házastárs, Hollandiában születtél stb.)!",
    citDoneMsg: "Az 5 évet elérted! Beadhatod a naturalisatie-kérelmet a lakhelyed önkormányzatánál (gemeente).",
    citConds: [
      <>Legalább <strong>5 év</strong> megszakítás nélküli, jogszerű tartózkodás.</>,
      <>A <strong>beilleszkedési vizsga (inburgeringsexamen)</strong> sikeres letétele + holland nyelvtudás (jelenleg <strong>A2</strong>, készül a B1-re).</>,
      <><strong className="text-accent">A magyar állampolgárságodról LE KELL MONDANOD — Hollandia főszabályként nem enged kettőst (kivételekkel)!</strong></>,
      "Tiszta büntetlen előélet, beilleszkedés a holland társadalomba.",
      "Részvétel a »naturalisatieceremonie«-n (állampolgársági ünnepség).",
    ],
  },
};

export function PermitWizardClient() {
  const [prefCountry] = usePreferredCountry();
  const country = prefCountry ?? DEFAULT_COUNTRY;
  const cfg = PERMIT_CONFIG[country] ?? PERMIT_CONFIG.CH;
  const [arrivalDate, setArrivalDate] = useState<string>("");

  let arrival = new Date();
  const today = new Date();
  let cPermitDate = new Date();
  let citizenDate = new Date();
  let showResults = false;
  let progressToC = 0;
  let progressToCitizen = 0;

  if (arrivalDate) {
    arrival = new Date(arrivalDate);
    cPermitDate = new Date(arrival);
    cPermitDate.setFullYear(arrival.getFullYear() + cfg.residenceYears);

    citizenDate = new Date(arrival);
    citizenDate.setFullYear(arrival.getFullYear() + cfg.citizenYears);

    showResults = true;

    const daysSince = (today.getTime() - arrival.getTime()) / (1000 * 3600 * 24);
    const totalToC = (cPermitDate.getTime() - arrival.getTime()) / (1000 * 3600 * 24);
    progressToC = Math.max(0, Math.min(100, (daysSince / totalToC) * 100));
    const totalToCitizen = (citizenDate.getTime() - arrival.getTime()) / (1000 * 3600 * 24);
    progressToCitizen = Math.max(0, Math.min(100, (daysSince / totalToCitizen) * 100));
  }

  const isCEligible = today >= cPermitDate;
  const isCitizenEligible = today >= citizenDate;

  return (
    <div className="space-y-6">
      <div className="bg-surface border border-line rounded-2xl p-5 shadow-sm">
        <h2 className="text-xl font-bold mb-2">Állampolgárság Varázsló (EU)</h2>
        <p className="text-ink-muted text-sm mb-4">{cfg.intro}</p>
        <div className="space-y-2">
          <label className="block text-sm font-medium">{cfg.arrivalLabel} hónapja:</label>
          <input
            type="month"
            value={arrivalDate}
            onChange={(e) => setArrivalDate(e.target.value)}
            className="w-full rounded-lg border border-line bg-surface-alt text-ink py-3 px-4 text-lg font-semibold focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      {showResults && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          {/* Tartós tartózkodás */}
          <div className="bg-surface border border-line rounded-2xl p-5 shadow-sm relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1.5 ${isCEligible ? "bg-success" : "bg-primary"}`} />
            <div className="flex justify-between items-start mb-2 mt-1">
              <h3 className="font-bold text-lg">{cfg.resTitle}</h3>
              {isCEligible && <span className="bg-success/10 text-success text-xs px-2.5 py-1 rounded-full font-bold whitespace-nowrap ml-2">Jogosult lehetsz!</span>}
            </div>
            <p className="text-sm text-ink-muted mb-5">{cfg.resDesc}</p>
            <div className="mb-5 bg-surface-alt p-4 rounded-xl">
              <div className="flex justify-between text-xs font-semibold text-ink-muted mb-2">
                <span>Érkezés: {arrival.toLocaleDateString("hu-HU", { year: "numeric", month: "short" })}</span>
                <span className={isCEligible ? "text-success font-bold" : ""}>Cél: {cPermitDate.toLocaleDateString("hu-HU", { year: "numeric", month: "short" })}</span>
              </div>
              <div className="w-full bg-line rounded-full h-3.5 overflow-hidden">
                <div className={`h-3.5 rounded-full transition-all duration-1000 ${isCEligible ? "bg-success" : "bg-primary"}`} style={{ width: `${progressToC}%` }}></div>
              </div>
              <div className="text-center mt-3 text-sm font-semibold">
                {isCEligible ? (
                  <span className="text-success">{cfg.resDoneMsg}</span>
                ) : (
                  <span className="text-primary">Még {(100 - progressToC).toFixed(1)}% van hátra az {cfg.residenceYears} évből.</span>
                )}
              </div>
            </div>
            <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 text-sm space-y-2">
              <p className="font-semibold text-primary">Mik a feltételei?</p>
              <ul className="list-disc pl-5 text-ink-muted space-y-1.5">
                {cfg.resConds.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          </div>

          {/* Állampolgárság */}
          <div className="bg-surface border border-line rounded-2xl p-5 shadow-sm relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1.5 ${isCitizenEligible ? "bg-accent" : "bg-line"}`} />
            <div className="flex justify-between items-start mb-2 mt-1">
              <h3 className="font-bold text-lg">{cfg.citTitle}</h3>
              {isCitizenEligible && <span className="bg-accent/10 text-accent text-xs px-2.5 py-1 rounded-full font-bold whitespace-nowrap ml-2">Jogosult lehetsz!</span>}
            </div>
            <p className="text-sm text-ink-muted mb-5">{cfg.citDesc}</p>
            <div className="mb-5 bg-surface-alt p-4 rounded-xl">
              <div className="flex justify-between text-xs font-semibold text-ink-muted mb-2">
                <span>Érkezés: {arrival.toLocaleDateString("hu-HU", { year: "numeric", month: "short" })}</span>
                <span className={isCitizenEligible ? "text-accent font-bold" : ""}>Cél: {citizenDate.toLocaleDateString("hu-HU", { year: "numeric", month: "short" })}</span>
              </div>
              <div className="w-full bg-line rounded-full h-3.5 overflow-hidden">
                <div className={`h-3.5 rounded-full transition-all duration-1000 ${isCitizenEligible ? "bg-accent" : "bg-ink-faint"}`} style={{ width: `${progressToCitizen}%` }}></div>
              </div>
              <div className="text-center mt-3 text-sm font-semibold">
                {isCitizenEligible ? (
                  <span className="text-accent">{cfg.citDoneMsg}</span>
                ) : (
                  <span className="text-ink-muted">Még {(100 - progressToCitizen).toFixed(1)}% van hátra a {cfg.citizenYears} évből.</span>
                )}
              </div>
            </div>
            <div className="bg-accent/5 border border-accent/15 rounded-xl p-4 text-sm space-y-2">
              <p className="font-semibold text-accent">Mik az állampolgárság feltételei?</p>
              <ul className="list-disc pl-5 text-ink-muted space-y-1.5">
                {cfg.citConds.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
