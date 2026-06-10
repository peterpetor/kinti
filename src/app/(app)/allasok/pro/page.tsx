import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Icon } from "@/components/ui/icons";
import { KintiLogo } from "@/components/ui/kinti-logo";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { isPro } from "@/lib/subscriptions";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kinti Premium | Szakmai Nyelvlecke PRO",
  description: "Oldd fel a több mint 500+ svájci szakmai kifejezést és párbeszédet!",
};

/** A Lemon Squeezy checkout-link a bejelentkezett userId passthrough-jával. */
function checkoutUrl(baseUrl: string, userId: string): string {
  const sep = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${sep}checkout[custom][user_id]=${encodeURIComponent(userId)}`;
}

export default async function KintiProPage() {
  const { userId } = await auth();
  const base = getCloudflareEnv().LEMONSQUEEZY_CHECKOUT_URL ?? "";
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
          Ez a Mesterkurzus prémium tartalom. Fizess elő a Kinti Premiumra, és sajátítsd el a tökéletes svájci kommunikációt a munkahelyeden!
        </p>
      </div>

      <div className="rounded-3xl border-2 border-[#e3a233]/30 bg-surface text-left overflow-hidden shadow-card mb-8">
        <div className="bg-gradient-to-r from-[#e3a233]/10 to-transparent p-6 border-b border-line">
          <h2 className="text-[18px] font-extrabold text-ink">Mit tartalmaz a PRO csomag?</h2>
        </div>
        <ul className="p-6 space-y-4">
          <li className="flex gap-3">
            <span className="text-[#e3a233] shrink-0 mt-0.5"><Icon name="check" size={20} strokeWidth={3} /></span>
            <div>
              <strong className="text-[14px] text-ink block">500+ Új Szakmai Kifejezés</strong>
              <span className="text-[13px] text-ink-muted">Építőipar, Vendéglátás és Egészségügy mélyvíz.</span>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-[#e3a233] shrink-0 mt-0.5"><Icon name="check" size={20} strokeWidth={3} /></span>
            <div>
              <strong className="text-[14px] text-ink block">Komplett Munkahelyi Párbeszédek</strong>
              <span className="text-[13px] text-ink-muted">"Hogyan kérj fizetésemelést svájci németül?" hanganyaggal.</span>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-[#e3a233] shrink-0 mt-0.5"><Icon name="check" size={20} strokeWidth={3} /></span>
            <div>
              <strong className="text-[14px] text-ink block">Kinti Szakmai Nyelvi Oklevél</strong>
              <span className="text-[13px] text-ink-muted">A kurzus végén letölthető elismervény a CV-dhez.</span>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-[#e3a233] shrink-0 mt-0.5"><Icon name="check" size={20} strokeWidth={3} /></span>
            <div>
              <strong className="text-[14px] text-ink block">Korlátlan Hozzáférés</strong>
              <span className="text-[13px] text-ink-muted">Minden jövőbeni frissítés és új iparág ingyenes marad.</span>
            </div>
          </li>
        </ul>
        
        <div className="bg-surface-alt p-6 border-t border-line text-center">
          <p className="text-[13px] font-bold text-ink-muted uppercase tracking-wider mb-2">Havidíj</p>
          <div className="text-[36px] font-extrabold text-ink">
            4.90 <span className="text-[20px] text-ink-muted font-bold">CHF / hó</span>
          </div>
          <p className="text-[12px] text-ink-muted mt-1 mb-6">Bármikor lemondható. Rejtett költségek nélkül.</p>
          
          {alreadyPro ? (
            <div className="w-full rounded-full bg-success/15 py-4 text-center text-[15px] font-extrabold text-success">
              ✅ Aktív PRO előfizetésed van
            </div>
          ) : !userId ? (
            <Link
              href="/sign-in?redirect_url=/allasok/pro"
              className="flex w-full items-center justify-center rounded-full bg-[#e3a233] py-4 text-[16px] font-extrabold text-white shadow-lg shadow-[#e3a233]/20 transition-all hover:scale-[1.02] hover:bg-[#d68f20]"
            >
              Jelentkezz be az előfizetéshez
            </Link>
          ) : base ? (
            <a
              href={checkoutUrl(base, userId)}
              className="flex w-full items-center justify-center rounded-full bg-[#e3a233] py-4 text-[16px] font-extrabold text-white shadow-lg shadow-[#e3a233]/20 transition-all hover:scale-[1.02] hover:bg-[#d68f20]"
            >
              Előfizetek a Lemon Squeezy-vel
            </a>
          ) : (
            <div className="w-full rounded-full bg-surface-alt py-4 text-center text-[14px] font-bold text-ink-muted">
              Az előfizetés hamarosan elérhető lesz.
            </div>
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
