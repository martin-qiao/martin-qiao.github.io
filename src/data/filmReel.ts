import type { FilmFrame } from "@/lib/filmReel";

/** Sample slides. Baked mats are cropped off; the slot CSS owns the border. */
export const FILM_SLIDES = [
  "/hasselblad/film-reel/twilight-path.jpg",
  "/hasselblad/film-reel/pink-peak.jpg",
  "/hasselblad/film-reel/pier.jpg",
  "/hasselblad/film-reel/red-leaves.jpg",
  "/hasselblad/film-reel/lake.jpg",
] as const;

const COPY: Record<string, readonly string[]> = {
  developer: [
    "Viewfinder composite",
    "Crank as a button",
    "Green screen key",
    "Even-pace wind",
    "Black curtain",
    "Section seed data",
    "Preview deploys",
  ],
  learner: [
    "Notes on masking",
    "Reading the track",
    "Square frame math",
    "Reduced motion",
    "Hit target size",
    "Crossfade curve",
    "First still",
  ],
  photographer: [
    "Twilight on the path",
    "Alpenglow peak",
    "Pier at noon",
    "Red maple",
    "Lake mirror",
    "Waist-level frame",
    "Contact sheet",
  ],
  traveler: [
    "Road before sunrise",
    "Ridge in pink light",
    "Jetty, clear water",
    "Leaves overhead",
    "Still water",
    "Pack the 80mm",
    "One roll left",
  ],
  "life-recorder": [
    "The long way home",
    "Light on the ridge",
    "Boards over water",
    "October color",
    "Doubled mountains",
    "What the glass held",
    "A quiet exposure",
  ],
  reader: [
    "Margin notes",
    "A chapter at dusk",
    "The long pier",
    "Pressed leaves",
    "Unread reflection",
    "Field notebook",
    "Underlined line",
  ],
  "movie-lover": [
    "Last light, wide",
    "Pink mountain",
    "Walk to the end",
    "Red in the frame",
    "Mirror scene",
    "Reel change",
    "End credits",
  ],
};

/** Newest placeholder date per section. Index 0 is that day; later rows step back. */
const NEWEST: Record<string, string> = {
  developer: "2026-10-26",
  learner: "2026-09-18",
  photographer: "2026-10-12",
  traveler: "2026-08-30",
  "life-recorder": "2026-07-04",
  reader: "2026-06-11",
  "movie-lover": "2026-05-02",
};

const DAY_STEP = 12;

function shiftDate(iso: string, daysBack: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() - daysBack);
  return date.toISOString().slice(0, 10);
}

const SECTION_ORDER = Object.keys(COPY);

export const FILM_FRAMES: FilmFrame[] = SECTION_ORDER.flatMap(
  (sectionId, sectionIndex) =>
    COPY[sectionId].map((headline, index) => ({
      id: `${sectionId}-${index + 1}`,
      sectionId,
      headline,
      image: FILM_SLIDES[(index + sectionIndex) % FILM_SLIDES.length],
      publishedAt: shiftDate(NEWEST[sectionId], index * DAY_STEP),
    })),
);
