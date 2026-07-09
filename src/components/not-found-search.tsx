"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/ui";

/**
 * NotFoundSearch — egyszerű, INGYENES kereső a 404-oldalra. A korábbi AI-chatbot
 * (2 AI-hívás/404) helyett: a beírt kifejezéssel a Szaknévsor-keresőre navigál,
 * plusz pár gyors link. Nincs AI-költség, azonnali.
 */
const QUICK_LINKS: { href: string; label: string }[] = [
  { href: "/szaknevsor", label: "Szaknévsor" },
  { href: "/tudasbazis", label: "Tudásbázis" },
  { href: "/allasok", label: "Állások" },
];

export function NotFoundSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/szaknevsor?q=${encodeURIComponent(query)}` : "/szaknevsor");
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <form onSubmit={submit} className="relative flex items-center">
        <Icon name="search" size={20} className="absolute left-4 text-ink-muted" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Keress a Szaknévsorban (pl. fodrász, autószerelő)"
          className="h-[48px] w-full rounded-2xl border border-line bg-surface pl-11 pr-12 text-[14px] font-medium text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
        />
        <button
          type="submit"
          aria-label="Keresés"
          className="absolute right-2 grid h-[34px] w-[34px] place-items-center rounded-xl bg-primary text-white transition active:scale-95"
        >
          <Icon name="arrowRight" size={16} strokeWidth={2.5} />
        </button>
      </form>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {QUICK_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-pill border border-line bg-surface px-3.5 py-1.5 text-[12.5px] font-bold text-ink shadow-sm transition active:scale-95 hover:border-primary/30"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
