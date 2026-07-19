/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import Application from '../../../../api/app';
import { useParams } from 'react-router-dom';
import { publish, subscribe, unsubscribe } from '../../../../utils/event';
import FileUploadProgressList from './FileUploadProgressList';
import useIsDemo from '../../../../hooks/useIsDemo';
import { useLabReportUpload } from '../../../../hooks/useLabReportUpload';
import {
  isStepOneTerminalEmptyOrFailed,
  resolveStepOneWarningMessage,
  stepOneTerminalUserMessage,
  SUPPORTED_LAB_REPORT_FORMATS,
} from '../../../../utils/labReportStepOne';
import { validateLabReportFile } from '../../../../utils/labReportUploadHelpers';
import ProgressLoading from '../../../RepoerAnalyse/UploadTestV2/ProgressLoading';
import {
  buildProcessLabReportPayloadFromStepOne,
  countReviewCategoriesFromStepOneData,
} from '../../../RepoerAnalyse/UploadTestV2/biomarkerReviewCompat';
import type { SuppressedBiomarkerItem } from '../../../RepoerAnalyse/UploadTestV2/biomarkerReviewCompat';
import { isAsyncProcessingEnabled } from '../../../../utils/asyncProcessing';
import {
  buildMultiFileTrimmedMessage,
  cancelSession,
  clearSession,
  createSession,
  getAbortController,
  isActiveUploadZonePhase,
  isPendingCancel,
  mergeStepOne,
  readSession,
  shouldShowUploadZone,
  UPLOAD_SESSION_BUSY_MESSAGE,
  writeSession,
  type UploadZoneSession,
} from '../../../../utils/labUploadSession';
import { isStepOneDeletedResponse } from '../../../../utils/labReportStepOne';
import {
  filterCancelledFiles,
  isUploadCancelled,
  markUploadCancelled,
} from '../../../../utils/labUploadCancelRegistry';
import { shouldContinueUploadPoll } from '../../../../utils/labUploadPollGuard';

const STEP_ONE_POLL_INTERVAL_MS = 10000;

// In-flight uploads are persisted to localStorage so that a refresh / navigation
// during the OCR ("Extracting") phase can reconnect. The server file list
// (get_list_lab_report) only returns files once they are saved (status=true or
// modified_biomarkers set), so a file still being extracted is invisible there;
// localStorage bridges that gap until the file is saved or fails.
const INFLIGHT_UPLOADS_KEY = 'hc_inflight_lab_uploads';
const INFLIGHT_UPLOAD_TTL_MS = 60 * 60 * 1000; // prune records older than 1h

type InflightUploadRecord = {
  file_id: string;
  file_name: string;
  date_uploaded: string;
  addedAt: number;
};

const inflightStorageKey = (memberId: string) =>
  `${INFLIGHT_UPLOADS_KEY}_${memberId}`;

const readInflightUploads = (memberId: string): InflightUploadRecord[] => {
  try {
    const raw = localStorage.getItem(inflightStorageKey(memberId));
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    const cutoff = Date.now() - INFLIGHT_UPLOAD_TTL_MS;
    return parsed.filter(
      (record) =>
        record &&
        typeof record.file_id === 'string' &&
        (typeof record.addedAt !== 'number' || record.addedAt > cutoff),
    );
  } catch {
    return [];
  }
};

const writeInflightUploads = (
  memberId: string,
  records: InflightUploadRecord[],
) => {
  try {
    localStorage.setItem(
      inflightStorageKey(memberId),
      JSON.stringify(records.slice(0, 10)),
    );
  } catch {
    // Ignore quota / serialization errors - reconnect is best-effort.
  }
};

const persistInflightUpload = (
  memberId: string,
  record: InflightUploadRecord,
) => {
  const next = readInflightUploads(memberId).filter(
    (existing) => existing.file_id !== record.file_id,
  );
  next.unshift(record);
  writeInflightUploads(memberId, next);
};

const clearInflightUpload = (memberId: string, fileId: string) => {
  if (!fileId) return;
  writeInflightUploads(
    memberId,
    readInflightUploads(memberId).filter((record) => record.file_id !== fileId),
  );
};

type FileReviewMeta = {
  extractedCount?: number;
  readyCount?: number;
  reviewCount?: number;
  excludedCount?: number;
  reviewCountsReady?: boolean;
  fetchedAt: number;
};

interface FileHistoryNewProps {
  handleCloseSlideOutPanel: () => void;
  isOpen: boolean;
  setUnsyncedIdes: (ids: string[]) => void;
  unsyncedIdes: string[];
}
const FileHistoryNew: FC<FileHistoryNewProps> = ({
  isOpen,
  handleCloseSlideOutPanel,
}) => {
  const isDemo = useIsDemo();
  const { uploadLabReportFile } = useLabReportUpload();
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [uploadZoneSession, setUploadZoneSession] =
    useState<UploadZoneSession | null>(null);
  const [uploadZoneError, setUploadZoneError] = useState<string | null>(null);
  const [uploadBannerMessage, setUploadBannerMessage] = useState<string | null>(
    null,
  );
  const [localUploadProgress, setLocalUploadProgress] = useState(0);
  const [backgroundCards, setBackgroundCards] = useState<any[]>([]);
  const uploadZoneSessionRef = useRef<UploadZoneSession | null>(null);
  const [fileReviewMeta, setFileReviewMeta] = useState<
    Record<string, FileReviewMeta>
  >({});
  const [liveReviewMeta, setLiveReviewMeta] = useState<
    Record<string, { ready: number; review: number; excluded: number }>
  >({});
  const [isDragging, setIsDragging] = useState(false);
  const { id } = useParams<{ id: string }>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const requestSeqRef = useRef(0);
  const stepOnePollInFlightRef = useRef(false);
  const suppressedItemsRef = useRef<SuppressedBiomarkerItem[] | null>(null);
  const reviewMetaFetchInFlightRef = useRef<Set<string>>(new Set());
  const processLabReportInFlightRef = useRef<Set<string>>(new Set());
  const processLabReportSucceededRef = useRef<Set<string>>(new Set());
  const reconnectAttemptedRef = useRef<Set<string>>(new Set());

  const cacheFileReviewMeta = useCallback(
    (fileId: string | undefined, meta: Partial<FileReviewMeta>) => {
      if (!fileId) return;
      setFileReviewMeta((prev) => ({
        ...prev,
        [fileId]: {
          ...prev[fileId],
          ...meta,
          fetchedAt: Date.now(),
        },
      }));
    },
    [],
  );

  const clearFileReviewMeta = useCallback((fileId: string | undefined) => {
    if (!fileId) return;
    setFileReviewMeta((prev) => {
      if (!prev[fileId]) return prev;
      const next = { ...prev };
      delete next[fileId];
      return next;
    });
  }, []);

  const getSuppressedItems = useCallback(async () => {
    if (suppressedItemsRef.current) return suppressedItemsRef.current;
    try {
      const res = await Application.listSuppressedBiomarkers();
      const items = res?.data?.suppressed || [];
      suppressedItemsRef.current = items;
      return items;
    } catch {
      suppressedItemsRef.current = [];
      return [];
    }
  }, []);

  const syncReviewCountsForFile = useCallback(
    async (
      targetFileId: string,
      data: any,
      sessionId?: string,
    ): Promise<ReturnType<
      typeof countReviewCategoriesFromStepOneData
    > | null> => {
      const extractedCount = Array.isArray(data?.extracted_biomarkers)
        ? data.extracted_biomarkers.length
        : undefined;
      if (!data?.validation?.ready || !extractedCount) {
        return null;
      }

      const suppressedItems = await getSuppressedItems();
      if (isUploadCancelled(sessionId, targetFileId)) {
        return null;
      }

      const reviewCounts = countReviewCategoriesFromStepOneData(
        data,
        suppressedItems,
      );
      cacheFileReviewMeta(targetFileId, {
        extractedCount: reviewCounts.extracted,
        readyCount: reviewCounts.ready,
        reviewCount: reviewCounts.review,
        excludedCount: reviewCounts.excluded,
        reviewCountsReady: true,
      });

      return reviewCounts;
    },
    [cacheFileReviewMeta, getSuppressedItems],
  );

  const getFileList = useCallback((memberId: string) => {
    const requestSeq = ++requestSeqRef.current;

    Application.getFilleList({ member_id: memberId })
      .then((res) => {
        if (requestSeq !== requestSeqRef.current) return;
        if (res.data) {
          setUploadedFiles(filterCancelledFiles(res.data));
        } else {
          throw new Error('Unexpected data format');
        }
      })
      .catch((err) => {
        if (requestSeq !== requestSeqRef.current) return;
        console.error(err);
      });
  }, []);

  const syncUploadZoneSession = useCallback(
    (next: UploadZoneSession | null) => {
      uploadZoneSessionRef.current = next;
      setUploadZoneSession(next);
      if (id) {
        void writeSession(id, next);
      }
    },
    [id],
  );

  useEffect(() => {
    if (!id) return;
    const restored = readSession(id);
    if (restored && isUploadCancelled(restored.sessionId, restored.fileId)) {
      void clearSession(id, restored.fileId);
      syncUploadZoneSession(null);
    } else {
      syncUploadZoneSession(restored);
    }
    setBackgroundCards([]);
    setUploadZoneError(null);
    setUploadBannerMessage(null);
    setLocalUploadProgress(0);
    setFileReviewMeta({});
    setLiveReviewMeta({});
    reconnectAttemptedRef.current.clear();
    processLabReportInFlightRef.current.clear();
    processLabReportSucceededRef.current.clear();
    stepOnePollInFlightRef.current = false;
    getFileList(id);
  }, [id, getFileList, syncUploadZoneSession]);

  useEffect(() => {
    if (id && isOpen) {
      getFileList(id);
    }
  }, [id, isOpen, getFileList]);

  useEffect(() => {
    const handleSyncReport = () => {
      setBackgroundCards((prev) =>
        prev.filter(
          (fileUpload) =>
            !fileUpload.reviewHandoff &&
            fileUpload.reviewCount == null &&
            fileUpload.excludedCount == null,
        ),
      );
      if (id) {
        getFileList(id);
      }
    };

    subscribe('syncReport', handleSyncReport);
    return () => {
      unsubscribe('syncReport', handleSyncReport);
    };
  }, [id, getFileList]);

  useEffect(() => {
    const handleLabReportDeleted = (data: any) => {
      const memberId = data?.detail?.member_id;
      const fileId = data?.detail?.file_id;
      if (!id || memberId !== id || !fileId) return;

      markUploadCancelled(undefined, fileId);

      const active = uploadZoneSessionRef.current;
      if (active && (active.fileId === fileId || active.sessionId === fileId)) {
        void cancelSession(id, active, {
          fileId: active.fileId || fileId,
          deleteFileHistoryFn: (targetId) =>
            Application.deleteFileHistory({
              file_id: targetId,
              member_id: id,
            }),
        }).then(() => {
          syncUploadZoneSession(null);
          setUploadZoneError(null);
        });
      } else {
        void clearSession(id, fileId);
      }

      reconnectAttemptedRef.current.delete(fileId);
      setBackgroundCards((prev) =>
        prev.filter((row) => row.file_id !== fileId),
      );
      getFileList(id);
    };

    subscribe('labReportDeleted', handleLabReportDeleted);
    return () => {
      unsubscribe('labReportDeleted', handleLabReportDeleted);
    };
  }, [id, getFileList, syncUploadZoneSession]);

  useEffect(() => {
    const handleCompletedProgress = (data: any) => {
      if (data?.detail?.type === 'uploaded' && id) {
        const completedFileId = data?.detail?.file_id;
        if (completedFileId) {
          clearInflightUpload(id, completedFileId);
          setBackgroundCards((prev) =>
            prev.filter(
              (fileUpload) =>
                fileUpload.file_id !== completedFileId &&
                fileUpload.upload_temp_id !== completedFileId,
            ),
          );
        }
        getFileList(id);
      }
    };

    subscribe('completedProgress', handleCompletedProgress);
    return () => {
      unsubscribe('completedProgress', handleCompletedProgress);
    };
  }, [id, getFileList]);

  useEffect(() => {
    const handleUploadTestShow = (data: any) => {
      const fileId = data?.detail?.file_id;
      const mode = data?.detail?.mode;
      if (!fileId) return;

      if (mode === 'edit' || mode === 'edit_manual') {
        return;
      }

      if (mode !== 'review_ready') return;

      setBackgroundCards((prev) =>
        prev.map((fileUpload) =>
          fileUpload.file_id === fileId || fileUpload.upload_temp_id === fileId
            ? {
                ...fileUpload,
                status: 'background',
                uploadPhase: 'processing',
                headerProcessing: true,
                reviewHandoff: true,
                progressBiomarker: 100,
                process_done: false,
              }
            : fileUpload,
        ),
      );
    };

    subscribe('uploadTestShow', handleUploadTestShow);
    return () => {
      unsubscribe('uploadTestShow', handleUploadTestShow);
    };
  }, []);

  useEffect(() => {
    const handleLiveCounts = (data: any) => {
      const fileId = data?.detail?.file_id;
      const counts = data?.detail?.counts;
      if (!fileId || !counts) return;
      setLiveReviewMeta((prev) => ({ ...prev, [fileId]: counts }));
    };
    const handleLiveCountsClear = (data: any) => {
      const fileId = data?.detail?.file_id;
      if (!fileId) return;
      setLiveReviewMeta((prev) => {
        if (!prev[fileId]) return prev;
        const next = { ...prev };
        delete next[fileId];
        return next;
      });
    };
    subscribe('reviewCountsLive', handleLiveCounts);
    subscribe('reviewCountsLiveClear', handleLiveCountsClear);
    return () => {
      unsubscribe('reviewCountsLive', handleLiveCounts);
      unsubscribe('reviewCountsLiveClear', handleLiveCountsClear);
    };
  }, []);

  const handoffToBackgroundCard = (row: any) => {
    if (isUploadCancelled(undefined, row?.file_id)) return;
    setBackgroundCards((prev) => {
      const without = prev.filter((item) => item.file_id !== row.file_id);
      return [row, ...without];
    });
  };

  const handleCancelUpload = () => {
    if (!id || !uploadZoneSession) return;
    const session = uploadZoneSession;
    const fileId = session.fileId;

    markUploadCancelled(session.sessionId, fileId);
    if (fileId) {
      processLabReportInFlightRef.current.delete(fileId);
      setBackgroundCards((prev) =>
        prev.filter((row) => row.file_id !== fileId),
      );
    }

    void cancelSession(id, session, {
      fileId,
      deleteFileHistoryFn: (targetId) =>
        Application.deleteFileHistory({
          file_id: targetId,
          member_id: id,
        }),
    })
      .then(() => {
        syncUploadZoneSession(null);
        setUploadZoneError(null);
        setLocalUploadProgress(0);
        if (fileId) {
          clearInflightUpload(id, fileId);
          publish('labReportDeleted', { member_id: id, file_id: fileId });
        }
        getFileList(id);
      })
      .catch((error: any) => {
        setUploadZoneError(
          error?.response?.data?.detail ||
            error?.response?.data?.message ||
            error?.message ||
            'Could not cancel this upload. Please try again.',
        );
      });
  };

  const uploadFiles = async (files: FileList | File[]) => {
    if (isDemo || !id) return;

    const selectedFiles = Array.from(files);
    const active = uploadZoneSessionRef.current;
    if (active && isActiveUploadZonePhase(active.phase)) {
      setUploadBannerMessage(UPLOAD_SESSION_BUSY_MESSAGE);
      return;
    }

    const file = selectedFiles[0];
    if (!file) return;

    if (selectedFiles.length > 1) {
      setUploadBannerMessage(
        buildMultiFileTrimmedMessage(file.name, selectedFiles.length - 1),
      );
    } else {
      setUploadBannerMessage(null);
    }

    setUploadZoneError(null);

    const preflight = validateLabReportFile(file);
    if (!preflight.ok) {
      setUploadZoneError(preflight.message);
      return;
    }

    const session = createSession(file.name);
    syncUploadZoneSession(session);
    setLocalUploadProgress(0);

    void uploadLabReportFile({
      memberId: id,
      file,
      publishProgressEvents: false,
      autoOpenReviewOnReady: false,
      signal: getAbortController(session.sessionId)?.signal,
      onStateChange: (fileUpload) => {
        const isCompleted = fileUpload.status === 'completed';
        const isError = fileUpload.status === 'error';

        if (isCompleted && fileUpload.file_id) {
          const sessionId = uploadZoneSessionRef.current?.sessionId;
          if (
            sessionId &&
            (isPendingCancel(sessionId) ||
              isUploadCancelled(sessionId, fileUpload.file_id))
          ) {
            markUploadCancelled(sessionId, fileUpload.file_id);
            void Application.deleteFileHistory({
              file_id: fileUpload.file_id,
              member_id: id,
            }).finally(() => {
              void clearSession(id, fileUpload.file_id);
              syncUploadZoneSession(null);
              clearInflightUpload(id, fileUpload.file_id);
            });
            return;
          }

          persistInflightUpload(id, {
            file_id: fileUpload.file_id,
            file_name: file.name,
            date_uploaded: new Date().toISOString(),
            addedAt: Date.now(),
          });

          const nextSession: UploadZoneSession = {
            ...session,
            fileId: fileUpload.file_id,
            phase: 'ocr_processing',
            serverProgress: 50,
            uiProgress: Math.max(session.uiProgress, 50),
            updatedAt: Date.now(),
          };
          syncUploadZoneSession(nextSession);
          setLocalUploadProgress(45);
          return;
        }

        if (isError) {
          syncUploadZoneSession({
            ...session,
            phase: 'failed',
            updatedAt: Date.now(),
          });
          setUploadZoneError(
            fileUpload.errorMessage ||
              'This file could not be uploaded. Please try another file.',
          );
          return;
        }

        if (fileUpload.status === 'uploading') {
          const progress = Math.min(Math.round(fileUpload.progress || 0), 45);
          setLocalUploadProgress(progress);
          syncUploadZoneSession({
            ...session,
            phase: 'uploading',
            serverProgress: progress,
            uiProgress: Math.max(session.uiProgress, progress),
            updatedAt: Date.now(),
          });
        }
      },
      onComplete: () => {
        getFileList(id);
      },
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      void uploadFiles(event.target.files);
    }
    event.target.value = '';
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files?.length) {
      void uploadFiles(event.dataTransfer.files);
    }
  };

  const showInlineExtractProgress =
    shouldShowUploadZone(uploadZoneSession) || Boolean(uploadZoneError);
  const showUploadZoneIdle = !showInlineExtractProgress;
  const showInlineUploadSplash =
    uploadZoneSession?.phase === 'uploading' ||
    uploadZoneSession?.phase === 'ocr_processing' ||
    uploadZoneSession?.phase === 'saving';
  const activeZoneFileId = uploadZoneSession?.fileId ?? null;
  const zoneFileIds = activeZoneFileId
    ? new Set<string>([activeZoneFileId])
    : new Set<string>();
  const listBackgroundCards = backgroundCards.filter(
    (fileUpload) =>
      (fileUpload.status === 'success' || fileUpload.status === 'background') &&
      !isUploadCancelled(undefined, fileUpload.file_id),
  );
  const backgroundFileIds = new Set(
    listBackgroundCards
      .map((fileUpload) => fileUpload.file_id)
      .filter((fileId): fileId is string => Boolean(fileId)),
  );
  const withReviewMeta = (fileUpload: any) => {
    const fid = fileUpload?.file_id;
    const meta = fid ? fileReviewMeta[fid] : null;
    const live = fid ? liveReviewMeta[fid] : null;
    if (live) {
      return {
        ...fileUpload,
        ...(meta ?? {}),
        readyCount: live.ready,
        reviewCount: live.review,
        excludedCount: live.excluded,
        reviewCountsReady: true,
      };
    }
    return meta ? { ...fileUpload, ...meta } : fileUpload;
  };
  const mergedUploadedFiles = [
    ...listBackgroundCards.map(withReviewMeta),
    ...filterCancelledFiles(uploadedFiles)
      .filter(
        (fileUpload) =>
          (!activeZoneFileId || fileUpload.file_id !== activeZoneFileId) &&
          !zoneFileIds.has(fileUpload.file_id) &&
          !backgroundFileIds.has(fileUpload.file_id),
      )
      .map(withReviewMeta),
  ];
  const uploadZonePhase =
    uploadZoneSession?.phase === 'saving'
      ? 'processing'
      : uploadZoneSession?.phase === 'failed'
        ? 'failed'
        : uploadZoneSession?.phase || 'uploading';
  const inlineProgressMax =
    uploadZoneSession?.phase === 'uploading'
      ? Math.min(localUploadProgress, 45)
      : typeof uploadZoneSession?.uiProgress === 'number'
        ? uploadZoneSession.uiProgress
        : 50;

  const handleDismissUploadError = () => {
    syncUploadZoneSession(null);
    setUploadZoneError(null);
    setLocalUploadProgress(0);
    if (id && uploadZoneSession?.fileId) {
      void clearSession(id, uploadZoneSession.fileId);
    }
  };

  useEffect(() => {
    const session = uploadZoneSessionRef.current;
    const fileId = session?.fileId;
    if (!fileId || !id || !session) return;
    if (session.phase !== 'ocr_processing' && session.phase !== 'saving')
      return;
    if (isUploadCancelled(session.sessionId, fileId)) return;

    let isStopped = false;
    const pollTimerRef = {
      id: undefined as number | undefined,
    };

    const stopPolling = () => {
      isStopped = true;
      if (pollTimerRef.id != null) {
        window.clearInterval(pollTimerRef.id);
      }
    };

    const patchSession = (patch: Partial<UploadZoneSession>) => {
      const current = uploadZoneSessionRef.current;
      if (!shouldContinueUploadPoll(session.sessionId, fileId, current)) {
        return;
      }
      syncUploadZoneSession({
        ...current!,
        ...patch,
        updatedAt: Date.now(),
      });
    };

    const abortPollIfCancelled = () => {
      if (
        !shouldContinueUploadPoll(
          session.sessionId,
          fileId,
          uploadZoneSessionRef.current,
        )
      ) {
        stopPolling();
        return true;
      }
      return false;
    };

    const finishZone = () => {
      stopPolling();
      clearInflightUpload(id, fileId);
      syncUploadZoneSession(null);
      void clearSession(id, fileId);
      getFileList(id);
    };

    const handoffZoneToBackground = (row: Record<string, unknown>) => {
      if (abortPollIfCancelled()) return;
      stopPolling();
      clearInflightUpload(id, fileId);
      handoffToBackgroundCard({
        file: null,
        file_id: row.file_id ?? fileId,
        file_name: row.file_name ?? session.fileName,
        date_uploaded: new Date().toISOString(),
        progress: 100,
        uploadedSize: 0,
        status: 'background',
        uploadPhase: row.uploadPhase ?? 'processing',
        progressBiomarker: 100,
        action_type: 'uploaded',
        process_done: false,
        headerProcessing: true,
        reviewHandoff: Boolean(row.reviewHandoff),
        needsManualReview: Boolean(row.needsManualReview),
        readyCount: row.readyCount,
        reviewCount: row.reviewCount,
        excludedCount: row.excludedCount,
        warningMessage: row.warningMessage,
      });
      syncUploadZoneSession(null);
      void clearSession(id, fileId);
      getFileList(id);
    };

    const applyStepOneData = async (data: any) => {
      if (abortPollIfCancelled()) return true;

      const current = uploadZoneSessionRef.current;
      if (!current) return true;

      if (data.error || data.lab_type === 'error') {
        setUploadZoneError(
          stepOneTerminalUserMessage(data) ||
            'Could not extract biomarkers from this file.',
        );
        patchSession({ phase: 'failed' });
        window.setTimeout(finishZone, 3000);
        return true;
      }

      const warningMessage = resolveStepOneWarningMessage(data);

      if (isStepOneTerminalEmptyOrFailed(data)) {
        setUploadZoneError(stepOneTerminalUserMessage(data));
        patchSession({
          phase: 'failed',
          serverProgress:
            typeof data.progress === 'number' ? data.progress : 90,
          uiProgress: Math.max(
            current.uiProgress,
            typeof data.progress === 'number' ? data.progress : 90,
          ),
          warningMessage,
        });
        window.setTimeout(finishZone, 3000);
        return true;
      }

      const extractedCount = Array.isArray(data.extracted_biomarkers)
        ? data.extracted_biomarkers.length
        : undefined;
      if (extractedCount != null) {
        cacheFileReviewMeta(fileId, { extractedCount });
      }

      const reviewCounts = await syncReviewCountsForFile(
        fileId,
        data,
        session.sessionId,
      );
      if (abortPollIfCancelled()) return true;

      const liveSession = uploadZoneSessionRef.current;
      const merged = mergeStepOne(liveSession, {
        ...data,
        warning_message: warningMessage,
        readyCount: reviewCounts?.ready,
        reviewCount: reviewCounts?.review,
        excludedCount: reviewCounts?.excluded,
      });
      if (!merged || abortPollIfCancelled()) return true;
      syncUploadZoneSession(merged);

      if (data.validation?.ready && extractedCount && extractedCount > 0) {
        const needsManualReview = (reviewCounts?.review ?? 0) > 0;

        if (
          data.is_edited === true &&
          !processLabReportInFlightRef.current.has(fileId)
        ) {
          if (abortPollIfCancelled()) return true;
          processLabReportSucceededRef.current.add(fileId);
          clearInflightUpload(id, fileId);
          handoffZoneToBackground({
            file_id: fileId,
            uploadPhase: 'processing',
            reviewHandoff: true,
            readyCount: reviewCounts?.ready,
            reviewCount: reviewCounts?.review,
            excludedCount: reviewCounts?.excluded,
            warningMessage,
          });
          publish('checkProgress', {
            type: 'file',
            file_id: fileId,
            member_id: id,
            action_type: 'uploaded',
            process_status: false,
          });
          return true;
        }

        if (
          processLabReportInFlightRef.current.has(fileId) ||
          processLabReportSucceededRef.current.has(fileId)
        ) {
          return true;
        }

        processLabReportInFlightRef.current.add(fileId);
        patchSession({
          phase: 'saving',
          serverProgress: 100,
          uiProgress: Math.max(merged.uiProgress, 100),
          readyCount: reviewCounts?.ready,
          reviewCount: reviewCounts?.review,
          excludedCount: reviewCounts?.excluded,
          warningMessage,
        });

        try {
          const suppressedItems = await getSuppressedItems();
          if (abortPollIfCancelled()) {
            processLabReportInFlightRef.current.delete(fileId);
            return true;
          }

          const payload = buildProcessLabReportPayloadFromStepOne({
            memberId: id,
            fileId,
            labType: data.lab_type || 'more_info',
            dateOfTest: data.date_of_test,
            data,
            suppressedItems,
          });

          const fireCompile = async (): Promise<string> => {
            if (abortPollIfCancelled()) {
              throw new Error('upload_cancelled');
            }

            const saveResponse = await Application.SaveLabReport(payload);
            if (abortPollIfCancelled()) {
              throw new Error('upload_cancelled');
            }

            const savedFileId =
              saveResponse?.data?.modified_biomarkers_file_id ||
              saveResponse?.data?.added_biomarkers_file_id ||
              saveResponse?.data?.file_id ||
              fileId;
            const jobId = saveResponse?.data?.job_id;

            processLabReportSucceededRef.current.add(fileId);
            processLabReportSucceededRef.current.add(savedFileId);
            clearInflightUpload(id, fileId);
            clearInflightUpload(id, savedFileId);
            clearFileReviewMeta(fileId);
            if (savedFileId !== fileId) {
              clearFileReviewMeta(savedFileId);
            }

            if (jobId && isAsyncProcessingEnabled()) {
              publish('labJobStarted', {
                job_id: jobId,
                member_id: id,
                file_id: savedFileId,
              });
              return savedFileId;
            }

            publish('checkProgress', {
              type: 'file',
              file_id: savedFileId,
              member_id: id,
              action_type: 'uploaded',
              process_status: false,
            });
            return savedFileId;
          };

          void fireCompile()
            .then((savedFileId) => {
              if (abortPollIfCancelled()) return;
              handoffZoneToBackground({
                file_id: savedFileId,
                uploadPhase: 'processing',
                needsManualReview,
                readyCount: reviewCounts?.ready,
                reviewCount: reviewCounts?.review,
                excludedCount: reviewCounts?.excluded,
                warningMessage,
              });
            })
            .catch((error) => {
              if (String(error?.message) === 'upload_cancelled') {
                processLabReportInFlightRef.current.delete(fileId);
                return;
              }
              console.error('Background compile failed:', error);
              clearInflightUpload(id, fileId);
              setUploadZoneError(
                error?.response?.data?.detail ||
                  error?.response?.data?.message ||
                  error?.message ||
                  'Could not process this lab report. Please try another file.',
              );
              patchSession({ phase: 'failed' });
            })
            .finally(() => {
              processLabReportInFlightRef.current.delete(fileId);
            });
          return true;
        } catch (error: any) {
          clearInflightUpload(id, fileId);
          setUploadZoneError(
            error?.response?.data?.detail ||
              error?.response?.data?.message ||
              error?.message ||
              'Could not prepare lab report for processing.',
          );
          patchSession({ phase: 'failed' });
          processLabReportInFlightRef.current.delete(fileId);
        }
        return true;
      }

      if (data.lab_type === 'ultrasound') {
        finishZone();
        return true;
      }

      return false;
    };

    const poll = async () => {
      if (isStopped) return;
      if (stepOnePollInFlightRef.current) return;
      if (isPendingCancel(session.sessionId)) {
        stopPolling();
        return;
      }
      stepOnePollInFlightRef.current = true;
      try {
        const res = await Application.checkLabStepOne({ file_id: fileId });
        const done = await applyStepOneData(res.data);
        if (done) stopPolling();
      } catch (err: any) {
        const errData =
          err?.extracted_biomarkers !== undefined
            ? err
            : (err?.response?.data ?? null);

        if (isStepOneDeletedResponse(err, errData)) {
          if (isUploadCancelled(session.sessionId, fileId)) {
            finishZone();
            return;
          }
          setUploadZoneError(
            'Upload could not continue. Please try again.',
          );
          patchSession({ phase: 'failed' });
          window.setTimeout(finishZone, 3000);
          return;
        }

        if (errData?.extracted_biomarkers !== undefined) {
          const done = await applyStepOneData(errData);
          if (done) stopPolling();
        } else if (
          err?.response?.status === 504 ||
          err?.code === 'ECONNABORTED'
        ) {
          setUploadZoneError(
            'The server took too long to respond. Please try again.',
          );
          patchSession({ phase: 'failed' });
          window.setTimeout(finishZone, 3000);
        }
      } finally {
        stepOnePollInFlightRef.current = false;
      }
    };

    void poll();
    pollTimerRef.id = window.setInterval(() => {
      void poll();
    }, STEP_ONE_POLL_INTERVAL_MS);

    return () => {
      stopPolling();
      stepOnePollInFlightRef.current = false;
    };
  }, [
    uploadZoneSession?.fileId,
    uploadZoneSession?.phase,
    uploadZoneSession?.sessionId,
    id,
    getFileList,
    cacheFileReviewMeta,
    getSuppressedItems,
    syncReviewCountsForFile,
    clearFileReviewMeta,
    syncUploadZoneSession,
  ]);

  const fetchReviewMetaForFile = useCallback(
    async (fileId: string | undefined) => {
      if (!fileId || fileReviewMeta[fileId]?.reviewCountsReady) return;
      if (reviewMetaFetchInFlightRef.current.has(fileId)) return;

      reviewMetaFetchInFlightRef.current.add(fileId);
      try {
        const res = await Application.checkLabStepOne({ file_id: fileId });
        const data = res?.data || {};
        const extractedCount = Array.isArray(data.extracted_biomarkers)
          ? data.extracted_biomarkers.length
          : undefined;

        if (extractedCount != null) {
          cacheFileReviewMeta(fileId, { extractedCount });
        }

        await syncReviewCountsForFile(fileId, data);
      } catch {
        // File cards can render without counts if historical review data is unavailable.
      } finally {
        reviewMetaFetchInFlightRef.current.delete(fileId);
      }
    },
    [cacheFileReviewMeta, fileReviewMeta, syncReviewCountsForFile],
  );

  useEffect(() => {
    if (!isOpen) return;
    const filesMissingMeta = uploadedFiles.filter(
      (fileUpload) =>
        fileUpload?.file_id &&
        fileUpload.process_done === true &&
        fileUpload.file_id !== activeZoneFileId &&
        !fileReviewMeta[fileUpload.file_id]?.reviewCountsReady,
    );
    if (filesMissingMeta.length === 0) return;

    let cancelled = false;
    const hydrate = async () => {
      for (const fileUpload of filesMissingMeta) {
        if (cancelled) break;
        await fetchReviewMetaForFile(fileUpload.file_id);
      }
    };

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [
    activeZoneFileId,
    fetchReviewMetaForFile,
    fileReviewMeta,
    isOpen,
    uploadedFiles,
  ]);

  return (
    <div className="w-full relative">
      <div className="w-full">
        {uploadBannerMessage ? (
          <div className="mb-2 rounded-xl border border-[#FEDF89] bg-[#FFFAEB] px-3 py-2 text-[10px] leading-4 text-[#B54708]">
            {uploadBannerMessage}
          </div>
        ) : null}
        <div className="mb-3 grid grid-cols-2 gap-2 rounded-2xl border border-Gray-50 bg-white p-3 shadow-200">
          <div
            onDragEnter={(event) => {
              event.preventDefault();
              if (!isDemo && showUploadZoneIdle) setIsDragging(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              if (!isDemo && showUploadZoneIdle) setIsDragging(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setIsDragging(false);
            }}
            onDrop={(event) => {
              if (!showUploadZoneIdle) {
                event.preventDefault();
                return;
              }
              handleDrop(event);
            }}
            onClick={() => {
              if (isDemo || !showUploadZoneIdle) return;
              fileInputRef.current?.click();
            }}
            title={
              isDemo
                ? 'Demo version cannot add or edit data. Upgrade for full access.'
                : undefined
            }
            className={`relative overflow-hidden flex flex-col items-center justify-center rounded-2xl border bg-white text-center shadow-100 transition-colors ${
              showInlineExtractProgress
                ? 'col-span-2 min-h-0 border-Primary-DeepTeal bg-[#F6FAFB] px-4 py-4'
                : 'min-h-[112px] border-dashed border-Gray-50 px-3 py-3'
            } ${
              isDemo
                ? 'cursor-not-allowed opacity-60'
                : showInlineExtractProgress
                  ? 'cursor-default'
                  : 'cursor-pointer hover:border-Primary-DeepTeal'
            } ${isDragging ? 'border-Primary-DeepTeal bg-[#F6FAFB]' : ''}`}
          >
            {showInlineUploadSplash ? (
              <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-2xl">
                <div className="h-full w-1/2 animate-[progressShimmer_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-Primary-EmeraldGreen/20 to-transparent" />
              </div>
            ) : null}
            <div className="relative z-[1] flex w-full flex-col items-center justify-center">
              {showInlineExtractProgress &&
              (uploadZoneError || uploadZoneSession?.phase === 'failed') ? (
                <div className="flex w-full flex-col items-center justify-center gap-2 py-4 text-center">
                  <div className="flex size-11 items-center justify-center rounded-full border border-[#F3B8C8] bg-[#FFF5F8]">
                    <img
                      src="/icons/info-circle-red.svg"
                      alt=""
                      className="size-6"
                    />
                  </div>
                  <div className="text-[12px] font-semibold text-[#B42318]">
                    Upload failed
                  </div>
                  <div className="max-w-[280px] text-[10px] leading-4 text-Text-Secondary">
                    {uploadZoneError ||
                      'This file could not be uploaded. Please try another file.'}
                  </div>
                  <button
                    type="button"
                    onClick={handleDismissUploadError}
                    className="mt-1 rounded-full border border-Gray-50 bg-white px-3 py-1.5 text-[10px] font-medium text-Primary-DeepTeal shadow-100 hover:bg-backgroundColor-Main"
                  >
                    Try another file
                  </button>
                </div>
              ) : showInlineExtractProgress && uploadZoneSession ? (
                <ProgressLoading
                  maxProgress={inlineProgressMax}
                  initialProgress={uploadZoneSession.uiProgress}
                  phase={uploadZonePhase}
                  readyCount={uploadZoneSession.readyCount}
                  reviewCount={uploadZoneSession.reviewCount}
                  excludedCount={uploadZoneSession.excludedCount}
                  headerProcessing={
                    uploadZoneSession.phase === 'saving' ||
                    uploadZoneSession.phase === 'ocr_processing'
                  }
                  warningMessage={uploadZoneSession.warningMessage}
                  compact
                  onCancel={
                    uploadZoneSession.phase !== 'failed'
                      ? handleCancelUpload
                      : undefined
                  }
                />
              ) : (
                <>
                  <img src="/icons/upload-test.svg" alt="" className="size-9" />
                  <div className="mt-2 text-[11px] font-medium text-Text-Primary">
                    Upload File
                  </div>
                  <div className="mt-1 text-[9px] leading-4 text-Text-Secondary">
                    Drag/drop or click
                  </div>
                </>
              )}
            </div>
          </div>
          {showUploadZoneIdle ? (
            <button
              type="button"
              disabled={isDemo}
              onClick={() => {
                if (isDemo) return;
                publish('uploadTestShow', {
                  isShow: true,
                  mode: 'manual',
                });
                handleCloseSlideOutPanel();
              }}
              className={`flex min-h-[112px] flex-col items-center justify-center rounded-2xl border border-Gray-50 bg-white px-3 py-3 text-center shadow-100 transition-colors ${
                isDemo
                  ? 'cursor-not-allowed opacity-60'
                  : 'cursor-pointer hover:border-Primary-DeepTeal'
              }`}
            >
              <img src="/icons/task-square-new.svg" alt="" className="size-9" />
              <div className="mt-2 text-[11px] font-medium text-Text-Primary">
                Enter Manually
              </div>
              <div className="mt-1 text-[9px] leading-4 text-Text-Secondary">
                Add biomarkers by hand
              </div>
            </button>
          ) : null}
          <input
            type="file"
            ref={fileInputRef}
            accept={SUPPORTED_LAB_REPORT_FORMATS.map((ext) => `.${ext}`).join(
              ',',
            )}
            multiple
            disabled={isDemo || !showUploadZoneIdle}
            onChange={handleFileChange}
            id="uploadFileBoxes"
            className="w-full absolute invisible h-full left-0 top-0"
          />
          <div className="col-span-2 text-center text-[9px] text-Text-Quadruple">
            Accepted: .pdf, .doc, .docx, .png, .jpg, .jpeg, .webp
          </div>
        </div>
        <FileUploadProgressList uploadedFiles={mergedUploadedFiles} />
      </div>
    </div>
  );
};

export default FileHistoryNew;
