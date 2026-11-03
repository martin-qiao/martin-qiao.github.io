import { NextResponse } from "next/server";
import { adminWriteRejection, isCrossSiteRequest } from "@/lib/admin/gate";
import { isAdmin } from "@/lib/admin/guard";
import { insertDraftFromLink } from "@/lib/content/repository";
import { UnsafeUrlError } from "@/lib/notes/ssrf";
import { draftNoteFromUrl } from "@/lib/notes/linkDraft";

export const maxDuration = 30;

export async function POST(request: Request) {
  const rejection = adminWriteRejection({
    authenticated: await isAdmin(),
    crossSite: isCrossSiteRequest(request),
  });
  if (rejection) {
    return NextResponse.json({ error: rejection.error }, { status: rejection.status });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON." }, { status: 400 });
  }
  const url =
    body && typeof body === "object" && "url" in body ? String(body.url ?? "") : "";
  try {
    const draft = await draftNoteFromUrl(url);
    const id = await insertDraftFromLink(draft);
    return NextResponse.json(
      {
        id,
        status: "draft",
        title: draft.title,
        summary: draft.summary,
        sourceUrl: draft.sourceUrl,
        ogImageUrl: draft.ogImageUrl,
        slug: draft.slug,
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not import that link.";
    const status = error instanceof UnsafeUrlError ? 400 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
