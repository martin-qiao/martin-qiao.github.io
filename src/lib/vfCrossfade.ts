/**
 * Wind-synced viewfinder crossfade.
 *
 * Old photo starts fading when the wind starts and is gone at the half-cycle
 * midpoint. The new photo reaches full opacity only when the cycle ends, so
 * it fades in over the second half. Those two curves do not overlap: at the
 * midpoint both opacities are 0. The glass itself stays opaque black, so the
 * chroma plate never shows through that hold.
 */
export function vfCrossfadeOpacity(progress: number): {
  outgoing: number;
  incoming: number;
} {
  const p = Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 0;
  return {
    outgoing: p >= 0.5 ? 0 : 1 - p / 0.5,
    incoming: p <= 0.5 ? 0 : (p - 0.5) / 0.5,
  };
}
