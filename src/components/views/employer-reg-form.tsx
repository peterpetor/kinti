"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";

export function EmployerRegForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    companyName: "",
    contactEmail: "",
    website: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/employer/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json() as any;
      if (!res.ok) {
        throw new Error(data.error || "Hiba történt a mentés során.");
      }

      // A fiók önmagában még nem hirdetés. Ha az AI azonnal jóváhagyta
      // (status === 1), egyből a hirdetésfeladó űrlapra visszük, hogy a
      // munkáltató ne "ragadjon be" egy üres profilnál. Ha kézi ellenőrzésre
      // vár (review → 0), a dashboardon látja a függőben-üzenetet.
      router.push(data.status === 1 ? "/munkaltato/uj-hirdetes" : "/munkaltato");
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
          Cégnév *
        </label>
        <input
          type="text"
          required
          value={form.companyName}
          onChange={(e) => setForm({ ...form, companyName: e.target.value })}
          className={inputCls}
          placeholder="Pl. Kinti AG"
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
          placeholder="hr@ceged.ch"
        />
        <p className="mt-1 text-[10.5px] text-ink-faint">
          Ezen az emailen keresztül küldjük a számlákat és az értesítéseket.
        </p>
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
          placeholder="https://ceged.ch"
        />
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
          placeholder="Mivel foglalkoztok? Milyen a vállalati kultúra?"
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
          {loading ? "Mentés folyamatban..." : "Fiók létrehozása"}
        </button>
      </div>
    </form>
  );
}
