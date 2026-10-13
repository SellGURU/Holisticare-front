import { readBlobErrorDetail } from './htmlReportDownload';

export function filenameFromContentDisposition(
  disposition: unknown,
  fallback: string,
): string {
  if (typeof disposition !== 'string') return fallback;
  const encoded = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  const plain = disposition.match(/filename="?([^";]+)"?/i)?.[1];
  let candidate = fallback;
  try {
    candidate = encoded ? decodeURIComponent(encoded) : plain || fallback;
  } catch {
    candidate = plain || fallback;
  }
  return (
    candidate
      .split(/[\\/]/)
      .pop()
      ?.replace(/[\r\n"]/g, '_') || fallback
  );
}

export async function responseBlob(data: unknown): Promise<Blob> {
  if (!(data instanceof Blob)) {
    throw new Error('The requested file is not available.');
  }
  if (
    data.type.toLowerCase().includes('application/json') ||
    data.type.toLowerCase().includes('text/html')
  ) {
    const detail = await readBlobErrorDetail(data);
    throw new Error(detail || 'The requested file is not available.');
  }
  return data;
}

export function downloadBlob(blob: Blob, fileName: string): void {
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
