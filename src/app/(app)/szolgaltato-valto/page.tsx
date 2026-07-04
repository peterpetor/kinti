import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";
import { ProviderSwitchWizard } from "@/components/views/provider-switch-wizard";
import { CountryGuard } from "@/components/country-guard";

export const dynamic = "force-static";

export const metadata = {
  title: "Szolgáltató Váltó — egészségbiztosítás, internet, mobil, bank, áram",
  description:
    "Mikor és hogyan érdemes szolgáltatót váltani Svájcban, Ausztriában, Németországban és Hollandiában — felmondási idők, levél-minták és alternatív szolgáltatók egészségbiztosítás, internet, mobil, bank és áram kategóriában.",
};

export default function SzolgaltatoValtoPage() {
  return (
    <div className="mx-auto max-w-md space-y-5 px-5 pt-[calc(env(safe-area-inset-top)+2rem)] pb-12">
      <CountryGuard feature="szolgaltato-valto" />
      <header className="flex items-center gap-3">
        <KintiLogo size={28} />
        <span className="text-[16px] font-extrabold tracking-tight text-ink truncate">
          Szolgáltató Váltó
        </span>
        <Link
          href="/"
          aria-label="Vissza a Főoldalra"
          className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95 transition-transform"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
        </Link>
      </header>

      <ProviderSwitchWizard />
    </div>
  );
}
