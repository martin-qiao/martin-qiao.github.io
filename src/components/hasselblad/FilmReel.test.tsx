// @vitest-environment jsdom

import { act } from "react";
import { vi } from "vitest";
import { createRoot, type Root } from "react-dom/client";
import { FILM_FRAMES } from "@/data/filmReel";
import { SECTIONS } from "@/data/sections";
import { framesForSection } from "@/lib/filmReel";
import { FilmReel } from "./FilmReel";

// React 19 warns unless the test runner opts into act().
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

/**
 * Section swaps must replace the frame list without assigning scrollTop.
 * The crank settles a new section on a timer; writing the offset there
 * yanks a wheel, trackpad, touch, or key scroll.
 */
test("a section swap keeps the reel scroll offset and shows the new frames", async () => {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root: Root = createRoot(host);

  const renderAt = async (index: number) => {
    await act(async () => {
      root.render(<FilmReel section={SECTIONS[index]} />);
    });
  };

  try {
    await renderAt(0);

    const scroller = host.querySelector<HTMLDivElement>('[role="region"]');
    expect(scroller).not.toBeNull();
    if (!scroller) return;

    let offset = 240;
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

    await renderAt(1);

    const nextFrames = framesForSection(FILM_FRAMES, SECTIONS[1].id);
    expect(
      host.querySelector("[data-section-id]")?.getAttribute("data-section-id"),
    ).toBe(SECTIONS[1].id);
    expect(host.textContent).toContain(nextFrames[0]?.headline);
    expect(host.textContent).not.toContain(
      framesForSection(FILM_FRAMES, SECTIONS[0].id)[0]?.headline,
    );
    expect(writes).toEqual([]);
    expect(scroller.scrollTop).toBe(240);
  } finally {
    await act(async () => {
      root.unmount();
    });
    host.remove();
  }
});

test("wheel, touch, scroll, and arrow keys report reel use; other keys do not", async () => {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  const onInteract = vi.fn();
  const onFocusChange = vi.fn();

  try {
    await act(async () => {
      root.render(
        <FilmReel
          section={SECTIONS[0]}
          onInteract={onInteract}
          onFocusChange={onFocusChange}
        />,
      );
    });
    const scroller = host.querySelector<HTMLDivElement>('[role="region"]');
    expect(scroller).not.toBeNull();
    if (!scroller) return;

    await act(async () => {
      scroller.dispatchEvent(new WheelEvent("wheel", { bubbles: true, deltaY: 40 }));
      scroller.dispatchEvent(new Event("touchstart", { bubbles: true }));
      scroller.dispatchEvent(new Event("scroll", { bubbles: true }));
      scroller.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
      );
      scroller.dispatchEvent(
        new KeyboardEvent("keydown", { key: "a", bubbles: true }),
      );
      scroller.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      scroller.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
    });

    expect(onInteract).toHaveBeenCalledTimes(4);
    expect(onFocusChange.mock.calls).toEqual([[true], [false]]);
  } finally {
    await act(async () => {
      root.unmount();
    });
    host.remove();
  }
});
