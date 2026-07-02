/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import Application from '../../../../api/app';
import { useParams } from 'react-router-dom';
import { publish, subscribe, unsubscribe } from '../../../../utils/event';
import FileUploadProgressList from './FileUploadProgressList';
import useIsDemo from '../../../../hooks/useIsDemo';
import {
  SUPPORTED_LAB_REPORT_FORMATS,
  useLabReportUpload,
} from '../../../../hooks/useLabReportUpload';
import ProgressLoading from '../../../RepoerAnalyse/UploadTestV2/ProgressLoading';
import {
  buildProcessLabReportPayloadFromStepOne,
  countReviewCategoriesFromStepOneData,
} from '../../../RepoerAnalyse/UploadTestV2/biomarkerReviewCompat';
import type { SuppressedBiomarkerItem } from '../../../RepoerAnalyse/UploadTestV2/biomarkerReviewCompat';
import { isAsyncProcessingEnabled } from '../../../../utils/asyncProcessing';

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
  const [inlineUploads, setInlineUploads] = useState<any[]>([]);
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
          setUploadedFiles(res.data);
        } else {
          throw new Error('Unexpected data format');
        }
      })
      .catch((err) => {
        if (requestSeq !== requestSeqRef.current) return;
        console.error(err);
      });
  }, []);

  useEffect(() => {
    if (id) {
      getFileList(id);
    }
  }, [id, isOpen, getFileList]);

  useEffect(() => {
    const handleSyncReport = () => {
      setInlineUploads((prev) =>
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
    const handleCompletedProgress = (data: any) => {
      if (data?.detail?.type === 'uploaded' && id) {
        const completedFileId = data?.detail?.file_id;
        if (completedFileId) {
          clearInflightUpload(id, completedFileId);
          setInlineUploads((prev) =>
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
      if (!fileId) return;
      let tempIdToRemove: string | undefined;
      setInlineUploads((prev) =>
        prev.map((fileUpload) =>
          fileUpload.file_id === fileId || fileUpload.upload_temp_id === fileId
            ? (() => {
                tempIdToRemove =
                  fileUpload.upload_temp_id || fileUpload.file_id;
                return {
                  ...fileUpload,
                  status: 'background',
                  uploadPhase: 'processing',
                  headerProcessing: true,
                  reviewHandoff: true,
                  progressBiomarker: 100,
                  process_done: false,
                };
              })()
            : fileUpload,
        ),
      );
      void tempIdToRemove;
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

  const updateInlineUpload = (tempId: string, patch: any) => {
    setInlineUploads((prev) =>
      prev.map((fileUpload) =>
        fileUpload.upload_temp_id === tempId || fileUpload.file_id === tempId
          ? { ...fileUpload, ...patch }
          : fileUpload,
      ),
    );
  };

  const removeInlineUpload = (tempId: string) => {
    setInlineUploads((prev) =>
      prev.filter((fileUpload) => fileUpload.upload_temp_id !== tempId),
    );
  };

  const uploadFiles = async (files: FileList | File[]) => {
    if (isDemo || !id) return;

    const selectedFiles = Array.from(files);
    for (const file of selectedFiles) {
      const tempId = `inline-${file.name}-${file.lastModified}-${Date.now()}`;
      setInlineUploads((prev) => [
        {
          file,
          file_id: tempId,
          upload_temp_id: tempId,
          file_name: file.name,
          date_uploaded: new Date().toISOString(),
          progress: 0.5,
          uploadedSize: 0,
          status: 'uploading',
          uploadPhase: 'uploading',
          progressBiomarker: 0,
          action_type: 'uploaded',
          process_done: false,
        },
        ...prev,
      ]);

      void uploadLabReportFile({
        memberId: id,
        file,
        publishProgressEvents: false,
        autoOpenReviewOnReady: false,
        onStateChange: (fileUpload) => {
          const isCompleted = fileUpload.status === 'completed';
          const isError = fileUpload.status === 'error';
          if (isCompleted && fileUpload.file_id) {
            // Upload reached add_lab_report (file is now on the server and OCR
            // is running). Persist it so a refresh during extraction reconnects.
            persistInflightUpload(id, {
              file_id: fileUpload.file_id,
              file_name: file.name,
              date_uploaded: new Date().toISOString(),
              addedAt: Date.now(),
            });
          }
          updateInlineUpload(tempId, {
            ...fileUpload,
            file_id: fileUpload.file_id || tempId,
            file_name: file.name,
            date_uploaded: new Date().toISOString(),
            action_type: 'uploaded',
            process_done: isError,
            status: isCompleted ? 'processing' : fileUpload.status,
            uploadPhase: isError
              ? 'failed'
              : isCompleted
                ? 'ocr_processing'
                : 'uploading',
            headerProcessing: isCompleted,
            progressBiomarker: isCompleted
              ? 50
              : Math.min(Math.round(fileUpload.progress || 0), 45),
          });
        },
        onComplete: () => {
          getFileList(id);
        },
      });
    }
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

  const activeInlineUpload = inlineUploads.find(
    (fileUpload) =>
      fileUpload.status === 'uploading' ||
      fileUpload.status === 'processing' ||
      fileUpload.status === 'success' ||
      fileUpload.status === 'error',
  );
  const activeProcessingUpload = inlineUploads.find(
    (fileUpload) =>
      fileUpload.status === 'processing' &&
      fileUpload.file_id &&
      !String(fileUpload.file_id).startsWith('inline-'),
  );
  const isInlineUploadBusy = Boolean(activeInlineUpload);
  const showInlineUploadSplash =
    activeInlineUpload?.status === 'uploading' ||
    activeInlineUpload?.status === 'processing' ||
    activeInlineUpload?.status === 'success';
  const activeInlineFileId =
    activeInlineUpload?.file_id &&
    !String(activeInlineUpload.file_id).startsWith('inline-')
      ? activeInlineUpload.file_id
      : null;
  const inlineFileIds = new Set(
    inlineUploads
      .map((fileUpload) => fileUpload.file_id)
      .filter((fileId) => fileId && !String(fileId).startsWith('inline-')),
  );
  const listInlineUploads = inlineUploads.filter(
    (fileUpload) =>
      fileUpload.status === 'success' || fileUpload.status === 'background',
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
    ...listInlineUploads.map(withReviewMeta),
    ...uploadedFiles
      .filter(
        (fileUpload) =>
          (!activeInlineFileId || fileUpload.file_id !== activeInlineFileId) &&
          !inlineFileIds.has(fileUpload.file_id),
      )
      .map(withReviewMeta),
  ];
  const inlineUploadPhase =
    activeInlineUpload?.uploadPhase === 'validating_review' ||
    activeInlineUpload?.uploadPhase === 'review_ready'
      ? 'processing'
      : activeInlineUpload?.uploadPhase ||
        (activeInlineUpload?.status === 'uploading'
          ? 'uploading'
          : 'processing');
  const inlineProgressMax =
    activeInlineUpload?.status === 'uploading'
      ? Math.min(Math.round(activeInlineUpload.progress || 0), 45)
      : typeof activeInlineUpload?.progressBiomarker === 'number'
        ? activeInlineUpload.progressBiomarker
        : 50;

  useEffect(() => {
    const fileId = activeProcessingUpload?.file_id;
    const tempId = activeProcessingUpload?.upload_temp_id;
    if (!fileId || !tempId || !id) return;

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

    const finishProcessing = () => {
      stopPolling();
      clearInflightUpload(id, fileId);
      removeInlineUpload(tempId);
      getFileList(id);
    };

    const applyStepOneData = async (data: any) => {
      if (data.error || data.lab_type === 'error') {
        updateInlineUpload(tempId, {
          status: 'error',
          uploadPhase: 'failed',
          process_done: true,
        });
        window.setTimeout(finishProcessing, 3000);
        return true;
      }

      const extractedCount = Array.isArray(data.extracted_biomarkers)
        ? data.extracted_biomarkers.length
        : undefined;
      if (extractedCount != null) {
        cacheFileReviewMeta(fileId, { extractedCount });
      }
      let uploadPhase = data.status || 'ocr_processing';

      if (
        uploadPhase === 'ocr_processing' &&
        extractedCount &&
        extractedCount > 0
      ) {
        uploadPhase = 'ocr_processing';
      } else if (
        uploadPhase === 'validating_review' ||
        uploadPhase === 'review_ready' ||
        (data.progress === 100 &&
          extractedCount &&
          extractedCount > 0 &&
          !data.validation?.ready)
      ) {
        uploadPhase = 'processing';
      }

      const reviewCounts = await syncReviewCountsForFile(fileId, data);

      updateInlineUpload(tempId, {
        uploadPhase,
        headerProcessing: true,
        progressBiomarker:
          data.progress ?? activeProcessingUpload.progressBiomarker,
        extractedCount: reviewCounts?.extracted ?? extractedCount,
        readyCount: reviewCounts?.ready,
        reviewCount: reviewCounts?.review,
        excludedCount: reviewCounts?.excluded,
        reviewCountsReady: Boolean(reviewCounts),
      });

      if (data.validation?.ready && extractedCount && extractedCount > 0) {
        // Flag review rows on the card so the user knows to fix them.
        // Auto-save still proceeds — ready rows are processed and review rows are
        // filtered by the backend pipeline (FIX D). This allows the ready portion
        // of the file to be saved immediately while giving the user a prompt to
        // open the modal and address the review rows afterward.
        if ((reviewCounts?.review ?? 0) > 0) {
          updateInlineUpload(tempId, { needsManualReview: true });
        }

        // Reconnect after refresh/navigation: this file was already saved
        // (modified biomarkers persisted server-side), so the compile is
        // already running/queued. Show status only and never re-submit
        // process_lab_report.
        if (
          data.is_edited === true &&
          !processLabReportInFlightRef.current.has(fileId)
        ) {
          processLabReportSucceededRef.current.add(fileId);
          // File is saved and now appears in the server file list, so the
          // list-based reconnect + global progress tracker take over.
          clearInflightUpload(id, fileId);
          updateInlineUpload(tempId, {
            status: 'background',
            uploadPhase: 'processing',
            headerProcessing: true,
            progressBiomarker: 100,
            process_done: false,
          });
          publish('checkProgress', {
            type: 'file',
            file_id: fileId,
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
        updateInlineUpload(tempId, {
          status: 'processing',
          uploadPhase: 'processing',
          headerProcessing: true,
          progressBiomarker: 100,
          process_done: false,
        });

        try {
          const suppressedItems = await getSuppressedItems();
          const payload = buildProcessLabReportPayloadFromStepOne({
            memberId: id,
            fileId,
            labType: data.lab_type || 'more_info',
            dateOfTest: data.date_of_test,
            data,
            suppressedItems,
          });

          const fireCompile = async (): Promise<string> => {
            const saveResponse = await Application.SaveLabReport(payload);
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
              action_type: 'uploaded',
              process_status: false,
            });
            return savedFileId;
          };

          void fireCompile()
            .then((savedFileId) => {
              updateInlineUpload(tempId, {
                file_id: savedFileId,
                status: 'background',
                uploadPhase: 'processing',
                headerProcessing: true,
                progressBiomarker: 100,
                process_done: false,
              });
              getFileList(id);
            })
            .catch((error) => {
              console.error('Background compile failed:', error);
              clearInflightUpload(id, fileId);
              updateInlineUpload(tempId, {
                status: 'error',
                uploadPhase: 'failed',
                process_done: true,
                errorMessage:
                  error?.response?.data?.detail ||
                  error?.response?.data?.message ||
                  error?.message ||
                  'Could not process this lab report. Please try another file.',
              });
            })
            .finally(() => {
              processLabReportInFlightRef.current.delete(fileId);
            });
          return true;
        } catch (error: any) {
          clearInflightUpload(id, fileId);
          updateInlineUpload(tempId, {
            status: 'error',
            uploadPhase: 'failed',
            process_done: true,
            errorMessage:
              error?.response?.data?.detail ||
              error?.response?.data?.message ||
              error?.message ||
              'Could not prepare lab report for processing.',
          });
          processLabReportInFlightRef.current.delete(fileId);
        }
        return true;
      }

      if (data.lab_type === 'ultrasound') {
        finishProcessing();
        return true;
      }

      return false;
    };

    const poll = async () => {
      if (isStopped) return;
      if (stepOnePollInFlightRef.current) return;
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

        if (errData?.extracted_biomarkers !== undefined) {
          const done = await applyStepOneData(errData);
          if (done) stopPolling();
        } else if (
          err?.response?.status === 504 ||
          err?.code === 'ECONNABORTED'
        ) {
          updateInlineUpload(tempId, {
            status: 'error',
            uploadPhase: 'failed',
            process_done: true,
          });
          window.setTimeout(finishProcessing, 3000);
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
    activeProcessingUpload?.file_id,
    activeProcessingUpload?.upload_temp_id,
    id,
    getFileList,
    cacheFileReviewMeta,
    getSuppressedItems,
    syncReviewCountsForFile,
    clearFileReviewMeta,
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
        fileUpload.file_id !== activeInlineFileId &&
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
    activeInlineFileId,
    fetchReviewMetaForFile,
    fileReviewMeta,
    isOpen,
    uploadedFiles,
  ]);

  // Reconnect to in-flight uploads after a refresh / navigation. The upload
  // and OCR continue server-side independently of the browser, but the inline
  // "processing" card state lives only in memory and is lost on unmount. Here
  // we rebuild that state from the server file list so the existing polling
  // loop re-attaches, shows current status, and (only if not yet saved)
  // triggers the existing compile - instead of the file appearing lost.
  useEffect(() => {
    if (!isOpen || !id || uploadedFiles.length === 0) return;

    const candidates = uploadedFiles.filter(
      (fileUpload) =>
        fileUpload?.file_id &&
        fileUpload.process_done !== true &&
        !reconnectAttemptedRef.current.has(fileUpload.file_id),
    );
    if (candidates.length === 0) return;

    candidates.forEach((fileUpload) =>
      reconnectAttemptedRef.current.add(fileUpload.file_id),
    );

    setInlineUploads((prev) => {
      const existingIds = new Set(prev.map((fileUpload) => fileUpload.file_id));
      const resumed = candidates
        .filter((fileUpload) => !existingIds.has(fileUpload.file_id))
        .map((fileUpload) => ({
          file: null,
          file_id: fileUpload.file_id,
          upload_temp_id: fileUpload.file_id,
          file_name: fileUpload.file_name,
          date_uploaded: fileUpload.date_uploaded || new Date().toISOString(),
          progress: 100,
          uploadedSize: 0,
          status: 'processing',
          uploadPhase: 'ocr_processing',
          progressBiomarker: 50,
          action_type: 'uploaded',
          process_done: false,
          reconnected: true,
        }));
      if (resumed.length === 0) return prev;
      return [...resumed, ...prev];
    });
  }, [isOpen, id, uploadedFiles]);

  // Reconnect to uploads interrupted during the OCR/extraction phase. These
  // files are NOT in get_list_lab_report yet (not saved), so we recover them
  // from localStorage and let the existing polling loop re-attach to
  // check_lab_report_step_one (which reports extraction progress).
  useEffect(() => {
    if (!id) return;
    const records = readInflightUploads(id);
    if (records.length === 0) return;

    const toSeed = records.filter(
      (record) =>
        record.file_id && !reconnectAttemptedRef.current.has(record.file_id),
    );
    if (toSeed.length === 0) return;

    toSeed.forEach((record) =>
      reconnectAttemptedRef.current.add(record.file_id),
    );

    setInlineUploads((prev) => {
      const existingIds = new Set(prev.map((fileUpload) => fileUpload.file_id));
      const resumed = toSeed
        .filter((record) => !existingIds.has(record.file_id))
        .map((record) => ({
          file: null,
          file_id: record.file_id,
          upload_temp_id: record.file_id,
          file_name: record.file_name,
          date_uploaded: record.date_uploaded || new Date().toISOString(),
          progress: 100,
          uploadedSize: 0,
          status: 'processing',
          uploadPhase: 'ocr_processing',
          progressBiomarker: 10,
          action_type: 'uploaded',
          process_done: false,
          reconnected: true,
        }));
      if (resumed.length === 0) return prev;
      return [...resumed, ...prev];
    });
  }, [id]);

  return (
    <div className="w-full relative">
      <div className="w-full">
        <div className="mb-3 grid grid-cols-2 gap-2 rounded-2xl border border-Gray-50 bg-white p-3 shadow-200">
          <div
            onDragEnter={(event) => {
              event.preventDefault();
              if (!isDemo && !isInlineUploadBusy) setIsDragging(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              if (!isDemo && !isInlineUploadBusy) setIsDragging(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setIsDragging(false);
            }}
            onDrop={(event) => {
              if (isInlineUploadBusy) {
                event.preventDefault();
                return;
              }
              handleDrop(event);
            }}
            onClick={() => {
              if (isDemo || isInlineUploadBusy) return;
              fileInputRef.current?.click();
            }}
            title={
              isDemo
                ? 'Demo version cannot add or edit data. Upgrade for full access.'
                : undefined
            }
            className={`relative overflow-hidden flex flex-col items-center justify-center rounded-2xl border bg-white text-center shadow-100 transition-colors ${
              isInlineUploadBusy
                ? 'col-span-2 min-h-0 border-Primary-DeepTeal bg-[#F6FAFB] px-4 py-4'
                : 'min-h-[112px] border-dashed border-Gray-50 px-3 py-3'
            } ${
              isDemo
                ? 'cursor-not-allowed opacity-60'
                : isInlineUploadBusy
                  ? 'cursor-wait'
                  : 'cursor-pointer hover:border-Primary-DeepTeal'
            } ${isDragging ? 'border-Primary-DeepTeal bg-[#F6FAFB]' : ''}`}
          >
            {showInlineUploadSplash ? (
              <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-2xl">
                <div className="h-full w-1/2 animate-[progressShimmer_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-Primary-EmeraldGreen/20 to-transparent" />
              </div>
            ) : null}
            <div className="relative z-[1] flex w-full flex-col items-center justify-center">
              {isInlineUploadBusy && activeInlineUpload?.status === 'error' ? (
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
                    {activeInlineUpload.errorMessage ||
                      'This file could not be uploaded. Please try another file.'}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      removeInlineUpload(
                        activeInlineUpload.upload_temp_id ||
                          activeInlineUpload.file_id,
                      )
                    }
                    className="mt-1 rounded-full border border-Gray-50 bg-white px-3 py-1.5 text-[10px] font-medium text-Primary-DeepTeal shadow-100 hover:bg-backgroundColor-Main"
                  >
                    Try another file
                  </button>
                </div>
              ) : isInlineUploadBusy &&
                activeInlineUpload?.status === 'success' ? (
                <div className="flex w-full flex-col items-center justify-center gap-2 py-4 text-center">
                  <div className="flex size-11 items-center justify-center rounded-full bg-Primary-EmeraldGreen/15">
                    <img
                      src="/icons/tick-circle-green-new.svg"
                      alt=""
                      className="size-7"
                    />
                  </div>
                  <div className="text-[12px] font-semibold text-Primary-DeepTeal">
                    Upload successful
                  </div>
                  <div className="text-[10px] leading-4 text-Text-Quadruple">
                    Biomarkers are ready for review.
                  </div>
                </div>
              ) : isInlineUploadBusy && activeInlineUpload ? (
                <ProgressLoading
                  maxProgress={inlineProgressMax}
                  phase={inlineUploadPhase}
                  readyCount={activeInlineUpload.readyCount}
                  reviewCount={activeInlineUpload.reviewCount}
                  excludedCount={activeInlineUpload.excludedCount}
                  headerProcessing={Boolean(
                    activeInlineUpload.headerProcessing,
                  )}
                  compact
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
          {!isInlineUploadBusy ? (
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
            disabled={isDemo || isInlineUploadBusy}
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
