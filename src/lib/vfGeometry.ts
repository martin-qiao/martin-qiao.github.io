/**
 * Viewfinder glass geometry for the 1280×720 Hasselblad hero.
 *
 * Locked v24h glass (public/hasselblad/vf-bounds-v24h.json), measured on
 * base-v24-rest.jpg / dial-wind-v24h-even-pace.mp4:
 * px (524, 301) 234×233. The body is locked, so this rect holds for the clip.
 *
 * Mask convention (public/hasselblad/vf-mask.svg + DialWindLayer):
 * CSS mask-image — white = dial video visible, black = punched glass
 * hole so the VF content layer shows through.
 * While the wind plays, useSyncedVfGlass overrides the mask hole per frame.
 */
export const HERO_WIDTH = 1280;
export const HERO_HEIGHT = 720;

export const VF_GLASS_PX = { x: 524, y: 301, w: 234, h: 233 } as const;

export const VF_BOUNDS = {
  leftPct: (VF_GLASS_PX.x / HERO_WIDTH) * 100,
  topPct: (VF_GLASS_PX.y / HERO_HEIGHT) * 100,
  widthPct: (VF_GLASS_PX.w / HERO_WIDTH) * 100,
  heightPct: (VF_GLASS_PX.h / HERO_HEIGHT) * 100,
};
