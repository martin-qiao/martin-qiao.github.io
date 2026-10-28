export type FilmFrame = {
  id: string;
  sectionId: string;
  headline: string;
  image: string;
  /** ISO date `YYYY-MM-DD`. Newer dates rank first. */
  publishedAt: string;
};

/**
 * Frames for one viewfinder section, newest publish date first.
 * Same-day ties break on id so the order stays stable.
 * Does not mutate `frames`.
 */
export function framesForSection(
  frames: readonly FilmFrame[],
  sectionId: string,
): FilmFrame[] {
  return frames
    .filter((frame) => frame.sectionId === sectionId)
    .slice()
    .sort((a, b) => {
      if (a.publishedAt !== b.publishedAt) {
        return a.publishedAt < b.publishedAt ? 1 : -1;
      }
      if (a.id === b.id) return 0;
      return a.id < b.id ? -1 : 1;
    });
}
