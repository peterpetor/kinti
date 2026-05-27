import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { Icon, KintiLogo, DropdownMenu } from "@/components/ui";

export const runtime = "edge";

export const metadata = { title: "Vállalkozói belépés" };

export default function LoginPage() {
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
            Lépj be a fiókodba, hogy kezelni tudd a vállalkozásod adatait, 
            logóját, és a beérkezett értékeléseket.
          </p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
            Még nincs fiókod? A belépés gomb alatt a <strong className="text-ink">Regisztráció</strong> linkre kattintva létrehozhatod.
          </p>
          
          <div className="mt-4 flex gap-2">
            <Link
              href="/regisztracio"
              className="inline-flex items-center gap-1.5 rounded-pill bg-primary px-4 py-2 text-[12px] font-bold text-white shadow-card-hover"
            >
              <Icon name="user" size={14} strokeWidth={2.4} />
              Regisztráció
            </Link>
            <Link
              href="/szaknevsor/uj"
              className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface-alt px-4 py-2 text-[12px] font-bold text-ink"
            >
              <Icon name="plus" size={14} strokeWidth={2.4} />
              Cég feladása
            </Link>
          </div>
        </section>

        <div className="grid place-items-center">
          <SignIn signUpUrl="/regisztracio" />
        </div>
      </main>
    </div>
  );
}
