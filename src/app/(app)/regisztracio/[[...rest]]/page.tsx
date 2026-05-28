import Link from "next/link";
import { SignUp, SignedIn, SignedOut } from "@clerk/nextjs";
import { Icon, KintiLogo, DropdownMenu } from "@/components/ui";
import { ClientRedirect } from "./client-redirect";

export const runtime = "edge";

export const metadata = { title: "Vállalkozói regisztráció" };

export default function SignUpPage() {
  return (
    <div className="space-y-6 px-5 pb-4 pt-[calc(env(safe-area-inset-top)+2rem)] min-h-[calc(100dvh-70px)] flex flex-col">
      <main className="flex-1 flex flex-col items-center pt-4 pb-[calc(env(safe-area-inset-bottom)+6rem)]">
        <div className="w-full max-w-md animate-fade-up">
          <Link href="/vallalkozo" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-ink-muted hover:text-ink transition-colors">
            <Icon name="arrowLeft" size={14} strokeWidth={2.4} />
            Vissza
          </Link>
          <div className="flex justify-center w-full">
            <SignedIn>
              {/* Ha a Service Worker gyorsítótárából betöltődne az oldal, de a kliens már be van lépve */}
              <ClientRedirect target="/profil" />
            </SignedIn>
            <SignedOut>
              <SignUp
                path="/regisztracio"
                routing="path"
                signInUrl="/belepes"
                fallbackRedirectUrl="/profil"
              />
            </SignedOut>
          </div>
        </div>
      </main>
    </div>
  );
}

