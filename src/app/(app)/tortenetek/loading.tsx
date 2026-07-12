import { ListPageSkeleton } from "@/components/skeleton";

/** /tortenetek betöltési váza — azonnali skeleton navigáláskor (natív érzet). */
export default function Loading() {
  return <ListPageSkeleton cards={4} />;
}
