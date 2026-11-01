/** Mock homepage copy for look-and-feel review. Replace in place later. */

export type HomeNavLink = {
  href: string;
  label: string;
};

export type HomePortrait = {
  id: string;
  label: string;
  tone: "harbor" | "studio" | "weekend";
};

export type HomeNote = {
  id: string;
  date: string;
  dateTime: string;
  title: string;
  summary: string;
};

export type HomeGadget = {
  id: string;
  title: string;
  summary: string;
};

export const HOME_CHAPTERS = [
  "about",
  "through-the-lens",
  "study-notes",
  "fidget",
] as const;

export const HOME_NAV: HomeNavLink[] = [
  { href: "#about", label: "About me" },
  { href: "#through-the-lens", label: "Through The Lens" },
  { href: "#study-notes", label: "Study Notes" },
  { href: "#fidget", label: "Fidget" },
];

export const ABOUT = {
  id: "about",
  eyebrow: "About me",
  headline: "Building, shooting, and writing from Hong Kong.",
  body: "I work at the intersection of banking technology and side projects that scratch a creative itch. Days go to systems and risk; evenings to film photography, short technical notes, and small gadgets that make the desk more interesting. This site is the quiet shelf for that mix.",
  portraits: [
    { id: "harbor", label: "Harbor walk", tone: "harbor" },
    { id: "studio", label: "Studio light", tone: "studio" },
    { id: "weekend", label: "Weekend film", tone: "weekend" },
  ] satisfies HomePortrait[],
  cta: {
    label: "Full résumé",
    href: "#",
  },
} as const;

export const LENS = {
  id: "through-the-lens",
  eyebrow: "Through The Lens",
  headline: "Frames chosen like a roll — one viewfinder, many frames.",
  caption:
    "Wind the crank to step the gallery. Scroll the film strip for titles ranked by date.",
} as const;

export const NOTES = {
  id: "study-notes",
  eyebrow: "Study Notes",
  headline: "Technical writing, kept readable.",
  body: "Short posts on web motion, photography UX, and shipping personal sites — written so a tired evening reader still finishes them.",
  posts: [
    {
      id: "scroll-linked",
      date: "Oct 2026",
      dateTime: "2026-10",
      title: "Scroll-linked animation without jank",
      summary:
        "Sticky stages, transform budgets, and staying at 60fps on mid-range phones.",
    },
    {
      id: "viewfinder-nav",
      date: "Sep 2026",
      dateTime: "2026-09",
      title: "Why a viewfinder works as navigation",
      summary:
        "Medium-format metaphor as section selector — and when it should stay a subpage.",
    },
    {
      id: "vercel-ship",
      date: "Aug 2026",
      dateTime: "2026-08",
      title: "Shipping a personal site on Vercel",
      summary:
        "Preview URLs, squash merges, and a small checklist before production.",
    },
  ] satisfies HomeNote[],
} as const;

export const FIDGET = {
  id: "fidget",
  eyebrow: "Fidget",
  headline: "Gadgets, experiments, side code.",
  body: "Pocket tools from online shops next to tiny coding toys — same shelf, same type, no product-page noise.",
  tiles: [
    {
      id: "contax",
      title: "Contax T2 (clone hunt)",
      summary: "Pocket point-and-shoot rabbit hole",
    },
    {
      id: "kinetic",
      title: "Desk kinetic toy",
      summary: "Magnetic fidget that actually stays put",
    },
    {
      id: "film-reel-cli",
      title: "film-reel CLI",
      summary: "Tiny Node tool that ranks frames by EXIF date",
    },
    {
      id: "sticky-demo",
      title: "Sticky stage demo",
      summary: "Minimal scrollytelling sandbox",
    },
  ] satisfies HomeGadget[],
} as const;

export const FOOTER = {
  text: "© Martin Qiao · mock content for look-and-feel review",
} as const;
