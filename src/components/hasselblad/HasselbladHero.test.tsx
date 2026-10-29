// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { vi } from "vitest";
import { SECTIONS } from "@/data/sections";
import { REEL_IDLE_MS } from "@/lib/reelWind";
import { AUTO_WIND_MS, HasselbladHero } from "./HasselbladHero";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

function installMediaStubs() {
  if (!window.matchMedia) {
    window.matchMedia = (query: string) =>
      ({
        matches: false,
        media: query,
        addEventListener() {},
        removeEventListener() {},
        addListener() {},
        removeListener() {},
        dispatchEvent() {
          return false;
        },
        onchange: null,
      }) as MediaQueryList;
  }
  HTMLMediaElement.prototype.play = () =>
    Promise.reject(new DOMException("no media in test"));
}

function sectionIds(host: HTMLElement) {
  const reel = host.querySelector('[role="region"]')?.closest("[data-section-id]");
  const viewfinder = [...host.querySelectorAll("[data-section-id]")].find(
    (node) => node !== reel,
  );
  return {
    reel: reel?.getAttribute("data-section-id") ?? null,
    viewfinder: viewfinder?.getAttribute("data-section-id") ?? null,
  };
}

async function advance(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

test("reel use pauses auto-wind; only a deliberate crank changes strip frames", async () => {
  installMediaStubs();
  vi.useFakeTimers();
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root: Root = createRoot(host);

  try {
    await act(async () => {
      root.render(<HasselbladHero />);
    });

    expect(sectionIds(host)).toEqual({
      reel: SECTIONS[0].id,
      viewfinder: SECTIONS[0].id,
    });

    await advance(AUTO_WIND_MS + 400);
    expect(sectionIds(host)).toEqual({
      reel: SECTIONS[0].id,
      viewfinder: SECTIONS[1].id,
    });

    const scroller = host.querySelector<HTMLDivElement>('[role="region"]');
    expect(scroller).not.toBeNull();
    if (!scroller) return;

    let offset = 180;
    const writes: number[] = [];
    Object.defineProperty(scroller, "scrollTop", {
      configurable: true,
      get() {
        return offset;
      },
      set(value: number) {
        writes.push(value);
        offset = value;
      },
    });

    await act(async () => {
      scroller.dispatchEvent(new WheelEvent("wheel", { bubbles: true, deltaY: 80 }));
    });

    await advance(REEL_IDLE_MS - 50);
    expect(sectionIds(host).viewfinder).toBe(SECTIONS[1].id);
    expect(sectionIds(host).reel).toBe(SECTIONS[0].id);

    await advance(500);
    expect(sectionIds(host)).toEqual({
      reel: SECTIONS[0].id,
      viewfinder: SECTIONS[2].id,
    });

    const crank = host.querySelector<HTMLButtonElement>(
      '[aria-label="Advance section"]',
    );
    expect(crank).not.toBeNull();
    await act(async () => {
      crank?.click();
    });
    await advance(400);

    expect(sectionIds(host)).toEqual({
      reel: SECTIONS[3].id,
      viewfinder: SECTIONS[3].id,
    });
    expect(writes).toEqual([]);
    expect(scroller.scrollTop).toBe(180);
  } finally {
    await act(async () => {
      root.unmount();
    });
    host.remove();
    vi.useRealTimers();
  }
});
