import { defineConfig, devices } from '@playwright/test';

/**
 * Use 5174 (in backend CORS allow-list) so unmocked diagnostic can call the
 * real API. Port 4173 is NOT CORS-allowed and triggers the maintenance page.
 * Prefer E2E_BASE_URL when an existing Vite (e.g. :5173 from run_backend) is up.
 */
const PORT = 5174;
const DEFAULT_BASE_URL = `http://127.0.0.1:${PORT}`;
const BASE_URL = process.env.E2E_BASE_URL || DEFAULT_BASE_URL;
const API_URL = process.env.E2E_API_URL || 'http://127.0.0.1:3800';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    ...devices['Desktop Chrome'],
  },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `yarn vite --host 127.0.0.1 --port ${PORT}`,
        url: DEFAULT_BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: {
          ...process.env,
          VITE_ENV: 'local',
          VITE_API_URL: API_URL,
        },
      },
  projects: [
    {
      name: 'chromium',
      testIgnore: /report-page-diagnostic\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'diagnostic-unmocked',
      testMatch:
        /(report-page-diagnostic|holistic-plan-isupdate-diagnostic)\.spec\.ts/,
      timeout: 10 * 60_000,
      expect: { timeout: 60_000 },
      use: {
        ...devices['Desktop Chrome'],
        baseURL: BASE_URL,
        navigationTimeout: 120_000,
        actionTimeout: 60_000,
      },
    },
  ],
});
