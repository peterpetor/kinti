/**
 * Kompatibilitási re-export: a KintiLogo a `./logo` modulban él, de több hely
 * a `@/components/ui/kinti-logo` alpath-ról importálja. Ez a modul feloldja azt
 * az importot, hogy ne törjön a build.
 */
export { KintiLogo } from "./logo";
