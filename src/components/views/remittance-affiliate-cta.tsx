"use client";

import Link from "next/link";
import { X_PROVIDERS } from "@/lib/exchange-providers";

// A Wise ajánlói (referral/affiliate) linkje a KÖZÖS forrásból (exchange-providers)
// — egy helyen karbantartva, nincs duplikált URL.
const WISE_URL = X_PROVIDERS.find((p) => p.name === "Wise")?.url ?? "https://wise.com/";

/**
 * Kontextus-tudatos affiliate CTA a benchmark (Iránytű) böngészéséhez.
 *
 * Aki a KINT keresett fizetéseket nézi, annak releváns a hazautalás — itt a
 * banki árfolyam-rés a „szivárgás". A CTA a Wise ajánlói linkjére visz.
 *
 * JELÖLVE: az ajánlói (referral) linket a jogi „referral-jelölés" elv szerint
 * egyértelműen jelöljük (+ „neked nem kerül többe"), és `rel="sponsored …"`-t
 * adunk — az utalás-asszisztens disclosure-jével egyezően. Nem pénzügyi tanács.
 */
export function RemittanceAffiliateCta({ currency }: { currency: string }) {
  return (
    <div className="rounded-2xl border border-[#00b9ff]/30 bg-[#00b9ff]/5 p-4">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#00b9ff]/15 text-xl">
          💸
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[14.5px] font-extrabold leading-snug text-ink">Ne veszíts az árfolyamon!</p>
            <span className="shrink-0 rounded-full bg-ink/5 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-ink-faint">
              Ajánló
            </span>
          </div>
          <p className="mt-1 text-[12.5px] leading-snug text-ink-muted">
            Utald haza a fizetésed <strong className="text-ink">Wise</strong>-zal — valódi középárfolyamon
            ({currency}→HUF), átlátható díjjal. A banki utalás rejtett árfolyam-rése havonta több tízezer
            forintodba is kerülhet.
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-2">
            <a
              href={WISE_URL}
              target="_blank"
              rel="sponsored nofollow noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-pill bg-[#00b9ff] px-4 py-2 text-[13px] font-extrabold text-white transition active:scale-[0.98]"
            >
              Utalás Wise-zal →
            </a>
            <Link href="/utalas" className="text-[12px] font-bold text-ink-muted underline underline-offset-2">
              Előbb hasonlítsd össze
            </Link>
          </div>
          <p className="mt-2 text-[10.5px] leading-snug text-ink-faint">
            Ajánlói (referral) link — ha rajta keresztül regisztrálsz, az üzemeltető juttatást kaphat;
            neked nem kerül többe. Az érvényes árfolyam és díj a wise.com-on. Nem pénzügyi tanácsadás.
          </p>
        </div>
      </div>
    </div>
  );
}
