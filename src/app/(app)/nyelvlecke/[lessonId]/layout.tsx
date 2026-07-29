import { LESSONS } from "../data";
import { LESSONS_AT } from "../data-at";
import { LESSONS_DE } from "../data-de";
import { LESSONS_NL } from "../data-nl";
import { LESSONS_GB } from "../data-gb";
import { LESSONS_ES } from "../data-es";

// Tisztán statikus lecke-adat + generateStaticParams → SSG: mind a ~500 lecke
// build-time prerenderelt, NEM fogyaszt edge-route-ot (deploy-plafon). A page
// "use client" (kvíz-UI), ezért a segment-config ITT, a szerver-layoutban él.
// dynamicParams=false: ismeretlen lessonId → 404 a build-listából.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return [...LESSONS, ...LESSONS_AT, ...LESSONS_DE, ...LESSONS_NL, ...LESSONS_GB, ...LESSONS_ES].map((l) => ({
    lessonId: l.id,
  }));
}

export default function LessonLayout({ children }: { children: React.ReactNode }) {
  return children;
}
