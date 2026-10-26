"use client";

import { useEffect, useRef, useState, type Ref } from "react";
import type { Section } from "@/lib/sections";
import { VF_BOUNDS } from "@/lib/vfGeometry";
import styles from "./hasselblad.module.css";

export type ViewfinderLayerProps = {
  section: Section;
  className?: string;
  /** Parent moves this box with the wind track. */
  boxRef?: Ref<HTMLDivElement>;
};

const CROSSFADE_MS = 280;

/**
 * Section photo + Special Elite title clipped to the VF glass rect.
 * Cheap opacity crossfade when the section changes (reduced-motion path
 * skips wind video and relies on this swap).
 */
export function ViewfinderLayer({
  section,
  className,
  boxRef,
}: ViewfinderLayerProps) {
  const [current, setCurrent] = useState(section);
  const [previous, setPrevious] = useState<Section | null>(null);
  const currentRef = useRef(section);

  useEffect(() => {
    if (section.id === currentRef.current.id) return;
    setPrevious(currentRef.current);
    currentRef.current = section;
    setCurrent(section);
    const timer = window.setTimeout(() => setPrevious(null), CROSSFADE_MS);
    return () => window.clearTimeout(timer);
  }, [section]);

  return (
    <div
      ref={boxRef}
      className={[styles.vf, className].filter(Boolean).join(" ")}
      style={{
        left: `${VF_BOUNDS.leftPct}%`,
        top: `${VF_BOUNDS.topPct}%`,
        width: `${VF_BOUNDS.widthPct}%`,
        height: `${VF_BOUNDS.heightPct}%`,
        containerType: "size",
      }}
      data-section-id={current.id}
    >
      {previous ? (
        <div className={styles.vfStack} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element -- presentational layer */}
          <img
            className={styles.vfImage}
            src={previous.viewfinderImage}
            srcSet={previous.viewfinderSrcSet}
            alt=""
            draggable={false}
          />
          <p className={styles.title}>{previous.label}</p>
        </div>
      ) : null}
      <div
        key={current.id}
        className={[styles.vfStack, previous ? styles.vfIncoming : ""]
          .filter(Boolean)
          .join(" ")}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- presentational layer; parent owns loading */}
        <img
          className={styles.vfImage}
          src={current.viewfinderImage}
          srcSet={current.viewfinderSrcSet}
          alt=""
          draggable={false}
        />
        <p className={styles.title}>{current.label}</p>
      </div>
    </div>
  );
}
