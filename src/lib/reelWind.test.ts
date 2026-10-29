import {
  REEL_IDLE_MS,
  reelHoldsAutoWind,
  stripIndexAfterWind,
} from "./reelWind";

test("reel input holds auto-wind until the idle window elapses", () => {
  const now = 10_000;
  const hold = { focused: false, lastInputAt: now };

  expect(REEL_IDLE_MS).toBeGreaterThanOrEqual(3000);
  expect(REEL_IDLE_MS).toBeLessThanOrEqual(5000);
  expect(reelHoldsAutoWind(hold, now + REEL_IDLE_MS - 1)).toBe(true);
  expect(reelHoldsAutoWind(hold, now + REEL_IDLE_MS)).toBe(false);
});

test("a focused reel holds auto-wind after the idle window", () => {
  const now = 10_000;
  expect(
    reelHoldsAutoWind(
      { focused: true, lastInputAt: now - REEL_IDLE_MS - 1 },
      now,
    ),
  ).toBe(true);
});

test("an untouched reel does not hold auto-wind", () => {
  expect(reelHoldsAutoWind({ focused: false, lastInputAt: null }, 0)).toBe(
    false,
  );
});

test("auto-wind keeps the strip on the intentional section", () => {
  expect(stripIndexAfterWind(0, 3, "auto")).toBe(0);
  expect(stripIndexAfterWind(2, 5, "auto")).toBe(2);
});

test("an intentional settle moves the strip to that section", () => {
  expect(stripIndexAfterWind(0, 1, "intentional")).toBe(1);
  expect(stripIndexAfterWind(4, 0, "intentional")).toBe(0);
});
