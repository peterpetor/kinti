/**
 * story-md.ts — az „Élettörténetek" UGC-blog BIZTONSÁGOS markdown-renderelője
 * és slug-készítője (TISZTA — se React, se Cloudflare; unit-tesztelt).
 *
 * Biztonsági modell (UGC = ellenséges bemenet):
 *   1. MINDEN HTML-t escape-elünk ELŐSZÖR — nyers HTML soha nem megy át.
 *   2. Szűk, fehérlistás markdown-részhalmaz: ## / ### címsor, **félkövér**,
 *      *dőlt*, „- " lista, bekezdések. ENNYI.
 *   3. Link-szintaxis NINCS — az URL sima szövegként jelenik meg. Ez tudatos
 *      SEO-spam védelem: a UGC-linkfarm a fő visszaélési vektor; az admin
 *      kézzel jóváhagy, de a link-motiváció így eleve megszűnik.
 */

/** HTML-escape — a renderelés legelső lépése (XSS-védelem alapja). */
export function escapeStoryHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Inline-formázás egy MÁR escape-elt szövegsoron: **félkövér**, *dőlt*. */
function renderInline(escaped: string): string {
  return escaped
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

/**
 * Markdown → biztonságos HTML. A kimenet közvetlenül renderelhető
 * (dangerouslySetInnerHTML), mert minden felhasználói szöveg escape-elt,
 * a tag-készlet pedig zárt: h2/h3/p/ul/li/strong/em/br.
 */
export function renderStoryMarkdown(md: string): string {
  const lines = (md ?? "").replace(/\r\n?/g, "\n").split("\n");
  const out: string[] = [];
  let listItems: string[] = [];
  let paragraph: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      out.push(`<ul>${listItems.map((li) => `<li>${li}</li>`).join("")}</ul>`);
      listItems = [];
    }
  };
  const flushParagraph = () => {
    if (paragraph.length > 0) {
      out.push(`<p>${paragraph.join("<br/>")}</p>`);
      paragraph = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const trimmed = line.trim();

    if (trimmed === "") {
      flushList();
      flushParagraph();
      continue;
    }

    const h3 = trimmed.match(/^###\s+(.*)$/);
    const h2 = h3 ? null : trimmed.match(/^##\s+(.*)$/);
    if (h3 || h2) {
      flushList();
      flushParagraph();
      const text = renderInline(escapeStoryHtml((h3 ?? h2)![1].trim()));
      out.push(h3 ? `<h3>${text}</h3>` : `<h2>${text}</h2>`);
      continue;
    }

    const li = trimmed.match(/^[-*]\s+(.*)$/);
    if (li) {
      flushParagraph();
      listItems.push(renderInline(escapeStoryHtml(li[1].trim())));
      continue;
    }

    flushList();
    paragraph.push(renderInline(escapeStoryHtml(trimmed)));
  }
  flushList();
  flushParagraph();
  return out.join("\n");
}

/** Az első bekezdésekből képzett szöveg-kivonat (meta descriptionhöz, kártyához). */
export function storyExcerpt(md: string, maxLen = 160): string {
  const plain = (md ?? "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l !== "" && !l.startsWith("#"))
    .join(" ")
    .replace(/\*\*?/g, "")
    .replace(/^[-*]\s+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= maxLen) return plain;
  const cut = plain.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 60 ? lastSpace : maxLen)}…`;
}

/**
 * Cím → URL-slug (ékezet-hajtás + kötőjelezés), rövid random utótaggal —
 * ütközés-mentes és nem enumerálható. Pl. „Hogyan lettem autószerelő
 * Zürichben?" → "hogyan-lettem-autoszerelo-zurichben-x4k9".
 */
export function storySlug(title: string, rand?: string): string {
  const base = (title ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  const suffix = (rand ?? Math.random().toString(36).slice(2, 6)).toLowerCase();
  return base ? `${base}-${suffix}` : `tortenet-${suffix}`;
}
