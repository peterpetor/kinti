"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon, SwipeAction } from "@/components/ui";
import { confirmDialog } from "@/lib/confirm";
import { cn } from "@/lib/cn";
import { ReportButton } from "@/components/report-button";
import { getCountry } from "@/lib/countries";
import { relTimeFromMs } from "@/lib/relative-time";
import type { B2bProjectView } from "@/lib/repo-b2b";

/**
 * B2bProjectCard — egyetlen projekt (LinkedIn Jobs-szerű, letisztult). A kiíró
 * cég neve mellett PRO trust badge (ellenőrzött, előfizető cég). „Kapcsolat­
 * felvétel"-re lenyílik a telefon (a user eleve PRO, nincs további kapu). A
 * saját projektet a szerző lezárhatja.
 */
export function B2bProjectCard({
  project,
  categoryLabel,
}: {
  project: B2bProjectView;
  categoryLabel: string | null;
}) {
  const router = useRouter();
  const [revealed, setRevealed] = useState(false);
  const [closing, setClosing] = useState(false);
  // A szerver számolja (authorId nem kerül a kliensre).
  const isMine = project.isMine;
  const flag = getCountry(project.targetCountry)?.flag ?? "";

  async function close() {
    if (!(await confirmDialog({ message: "Biztosan lezárod ezt a projektet? Utána nem jelenik meg a feedben.", confirmLabel: "Lezárás" }))) return;
    setClosing(true);
    try {
      const res = await fetch("/api/b2b/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: project.id }),
      });
      if (res.ok) router.refresh();
    } finally {
      setClosing(false);
    }
  }

  const content = (
    <div className={cn("p-4", !isMine && "rounded-card border border-line bg-surface shadow-card")}>
      {/* Kiíró cég + trust badge */}
      <div className="mb-2 flex items-center gap-2">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-primary text-[13px] font-extrabold text-white">
          {(project.businessName ?? "?").slice(0, 1).toUpperCase()}
        </span>
        <span className="min-w-0 truncate text-[13px] font-bold text-ink">
          {project.businessName ?? "Ellenőrzött cég"}
        </span>
        {project.businessFeatured && (
          <span className="inline-flex items-center gap-0.5 rounded-pill bg-primary-soft px-1.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wide text-primary">
            <Icon name="check" size={10} strokeWidth={3} /> PRO
          </span>
        )}
        <span className="ml-auto shrink-0 text-[11px] text-ink-faint">{relTimeFromMs(project.createdAt)}</span>
      </div>

      <h3 className="text-[15px] font-extrabold leading-snug text-ink">{project.title}</h3>
      <p className="mt-1 whitespace-pre-line text-[13px] leading-relaxed text-ink-muted">
        {project.description}
      </p>

      {/* Meta-chipek */}
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-pill bg-surface-alt px-2 py-1 text-[11.5px] font-semibold text-ink-muted">
          {flag} {project.targetCity ? project.targetCity : getCountry(project.targetCountry)?.name}
        </span>
        {categoryLabel && (
          <span className="inline-flex items-center gap-1 rounded-pill bg-surface-alt px-2 py-1 text-[11.5px] font-semibold text-ink-muted">
            <Icon name="briefcase" size={12} strokeWidth={2.4} /> {categoryLabel}
          </span>
        )}
      </div>

      {/* Akciók */}
      <div className="mt-3 flex items-center gap-2">
        {project.contactPhone ? (
          revealed ? (
            <a
              href={`tel:${project.contactPhone.replace(/\s+/g, "")}`}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-pill bg-primary px-4 py-2 text-[13.5px] font-extrabold text-white transition active:scale-[0.98]"
            >
              <Icon name="phone" size={15} strokeWidth={2.4} /> {project.contactPhone}
            </a>
          ) : (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-pill bg-primary px-4 py-2 text-[13.5px] font-extrabold text-white transition active:scale-[0.98]"
            >
              <Icon name="phone" size={15} strokeWidth={2.4} /> Kapcsolatfelvétel
            </button>
          )
        ) : (
          <span className="flex-1 rounded-pill bg-surface-alt px-4 py-2 text-center text-[12.5px] font-semibold text-ink-muted">
            Nincs megadva telefonszám
          </span>
        )}

        {isMine && (
          <button
            type="button"
            onClick={close}
            disabled={closing}
            className="inline-flex items-center justify-center gap-1 rounded-pill border border-line bg-surface px-3 py-2 text-[12.5px] font-bold text-ink-muted transition active:scale-[0.98] disabled:opacity-60"
          >
            {closing ? "…" : "Lezárás"}
          </button>
        )}
      </div>

      {/* DSA (Art. 16) bejelentés: jogsértő tartalom jelzése — beküldésre a poszt
          azonnal rejtve, admin dönt. Saját posztnál nem kell (arra Lezárás van). */}
      {!isMine && (
        <div className="mt-2 flex justify-end">
          <ReportButton contentType="b2b" contentId={project.id} variant="link" />
        </div>
      )}
    </div>
  );

  // Saját projektnél balra húzva is lezárható (a "Lezárás" gomb a kártyán
  // marad, ez egy kiegészítő gesztus-út ugyanahhoz).
  if (!isMine) return content;
  return (
    <SwipeAction
      actionLabel="Lezárás"
      actionIcon="close"
      onAction={close}
      className="border border-line bg-surface shadow-card"
    >
      {content}
    </SwipeAction>
  );
}
