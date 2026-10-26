"use client";

import { VF_BOUNDS } from "@/lib/vfGeometry";
import styles from "./hasselblad.module.css";

export type HitTargetsProps = {
  onCrankClick: () => void;
  onGlassClick: () => void;
};

/**
 * Invisible hit targets: crank advances section; glass opens overlay.
 * No visible chrome (design: discoverability via idle wind + hover cursor).
 */
export function HitTargets({ onCrankClick, onGlassClick }: HitTargetsProps) {
  return (
    <>
      <button
        type="button"
        className={styles.crankHit}
        aria-label="Advance section"
        onClick={onCrankClick}
      />
      <button
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
