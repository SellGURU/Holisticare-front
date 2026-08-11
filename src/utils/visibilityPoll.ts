/** RP-C07: multiply poll intervals when the document tab is hidden. */

export const VISIBILITY_HIDDEN_BACKOFF = 5;

export function visibilityPollMs(baseMs: number): number {
  if (typeof document === 'undefined') {
    return baseMs;
  }
  if (document.visibilityState === 'hidden') {
    return baseMs * VISIBILITY_HIDDEN_BACKOFF;
  }
  return baseMs;
}
