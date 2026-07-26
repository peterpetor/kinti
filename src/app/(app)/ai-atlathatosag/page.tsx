import { AiAtlathatosagBody } from "./ai-atlathatosag-body";

// Tiszta statikus tartalom → force-static, runtime NÉLKÜL (nem fogyaszt
// edge-route-ot — lásd deploy-edge-route-plafon tanulság).
export const dynamic = "force-static";

export const metadata = {
  title: "AI-átláthatóság — hogyan használunk mesterséges intelligenciát",
  description:
    "A Kinti AI-funkcióinak átlátható leírása: mit csinálnak, milyen modellekkel, mik a korlátaik, és hogyan felügyeljük őket. EU AI Act megfelelési tájékoztató.",
};

export default function AiAtlathatosagPage() {
  return <AiAtlathatosagBody />;
}
