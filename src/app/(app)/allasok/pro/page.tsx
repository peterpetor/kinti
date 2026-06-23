import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Icon } from "@/components/ui/icons";
import { KintiLogo } from "@/components/ui/kinti-logo";
import { isPro } from "@/lib/subscriptions";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kinti Premium | Szakmai Nyelvlecke PRO",
  description: "Oldd fel a több mint 500+ svájci szakmai kifejezést és párbeszédet!",
};

export default async function KintiProPage() {
  const { userId } = await auth();
  const alreadyPro = userId ? await isPro(userId) : false;

  return (
    <div className="mx-auto max-w-xl px-5 pt-[calc(env(safe-area-inset-top)+3rem)] pb-24 text-center">
      <div className="mb-8">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-[20px] bg-gradient-to-br from-[#e3a233] to-[#d68f20] text-white shadow-xl shadow-[#e3a233]/20 mb-6">
          <Icon name="lock" size={36} strokeWidth={2.4} />
        </div>
        <h1 className="text-[28px] font-extrabold tracking-tight text-ink">
          Kinti <span className="text-[#e3a233]">PRO</span> Feloldása
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-muted px-4">
          Egy előfizetés, minden prémium modul. A Kinti PRO-val feloldod az összes
          PRO funkciót — nem modulonként fizetsz, hanem egyetlen havidíjért mindent megkapsz.
        </p>
      </div>

      <div className="rounded-3xl border-2 border-[#e3a233]/30 bg-surface text-left overflow-hidden shadow-card mb-8">
        <div className="bg-gradient-to-r from-[#e3a233]/10 to-transparent p-6 border-b border-line">
          <h2 className="text-[18px] font-extrabold text-ink">Mit tartalmaz a Kinti PRO?</h2>
        </div>
        <ul className="p-6 space-y-4">
          <li className="flex gap-3">
            <span className="text-[#e3a233] shrink-0 mt-0.5"><Icon name="check" size={20} strokeWidth={3} /></span>
            <div>
              <strong className="text-[14px] text-ink block">Teljes Szakmai Gyors-Szótár</strong>
              <span className="text-[13px] text-ink-muted">500+ svájci szakmai kifejezés és munkahelyi párbeszéd hanganyaggal.</span>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-[#e3a233] shrink-0 mt-0.5"><Icon name="check" size={20} strokeWidth={3} /></span>
            <div>
              <strong className="text-[14px] text-ink block">AI Munkainterjú Szimulátor + CV-audit</strong>
              <span className="text-[13px] text-ink-muted">Gyakorolj svájci cégek interjúira, és elemeztesd az önéletrajzod mesterséges intelligenciával.</span>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-[#e3a233] shrink-0 mt-0.5"><Icon name="check" size={20} strokeWidth={3} /></span>
            <div>
              <strong className="text-[14px] text-ink block">Svájci Német (Mundart) mesterkurzus + Einbürgerung szimulátor</strong>
              <span className="text-[13px] text-ink-muted">A teljes nyelvi és állampolgársági felkészülés egy helyen.</span>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-[#e3a233] shrink-0 mt-0.5"><Icon name="check" size={20} strokeWidth={3} /></span>
            <div>
              <strong className="text-[14px] text-ink block">Reklámmentes élmény + minden jövőbeni PRO modul</strong>
              <span className="text-[13px] text-ink-muted">Minden új funkció és frissítés az előfizetés része marad.</span>
            </div>
          </li>
        </ul>

        <div className="bg-surface-alt p-6 border-t border-line text-center">
          <p className="text-[13px] font-bold text-ink-muted uppercase tracking-wider mb-2">Kinti PRO előfizetés</p>
          <div className="text-[36px] font-extrabold text-ink">
            19 <span className="text-[20px] text-ink-muted font-bold">CHF / hó</span>
          </div>
          <p className="text-[12px] text-ink-muted mt-1 mb-6">Egy díj, minden PRO funkció. Bármikor lemondható, rejtett költségek nélkül.</p>
          
          {alreadyPro ? (
            <div className="w-full rounded-full bg-success/15 py-4 text-center text-[15px] font-extrabold text-success">
              ✅ Aktív PRO előfizetésed van
            </div>
          ) : (
            <Link
              href="/pro"
              className="flex w-full items-center justify-center rounded-full bg-[#e3a233] py-4 text-[16px] font-extrabold text-white shadow-lg shadow-[#e3a233]/20 transition-all hover:scale-[1.02] hover:bg-[#d68f20]"
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
