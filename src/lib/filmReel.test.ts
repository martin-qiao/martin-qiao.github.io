import { readFileSync } from "node:fs";
import { FILM_FRAMES } from "@/data/filmReel";
import { SECTIONS } from "@/data/sections";
import { framesForSection, type FilmFrame } from "./filmReel";

const css = readFileSync(
  new URL("../components/hasselblad/hasselblad.module.css", import.meta.url),
  "utf8",
);

function frame(partial: Partial<FilmFrame> & Pick<FilmFrame, "id" | "publishedAt">): FilmFrame {
  return {
    sectionId: "developer",
    headline: partial.id,
    image: "/hasselblad/film-reel/lake.jpg",
    ...partial,
  };
}

test("framesForSection keeps only that section, newest first", () => {
  const frames = [
    frame({ id: "old", publishedAt: "2024-01-02" }),
    frame({ id: "other", sectionId: "reader", publishedAt: "2026-12-01" }),
    frame({ id: "new", publishedAt: "2026-05-01" }),
    frame({ id: "mid", publishedAt: "2025-06-15" }),
  ];
  const snapshot = JSON.stringify(frames);

  expect(framesForSection(frames, "developer").map((item) => item.id)).toEqual([
    "new",
    "mid",
    "old",
  ]);
  expect(framesForSection(frames, "missing")).toEqual([]);
  expect(JSON.stringify(frames)).toBe(snapshot);
});

test("same-day frames tie-break on id", () => {
  const frames = [
    frame({ id: "b", publishedAt: "2026-01-01" }),
    frame({ id: "a", publishedAt: "2026-01-01" }),
  ];
  expect(framesForSection(frames, "developer").map((item) => item.id)).toEqual([
    "a",
    "b",
  ]);
});

test("every viewfinder section has a scrollable newest-first reel", () => {
  expect(SECTIONS.length).toBeGreaterThan(0);
  for (const section of SECTIONS) {
    const frames = framesForSection(FILM_FRAMES, section.id);
    expect(frames.length).toBeGreaterThan(5);
    for (let i = 1; i < frames.length; i += 1) {
      expect(frames[i - 1].publishedAt > frames[i].publishedAt).toBe(true);
      expect(frames[i].sectionId).toBe(section.id);
      expect(frames[i].headline.length).toBeGreaterThan(0);
    }
    expect(frames[0].publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  }
});

test("slot border, cover fit, fade mask, and camera nudge are in the shell CSS", () => {
  expect(css).toContain("--camera-nudge: 5cm");
  expect(css).toContain("2.2cqw");
  expect(css).toContain("rgb(12, 10, 8)");
  expect(css).toMatch(/\.reelThumb\s*\{[^}]*aspect-ratio:\s*1/);
  expect(css).toMatch(/\.reelThumb img\s*\{[^}]*object-fit:\s*cover/);
  expect(css).toContain("mask-image:");
  expect(css).toContain("overflow-y: auto");
  expect(css).not.toContain("scroll-snap");
});
