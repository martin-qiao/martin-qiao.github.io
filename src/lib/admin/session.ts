import { createHmac, timingSafeEqual } from "node:crypto";
import { readServerEnv } from "@/lib/env";

export const ADMIN_COOKIE = "mq_admin";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14;

export function sessionSecret(): string | null {
  const secret = readServerEnv("ADMIN_SESSION_SECRET") || readServerEnv("ADMIN_PASSWORD");
  return secret || null;
}

export function signSession(secret: string, expiresAt: number): string {
  const body = `v1.${expiresAt}`;
  const signature = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${signature}`;
}

export function verifySession(
  token: string,
  secret: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [version, expRaw, signature] = parts;
  if (version !== "v1" || !/^\d+$/.test(expRaw) || !signature) return false;
  const expiresAt = Number(expRaw);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= nowSeconds) return false;
  const expected = createHmac("sha256", secret)
    .update(`${version}.${expRaw}`)
    .digest("base64url");
  const actual = Buffer.from(signature);
  const wanted = Buffer.from(expected);
  if (actual.length !== wanted.length) return false;
  return timingSafeEqual(actual, wanted);
}
