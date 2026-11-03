import { createHash, timingSafeEqual } from "node:crypto";

/** Compare SHA-256 digests so the check does not leak the password length. */
export function passwordsMatch(input: string, expected: string): boolean {
  if (!input || !expected) return false;
  const actual = createHash("sha256").update(input, "utf8").digest();
  const stored = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(actual, stored);
}
