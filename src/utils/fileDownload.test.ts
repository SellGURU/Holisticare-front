import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  downloadBlob,
  filenameFromContentDisposition,
  responseBlob,
} from './fileDownload';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('filenameFromContentDisposition', () => {
  it('prefers and decodes RFC 5987 filenames', () => {
    expect(
      filenameFromContentDisposition(
        `attachment; filename="fallback.pdf"; filename*=UTF-8''Health%20Form.pdf`,
        'download.pdf',
      ),
    ).toBe('Health Form.pdf');
  });

  it('removes path components from server filenames', () => {
    expect(
      filenameFromContentDisposition(
        'attachment; filename="../private.txt"',
        'attachment',
      ),
    ).toBe('private.txt');
  });
});

describe('responseBlob', () => {
  it('accepts downloadable blobs', async () => {
    const blob = new Blob(['file'], { type: 'application/pdf' });
    await expect(responseBlob(blob)).resolves.toBe(blob);
  });

  it('converts a binary PDF string returned by Axios', async () => {
    const result = await responseBlob('%PDF-1.4\r\n', 'application/pdf');
    expect(result).toBeInstanceOf(Blob);
    expect(result.type).toBe('application/pdf');
    expect(await result.text()).toBe('%PDF-1.4\r\n');
  });

  it('converts an ArrayBuffer response', async () => {
    const input = new Uint8Array([0x25, 0x50, 0x44, 0x46]).buffer;
    const result = await responseBlob(input, 'application/pdf');
    expect(result.type).toBe('application/pdf');
    expect(Array.from(new Uint8Array(await result.arrayBuffer()))).toEqual([
      0x25, 0x50, 0x44, 0x46,
    ]);
  });

  it('normalizes a Blob from another browser realm', async () => {
    const result = await responseBlob(
      {
        type: 'application/pdf',
        arrayBuffer: async () =>
          new Uint8Array([0x25, 0x50, 0x44, 0x46]).buffer,
      },
      'application/octet-stream',
    );
    expect(result.type).toBe('application/pdf');
    expect(Array.from(new Uint8Array(await result.arrayBuffer()))).toEqual([
      0x25, 0x50, 0x44, 0x46,
    ]);
  });

  it('uses a JSON error detail', async () => {
    const blob = new Blob([JSON.stringify({ detail: 'Not allowed' })], {
      type: 'application/json',
    });
    await expect(responseBlob(blob)).rejects.toThrow('Not allowed');
  });
});

describe('downloadBlob', () => {
  it('creates a temporary download link', () => {
    const click = vi.fn();
    const link = { href: '', download: '', rel: '', click };
    const appendChild = vi.fn((node) => node);
    const removeChild = vi.fn((node) => node);
    vi.stubGlobal('document', {
      createElement: vi.fn(() => link),
      body: { appendChild, removeChild },
    });
    const createObjectURL = vi.fn(() => 'blob:test');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });
    vi.useFakeTimers();

    downloadBlob(new Blob(['file']), 'note.txt');

    expect(click).toHaveBeenCalledOnce();
    expect(appendChild).toHaveBeenCalledWith(link);
    expect(removeChild).toHaveBeenCalledWith(link);
    expect(link.download).toBe('note.txt');
    vi.runAllTimers();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:test');
  });
});
