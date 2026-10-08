export const HTML_REPORT_PDF_FILENAME = 'HolisticPlanReport.pdf';

export function shouldShowHtmlReportDownload(isPublicView: boolean): boolean {
  return !isPublicView;
}

export function downloadPdfBlob(
  blob: Blob,
  fileName: string = HTML_REPORT_PDF_FILENAME,
): void {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = fileName;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  globalThis.setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
}

export function isDownloadablePdfBlob(blob: Blob): boolean {
  const type = (blob.type || '').toLowerCase();
  if (type.includes('application/pdf')) {
    return true;
  }
  if (
    type.includes('json') ||
    type.includes('text/html') ||
    type.includes('text/plain')
  ) {
    return false;
  }
  return blob.size > 4;
}

export function detailFromUnknownError(error: unknown): string | null {
  if (!error) {
    return null;
  }
  if (typeof error === 'string' && error.trim()) {
    return error;
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  if (typeof error === 'object' && 'detail' in error) {
    const detail = (error as { detail?: unknown }).detail;
    return typeof detail === 'string' && detail.trim() ? detail : null;
  }
  return null;
}

export async function readBlobErrorDetail(
  data: unknown,
): Promise<string | null> {
  const direct = detailFromUnknownError(data);
  if (direct) {
    return direct;
  }
  if (!(data instanceof Blob)) {
    return null;
  }
  try {
    const parsed = JSON.parse(await data.text()) as { detail?: unknown };
    return typeof parsed?.detail === 'string' && parsed.detail.trim()
      ? parsed.detail
      : null;
  } catch {
    return null;
  }
}

export async function pdfBlobFromResponseData(data: unknown): Promise<Blob> {
  if (!(data instanceof Blob)) {
    throw new Error('PDF report is not available yet.');
  }
  if (isDownloadablePdfBlob(data)) {
    return data.type && data.type !== 'application/octet-stream'
      ? data
      : new Blob([data], { type: 'application/pdf' });
  }
  const detail = await readBlobErrorDetail(data);
  throw new Error(detail || 'PDF report is not available yet.');
}
