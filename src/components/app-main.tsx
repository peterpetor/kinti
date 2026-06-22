"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { PageTransition } from "@/components/page-transition";
import { isImmersiveRoute } from "@/lib/immersive-routes";

/**
 * Az (app) fő tartalom-kerete. Normál nézeteknél alul ~9rem nav-rezerv (a lebegő
 * TabBar-nak); immerzív lecke-lejátszóknál NINCS TabBar, így a padding is elmarad
 * (különben felesleges üres görgetés maradna az alsó CTA alatt).
 */
export function AppMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const immersive = isImmersiveRoute(pathname);
  return (
    <div
      className={cn(
        "mx-auto min-h-dvh max-w-md overflow-x-clip",
        !immersive && "pb-[calc(env(safe-area-inset-bottom)+9rem)]",
      )}
    >
      <PageTransition>{children}</PageTransition>
    </div>
  );
}
