import Link from "next/link";
import { notFound } from "next/navigation";
import { KintiLogo } from "@/components/ui";
import { EventManageForm } from "@/components/views/event-manage-form";
import { getEventByManageToken } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Esemény kezelése",
  robots: { index: false, follow: false },
};

export default async function EventManagePage({ params }: { params: { token: string } }) {
  const event = await getEventByManageToken(params.token);
  if (!event) notFound();

  return (
    <div className="mx-auto max-w-md space-y-5 px-5 pt-[calc(env(safe-area-inset-top)+2rem)] pb-12">
      <header className="flex items-center gap-3">
        <KintiLogo size={28} />
        <span className="text-[16px] font-extrabold tracking-tight text-ink">Esemény kezelése</span>
      </header>

      <div className="rounded-card border border-line bg-surface-alt/60 px-4 py-3 text-[12px] leading-relaxed text-ink-muted">
        <strong className="text-ink">{event.title}</strong> — ez a kezelő oldal csak ezzel a
        linkkel érhető el. Tedd el (könyvjelző / email).
        {event.status === "pending_confirm" && (
          <> Az eseményed még email-megerősítésre vár.</>
        )}
        {event.status === "pending_admin" && (
          <> Az eseményed admin-jóváhagyásra vár.</>
        )}
      </div>

      <EventManageForm event={event} token={params.token} />

      <Link href="/kozosseg" className="block text-[12.5px] font-semibold text-ink-muted underline">
        ← Vissza a Piacra
      </Link>
    </div>
  );
}
