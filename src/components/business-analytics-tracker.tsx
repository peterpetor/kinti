"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { recordCallForReview } from "@/lib/review-prompt";
import { decodeContact } from "@/lib/contact-obfuscate";
import { waNumber, WA_PREFILL } from "@/lib/wa-phone";
import { Icon } from "@/components/ui/icons";

/**
 * Best-effort, fire-and-forget POST-ek a vállalkozói analitikához:
 *   • <TrackBusinessView businessId> — profil-megnyitás (mount-on egyszer)
 *   • <TelLink businessId phone>     — telefon-kattintás
 *
 * A fetch sose throw-ol, a kliens sose tapasztal hibát. A szerver szintén
 * 200-zal felel mindig (lásd /api/businesses/[id]/track).
 *
 * A TelLink emellett KLIENS-oldalon naplózza a hívást (localStorage), amiből
 * a kezdőlapi vélemény-kérő kártya dolgozik (lib/review-prompt) — ehhez a
 * `businessName` prop kell; név nélkül a naplózás kimarad.
 */

async function track(businessId: string, kind: "view" | "phone"): Promise<void> {
  try {
    await fetch(`/api/businesses/${businessId}/track`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind }),
      keepalive: true,
    });
  } catch {
    // szándékos némaság
  }
}

export function WaLink({
  businessId,
  phone,
  country,
  businessName,
  className,
  children,
}: {
  businessId: string;
  phone: string;
  country?: string | null;
  businessName?: string;
  className?: string;
  children: ReactNode;
}) {
  const num = waNumber(phone, country);
  if (!num) return null;
  return (
    <a
      href={`https://wa.me/${num}?text=${encodeURIComponent(WA_PREFILL)}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        // A WhatsApp-kontakt is kapcsolatfelvétel → ugyanaz az analitika-kind
        // (nincs séma-változás) + a hívás-utáni vélemény-kérő is jár érte.
        void track(businessId, "phone");
        if (businessName) recordCallForReview(businessId, businessName);
      }}
      className={className}
    >
      {children}
    </a>
  );
}

export function TrackBusinessView({ businessId }: { businessId: string }) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    void track(businessId, "view");
  }, [businessId]);
  return null;
}

export function TelLink({
  businessId,
  phone,
  businessName,
  stopPropagation = false,
  className,
  children,
  "aria-label": ariaLabel,
}: {
  businessId: string;
  phone: string;
  /** A cég neve a hívás-utáni vélemény-kérőhöz; ha nincs, csak analitika fut. */
  businessName?: string;
  /** Kártyán belüli gombnál (pl. térkép-kártya) ne buborékoljon a kattintás. */
  stopPropagation?: boolean;
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
}) {
  return (
    <a
      href={`tel:${phone.replace(/\s/g, "")}`}
      aria-label={ariaLabel}
      onClick={(e) => {
        if (stopPropagation) e.stopPropagation();
        void track(businessId, "phone");
        if (businessName) recordCallForReview(businessId, businessName);
      }}
      className={className}
    >
      {children}
    </a>
  );
}

/**
 * PhoneReveal — scrape-védett telefonszám-felfedés. A szám NINCS benne a HTML-ben:
 * kattintásra kéri le a rate-limitelt /api/businesses/[id]?contact=1 végpontról
 * (elhomályosítva), dekódolja, majd rendes tel:-linkké (TelLink) alakul, ami a
 * hívást az analitikába és a vélemény-kérőbe is beszámítja.
 *
 *   • variant="button" — feliratos gomb (cégoldal): „Telefonszám mutatása" → a szám
 *   • variant="icon"   — csak ikon (térkép-kártya): felfedés után hívható ikon
 */
export function PhoneReveal({
  businessId,
  businessName,
  variant = "button",
  className,
  country,
  waClassName,
}: {
  businessId: string;
  businessName?: string;
  variant?: "button" | "icon";
  className?: string;
  /** A cég országa (CH/AT/DE/NL) — a helyi formátumú szám WhatsApp-konverziójához. */
  country?: string | null;
  /** Ha megadva (button variantnál), felfedés után WhatsApp-gomb is megjelenik. */
  waClassName?: string;
}) {
  const [phone, setPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function reveal() {
    if (loading || phone) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/businesses/${businessId}?contact=1`);
      if (r.ok) {
        const d = (await r.json()) as { phone?: string | null };
        if (d.phone) setPhone(decodeContact(d.phone));
      }
    } catch {
      // néma — a felhasználó újrapróbálhatja
    }
    setLoading(false);
  }

  if (phone) {
    return (
      <>
        <TelLink
          businessId={businessId}
          phone={phone}
          businessName={businessName}
          stopPropagation={variant === "icon"}
          aria-label={variant === "icon" ? `${businessName ?? "Vállalkozás"} hívása` : undefined}
          className={className}
        >
          <Icon name="phone" size={16} strokeWidth={2.2} />
          {variant === "button" && <span>{phone}</span>}
        </TelLink>
        {/* WhatsApp — a kinti magyar közösség fő csatornája. Csak akkor jelenik
            meg, ha a szám biztonsággal nemzetközi alakra hozható (waNumber). */}
        {variant === "button" && waClassName && (
          <WaLink
            businessId={businessId}
            phone={phone}
            country={country}
            businessName={businessName}
            className={waClassName}
          >
            <Icon name="whatsapp" size={16} strokeWidth={2.1} />
            <span>WhatsApp</span>
          </WaLink>
        )}
      </>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        if (variant === "icon") e.stopPropagation();
        void reveal();
      }}
      disabled={loading}
      aria-label={variant === "icon" ? "Telefonszám mutatása" : undefined}
      className={className}
    >
      <Icon name="phone" size={16} strokeWidth={2.2} />
      {variant === "button" && <span>{loading ? "Betöltés…" : "Telefonszám mutatása"}</span>}
    </button>
  );
}
