"use client";

import { useState } from "react";
import { SosModal } from "./sos-modal";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export function GlobalSosButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const handleClick = () => {
    if (!isSignedIn) {
      alert("A Közösségi S.O.S. használatához be kell jelentkezned!");
      router.push("/belepes");
      return;
    }
    setIsOpen(true);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="pointer-events-auto absolute top-3 right-3 z-[999] flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.6)] transition-transform hover:scale-110 active:scale-95"
        aria-label="S.O.S. Segítségkérés"
      >
        <span className="text-2xl">🆘</span>
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex h-4 w-4 rounded-full bg-red-500"></span>
        </span>
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
