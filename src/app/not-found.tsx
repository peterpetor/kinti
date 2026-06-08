import { GlobalAiSearch } from "@/components/views/global-ai-search";

export const runtime = "edge";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center gap-6 px-6 py-12 text-center pt-[calc(env(safe-area-inset-top)+3rem)]">
      <div>
        <p className="text-[64px] font-extrabold leading-none tracking-tight text-ink drop-shadow-sm">404</p>
        <p className="text-[18px] font-extrabold text-ink mt-2">Hoppá, eltévedtél?</p>
        <p className="text-[14px] leading-relaxed text-ink-muted mt-2 max-w-[280px] mx-auto text-balance">
          A keresett oldal nem található, de a Kinti asszisztens segít megtalálni, amire szükséged van!
        </p>
      </div>
      
      <div className="w-full animate-fade-up">
        <GlobalAiSearch />
      </div>

      <a
        href="/"
        className="mt-4 inline-flex items-center gap-2 rounded-pill bg-surface border border-line px-5 py-2.5 text-[13.5px] font-bold text-ink shadow-sm active:scale-95 transition-all"
      >
        Vissza a kezdőlapra
      </a>
    </div>
  );
}
