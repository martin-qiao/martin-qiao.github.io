"use client";

import type { Ref } from "react";
import styles from "./hasselblad.module.css";

const DEFAULT_SRC = "/hasselblad/dial-wind-v18.mp4";

export type DialWindLayerProps = {
  videoRef: Ref<HTMLVideoElement>;
  src?: string;
  reducedMotion: boolean;
  className?: string;
};

/**
 * Masked v18 wind video. Glass hole is punched via vf-mask.svg
 * (white = video visible, black = transparent). Parent owns play/seek.
 *
 * When prefers-reduced-motion, renders nothing — parent still advances
 * sections on the ~3s interval / crank click (glass crossfade only).
 */
export function DialWindLayer({
  videoRef,
  src = DEFAULT_SRC,
  reducedMotion,
  className,
}: DialWindLayerProps) {
  if (reducedMotion) return null;

  return (
    <video
      ref={videoRef}
      className={[styles.dialVideo, className].filter(Boolean).join(" ")}
      src={src}
      playsInline
      muted
      preload="auto"
      aria-hidden
    />
  );
}
