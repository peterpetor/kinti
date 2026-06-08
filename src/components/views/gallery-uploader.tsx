"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui";
import { mediaUrl } from "@/lib/media";
import { cn } from "@/lib/cn";
import { compressImage } from "@/lib/compress";

export interface GalleryUploaderProps {
  currentKeys: string[];
  manageToken: string;
}

type Phase = "idle" | "preparing" | "uploading" | "committing" | "done" | "error" | "removing";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_PDF_BYTES = 20 * 1024 * 1024; // 20 MB
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,application/pdf";

export function GalleryUploader({ currentKeys, manageToken }: GalleryUploaderProps) {
  const uploadEndpoint = `/api/business/manage/${manageToken}/gallery-upload`;
  const commitEndpoint = `/api/business/manage/${manageToken}/gallery-commit`;
  const removeEndpoint = `/api/business/manage/${manageToken}/gallery-remove`;

  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const busy = phase === "preparing" || phase === "uploading" || phase === "committing" || phase === "removing";

  async function handleFile(file: File) {
    setError(null);
    if (currentKeys.length >= 10) {
      setError("Maximum 10 fájl tölthető fel.");
      setPhase("error");
      return;
    }

    const isPdf = file.type === "application/pdf";
    const isImage = file.type.startsWith("image/");

    if (!ACCEPT.split(",").includes(file.type)) {
      setError("Csak JPEG, PNG, WebP, GIF vagy PDF tölthető fel.");
      setPhase("error");
      return;
    }
    if (isImage && file.size > MAX_IMAGE_BYTES) {
      setError("A kép mérete max. 10 MB lehet.");
      setPhase("error");
      return;
    }
    if (isPdf && file.size > MAX_PDF_BYTES) {
      setError("A PDF mérete max. 20 MB lehet.");
      setPhase("error");
      return;
    }

    try {
      // 1) presign
      setPhase("preparing");
      setProgress(5);

      let fileToUpload = file;
      if (isImage) {
        const blob = await compressImage(file, 1920, 0.8);
        fileToUpload = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", { type: blob.type });
      }

      const presignRes = await fetch(uploadEndpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ 
          contentType: fileToUpload.type,
          contentLength: fileToUpload.size 
        }),
      });
      if (!presignRes.ok) {
        throw new Error(((await presignRes.json().catch(() => ({}))) as { error?: string }).error ?? "Presign hiba.");
      }
      const { uploadUrl, key } = (await presignRes.json()) as { uploadUrl: string; key: string };

      // 2) upload
      setPhase("uploading");
      await xhrPut(uploadUrl, fileToUpload, (pct) => setProgress(10 + Math.round(pct * 0.8)));

      // 3) commit
      setPhase("committing");
      setProgress(95);
      const commitRes = await fetch(commitEndpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key }),
      });
      if (!commitRes.ok) {
        throw new Error(((await commitRes.json().catch(() => ({}))) as { error?: string }).error ?? "Mentés hiba.");
      }

      setProgress(100);
      setPhase("done");
      router.refresh();
      setTimeout(() => setPhase("idle"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ismeretlen hiba.");
      setPhase("error");
    }
  }

  async function removeImage(key: string) {
    if (!confirm("Biztosan törlöd ezt a képet a galériából?")) return;
    setPhase("removing");
    setError(null);
    try {
      const res = await fetch(removeEndpoint, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key }),
      });
      if (!res.ok) {
        throw new Error("Törlés sikertelen.");
      }
      setPhase("done");
      router.refresh();
      setTimeout(() => setPhase("idle"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hálózati hiba.");
      setPhase("error");
    }
  }

  return (
    <div className="rounded-card border border-line bg-surface p-4 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[13.5px] font-extrabold tracking-tight text-ink">Vizuális portfólió</div>
          <div className="mt-0.5 text-[11.5px] text-ink-muted">
            Mutasd meg a munkáidat! Max. 10 fájl, 10 MB/kép vagy 20 MB/PDF.
          </div>
        </div>
        <button
          type="button"
          disabled={busy || currentKeys.length >= 10}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "glass inline-flex items-center gap-1.5 rounded-pill px-3.5 py-2 text-[12.5px] font-bold tracking-[-0.01em] text-ink transition active:scale-[0.98]",
            (busy || currentKeys.length >= 10) && "opacity-60 cursor-not-allowed"
          )}
        >
          <Icon name="plus" size={14} strokeWidth={2.4} className="text-primary" />
          Fájl hozzáadása
        </button>
      </div>

      {busy && phase !== "removing" && (
        <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-primary-soft">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {error && (
        <p className="mb-3 inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-accent">
          <Icon name="close" size={12} strokeWidth={2.4} /> {error}
        </p>
      )}

      {currentKeys.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {currentKeys.map((key) => {
            const url = mediaUrl(key);
            if (!url) return null;
            return (
              <div key={key} className="group relative h-20 w-20 overflow-hidden rounded-[12px] border border-line shadow-sm bg-surface-alt">
                {key.toLowerCase().endsWith(".pdf") ? (
                  <div className="h-full w-full flex flex-col items-center justify-center text-ink-muted p-2">
                    <Icon name="document" size={24} />
                    <span className="text-[10px] mt-1 font-semibold">PDF</span>
                  </div>
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={url} alt="Galéria fájl" className="h-full w-full object-cover" />
                )}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => removeImage(key)}
                  className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-accent focus:opacity-100 group-hover:opacity-100 disabled:pointer-events-none"
                  aria-label="Fájl törlése"
                >
                  <Icon name="close" size={14} strokeWidth={2.6} />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-line bg-surface-alt px-4 py-6 text-center">
          <Icon name="eye" size={24} className="mx-auto mb-2 text-ink-faint" />
          <p className="text-[12.5px] font-medium text-ink-muted">Még nincsenek fájlok a galériádban.</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) handleFile(f);
        }}
      />
    </div>
  );
}

function xhrPut(url: string, file: File, onProgress: (fraction: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.setRequestHeader("content-type", file.type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`R2 PUT hiba: ${xhr.status} ${xhr.statusText}`));
    };
    xhr.onerror = () => reject(new Error("Hálózati hiba az R2 feltöltés alatt."));
    xhr.send(file);
  });
}
