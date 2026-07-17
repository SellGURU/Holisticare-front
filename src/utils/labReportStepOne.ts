export const MAX_LAB_REPORT_BYTES = 10 * 1024 * 1024;

export const SUPPORTED_LAB_REPORT_FORMATS = [
  'pdf',
  'docx',
  'doc',
  'png',
  'jpg',
  'jpeg',
  'webp',
] as const;

const fileExtension = (fileName: string) =>
  fileName.split('.').pop()?.toLowerCase() || '';

export type LabReportFileValidationResult =
  | { ok: true }
  | { ok: false; message: string };

export const validateLabReportFile = (
  file: File,
): LabReportFileValidationResult => {
  if (
    !SUPPORTED_LAB_REPORT_FORMATS.includes(
      fileExtension(file.name) as (typeof SUPPORTED_LAB_REPORT_FORMATS)[number],
    )
  ) {
    return {
      ok: false,
      message:
        'Unsupported format. Allowed: PDF, DOC, DOCX, PNG, JPG, JPEG, WEBP.',
    };
  }
  if (file.size <= 0) {
    return {
      ok: false,
      message: 'The selected file is empty. Please choose a valid lab report.',
    };
  }
  if (file.size > MAX_LAB_REPORT_BYTES) {
    return {
      ok: false,
      message: 'File is too large. Maximum allowed size is 10 MB.',
    };
  }
  return { ok: true };
};

export const asStepOneRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

export const stepOneResponseData = (response: unknown) =>
  asStepOneRecord(asStepOneRecord(response).data);

export const stepOneHasExtractedBiomarkers = (data: Record<string, unknown>) =>
  Array.isArray(data.extracted_biomarkers) &&
  data.extracted_biomarkers.length > 0;

export const isStepOneTerminalEmptyOrFailed = (
  data: Record<string, unknown>,
) => {
  if (data.status === 'empty' || data.status === 'failed') return true;
  if (data.progress === 90 && !stepOneHasExtractedBiomarkers(data)) return true;
  return false;
};

export const shouldContinueStepOnePolling = (data: Record<string, unknown>) => {
  const validation = asStepOneRecord(data.validation);
  if (data.error || data.lab_type === 'error') return false;
  if (data.lab_type === 'ultrasound') return false;
  if (validation.ready === true) return false;
  if (isStepOneTerminalEmptyOrFailed(data)) return false;
  return true;
};

export const stepOneTerminalUserMessage = (data: Record<string, unknown>) => {
  if (typeof data.error === 'string' && data.error.trim()) {
    return data.error;
  }
  if (data.status === 'failed') {
    return 'Lab report processing failed. Please try another file.';
  }
  return 'No biomarkers could be extracted from this file. Please try a different report.';
};

const DEFAULT_TEMPLATE_WARNING =
  "The uploaded file is not one of the clinic's Templates.";

export const resolveStepOneWarningMessage = (
  data: Record<string, unknown> | null | undefined,
): string | null => {
  if (!data?.warning) return null;
  const message = data.warning_message;
  if (typeof message === 'string' && message.trim()) {
    return message.trim();
  }
  return DEFAULT_TEMPLATE_WARNING;
};

export const stepOneHasWarning = (data: Record<string, unknown>) =>
  Boolean(resolveStepOneWarningMessage(data));
