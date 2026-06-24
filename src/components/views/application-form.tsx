"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui";

interface Props {
  jobId: string;
  jobTitle: string;
  /** Bejelentkezett, worker-profillal rendelkező jelölt adatai az egykattintásos
   *  jelentkezéshez. A CV-kulcsot NEM küldjük a kliensre — a szerver a saját
   *  profilból olvassa (lásd /api/jobs/[id]/apply). */
  prefill?: { fullName: string; email: string; phone: string | null; hasCv: boolean } | null;
}

export function ApplicationForm({ jobId, jobTitle, prefill }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [useProfileCv, setUseProfileCv] = useState(!!prefill?.hasCv);

  const [form, setForm] = useState({
    fullName: prefill?.fullName ?? "",
    email: prefill?.email ?? "",
    phone: prefill?.phone ?? "",
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
          useProfileCv: useProfileCv && !!prefill?.hasCv,
        }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Hiba történt a jelentkezés során.");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hiba történt a jelentkezés során.");
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
        <Link
          href="/allasok/onboarding"
          className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-pill border border-line bg-surface text-[13.5px] font-bold text-ink active:scale-[0.99]"
        >
          <Icon name="check" size={15} strokeWidth={2.6} />
          Készülj fel: Kezdőcsomag
        </Link>
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

      {prefill && (
        <div className="rounded-[12px] border border-primary/25 bg-primary-soft px-3.5 py-3">
          <p className="flex items-center gap-1.5 text-[12.5px] font-bold text-ink">
            <Icon name="check" size={14} strokeWidth={2.6} className="text-primary" />
            A profilodból kitöltöttük az adataidat
          </p>
          {prefill.hasCv ? (
            <label className="mt-2 flex cursor-pointer items-start gap-2">
              <input
                type="checkbox"
                checked={useProfileCv}
                onChange={(e) => setUseProfileCv(e.target.checked)}
                className="mt-0.5 h-4 w-4 cursor-pointer rounded border-line text-primary"
              />
              <span className="text-[12px] leading-snug text-ink-muted">
                A mentett önéletrajzomat (CV) csatolom a jelentkezéshez.
              </span>
            </label>
          ) : (
            <p className="mt-1.5 text-[11.5px] text-ink-muted">
              Tölts fel CV-t a{" "}
              <Link href="/allasok/profil" className="font-bold text-primary underline">
                profilodon
              </Link>
              , hogy automatikusan csatolható legyen.
            </p>
          )}
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
        <p className="mt-1 text-[11.5px] text-ink-faint">
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
          Elfogadom, hogy a megadott személyes adataimat (név, e-mail cím és telefonszám) a munkáltató kapcsolatfelvétel céljából kezelje. Az adatkezelés az adott álláshirdetés lezárásáig tart.
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
