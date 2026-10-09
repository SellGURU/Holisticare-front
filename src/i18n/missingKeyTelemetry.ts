export interface MissingKeyEvent {
  locale: string;
  namespace: string;
  keyHash: string;
}

export type MissingKeyReporter = (event: MissingKeyEvent) => void;

const MAX_KEYS = 500;
const MAX_PER_MINUTE = 10;
const MAX_PER_SESSION = 100;

function hashKey(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function defaultReporter(event: MissingKeyEvent): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent<MissingKeyEvent>('holisticare:i18n-missing-key', {
        detail: event,
      }),
    );
  }
}

export function createMissingKeyTelemetry(
  reporter: MissingKeyReporter = defaultReporter,
  now: () => number = Date.now,
) {
  const seen = new Map<string, true>();
  let sessionCount = 0;
  let windowStartedAt = now();
  let windowCount = 0;

  return (locale: string, namespace: string, key: string): void => {
    const keyHash = hashKey(key);
    const identity = `${locale}\u0000${namespace}\u0000${keyHash}`;
    if (seen.has(identity)) return;

    if (seen.size >= MAX_KEYS) {
      const oldest = seen.keys().next().value;
      if (oldest !== undefined) seen.delete(oldest);
    }
    seen.set(identity, true);

    const timestamp = now();
    if (timestamp - windowStartedAt >= 60_000) {
      windowStartedAt = timestamp;
      windowCount = 0;
    }
    if (windowCount >= MAX_PER_MINUTE || sessionCount >= MAX_PER_SESSION) {
      return;
    }

    windowCount += 1;
    sessionCount += 1;
    try {
      reporter({ locale, namespace, keyHash });
    } catch {
      // Missing-key telemetry must never disrupt rendering.
    }
  };
}
