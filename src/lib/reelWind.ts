/** Hold auto-wind this long after the last reel input, or after focus leaves. */
export const REEL_IDLE_MS = 4000;

export type WindSource = "auto" | "intentional";

export type ReelHold = {
  /** Focused strip keeps the camera from auto-advancing. */
  focused: boolean;
  /** Epoch ms of the latest wheel, touch, key, or scroll. Null if none. */
  lastInputAt: number | null;
};

/**
 * True while the reel should freeze the camera's auto-advance.
 * Focus holds indefinitely. Input holds until `idleMs` has passed.
 */
export function reelHoldsAutoWind(
  hold: ReelHold,
  now: number,
  idleMs: number = REEL_IDLE_MS,
): boolean {
  if (hold.focused) return true;
  if (hold.lastInputAt == null) return false;
  return now - hold.lastInputAt < idleMs;
}

/**
 * Auto-wind settles the viewfinder only. The strip stays on the last
 * section the user deliberately chose. An intentional settle (crank)
 * adopts the section the camera just landed on.
 */
export function stripIndexAfterWind(
  intentionalIndex: number,
  settledIndex: number,
  source: WindSource,
): number {
  return source === "intentional" ? settledIndex : intentionalIndex;
}
