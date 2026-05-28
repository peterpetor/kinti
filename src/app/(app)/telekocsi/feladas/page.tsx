import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Icon, ScreenHeader } from "@/components/ui";
import { RideForm } from "@/components/views/ride-form";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Fuvar feladása" };

/**
 * /telekocsi/feladas — a telekocsi-hirdetés feladása (Clerk-belépés szükséges).
 * Ha nincs belépve, a belepes oldalra redirect-áljuk.
 */
export default async function TelekocsiFeldasPage() {
  const { userId } = await auth();
  if (!userId) redirect("/belepes?redirect_url=/telekocsi/feladas");

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
        Add meg az útvonalat, az időpontot és a telefonszámod — a jelentkezők
        közvetlenül <strong className="text-ink">hívással vagy WhatsApp-on</strong> keresnek meg.
        A fuvar az indulás + 24 óra után automatikusan eltűnik.
      </div>

      <RideForm />
    </div>
  );
}
