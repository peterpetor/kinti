"use client";

import { useState } from "react";
import { SosModal } from "./sos-modal";
export function GlobalSosButton() {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(true);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-bold text-white shadow-card transition-colors hover:bg-red-700 active:scale-[0.99]"
        aria-label="S.O.S. Segítségkérés"
      >
        <span>🆘 Közösségi S.O.S. Radar (névtelen)</span>
      </button>

      {isOpen && (
        <SosModal
          onClose={() => setIsOpen(false)}
          onSuccess={() => {
            setIsOpen(false);
            alert("Riasztás sikeresen leadva! Megjelenik a térképen.");
          }}
        />
      )}
    </>
  );
}
