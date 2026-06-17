import { describe, it, expect, beforeEach } from "vitest";
import { cached, clearEdgeCache } from "@/lib/edge-cache";

beforeEach(() => clearEdgeCache());

describe("edge-cache: cached()", () => {
  it("TTL-en belül egyszer futtatja a fn-t, a cache-elt értéket adja vissza", async () => {
    let calls = 0;
    const fn = async () => { calls++; return calls; };

    const a = await cached("k", 10_000, fn);
    const b = await cached("k", 10_000, fn);

    expect(a).toBe(1);
    expect(b).toBe(1); // cache-elt, nem futott újra
    expect(calls).toBe(1);
  });

  it("ttlMs=0 → minden hívás újraszámol (nincs cache)", async () => {
    let calls = 0;
    const fn = async () => { calls++; return calls; };

    await cached("k", 0, fn);
    const second = await cached("k", 0, fn);

    expect(second).toBe(2);
    expect(calls).toBe(2);
  });

  it("külön kulcsok külön cache-t kapnak", async () => {
    const a = await cached("a", 10_000, async () => "A");
    const b = await cached("b", 10_000, async () => "B");
    expect(a).toBe("A");
    expect(b).toBe("B");
  });

  it("clearEdgeCache(kulcs) után újraszámol", async () => {
    let calls = 0;
    const fn = async () => { calls++; return calls; };

    await cached("k", 10_000, fn);
    clearEdgeCache("k");
    const after = await cached("k", 10_000, fn);

    expect(after).toBe(2);
    expect(calls).toBe(2);
  });

  it("párhuzamos hívások egyetlen fn-futásra dedupálódnak (nincs stampede)", async () => {
    let calls = 0;
    const fn = async () => {
      calls++;
      await new Promise((r) => setTimeout(r, 5));
      return calls;
    };

    const [a, b, c] = await Promise.all([
      cached("k", 10_000, fn),
      cached("k", 10_000, fn),
      cached("k", 10_000, fn),
    ]);

    expect(calls).toBe(1);
    expect(a).toBe(1);
    expect(b).toBe(1);
    expect(c).toBe(1);
  });

  it("hibánál nem cache-el — a következő hívás újrapróbál", async () => {
    let calls = 0;
    const fn = async () => {
      calls++;
      if (calls === 1) throw new Error("first fails");
      return calls;
    };

    await expect(cached("k", 10_000, fn)).rejects.toThrow("first fails");
    const second = await cached("k", 10_000, fn);

    expect(second).toBe(2);
    expect(calls).toBe(2);
  });
});
