"use client";

import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { PublicSpontaneous } from "@/lib/repo";
import { handleFromId } from "@/lib/handle";
import { OwnPostBadge } from "@/components/own-post-badge";

const HU_MON = ["jan.", "feb.", "márc.", "ápr.", "máj.", "jún.", "júl.", "aug.", "szept.", "okt.", "nov.", "dec."];
const HU_WEEKDAY_SHORT = ["v", "h", "k", "sze", "cs", "p", "szo"];

function fmtMeetup(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  const d = new Date(t);
  const today = new Date();
  const sameDay =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow =
    d.getFullYear() === tomorrow.getFullYear() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getDate() === tomorrow.getDate();
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  if (sameDay) return `Ma ${time}`;
  if (isTomorrow) return `Holnap ${time}`;
  return `${HU_WEEKDAY_SHORT[d.getDay()]}. ${HU_MON[d.getMonth()]} ${d.getDate()}. ${time}`;
}

function digitsOnly(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

/**
 * SpontaneousCard — egy mikro-esemény lista-elem.
 * Pici, vidám design — nem komoly esemény-kártya.
 */
export function SpontaneousCard({ item }: { item: PublicSpontaneous }) {
  const handle = item.poster?.trim() ? item.poster : handleFromId(item.id);
  const waDigits = digitsOnly(item.contactWhatsapp || item.contactPhone);

  return (
    <article className="rounded-card border-2 border-[#9b59b6]/25 bg-gradient-to-br from-[#fdf4ff] to-surface p-3.5 shadow-card space-y-2.5">
      {/* Fejléc — emoji + idő + canton */}
      <div className="flex items-start gap-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-[#9b59b6] text-white text-base">
          🎲
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-extrabold uppercase tracking-wide text-[#9b59b6]">
              {fmtMeetup(item.meetupTime)}
            </span>
            {item.cantonCode && (
              <span className="inline-flex items-center gap-0.5 rounded-md border border-line bg-surface-alt px-1.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wide text-ink-muted">
                🇨🇭 {item.cantonCode}
              </span>
            )}
            <span className="text-[10.5px] font-bold text-ink-muted">
              👥 max {item.maxPeople} fő
            </span>
            <OwnPostBadge type="spontan" id={item.id} />
          </div>
          <h3 className="mt-1 text-[14.5px] font-extrabold leading-tight tracking-[-0.01em] text-ink text-pretty">
            {item.title}
          </h3>
        </div>
      </div>

      {/* Hely */}
      <div className="flex items-center gap-1.5 text-[12.5px] text-ink-muted">
        <Icon name="pin" size={12} strokeWidth={2.2} className="shrink-0 text-[#9b59b6]" />
        <span className="font-semibold text-ink">{item.locationName}</span>
      </div>

      {/* Megjegyzés */}
      {item.notes && (
        <p className="text-[13px] leading-relaxed text-ink-muted whitespace-pre-wrap">
          {item.notes}
        </p>
      )}

      {/* Alsó: handle + contact gombok */}
      <div className="flex items-center gap-2 border-t border-dashed border-line pt-2.5">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-[#9b59b6]/15 text-[10px] font-bold text-[#9b59b6]">
          {handle.charAt(0).toUpperCase()}
        </span>
        <span className="text-[12px] font-semibold text-ink truncate">{handle}</span>
        <span className="flex-1" />
        <a
          href={`tel:${item.contactPhone}`}
          aria-label="Hívás"
          className="inline-flex items-center gap-1 rounded-lg bg-surface border border-line px-2.5 py-1.5 text-[11.5px] font-bold text-ink active:scale-95"
        >
          <Icon name="phone" size={11} strokeWidth={2.5} />
          Hívás
        </a>
        {waDigits.length >= 6 && (
          <a
            href={`https://wa.me/${waDigits}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className={cn(
              "inline-flex items-center gap-1 rounded-lg bg-[#25D366] hover:bg-[#1da851] px-2.5 py-1.5 text-[11.5px] font-bold text-white active:scale-95",
            )}
          >
            💬 WhatsApp
          </a>
        )}
      </div>
    </article>
  );
}
