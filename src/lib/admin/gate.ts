export type WriteRejection = { status: number; error: string };

/** Shared decision for admin write routes. Unauthenticated calls are rejected. */
export function adminWriteRejection(input: {
  authenticated: boolean;
  crossSite: boolean;
}): WriteRejection | null {
  if (!input.authenticated) return { status: 401, error: "Unauthorized" };
  if (input.crossSite) return { status: 403, error: "Forbidden" };
  return null;
}

export function isCrossSiteRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return true;
  try {
    return new URL(origin).host !== host.split(",")[0]?.trim();
  } catch {
    return true;
  }
}
