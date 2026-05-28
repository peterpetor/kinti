import Link from "next/link";
import { Icon, ScreenHeader } from "@/components/ui";
import { RideForm } from "@/components/views/ride-form";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Fuvar feladása" };

/**
 * /telekocsi/feladas — telekocsi-hirdetés feladása (regisztráció NEM kötelező).
 * Belépett Clerk-user esetén a neve a fiókból jön, vendégként a form-ról.
 */
export default function TelekocsiFeldasPage() {
  return (
    <div className="px-5 pb-4 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <ScreenHeader
        title="Fuvar meghirdetése"
        left={
          <Link
            href="/telekocsi"
            aria-label="Vissza"
            className="grid h-9 w-9 place-items-center rounded-[12px] border border-line bg-surface text-ink"
          >
            <Icon name="arrowLeft" size={16} strokeWidth={2.2} />
          </Link>
        }
      />

      <div className="mb-4 rounded-card border border-line bg-surface-alt px-4 py-3 text-[12.5px] leading-relaxed text-ink-muted">
        <strong className="text-ink">Nincs regisztráció.</strong> Add meg az útvonalat, az
        időpontot, a neved és a telefonszámod — a jelentkezők közvetlenül{" "}
        <strong className="text-ink">hívással vagy WhatsApp-on</strong> keresnek meg.
        A fuvar az indulás + 24 óra után automatikusan eltűnik.
      </div>

      <RideForm />
    </div>
  );
}
