import { describe, it, expect } from "vitest";
import { renderStoryMarkdown, storyExcerpt, storySlug, escapeStoryHtml } from "@/lib/story-md";

describe("renderStoryMarkdown — XSS-védelem (UGC = ellenséges bemenet)", () => {
  it("nyers HTML escape-elve jelenik meg, sosem tagként", () => {
    const html = renderStoryMarkdown(`<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>`);
    expect(html).not.toContain("<script");
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");
  });

  it("idézőjel is escape-elve (attribútum-kitörés ellen)", () => {
    const html = renderStoryMarkdown(`" onmouseover="alert(1)`);
    expect(html).toContain("&quot;");
    expect(html).not.toContain('" onmouseover');
  });

  it("markdown-link szintaxis NEM lesz anchor (SEO-spam védelem)", () => {
    const html = renderStoryMarkdown("Nézd meg: [ide kattints](https://spam.example) és https://spam.example");
    expect(html).not.toContain("<a ");
    expect(html).toContain("https://spam.example");
  });
});

describe("renderStoryMarkdown — támogatott formázás", () => {
  it("címsor, félkövér, dőlt, lista, bekezdés", () => {
    const html = renderStoryMarkdown(
      "## Az első hónap\n\nNehéz volt, de **megérte**, sőt *nagyon*.\n\n### Amit tanultam\n- türelem\n- **nyelv**\n\nÚj bekezdés.",
    );
    expect(html).toContain("<h2>Az első hónap</h2>");
    expect(html).toContain("<h3>Amit tanultam</h3>");
    expect(html).toContain("<strong>megérte</strong>");
    expect(html).toContain("<em>nagyon</em>");
    expect(html).toContain("<ul><li>türelem</li><li><strong>nyelv</strong></li></ul>");
    expect(html).toContain("<p>Új bekezdés.</p>");
  });

  it("bekezdésen belüli sortörés <br/>", () => {
    const html = renderStoryMarkdown("első sor\nmásodik sor");
    expect(html).toBe("<p>első sor<br/>második sor</p>");
  });

  it("üres bemenet → üres kimenet", () => {
    expect(renderStoryMarkdown("")).toBe("");
  });
});

describe("storyExcerpt", () => {
  it("címsorokat kihagyja, formázást lecsupaszítja, hossz-plafon szó-határon", () => {
    const md = "## Cím\n\nEz az **első** bekezdés, ami elég hosszú ahhoz, hogy kivonat legyen belőle és még folytatódik is tovább szépen lassan a végtelenbe, mert a tesztnek hosszú szöveg kell ide.\n\n- lista";
    const ex = storyExcerpt(md, 80);
    expect(ex).not.toContain("Cím");
    expect(ex).not.toContain("**");
    expect(ex.length).toBeLessThanOrEqual(81);
    expect(ex.endsWith("…")).toBe(true);
  });

  it("rövid szöveg változatlanul (nincs …)", () => {
    expect(storyExcerpt("Rövid sztori.")).toBe("Rövid sztori.");
  });
});

describe("storySlug", () => {
  it("ékezet-hajtás + kötőjelezés + utótag", () => {
    expect(storySlug("Hogyan lettem autószerelő Zürichben?", "x4k9")).toBe(
      "hogyan-lettem-autoszerelo-zurichben-x4k9",
    );
  });

  it("üres/speciális cím is ad slugot", () => {
    expect(storySlug("!!!", "ab12")).toBe("tortenet-ab12");
  });
});

describe("escapeStoryHtml", () => {
  it("mind a négy veszélyes karakter", () => {
    expect(escapeStoryHtml(`<>&"`)).toBe("&lt;&gt;&amp;&quot;");
  });
});
