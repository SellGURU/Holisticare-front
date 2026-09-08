import { describe, expect, it } from 'vitest';

import {
  MAX_NOTE_ATTACHMENT_BYTES,
  hasInFlightNoteExtraction,
  isNoteExtractionInFlight,
  noteAttachmentFileType,
  validateNoteAttachmentFile,
} from './expertNoteAttachment';

describe('validateNoteAttachmentFile', () => {
  const makeFile = (name: string, size: number) => ({ name, size }) as File;

  it('accepts supported pdf files', () => {
    expect(validateNoteAttachmentFile(makeFile('notes.pdf', 1024)).ok).toBe(
      true,
    );
  });

  it('accepts supported docx files', () => {
    expect(validateNoteAttachmentFile(makeFile('notes.docx', 1024)).ok).toBe(
      true,
    );
  });

  it('accepts supported txt files', () => {
    expect(validateNoteAttachmentFile(makeFile('notes.txt', 1024)).ok).toBe(
      true,
    );
  });

  it('rejects unsupported extensions (e.g. images, exe)', () => {
    const result = validateNoteAttachmentFile(makeFile('scan.png', 1024));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain('Unsupported format');
    }
  });

  it('rejects legacy .doc files (not supported server-side)', () => {
    const result = validateNoteAttachmentFile(makeFile('notes.doc', 1024));
    expect(result.ok).toBe(false);
  });

  it('rejects zero-byte files', () => {
    const result = validateNoteAttachmentFile(makeFile('notes.pdf', 0));
    expect(result.ok).toBe(false);
  });

  it('rejects files larger than 10 MB', () => {
    const result = validateNoteAttachmentFile(
      makeFile('notes.pdf', MAX_NOTE_ATTACHMENT_BYTES + 1),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain('too large');
    }
  });

  it('accepts a file exactly at the size limit', () => {
    expect(
      validateNoteAttachmentFile(
        makeFile('notes.pdf', MAX_NOTE_ATTACHMENT_BYTES),
      ).ok,
    ).toBe(true);
  });
});

describe('noteAttachmentFileType', () => {
  it('extracts lowercase extension without the dot', () => {
    expect(noteAttachmentFileType('My-Notes.PDF')).toBe('pdf');
    expect(noteAttachmentFileType('report.docx')).toBe('docx');
  });

  it('lowercases the whole name when there is no dot present', () => {
    // Matches labReportStepOne.ts's fileExtension behavior for parity.
    expect(noteAttachmentFileType('README')).toBe('readme');
  });
});

describe('isNoteExtractionInFlight', () => {
  it('treats pending and processing as in flight', () => {
    expect(isNoteExtractionInFlight('pending')).toBe(true);
    expect(isNoteExtractionInFlight('processing')).toBe(true);
  });

  it('treats terminal and empty statuses as finished', () => {
    expect(isNoteExtractionInFlight('done')).toBe(false);
    expect(isNoteExtractionInFlight('failed')).toBe(false);
    expect(isNoteExtractionInFlight('skipped')).toBe(false);
    expect(isNoteExtractionInFlight(null)).toBe(false);
    expect(isNoteExtractionInFlight(undefined)).toBe(false);
  });
});

describe('hasInFlightNoteExtraction', () => {
  it('is true when any note is still extracting', () => {
    expect(
      hasInFlightNoteExtraction([
        { attachment_extraction_status: 'done' },
        { attachment_extraction_status: 'pending' },
      ]),
    ).toBe(true);
  });

  it('is false when every note is finished or has no attachment', () => {
    expect(
      hasInFlightNoteExtraction([
        { attachment_extraction_status: 'done' },
        { attachment_extraction_status: 'failed' },
        { attachment_extraction_status: null },
      ]),
    ).toBe(false);
  });
});
