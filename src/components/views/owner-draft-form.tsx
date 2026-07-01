"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui";
import { getRegions, regionLabel } from "@/lib/regions";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY } from "@/lib/countries";
import { cn } from "@/lib/cn";
import type { Category } from "@/lib/types";

/**
 * Inline draft-form a /profil onboardingről: belépett vállalkozó pár adatból
 * (név + kategória + kanton) azonnal létrehozza a publikus vállalkozói rekordot.
 * A részleteket utána a ProfileEditor-en pótolja.
 */
export function OwnerDraftForm({
  categories,
  initialName = "",
}: {
  categories: Category[];
  /** Előtöltött cégnév (pl. a meglévő Munkáltatói profilból) — adat-újrahasznosítás. */
  initialName?: string;
}) {
  const router = useRouter();
  const [prefCountry] = usePreferredCountry();
  const country = prefCountry ?? DEFAULT_COUNTRY;
  const regions = getRegions(country);
  const [name, setName] = useState(initialName);
  const [categoryId, setCategoryId] = useState("");
  const [cantonCode, setCantonCode] = useState("");
  const [phase, setPhase] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const disabled =
    phase === "submitting" || !name.trim() || !categoryId || !cantonCode;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPhase("submitting");
    try {
      const res = await fetch("/api/owner/draft", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim(), categoryId, cantonCode, country }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Hiba történt. Próbáld újra.");
        setPhase("error");
        return;
      }
      // Sikeres létrehozás → page refresh, hogy a ProfileEditor jelenjen meg.
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hálózati hiba.");
      setPhase("error");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-3 rounded-card border border-line bg-surface p-4 shadow-card"
    >
      <div>
        <label className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
          Vállalkozás neve
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Pl. Kovács Anna Fodrászat"
          maxLength={100}
          className="w-full rounded-[12px] border border-line bg-surface-alt px-3 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
          Kategória
        </label>
        <select
          required
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full rounded-[12px] border border-line bg-surface-alt px-3 py-2.5 text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Válassz kategóriát…</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
          Hol dolgozol?
        </label>
        <select
          required
          value={cantonCode}
          onChange={(e) => setCantonCode(e.target.value)}
          className="w-full rounded-[12px] border border-line bg-surface-alt px-3 py-2.5 text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Melyik {regionLabel(country).toLowerCase()}?</option>
          {regions.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name} ({c.code})
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-[10px] border border-accent/30 bg-accent-soft px-3 py-2 text-[12px] font-semibold text-accent">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={disabled}
        className={cn(
          "flex h-12 w-full items-center justify-center gap-1.5 rounded-pill bg-primary text-[14px] font-extrabold text-white shadow-card-hover transition active:scale-[0.99]",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        {phase === "submitting" ? "Létrehozás…" : "Vállalkozás létrehozása"}
        {phase !== "submitting" && <Icon name="arrowRight" size={14} strokeWidth={2.6} />}
      </button>

      <p className="px-1 text-[11px] leading-snug text-ink-faint">
        A részleteket (cím, telefon, leírás, nyitvatartás, nyelvek, logó) a következő
        lépésben tudod beállítani. A létrehozás azonnali — nincs külön email-megerősítés,
        mert a Clerk fiókod már igazolt.
      </p>
    </form>
  );
}
