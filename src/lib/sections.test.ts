import { nextSectionIndex } from "./sections";

test("advances within bounds", () => {
  expect(nextSectionIndex(0, 5)).toBe(1);
  expect(nextSectionIndex(3, 5)).toBe(4);
});

test("wraps to 0 after last", () => {
  expect(nextSectionIndex(4, 5)).toBe(0);
});

test("length 1 stays at 0", () => {
  expect(nextSectionIndex(0, 1)).toBe(0);
});
