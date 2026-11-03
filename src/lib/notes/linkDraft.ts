import http from "node:http";
import https from "node:https";
import { isIP } from "node:net";
import { extractHtmlMeta, resolvePageUrl, type HtmlMeta } from "./htmlMeta";
import { slugify } from "./slug";
import {
  UnsafeUrlError,
  isBlockedHostname,
  parsePublicHttpUrl,
  resolvePublicAddress,
} from "./ssrf";

const TIMEOUT_MS = 8000;
const MAX_BYTES = 1_000_000;
const MAX_REDIRECTS = 3;

export type LinkDraft = {
  title: string;
  summary: string;
  body: string;
  sourceUrl: string;
  ogImageUrl: string | null;
  slug: string;
};

export function draftFromMeta(pageUrl: string, meta: HtmlMeta): LinkDraft {
  const title = (meta.title.trim() || pageUrl).slice(0, 180);
  const summary = meta.description.trim().slice(0, 500);
  return {
    title,
    summary,
    body: summary,
    sourceUrl: pageUrl,
    ogImageUrl: meta.image,
    slug: slugify(title),
  };
}

export function noteInsertFromLink(draft: LinkDraft, id: string, slug: string) {
  return {
    id,
    title: draft.title,
    summary: draft.summary,
    body: draft.body,
    source_url: draft.sourceUrl,
    og_image_url: draft.ogImageUrl,
    slug,
    status: "draft" as const,
    published_at: null,
  };
}

type Hop = {
  status: number;
  location: string | null;
  body: string;
  contentType: string;
};

function requestOnce(url: URL, address: string): Promise<Hop> {
  const lib = url.protocol === "https:" ? https : http;
  return new Promise((resolve, reject) => {
    const request = lib.request(
      {
        protocol: url.protocol,
        hostname: address,
        servername: isIP(url.hostname) ? undefined : url.hostname,
        port: url.port || undefined,
        method: "GET",
        path: `${url.pathname}${url.search}` || "/",
        headers: {
          Host: url.host,
          Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1",
          "User-Agent": "martinqiao-notes-ingest/1.0",
          "Accept-Encoding": "identity",
        },
        timeout: TIMEOUT_MS,
        rejectUnauthorized: true,
      },
      (response) => {
        const status = response.statusCode ?? 0;
        const locationHeader = response.headers.location;
        const location = Array.isArray(locationHeader)
          ? locationHeader[0] ?? null
          : locationHeader ?? null;
        const contentType = String(response.headers["content-type"] ?? "");
        if (status >= 300 && status < 400) {
          response.resume();
          resolve({ status, location, body: "", contentType });
          return;
        }
        const chunks: Buffer[] = [];
        let size = 0;
        response.on("data", (chunk: Buffer) => {
          size += chunk.length;
          if (size > MAX_BYTES) {
            request.destroy();
            reject(new UnsafeUrlError("That page is too large to import"));
            return;
          }
          chunks.push(chunk);
        });
        response.on("end", () => {
          resolve({
            status,
            location: null,
            body: Buffer.concat(chunks).toString("utf8"),
            contentType,
          });
        });
      },
    );
    request.on("timeout", () => {
      request.destroy();
      reject(new UnsafeUrlError("Timed out fetching that link"));
    });
    request.on("error", () => {
      reject(new UnsafeUrlError("Could not fetch that link"));
    });
    request.end();
  });
}

async function fetchPublicHtml(raw: string): Promise<{ finalUrl: string; html: string }> {
  let current = parsePublicHttpUrl(raw);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const address = await resolvePublicAddress(current);
    const response = await requestOnce(current, address);
    if (response.status >= 300 && response.status < 400) {
      if (!response.location) throw new UnsafeUrlError("Redirect was missing a location");
      if (hop === MAX_REDIRECTS) throw new UnsafeUrlError("Too many redirects");
      current = parsePublicHttpUrl(new URL(response.location, current).toString());
      continue;
    }
    if (response.status < 200 || response.status >= 300) {
      throw new UnsafeUrlError("That page did not respond with an article");
    }
    const type = response.contentType.toLowerCase();
    const looksHtml =
      type.includes("text/html") ||
      type.includes("application/xhtml") ||
      type === "" ||
      /<html|<title|<meta/i.test(response.body.slice(0, 2000));
    if (!looksHtml) throw new UnsafeUrlError("That link is not an HTML page");
    return { finalUrl: current.toString(), html: response.body };
  }
  throw new UnsafeUrlError("Too many redirects");
}

async function publicImageUrl(pageUrl: string, image: string | null): Promise<string | null> {
  const resolved = resolvePageUrl(pageUrl, image);
  if (!resolved) return null;
  try {
    const url = parsePublicHttpUrl(resolved);
    if (isBlockedHostname(url.hostname)) return null;
    if (isIP(url.hostname)) {
      await resolvePublicAddress(url);
    } else {
      await resolvePublicAddress(url);
    }
    return url.toString();
  } catch {
    return null;
  }
}

/** Fetch a public page and return draft note fields. Never marks it published. */
export async function draftNoteFromUrl(raw: string): Promise<LinkDraft> {
  const page = await fetchPublicHtml(raw);
  const meta = extractHtmlMeta(page.html);
  const draft = draftFromMeta(page.finalUrl, meta);
  draft.ogImageUrl = await publicImageUrl(page.finalUrl, meta.image);
  return draft;
}
