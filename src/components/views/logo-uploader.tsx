"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui";
import { mediaUrl } from "@/lib/media";
import { cn } from "@/lib/cn";

/**
 * Liquid Glass logó-feltöltő — három lépés egy felhasználói klikkre:
 *
 *   1) POST /api/owner/media-upload  → presigned PUT URL (5 percig él)
 *   2) PUT <uploadUrl>               → közvetlenül az R2-be, content-type-pal
 *   3) POST /api/owner/media-commit  → D1-mentés (logo_key)
 *
 * A kliens NEM lát R2-titkot, nincs MEDIA-binding a böngészőben — csak a
 * presigned URL-t, ami időhatáros és csak erre az egy kulcsra érvényes.
 *
 * Helyi-dev figyelmeztetés: a `next dev` MEDIA bindingje a Miniflare-ben él,
 * a presigned URL viszont a VALÓDI R2-höz vezet (account-id.r2.cloudflarestorage.com).
 * Lokálban tehát a feltöltés a valódi R2-be megy; a commit lépéshez is a valódi
 * R2 binding kell — fejlesztéskor a `.dev.vars`-ban érdemes a remote bucketet
 * használni (lásd a doksiban).
 */
export interface LogoUploaderProps {
  currentKey: string | null;
  /** Csak megjelenítéshez — a CSS-gradiens, ha nincs még feltöltött kép. */
  fallbackGradient?: string | null;
}

type Phase = "idle" | "preparing" | "uploading" | "committing" | "done" | "error";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

export function LogoUploader({ currentKey, fallbackGradient }: LogoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState<string | null>(currentKey);

  const imageUrl = mediaUrl(previewKey);
  const busy = phase === "preparing" || phase === "uploading" || phase === "committing";

  async function handleFile(file: File) {
    setError(null);
    if (file.size > MAX_BYTES) {
      setError("A fájl mérete max. 2 MB lehet.");
      setPhase("error");
      return;
    }
    if (!ACCEPT.split(",").includes(file.type)) {
      setError("Csak JPEG, PNG, WebP vagy GIF tölthető fel.");
      setPhase("error");
      return;
    }

    try {
      // 1) presigned URL kérés ---------------------------------------------
      setPhase("preparing");
      setProgress(5);
      const presignRes = await fetch("/api/owner/media-upload", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ contentType: file.type }),
      });
      if (!presignRes.ok) {
        throw new Error(((await presignRes.json().catch(() => ({}))) as { error?: string }).error ?? "Presign hiba.");
      }
      const { uploadUrl, key } = (await presignRes.json()) as { uploadUrl: string; key: string };

      // 2) PUT az R2-be — XHR a tényleges progress miatt -------------------
      setPhase("uploading");
      await xhrPut(uploadUrl, file, (pct) => setProgress(10 + Math.round(pct * 0.8)));

      // 3) D1 commit --------------------------------------------------------
      setPhase("committing");
      setProgress(95);
      const commitRes = await fetch("/api/owner/media-commit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key }),
      });
      if (!commitRes.ok) {
        throw new Error(((await commitRes.json().catch(() => ({}))) as { error?: string }).error ?? "Mentés hiba.");
      }

      setPreviewKey(key);
      setProgress(100);
      setPhase("done");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ismeretlen hiba.";
      setError(message);
      setPhase("error");
    }
  }

  return (
    <div className="rounded-card border border-line bg-surface p-4 shadow-card">
      <div className="flex items-center gap-3">
        <div
          className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[16px] border border-line bg-primary-soft"
          style={!imageUrl && fallbackGradient ? { background: fallbackGradient } : undefined}
        >
          {imageUrl && (
            // Az R2 binding immutable URL-en szolgálja ki — biztonságos a böngésző cache-nek.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="A vállalkozás logója" className="h-full w-full object-cover" />
          )}
          {busy && (
            <div className="absolute inset-0 grid place-items-center bg-black/30 text-white">
              <Icon name="arrowUp" size={20} strokeWidth={2.2} className="animate-pulse" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-[13.5px] font-extrabold tracking-tight text-ink">Logó / borítókép</div>
          <div className="mt-0.5 text-[11.5px] text-ink-muted">
            JPEG, PNG, WebP vagy GIF · max. 2 MB
          </div>
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "glass inline-flex items-center gap-1.5 rounded-pill px-3.5 py-2 text-[12.5px] font-bold tracking-[-0.01em] text-ink transition active:scale-[0.98]",
            busy && "opacity-60",
          )}
        >
          <Icon name="arrowUp" size={14} strokeWidth={2.4} className="text-primary" />
          {busy ? phaseLabel(phase) : imageUrl ? "Csere" : "Feltöltés"}
        </button>
      </div>

      {/* progress sáv (csak feltöltés alatt látszik) */}
      {busy && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-primary-soft">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {phase === "done" && !error && (
        <p className="mt-2 inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-success">
          <Icon name="check" size={12} strokeWidth={2.4} /> Mentve — az új logó már megjelenik a profilon.
        </p>
      )}
      {error && (
        <p className="mt-2 inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-accent">
          <Icon name="close" size={12} strokeWidth={2.4} /> {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = ""; // ugyanazt a fájlt is lehessen újra választani
          if (f) handleFile(f);
        }}
      />
    </div>
  );
}

function phaseLabel(p: Phase): string {
  switch (p) {
    case "preparing":
      return "Előkészítés…";
    case "uploading":
      return "Feltöltés…";
    case "committing":
      return "Mentés…";
    default:
      return "…";
  }
}

/** XHR PUT — `fetch` a böngészőben még nem ad upload-progress eseményt streamre. */
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
