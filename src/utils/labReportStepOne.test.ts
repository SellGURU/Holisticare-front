import { describe, expect, it } from 'vitest';

import {
  isStepOneDeletedResponse,
  isStepOneTerminalEmptyOrFailed,
  resolveStepOneWarningMessage,
  shouldContinueStepOnePolling,
  validateLabReportFile,
} from './labReportStepOne';

describe('shouldContinueStepOnePolling', () => {
  it('stops on terminal empty in a single response', () => {
    const data = {
      progress: 90,
      status: 'empty',
      extracted_biomarkers: [],
    };
    expect(shouldContinueStepOnePolling(data)).toBe(false);
  });

  it('stops after processing transitions to empty within poll cycle', () => {
    const processing = {
      progress: 40,
      status: 'ocr_processing',
      extracted_biomarkers: null,
    };
    const empty = {
      progress: 90,
      status: 'empty',
      extracted_biomarkers: [],
    };

    expect(shouldContinueStepOnePolling(processing)).toBe(true);
    expect(shouldContinueStepOnePolling(empty)).toBe(false);
  });

  it('stops on failed validation status', () => {
    expect(
      shouldContinueStepOnePolling({
        status: 'failed',
        error: 'name validate_gut_biomarkers is not defined',
      }),
    ).toBe(false);
  });

  it('continues while validation is still pending with biomarkers', () => {
    expect(
      shouldContinueStepOnePolling({
        progress: 100,
        status: 'validating_review',
        extracted_biomarkers: [{ biomarker: 'A' }],
        validation: { ready: false },
      }),
    ).toBe(true);
  });
});

describe('isStepOneTerminalEmptyOrFailed', () => {
  it('detects progress 90 with zero biomarkers', () => {
    expect(
      isStepOneTerminalEmptyOrFailed({
        progress: 90,
        status: 'ocr_processing',
        extracted_biomarkers: [],
      }),
    ).toBe(true);
  });
});

describe('validateLabReportFile', () => {
  const makeFile = (name: string, size: number) => ({ name, size }) as File;

  it('rejects unsupported extensions before upload', () => {
    const result = validateLabReportFile(makeFile('report.txt', 1024));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain('Unsupported format');
    }
  });

  it('rejects zero-byte files', () => {
    const result = validateLabReportFile(makeFile('report.pdf', 0));
    expect(result.ok).toBe(false);
  });

  it('rejects files larger than 10 MB', () => {
    const result = validateLabReportFile(
      makeFile('report.pdf', 10 * 1024 * 1024 + 1),
    );
    expect(result.ok).toBe(false);
  });

  it('accepts supported pdf files', () => {
    expect(validateLabReportFile(makeFile('report.pdf', 1024)).ok).toBe(true);
  });
});

describe('resolveStepOneWarningMessage', () => {
  it('returns API warning_message when warning is true', () => {
    expect(
      resolveStepOneWarningMessage({
        warning: true,
        warning_message:
          "The uploaded file is not one of the clinic's Templates.",
      }),
    ).toBe("The uploaded file is not one of the clinic's Templates.");
  });

  it('returns null when warning is false', () => {
    expect(resolveStepOneWarningMessage({ warning: false })).toBeNull();
  });
});

describe('isStepOneDeletedResponse', () => {
  it('detects deleted step-one payload on 404', () => {
    expect(
      isStepOneDeletedResponse({
        response: { status: 404, data: { status: 'deleted' } },
      }),
    ).toBe(true);
  });

  it('detects explicit deleted data argument', () => {
    expect(isStepOneDeletedResponse(null, { status: 'deleted' })).toBe(true);
  });
});
