import { Fragment } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { PublicRide } from "@/lib/repo";
import { phoneToWhatsapp } from "@/lib/rides";
import { RideDeleteButton } from "./ride-delete-button";
import { MyRideActions } from "./my-ride-actions";
import { RideRatingForm } from "./ride-rating-form";

/**
 * RideCard — telekocsi-kártya: útvonal, idő, helyek, ár, contact gombok.
 * Zero-liability: közvetlen tel: + WhatsApp link, nincs beépített chat.
 */

const HU_MON = ["jan.", "feb.", "márc.", "ápr.", "máj.", "jún.", "júl.", "aug.", "szept.", "okt.", "nov.", "dec."];

function fmtDateTime(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (m) {
    const [, , mo, day, h, min] = m;
    return `${HU_MON[Number(mo) - 1]} ${Number(day)}. ${h}:${min}`;
  }
  return iso;
}

export function RideCard({ ride, canDelete = false }: { ride: PublicRide; canDelete?: boolean }) {
  // WhatsApp: ha külön WA-szám van megadva, azt használjuk; egyébként a telefont.
  const waNum = phoneToWhatsapp(ride.contactWhatsapp || ride.contactPhone);

  return (
    <article className="rounded-card border border-line bg-surface p-4 shadow-card space-y-3 overflow-hidden">
      {/* Útvonal (indulás → [megállók] → érkezés) */}
      <div className="flex items-start gap-2">
        <span className={cn(
          "mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-[12px] text-lg",
          ride.isRequest ? "bg-[#e67e22]/15 text-[#e67e22]" : "bg-[#3a6ea5]/15 text-[#3a6ea5]"
        )}>
          {ride.isRequest ? "🙋‍♂️" : "🚗"}
        </span>
        <div className="min-w-0 flex-1">
          {/* flex-wrap + gap-x-1: sortörés szabad, mert minden szakasz külön inline elem.
              A korábbi nested <span>-ek bezárt struktúrája (whitespace nélkül) tiltotta a
              törést és horizontálisan kilógott a kártya mobilon. */}
          <div className="flex flex-wrap items-baseline gap-x-1 text-[15px] font-extrabold tracking-[-0.01em] text-ink leading-tight break-words">
            <span className="break-words">{ride.departureCity}</span>
            {ride.waypoints.map((wp, i) => (
              <Fragment key={i}>
                <span className="text-ink-faint">→</span>
                <span className={cn("break-words", ride.isRequest ? "text-[#e67e22]" : "text-[#3a6ea5]")}>
                  {wp.city}
                </span>
              </Fragment>
            ))}
            <span className="text-ink-faint">→</span>
            <span className="break-words">{ride.destinationCity}</span>
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px] font-semibold text-ink-muted">
            <span className="flex items-center gap-1">
              <Icon name="calendar" size={11} strokeWidth={2.2} />
              {fmtDateTime(ride.departureTime)}
            </span>
            <span className="flex items-center gap-1">
              <Icon name="users" size={11} strokeWidth={2.2} />
              {ride.isRequest ? `Keres: ${ride.seats} fő` : `${ride.seats} hely`}
            </span>
            {ride.priceText && (
              <span className="font-bold text-primary">{ride.priceText}</span>
            )}
          </div>
        </div>
      </div>

      {/* Megjegyzés */}
      {ride.notes && (
        <p className="text-[13px] leading-relaxed text-ink-muted whitespace-pre-wrap">
          {ride.notes}
        </p>
      )}

      {/* Feladó + jelvény */}
      <div className="flex items-center gap-2 text-[12.5px] text-ink-muted">
        <span className={cn(
          "grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold",
          ride.isRequest ? "bg-[#e67e22]/15 text-[#e67e22]" : "bg-[#3a6ea5]/15 text-[#3a6ea5]"
        )}>
          {ride.posterName.charAt(0).toUpperCase()}
        </span>
        <span className="font-semibold text-ink">{ride.posterName}</span>
        {ride.badge === "legend_driver" && (
          <span className="inline-flex items-center gap-0.5 rounded-pill bg-[#f39c12]/15 px-2 py-0.5 text-[10px] font-extrabold text-[#d68910]">
            🏆 Legenda Sofőr
          </span>
        )}
        {ride.badge === "super_driver" && (
          <span className="inline-flex items-center gap-0.5 rounded-pill bg-[#3a6ea5]/15 px-2 py-0.5 text-[10px] font-extrabold text-[#3a6ea5]">
            🚗 Szuper Sofőr
          </span>
        )}
        {ride.badge === "active_driver" && (
          <span className="inline-flex items-center gap-0.5 rounded-pill bg-success/15 px-2 py-0.5 text-[10px] font-extrabold text-success">
            ✅ Aktív Sofőr
          </span>
        )}
      </div>

      {/* Értékelés */}
      {ride.rating != null && (
        <div className="flex items-center gap-1 mt-1">
          <Icon name="star" size={14} className="text-[#f1c40f]" filled />
          <span className="text-[12.5px] font-bold text-ink">{ride.rating.toFixed(1)}</span>
          <span className="text-[11.5px] text-ink-muted">({ride.reviews} értékelés)</span>
        </div>
      )}

      {/* Kapcsolat gombok (zero-liability: tel + WhatsApp, nincs chat) */}
      <div className="flex gap-2">
        <a
          href={`tel:${ride.contactPhone}`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-pill bg-primary py-2.5 text-[13px] font-bold text-white shadow-card transition active:scale-[0.98]"
        >
          <Icon name="phone" size={14} strokeWidth={2.2} /> Hívás
        </a>
        <a
          href={`https://wa.me/${waNum}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-pill bg-[#25D366] py-2.5 text-[13px] font-bold text-white shadow-card transition active:scale-[0.98]"
        >
          <Icon name="send" size={14} strokeWidth={2.2} /> WhatsApp
        </a>
      </div>

      <div className="pt-1">
        <RideRatingForm targetPhone={ride.contactPhone} isRequest={ride.isRequest} />
      </div>

      {/* Saját fuvar → Módosítás + Törlés (kliens-oldalon, localStorage alapján).
          A Clerk-belépett régi userek számára a canDelete (RideDeleteButton) is ott
          marad — ők azonnali törlést kapnak owner-azonosítás alapján. */}
      <MyRideActions rideId={ride.id} />
      {canDelete && (
        <div className="flex justify-end border-t border-line/30 pt-2">
          <RideDeleteButton id={ride.id} />
        </div>
      )}

      {/* Jogi disclaimer */}
      <p className="text-center text-[10px] leading-snug text-ink-faint">
        A Kinti platform az utazásért és a felek közötti megállapodásért felelősséget nem vállal.
      </p>
    </article>
  );
}
