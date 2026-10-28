"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SECTIONS } from "@/data/sections";
import { BASE_STILL_SRC } from "@/lib/hasselbladAssets";
import { nextSectionIndex } from "@/lib/sections";
import { VF_FPS, VF_FRAME_COUNT } from "@/lib/vfTrack";
import { DialWindLayer } from "./DialWindLayer";
import { FilmReel } from "./FilmReel";
import { HitTargets } from "./HitTargets";
import { SectionOverlay } from "./SectionOverlay";
import { ViewfinderLayer } from "./ViewfinderLayer";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";
import { useSyncedVfGlass } from "./useSyncedVfGlass";
import styles from "./hasselblad.module.css";

const AUTO_WIND_MS = 3000;
const CROSSFADE_MS = 280;
const WIND_DURATION_S = VF_FRAME_COUNT / VF_FPS;
const BASE_SRC = BASE_STILL_SRC;

type VfSwap = {
  fromIndex: number;
  toIndex: number;
  progress: number;
};

type RafSlot = { current: number | null };

function cancelRaf(slot: RafSlot) {
  if (slot.current !== null) {
    cancelAnimationFrame(slot.current);
    slot.current = null;
  }
}

/** Timed crossfade used when the wind clip is skipped. */
function animateProgress(
  slot: RafSlot,
  durationMs: number,
  onProgress: (progress: number) => void,
): Promise<void> {
  return new Promise((resolve) => {
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      onProgress(progress);
      if (progress >= 1) {
        slot.current = null;
        resolve();
        return;
      }
      slot.current = requestAnimationFrame(tick);
    };
    slot.current = requestAnimationFrame(tick);
  });
}

/**
 * Sample the playing wind clip. Progress is currentTime / duration so the
 * outgoing thumb is gone at the half-cycle midpoint and the incoming thumb
 * is fully opaque only when the clip ends.
 */
function followWind(
  video: HTMLVideoElement,
  slot: RafSlot,
  onProgress: (progress: number) => void,
): Promise<void> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      video.removeEventListener("ended", onEnded);
      cancelRaf(slot);
      onProgress(1);
      resolve();
    };
    const onEnded = () => finish();
    const sample = () => {
      if (settled) return;
      const duration =
        Number.isFinite(video.duration) && video.duration > 0
          ? video.duration
          : WIND_DURATION_S;
      const progress = Math.min(1, Math.max(0, video.currentTime / duration));
      onProgress(progress);
      if (video.ended || progress >= 1) {
        finish();
        return;
      }
      slot.current = requestAnimationFrame(sample);
    };
    video.addEventListener("ended", onEnded);
    slot.current = requestAnimationFrame(sample);
  });
}

export function HasselbladHero() {
  const [index, setIndex] = useState(0);
  const [swap, setSwap] = useState<VfSwap | null>(null);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const vfRef = useRef<HTMLDivElement>(null);
  const glassRef = useRef<HTMLButtonElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const advancingRef = useRef(false);
  const overlayOpenRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indexRef = useRef(0);
  const swapRafRef = useRef<number | null>(null);
  const mountedRef = useRef(true);
  const reducedMotion = usePrefersReducedMotion();
  const reducedMotionRef = useRef(reducedMotion);

  useEffect(() => {
    overlayOpenRef.current = overlayOpen;
  }, [overlayOpen]);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cancelRaf(swapRafRef);
    };
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const setSwapProgress = useCallback((progress: number) => {
    if (!mountedRef.current) return;
    setSwap((current) => (current ? { ...current, progress } : current));
  }, []);

  const advance = useCallback(async () => {
    if (advancingRef.current) return;
    advancingRef.current = true;
    cancelRaf(swapRafRef);
    try {
      const fromIndex = indexRef.current;
      const toIndex = nextSectionIndex(fromIndex, SECTIONS.length);
      if (mountedRef.current) {
        setSwap({ fromIndex, toIndex, progress: 0 });
      }

      // Reduced-motion unmounts the wind clip. A failed play() takes the
      // same timed curve so the glass still never opens onto the plate.
      let wound = false;
      if (!reducedMotionRef.current && videoRef.current) {
        const video = videoRef.current;
        video.currentTime = 0;
        wound = await video
          .play()
          .then(() => true)
          .catch(() => false);
        if (wound) {
          await followWind(video, swapRafRef, setSwapProgress);
        }
      }
      if (!wound) {
        await animateProgress(swapRafRef, CROSSFADE_MS, setSwapProgress);
      }

      indexRef.current = toIndex;
      if (mountedRef.current) {
        setIndex(toIndex);
        setSwap(null);
      }
    } finally {
      advancingRef.current = false;
    }
  }, [setSwapProgress]);

  const scheduleNextRef = useRef<() => void>(() => {});

  useEffect(() => {
    scheduleNextRef.current = () => {
      clearTimer();
      if (overlayOpenRef.current) return;
      timerRef.current = setTimeout(() => {
        void (async () => {
          await advance();
          scheduleNextRef.current();
        })();
      }, AUTO_WIND_MS);
    };
  }, [advance, clearTimer]);

  useEffect(() => {
    if (overlayOpen) {
      clearTimer();
      return clearTimer;
    }
    scheduleNextRef.current();
    return clearTimer;
  }, [overlayOpen, clearTimer]);

  const onCrankClick = useCallback(() => {
    if (advancingRef.current) return;
    clearTimer();
    void (async () => {
      await advance();
      scheduleNextRef.current();
    })();
  }, [advance, clearTimer]);

  const onGlassClick = useCallback(() => {
    setOverlayOpen(true);
  }, []);

  useSyncedVfGlass(
    { videoRef, vfRef, glassRef, stageRef },
    reducedMotion,
  );

  const settled = SECTIONS[index] ?? SECTIONS[0];
  const outgoing = swap ? (SECTIONS[swap.fromIndex] ?? settled) : settled;
  const incoming = swap ? (SECTIONS[swap.toIndex] ?? null) : null;

  return (
    <div className={styles.frame}>
      <div
        ref={stageRef}
        className={styles.stage}
        data-reduced-motion={reducedMotion ? "true" : "false"}
        data-vf-frame="0"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- static base still; layered composite */}
        <img
          className={styles.fill}
          src={BASE_SRC}
          alt=""
          draggable={false}
        />
        <ViewfinderLayer
          section={outgoing}
          incoming={incoming}
          progress={swap?.progress ?? 0}
          boxRef={vfRef}
        />
        <DialWindLayer videoRef={videoRef} reducedMotion={reducedMotion} />
        <FilmReel section={settled} />
        <HitTargets
          onCrankClick={onCrankClick}
          onGlassClick={onGlassClick}
          glassRef={glassRef}
        />
        {overlayOpen ? (
          <SectionOverlay
            section={settled}
            onClose={() => setOverlayOpen(false)}
          />
        ) : null}
      </div>
    </div>
  );
}
