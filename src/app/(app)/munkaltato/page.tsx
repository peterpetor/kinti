import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getEmployerByOwner } from "@/lib/repo";
import Link from "next/link";
import { Icon, KintiLogo, DropdownMenu } from "@/components/ui";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Munkáltatói Irányítópult" };

export default async function EmployerDashboardPage() {
  const { userId } = auth();
  
  if (!userId) {
    // Ha nincs bejelentkezve, Clerk login oldalra irányítjuk (vagy sign-in urlre)
    // De ideális esetben ez már middleware-rel is védve lenne, de biztos ami biztos:
    redirect("/sign-in?redirect_url=/munkaltato");
  }

  const employer = await getEmployerByOwner(userId);

  if (!employer) {
    // Ha be van jelentkezve, de nincs munkáltatói profilja, regisztrációs oldalra küldjük
    redirect("/munkaltato/regisztracio");
  }

  return (
    <div className="space-y-6 px-5 pb-4 pt-[calc(env(safe-area-inset-top)+2rem)] min-h-[calc(100dvh-70px)] flex flex-col">
      <header className="flex items-center gap-2.5">
        <div className="flex items-center gap-2">
          <KintiLogo size={28} />
          <span className="text-[22px] font-extrabold tracking-tight text-ink">Munkáltató</span>
        </div>
        <div className="flex-1" />
        <DropdownMenu />
      </header>

      <main className="flex-1 space-y-6">
        <div className="rounded-card border border-line bg-surface p-5 shadow-card animate-fade-up">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-[20px] font-extrabold tracking-tight text-ink">
                {employer.companyName}
              </h1>
              <p className="mt-1 text-[13px] text-ink-muted">
                {employer.contactEmail} · Csomag: <span className="font-bold text-ink">{employer.subscriptionTier.toUpperCase()}</span>
              </p>
            </div>
            <Link
              href="/munkaltato/profil"
              className="grid h-10 w-10 place-items-center rounded-xl bg-surface-alt text-ink hover:bg-line transition-colors"
            >
              <Icon name="more" size={18} />
            </Link>
          </div>
          
          <div className="mt-5 pt-5 border-t border-line/60">
            {employer.moderationStatus === 0 && (
              <div className="rounded-[12px] bg-accent/10 px-3 py-2.5 text-[12.5px] font-semibold text-accent mb-4">
                A munkáltatói fiókod jelenleg adminisztrátori jóváhagyásra vár. Amíg függőben van, az álláshirdetéseid nem jelennek meg publikusan.
              </div>
            )}
            {employer.moderationStatus === 2 && (
              <div className="rounded-[12px] bg-accent/20 px-3 py-2.5 text-[12.5px] font-semibold text-accent mb-4">
                A fiókodat az adminisztrátor elutasította. Kérlek vedd fel velünk a kapcsolatot.
              </div>
            )}
            
            <p className="text-[14px] text-ink-muted">
              Itt fognak megjelenni a feladott álláshirdetéseid és a beérkező jelentkezések.
            </p>
            
            <div className="mt-4">
              <button disabled className="flex h-12 w-full items-center justify-center gap-2 rounded-pill bg-primary/50 text-[14px] font-bold text-white cursor-not-allowed">
                <Icon name="plus" size={16} /> Új álláshirdetés feladása (Hamarosan)
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
