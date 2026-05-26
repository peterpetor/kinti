"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/ui";
import { mediaUrl } from "@/lib/media";
import { compressImage } from "@/lib/compress";
import { cn } from "@/lib/cn";

export interface BulletinImageUploaderProps {
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  maxImages?: number;
}

type Phase = "idle" | "compressing" | "preparing" | "uploading" | "done" | "error";

interface UploadingItem {
  id: string;
  name: string;
  progress: number;
  phase: Phase;
}

export function BulletinImageUploader({
  value,
  onChange,
  maxImages = 3,
}: BulletinImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingItems, setUploadingItems] = useState<UploadingItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Parse existing keys safely
  const currentKeys = (() => {
    if (!value) return [];
    if (value.startsWith("[")) {
      try {
        return JSON.parse(value) as string[];
      } catch {
        return [value];
      }
    }
    return [value];
  })();

  const busy = uploadingItems.some(
    (item) => item.phase === "compressing" || item.phase === "preparing" || item.phase === "uploading",
  );

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    // Ellenőrizzük a darabszámot
    if (currentKeys.length + files.length > maxImages) {
      setError(`Legfeljebb ${maxImages} képet tölthetsz fel hirdetésenként.`);
      return;
    }

    const acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    // Upload files sequentially or in parallel
    for (const file of files) {
      if (!acceptedTypes.includes(file.type)) {
        setError(`Nem támogatott fájlformátum (${file.name}). Csak JPEG, PNG, WebP vagy GIF tölthető fel.`);
        continue;
      }

      const itemId = Math.random().toString(36).substring(2, 9);
      const newItem: UploadingItem = {
        id: itemId,
        name: file.name,
        progress: 0,
        phase: "compressing",
      };

      setUploadingItems((prev) => [...prev, newItem]);

      try {
        // 1) Tömörítés a kliens oldalon (nagyon gyors Canvas alapú)
        const compressedBlob = await compressImage(file, 1200, 0.75);

        setUploadingItems((prev) =>
          prev.map((item) => (item.id === itemId ? { ...item, phase: "preparing", progress: 20 } : item)),
        );

        // 2) Aláírt URL kérése a szervertől
        const presignRes = await fetch("/api/bulletin/media-upload", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ contentType: file.type }),
        });

        if (!presignRes.ok) {
          throw new Error("Nem sikerült előkészíteni a feltöltést.");
        }

        const { uploadUrl, key } = (await presignRes.json()) as { uploadUrl: string; key: string };

        // 3) Feltöltés közvetlenül az R2 bucketbe XHR segítségével (a folyamatjelző miatt)
        setUploadingItems((prev) =>
          prev.map((item) => (item.id === itemId ? { ...item, phase: "uploading", progress: 30 } : item)),
        );

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", uploadUrl, true);
          xhr.setRequestHeader("content-type", file.type);

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const pct = Math.round((e.loaded / e.total) * 70); // 30% -> 100%
              setUploadingItems((prev) =>
                prev.map((item) => (item.id === itemId ? { ...item, progress: 30 + pct } : item)),
              );
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve();
            else reject(new Error("Hiba történt a fájl feltöltésekor."));
          };

          xhr.onerror = () => reject(new Error("Hálózati hiba a feltöltés során."));
          xhr.send(compressedBlob);
        });

        // 4) Hozzáadás a sikeresen feltöltött képek listájához
        const updatedKeys = [...currentKeys, key];
        onChange(JSON.stringify(updatedKeys));

        setUploadingItems((prev) => prev.filter((item) => item.id !== itemId));
      } catch (err) {
        setUploadingItems((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? { ...item, phase: "error", progress: 100 }
              : item,
          ),
        );
        setError(err instanceof Error ? err.message : "Sikertelen feltöltés.");
        // Késleltetett törlés a hibásakról, hogy a felhasználó lássa
        setTimeout(() => {
          setUploadingItems((prev) => prev.filter((item) => item.id !== itemId));
        }, 3000);
      }
    }
  }

  function handleRemoveKey(keyToRemove: string) {
    const updatedKeys = currentKeys.filter((k) => k !== keyToRemove);
    onChange(updatedKeys.length > 0 ? JSON.stringify(updatedKeys) : null);
  }

  return (
    <div className="space-y-3">
      {/* Cím / infó */}
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-bold text-ink-muted">
          KÉPEK ({currentKeys.length} / {maxImages})
        </span>
        <span className="text-[10px] text-ink-faint">Max. 3 kép · Automata tömörítés</span>
      </div>

      {/* Grid elrendezés a meglévő képeknek + a feltöltő gombnak */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Feltöltött képek */}
        {currentKeys.map((key) => {
          const url = mediaUrl(key);
          return (
            <div
              key={key}
              className="relative aspect-square overflow-hidden rounded-[16px] border border-line bg-surface-alt shadow-card"
            >
              {url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={url}
                  alt="Hirdetés képe"
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              )}
              {/* Törlés gomb */}
              <button
                type="button"
                onClick={() => handleRemoveKey(key)}
                className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-black/80 active:scale-90"
                aria-label="Kép törlése"
              >
                <Icon name="close" size={12} strokeWidth={2.8} />
              </button>
            </div>
          );
        })}

        {/* Éppen feltöltés alatt álló elemek */}
        {uploadingItems.map((item) => (
          <div
            key={item.id}
            className="relative aspect-square overflow-hidden rounded-[16px] border border-line bg-surface-alt flex flex-col items-center justify-center p-2 text-center"
          >
            <div className="relative h-7 w-7 flex items-center justify-center text-primary">
              <Icon
                name={item.phase === "compressing" ? "clock" : "arrowUp"}
                size={18}
                strokeWidth={2.4}
                className={cn(item.phase === "uploading" && "animate-bounce")}
              />
            </div>
            <span className="mt-1 text-[9px] font-bold text-ink-muted truncate w-full px-1">
              {item.phase === "compressing" ? "Tömörítés…" : `${item.progress}%`}
            </span>
            {/* Kis folyamatjelző csík az alján */}
            <div className="absolute bottom-0 left-0 h-1 bg-primary transition-[width] duration-150" style={{ width: `${item.progress}%` }} />
          </div>
        ))}

        {/* Feltöltés indító gomb */}
        {currentKeys.length < maxImages && !busy && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square flex flex-col items-center justify-center rounded-[16px] border border-dashed border-line bg-surface-alt text-ink-muted hover:bg-surface transition-all active:scale-95 shadow-sm"
          >
            <div className="grid h-8 w-8 place-items-center rounded-full bg-primary-soft text-primary mb-1">
              <Icon name="plus" size={16} strokeWidth={2.8} />
            </div>
            <span className="text-[10px] font-extrabold tracking-tight">Kép hozzáadása</span>
          </button>
        )}
      </div>

      {error && (
        <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-accent" role="alert">
          <Icon name="close" size={12} strokeWidth={2.4} /> {error}
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}
