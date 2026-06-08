import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";

export const runtime = "edge";
export const dynamic = "force-static";

export const metadata = {
  title: "Telekocsi (Fuvarok) — Svájc-Magyarország",
  description: "Oszd meg az utazásod költségeit vagy találj fuvart Svájc és Magyarország között.",
};

export default function RidesPage() {
  return (
    <div className="mx-auto max-w-md space-y-6 px-5 pt-[calc(env(safe-area-inset-top)+2rem)] pb-12">
      <header className="flex items-center gap-3">
        <Link
          href="/kozosseg"
          className="grid h-[38px] w-[38px] place-items-center rounded-[12px] border border-line bg-surface text-ink shadow-card transition-all active:scale-95"
        >
          <Icon name="arrowLeft" size={18} strokeWidth={2.4} />
        </Link>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <KintiLogo size={22} />
          <h1 className="text-[18px] font-extrabold tracking-tight text-ink truncate">
            Telekocsi (Fuvarok)
          </h1>
        </div>
      </header>

      <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-up">
        <div className="mb-4 grid h-16 w-16 place-items-center rounded-[16px] bg-primary/10 text-primary">
          <Icon name="car" size={28} strokeWidth={2} />
        </div>
        <h2 className="text-[20px] font-extrabold text-ink">
          Hamarosan érkezik!
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-muted text-balance max-w-[280px]">
          Az új svájci-magyar telekocsi modul fejlesztés alatt áll. Oszd meg az utazásod költségeit vagy találj megbízható fuvart hazafelé.
        </p>

        <div className="mt-8 rounded-card border border-line bg-surface-alt px-5 py-4 w-full">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-muted mb-2">
            Addig is csatlakozz
          </p>
          <p className="text-[13.5px] font-medium text-ink">
            A legfrissebb fuvarokért nézz be a{" "}
            <Link href="https://www.facebook.com/groups/svajci.magyarok" target="_blank" className="text-primary underline">
              Svájci Magyarok Facebook csoportba
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
