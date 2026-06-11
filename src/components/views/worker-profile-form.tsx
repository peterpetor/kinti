"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui";
import { CANTONS } from "@/lib/cantons";
import { JOB_CATEGORIES } from "@/lib/job-categories";

export interface WorkerProfileInitial {
  fullName: string;
  email: string;
  phone: string;
  cantonCode: string;
  category: string;
  searchable: boolean;
  hasCv: boolean;
}

const MAX_CV_BYTES = 10 * 1024 * 1024;

export function WorkerProfileForm({ initial }: { initial: WorkerProfileInitial }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    fullName: initial.fullName,
    email: initial.email,
    phone: initial.phone,
    cantonCode: initial.cantonCode,
    category: initial.category,
    searchable: initial.searchable,
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /** A kiválasztott PDF feltöltése R2-be presigned URL-lel; visszaadja a kulcsot. */
  async function uploadCv(file: File): Promise<string> {
    const presignRes = await fetch("/api/worker/cv-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentLength: file.size }),
    });
    const presign = (await presignRes.json()) as { uploadUrl?: string; key?: string; error?: string };
    if (!presignRes.ok || !presign.uploadUrl || !presign.key) {
      throw new Error(presign.error || "A CV feltöltése nem sikerült.");
    }
    const put = await fetch(presign.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/pdf" },
      body: file,
    });
    if (!put.ok) throw new Error("A CV feltöltése az R2-be nem sikerült.");
    return presign.key;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      let cvKey: string | null = null;
      if (cvFile) cvKey = await uploadCv(cvFile);

      const res = await fetch("/api/worker/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone || null,
          cantonCode: form.cantonCode || null,
          category: form.category || null,
          searchable: form.searchable,
          layer3OptIn: form.searchable,
          ...(cvKey ? { cvKey } : {}),
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "A mentés nem sikerült.");

      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hiba történt a mentés során.");
    } finally {
      setBusy(false);
    }
  }

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const f = e.target.files?.[0] ?? null;
    if (f && f.type !== "application/pdf") {
      setError("Csak PDF formátumú CV tölthető fel.");
      return;
    }
    if (f && f.size > MAX_CV_BYTES) {
      setError("A CV túl nagy. Maximum 10 MB.");
      return;
    }
    setCvFile(f);
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center animate-fade-up">
        <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-success/15 text-success">
          <Icon name="check" size={24} strokeWidth={2.4} />
        </div>
        <h3 className="text-[18px] font-extrabold text-ink">Profil mentve!</h3>
        <p className="mt-2 text-[14px] text-ink-muted px-4">
          {form.searchable
            ? "A svájci magyar munkáltatók megtalálhatnak a rendszerben."
            : "A profilod elmentve. A láthatóság jelenleg kikapcsolva — bekapcsolhatod bármikor."}
        </p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="mt-6 rounded-pill border border-line bg-surface-alt px-5 py-2 text-[13.5px] font-bold text-ink transition-colors hover:bg-line"
        >
          Profil szerkesztése
        </button>
      </div>
    );
  }

  const inputCls =
    "h-11 w-full rounded-[12px] border border-line bg-surface-alt px-3 text-[14px] text-ink focus:border-primary/50 focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-[12px] bg-accent/10 px-4 py-3 text-[13px] font-semibold text-accent">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-[12.5px] font-bold text-ink">Teljes név *</label>
        <input
          required
          type="text"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          className={inputCls}
          placeholder="Pl. Kovács Gábor"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-[12.5px] font-bold text-ink">E-mail *</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputCls}
            placeholder="E-mail cím"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[12.5px] font-bold text-ink">Telefon</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={inputCls}
            placeholder="+41 79 123 45 67"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-[12.5px] font-bold text-ink">Szakma</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className={inputCls}
          >
            <option value="">Nincs megadva</option>
            {JOB_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-[12.5px] font-bold text-ink">Kanton</label>
          <select
            value={form.cantonCode}
            onChange={(e) => setForm({ ...form, cantonCode: e.target.value })}
            className={inputCls}
          >
            <option value="">Nincs megadva</option>
            {CANTONS.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-[12.5px] font-bold text-ink">
          CV / Önéletrajz (PDF, max 10MB)
        </label>
        <input ref={fileRef} type="file" accept="application/pdf" onChange={onPickFile} className="hidden" />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex h-20 w-full cursor-pointer items-center justify-center rounded-[12px] border-2 border-dashed border-line bg-surface-alt transition hover:border-primary/30 hover:bg-primary/5"
        >
          <div className="flex items-center gap-2 text-[13px] font-semibold text-primary">
            <Icon name="upload" size={16} strokeWidth={2.2} />
            <span>
              {cvFile ? cvFile.name : initial.hasCv ? "CV feltöltve — kattints a cseréhez" : "Kattints a feltöltéshez"}
            </span>
          </div>
        </button>
      </div>

      <div className="pt-2">
        <label className="flex items-start gap-2.5">
          <input
            type="checkbox"
            checked={form.searchable}
            onChange={(e) => setForm({ ...form, searchable: e.target.checked })}
            className="mt-0.5 rounded border-line text-primary focus:ring-primary"
          />
          <span className="text-[12.5px] leading-snug text-ink-muted">
            <strong className="font-semibold text-ink">Láthatóság:</strong> Hozzájárulok, hogy a profilom kereshető legyen a kinti.app munkáltatói hálózatában.
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={busy}
        className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-pill bg-primary text-[14.5px] font-extrabold tracking-[-0.01em] text-white transition active:scale-[0.98] disabled:opacity-50"
      >
        {busy ? (
          <span className="animate-pulse">{cvFile ? "Feltöltés és mentés…" : "Mentés…"}</span>
        ) : (
          <>
            <Icon name="check" size={16} strokeWidth={2.4} /> Profil mentése
          </>
        )}
      </button>
    </form>
  );
}
