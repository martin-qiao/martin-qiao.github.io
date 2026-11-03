import { signSession, verifySession } from "./session";

const secret = "test-session-secret";

test("round-trips a signed session", () => {
  const token = signSession(secret, 2_000_000_000);
  expect(verifySession(token, secret, 1_900_000_000)).toBe(true);
});

test("rejects a tampered, expired, or wrong-secret token", () => {
  const token = signSession(secret, 2_000_000_000);
  expect(verifySession(`${token}x`, secret, 1_900_000_000)).toBe(false);
  expect(verifySession(token, "other-secret", 1_900_000_000)).toBe(false);
  expect(verifySession(token, secret, 2_000_000_000)).toBe(false);
  expect(verifySession("nope", secret)).toBe(false);
});
