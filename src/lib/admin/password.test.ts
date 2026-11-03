import { passwordsMatch } from "./password";

test("matches the shared admin password", () => {
  expect(passwordsMatch("correct horse", "correct horse")).toBe(true);
});

test("rejects a different password and empty values", () => {
  expect(passwordsMatch("nope", "correct horse")).toBe(false);
  expect(passwordsMatch("", "correct horse")).toBe(false);
  expect(passwordsMatch("correct horse", "")).toBe(false);
});
