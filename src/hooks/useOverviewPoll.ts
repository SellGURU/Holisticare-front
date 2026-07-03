import { useCallback, useEffect, useRef } from 'react';
import Application from '../api/app';
import { subscribe, unsubscribe } from '../utils/event';
import {
  progressEventMatchesMember,
  type OverviewDataPhase,
} from '../utils/asyncProcessing';

const OVERVIEW_POLL_INTERVAL_MS = 2000;

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
  categories_partial?: string[];
  categories_status?: Array<{
    name: string;
    values_ready?: boolean;
    flags_ready?: boolean;
    description_ready?: boolean;
  }>;
  active_preview_file_id?: string;
  progress_pct?: number;
};

type UseOverviewPollOptions = {
  memberId: number | null | undefined;
  enabled: boolean;
  onSnapshot: (snapshot: OverviewSnapshot) => void;
  onReferenceData: (data: Record<string, unknown>) => void;
  onCategoriesData: (data: Record<string, unknown>) => void;
  onConcerningData: (data: Record<string, unknown>) => void;
  onPollStart?: () => void;
};

export function useOverviewPoll({
  memberId,
  enabled,
  onSnapshot,
  onReferenceData,
  onCategoriesData,
  onConcerningData,
  onPollStart,
}: UseOverviewPollOptions) {
  const inFlightRef = useRef(false);
  const pollingRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastRevisionRef = useRef<string | null>(null);
  const lastScoredRef = useRef<number | null>(null);

  const stopPolling = useCallback(() => {
    pollingRef.current = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const pollTick = useCallback(async () => {
    if (!enabled || !memberId || inFlightRef.current) return;
    inFlightRef.current = true;
    try {
      const snapRes = await Application.getOverviewProcessingSnapshot({
        member_id: memberId,
      });
      const snapshot = (snapRes.data || {}) as OverviewSnapshot;
      onSnapshot(snapshot);

      if (
        !snapshot.processing &&
        (snapshot.data_phase === 'complete' ||
          snapshot.data_phase === 'extracted_only')
      ) {
        stopPolling();
        return;
      }

      const revision = snapshot.data_revision ?? null;
      const scored = snapshot.biomarkers_scored ?? null;
      const shouldFetchFull =
        revision !== lastRevisionRef.current ||
        lastRevisionRef.current === null ||
        (scored !== null && scored !== lastScoredRef.current);

      if (shouldFetchFull) {
        const [refRes, catRes, conRes] = await Promise.all([
          Application.getClientSummaryOutofrefs({ member_id: memberId }),
          Application.getClientSummaryCategories({ member_id: memberId }),
          Application.getConceringResults({ member_id: memberId }),
        ]);
        lastRevisionRef.current = revision;
        if (scored !== null) {
          lastScoredRef.current = scored;
        }
        onReferenceData(refRes.data || {});
        onCategoriesData(catRes.data || {});
        onConcerningData(conRes.data || {});
      }
    } catch {
      // keep polling — transient errors should not stop the loop
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
    stopPolling,
  ]);

  const startPolling = useCallback(() => {
    if (!enabled || !memberId) return;
    onPollStart?.();
    if (!pollingRef.current) {
      pollingRef.current = true;
      lastRevisionRef.current = null;
      lastScoredRef.current = null;
      void pollTick();
      intervalRef.current = setInterval(() => {
        void pollTick();
      }, OVERVIEW_POLL_INTERVAL_MS);
      return;
    }
    void pollTick();
  }, [enabled, memberId, onPollStart, pollTick]);

  useEffect(() => {
    lastRevisionRef.current = null;
    lastScoredRef.current = null;
    stopPolling();
  }, [memberId, stopPolling]);

  useEffect(() => {
    if (!enabled) {
      stopPolling();
      return;
    }
    const handlePollReset = () => {
      lastRevisionRef.current = null;
      lastScoredRef.current = null;
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
