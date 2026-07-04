"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui";
import { BoostCheckoutButton } from "@/components/views/boost-checkout-button";
import { parseDbDate } from "@/lib/dates";
import type { BusinessLead } from "@/lib/repo-leads";

const STATUS_META: Record<string, { label: string; cls: string }> = {
  new: { label: "Új", cls: "bg-accent/15 text-accent" },
  contacted: { label: "Megkeresve", cls: "bg-primary/15 text-primary" },
  archived: { label: "Archivált", cls: "bg-ink-muted/15 text-ink-muted" },
};

/** A szerver a zárolt lead-ekről NEM küld kontakt-adatot (email/telefon/üzenet üres). */
export type LeadCard = BusinessLead & { locked: boolean };

/**
 * A vállalkozó beérkező ajánlatkéréseinek postaládája.
 * Freemium: havi 5 ingyenes lead teljesen látszik; a többi ZÁROLT (kontakt elrejtve) →
 * PRO oldja fel. A zárolt lead-ek kontakt-adatát a szerver be sem küldi (valódi gate).
 */
export function LeadInbox({ leads, businessId }: { leads: LeadCard[]; businessId: string }) {
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
      {leads.map((lead) =>
        lead.locked ? (
          <LockedLeadCard key={lead.id} lead={lead} businessId={businessId} />
        ) : (
          <UnlockedLeadCard key={lead.id} lead={lead} busy={busyId === lead.id} onStatus={setStatus} />
        ),
      )}
    </div>
  );
}

function LockedLeadCard({ lead, businessId }: { lead: LeadCard; businessId: string }) {
  return (
    <article className="relative overflow-hidden rounded-card border border-pro/30 bg-pro/[0.04] p-4 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon name="lock" size={15} className="text-pro" />
          <h3 className="text-[15px] font-extrabold text-ink">Új ajánlatkérés</h3>
        </div>
        <span className="shrink-0 rounded-full bg-pro/15 px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-pro">
          Zárolva
        </span>
      </div>

      {lead.categoryLabel && <p className="mt-0.5 text-[12px] font-semibold text-ink-muted">{lead.categoryLabel}</p>}

      {/* Elmosott teaser — valódi adat NINCS a kliensen */}
      <div className="mt-2 select-none rounded-[10px] bg-surface-alt px-3 py-2.5">
        <div className="h-3 w-3/4 rounded bg-ink/10" />
        <div className="mt-1.5 h-3 w-1/2 rounded bg-ink/10" />
        <p className="mt-2 text-[12px] font-semibold text-ink-muted">
          🔒 Egy kinti árajánlatot kér tőled. <span className="text-ink">PRO-val</span> látod a nevét, üzenetét és elérhetőségét.
        </p>
      </div>

      <div className="mt-3">
        <BoostCheckoutButton
          product="business_pro_monthly"
          customData={{ type: "business_pro", businessId }}
          label="Oldd fel PRO-val (19 € / hó)"
          className="bg-pro text-white hover:bg-[#e68600]"
        />
      </div>
      <p className="mt-1.5 text-[10.5px] text-ink-faint">
        {parseDbDate(lead.createdAt)?.toLocaleDateString("hu-HU") ?? ""} · a havi 5 ingyenes ajánlatkérésen felül érkezett
      </p>
    </article>
  );
}

function UnlockedLeadCard({
  lead,
  busy,
  onStatus,
}: {
  lead: LeadCard;
  busy: boolean;
  onStatus: (id: string, status: "contacted" | "archived" | "new") => void;
}) {
  const meta = STATUS_META[lead.status] ?? STATUS_META.new;
  const archived = lead.status === "archived";
  return (
    <article className={`rounded-card border border-line bg-surface p-4 shadow-card ${archived ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[15px] font-extrabold text-ink">{lead.senderName}</h3>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide ${meta.cls}`}>
          {meta.label}
        </span>
      </div>

      {lead.categoryLabel && <p className="mt-0.5 text-[12px] font-semibold text-ink-muted">{lead.categoryLabel}</p>}

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
          {parseDbDate(lead.createdAt)?.toLocaleDateString("hu-HU") ?? ""}
        </span>
        <div className="flex items-center gap-2 text-[12px] font-bold">
          {lead.status !== "contacted" && (
            <button onClick={() => onStatus(lead.id, "contacted")} disabled={busy} className="text-primary hover:underline disabled:opacity-60">
              Megkerestem
            </button>
          )}
          {!archived ? (
            <button onClick={() => onStatus(lead.id, "archived")} disabled={busy} className="text-ink-muted hover:underline disabled:opacity-60">
              Archiválás
            </button>
          ) : (
            <button onClick={() => onStatus(lead.id, "new")} disabled={busy} className="text-ink-muted hover:underline disabled:opacity-60">
              Visszaállítás
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
