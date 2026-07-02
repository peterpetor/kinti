"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LEGAL_ACCEPTED_KEY, LEGAL_EXEMPT_PATHS } from "@/lib/legal-gate";

/**
 * A kivétel-útvonalak és a localStorage-kulcs a lib/legal-gate.ts-ben élnek,
 * mert a root layout boot-szkriptjének (data-legal-pending) ugyanazokkal a
 * szabályokkal kell dolgoznia — ott van elmagyarázva a villanás-mentes minta.
 *
 * `window.location.pathname` használunk (nem usePathname) — egyszerűbb,
 * nem igényel Suspense-boundary-t, és a komponens már client-component.
 */
const EXEMPT_PATHS = LEGAL_EXEMPT_PATHS;

/** A boot-gate feloldása: a body újra látható (globals.css rejti addig). */
function releaseBootGate() {
  document.documentElement.removeAttribute("data-legal-pending");
}

/** A jogi feltételek verziója — a hozzájárulás-naplóhoz (GDPR demonstrálhatóság),
 *  és a jövőbeli feltétel-változáskori újra-kéréshez. Feltétel-módosításkor emeld. */
const LEGAL_VERSION = "2026-07-02"; // ÁSZF 10/A rangsor-átláthatóság (P2B) + Omnibus-tájékoztatók

function pathIsExempt(pathname: string): boolean {
  return EXEMPT_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export function LegalGatekeeper() {
  const [isOpen, setIsOpen] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [acceptAszf, setAcceptAszf] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);

  // A modal DOM-ba kerülése UTÁN oldjuk fel a boot-gate-et (commit után fut),
  // így a reveal pillanatában már a kapu látszik — a tartalom nem villan be.
  useEffect(() => {
    if (isOpen) releaseBootGate();
  }, [isOpen]);

  useEffect(() => {
    if (pathIsExempt(window.location.pathname)) {
      releaseBootGate(); // védőháló — a boot-szkript kivétel-oldalon nem rejt
      return;
    }
    if (localStorage.getItem(LEGAL_ACCEPTED_KEY)) {
      releaseBootGate(); // védőháló — elfogadott eszközön a szkript nem rejtett
      return;
    }

    // Bejelentkezett user a Clerk REGISZTRÁCIÓNÁL már elfogadta az ÁSZF-et + az
    // Adatkezelési Tájékoztatót (és az ÁSZF kimondja a 18+ nagykorúsági kikötést)
    // → a device-szintű kaput NEKI NE mutassuk (redundáns). A kapu csak az ANONIM
    // látogatóknak szól. FONTOS: NEM Clerk-HOOK-ot használunk (az a globális
    // layoutban elrontaná a force-static oldalak statikus exportját), hanem a
    // futásidejű `window.Clerk`-et a useEffect-ben (SSG-biztos).
    const getClerk = () =>
      (window as unknown as { Clerk?: { loaded?: boolean; user?: unknown } }).Clerk;
    let cancelled = false;
    const decide = () => {
      if (cancelled) return;
      if (getClerk()?.user) {
        releaseBootGate(); // bejelentkezett → nincs kapu, a tartalom jöhet
        return;
      }
      setIsOpen(true);
      document.body.style.overflow = "hidden";
    };

    // Ha nincs Clerk session-cookie, biztosan anonim → nem várunk a Clerkre
    // (a 2,5s várakozás alatt a boot-gate miatt üres lenne az oldal).
    const hasSessionCookie = document.cookie.includes("__session=");
    if (!hasSessionCookie || getClerk()?.loaded) {
      decide();
      return;
    }
    // Session-cookie van → megvárjuk, míg a Clerk betölt (max ~2,5s), hogy
    // bejelentkezettnek ne villantsuk fel; ha addig nem tölt be, anonimnak
    // tekintjük (mutatjuk).
    const t0 = Date.now();
    const iv = setInterval(() => {
      if (getClerk()?.loaded || Date.now() - t0 > 2500) {
        clearInterval(iv);
        decide();
      }
    }, 150);
    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, []);

  const handleAccept = () => {
    if (ageConfirmed && acceptAszf && acceptPrivacy) {
      localStorage.setItem(LEGAL_ACCEPTED_KEY, "true");
      // GDPR 7. cikk (1) — a hozzájárulás VERZIÓJÁT is eltároljuk (feltétel-változáskor
      // újra-kérhető), és szerver-oldalon is NAPLÓZZUK (demonstrálhatóság). Privacy:
      // véletlen, eszköz-szintű consentId (nem PII, nem tracking); best-effort küldés.
      try {
        localStorage.setItem("kinti_legal_version", LEGAL_VERSION);
        let cid = localStorage.getItem("kinti_consent_id");
        if (!cid) { cid = crypto.randomUUID(); localStorage.setItem("kinti_consent_id", cid); }
        let country: string | null = null;
        try { country = localStorage.getItem("kinti.country"); } catch { /* ignore */ }
        void fetch("/api/consent", {
          method: "POST",
          headers: { "content-type": "application/json" },
          keepalive: true,
          body: JSON.stringify({ consentId: cid, version: LEGAL_VERSION, age18: true, aszf: true, privacy: true, country }),
        }).catch(() => { /* a napló hibája NE blokkolja a belépést */ });
      } catch { /* localStorage/fetch hiánya ne törje a belépést */ }
      setIsOpen(false);
      document.body.style.overflow = "";
      // Az ország-választó kapu erre az eseményre vár (hogy ne villogjon a kettő
      // egymásra): a jogi elfogadás UTÁN jelenhet meg.
      window.dispatchEvent(new Event("kinti:legal-accepted"));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-bg/85 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-md rounded-3xl border-2 border-primary/20 bg-surface p-6 sm:p-8 shadow-pop glass relative overflow-hidden space-y-6">
        
        {/* Header / Brand */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-pin">
            {/* Elegant Logo icon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
            </svg>
          </div>
          <h2 className="text-[22px] font-extrabold tracking-tight text-ink mt-3">
            Üdvözöl a kinti.app!
          </h2>
          <p className="text-[13px] leading-relaxed text-ink-muted px-2">
            Közösségünk biztonsága és a jogi tisztaság érdekében a platform elérése előtt kérjük, fogadd el az alábbi feltételeket.
          </p>
        </div>

        {/* Checkbox fields */}
        <div className="space-y-3 pt-2">
          {/* Age confirmation */}
          <label className={`flex items-start gap-3 rounded-2xl border p-4 transition-all duration-200 cursor-pointer ${ageConfirmed ? 'border-primary bg-primary-soft/40 shadow-sm' : 'border-line bg-surface-alt hover:bg-surface-alt/75'}`}>
            <input
              type="checkbox"
              checked={ageConfirmed}
              onChange={(e) => setAgeConfirmed(e.target.checked)}
              className="mt-1 h-4.5 w-4.5 cursor-pointer accent-primary rounded-md"
            />
            <div className="space-y-0.5">
              <span className="text-[13px] font-bold text-ink block">Elmúltam 18 éves</span>
              <span className="text-[11px] text-ink-muted block leading-snug">A platformot és annak moduljait kizárólag nagykorúak használhatják.</span>
            </div>
          </label>

          {/* ASZF acceptance */}
          <div className={`rounded-2xl border p-4 transition-all duration-200 ${acceptAszf ? 'border-primary bg-primary-soft/40 shadow-sm' : 'border-line bg-surface-alt'}`}>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptAszf}
                onChange={(e) => setAcceptAszf(e.target.checked)}
                className="mt-1 h-4.5 w-4.5 cursor-pointer accent-primary rounded-md"
              />
              <span className="text-[13px] font-bold text-ink block">
                Elfogadom az ÁSZF-et
              </span>
            </label>
            <p className="mt-1.5 pl-[28px] text-[11px] text-ink-muted leading-snug">
              Elolvastam és elfogadom a{" "}
              <Link
                href="/aszf"
                target="_blank"
                className="underline font-bold text-primary hover:text-primary/80 transition"
              >
                Felhasználási Feltételeket (ÁSZF)
              </Link>
              .
            </p>
          </div>

          {/* Privacy acceptance */}
          <div className={`rounded-2xl border p-4 transition-all duration-200 ${acceptPrivacy ? 'border-primary bg-primary-soft/40 shadow-sm' : 'border-line bg-surface-alt'}`}>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptPrivacy}
                onChange={(e) => setAcceptPrivacy(e.target.checked)}
                className="mt-1 h-4.5 w-4.5 cursor-pointer accent-primary rounded-md"
              />
              <span className="text-[13px] font-bold text-ink block">
                Elfogadom az Adatkezelési Tájékoztatót
              </span>
            </label>
            <p className="mt-1.5 pl-[28px] text-[11px] text-ink-muted leading-snug">
              Hozzájárulok adataim kezeléséhez a{" "}
              <Link
                href="/adatvedelem"
                target="_blank"
                className="underline font-bold text-primary hover:text-primary/80 transition"
              >
                Adatkezelési Tájékoztatóban
              </Link>{" "}
              leírtak szerint.
            </p>
          </div>
        </div>

        {/* Enter Button */}
        <button
          type="button"
          onClick={handleAccept}
          disabled={!ageConfirmed || !acceptAszf || !acceptPrivacy}
          className={`flex h-12 w-full items-center justify-center gap-2 rounded-full text-[14px] font-extrabold tracking-tight text-white shadow-card-hover transition-all duration-300 ${
            ageConfirmed && acceptAszf && acceptPrivacy
              ? "bg-primary hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              : "bg-ink-faint/60 cursor-not-allowed opacity-60"
          }`}
        >
          Belépés a platformra
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </button>

      </div>
    </div>
  );
}
