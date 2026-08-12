/**
 * Network timing helpers for unmocked Report page diagnostic E2E.
 * Diagnostic only — no production imports.
 */

import type { Request, Response } from '@playwright/test';

export type TimingSample = {
  key: string;
  url: string;
  method: string;
  status: number | null;
  /** Approx TTFB from Playwright request timing (responseStart), ms */
  ttfbMs: number | null;
  /** responseEnd from Playwright timing, else wall clock, ms */
  totalMs: number | null;
  /** ms from navigation mark until response finished */
  sinceNavMs: number | null;
  startedAt: number;
  finishedAt: number;
};

export type EndpointKey =
  | 'patient_data'
  | 'client_summary_categories'
  | 'client_summary_outofrefs'
  | 'concerning_results'
  | 'overview_treatment_plan'
  | 'show_treatment_plan_list'
  | 'action_plan_list_of_blocks'
  | 'wellness_scores_historical'
  | 'check_html_report'
  | 'check_need_of_refresh'
  | 'need_to_check_all_ongoing_operations'
  | 'lab_job_latest'
  | 'other';

const CLASSIFIERS: Array<{
  key: EndpointKey;
  match: (path: string) => boolean;
}> = [
  {
    key: 'patient_data',
    match: (p) => p.includes('/patients/patient_data'),
  },
  {
    key: 'client_summary_categories',
    match: (p) => p.includes('/overview/client_summary_categories'),
  },
  {
    key: 'client_summary_outofrefs',
    match: (p) => p.includes('/overview/client_summary_outofrefs'),
  },
  {
    key: 'concerning_results',
    match: (p) => p.includes('/overview/concerning_results'),
  },
  {
    key: 'overview_treatment_plan',
    match: (p) => p.includes('/overview/treatment_plan'),
  },
  {
    key: 'show_treatment_plan_list',
    match: (p) => p.includes('/patients/show_treatment_plan_list'),
  },
  {
    key: 'action_plan_list_of_blocks',
    match: (p) => p.includes('/action_plan/list_of_blocks'),
  },
  {
    key: 'wellness_scores_historical',
    match: (p) => p.includes('/wellness_scores/historical'),
  },
  {
    key: 'check_html_report',
    match: (p) => p.includes('/check_html_report'),
  },
  {
    key: 'check_need_of_refresh',
    match: (p) => p.includes('/patients/check_need_of_refresh'),
  },
  {
    key: 'need_to_check_all_ongoing_operations',
    match: (p) => p.includes('/need_to_check_all_ongoing_operations'),
  },
  {
    key: 'lab_job_latest',
    match: (p) => /\/lab-job\/latest/i.test(p) || /\/lab_job\/latest/i.test(p),
  },
];

export function classifyUrl(url: string): EndpointKey {
  let path = url;
  try {
    path = new URL(url).pathname;
  } catch {
    /* keep raw */
  }
  for (const c of CLASSIFIERS) {
    if (c.match(path)) return c.key;
  }
  return 'other';
}

export function median(nums: number[]): number | null {
  const xs = nums.filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  if (xs.length === 0) return null;
  const mid = Math.floor(xs.length / 2);
  if (xs.length % 2 === 0) {
    return Math.round(((xs[mid - 1] + xs[mid]) / 2) * 10) / 10;
  }
  return Math.round(xs[mid] * 10) / 10;
}

type Pending = {
  key: EndpointKey;
  url: string;
  method: string;
  startedAt: number;
  patientDataIndex?: number;
};

export function createNetworkTimingCollector(navStartRef: { current: number }) {
  const samples: TimingSample[] = [];
  const pending = new Map<Request, Pending>();
  let patientDataSeq = 0;

  function onRequest(req: Request) {
    const resourceType = req.resourceType();
    if (resourceType !== 'xhr' && resourceType !== 'fetch') return;
    const url = req.url();
    const key = classifyUrl(url);
    if (key === 'other') return;
    const entry: Pending = {
      key,
      url,
      method: req.method(),
      startedAt: Date.now(),
    };
    if (key === 'patient_data') {
      patientDataSeq += 1;
      entry.patientDataIndex = patientDataSeq;
    }
    pending.set(req, entry);
  }

  function onResponse(res: Response) {
    const req = res.request();
    const resourceType = req.resourceType();
    if (resourceType !== 'xhr' && resourceType !== 'fetch') return;
    const url = res.url();
    const key = classifyUrl(url);
    if (key === 'other') return;

    const finishedAt = Date.now();
    const lookup = pending.get(req);
    pending.delete(req);
    const startedAt = lookup?.startedAt ?? finishedAt;
    const labelKey =
      key === 'patient_data' && lookup?.patientDataIndex
        ? `patient_data#${lookup.patientDataIndex}`
        : key;

    let ttfbMs: number | null = null;
    let totalMs: number | null = null;
    try {
      const timing = req.timing();
      if (
        timing &&
        typeof timing.responseStart === 'number' &&
        timing.responseStart >= 0
      ) {
        ttfbMs = Math.round(timing.responseStart);
      }
      if (
        timing &&
        typeof timing.responseEnd === 'number' &&
        timing.responseEnd >= 0
      ) {
        totalMs = Math.round(timing.responseEnd);
      }
    } catch {
      /* timing unavailable */
    }
    if (totalMs == null) {
      totalMs = finishedAt - startedAt;
    }

    samples.push({
      key: labelKey,
      url,
      method: req.method(),
      status: res.status(),
      ttfbMs,
      totalMs,
      sinceNavMs: Math.max(0, Math.round(finishedAt - navStartRef.current)),
      startedAt,
      finishedAt,
    });
  }

  return {
    samples,
    onRequest,
    onResponse,
    resetPatientDataSeq() {
      patientDataSeq = 0;
    },
    clearSamples() {
      samples.length = 0;
      pending.clear();
    },
  };
}

export function summarizeByEndpoint(samples: TimingSample[]) {
  const byKey = new Map<string, TimingSample[]>();
  for (const s of samples) {
    const list = byKey.get(s.key) ?? [];
    list.push(s);
    byKey.set(s.key, list);
  }
  const summary: Record<
    string,
    {
      count: number;
      ttfbMedianMs: number | null;
      totalMedianMs: number | null;
      firstTotalMs: number | null;
      maxTotalMs: number | null;
      totalsMs: number[];
      ttfbsMs: number[];
    }
  > = {};
  for (const [key, list] of byKey) {
    const totals = list
      .map((s) => s.totalMs)
      .filter((n): n is number => n != null);
    const ttfbs = list
      .map((s) => s.ttfbMs)
      .filter((n): n is number => n != null);
    summary[key] = {
      count: list.length,
      ttfbMedianMs: median(ttfbs),
      totalMedianMs: median(totals),
      firstTotalMs: totals.length ? totals[0] : null,
      maxTotalMs: totals.length ? Math.max(...totals) : null,
      totalsMs: totals,
      ttfbsMs: ttfbs,
    };
  }
  return summary;
}

const SENSITIVE_HEADER = /^(authorization|cookie|set-cookie)$/i;

export function redactHar(har: unknown): unknown {
  if (!har || typeof har !== 'object') return har;
  const clone = JSON.parse(JSON.stringify(har)) as {
    log?: {
      entries?: Array<{
        request?: {
          headers?: Array<{ name: string; value: string }>;
          cookies?: unknown[];
          queryString?: Array<{ name: string; value: string }>;
          postData?: {
            text?: string;
            params?: Array<{ name: string; value: string }>;
          };
        };
        response?: {
          headers?: Array<{ name: string; value: string }>;
          cookies?: unknown[];
          content?: { text?: string };
        };
      }>;
    };
  };

  const scrubText = (t: string) =>
    t
      .replace(/"password"\s*:\s*"[^"]*"/gi, '"password":"[REDACTED]"')
      .replace(/"email"\s*:\s*"[^"]*"/gi, '"email":"[REDACTED]"')
      .replace(/"username"\s*:\s*"[^"]*"/gi, '"username":"[REDACTED]"')
      .replace(/password=[^&\s"]*/gi, 'password=[REDACTED]')
      .replace(/username=[^&\s"]*/gi, 'username=[REDACTED]')
      .replace(/email=[^&\s"]*/gi, 'email=[REDACTED]')
      .replace(/Bearer\s+[A-Za-z0-9._\-]+/gi, 'Bearer [REDACTED]');

  for (const entry of clone.log?.entries ?? []) {
    if (entry.request?.headers) {
      entry.request.headers = entry.request.headers.map((h) =>
        SENSITIVE_HEADER.test(h.name)
          ? { name: h.name, value: '[REDACTED]' }
          : h,
      );
    }
    if (entry.response?.headers) {
      entry.response.headers = entry.response.headers.map((h) =>
        SENSITIVE_HEADER.test(h.name)
          ? { name: h.name, value: '[REDACTED]' }
          : h,
      );
    }
    if (entry.request?.cookies) entry.request.cookies = [];
    if (entry.response?.cookies) entry.response.cookies = [];
    if (entry.request?.queryString) {
      entry.request.queryString = entry.request.queryString.map((q) =>
        /password|email|token|user/i.test(q.name)
          ? { name: q.name, value: '[REDACTED]' }
          : q,
      );
    }
    if (entry.request?.postData?.params) {
      entry.request.postData.params = entry.request.postData.params.map((q) =>
        /password|email|username|token/i.test(q.name)
          ? { name: q.name, value: '[REDACTED]' }
          : q,
      );
    }
    if (entry.request?.postData?.text) {
      entry.request.postData.text = scrubText(entry.request.postData.text);
    }
    if (entry.response?.content?.text) {
      // Drop large bodies that may contain PHI; keep timing-only HAR useful
      const text = entry.response.content.text;
      if (text.length > 500) {
        entry.response.content.text = '[REDACTED_BODY]';
      } else {
        entry.response.content.text = scrubText(text);
      }
    }
  }
  return clone;
}

/** Cross-run median for a named endpoint field across run summaries */
export function medianAcrossRuns(
  runs: Array<{
    endpointSummary: Record<
      string,
      { totalMedianMs: number | null; ttfbMedianMs: number | null }
    >;
  }>,
  endpoint: string,
  field: 'totalMedianMs' | 'ttfbMedianMs',
): number | null {
  const vals = runs
    .map((r) => r.endpointSummary[endpoint]?.[field] ?? null)
    .filter((n): n is number => n != null);
  return median(vals);
}
