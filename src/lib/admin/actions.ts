"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { passwordsMatch } from "@/lib/admin/password";
import { readServerEnv } from "@/lib/env";
import { clearAdminCookie, requireAdmin, setAdminCookie } from "@/lib/admin/guard";
import { redirectSaved, redirectWithError } from "@/lib/admin/redirects";
import {
  deleteFidget,
  deleteLens,
  deleteNote,
  getLens,
  insertDraftFromLink,
  saveAbout,
  saveFidget,
  saveLens,
  saveNote,
} from "@/lib/content/repository";
import {
  cleanAssetUrl,
  cleanId,
  cleanSectionId,
  cleanSortKey,
  cleanStatus,
  cleanText,
  parseGallery,
} from "@/lib/content/text";
import { draftNoteFromUrl } from "@/lib/notes/linkDraft";

export type LoginState = { error: string };

function refreshHome(): void {
  updateTag("home-content");
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const expected = readServerEnv("ADMIN_PASSWORD");
  if (!expected) return { error: "ADMIN_PASSWORD is not configured." };
  const password = String(formData.get("password") ?? "");
  if (!passwordsMatch(password, expected)) return { error: "Wrong password." };
  await setAdminCookie();
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await clearAdminCookie();
  redirect("/admin/login");
}

export async function saveAboutAction(formData: FormData): Promise<void> {
  await requireAdmin();
  try {
    await saveAbout({
      headline: cleanText(formData.get("headline"), 200),
      body: cleanText(formData.get("body"), 20_000),
      resumeUrl: cleanAssetUrl(formData.get("resume_url")),
      gallery: parseGallery(formData.get("selfie_gallery")),
      status: cleanStatus(formData.get("status")),
    });
    refreshHome();
  } catch (error) {
    redirectWithError("/admin/about", error);
  }
  redirectSaved("/admin/about");
}

export async function saveLensAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = cleanId(formData.get("id"));
  try {
    const saved = await saveLens({
      id: id ?? "",
      title: cleanText(formData.get("title"), 180),
      caption: cleanText(formData.get("caption"), 400),
      shotOn: cleanText(formData.get("shot_on"), 10),
      thumbUrl: cleanText(formData.get("thumb_url"), 2000),
      fullImageUrl: cleanText(formData.get("full_image_url"), 2000),
      sectionId: cleanSectionId(formData.get("section_id")) ?? "",
      sortKey: cleanSortKey(formData.get("sort_key")),
      status: cleanStatus(formData.get("status")),
    });
    refreshHome();
    redirectSaved(`/admin/lens/${saved}`);
  } catch (error) {
    redirectWithError(id ? `/admin/lens/${id}` : "/admin/lens/new", error);
  }
}

export async function deleteLensAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = cleanId(formData.get("id"));
  if (!id) redirectWithError("/admin/lens", new Error("Missing frame."));
  try {
    const existing = await getLens(id);
    if (!existing) throw new Error("Frame was not found.");
    await deleteLens(id);
    refreshHome();
  } catch (error) {
    redirectWithError("/admin/lens", error);
  }
  redirectSaved("/admin/lens");
}

export async function saveNoteAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = cleanId(formData.get("id"));
  try {
    const saved = await saveNote({
      id: id ?? "",
      title: cleanText(formData.get("title"), 180),
      summary: cleanText(formData.get("summary"), 500),
      body: cleanText(formData.get("body"), 50_000),
      sourceUrl: cleanText(formData.get("source_url"), 2000),
      ogImageUrl: cleanText(formData.get("og_image_url"), 2000),
      slug: cleanText(formData.get("slug"), 80),
      publishedOn: cleanText(formData.get("published_on"), 10),
      status: cleanStatus(formData.get("status")),
    });
    refreshHome();
    redirectSaved(`/admin/notes/${saved}`);
  } catch (error) {
    redirectWithError(id ? `/admin/notes/${id}` : "/admin/notes/new", error);
  }
}

export async function deleteNoteAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = cleanId(formData.get("id"));
  if (!id) redirectWithError("/admin/notes", new Error("Missing note."));
  try {
    await deleteNote(id);
    refreshHome();
  } catch (error) {
    redirectWithError("/admin/notes", error);
  }
  redirectSaved("/admin/notes");
}

export async function importNoteAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const url = cleanText(formData.get("url"), 2000);
  try {
    const draft = await draftNoteFromUrl(url);
    const id = await insertDraftFromLink(draft);
    redirectSaved(`/admin/notes/${id}`);
  } catch (error) {
    redirectWithError("/admin/notes", error);
  }
}

export async function saveFidgetAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = cleanId(formData.get("id"));
  try {
    const saved = await saveFidget({
      id: id ?? "",
      title: cleanText(formData.get("title"), 180),
      summary: cleanText(formData.get("summary"), 500),
      productUrl: cleanText(formData.get("product_url"), 2000),
      imageUrl: cleanText(formData.get("image_url"), 2000),
      sortKey: cleanSortKey(formData.get("sort_key")),
      status: cleanStatus(formData.get("status")),
    });
    refreshHome();
    redirectSaved(`/admin/fidget/${saved}`);
  } catch (error) {
    redirectWithError(id ? `/admin/fidget/${id}` : "/admin/fidget/new", error);
  }
}

export async function deleteFidgetAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = cleanId(formData.get("id"));
  if (!id) redirectWithError("/admin/fidget", new Error("Missing gadget."));
  try {
    await deleteFidget(id);
    refreshHome();
  } catch (error) {
    redirectWithError("/admin/fidget", error);
  }
  redirectSaved("/admin/fidget");
}
