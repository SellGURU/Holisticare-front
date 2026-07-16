/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useRef, useState } from 'react';
import Application from '../../../api/app';
// import { uploadToAzure } from '../../../help';
import { publish, subscribe, unsubscribe } from '../../../utils/event';
import {
  isAsyncProcessingEnabled,
  progressEventMatchesMember,
} from '../../../utils/asyncProcessing';
import { isManualLabEntry } from '../../../utils/manualEntry';
import { ButtonSecondary } from '../../Button/ButtosSecondary';
import Circleloader from '../../CircleLoader';
import UploadPModal from './UploadPModal';
import useIsDemo from '../../../hooks/useIsDemo';
import { useLabReportUpload } from '../../../hooks/useLabReportUpload';
import {
  collectMappingNameVariations,
  enrichBiomarkerNameFieldsOnLoad,
  ensureUniqueBiomarkerIds,
  pinBiomarkerNameFields,
} from './biomarkerNameFields';
import {
  buildBiomarkerRowsForValidation,
  mapChartBoundsToReviewCatalog,
  reviewRowErrorKey,
  categorizeReviewRow,
  filterPersistedReviewFindingItems,
  inferRowBiomarkerType,
  inferReviewReasonFromErrorText,
  isPhantomSuppressedRow,
} from './biomarkerReviewCompat';
import BiomarkersApi from '../../../api/Biomarkers';
import { showError, showSuccess } from '../../GlobalToast';
import { ReviewFinding } from './ReviewFindingsPanel';
import {
  buildSnapshotMeta,
  completeLabUnitRequest,
  computeSnapshotAgeVsOnChange,
  createLabUnitRequest,
  getLabUnitDebugContext,
  logLabUnitDebug,
  logRowErrorsMutation,
  setLabUnitDebugContext,
  summarizeContextBiomarkers,
  summarizeStepOneResponse,
  type LabUnitRequestMeta,
  type LabUnitSnapshotMeta,
} from '../../../utils/labUnitDebug';
// import SpinnerLoader from '../../SpinnerLoader';

// interface FileUpload {
//   file: File;
//   file_id: string;
//   progress: number;
//   status: 'uploading' | 'completed' | 'error';
//   azureUrl?: string;
//   uploadedSize?: number;
//   errorMessage?: string;
//   warning?: boolean;
//   showReport?: boolean;
// }

const preferNonEmpty = (...values: any[]) => {
  const found = values.find(
    (value) =>
      value !== undefined && value !== null && String(value).trim() !== '',
  );
  return found ?? '';
};

const stringifyLabField = (value: unknown) => {
  if (value === undefined || value === null) return '';
  return String(value);
};

const inferBiomarkerTypeFromLabType = (labType?: string) => {
  const normalized = String(labType || '')
    .trim()
    .toLowerCase();
  if (normalized === 'gut') return 'gut';
  if (normalized === 'dna') return 'dna';
  return 'blood';
};

const enrichExtractedRowForReview = (row: any, labType?: string) => {
  const withNames = enrichBiomarkerNameFieldsOnLoad(row);
  return {
    ...withNames,
    biomarker_type:
      withNames.biomarker_type ||
      inferRowBiomarkerType(withNames) ||
      inferBiomarkerTypeFromLabType(labType),
    original_value: preferNonEmpty(withNames.original_value, withNames.value),
    original_unit:
      withNames.original_unit !== undefined
        ? withNames.original_unit
        : withNames.unit,
  };
};

const sortReviewBiomarkerRows = (rows: any[]) =>
  rows.slice().sort((a: any, b: any) => {
    const nameA = (a.original_biomarker_name || a.biomarker || '').toString();
    const nameB = (b.original_biomarker_name || b.biomarker || '').toString();
    return nameA.localeCompare(nameB, undefined, {
      sensitivity: 'base',
    });
  });

const formatProgressFromDate = (date: Date): string => {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

interface UploadTestProps {
  memberId: any;
  onGenderate: (
    file_id: string | undefined,
    options?: { silent?: boolean },
  ) => void;
  isShare?: boolean;
  showReport: boolean;
  onDiscard: () => void;
  questionnaires: any[];
  has_wearable_data: boolean;
  isLoadingQuestionnaires: boolean;
}

export const UploadTestV2: React.FC<UploadTestProps> = ({
  memberId,
  onGenderate,
  isShare,
  showReport,
  onDiscard,
  questionnaires,
  has_wearable_data,
  isLoadingQuestionnaires,
}) => {
  const isDemo = useIsDemo();
  const { uploadLabReportFile } = useLabReportUpload();
  const fileInputRef = useRef<any>(null);
  const [step, setstep] = useState(0);
  const [initialLabMenu, setInitialLabMenu] = useState('Upload File');
  const [isTrueEditMode, setIsTrueEditMode] = useState(false);
  const [labOverlayMode, setLabOverlayMode] = useState<string | null>(null);
  // const [activeMenu, setactiveMenu] = useState('Upload File');
  const [uploadedFile, setUploadedFile] = useState<FileUpload | null>(null); // ✅ single file
  const [errorMessage] = useState<string>('');
  const [, setQuestionaryLength] = useState(false);

  const [extractedBiomarkers, setExtractedBiomarkers] = useState<any[]>([]);
  const [fileType, setfileType] = useState('more_info');
  const [polling, setPolling] = useState(true); // ✅ control polling
  const [deleteLoading] = useState(false);
  const [isSaveClicked, setisSaveClicked] = useState(false);
  const [uploadPhase, setUploadPhase] = useState('uploading');
  const [reviewSummary, setReviewSummary] = useState<any>(null);
  const [reviewFindings, setReviewFindings] = useState<ReviewFinding[]>([]);
  const [reviewFindingsLoading, setReviewFindingsLoading] = useState(false);
  // console.log(extractedBiomarkers);
  const [isUploadFromComboBar, setIsUploadFromComboBar] = useState(false);
  const stepOnePollInFlightRef = useRef(false);
  const isMountedRef = useRef(true);
  const skipExtractionProgressRef = useRef(false);
  const [reopeningExistingFile, setReopeningExistingFile] = useState(false);
  const backendRowErrorsRef = useRef<Record<string, string>>({});
  const backendRowErrorsMetaRef = useRef<LabUnitSnapshotMeta | null>(null);
  const contextBiomarkersMetaRef = useRef<LabUnitSnapshotMeta | null>(null);
  const pollingRef = useRef(polling);
  const currentStepOneRequestRef = useRef<LabUnitRequestMeta | null>(null);
  const autoSaveFileRef = useRef<string | null>(null);
  const reviewHydratedFileRef = useRef<string | null>(null);
  const [reviewHydrating, setReviewHydrating] = useState(false);
  const [compileState, setCompileState] = useState<
    'idle' | 'saving' | 'done' | 'error'
  >('idle');
  const [lastSavedFileId, setLastSavedFileId] = useState<string | undefined>();
  const autoSavedMappingKeysRef = useRef<Set<string>>(new Set());
  const wasBackgroundProcessingRef = useRef(false);
  const pendingProcessingFileIdRef = useRef<string | undefined>();
  const autoContinueTriggeredRef = useRef(false);
  const stepRef = useRef(step);
  const hasComboBarFileRef = useRef(false);
  const lastSavedFileIdRef = useRef<string | undefined>();
  const compileStateRef = useRef(compileState);
  const uploadedFileRef = useRef(uploadedFile);
  const extractedBiomarkersRef = useRef(extractedBiomarkers);
  const fileTypeRef = useRef(fileType);
  stepRef.current = step;
  lastSavedFileIdRef.current = lastSavedFileId;
  compileStateRef.current = compileState;
  uploadedFileRef.current = uploadedFile;
  extractedBiomarkersRef.current = extractedBiomarkers;
  fileTypeRef.current = fileType;

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    pollingRef.current = polling;
    setLabUnitDebugContext({
      polling,
      isTrueEditMode,
      reopeningExistingFile,
      stepOnePollInFlight: stepOnePollInFlightRef.current,
    });
  }, [polling, isTrueEditMode, reopeningExistingFile]);
  useEffect(() => {
    subscribe('uploadTestShow-stepTwo', (data: any) => {
      if (isDemo) return;
      const editFileId = data?.detail?.file_id;
      const fileName = data?.detail?.file_name || '';
      const mode = data?.detail?.mode;
      const isManualEdit =
        mode === 'edit_manual' ||
        (Boolean(editFileId) &&
          isManualLabEntry({ file_name: fileName, name: fileName }));
      setIsUploadFromComboBar(true);
      setLabOverlayMode(mode || (editFileId ? 'edit' : null));
      // Manual Entry edit: keep file_id for save, but never open file-review UI.
      if (editFileId && isManualEdit) {
        skipExtractionProgressRef.current = true;
        setReopeningExistingFile(true);
        setIsTrueEditMode(true);
        reviewHydratedFileRef.current = null;
        setReviewHydrating(false);
        setstep(1);
        setInitialLabMenu('Add Biomarker');
        setExtractedBiomarkers([]);
        setAddedBiomarkers([]);
        setRowErrors({});
        setAddedRowErrors({});
        setReviewSummary(null);
        setUploadPhase('review_ready');
        setProgressBiomarkerUpload(100);
        setExtractedCount(undefined);
        setbiomarkerLoading(true);
        setUploadedFile({
          file_id: editFileId,
          file: new File([], fileName || 'Manual Entry'),
          progress: 1,
          status: 'completed',
        });
        setPolling(true);
      } else if (editFileId) {
        // Existing uploaded-file edit / inline review — unchanged.
        const isInlineReviewReady = mode === 'review_ready';
        skipExtractionProgressRef.current = !isInlineReviewReady;
        setReopeningExistingFile(!isInlineReviewReady);
        setIsTrueEditMode(!isInlineReviewReady);
        reviewHydratedFileRef.current = null;
        setReviewHydrating(!isInlineReviewReady);
        setstep(1);
        setInitialLabMenu('Upload File');
        setExtractedBiomarkers([]);
        setRowErrors({});
        setAddedRowErrors({});
        setReviewSummary(null);
        setUploadPhase('review_ready');
        setProgressBiomarkerUpload(100);
        setExtractedCount(undefined);
        setbiomarkerLoading(true);
        setUploadedFile({
          file_id: editFileId,
          file: new File([], fileName),
          progress: 1,
          status: 'completed',
        });
        setPolling(true);
      } else if (mode === 'manual') {
        skipExtractionProgressRef.current = false;
        setReopeningExistingFile(false);
        setIsTrueEditMode(false);
        setInitialLabMenu('Add Biomarker');
        setUploadedFile(null);
        setExtractedBiomarkers([]);
        setRowErrors({});
        setAddedRowErrors({});
        setReviewSummary(null);
        setUploadPhase('review_ready');
        setbiomarkerLoading(false);
        setstep(1);
      } else {
        // New file uploads are handled inline in the ComboBar.
        return;
      }
    });
  }, [isDemo]);
  const [biomarkerLoading, setbiomarkerLoading] = useState(false);
  const [progressBiomarkerUpload, setProgressBiomarkerUpload] = useState(0);
  const [extractedCount, setExtractedCount] = useState<number | undefined>();
  const [suppressedSet, setSuppressedSet] = useState<Set<string>>(new Set());
  const [recheckLoading, setRecheckLoading] = useState(false);
  const [hasComboBarFile, setHasComboBarFile] = useState(false);
  const [dirtyBiomarkerIds, setDirtyBiomarkerIds] = useState<string[]>([]);
  hasComboBarFileRef.current = hasComboBarFile;

  useEffect(() => {
    const handleCheckProgress = (data: any) => {
      if (data?.detail?.type === 'file') {
        setHasComboBarFile(true);
      }
    };
    const handleSyncReport = () => {
      setHasComboBarFile(true);
    };
    subscribe('checkProgress', handleCheckProgress);
    subscribe('syncReport', handleSyncReport);
    return () => {
      unsubscribe('checkProgress', handleCheckProgress);
      unsubscribe('syncReport', handleSyncReport);
    };
  }, []);

  useEffect(() => {
    const activeFileId = uploadedFile?.file_id;
    if (!activeFileId) return;

    let intervalId: NodeJS.Timeout;
    const showReviewLoading = () =>
      new Promise((resolve) => setTimeout(resolve, 900));

    const processStepOneData = async (data: any) => {
      setProgressBiomarkerUpload(data.progress);
      setfileType(data.lab_type || 'more_info');
      if (!skipExtractionProgressRef.current) {
        setUploadPhase(data.status || 'ocr_processing');
      }
      setReviewSummary(data.summary || null);
      setUploadedFile((prev) =>
        prev
          ? {
              ...prev,
              warning: Boolean(data.warning),
            }
          : prev,
      );
      if (data.date_of_test) {
        setModifiedDateOfTest(new Date(data.date_of_test));
      }

      if (
        Array.isArray(data.extracted_biomarkers) &&
        data.extracted_biomarkers.length > 0
      ) {
        setExtractedCount(data.extracted_biomarkers.length);
      }

      // Terminal extraction error — stop polling and surface a readable error
      // so the user isn't stuck on an endless spinner.
      if (data.lab_type === 'error' || data.error) {
        setPolling(false);
        setbiomarkerLoading(false);
        setExtractedBiomarkers([]);
        setUploadPhase('failed');
        setUploadedFile((prev) =>
          prev
            ? {
                ...prev,
                status: 'error',
                errorMessage:
                  data.error ||
                  'Failed to extract biomarkers from this file. Please try a different file.',
              }
            : prev,
        );
        return;
      }

      // Background validation still running — keep polling unless reopening an existing file.
      const reopenExistingFile =
        skipExtractionProgressRef.current || Boolean(data.is_edited);
      if (
        !reopenExistingFile &&
        (data.status === 'validating_review' ||
          (data.progress === 100 &&
            data.extracted_biomarkers?.length > 0 &&
            !data.validation?.ready))
      ) {
        setUploadPhase('validating_review');
        setbiomarkerLoading(true);
        return;
      }

      // Handle ultrasound reports — skip biomarkers table
      if (data.lab_type === 'ultrasound') {
        setPolling(false);
        setbiomarkerLoading(false);
        setisSaveClicked(true);
        setExtractedBiomarkers([]);
        setUploadPhase('review_ready');
        return;
      }

      // Keep backend row order for validation indices; sort only for display.
      // Enforce unique biomarker ids so rows sharing a base name don't collide.
      const enrichedRows = ensureUniqueBiomarkerIds(
        (data.extracted_biomarkers || []).map((b: any) =>
          enrichExtractedRowForReview(b, data.lab_type),
        ),
      );

      // Show biomarkers once validation is ready, or immediately when editing/reopening.
      if (
        data.extracted_biomarkers &&
        data.extracted_biomarkers.length > 0 &&
        (data.validation?.ready || reopenExistingFile)
      ) {
        if (data.validation?.ready) {
          setPolling(false);
          skipExtractionProgressRef.current = false;
          setReopeningExistingFile(false);
        } else if (reopenExistingFile) {
          // Edited/reopened reports don't need ongoing step-one polling; it was
          // resetting rowErrors to {} every interval and making counts jump.
          setPolling(false);
          skipExtractionProgressRef.current = false;
          setReopeningExistingFile(false);
        }

        if (!reopenExistingFile && data.validation?.ready) {
          setUploadPhase('validating_review');
          setbiomarkerLoading(true);
          await showReviewLoading();
        }

        if (data.validation?.ready) {
          const errorMaps = buildValidationErrorsMaps(
            data.validation,
            enrichedRows,
            addedBiomarkers,
          );
          backendRowErrorsRef.current = errorMaps.modifiedErrors;
          const stepOneCompleted = currentStepOneRequestRef.current;
          if (stepOneCompleted) {
            backendRowErrorsMetaRef.current = buildSnapshotMeta(
              stepOneCompleted,
              enrichedRows,
            );
          }
          logRowErrorsMutation('set', {
            source: 'step-one-poll',
            request_id: stepOneCompleted?.request_id,
            fetched_at: stepOneCompleted?.fetched_at,
            error_count: Object.keys(errorMaps.modifiedErrors).length,
            error_keys: Object.keys(errorMaps.modifiedErrors),
            raw_step_one: summarizeStepOneResponse(data),
            polling: pollingRef.current,
          });
          setRowErrors(errorMaps.modifiedErrors);
          setAddedRowErrors(errorMaps.addedErrors);
        } else if (!reopenExistingFile) {
          backendRowErrorsRef.current = {};
          backendRowErrorsMetaRef.current = null;
          logRowErrorsMutation('clear', {
            source: 'step-one-poll',
            request_id: currentStepOneRequestRef.current?.request_id,
            reason: 'validation_not_ready_non_reopen',
          });
          setRowErrors({});
          setAddedRowErrors({});
        }

        const displayRows = sortReviewBiomarkerRows(enrichedRows);
        contextBiomarkersMetaRef.current = currentStepOneRequestRef.current
          ? buildSnapshotMeta(currentStepOneRequestRef.current, displayRows)
          : null;
        setExtractedBiomarkers(displayRows);
        setUploadPhase(
          reopenExistingFile && !data.validation?.ready
            ? 'review_ready'
            : data.status || 'review_ready',
        );

        const shouldHydrateFindings =
          activeFileId &&
          (reopenExistingFile || data.validation?.ready) &&
          reviewHydratedFileRef.current !== activeFileId;
        if (shouldHydrateFindings) {
          setReviewHydrating(true);
          try {
            await loadReviewFindings(
              activeFileId,
              backendRowErrorsRef.current,
              displayRows,
            );
            reviewHydratedFileRef.current = activeFileId;
          } finally {
            if (isMountedRef.current) setReviewHydrating(false);
          }
        }

        setbiomarkerLoading(false);
        if (data.is_edited) {
          setisSaveClicked(false);
        }
      }
    };

    const fetchData = async () => {
      if (stepOnePollInFlightRef.current) return;
      stepOnePollInFlightRef.current = true;
      setLabUnitDebugContext({ stepOnePollInFlight: true });
      const req = createLabUnitRequest('step-one-poll');
      logLabUnitDebug('step-one-poll:send', {
        request_id: req.request_id,
        file_id: activeFileId,
        polling: pollingRef.current,
      });
      if (!skipExtractionProgressRef.current) {
        setbiomarkerLoading(true);
      }
      try {
        const res = await Application.checkLabStepOne({
          file_id: activeFileId,
        });
        currentStepOneRequestRef.current = completeLabUnitRequest(req, {
          raw_step_one: summarizeStepOneResponse(res.data),
          polling_at_receive: pollingRef.current,
          will_stop_polling_hint:
            Boolean(res.data?.validation?.ready) ||
            skipExtractionProgressRef.current ||
            Boolean(res.data?.is_edited),
        });
        await processStepOneData(res.data);
      } catch (err: any) {
        // Backward-compatibility for older backend builds that still return 206
        // for non-template warnings. The response body still contains valid
        // biomarker data, so process it normally.
        const errData =
          err?.extracted_biomarkers !== undefined
            ? err // interceptor threw the body directly
            : (err?.response?.data ?? null); // standard axios error shape

        if (errData && errData.extracted_biomarkers !== undefined) {
          currentStepOneRequestRef.current = completeLabUnitRequest(req, {
            raw_step_one: summarizeStepOneResponse(errData),
            polling_at_receive: pollingRef.current,
            via_error_path: true,
          });
          await processStepOneData(errData);
        } else if (
          err?.response?.status === 504 ||
          err?.code === 'ECONNABORTED'
        ) {
          setPolling(false);
          setbiomarkerLoading(false);
          setUploadPhase('failed');
          setUploadedFile((prev) =>
            prev
              ? {
                  ...prev,
                  status: 'error',
                  errorMessage:
                    'Lab review validation timed out. Please refresh and try again, or contact support if this persists.',
                }
              : prev,
          );
        } else {
          console.error('Error checking lab step one:', err);
        }
      } finally {
        stepOnePollInFlightRef.current = false;
        setLabUnitDebugContext({ stepOnePollInFlight: false });
      }
    };

    if (polling) {
      fetchData(); // run immediately first
      intervalId = setInterval(fetchData, 10000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId); // cleanup
      stepOnePollInFlightRef.current = false;
    };
  }, [uploadedFile?.file_id, polling]);
  useEffect(() => {
    subscribe('questionaryLength', (value: any) => {
      setQuestionaryLength(value.detail.questionaryLength);
    });
  }, []);

  const formatFileSize = (bytes: number): string => {
    const kb = bytes / 1024;
    return `${kb.toFixed(1)} KB`;
  };

  const [, forceReRender] = useState(0);

  const handleDeleteFile = (fileId?: string) => {
    if (isDemo) return;
    skipExtractionProgressRef.current = false;
    setReopeningExistingFile(false);
    setExtractedBiomarkers([]);
    setfileType('more_info');
    setPolling(true);
    setUploadedFile(null);
    setRowErrors({});
    setAddedRowErrors({});
    setReviewSummary(null);
    setUploadPhase('uploading');
    publish('RESET_MAPPING_ROWS', {});
    setbiomarkerLoading(false);
    setModifiedDateOfTest(new Date());
    forceReRender((x) => x + 1);
    Application.deleteFileHistory({
      file_id: fileId,
      member_id: memberId,
    }).catch(() => {});
  };
  useEffect(() => {
    subscribe('DELETE_FILE_TRIGGER', () => {
      // alert('delete file trigger');
      handleDeleteFile();
    });
  }, []);

  const handleDownloadFile = () => {
    if (!uploadedFile?.file_id) return;
    Application.downloadFille({
      file_id: uploadedFile.file_id,
      member_id: memberId,
    })
      .then((res) => {
        const payload = res?.data;
        if (typeof payload === 'string') {
          window.open(payload, '_blank');
          return;
        }
        const maybeUrl = payload?.data;
        if (typeof maybeUrl === 'string') {
          window.open(maybeUrl, '_blank');
        }
      })
      .catch((err) => console.error('Download failed', err));
  };
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isDemo) return;
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];

      // Validation passed: proceed with upload
      skipExtractionProgressRef.current = false;
      setReopeningExistingFile(false);
      setIsTrueEditMode(false);
      setPolling(true);
      setReviewSummary(null);
      setExtractedBiomarkers([]);
      setRowErrors({});
      setAddedRowErrors({});
      setUploadPhase('uploading');
      setbiomarkerLoading(true);

      await uploadLabReportFile({
        memberId,
        file,
        onStateChange: (fileUpload) => {
          setUploadedFile(fileUpload);
          if (fileUpload.status === 'error') {
            setUploadPhase('failed');
            setbiomarkerLoading(false);
          }
        },
      });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const [addedBiomarkers, setAddedBiomarkers] = useState<
    { biomarker: string; value: string; unit: string }[]
  >([]);

  // State and handlers for adding/deleting biomarkers
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const handleAddBiomarker = (newBiomarker: {
    biomarker: string;
    value: string;
    unit: string;
  }) => {
    if (isDemo) return;
    setAddedBiomarkers([...addedBiomarkers, newBiomarker]);
  };

  const handleTrashClick = (index: number) => {
    if (isDemo) return;
    setDeleteIndex(index);
  };

  const handleConfirm = (indexToDelete: number) => {
    if (isDemo) return;
    // 1. Update added biomarkers
    setAddedBiomarkers((prev) => prev.filter((_, i) => i !== indexToDelete));

    // 2. Update added row errors (delete + shift)
    setAddedRowErrors((prev) => {
      if (!prev) return prev;

      const newErrors: Record<number, string> = {};
      Object.keys(prev).forEach((key) => {
        const idx = Number(key);
        if (idx < indexToDelete) {
          newErrors[idx] = prev[idx]; // keep errors before deleted row
        } else if (idx > indexToDelete) {
          newErrors[idx - 1] = prev[idx]; // shift errors after deleted row
        }
      });
      return newErrors;
    });

    // 3. Reset delete index
    setDeleteIndex(null);
  };

  const handleCancel = () => {
    setDeleteIndex(null);
  };

  const [modifiedDateOfTest, setModifiedDateOfTest] = useState<Date | null>(
    new Date(),
  );
  const handleModifiedDateOfTestChange = (date: Date | null) => {
    setModifiedDateOfTest(date);
  };

  // Date for the manually added biomarkers
  const [addedDateOfTest, setAddedDateOfTest] = useState<Date | null>(
    new Date(),
  );
  const handleAddedDateOfTestChange = (date: Date | null) => {
    setAddedDateOfTest(date);
  };

  const shouldBulkAutoSaveMappings = () =>
    !isTrueEditMode && !reopeningExistingFile;

  const handleSaveLabReport = async (
    rowsOverride?: any[],
    options?: {
      skipAddedBiomarkers?: boolean;
      skipAutoSaveMappings?: boolean;
      labTypeOverride?: string;
    },
  ) => {
    if (isDemo) {
      throw new Error('Demo version cannot add or edit data.');
    }
    const effectiveLabType = options?.labTypeOverride || fileType;
    const rawBiomarkerSource = rowsOverride ?? extractedBiomarkers;
    const biomarkerSource = buildBiomarkerRowsForValidation(
      rawBiomarkerSource,
      effectiveLabType,
    ).map((resolved, index) => ({
      ...(rawBiomarkerSource[index] || {}),
      ...resolved,
    }));
    const skipAdded = Boolean(options?.skipAddedBiomarkers);
    const skipAutoSave = Boolean(options?.skipAutoSaveMappings);
    // ✅ For ultrasound reports, call API with empty lists
    if (effectiveLabType === 'ultrasound') {
      const modifiedTimestamp = modifiedDateOfTest
        ? Date.UTC(
            modifiedDateOfTest.getFullYear(),
            modifiedDateOfTest.getMonth(),
            modifiedDateOfTest.getDate(),
          ).toString()
        : null;

      return Application.SaveLabReport({
        member_id: memberId,
        modified_biomarkers: {
          biomarkers_list: [], // Empty list for ultrasound
          date_of_test: modifiedTimestamp,
          lab_type: 'ultrasound',
          file_id: uploadedFile?.file_id || '',
        },
        added_biomarkers: {
          biomarkers_list: [],
          date_of_test: modifiedTimestamp,
          lab_type: 'more_info',
        },
      });
    }

    const modifiedTimestamp = modifiedDateOfTest
      ? Date.UTC(
          modifiedDateOfTest.getFullYear(),
          modifiedDateOfTest.getMonth(),
          modifiedDateOfTest.getDate(),
        ).toString()
      : null;
    const addedTimestamp = addedDateOfTest
      ? Date.UTC(
          addedDateOfTest.getFullYear(),
          addedDateOfTest.getMonth(),
          addedDateOfTest.getDate(),
        ).toString()
      : null;

    // Map over all extractedBiomarkers to create the required API structure
    const mappedExtractedBiomarkers = biomarkerSource.map((b) => {
      const value = stringifyLabField(
        preferNonEmpty(b.original_value, b.value),
      );
      const unit = stringifyLabField(preferNonEmpty(b.original_unit, b.unit));
      return {
        biomarker_id: stringifyLabField(b.biomarker_id),
        biomarker: stringifyLabField(b.biomarker),
        biomarker_type: stringifyLabField(b.biomarker_type || 'blood'),
        original_biomarker_name: stringifyLabField(b.original_biomarker_name),
        original_value: value,
        original_unit: unit,
        value,
        unit,
        'sub-value': b['sub-value'],
        header_1: b['header_1'],
        more_info: b['more_info'],
        list_of_genes: b['list_of_genes'],
        your_result: b['your_result'],
        validation_status: stringifyLabField(b.validation_status || 'ready'),
      };
    });

    if (!skipAutoSave && shouldBulkAutoSaveMappings()) {
      await autoSaveBiomarkerMappings(biomarkerSource);
    }

    return Application.SaveLabReport({
      member_id: memberId,
      modified_biomarkers: {
        biomarkers_list: mappedExtractedBiomarkers,
        date_of_test: modifiedTimestamp,
        lab_type: effectiveLabType,
        file_id: uploadedFile?.file_id || '',
      },
      added_biomarkers: {
        biomarkers_list: skipAdded ? [] : addedBiomarkers,
        date_of_test: skipAdded ? '' : addedTimestamp,
        lab_type: 'more_info',
      },
    });
  };
  const [rowErrors, setRowErrors] = React.useState<Record<string, string>>({});
  const [addedrowErrors, setAddedRowErrors] = React.useState<
    Record<number, string>
  >({});
  const [btnLoading, setBtnLoading] = useState(false);
  const [reviewCatalog, setReviewCatalog] = useState<any[]>([]);

  useEffect(() => {
    BiomarkersApi.getBiomarkersList({ include_all: true })
      .then((res) => {
        setReviewCatalog(mapChartBoundsToReviewCatalog(res?.data));
      })
      .catch(() => {});
  }, []);

  const refreshReviewCatalog = () => {
    BiomarkersApi.getBiomarkersList({ include_all: true })
      .then((res) => {
        setReviewCatalog(mapChartBoundsToReviewCatalog(res?.data));
      })
      .catch(() => {});
  };

  const mapExtractedBiomarkersForValidation = (
    biomarkers: any[],
    labType: string,
  ) => buildBiomarkerRowsForValidation(biomarkers, labType);

  const formatValidationErrorForDisplay = (
    item: any,
    biomarkers: any[],
    rowIndex: number,
  ) => {
    if (item?.display_detail) {
      return String(item.display_detail);
    }

    const row = biomarkers?.[rowIndex] || {};
    const name =
      item?.extracted_biomarker ||
      item?.original_biomarker_name ||
      item?.biomarker ||
      row.original_biomarker_name ||
      row.biomarker ||
      `Row ${rowIndex + 1}`;
    const message = String(item?.detail || 'Invalid biomarker');

    if (message.toLowerCase().startsWith(String(name).toLowerCase())) {
      return message;
    }

    const value = preferNonEmpty(row.original_value, row.value, item?.value);
    const unit = row.original_unit ?? row.unit ?? item?.unit;
    const context = [
      value !== undefined && value !== null && String(value).trim() !== ''
        ? `value "${value}"`
        : null,
      unit !== undefined && unit !== null && String(unit).trim() !== ''
        ? `unit "${unit}"`
        : null,
    ]
      .filter(Boolean)
      .join(', ');

    return `${name}${context ? ` (${context})` : ''}: ${message}`;
  };

  const resolveValidationErrorRowIndex = (item: any, biomarkers: any[]) => {
    const errorBiomarkerId = String(item?.biomarker_id || '').trim();

    if (errorBiomarkerId) {
      const idMatchIndex = biomarkers.findIndex(
        (row: any) =>
          String(row?.biomarker_id || '').trim() === errorBiomarkerId,
      );
      if (idMatchIndex !== -1) return idMatchIndex;
    }

    const idx = Number(item?.index);
    if (Number.isInteger(idx) && idx >= 0 && idx < biomarkers.length) {
      return idx;
    }

    const errorName = String(
      item?.extracted_biomarker ||
        item?.original_biomarker_name ||
        item?.biomarker ||
        '',
    )
      .trim()
      .toLowerCase();
    const errorValue = String(item?.value ?? '')
      .trim()
      .toLowerCase();
    const errorUnit = String(item?.unit ?? '')
      .trim()
      .toLowerCase();

    if (errorName) {
      const exactMatchIndexes = biomarkers
        .map((row: any, index: number) => ({ row, index }))
        .filter(({ row }: any) => {
          const rowNames = [row?.original_biomarker_name, row?.biomarker].map(
            (name) =>
              String(name || '')
                .trim()
                .toLowerCase(),
          );
          const rowValue = String(
            preferNonEmpty(row?.original_value, row?.value),
          )
            .trim()
            .toLowerCase();
          const rowUnit = String(row?.original_unit ?? row?.unit ?? '')
            .trim()
            .toLowerCase();

          return (
            rowNames.includes(errorName) &&
            (!errorValue || rowValue === errorValue) &&
            (!errorUnit || rowUnit === errorUnit)
          );
        })
        .map(({ index }: any) => index);

      if (exactMatchIndexes.length === 1) return exactMatchIndexes[0];

      const nameOnlyMatchIndexes = biomarkers
        .map((row: any, index: number) => ({ row, index }))
        .filter(({ row }: any) =>
          [row?.original_biomarker_name, row?.biomarker]
            .map((name) =>
              String(name || '')
                .trim()
                .toLowerCase(),
            )
            .includes(errorName),
        )
        .map(({ index }: any) => index);

      if (nameOnlyMatchIndexes.length === 1) return nameOnlyMatchIndexes[0];
    }

    return -1;
  };

  const resolveValidationErrorRowKey = (item: any, biomarkers: any[]) => {
    const errorBiomarkerId = String(item?.biomarker_id || '').trim();
    if (errorBiomarkerId) {
      const idMatchIndex = biomarkers.findIndex(
        (row: any) =>
          String(row?.biomarker_id || '').trim() === errorBiomarkerId,
      );
      if (idMatchIndex !== -1) {
        return reviewRowErrorKey(biomarkers[idMatchIndex], idMatchIndex);
      }
    }

    const rowIndex = resolveValidationErrorRowIndex(item, biomarkers);
    if (rowIndex < 0) {
      return '';
    }
    return reviewRowErrorKey(biomarkers[rowIndex], rowIndex);
  };

  const buildValidationErrorsMaps = (
    detail: any,
    contextBiomarkers: any[],
    contextAddedBiomarkers: any[],
  ) => {
    let parsedDetail: any = {};

    if (typeof detail === 'string') {
      try {
        parsedDetail = JSON.parse(detail);
      } catch (e) {
        console.error('Failed to parse error detail:', detail, e);
        parsedDetail = {};
      }
    } else {
      parsedDetail = detail || {};
    }

    const modifiedErrors: Record<string, string> = {};
    const addedErrors: Record<number, string> = {};
    const isUnitError = (item: any) => {
      const message = String(
        item?.display_detail || item?.detail || '',
      ).toLowerCase();
      return (
        message.includes('unit') ||
        message.includes('extracted unit') ||
        message.includes('system standard')
      );
    };

    const modifiedItems = parsedDetail.modified_biomarkers_list || [];
    const modifiedUnitErrorRows = new Set<string>();
    modifiedItems.forEach((item: any) => {
      const rowKey = resolveValidationErrorRowKey(item, contextBiomarkers);
      if (!rowKey) {
        return;
      }
      if (isUnitError(item)) {
        modifiedUnitErrorRows.add(rowKey);
      }
    });

    modifiedItems.forEach((item: any) => {
      const rowIndex = resolveValidationErrorRowIndex(item, contextBiomarkers);
      const rowKey = resolveValidationErrorRowKey(item, contextBiomarkers);
      if (!rowKey || rowIndex < 0) {
        return;
      }
      if (modifiedUnitErrorRows.has(rowKey) && !isUnitError(item)) {
        return;
      }
      modifiedErrors[rowKey] = formatValidationErrorForDisplay(
        item,
        contextBiomarkers,
        rowIndex,
      );
    });

    const addedItems = parsedDetail.added_biomarkers_list || [];
    const addedUnitErrorRows = new Set<number>();
    addedItems.forEach((item: any) => {
      const rowIndex = resolveValidationErrorRowIndex(
        item,
        contextAddedBiomarkers,
      );
      if (rowIndex < 0) {
        return;
      }
      if (isUnitError(item)) {
        addedUnitErrorRows.add(rowIndex);
      }
    });

    addedItems.forEach((item: any) => {
      const rowIndex = resolveValidationErrorRowIndex(
        item,
        contextAddedBiomarkers,
      );
      if (rowIndex < 0) {
        return;
      }
      if (addedUnitErrorRows.has(rowIndex) && !isUnitError(item)) {
        return;
      }
      addedErrors[rowIndex] = formatValidationErrorForDisplay(
        item,
        contextAddedBiomarkers,
        rowIndex,
      );
    });

    return { modifiedErrors, addedErrors };
  };

  const applyValidationErrors = (
    detail: any,
    contextBiomarkers = extractedBiomarkers,
  ) => {
    const { modifiedErrors, addedErrors } = buildValidationErrorsMaps(
      detail,
      contextBiomarkers,
      addedBiomarkers,
    );
    logRowErrorsMutation('set', {
      source: 'validate-api',
      error_count: Object.keys(modifiedErrors).length,
      error_keys: Object.keys(modifiedErrors),
    });
    setRowErrors(modifiedErrors);
    setAddedRowErrors(addedErrors);
  };

  const applyPersistedReviewFindings = (
    findings: ReviewFinding[],
    contextBiomarkers = extractedBiomarkers,
    backendErrors: Record<string, string> | null = null,
    findingsMeta: LabUnitSnapshotMeta | null = null,
  ) => {
    const openFindings = findings.filter(
      (finding) =>
        finding.status === 'pending' || finding.status === 'reviewed',
    );
    if (!contextBiomarkers.length) return;

    const persistedItems = filterPersistedReviewFindingItems(
      openFindings.map((finding) => ({
        ...(typeof (finding as any).payload === 'object'
          ? (finding as any).payload
          : {}),
        biomarker_id: finding.biomarker_id,
        code: finding.finding_type,
        detail: finding.detail,
        display_detail: finding.display_detail || finding.detail,
        extracted_biomarker: finding.extracted_biomarker,
      })),
      contextBiomarkers,
      suppressedSet,
    );

    const { modifiedErrors } = buildValidationErrorsMaps(
      { modified_biomarkers_list: persistedItems },
      contextBiomarkers,
      addedBiomarkers,
    );

    const snapshotAge = computeSnapshotAgeVsOnChange(
      findingsMeta?.fetched_at ?? backendRowErrorsMetaRef.current?.fetched_at,
      getLabUnitDebugContext().lastUnitOnChangeAt,
    );
    const snapshotOlderThanOnChange =
      snapshotAge.is_snapshot_older_than_onChange === true;

    const filteredModifiedErrors = { ...modifiedErrors };
    contextBiomarkers.forEach((row, index) => {
      const id = String(row?.biomarker_id || '').trim();
      const rowKey = reviewRowErrorKey(row, index);
      const errorText = filteredModifiedErrors[rowKey];
      if (!errorText) return;

      const reason = inferReviewReasonFromErrorText(errorText);
      const isUnitError =
        reason === 'unit_mismatch' || reason === 'unit_required';
      if (!isUnitError) return;

      if (id && dirtyBiomarkerIds.includes(id)) {
        delete filteredModifiedErrors[rowKey];
        return;
      }
      if (snapshotOlderThanOnChange) {
        delete filteredModifiedErrors[rowKey];
      }
    });

    const merged = { ...(backendErrors ?? {}), ...filteredModifiedErrors };
    logRowErrorsMutation('merge', {
      source: 'findings-merge',
      findings_request_id: findingsMeta?.request_id,
      findings_fetched_at: findingsMeta?.fetched_at,
      backend_errors_meta: backendRowErrorsMetaRef.current,
      context_biomarkers_meta: contextBiomarkersMetaRef.current,
      context_snapshot: summarizeContextBiomarkers(contextBiomarkers),
      backend_errors_keys: Object.keys(backendErrors ?? {}),
      findings_errors_keys: Object.keys(modifiedErrors),
      filtered_findings_errors_keys: Object.keys(filteredModifiedErrors),
      merged_error_keys: Object.keys(merged),
      dirty_biomarker_ids: dirtyBiomarkerIds,
      ...snapshotAge,
    });
    setRowErrors(merged);
  };

  const autoSaveBiomarkerMappings = async (rowsOverride?: any[]) => {
    if (isDemo) return;
    if (!shouldBulkAutoSaveMappings()) return;
    const rows = rowsOverride ?? extractedBiomarkers;
    const uniqueMappings = new Map<
      string,
      { extracted: string; system: string; key: string }
    >();

    rows.forEach((row: any) => {
      const system = String(row.biomarker || '').trim();
      if (!system) return;

      collectMappingNameVariations(row).forEach((extracted) => {
        if (extracted.toLowerCase() === system.toLowerCase()) return;
        const key = `${extracted.toLowerCase()}|${system.toLowerCase()}`;
        if (autoSavedMappingKeysRef.current.has(key)) return;
        uniqueMappings.set(key, {
          extracted,
          system,
          key,
        });
      });
    });

    if (uniqueMappings.size === 0) return;

    const mappings = Array.from(uniqueMappings.values());
    mappings.forEach(({ key }) => autoSavedMappingKeysRef.current.add(key));
    const batchSize = 8;
    for (let i = 0; i < mappings.length; i += batchSize) {
      const batch = mappings.slice(i, i + batchSize);
      await Promise.allSettled(
        batch.map(({ extracted, system }) =>
          Application.add_mapping({
            extracted_biomarker: extracted,
            system_biomarker: system,
          }),
        ),
      );
    }
  };

  // Persist ready/review state with each row; downstream reads only consume
  // rows saved as ready.
  const buildContinueRows = () =>
    extractedBiomarkers.flatMap((row, index) => {
      if (isPhantomSuppressedRow(row)) return [];
      const { category } = categorizeReviewRow(
        row,
        rowErrors,
        suppressedSet,
        index,
      );
      if (category === 'excluded') return [];
      return [{ ...row, validation_status: category }];
    });

  const buildReadyRows = () =>
    buildContinueRows().filter((row) => row.validation_status === 'ready');

  const parseApiErrorDetail = (err: any) =>
    err?.detail ?? err?.response?.data?.detail ?? err;

  const isLabSaveGatewayTimeout = (err: any) =>
    err?.response?.status === 504 ||
    err?.code === 'ECONNABORTED' ||
    err?.error?.code === '504' ||
    String(err?.error?.message || err?.message || '')
      .toLowerCase()
      .includes('deployment');

  const labSaveGatewayTimeoutMessage =
    'Save timed out at the gateway. Your biomarkers may still be processing — refresh and check step two, or try again in a moment.';

  const buildLabValidationPayload = () => {
    const modifiedTimestamp = modifiedDateOfTest
      ? Date.UTC(
          modifiedDateOfTest.getFullYear(),
          modifiedDateOfTest.getMonth(),
          modifiedDateOfTest.getDate(),
        ).toString()
      : '';
    const addedTimestamp = addedDateOfTest
      ? Date.UTC(
          addedDateOfTest.getFullYear(),
          addedDateOfTest.getMonth(),
          addedDateOfTest.getDate(),
        ).toString()
      : '';

    return {
      modified_biomarkers_list: mapExtractedBiomarkersForValidation(
        extractedBiomarkers,
        fileType,
      ),
      added_biomarkers_list: addedBiomarkers,
      modified_biomarkers_date_of_test: modifiedTimestamp,
      added_biomarkers_date_of_test: addedTimestamp,
      modified_lab_type: fileType,
      modified_file_id: uploadedFile?.file_id ?? '',
      member_id: memberId,
    };
  };

  const validateAndSaveLabReport = async () => {
    await Application.validateBiomarkers(buildLabValidationPayload());
    return handleSaveLabReport();
  };

  const handleLabSaveError = (err: any) => {
    if (isLabSaveGatewayTimeout(err)) {
      showError('Could not save biomarkers', labSaveGatewayTimeoutMessage);
      return;
    }
    const detail = parseApiErrorDetail(err);
    if (detail) {
      if (typeof detail === 'string') {
        try {
          const parsed = JSON.parse(detail);
          applyValidationErrors(parsed);
          return;
        } catch {
          if (detail.includes('biomarkers_list')) {
            applyValidationErrors(detail);
            return;
          }
        }
      }
      if (typeof detail === 'object') {
        applyValidationErrors(detail);
        return;
      }
      showError('Could not save biomarkers', String(detail));
      return;
    }
    console.error('API error:', err);
    showError(
      'Could not save biomarkers',
      'An unexpected error occurred. Please try again.',
    );
  };

  const completeReviewContinue = async () => {
    setBtnLoading(true);
    setPolling(false);

    // Advisory review: save everything not explicitly excluded. Review items
    // are saved and recorded as findings the user can resolve later in Edit.
    const continueRows = buildContinueRows();
    const reviewItemCount = continueRows.filter((row, index) => {
      const { category } = categorizeReviewRow(
        row,
        rowErrors,
        suppressedSet,
        index,
      );
      return category !== 'ready';
    }).length;

    if (continueRows.length === 0) {
      showError(
        'Could not save biomarkers',
        'There are no biomarkers to save. Add or include at least one biomarker.',
      );
      setBtnLoading(false);
      return;
    }

    try {
      if (reviewCatalog.length === 0) {
        showError(
          'Could not save biomarkers',
          'Biomarker catalog is still loading. Please try again in a moment.',
        );
        return;
      }

      // Note: no pre-`validateBiomarkers` gate. process_lab_report runs the
      // full review validation and (in advisory mode) records findings instead
      // of raising, so the user is never blocked here.
      const res = await handleSaveLabReport(continueRows, {
        skipAddedBiomarkers: true,
        skipAutoSaveMappings: true,
      });

      const savedFileId =
        res?.data?.modified_biomarkers_file_id ||
        res?.data?.added_biomarkers_file_id ||
        uploadedFile?.file_id;

      showSuccess(
        `${continueRows.length} biomarkers saved.`,
        reviewItemCount > 0
          ? `${reviewItemCount} item(s) need review — fix them anytime in Edit. Updating your health plan...`
          : 'Updating your health plan...',
      );
      publish('syncReport', { silent: true });
      publish('checkProgress', {
        type: 'file',
        file_id: savedFileId,
        action_type: 'uploaded',
        process_status: false,
      });
      onGenderate(savedFileId, { silent: true });

      void loadReviewFindings(savedFileId, backendRowErrorsRef.current);
      if (shouldBulkAutoSaveMappings()) {
        void autoSaveBiomarkerMappings(continueRows);
      }
    } catch (err: any) {
      console.error('Review continue save failed:', err);
      if (isLabSaveGatewayTimeout(err)) {
        showError('Could not save biomarkers', labSaveGatewayTimeoutMessage);
        return;
      }
      const detail = parseApiErrorDetail(err);
      if (detail) {
        applyValidationErrors(detail);
      }
      const message =
        typeof detail === 'string' && !detail.trim().startsWith('{')
          ? detail
          : 'Something went wrong while saving. Please try again.';
      showError('Could not save biomarkers', message);
    } finally {
      setBtnLoading(false);
    }
  };

  const triggerSilentCompile = (
    savedFileId?: string,
    compileResponse?: { job_id?: string },
    options?: { isManual?: boolean },
  ) => {
    setLastSavedFileId(savedFileId);
    const manualMeta = options?.isManual
      ? { is_manual: true, file_name: 'Manual Entry' }
      : {};
    if (compileResponse?.job_id && isAsyncProcessingEnabled()) {
      publish('labJobStarted', {
        job_id: compileResponse.job_id,
        member_id: memberId,
        file_id: savedFileId,
        ...manualMeta,
      });
      onGenderate(savedFileId, { silent: true });
      return;
    }
    publish('syncReport', { silent: true });
    publish('checkProgress', {
      type: 'file',
      file_id: savedFileId,
      action_type: 'uploaded',
      process_status: false,
      ...manualMeta,
    });
    onGenderate(savedFileId, { silent: true });
  };

  const clickContinueToHealthPlan = () => {
    if (isDemo) return;
    if (uploadedFile != null && fileType !== 'ultrasound') {
      void completeReviewContinue();
      return;
    }
    if (uploadedFile != null || addedBiomarkers.length !== 0) {
      const isManualCreate =
        !uploadedFile && labOverlayMode === 'manual';
      validateAndSaveLabReport()
        .then((res) => {
          const savedFileId =
            res.data.modified_biomarkers_file_id ||
            res.data.added_biomarkers_file_id ||
            undefined;
          if (isManualCreate && savedFileId) {
            if (res?.data?.job_id && isAsyncProcessingEnabled()) {
              publish('labJobStarted', {
                job_id: res.data.job_id,
                member_id: memberId,
                file_id: savedFileId,
                is_manual: true,
                file_name: 'Manual Entry',
              });
            } else {
              publish('checkProgress', {
                type: 'file',
                file_id: savedFileId,
                action_type: 'uploaded',
                process_status: false,
                is_manual: true,
                file_name: 'Manual Entry',
              });
            }
            onGenderate(savedFileId);
            return;
          }
          if (savedFileId) {
            onGenderate(savedFileId);
          } else {
            onGenderate(undefined);
          }
        })
        .catch(handleLabSaveError);
      return;
    }
    onGenderate(undefined);
  };

  const runAutoContinueToHealthPlan = () => {
    if (autoContinueTriggeredRef.current || isDemo) return;
    if (stepRef.current !== 0) return;

    const canContinue =
      Boolean(pendingProcessingFileIdRef.current) ||
      Boolean(lastSavedFileIdRef.current) ||
      hasComboBarFileRef.current ||
      Boolean(uploadedFileRef.current) ||
      extractedBiomarkersRef.current.length > 0 ||
      questionnaires.length > 0 ||
      has_wearable_data ||
      showReport;
    if (!canContinue) return;

    autoContinueTriggeredRef.current = true;
    wasBackgroundProcessingRef.current = false;
    showSuccess(
      'Processing complete',
      'Closing upload form and loading client summary...',
    );
    clickContinueToHealthPlan();
  };

  useEffect(() => {
    const handleProcessingStarted = (data: any) => {
      const detail = data?.detail || {};
      if (!progressEventMatchesMember(memberId, detail)) return;
      if (detail.file_id) {
        pendingProcessingFileIdRef.current = String(detail.file_id);
      }
      if (detail.process_status === false || detail.job_id) {
        wasBackgroundProcessingRef.current = true;
        autoContinueTriggeredRef.current = false;
      }
    };

    const handleProcessingComplete = (data: any) => {
      const detail = data?.detail || {};
      if (
        detail.member_id != null &&
        !progressEventMatchesMember(memberId, detail)
      ) {
        return;
      }
      if (detail.file_id) {
        pendingProcessingFileIdRef.current = String(detail.file_id);
      }
      runAutoContinueToHealthPlan();
    };

    subscribe('checkProgress', handleProcessingStarted);
    subscribe('labJobStarted', handleProcessingStarted);
    subscribe('allProgressCompleted', handleProcessingComplete);
    subscribe('completedProgress', handleProcessingComplete);
    subscribe('healthPlanProcessingComplete', handleProcessingComplete);
    return () => {
      unsubscribe('checkProgress', handleProcessingStarted);
      unsubscribe('labJobStarted', handleProcessingStarted);
      unsubscribe('allProgressCompleted', handleProcessingComplete);
      unsubscribe('completedProgress', handleProcessingComplete);
      unsubscribe('healthPlanProcessingComplete', handleProcessingComplete);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId, isDemo]);

  useEffect(() => {
    if (step !== 0 || isDemo || !memberId) return;
    if (
      !hasComboBarFile &&
      !uploadedFile?.file_id &&
      !lastSavedFileId &&
      !wasBackgroundProcessingRef.current
    ) {
      return;
    }

    let cancelled = false;
    let sawInflight = wasBackgroundProcessingRef.current;
    let readyPollStreak = 0;
    const mountedAt = Date.now();
    const progressFromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const pollBackgroundProcessing = async () => {
      if (cancelled || autoContinueTriggeredRef.current) return;
      try {
        let asyncJobRunning = false;
        if (isAsyncProcessingEnabled()) {
          try {
            const latest = await Application.getLatestLabJob(Number(memberId));
            const jobId = latest?.data?.job_id;
            if (jobId) {
              const statusRes = await Application.getLabJobStatus(
                Number(memberId),
                jobId,
              );
              const overallStatus = statusRes?.data?.overall_status;
              if (
                overallStatus === 'queued' ||
                overallStatus === 'running' ||
                overallStatus === 'awaiting_review'
              ) {
                asyncJobRunning = true;
                sawInflight = true;
                wasBackgroundProcessingRef.current = true;
                readyPollStreak = 0;
                if (statusRes?.data?.file_id) {
                  pendingProcessingFileIdRef.current = String(
                    statusRes.data.file_id,
                  );
                }
              } else if (overallStatus === 'done') {
                if (statusRes?.data?.file_id) {
                  pendingProcessingFileIdRef.current = String(
                    statusRes.data.file_id,
                  );
                }
                runAutoContinueToHealthPlan();
                return;
              }
            }
          } catch {
            // Fall back to legacy progress polling below.
          }
        }

        if (asyncJobRunning) return;

        const res = await Application.getProgress(
          String(memberId),
          formatProgressFromDate(progressFromDate),
        );
        const files = Array.isArray(res?.data?.files) ? res.data.files : [];
        const inflight = files.some(
          (file: any) => file?.process_status === false,
        );
        const activeFile =
          files.find((file: any) => file?.process_status === false) || files[0];
        if (activeFile?.file_id) {
          pendingProcessingFileIdRef.current = String(activeFile.file_id);
        }

        if (inflight) {
          sawInflight = true;
          wasBackgroundProcessingRef.current = true;
          readyPollStreak = 0;
          return;
        }

        readyPollStreak += 1;

        if (sawInflight || wasBackgroundProcessingRef.current) {
          runAutoContinueToHealthPlan();
          return;
        }

        if (!hasComboBarFileRef.current) return;
        if (Date.now() - mountedAt < 4000) return;
        if (readyPollStreak < 2) return;

        runAutoContinueToHealthPlan();
      } catch {
        // Ignore polling errors; event-based completion still works.
      }
    };

    void pollBackgroundProcessing();
    const intervalId = window.setInterval(pollBackgroundProcessing, 2500);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    step,
    memberId,
    isDemo,
    hasComboBarFile,
    uploadedFile?.file_id,
    lastSavedFileId,
  ]);

  useEffect(() => {
    if (step === 1) {
      autoContinueTriggeredRef.current = false;
    }
  }, [step]);

  const autoSaveAndCompile = async () => {
    const rowsToSave = buildContinueRows();
    const readyRows = buildReadyRows();
    if (!rowsToSave.length) {
      setCompileState('done');
      return;
    }
    if (reviewCatalog.length === 0) return;
    if (!readyRows.length) {
      setCompileState('done');
      return;
    }
    setCompileState('saving');
    try {
      const res = await handleSaveLabReport(rowsToSave, {
        skipAddedBiomarkers: true,
        skipAutoSaveMappings: true,
      });
      const savedFileId =
        res?.data?.modified_biomarkers_file_id ||
        res?.data?.added_biomarkers_file_id ||
        uploadedFile?.file_id;
      triggerSilentCompile(savedFileId, { job_id: res?.data?.job_id });
      void loadReviewFindings(savedFileId, backendRowErrorsRef.current);
      if (shouldBulkAutoSaveMappings()) {
        void autoSaveBiomarkerMappings(rowsToSave);
      }
      setCompileState('done');
    } catch (err: any) {
      console.error('Auto save and compile failed:', err);
      setCompileState('error');
      handleLabSaveError(err);
    }
  };

  const handleRowReadySave = async (row: any) => {
    if (isDemo) return;
    const readyRow = { ...row, validation_status: 'ready' };
    const rowsForSave = buildContinueRows().map((existingRow) =>
      existingRow.biomarker_id === readyRow.biomarker_id
        ? readyRow
        : existingRow,
    );
    try {
      const res = await handleSaveLabReport(rowsForSave, {
        skipAddedBiomarkers: true,
        skipAutoSaveMappings: true,
      });
      const savedFileId =
        res?.data?.modified_biomarkers_file_id ||
        res?.data?.added_biomarkers_file_id ||
        uploadedFile?.file_id;
      setExtractedBiomarkers((prev) =>
        prev.map((existingRow) =>
          existingRow.biomarker_id === readyRow.biomarker_id
            ? readyRow
            : existingRow,
        ),
      );
      if (savedFileId) {
        setLastSavedFileId(savedFileId);
      }
      showSuccess('Biomarker saved.');
      publish('syncReport', { silent: true });
    } catch (err: any) {
      console.error('Row ready save failed:', err);
      handleLabSaveError(err);
      throw err;
    }
  };

  const loadReviewFindings = async (
    fileIdOverride?: string,
    backendErrors: Record<string, string> | null = null,
    contextBiomarkers?: any[],
  ) => {
    const fileId = fileIdOverride || uploadedFile?.file_id;
    if (!fileId) return [];
    const req = createLabUnitRequest('findings');
    logLabUnitDebug('findings:send', {
      request_id: req.request_id,
      file_id: fileId,
      polling: pollingRef.current,
      backend_errors_meta: backendRowErrorsMetaRef.current,
    });
    setReviewFindingsLoading(true);
    try {
      const res = await Application.getLabReviewFindings({ file_id: fileId });
      const findingsMeta = buildSnapshotMeta(
        completeLabUnitRequest(req, {
          findings_count: Array.isArray(res?.data?.findings)
            ? res.data.findings.length
            : 0,
          polling_at_receive: pollingRef.current,
        }),
        contextBiomarkers ?? extractedBiomarkers,
      );
      if (!isMountedRef.current) return [];
      const findings = Array.isArray(res?.data?.findings)
        ? res.data.findings
        : [];
      setReviewFindings(findings);
      const biomarkersForContext = contextBiomarkers ?? extractedBiomarkers;
      if (biomarkersForContext.length) {
        applyPersistedReviewFindings(
          findings,
          biomarkersForContext,
          backendErrors,
          findingsMeta,
        );
      }
      return findings;
    } catch (err: any) {
      console.error('Failed to load review findings:', err);
      return [];
    } finally {
      if (isMountedRef.current) setReviewFindingsLoading(false);
    }
  };

  useEffect(() => {
    const fid = uploadedFile?.file_id;
    if (
      !fid ||
      fileType === 'ultrasound' ||
      uploadPhase !== 'review_ready' ||
      reopeningExistingFile ||
      isTrueEditMode ||
      extractedBiomarkers.length === 0 ||
      reviewCatalog.length === 0 ||
      autoSaveFileRef.current === fid
    ) {
      return;
    }

    autoSaveFileRef.current = fid;
    setCompileState('saving');
    const rowsToSave = buildContinueRows();
    if (buildReadyRows().length === 0) {
      setCompileState('done');
      void handleSaveLabReport(rowsToSave, {
        skipAddedBiomarkers: true,
        skipAutoSaveMappings: true,
      });
      return;
    }
    void autoSaveAndCompile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    uploadedFile?.file_id,
    fileType,
    uploadPhase,
    reopeningExistingFile,
    isTrueEditMode,
    extractedBiomarkers,
    reviewCatalog.length,
  ]);

  const handleRecheck = async () => {
    const fileId = uploadedFile?.file_id;
    if (
      !fileId ||
      recheckLoading ||
      btnLoading ||
      stepOnePollInFlightRef.current
    ) {
      return;
    }

    const RECHECK_POLL_INTERVAL_MS = 2000;
    const RECHECK_POLL_TIMEOUT_MS = 90000;

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        setTimeout(resolve, ms);
      });

    const applyRecheckReadyResponse = async (data: any) => {
      setfileType(data.lab_type || 'more_info');
      setReviewSummary(data.summary || null);
      if (
        Array.isArray(data.extracted_biomarkers) &&
        data.extracted_biomarkers.length > 0
      ) {
        setExtractedCount(data.extracted_biomarkers.length);
      }
      if (data.date_of_test) {
        setModifiedDateOfTest(new Date(data.date_of_test));
      }
      if (
        !data.extracted_biomarkers ||
        data.extracted_biomarkers.length === 0 ||
        !data.validation?.ready
      ) {
        return false;
      }

      const enrichedRows = ensureUniqueBiomarkerIds(
        (data.extracted_biomarkers || []).map((b: any) =>
          enrichExtractedRowForReview(b, data.lab_type),
        ),
      );
      const priorById = new Map(
        extractedBiomarkers.map((row) => [
          String(row?.biomarker_id || ''),
          row,
        ]),
      );
      const mergedRows = enrichedRows.map((row: any) => {
        const id = String(row?.biomarker_id || '');
        const prior = priorById.get(id);
        if (!prior || !dirtyBiomarkerIds.includes(id)) {
          return row;
        }
        return pinBiomarkerNameFields(
          {
            ...row,
            ...prior,
            biomarker_id: id,
          },
          prior,
        );
      });
      const errorMaps = buildValidationErrorsMaps(
        data.validation,
        mergedRows,
        addedBiomarkers,
      );
      mergedRows.forEach((row: any, index: number) => {
        if (row?.review_error_handled === true) {
          const rowKey = reviewRowErrorKey(row, index);
          if (rowKey) {
            delete errorMaps.modifiedErrors[rowKey];
          }
        }
      });
      backendRowErrorsRef.current = errorMaps.modifiedErrors;
      if (currentStepOneRequestRef.current) {
        backendRowErrorsMetaRef.current = buildSnapshotMeta(
          currentStepOneRequestRef.current,
          mergedRows,
        );
      }
      logRowErrorsMutation('set', {
        source: 'recheck',
        request_id: currentStepOneRequestRef.current?.request_id,
        fetched_at: currentStepOneRequestRef.current?.fetched_at,
        error_count: Object.keys(errorMaps.modifiedErrors).length,
        raw_step_one: summarizeStepOneResponse(data),
        polling: pollingRef.current,
      });
      setRowErrors(errorMaps.modifiedErrors);
      setAddedRowErrors(errorMaps.addedErrors);
      const displayRows = sortReviewBiomarkerRows(mergedRows);
      setExtractedBiomarkers(displayRows);
      setUploadPhase(data.status || 'review_ready');
      setProgressBiomarkerUpload(data.progress ?? 100);
      await loadReviewFindings(fileId, errorMaps.modifiedErrors, displayRows);
      reviewHydratedFileRef.current = fileId;
      return true;
    };

    setRecheckLoading(true);
    setReviewHydrating(true);
    stepOnePollInFlightRef.current = true;
    setLabUnitDebugContext({ stepOnePollInFlight: true });
    const pollDeadline = Date.now() + RECHECK_POLL_TIMEOUT_MS;
    try {
      const recheckReq = createLabUnitRequest('step-one-recheck');
      logLabUnitDebug('step-one-recheck:send', {
        request_id: recheckReq.request_id,
        file_id: fileId,
        polling: pollingRef.current,
      });
      let res = await Application.checkLabStepOne({
        file_id: fileId,
        force_revalidate: true,
      });
      currentStepOneRequestRef.current = completeLabUnitRequest(recheckReq, {
        raw_step_one: summarizeStepOneResponse(res.data),
        polling_at_receive: pollingRef.current,
        force_revalidate: true,
      });

      while (
        !res.data.validation?.ready &&
        Date.now() < pollDeadline &&
        res.data.status !== 'failed' &&
        res.data.lab_type !== 'error'
      ) {
        await sleep(RECHECK_POLL_INTERVAL_MS);
        const loopReq = createLabUnitRequest('step-one-recheck');
        logLabUnitDebug('step-one-recheck:send', {
          request_id: loopReq.request_id,
          file_id: fileId,
          polling: pollingRef.current,
          loop: true,
        });
        res = await Application.checkLabStepOne({ file_id: fileId });
        currentStepOneRequestRef.current = completeLabUnitRequest(loopReq, {
          raw_step_one: summarizeStepOneResponse(res.data),
          polling_at_receive: pollingRef.current,
          loop: true,
        });
      }

      if (res.data.validation?.ready) {
        await applyRecheckReadyResponse(res.data);
        return;
      }

      if (Date.now() >= pollDeadline) {
        showError(
          'Re-check timed out',
          'Validation is still running. Your edits are unchanged. Wait a moment and click Re-check again, or refresh the page.',
        );
        return;
      }

      if (res.data.status === 'failed' || res.data.lab_type === 'error') {
        showError(
          'Re-check failed',
          res.data.error ||
            'Lab review validation failed. Your edits are unchanged.',
        );
      }
    } catch (err: any) {
      console.error('Re-check failed:', err);
      showError(
        'Re-check failed',
        'Could not refresh validation. Your edits are unchanged. Please try again.',
      );
    } finally {
      stepOnePollInFlightRef.current = false;
      setLabUnitDebugContext({ stepOnePollInFlight: false });
      setRecheckLoading(false);
      setReviewHydrating(false);
    }
  };

  const onSave = () => {
    if (isDemo) return;
    const isManualEditFlow =
      isTrueEditMode &&
      (labOverlayMode === 'edit_manual' ||
        isManualLabEntry({
          file_name: uploadedFile?.file?.name,
          name: (uploadedFile as any)?.file_name,
        }));
    const isReviewContinueFlow = Boolean(
      !isManualEditFlow &&
        uploadedFile?.file_id &&
        extractedBiomarkers.length > 0 &&
        fileType !== 'ultrasound',
    );

    if (fileType === 'ultrasound') {
      clearLiveReviewCounts();
      setisSaveClicked(true);
      setstep(0);
      setRowErrors({});
      setAddedRowErrors({});
      return;
    }

    if (isManualEditFlow && uploadedFile?.file_id) {
      setBtnLoading(true);
      void (async () => {
        try {
          // Manual Entry stores rows in modified_biomarkers (no OCR extraction).
          // Always send more_info + file_id so process_lab_report UPDATEs that row.
          const manualRows =
            extractedBiomarkers.length > 0
              ? extractedBiomarkers
              : addedBiomarkers;
          if (!manualRows.length) {
            showError(
              'Could not save biomarkers',
              'Add at least one biomarker before saving.',
            );
            return;
          }
          const res = await handleSaveLabReport(manualRows, {
            skipAddedBiomarkers: true,
            skipAutoSaveMappings: true,
            labTypeOverride: 'more_info',
          });
          const savedFileId =
            res?.data?.modified_biomarkers_file_id ||
            res?.data?.added_biomarkers_file_id ||
            uploadedFile?.file_id;
          showSuccess(
            'Manual entry saved.',
            'Updating your health plan...',
          );
          triggerSilentCompile(
            savedFileId,
            { job_id: res?.data?.job_id },
            { isManual: true },
          );
          clearLiveReviewCounts(savedFileId);
          setisSaveClicked(true);
          setLabOverlayMode(null);
          setstep(0);
          setRowErrors({});
          setAddedRowErrors({});
        } catch (err: any) {
          handleLabSaveError(err);
        } finally {
          if (isMountedRef.current) {
            setBtnLoading(false);
          }
        }
      })();
      return;
    }

    if (isReviewContinueFlow) {
      completeReviewContinue();
      return;
    }

    setBtnLoading(true);
    const modifiedTimestamp = modifiedDateOfTest
      ? Date.UTC(
          modifiedDateOfTest.getFullYear(),
          modifiedDateOfTest.getMonth(),
          modifiedDateOfTest.getDate(),
        ).toString()
      : '';
    const addedTimestamp = addedDateOfTest
      ? Date.UTC(
          addedDateOfTest.getFullYear(),
          addedDateOfTest.getMonth(),
          addedDateOfTest.getDate(),
        ).toString()
      : '';

    Application.validateBiomarkers({
      modified_biomarkers_list: mapExtractedBiomarkersForValidation(
        extractedBiomarkers,
        fileType,
      ),
      added_biomarkers_list: addedBiomarkers,
      modified_biomarkers_date_of_test: modifiedTimestamp,
      added_biomarkers_date_of_test: addedTimestamp,
      modified_lab_type: fileType,
      modified_file_id: uploadedFile?.file_id ?? '',
      member_id: memberId,
    })
      .then(async () => {
        if (shouldBulkAutoSaveMappings()) {
          await autoSaveBiomarkerMappings();
        }
        clearLiveReviewCounts();
        setisSaveClicked(true);
        setstep(0);
        setRowErrors({});
        setAddedRowErrors({});
      })
      .catch((err: any) => {
        console.log(err);
        const detail = err?.detail ?? err?.response?.data?.detail ?? err;
        if (detail) {
          applyValidationErrors(detail);
        } else {
          console.error('API error:', err);
        }
      })
      .finally(() => {
        if (isMountedRef.current) {
          setBtnLoading(false);
        }
      });
  };

  const clearLiveReviewCounts = (fileId?: string) => {
    const fid = fileId || uploadedFile?.file_id;
    if (fid) publish('reviewCountsLiveClear', { file_id: fid });
  };

  const handleSaveClose = () => {
    clearLiveReviewCounts();
    if (lastSavedFileId || uploadedFile?.file_id) {
      publish('checkProgress', {
        type: 'file',
        file_id: lastSavedFileId || uploadedFile?.file_id,
        action_type: 'uploaded',
        process_status: false,
      });
    }
    publish('syncReport', { silent: true });
    setstep(0);
  };

  const resolveActiveButtonReportAnalyse = () => {
    if (showReport) {
      return true;
    }
    if (has_wearable_data) {
      return true;
    }
    if (uploadedFile != null) {
      return true;
    }
    if (hasComboBarFile) {
      return true;
    }
    if (
      extractedBiomarkers.length + addedBiomarkers.length > 0 &&
      isSaveClicked
    ) {
      return true;
    }
    if (questionnaires.length > 0) {
      return true;
    }
    return false;
  };

  return (
    <>
      {deleteLoading && (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-20">
          <Circleloader></Circleloader>
        </div>
      )}
      {step === 0 ? (
        <>
          {isUploadFromComboBar ? (
            <>
              <div className="w-full rounded-[16px] h-full md:h-[89vh] top-4 flex justify-center absolute left-0 text-Text-Primary">
                <div className="w-full h-full opacity-85 rounded-[12px] bg-Gray-50 backdrop-blur-md absolute"></div>
                <div
                  // style={{ height: window.innerHeight - 60 + 'px' }}
                  className="z-10 relative px-2 h-[65vh] flex flex-col items-center justify-center"
                >
                  <div className="text-base font-medium text-Text-Primary">
                    Biomarker Input Complete!
                  </div>
                  {extractedBiomarkers.length + addedBiomarkers.length > 0 && (
                    <div className="w-[144px] mt-4  py-1 h-[20px] text-[10px] text-Primary-DeepTeal px-2.5 rounded-full bg-[#E5E5E5] flex items-center gap-1">
                      <img
                        className="size-4"
                        src="/icons/tick-circle-upload.svg"
                        alt=""
                      />
                      {extractedBiomarkers.length + addedBiomarkers.length}{' '}
                      Biomarker added!
                    </div>
                  )}
                  <div className="text-xs mt-4 text-Text-Primary w-[570px] text-center ">
                    You’ve completed entering your biomarkers. To save your
                    changes and update your health plan with the new data, click
                    ‘Save Changes’ or ‘Discard Changes’ to cancel.
                  </div>
                  <div className="w-full gap-2 flex justify-center mt-[46px] ">
                    <ButtonSecondary
                      title={
                        isDemo
                          ? 'Demo version cannot add or edit data. Upgrade for full access.'
                          : undefined
                      }
                      onClick={() => {
                        if (isDemo) return;
                        onGenderate('discard');
                      }}
                      style={{ borderRadius: '20px' }}
                      outline
                    >
                      <img src="/icons/close-square-green.svg" alt="" />
                      Discard Changes
                    </ButtonSecondary>
                    <ButtonSecondary
                      title={
                        isDemo
                          ? 'Demo version cannot add or edit data. Upgrade for full access.'
                          : undefined
                      }
                      style={{
                        // width: '150px',
                        borderRadius: '20px',
                      }}
                      disabled={isDemo || !resolveActiveButtonReportAnalyse()}
                      onClick={() => {
                        clickContinueToHealthPlan();
                      }}
                    >
                      <img src="/icons/tick-square.svg" alt="" />
                      Save Changes
                    </ButtonSecondary>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full rounded-[16px]  md:h-[89vh] top-4 flex justify-center absolute left-0 text-Text-Primary">
              <div className="w-full h-full opacity-85 rounded-[12px] bg-Gray-50 backdrop-blur-md absolute"></div>
              <div
                style={{ height: window.innerHeight - 60 + 'px' }}
                className="z-10 relative px-2 flex flex-col items-center justify-center"
              >
                <div className="flex flex-col gap-6 w-full">
                  <div className="flex items-center flex-col gap-4">
                    <div
                      style={{ textAlignLast: 'center' }}
                      className=" text-center text-base font-medium text-Text-Primary"
                      id="health-plan-title"
                    >
                      Provide Data to Generate Health Plan
                    </div>
                    <div className="text-xs text-Text-Primary text-center">
                      Choose one methods below to provide a personalized plan.
                    </div>
                  </div>
                  <div className="flex  w-full items-center gap-2 xs:gap-6">
                    <div
                      onClick={() => {
                        if (isDemo) return;
                        publish('openLabDataSidePanel', {});
                      }}
                      title={
                        isDemo
                          ? 'Demo version cannot add or edit data. Upgrade for full access.'
                          : undefined
                      }
                      className={`${isDemo ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} w-full md:w-[477px]  h-[269px] rounded-2xl border p-3 md:p-6 flex flex-col items-center gap-[12px] relative bg-white shadow-100 border-Gray-50`}
                    >
                      {isSaveClicked &&
                        extractedBiomarkers.length + addedBiomarkers.length >
                          0 && (
                          <div className="w-[144px] py-1 h-[20px] text-[10px] text-Primary-DeepTeal px-2.5 rounded-full bg-[#E5E5E5] flex items-center gap-1">
                            <img
                              className="size-4"
                              src="/icons/tick-circle-upload.svg"
                              alt=""
                            />
                            {extractedBiomarkers.length +
                              addedBiomarkers.length}{' '}
                            Biomarker added!
                          </div>
                        )}

                      <div
                        style={{ textAlignLast: 'center' }}
                        className="text-[#000000] text-[10px] md:text-xs font-medium mt-3"
                        id="upload-biomarkers-card"
                      >
                        Upload Lab Report or Add Biomarkers
                      </div>
                      <img
                        className="mt-3 size-10 xs:size-[57px]"
                        src="/icons/document-upload-new.svg"
                        alt=""
                      />
                      <div
                        style={{ textAlignLast: 'center' }}
                        className="text-[10px] md:text-xs mt-3 text-justify"
                      >
                        Upload your client's lab test file and edit or add
                        biomarkers manually.
                      </div>
                      <div
                        className={` text-[8px]  xs:text-[10px]  md:text-xs font-medium underline text-Primary-DeepTeal cursor-pointer absolute ${
                          isSaveClicked &&
                          extractedBiomarkers.length + addedBiomarkers.length
                            ? 'bottom-4 lg:bottom-6'
                            : 'bottom-6'
                        } `}
                      >
                        Enter or Upload Biomarkers
                      </div>
                    </div>
                    <div
                      onClick={() => {
                        if (isDemo) return;
                        // if (
                        //   extractedBiomarkers.length + addedBiomarkers.length >
                        //   0
                        // ) {
                        //   return;
                        // } else {
                        publish('QuestionaryTrackingCall', {});
                        // }
                      }}
                      title={
                        isDemo
                          ? 'Demo version cannot add or edit data. Upgrade for full access.'
                          : undefined
                      }
                      className={`${isDemo ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} w-full md:w-[477px]  h-[269px] rounded-2xl border p-3 md:p-6 flex flex-col items-center gap-[12px] relative bg-white shadow-100 border-Gray-50`}
                    >
                      {questionnaires.length > 0 && (
                        <div className="w-[167px] py-1 h-[20px] text-[10px] text-Primary-DeepTeal px-2.5 rounded-full bg-[#E5E5E5] flex items-center gap-1">
                          <img
                            className="size-4"
                            src="/icons/tick-circle-upload.svg"
                            alt=""
                          />
                          <span className="">
                            {' '}
                            {isLoadingQuestionnaires
                              ? '...'
                              : questionnaires.length}
                          </span>
                          Questionnaire filled out!
                        </div>
                      )}
                      <div
                        className="text-[#000000] text-center text-[10px] md:text-xs font-medium mt-3"
                        id="questionnaire-card"
                      >
                        Fill Health Questionnaire
                      </div>
                      <img
                        className=" mt-3 xs:mt-5 size-[37px] xs:size-[49px]"
                        src="/icons/task-square-new.svg"
                        alt=""
                      />
                      <div
                        style={{ textAlignLast: 'center' }}
                        className="text-[10px] md:text-xs mt-3 text-justify"
                      >
                        Provide data (lifestyle, medical history, ...) for a
                        more accurate plan.
                      </div>
                      <div className="text-[8px]  xs:text-[10px]  md:text-xs font-medium underline text-Primary-DeepTeal cursor-pointer absolute bottom-6">
                        Fill Questionnaire
                      </div>
                    </div>
                  </div>
                  <div className="w-full flex justify-center mt-4">
                    <ButtonSecondary
                      title={
                        isDemo
                          ? 'Demo version cannot add or edit data. Upgrade for full access.'
                          : undefined
                      }
                      style={{
                        width: '250px',
                        borderRadius: '20px',
                      }}
                      disabled={isDemo || !resolveActiveButtonReportAnalyse()}
                      onClick={() => {
                        clickContinueToHealthPlan();
                      }}
                    >
                      <img src="/icons/tick-square.svg" alt="" />
                      Continue to Health Plan
                    </ButtonSecondary>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <UploadPModal
          initialMode={initialLabMenu}
          isEditMode={isTrueEditMode}
          isManualMode={
            labOverlayMode === 'manual' ||
            labOverlayMode === 'edit_manual' ||
            isManualLabEntry({
              file_name: uploadedFile?.file?.name,
              name: (uploadedFile as any)?.file_name,
            })
          }
          rowErrors={rowErrors}
          setrowErrors={setRowErrors}
          AddedRowErrors={addedrowErrors}
          OnBack={() => {
            clearLiveReviewCounts();
            if (isUploadFromComboBar) {
              if (isTrueEditMode) {
                onDiscard(); // Was editing, just discard
              } else {
                setstep(0);
              }
            } else {
              setstep(0);
            }
            // Clear all data
            skipExtractionProgressRef.current = false;
            setReopeningExistingFile(false);
            setIsTrueEditMode(false);
            setLabOverlayMode(null);
            reviewHydratedFileRef.current = null;
            setReviewHydrating(false);
            setUploadedFile(null);
            setModifiedDateOfTest(new Date());
            setAddedDateOfTest(new Date());
            setPolling(true);
            setbiomarkerLoading(false);
            setExtractedBiomarkers([]);
            setAddedBiomarkers([]);
            setRowErrors({});
            setAddedRowErrors({});
            setReviewSummary(null);
            setUploadPhase('review_ready');
          }}
          loading={biomarkerLoading}
          uploadPhase={uploadPhase}
          reviewSummary={reviewSummary}
          progressBiomarkerUpload={progressBiomarkerUpload}
          btnLoading={btnLoading}
          fileType={fileType}
          uploadedFile={uploadedFile}
          onSave={onSave}
          onSaveClose={handleSaveClose}
          isShare={isShare || false}
          errorMessage={uploadedFile?.errorMessage || errorMessage}
          handleFileChange={handleFileChange}
          handleDeleteFile={handleDeleteFile}
          onDownload={handleDownloadFile}
          formatFileSize={formatFileSize}
          fileInputRef={fileInputRef}
          modifiedDateOfTest={modifiedDateOfTest || new Date()}
          handleModifiedDateOfTestChange={handleModifiedDateOfTestChange}
          extractedBiomarkers={extractedBiomarkers}
          setExtractedBiomarkers={setExtractedBiomarkers}
          addedBiomarkers={addedBiomarkers}
          handleAddBiomarker={handleAddBiomarker}
          handleTrashClick={handleTrashClick}
          handleConfirm={handleConfirm}
          handleCancel={handleCancel}
          deleteIndex={deleteIndex}
          addedDateOfTest={addedDateOfTest}
          handleAddedDateOfTestChange={handleAddedDateOfTestChange}
          onClose={() => {
            setUploadedFile(null);
          }}
          fileId={uploadedFile?.file_id}
          onRecheck={handleRecheck}
          recheckLoading={recheckLoading}
          extractedCount={extractedCount}
          onSuppressedSetChange={setSuppressedSet}
          reopeningExistingFile={reopeningExistingFile}
          reviewCatalog={reviewCatalog}
          onReviewCatalogRefresh={refreshReviewCatalog}
          reviewFindings={reviewFindings}
          reviewFindingsLoading={reviewFindingsLoading}
          onReloadReviewFindings={() =>
            loadReviewFindings(undefined, backendRowErrorsRef.current)
          }
          compileState={compileState}
          onRowReadySave={handleRowReadySave}
          reviewHydrating={reviewHydrating}
          onLiveCountsChange={(counts) => {
            const fid = uploadedFile?.file_id;
            if (fid) {
              publish('reviewCountsLive', { file_id: fid, counts });
            }
          }}
          onDirtyIdsChange={setDirtyBiomarkerIds}
          unsavedBiomarkerCount={dirtyBiomarkerIds.length}
        />
      )}
    </>
  );
};

export default UploadTestV2;
