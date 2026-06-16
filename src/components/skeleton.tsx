import { cn } from "@/lib/cn";

/**
 * Skeleton-építőelemek a route-szintű loading.tsx-ekhez. A blokkok finom
 * pulzálással jelzik a betöltést, és az oldalváz nagyjából a valódi tartalom
 * elrendezését követi (kevesebb „ugrálás" betöltéskor).
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-md bg-[rgba(28,61,46,0.08)]", className)}
    />
  );
}

/** A nézetek közös kerete (safe-area + space-y), aria-busy a kisegítőknek. */
function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="pt-[calc(env(safe-area-inset-top)+2rem)]"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Betöltés…</span>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function HeaderSkeleton() {
  return (
    <div className="px-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>
    </div>
  );
}

function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-card border border-line bg-surface p-4 shadow-card", className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-5 w-12 rounded-pill" />
      </div>
      <div className="mt-3 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

/** Lista-oldal váza (Szaknévsor, Állások, Közösség): fejléc + szűrő-chipek + kártyák. */
export function ListPageSkeleton({ cards = 5 }: { cards?: number }) {
  return (
    <Screen>
      <HeaderSkeleton />
      <div className="flex gap-2 overflow-hidden px-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 shrink-0 rounded-pill" />
        ))}
      </div>
      <div className="space-y-3 px-5 pb-24">
        {Array.from({ length: cards }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </Screen>
  );
}

/** Részlet-oldal váza (vállalkozás/esemény): vissza + hero + chipek + kártyák. */
export function DetailPageSkeleton() {
  return (
    <Screen>
      <div className="px-5">
        <Skeleton className="h-9 w-24 rounded-pill" />
      </div>
      <div className="px-5">
        <div className="rounded-card border border-line bg-surface p-5 shadow-card">
          <div className="flex items-center gap-3">
            <Skeleton className="h-14 w-14 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Skeleton className="h-7 w-24 rounded-pill" />
            <Skeleton className="h-7 w-20 rounded-pill" />
            <Skeleton className="h-7 w-16 rounded-pill" />
          </div>
        </div>
      </div>
      <div className="space-y-3 px-5 pb-24">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-2/3" />
        <CardSkeleton className="mt-2" />
      </div>
    </Screen>
  );
}
