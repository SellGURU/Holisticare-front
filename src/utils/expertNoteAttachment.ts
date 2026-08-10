/**
 * Expert Note file attachment: client-side validation helpers.
 *
 * Mirrors utils/labReportStepOne.ts's validateLabReportFile pattern. See
 * doc/EXPERT_NOTE_FILE_ATTACHMENT_PLAN.md for the full design.
 *
 * MVP scope: PDF / DOCX / TXT only (no images — see plan Open Question 4).
 * Note: unlike lab reports, plain ".doc" is NOT supported here because the
 * backend uses python-docx, which cannot parse the legacy binary .doc format.
 */

export const MAX_NOTE_ATTACHMENT_BYTES = 10 * 1024 * 1024;

export const SUPPORTED_NOTE_ATTACHMENT_FORMATS = [
  'pdf',
  'docx',
  'txt',
] as const;

export type SupportedNoteAttachmentFormat =
  (typeof SUPPORTED_NOTE_ATTACHMENT_FORMATS)[number];

const fileExtension = (fileName: string): string =>
  fileName.split('.').pop()?.toLowerCase() || '';

export type NoteAttachmentValidationResult =
  | { ok: true }
  | { ok: false; message: string };

export const validateNoteAttachmentFile = (
  file: File,
): NoteAttachmentValidationResult => {
  if (
    !SUPPORTED_NOTE_ATTACHMENT_FORMATS.includes(
      fileExtension(file.name) as SupportedNoteAttachmentFormat,
    )
  ) {
    return {
      ok: false,
      message: 'Unsupported format. Allowed: PDF, DOCX, TXT.',
    };
  }
  if (file.size <= 0) {
    return {
      ok: false,
      message: 'The selected file is empty. Please choose a valid file.',
    };
  }
  if (file.size > MAX_NOTE_ATTACHMENT_BYTES) {
    return {
      ok: false,
      message: 'File is too large. Maximum allowed size is 10 MB.',
    };
  }
  return { ok: true };
};

export const noteAttachmentFileType = (fileName: string): string =>
  fileExtension(fileName);
