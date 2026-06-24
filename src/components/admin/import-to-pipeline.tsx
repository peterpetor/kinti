"use client";

import { useState } from "react";

/**
 * „→ Pipeline-ba" gomb a /admin/jeloltek jelöltjein: egy klikkel behúzza a
 * self-service jelöltet a közvetítői pipeline-ba (CV-stül).
 */
export function ImportToPipeline({ workerId }: { workerId: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function importIt() {
    setState("loading");
    try {
      const res = await fetch("/api/admin/recruiter/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ workerId }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return <span className="shrink-0 rounded-pill bg-success/15 px-3 py-1.5 text-[12px] font-bold text-success">✓ Pipeline-ban</span>;
  }
  return (
    <button
      type="button"
      onClick={importIt}
      disabled={state === "loading"}
      className="shrink-0 rounded-pill bg-primary px-3.5 py-1.5 text-[12px] font-bold text-white shadow-card active:scale-95 disabled:opacity-60"
    >
      {state === "loading" ? "…" : state === "error" ? "Újra" : "→ Pipeline-ba"}
    </button>
  );
}
