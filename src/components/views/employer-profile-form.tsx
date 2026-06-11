"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { type Employer } from "@/lib/types";

export function EmployerProfileForm({ employer }: { employer: Employer }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    companyName: employer.companyName,
    contactEmail: employer.contactEmail,
    website: employer.website || "",
    companyUid: employer.companyUid || "",
    description: employer.description || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/employer/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Hiba történt a mentés során.");
      }

      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hiba történt a mentés során.");
    } finally {
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
      
      {success && (
        <div className="rounded-[12px] bg-success/10 px-4 py-3 text-[13px] font-semibold text-success">
          A módosítások sikeresen mentve.
        </div>
      )}

      <div>
        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-ink-muted">
          Cégnév *
        </label>
        <input
          type="text"
          required
          value={form.companyName}
          onChange={(e) => setForm({ ...form, companyName: e.target.value })}
          className={inputCls}
        />
      </div>

      <div>
        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-ink-muted">
          Kapcsolattartó Email *
        </label>
        <input
          type="email"
          required
          value={form.contactEmail}
          onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
          className={inputCls}
        />
      </div>

      <div>
        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-ink-muted">
          Weboldal
        </label>
        <input
          type="url"
          value={form.website}
          onChange={(e) => setForm({ ...form, website: e.target.value })}
          className={inputCls}
        />
      </div>

      <div>
        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-ink-muted">
          Cég-azonosító (UID)
          {employer.verified && (
            <span className="ml-2 inline-flex items-center gap-0.5 rounded-pill bg-success/15 px-1.5 py-0.5 text-[9.5px] font-bold text-success">
              Hiteles
            </span>
          )}
        </label>
        <input
          type="text"
          value={form.companyUid}
          onChange={(e) => setForm({ ...form, companyUid: e.target.value })}
          className={inputCls}
          placeholder="CHE-123.456.789"
        />
        <p className="mt-1 text-[10.5px] text-ink-faint">
          Ellenőrzött cég-azonosító esetén „Hiteles cég" jelzést kapsz. Az UID módosítása újra-ellenőrzést igényel.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-ink-muted">
          Rövid bemutatkozás
        </label>
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className={cn(inputCls, "resize-none")}
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className={cn(
            "flex h-12 w-full items-center justify-center gap-2 rounded-pill bg-primary text-[15px] font-extrabold text-white shadow-card-hover transition-all active:scale-[0.98]",
            loading && "opacity-60 cursor-not-allowed"
          )}
        >
          {loading ? "Mentés folyamatban..." : "Mentés"}
        </button>
      </div>
    </form>
  );
}
