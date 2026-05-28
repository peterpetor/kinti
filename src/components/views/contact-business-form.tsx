"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";

interface Props {
  businessId: string;
  hasContactEmail: boolean;
}

export function ContactBusinessForm({ businessId, hasContactEmail }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [phase, setPhase] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  if (!hasContactEmail) {
    return null;
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="flex h-11 items-center justify-center gap-1.5 rounded-pill bg-surface text-[13.5px] font-bold text-ink shadow-[inset_0_0_0_1px_rgb(var(--border-channel)/var(--border-strong-alpha))] hover:bg-surface-alt transition px-4 active:scale-95"
      >
        <Icon name="send" size={16} strokeWidth={2.2} /> Kérj árajánlatot / Időpontot
      </button>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError("Minden csillaggal jelölt mező kötelező.");
      return;
    }
    setPhase("sending");
    setError(null);

    try {
      const res = await fetch(`/api/business/${businessId}/quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Hiba történt a küldés során.");
      }
      setPhase("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hálózati hiba.");
      setPhase("error");
    }
  }

  if (phase === "success") {
    return (
      <div className="rounded-2xl border border-success/30 bg-success/10 p-4 mt-2">
        <p className="flex items-center gap-2 text-[14px] font-bold text-success">
          <Icon name="check" size={18} strokeWidth={2.6} /> Üzenet sikeresen elküldve!
        </p>
        <p className="mt-1 text-[12.5px] text-success/80">
          A szakember hamarosan felveszi veled a kapcsolatot a megadott elérhetőségeken.
        </p>
        <button
          onClick={() => {
            setExpanded(false);
            setPhase("idle");
            setForm({ name: "", email: "", phone: "", message: "" });
          }}
          className="mt-3 text-[12.5px] font-bold text-success hover:underline"
        >
          Új üzenet küldése
        </button>
      </div>
    );
  }

  return (
    <div className="mt-2 rounded-2xl border border-line bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[14px] font-bold text-ink">Árajánlatkérés / Időpontfoglalás</h3>
        <button onClick={() => setExpanded(false)} className="p-1 text-ink-muted hover:text-ink">
          <Icon name="close" size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
            Neved <span className="text-accent">*</span>
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-xl border border-line bg-surface-alt px-3 py-2 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Kovács János"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
              Email <span className="text-accent">*</span>
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-line bg-surface-alt px-3 py-2 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="janos@email.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
              Telefon
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-xl border border-line bg-surface-alt px-3 py-2 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="+41 79 123 45 67"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
            Projekt részletei / Időpont igény <span className="text-accent">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full resize-none rounded-xl border border-line bg-surface-alt px-3 py-2 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Szeretnék ajánlatot kérni burkolásra..."
          />
        </div>

        {error && (
          <p className="text-[12px] font-bold text-accent">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={phase === "sending"}
          className={cn(
            "flex w-full items-center justify-center gap-1.5 rounded-pill bg-primary px-4 py-2.5 text-[14px] font-bold text-white transition shadow-sm active:scale-95",
            phase === "sending" && "opacity-60 cursor-not-allowed"
          )}
        >
          {phase === "sending" ? "Küldés folyamatban..." : (
            <>
              <Icon name="send" size={16} />
              Üzenet küldése
            </>
          )}
        </button>
      </form>
    </div>
  );
}
