import { useCallback, useEffect, useRef } from 'react';
import Application from '../api/app';
import { subscribe, unsubscribe } from '../utils/event';
import {
  progressEventMatchesMember,
  type OverviewDataPhase,
} from '../utils/asyncProcessing';
import { visibilityPollMs } from '../utils/visibilityPoll';
import {
  allOutcomesTerminal,
  domainsThatBecameTerminal,
  type DomainName,
  type DomainOutcome,
  type OperationOutcomes,
  type OperationState,
} from '../utils/processingCompletion';

const OVERVIEW_POLL_INTERVAL_MS = 2000;
const OVERVIEW_POLL_MAX_MS = 10 * 60 * 1000;
export const SOURCE_CHANGE_POLL_MAX_MS = 60000;

export type OverviewSnapshot = {
  processing?: boolean;
  data_phase?: OverviewDataPhase;
  data_revision?: string;
  biomarker_count?: number;
  preview_count?: number;
  biomarkers_scored?: number;
  biomarkers_total?: number;
  scoring_complete?: boolean;
  client_summary_ready?: boolean;
  background_processing?: boolean;
  categories_partial?: string[];
  categories_status?: Array<{
    name: string;
    values_ready?: boolean;
    flags_ready?: boolean;
    description_ready?: boolean;
  }>;
  active_preview_file_id?: string;
  progress_pct?: number;
  stale?: boolean;
  processing_error?: string | null;
  awaiting_user_review?: boolean;
  job_id?: string | null;
  job_status?: string | null;
  tasks?: Record<string, string>;
  operation_id?: string | null;
  input_revision?: string | null;
  operation_state?: OperationState | string | null;
  operation_started_at?: string | null;
  operation_completed_at?: string | null;
  outcomes?: OperationOutcomes;
};

export function snapshotSourceSignature(snapshot: OverviewSnapshot): {
  revision: string | null;
  count: number | null;
} {
  return {
    revision: snapshot.data_revision ?? null,
    count:
      snapshot.biomarker_count ?? snapshot.biomarkers_scored ?? null,
  };
}

export function snapshotIsInFlight(snapshot: OverviewSnapshot): boolean {
  return Boolean(snapshot.processing || snapshot.background_processing);
}

export function snapshotIsSettled(snapshot: OverviewSnapshot): boolean {
  return !snapshotIsInFlight(snapshot);
}

/** Keep polling until the button can go idle — domains ready is not enough. */
export function shouldKeepOverviewPollRunning(
  snapshot: OverviewSnapshot,
): boolean {
  if (snapshotIsInFlight(snapshot)) return true;
  const outcomes = snapshot.outcomes || {};
  return Object.keys(outcomes).length > 0 && !allOutcomesTerminal(outcomes);
}

export function sourceSnapshotChanged(
  baseline: { revision: string | null; count: number | null },
  snapshot: OverviewSnapshot,
): boolean {
  const next = snapshotSourceSignature(snapshot);
  return next.revision !== baseline.revision || next.count !== baseline.count;
}

/** A second checkProgress during an active poll must not reset domain tracking. */
export function shouldResetOverviewPollSession(alreadyPolling: boolean): boolean {
  return !alreadyPolling;
}

export function shouldRefreshBiomarkersOnCountChange(
  previousCount: number | null,
  nextCount: number,
): boolean {
  if (previousCount == null) return nextCount > 0;
  return nextCount !== previousCount;
}

export function snapshotHasCanonicalOperation(
  snapshot: OverviewSnapshot,
  pollStartedAt?: number | null,
): boolean {
  const state = String(snapshot.operation_state || '');
  if (state === 'running' || state === 'pending') return true;
  if (snapshotIsInFlight(snapshot)) return true;
  if (pollStartedAt != null && snapshot.operation_started_at) {
    const started = Date.parse(snapshot.operation_started_at);
    if (!Number.isNaN(started) && started >= pollStartedAt - 15000) {
      return true;
    }
  }
  const outcomes = snapshot.outcomes || {};
  return Object.values(outcomes).some((outcome) => outcome?.state === 'pending');
}

type UseOverviewPollOptions = {
  memberId: number | null | undefined;
  enabled: boolean;
  onSnapshot: (snapshot: OverviewSnapshot) => void;
  onReferenceData: (data: Record<string, unknown>) => void;
  onCategoriesData: (data: Record<string, unknown>) => void;
  onConcerningData: (data: Record<string, unknown>) => void;
  onPollStart?: () => void;
  onPollTimeout?: () => void;
  onSettled?: () => void;
  onDomainTerminal?: (domain: DomainName, outcome: DomainOutcome) => void;
  onDomainsTerminal?: (domains: DomainName[], outcomes: OperationOutcomes) => void;
  onUnresolved?: () => void;
};

export function useOverviewPoll({
  memberId,
  enabled,
  onSnapshot,
  onReferenceData,
  onCategoriesData,
  onConcerningData,
  onPollStart,
  onPollTimeout,
  onSettled,
  onDomainTerminal,
  onDomainsTerminal,
  onUnresolved,
}: UseOverviewPollOptions) {
  const inFlightRef = useRef(false);
  const pollEpochRef = useRef(0);
  const pollingRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRevisionRef = useRef<string | null>(null);
  const lastScoredRef = useRef<number | null>(null);
  const pollStartedAtRef = useRef<number | null>(null);
  const consecutiveErrorsRef = useRef(0);
  const awaitingSourceChangeRef = useRef(false);
  const sawCanonicalRef = useRef(false);
  const fetchedSettledRef = useRef(false);
  const previousOutcomesRef = useRef<OperationOutcomes | null>(null);
  const baselineSignatureRef = useRef<{
    revision: string | null;
    count: number | null;
  } | null>(null);

  const stopPolling = useCallback(() => {
    pollingRef.current = false;
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const pollTick = useCallback(async () => {
    if (!enabled || !memberId || inFlightRef.current) return;
    const epoch = pollEpochRef.current;
    inFlightRef.current = true;
    try {
      const snapRes = await Application.getOverviewProcessingSnapshot({
        member_id: memberId,
      });
      if (epoch !== pollEpochRef.current) return;
      const snapshot = (snapRes.data || {}) as OverviewSnapshot;
      onSnapshot(snapshot);
      consecutiveErrorsRef.current = 0;

      const outcomes = snapshot.outcomes || {};
      const hasCanonical = snapshotHasCanonicalOperation(
        snapshot,
        pollStartedAtRef.current,
      );

      if (snapshot.stale || snapshot.processing_error) {
        awaitingSourceChangeRef.current = false;
        baselineSignatureRef.current = null;
        if (!allOutcomesTerminal(outcomes)) {
          onUnresolved?.();
        }
        stopPolling();
        return;
      }

      if (awaitingSourceChangeRef.current) {
        if (hasCanonical) {
          sawCanonicalRef.current = true;
          awaitingSourceChangeRef.current = false;
          previousOutcomesRef.current = {};
        } else if (
          pollStartedAtRef.current != null &&
          Date.now() - pollStartedAtRef.current > SOURCE_CHANGE_POLL_MAX_MS
        ) {
          awaitingSourceChangeRef.current = false;
          stopPolling();
          onUnresolved?.();
          return;
        } else {
          return;
        }
      }

      const becameTerminal = domainsThatBecameTerminal(
        previousOutcomesRef.current,
        outcomes,
      );
      previousOutcomesRef.current = outcomes;
      let terminalWave = becameTerminal;
      const scoredCount =
        snapshot.biomarker_count ?? snapshot.biomarkers_scored ?? 0;
      if (
        shouldRefreshBiomarkersOnCountChange(
          lastScoredRef.current,
          scoredCount,
        )
      ) {
        lastScoredRef.current = scoredCount;
        if (!terminalWave.includes('biomarkers')) {
          terminalWave = [...terminalWave, 'biomarkers'];
        }
      }
      if (
        terminalWave.length === 0 &&
        allOutcomesTerminal(outcomes) &&
        !fetchedSettledRef.current
      ) {
        terminalWave = Object.keys(outcomes) as DomainName[];
      }
      if (terminalWave.length > 0) {
        if (onDomainsTerminal) {
          onDomainsTerminal(terminalWave, outcomes);
        } else {
          for (const domain of terminalWave) {
            onDomainTerminal?.(domain, outcomes[domain] || {});
          }
        }
        if (allOutcomesTerminal(outcomes)) {
          fetchedSettledRef.current = true;
        }
      }

      if (shouldKeepOverviewPollRunning(snapshot)) {
        if (
          pollStartedAtRef.current != null &&
          Date.now() - pollStartedAtRef.current > OVERVIEW_POLL_MAX_MS
        ) {
          stopPolling();
          onPollTimeout?.();
          onUnresolved?.();
        }
        return;
      }

      if (fetchedSettledRef.current) {
        stopPolling();
        return;
      }

      fetchedSettledRef.current = true;
      if (onDomainTerminal || onDomainsTerminal) {
        stopPolling();
        return;
      }
      if (onSettled) {
        onSettled();
        stopPolling();
        return;
      }
      const [refRes, catRes, conRes] = await Promise.all([
        Application.getClientSummaryOutofrefs({
          member_id: memberId,
          include_wearable: true,
        }),
        Application.getClientSummaryCategories({
          member_id: memberId,
          include_wearable: true,
        }),
        Application.getConceringResults({
          member_id: memberId,
          include_wearable: true,
        }),
      ]);
      if (epoch !== pollEpochRef.current) return;
      lastRevisionRef.current = snapshot.data_revision ?? null;
      if (snapshot.biomarkers_scored != null) {
        lastScoredRef.current = snapshot.biomarkers_scored;
      }
      onReferenceData(refRes.data || {});
      onCategoriesData(catRes.data || {});
      onConcerningData(conRes.data || {});
      stopPolling();
    } catch {
      consecutiveErrorsRef.current += 1;
      if (consecutiveErrorsRef.current >= 5) {
        stopPolling();
        onPollTimeout?.();
        onUnresolved?.();
      }
    } finally {
      inFlightRef.current = false;
    }
  }, [
    enabled,
    memberId,
    onCategoriesData,
    onConcerningData,
    onReferenceData,
    onSnapshot,
    onPollTimeout,
    stopPolling,
    onSettled,
    onDomainTerminal,
    onDomainsTerminal,
    onUnresolved,
  ]);

  const scheduleNextPoll = useCallback(() => {
    if (!pollingRef.current) return;
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
    }
    intervalRef.current = setTimeout(() => {
      void pollTick().finally(() => {
        if (pollingRef.current) {
          scheduleNextPoll();
        }
      });
    }, visibilityPollMs(OVERVIEW_POLL_INTERVAL_MS));
  }, [pollTick]);

  const startPolling = useCallback(() => {
    if (!enabled || !memberId) return;
    if (!shouldResetOverviewPollSession(pollingRef.current)) {
      void pollTick();
      return;
    }
    onPollStart?.();
    awaitingSourceChangeRef.current = true;
    baselineSignatureRef.current = null;
    sawCanonicalRef.current = false;
    fetchedSettledRef.current = false;
    previousOutcomesRef.current = null;
    pollStartedAtRef.current = Date.now();
    consecutiveErrorsRef.current = 0;
    lastRevisionRef.current = null;
    lastScoredRef.current = null;
    if (!pollingRef.current) {
      pollingRef.current = true;
      void pollTick().finally(() => {
        if (pollingRef.current) {
          scheduleNextPoll();
        }
      });
      return;
    }
    void pollTick();
  }, [enabled, memberId, onPollStart, pollTick, scheduleNextPoll]);

  useEffect(() => {
    pollEpochRef.current += 1;
    lastRevisionRef.current = null;
    lastScoredRef.current = null;
    awaitingSourceChangeRef.current = false;
    baselineSignatureRef.current = null;
    sawCanonicalRef.current = false;
    fetchedSettledRef.current = false;
    previousOutcomesRef.current = null;
    stopPolling();
  }, [memberId, stopPolling]);

  useEffect(() => {
    if (!enabled) {
      stopPolling();
      return;
    }
    const handlePollReset = () => {
      pollEpochRef.current += 1;
      lastRevisionRef.current = null;
      lastScoredRef.current = null;
      awaitingSourceChangeRef.current = true;
      baselineSignatureRef.current = null;
      sawCanonicalRef.current = false;
      fetchedSettledRef.current = false;
      previousOutcomesRef.current = null;
    };
    const handleStart = (event?: {
      detail?: { member_id?: string | number };
    }) => {
      if (!progressEventMatchesMember(memberId, event?.detail)) return;
      startPolling();
    };
    subscribe('checkProgress', handleStart);
    subscribe('labJobStarted', handleStart as EventListener);
    subscribe('overviewPollReset', handlePollReset);
    return () => {
      stopPolling();
      unsubscribe('checkProgress', handleStart);
      unsubscribe('labJobStarted', handleStart as EventListener);
      unsubscribe('overviewPollReset', handlePollReset);
    };
  }, [enabled, memberId, startPolling, stopPolling]);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  return { startPolling, stopPolling };
}
