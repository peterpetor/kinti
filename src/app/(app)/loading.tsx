import { ListPageSkeleton } from "@/components/skeleton";

/**
 * Csoport-szintű loading a TELJES (app) route-csoportra: minden dinamikus
 * oldal (főoldal, /profil, /b2b, /munkaltato, …), amelynek NINCS saját
 * loading.tsx-e, navigáció közben márka-skeletont mutat üres/fehér várakozás
 * helyett. A közelebbi loading.tsx-ek (szaknévsor, állások) felülírják;
 * a statikus oldalak azonnal renderelnek, ott nem villan.
 */
export default function Loading() {
  return <ListPageSkeleton cards={4} />;
}
