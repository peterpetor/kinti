import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Icon, ScreenHeader } from "@/components/ui";
import { getActiveRides } from "@/lib/repo";
import { RideCard } from "@/components/views/ride-card";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Telekocsi — magyaroknak Svájcban",
  description: "Szabad helyes utazások kint élő magyarok között, Svájc ↔ Magyarország és azon belül.",
};

export default async function TelekocsiPage() {
  const [rides, { userId }] = await Promise.all([getActiveRides(), auth()]);

  return (
    <div className="space-y-4 px-5 pb-8 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <ScreenHeader
        eyebrow="Telekocsi · Svájc ↔ Magyarország"
        title="Utazz együtt kintivel!"
      />

      {/* Feladás CTA */}
      <Link
        href="/telekocsi/feladas"
        className="flex items-center gap-3 rounded-card border border-dashed border-[#3a6ea5]/40 bg-[#3a6ea5]/10 p-3.5 transition active:scale-[0.99]"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[#3a6ea5] text-white text-lg">
          🚗
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-extrabold tracking-[-0.01em] text-ink">
            Van szabad helyed? Hirdesd meg!
          </div>
          <div className="text-[11.5px] text-ink-muted">
            Belépés szükséges — a kapcsolat telefonon megy
          </div>
        </div>
        <Icon name="chevR" size={14} className="text-[#3a6ea5]" />
      </Link>

      {/* Darabszám */}
      <p className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-muted">
        {rides.length} aktív fuvar
      </p>

      {/* Lista */}
      {rides.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-line bg-surface-alt px-6 py-12 text-center">
          <span className="text-3xl">🚗</span>
          <p className="text-[13.5px] font-semibold text-ink">Még nincs aktív fuvar</p>
          <p className="text-[12px] text-ink-muted">Légy te az első, aki meghirdeti!</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {rides.map((r) => (
            <RideCard key={r.id} ride={r} canDelete={r.posterUserId === userId} />
          ))}
        </div>
      )}
    </div>
  );
}
