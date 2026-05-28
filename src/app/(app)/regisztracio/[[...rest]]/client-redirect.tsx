"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function ClientRedirect({ target }: { target: string }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(target);
  }, [router, target]);

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center text-ink-muted">
      <span className="animate-pulse">Átirányítás folyamatban...</span>
    </div>
  );
}
