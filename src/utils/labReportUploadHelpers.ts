import {
  SUPPORTED_LAB_REPORT_FORMATS,
  validateLabReportFile,
  type LabReportFileValidationResult,
} from './labReportStepOne';

export {
  SUPPORTED_LAB_REPORT_FORMATS,
  validateLabReportFile,
  type LabReportFileValidationResult,
};

const fileExtension = (fileName: string) =>
  fileName.split('.').pop()?.toLowerCase() || '';

export const isSupportedLabReportFile = (file: File) =>
  SUPPORTED_LAB_REPORT_FORMATS.includes(
    fileExtension(file.name) as (typeof SUPPORTED_LAB_REPORT_FORMATS)[number],
  );

export const unsupportedLabReportFile = (file: File): FileUpload => {
  const validation = validateLabReportFile(file);
  return {
    file_id: '',
    file,
    progress: 0,
    status: 'error',
    errorMessage: validation.ok
      ? 'Unsupported format. Allowed: PDF, DOC, DOCX, PNG, JPG, JPEG, WEBP.'
      : validation.message,
  };
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

export const labReportUploadErrorMessage = (error: unknown) => {
  const errorRecord = asRecord(error);
  const responseRecord = asRecord(errorRecord.response);
  const dataRecord = asRecord(responseRecord.data);
  return (
    dataRecord.message ||
    dataRecord.detail ||
    errorRecord.detail ||
    errorRecord.message ||
    'Failed to upload file. Please try again.'
  ).toString();
};
