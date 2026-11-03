export type HtmlMeta = {
  title: string;
  description: string;
  image: string | null;
};

function decodeHtml(value: string): string {
  const named = value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => fromCode(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, num: string) => fromCode(Number(num)));
  return named
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function fromCode(code: number): string {
  if (!Number.isFinite(code) || code <= 0 || code > 0x10ffff) return "";
  if (code < 32 && code !== 9 && code !== 10) return "";
  try {
    return String.fromCodePoint(code);
  } catch {
    return "";
  }
}

function attribute(tag: string, name: string): string | null {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i"));
  if (!match) return null;
  return decodeHtml(match[2] ?? match[3] ?? "").trim();
}

function metaContent(html: string, key: string): string | null {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const property = (attribute(tag, "property") ?? attribute(tag, "name") ?? "").toLowerCase();
    if (property === key) {
      const content = attribute(tag, "content");
      if (content) return content;
    }
  }
  return null;
}

export function extractHtmlMeta(html: string): HtmlMeta {
  const titleTag = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = metaContent(html, "og:title") || decodeHtml(titleTag?.[1] ?? "").replace(/\s+/g, " ").trim();
  const description =
    metaContent(html, "og:description") || metaContent(html, "description") || "";
  const image = metaContent(html, "og:image");
  return {
    title: title.slice(0, 300),
    description: description.replace(/\s+/g, " ").trim().slice(0, 500),
    image,
  };
}

export function resolvePageUrl(base: string, value: string | null): string | null {
  if (!value) return null;
  try {
    return new URL(value, base).toString();
  } catch {
    return null;
  }
}
