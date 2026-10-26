/**
 * Viewfinder glass geometry for the 1280×720 Hasselblad hero.
 *
 * Measured from public/hasselblad/base.jpg (inner focusing-screen rect
 * against the black hood): px (470, 192)–(815, 493) → 345×301.
 * Re-verify if the base still is replaced.
 *
 * Mask convention (public/hasselblad/vf-mask.svg + DialWindLayer):
 * CSS mask-image — white = dial video visible, black = punched glass
 * hole so the VF content layer shows through.
 */
export const VF_BOUNDS = {
  leftPct: (470 / 1280) * 100,
  topPct: (192 / 720) * 100,
  widthPct: (345 / 1280) * 100,
  heightPct: (301 / 720) * 100,
};
