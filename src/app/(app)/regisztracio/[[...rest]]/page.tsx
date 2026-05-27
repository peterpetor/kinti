import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { Icon, KintiLogo, DropdownMenu } from "@/components/ui";

export const runtime = "edge";

export const metadata = { title: "Vállalkozói regisztráció" };

export default function SignUpPage() {
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

      <main className="flex-1 grid place-items-center pb-10">
        <div className="w-full max-w-md relative animate-fade-up">
          <Link href="/vallalkozo" className="absolute -top-12 left-0 inline-flex items-center gap-1.5 text-[13px] font-bold text-ink-muted hover:text-ink transition-colors">
            <Icon name="arrowLeft" size={14} strokeWidth={2.4} />
            Vissza
          </Link>
          <SignUp signInUrl="/belepes" />
        </div>
      </main>
    </div>
  );
}
