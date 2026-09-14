/** Disable browser console output so PHI/PII never lands in DevTools. */

const CONSOLE_METHODS = [
  'log',
  'debug',
  'info',
  'warn',
  'error',
  'table',
  'dir',
  'trace',
  'group',
  'groupCollapsed',
  'groupEnd',
] as const;

export function isConsoleEnabled(): boolean {
  const flag = String(import.meta.env.VITE_ENABLE_CONSOLE ?? '')
    .trim()
    .toLowerCase();
  return flag === '1' || flag === 'true' || flag === 'yes';
}

export function silenceConsole(): void {
  if (isConsoleEnabled()) {
    return;
  }
  const noop = () => undefined;
  for (const method of CONSOLE_METHODS) {
    // eslint-disable-next-line no-console
    (console as unknown as Record<string, () => void>)[method] = noop;
  }
}

silenceConsole();
