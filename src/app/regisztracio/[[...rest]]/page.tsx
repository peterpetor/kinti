import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { Icon } from "@/components/ui";

export const runtime = "edge";

export const metadata = { title: "Vállalkozói regisztráció" };

/**
 * A regisztráció KIZÁRÓLAG vállalkozóknak / szakembereknek szól. A közösségi
 * tagoknak (böngészés, hirdetésfeladás) NEM kell fiókot készíteniük.
 */
export default function SignUpPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-md px-5 py-10">
      <section className="mb-6 rounded-card border border-line bg-surface p-5 shadow-card">
        <div className="mb-3 inline-flex items-center gap-2 rounded-pill bg-primary/10 px-3 py-1 text-[11.5px] font-bold uppercase tracking-wide text-primary">
          <Icon name="user" size={13} strokeWidth={2.4} />
          Csak vállalkozóknak
        </div>
        <h1 className="text-[20px] font-extrabold tracking-tight text-ink">
          Vállalkozói regisztráció
        </h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
          Ez a regisztráció <strong className="text-ink">kizárólag vállalkozók
          és szakemberek</strong> számára szükséges — hogy a saját profilodat
          kezelni tudd a kintin.
        </p>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
          Ha csak <strong className="text-ink">böngésznél</strong>, vagy egyszeri{" "}
          <strong className="text-ink">hirdetést adnál fel</strong> (lakás,
          ajándékozás, alkalmi munka), <strong className="text-ink">nem kell
          regisztrálnod</strong> — menj inkább a Közösség / Hirdetőtáblára.
        </p>
        <Link
          href="/kozosseg"
          className="mt-3 inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface-alt px-3.5 py-1.5 text-[12px] font-bold text-ink"
        >
          <Icon name="arrowRight" size={13} strokeWidth={2.4} />
          Inkább hirdetést adnék
        </Link>

        <p className="mt-4 text-[11.5px] leading-snug text-ink-faint">
          A regisztrációval elfogadod az{" "}
          <Link href="/aszf" className="underline">ÁSZF</Link>-et és az{" "}
          <Link href="/adatvedelem" className="underline">
            Adatkezelési Tájékoztatót
          </Link>
          . A szolgáltatás 16. életévét betöltött személyek által vehető igénybe.
        </p>
      </section>

      <div className="grid place-items-center">
        <SignUp />
      </div>
    </main>
  );
}
