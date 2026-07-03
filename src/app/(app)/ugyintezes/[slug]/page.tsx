import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Icon } from "@/components/ui";
import { getChecklist, CHECKLISTS } from "@/lib/admin-checklists";
import { AdminChecklistView } from "@/components/views/admin-checklist-view";

// Tisztán statikus tartalom (admin-checklists.ts) + generateStaticParams →
// SSG, edge runtime NÉLKÜL (a runtime="edge" + force-static kombó incompatible-
// warningot adott, és feleslegesen edge function-ként emittálta — lásd a
// deploy-edge-route-plafon tanulságot). A dynamicParams=false kell: ismeretlen
// slug statikus 404-et kap, nem próbál runtime-renderelést (aminek lambda kellene).
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return CHECKLISTS.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const c = getChecklist(params.slug);
  if (!c) return { title: "Ügyintézés Varázsló" };
  return {
    title: `${c.title} — Ügyintézés Varázsló`,
    description: c.summary,
  };
}

export default function ChecklistDetailPage({ params }: { params: { slug: string } }) {
  const checklist = getChecklist(params.slug);
  if (!checklist) notFound();

  return (
    <div className="space-y-5 px-5 pb-12 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <header className="flex items-center gap-3">
        <span className="text-[14px] font-bold text-ink-muted truncate">
          Ügyintézés Varázsló
        </span>
        <Link
          href="/ugyintezes"
          aria-label="Vissza az ügyintézés-listához"
          className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
        </Link>
      </header>

      <AdminChecklistView checklist={checklist} />
    </div>
  );
}
