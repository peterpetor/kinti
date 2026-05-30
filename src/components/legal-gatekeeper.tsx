"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function LegalGatekeeper() {
  const [isOpen, setIsOpen] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [acceptAszf, setAcceptAszf] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("kinti_legal_accepted");
    if (!accepted) {
      setIsOpen(true);
      document.body.style.overflow = "hidden";
    }
  }, []);

  const handleAccept = () => {
    if (ageConfirmed && acceptAszf && acceptPrivacy) {
      localStorage.setItem("kinti_legal_accepted", "true");
      setIsOpen(false);
      document.body.style.overflow = "";
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
          <label className={`flex items-start gap-3 rounded-2xl border p-4 transition-all duration-200 cursor-pointer ${acceptAszf ? 'border-primary bg-primary-soft/40 shadow-sm' : 'border-line bg-surface-alt hover:bg-surface-alt/75'}`}>
            <input
              type="checkbox"
              checked={acceptAszf}
              onChange={(e) => setAcceptAszf(e.target.checked)}
              className="mt-1 h-4.5 w-4.5 cursor-pointer accent-primary rounded-md"
            />
            <div className="space-y-0.5">
              <span className="text-[13px] font-bold text-ink block">
                Elfogadom az ÁSZF-et
              </span>
              <span className="text-[11px] text-ink-muted block leading-snug">
                Elolvastam és elfogadom a{" "}
                <Link
                  href="/aszf"
                  target="_blank"
                  onClick={(e) => e.stopPropagation()}
                  className="underline font-bold text-primary hover:text-primary/80 transition"
                >
                  Felhasználási Feltételeket (ÁSZF)
                </Link>
                .
              </span>
            </div>
          </label>

          {/* Privacy acceptance */}
          <label className={`flex items-start gap-3 rounded-2xl border p-4 transition-all duration-200 cursor-pointer ${acceptPrivacy ? 'border-primary bg-primary-soft/40 shadow-sm' : 'border-line bg-surface-alt hover:bg-surface-alt/75'}`}>
            <input
              type="checkbox"
              checked={acceptPrivacy}
              onChange={(e) => setAcceptPrivacy(e.target.checked)}
              className="mt-1 h-4.5 w-4.5 cursor-pointer accent-primary rounded-md"
            />
            <div className="space-y-0.5">
              <span className="text-[13px] font-bold text-ink block">
                Elfogadom az Adatkezelési Tájékoztatót
              </span>
              <span className="text-[11px] text-ink-muted block leading-snug">
                Hozzájárulok adataim kezeléséhez a{" "}
                <Link
                  href="/adatvedelem"
                  target="_blank"
                  onClick={(e) => e.stopPropagation()}
                  className="underline font-bold text-primary hover:text-primary/80 transition"
                >
                  Adatkezelési Tájékoztatóban
                </Link>{" "}
                leírtak szerint.
              </span>
            </div>
          </label>
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
