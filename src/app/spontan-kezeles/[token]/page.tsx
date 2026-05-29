import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon, KintiLogo } from "@/components/ui";
import { getSpontaneousByManageToken } from "@/lib/repo";
import { SpontaneousManageActions } from "@/components/views/spontaneous-manage-actions";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Spontán meetup kezelése", robots: { index: false } };

const HU_MON = ["jan.", "feb.", "márc.", "ápr.", "máj.", "jún.", "júl.", "aug.", "szept.", "okt.", "nov.", "dec."];

function fmtDT(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  if (m) return `${HU_MON[Number(m[2]) - 1]} ${Number(m[3])}. ${m[4]}:${m[5]}`;
  return iso;
}

export default async function SpontanKezelesPage({ params }: { params: { token: string } }) {
  const item = await getSpontaneousByManageToken(params.token);
  if (!item) notFound();

  const isExpired = new Date(item.expiresAt) < new Date();

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 px-6 pt-[calc(env(safe-area-inset-top)+2rem)] pb-10">
      <header className="flex items-center gap-3">
        <KintiLogo size={28} />
        <span className="text-[18px] font-extrabold tracking-tight text-ink">
          Spontán meetup kezelése
        </span>
      </header>

      <section className="rounded-card border-2 border-[#9b59b6]/30 bg-gradient-to-br from-[#fdf4ff] to-surface p-5 shadow-card">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="text-base">🎲</span>
          <span className="text-[10.5px] font-bold uppercase tracking-wide text-[#9b59b6]">
            Spontán meetup
          </span>
          {isExpired && (
            <span className="ml-auto rounded-md bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
              lejárt
            </span>
          )}
        </div>

        <h2 className="text-[17px] font-extrabold leading-snug tracking-tight text-ink text-pretty">
          {item.title}
        </h2>

        <dl className="mt-3 space-y-1.5 text-[13px]">
          <div className="flex gap-2">
            <Icon name="calendar" size={13} strokeWidth={2.2} className="text-[#9b59b6] mt-0.5" />
            <span className="font-semibold">{fmtDT(item.meetupTime)}</span>
          </div>
          <div className="flex gap-2">
            <Icon name="pin" size={13} strokeWidth={2.2} className="text-[#9b59b6] mt-0.5" />
            <span className="font-semibold">{item.locationName}</span>
            {item.cantonCode && <span className="text-ink-muted">· {item.cantonCode}</span>}
          </div>
          <div className="flex gap-2">
            <Icon name="users" size={13} strokeWidth={2.2} className="text-[#9b59b6] mt-0.5" />
            <span>max {item.maxPeople} fő</span>
          </div>
          <div className="flex gap-2">
            <Icon name="phone" size={13} strokeWidth={2.2} className="text-[#9b59b6] mt-0.5" />
            <span>{item.contactPhone}</span>
          </div>
        </dl>

        {item.notes && (
          <p className="mt-3 whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink-muted border-t border-dashed border-line pt-3">
            {item.notes}
          </p>
        )}
      </section>

      <SpontaneousManageActions token={params.token} id={item.id} />

      <Link
        href="/kozosseg"
        className="self-start text-[12.5px] font-semibold text-ink-muted underline"
      >
        ← Vissza a közösséghez
      </Link>
    </div>
  );
}
