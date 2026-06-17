import { describe, it, expect, afterEach } from "vitest";
import { mediaImageUrl, mediaUrl } from "@/lib/media";

const ORIG = {
  resize: process.env.NEXT_PUBLIC_IMAGE_RESIZE,
  r2: process.env.NEXT_PUBLIC_R2_PUBLIC_URL,
};

afterEach(() => {
  process.env.NEXT_PUBLIC_IMAGE_RESIZE = ORIG.resize;
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL = ORIG.r2;
});

describe("mediaImageUrl", () => {
  it("null kulcs → null", () => {
    expect(mediaImageUrl(null)).toBeNull();
    expect(mediaImageUrl(undefined)).toBeNull();
    expect(mediaImageUrl("")).toBeNull();
  });

  it("flag KI → a sima mediaUrl-t adja (nincs viselkedés-változás)", () => {
    delete process.env.NEXT_PUBLIC_IMAGE_RESIZE;
    delete process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
    expect(mediaImageUrl("logos/x.png", { width: 160 })).toBe(mediaUrl("logos/x.png"));
    expect(mediaImageUrl("logos/x.png", { width: 160 })).toBe("/api/media/logos/x.png");
  });

  it("flag BE, zóna-relatív forrás → /cdn-cgi/image/...,format=auto/ + vezető / nélkül", () => {
    process.env.NEXT_PUBLIC_IMAGE_RESIZE = "1";
    delete process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
    const url = mediaImageUrl("logos/x.png", { width: 160 });
    expect(url).toBe("/cdn-cgi/image/width=160,fit=cover,quality=80,format=auto/api/media/logos/x.png");
  });

  it("flag BE, publikus R2-domén → abszolút forrás megmarad", () => {
    process.env.NEXT_PUBLIC_IMAGE_RESIZE = "true";
    process.env.NEXT_PUBLIC_R2_PUBLIC_URL = "https://cdn.kinti.app";
    const url = mediaImageUrl("logos/x.png", { width: 600, quality: 70, fit: "scale-down" });
    expect(url).toBe("/cdn-cgi/image/width=600,fit=scale-down,quality=70,format=auto/https://cdn.kinti.app/logos/x.png");
  });

  it("méret nélkül is működik (csak fit+quality+format)", () => {
    process.env.NEXT_PUBLIC_IMAGE_RESIZE = "1";
    delete process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
    expect(mediaImageUrl("a.png")).toBe("/cdn-cgi/image/fit=cover,quality=80,format=auto/api/media/a.png");
  });
});
