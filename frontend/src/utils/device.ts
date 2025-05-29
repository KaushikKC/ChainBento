/**
 * Detects if the current device is a touch device
 * This is used to determine which DnD backend to use
 */
export function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-expect-error - MSMaxTouchPoints is IE-specific
    navigator.msMaxTouchPoints > 0
  );
}
