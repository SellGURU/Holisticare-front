import { useCallback } from 'react';
import Application from '../api/app';
import { uploadBlobToAzure } from '../services/uploadBlobService';
import { publish } from '../utils/event';
import {
  isSupportedLabReportFile,
  labReportUploadErrorMessage,
  unsupportedLabReportFile,
  validateLabReportFile,
} from '../utils/labReportUploadHelpers';
import {
  shouldContinueStepOnePolling,
  stepOneHasExtractedBiomarkers,
  stepOneResponseData,
} from '../utils/labReportStepOne';

export {
  SUPPORTED_LAB_REPORT_FORMATS,
  isSupportedLabReportFile,
  unsupportedLabReportFile,
  validateLabReportFile,
} from '../utils/labReportUploadHelpers';
export {
  shouldContinueStepOnePolling,
  resolveStepOneWarningMessage,
  stepOneHasExtractedBiomarkers,
  isStepOneTerminalEmptyOrFailed,
  stepOneTerminalUserMessage,
} from '../utils/labReportStepOne';

const STEP_ONE_POLL_INTERVAL_MS = 10000;

export type LabReportUploadResult = {
  fileUpload: FileUpload;
  response?: LabReportUploadResponse;
};

type LabReportUploadResponse = {
  data: {
    file_id: string;
  };
  status: number;
};

type ProgressEventLike = {
  loaded: number;
  total?: number;
};

type UploadCallbacks = {
  memberId: string | number;
  file: File;
  onStateChange?: (fileUpload: FileUpload) => void;
  onComplete?: (
    fileUpload: FileUpload,
    response: LabReportUploadResponse,
  ) => void;
  onError?: (fileUpload: FileUpload, error: unknown) => void;
  publishProgressEvents?: boolean;
  autoOpenReviewOnReady?: boolean;
  signal?: AbortSignal;
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

const isGatewayTimeout = (error: unknown) => {
  const errorRecord = asRecord(error);
  const responseRecord = asRecord(errorRecord.response);
  return (
    responseRecord.status === 504 ||
    errorRecord.code === 'ECONNABORTED' ||
    String(errorRecord.message || '')
      .toLowerCase()
      .includes('timeout')
  );
};

const startStepOnePolling = (
  fileId: string,
  fileName: string,
  autoOpenReviewOnReady = true,
) => {
  let intervalId: number | null = null;
  let inFlight = false;
  let reviewPublished = false;

  const stop = () => {
    if (intervalId) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
  };

  const poll = async () => {
    if (inFlight) return;
    inFlight = true;
    try {
      const response = await Application.checkLabStepOne({ file_id: fileId });
      const data = stepOneResponseData(response);
      if (
        autoOpenReviewOnReady &&
        !reviewPublished &&
        asRecord(data.validation).ready === true &&
        stepOneHasExtractedBiomarkers(data)
      ) {
        reviewPublished = true;
        publish('uploadTestShow', {
          isShow: true,
          file_id: fileId,
          file_name: fileName,
          mode: 'review_ready',
        });
      }
      if (!shouldContinueStepOnePolling(data)) {
        stop();
      }
    } catch (error: unknown) {
      if (isGatewayTimeout(error)) {
        stop();
      }
    } finally {
      inFlight = false;
    }
  };

  void poll();
  intervalId = window.setInterval(() => {
    void poll();
  }, STEP_ONE_POLL_INTERVAL_MS);
};

export const useLabReportUpload = () => {
  const uploadLabReportFile = useCallback(
    async ({
      memberId,
      file,
      onStateChange,
      onComplete,
      onError,
      publishProgressEvents = false,
      autoOpenReviewOnReady = true,
      signal,
    }: UploadCallbacks): Promise<LabReportUploadResult> => {
      const preflight = validateLabReportFile(file);
      if (!preflight.ok) {
        const invalidFile: FileUpload = {
          file_id: '',
          file,
          progress: 0,
          status: 'error',
          errorMessage: preflight.message,
        };
        onStateChange?.(invalidFile);
        onError?.(invalidFile, new Error(preflight.message));
        return { fileUpload: invalidFile };
      }

      if (!isSupportedLabReportFile(file)) {
        const invalidFile = unsupportedLabReportFile(file);
        onStateChange?.(invalidFile);
        onError?.(invalidFile, new Error(invalidFile.errorMessage));
        return { fileUpload: invalidFile };
      }

      let currentFile: FileUpload = {
        file_id: '',
        file,
        progress: 0.5,
        status: 'uploading',
        uploadedSize: 0,
      };
      onStateChange?.(currentFile);

      try {
        const azureUrl = await uploadBlobToAzure({
          containerKey: 'reports',
          file,
          name: file.name,
          onProgress: (progress) => {
            const uploadedBytes = Math.floor((progress / 100) * file.size);
            currentFile = {
              ...currentFile,
              progress: progress / 2,
              uploadedSize: uploadedBytes,
            };
            onStateChange?.(currentFile);
          },
        });

        const response = (await Application.addLabReport(
          {
            member_id: memberId,
            report: {
              'file name': file.name,
              blob_url: azureUrl,
            },
          },
          (progressEvent: ProgressEventLike) => {
            if (signal?.aborted) return;
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1),
            );
            currentFile = {
              ...currentFile,
              progress: 50 + percentCompleted / 2,
              uploadedSize: progressEvent.loaded,
            };
            onStateChange?.(currentFile);
          },
          signal,
        )) as LabReportUploadResponse;

        if (signal?.aborted) {
          return { fileUpload: currentFile };
        }

        currentFile = {
          ...currentFile,
          status: 'completed',
          file_id: response.data.file_id,
          azureUrl,
          warning: response.status === 206,
        };
        onStateChange?.(currentFile);
        onComplete?.(currentFile, response);

        if (publishProgressEvents) {
          publish('syncReport', { silent: true });
          publish('checkProgress', {
            type: 'file',
            file_id: response.data.file_id,
            action_type: 'uploaded',
            process_status: false,
          });
          startStepOnePolling(
            response.data.file_id,
            file.name,
            autoOpenReviewOnReady,
          );
        }

        return { fileUpload: currentFile, response };
      } catch (error: unknown) {
        if (error === 'Network Error') {
          currentFile = { ...currentFile, status: 'completed' };
        } else {
          currentFile = {
            ...currentFile,
            status: 'error',
            progress: 0,
            errorMessage: labReportUploadErrorMessage(error),
          };
        }
        onStateChange?.(currentFile);
        onError?.(currentFile, error);
        return { fileUpload: currentFile };
      }
    },
    [],
  );

  return { uploadLabReportFile };
};
