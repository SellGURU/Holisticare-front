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
  buildProcessLabReportPayload,
  countReviewCategoriesFromStepOneData,
} from '../../../RepoerAnalyse/UploadTestV2/biomarkerReviewCompat';
import type { SuppressedBiomarkerItem } from '../../../RepoerAnalyse/UploadTestV2/biomarkerReviewCompat';

const STEP_ONE_POLL_INTERVAL_MS = 10000;

type FileReviewMeta = {
  extractedCount?: number;
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
  const [isDragging, setIsDragging] = useState(false);
  const { id } = useParams<{ id: string }>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const requestSeqRef = useRef(0);
  const stepOnePollInFlightRef = useRef(false);
  const suppressedItemsRef = useRef<SuppressedBiomarkerItem[] | null>(null);
  const reviewMetaFetchInFlightRef = useRef<Set<string>>(new Set());
  const processLabReportInFlightRef = useRef<Set<string>>(new Set());
  const processLabReportSucceededRef = useRef<Set<string>>(new Set());

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
    const meta = fileUpload?.file_id
      ? fileReviewMeta[fileUpload.file_id]
      : null;
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

    let intervalId: number;
    let isStopped = false;

    const stopPolling = () => {
      isStopped = true;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };

    const finishProcessing = () => {
      stopPolling();
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

      const reviewCounts =
        data.validation?.ready && extractedCount
          ? countReviewCategoriesFromStepOneData(
              data,
              await getSuppressedItems(),
            )
          : null;
      if (reviewCounts) {
        cacheFileReviewMeta(fileId, {
          extractedCount: reviewCounts.extracted,
          reviewCount: reviewCounts.review,
          excludedCount: reviewCounts.excluded,
          reviewCountsReady: true,
        });
      }

      updateInlineUpload(tempId, {
        uploadPhase,
        headerProcessing: true,
        progressBiomarker:
          data.progress ?? activeProcessingUpload.progressBiomarker,
        extractedCount: reviewCounts?.extracted ?? extractedCount,
        reviewCount: reviewCounts?.review,
        excludedCount: reviewCounts?.excluded,
        reviewCountsReady: Boolean(reviewCounts),
      });

      if (data.validation?.ready && extractedCount && extractedCount > 0) {
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
          const saveResponse = await Application.SaveLabReport(
            buildProcessLabReportPayload({
              memberId: id,
              fileId,
              labType: data.lab_type || 'more_info',
              rows: data.extracted_biomarkers,
              dateOfTest: data.date_of_test,
            }),
          );
          const savedFileId =
            saveResponse?.data?.modified_biomarkers_file_id ||
            saveResponse?.data?.added_biomarkers_file_id ||
            fileId;

          processLabReportSucceededRef.current.add(fileId);
          if (savedFileId !== fileId) {
            processLabReportSucceededRef.current.add(savedFileId);
            if (reviewCounts) {
              cacheFileReviewMeta(savedFileId, {
                extractedCount: reviewCounts.extracted,
                reviewCount: reviewCounts.review,
                excludedCount: reviewCounts.excluded,
                reviewCountsReady: true,
              });
            }
          }
          publish('checkProgress', {
            type: 'file',
            file_id: savedFileId,
            action_type: 'uploaded',
            process_status: false,
          });
          updateInlineUpload(tempId, {
            file_id: savedFileId,
            status: 'background',
            uploadPhase: 'processing',
            headerProcessing: true,
            progressBiomarker: 100,
            process_done: false,
          });
          getFileList(id);
        } catch (error: any) {
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
        } finally {
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
    intervalId = window.setInterval(() => {
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

        if (data.validation?.ready && extractedCount) {
          const reviewCounts = countReviewCategoriesFromStepOneData(
            data,
            await getSuppressedItems(),
          );
          cacheFileReviewMeta(fileId, {
            extractedCount: reviewCounts.extracted,
            reviewCount: reviewCounts.review,
            excludedCount: reviewCounts.excluded,
            reviewCountsReady: true,
          });
        }
      } catch {
        // File cards can render without counts if historical review data is unavailable.
      } finally {
        reviewMetaFetchInFlightRef.current.delete(fileId);
      }
    },
    [cacheFileReviewMeta, fileReviewMeta, getSuppressedItems],
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
                  extractedCount={activeInlineUpload.extractedCount}
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
