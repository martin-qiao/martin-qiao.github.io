import { ABOUT, FIDGET, NOTES } from "@/data/home";
import { FILM_FRAMES } from "@/data/filmReel";
import type { FilmFrame } from "@/lib/filmReel";
import { formatMonthYear, parseGallery, type Selfie } from "./text";

export type PortraitView = {
  id: string;
  label: string;
  tone?: "harbor" | "studio" | "weekend";
  imageUrl?: string;
};

export type AboutView = {
  id: typeof ABOUT.id;
  eyebrow: string;
  headline: string;
  body: string;
  portraits: PortraitView[];
  cta: { label: string; href: string };
};

export type NoteCard = {
  id: string;
  date: string;
  dateTime: string;
  title: string;
  summary: string;
};

export type NotesView = {
  id: typeof NOTES.id;
  eyebrow: string;
  headline: string;
  body: string;
  posts: NoteCard[];
};

export type FidgetTile = {
  id: string;
  title: string;
  summary: string;
  productUrl: string | null;
  imageUrl: string | null;
};

export type FidgetView = {
  id: typeof FIDGET.id;
  eyebrow: string;
  headline: string;
  body: string;
  tiles: FidgetTile[];
};

export type HomeContent = {
  about: AboutView;
  lensFrames: readonly FilmFrame[];
  notes: NotesView;
  fidget: FidgetView;
};

export type AboutRecord = {
  headline: string;
  body: string;
  resume_url: string | null;
  selfie_gallery: unknown;
};

export type LensRecord = {
  id: string;
  title: string;
  shot_on: string | null;
  thumb_url: string | null;
  section_id: string | null;
  published_at: string | null;
};

export type NoteRecord = {
  id: string;
  title: string;
  summary: string;
  published_at: string | null;
};

export type FidgetRecord = {
  id: string;
  title: string;
  summary: string;
  product_url: string | null;
  image_url: string | null;
};

export type PublishedBundle = {
  about: AboutRecord | null;
  lens: LensRecord[];
  notes: NoteRecord[];
  fidget: FidgetRecord[];
};

function mockAbout(): AboutView {
  return {
    id: ABOUT.id,
    eyebrow: ABOUT.eyebrow,
    headline: ABOUT.headline,
    body: ABOUT.body,
    portraits: ABOUT.portraits.map((portrait) => ({
      id: portrait.id,
      label: portrait.label,
      tone: portrait.tone,
    })),
    cta: { label: ABOUT.cta.label, href: ABOUT.cta.href },
  };
}

function portraitsFor(gallery: Selfie[]): PortraitView[] {
  const hasPhoto = gallery.some((item) => item.blobUrl);
  if (!hasPhoto) {
    return mockAbout().portraits;
  }
  return gallery.map((item, index) => ({
    id: `selfie-${index + 1}`,
    label: item.caption || "Portrait",
    imageUrl: item.blobUrl || undefined,
  }));
}

function mapAbout(row: AboutRecord): AboutView {
  const headline = row.headline.trim();
  const body = row.body.trim();
  if (!headline && !body) return mockAbout();
  const fallback = mockAbout();
  return {
    ...fallback,
    headline: headline || fallback.headline,
    body: body || fallback.body,
    portraits: portraitsFor(parseGallery(row.selfie_gallery)),
    cta: {
      label: ABOUT.cta.label,
      href: row.resume_url?.trim() || ABOUT.cta.href,
    },
  };
}

export function lensRecordToFrame(row: LensRecord): FilmFrame | null {
  if (!row.section_id || !row.thumb_url || !row.title.trim()) return null;
  const publishedAt =
    row.shot_on?.slice(0, 10) ||
    (row.published_at ? row.published_at.slice(0, 10) : "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(publishedAt)) return null;
  return {
    id: row.id,
    sectionId: row.section_id,
    headline: row.title.trim(),
    image: row.thumb_url,
    publishedAt,
  };
}

function mapNotes(rows: NoteRecord[]): NotesView {
  return {
    id: NOTES.id,
    eyebrow: NOTES.eyebrow,
    headline: NOTES.headline,
    body: NOTES.body,
    posts: rows.map((row) => {
      const formatted = formatMonthYear(row.published_at);
      return {
        id: row.id,
        title: row.title,
        summary: row.summary,
        date: formatted.date,
        dateTime: formatted.dateTime,
      };
    }),
  };
}

function mapFidget(rows: FidgetRecord[]): FidgetView {
  return {
    id: FIDGET.id,
    eyebrow: FIDGET.eyebrow,
    headline: FIDGET.headline,
    body: FIDGET.body,
    tiles: rows.map((row) => ({
      id: row.id,
      title: row.title,
      summary: row.summary,
      productUrl: row.product_url,
      imageUrl: row.image_url,
    })),
  };
}

/** Null bundle (missing env or failed fetch) and empty lists use the TS mocks. */
export function assembleHome(bundle: PublishedBundle | null): HomeContent {
  const notes = NOTES;
  const fidget = FIDGET;
  if (!bundle) {
    return {
      about: mockAbout(),
      lensFrames: FILM_FRAMES,
      notes: {
        id: notes.id,
        eyebrow: notes.eyebrow,
        headline: notes.headline,
        body: notes.body,
        posts: notes.posts.map((post) => ({ ...post })),
      },
      fidget: {
        id: fidget.id,
        eyebrow: fidget.eyebrow,
        headline: fidget.headline,
        body: fidget.body,
        tiles: fidget.tiles.map((tile) => ({
          id: tile.id,
          title: tile.title,
          summary: tile.summary,
          productUrl: null,
          imageUrl: null,
        })),
      },
    };
  }

  const frames = bundle.lens
    .map(lensRecordToFrame)
    .filter((frame): frame is FilmFrame => frame !== null);

  return {
    about: bundle.about ? mapAbout(bundle.about) : mockAbout(),
    lensFrames: frames.length > 0 ? frames : FILM_FRAMES,
    notes: bundle.notes.length > 0 ? mapNotes(bundle.notes) : assembleHome(null).notes,
    fidget: bundle.fidget.length > 0 ? mapFidget(bundle.fidget) : assembleHome(null).fidget,
  };
}
