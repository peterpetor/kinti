import { describe, it, expect } from "vitest";
import { splashMetaDataNelkul } from "../../scripts/twa-splash-kikapcsol.mjs";

/**
 * A natív TWA-betöltőképernyő kikapcsolásának őre.
 *
 * ⚠️⚠️ MIÉRT: az `android/` mappa gitignore-olt és a `bubblewrap update`
 * minden alkalommal ÚJRAGENERÁLJA a manifestet a splash meta-datával együtt.
 * A javítás tehát nem egy bekommitolható fájl, hanem egy transzformáció —
 * a teszt EZT a transzformációt őrzi, egy rögzített manifest-részleten.
 *
 * ⚠️ A TÖRTÉNET, hogy ne kelljen újra megtanulni: 1.8-ban a splash KÉPÉT
 * cseréltem átlátszóra, abban a hitben, hogy alóla átlátszik az app saját
 * animált betöltő-jelzője. Nem látszik át: a natív splash ELTAKARJA a
 * Custom Tabot, és amíg látszik, a weblap még el sem indult. A felhasználó
 * ezért 1.8-ban egy üres, világos képernyőt kapott. A képet nem elég
 * kicserélni — a KÉPERNYŐT kell kikapcsolni.
 */

/** A Bubblewrap 1.25.0 által generált LauncherActivity-részlet. */
const MANIFEST_RESZLET = `
        <activity android:name="LauncherActivity"
            android:alwaysRetainTaskState="true"
            android:exported="true">
            <meta-data android:name="android.support.customtabs.trusted.DEFAULT_URL"
                android:value="@string/launchUrl" />

            <meta-data
                android:name="android.support.customtabs.trusted.STATUS_BAR_COLOR"
                android:resource="@color/colorPrimary" />

            <meta-data android:name="android.support.customtabs.trusted.SPLASH_IMAGE_DRAWABLE"
                android:resource="@drawable/splash"/>

            <meta-data android:name="android.support.customtabs.trusted.SPLASH_SCREEN_BACKGROUND_COLOR"
                android:resource="@color/backgroundColor"/>

            <meta-data android:name="android.support.customtabs.trusted.SPLASH_SCREEN_FADE_OUT_DURATION"
                android:value="@integer/splashScreenFadeOutDuration"/>

            <meta-data android:name="android.support.customtabs.trusted.FILE_PROVIDER_AUTHORITY"
                android:value="@string/providerAuthority"/>
        </activity>
`;

describe("TWA natív betöltőképernyő kikapcsolása", () => {
  const { xml, eltavolitva } = splashMetaDataNelkul(MANIFEST_RESZLET);

  it("⚠️ mind a HÁROM splash meta-data eltűnik", () => {
    expect(eltavolitva).toHaveLength(3);
    expect(xml).not.toMatch(/SPLASH_IMAGE_DRAWABLE|SPLASH_SCREEN_BACKGROUND_COLOR|SPLASH_SCREEN_FADE_OUT_DURATION/);
  });

  it("⚠️ a TÖBBI meta-data érintetlen — nem szabad túl sokat levágni", () => {
    // A minta korábbi, mohó változata a szomszédos elemeket is elvitte volna.
    for (const kulcs of ["DEFAULT_URL", "STATUS_BAR_COLOR", "FILE_PROVIDER_AUTHORITY"]) {
      expect(xml, `${kulcs} eltűnt`).toContain(kulcs);
    }
    expect(xml).toContain("@string/launchUrl");
    expect(xml).toContain("@color/colorPrimary");
    expect(xml).toContain("@string/providerAuthority");
  });

  it("az activity-elem nyitva és zárva marad", () => {
    expect(xml).toContain('<activity android:name="LauncherActivity"');
    expect(xml).toContain("</activity>");
  });

  it("kétszer lefuttatva ugyanaz jön ki (idempotens)", () => {
    // A `twa:update` minden kiadásnál lefut; egy nem-idempotens transzformáció
    // a második futásnál csendben megcsonkíthatná a manifestet.
    const masodszor = splashMetaDataNelkul(xml);
    expect(masodszor.eltavolitva).toEqual([]);
    expect(masodszor.xml).toBe(xml);
  });
});
