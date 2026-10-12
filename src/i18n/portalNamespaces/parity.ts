/** Flatten nested object keys for parity tests (dot notation). */
export function flattenKeys(
  obj: Record<string, unknown>,
  prefix = '',
): string[] {
  const keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...flattenKeys(value as Record<string, unknown>, path));
    } else {
      keys.push(path);
    }
  }
  return keys.sort();
}

export function assertKeyParity(
  catalogs: Record<string, Record<string, unknown>>,
  label: string,
): void {
  const locales = Object.keys(catalogs);
  const base = flattenKeys(catalogs.en ?? catalogs[locales[0]]);
  for (const locale of locales) {
    const keys = flattenKeys(catalogs[locale]);
    const missing = base.filter((k) => !keys.includes(k));
    const extra = keys.filter((k) => !base.includes(k));
    if (missing.length || extra.length) {
      throw new Error(
        `${label} parity failed for ${locale}: missing=${missing.join(',')} extra=${extra.join(',')}`,
      );
    }
  }
}
