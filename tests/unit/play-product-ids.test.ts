import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PRODUCT_ENTITLEMENT, type ProductType } from "@/lib/payments-config";

/**
 * A Google Play termékazonosító-lánc őre.
 *
 * ⚠️ MIÉRT KELL (2026-08-02): a hirdetés-kiemelés Androidon azért nem működött,
 * mert a `job_featured` termék NEM LÉTEZETT a Play Console-ban. A kód hibátlan
 * volt — a hiba NÉMA: a Play egyszerűen nem ad vissza semmit az ismeretlen
 * SKU-ra, se hibaüzenet, se log.
 *
 * Ugyanez a némaság áll fenn, ha a lánc BÁRMELY pontján elcsúszik a sztring:
 *   payments-config (ProductType)  →  usePaddlePrices PRODUCTS (ár-lekérdezés)
 *   →  purchaseOnPlay `sku`        →  /api/payments/play/verify (entitlement)
 *   →  Play Console termékazonosító
 *
 * A Console-t innen nem tudjuk ellenőrizni, de a KÓD-oldali láncot igen.
 */
const SRC = resolve(process.cwd(), "src");
const read = (p: string) => readFileSync(resolve(SRC, p), "utf8");

const HOOK = read("hooks/usePaddlePrices.ts");
const PLAY = read("lib/play-billing.ts");
const VERIFY = read("app/api/payments/play/verify/route.ts");

const TERMEKEK = Object.keys(PRODUCT_ENTITLEMENT) as ProductType[];

describe("Play — a termékazonosítók végig egyeznek", () => {
  it("három termék van, és mindegyiknek van entitlementje", () => {
    expect(TERMEKEK.sort()).toEqual(
      ["business_pro_monthly", "job_featured", "kinti_pro_monthly"],
    );
    for (const t of TERMEKEK) {
      expect(PRODUCT_ENTITLEMENT[t], `${t} entitlement`).toBeTruthy();
    }
  });

  it("mindhárom termék szerepel az ár-lekérdezésben", () => {
    // Enélkül a UI statikus árat mutatna — és épp ez okozta, hogy az app
    // „19 €"-t írt ki, miközben a Play 8690 Ft-ot vont le.
    const lista = HOOK.slice(HOOK.indexOf("const PRODUCTS"), HOOK.indexOf("const PRODUCTS") + 220);
    for (const t of TERMEKEK) {
      expect(lista, `${t} hiányzik a PRODUCTS listából`).toContain(t);
    }
  });

  it("⚠️ az Android-ág ténylegesen lekéri a Play árait (nem lép ki üresen)", () => {
    // Korábban itt csak `if (isAndroidApp()) return;` állt — halott
    // `getPlayPrices` mellett.
    expect(HOOK).toContain("getPlayPrices");
    const androidAg = HOOK.slice(HOOK.indexOf("if (isAndroidApp())"));
    expect(androidAg.slice(0, 400)).toContain("getPlayPrices");
  });

  it("a vásárlás a ProductType-ot adja át SKU-ként (nem külön névtér)", () => {
    // `data: { sku: product }` — a Play Console azonosítójának EZZEL kell egyeznie.
    expect(PLAY).toMatch(/sku:\s*product/);
  });

  it("a szerver-igazolás kezeli az egyszeri terméket is", () => {
    expect(VERIFY).toContain('entitlement === "job_featured"');
    // Egyszeri terméknél product-state kell, nem subscription-state.
    expect(VERIFY).toContain("getProductState");
    expect(VERIFY).toContain("getSubscriptionState");
  });

  it("⚠️ replay-védelem: a 30 napos kiemelés ne legyen újra-aktiválható", () => {
    // A restore-flow ugyanazt a tokent újraküldheti — enélkül minden
    // újraküldés újabb 30 napot adna ingyen.
    expect(VERIFY).toMatch(/if \(existing\) return NextResponse\.json\(\{ ok: true, duplicate: true \}\)/);
  });

  it("⚠️ tulajdonjog-ellenőrzés: csak a SAJÁT hirdetésed emelhető ki", () => {
    // A kliens customData-ja csak hint — a szerver a valódi tulajdonost nézi.
    expect(VERIFY).toContain("getEmployerByOwner");
    expect(VERIFY).toContain("job.employerId !== employer.id");
  });
});
