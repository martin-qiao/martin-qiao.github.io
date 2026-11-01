import { readFileSync } from "node:fs";
import { ABOUT, FIDGET, FOOTER, HOME_CHAPTERS, HOME_NAV, LENS, NOTES } from "./home";

const heroCss = readFileSync(
  new URL("../components/hasselblad/hasselblad.module.css", import.meta.url),
  "utf8",
);

const pageSource = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const lensSource = readFileSync(
  new URL("../components/home/LensChapter.tsx", import.meta.url),
  "utf8",
);

test("chapters stay in scrollytelling order", () => {
  expect(HOME_CHAPTERS).toEqual([
    "about",
    "through-the-lens",
    "study-notes",
    "fidget",
  ]);
  expect(HOME_NAV.map((link) => link.href)).toEqual(
    HOME_CHAPTERS.map((id) => `#${id}`),
  );
});

test("about copy is the review placeholder", () => {
  expect(ABOUT.eyebrow).toBe("About me");
  expect(ABOUT.headline).toBe("Building, shooting, and writing from Hong Kong.");
  expect(ABOUT.body).toContain("quiet shelf for that mix.");
  expect(ABOUT.portraits.map((portrait) => portrait.label)).toEqual([
    "Harbor walk",
    "Studio light",
    "Weekend film",
  ]);
  expect(ABOUT.cta).toEqual({ label: "Full résumé", href: "#" });
});

test("lens, notes, fidget, and footer copy match the brief", () => {
  expect(LENS.eyebrow).toBe("Through The Lens");
  expect(LENS.headline).toBe(
    "Frames chosen like a roll — one viewfinder, many frames.",
  );
  expect(lensSource).not.toContain("Wind the crank");
  expect(lensSource).not.toContain("caption");
  expect(NOTES.posts.map((post) => post.title)).toEqual([
    "Scroll-linked animation without jank",
    "Why a viewfinder works as navigation",
    "Shipping a personal site on Vercel",
  ]);
  expect(FIDGET.tiles.map((tile) => tile.title)).toEqual([
    "Contax T2 (clone hunt)",
    "Desk kinetic toy",
    "film-reel CLI",
    "Sticky stage demo",
  ]);
  expect(FOOTER.text).toBe(
    "© Martin Qiao · mock content for look-and-feel review",
  );
});

test("homepage composes the four chapters around the existing camera", () => {
  expect(pageSource).toContain("AboutSection");
  expect(pageSource).toContain("LensChapter");
  expect(pageSource).toContain("NotesSection");
  expect(pageSource).toContain("FidgetSection");
  expect(lensSource).toContain("HasselbladHero");
  expect(lensSource).toContain("LENS.id");
});

test("camera stage is embedded, with the 5cm nudge kept", () => {
  expect(heroCss).toContain("--camera-nudge: 5cm");
  expect(heroCss).not.toMatch(/\.frame\s*\{[^}]*position:\s*fixed/);
  expect(heroCss).toMatch(/\.frame\s*\{[^}]*position:\s*absolute/);
});

test("lens title stays one line and the stage is no longer capped at 58dvh", () => {
  const homeCss = readFileSync(
    new URL("../components/home/home.module.css", import.meta.url),
    "utf8",
  );
  expect(homeCss).toMatch(/\.lensHeadline\s*\{[^}]*white-space:\s*nowrap/);
  expect(homeCss).not.toContain("58dvh");
  expect(homeCss).not.toContain("Wind the crank");
});
