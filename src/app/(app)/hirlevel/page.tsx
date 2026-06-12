"use client";

import { useState } from "react";
import { Icon, ScreenHeader } from "@/components/ui";
import { cn } from "@/lib/cn";

export default function HirlevelPage() {
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("Svájc");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, country }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Hiba történt a feliratkozás során.");
      }

      setStatus("success");
    } catch (err: any) {
      setErrorMsg(err.message || "Hiba történt a feliratkozás során.");
      setStatus("error");
    }
  };

  return (
    <div className="space-y-5 px-5 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <ScreenHeader
        eyebrow="Hírlevél"
        title="Iratkozz fel a Kinti Hírlevélre"
      />

      <div className="rounded-card border border-line bg-surface-alt px-4 py-3 text-[13px] leading-relaxed text-ink-muted">
        Válassz országot, és maradj képben a legfontosabb hírekkel, eseményekkel és ajánlatokkal kapcsolatban!
      </div>

      {status === "success" ? (
        <div className="rounded-card border border-success/30 bg-success-soft p-5 text-center shadow-card">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-success/20 text-success text-xl">
            ✓
          </div>
          <h2 className="mt-3 text-[16px] font-extrabold tracking-tight text-success">
            Sikeres feliratkozás!
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-pretty text-[13px] leading-relaxed text-success/90">
            A megerősítő linket elküldtük az email címedre. Kérlek kattints a linkre a feliratkozásod aktiválásához!
          </p>
          <button
            onClick={() => {
              setStatus("idle");
              setEmail("");
            }}
            className="mt-4 inline-flex h-11 items-center justify-center rounded-pill bg-success px-5 text-[13.5px] font-bold text-white shadow-card-hover"
          >
            Új feliratkozás
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubscribe} className="rounded-card border border-line bg-surface p-5 shadow-card space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="country" className="text-[12px] font-bold text-ink-muted uppercase tracking-wider">
              Ország kiválasztása
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["Svájc", "Németország", "Ausztria"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCountry(c)}
                  className={cn(
                    "rounded-xl border py-2.5 text-[13px] font-bold transition-all active:scale-95",
                    country === c
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-line bg-surface-alt text-ink-muted hover:border-primary/50"
                  )}
                >
                  {c === "Svájc" && "🇨🇭 "}
                  {c === "Németország" && "🇩🇪 "}
                  {c === "Ausztria" && "🇦🇹 "}
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-[12px] font-bold text-ink-muted uppercase tracking-wider">
              E-mail cím <span className="text-accent">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="pelda@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-[12px] border border-line bg-surface-alt px-3.5 py-3 text-[14px] font-medium text-ink focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          {errorMsg && (
            <div className="rounded-lg border border-accent/20 bg-accent-soft p-3 text-[12px] font-semibold text-accent flex items-center gap-2">
              <Icon name="close" size={14} />
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={status === "loading" || !email}
            className={cn(
              "flex w-full h-12 items-center justify-center gap-2 rounded-pill bg-primary px-5 text-[14px] font-extrabold text-white shadow-card-hover transition active:scale-[0.99]",
              (status === "loading" || !email) && "opacity-60 cursor-not-allowed"
            )}
          >
            {status === "loading" ? "Feldolgozás..." : "Feliratkozás"}
            {!status && <Icon name="arrowRight" size={15} strokeWidth={2.4} />}
          </button>
        </form>
      )}
    </div>
  );
}
