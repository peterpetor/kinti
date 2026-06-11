"use client";

import { useCheckout } from "@/hooks/useCheckout";
import { Icon, KintiLogo } from "@/components/ui";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export default function ProPage() {
  const { startCheckout, isLoading } = useCheckout();
  const { user } = useUser();

  const handleCheckout = (product: "kinti_pro_monthly" | "business_pro_monthly" | "job_featured") => {
    startCheckout({
      product,
      customerEmail: user?.emailAddresses?.[0]?.emailAddress,
      customData: {
        userId: user?.id || "anonymous",
      }
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-5 pb-20 pt-[calc(env(safe-area-inset-top)+2rem)]">
      {/* Header */}
      <header className="mb-10 text-center flex flex-col items-center">
        <Link href="/" className="mb-6 inline-block active:scale-95 transition-transform">
          <KintiLogo size={42} />
        </Link>
        <h1 className="text-3xl md:text-5xl font-black text-ink tracking-tight mb-4">
          Lépj szintet a <span className="text-primary">Kinti PRO</span>-val
        </h1>
        <p className="text-[16px] md:text-[18px] text-ink-muted max-w-xl text-balance">
          Svájci magyaroknak, szakembereknek és munkáltatóknak fejlesztett exkluzív csomagok, melyekkel maximalizálhatod a platform lehetőségeit.
        </p>
      </header>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Kinti PRO (Users) */}
        <div className="flex flex-col rounded-[32px] border-2 border-line bg-surface p-6 shadow-card hover:border-primary/30 transition-colors relative">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary/10 w-14 h-14 text-primary text-2xl">
            🎓
          </div>
          <h2 className="text-[22px] font-black text-ink">Kinti PRO</h2>
          <p className="text-[13px] text-ink-muted mt-2 mb-6 flex-1">
            Magánszemélyeknek. Nyisd meg az összes prémium modult és kalkulátort.
          </p>
          
          <div className="mb-6">
            <span className="text-3xl font-black text-ink">29 CHF</span>
            <span className="text-[14px] font-bold text-ink-muted"> / hó</span>
          </div>

          <ul className="space-y-3 mb-8 flex-1">
            <FeatureItem text="Teljes Svájci Német (Mundart) kurzus" />
            <FeatureItem text="Részletes Bér- és Lakbér Iránytű" />
            <FeatureItem text="Einbürgerung (Állampolgárság) Szimulátor" />
            <FeatureItem text="AI Interjú Szimulátor svájci cégekhez" />
            <FeatureItem text="Teljesen reklámmentes élmény" />
          </ul>

          <button
            onClick={() => handleCheckout("kinti_pro_monthly")}
            disabled={isLoading}
            className={cn(
              "w-full rounded-pill bg-primary py-3.5 text-[15px] font-black text-white shadow-card transition active:scale-[0.98]",
              isLoading && "opacity-60 cursor-not-allowed"
            )}
          >
            Válts Kinti PRO-ba
          </button>
        </div>

        {/* Szaknévsor PRO (Businesses) */}
        <div className="flex flex-col rounded-[32px] border-2 border-[#ff9600] bg-surface p-6 shadow-pop relative overflow-hidden transform md:-translate-y-4">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff9600]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
          <div className="absolute top-4 right-4 bg-[#ff9600] text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-pill shadow-sm">
            Legnépszerűbb
          </div>
          
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-[#ff9600]/10 w-14 h-14 text-[#ff9600] text-2xl">
            🚀
          </div>
          <h2 className="text-[22px] font-black text-[#ff9600]">Szaknévsor PRO</h2>
          <p className="text-[13px] text-ink-muted mt-2 mb-6 flex-1">
            Vállalkozóknak és szakembereknek. Szerezz több ügyfelet prémium láthatósággal.
          </p>
          
          <div className="mb-6">
            <span className="text-3xl font-black text-ink">19 CHF</span>
            <span className="text-[14px] font-bold text-ink-muted"> / hó</span>
          </div>

          <ul className="space-y-3 mb-8 flex-1">
            <FeatureItem text="Sárga PRO kiemelés a találati listákban" />
            <FeatureItem text="Garantált Top pozíció a kategóriádban" />
            <FeatureItem text="Egyedi profil borítókép feltöltése" />
            <FeatureItem text="Bővített referenciagaléria" />
            <FeatureItem text="Konkurencia kizárása a profilodról" />
          </ul>

          <button
            onClick={() => handleCheckout("business_pro_monthly")}
            disabled={isLoading}
            className={cn(
              "w-full rounded-pill bg-[#ff9600] py-3.5 text-[15px] font-black text-white shadow-[0_4px_0_0_#cc7700] transition active:translate-y-1 active:shadow-none hover:bg-[#e68600]",
              isLoading && "opacity-60 cursor-not-allowed translate-y-1 shadow-none"
            )}
          >
            Kiemelés Vásárlása
          </button>
        </div>

        {/* Kiemelt Állás (Employers) */}
        <div className="flex flex-col rounded-[32px] border-2 border-line bg-surface p-6 shadow-card hover:border-accent/30 transition-colors relative">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-accent/10 w-14 h-14 text-accent text-2xl">
            💼
          </div>
          <h2 className="text-[22px] font-black text-ink">Kiemelt Állás</h2>
          <p className="text-[13px] text-ink-muted mt-2 mb-6 flex-1">
            Munkáltatóknak. Találj gyorsabban megbízható magyar munkaerőt.
          </p>
          
          <div className="mb-6">
            <span className="text-3xl font-black text-ink">49 CHF</span>
            <span className="text-[14px] font-bold text-ink-muted"> / hirdetés</span>
          </div>

          <ul className="space-y-3 mb-8 flex-1">
            <FeatureItem text="30 napos sárga kiemelés a Job Boardon" />
            <FeatureItem text="Rögzített hely a lista legelején" />
            <FeatureItem text="Megjelenés a heti hírlevélben" />
            <FeatureItem text="Azonnali értesítés a releváns jelölteknek" />
          </ul>

          <button
            onClick={() => handleCheckout("job_featured")}
            disabled={isLoading}
            className={cn(
              "w-full rounded-pill border-2 border-ink py-3.5 text-[15px] font-black text-ink shadow-card transition hover:bg-ink hover:text-surface active:scale-[0.98]",
              isLoading && "opacity-60 cursor-not-allowed"
            )}
          >
            Hirdetés Kiemelése
          </button>
        </div>

      </div>

      {/* FAQ / Trust section */}
      <div className="mt-16 text-center">
        <p className="text-[13px] font-semibold text-ink-muted">
          A fizetéseket a biztonságos <strong className="text-ink">Lemon Squeezy</strong> dolgozza fel. Bármikor lemondható.
        </p>
      </div>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2.5">
      <div className="mt-0.5 grid shrink-0 h-4 w-4 place-items-center rounded-full bg-success/20 text-success">
        <Icon name="check" size={10} strokeWidth={4} />
      </div>
      <span className="text-[13.5px] font-semibold text-ink/80 leading-snug">{text}</span>
    </li>
  );
}
