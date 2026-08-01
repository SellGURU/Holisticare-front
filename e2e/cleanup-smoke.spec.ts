import { expect, test, type Page } from '@playwright/test';
import {
  FIXTURE_DASHBOARD_STATS,
  FIXTURE_PATIENT,
  installPortalApiMocks,
} from './fixtures/portal-api';

async function loginAsCoach(page: Page) {
  await page.goto('/login');
  await expect(page.locator('#login-form').first()).toBeVisible({
    timeout: 20_000,
  });

  const tokenRequest = page.waitForRequest(
    (req) => req.url().includes('/auth/token') && req.method() === 'POST',
  );

  await page
    .locator('#login-form input[name="email"]')
    .first()
    .fill('cleanup.coach@example.com');
  await page
    .locator('#login-form input[name="password"]')
    .first()
    .fill('CleanupPass123!');
  await page
    .locator('#login-form')
    .first()
    .getByText('Log in', { exact: true })
    .click();
  await tokenRequest;
}

test.describe('Portal cleanup smoke (offline mocks)', () => {
  test.beforeEach(async ({ page }) => {
    await installPortalApiMocks(page);
    // Clear once on the app origin. Do NOT use addInitScript(clear) — it runs
    // on every navigation and would wipe the auth token after login.
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('P1: unauthenticated / redirects to /login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('#login-form').first()).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByText('Welcome Back!').first()).toBeVisible();
  });

  test('P2: login reaches client roster with fixture patient', async ({
    page,
  }) => {
    const patientsRequest = page.waitForRequest(
      (req) =>
        (req.url().includes('/patients') || req.url().endsWith('/patients')) &&
        req.method() === 'GET',
    );

    await loginAsCoach(page);
    await patientsRequest;
    await expect(page).toHaveURL(/\/($|\?)/);
    await expect(page.getByText(FIXTURE_PATIENT.name).first()).toBeVisible({
      timeout: 20_000,
    });
  });

  test('P3: open patient navigates to report route', async ({ page }) => {
    await loginAsCoach(page);
    await expect(page.getByText(FIXTURE_PATIENT.name).first()).toBeVisible({
      timeout: 20_000,
    });

    await page.getByRole('link', { name: /Health Plan/i }).click();
    await expect(page).toHaveURL(
      new RegExp(`/report/${FIXTURE_PATIENT.member_id}/`),
    );
  });

  test('P4: dashboard shows fixture statistics', async ({ page }) => {
    await loginAsCoach(page);
    await expect(page.getByText(FIXTURE_PATIENT.name).first()).toBeVisible({
      timeout: 20_000,
    });

    await page.goto('/dashboard');
    await expect(page.getByText('Dashboard').first()).toBeVisible();
    await expect(
      page.getByText(FIXTURE_DASHBOARD_STATS[0].title).first(),
    ).toBeVisible();
    await expect(
      page.getByText(String(FIXTURE_DASHBOARD_STATS[0].number)).first(),
    ).toBeVisible();
  });

  test('P5: forms/check-in shell renders route content', async ({ page }) => {
    await loginAsCoach(page);
    await expect(page.getByText(FIXTURE_PATIENT.name).first()).toBeVisible({
      timeout: 20_000,
    });

    await page.goto('/forms');
    await expect(page.getByText('Custom Form').first()).toBeVisible();
    await expect(page.getByText('Questionnaire').first()).toBeVisible();
    await expect(page.getByText('Check-in').first()).toBeVisible();
  });
});
