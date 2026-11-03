import { redirect } from "next/navigation";

export function redirectWithError(path: string, error: unknown): never {
  const message = error instanceof Error ? error.message : "Something went wrong.";
  redirect(`${path}?error=${encodeURIComponent(message.slice(0, 300))}`);
}

export function redirectSaved(path: string): never {
  redirect(`${path}?saved=1`);
}
