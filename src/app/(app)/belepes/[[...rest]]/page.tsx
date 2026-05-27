import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { Icon, KintiLogo, DropdownMenu } from "@/components/ui";

export const runtime = "edge";

export const metadata = { title: "Vállalkozói belépés" };

export default function LoginPage() {
  return (
    <div className="space-y-6 px-5 pb-4 pt-[calc(env(safe-area-inset-top)+2rem)] min-h-[calc(100dvh-70px)] flex flex-col">
      <main className="flex-1 grid place-items-center pb-10">
        <div className="w-full max-w-md relative animate-fade-up">
          <Link href="/vallalkozo" className="absolute -top-12 left-0 inline-flex items-center gap-1.5 text-[13px] font-bold text-ink-muted hover:text-ink transition-colors">
            <Icon name="arrowLeft" size={14} strokeWidth={2.4} />
            Vissza
          </Link>
          <SignIn signUpUrl="/regisztracio" />
        </div>
      </main>
    </div>
  );
}
