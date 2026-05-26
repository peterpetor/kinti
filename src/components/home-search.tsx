"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchBar } from "@/components/ui";

/**
 * HomeSearch — főoldali kereső input. Enter (vagy a jobb oldali nyíl-gomb) →
 * `/szaknevsor?q=<query>`. Üres input → csak `/szaknevsor`. A szaknevsor oldali
 * ExploreView az URL `?q` paraméterből veszi az induló szűrőt.
 */
export function HomeSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function go() {
    const trimmed = q.trim();
    const target = trimmed
      ? `/szaknevsor?q=${encodeURIComponent(trimmed)}`
      : "/szaknevsor";
    router.push(target);
  }

  return <SearchBar value={q} onChange={setQ} onSubmit={go} />;
}
