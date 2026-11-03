import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { assembleHome, type HomeContent, type PublishedBundle } from "./assemble";
import { createAnonClient } from "@/lib/supabase/clients";

async function loadPublishedBundle(): Promise<PublishedBundle | null> {
  const client = createAnonClient();
  if (!client) return null;
  const [about, lens, notes, fidget] = await Promise.all([
    client
      .from("about")
      .select("headline, body, resume_url, selfie_gallery")
      .eq("status", "published")
      .eq("id", 1)
      .maybeSingle(),
    client
      .from("lens_frames")
      .select("id, title, shot_on, thumb_url, section_id, published_at")
      .eq("status", "published")
      .order("sort_key", { ascending: true }),
    client
      .from("notes")
      .select("id, title, summary, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false }),
    client
      .from("fidget")
      .select("id, title, summary, product_url, image_url")
      .eq("status", "published")
      .order("sort_key", { ascending: true }),
  ]);
  if (about.error || lens.error || notes.error || fidget.error) return null;
  return {
    about: about.data,
    lens: lens.data ?? [],
    notes: notes.data ?? [],
    fidget: fidget.data ?? [],
  };
}

export async function getHomeContent(): Promise<HomeContent> {
  "use cache";
  cacheTag("home-content");
  cacheLife("minutes");
  try {
    return assembleHome(await loadPublishedBundle());
  } catch (error) {
    if (isControlFlow(error)) throw error;
    return assembleHome(null);
  }
}

function isControlFlow(error: unknown): boolean {
  return typeof error === "object" && error !== null && "digest" in error;
}
