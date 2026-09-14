/** Privacy-safe identifiers for clinic ActivityLogger (no email / name). */

const HASH_HEX_RE = /^[a-f0-9]{16}$/i;

export function bytesToHex16(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 16);
}

export async function surrogateKey(raw: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(raw),
  );
  return bytesToHex16(digest);
}

export function isIdentifyingBrowserId(id: string | null | undefined): boolean {
  if (!id) return true;
  if (id.includes('@')) return true;
  if (HASH_HEX_RE.test(id)) return false;
  return true;
}

export function stripQuery(url: string | undefined): string {
  if (!url) return 'unknown';
  return url.split('?')[0] || 'unknown';
}
