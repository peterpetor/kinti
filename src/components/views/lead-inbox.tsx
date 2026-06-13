"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui";
import type { BusinessLead } from "@/lib/repo-leads";

const STATUS_META: Record<string, { label: string; cls: string }> = {
  new: { label: "Új", cls: "bg-accent/15 text-accent" },
  contacted: { label: "Megkeresve", cls: "bg-primary/15 text-primary" },
  archived: { label: "Archivált", cls: "bg-ink-muted/15 text-ink-muted" },
};

/**
 * A vállalkozó beérkező ajánlatkéréseinek postaládája (Szaknévsor PRO).
 * Csak a SAJÁT lead-eket mutatja; státusz a saját owner-API-n keresztül.
 */
export function LeadInbox({ leads }: { leads: BusinessLead[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function setStatus(id: string, status: "contacted" | "archived" | "new") {
    setBusyId(id);
    try {
      const res = await fetch(`/api/owner/leads/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  if (leads.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-line bg-surface-alt px-4 py-8 text-center text-[13px] text-ink-muted">
        Még nincs beérkezett ajánlatkérésed. Amint valaki a Szaknévsoron át megkeres, itt megjelenik.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {leads.map((lead) => {
        const meta = STATUS_META[lead.status] ?? STATUS_META.new;
        const archived = lead.status === "archived";
        return (
          <article
            key={lead.id}
            className={`rounded-card border border-line bg-surface p-4 shadow-card ${archived ? "opacity-60" : ""}`}
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-[15px] font-extrabold text-ink">{lead.senderName}</h3>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide ${meta.cls}`}>
                {meta.label}
              </span>
            </div>

            {lead.categoryLabel && (
              <p className="mt-0.5 text-[12px] font-semibold text-ink-muted">{lead.categoryLabel}</p>
            )}

            <p className="mt-2 whitespace-pre-wrap rounded-[10px] bg-surface-alt px-3 py-2 text-[13px] leading-relaxed text-ink-muted">
              {lead.message}
            </p>

            <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5">
              <a href={`mailto:${lead.senderEmail}`} className="flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:underline">
                <Icon name="send" size={13} strokeWidth={2.2} /> {lead.senderEmail}
              </a>
              {lead.senderPhone && (
                <a href={`tel:${lead.senderPhone}`} className="flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:underline">
                  <Icon name="phone" size={13} strokeWidth={2.2} /> {lead.senderPhone}
                </a>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between gap-2 border-t border-line/60 pt-2.5">
              <span className="text-[11px] font-semibold text-ink-faint">
                {new Date(lead.createdAt + "Z").toLocaleDateString("hu-HU")}
              </span>
              <div className="flex items-center gap-2 text-[12px] font-bold">
                {lead.status !== "contacted" && (
                  <button
                    onClick={() => setStatus(lead.id, "contacted")}
                    disabled={busyId === lead.id}
                    className="text-primary hover:underline disabled:opacity-60"
                  >
                    Megkerestem
                  </button>
                )}
                {!archived ? (
                  <button
                    onClick={() => setStatus(lead.id, "archived")}
                    disabled={busyId === lead.id}
                    className="text-ink-muted hover:underline disabled:opacity-60"
                  >
                    Archiválás
                  </button>
                ) : (
                  <button
                    onClick={() => setStatus(lead.id, "new")}
                    disabled={busyId === lead.id}
                    className="text-ink-muted hover:underline disabled:opacity-60"
                  >
                    Visszaállítás
                  </button>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
