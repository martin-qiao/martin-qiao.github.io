const TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export function imageFileProblem(file: {
  type: string;
  size: number;
  name: string;
}): string | null {
  if (file.size <= 0) return "Choose an image.";
  if (file.size > MAX_IMAGE_BYTES) return "Image must be 8MB or smaller.";
  const type = file.type.toLowerCase();
  if (TYPES.has(type)) return null;
  if (!type && /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(file.name)) return null;
  return "Use a JPEG, PNG, WebP, GIF, or HEIC image.";
}

export function blobPathname(name: string): string {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9.]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "image";
  return `cms/${crypto.randomUUID()}-${base}`;
}
