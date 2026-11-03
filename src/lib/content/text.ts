import { SECTIONS } from "@/data/sections";

const SECTION_IDS = new Set(SECTIONS.map((section) => section.id));

export type ContentStatus = "draft" | "published";

export type Selfie = {
  blobUrl: string;
  caption: string;
};

export function cleanText(value: unknown, max: number): string {
  return String(value ?? "")
    .replace(/\u0000/g, "")
    .trim()
    .slice(0, max);
}

export function cleanStatus(value: unknown): ContentStatus {
  return value === "published" ? "published" : "draft";
}

export function cleanSortKey(value: unknown): number {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(100_000, Math.round(number)));
}

export function cleanSectionId(value: unknown): string | null {
  const id = cleanText(value, 40);
  return SECTION_IDS.has(id) ? id : null;
}

export function cleanAssetUrl(value: unknown): string | null {
  const raw = cleanText(value, 2000);
  if (!raw || raw === "#") return raw === "#" ? "#" : null;
  if (raw.startsWith("/") && !raw.startsWith("//") && !raw.includes("\\") && !raw.includes("..")) {
    return raw;
  }
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function cleanDay(value: unknown): string | null {
  const raw = cleanText(value, 10);
  if (!raw) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const parsed = new Date(`${raw}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10) === raw ? raw : null;
}

export function dayToTimestamp(day: string | null): string | null {
  if (!day) return null;
  return `${day}T12:00:00.000Z`;
}

export function parseGallery(value: unknown): Selfie[] {
  let parsed = value;
  if (typeof value === "string") {
    if (!value.trim()) return [];
    try {
      parsed = JSON.parse(value) as unknown;
    } catch {
      return [];
    }
  }
  if (!Array.isArray(parsed)) return [];
  return parsed
    .flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const record = item as Record<string, unknown>;
      const caption = cleanText(record.caption, 200);
      const blobUrl = cleanAssetUrl(record.blobUrl) ?? "";
      if (!caption && !blobUrl) return [];
      if (blobUrl === "#") return [];
      return [{ caption, blobUrl }];
    })
    .slice(0, 12);
}

export function formatMonthYear(iso: string | null): { date: string; dateTime: string } {
  if (!iso) return { date: "", dateTime: "" };
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return { date: "", dateTime: "" };
  const dateTime = parsed.toISOString().slice(0, 7);
  const date = new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
  return { date, dateTime };
}

const ID_PATTERN = /^[A-Za-z0-9_-]{1,80}$/;

export function cleanId(value: unknown): string | null {
  const id = cleanText(value, 80);
  return ID_PATTERN.test(id) ? id : null;
}
