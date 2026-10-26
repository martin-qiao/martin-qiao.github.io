"use client";

import { useEffect, useRef } from "react";
import type { Section } from "@/lib/sections";
import styles from "./hasselblad.module.css";

export type SectionOverlayProps = {
  section: Section;
  onClose: () => void;
};

/**
 * Full-section slide panel over the camera composite.
 * Basic focus trap: focus close on open; Escape + backdrop click → onClose.
 */
export function SectionOverlay({ section, onClose }: SectionOverlayProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className={styles.overlayRoot}>
      <button
        type="button"
        className={styles.overlayBackdrop}
        aria-label="Close section"
        onClick={onClose}
      />
      <div
        className={styles.overlayPanel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="section-overlay-title"
      >
        <button
          ref={closeRef}
          type="button"
          className={styles.overlayClose}
          aria-label="Close"
          onClick={onClose}
        >
          ×
        </button>
        <h2 id="section-overlay-title" className={styles.overlayTitle}>
          {section.label}
        </h2>
        <div className={styles.overlayBody}>
          {section.overlayBody.split("\n\n").map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
