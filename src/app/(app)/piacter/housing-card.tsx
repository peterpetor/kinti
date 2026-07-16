"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { COUNTRIES } from "@/lib/countries";
import { ReportButton } from "@/components/report-button";
import { formatHousingPrice, housingAgeLabel, HOUSING_TYPE_LABELS } from "@/lib/housing";
import type { HousingListing } from "@/lib/repo-housing";
import { ProPaywallModal } from "./pro-paywall-modal";

/**
 * Egy hirdetés-kártya. A kontakt NINCS a propokban — a „Kapcsolatfelvétel"
 * gomb PRO-nál a szerver-gated /api/housing/contact-ból tölti (skeleton-nal),
 * nem-PRO-nál a paywall-modalt nyitja. A kliens-oldali elágazás csak UX,
 * a tényleges zár a szerveren van.
 */
export function HousingCard({
  listing,
  isPro,
  signedIn,
}: {
  listing: HousingListing;
  isPro: boolean;
  signedIn: boolean;
}) {
  const router = useRouter();
  const [contact, setContact] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  const flag = COUNTRIES.find((c) => c.code === listing.country)?.flag ?? "";
  const offer = listing.type !== "looking_for_room";

  async function reveal() {
    if (!signedIn) {
      window.location.href = "/belepes?redirect_url=/piacter";
      return;
    }
    if (!isPro) {
      setPaywallOpen(true);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/housing/contact?id=${encodeURIComponent(listing.id)}`);
      const data = (await res.json().catch(() => ({}))) as { contact?: string; error?: string };
      if (res.status === 403) { setPaywallOpen(true); return; } // szerver a hiteles forrás
      if (!res.ok || !data.contact) { setError(data.error ?? "Nem sikerült betölteni."); return; }
      setContact(data.contact);
    } catch {
      setError("Hálózati hiba. Próbáld újra.");
    } finally {
      setLoading(false);
    }
  }

  async function removeOwn() {
    setRemoving(true);
    try {
      const res = await fetch(`/api/housing?id=${encodeURIComponent(listing.id)}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setRemoving(false);
    }
  }

  return (
    <article className="rounded-card border border-line bg-surface p-4 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-[11px] font-extrabold",
            offer ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent",
          )}
        >
          {offer ? "🔑" : "🔎"} {HOUSING_TYPE_LABELS[listing.type]}
        </span>
        <div className="flex items-center gap-2">
          {listing.own && listing.pending && (
            <span className="inline-flex items-center gap-1 rounded-pill bg-star/15 px-2 py-0.5 text-[10.5px] font-extrabold text-star">
              <Icon name="clock" size={10} strokeWidth={2.6} /> Jóváhagyásra vár
            </span>
          )}
          {listing.own && (
            <button
              type="button"
              onClick={removeOwn}
              disabled={removing}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-ink-faint transition hover:text-accent disabled:opacity-50"
            >
              <Icon name="trash" size={11} strokeWidth={2.4} /> {removing ? "Törlés…" : "Levétel"}
            </button>
          )}
          <ReportButton contentType="housing" contentId={listing.id} variant="link" />
        </div>
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-2">
        <h3 className="min-w-0 truncate text-[15px] font-extrabold tracking-[-0.01em] text-ink">
          {flag} {listing.city}
        </h3>
        <p className="shrink-0 text-[14px] font-extrabold text-primary">
          {formatHousingPrice(listing.type, listing.price, listing.currency)}
        </p>
      </div>

      <p className="mt-1 line-clamp-3 text-[12.5px] leading-snug text-ink-muted">{listing.description}</p>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-ink-faint">
          Feladva: {housingAgeLabel(listing.createdAt)}
        </span>

        {listing.own ? null : contact ? (
          <ContactValue value={contact} />
        ) : loading ? (
          /* Skeleton a kontakt betöltése alatt */
          <span className="h-9 w-40 animate-pulse rounded-pill bg-surface-alt" aria-hidden="true" />
        ) : (
          <button
            type="button"
            onClick={reveal}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-pill px-4 py-2 text-[12.5px] font-extrabold transition active:scale-[0.98]",
              isPro
                ? "bg-primary text-white shadow-card-hover"
                : "bg-star text-white shadow-card-hover",
            )}
          >
            <Icon name={isPro ? "phone" : "lock"} size={13} strokeWidth={2.4} />
            Kapcsolatfelvétel
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-right text-[11.5px] font-semibold text-accent">{error}</p>}

      <ProPaywallModal open={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </article>
  );
}

/** A felfedett elérhetőség — e-mailnél mailto:, telefonszerűnél tel: link. */
function ContactValue({ value }: { value: string }) {
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const phone = !email && /^[+\d][\d\s/()-]{5,}$/.test(value);
  const cls =
    "inline-flex max-w-[220px] items-center gap-1.5 truncate rounded-pill bg-success/10 px-3 py-2 text-[12.5px] font-extrabold text-success";
  if (email) return <a className={cls} href={`mailto:${value}`}><Icon name="mail" size={13} strokeWidth={2.4} />{value}</a>;
  if (phone) return <a className={cls} href={`tel:${value.replace(/[^+\d]/g, "")}`}><Icon name="phone" size={13} strokeWidth={2.4} />{value}</a>;
  return <span className={cls}><Icon name="user" size={13} strokeWidth={2.4} />{value}</span>;
}
