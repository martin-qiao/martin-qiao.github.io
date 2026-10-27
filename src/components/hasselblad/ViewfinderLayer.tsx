"use client";

import type { Ref } from "react";
import type { Section } from "@/lib/sections";
import { vfCrossfadeOpacity } from "@/lib/vfCrossfade";
import { VF_BOUNDS } from "@/lib/vfGeometry";
import styles from "./hasselblad.module.css";

export type ViewfinderLayerProps = {
  section: Section;
  /** Next photo. Present for the whole wind / reduced-motion crossfade. */
  incoming?: Section | null;
  /** 0 at the start of the swap, 1 at the end. */
  progress?: number;
  className?: string;
  /** Parent moves this box with the wind track. */
  boxRef?: Ref<HTMLDivElement>;
};

/**
 * Section photo + Special Elite title clipped to the VF glass rect.
 * The box is opaque black. During a swap the outgoing photo fades out
 * over the first half and the incoming photo fades in over the second
 * half, so a transparent frame reveals black instead of the chroma plate.
 */
export function ViewfinderLayer({
  section,
  incoming = null,
  progress = 0,
  className,
  boxRef,
}: ViewfinderLayerProps) {
  const swapping = incoming !== null && incoming.id !== section.id;
  const fade = vfCrossfadeOpacity(progress);
  const visible = swapping ? incoming : section;

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
      data-section-id={swapping ? section.id : visible.id}
    >
      {swapping ? (
        <div
          key={section.id}
          className={styles.vfStack}
          style={{ opacity: fade.outgoing }}
          aria-hidden
        >
          <SectionStill section={section} />
        </div>
      ) : null}
      <div
        key={visible.id}
        className={styles.vfStack}
        style={{ opacity: swapping ? fade.incoming : 1 }}
        aria-hidden={swapping ? true : undefined}
      >
        <SectionStill section={visible} />
      </div>
    </div>
  );
}

function SectionStill({ section }: { section: Section }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- presentational layer */}
      <img
        className={styles.vfImage}
        src={section.viewfinderImage}
        srcSet={section.viewfinderSrcSet}
        alt=""
        draggable={false}
      />
      <p className={styles.title}>{section.label}</p>
    </>
  );
}
