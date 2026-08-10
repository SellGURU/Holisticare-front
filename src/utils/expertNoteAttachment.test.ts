import { describe, expect, it } from 'vitest';

import {
  MAX_NOTE_ATTACHMENT_BYTES,
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
