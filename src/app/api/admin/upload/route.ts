import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { adminWriteRejection, isCrossSiteRequest } from "@/lib/admin/gate";
import { isAdmin } from "@/lib/admin/guard";
import { blobPathname, imageFileProblem, MAX_IMAGE_BYTES } from "@/lib/blob/imageFile";
import { readServerEnv } from "@/lib/env";

export async function POST(request: Request) {
  const rejection = adminWriteRejection({
    authenticated: await isAdmin(),
    crossSite: isCrossSiteRequest(request),
  });
  if (rejection) {
    return NextResponse.json({ error: rejection.error }, { status: rejection.status });
  }
  const blobToken = readServerEnv("BLOB_READ_WRITE_TOKEN");
  if (!blobToken) {
    return NextResponse.json(
      { error: "BLOB_READ_WRITE_TOKEN is not configured." },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected a form upload." }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose an image." }, { status: 400 });
  }
  const problem = imageFileProblem(file);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });
  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "Image must be 8MB or smaller." }, { status: 400 });
  }

  try {
    const blob = await put(blobPathname(file.name || "image"), file, {
      access: "public",
      token: blobToken,
      contentType: file.type || undefined,
      addRandomSuffix: false,
    });
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
