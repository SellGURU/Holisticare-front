import {
  detailFromUnknownError,
  readBlobErrorDetail,
} from './htmlReportDownload';

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

export async function responseBlob(
  data: unknown,
  contentType: unknown = 'application/octet-stream',
): Promise<Blob> {
  const mediaType =
    typeof contentType === 'string' && contentType
      ? contentType
      : 'application/octet-stream';
  let blob: Blob;
  if (data instanceof Blob) {
    blob = data;
  } else if (data instanceof ArrayBuffer) {
    blob = new Blob([data], { type: mediaType });
  } else if (ArrayBuffer.isView(data)) {
    blob = new Blob(
      [data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)],
      {
        type: mediaType,
      },
    );
  } else if (typeof data === 'string') {
    // Some Axios/browser combinations return binary responses as a binary
    // string even when responseType is "blob". Preserve each byte verbatim.
    const bytes = Uint8Array.from(
      data,
      (character) => character.charCodeAt(0) & 0xff,
    );
    blob = new Blob([bytes], { type: mediaType });
  } else {
    const detail = detailFromUnknownError(data);
    throw new Error(detail || 'The requested file is not available.');
  }
  if (
    blob.type.toLowerCase().includes('application/json') ||
    blob.type.toLowerCase().includes('text/html')
  ) {
    const detail = await readBlobErrorDetail(blob);
    throw new Error(detail || 'The requested file is not available.');
  }
  return blob;
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
