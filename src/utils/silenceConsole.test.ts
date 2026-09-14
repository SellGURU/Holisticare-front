import { afterEach, describe, expect, it, vi } from 'vitest';

const originalLog = console.log;

describe('silenceConsole', () => {
  afterEach(() => {
    console.log = originalLog;
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('no-ops console methods so PHI is not printed', async () => {
    vi.stubEnv('VITE_ENABLE_CONSOLE', '');
    const log = vi.fn();
    console.log = log;
    await import('./silenceConsole');
    console.log({ email: 'jane@clinic.com', diagnosis: 'anemia' });
    expect(log).not.toHaveBeenCalled();
  });
});
