import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Icon } from "@/components/ui/icons";
import { KintiLogo } from "@/components/ui/kinti-logo";
import { isPro } from "@/lib/subscriptions";
import { ProFeatures } from "./ProFeatures";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kinti Premium | Kinti PRO",
  description: "Oldd fel az összes prémium modult — AI munkainterjú-szimulátor, CV-audit, állampolgárság-szimulátor és minden jövőbeni PRO funkció egy havidíjért.",
};

export default async function KintiProPage() {
  const { userId } = await auth();
  const alreadyPro = userId ? await isPro(userId) : false;

  return (
    <div className="mx-auto max-w-xl px-5 pt-[calc(env(safe-area-inset-top)+3rem)] pb-24 text-center">
      <div className="mb-8">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-[20px] bg-gradient-to-br from-star to-[#d68f20] text-white shadow-xl shadow-star/20 mb-6">
          <Icon name="lock" size={36} strokeWidth={2.4} />
        </div>
        <h1 className="text-[28px] font-extrabold tracking-tight text-ink">
          Kinti <span className="text-star">PRO</span> Feloldása
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-muted px-4">
          Egy előfizetés, minden prémium modul. A Kinti PRO-val feloldod az összes
          PRO funkciót — nem modulonként fizetsz, hanem egyetlen havidíjért mindent megkapsz.
        </p>
      </div>

      <div className="rounded-3xl border-2 border-star/30 bg-surface text-left overflow-hidden shadow-card mb-8">
        <div className="bg-gradient-to-r from-star/10 to-transparent p-6 border-b border-line">
          <h2 className="text-[18px] font-extrabold text-ink">Mit tartalmaz a Kinti PRO?</h2>
        </div>
        <ProFeatures />

        <div className="bg-surface-alt p-6 border-t border-line text-center">
          <p className="text-[13px] font-bold text-ink-muted uppercase tracking-wider mb-2">Kinti PRO előfizetés</p>
          <div className="text-[36px] font-extrabold text-ink">
            19 <span className="text-[20px] text-ink-muted font-bold">€ / hó</span>
          </div>
          <p className="text-[12px] text-ink-muted mt-1 mb-6">Egy díj, minden PRO funkció. Bármikor lemondható, rejtett költségek nélkül.</p>
          
          {alreadyPro ? (
            <div className="w-full rounded-full bg-success/15 py-4 text-center text-[15px] font-extrabold text-success">
              ✅ Aktív PRO előfizetésed van
            </div>
          ) : (
            <Link
              href="/pro"
              className="flex w-full items-center justify-center rounded-full bg-star py-4 text-[16px] font-extrabold text-white shadow-lg shadow-star/20 transition-all hover:scale-[1.02] hover:bg-[#d68f20]"
            >
              Kinti PRO feloldása
            </Link>
          )}
        </div>
      </div>

      <Link
        href="/allasok/szakmai-szotar"
        className="inline-flex items-center gap-1.5 text-[14px] font-bold text-ink-muted hover:text-ink transition underline"
      >
        Mégsem, visszamegyek a szótárhoz
      </Link>
    </div>
  );
}
