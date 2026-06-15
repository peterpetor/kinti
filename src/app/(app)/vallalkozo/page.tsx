import Link from "next/link";
import { Icon, KintiLogo, DropdownMenu } from "@/components/ui";

export const runtime = "edge";

export const metadata = { title: "Vállalkozói felület" };

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
            className="h-[36px] w-[36px] rounded-[6px] object-contain select-none"
          />
        </div>
        <div className="flex-1" />
        <DropdownMenu />
      </header>

      <main className="flex-1 pb-20">
        {/* Hero */}
        <section className="text-center mb-8 animate-fade-up">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 text-primary grid place-items-center mb-3">
            <Icon name="list" size={32} strokeWidth={2} />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-accent/15 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-accent">
            Csak svájci magyar vállalkozóknak
          </span>
          <h1 className="mt-3 text-[24px] font-extrabold tracking-tight text-ink">
            Vidd fel ingyen a vállalkozásod
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-ink-muted text-pretty">
            Sem regisztráció, sem email nem kell. Töltsd ki és küldd — kapsz egy{" "}
            <strong className="text-ink">kezelő-linket</strong> (QR-kód is jön), amivel bármikor szerkesztheted az adatokat.
          </p>
        </section>

        {/* Fő CTA: vállalkozás feladás (account-mentes) */}
        <div className="w-full max-w-sm mx-auto space-y-3 animate-fade-up animate-delay-100">
          <Link
            href="/szaknevsor/uj"
            className="flex h-14 w-full items-center justify-center gap-2 rounded-pill bg-primary text-[15px] font-extrabold text-white shadow-card-hover active:scale-[0.98] transition-all"
          >
            <Icon name="plus" size={16} strokeWidth={2.6} />
            Vállalkozás felvétele
          </Link>
          <p className="px-2 text-center text-[11.5px] leading-relaxed text-ink-faint">
            Beküldés után <strong className="text-ink">azonnal kapsz egy kezelő-linket</strong>{" "}
            (QR-kód is jön), amivel bármikor szerkesztheted az adatokat (logó, nyitvatartás,
            cím, kapcsolat, beszélt nyelvek, leírás), vagy törölheted a vállalkozást — nincs
            jelszó, nincs fiók, nincs email. A profil az{" "}
            <strong className="text-ink">admin ellenőrzése után jelenik meg</strong> a
            Szaknévsorban (általában 24 órán belül).
          </p>
        </div>

        {/* Elveszítetted a kezelő-linket? */}
        <div className="w-full max-w-sm mx-auto mt-8 rounded-card border border-line bg-surface-alt/60 p-4 animate-fade-up animate-delay-200">
          <p className="text-[12.5px] leading-relaxed text-ink-muted">
            <strong className="text-ink">Elveszítetted a kezelő-linket?</strong> Először nézd
            meg a böngésződ <Link href="/sajatjaim" className="font-bold text-primary underline">Saját posztjaim</Link>{" "}
            oldalát (ott automatikusan elmentődik). Ha az is üres, írj az{" "}
            <a href="mailto:info@kinti.app" className="font-bold text-primary underline">
              info@kinti.app
            </a>{" "}
            címre a vállalkozásod nevével — visszaküldjük neked a linket.
          </p>
        </div>

      </main>
    </div>
  );
}
