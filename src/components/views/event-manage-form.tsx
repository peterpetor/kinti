"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { KintiEvent } from "@/lib/types";

export function EventManageForm({ event, token }: { event: KintiEvent; token: string }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: event.title,
    venue: event.venue ?? "",
    startTime: event.startTime ?? "",
    description: event.description ?? "",
  });
  const [phase, setPhase] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setPhase("saving");
    setError(null);
    try {
      const res = await fetch(`/api/event/manage/${token}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          venue: form.venue || null,
          startTime: form.startTime || null,
          description: form.description || null,
        }),
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        setError(d.error ?? "Mentés sikertelen.");
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
    if (!confirm(`Biztosan törlöd: "${event.title}"?`)) return;
    setPhase("saving");
    const res = await fetch(`/api/event/manage/${token}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Törlés sikertelen.");
      setPhase("error");
      return;
    }
    router.push("/kozosseg");
  }

  return (
    <div className="space-y-3">
      <Section title="Cím" required>
        <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={inputCls()} maxLength={200} />
      </Section>
      <Section title="Helyszín">
        <input type="text" value={form.venue} onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))} className={inputCls()} maxLength={200} />
      </Section>
      <Section title="Kezdés (HH:MM)">
        <input type="text" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} placeholder="pl. 18:00" className={inputCls()} maxLength={5} />
      </Section>
      <Section title="Leírás">
        <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={4} className={cn(inputCls(), "resize-none")} />
      </Section>

      {error && (
        <div className="rounded-card border border-accent/30 bg-accent-soft px-4 py-3 text-[12.5px] font-semibold text-accent">{error}</div>
      )}
      {phase === "saved" && (
        <div className="rounded-card border border-success/30 bg-success/10 px-4 py-3 text-[12.5px] font-semibold text-success">✓ Mentve.</div>
      )}

      <div className="flex flex-col gap-2 pt-2">
        <button type="button" onClick={save} disabled={phase === "saving"} className={cn("flex h-12 w-full items-center justify-center gap-1.5 rounded-pill bg-primary text-[14px] font-extrabold text-white shadow-card-hover", phase === "saving" && "opacity-60 cursor-not-allowed")}>
          {phase === "saving" ? "Mentés…" : "Mentés"}
          {phase !== "saving" && <Icon name="check" size={15} strokeWidth={2.6} />}
        </button>
        <button type="button" onClick={remove} className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-pill border border-accent/40 bg-accent/10 px-4 py-2 text-[12px] font-bold text-accent hover:bg-accent hover:text-white">
          🗑 Esemény törlése
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
        {required && <span className="text-[10.5px] font-semibold uppercase tracking-wide text-accent">kötelező</span>}
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
