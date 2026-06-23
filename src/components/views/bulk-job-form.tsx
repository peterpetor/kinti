"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui";
import { getRegions, regionLabel } from "@/lib/regions";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY } from "@/lib/countries";
import { JOB_CATEGORIES } from "@/lib/job-categories";

interface Row {
  title: string;
  category: string;
  cantonCode: string;
  location: string;
  employmentType: string;
  salaryMin: string;
  salaryMax: string;
  description: string;
}

const MAX_ROWS = 10;
const emptyRow = (): Row => ({
  title: "", category: "", cantonCode: "", location: "",
  employmentType: "full-time", salaryMin: "", salaryMax: "", description: "",
});

const inputCls =
  "w-full rounded-[10px] border border-line bg-surface-alt px-3 py-2 text-[13.5px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary/30";

export function BulkJobForm() {
  const router = useRouter();
  // Ország-tudatos: a régió-lista, a pénznem és a város-példa a választott országhoz.
  const [prefCountry] = usePreferredCountry();
  const country = prefCountry ?? DEFAULT_COUNTRY;
  const isAT = country === "AT";
  const regions = getRegions(country);
  const cur = isAT ? "EUR" : "CHF";
  const [rows, setRows] = useState<Row[]>([emptyRow(), emptyRow(), emptyRow()]);
  const [legalAttested, setLegalAttested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ created: number; errors: { index: number; error: string }[] } | null>(null);

  function update(i: number, field: keyof Row, value: string) {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  }
  function addRow() {
    setRows((rs) => (rs.length >= MAX_ROWS ? rs : [...rs, emptyRow()]));
  }
  function removeRow(i: number) {
    setRows((rs) => (rs.length <= 1 ? rs : rs.filter((_, idx) => idx !== i)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const jobs = rows
        .filter((r) => r.title.trim() || r.description.trim())
        .map((r) => ({
          title: r.title,
          category: r.category,
          cantonCode: r.cantonCode,
          location: r.location,
          employmentType: r.employmentType,
          salaryMin: r.salaryMin ? parseInt(r.salaryMin, 10) : null,
          salaryMax: r.salaryMax ? parseInt(r.salaryMax, 10) : null,
          description: r.description,
        }));

      const res = await fetch("/api/employer/jobs/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ legalAttested, jobs, country }),
      });
      const data = (await res.json()) as { error?: string; created?: number; errors?: { index: number; error: string }[] };
      if (!res.ok) throw new Error(data.error || "Hiba történt a feladás során.");

      setResult({ created: data.created ?? 0, errors: data.errors ?? [] });
      if ((data.created ?? 0) > 0 && (data.errors?.length ?? 0) === 0) {
        router.push("/munkaltato");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hiba történt a feladás során.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-[12px] bg-accent/10 px-4 py-3 text-[13px] font-semibold text-accent">{error}</div>
      )}
      {result && (
        <div className="rounded-[12px] bg-success/10 px-4 py-3 text-[13px] font-semibold text-success">
          {result.created} hirdetés beküldve (jóváhagyásra vár).
          {result.errors.length > 0 && (
            <ul className="mt-1.5 list-disc pl-5 font-medium text-accent">
              {result.errors.map((e) => (
                <li key={e.index}>{e.index + 1}. hirdetés: {e.error}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {rows.map((row, i) => (
        <div key={i} className="rounded-card border border-line bg-surface p-3.5 shadow-card space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wide text-ink-muted">#{i + 1} hirdetés</span>
            {rows.length > 1 && (
              <button type="button" onClick={() => removeRow(i)} className="text-ink-faint hover:text-accent">
                <Icon name="trash" size={14} strokeWidth={2.2} />
              </button>
            )}
          </div>

          <input
            value={row.title}
            onChange={(e) => update(i, "title", e.target.value)}
            className={inputCls}
            placeholder="Pozíció (pl. Pincér)"
          />

          <div className="grid grid-cols-2 gap-2">
            <select value={row.category} onChange={(e) => update(i, "category", e.target.value)} className={inputCls}>
              <option value="">Szakma…</option>
              {JOB_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
              ))}
            </select>
            <select value={row.cantonCode} onChange={(e) => update(i, "cantonCode", e.target.value)} className={inputCls}>
              <option value="">{regionLabel(country)}…</option>
              {regions.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              value={row.location}
              onChange={(e) => update(i, "location", e.target.value)}
              className={inputCls}
              placeholder={isAT ? "Város (pl. Wien)" : "Város (pl. Zürich)"}
            />
            <select value={row.employmentType} onChange={(e) => update(i, "employmentType", e.target.value)} className={inputCls}>
              <option value="full-time">Teljes (100%)</option>
              <option value="part-time">Rész (50-80%)</option>
              <option value="contract">Szerződéses</option>
              <option value="temporary">Ideiglenes</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={row.salaryMin}
              onChange={(e) => update(i, "salaryMin", e.target.value)}
              className={inputCls}
              placeholder={`Bér min (${cur})`}
            />
            <input
              type="number"
              value={row.salaryMax}
              onChange={(e) => update(i, "salaryMax", e.target.value)}
              className={inputCls}
              placeholder={`Bér max (${cur})`}
            />
          </div>

          <textarea
            rows={2}
            value={row.description}
            onChange={(e) => update(i, "description", e.target.value)}
            className={cn(inputCls, "resize-none")}
            placeholder="Rövid leírás (feladatok, elvárások) — min. 20 karakter"
          />
        </div>
      ))}

      {rows.length < MAX_ROWS && (
        <button
          type="button"
          onClick={addRow}
          className="flex w-full items-center justify-center gap-2 rounded-pill border border-dashed border-line bg-surface-alt py-2.5 text-[13px] font-bold text-primary active:scale-[0.98]"
        >
          <Icon name="plus" size={15} strokeWidth={2.6} /> Még egy hirdetés ({rows.length}/{MAX_ROWS})
        </button>
      )}

      <label className="flex items-start gap-2.5 rounded-[12px] border border-line bg-surface-alt px-3.5 py-3">
        <input
          type="checkbox"
          required
          checked={legalAttested}
          onChange={(e) => setLegalAttested(e.target.checked)}
          className="mt-0.5 rounded border-line text-primary focus:ring-primary"
        />
        <span className="text-[12px] leading-snug text-ink-muted">
          <strong className="font-semibold text-ink">Nyilatkozom</strong>, hogy minden fenti hirdetés{" "}
          <strong className="font-semibold text-ink">bejelentett, legális foglalkoztatás</strong> ({isAT ? "SV" : "AHV/SVA"}). A feketemunka hirdetése tilos.
        </span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className={cn(
          "flex h-12 w-full items-center justify-center gap-2 rounded-pill bg-primary text-[15px] font-extrabold text-white shadow-card-hover transition-all active:scale-[0.98]",
          loading && "opacity-60 cursor-not-allowed",
        )}
      >
        {loading ? "Feldolgozás…" : "Összes hirdetés beküldése"}
        {!loading && <Icon name="send" size={16} strokeWidth={2.4} />}
      </button>
    </form>
  );
}
