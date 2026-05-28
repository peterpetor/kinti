import Link from "next/link";
import { Icon, KintiLogo, DropdownMenu } from "@/components/ui";

export const runtime = "edge";

export const metadata = { title: "Vállalkozói fiók" };

export default function VallalkozoPage() {
  return (
    <div className="space-y-6 px-5 pb-4 pt-[calc(env(safe-area-inset-top)+2rem)] min-h-[calc(100dvh-70px)] flex flex-col">
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

      <main className="flex-1 flex flex-col justify-center pb-20">
        <div className="flex flex-col items-center gap-3 text-center mb-8 animate-fade-up">
          <div className="h-16 w-16 rounded-full bg-primary/10 text-primary grid place-items-center mb-2">
            <Icon name="user" size={32} strokeWidth={2} />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-accent/15 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-accent">
            Csak vállalkozóknak
          </span>
          <h1 className="text-[24px] font-extrabold tracking-tight text-ink">
            Vállalkozói felület
          </h1>
          <p className="text-[14px] leading-relaxed text-ink-muted max-w-xs">
            Ez a szekció a kinti közösséget kiszolgáló magyar nyelvű vállalkozóknak van fenntartva.
            Itt tudod beállítani a céges adatokat, nyitvatartást, beszélt nyelveket és kapcsolatot,
            amit a látogatók a Szaknévsorban látnak.
          </p>
        </div>

        <div className="w-full max-w-sm mx-auto space-y-3 animate-fade-up animate-delay-100">
          <Link
            href="/belepes"
            className="flex h-14 w-full items-center justify-center gap-2 rounded-pill bg-primary text-[15px] font-extrabold text-white shadow-card-hover active:scale-[0.98] transition-all"
          >
            <Icon name="user" size={16} strokeWidth={2.4} />
            Vállalkozói bejelentkezés
          </Link>
          <Link
            href="/regisztracio"
            className="flex h-14 w-full items-center justify-center gap-2 rounded-pill border-2 border-line bg-surface text-[15px] font-extrabold text-ink active:scale-[0.98] transition-all"
          >
            Új vállalkozói fiók
          </Link>
        </div>
      </main>
    </div>
  );
}
