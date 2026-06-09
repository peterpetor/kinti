"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui";
import { CANTONS } from "@/lib/cantons";
import { JOB_CATEGORIES } from "@/lib/job-categories";

export interface JobFormInitial {
  title?: string;
  location?: string;
  cantonCode?: string;
  category?: string;
  employmentType?: string;
  salaryMin?: string;
  salaryMax?: string;
  currency?: string;
  description?: string;
  requirements?: string;
}

/**
 * Hirdetésfeladó / -szerkesztő űrlap. `jobId` nélkül új hirdetést készít
 * (POST), megadott `jobId`-vel a meglévőt szerkeszti (PATCH).
 */
export function JobPostForm({ jobId, initial }: { jobId?: string; initial?: JobFormInitial } = {}) {
  const router = useRouter();
  const isEdit = !!jobId;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    location: "",
    cantonCode: "",
    category: "",
    employmentType: "full-time",
    salaryMin: "",
    salaryMax: "",
    currency: "CHF",
    description: "",
    requirements: "",
    ...initial,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...form,
        salaryMin: form.salaryMin ? parseInt(form.salaryMin, 10) : null,
        salaryMax: form.salaryMax ? parseInt(form.salaryMax, 10) : null,
      };

      const res = await fetch(isEdit ? `/api/employer/jobs/${jobId}` : "/api/employer/jobs", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json() as any;
      if (!res.ok) {
        throw new Error(data.error || "Hiba történt a mentés során.");
      }

      router.push("/munkaltato");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const inputCls = "w-full rounded-[12px] border border-line bg-surface-alt px-3 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-[12px] bg-accent/10 px-4 py-3 text-[13px] font-semibold text-accent">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-ink-muted">
          Pozíció megnevezése *
        </label>
        <input
          type="text"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className={inputCls}
          placeholder="Pl. Tapétázó / Festő szakember"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-ink-muted">
            Szakma *
          </label>
          <select
            required
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className={inputCls}
          >
            <option value="" disabled>Válassz szakmát…</option>
            {JOB_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-ink-muted">
            Kanton *
          </label>
          <select
            required
            value={form.cantonCode}
            onChange={(e) => setForm({ ...form, cantonCode: e.target.value })}
            className={inputCls}
          >
            <option value="" disabled>Válassz kantont…</option>
            {CANTONS.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-ink-muted">
            Munkavégzés helye (város) *
          </label>
          <input
            type="text"
            required
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className={inputCls}
            placeholder="Pl. Zürich"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-ink-muted">
            Foglalkoztatás jellege
          </label>
          <select
            value={form.employmentType}
            onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
            className={inputCls}
          >
            <option value="full-time">Teljes munkaidő (100%)</option>
            <option value="part-time">Részmunkaidő (50-80%)</option>
            <option value="contract">Szerződéses / Projekt</option>
            <option value="temporary">Ideiglenes (Temporär)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-ink-muted">
            Bérsáv - Min
          </label>
          <input
            type="number"
            value={form.salaryMin}
            onChange={(e) => setForm({ ...form, salaryMin: e.target.value })}
            className={inputCls}
            placeholder="5000"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-ink-muted">
            Bérsáv - Max
          </label>
          <input
            type="number"
            value={form.salaryMax}
            onChange={(e) => setForm({ ...form, salaryMax: e.target.value })}
            className={inputCls}
            placeholder="6500"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-ink-muted">
            Pénznem
          </label>
          <select
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
            className={inputCls}
          >
            <option value="CHF">CHF (Bruttó/hó)</option>
            <option value="CHF_HOUR">CHF (Bruttó/óra)</option>
            <option value="EUR">EUR (Bruttó/hó)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-ink-muted">
          Feladatok és leírás *
        </label>
        <textarea
          required
          rows={5}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className={cn(inputCls, "resize-none")}
          placeholder="Milyen feladatokat kell ellátni? Milyen a munkakörnyezet?"
        />
      </div>

      <div>
        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-ink-muted">
          Elvárások (opcionális)
        </label>
        <textarea
          rows={3}
          value={form.requirements}
          onChange={(e) => setForm({ ...form, requirements: e.target.value })}
          className={cn(inputCls, "resize-none")}
          placeholder="Nyelvtudás, végzettség, tapasztalat..."
        />
      </div>

      <div className="pt-3">
        <button
          type="submit"
          disabled={loading}
          className={cn(
            "flex h-12 w-full items-center justify-center gap-2 rounded-pill bg-primary text-[15px] font-extrabold text-white shadow-card-hover transition-all active:scale-[0.98]",
            loading && "opacity-60 cursor-not-allowed"
          )}
        >
          {loading ? "Feldolgozás..." : isEdit ? "Módosítások mentése" : "Álláshirdetés beküldése"}
          {!loading && <Icon name="send" size={16} strokeWidth={2.4} />}
        </button>
        <p className="mt-2 text-center text-[11px] text-ink-faint">
          {isEdit
            ? "Szerkesztés után a hirdetés újra adminisztrátori jóváhagyásra kerül."
            : "Beküldés után a hirdetés adminisztrátori jóváhagyásra kerül."}
        </p>
      </div>
    </form>
  );
}
