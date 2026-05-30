"use client";

import { useState } from "react";

export function PermitWizardClient() {
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
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm">
        <h2 className="text-xl font-bold mb-2">Engedély Varázsló (EU/EFTA)</h2>
        <p className="text-neutral-500 text-sm mb-4">
          Magyar állampolgárként mikor lehetsz jogosult a svájci C-engedélyre (Niederlassungsbewilligung) és a svájci útlevélre (Einbürgerung)? Add meg mikor költöztél ki.
        </p>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Svájci bejelentkezésed hónapja:</label>
          <input 
            type="month" 
            value={arrivalDate} 
            onChange={e => setArrivalDate(e.target.value)} 
            className="w-full rounded-lg border-neutral-300 bg-neutral-50 dark:bg-neutral-800 dark:border-neutral-700 py-3 px-4 text-lg font-semibold focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
      </div>

      {showResults && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          
          {/* C-Permit Status */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1.5 ${isCEligible ? 'bg-green-500' : 'bg-brand-500'}`} />
            <div className="flex justify-between items-start mb-2 mt-1">
              <h3 className="font-bold text-lg">Leetelepedési Engedély (C-Bewilligung)</h3>
              {isCEligible && <span className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full font-bold whitespace-nowrap ml-2">Jogosult lehetsz!</span>}
            </div>
            <p className="text-sm text-neutral-500 mb-5">A C-engedéllyel végleges tartózkodási jogot kapsz, és megszűnik a munkáltatóhoz / kvótákhoz való kötődésed.</p>
            
            <div className="mb-5 bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-xl">
              <div className="flex justify-between text-xs font-semibold text-neutral-500 mb-2">
                <span>Érkezés: {arrival.toLocaleDateString('hu-HU', { year: 'numeric', month: 'short' })}</span>
                <span className={isCEligible ? 'text-green-600 font-bold' : ''}>Cél: {cPermitDate.toLocaleDateString('hu-HU', { year: 'numeric', month: 'short' })}</span>
              </div>
              <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-3.5 overflow-hidden">
                <div className={`h-3.5 rounded-full transition-all duration-1000 ${isCEligible ? 'bg-green-500' : 'bg-brand-500'}`} style={{ width: `${progressToC}%` }}></div>
              </div>
              <div className="text-center mt-3 text-sm font-semibold">
                {isCEligible ? (
                  <span className="text-green-600">Az 5 éves (EU/EFTA) időtartamot elérted! Már beadhatod a kérelmet a Gemeinde-nél.</span>
                ) : (
                  <span className="text-brand-600 dark:text-brand-400">Még {(100 - progressToC).toFixed(1)}% van hátra az 5 évből.</span>
                )}
              </div>
            </div>

            <div className="bg-brand-50 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-900/50 rounded-xl p-4 text-sm space-y-2">
              <p className="font-semibold text-brand-800 dark:text-brand-300">Mik a feltételei a C-engedélynek?</p>
              <ul className="list-disc pl-5 text-neutral-700 dark:text-neutral-300 space-y-1.5">
                <li>Megszakítás nélküli, 5 év B-engedéllyel történő szabályos svájci tartózkodás.</li>
                <li>Nyelvtudás igazolása (Fide teszt / Goethe): szóban <strong>B1</strong>, írásban <strong>A2</strong> szint. (Egyes kantonokban, pl. Zürichben egyelőre A2/A1 is elég lehet, de a szövetségi ajánlás szigorodik).</li>
                <li>Tiszta svájci erkölcsi bizonyítvány (Strafregisterauszug).</li>
                <li>Nincs betömetlen adósságod (Betreibungsauskunft).</li>
                <li>Szociális segély (Sozialhilfe) hiánya az elmúlt 3 évben.</li>
              </ul>
            </div>
          </div>

          {/* Citizenship Status */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1.5 ${isCitizenEligible ? 'bg-red-500' : 'bg-neutral-400'}`} />
            <div className="flex justify-between items-start mb-2 mt-1">
              <h3 className="font-bold text-lg">Svájci Állampolgárság (Einbürgerung)</h3>
              {isCitizenEligible && <span className="bg-red-100 text-red-800 text-xs px-2.5 py-1 rounded-full font-bold whitespace-nowrap ml-2">Jogosult lehetsz!</span>}
            </div>
            <p className="text-sm text-neutral-500 mb-5">Rendes honosítási eljárás (Ordentliche Einbürgerung). Teljes választójog és állampolgári kötelezettségek.</p>
            
            <div className="mb-5 bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-xl">
              <div className="flex justify-between text-xs font-semibold text-neutral-500 mb-2">
                <span>Érkezés: {arrival.toLocaleDateString('hu-HU', { year: 'numeric', month: 'short' })}</span>
                <span className={isCitizenEligible ? 'text-red-600 font-bold' : ''}>Cél: {citizenDate.toLocaleDateString('hu-HU', { year: 'numeric', month: 'short' })}</span>
              </div>
              <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-3.5 overflow-hidden">
                <div className={`h-3.5 rounded-full transition-all duration-1000 ${isCitizenEligible ? 'bg-red-500' : 'bg-neutral-500'}`} style={{ width: `${progressToCitizen}%` }}></div>
              </div>
              <div className="text-center mt-3 text-sm font-semibold">
                {isCitizenEligible ? (
                  <span className="text-red-600">A szövetségi 10 éves szabályt elérted! (Vedd figyelembe a kantonális éveket is)</span>
                ) : (
                  <span className="text-neutral-600 dark:text-neutral-400">Még {(100 - progressToCitizen).toFixed(1)}% van hátra a 10 évből.</span>
                )}
              </div>
            </div>

            <div className="bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl p-4 text-sm space-y-2">
              <p className="font-semibold text-red-800 dark:text-red-300">Mik a feltételei az Útlevélnek?</p>
              <ul className="list-disc pl-5 text-neutral-700 dark:text-neutral-300 space-y-1.5">
                <li>Legalább 10 év igazolt svájci tartózkodás (a 8-18 életév között töltött évek duplán számítanak).</li>
                <li><strong>Követelmény: Már rendelkezz C-engedéllyel!</strong></li>
                <li>Sikeres integráció: Svájci szokások és rend ismerete (Einbürgerungstest / Állampolgársági interjú a Gemeinde-n).</li>
                <li><strong>Minimális helyben lakás:</strong> Kantontól függően 2-5 évig egyazon településen / kantonban kell élned a kérelem beadása előtt. (Ha átköltözöl egy másik kantonba, ez az óra nullázódhat!)</li>
                <li>Szigorú büntetlen előélet és anyagi függetlenség bizonyítása.</li>
              </ul>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
