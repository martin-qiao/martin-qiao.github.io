"use client";

import type { Ref } from "react";
import { VF_BOUNDS } from "@/lib/vfGeometry";
import styles from "./hasselblad.module.css";

export type HitTargetsProps = {
  onCrankClick: () => void;
  onGlassClick: () => void;
  /** Parent moves the glass target with the wind track. */
  glassRef?: Ref<HTMLButtonElement>;
};

/**
 * Invisible hit targets: crank advances section; glass opens overlay.
 * No visible chrome (design: discoverability via idle wind + hover cursor).
 */
export function HitTargets({
  onCrankClick,
  onGlassClick,
  glassRef,
}: HitTargetsProps) {
  return (
    <>
      <button
        type="button"
        className={styles.crankHit}
        aria-label="Advance section"
        onClick={onCrankClick}
      />
      <button
        ref={glassRef}
        type="button"
        className={styles.glassHit}
        aria-label="Open section"
        onClick={onGlassClick}
        style={{
          left: `${VF_BOUNDS.leftPct}%`,
          top: `${VF_BOUNDS.topPct}%`,
          width: `${VF_BOUNDS.widthPct}%`,
          height: `${VF_BOUNDS.heightPct}%`,
        }}
      />
    </>
  );
}
