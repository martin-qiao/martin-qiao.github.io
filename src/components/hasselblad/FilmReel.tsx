"use client";

import { useEffect, useRef } from "react";
import { FILM_FRAMES } from "@/data/filmReel";
import { framesForSection } from "@/lib/filmReel";
import type { Section } from "@/lib/sections";
import styles from "./hasselblad.module.css";

export type FilmReelProps = {
  section: Section;
};

/**
 * Vertical amber film beside the camera body.
 *
 * Scroll is native `overflow-y` (wheel, trackpad, touch, arrow keys).
 * A mask on the viewport — not on the scrolling strip — fades the ends
 * into the black page while frames move underneath. No scroll-snap and
 * no transform hijack, so flick momentum and reduced-motion stay intact.
 * The list is the settled viewfinder section, newest publish date first.
 */
export function FilmReel({ section }: FilmReelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const frames = framesForSection(FILM_FRAMES, section.id);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTop = 0;
  }, [section.id]);

  if (frames.length === 0) return null;

  return (
    <aside className={styles.reelColumn} data-section-id={section.id}>
      <div className={styles.reelViewport}>
        <div
          ref={scrollRef}
          className={styles.reelScroll}
          tabIndex={0}
          role="region"
          aria-label={`${section.label} film, newest first`}
        >
          <div className={styles.reelStrip}>
            <div className={styles.reelRailLeft} aria-hidden="true" />
            <div className={styles.reelRailRight} aria-hidden="true" />
            <ol className={styles.reelList}>
              {frames.map((frame) => (
                <li
                  key={frame.id}
                  className={styles.reelFrame}
                  data-published={frame.publishedAt}
                >
                  <figure className={styles.reelSlot}>
                    <div className={styles.reelThumb}>
                      {/* eslint-disable-next-line @next/next/no-img-element -- slot border is CSS; CMS photos cover the square */}
                      <img src={frame.image} alt="" draggable={false} />
                      <figcaption className={styles.reelHeadline}>
                        {frame.headline}
                      </figcaption>
                    </div>
                  </figure>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </aside>
  );
}
