import Link from "next/link";
import { notFound } from "next/navigation";
import { KintiLogo } from "@/components/ui";
import { RideManageForm } from "@/components/views/ride-manage-form";
import { getRideByManageToken } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Fuvar kezelése",
  robots: { index: false, follow: false },
};

export default async function RideManagePage({ params }: { params: { token: string } }) {
  const ride = await getRideByManageToken(params.token);
  if (!ride) notFound();

  return (
    <div className="mx-auto max-w-md space-y-5 px-5 pt-[calc(env(safe-area-inset-top)+2rem)] pb-12">
      <header className="flex items-center gap-3">
        <KintiLogo size={28} />
        <span className="text-[16px] font-extrabold tracking-tight text-ink">Fuvar kezelése</span>
      </header>

      <div className="rounded-card border border-line bg-surface-alt/60 px-4 py-3 text-[12px] leading-relaxed text-ink-muted">
        <strong className="text-ink">{ride.departureCity} → {ride.destinationCity}</strong> — ez a
        kezelő oldal csak ezzel a linkkel érhető el. Tedd el a böngésződ könyvjelzői közé.
      </div>

      <RideManageForm ride={ride} token={params.token} />

      <Link href="/telekocsi" className="block text-[12.5px] font-semibold text-ink-muted underline">
        ← Vissza a Telekocsihoz
      </Link>
    </div>
  );
}
