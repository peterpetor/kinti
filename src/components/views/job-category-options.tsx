import { JOB_CATEGORY_GROUPS } from "@/lib/job-categories";

/**
 * Szakma-opciók szektoronkénti <optgroup>-okba rendezve — bármely <select>-be
 * beilleszthető (a saját placeholder/„Összes szakma" <option> UTÁN). Így az 50+
 * elemű lista is böngészhető marad (mobilon a natív választó a csoport-fejléceket
 * is mutatja). Nincs állapota → kliens- és szerver-komponensben is működik.
 */
export function JobCategoryOptions() {
  return (
    <>
      {JOB_CATEGORY_GROUPS.map((g) => (
        <optgroup key={g.id} label={g.label}>
          {g.items.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.label}
            </option>
          ))}
        </optgroup>
      ))}
    </>
  );
}
