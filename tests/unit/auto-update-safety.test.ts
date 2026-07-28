import { describe, it, expect } from "vitest";
import {
  isDirtyField,
  hasUserInput,
  hasPlayingMedia,
  isSafeToReloadWith,
  type FieldLike,
} from "@/lib/auto-update-safety";

/**
 * ⚠️ Miért fontos ez a teszt: 2026-07-28 óta az app a user megkérdezése NÉLKÜL
 * frissül (a „Frissítés" gomb idegesítő volt — user-jelzés). Az EGYETLEN dolog,
 * ami megvédi a félig kitöltött űrlapokat (álláshirdetés, albérlet-börze,
 * német önéletrajz, élettörténet), ez a fék. Ha tévedésből `true`-t ad, valaki
 * elveszti a munkáját — ezért minden ága le van fedve.
 */
const input = (o: Partial<FieldLike> = {}): FieldLike => ({
  kind: "input",
  type: "text",
  value: "",
  defaultValue: "",
  ...o,
});
const textarea = (o: Partial<FieldLike> = {}): FieldLike => ({
  kind: "textarea",
  value: "",
  defaultValue: "",
  ...o,
});

describe("néma frissítés — mező-szintű döntés", () => {
  it("üres mező nem piszkos", () => {
    expect(isDirtyField(input())).toBe(false);
    expect(isDirtyField(textarea())).toBe(false);
  });

  it("⚠️ beírt szöveg PISZKOS (blokkolja a néma frissítést)", () => {
    expect(isDirtyField(input({ value: "Kiadó szoba Londonban" }))).toBe(true);
    expect(isDirtyField(textarea({ value: "Az én élettörténetem..." }))).toBe(true);
  });

  it("csak szóköz nem számít beírásnak", () => {
    expect(isDirtyField(input({ value: "   " }))).toBe(false);
    expect(isDirtyField(textarea({ value: "\n\t " }))).toBe(false);
  });

  it("szerverről előtöltött, ÉRINTETLEN mező nem piszkos", () => {
    // Szerkesztés-űrlap: ez az adat már mentve van, elvesztése nem gond.
    expect(isDirtyField(input({ value: "Meglévő cégnév", defaultValue: "Meglévő cégnév" }))).toBe(
      false,
    );
  });

  it("⚠️ de a MÓDOSÍTOTT előtöltött mező már piszkos", () => {
    expect(isDirtyField(input({ value: "Átírt cégnév", defaultValue: "Meglévő cégnév" }))).toBe(
      true,
    );
  });

  it("bepipált checkbox piszkos, az érintetlen nem", () => {
    expect(isDirtyField(input({ type: "checkbox", checked: false, defaultChecked: false }))).toBe(
      false,
    );
    expect(isDirtyField(input({ type: "checkbox", checked: true, defaultChecked: false }))).toBe(
      true,
    );
    // Előre bepipált, majd KIvett jelölés is user-döntés → piszkos.
    expect(isDirtyField(input({ type: "checkbox", checked: false, defaultChecked: true }))).toBe(
      true,
    );
  });

  it("rejtett/gomb típusú mezők SOSEM piszkosak", () => {
    for (const type of ["hidden", "submit", "button", "reset", "image"]) {
      expect(isDirtyField(input({ type, value: "csrf-token-123" })), type).toBe(false);
    }
  });

  it("a kereső/szűrő mező (data-auto-update-safe) nem piszkos", () => {
    expect(isDirtyField(input({ value: "fodrász", safeToDiscard: true }))).toBe(false);
    expect(isDirtyField(textarea({ value: "bármi", safeToDiscard: true }))).toBe(false);
  });

  it("a type kis/nagybetűre érzéketlen", () => {
    expect(isDirtyField(input({ type: "HIDDEN", value: "x" }))).toBe(false);
    expect(isDirtyField(input({ type: "CheckBox", checked: true }))).toBe(true);
  });
});

describe("néma frissítés — oldal-szintű döntés", () => {
  it("üres oldalon szabad frissíteni", () => {
    expect(isSafeToReloadWith([], [])).toBe(true);
  });

  it("⚠️ egyetlen piszkos mező az egész oldalt blokkolja", () => {
    const fields = [input(), input({ value: "félkész hirdetés" }), textarea()];
    expect(hasUserInput(fields)).toBe(true);
    expect(isSafeToReloadWith(fields, [])).toBe(false);
  });

  it("csupa üres mező nem blokkol", () => {
    const fields = [input(), textarea(), input({ type: "checkbox" })];
    expect(hasUserInput(fields)).toBe(false);
    expect(isSafeToReloadWith(fields, [])).toBe(true);
  });

  it("szóló hang blokkol, a megállított/lejátszott nem", () => {
    expect(hasPlayingMedia([{ paused: false, ended: false }])).toBe(true);
    expect(hasPlayingMedia([{ paused: true, ended: false }])).toBe(false);
    expect(hasPlayingMedia([{ paused: false, ended: true }])).toBe(false);
    expect(isSafeToReloadWith([], [{ paused: false, ended: false }])).toBe(false);
  });

  it("tiszta űrlap + néma lejátszó → frissíthet", () => {
    expect(isSafeToReloadWith([input(), textarea()], [{ paused: true, ended: false }])).toBe(true);
  });
});
