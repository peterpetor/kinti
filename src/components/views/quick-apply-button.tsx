"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";

/**
 * QuickApplyButton — IGAZI egy-kattintásos jelentkezés. A bejelentkezett, teljes
 * profillal (név+email+CV) rendelkező jelölt űrlap nélkül, egyetlen gombbal
 * beadja a jelentkezést: POST /api/jobs/[id]/apply { useProfileCv:true } — a CV-t
 * a szerver a saját profilból olvassa. Aki testreszabná (motiváció), a link viszi
 * a teljes űrlapra.
 */
export function QuickApplyButton({
  jobId,
  fullName,
  email,
  phone,
}: {
  jobId: string;
  fullName: string;
  email: string;
  phone: string | null;
}) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "dup" | "error">("idle");

  async function apply() {
    if (state === "loading" || state === "done" || state === "dup") return;
    setState("loading");
    try {
      const res = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, useProfileCv: true }),
      });
      if (res.ok) setState("done");
      else if (res.status === 409) setState("dup");
      else setState("error");
    } catch {
      setState("error");
    }
  }

  if (state === "done" || state === "dup") {
    return (
      <div className="kinti-pop flex h-14 w-full items-center justify-center gap-2 rounded-pill bg-success/15 text-[15px] font-extrabold text-success">
        <Icon name="check" size={18} strokeWidth={3} />
        {state === "done" ? "Jelentkezés elküldve!" : "Erre már jelentkeztél"}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={apply}
        disabled={state === "loading"}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-pill bg-primary text-[16px] font-extrabold text-white shadow-card-hover transition-all active:scale-[0.98] disabled:opacity-60"
      >
        {state === "loading" ? (
          "Küldés…"
        ) : (
          <>
            <Icon name="sparkles" size={18} strokeWidth={2.4} /> Jelentkezem a profilommal
          </>
        )}
      </button>
      <Link
        href={`/allasok/${jobId}/jelentkezes`}
        className="text-center text-[11.5px] font-bold text-ink-muted underline underline-offset-2"
      >
        {state === "error" ? "Hiba — jelentkezz a testreszabott űrlapon" : "Inkább testreszabom (motivációval)"}
      </Link>
    </div>
  );
}
