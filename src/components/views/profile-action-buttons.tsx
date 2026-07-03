"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { ShareSheet } from "@/components/share-sheet";
import { ReportButton } from "@/components/report-button";

interface ProfileActionButtonsProps {
  businessId: string;
  businessName: string;
  /** A képkártyához (ShareSheet `card`): kategória-címke + cím. */
  categoryLabel?: string;
  address?: string | null;
}

export function ProfileHeaderActions({ businessId, businessName, categoryLabel, address }: ProfileActionButtonsProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  // Kedvenc állapot betöltése localStorage-ból
  useEffect(() => {
    try {
      const favs = JSON.parse(localStorage.getItem("kinti_favorites") || "[]");
      setIsFavorite(favs.includes(businessId));
    } catch {
      // Ignoráljuk a hibákat ha a localStorage le van tiltva
    }
  }, [businessId]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  const toggleFavorite = () => {
    try {
      const favs: string[] = JSON.parse(localStorage.getItem("kinti_favorites") || "[]");
      let nextFavs: string[];
      if (favs.includes(businessId)) {
        nextFavs = favs.filter((id) => id !== businessId);
        setIsFavorite(false);
        showToast("Eltávolítva a kedvencek közül");
      } else {
        nextFavs = [...favs, businessId];
        setIsFavorite(true);
        showToast("Kedvencekhez adva");
      }
      localStorage.setItem("kinti_favorites", JSON.stringify(nextFavs));
      window.dispatchEvent(new CustomEvent("kinti-favorites-changed"));
    } catch {
      showToast("A kedvencek funkcióhoz engedélyezd a sütiket!");
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <ReportButton
          contentType="business"
          contentId={businessId}
          className="grid h-[38px] w-[38px] place-items-center rounded-[12px] bg-white/95 text-ink shadow-card backdrop-blur-md transition hover:bg-white hover:text-accent active:scale-95"
        />
        <button
          type="button"
          onClick={() => setShareOpen(true)}
          aria-label="Megosztás"
          className="grid h-[38px] w-[38px] place-items-center rounded-[12px] bg-white/95 text-ink shadow-card backdrop-blur-md transition hover:bg-white active:scale-95"
        >
          <Icon name="share" size={17} strokeWidth={2.2} />
        </button>
        <button
          type="button"
          onClick={toggleFavorite}
          aria-label={isFavorite ? "Eltávolítás a kedvencek közül" : "Kedvencekhez adás"}
          className="grid h-[38px] w-[38px] place-items-center rounded-[12px] bg-white/95 text-accent shadow-card backdrop-blur-md transition hover:bg-white active:scale-95"
        >
          <Icon
            name="heart"
            size={17}
            strokeWidth={2.2}
            filled={isFavorite}
            className={cn("transition-all duration-200", isFavorite && "scale-110 text-accent")}
          />
        </button>
      </div>

      {/* Gyönyörű premium lebegő toast visszajelzés */}
      {toastMessage && (
        <div className="fixed inset-x-5 bottom-8 z-[9999] flex justify-center pointer-events-none animate-fade-up">
          <div className="glass pointer-events-auto rounded-pill px-4 py-2.5 text-[13px] font-bold text-white bg-primary/90 shadow-pop flex items-center gap-2 border border-white/10">
            <Icon name="check" size={14} strokeWidth={3} className="text-success-soft" />
            {toastMessage}
          </div>
        </div>
      )}

      <ShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        url={typeof window !== "undefined" ? window.location.href : ""}
        title={`${businessName} · Kinti`}
        text={`Magyar ${categoryLabel ? categoryLabel.toLowerCase() : "szakember"} a kintin: ${businessName}`}
        card={categoryLabel ? { name: businessName, categoryLabel, address } : undefined}
      />
    </>
  );
}


