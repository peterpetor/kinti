"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Business } from "@/lib/types";

const ALL_LANGS = ["Magyar", "Deutsch", "Français", "Italiano", "English"];

/**
 * Email-only business manager: token-alapú szerkesztés/törlés Clerk nélkül.
 * A PATCH /api/business/manage/<token> hívásokat csinálja, sikerre router.refresh().
 */
export function BusinessManageForm({ business, token }: { business: Business; token: string }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: business.name,
    categoryLabel: business.categoryLabel ?? "",
    address: business.address ?? "",
    phone: business.phone ?? "",
    blurb: business.blurb ?? "",
    openText: business.openText ?? "",
    workingHours: business.workingHours ?? "",
    languages: business.languages ?? ["Magyar"],
  });
  const [phase, setPhase] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setPhase("idle");
  }

  function toggleLang(lang: string) {
    setForm((f) => {
      const has = f.languages.includes(lang);
      const next = has ? f.languages.filter((l) => l !== lang) : [...f.languages, lang];
      // Magyar mindig kötelező
      if (!next.includes("Magyar")) next.unshift("Magyar");
      return { ...f, languages: next };
    });
    setPhase("idle");
  }

  async function save() {
    setPhase("saving");
    setError(null);
    try {
      const res = await fetch(`/api/business/manage/${token}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          categoryLabel: form.categoryLabel || null,
          address: form.address || null,
          phone: form.phone || null,
          blurb: form.blurb || null,
          openText: form.openText || null,
          workingHours: form.workingHours || null,
          languages: form.languages,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        details?: { field: string; message: string }[];
      };
      if (!res.ok) {
        const msg = data.details?.[0]?.message ?? data.error ?? "Mentés sikertelen.";
        setError(msg);
        setPhase("error");
        return;
      }
      setPhase("saved");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hálózati hiba.");
      setPhase("error");
    }
  }

  async function remove() {
    if (!confirm(`Biztosan törlöd a(z) "${business.name}" vállalkozást? Ez nem visszavonható, és a vélemények is törlődnek.`)) return;
    setPhase("saving");
    try {
      const res = await fetch(`/api/business/manage/${token}`, { method: "DELETE" });
      if (!res.ok) {
        setError("Törlés sikertelen.");
        setPhase("error");
        return;
      }
      router.push("/szaknevsor");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hálózati hiba.");
      setPhase("error");
    }
  }

  return (
    <div className="space-y-3">
      <Section title="Vállalkozás neve" required>
        <input
          type="text"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className={inputCls()}
          maxLength={100}
        />
      </Section>

      <Section title="Pontos szakma">
        <input
          type="text"
          value={form.categoryLabel}
          onChange={(e) => set("categoryLabel", e.target.value)}
          placeholder="Pl. Női fodrász, Burkoló"
          className={inputCls()}
          maxLength={50}
        />
      </Section>

      <Section title="Cím (svájci)">
        <input
          type="text"
          value={form.address}
          onChange={(e) => set("address", e.target.value)}
          placeholder="Pl. Bahnhofstrasse 10, 8001 Zürich"
          className={inputCls()}
          maxLength={200}
        />
      </Section>

      <Section title="Telefonszám">
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
          placeholder="+41 79 123 45 67"
          className={inputCls()}
          maxLength={30}
        />
      </Section>

      <Section title="Bemutatkozás">
        <textarea
          value={form.blurb}
          onChange={(e) => set("blurb", e.target.value)}
          rows={4}
          maxLength={600}
          className={cn(inputCls(), "resize-none")}
        />
        <p className="mt-1 text-right text-[10.5px] text-ink-faint">
          {form.blurb.length} / 600
        </p>
      </Section>

      <Section title="Nyitvatartás szöveges">
        <input
          type="text"
          value={form.openText}
          onChange={(e) => set("openText", e.target.value)}
          placeholder="Pl. H–P: 9–18 · Sz: 9–13"
          className={inputCls()}
        />
      </Section>

      <Section title="Beszélt nyelvek">
        <div className="flex flex-wrap gap-1.5">
          {ALL_LANGS.map((lang) => {
            const on = form.languages.includes(lang);
            const required = lang === "Magyar";
            return (
              <button
                key={lang}
                type="button"
                onClick={() => !required && toggleLang(lang)}
                disabled={required}
                className={cn(
                  "rounded-pill px-3 py-1.5 text-[12px] font-bold transition",
                  on
                    ? "bg-primary text-white"
                    : "border border-line bg-surface text-ink-muted hover:text-ink",
                  required && "cursor-not-allowed",
                )}
              >
                {lang} {required && "(kötelező)"}
              </button>
            );
          })}
        </div>
      </Section>

      {error && (
        <div className="rounded-card border border-accent/30 bg-accent-soft px-4 py-3 text-[12.5px] font-semibold text-accent">
          {error}
        </div>
      )}

      {phase === "saved" && (
        <div className="rounded-card border border-success/30 bg-success/10 px-4 py-3 text-[12.5px] font-semibold text-success">
          ✓ Mentve.
        </div>
      )}

      <div className="flex flex-col gap-2 pt-2">
        <button
          type="button"
          onClick={save}
          disabled={phase === "saving"}
          className={cn(
            "flex h-12 w-full items-center justify-center gap-1.5 rounded-pill bg-primary text-[14px] font-extrabold text-white shadow-card-hover transition active:scale-[0.99]",
            phase === "saving" && "opacity-60 cursor-not-allowed",
          )}
        >
          {phase === "saving" ? "Mentés…" : "Mentés"}
          {phase !== "saving" && <Icon name="check" size={15} strokeWidth={2.6} />}
        </button>

        <Link
          href={`/szaknevsor/${business.id}`}
          className="flex h-11 w-full items-center justify-center gap-1.5 rounded-pill border border-line bg-surface text-[13px] font-bold text-ink"
        >
          Publikus profil megnyitása
        </Link>

        <button
          type="button"
          onClick={remove}
          className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-pill border border-accent/40 bg-accent/10 px-4 py-2 text-[12px] font-bold text-accent hover:bg-accent hover:text-white"
        >
          🗑 Vállalkozás törlése
        </button>
      </div>
    </div>
  );
}

function Section({ title, required, children }: { title: string; required?: boolean; children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-line bg-surface p-4 shadow-card">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">{title}</h3>
        {required && (
          <span className="text-[10.5px] font-semibold uppercase tracking-wide text-accent">
            kötelező
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function inputCls(): string {
  return cn(
    "w-full rounded-[12px] border border-line bg-surface-alt px-3 py-2.5 text-[14px] text-ink placeholder:text-ink-faint",
    "focus:outline-none focus:ring-2 focus:ring-primary/30",
  );
}
