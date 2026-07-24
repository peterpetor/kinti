"use client";

import { useEffect, useState } from "react";

/**
 * A látható (billentyűzet-tudatos) viewport-magasság. A mobil böngészők a
 * felugró billentyűzetnél a LAYOUT-viewportot (amiből a `100vh`/`fixed inset-0`
 * számol) NEM zsugorítják — csak a VIZUÁLIS viewportot (window.visualViewport).
 * Enélkül egy `fixed inset-0` overlay (bottom-sheet, modal) a billentyűzet ALÁ
 * kerülhet, amikor egy mezője fókuszban van. `active` — csak akkor figyeljük
 * (pl. amíg a modal nyitva van), hogy ne fusson felesleges listener háttérben.
 */
export function useVisualViewportHeight(active: boolean): number | null {
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    if (!active || !vv) return;
    const update = () => setHeight(vv.height);
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [active]);

  return height;
}
