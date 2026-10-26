import track from "@/data/vf-track.json";
import {
  HERO_HEIGHT,
  HERO_WIDTH,
  VF_GLASS_PX,
} from "@/lib/vfGeometry";

export const VF_FPS = track.fps;
export const VF_FRAMES = track.frames;
export const VF_FRAME_COUNT = track.frames.length;

/**
 * The smoothed track sits up to ~3px inside the green plate (compression and
 * the soft chroma edge). Outset the hole and the thumb together so that fringe
 * stays covered without a separate pop at frame 0.
 */
export const GLASS_KEY_OUTSET_PX = 3;

export type GlassRect = { x: number; y: number; w: number; h: number };

export type GlassBoxStyle = {
  left: string;
  top: string;
  width: string;
  height: string;
};

export type VfPresentation = {
  frameIndex: number;
  box: GlassBoxStyle;
  /** Luminance mask punched to this frame's glass, including the keying outset. */
  maskImage: string;
};

/**
 * Nearest track sample for a video currentTime. Out-of-range times clamp
 * to the clip; the caller snaps back to frame 0 after `ended`.
 */
export function frameIndexForTime(
  currentTime: number,
  frameCount: number,
  fps: number,
): number {
  if (
    frameCount <= 0 ||
    !Number.isFinite(currentTime) ||
    !Number.isFinite(fps) ||
    fps <= 0
  ) {
    return 0;
  }
  const index = Math.round(currentTime * fps);
  if (!Number.isFinite(index)) return 0;
  return Math.min(frameCount - 1, Math.max(0, index));
}

function clampFrameIndex(index: number): number {
  if (!Number.isFinite(index) || VF_FRAME_COUNT <= 0) return 0;
  return Math.min(VF_FRAME_COUNT - 1, Math.max(0, Math.round(index)));
}

/**
 * Axis-aligned glass from the smoothed center and size.
 * Corner skew vs that rect stays under ~1.5px, so a translate + size
 * tracks the body without a perspective warp.
 */
function rectForTrackFrame(frame: (typeof VF_FRAMES)[number]): GlassRect {
  return {
    x: frame.cx - frame.w / 2,
    y: frame.cy - frame.h / 2,
    w: frame.w,
    h: frame.h,
  };
}

function expandForKey(rect: GlassRect): GlassRect {
  const outset = GLASS_KEY_OUTSET_PX;
  return {
    x: rect.x - outset,
    y: rect.y - outset,
    w: rect.w + outset * 2,
    h: rect.h + outset * 2,
  };
}

function boxStyleForRect(rect: GlassRect): GlassBoxStyle {
  return {
    left: `${(rect.x / HERO_WIDTH) * 100}%`,
    top: `${(rect.y / HERO_HEIGHT) * 100}%`,
    width: `${(rect.w / HERO_WIDTH) * 100}%`,
    height: `${(rect.h / HERO_HEIGHT) * 100}%`,
  };
}

function formatPx(value: number): string {
  return (Math.round(value * 100) / 100).toString();
}

/** Luminance mask: white video, black glass hole. Same convention as vf-mask.svg. */
export function maskImageForRect(rect: GlassRect): string {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${HERO_WIDTH} ${HERO_HEIGHT}'>` +
    `<rect width='${HERO_WIDTH}' height='${HERO_HEIGHT}' fill='white'/>` +
    `<rect x='${formatPx(rect.x)}' y='${formatPx(rect.y)}' width='${formatPx(rect.w)}' height='${formatPx(rect.h)}' fill='black'/>` +
    `</svg>`;
  const encoded = encodeURIComponent(svg).replaceAll("'", "%27");
  return `url("data:image/svg+xml,${encoded}")`;
}

/**
 * Rest (frame 0, and after the clip ends) uses the locked integer glass.
 * Later frames follow the track so the thumb and the mask hole move together.
 */
export function presentationForFrame(index: number): VfPresentation {
  const frame = VF_FRAMES[clampFrameIndex(index)] ?? VF_FRAMES[0];
  const atRest = !frame || frame.i === 0;
  const rect = expandForKey(
    atRest
      ? { x: VF_GLASS_PX.x, y: VF_GLASS_PX.y, w: VF_GLASS_PX.w, h: VF_GLASS_PX.h }
      : rectForTrackFrame(frame),
  );
  return {
    frameIndex: frame?.i ?? 0,
    box: boxStyleForRect(rect),
    // Inline mask at rest too, so the hole matches the outset thumb.
    // The stylesheet svg remains the pre-paint fallback at the locked rect.
    maskImage: maskImageForRect(rect),
  };
}
