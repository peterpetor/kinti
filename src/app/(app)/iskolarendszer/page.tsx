import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";
import { SchoolSystem } from "@/components/views/school-system";
import { CountryGuard } from "@/components/country-guard";

export const metadata = {
  title: "Iskolarendszer Útmutató — Svájc & Ausztria",
  description:
    "Vizuális útmutató az iskolarendszerhez kiköltöző szülőknek. Svájc: Kindergarten, Primarschule, Sekundar, kantononkénti eltérésekkel. Ausztria: nemzeti rendszer (Volksschule, Mittelschule, AHS).",
};

export default function IskolarendszerPage() {
  return (
    <div className="mx-auto max-w-md space-y-5 px-5 pt-[calc(env(safe-area-inset-top)+2rem)] pb-12">
      <CountryGuard feature="iskolarendszer" />
      <header className="flex items-center gap-3">
        <KintiLogo size={28} />
        <span className="text-[16px] font-extrabold tracking-tight text-ink truncate">
          Iskolarendszer
        </span>
        <Link
          href="/"
          aria-label="Vissza a Főoldalra"
          className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95 transition-transform"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
        </Link>
      </header>

      <SchoolSystem />
    </div>
  );
}
