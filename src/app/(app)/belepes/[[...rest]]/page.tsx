import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { Icon, KintiLogo, DropdownMenu } from "@/components/ui";

export const runtime = "edge";

export const metadata = { title: "Vállalkozói belépés" };

/**
 * A belépés KIZÁRÓLAG vállalkozóknak / szakembereknek szól (saját profil
 * kezeléséhez). A közösségi tagoknak (böngészés, hirdetésfeladás) nem kell.
 */
export default function SignInPage() {
  return (
    <div className="space-y-6 px-5 pb-4 pt-[calc(env(safe-area-inset-top)+2rem)]">
      {/* fejléc */}
      <header className="flex items-center gap-2.5">
        <div className="flex items-center gap-2">
          <KintiLogo size={28} />
          <span className="text-[22px] font-extrabold tracking-tight text-ink">kinti</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/switzerland-flag.png"
            alt="Svájc"
            className="h-[18px] w-[18px] rounded-[4px] object-contain select-none"
          />
        </div>
        <div className="flex-1" />
        <DropdownMenu />
      </header>

      <main className="py-2">
        <section className="mb-6 rounded-card border border-line bg-surface p-5 shadow-card">
        <div className="mb-3 inline-flex items-center gap-2 rounded-pill bg-primary/10 px-3 py-1 text-[11.5px] font-bold uppercase tracking-wide text-primary">
          <Icon name="user" size={13} strokeWidth={2.4} />
          Csak vállalkozóknak
        </div>
        <h1 className="text-[20px] font-extrabold tracking-tight text-ink">
          Vállalkozói belépés
        </h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
          A profilkezelés <strong className="text-ink">kizárólag vállalkozók
          és szakemberek</strong> számára van fenntartva. Ha még nincs
          fiókod, regisztrálj — vagy menj vissza a kintizéshez.
        </p>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
          Hirdetést <strong className="text-ink">regisztráció nélkül</strong>{" "}
          is feladhatsz — a Hirdetőtáblán.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/kozosseg"
            className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface-alt px-3.5 py-1.5 text-[12px] font-bold text-ink"
          >
            <Icon name="arrowRight" size={13} strokeWidth={2.4} />
            Inkább hirdetést adnék
          </Link>
          <Link
            href="/regisztracio"
            className="inline-flex items-center gap-1.5 rounded-pill bg-primary px-3.5 py-1.5 text-[12px] font-bold text-white"
          >
            Regisztráció
          </Link>
        </div>
      </section>

      <div className="grid place-items-center">
        <SignIn />
      </div>
      </main>
    </div>
  );
}
