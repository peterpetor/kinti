import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";
import { EinburgerungQuiz } from "@/components/views/einburgerung-quiz";

export const runtime = "edge";
export const dynamic = "force-static";

export const metadata = {
  title: "Einbürgerung-szimulátor — svájci állampolgárság-felkészítő",
  description:
    "Játékos kvíz a svájci állampolgársági (Einbürgerung) tudás-szint tesztelésére. 15 kérdés, kantonális kérdésekkel. Tájékoztató jellegű — nem hivatalos.",
};

export default function AllampolgarsagPage() {
  return (
    <div className="mx-auto max-w-md space-y-5 px-5 pt-[calc(env(safe-area-inset-top)+2rem)] pb-12">
      <header className="flex items-center gap-3">
        <Link
          href="/"
          aria-label="Vissza a Főoldalra"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
        </Link>
        <KintiLogo size={28} />
        <span className="text-[16px] font-extrabold tracking-tight text-ink">
          Állampolgárság-teszt
        </span>
      </header>

      <EinburgerungQuiz />
    </div>
  );
}
