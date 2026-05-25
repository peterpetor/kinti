import { SignIn } from "@clerk/nextjs";

export const runtime = "edge";

export const metadata = { title: "Belépés" };

export default function SignInPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-5 py-12">
      <SignIn />
    </main>
  );
}
