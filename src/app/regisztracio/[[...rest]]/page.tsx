import { SignUp } from "@clerk/nextjs";

export const runtime = "edge";

export const metadata = { title: "Regisztráció" };

export default function SignUpPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-5 py-12">
      <SignUp />
    </main>
  );
}
