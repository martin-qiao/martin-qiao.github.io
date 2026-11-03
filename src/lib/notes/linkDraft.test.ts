import { nextSlug, slugify } from "./slug";
import { draftFromMeta, noteInsertFromLink } from "./linkDraft";

test("slugify keeps a stable url piece", () => {
  expect(slugify("Why a viewfinder works as navigation")).toBe(
    "why-a-viewfinder-works-as-navigation",
  );
  expect(slugify("***")).toBe("note");
});

test("nextSlug skips taken values", () => {
  expect(nextSlug("note", new Set(["note", "note-2"]))).toBe("note-3");
});

test("a pasted link becomes a draft and is never published", () => {
  const draft = draftFromMeta("https://example.com/post", {
    title: "A linked note",
    description: "Short summary",
    image: "https://example.com/og.jpg",
  });
  const row = noteInsertFromLink(draft, "id-1", draft.slug);
  expect(row.status).toBe("draft");
  expect(row.published_at).toBeNull();
  expect(row.title).toBe("A linked note");
  expect(row.summary).toBe("Short summary");
  expect(row.source_url).toBe("https://example.com/post");
});
