import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  HTML_REPORT_PDF_FILENAME,
  downloadPdfBlob,
  isDownloadablePdfBlob,
  pdfBlobFromResponseData,
  shouldShowHtmlReportDownload,
} from './htmlReportDownload';

describe('shouldShowHtmlReportDownload', () => {
  it('shows download only for authenticated clinic view', () => {
    expect(shouldShowHtmlReportDownload(false)).toBe(true);
    expect(shouldShowHtmlReportDownload(true)).toBe(false);
  });
});

describe('isDownloadablePdfBlob', () => {
  it('accepts application/pdf', () => {
    expect(
      isDownloadablePdfBlob(new Blob(['%PDF'], { type: 'application/pdf' })),
    ).toBe(true);
  });

  it('rejects json error payloads', () => {
    expect(
      isDownloadablePdfBlob(
        new Blob([JSON.stringify({ detail: 'No PDF' })], {
          type: 'application/json',
        }),
      ),
    ).toBe(false);
  });
});

describe('pdfBlobFromResponseData', () => {
  it('keeps a PDF blob', async () => {
    const input = new Blob(['%PDF-1.4'], { type: 'application/pdf' });
    const result = await pdfBlobFromResponseData(input);
    expect(result).toBe(input);
  });

  it('raises the backend detail from a JSON error blob', async () => {
    const input = new Blob(
      [JSON.stringify({ detail: 'No PDF report found for this patient.' })],
      {
        type: 'application/json',
      },
    );
    await expect(pdfBlobFromResponseData(input)).rejects.toThrow(
      'No PDF report found for this patient.',
    );
  });
});

describe('downloadPdfBlob', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('creates an object URL and clicks a download link', () => {
    const click = vi.fn();
    const appendChild = vi.fn((node) => node);
    const removeChild = vi.fn((node) => node);
    const link = {
      href: '',
      download: '',
      rel: '',
      click,
    };
    const createElement = vi.fn((tagName: string) => {
      expect(tagName).toBe('a');
      return link;
    });
    vi.stubGlobal('document', {
      createElement,
      body: { appendChild, removeChild },
    });
    const createObjectURL = vi.fn(() => 'blob:holistic-plan');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', {
      createObjectURL,
      revokeObjectURL,
    });
    vi.useFakeTimers();

    downloadPdfBlob(new Blob(['%PDF-1.4'], { type: 'application/pdf' }));

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(createElement).toHaveBeenCalledWith('a');
    expect(click).toHaveBeenCalledTimes(1);
    expect(appendChild).toHaveBeenCalledWith(link);
    expect(removeChild).toHaveBeenCalledWith(link);
    expect(link.download).toBe(HTML_REPORT_PDF_FILENAME);
    expect(link.href).toBe('blob:holistic-plan');

    vi.runAllTimers();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:holistic-plan');
  });
});
