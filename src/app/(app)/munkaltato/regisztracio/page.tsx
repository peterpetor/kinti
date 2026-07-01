import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getEmployerByOwner, getBusinessByOwner } from "@/lib/repo";
import { KintiLogo } from "@/components/ui";
import { EmployerRegForm } from "@/components/views/employer-reg-form";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Munkáltatói Regisztráció" };

export default async function EmployerRegistrationPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/belepes?redirect_url=/munkaltato/regisztracio");
  }

  const existing = await getEmployerByOwner(userId);
  if (existing) {
    redirect("/munkaltato");
  }

  // Közös cégprofil-élmény: ha a usernek már van Szaknévsor-vállalkozása, az adatait
  // behozzuk ide (adat-újrahasznosítás) — így egy cégnek nem kell mindent újra beírnia.
  const business = await getBusinessByOwner(userId);

  return (
    <div className="mx-auto max-w-md space-y-6 px-5 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <header className="flex items-center gap-2">
        <KintiLogo size={28} />
        <span className="text-[22px] font-extrabold tracking-tight text-ink">Regisztráció</span>
      </header>

      <section className="rounded-card border border-line bg-surface p-5 shadow-card animate-fade-up">
        <h1 className="text-[18px] font-extrabold tracking-tight text-ink">
          Üdvözlünk a Kinti Toborzásban!
        </h1>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-muted text-pretty">
          Hozd létre munkáltatói fiókodat pár lépésben. A fiók létrehozása után rögtön
          feladhatod az első álláshirdetésed — a hirdetések rövid ellenőrzés után jelennek meg.
        </p>

        <div className="mt-5">
          <EmployerRegForm
            initial={
              business
                ? {
                    companyName: business.name,
                    contactEmail: business.contactEmail ?? "",
                    description: business.blurb ?? "",
                  }
                : undefined
            }
            prefillFrom={business?.name ?? null}
          />
        </div>
      </section>
    </div>
  );
}
