import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { nextSlug, slugify } from "@/lib/notes/slug";
import type { LinkDraft } from "@/lib/notes/linkDraft";
import { noteInsertFromLink } from "@/lib/notes/linkDraft";
import { createServiceClient } from "@/lib/supabase/clients";
import {
  cleanAssetUrl,
  cleanDay,
  cleanSectionId,
  cleanSortKey,
  cleanStatus,
  cleanText,
  dayToTimestamp,
  parseGallery,
  type ContentStatus,
  type Selfie,
} from "./text";

export class ContentStoreError extends Error {}

function store(): SupabaseClient {
  const client = createServiceClient();
  if (!client) {
    throw new ContentStoreError(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  return client;
}

function raise(error: { message: string } | null): void {
  if (error) throw new ContentStoreError(error.message);
}

export async function readStore<T>(
  load: () => Promise<T>,
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    return { ok: true, data: await load() };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load content.";
    return { ok: false, error: message };
  }
}

export type AboutAdmin = {
  headline: string;
  body: string;
  resumeUrl: string;
  gallery: Selfie[];
  status: ContentStatus;
};

export type LensAdmin = {
  id: string;
  title: string;
  caption: string;
  shotOn: string;
  thumbUrl: string;
  fullImageUrl: string;
  sectionId: string;
  sortKey: number;
  status: ContentStatus;
};

export type NoteAdmin = {
  id: string;
  title: string;
  summary: string;
  body: string;
  sourceUrl: string;
  ogImageUrl: string;
  slug: string;
  publishedOn: string;
  status: ContentStatus;
};

export type FidgetAdmin = {
  id: string;
  title: string;
  summary: string;
  productUrl: string;
  imageUrl: string;
  sortKey: number;
  status: ContentStatus;
};

const EMPTY_ABOUT: AboutAdmin = {
  headline: "",
  body: "",
  resumeUrl: "",
  gallery: [],
  status: "draft",
};

export async function getAboutAdmin(): Promise<AboutAdmin> {
  const { data, error } = await store()
    .from("about")
    .select("headline, body, resume_url, selfie_gallery, status")
    .eq("id", 1)
    .maybeSingle();
  raise(error);
  if (!data) return EMPTY_ABOUT;
  return {
    headline: data.headline ?? "",
    body: data.body ?? "",
    resumeUrl: data.resume_url ?? "",
    gallery: parseGallery(data.selfie_gallery),
    status: cleanStatus(data.status),
  };
}

export async function saveAbout(input: {
  headline: string;
  body: string;
  resumeUrl: string | null;
  gallery: Selfie[];
  status: ContentStatus;
}): Promise<void> {
  if (input.status === "published" && !input.headline.trim()) {
    throw new ContentStoreError("A published About section needs a headline.");
  }
  const { error } = await store().from("about").upsert(
    {
      id: 1,
      headline: input.headline,
      body: input.body,
      resume_url: input.resumeUrl,
      selfie_gallery: input.gallery,
      status: input.status,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
  raise(error);
}

function mapLens(row: {
  id: string;
  title: string;
  caption: string | null;
  shot_on: string | null;
  thumb_url: string | null;
  full_image_url: string | null;
  section_id: string | null;
  sort_key: number | null;
  status: string;
}): LensAdmin {
  return {
    id: row.id,
    title: row.title ?? "",
    caption: row.caption ?? "",
    shotOn: row.shot_on ?? "",
    thumbUrl: row.thumb_url ?? "",
    fullImageUrl: row.full_image_url ?? "",
    sectionId: row.section_id ?? "",
    sortKey: row.sort_key ?? 0,
    status: cleanStatus(row.status),
  };
}

export async function listLens(): Promise<LensAdmin[]> {
  const { data, error } = await store()
    .from("lens_frames")
    .select("id, title, caption, shot_on, thumb_url, full_image_url, section_id, sort_key, status")
    .order("sort_key", { ascending: true });
  raise(error);
  return (data ?? []).map(mapLens);
}

export async function getLens(id: string): Promise<LensAdmin | null> {
  const { data, error } = await store()
    .from("lens_frames")
    .select("id, title, caption, shot_on, thumb_url, full_image_url, section_id, sort_key, status")
    .eq("id", id)
    .maybeSingle();
  raise(error);
  return data ? mapLens(data) : null;
}

export async function saveLens(input: LensAdmin & { id?: string }): Promise<string> {
  const title = cleanText(input.title, 180);
  if (!title) throw new ContentStoreError("Title is required.");
  const status = cleanStatus(input.status);
  const sectionId = cleanSectionId(input.sectionId);
  const thumbUrl = cleanAssetUrl(input.thumbUrl);
  const shotOn = cleanDay(input.shotOn);
  if (status === "published" && (!sectionId || !thumbUrl || !shotOn)) {
    throw new ContentStoreError("Published frames need a date, a section, and a square thumb.");
  }
  const id = input.id || randomUUID();
  const row = {
    id,
    title,
    caption: cleanText(input.caption, 400),
    shot_on: shotOn,
    thumb_url: thumbUrl,
    full_image_url: cleanAssetUrl(input.fullImageUrl),
    section_id: sectionId,
    sort_key: cleanSortKey(input.sortKey),
    published_at: shotOn ? dayToTimestamp(shotOn) : status === "published" ? new Date().toISOString() : null,
    status,
    updated_at: new Date().toISOString(),
  };
  const { error } = await store().from("lens_frames").upsert(row, { onConflict: "id" });
  raise(error);
  return id;
}

export async function deleteLens(id: string): Promise<void> {
  const { error } = await store().from("lens_frames").delete().eq("id", id);
  raise(error);
}

function mapNote(row: {
  id: string;
  title: string;
  summary: string | null;
  body: string | null;
  source_url: string | null;
  og_image_url: string | null;
  slug: string;
  published_at: string | null;
  status: string;
}): NoteAdmin {
  return {
    id: row.id,
    title: row.title ?? "",
    summary: row.summary ?? "",
    body: row.body ?? "",
    sourceUrl: row.source_url ?? "",
    ogImageUrl: row.og_image_url ?? "",
    slug: row.slug ?? "",
    publishedOn: row.published_at ? row.published_at.slice(0, 10) : "",
    status: cleanStatus(row.status),
  };
}

export async function listNotes(): Promise<NoteAdmin[]> {
  const { data, error } = await store()
    .from("notes")
    .select("id, title, summary, body, source_url, og_image_url, slug, published_at, status")
    .order("updated_at", { ascending: false });
  raise(error);
  return (data ?? []).map(mapNote);
}

export async function getNote(id: string): Promise<NoteAdmin | null> {
  const { data, error } = await store()
    .from("notes")
    .select("id, title, summary, body, source_url, og_image_url, slug, published_at, status")
    .eq("id", id)
    .maybeSingle();
  raise(error);
  return data ? mapNote(data) : null;
}

async function slugTakenByOther(id: string, slug: string): Promise<boolean> {
  const { data, error } = await store().from("notes").select("id").eq("slug", slug).maybeSingle();
  raise(error);
  return Boolean(data && data.id !== id);
}

export async function saveNote(input: NoteAdmin & { id?: string }): Promise<string> {
  const title = cleanText(input.title, 180);
  if (!title) throw new ContentStoreError("Title is required.");
  const status = cleanStatus(input.status);
  const id = input.id || randomUUID();
  const slug = slugify(cleanText(input.slug, 80) || title);
  if (await slugTakenByOther(id, slug)) {
    throw new ContentStoreError("That slug is already used.");
  }
  const publishedOn = cleanDay(input.publishedOn);
  const row = {
    id,
    title,
    summary: cleanText(input.summary, 500),
    body: cleanText(input.body, 50_000),
    source_url: cleanAssetUrl(input.sourceUrl),
    og_image_url: cleanAssetUrl(input.ogImageUrl),
    slug,
    published_at: publishedOn
      ? dayToTimestamp(publishedOn)
      : status === "published"
        ? new Date().toISOString()
        : null,
    status,
    updated_at: new Date().toISOString(),
  };
  const { error } = await store().from("notes").upsert(row, { onConflict: "id" });
  raise(error);
  return id;
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await store().from("notes").delete().eq("id", id);
  raise(error);
}

export async function insertDraftFromLink(draft: LinkDraft): Promise<string> {
  const { data, error } = await store().from("notes").select("slug");
  raise(error);
  const taken = new Set((data ?? []).map((row) => String(row.slug)));
  const id = randomUUID();
  const slug = nextSlug(draft.slug, taken);
  const row = noteInsertFromLink(draft, id, slug);
  const { error: insertError } = await store().from("notes").insert({
    ...row,
    updated_at: new Date().toISOString(),
  });
  raise(insertError);
  return id;
}

function mapFidget(row: {
  id: string;
  title: string;
  summary: string | null;
  product_url: string | null;
  image_url: string | null;
  sort_key: number | null;
  status: string;
}): FidgetAdmin {
  return {
    id: row.id,
    title: row.title ?? "",
    summary: row.summary ?? "",
    productUrl: row.product_url ?? "",
    imageUrl: row.image_url ?? "",
    sortKey: row.sort_key ?? 0,
    status: cleanStatus(row.status),
  };
}

export async function listFidget(): Promise<FidgetAdmin[]> {
  const { data, error } = await store()
    .from("fidget")
    .select("id, title, summary, product_url, image_url, sort_key, status")
    .order("sort_key", { ascending: true });
  raise(error);
  return (data ?? []).map(mapFidget);
}

export async function getFidget(id: string): Promise<FidgetAdmin | null> {
  const { data, error } = await store()
    .from("fidget")
    .select("id, title, summary, product_url, image_url, sort_key, status")
    .eq("id", id)
    .maybeSingle();
  raise(error);
  return data ? mapFidget(data) : null;
}

export async function saveFidget(input: FidgetAdmin & { id?: string }): Promise<string> {
  const title = cleanText(input.title, 180);
  if (!title) throw new ContentStoreError("Title is required.");
  const id = input.id || randomUUID();
  const row = {
    id,
    title,
    summary: cleanText(input.summary, 500),
    product_url: cleanAssetUrl(input.productUrl),
    image_url: cleanAssetUrl(input.imageUrl),
    sort_key: cleanSortKey(input.sortKey),
    status: cleanStatus(input.status),
    updated_at: new Date().toISOString(),
  };
  const { error } = await store().from("fidget").upsert(row, { onConflict: "id" });
  raise(error);
  return id;
}

export async function deleteFidget(id: string): Promise<void> {
  const { error } = await store().from("fidget").delete().eq("id", id);
  raise(error);
}
