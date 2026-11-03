import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import {
  ADMIN_COOKIE,
  SESSION_TTL_SECONDS,
  sessionSecret,
  signSession,
  verifySession,
} from "./session";

export async function isAdmin(): Promise<boolean> {
  await connection();
  const secret = sessionSecret();
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!secret || !token) return false;
  return verifySession(token, secret, Math.floor(Date.now() / 1000));
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}

export async function setAdminCookie(): Promise<void> {
  const secret = sessionSecret();
  if (!secret) throw new Error("ADMIN_PASSWORD is not configured.");
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const store = await cookies();
  store.set(ADMIN_COOKIE, signSession(secret, expiresAt), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearAdminCookie(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}
