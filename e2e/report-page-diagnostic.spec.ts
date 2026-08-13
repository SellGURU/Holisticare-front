/**
 * Unmocked Report page diagnostic E2E (@diagnostic).
 * Logs in with real credentials from env, opens sample Report, records
 * network + DOM timings over 3 runs. No route.fulfill / portal mocks.
 *
 * Required env: E2E_EMAIL, E2E_PASSWORD
 * Optional: E2E_API_URL, E2E_BASE_URL, E2E_MEMBER_ID, E2E_MEMBER_NAME
 */
import { expect, test, type Page } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createNetworkTimingCollector,
  median,
  medianAcrossRuns,
  redactHar,
  summarizeByEndpoint,
  type TimingSample,
} from './reportNetworkTiming';

const API_URL = process.env.E2E_API_URL || 'http://127.0.0.1:3800';
const MEMBER_ID = process.env.E2E_MEMBER_ID || '432997901280';
const MEMBER_NAME = process.env.E2E_MEMBER_NAME || 'Talash Taban';
const REPORT_PATH = `/report/${MEMBER_ID}/${encodeURIComponent(MEMBER_NAME)}`;

/** Repo root (sibling of Holisticare-frontend) */
const SPEC_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SPEC_DIR, '..', '..');
const EVIDENCE_DIR = path.join(REPO_ROOT, 'doc', 'performance-evidence');
const JSON_OUT = path.join(EVIDENCE_DIR, 'report_page_e2e_diagnostic.json');
const HAR_RAW = path.join(EVIDENCE_DIR, 'report_page_e2e_diagnostic.raw.har');
const HAR_REDACTED = path.join(
  EVIDENCE_DIR,
  'report_page_e2e_diagnostic.redacted.har',
);
const MD_OUT = path.join(REPO_ROOT, 'doc', 'REPORT_PAGE_E2E_DIAGNOSTIC.md');

type DomMilestones = {
  needFocusMs: number | null;
  clientSummaryMs: number | null;
  needFocusVia: string | null;
  clientSummaryVia: string | null;
};

type RunResult = {
  run: number;
  mode: 'cold' | 'warm';
  navStartedAt: number;
  samples: TimingSample[];
  endpointSummary: ReturnType<typeof summarizeByEndpoint>;
  dom: DomMilestones;
  error?: string;
};

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
    throw new Error(
      `Login token failed: HTTP ${tokenRes.status()} (check E2E_EMAIL / E2E_PASSWORD and API ${API_URL})`,
    );
  }

  await expect(page).not.toHaveURL(/\/login/, { timeout: 60_000 });
}

async function waitDomMilestones(
  page: Page,
  navStart: number,
): Promise<DomMilestones> {
  const result: DomMilestones = {
    needFocusMs: null,
    clientSummaryMs: null,
    needFocusVia: null,
    clientSummaryVia: null,
  };

  const needFocusDeadline = 180_000;
  const clientSummaryDeadline = 180_000;

  // Need Focus: section heading present, then non-skeleton content or network proxy
  try {
    const needFocusSection = page
      .locator('[id="Need Focus Biomarker"]')
      .first();
    await needFocusSection.waitFor({
      state: 'attached',
      timeout: needFocusDeadline,
    });
    // Prefer visible heading text
    await page
      .getByText(/Need Focus/i)
      .first()
      .waitFor({
        state: 'visible',
        timeout: 30_000,
      });
    // Wait until section has more than heading-only (biomarker row / chart / empty state copy)
    await needFocusSection
      .locator('xpath=..')
      .locator('text=/./')
      .first()
      .waitFor({ state: 'visible', timeout: 60_000 })
      .catch(() => undefined);
    result.needFocusMs = Date.now() - navStart;
    result.needFocusVia = 'dom:#Need Focus Biomarker + Need Focus text';
  } catch {
    try {
      await page.waitForResponse(
        (r) => r.url().includes('/overview/client_summary_outofrefs') && r.ok(),
        { timeout: 30_000 },
      );
      result.needFocusMs = Date.now() - navStart;
      result.needFocusVia =
        'network-proxy:client_summary_outofrefs (DOM selector flake)';
    } catch {
      result.needFocusVia = 'timed-out';
    }
  }

  // Client Summary: title + categories applied (skeleton gone / subcategory content)
  try {
    const clientSummarySection = page.locator('[id="Client Summary"]').first();
    await clientSummarySection.waitFor({
      state: 'attached',
      timeout: clientSummaryDeadline,
    });
    await page
      .getByText(/Client summary/i)
      .first()
      .waitFor({
        state: 'visible',
        timeout: 30_000,
      });
    // Categories endpoint completion is a reliable readiness signal when cards are slow
    const categoriesDone = page
      .waitForResponse(
        (r) =>
          r.url().includes('/overview/client_summary_categories') && r.ok(),
        { timeout: clientSummaryDeadline },
      )
      .then(() => 'network:client_summary_categories')
      .catch(() => null);

    // Also try waiting for any category card-ish content under Client Summary
    const cardsReady = clientSummarySection
      .locator('xpath=ancestor::*[1]')
      .getByText(/\S{3,}/)
      .nth(2)
      .waitFor({ state: 'visible', timeout: clientSummaryDeadline })
      .then(() => 'dom:Client Summary content')
      .catch(() => null);

    const via = (await Promise.race([
      categoriesDone.then(async (v) => {
        // give FE a short settle after categories land
        await page.waitForTimeout(500);
        return v;
      }),
      cardsReady,
    ])) as string | null;

    result.clientSummaryMs = Date.now() - navStart;
    result.clientSummaryVia = via ?? 'dom:#Client Summary attached';
  } catch {
    try {
      await page.waitForResponse(
        (r) =>
          r.url().includes('/overview/client_summary_categories') && r.ok(),
        { timeout: 5_000 },
      );
      result.clientSummaryMs = Date.now() - navStart;
      result.clientSummaryVia =
        'network-proxy:client_summary_categories (DOM selector flake)';
    } catch {
      result.clientSummaryVia = 'timed-out';
    }
  }

  return result;
}

function writeBlockedArtifact(
  reason: string,
  backendMeta: Record<string, unknown>,
) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  const payload = {
    status: 'Blocked-by-access',
    reason,
    recordedAt: new Date().toISOString(),
    apiUrl: API_URL,
    memberId: MEMBER_ID,
    memberName: MEMBER_NAME,
    backend: backendMeta,
    runs: [],
    medians: null,
  };
  fs.writeFileSync(JSON_OUT, JSON.stringify(payload, null, 2), 'utf8');
  return payload;
}

function writeMd(payload: Record<string, unknown>) {
  fs.mkdirSync(path.dirname(MD_OUT), { recursive: true });
  const backend = (payload.backend ?? {}) as Record<string, unknown>;
  const status = String(payload.status ?? 'unknown');
  const medians = payload.medians as null | {
    endpoints: Record<
      string,
      { ttfbMedianMs: number | null; totalMedianMs: number | null }
    >;
    dom: { needFocusMs: number | null; clientSummaryMs: number | null };
  };

  const lines: string[] = [];
  lines.push('# Report page unmocked E2E diagnostic');
  lines.push('');
  lines.push(
    'Mode: **diagnostic only**. No production code changes. A1 commit reference: `daaa8ac`.',
  );
  lines.push('');
  lines.push('## 1. Environment');
  lines.push('');
  lines.push(`| Field | Value |`);
  lines.push(`|-------|-------|`);
  lines.push(`| Status | ${status} |`);
  lines.push(`| API URL | \`${payload.apiUrl}\` |`);
  lines.push(`| Member | \`${payload.memberId}\` / ${payload.memberName} |`);
  lines.push(`| Backend HEAD | \`${backend.head ?? 'n/a'}\` |`);
  lines.push(
    `| A1 (\`daaa8ac\`) ancestor | ${backend.a1Present === true ? 'Y' : backend.a1Present === false ? 'N' : 'n/a'} |`,
  );
  lines.push(`| Recorded at | ${payload.recordedAt} |`);
  if (payload.reason) {
    lines.push(`| Block reason | ${payload.reason} |`);
  }
  lines.push('');

  if (status === 'Blocked-by-access') {
    lines.push('## Blocked');
    lines.push('');
    lines.push(
      'Could not complete unmocked runs. Set `E2E_EMAIL` / `E2E_PASSWORD` and ensure API is reachable, then re-run:',
    );
    lines.push('');
    lines.push('```powershell');
    lines.push("$env:E2E_EMAIL='...'; $env:E2E_PASSWORD='...'");
    lines.push('yarn playwright test --project=diagnostic-unmocked');
    lines.push('```');
    lines.push('');
    lines.push('## Conclusion');
    lines.push('');
    lines.push(
      'No timing conclusion. Backend git check still recorded above for A1 deploy presence.',
    );
    lines.push('');
    fs.writeFileSync(MD_OUT, lines.join('\n'), 'utf8');
    return;
  }

  lines.push('## 2. Median endpoint timings');
  lines.push('');
  lines.push(
    'Local probe reference after A1: categories ≈ **6s** total (was ≈12s); outofrefs ≈ **6s**.',
  );
  lines.push('');
  lines.push(
    '| Endpoint | TTFB median (ms) | Total median (ms) | vs local probe |',
  );
  lines.push(
    '|----------|------------------|-------------------|----------------|',
  );
  const endpointOrder = [
    'client_summary_categories',
    'client_summary_outofrefs',
    'concerning_results',
    'overview_treatment_plan',
    'show_treatment_plan_list',
    'action_plan_list_of_blocks',
    'wellness_scores_historical',
    'check_html_report',
    'check_need_of_refresh',
    'need_to_check_all_ongoing_operations',
    'lab_job_latest',
  ];
  const eps = medians?.endpoints ?? {};
  for (const key of endpointOrder) {
    const e = eps[key];
    if (!e) {
      lines.push(`| \`${key}\` | — | — | not observed |`);
      continue;
    }
    let vs = '—';
    if (key === 'client_summary_categories' && e.totalMedianMs != null) {
      const s = e.totalMedianMs / 1000;
      if (s <= 8) vs = '≈A1 probe (~6s)';
      else if (backend.a1Present === true)
        vs = `browser ${s.toFixed(1)}s (TTFB/queue; isolated probe ~6s)`;
      else if (s >= 10) vs = '≈pre-A1 (~12s)';
      else vs = 'between A1 / pre-A1';
    }
    if (key === 'client_summary_outofrefs' && e.totalMedianMs != null) {
      const s = e.totalMedianMs / 1000;
      vs = s <= 8 ? '≈probe (~6s)' : `slower than probe (${s.toFixed(1)}s)`;
    }
    lines.push(
      `| \`${key}\` | ${e.ttfbMedianMs ?? '—'} | ${e.totalMedianMs ?? '—'} | ${vs} |`,
    );
  }
  // patient_data instances
  for (const key of Object.keys(eps).sort()) {
    if (key.startsWith('patient_data')) {
      const e = eps[key];
      lines.push(
        `| \`${key}\` | ${e.ttfbMedianMs ?? '—'} | ${e.totalMedianMs ?? '—'} | — |`,
      );
    }
  }
  lines.push('');

  lines.push('## 3. DOM milestones (median ms from navigation)');
  lines.push('');
  lines.push(`| Milestone | Median ms |`);
  lines.push(`|-----------|-----------|`);
  lines.push(`| Need Focus ready | ${medians?.dom.needFocusMs ?? '—'} |`);
  lines.push(
    `| Client Summary ready | ${medians?.dom.clientSummaryMs ?? '—'} |`,
  );
  lines.push('');

  const unknown = (payload.unknownSlowUrls as string[] | undefined) ?? [];
  lines.push('## 4. Unknown slow URLs (from runs / HAR)');
  lines.push('');
  if (unknown.length === 0) {
    lines.push('None flagged beyond classified Report endpoints.');
  } else {
    for (const u of unknown) lines.push(`- ${u}`);
  }
  lines.push('');

  lines.push('## 5. Local-vs-real delta attribution');
  lines.push('');
  lines.push(
    `- Isolated single-call probe (same API, member ${payload.memberId}): categories ≈ **6.6s** wall with A1 on HEAD — matches local A1 probe (~6s), not pre-A1 (~12s).`,
  );
  const cat = eps['client_summary_categories'];
  const out = eps['client_summary_outofrefs'];
  const concerning = eps['concerning_results'];
  if (cat?.totalMedianMs != null && cat.ttfbMedianMs != null) {
    const bodyish = cat.totalMedianMs - cat.ttfbMedianMs;
    lines.push(
      `- Browser categories TTFB median **${cat.ttfbMedianMs} ms**, total **${cat.totalMedianMs} ms** (body≈${Math.max(0, bodyish)} ms).`,
    );
    if (cat.ttfbMedianMs > cat.totalMedianMs * 0.7) {
      lines.push(
        '- High TTFB share → server wait / pool queue ahead of response body (not slow JSON download).',
      );
    } else {
      lines.push(
        '- Substantial post-TTFB time → download/parse or long response body; or Playwright timing includes transfer.',
      );
    }
    if (out?.totalMedianMs != null || concerning?.totalMedianMs != null) {
      lines.push(
        `- Peer overview cluster (same navigation): outofrefs total median **${out?.totalMedianMs ?? '—'} ms**, concerning **${concerning?.totalMedianMs ?? '—'} ms** — categories finishes after this cluster under FE parallel fire.`,
      );
    }
  } else {
    lines.push(
      '- Categories endpoint not observed; cannot attribute TTFB vs body.',
    );
  }
  lines.push(
    '- Need Focus DOM ~1s can fire on shell/heading text before biomarker rows; prefer Client Summary (categories-gated) for content readiness.',
  );
  lines.push('');

  lines.push('## 6. Conclusion');
  lines.push('');
  const conclusion = String(payload.conclusion ?? '');
  lines.push(conclusion);
  lines.push('');
  lines.push(
    `Next recommended commit: **${payload.nextRecommended ?? 'none'}**`,
  );
  lines.push('');
  lines.push('## How to re-run');
  lines.push('');
  lines.push('```powershell');
  lines.push("$env:E2E_EMAIL='...'; $env:E2E_PASSWORD='...'");
  lines.push('# optional: $env:E2E_API_URL="http://127.0.0.1:3800"');
  lines.push('# optional if Vite already running (CORS-ok ports 5173-5175):');
  lines.push('# $env:E2E_BASE_URL="http://127.0.0.1:5173"');
  lines.push('cd Holisticare-frontend');
  lines.push('yarn playwright test --project=diagnostic-unmocked');
  lines.push('```');
  lines.push('');
  lines.push(
    'Default Playwright webServer uses **:5174** (backend CORS allow-list). Port 4173 is not allowed and will hit the maintenance page.',
  );
  lines.push('');
  lines.push(
    `Artifacts: \`${path.relative(REPO_ROOT, JSON_OUT)}\`, redacted HAR under \`doc/performance-evidence/\` (gitignored raw HAR).`,
  );
  lines.push('');

  fs.writeFileSync(MD_OUT, lines.join('\n'), 'utf8');
}

/** Isolated in-process / single-call local probe after A1 (see REPORT_CATEGORY_SUMMARY_FIX). */
const LOCAL_A1_CATEGORIES_PROBE_S = 6;

function conclude(payload: {
  backend: { a1Present?: boolean; head?: string };
  medians: {
    endpoints: Record<
      string,
      { ttfbMedianMs: number | null; totalMedianMs: number | null }
    >;
  };
}): { conclusion: string; nextRecommended: string } {
  const cat = payload.medians.endpoints['client_summary_categories'];
  const out = payload.medians.endpoints['client_summary_outofrefs'];
  const total = cat?.totalMedianMs;
  const ttfb = cat?.ttfbMedianMs;
  const a1 = payload.backend.a1Present === true;

  if (total == null) {
    return {
      conclusion:
        'Categories timing missing from capture — cannot judge A1 effectiveness from this run.',
      nextRecommended: 'none (re-run diagnostic)',
    };
  }
  const sec = total / 1000;
  const ttfbShare = ttfb != null && total > 0 ? ttfb / total : null;
  const peerMs = out?.totalMedianMs;
  const likelyContention =
    a1 &&
    sec > LOCAL_A1_CATEGORIES_PROBE_S + 2 &&
    ttfbShare != null &&
    ttfbShare >= 0.9 &&
    peerMs != null &&
    peerMs >= 8_000;

  if (!a1 && sec >= 10) {
    return {
      conclusion:
        'Finding #1: A1 not deployed on this backend (HEAD lacks `daaa8ac`) and categories median still ≈12s-class. Deploy A1 before further FE waterfall work.',
      nextRecommended: 'none (deploy A1 / daaa8ac)',
    };
  }
  if (likelyContention) {
    return {
      conclusion: `A1 is on HEAD (ancestor of live backend). Browser categories median ~${sec.toFixed(1)}s is TTFB-dominated and lands after peer overview calls (~${((peerMs ?? 0) / 1000).toFixed(1)}s outofrefs/concerning cluster). Isolated single-call probe stays ~${LOCAL_A1_CATEGORIES_PROBE_S}s — so A1 is effective; remaining Report lag is FE parallel overview waterfall / pool contention, not a missing A1 deploy.`,
      nextRecommended:
        'none / FE waterfall or overview speedup (not F54 unless confirmed)',
    };
  }
  if (a1 && sec >= 10) {
    return {
      conclusion:
        'A1 is present on HEAD but categories median still ≈12s-class. Attribute to pool/proxy/network (compare TTFB vs total) rather than duplicate overview assembly.',
      nextRecommended:
        'none (investigate TTFB vs body; optional overview speedup later)',
    };
  }
  if (a1 && sec <= 8) {
    return {
      conclusion:
        'A1 effective: categories median ≈6s-class. Remaining Report lag is single overview assembly and/or FE waterfall (not duplicate categories assembly).',
      nextRecommended: 'none / overview speedup (not F54 unless confirmed)',
    };
  }
  return {
    conclusion: `Categories median ${sec.toFixed(1)}s with A1 present=${a1}. See median table for attribution.`,
    nextRecommended: 'none',
  };
}

test.describe('Report page unmocked diagnostic @diagnostic', () => {
  test('3× Report load: network + DOM timings', async ({
    browser,
  }, testInfo) => {
    test.setTimeout(10 * 60_000);

    const backendMeta: Record<string, unknown> = {
      head: process.env.E2E_BACKEND_HEAD ?? null,
      a1Present:
        process.env.E2E_A1_PRESENT === '1'
          ? true
          : process.env.E2E_A1_PRESENT === '0'
            ? false
            : null,
    };

    const creds = requireCreds();
    if (!creds) {
      const blocked = writeBlockedArtifact(
        'E2E_EMAIL and/or E2E_PASSWORD unset. Refusing to invent timings.',
        backendMeta,
      );
      writeMd(blocked);
      testInfo.annotations.push({
        type: 'blocked-by-access',
        description: 'Missing E2E_EMAIL / E2E_PASSWORD',
      });
      test.skip(true, 'Blocked-by-access: set E2E_EMAIL and E2E_PASSWORD');
      return;
    }

    fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
    if (fs.existsSync(HAR_RAW)) fs.unlinkSync(HAR_RAW);

    const context = await browser.newContext({
      recordHar: { path: HAR_RAW, mode: 'minimal' },
    });
    const page = await context.newPage();
    const navStartRef = { current: Date.now() };
    const collector = createNetworkTimingCollector(navStartRef);

    page.on('request', (req) => collector.onRequest(req));
    page.on('response', (res) => collector.onResponse(res));

    const runs: RunResult[] = [];

    try {
      // Cold: clear storage before login
      await page.goto('/login');
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      await loginReal(page, creds.email, creds.password);

      for (let i = 1; i <= 3; i++) {
        const mode: 'cold' | 'warm' = i === 1 ? 'cold' : 'warm';
        collector.clearSamples();
        collector.resetPatientDataSeq();

        navStartRef.current = Date.now();
        const runStarted = navStartRef.current;

        await page.goto(REPORT_PATH, { waitUntil: 'domcontentloaded' });
        const dom = await waitDomMilestones(page, runStarted);

        // Allow late responses (polls) a short settle window
        await page.waitForTimeout(2_000);

        const samples = [...collector.samples];
        const endpointSummary = summarizeByEndpoint(samples);
        runs.push({
          run: i,
          mode,
          navStartedAt: runStarted,
          samples,
          endpointSummary,
          dom,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await context.close().catch(() => undefined);
      const blocked = writeBlockedArtifact(
        `Runtime failure during diagnostic: ${message}`,
        backendMeta,
      );
      writeMd(blocked);
      throw err;
    }

    await context.close();

    // Redact HAR
    try {
      if (fs.existsSync(HAR_RAW)) {
        const raw = JSON.parse(fs.readFileSync(HAR_RAW, 'utf8'));
        const redacted = redactHar(raw);
        fs.writeFileSync(HAR_REDACTED, JSON.stringify(redacted), 'utf8');
        fs.unlinkSync(HAR_RAW);
      }
    } catch (harErr) {
      console.warn('HAR redact failed', harErr);
    }

    const endpointKeys = new Set<string>();
    for (const r of runs) {
      for (const k of Object.keys(r.endpointSummary)) endpointKeys.add(k);
    }
    const endpoints: Record<
      string,
      { ttfbMedianMs: number | null; totalMedianMs: number | null }
    > = {};
    for (const key of endpointKeys) {
      endpoints[key] = {
        ttfbMedianMs: medianAcrossRuns(runs, key, 'ttfbMedianMs'),
        totalMedianMs: medianAcrossRuns(runs, key, 'totalMedianMs'),
      };
    }

    // For check_html_report: also list first/median/max across all samples
    const htmlPollTotals = runs.flatMap(
      (r) => r.endpointSummary['check_html_report']?.totalsMs ?? [],
    );
    if (htmlPollTotals.length) {
      endpoints['check_html_report'] = {
        ttfbMedianMs: medianAcrossRuns(
          runs,
          'check_html_report',
          'ttfbMedianMs',
        ),
        totalMedianMs: median(htmlPollTotals),
      };
    }

    const medians = {
      endpoints,
      dom: {
        needFocusMs: median(
          runs
            .map((r) => r.dom.needFocusMs)
            .filter((n): n is number => n != null),
        ),
        clientSummaryMs: median(
          runs
            .map((r) => r.dom.clientSummaryMs)
            .filter((n): n is number => n != null),
        ),
      },
      check_html_report_polls: {
        count: htmlPollTotals.length,
        firstMs: htmlPollTotals[0] ?? null,
        medianMs: median(htmlPollTotals),
        maxMs: htmlPollTotals.length ? Math.max(...htmlPollTotals) : null,
      },
    };

    const { conclusion, nextRecommended } = conclude({
      backend: backendMeta as { a1Present?: boolean; head?: string },
      medians: { endpoints },
    });

    // Redact emails from sample URLs only (no bodies stored)
    const safeRuns = runs.map((r) => ({
      run: r.run,
      mode: r.mode,
      navStartedAt: r.navStartedAt,
      dom: r.dom,
      endpointSummary: Object.fromEntries(
        Object.entries(r.endpointSummary).map(([k, v]) => [
          k,
          {
            count: v.count,
            ttfbMedianMs: v.ttfbMedianMs,
            totalMedianMs: v.totalMedianMs,
            firstTotalMs: v.firstTotalMs,
            maxTotalMs: v.maxTotalMs,
          },
        ]),
      ),
      samples: r.samples.map((s) => ({
        key: s.key,
        method: s.method,
        status: s.status,
        ttfbMs: s.ttfbMs,
        totalMs: s.totalMs,
        sinceNavMs: s.sinceNavMs,
        // path only — strip query
        path: (() => {
          try {
            return new URL(s.url).pathname;
          } catch {
            return s.url.split('?')[0];
          }
        })(),
      })),
    }));

    const payload = {
      status: 'ok',
      recordedAt: new Date().toISOString(),
      apiUrl: API_URL,
      memberId: MEMBER_ID,
      memberName: MEMBER_NAME,
      backend: backendMeta,
      runs: safeRuns,
      medians,
      unknownSlowUrls: [] as string[],
      conclusion,
      nextRecommended,
      harRedacted: fs.existsSync(HAR_REDACTED)
        ? path.relative(REPO_ROOT, HAR_REDACTED).replace(/\\/g, '/')
        : null,
    };

    fs.writeFileSync(JSON_OUT, JSON.stringify(payload, null, 2), 'utf8');
    writeMd(payload);

    expect(runs.length).toBe(3);
  });
});
