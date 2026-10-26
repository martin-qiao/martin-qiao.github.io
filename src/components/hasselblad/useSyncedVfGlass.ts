"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";
import {
  frameIndexForTime,
  presentationForFrame,
  VF_FPS,
  VF_FRAME_COUNT,
} from "@/lib/vfTrack";

type SyncNodes = {
  videoRef: RefObject<HTMLVideoElement | null>;
  vfRef: RefObject<HTMLDivElement | null>;
  glassRef: RefObject<HTMLButtonElement | null>;
  stageRef: RefObject<HTMLDivElement | null>;
};

function applyPresentation(nodes: SyncNodes, index: number) {
  const presentation = presentationForFrame(index);
  const { box } = presentation;
  for (const el of [nodes.vfRef.current, nodes.glassRef.current]) {
    if (!el) continue;
    el.style.left = box.left;
    el.style.top = box.top;
    el.style.width = box.width;
    el.style.height = box.height;
  }
  const video = nodes.videoRef.current;
  if (video) {
    if (presentation.maskImage) {
      video.style.maskImage = presentation.maskImage;
      video.style.setProperty("-webkit-mask-image", presentation.maskImage);
    } else {
      video.style.removeProperty("mask-image");
      video.style.removeProperty("-webkit-mask-image");
    }
  }
  const frameAttr = String(presentation.frameIndex);
  nodes.stageRef.current?.setAttribute("data-vf-frame", frameAttr);
  nodes.vfRef.current?.setAttribute("data-vf-frame", frameAttr);
}

/**
 * Moves the viewfinder thumb, glass hit target, and mask hole with
 * vf-track.json. Samples video.currentTime while the wind plays and
 * returns to frame 0 at rest (paused at 0, or after ended).
 * The hole is outset a few pixels from the track so the soft green edge
 * stays keyed out. Reduced motion leaves that rest pose fixed — no shake.
 */
export function useSyncedVfGlass(
  { videoRef, vfRef, glassRef, stageRef }: SyncNodes,
  reducedMotion: boolean,
) {
  const frameRef = useRef(0);

  useLayoutEffect(() => {
    const nodes = { videoRef, vfRef, glassRef, stageRef };
    frameRef.current = 0;
    applyPresentation(nodes, 0);
    if (reducedMotion) return;

    const video = videoRef.current;
    if (!video) return;

    let raf = 0;
    const stop = () => cancelAnimationFrame(raf);

    const tick = () => {
      if (video.paused || video.ended) return;
      const index = frameIndexForTime(video.currentTime, VF_FRAME_COUNT, VF_FPS);
      frameRef.current = index;
      applyPresentation(nodes, index);
      raf = requestAnimationFrame(tick);
    };

    const onPlay = () => {
      stop();
      raf = requestAnimationFrame(tick);
    };

    const onEnded = () => {
      stop();
      frameRef.current = 0;
      applyPresentation(nodes, 0);
    };

    const onPause = () => {
      stop();
      if (video.ended || video.currentTime <= 0) {
        frameRef.current = 0;
        applyPresentation(nodes, 0);
        return;
      }
      const index = frameIndexForTime(video.currentTime, VF_FRAME_COUNT, VF_FPS);
      frameRef.current = index;
      applyPresentation(nodes, index);
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("ended", onEnded);
    video.addEventListener("pause", onPause);
    return () => {
      stop();
      video.removeEventListener("play", onPlay);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("pause", onPause);
    };
  }, [reducedMotion, videoRef, vfRef, glassRef, stageRef]);

  useLayoutEffect(() => {
    applyPresentation({ videoRef, vfRef, glassRef, stageRef }, frameRef.current);
  });
}
