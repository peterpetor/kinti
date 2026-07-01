"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui";

/**
 * History-alapú vissza-gomb. Oda visz vissza, AHONNAN jöttél (böngésző-előzmény),
 * nem egy fix oldalra — így a menüből (bárhonnan) elérhető oldalak (pl. Értesítések)
 * nem dobnak félre egy hardcode-olt célra. Ha nincs használható előzmény, a
 * `fallback` oldalra navigál.
 */
export function BackButton({
  fallback = "/",
  className,
  label = "Vissza",
}: {
  fallback?: string;
  className?: string;
  label?: string;
}) {
  const router = useRouter();

  const onClick = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  };

  return (
    <button type="button" onClick={onClick} aria-label={label} className={className}>
      <Icon name="arrowLeft" size={18} strokeWidth={2.4} />
    </button>
  );
}
