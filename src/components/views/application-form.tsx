"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui";

interface Props {
  jobId: string;
  jobTitle: string;
}

export function ApplicationForm({ jobId, jobTitle }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
    consent: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.consent) {
      setError("Az adatkezelési nyilatkozat elfogadása kötelező.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone || null,
          message: form.message || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Hiba történt a jelentkezés során.");
      }
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full rounded-[12px] border border-line bg-surface-alt px-3 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary/30";

  if (submitted) {
    return (
      <div className="rounded-card border border-line bg-surface p-6 shadow-card text-center animate-fade-up">
        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-success/15 text-success grid place-items-center">
          <Icon name="check" size={32} strokeWidth={2.5} />
        </div>
        <h2 className="text-[20px] font-extrabold tracking-tight text-ink">Jelentkezés elküldve!</h2>
        <p className="mt-2 text-[14px] text-ink-muted text-pretty">
          A munkáltató az általad megadott email-en veszi fel veled a kapcsolatot.
          Addig nézd meg a többi hirdetést is!
        </p>
        <button
          onClick={() => router.push("/allasok")}
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-pill bg-primary text-[15px] font-extrabold text-white"
        >
          Vissza az állásokhoz
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-[12px] bg-accent/10 px-4 py-3 text-[13px] font-semibold text-accent">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-ink-muted">
          Teljes neved *
        </label>
        <input
          type="text"
          required
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          className={inputCls}
          placeholder="Kovács János"
        />
      </div>

      <div>
        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-ink-muted">
          Email cím *
        </label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className={inputCls}
          placeholder="janos@example.com"
        />
        <p className="mt-1 text-[10.5px] text-ink-faint">
          A munkáltató erre az email-re fogja felvenni veled a kapcsolatot.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-ink-muted">
          Telefonszám (opcionális)
        </label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className={inputCls}
          placeholder="+41 79 123 45 67"
        />
      </div>

      <div>
        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-ink-muted">
          Motivációs levél (opcionális)
        </label>
        <textarea
          rows={4}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className={cn(inputCls, "resize-none")}
          placeholder="Miért Te vagy a legalkalmasabb erre az állásra?"
        />
      </div>

      <div className="flex items-start gap-3 pt-2">
        <input
          type="checkbox"
          id="consent"
          checked={form.consent}
          onChange={(e) => setForm({ ...form, consent: e.target.checked })}
          className="mt-0.5 h-4 w-4 cursor-pointer rounded border-line text-primary"
        />
        <label htmlFor="consent" className="text-[12px] leading-relaxed text-ink-muted cursor-pointer">
          Elfogadom, hogy a megadott személyes adataimat (névés email cím) a munkáltató kapcsolatfelvétel céljából kezelje. Az adatkezelés az adott álláshirdetés lezárásáig tart.
        </label>
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
          {loading ? "Küldés..." : "Jelentkezés elküldése"}
          {!loading && <Icon name="send" size={16} strokeWidth={2.4} />}
        </button>
      </div>
    </form>
  );
}
