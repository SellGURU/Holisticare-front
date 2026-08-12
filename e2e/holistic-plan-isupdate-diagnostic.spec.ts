/**
 * Holistic Plan isUpdate=true browser timing (C1 harness fix / master pass).
 * Reuses the same login selectors as report-page-diagnostic.spec.ts.
 *
 * Required: E2E_EMAIL, E2E_PASSWORD
 * Optional: E2E_API_URL, E2E_BASE_URL, E2E_MEMBER_ID, E2E_T_PLAN_ID
 */
import { expect, test, type Page } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const API_URL = process.env.E2E_API_URL || 'http://127.0.0.1:3800';
const MEMBER_ID = process.env.E2E_MEMBER_ID || '432997901280';
const T_PLAN_ID = process.env.E2E_T_PLAN_ID || '586e24de4b';

const SPEC_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SPEC_DIR, '..', '..');
const OUT = path.join(
  REPO_ROOT,
  'doc',
  'performance-evidence',
  'holistic_plan_isupdate_browser_c1.json',
);

function requireCreds(): { email: string; password: string } | null {
  const email = process.env.E2E_EMAIL?.trim();
  const password = process.env.E2E_PASSWORD?.trim();
  if (!email || !password) return null;
  return { email, password };
}

async function loginReal(page: Page, email: string, password: string) {
  await page.goto('/login');
  await expect(page.locator('#login-form').first()).toBeVisible({
    timeout: 30_000,
  });

  const tokenResponse = page.waitForResponse(
    (res) =>
      res.url().includes('/auth/token') && res.request().method() === 'POST',
    { timeout: 60_000 },
  );

  await page.locator('#login-form input[name="email"]').first().fill(email);
  await page
    .locator('#login-form input[name="password"]')
    .first()
    .fill(password);
  await page
    .locator('#login-form')
    .first()
    .getByText('Log in', { exact: true })
    .click();

  const tokenRes = await tokenResponse;
  if (!tokenRes.ok()) {
    throw new Error(`Login token failed: HTTP ${tokenRes.status()}`);
  }
  await expect(page).not.toHaveURL(/\/login/, { timeout: 60_000 });
}

test.describe('Holistic Plan isUpdate diagnostic @diagnostic', () => {
  test('load show_initial_saved path timings', async ({ page }) => {
    test.setTimeout(180_000);
    const creds = requireCreds();
    test.skip(!creds, 'Blocked-by-access: set E2E_EMAIL / E2E_PASSWORD');

    const samples: Array<{
      key: string;
      status: number;
      totalMs: number | null;
    }> = [];
    page.on('response', async (res) => {
      const url = res.url();
      let key: string | null = null;
      if (url.includes('show_initial_saved_treatment_plan')) key = 'show';
      else if (url.includes('remap_issues')) key = 'remap';
      else if (url.includes('treatment_plan_rescore')) key = 'rescore';
      if (!key) return;
      const t = res.request().timing();
      samples.push({
        key,
        status: res.status(),
        totalMs: t
          ? Math.round((t.responseEnd ?? 0) - (t.requestStart ?? 0))
          : null,
      });
    });

    await loginReal(page, creds!.email, creds!.password);

    const target = `/report/Generate-Holistic-Plan/${MEMBER_ID}/${T_PLAN_ID}?isUpdate=true`;
    const t0 = Date.now();
    await page.goto(target, {
      waitUntil: 'domcontentloaded',
      timeout: 120_000,
    });
    // Allow show + remap (+ optional rescore) to finish
    await page.waitForTimeout(15_000);
    const wallMs = Date.now() - t0;

    const show = samples.filter((s) => s.key === 'show');
    expect(show.length).toBeGreaterThan(0);
    expect(show[0].status).toBe(200);

    const out = {
      wallMs,
      samples,
      target,
      api: API_URL,
      member_id: MEMBER_ID,
      t_plan_id: T_PLAN_ID,
      note: 'C1 harness fix: login via #login-form (same as report diagnostic)',
    };
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
  });
});
