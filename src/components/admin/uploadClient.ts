"use client";

export async function cropToSquare(file: File, size = 1200): Promise<File> {
  const bitmap = await createImageBitmap(file);
  try {
    const side = Math.min(bitmap.width, bitmap.height);
    const sx = Math.floor((bitmap.width - side) / 2);
    const sy = Math.floor((bitmap.height - side) / 2);
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not crop that image.");
    context.drawImage(bitmap, sx, sy, side, side, 0, 0, size, size);
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.9);
    });
    if (!blob) throw new Error("Could not crop that image.");
    const base = file.name.replace(/\.[^.]+$/, "") || "thumb";
    return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
  } finally {
    bitmap.close();
  }
}

export async function uploadImageFile(file: File, square: boolean): Promise<string> {
  const prepared = square ? await cropToSquare(file).catch(() => file) : file;
  const body = new FormData();
  body.set("file", prepared);
  const response = await fetch("/api/admin/upload", { method: "POST", body });
  const payload = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!response.ok || typeof payload.url !== "string") {
    throw new Error(payload.error || "Upload failed.");
  }
  return payload.url;
}
