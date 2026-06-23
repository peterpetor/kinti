"use client";

import { useState } from "react";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY } from "@/lib/countries";

export function PermitWizardClient() {
  const [prefCountry] = usePreferredCountry();
  const isAT = (prefCountry ?? DEFAULT_COUNTRY) === "AT";
  const [arrivalDate, setArrivalDate] = useState<string>("");

  let arrival = new Date();
  let today = new Date();
  let cPermitDate = new Date();
  let citizenDate = new Date();
  let showResults = false;
  let progressToC = 0;
  let progressToCitizen = 0;

  if (arrivalDate) {
    arrival = new Date(arrivalDate);
    cPermitDate = new Date(arrival);
    cPermitDate.setFullYear(arrival.getFullYear() + 5);
    
    citizenDate = new Date(arrival);
    citizenDate.setFullYear(arrival.getFullYear() + 10);
    
    showResults = true;

    const totalDaysToC = (cPermitDate.getTime() - arrival.getTime()) / (1000 * 3600 * 24);
    const daysSinceArrivalToC = (today.getTime() - arrival.getTime()) / (1000 * 3600 * 24);
    progressToC = Math.max(0, Math.min(100, (daysSinceArrivalToC / totalDaysToC) * 100));

    const totalDaysToCitizen = (citizenDate.getTime() - arrival.getTime()) / (1000 * 3600 * 24);
    progressToCitizen = Math.max(0, Math.min(100, (daysSinceArrivalToC / totalDaysToCitizen) * 100));
  }

  const isCEligible = today >= cPermitDate;
  const isCitizenEligible = today >= citizenDate;

  return (
    <div className="space-y-6">
      <div className="bg-surface border border-line rounded-2xl p-5 shadow-sm">
        <h2 className="text-xl font-bold mb-2">Állampolgárság Varázsló (EU)</h2>
        <p className="text-ink-muted text-sm mb-4">
          {isAT
            ? "Magyar állampolgárként mikor lehetsz jogosult az osztrák tartós tartózkodásra (Daueraufenthalt, 5 év) és az osztrák állampolgárságra (Staatsbürgerschaft, jellemzően 10 év)? Add meg, mikor jelentkeztél be."
            : "Magyar állampolgárként mikor lehetsz jogosult a svájci C-engedélyre (Niederlassungsbewilligung) és a svájci útlevélre (Einbürgerung)? Add meg mikor költöztél ki."}
        </p>

        <div className="space-y-2">
          <label className="block text-sm font-medium">{isAT ? "Ausztriai bejelentkezésed" : "Svájci bejelentkezésed"} hónapja:</label>
          <input 
            type="month" 
            value={arrivalDate} 
            onChange={e => setArrivalDate(e.target.value)} 
            className="w-full rounded-lg border border-line bg-surface-alt text-ink py-3 px-4 text-lg font-semibold focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      {showResults && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          
          {/* C-Permit Status */}
          <div className="bg-surface border border-line rounded-2xl p-5 shadow-sm relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1.5 ${isCEligible ? 'bg-success' : 'bg-primary'}`} />
            <div className="flex justify-between items-start mb-2 mt-1">
              <h3 className="font-bold text-lg">{isAT ? "Tartós tartózkodás (Daueraufenthalt)" : "Letelepedési Engedély (C-Bewilligung)"}</h3>
              {isCEligible && <span className="bg-success/10 text-success text-xs px-2.5 py-1 rounded-full font-bold whitespace-nowrap ml-2">Jogosult lehetsz!</span>}
            </div>
            <p className="text-sm text-ink-muted mb-5">{isAT ? "5 év jogszerű tartózkodás után a Daueraufenthalt megerősített letelepedési státuszt és erősebb védelmet ad a kiutasítás ellen." : "A C-engedéllyel végleges tartózkodási jogot kapsz, és megszűnik a munkáltatóhoz / kvótákhoz való kötődésed."}</p>
            
            <div className="mb-5 bg-surface-alt p-4 rounded-xl">
              <div className="flex justify-between text-xs font-semibold text-ink-muted mb-2">
                <span>Érkezés: {arrival.toLocaleDateString('hu-HU', { year: 'numeric', month: 'short' })}</span>
                <span className={isCEligible ? 'text-success font-bold' : ''}>Cél: {cPermitDate.toLocaleDateString('hu-HU', { year: 'numeric', month: 'short' })}</span>
              </div>
              <div className="w-full bg-line rounded-full h-3.5 overflow-hidden">
                <div className={`h-3.5 rounded-full transition-all duration-1000 ${isCEligible ? 'bg-success' : 'bg-primary'}`} style={{ width: `${progressToC}%` }}></div>
              </div>
              <div className="text-center mt-3 text-sm font-semibold">
                {isCEligible ? (
                  <span className="text-success">{isAT ? "Az 5 évet elérted! Kérheted a Daueraufenthalt-igazolást a tartózkodási hatóságnál." : "Az 5 éves (EU/EFTA) időtartamot elérted! Már beadhatod a kérelmet a Gemeinde-nél."}</span>
                ) : (
                  <span className="text-primary">Még {(100 - progressToC).toFixed(1)}% van hátra az 5 évből.</span>
                )}
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 text-sm space-y-2">
              <p className="font-semibold text-primary">{isAT ? "Mik a Daueraufenthalt feltételei?" : "Mik a feltételei a C-engedélynek?"}</p>
              {isAT ? (
              <ul className="list-disc pl-5 text-ink-muted space-y-1.5">
                <li>5 év megszakítás nélküli, jogszerű ausztriai tartózkodás (EU-állampolgárként a szabad mozgás alapján).</li>
                <li>Folyamatos megélhetés (munka/önfoglalkoztatás vagy elég jövedelem) + egészségbiztosítás.</li>
                <li>Nem terhelted túlzottan a szociális rendszert.</li>
                <li>A »Bescheinigung des Daueraufenthalts« kérelmezése a tartózkodási hatóságnál.</li>
              </ul>
              ) : (
              <ul className="list-disc pl-5 text-ink-muted space-y-1.5">
                <li>Megszakítás nélküli, 5 év B-engedéllyel történő szabályos svájci tartózkodás.</li>
                <li>Nyelvtudás igazolása (Fide teszt / Goethe): szóban <strong>B1</strong>, írásban <strong>A2</strong> szint. (Egyes kantonokban, pl. Zürichben egyelőre A2/A1 is elég lehet, de a szövetségi ajánlás szigorodik).</li>
                <li>Tiszta svájci erkölcsi bizonyítvány (Strafregisterauszug).</li>
                <li>Nincs betömetlen adósságod (Betreibungsauskunft).</li>
                <li>Szociális segély (Sozialhilfe) hiánya az elmúlt 3 évben.</li>
              </ul>
              )}
            </div>
          </div>

          {/* Citizenship Status */}
          <div className="bg-surface border border-line rounded-2xl p-5 shadow-sm relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1.5 ${isCitizenEligible ? 'bg-accent' : 'bg-line'}`} />
            <div className="flex justify-between items-start mb-2 mt-1">
              <h3 className="font-bold text-lg">{isAT ? "Osztrák Állampolgárság (Staatsbürgerschaft)" : "Svájci Állampolgárság (Einbürgerung)"}</h3>
              {isCitizenEligible && <span className="bg-accent/10 text-accent text-xs px-2.5 py-1 rounded-full font-bold whitespace-nowrap ml-2">Jogosult lehetsz!</span>}
            </div>
            <p className="text-sm text-ink-muted mb-5">{isAT ? "Honosítás (Verleihung der Staatsbürgerschaft). FONTOS: Ausztria általában NEM enged kettős állampolgárságot — a magyar állampolgárságról le kell mondanod!" : "Rendes honosítási eljárás (Ordentliche Einbürgerung). Teljes választójog és állampolgári kötelezettségek."}</p>
            
            <div className="mb-5 bg-surface-alt p-4 rounded-xl">
              <div className="flex justify-between text-xs font-semibold text-ink-muted mb-2">
                <span>Érkezés: {arrival.toLocaleDateString('hu-HU', { year: 'numeric', month: 'short' })}</span>
                <span className={isCitizenEligible ? 'text-accent font-bold' : ''}>Cél: {citizenDate.toLocaleDateString('hu-HU', { year: 'numeric', month: 'short' })}</span>
              </div>
              <div className="w-full bg-line rounded-full h-3.5 overflow-hidden">
                <div className={`h-3.5 rounded-full transition-all duration-1000 ${isCitizenEligible ? 'bg-accent' : 'bg-ink-faint'}`} style={{ width: `${progressToCitizen}%` }}></div>
              </div>
              <div className="text-center mt-3 text-sm font-semibold">
                {isCitizenEligible ? (
                  <span className="text-accent">{isAT ? "A 10 évet elérted! (Különleges esetben már 6 év is elég lehet — lásd a feltételeket.)" : "A szövetségi 10 éves szabályt elérted! (Vedd figyelembe a kantonális éveket is)"}</span>
                ) : (
                  <span className="text-ink-muted">Még {(100 - progressToCitizen).toFixed(1)}% van hátra a 10 évből.</span>
                )}
              </div>
            </div>

            <div className="bg-accent/5 border border-accent/15 rounded-xl p-4 text-sm space-y-2">
              <p className="font-semibold text-accent">{isAT ? "Mik az állampolgárság feltételei?" : "Mik a feltételei az Útlevélnek?"}</p>
              {isAT ? (
              <ul className="list-disc pl-5 text-ink-muted space-y-1.5">
                <li>Legalább <strong>10 év</strong> jogszerű tartózkodás (ebből min. 5 év Niederlassung/Daueraufenthalt). Különleges esetben <strong>6 év</strong> (pl. kiemelkedő integráció B2-vel, Ausztriában született, elismert menekült).</li>
                <li>Nyelvtudás <strong>B1</strong> + a <strong>Staatsbürgerschaftstest</strong> sikeres letétele (osztrák történelem, intézmények + a tartomány kérdései).</li>
                <li><strong className="text-accent">A magyar állampolgárságról LE KELL MONDANOD — Ausztria általában nem enged kettős állampolgárságot!</strong></li>
                <li>Biztos megélhetés (az elmúlt 6 évből kb. 3 év igazolt jövedelem), tartós szociális segély-függés nélkül.</li>
                <li>Tiszta büntetlen előélet (osztrák és külföldi), az alkotmányos rend elfogadása.</li>
              </ul>
              ) : (
              <ul className="list-disc pl-5 text-ink-muted space-y-1.5">
                <li>Legalább 10 év igazolt svájci tartózkodás (a 8-18 életév között töltött évek duplán számítanak).</li>
                <li><strong>Követelmény: Már rendelkezz C-engedéllyel!</strong></li>
                <li>Sikeres integráció: Svájci szokások és rend ismerete (Einbürgerungstest / Állampolgársági interjú a Gemeinde-n).</li>
                <li><strong>Minimális helyben lakás:</strong> Kantontól függően 2-5 évig egyazon településen / kantonban kell élned a kérelem beadása előtt. (Ha átköltözöl egy másik kantonba, ez az óra nullázódhat!)</li>
                <li>Szigorú büntetlen előélet és anyagi függetlenség bizonyítása.</li>
              </ul>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
