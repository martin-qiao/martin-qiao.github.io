import { ABOUT, NOTES } from "@/data/home";
import { FILM_FRAMES } from "@/data/filmReel";
import { assembleHome } from "./assemble";
import { formatMonthYear } from "./text";

test("missing content falls back to the homepage mocks", () => {
  const home = assembleHome(null);
  expect(home.about.headline).toBe(ABOUT.headline);
  expect(home.about.portraits.map((portrait) => portrait.label)).toEqual([
    "Harbor walk",
    "Studio light",
    "Weekend film",
  ]);
  expect(home.lensFrames).toBe(FILM_FRAMES);
  expect(home.notes.posts.map((post) => post.title)).toEqual(NOTES.posts.map((post) => post.title));
  expect(home.fidget.tiles).toHaveLength(4);
});

test("published rows replace a section and empty lists stay on mocks", () => {
  const home = assembleHome({
    about: {
      headline: "From the desk",
      body: "Hello **there**.",
      resume_url: "https://example.com/resume.pdf",
      selfie_gallery: [
        { blobUrl: "", caption: "Harbor walk" },
        { blobUrl: "", caption: "Studio light" },
      ],
    },
    lens: [],
    notes: [
      {
        id: "custom",
        title: "A published note",
        summary: "Summary",
        published_at: "2026-10-01T00:00:00.000Z",
      },
    ],
    fidget: [],
  });
  expect(home.about.headline).toBe("From the desk");
  expect(home.about.cta.href).toBe("https://example.com/resume.pdf");
  expect(home.about.portraits[0]?.tone).toBe("harbor");
  expect(home.lensFrames).toBe(FILM_FRAMES);
  expect(home.notes.posts).toEqual([
    {
      id: "custom",
      title: "A published note",
      summary: "Summary",
      date: "Oct 2026",
      dateTime: "2026-10",
    },
  ]);
  expect(home.fidget.tiles.map((tile) => tile.title)).toEqual([
    "Contax T2 (clone hunt)",
    "Desk kinetic toy",
    "film-reel CLI",
    "Sticky stage demo",
  ]);
});

test("a selfie with a blob url is used and lens frames keep their section", () => {
  const home = assembleHome({
    about: {
      headline: "From the desk",
      body: "Body",
      resume_url: null,
      selfie_gallery: [{ blobUrl: "https://example.com/me.jpg", caption: "Harbor" }],
    },
    lens: [
      {
        id: "frame-1",
        title: "Pier",
        shot_on: "2026-04-02",
        thumb_url: "https://example.com/pier.jpg",
        section_id: "photographer",
        published_at: "2026-04-02T12:00:00.000Z",
      },
    ],
    notes: [],
    fidget: [],
  });
  expect(home.about.portraits).toEqual([
    { id: "selfie-1", label: "Harbor", imageUrl: "https://example.com/me.jpg" },
  ]);
  expect(home.lensFrames).toEqual([
    {
      id: "frame-1",
      sectionId: "photographer",
      headline: "Pier",
      image: "https://example.com/pier.jpg",
      publishedAt: "2026-04-02",
    },
  ]);
});

test("formats note dates in UTC", () => {
  expect(formatMonthYear("2026-10-01T00:00:00.000Z")).toEqual({
    date: "Oct 2026",
    dateTime: "2026-10",
  });
});
