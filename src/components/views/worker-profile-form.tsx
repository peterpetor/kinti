"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";

export function WorkerProfileForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Ide jön majd az API hívás
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center animate-fade-up">
        <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-success/15 text-success">
          <Icon name="check" size={24} strokeWidth={2.4} />
        </div>
        <h3 className="text-[18px] font-extrabold text-ink">Profil mentve!</h3>
        <p className="mt-2 text-[14px] text-ink-muted px-4">
          A svájci magyar munkáltatók most már megtalálhatnak a rendszerben.
        </p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="mt-6 rounded-pill border border-line bg-surface-alt px-5 py-2 text-[13.5px] font-bold text-ink transition-colors hover:bg-line"
        >
          Újabb szerkesztés
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-[12.5px] font-bold text-ink">Teljes név</label>
        <input
          required
          type="text"
          className="h-11 w-full rounded-[12px] border border-line bg-surface-alt px-3 text-[14px] text-ink focus:border-primary/50 focus:outline-none"
          placeholder="Pl. Kovács Gábor"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-[12.5px] font-bold text-ink">E-mail</label>
          <input
            required
            type="email"
            className="h-11 w-full rounded-[12px] border border-line bg-surface-alt px-3 text-[14px] text-ink focus:border-primary/50 focus:outline-none"
            placeholder="E-mail cím"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[12.5px] font-bold text-ink">Telefon</label>
          <input
            type="tel"
            className="h-11 w-full rounded-[12px] border border-line bg-surface-alt px-3 text-[14px] text-ink focus:border-primary/50 focus:outline-none"
            placeholder="+41 79 123 45 67"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-[12.5px] font-bold text-ink">CV / Önéletrajz (PDF, Max 10MB)</label>
        <div className="flex h-20 cursor-pointer items-center justify-center rounded-[12px] border-2 border-dashed border-line bg-surface-alt transition hover:border-primary/30 hover:bg-primary/5">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-primary">
            <Icon name="upload" size={16} strokeWidth={2.2} />
            <span>Kattints a feltöltéshez</span>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <label className="flex items-start gap-2.5">
          <input type="checkbox" className="mt-0.5 rounded border-line text-primary focus:ring-primary" />
          <span className="text-[12.5px] leading-snug text-ink-muted">
            <strong className="font-semibold text-ink">Láthatóság:</strong> Hozzájárulok, hogy a profilom kereshető legyen a kinti.app munkáltatói hálózatában.
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-pill bg-primary text-[14.5px] font-extrabold tracking-[-0.01em] text-white transition active:scale-[0.98] disabled:opacity-50"
      >
        {isSubmitting ? (
          <span className="animate-pulse">Mentés folyamatban...</span>
        ) : (
          <>
            <Icon name="check" size={16} strokeWidth={2.4} /> Profil mentése
          </>
        )}
      </button>
    </form>
  );
}
