import { useCallback, useEffect, useRef, useState } from 'react';
import Application from '../api/app';
import {
  clearPersistedLabJobId,
  isAsyncProcessingEnabled,
  isLabJobTerminal,
  LabJobStatus,
  persistLabJobId,
  readPersistedLabJobId,
} from '../utils/asyncProcessing';

const BASE_POLL_MS = 2500;
const MAX_POLL_MS = 10000;
const BACKOFF_AFTER_MS = 5 * 60 * 1000;

type UseLabJobStatusOptions = {
  memberId?: string | number;
  jobId?: string | null;
  enabled?: boolean;
  onTerminal?: (status: LabJobStatus) => void;
};

export const useLabJobStatus = ({
  memberId,
  jobId: externalJobId,
  enabled = true,
  onTerminal,
}: UseLabJobStatusOptions) => {
  const [jobId, setJobId] = useState<string | null>(externalJobId ?? null);
  const [status, setStatus] = useState<LabJobStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollStartedRef = useRef<number>(Date.now());
  const pollIntervalRef = useRef(BASE_POLL_MS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onTerminalRef = useRef(onTerminal);
  onTerminalRef.current = onTerminal;
  const terminalRef = useRef(false);

  const resolveJobId = useCallback(async (): Promise<string | null> => {
    if (externalJobId) return externalJobId;
    if (jobId) return jobId;
    if (!memberId) return null;
    const persisted = readPersistedLabJobId(memberId);
    if (persisted) return persisted;
    try {
      const latest = await Application.getLatestLabJob(Number(memberId));
      const latestJobId = latest?.data?.job_id;
      if (latestJobId) {
        persistLabJobId(memberId, latestJobId);
        return latestJobId;
      }
    } catch {
      // no active job
    }
    return null;
  }, [externalJobId, jobId, memberId]);

  const pollOnce = useCallback(async () => {
    if (!enabled || !isAsyncProcessingEnabled() || !memberId) return;
    const activeJobId = await resolveJobId();
    if (!activeJobId) return;
    setJobId(activeJobId);
    setLoading(true);
    try {
      const response = await Application.getLabJobStatus(
        Number(memberId),
        activeJobId,
      );
      const nextStatus = response?.data as LabJobStatus;
      setStatus(nextStatus);
      setError(null);
      if (nextStatus?.overall_status === 'done' && memberId) {
        clearPersistedLabJobId(memberId);
      }
      if (isLabJobTerminal(nextStatus)) {
        terminalRef.current = true;
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        onTerminalRef.current?.(nextStatus);
        return;
      }
      const elapsed = Date.now() - pollStartedRef.current;
      if (elapsed > BACKOFF_AFTER_MS) {
        pollIntervalRef.current = Math.min(
          MAX_POLL_MS,
          pollIntervalRef.current + 500,
        );
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Failed to poll job status',
      );
    } finally {
      setLoading(false);
    }
  }, [enabled, memberId, resolveJobId]);

  useEffect(() => {
    if (!enabled || !isAsyncProcessingEnabled() || !memberId) return;
    terminalRef.current = false;
    pollStartedRef.current = Date.now();
    pollIntervalRef.current = BASE_POLL_MS;
    void pollOnce();
    intervalRef.current = setInterval(() => {
      if (!terminalRef.current) void pollOnce();
    }, pollIntervalRef.current);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, memberId, externalJobId, pollOnce]);

  const setActiveJobId = useCallback(
    (nextJobId: string) => {
      setJobId(nextJobId);
      terminalRef.current = false;
      if (memberId) persistLabJobId(memberId, nextJobId);
      pollStartedRef.current = Date.now();
      pollIntervalRef.current = BASE_POLL_MS;
      void pollOnce();
    },
    [memberId, pollOnce],
  );

  const retryJob = useCallback(async () => {
    if (!memberId || !jobId) return null;
    const response = await Application.retryLabJob(Number(memberId), jobId);
    const next = response?.data as LabJobStatus;
    if (next?.job_id) {
      setActiveJobId(next.job_id);
      setStatus(next);
      return next;
    }
    return null;
  }, [jobId, memberId, setActiveJobId]);

  return {
    jobId,
    status,
    loading,
    error,
    setActiveJobId,
    retryJob,
    refresh: pollOnce,
    isPolling:
      enabled &&
      isAsyncProcessingEnabled() &&
      !terminalRef.current &&
      !isLabJobTerminal(status),
  };
};
