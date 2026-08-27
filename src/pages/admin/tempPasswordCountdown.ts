export function expiryMsFromRemaining(
  remaining: number | null | undefined,
  nowMs = Date.now(),
) {
  const seconds = Number(remaining);
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  return nowMs + seconds * 1000;
}

export function remainingSecondsFromMs(
  expiresAtMs: number | null | undefined,
  nowMs = Date.now(),
) {
  if (!expiresAtMs) return 0;
  return Math.max(0, Math.ceil((expiresAtMs - nowMs) / 1000));
}

export function formatCountdown(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}
