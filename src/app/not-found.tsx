export const runtime = "edge";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-[64px] font-extrabold leading-none tracking-tight text-ink">404</p>
      <p className="text-[17px] font-semibold text-ink">Az oldal nem található</p>
      <p className="text-[14px] text-ink-muted">
        A keresett tartalom nem létezik vagy törölték.
      </p>
      <a
        href="/"
        className="mt-2 inline-flex items-center gap-2 rounded-pill bg-primary px-5 py-2.5 text-[13.5px] font-bold text-white"
      >
        Kezdőlap
      </a>
    </div>
  );
}
