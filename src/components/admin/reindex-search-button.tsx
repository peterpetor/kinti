"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

/**
 * „Keresőindex újraépítése" — a hátralévő vállalkozásokat embeddeli a Vectorize
 * szemantikus keresőbe (POST /api/admin/reindex-search).
 *
 * ⚠️ EGY KATTINTÁS = TELJES HÁTRALÉK. A gomb korábban EGYSZER hívta a
 * végpontot, az pedig futásonként csak egy szeletet dolgoz fel — 1693 hátralék
 * mellett ~9 kattintás kellett volna. Senki nem nyomta végig, ezért az index
 * hónapok alatt is csak 26%-ra jutott (a napi cron csordogálásából).
 * Most a gomb CIKLUSBAN hív, amíg a `remaining` el nem fogy.
 *
 * ⚠️ KIS KÉRÉSEK, NEM EGY NAGY. Szándékosan maradnak a szeletek: egyetlen
 * óriási futás a Worker CPU-korlátjába érne (a fizetős 30 mp-be is szűkösen),
 * és félbeszakadva megint félkész indexet hagyna. Sok kis kérés robusztusabb —
 * ha egy megszakad, a következő kattintás onnan folytatja.
 *
 * ⚠️ BIZTONSÁGI FÉK: legfeljebb `MAX_KOR` kör fut le egy kattintásra, hogy egy
 * hibás `remaining` (ami sosem csökken) ne pörgesse végtelen ciklusba a lapot.
 */

/** Egy körben feldolgozott tételek — a végpont felső korlátja 500. */
const SZELET = 400;
/** Felső korlát egy kattintásra (400 × 30 = 12 000 tétel bőven elég). */
const MAX_KOR = 30;

export function ReindexSearchButton() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);

  async function onClick() {
    if (
      !confirm(
        "Keresőindex feltöltése indul: a még nem indexelt vállalkozások embeddelése a Vectorize-ba. " +
          "A gomb addig fut, amíg el nem fogy a hátralék (több percig is tarthat). Mehet?",
      )
    )
      return;

    setBusy(true);
    setResult(null);
    setProgress(null);

    let osszesen = 0;
    try {
      for (let kor = 1; kor <= MAX_KOR; kor++) {
        const res = await fetch(`/api/admin/reindex-search?limit=${SZELET}`, { method: "POST" });
        const data = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          indexed?: number;
          remaining?: number;
          done?: boolean;
          error?: string;
        };
        if (!res.ok || !data.ok) {
          setResult(`Hiba a(z) ${kor}. körben: ${data.error ?? res.status}${osszesen ? ` (addig ${osszesen} kész)` : ""}`);
          return;
        }

        osszesen += data.indexed ?? 0;
        setProgress(`${osszesen} indexelve · még ${data.remaining ?? "?"}`);

        if (data.done || (data.remaining ?? 0) === 0) {
          setResult(`✓ Kész — ${osszesen} vállalkozás indexelve, az index naprakész.`);
          return;
        }
        // ⚠️ Ha egy kör 0-t indexelt, de maradt hátralék, a következő kör
        // ugyanezen a soron akadna el → nincs értelme tovább pörgetni.
        if ((data.indexed ?? 0) === 0) {
          setResult(`Elakadt: ${data.remaining} tétel nem indexelhető (hibás sor?). Eddig: ${osszesen}.`);
          return;
        }
      }
      setResult(`Részleges: ${osszesen} indexelve, a kör-limit elfogyott. Nyomd meg újra.`);
    } catch {
      setResult(`Hiba: a kérés nem ment át (hálózat?).${osszesen ? ` Addig ${osszesen} kész.` : ""}`);
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface px-3 py-1.5 text-[12px] font-bold text-ink transition active:scale-95 hover:bg-surface-alt",
          busy && "cursor-wait opacity-60",
        )}
      >
        🔍 {busy ? "Indexelés…" : "Keresőindex feltöltése"}
      </button>
      {(progress || result) && (
        <span
          className={cn(
            "text-[11.5px] font-bold",
            result?.startsWith("Hiba") || result?.startsWith("Elakadt")
              ? "text-accent"
              : result
                ? "text-success-ink"
                : "text-ink-muted",
          )}
        >
          {result ?? progress}
        </span>
      )}
    </span>
  );
}
