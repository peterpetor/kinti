"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { TurnstileWidget, type TurnstileWidgetRef } from "@/components/turnstile-widget";
import { cn } from "@/lib/cn";
import { CANTONS } from "@/lib/cantons";
import type { Category } from "@/lib/types";

const inputCls =
  "w-full rounded-[12px] border border-line bg-surface-alt px-3 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary/30";

/**
 * Közösségi „Ajánlj egy magyar vállalkozást" űrlap. NEM a saját vállalkozásod
 * — egy ismert, valódi magyar vállalkozást ajánlasz. Admin jóváhagyás után
 * jelenik meg, nem-megerősített listaként (a tulaj később átveheti).
 */
export function BusinessSuggestForm({ categories, turnstileSiteKey }: { categories: Category[]; turnstileSiteKey: string }) {
  const cats = categories.filter((c) => c.id !== "all");
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [cantonCode, setCantonCode] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [note, setNote] = useState("");
  const [phase, setPhase] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 2) return setError("Add meg a vállalkozás nevét.");
    if (!categoryId) return setError("Válassz kategóriát.");
    if (!cantonCode) return setError("Válassz kantont.");
    if (!turnstileToken) return setError("Várj a robot-ellenőrzésre (pár másodperc).");

    setPhase("sending");
    try {
      const categoryLabel = cats.find((c) => c.id === categoryId)?.label ?? "";
      const res = await fetch("/api/szaknevsor/ajanlas", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, categoryId, categoryLabel, cantonCode, city, phone, website, note, turnstileToken }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Nem sikerült elküldeni. Próbáld újra.");
        setPhase("error");
        turnstileRef.current?.reset();
        setTurnstileToken("");
        return;
      }
      setPhase("sent");
    } catch {
      setError("Hálózati hiba.");
      setPhase("error");
      turnstileRef.current?.reset();
      setTurnstileToken("");
    }
  }

  if (phase === "sent") {
    return (
      <div className="rounded-card border border-line bg-surface p-6 text-center shadow-card">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-success/15 text-success">
          <Icon name="check" size={22} strokeWidth={2.4} />
        </div>
        <h2 className="mt-3 text-[18px] font-extrabold text-ink">Köszönjük az ajánlást! 🙏</h2>
        <p className="mx-auto mt-2 max-w-sm text-[13.5px] leading-relaxed text-ink-muted">
          Ellenőrzés után megjelenik a Szaknévsorban. A vállalkozás tulajdonosa
          később átveheti és kiegészítheti az adatokat.
        </p>
        <button
          type="button"
          onClick={() => {
            setName(""); setCategoryId(""); setCantonCode(""); setCity("");
            setPhone(""); setWebsite(""); setNote(""); setPhase("idle");
          }}
          className="mt-4 inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface px-4 py-2 text-[12px] font-bold text-ink"
        >
          Másik vállalkozás ajánlása
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <Section title="Vállalkozás neve" required>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Pl. Joe's Bolt" maxLength={120} className={inputCls} />
      </Section>

      <Section title="Kategória" required>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputCls}>
          <option value="">Válassz kategóriát…</option>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </Section>

      <Section title="Hol van?" required>
        <select value={cantonCode} onChange={(e) => setCantonCode(e.target.value)} className={inputCls}>
          <option value="">Melyik kantonban?</option>
          {CANTONS.map((c) => (
            <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
          ))}
        </select>
        <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Város / cím (opcionális)" maxLength={120} className={cn(inputCls, "mt-2")} />
      </Section>

      <Section title="Elérhetőség (opcionális)">
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Telefon" maxLength={40} className={inputCls} />
        <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="Weboldal (https://…)" maxLength={200} className={cn(inputCls, "mt-2")} />
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Pár szó róla (opcionális)" rows={2} maxLength={600} className={cn(inputCls, "mt-2 resize-none")} />
      </Section>

      {error && <p className="px-1 text-[12px] font-semibold text-accent">{error}</p>}

      <div className="rounded-[10px] border border-accent/30 bg-accent/5 px-3 py-2 text-[11px] leading-snug text-ink-muted">
        Csak <strong className="text-ink">valódi, létező</strong> magyar vállalkozást ajánlj.
        A beküldést admin ellenőrzi, és csak jóváhagyás után jelenik meg. A tulajdonos
        kérheti az eltávolítást az <a href="mailto:info@kinti.app" className="underline">info@kinti.app</a> címen.
      </div>

      <div className="flex justify-center">
        <TurnstileWidget ref={turnstileRef} siteKey={turnstileSiteKey} onToken={setTurnstileToken} />
      </div>

      <button
        type="submit"
        disabled={phase === "sending"}
        className="flex h-12 w-full items-center justify-center gap-1.5 rounded-pill bg-primary text-[14px] font-extrabold text-white shadow-card-hover transition active:scale-[0.99] disabled:opacity-60"
      >
        {phase === "sending" ? "Küldés…" : "Ajánlás elküldése"}
      </button>

      <p className="text-center text-[11px] text-ink-faint">
        A saját vállalkozásod?{" "}
        <Link href="/szaknevsor/uj" className="font-bold text-primary underline">Add hozzá itt</Link> (kezelő-linket is kapsz hozzá).
      </p>
    </form>
  );
}

function Section({ title, required, children }: { title: string; required?: boolean; children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-line bg-surface p-4 shadow-card">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">{title}</h3>
        <span className={cn("text-[10.5px] font-semibold uppercase tracking-wide", required ? "text-accent" : "text-ink-faint")}>
          {required ? "kötelező" : "opcionális"}
        </span>
      </div>
      {children}
    </section>
  );
}
