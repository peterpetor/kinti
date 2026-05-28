"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Ride } from "@/lib/repo";

export function RideManageForm({ ride, token }: { ride: Ride; token: string }) {
  const router = useRouter();
  const [form, setForm] = useState({
    departureTime: toLocalInput(ride.departureTime),
    seats: String(ride.seats),
    priceText: ride.priceText ?? "",
    contactPhone: ride.contactPhone,
    contactWhatsapp: ride.contactWhatsapp ?? "",
    notes: ride.notes ?? "",
  });
  const [phase, setPhase] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setPhase("saving");
    setError(null);
    try {
      const res = await fetch(`/api/ride/manage/${token}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          departureTime: new Date(form.departureTime).toISOString(),
          seats: Number(form.seats),
          priceText: form.priceText || null,
          contactPhone: form.contactPhone,
          contactWhatsapp: form.contactWhatsapp || null,
          notes: form.notes || null,
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
    if (!confirm(`Biztosan törlöd a(z) "${ride.departureCity} → ${ride.destinationCity}" fuvart?`)) return;
    setPhase("saving");
    const res = await fetch(`/api/ride/manage/${token}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Törlés sikertelen.");
      setPhase("error");
      return;
    }
    router.push("/telekocsi");
  }

  return (
    <div className="space-y-3">
      <Section title="Útvonal">
        <div className="rounded-[12px] bg-surface-alt px-3 py-2.5 text-[14px] text-ink">
          {ride.departureCity} → {ride.destinationCity}
        </div>
        <p className="mt-1 px-1 text-[10.5px] text-ink-faint">Az útvonal nem módosítható — ha másik útvonal kell, töröld és add fel újra.</p>
      </Section>

      <Section title="Indulás" required>
        <input type="datetime-local" value={form.departureTime} onChange={(e) => setForm((f) => ({ ...f, departureTime: e.target.value }))} className={inputCls()} />
      </Section>

      <Section title="Szabad helyek" required>
        <select value={form.seats} onChange={(e) => setForm((f) => ({ ...f, seats: e.target.value }))} className={inputCls()}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </Section>

      <Section title="Ár">
        <input type="text" value={form.priceText} onChange={(e) => setForm((f) => ({ ...f, priceText: e.target.value }))} placeholder="pl. 40 CHF" className={inputCls()} maxLength={40} />
      </Section>

      <Section title="Telefonszám (híváshoz)" required>
        <input type="tel" value={form.contactPhone} onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))} className={inputCls()} maxLength={24} />
      </Section>

      <Section title="WhatsApp szám (csak ha eltér)">
        <input
          type="tel"
          value={form.contactWhatsapp}
          onChange={(e) => setForm((f) => ({ ...f, contactWhatsapp: e.target.value }))}
          placeholder="Üresen: a fenti telefonra megy a WhatsApp is"
          className={inputCls()}
          maxLength={24}
        />
      </Section>

      <Section title="Megjegyzés">
        <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={3} className={cn(inputCls(), "resize-none")} maxLength={500} />
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
          🗑 Fuvar törlése
        </button>
      </div>
    </div>
  );
}

function toLocalInput(iso: string): string {
  // datetime-local input wants 'YYYY-MM-DDTHH:MM' in LOCAL time
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
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
