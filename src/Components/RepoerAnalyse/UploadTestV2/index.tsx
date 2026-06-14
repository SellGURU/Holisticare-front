/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useRef, useState } from 'react';
import Application from '../../../api/app';
// import { uploadToAzure } from '../../../help';
import { publish, subscribe } from '../../../utils/event';
import { ButtonSecondary } from '../../Button/ButtosSecondary';
import Circleloader from '../../CircleLoader';
import UploadPModal from './UploadPModal';
import Joyride, { CallBackProps, Step } from 'react-joyride';
import { TutorialReminderToast } from './showTutorialReminderToast';
import { uploadBlobToAzure } from '../../../services/uploadBlobService';
import useIsDemo from '../../../hooks/useIsDemo';
import {
  collectMappingNameVariations,
  enrichBiomarkerNameFieldsOnLoad,
} from './biomarkerNameFields';
import { remapRowErrorsAfterReorder } from './biomarkerReviewCompat';
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

const steps: Step[] = [
  {
    target: '#health-plan-title',
    content:
      'Here you can generate a personalized health plan for your client.',
    placement: 'bottom',
  },
  {
    target: '#upload-biomarkers-card',
    content: 'Upload lab reports or manually add biomarkers.',
  },
  {
    target: '#questionnaire-card',
    content: 'Fill lifestyle and medical information for better accuracy.',
  },
];

const preferNonEmpty = (...values: any[]) => {
  const found = values.find(
    (value) =>
      value !== undefined && value !== null && String(value).trim() !== '',
  );
  return found ?? '';
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
      withNames.biomarker_type || inferBiomarkerTypeFromLabType(labType),
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

interface UploadTestProps {
  memberId: any;
  onGenderate: (file_id: string | undefined) => void;
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
  const fileInputRef = useRef<any>(null);
  const [step, setstep] = useState(0);
  const [initialLabMenu, setInitialLabMenu] = useState('Upload File');
  const [isTrueEditMode, setIsTrueEditMode] = useState(false);
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
  // console.log(extractedBiomarkers);
  const [isUploadFromComboBar, setIsUploadFromComboBar] = useState(false);
  const stepOnePollInFlightRef = useRef(false);
  useEffect(() => {
    subscribe('uploadTestShow-stepTwo', (data: any) => {
      if (isDemo) return;
      const editFileId = data?.detail?.file_id;
      const fileName = data?.detail?.file_name || '';
      setIsUploadFromComboBar(true);
      // If editing an existing file, preload it so polling fetches its biomarkers
      if (editFileId) {
        setIsTrueEditMode(true);
        setstep(1);
        setInitialLabMenu('Upload File');
        setUploadedFile({
          file_id: editFileId,
          file: new File([], fileName),
          progress: 1,
          status: 'completed',
        });
        setPolling(true);
      } else {
        setIsTrueEditMode(false);
        // Just clicked 'Add File or Biomarker' from combo bar
        setstep(2); // Go to PDF vs Manual choice
      }
    });
  }, [isDemo]);
  const [biomarkerLoading, setbiomarkerLoading] = useState(false);
  const [progressBiomarkerUpload, setProgressBiomarkerUpload] = useState(0);
  useEffect(() => {
    const activeFileId = uploadedFile?.file_id;
    if (!activeFileId) return;

    let intervalId: NodeJS.Timeout;
    const showReviewLoading = () =>
      new Promise((resolve) => setTimeout(resolve, 900));

    const processStepOneData = async (data: any) => {
      setProgressBiomarkerUpload(data.progress);
      setfileType(data.lab_type || 'more_info');
      setUploadPhase(data.status || 'ocr_processing');
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

      // Background validation still running — keep polling; do not call validateBiomarkers.
      if (
        data.status === 'validating_review' ||
        (data.progress === 100 &&
          data.extracted_biomarkers?.length > 0 &&
          !data.validation?.ready)
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
      const enrichedRows = (data.extracted_biomarkers || []).map((b: any) =>
        enrichExtractedRowForReview(b, data.lab_type),
      );
      const displayRows = sortReviewBiomarkerRows(enrichedRows);

      // Stop polling once validation is ready and show biomarkers
      if (
        data.extracted_biomarkers &&
        data.extracted_biomarkers.length > 0 &&
        data.validation?.ready
      ) {
        setPolling(false);
        setUploadPhase('validating_review');
        setbiomarkerLoading(true);
        await showReviewLoading();

        const errorMaps = buildValidationErrorsMaps(
          data.validation,
          enrichedRows,
          addedBiomarkers,
        );
        setRowErrors(
          remapRowErrorsAfterReorder(
            errorMaps.modifiedErrors,
            enrichedRows,
            displayRows,
          ),
        );
        setAddedRowErrors(errorMaps.addedErrors);

        setExtractedBiomarkers(displayRows);
        setUploadPhase(data.status || 'review_ready');
        setbiomarkerLoading(false);
        if (data.is_edited) {
          setisSaveClicked(false);
        }
      }
    };

    const fetchData = async () => {
      if (stepOnePollInFlightRef.current) return;
      stepOnePollInFlightRef.current = true;
      setbiomarkerLoading(true);
      try {
        const res = await Application.checkLabStepOne({
          file_id: activeFileId,
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
  const sendToBackend = async (file: File, azureUrl: string) => {
    if (isDemo) return;
    await Application.addLabReport(
      {
        member_id: memberId,
        report: {
          'file name': file.name,
          blob_url: azureUrl,
        },
      },
      (progressEvent: any) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );
        const backendProgress = 50 + percentCompleted / 2;

        setUploadedFile((prev) =>
          prev
            ? {
                ...prev,
                progress: backendProgress,
                uploadedSize: progressEvent.loaded,
              }
            : prev,
        );
      },
    )
      .then((res) => {
        setUploadedFile((prev) =>
          prev
            ? {
                ...prev,
                status: 'completed',
                file_id: res.data.file_id,
                azureUrl,
                warning: res.status == 206,
              }
            : prev,
        );
      })
      .catch((err) => {
        if (err == 'Network Error') {
          setUploadedFile((prev) =>
            prev ? { ...prev, status: 'completed' } : prev,
          );
        } else {
          setUploadPhase('failed');
          setUploadedFile((prev) =>
            prev
              ? {
                  ...prev,
                  status: 'error',
                  errorMessage:
                    err?.response?.data?.message ||
                    err?.detail ||
                    'Failed to upload file. Please try again.',
                }
              : prev,
          );
        }
      });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isDemo) return;
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const fileName = file.name;
      const fileExtension = fileName.split('.').pop()?.toLowerCase();

      const supportedFormats = [
        'pdf',
        'docx',
        'doc',
        'png',
        'jpg',
        'jpeg',
        'webp',
      ];

      if (!fileExtension || !supportedFormats.includes(fileExtension)) {
        // Validation failed: set error state without calling API
        const newFile: FileUpload = {
          file_id: '',
          file,
          progress: 0,
          status: 'error',
          errorMessage:
            'Unsupported format. Allowed: PDF, DOC, DOCX, PNG, JPG, JPEG, WEBP.',
        };
        setUploadedFile(newFile);
        setUploadPhase('failed');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return; // Stop execution here
      }

      // Validation passed: proceed with upload
      const newFile: FileUpload = {
        file_id: '',
        file,
        progress: 0.5,
        status: 'uploading',
        uploadedSize: 0,
      };

      setUploadedFile(newFile);
      setReviewSummary(null);
      setExtractedBiomarkers([]);
      setRowErrors({});
      setAddedRowErrors({});
      setUploadPhase('uploading');
      setbiomarkerLoading(true);

      try {
        // Step 1: Upload to Azure
        // const azureUrl = await uploadToAzure(file, (progress) => {
        //   const uploadedBytes = Math.floor((progress / 100) * file.size);
        //   setUploadedFile((prev) =>
        //     prev
        //       ? { ...prev, progress: progress / 2, uploadedSize: uploadedBytes }
        //       : prev,
        //   );
        // });
        uploadBlobToAzure({
          containerKey: 'reports',
          file: file,
          name: fileName,
          onProgress: (progress) => {
            const uploadedBytes = Math.floor((progress / 100) * file.size);
            setUploadedFile((prev) =>
              prev
                ? {
                    ...prev,
                    progress: progress / 2,
                    uploadedSize: uploadedBytes,
                  }
                : prev,
            );
          },
        })
          .then((azureUrl) => {
            sendToBackend(file, azureUrl);
          })
          .catch(() => {});

        // Step 2: Send to backend
        // await sendToBackend(file, azureUrl);
      } catch (error: any) {
        setUploadPhase('failed');
        setUploadedFile((prev) =>
          prev
            ? {
                ...prev,
                status: 'error',
                errorMessage:
                  error?.response?.data?.message ||
                  error?.message ||
                  'Failed to upload file. Please try again.',
              }
            : prev,
        );
      }
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

  const handleSaveLabReport = async () => {
    if (isDemo) {
      throw new Error('Demo version cannot add or edit data.');
    }
    // ✅ For ultrasound reports, call API with empty lists
    if (fileType === 'ultrasound') {
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
    const mappedExtractedBiomarkers = extractedBiomarkers.map((b) => ({
      biomarker_id: b.biomarker_id,
      biomarker: b.biomarker,
      biomarker_type: b.biomarker_type,
      original_biomarker_name: b.original_biomarker_name,
      original_value: preferNonEmpty(b.original_value, b.value),
      original_unit: b.original_unit,
      value: b.value,
      unit: b.unit,
      'sub-value': b['sub-value'],
      header_1: b['header_1'],
      more_info: b['more_info'],
      list_of_genes: b['list_of_genes'],
      your_result: b['your_result'],
    }));

    await autoSaveBiomarkerMappings();

    return Application.SaveLabReport({
      member_id: memberId,
      modified_biomarkers: {
        biomarkers_list: mappedExtractedBiomarkers, // Send the full, mapped list
        date_of_test: modifiedTimestamp,
        lab_type: fileType,
        file_id: uploadedFile?.file_id || '',
      },
      added_biomarkers: {
        biomarkers_list: addedBiomarkers,
        date_of_test: addedTimestamp,
        lab_type: 'more_info',
        // file_id: uploadedFile?.file_id || '',
      },
    });
  };
  const [rowErrors, setRowErrors] = React.useState<Record<number, string>>({});
  const [addedrowErrors, setAddedRowErrors] = React.useState<
    Record<number, string>
  >({});
  const [btnLoading, setBtnLoading] = useState(false);

  const mapExtractedBiomarkersForValidation = (
    biomarkers: any[],
    labType: string,
  ) =>
    biomarkers.map((b, index) => {
      const base = {
        biomarker_id: b.biomarker_id || `${labType}-${index}`,
        biomarker: b.biomarker,
        biomarker_type:
          b.biomarker_type || inferBiomarkerTypeFromLabType(labType),
        value: preferNonEmpty(b.original_value, b.value),
        unit: b.unit,
        original_biomarker_name: b.original_biomarker_name,
        original_value: preferNonEmpty(b.original_value, b.value),
        original_unit: preferNonEmpty(b.original_unit, b.unit),
      };
      if (labType === 'gut') return { ...base, 'sub-value': b['sub-value'] };
      if (labType === 'dna') {
        return {
          ...base,
          header_1: b['header_1'],
          more_info: b['more_info'],
          list_of_genes: b['list_of_genes'],
          your_result: b['your_result'],
        };
      }
      return base;
    });

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

    const modifiedErrors: Record<number, string> = {};
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
    const modifiedUnitErrorRows = new Set<number>();
    modifiedItems.forEach((item: any) => {
      const rowIndex = resolveValidationErrorRowIndex(item, contextBiomarkers);
      if (rowIndex < 0) {
        return;
      }
      if (isUnitError(item)) {
        modifiedUnitErrorRows.add(rowIndex);
      }
    });

    modifiedItems.forEach((item: any) => {
      const rowIndex = resolveValidationErrorRowIndex(item, contextBiomarkers);
      if (rowIndex < 0) {
        return;
      }
      if (modifiedUnitErrorRows.has(rowIndex) && !isUnitError(item)) {
        return;
      }
      modifiedErrors[rowIndex] = formatValidationErrorForDisplay(
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
    setRowErrors(modifiedErrors);
    setAddedRowErrors(addedErrors);
  };

  const autoSaveBiomarkerMappings = async () => {
    if (isDemo) return;
    const uniqueMappings = new Map<
      string,
      { extracted: string; system: string }
    >();

    extractedBiomarkers.forEach((row: any) => {
      const system = String(row.biomarker || '').trim();
      if (!system) return;

      collectMappingNameVariations(row).forEach((extracted) => {
        if (extracted.toLowerCase() === system.toLowerCase()) return;
        uniqueMappings.set(
          `${extracted.toLowerCase()}|${system.toLowerCase()}`,
          {
            extracted,
            system,
          },
        );
      });
    });

    if (uniqueMappings.size === 0) return;

    await Promise.allSettled(
      Array.from(uniqueMappings.values()).map(({ extracted, system }) =>
        Application.add_mapping({
          extracted_biomarker: extracted,
          system_biomarker: system,
        }),
      ),
    );
  };

  const onSave = () => {
    if (isDemo) return;
    // ✅ For ultrasound reports, just close the modal and go to step 0
    // The API call will happen when clicking "Save & Continue to Health Plan"
    if (fileType === 'ultrasound') {
      setisSaveClicked(true);
      setstep(0);
      setRowErrors({});
      setAddedRowErrors({});
      return;
    }

    setBtnLoading(true);
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
        await autoSaveBiomarkerMappings();
        // 200 response
        setisSaveClicked(true);
        setstep(0);
        setRowErrors({});
        setAddedRowErrors({});
      })
      .catch((err: any) => {
        console.log(err);
        const detail = err?.detail ?? err?.response?.data?.detail;
        if (detail) {
          applyValidationErrors(detail);
        } else {
          console.error('API error:', err);
        }
      })
      .finally(() => {
        setBtnLoading(false);
      });
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

  const [run, setRun] = useState(false);
  const [showReminder, setShowReminder] = useState(false);

  useEffect(() => {
    const tutorialSeen = localStorage.getItem('tutorialSeen');
    if (tutorialSeen === 'true') {
      return;
    }
    const hasSeenTour = localStorage.getItem('healthPlanTutorialSeen');

    if (hasSeenTour === 'true') {
      setShowReminder(true);
    }
  }, []);
  useEffect(() => {
    const showTutorialAgain = localStorage.getItem('showTutorialAgain');
    if (showTutorialAgain === 'true') {
      setRun(true);
      return;
    }
    const seen = localStorage.getItem('healthPlanTutorialSeen');
    if (!seen) {
      setRun(true);
      localStorage.setItem('healthPlanTutorialSeen', 'true');
    }
  }, []);
  const handleViewTutorial = (value: boolean) => {
    if (value) {
      localStorage.setItem('showTutorialAgain', 'true');
    } else {
      localStorage.setItem('showTutorialAgain', 'false');
    }
  };
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;

    if (status === 'finished' || status === 'skipped') {
      localStorage.setItem('healthPlanTutorialSeen', 'true');
      setRun(false);
    }
  };

  return (
    <>
      <Joyride
        steps={steps}
        run={run && step === 0}
        continuous
        showSkipButton
        disableOverlayClose
        styles={{
          options: {
            arrowColor: '#fff',
            backgroundColor: '#fff',
            primaryColor: '#0f766e',
            textColor: '#1f2937',
            zIndex: 10000,
          },
          tooltip: {
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
          },
        }}
        callback={handleJoyrideCallback}
        locale={{
          last: 'Done',
        }}
      />

      <TutorialReminderToast
        visible={showReminder}
        onViewTutorial={(value) => {
          handleViewTutorial(value);
          setRun(value);
        }}
        setRun={setRun}
        onClose={() => {
          setShowReminder(false);
          localStorage.setItem('tutorialSeen', 'true');
        }}
      />

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
                        if (isDemo) return;
                        if (
                          uploadedFile != null ||
                          addedBiomarkers.length != 0
                        ) {
                          handleSaveLabReport()
                            .then((res) => {
                              if (
                                res.data.modified_biomarkers_file_id != null &&
                                res.data.modified_biomarkers_file_id != ''
                              ) {
                                onGenderate(
                                  res.data.modified_biomarkers_file_id,
                                );
                              } else if (
                                res.data.added_biomarkers_file_id != null &&
                                res.data.added_biomarkers_file_id != ''
                              ) {
                                onGenderate(res.data.added_biomarkers_file_id);
                              } else {
                                onGenderate(undefined);
                              }
                              console.log(res);
                            })
                            .catch((err) => {
                              console.log(err);
                            });
                          onGenderate('customBiomarker');
                        } else {
                          onGenderate(undefined);
                        }
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
                        setstep(2);
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
                        if (isDemo) return;
                        if (
                          uploadedFile != null ||
                          addedBiomarkers.length != 0
                        ) {
                          handleSaveLabReport()
                            .then((res) => {
                              if (
                                res.data.modified_biomarkers_file_id != null &&
                                res.data.modified_biomarkers_file_id != ''
                              ) {
                                onGenderate(
                                  res.data.modified_biomarkers_file_id,
                                );
                              } else if (
                                res.data.added_biomarkers_file_id != null &&
                                res.data.added_biomarkers_file_id != null
                              ) {
                                onGenderate(res.data.added_biomarkers_file_id);
                              } else {
                                onGenderate(undefined);
                              }
                              console.log(res);
                            })
                            .catch((err) => {
                              console.log(err);
                            });
                          onGenderate('customBiomarker');
                        } else {
                          onGenderate(undefined);
                        }
                      }}
                    >
                      <img src="/icons/tick-square.svg" alt="" />
                      Save & Continue to Health Plan
                    </ButtonSecondary>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : step === 2 ? (
        <div className="w-full rounded-[16px] md:h-[89vh] top-4 flex justify-center absolute left-0 text-Text-Primary">
          <div className="w-full h-full opacity-85 rounded-[12px] bg-Gray-50 backdrop-blur-md absolute"></div>
          <div className="z-10 relative px-2 flex flex-col items-center justify-center h-[calc(100vh-60px)] w-full max-w-4xl">
            <div className="w-full relative flex items-center justify-center mb-8">
              <div
                onClick={() => {
                  if (isUploadFromComboBar) {
                    onDiscard();
                  } else {
                    setstep(0);
                  }
                }}
                className="absolute left-0 cursor-pointer size-8 md:size-10 rounded-full p-2 bg-white border border-Gray-50 shadow-100 flex items-center justify-center hover:bg-gray-50"
              >
                <img
                  src="/icons/arrow-back.svg"
                  className="w-5 h-5"
                  alt="Back"
                />
              </div>
              <div className="text-center text-xl md:text-2xl font-semibold text-Text-Primary">
                Select Input Method
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 w-full justify-center px-4 md:px-6">
              <div
                onClick={() => {
                  setInitialLabMenu('Upload File');
                  setstep(1);
                }}
                className="cursor-pointer bg-white w-full md:w-[350px] h-[240px] rounded-2xl border p-6 flex flex-col items-center justify-center gap-[16px] shadow-100 border-Gray-50 hover:shadow-200 hover:-translate-y-1 transition-all"
              >
                <img
                  src="/icons/document-upload-new.svg"
                  className="w-[60px] h-[60px] mb-2"
                  alt="Upload"
                />
                <div className="text-base font-semibold text-Text-Primary">
                  Upload Lab Report
                </div>
                <div className="text-sm text-Text-Secondary mt-1 text-center">
                  Upload a PDF, DOC, DOCX, or image file (PNG/JPG/JPEG/WEBP) to
                  automatically extract biomarkers.
                </div>
              </div>
              <div
                onClick={() => {
                  setInitialLabMenu('Add Biomarker');
                  setstep(1);
                }}
                className="cursor-pointer bg-white w-full md:w-[350px] h-[240px] rounded-2xl border p-6 flex flex-col items-center justify-center gap-[16px] shadow-100 border-Gray-50 hover:shadow-200 hover:-translate-y-1 transition-all"
              >
                <img
                  src="/icons/task-square-new.svg"
                  className="w-[60px] h-[60px] mb-2"
                  alt="Manual"
                />
                <div className="text-base font-semibold text-Text-Primary">
                  Enter Manually
                </div>
                <div className="text-sm text-Text-Secondary mt-1 text-center">
                  Type your biomarkers directly into an editable grid.
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <UploadPModal
          initialMode={initialLabMenu}
          isEditMode={isTrueEditMode}
          rowErrors={rowErrors}
          setrowErrors={setRowErrors}
          AddedRowErrors={addedrowErrors}
          OnBack={() => {
            if (isUploadFromComboBar) {
              if (isTrueEditMode) {
                onDiscard(); // Was editing, just discard
              } else {
                setstep(2); // Was not editing, go back to step 2
              }
            } else {
              setstep(2); // Regular add mode, go back to step 2
            }
            // Clear all data
            setIsTrueEditMode(false);
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
            setUploadPhase('uploading');
          }}
          loading={biomarkerLoading}
          uploadPhase={uploadPhase}
          reviewSummary={reviewSummary}
          progressBiomarkerUpload={progressBiomarkerUpload}
          btnLoading={btnLoading}
          fileType={fileType}
          uploadedFile={uploadedFile}
          onSave={onSave}
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
        />
      )}
    </>
  );
};

export default UploadTestV2;
