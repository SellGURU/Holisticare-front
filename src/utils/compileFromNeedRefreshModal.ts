/**
 * Compile from the "Need Refresh" gate used before Generate Holistic Plan.
 *
 * Unlike the old modal path (partial refresh + close immediately), this:
 * 1. Starts a full refresh (same as the top-bar Compile button)
 * 2. Polls until the refresh job finishes
 * 3. Re-checks need_of_refresh so Generate only proceeds when data is fresh
 */

import Application from '../api/app';
import { invalidateHealthPlanCache } from './cacheKeys';
import { publish } from './event';

export const COMPILE_STARTED_EVENT = 'compileStarted';
export const COMPILE_FAILED_EVENT = 'compileFailed';

/**
 * Start a full compile and tell the top-bar Compile button to show Compiling...
 * Used by the Need Refresh modal so the header updates immediately.
 */
export async function startCompileFromUi(memberId: string): Promise<void> {
  publish(COMPILE_STARTED_EVENT, { member_id: memberId });
  publish('disableGenerate', {});
  publish('checkProgress', {});
  try {
    await Application.refreshData(memberId);
    publish('SyncRefresh', {});
    publish('disableGenerate', {});
  } catch (err) {
    publish(COMPILE_FAILED_EVENT, { member_id: memberId });
    throw err;
  }
}

export async function clientNeedsCompile(
  memberId: string | undefined,
): Promise<boolean> {
  if (!memberId) return true;
  try {
    const res = await Application.checkClientRefresh(memberId);
    return res?.data?.need_of_refresh === true;
  } catch {
    return true;
  }
}

export type CompileFromModalResult =
  | { ok: true }
  | {
      ok: false;
      reason: 'refresh_failed' | 'still_stale' | 'timeout' | 'missing_member';
    };

const DEFAULT_POLL_MS = 2000;
const DEFAULT_TIMEOUT_MS = 180_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function waitForRefreshProgress(
  memberId: string,
  options?: { pollMs?: number; timeoutMs?: number },
): Promise<'done' | 'timeout'> {
  const pollMs = options?.pollMs ?? DEFAULT_POLL_MS;
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const res = await Application.checkRefreshProgress(memberId);
      if (res?.data?.status) {
        return 'done';
      }
    } catch {
      // keep polling — transient network errors should not abort
    }
    await sleep(pollMs);
  }
  return 'timeout';
}

/**
 * Full compile + wait + freshness gate for the Generate Need-Compile modal.
 */
export async function compileFromNeedRefreshModal(
  memberId: string | undefined,
  options?: { pollMs?: number; timeoutMs?: number },
): Promise<CompileFromModalResult> {
  if (!memberId) {
    return { ok: false, reason: 'missing_member' };
  }

  try {
    await startCompileFromUi(memberId);
  } catch {
    return { ok: false, reason: 'refresh_failed' };
  }

  const progress = await waitForRefreshProgress(memberId, options);
  if (progress === 'timeout') {
    return { ok: false, reason: 'timeout' };
  }

  invalidateHealthPlanCache(memberId);

  try {
    const check = await Application.checkClientRefresh(memberId);
    if (check?.data?.need_of_refresh === true) {
      return { ok: false, reason: 'still_stale' };
    }
  } catch {
    // If the gate check fails, treat as not ready rather than falsely closing.
    return { ok: false, reason: 'still_stale' };
  }

  return { ok: true };
}
