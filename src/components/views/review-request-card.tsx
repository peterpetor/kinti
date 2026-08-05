"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";

/**
 * ReviewRequestCard — a vállalkozó eszköze, hogy véleményt KÉRJEN az ügyfeleitől.
 *
 * ⚠️ MIÉRT EZ HIÁNYZOTT (2026-07-31-i tölcsér-vizsgálat): a szaknévsorban 2353
 * cég van és NULLA vélemény. A vélemény-gépezet maga hibátlan (űrlap,
 * bot-védelem, e-mailes megerősítés, moderálás — mind ellenőrizve élesben), de
 * MIND A HÁROM kiváltója azt feltételezi, hogy a felhasználó ELŐBB kapcsolatba
 * lépett egy céggel az appon át: e-mail az ajánlatkérés után, kérdés a hívás
 * után, meghívó-kártya. Eddig 1 hívás és 0 ajánlatkérés volt — vagyis a hurok
 * bemenete üres, és magától SOSEM indul el.
 *
 * Minden katalógus (Google, Trustpilot) ugyanígy indul: a cégek a MEGLÉVŐ
 * ügyfeleiktől kérik az első véleményeket. Ehhez kell egy link és egy mondat.
 *
 * ⭐ A mélylink MÁR MŰKÖDÖTT (`?ertekeles=1` → nyitott vélemény-űrlap), csak a
 * vállalkozó SEHOL nem látta. Ez a kártya pusztán felszínre hozza.
 *
 * ⚠️ SZÁNDÉKOSAN NEM PRO-FUNKCIÓ: a vélemény a Kintinek legalább annyira
 * érdeke, mint a cégnek — fizetőfal mögé tenni önsorsrontás lenne.
 */
export function ReviewRequestCard({
  businessId,
  businessName,
  reviewCount,
}: {
  businessId: string;
  businessName: string;
  reviewCount: number;
}) {
  const [copied, setCopied] = useState<"link" | "message" | null>(null);
  const url = `https://kinti.app/szaknevsor/${businessId}?ertekeles=1`;
  // A kész üzenet: a vállalkozó hangján, az ügyfelének. A „regisztráció sem
  // kell" a legfontosabb kifogás-oldó — a vélemény tényleg fiók nélkül megy,
  // csak egy e-mailes megerősítés kell.
  const message =
    `Szia! Fent vagyunk a Kintin, a külföldön élő magyarok szaknévsorában. ` +
    `Ha elégedett voltál velünk, írnál rólunk pár mondatot? ` +
    `Egy perc az egész, regisztráció sem kell:\n${url}`;

  async function copy(what: "link" | "message") {
    const text = what === "link" ? url : message;
    // Mobilon a rendszer-megosztó a természetes út (WhatsApp/Messenger — oda
    // megy a vállalkozó az ügyfelének), asztalon marad a vágólap.
    if (what === "message" && typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ text: message });
        return;
      } catch {
        /* a felhasználó bezárta a megosztót → nem hiba, essünk vágólapra */
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(null), 2200);
    } catch {
      /* vágólap-engedély hiánya — csendben elnyeljük */
    }
  }

  const first = reviewCount === 0;

  return (
    <section
      className={cn(
        "rounded-card p-4 shadow-card",
        // Nulla véleménynél ez a legfontosabb teendő az oldalon → kiemelt keret.
        first ? "border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-surface" : "border border-line bg-surface",
      )}
    >
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-primary/10 text-primary-ink">
          <Icon name="star" size={19} strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[14.5px] font-extrabold leading-tight tracking-[-0.01em] text-ink">
            {first ? "Kérd az első véleményt" : "Kérj további véleményeket"}
          </h2>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
            {first ? (
              <>
                A(z) <strong className="text-ink">{businessName}</strong> adatlapján még nincs
                vélemény. A legegyszerűbb út: kérdd meg pár elégedett ügyfeledet — a lenti
                link egyből a véleményíró űrlapot nyitja meg nekik.
              </>
            ) : (
              <>
                Küldd el ezt a linket az ügyfeleidnek — egyből a véleményíró űrlapot nyitja
                meg. Jelenleg {reviewCount} véleményed van.
              </>
            )}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-[12px] border border-line bg-surface-alt/70 px-3 py-2">
        <Icon name="globe" size={14} strokeWidth={2.2} className="shrink-0 text-ink-faint" />
        <span className="min-w-0 flex-1 truncate text-[11.5px] text-ink-muted" title={url}>
          {url.replace("https://", "")}
        </span>
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => copy("message")}
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-pill bg-primary px-3 text-[12.5px] font-extrabold text-white shadow-card-hover transition active:scale-[0.98]"
        >
          <Icon name="send" size={14} strokeWidth={2.4} />
          {copied === "message" ? "Üzenet másolva ✓" : "Kész üzenet"}
        </button>
        <button
          type="button"
          onClick={() => copy("link")}
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-pill bg-surface px-3 text-[12.5px] font-extrabold text-ink shadow-[inset_0_0_0_1px_rgb(var(--border-channel)/var(--border-strong-alpha))] transition active:scale-[0.98]"
        >
          <Icon name="document" size={14} strokeWidth={2.4} />
          {copied === "link" ? "Link másolva ✓" : "Csak a link"}
        </button>
      </div>

      <p className="mt-2.5 text-[11px] leading-snug text-ink-faint">
        ⓘ A véleményíráshoz nem kell fiók, csak egy e-mailes megerősítés. A véleményeket
        közzététel előtt átnézzük, és <strong className="text-ink-muted">nem lehet őket
        megrendelni</strong> — csak kérni.
      </p>
    </section>
  );
}
