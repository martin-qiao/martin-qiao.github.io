"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SECTIONS } from "@/data/sections";
import { BASE_STILL_SRC } from "@/lib/hasselbladAssets";
import {
  REEL_IDLE_MS,
  reelHoldsAutoWind,
  stripIndexAfterWind,
  type ReelHold,
  type WindSource,
} from "@/lib/reelWind";
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

export const AUTO_WIND_MS = 3000;
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
  const [intentionalIndex, setIntentionalIndex] = useState(0);
  const [swap, setSwap] = useState<VfSwap | null>(null);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const vfRef = useRef<HTMLDivElement>(null);
  const glassRef = useRef<HTMLButtonElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const advancingRef = useRef(false);
  const overlayOpenRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indexRef = useRef(0);
  const intentionalRef = useRef(0);
  const holdRef = useRef<ReelHold>({ focused: false, lastInputAt: null });
  const swapRafRef = useRef<number | null>(null);
  const mountedRef = useRef(true);
  const reducedMotion = usePrefersReducedMotion();
  const reducedMotionRef = useRef(reducedMotion);
  const advanceRef = useRef<(source: WindSource) => Promise<boolean>>(
    async () => false,
  );
  const armAutoWindRef = useRef<() => void>(() => {});
  const holdAutoWindRef = useRef<() => void>(() => {});

  useEffect(() => {
    overlayOpenRef.current = overlayOpen;
  }, [overlayOpen]);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current !== null) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cancelRaf(swapRafRef);
      clearTimer();
      clearIdleTimer();
    };
  }, [clearTimer, clearIdleTimer]);

  const setSwapProgress = useCallback((progress: number) => {
    if (!mountedRef.current) return;
    setSwap((current) => (current ? { ...current, progress } : current));
  }, []);

  const advance = useCallback(async (source: WindSource) => {
    if (advancingRef.current) return false;
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

      const stripIndex = stripIndexAfterWind(
        intentionalRef.current,
        toIndex,
        source,
      );
      indexRef.current = toIndex;
      intentionalRef.current = stripIndex;
      if (mountedRef.current) {
        setIndex(toIndex);
        setIntentionalIndex(stripIndex);
        setSwap(null);
      }
      return true;
    } finally {
      advancingRef.current = false;
    }
  }, [setSwapProgress]);

  useEffect(() => {
    advanceRef.current = advance;
  }, [advance]);

  /**
   * Arms the normal gap between auto-winds. A reel hold skips this;
   * when that hold ends, the idle timer starts the next wind itself.
   */
  const armAutoWind = useCallback(() => {
    clearTimer();
    if (overlayOpenRef.current) return;
    if (reelHoldsAutoWind(holdRef.current, Date.now())) return;
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      void (async () => {
        const started = await advanceRef.current("auto");
        if (started && mountedRef.current) armAutoWindRef.current();
      })();
    }, AUTO_WIND_MS);
  }, [clearTimer]);

  useEffect(() => {
    armAutoWindRef.current = armAutoWind;
  }, [armAutoWind]);

  /**
   * Cancel a pending auto-wind. While the reel is focused, stay paused.
   * After wheel, touch, keys, or scroll, start the next auto-wind once
   * REEL_IDLE_MS has passed with no further input.
   */
  const holdAutoWind = useCallback(() => {
    clearTimer();
    clearIdleTimer();
    if (overlayOpenRef.current) return;
    const now = Date.now();
    if (!reelHoldsAutoWind(holdRef.current, now)) {
      armAutoWind();
      return;
    }
    const lastInputAt = holdRef.current.lastInputAt;
    if (holdRef.current.focused || lastInputAt == null) return;
    const remaining = REEL_IDLE_MS - (now - lastInputAt);
    idleTimerRef.current = setTimeout(() => {
      idleTimerRef.current = null;
      void (async () => {
        if (overlayOpenRef.current) return;
        if (reelHoldsAutoWind(holdRef.current, Date.now())) return;
        const started = await advanceRef.current("auto");
        if (started && mountedRef.current) armAutoWindRef.current();
      })();
    }, Math.max(0, remaining));
  }, [armAutoWind, clearIdleTimer, clearTimer]);

  useEffect(() => {
    holdAutoWindRef.current = holdAutoWind;
  }, [holdAutoWind]);

  useEffect(() => {
    if (overlayOpen) {
      clearTimer();
      clearIdleTimer();
      return () => {
        clearTimer();
        clearIdleTimer();
      };
    }
    holdAutoWind();
    return () => {
      clearTimer();
      clearIdleTimer();
    };
  }, [overlayOpen, holdAutoWind, clearTimer, clearIdleTimer]);

  const onCrankClick = useCallback(() => {
    if (advancingRef.current) return;
    clearTimer();
    clearIdleTimer();
    void (async () => {
      const started = await advance("intentional");
      if (started && mountedRef.current) holdAutoWindRef.current();
    })();
  }, [advance, clearIdleTimer, clearTimer]);

  const onReelInteract = useCallback(() => {
    holdRef.current = { ...holdRef.current, lastInputAt: Date.now() };
    holdAutoWindRef.current();
  }, []);

  const onReelFocusChange = useCallback((focused: boolean) => {
    holdRef.current = {
      focused,
      lastInputAt: focused ? holdRef.current.lastInputAt : Date.now(),
    };
    holdAutoWindRef.current();
  }, []);

  const onGlassClick = useCallback(() => {
    setOverlayOpen(true);
  }, []);

  useSyncedVfGlass(
    { videoRef, vfRef, glassRef, stageRef },
    reducedMotion,
  );

  const settled = SECTIONS[index] ?? SECTIONS[0];
  const stripSection = SECTIONS[intentionalIndex] ?? SECTIONS[0];
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
        <FilmReel
          section={stripSection}
          onInteract={onReelInteract}
          onFocusChange={onReelFocusChange}
        />
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
