import { AiInterviewSimulator } from "@/components/views/ai-interview-simulator";

export const metadata = {
  title: "AI Munkainterjú Szimulátor | Kinti",
  description: "Gyakorolj svájci munkainterjúkra mesterséges intelligenciával.",
};

export default function AiInterviewPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 pt-[calc(env(safe-area-inset-top)+2rem)] pb-24">
      <header className="mb-6">
        <h1 className="text-[24px] font-extrabold tracking-tight text-ink">
          Munkainterjú Szimulátor 🤖
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
          A svájci HR menedzserek más típusú kérdéseket tesznek fel, mint otthon. 
          Gyakorold a bemutatkozást és a válaszadást németül, stresszmentesen!
        </p>
      </header>

      <AiInterviewSimulator />
    </div>
  );
}
