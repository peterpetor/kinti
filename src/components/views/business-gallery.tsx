"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/components/ui";
import { mediaImageUrl } from "@/lib/media";
import { cn } from "@/lib/cn";

interface Props {
  galleryKeys: string[];
  businessName: string;
}

export function BusinessGallery({ galleryKeys, businessName }: Props) {
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState<"left" | "right" | "none">("none");

  // Keyboard navigation support
  useEffect(() => {
    if (fullscreenIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setDirection("right");
        setFullscreenIndex((prev) => (prev !== null && prev < galleryKeys.length - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowLeft") {
        setDirection("left");
        setFullscreenIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : galleryKeys.length - 1));
      } else if (e.key === "Escape") {
        setFullscreenIndex(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fullscreenIndex, galleryKeys.length]);

  if (!galleryKeys || galleryKeys.length === 0) return null;

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDirection("left");
    setFullscreenIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : galleryKeys.length - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDirection("right");
    setFullscreenIndex((prev) => (prev !== null && prev < galleryKeys.length - 1 ? prev + 1 : 0));
  };

  const selectIndex = (index: number) => {
    setDirection(index > (fullscreenIndex ?? 0) ? "right" : "left");
    setFullscreenIndex(index);
  };

  return (
    <section className="mt-6">
      {/* Universal premium style variables & animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes kintiFadeIn {
          from { opacity: 0; backdrop-filter: blur(0px); }
          to { opacity: 1; backdrop-filter: blur(12px); }
        }
        @keyframes kintiScaleUp {
          from { transform: scale(0.93); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes kintiSlideLeft {
          from { transform: translateX(-32px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes kintiSlideRight {
          from { transform: translateX(32px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-kinti-fade-in {
          animation: kintiFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-kinti-scale-up {
          animation: kintiScaleUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .animate-kinti-slide-left {
          animation: kintiSlideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-kinti-slide-right {
          animation: kintiSlideRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />

      <h2 className="mb-3 text-[14px] font-extrabold uppercase tracking-widest text-ink-muted flex items-center gap-2">
        <span>📸</span> Vizuális Portfólió
      </h2>
      
      {/* Scroll-snap gallery (horizontális) */}
      <div className="flex snap-x snap-mandatory gap-3.5 overflow-x-auto pb-4 scrollbar-hide -mx-[18px] px-[18px]">
        {galleryKeys.map((key, i) => {
          const url = mediaImageUrl(key, { width: 600 });
          if (!url) return null;
          return (
            <button
              key={key}
              onClick={() => {
                setDirection("none");
                setFullscreenIndex(i);
              }}
              className="group relative h-40 w-40 shrink-0 snap-center overflow-hidden rounded-[20px] bg-surface-alt outline-none focus-visible:ring-3 focus-visible:ring-primary shadow-sm hover:shadow-md transition-all duration-300"
            >
              {/* Image with sleek scale transition */}
              <img
                src={url}
                alt={`${businessName} portfólió kép ${i + 1}`}
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110 group-active:scale-95"
                decoding="async"
                loading="lazy"
              />
              {/* Premium dark gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2.5">
                <span className="text-[11px] font-extrabold text-white uppercase tracking-wider bg-white/20 backdrop-blur-md rounded-pill px-2 py-0.5">
                  Nagyítás ⛶
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Fullscreen modal */}
      {fullscreenIndex !== null && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/95 animate-kinti-fade-in">
          {/* Header */}
          <div className="flex h-18 items-center justify-between px-5 text-white bg-gradient-to-b from-black/60 to-transparent">
            <span className="text-xs font-extrabold tracking-widest text-white/70 uppercase">
              {fullscreenIndex + 1} / {galleryKeys.length} · {businessName}
            </span>
            <button
              onClick={() => setFullscreenIndex(null)}
              className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white/90 hover:bg-white/20 hover:text-white transition-all active:scale-90"
              aria-label="Galéria bezárása"
            >
              <Icon name="close" size={20} />
            </button>
          </div>

          {/* Main image container */}
          <div className="relative flex-1 p-4 flex items-center justify-center overflow-hidden">
            {/* Left navigation arrow */}
            <button
              onClick={handlePrev}
              className="absolute left-4 z-10 grid h-13 w-13 place-items-center rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20 transition-all active:scale-90 shadow-lg border border-white/5"
              aria-label="Előző kép"
            >
              <Icon name="arrowLeft" size={24} strokeWidth={2.4} />
            </button>
            
            {/* Elegant outer wrapper with dynamic transition effect */}
            <div className="h-full w-full max-w-5xl max-h-[75vh] flex items-center justify-center relative">
              <img
                key={`gallery-${fullscreenIndex}`}
                src={mediaImageUrl(galleryKeys[fullscreenIndex], { width: 1280, fit: "scale-down" })!}
                alt={`${businessName} nagyított kép`}
                className={cn(
                  "max-h-full max-w-full rounded-2xl object-contain shadow-2xl border border-white/5 select-none",
                  direction === "none" && "animate-kinti-scale-up",
                  direction === "left" && "animate-kinti-slide-left",
                  direction === "right" && "animate-kinti-slide-right"
                )}
                decoding="async"
              />
            </div>

            {/* Right navigation arrow */}
            <button
              onClick={handleNext}
              className="absolute right-4 z-10 grid h-13 w-13 place-items-center rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20 transition-all active:scale-90 shadow-lg border border-white/5"
              aria-label="Következő kép"
            >
              <Icon name="arrowRight" size={24} strokeWidth={2.4} />
            </button>
          </div>

          {/* Thumbnails at bottom (sleek carousel) */}
          <div className="flex h-24 items-center justify-center gap-3 overflow-x-auto bg-black/60 px-5 pb-safe pt-3.5 border-t border-white/5">
            {galleryKeys.map((key, i) => (
              <button
                key={`thumb-${key}`}
                onClick={() => selectIndex(i)}
                className={cn(
                  "h-14 w-14 shrink-0 overflow-hidden rounded-[12px] transition-all duration-300",
                  i === fullscreenIndex 
                    ? "ring-2 ring-primary scale-110 opacity-100 shadow-md" 
                    : "opacity-40 hover:opacity-100 hover:scale-105"
                )}
              >
                <img
                  src={mediaImageUrl(key, { width: 120 })!}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

