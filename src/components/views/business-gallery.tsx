"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";
import { mediaUrl } from "@/lib/media";
import { cn } from "@/lib/cn";

interface Props {
  galleryKeys: string[];
  businessName: string;
}

export function BusinessGallery({ galleryKeys, businessName }: Props) {
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);

  if (!galleryKeys || galleryKeys.length === 0) return null;

  return (
    <section className="mt-6">
      <h2 className="mb-3 text-[14px] font-extrabold uppercase tracking-widest text-ink-muted">
        Vizuális Portfólió
      </h2>
      
      {/* Scroll-snap gallery (horizontális) */}
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-[18px] px-[18px]">
        {galleryKeys.map((key, i) => {
          const url = mediaUrl(key);
          if (!url) return null;
          return (
            <button
              key={key}
              onClick={() => setFullscreenIndex(i)}
              className="relative h-40 w-40 shrink-0 snap-center overflow-hidden rounded-[16px] bg-surface-alt outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`${businessName} portfólió kép ${i + 1}`}
                className="h-full w-full object-cover transition-transform hover:scale-105"
                decoding="async"
                loading="lazy"
              />
            </button>
          );
        })}
      </div>

      {/* Fullscreen modal */}
      {fullscreenIndex !== null && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-sm">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-4 text-white">
            <span className="text-[13px] font-bold opacity-70">
              {fullscreenIndex + 1} / {galleryKeys.length}
            </span>
            <button
              onClick={() => setFullscreenIndex(null)}
              className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20 transition active:scale-95"
            >
              <Icon name="close" size={24} />
            </button>
          </div>

          {/* Main image */}
          <div className="relative flex-1 p-4 flex items-center justify-center overflow-hidden">
            <button
              onClick={() => setFullscreenIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : galleryKeys.length - 1))}
              className="absolute left-2 top-1/2 -translate-y-1/2 grid h-12 w-12 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition"
            >
              <Icon name="arrowLeft" size={28} />
            </button>
            
            <div className="h-full w-full flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mediaUrl(galleryKeys[fullscreenIndex])!}
                alt={`${businessName} nagyított kép`}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <button
              onClick={() => setFullscreenIndex((prev) => (prev !== null && prev < galleryKeys.length - 1 ? prev + 1 : 0))}
              className="absolute right-2 top-1/2 -translate-y-1/2 grid h-12 w-12 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition"
            >
              <Icon name="arrowRight" size={28} />
            </button>
          </div>

          {/* Thumbnails at bottom */}
          <div className="flex h-20 items-center justify-center gap-2 overflow-x-auto bg-black/50 px-4 pb-safe pt-2">
            {galleryKeys.map((key, i) => (
              <button
                key={`thumb-${key}`}
                onClick={() => setFullscreenIndex(i)}
                className={cn(
                  "h-12 w-12 shrink-0 overflow-hidden rounded-[8px] transition-all",
                  i === fullscreenIndex ? "ring-2 ring-white opacity-100 scale-105" : "opacity-40 hover:opacity-100"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mediaUrl(key)!}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
