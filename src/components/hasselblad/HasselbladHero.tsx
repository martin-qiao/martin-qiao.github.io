"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SECTIONS } from "@/data/sections";
import { nextSectionIndex } from "@/lib/sections";
import { DialWindLayer } from "./DialWindLayer";
import { HitTargets } from "./HitTargets";
import { SectionOverlay } from "./SectionOverlay";
import { ViewfinderLayer } from "./ViewfinderLayer";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";
import styles from "./hasselblad.module.css";

const AUTO_WIND_MS = 3000;
const BASE_SRC = "/hasselblad/base.jpg";

function waitForEvent(target: EventTarget, type: string): Promise<void> {
  return new Promise((resolve) => {
    const onEvent = () => {
      target.removeEventListener(type, onEvent);
      resolve();
    };
    target.addEventListener(type, onEvent);
  });
}

export function HasselbladHero() {
  const [index, setIndex] = useState(0);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const advancingRef = useRef(false);
  const overlayOpenRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const reducedMotionRef = useRef(reducedMotion);

  useEffect(() => {
    overlayOpenRef.current = overlayOpen;
  }, [overlayOpen]);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const advance = useCallback(async () => {
    if (advancingRef.current) return;
    advancingRef.current = true;
    try {
      // Reduced-motion: DialWindLayer is null — skip video, still advance index.
      if (!reducedMotionRef.current && videoRef.current) {
        const video = videoRef.current;
        video.currentTime = 0;
        const played = await video
          .play()
          .then(() => true)
          .catch(() => false);
        if (played) {
          await waitForEvent(video, "ended");
        }
      }
      setIndex((i) => nextSectionIndex(i, SECTIONS.length));
    } finally {
      advancingRef.current = false;
    }
  }, []);

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

  const section = SECTIONS[index] ?? SECTIONS[0];

  return (
    <div
      className={styles.stage}
      data-reduced-motion={reducedMotion ? "true" : "false"}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static base still; layered composite */}
      <img
        className={styles.fill}
        src={BASE_SRC}
        alt=""
        draggable={false}
      />
      <ViewfinderLayer section={section} />
      <DialWindLayer videoRef={videoRef} reducedMotion={reducedMotion} />
      <HitTargets onCrankClick={onCrankClick} onGlassClick={onGlassClick} />
      {overlayOpen ? (
        <SectionOverlay
          section={section}
          onClose={() => setOverlayOpen(false)}
        />
      ) : null}
    </div>
  );
}
