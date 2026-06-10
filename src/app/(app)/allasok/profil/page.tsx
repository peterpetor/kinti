import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";
import { WorkerProfileForm } from "@/components/views/worker-profile-form";
import { getWorkerProfileByUser } from "@/lib/repo";
import type { Metadata } from "next";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Munkavállalói profil — kinti.app",
  description:
    "Töltsd fel a CV-det és add meg az elérhetőségedet. A svájci magyar munkáltatók megtalálnak téged a kinti.app Job Board rendszerén keresztül.",
};

export default async function WorkerProfilePage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/belepes?redirect_url=/allasok/profil");
  }

  const [profile, user] = await Promise.all([
    getWorkerProfileByUser(userId),
    currentUser(),
  ]);

  const defaultEmail =
    profile?.email ?? user?.emailAddresses?.[0]?.emailAddress ?? "";
  const defaultName =
    profile?.fullName ?? [user?.firstName, user?.lastName].filter(Boolean).join(" ");

  return (
    <div className="mx-auto max-w-md space-y-6 px-5 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <header className="flex items-center gap-3">
        <Link
          href="/allasok"
          className="grid h-[38px] w-[38px] place-items-center rounded-[12px] border border-line bg-surface text-ink shadow-card transition-all active:scale-95"
        >
          <Icon name="arrowLeft" size={18} strokeWidth={2.4} />
        </Link>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <KintiLogo size={22} />
          <h1 className="text-[18px] font-extrabold tracking-tight text-ink truncate">
            Munkavállalói profil
          </h1>
        </div>
      </header>

      {/* Hero kártya */}
      <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-primary to-[#2e6a4e] p-5 text-white shadow-pop">
        <div className="absolute -bottom-10 -right-8 h-36 w-36 rounded-full bg-white/[0.06]" />
        <div className="relative">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-pill bg-white/[0.18] px-2.5 py-1 text-[10.5px] font-bold tracking-wide">
            <Icon name="users" size={11} strokeWidth={2.4} />
            Munkáltatói hálózat
          </span>
          <h2 className="text-[20px] font-extrabold leading-tight tracking-tight text-balance">
            Találjanak meg a munkáltatók
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed opacity-90 text-pretty">
            Töltsd fel az adataidat és a CV-det — svájci magyar munkáltatók közvetlenül megkereshetnek, ha illik a profilodhoz egy állás.
          </p>
        </div>
      </div>

      <section className="rounded-card border border-line bg-surface p-5 shadow-card">
        <WorkerProfileForm
          initial={{
            fullName: defaultName,
            email: defaultEmail,
            phone: profile?.phone ?? "",
            searchable: profile?.searchable ?? true,
            hasCv: !!profile?.cvKey,
          }}
        />
      </section>
    </div>
  );
}
