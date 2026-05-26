"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";

export interface ProfileEditorProps {
  businessId: string;
  initialName: string;
  initialPhone: string | null;
  initialBlurb: string | null;
  initialAddress: string | null;
  initialCategoryLabel: string | null;
  initialOpenText: string | null;
}

type Phase = "idle" | "saving" | "success" | "error";

export function ProfileEditor({
  initialName,
  initialPhone,
  initialBlurb,
  initialAddress,
  initialCategoryLabel,
  initialOpenText,
}: ProfileEditorProps) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [blurb, setBlurb] = useState(initialBlurb ?? "");
  const [address, setAddress] = useState(initialAddress ?? "");
  const [categoryLabel, setCategoryLabel] = useState(initialCategoryLabel ?? "");
  const [openText, setOpenText] = useState(initialOpenText ?? "");

  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setPhase("saving");
    setError(null);

    try {
      const res = await fetch("/api/owner/update-profile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          blurb,
          address,
          categoryLabel,
          openText,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Mentés hiba.");
      }

      setPhase("success");
      setTimeout(() => setPhase("idle"), 4000);
      window.location.reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ismeretlen hiba történt.";
      setError(message);
      setPhase("error");
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-3">
      <section className="rounded-card border border-line bg-surface p-4 shadow-card space-y-3">
        <div className="flex items-center justify-between border-b border-line pb-2 mb-1">
          <h3 className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted flex items-center gap-1.5">
            <Icon name="sliders" size={12} strokeWidth={2.4} className="text-primary" /> Vállalkozás adatai
          </h3>
        </div>

        {/* Név */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-ink-muted uppercase tracking-wider flex items-center justify-between">
            <span>Név <strong className="text-accent">*</strong></span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Pl. Kovács Anna Fodrászat"
            className="w-full rounded-[12px] border border-line bg-surface-alt px-3 py-2 text-[13.5px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Telefon */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
            Telefonszám
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Pl. +41 79 123 45 67"
            className="w-full rounded-[12px] border border-line bg-surface-alt px-3 py-2 text-[13.5px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Cím */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
            Cím (utca, házszám, város)
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Pl. Bahnhofstrasse 10, Zürich"
            className="w-full rounded-[12px] border border-line bg-surface-alt px-3 py-2 text-[13.5px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Kategória és Nyitvatartás (grid) */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
              Egyedi kategória felirat
            </label>
            <input
              type="text"
              value={categoryLabel}
              onChange={(e) => setCategoryLabel(e.target.value)}
              placeholder="Pl. Női Fodrász, Burkoló"
              className="w-full rounded-[12px] border border-line bg-surface-alt px-3 py-2 text-[13.5px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
              Nyitvatartás felirat
            </label>
            <input
              type="text"
              value={openText}
              onChange={(e) => setOpenText(e.target.value)}
              placeholder="Pl. H-P: 8:00 - 18:00"
              className="w-full rounded-[12px] border border-line bg-surface-alt px-3 py-2 text-[13.5px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Leírás */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
            Rövid leírás / Blurb
          </label>
          <textarea
            value={blurb}
            onChange={(e) => setBlurb(e.target.value)}
            placeholder="Mutasd be pár mondatban a szolgáltatásodat..."
            rows={3}
            className="w-full rounded-[12px] border border-line bg-surface-alt px-3 py-2 text-[13.5px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>

        {/* Mentés visszajelzés */}
        {phase === "success" && (
          <div className="rounded-[12px] border border-success/30 bg-success-soft px-3 py-2.5 text-[12px] font-bold text-success flex items-center gap-1.5">
            <Icon name="check" size={13} strokeWidth={2.4} /> A profil adatai sikeresen frissítve!
          </div>
        )}
        {error && (
          <div className="rounded-[12px] border border-accent/30 bg-accent-soft px-3 py-2.5 text-[12px] font-bold text-accent flex items-center gap-1.5">
            <Icon name="close" size={13} strokeWidth={2.4} /> {error}
          </div>
        )}

        {/* Mentés gomb */}
        <button
          type="submit"
          disabled={phase === "saving"}
          className={cn(
            "flex h-10 w-full items-center justify-center gap-1.5 rounded-pill bg-primary text-[13px] font-extrabold tracking-[-0.01em] text-white shadow-card-hover transition active:scale-[0.99]",
            phase === "saving" && "cursor-not-allowed opacity-50",
          )}
        >
          {phase === "saving" ? "Mentés…" : "Módosítások mentése"}
          {phase !== "saving" && <Icon name="arrowRight" size={14} strokeWidth={2.4} />}
        </button>
      </section>
    </form>
  );
}
